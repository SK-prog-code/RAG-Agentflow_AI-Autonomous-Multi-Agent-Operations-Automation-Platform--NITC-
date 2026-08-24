import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import api from '../services/api';
import {
  Network,
  Mail,
  MessageSquare,
  Disc as DiscordIcon,
  Table,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  RotateCw,
  Loader2,
} from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState({});

  const providers = [
    {
      id: 'gmail',
      name: 'Google Gmail',
      desc: 'Send automated email notifications, dispatch student updates, and inspect incoming threads.',
      icon: Mail,
      color: 'text-red-400 border-red-500/30 bg-red-500/10',
      type: 'OAuth 2.0',
    },
    {
      id: 'slack',
      name: 'Slack Workspaces',
      desc: 'Post incident alerts, send duty messages, and monitor DevOps communication channels.',
      icon: MessageSquare,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      type: 'OAuth 2.0 / Bot',
    },
    {
      id: 'discord',
      name: 'Discord Bot',
      desc: 'Broadcast emergency channel embeds and send operations telemetry alerts.',
      icon: DiscordIcon,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
      type: 'Bot OAuth',
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      desc: 'Append audit rows, sync student records, and read institutional survey ranges.',
      icon: Table,
      color: 'text-green-400 border-green-500/30 bg-green-500/10',
      type: 'OAuth 2.0',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter AI',
      desc: 'Direct access to deep reasoning LLM models for natural language prompt-to-graph synthesis.',
      icon: Sparkles,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      type: 'API Key',
    },
    {
      id: 'gemini',
      name: 'Google Gemini Pro',
      desc: 'High-speed multimodality and prompt generation engine.',
      icon: Sparkles,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      type: 'API Key',
    },
  ];

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations');
      setIntegrations(res.data.data || []);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (providerId) => {
    try {
      const res = await api.get(`/integrations/oauth/${providerId}/start`);
      if (res.data.data?.authUrl) {
        window.location.href = res.data.data.authUrl;
      }
    } catch (err) {
      alert('OAuth initialization failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleTestConnection = async (providerId) => {
    try {
      setTestingProvider(providerId);
      const res = await api.get(`/integrations/status?provider=${providerId}`);
      setTestResult((prev) => ({ ...prev, [providerId]: res.data.data }));
    } catch (err) {
      setTestResult((prev) => ({
        ...prev,
        [providerId]: { ok: false, error: err.response?.data?.error || err.message },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <Network className="w-6 h-6 text-brand-400" />
              <span>Third-Party Tool Integrations</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Connect external services via OAuth 2.0 or API Keys. All credentials are encrypted at rest with AES-256-GCM.
            </p>
          </div>

          {/* Security Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Encrypted Credential Storage:</span> Access tokens and OAuth refresh secrets are encrypted at the database layer using application-level cryptographic keys. Decrypted tokens are never logged.
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((item) => {
              const Icon = item.icon;
              const conn = integrations.find((i) => i.provider === item.id);
              const isConnected = conn ? conn.isConnected : false;
              const result = testResult[item.id];

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition duration-150"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">{item.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{item.type}</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>

                    {/* Metadata if connected */}
                    {conn?.metadata && Object.keys(conn.metadata).length > 0 && (
                      <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-[11px] text-slate-400 space-y-0.5">
                        {conn.metadata.email && <div>Account: {conn.metadata.email}</div>}
                        {conn.metadata.teamName && <div>Workspace: {conn.metadata.teamName}</div>}
                        {conn.metadata.botName && <div>Bot: {conn.metadata.botName}</div>}
                      </div>
                    )}

                    {/* Test result message */}
                    {result && (
                      <div
                        className={`mt-3 p-2 rounded-lg text-[11px] border ${
                          result.ok
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}
                      >
                        {result.ok ? result.message || 'Connection active' : result.error || 'Connection check failed'}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTestConnection(item.id)}
                      disabled={testingProvider === item.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition disabled:opacity-50"
                    >
                      {testingProvider === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCw className="w-3.5 h-3.5" />
                      )}
                      <span>Test Health</span>
                    </button>

                    <button
                      onClick={() => handleConnect(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <span>{isConnected ? 'Reconnect' : 'Connect'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
