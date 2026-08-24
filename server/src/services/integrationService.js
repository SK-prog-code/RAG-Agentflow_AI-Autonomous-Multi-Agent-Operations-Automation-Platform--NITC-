const Integration = require('../models/Integration');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const integrationMap = {
  gmail: gmailIntegration,
  slack: slackIntegration,
  discord: discordIntegration,
  'google-sheets': googleSheetsIntegration,
};

class IntegrationService {
  /**
   * Get all integrations for a user
   */
  async getUserIntegrations(userId) {
    const providers = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];
    const userIntegrations = await Integration.find({ owner: userId });

    return providers.map((provider) => {
      const match = userIntegrations.find((item) => item.provider === provider);
      return {
        provider,
        isConnected: match ? match.isConnected : false,
        expiresAt: match?.expiresAt || null,
        metadata: match?.metadata || {},
        updatedAt: match?.updatedAt || null,
      };
    });
  }

  /**
   * Get OAuth start authorization URL
   */
  getOAuthStartUrl(provider, userId) {
    const integrationInstance = integrationMap[provider];
    if (!integrationInstance) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
    const state = JSON.stringify({ userId, provider, timestamp: Date.now() });
    return integrationInstance.getAuthUrl(state);
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(provider, code, stateRaw) {
    const integrationInstance = integrationMap[provider];
    if (!integrationInstance) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    let userId = null;
    try {
      if (stateRaw) {
        const state = JSON.parse(stateRaw);
        userId = state.userId;
      }
    } catch (e) {
      console.warn('[IntegrationService] Could not parse state JSON, using fallback.');
    }

    const tokenData = await integrationInstance.handleCallback(code);

    const encryptedAccessToken = integrationInstance.encrypt(tokenData.accessToken || '');
    const encryptedRefreshToken = integrationInstance.encrypt(tokenData.refreshToken || '');

    const query = { provider };
    if (userId) query.owner = userId;

    const updated = await Integration.findOneAndUpdate(
      query,
      {
        provider,
        isConnected: true,
        encryptedAccessToken,
        encryptedRefreshToken,
        metadata: tokenData.metadata || {},
        expiresAt: tokenData.expiresAt || new Date(Date.now() + 3600 * 1000 * 24),
      },
      { upsert: true, new: true }
    );

    return updated;
  }

  /**
   * Manual credential setup / token save
   */
  async saveManualCredential(userId, provider, { apiKey, accessToken, metadata }) {
    const integrationInstance = integrationMap[provider] || gmailIntegration;
    const encryptedAccessToken = accessToken ? integrationInstance.encrypt(accessToken) : '';
    const encryptedApiKey = apiKey ? integrationInstance.encrypt(apiKey) : '';

    const integration = await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        owner: userId,
        provider,
        isConnected: true,
        encryptedAccessToken: encryptedAccessToken || encryptedApiKey,
        apiKey: encryptedApiKey,
        metadata: metadata || {},
        expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      },
      { upsert: true, new: true }
    );

    return {
      provider: integration.provider,
      isConnected: integration.isConnected,
      metadata: integration.metadata,
    };
  }

  /**
   * Test connection health for a user's provider
   */
  async testConnectionHealth(userId, provider) {
    const integration = await Integration.findOne({ owner: userId, provider });
    if (!integration || !integration.isConnected) {
      return { ok: false, status: 'DISCONNECTED', error: 'INTEGRATION_NOT_CONNECTED' };
    }

    const integrationInstance = integrationMap[provider];
    if (!integrationInstance) {
      return { ok: true, status: 'CONNECTED', message: 'API key configured' };
    }

    try {
      const accessToken = integrationInstance.decrypt(integration.encryptedAccessToken);
      return await integrationInstance.testConnection({ accessToken, metadata: integration.metadata });
    } catch (err) {
      return { ok: false, status: 'AUTH_EXPIRED', error: err.message };
    }
  }

  /**
   * Execute action on third-party provider for a user
   */
  async executeIntegrationAction(userId, provider, action, payload) {
    const integrationInstance = integrationMap[provider];
    if (!integrationInstance) {
      throw new Error(`Provider ${provider} is not supported for actions.`);
    }

    const integration = await Integration.findOne({ owner: userId, provider });
    
    // In sandbox / development mode, if user hasn't explicitly connected, execute in sandbox mode
    let accessToken = 'sandbox_access_token';
    let metadata = {};

    if (integration && integration.isConnected && integration.encryptedAccessToken) {
      try {
        accessToken = integrationInstance.decrypt(integration.encryptedAccessToken);
        metadata = integration.metadata || {};
      } catch (err) {
        const error = new Error(`Failed to decrypt credentials for ${provider}: ${err.message}`);
        error.code = 'AUTH_EXPIRED';
        throw error;
      }
    }

    return await integrationInstance.executeAction(action, payload, { accessToken, metadata });
  }
}

module.exports = new IntegrationService();
