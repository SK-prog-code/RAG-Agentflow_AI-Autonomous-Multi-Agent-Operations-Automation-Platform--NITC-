import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import {
  GitBranch,
  Sparkles,
  Plus,
  Play,
  Copy,
  Trash2,
  Edit,
  Search,
  Tag,
  Loader2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function WorkflowsIndexPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [triggeringId, setTriggeringId] = useState(null);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/workflows', { params });
      setWorkflows(res.data.data || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkflows();
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
      router.push(`/workflows/${res.data.data._id}`);
    } catch (err) {
      alert('Failed to clone workflow: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (err) {
      alert('Failed to delete workflow: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleExecute = async (id) => {
    try {
      setTriggeringId(id);
      const res = await api.post(`/workflows/${id}/execute`, {});
      router.push(`/executions/${res.data.data._id}`);
    } catch (err) {
      alert('Execution failed: ' + (err.response?.data?.error || err.message));
      setTriggeringId(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                <GitBranch className="w-6 h-6 text-brand-400" />
                <span>Workflows Catalog</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage, design, version, and execute multi-agent automation graphs for NIT Calicut.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/workflows/builder"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition transform active:scale-95 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Prompt-to-Workflow</span>
              </Link>
              <Link
                href="/workflows/new"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Blank Canvas</span>
              </Link>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <form onSubmit={handleSearch} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workflows by title or description..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-brand-500"
              />
            </form>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Workflows Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
              <span>Loading workflows...</span>
            </div>
          ) : workflows.length === 0 ? (
            <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8">
              <GitBranch className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5] mb-3" />
              <h3 className="text-sm font-bold text-slate-200">No workflows found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Generate an automation with our AI Prompt Builder or start from a blank canvas.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-3">
                <Link
                  href="/workflows/builder"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
                >
                  Generate via AI
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => (
                <div
                  key={wf._id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition duration-200 p-5 flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 uppercase tracking-wider">
                        {wf.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">v{wf.version || 1}</span>
                    </div>

                    <Link href={`/workflows/${wf._id}`} className="block group-hover:text-brand-400 transition">
                      <h3 className="text-base font-bold text-slate-100 leading-snug truncate">
                        {wf.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {wf.description || 'No description provided.'}
                    </p>

                    {/* Tags */}
                    {wf.tags && wf.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {wf.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-850"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Nodes Summary */}
                    <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wf.nodes?.length || 0} step nodes</span>
                      </span>
                      <span className="font-mono text-[10px]">
                        Trigger: {wf.triggerConfig?.type || 'manual'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleExecute(wf._id)}
                      disabled={triggeringId === wf._id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
                      title="Run workflow now"
                    >
                      {triggeringId === wf._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Run</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <Link
                        href={`/workflows/${wf._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit Canvas"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(wf._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Duplicate Workflow"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(wf._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Workflow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
