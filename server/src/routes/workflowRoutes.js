const express = require('express');
const { body, validationResult } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const executionController = require('../controllers/executionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
      details: errors.array(),
      code: 'VALIDATION_ERROR',
    });
  }
  next();
};

// All workflow routes require authentication
router.use(protect);

router.get('/dashboard', workflowController.getDashboard);

router.get('/', workflowController.listWorkflows);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
  ],
  validate,
  workflowController.createWorkflow
);

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt is required for workflow generation'),
  ],
  validate,
  workflowController.generateWorkflow
);

router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', executionController.triggerExecution);
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
