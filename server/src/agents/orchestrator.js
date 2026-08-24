const Execution = require('../models/Execution');
const AgentMemory = require('../models/AgentMemory');
const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');

// Check LangGraph availability
let langGraphAvailable = 'available';
try {
  require('@langchain/core');
} catch (e) {
  langGraphAvailable = 'not-installed';
}

class Orchestrator {
  constructor() {
    this.langGraphStatus = langGraphAvailable;
  }

  /**
   * Run the full agentic execution chain for an execution document
   */
  async runExecution(executionId) {
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status === 'CANCELLED' || execution.status === 'PAUSED') {
      return execution;
    }

    execution.status = 'RUNNING';
    execution.startTime = execution.startTime || new Date();
    execution.langGraphStatus = this.langGraphStatus;
    await execution.save();

    const workflowSnapshot = execution.snapshot;
    const userId = execution.owner;
    const stepOutputs = {};

    // 1. MONITORING: Execution started
    await monitoringAgent.recordEvent({
      executionId,
      workflowId: execution.workflowId,
      agent: 'monitoring',
      level: 'info',
      message: `Execution initiated for workflow "${workflowSnapshot.name}". LangGraph engine status: ${this.langGraphStatus}.`,
      metadata: { langGraphStatus: this.langGraphStatus },
    });

    // 2. PLANNER AGENT: Graph topological sort and execution sequence
    await monitoringAgent.recordEvent({
      executionId,
      workflowId: execution.workflowId,
      agent: 'planner',
      level: 'info',
      message: 'Planner Agent analyzing graph topology and building execution strategy...',
    });

    const planResult = await plannerAgent.plan(workflowSnapshot);
    execution.confidenceScore = planResult.confidence;
    await execution.save();

    if (!planResult.success) {
      execution.status = 'FAILED';
      execution.endTime = new Date();
      execution.duration = execution.endTime - execution.startTime;
      execution.error = { message: planResult.error, agent: 'planner' };
      await execution.save();

      await monitoringAgent.recordEvent({
        executionId,
        workflowId: execution.workflowId,
        agent: 'planner',
        level: 'error',
        message: `Planning failed: ${planResult.error}`,
      });

      await monitoringAgent.notifyUser({
        userId,
        workflowId: execution.workflowId,
        executionId,
        type: 'failure',
        title: 'Workflow Execution Failed',
        message: `Planning failed for "${workflowSnapshot.name}": ${planResult.error}`,
      });

      return execution;
    }

    await monitoringAgent.recordEvent({
      executionId,
      workflowId: execution.workflowId,
      agent: 'planner',
      level: 'success',
      message: `Planner Agent computed sequence: ${planResult.plan.map((n) => n.data?.label || n.id).join(' ➔ ')} (Confidence: ${(planResult.confidence * 100).toFixed(0)}%)`,
      metadata: { plan: planResult.plan.map((n) => n.id), confidence: planResult.confidence },
    });

    // Store in AgentMemory
    await AgentMemory.create({
      workflowId: execution.workflowId,
      executionId,
      agentId: 'planner',
      key: 'execution_plan',
      value: planResult.plan,
      confidenceScore: planResult.confidence,
    });

