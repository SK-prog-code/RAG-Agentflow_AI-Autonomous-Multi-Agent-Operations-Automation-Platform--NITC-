const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');

class WorkflowService {
  async listWorkflows(userId, query = {}) {
    const { search, status, tag, page = 1, limit = 20 } = query;
    const filter = { owner: userId };

    if (status) {
      filter.status = status;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [workflows, total] = await Promise.all([
      Workflow.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit)),
      Workflow.countDocuments(filter),
    ]);

    return {
      workflows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getWorkflowById(workflowId, userId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return workflow;
  }

  async createWorkflow(userId, data) {
    const workflow = await Workflow.create({
      ...data,
      owner: userId,
      version: 1,
      status: data.status || 'active',
    });
    return workflow;
  }

  async updateWorkflow(workflowId, userId, updateData) {
    const workflow = await this.getWorkflowById(workflowId, userId);

    if (updateData.name) workflow.name = updateData.name;
    if (updateData.description !== undefined) workflow.description = updateData.description;
    if (updateData.status) workflow.status = updateData.status;
    if (updateData.triggerConfig) workflow.triggerConfig = updateData.triggerConfig;
    if (updateData.nodes) workflow.nodes = updateData.nodes;
    if (updateData.edges) workflow.edges = updateData.edges;
    if (updateData.tags) workflow.tags = updateData.tags;
    
    // Auto-increment version when nodes or edges change
    if (updateData.nodes || updateData.edges) {
      workflow.version += 1;
    }

    await workflow.save();
    return workflow;
  }

  async duplicateWorkflow(workflowId, userId) {
    const source = await this.getWorkflowById(workflowId, userId);
    const clone = await Workflow.create({
      name: `${source.name} (Copy)`,
      description: source.description,
      owner: userId,
      status: 'draft',
      triggerConfig: source.triggerConfig,
      nodes: source.nodes,
      edges: source.edges,
      version: 1,
      tags: [...source.tags, 'cloned'],
    });
    return clone;
  }

  async deleteWorkflow(workflowId, userId) {
    const workflow = await this.getWorkflowById(workflowId, userId);
    await Workflow.deleteOne({ _id: workflow._id });
    return { success: true, message: 'Workflow deleted successfully' };
  }

  async getDashboardMetrics(userId) {
    const [totalWorkflows, activeWorkflows, executions, recentExecutions] = await Promise.all([
      Workflow.countDocuments({ owner: userId }),
      Workflow.countDocuments({ owner: userId, status: 'active' }),
      Execution.find({ owner: userId }),
      Execution.find({ owner: userId })
        .populate('workflowId', 'name')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    const totalRuns = executions.length;
    const completedRuns = executions.filter((e) => e.status === 'COMPLETED').length;
    const failedRuns = executions.filter((e) => e.status === 'FAILED').length;
    const successRate = totalRuns > 0 ? ((completedRuns / totalRuns) * 100).toFixed(1) : '100.0';

    const totalDuration = executions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const avgExecutionTimeMs = totalRuns > 0 ? Math.round(totalDuration / totalRuns) : 0;

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        totalExecutions: totalRuns,
        completedExecutions: completedRuns,
        failedExecutions: failedRuns,
        successRate: `${successRate}%`,
        avgExecutionTimeMs,
      },
      recentExecutions,
    };
  }
}

module.exports = new WorkflowService();
