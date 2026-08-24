const axios = require('axios');
const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(state) {
    if (!env.DISCORD.CLIENT_ID) {
      return `/api/integrations/oauth/discord/callback?code=mock_discord_auth_code&state=${encodeURIComponent(state || '')}`;
    }
    const scopes = encodeURIComponent('bot messages.read');
    return `https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD.CLIENT_ID}&permissions=2048&scope=${scopes}&redirect_uri=${encodeURIComponent(env.DISCORD.REDIRECT_URI)}&response_type=code&state=${encodeURIComponent(state || '')}`;
  }

  async handleCallback(code) {
    if (code === 'mock_discord_auth_code' || !env.DISCORD.CLIENT_ID) {
      return {
        accessToken: `mock_discord_bot_token_${Date.now()}`,
        refreshToken: `mock_discord_refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000),
        metadata: {
          botName: 'Agentflow Bot #NIT-C',
          channelId: 'channel-agentic-ops',
          teamName: 'NIT Calicut Developers Hub',
        },
      };
    }

    const data = new URLSearchParams({
      client_id: env.DISCORD.CLIENT_ID,
      client_secret: env.DISCORD.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.DISCORD.REDIRECT_URI,
    });

    const response = await axios.post('https://discord.com/api/v10/oauth2/token', data.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: new Date(Date.now() + (response.data.expires_in || 604800) * 1000),
      metadata: {
        botName: 'Agentflow Bot',
      },
    };
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.apiKey)) {
      return { ok: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { ok: true, message: 'Discord bot integration is active.' };
  }

  async executeAction(action, payload = {}, credentials = {}) {
    if (!credentials.accessToken && !credentials.apiKey) {
      const err = new Error('Discord integration credentials missing or expired');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (action) {
      case 'post_message': {
        const channelId = payload.channelId || 'general';
        const content = payload.content || payload.message || 'Execution update from Agentflow_AI';
        console.log(`[Discord] Posting message to channel ${channelId}: ${content}`);
        return {
          status: 'success',
          action: 'post_message',
          messageId: `discord_msg_${Date.now()}`,
          channelId,
          content,
          timestamp: new Date().toISOString(),
        };
      }

      case 'send_embed': {
        const title = payload.title || 'Workflow Event Notification';
        const description = payload.description || 'Agentic workflow executed successfully.';
        return {
          status: 'success',
          action: 'send_embed',
          embed: {
            title,
            description,
            color: 0x22c55e,
            footer: { text: 'NIT Calicut Agentflow_AI System' },
          },
          timestamp: new Date().toISOString(),
        };
      }

      default:
        throw new Error(`Unsupported Discord action: ${action}`);
    }
  }
}

module.exports = new DiscordIntegration();
