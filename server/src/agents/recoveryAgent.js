class RecoveryAgent {
  /**
   * Classifies failures and determines recovery action (retry vs escalation)
   */
  async handleFailure(error, context = {}) {
    const { retryCount = 0, maxRetries = 3, node = {} } = context;
    const errorMessage = error.message || String(error);
    const errorCode = error.code || this.classifyErrorCode(errorMessage);

    let strategy = 'escalate';
    let delayMs = 0;
    let explanation = '';

    switch (errorCode) {
      case 'AUTH_EXPIRED':
      case 'INTEGRATION_NOT_CONNECTED': {
        strategy = 'escalate';
        explanation = `Authentication credential for ${node.type || 'integration'} is missing or expired. Immediate operator intervention required.`;
        break;
      }

      case 'RATE_LIMIT': {
        if (retryCount < maxRetries) {
          strategy = 'retry_with_backoff';
          delayMs = Math.min(1000 * Math.pow(2, retryCount) + 1000, 15000);
          explanation = `Rate limit detected. Retrying with exponential backoff (${delayMs}ms). Attempt ${retryCount + 1}/${maxRetries}.`;
        } else {
          strategy = 'escalate';
          explanation = `Exceeded maximum retry attempts for rate-limited endpoint. Escalating to operator.`;
        }
        break;
      }

      case 'TRANSIENT':
      case 'API_FAILURE': {
        if (retryCount < maxRetries) {
          strategy = 'retry_with_backoff';
          delayMs = 1500 * (retryCount + 1);
          explanation = `Transient network/service error. Retrying step in ${delayMs}ms.`;
        } else {
          strategy = 'escalate';
          explanation = `Service failure persisted across ${maxRetries} retry attempts. Escalating incident.`;
        }
        break;
      }

      case 'MISSING_FIELDS': {
        strategy = 'escalate';
        explanation = `Validation error: Required fields missing from payload. Automated retry not applicable.`;
        break;
      }

      default: {
        strategy = retryCount < 1 ? 'retry_with_backoff' : 'escalate';
        delayMs = 2000;
        explanation = `Unknown error occurred: ${errorMessage}. Escalation recommended.`;
      }
    }

    return {
      classification: errorCode,
      strategy,
      delayMs,
      retryCount: retryCount + 1,
      maxRetries,
      explanation,
      canRecover: strategy === 'retry_with_backoff',
    };
  }

  classifyErrorCode(errorMessage) {
    const msg = errorMessage.toLowerCase();
    if (msg.includes('auth') || msg.includes('token') || msg.includes('unauthorized') || msg.includes('expired') || msg.includes('credential')) {
      return 'AUTH_EXPIRED';
    }
    if (msg.includes('not connected') || msg.includes('missing credential')) {
      return 'INTEGRATION_NOT_CONNECTED';
    }
    if (msg.includes('rate') || msg.includes('429') || msg.includes('too many requests') || msg.includes('quota')) {
      return 'RATE_LIMIT';
    }
    if (msg.includes('network') || msg.includes('timeout') || msg.includes('econnrefused') || msg.includes('socket')) {
      return 'TRANSIENT';
    }
    if (msg.includes('missing') || msg.includes('validation') || msg.includes('required')) {
      return 'MISSING_FIELDS';
    }
    return 'API_FAILURE';
  }
}

module.exports = new RecoveryAgent();
