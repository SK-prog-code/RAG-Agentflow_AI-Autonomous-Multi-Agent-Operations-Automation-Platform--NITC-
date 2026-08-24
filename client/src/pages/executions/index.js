import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  PlaySquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  ArrowRight,
  Filter,
  Loader2,
  RefreshCw,
  Eye,
} from 'lucide-react';

export default function ExecutionsIndexPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/executions', { params });
      setExecutions(res.data.data || []);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter]);

  // Real-time live execution updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      fetchExecutions();
    };

    socket.on('execution:update', handleUpdate);
    return () => {
      socket.off('execution:update', handleUpdate);
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> COMPLETED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse">
            <RotateCw className="w-3.5 h-3.5 mr-1 animate-spin" /> RUNNING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> FAILED
          </span>
        );
      case 'RETRYING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> RETRYING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            PAUSED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-500 border border-slate-700">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5 mr-1" /> {status}
          </span>
        );
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
                <PlaySquare className="w-6 h-6 text-brand-400" />
                <span>Workflow Executions</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Audit trail, agent lifecycle telemetry, and step logs for all NIT Calicut automated runs.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="RUNNING">Running</option>
                <option value="FAILED">Failed</option>
                <option value="RETRYING">Retrying</option>
                <option value="PAUSED">Paused</option>
              </select>

              <button
                onClick={fetchExecutions}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Executions Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
                <span>Loading execution runs...</span>
              </div>
            ) : executions.length === 0 ? (
              <div className="py-20 text-center p-8">
                <PlaySquare className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5] mb-3" />
                <h3 className="text-sm font-bold text-slate-200">No execution runs yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Trigger an automation from your Workflows catalog to inspect live agent timelines.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Workflow Name</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Confidence</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Triggered At</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {executions.map((exec) => (
                      <tr key={exec._id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          <Link href={`/executions/${exec._id}`} className="hover:text-brand-400 transition">
                            {exec.workflowId?.name || exec.snapshot?.name || 'Unnamed Workflow'}
                          </Link>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ID: {exec._id}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(exec.status)}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">
                          {exec.confidenceScore ? `${(exec.confidenceScore * 100).toFixed(0)}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {exec.duration ? `${exec.duration}ms` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(exec.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/executions/${exec._id}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white transition inline-flex items-center space-x-1.5 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-400" />
                            <span>Timeline</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
