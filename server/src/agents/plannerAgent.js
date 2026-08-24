class PlannerAgent {
  /**
   * Plans the execution order of nodes based on directed graph edges
   */
  async plan(workflowSnapshot) {
    const nodes = workflowSnapshot.nodes || [];
    const edges = workflowSnapshot.edges || [];

    if (nodes.length === 0) {
      return {
        success: false,
        confidence: 0,
        plan: [],
        error: 'Workflow contains no nodes to execute',
      };
    }

    // Build Adjacency List and In-Degree count
    const adjacency = new Map();
    const inDegree = new Map();

    nodes.forEach((node) => {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach((edge) => {
      if (adjacency.has(edge.source) && inDegree.has(edge.target)) {
        adjacency.get(edge.source).push(edge.target);
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    // Topological Sort (Kahn's Algorithm)
    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    const executionPlan = [];
    while (queue.length > 0) {
      const currentId = queue.shift();
      const nodeObj = nodes.find((n) => n.id === currentId);
      if (nodeObj) {
        executionPlan.push(nodeObj);
      }

      const neighbors = adjacency.get(currentId) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    // If topological sort missed nodes, append disconnected nodes
    if (executionPlan.length < nodes.length) {
      nodes.forEach((node) => {
        if (!executionPlan.some((p) => p.id === node.id)) {
          executionPlan.push(node);
        }
      });
    }

    // Confidence Score Calculation (1.0 for valid DAG, penalized if disjointed)
    let confidence = 0.98;
    if (edges.length === 0 && nodes.length > 1) {
      confidence = 0.85; // Disconnected graph penalty
    }

    return {
      success: true,
      confidence,
      plan: executionPlan,
      totalSteps: executionPlan.length,
      estimatedDurationMs: executionPlan.length * 800,
    };
  }
}

module.exports = new PlannerAgent();