    // 3. EXECUTE NODES SEQUENTIALLY
    for (let i = 0; i < planResult.plan.length; i++) {
      // Re-fetch execution to check for user pause or cancel
      const currentStatusCheck = await Execution.findById(executionId);
      if (currentStatusCheck.status === 'PAUSED' || currentStatusCheck.status === 'CANCELLED') {
        await monitoringAgent.recordEvent({
          executionId,
          workflowId: execution.workflowId,
          agent: 'monitoring',
          level: 'warning',
          message: `Execution state changed to ${currentStatusCheck.status}. Halting step processing.`,
        });
        return currentStatusCheck;
      }

      const node = planResult.plan[i];
      execution.currentNode = node.id;
      await execution.save();

      // EXECUTION AGENT
      await monitoringAgent.recordEvent({
        executionId,
        workflowId: execution.workflowId,
        nodeId: node.id,
        agent: 'execution',
        level: 'info',
        message: `Execution Agent running node "${node.data?.label || node.id}" [${node.type}]...`,
      });

      let stepResult = null;
      let attempt = 0;
      let stepSuccess = false;

      while (attempt < 3 && !stepSuccess) {
        try {
          stepResult = await executionAgent.executeNode(node, {
            userId,
            globalInputs: execution.inputs,
            stepOutputs,
          });

          // VALIDATION AGENT
          await monitoringAgent.recordEvent({
            executionId,
            workflowId: execution.workflowId,
            nodeId: node.id,
            agent: 'validation',
            level: 'info',
            message: `Validation Agent verifying output schema for node "${node.data?.label || node.id}"...`,
          });

          const validationResult = await validationAgent.validate(node, stepResult);

          if (!validationResult.isValid) {
            throw {
              message: validationResult.error,
              code: validationResult.code,
            };
          }

          await monitoringAgent.recordEvent({
            executionId,
            workflowId: execution.workflowId,
            nodeId: node.id,
            agent: 'validation',
            level: 'success',
            message: `Validation passed with ${(validationResult.confidence * 100).toFixed(0)}% confidence score.`,
          });

          stepOutputs[node.id] = stepResult.output;
          stepSuccess = true;

          await monitoringAgent.recordEvent({
            executionId,
            workflowId: execution.workflowId,
            nodeId: node.id,
            agent: 'execution',
            level: 'success',
            message: `Node "${node.data?.label || node.id}" executed successfully in ${stepResult.duration}ms.`,
            metadata: { output: stepResult.output },
          });
        } catch (nodeErr) {
          attempt++;
          // RECOVERY AGENT
          await monitoringAgent.recordEvent({
            executionId,
            workflowId: execution.workflowId,
            nodeId: node.id,
            agent: 'recovery',
            level: 'warning',
            message: `Step failure detected: ${nodeErr.message}. Recovery Agent analyzing remediation...`,
          });

          const recoveryResult = await recoveryAgent.handleFailure(nodeErr, {
            retryCount: attempt - 1,
            maxRetries: 3,
            node,
          });

          if (recoveryResult.canRecover) {
            await monitoringAgent.recordEvent({
              executionId,
              workflowId: execution.workflowId,
              nodeId: node.id,
              agent: 'recovery',
              level: 'info',
              message: recoveryResult.explanation,
            });

            execution.status = 'RETRYING';
            execution.retryCount += 1;
            await execution.save();

            // Wait backoff delay
            await new Promise((resolve) => setTimeout(resolve, recoveryResult.delayMs));
          } else {
            // Escalation / Permanent Failure
            execution.status = 'FAILED';
            execution.endTime = new Date();
            execution.duration = execution.endTime - execution.startTime;
            execution.error = {
              message: nodeErr.message,
              code: recoveryResult.classification,
              agent: 'recovery',
              nodeId: node.id,
            };
            await execution.save();

            await monitoringAgent.recordEvent({
              executionId,
              workflowId: execution.workflowId,
              nodeId: node.id,
              agent: 'recovery',
              level: 'error',
              message: `Escalation triggered: ${recoveryResult.explanation}`,
              metadata: { error: nodeErr.message, classification: recoveryResult.classification },
            });

            await monitoringAgent.notifyUser({
              userId,
              workflowId: execution.workflowId,
              executionId,
              type: 'escalation',
              title: 'Workflow Execution Escalated',
              message: `Execution failed at step "${node.data?.label || node.id}": ${nodeErr.message}`,
            });

            return execution;
          }
        }
      }
    }

    // 4. COMPLETION
    execution.status = 'COMPLETED';
    execution.endTime = new Date();
    execution.duration = execution.endTime - execution.startTime;
    execution.outputs = stepOutputs;
    execution.currentNode = null;
    await execution.save();

    await monitoringAgent.recordEvent({
      executionId,
      workflowId: execution.workflowId,
      agent: 'monitoring',
      level: 'success',
      message: `Workflow completed all ${planResult.plan.length} steps in ${execution.duration}ms.`,
      metadata: { outputs: stepOutputs },
    });

    await monitoringAgent.notifyUser({
      userId,
      workflowId: execution.workflowId,
      executionId,
      type: 'success',
      title: 'Workflow Executed Successfully',
      message: `Workflow "${workflowSnapshot.name}" completed all steps in ${execution.duration}ms.`,
    });

    return execution;
  }
}

module.exports = new Orchestrator();
