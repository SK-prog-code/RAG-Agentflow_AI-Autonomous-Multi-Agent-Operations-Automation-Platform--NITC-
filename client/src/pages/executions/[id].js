import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '../../services/socket';
import {
  PlaySquare,
  ArrowLeft,
  Pause,
  Play,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  RefreshCw,
  Cpu,
  Layers,
  Terminal,
  Activity,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const logsEndRef = useRef(null);

  const fetchTimeline = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/executions/${id}/timeline`);
      setExecution(res.data.data.execution);
      setTimeline(res.data.data.timeline || []);
    } catch (err) {
      console.error('Failed to load execution timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [id]);

  // Socket.IO Real-Time Stream Integration
  useEffect(() => {
    if (!id) return;

    joinExecutionRoom(id);
    const socket = getSocket();
    if (!socket) return;

    const handleAgentEvent = (event) => {
      setTimeline((prev) => {
        if (prev.some((item) => item._id === event.id || item.timestamp === event.timestamp && item.message === event.message)) {
          return prev;
        }
        return [...prev, event];
      });

      // Update execution status if event reports it
      if (event.metadata?.outputs) {
        setExecution((prev) => (prev ? { ...prev, status: 'COMPLETED', outputs: event.metadata.outputs } : prev));
      } else if (event.metadata?.error) {
        setExecution((prev) => (prev ? { ...prev, status: 'FAILED' } : prev));
      }
    };

    socket.on('agent:event', handleAgentEvent);

    return () => {
      leaveExecutionRoom(id);
      socket.off('agent:event', handleAgentEvent);
    };
  }, [id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [timeline]);

  const handlePause = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/executions/${id}/pause`);
      setExecution(res.data.data);
    } catch (err) {
      alert('Pause failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/executions/${id}/resume`);
      setExecution(res.data.data);
    } catch (err) {
      alert('Resume failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this active execution?')) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/executions/${id}/cancel`);
      setExecution(res.data.data);
    } catch (err) {
      alert('Cancel failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'planner':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
            PLANNER
          </span>
        );
      case 'execution':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
            EXECUTION
          </span>
        );
      case 'validation':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            VALIDATION
          </span>
        );
      case 'recovery':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            RECOVERY
          </span>
        );
      case 'monitoring':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase tracking-wider">
            MONITORING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
            {agent}
          </span>
        );
    }
  };

  const getLevelDot = (level) => {
    switch (level) {
      case 'success':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />;
      case 'error':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-400 ring-4 ring-rose-500/20" />;
      case 'warning':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-500/20" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-blue-500/20" />;
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div className="flex items-center space-x-3">
              <Link
                href="/executions"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {execution?.workflowId?.name || execution?.snapshot?.name || 'Execution Run'}
                  </h1>
                  <span className="text-xs font-mono text-slate-500">#{id?.substring(0, 8)}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-3">
                  <span>Started: {execution?.startTime ? new Date(execution.startTime).toLocaleTimeString() : '—'}</span>
                  <span>•</span>
                  <span>Confidence: {execution?.confidenceScore ? `${(execution.confidenceScore * 100).toFixed(0)}%` : '—'}</span>
                  <span>•</span>
                  <span>LangGraph: <span className="text-brand-400 font-semibold">{execution?.langGraphStatus || 'available'}</span></span>
                </div>
              </div>
            </div>

            {/* Lifecycle Controls */}
            <div className="flex items-center space-x-2">
              {execution?.status === 'RUNNING' && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              {execution?.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              )}

              {(execution?.status === 'RUNNING' || execution?.status === 'PAUSED' || execution?.status === 'RETRYING') && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Run</span>
                </button>
              )}

              <button
                onClick={fetchTimeline}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                title="Reload"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Header Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status</span>
              <span className="text-sm font-extrabold text-white mt-1 block">
                {execution?.status || 'PENDING'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Latency</span>
              <span className="text-sm font-extrabold text-white mt-1 font-mono block">
                {execution?.duration ? `${execution.duration}ms` : execution?.status === 'RUNNING' ? 'In progress...' : '0ms'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Retries & Recovery</span>
              <span className="text-sm font-extrabold text-white mt-1 font-mono block">
                {execution?.retryCount ?? 0} retries
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Logged Events</span>
              <span className="text-sm font-extrabold text-brand-400 mt-1 font-mono block">
                {timeline.length} agent logs
              </span>
            </div>
          </div>

          {/* Timeline and Event Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Agent Timeline Stream (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-brand-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Agentic Execution Timeline (Real-Time)
                  </h3>
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Socket Connected</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                {timeline.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    Initializing multi-agent pipeline...
                  </div>
                ) : (
                  timeline.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      onClick={() => setSelectedLog(item)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        selectedLog?._id === item._id
                          ? 'bg-slate-800 border-brand-500/50 shadow-md'
                          : 'bg-slate-850/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          {getLevelDot(item.level)}
                          {getAgentBadge(item.agent)}
                          {item.nodeId && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                              {item.nodeId}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{item.message}</p>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Right Pane: Inspector / Outputs / Errors (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col space-y-4 shadow-sm">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Telemetry & Output Inspector</span>
                </h3>
              </div>

              {/* Error Box if any */}
              {execution?.error?.message && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error Encountered ({execution.error.code || 'FAILURE'})</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{execution.error.message}</p>
                </div>
              )}

              {/* Selected Log Metadata Inspector */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Selected Event Metadata
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto">
                  {selectedLog?.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-600 italic">Click an event on the left timeline to inspect JSON payload.</span>
                  )}
                </div>
              </div>

              {/* Step Outputs */}
              <div className="flex-1 min-h-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Final Step Outputs & Memory
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-56 overflow-y-auto">
                  {execution?.outputs && Object.keys(execution.outputs).length > 0 ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(execution.outputs, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-600 italic">Outputs will populate as step nodes finish execution.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
