import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import NodePalette from '../../components/NodePalette/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import {
  Save,
  Play,
  Loader2,
  Check,
  ArrowLeft,
  Settings2,
  Copy,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const {
    currentWorkflow,
    setWorkflow,
    saveWorkflow,
    isSaving,
    nodes,
    edges,
    selectedNode,
  } = useWorkflowStore();

  const [loading, setLoading] = useState(true);
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (!id) return;

    if (id === 'new') {
      const blank = {
        name: 'New Custom Workflow',
        description: 'Custom operator automation workflow.',
        status: 'draft',
        triggerConfig: { type: 'manual' },
        nodes: [
          {
            id: 'node-1',
            type: 'trigger',
            position: { x: 100, y: 150 },
            data: { label: 'Manual Trigger', action: 'manual', config: {} },
          },
        ],
        edges: [],
        version: 1,
        tags: ['custom'],
      };
      setWorkflow(blank);
      setWorkflowTitle(blank.name);
      setWorkflowDesc(blank.description);
      setLoading(false);
      return;
    }

    const fetchWorkflow = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/workflows/${id}`);
        const wf = res.data.data;
        setWorkflow(wf);
        setWorkflowTitle(wf.name);
        setWorkflowDesc(wf.description || '');
      } catch (err) {
        console.error('Failed to load workflow:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id, setWorkflow]);

  const handleSave = async () => {
    if (currentWorkflow) {
      currentWorkflow.name = workflowTitle;
      currentWorkflow.description = workflowDesc;
    }
    const result = await saveWorkflow(id);
    if (result.success) {
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
      if (id === 'new' && result.workflow?._id) {
        router.replace(`/workflows/${result.workflow._id}`);
      }
    }
  };

  const handleExecute = async () => {
    if (id === 'new') {
      alert('Please save the workflow before triggering execution.');
      return;
    }
    try {
      setExecuting(true);
      // Auto-save first
      await handleSave();
      const res = await api.post(`/workflows/${id}/execute`, {});
      router.push(`/executions/${res.data.data._id}`);
    } catch (err) {
      alert('Execution failed: ' + (err.response?.data?.error || err.message));
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
            <span className="text-xs">Loading workflow canvas...</span>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="h-[calc(100vh-7.5rem)] flex flex-col -m-4 lg:-m-8">
          {/* Top Canvas Toolbar */}
          <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between z-20">
            <div className="flex items-center space-x-3 min-w-0">
              <Link
                href="/workflows"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Back to workflows"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="flex items-center space-x-2 min-w-0">
                <input
                  type="text"
                  value={workflowTitle}
                  onChange={(e) => setWorkflowTitle(e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-brand-500 font-bold text-sm text-slate-100 px-1 py-0.5 focus:outline-none transition min-w-[200px]"
                  placeholder="Workflow title"
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  v{currentWorkflow?.version || 1}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {saveToast && (
                <span className="text-xs text-emerald-400 flex items-center space-x-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>

              <button
                onClick={handleExecute}
                disabled={executing}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition transform active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
              >
                {executing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Run Workflow</span>
              </button>
            </div>
          </div>

          {/* Three-Column Editor Layout: Palette | Canvas | Config Panel */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Column: Node Palette */}
            <NodePalette />

            {/* Middle Column: React Flow Canvas */}
            <div className="flex-1 relative bg-slate-950">
              <WorkflowCanvas />
            </div>

            {/* Right Column: Node Config Inspector */}
            {selectedNode && <NodeConfigPanel />}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
