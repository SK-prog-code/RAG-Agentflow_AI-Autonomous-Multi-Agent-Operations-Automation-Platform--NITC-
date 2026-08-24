const executionService = require('../services/executionService');

const triggerExecution = async (req, res, next) => {
  try {
    const workflowId = req.params.id;
    const inputs = req.body.inputs || {};
    const execution = await executionService.triggerExecution(workflowId, req.user._id, inputs);
    res.status(201).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    next(error);
  }
};

const listExecutions = async (req, res, next) => {
  try {
    const result = await executionService.listExecutions(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.executions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getExecution = async (req, res, next) => {
  try {
    const execution = await executionService.getExecutionById(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    next(error);
  }
};

const getExecutionTimeline = async (req, res, next) => {
  try {
    const data = await executionService.getExecutionTimeline(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const pauseExecution = async (req, res, next) => {
  try {
    const execution = await executionService.pauseExecution(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    next(error);
  }
};

const resumeExecution = async (req, res, next) => {
  try {
    const execution = await executionService.resumeExecution(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    next(error);
  }
};

const cancelExecution = async (req, res, next) => {
  try {
    const execution = await executionService.cancelExecution(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerExecution,
  listExecutions,
  getExecution,
  getExecutionTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
