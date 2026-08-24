import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';
import {
  GitBranch,
  PlaySquare,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Layers,
  GraduationCap,
  Play,
  RotateCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows/dashboard');
      setDashboardData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickExecute = async (workflowId) => {
    try {
      setTriggeringId(workflowId);
      await api.post(`/workflows/${workflowId}/execute`, {});
      setTimeout(() => {
        fetchDashboard();
        setTriggeringId(null);
      }, 800);
    } catch (err) {
      alert('Execution failed: ' + (err.response?.data?.error || err.message));
      setTriggeringId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <RotateCw className="w-3 h-3 mr-1 animate-spin" /> Running
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3 mr-1" /> {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>NIT CALICUT AI OPERATIONS CENTER</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Operator Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-time multi-agent orchestration, execution telemetry, and pipeline health.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/workflows/builder"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition transform active:scale-95 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt Builder</span>
              </Link>
              <Link
                href="/workflows/new"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Workflow</span>
              </Link>
            </div>
          </div>

          {/* Metric Overview Grid */}
          <MetricGrid metrics={dashboardData?.metrics} />

          {/* Dual Panel Layout: Recent Executions & Agent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Executions Table (2 Cols) */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <PlaySquare className="w-4 h-4 text-brand-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Recent Execution Runs
                  </h2>
                </div>
                <Link
                  href="/executions"
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
                >
                  <span>View All Runs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading execution telemetry...</div>
              ) : !dashboardData?.recentExecutions || dashboardData.recentExecutions.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <PlaySquare className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
                  <p className="text-xs">No execution runs recorded yet.</p>
                  <Link
                    href="/workflows"
                    className="text-xs text-brand-400 hover:underline mt-1 inline-block"
                  >
                    Trigger a workflow from catalog ➔
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="pb-3 px-2">Workflow</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2">Duration</th>
                        <th className="pb-3 px-2">Started</th>
                        <th className="pb-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dashboardData.recentExecutions.map((exec) => (
                        <tr key={exec._id} className="hover:bg-slate-850/50 transition">
                          <td className="py-3 px-2 font-medium text-slate-200">
                            <Link href={`/executions/${exec._id}`} className="hover:text-brand-400 transition">
                              {exec.workflowId?.name || exec.snapshot?.name || 'Unnamed Pipeline'}
                            </Link>
                          </td>
                          <td className="py-3 px-2">{getStatusBadge(exec.status)}</td>
                          <td className="py-3 px-2 text-slate-400 font-mono">
                            {exec.duration ? `${exec.duration}ms` : '—'}
                          </td>
                          <td className="py-3 px-2 text-slate-500">
                            {new Date(exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Link
                              href={`/executions/${exec._id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center space-x-1"
                            >
                              <span>Timeline</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Agent Live Telemetry Stream Card (1 Col) */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                      Multi-Agent Status
                    </h2>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Planner Agent</div>
                      <div className="text-[11px] text-slate-500">Kahn DAG Sorting</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Execution Agent</div>
                      <div className="text-[11px] text-slate-500">OAuth & AI Dispatcher</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                      READY
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Validation Agent</div>
                      <div className="text-[11px] text-slate-500">Schema & Field Assert</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      ONLINE
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Recovery Agent</div>
                      <div className="text-[11px] text-slate-500">Backoff & Escalation</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      STANDBY
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Monitoring Agent</div>
                      <div className="text-[11px] text-slate-500">Socket.IO Broadcasting</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">
                      STREAMING
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Orchestrator: LangGraph ready</span>
                <span className="text-brand-400 font-semibold">NIT CALICUT</span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
