import { create } from 'zustand';
import api from '../services/api';

export const useWorkflowStore = create((set, get) => ({
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isSaving: false,
  isGenerating: false,
  error: null,

  setWorkflow: (workflow) => {
    set({
      currentWorkflow: workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNode: null,
      error: null,
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),

  onNodesChange: (changes) => {
    // Standard React Flow node change helper
    const currentNodes = get().nodes;
    // apply changes
    let nextNodes = [...currentNodes];
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        nextNodes = nextNodes.map((n) =>
          n.id === change.id ? { ...n, position: change.position } : n
        );
      } else if (change.type === 'select') {
        nextNodes = nextNodes.map((n) =>
          n.id === change.id ? { ...n, selected: change.selected } : n
        );
      } else if (change.type === 'remove') {
        nextNodes = nextNodes.filter((n) => n.id !== change.id);
      }
    });
    set({ nodes: nextNodes });
  },

  onEdgesChange: (changes) => {
    const currentEdges = get().edges;
    let nextEdges = [...currentEdges];
    changes.forEach((change) => {
      if (change.type === 'remove') {
        nextEdges = nextEdges.filter((e) => e.id !== change.id);
      }
    });
    set({ edges: nextEdges });
  },

  onConnect: (connection) => {
    const currentEdges = get().edges;
    const newEdge = {
      id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      animated: true,
    };
    set({ edges: [...currentEdges, newEdge] });
  },

  addNode: (nodeType, position = { x: 250, y: 200 }, initialData = {}) => {
    const nodes = get().nodes;
    const count = nodes.length + 1;
    const newNode = {
      id: `node-${count}-${Math.random().toString(36).substring(2, 7)}`,
      type: nodeType,
      position,
      data: {
        label: initialData.label || `${nodeType.toUpperCase()} Step ${count}`,
        action: initialData.action || 'run',
        config: initialData.config || {},
      },
    };
    set({ nodes: [...nodes, newNode], selectedNode: newNode });
    return newNode;
  },

  updateNodeData: (nodeId, dataUpdate) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        const updated = {
          ...node,
          data: {
            ...node.data,
            ...dataUpdate,
            config: {
              ...(node.data?.config || {}),
              ...(dataUpdate.config || {}),
            },
          },
        };
        return updated;
      }
      return node;
    });

    const updatedSelected = nodes.find((n) => n.id === nodeId) || null;
    set({ nodes, selectedNode: updatedSelected });
  },

  deleteSelectedNode: () => {
    const selected = get().selectedNode;
    if (!selected) return;

    const nodes = get().nodes.filter((n) => n.id !== selected.id);
    const edges = get().edges.filter(
      (e) => e.source !== selected.id && e.target !== selected.id
    );
    set({ nodes, edges, selectedNode: null });
  },

  saveWorkflow: async (workflowId) => {
    set({ isSaving: true, error: null });
    try {
      const { nodes, edges, currentWorkflow } = get();
      const payload = {
        name: currentWorkflow?.name || 'Untitled Workflow',
        description: currentWorkflow?.description || '',
        status: currentWorkflow?.status || 'active',
        tags: currentWorkflow?.tags || ['automation'],
        triggerConfig: currentWorkflow?.triggerConfig || { type: 'manual' },
        nodes,
        edges,
      };

      let response;
      if (workflowId && workflowId !== 'new') {
        response = await api.put(`/workflows/${workflowId}`, payload);
      } else {
        response = await api.post('/workflows', payload);
      }

      set({
        currentWorkflow: response.data.data,
        isSaving: false,
      });
      return { success: true, workflow: response.data.data };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to save workflow';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  generateWorkflowFromPrompt: async (prompt) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await api.post('/workflows/generate', { prompt });
      const generated = response.data.data;
      set({
        currentWorkflow: {
          name: generated.name,
          description: generated.description,
          tags: generated.tags || ['ai-generated'],
          triggerConfig: generated.triggerConfig || { type: 'manual' },
          status: 'draft',
        },
        nodes: generated.nodes || [],
        edges: generated.edges || [],
        selectedNode: null,
        isGenerating: false,
      });
      return { success: true, data: generated };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to generate workflow from prompt';
      set({ error: message, isGenerating: false });
      return { success: false, error: message };
    }
  },
}));
