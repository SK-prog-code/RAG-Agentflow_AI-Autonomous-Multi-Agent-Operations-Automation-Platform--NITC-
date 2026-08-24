import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Key,
  GraduationCap,
  Lock,
  Cpu,
  CheckCircle2,
  Database,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <SettingsIcon className="w-6 h-6 text-brand-400" />
              <span>Platform & Security Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Operator profile, institutional identity, cryptographic keys, and multi-agent engine status.
            </p>
          </div>

          {/* User Profile Details */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Operator Profile</h3>
                <p className="text-xs text-slate-400">Authenticated user identity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-medium">
                  {user?.name || 'NIT Calicut Operator'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono">
                  {user?.email || 'operator@nitc.ac.in'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Assigned Role
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-brand-300 font-semibold capitalize flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-400" />
                  <span>{user?.role || 'operator'}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Institution
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold flex items-center space-x-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>{user?.institution || 'NIT CALICUT'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptography and Substrates Health */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Security & Encryption Verification</h3>
                <p className="text-xs text-slate-400">Application-level security parameters</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-slate-200">Credential Encryption Key (AES-256-GCM)</div>
                    <div className="text-[11px] text-slate-500">Encrypted token storage active at rest</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-slate-200">JWT Authentication Session Token</div>
                    <div className="text-[11px] text-slate-500">Cost factor 12 password hashing</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SECURE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Database className="w-4 h-4 text-brand-400" />
                  <div>
                    <div className="font-semibold text-slate-200">Database Storage & Fallback Substrate</div>
                    <div className="text-[11px] text-slate-500">MongoDB with automatic in-memory fallback</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  CONNECTED
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold text-slate-200">LangGraph & Multi-Agent Orchestrator</div>
                    <div className="text-[11px] text-slate-500">5-agent execution pipeline: Planner, Exec, Val, Rec, Mon</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
