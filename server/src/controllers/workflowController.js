const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');

const getDashboard = async (req, res, next) => {
  try {
    const data = await workflowService.getDashboardMetrics(req.user._id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const listWorkflows = async (req, res, next) => {
  try {
    const result = await workflowService.listWorkflows(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.workflows,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

const createWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.createWorkflow(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

const generateWorkflow = async (req, res, next) => {
  try {
    const { prompt, options } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt string is required',
      });
    }
    const generatedGraph = await aiService.generateWorkflowFromPrompt(prompt, options);
    res.status(200).json({
      success: true,
      data: generatedGraph,
    });
  } catch (error) {
    next(error);
  }
};

const updateWorkflow = async (req, res, next) => {
  try {
    const updated = await workflowService.updateWorkflow(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const duplicateWorkflow = async (req, res, next) => {
  try {
    const cloned = await workflowService.duplicateWorkflow(req.params.id, req.user._id);
    res.status(201).json({
      success: true,
      data: cloned,
    });
  } catch (error) {
    next(error);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    const result = await workflowService.deleteWorkflow(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  listWorkflows,
  getWorkflow,
  createWorkflow,
  generateWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
};
