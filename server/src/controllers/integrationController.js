const integrationService = require('../services/integrationService');
const env = require('../config/env');

const listIntegrations = async (req, res, next) => {
  try {
    const list = await integrationService.getUserIntegrations(req.user._id);
    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

const getIntegrationStatus = async (req, res, next) => {
  try {
    const { provider } = req.query;
    if (provider) {
      const status = await integrationService.testConnectionHealth(req.user._id, provider);
      return res.status(200).json({
        success: true,
        data: status,
      });
    }

    const list = await integrationService.getUserIntegrations(req.user._id);
    const statuses = await Promise.all(
      list.map(async (item) => ({
        provider: item.provider,
        isConnected: item.isConnected,
        health: await integrationService.testConnectionHealth(req.user._id, item.provider),
      }))
    );

    res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    next(error);
  }
};

const startOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const authUrl = integrationService.getOAuthStartUrl(provider, req.user._id.toString());
    res.status(200).json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    next(error);
  }
};

const handleOAuthCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`/integrations?error=${encodeURIComponent(oauthError)}`);
    }

    if (!code) {
      return res.redirect('/integrations?error=missing_oauth_code');
    }

    await integrationService.handleOAuthCallback(provider, code, state);
    res.redirect(`${env.CLIENT_URL}/integrations?connected=${provider}`);
  } catch (error) {
    res.redirect(`${env.CLIENT_URL}/integrations?error=${encodeURIComponent(error.message)}`);
  }
};

const oauthError = (req, res) => {
  res.status(400).json({
    success: false,
    error: req.query.message || 'OAuth authentication encountered an error',
    code: 'OAUTH_FAILURE',
  });
};

const saveManualCredentials = async (req, res, next) => {
  try {
    const { provider, apiKey, accessToken, metadata } = req.body;
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider name is required',
      });
    }

    const saved = await integrationService.saveManualCredential(req.user._id, provider, {
      apiKey,
      accessToken,
      metadata,
    });

    res.status(200).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listIntegrations,
  getIntegrationStatus,
  startOAuth,
  handleOAuthCallback,
  oauthError,
  saveManualCredentials,
};
