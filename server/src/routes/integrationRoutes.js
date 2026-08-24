const express = require('express');
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// OAuth callback is public so provider redirect can hit it
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);
router.get('/oauth/error', integrationController.oauthError);

// Protected routes
router.use(protect);
router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getIntegrationStatus);
router.get('/oauth/:provider/start', integrationController.startOAuth);
router.post('/', integrationController.saveManualCredentials);

module.exports = router;
