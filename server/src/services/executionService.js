const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const orchestrator = require('../agents/orchestrator');
const { enqueueExecution } = require('../queues/executionQueue');

class ExecutionService {
  async triggerExecution(workflowId, userId, inputs = {}) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Create Execution Document with immutable snapshot
    const execution = await Execution.create({
      workflowId: workflow._id,
      owner: userId,
      snapshot: {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        triggerConfig: workflow.triggerConfig,
        version: workflow.version,
      },
      status: 'PENDING',
      inputs,
      outputs: {},
    });

    // Enqueue execution job (in background queue, automatically processed by orchestrator)
    enqueueExecution(execution._id.toString());
    
    // Also run asynchronously so results stream immediately
    setTimeout(() => {
      orchestrator.runExecution(execution._id.toString()).catch((err) => {
        console.error('[Execution Error]', err);
      });
    }, 100);

    return execution;
  }

  async listExecutions(userId, query = {}) {
    const { status, workflowId, page = 1, limit = 20 } = query;
    const filter = { owner: userId };

    if (status) {
      filter.status = status;
    }

    if (workflowId) {
      filter.workflowId = workflowId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [executions, total] = await Promise.all([
      Execution.find(filter)
        .populate('workflowId', 'name description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Execution.countDocuments(filter),
    ]);

    return {
      executions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getExecutionById(executionId, userId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId }).populate(
      'workflowId',
      'name description tags'
    );
    if (!execution) {
      const error = new Error('Execution run not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return execution;
  }

  async getExecutionTimeline(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    const logs = await ExecutionLog.find({ executionId: execution._id }).sort({ timestamp: 1 });
    return {
      execution,
      timeline: logs,
    };
  }

  async pauseExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (execution.status !== 'RUNNING' && execution.status !== 'PENDING') {
      const error = new Error(`Cannot pause execution in status ${execution.status}`);
      error.statusCode = 400;
      throw error;
    }
    execution.status = 'PAUSED';
    await execution.save();
    return execution;
  }

  async resumeExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (execution.status !== 'PAUSED') {
      const error = new Error(`Cannot resume execution in status ${execution.status}`);
      error.statusCode = 400;
      throw error;
    }
    execution.status = 'RUNNING';
    await execution.save();

    // Re-trigger orchestrator
    setTimeout(() => {
      orchestrator.runExecution(execution._id.toString()).catch(console.error);
    }, 50);

    return execution;
  }

  async cancelExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (execution.status === 'COMPLETED' || execution.status === 'FAILED' || execution.status === 'CANCELLED') {
      const error = new Error(`Execution is already terminated with status ${execution.status}`);
      error.statusCode = 400;
      throw error;
    }
    execution.status = 'CANCELLED';
    execution.endTime = new Date();
    execution.duration = execution.endTime - execution.startTime;
    await execution.save();
    return execution;
  }
}

module.exports = new ExecutionService();
