const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');
const { emitAgentEvent, emitNotification } = require('../config/socket');

class MonitoringAgent {
  /**
   * Records an agent event, emits real-time WebSocket update, and persists ExecutionLog
   */
  async recordEvent({ executionId, workflowId, nodeId = '', agent, level = 'info', message, metadata = {} }) {
    try {
      const logEntry = await ExecutionLog.create({
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: new Date(),
      });

      const eventPayload = {
        id: logEntry._id,
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: logEntry.timestamp,
      };

      // Broadcast via Socket.IO
      emitAgentEvent(executionId, eventPayload);

      return logEntry;
    } catch (err) {
      console.error('[MonitoringAgent Error]', err.message);
    }
  }

  /**
   * Emits user alert / notification for important state changes (escalation, success, failure)
   */
  async notifyUser({ userId, workflowId, executionId, type, title, message }) {
    try {
      const notification = await Notification.create({
        owner: userId,
        workflowId,
        executionId,
        type,
        title,
        message,
        isRead: false,
      });

      emitNotification(userId, notification);
      return notification;
    } catch (err) {
      console.error('[MonitoringAgent Notification Error]', err.message);
    }
  }
}

module.exports = new MonitoringAgent();
