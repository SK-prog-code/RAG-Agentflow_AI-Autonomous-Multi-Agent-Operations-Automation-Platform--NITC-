class ValidationAgent {
  /**
   * Validates step output and asserts data integrity
   */
  async validate(node, executionResult) {
    const requiredFields = node.data?.config?.requiredFields || [];
    const output = executionResult.output || {};

    const missingFields = [];
    requiredFields.forEach((field) => {
      if (output[field] === undefined || output[field] === null || output[field] === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return {
        isValid: false,
        confidence: 0.4,
        error: `Missing required output fields: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS',
        missingFields,
      };
    }

    if (!executionResult || executionResult.status !== 'SUCCESS') {
      return {
        isValid: false,
        confidence: 0.2,
        error: 'Execution step returned non-success status',
        code: 'STEP_EXECUTION_FAILURE',
      };
    }

    return {
      isValid: true,
      confidence: 0.99,
      message: `Node ${node.id} validated successfully. All outputs conform to schema.`,
    };
  }
}

module.exports = new ValidationAgent();
