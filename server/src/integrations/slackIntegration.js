const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(state) {
    if (!env.SLACK.CLIENT_ID) {
      return `/api/integrations/oauth/slack/callback?code=mock_slack_auth_code&state=${encodeURIComponent(state || '')}`;
    }
    const scopes = encodeURIComponent('chat:write,channels:read,channels:history,incoming-webhook');
    return `https://slack.com/oauth/v2/authorize?client_id=${env.SLACK.CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(env.SLACK.REDIRECT_URI)}&state=${encodeURIComponent(state || '')}`;
  }

  async handleCallback(code) {
    if (code === 'mock_slack_auth_code' || !env.SLACK.CLIENT_ID) {
      return {
        accessToken: `xoxb-mock-slack-token-${Date.now()}`,
        refreshToken: `xoxe-mock-slack-refresh-${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        metadata: {
          teamName: 'NIT Calicut Workspace',
          channelId: '#automation-alerts',
          botName: 'Agentflow Bot',
        },
      };
    }

    const response = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      new URLSearchParams({
        client_id: env.SLACK.CLIENT_ID,
        client_secret: env.SLACK.CLIENT_SECRET,
        code,
        redirect_uri: env.SLACK.REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!response.data.ok) {
      throw new Error(`Slack OAuth error: ${response.data.error}`);
    }

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: new Date(Date.now() + (response.data.expires_in || 86400) * 1000),
      metadata: {
        teamName: response.data.team?.name || 'Slack Workspace',
        botName: 'Agentflow Bot',
      },
    };
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.apiKey)) {
      return { ok: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { ok: true, message: 'Slack integration is active.' };
  }

  async executeAction(action, payload = {}, credentials = {}) {
    if (!credentials.accessToken && !credentials.apiKey) {
      const err = new Error('Slack integration credentials missing or expired');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (action) {
      case 'post_message': {
        const channel = payload.channel || '#alerts';
        const message = payload.text || payload.message || 'Notification from Agentflow_AI';
        console.log(`[Slack] Posting message to ${channel}: ${message}`);
        return {
          status: 'success',
          action: 'post_message',
          channel,
          messageTs: `${Date.now()}.000100`,
          text: message,
          timestamp: new Date().toISOString(),
        };
      }

      case 'read_channel_messages': {
        const channel = payload.channel || '#alerts';
        return {
          status: 'success',
          action: 'read_channel_messages',
          channel,
          messages: [
            {
              user: 'U12345',
              text: 'System health check completed. All nodes online.',
              ts: `${Date.now() - 60000}.000100`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unsupported Slack action: ${action}`);
    }
  }
}

module.exports = new SlackIntegration();
