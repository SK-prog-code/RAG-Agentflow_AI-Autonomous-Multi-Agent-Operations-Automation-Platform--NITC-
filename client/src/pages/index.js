import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import {
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Cpu,
  RefreshCw,
  GitBranch,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const agents = [
    {
      name: 'Planner Agent',
      desc: 'Performs graph topological sort, dependency resolution, and estimates execution confidence.',
      badge: 'TOPOLOGICAL SORT',
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    },
    {
      name: 'Execution Agent',
      desc: 'Invokes third-party tools (Gmail, Slack, Discord, Sheets) with payload variable resolution.',
      badge: 'TOOL RUNTIME',
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    },
    {
      name: 'Validation Agent',
      desc: 'Inspects execution output fields and verifies schema conformance before pipeline progression.',
      badge: 'SCHEMA VERIFIER',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
    {
      name: 'Recovery Agent',
      desc: 'Classifies errors (AUTH_EXPIRED, RATE_LIMIT, TRANSIENT) and applies exponential backoff or escalation.',
      badge: 'HEALING & RETRY',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    },
    {
      name: 'Monitoring Agent',
      desc: 'Broadcasts live WebSocket timeline logs, updates execution metrics, and triggers alerts.',
      badge: 'REAL-TIME TELEMETRY',
      color: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500/30 selection:text-brand-300">
      {/* Top Navigation */}
      <header className="border-b border-slate-850 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-[1px] shadow-lg shadow-brand-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-brand-400">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">Agentflow<span className="text-brand-400">_AI</span></span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                NIT CALICUT
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-900 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-brand-500/20 transition transform active:scale-95 flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-950/40 via-slate-950 to-slate-950 -z-10" />
        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 mb-6 shadow-inner text-xs font-medium text-slate-300">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>National Institute of Technology Calicut</span>
            <span className="text-slate-600">•</span>
            <span className="text-brand-400 font-semibold">Autonomous Operations Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Turn Natural Language Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Autonomous Agentic Workflows
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Describe any operations automation in plain English. Agentflow_AI synthesizes a visual DAG, orchestrates execution across a cooperating 5-agent pipeline, and integrates seamlessly with Gmail, Slack, Discord, and Google Sheets.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/workflows/builder"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 transition transform active:scale-95 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try AI Workflow Generator</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-semibold text-sm transition flex items-center justify-center space-x-2"
            >
              <span>Operator Dashboard</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Agent Architecture Showcase */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
            Multi-Agent Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            5 Cooperating AI Agents in Fixed Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Every workflow step is planned, executed, validated, recovered, and monitored autonomously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl bg-slate-900/60 border ${agent.color.split(' ')[0]} backdrop-blur-sm relative overflow-hidden group hover:bg-slate-900/90 transition`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 font-mono tracking-wider">
                  {agent.badge}
                </span>
                <span className="text-xs font-mono text-slate-500">0{i + 1}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">{agent.name}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
            </div>
          ))}

          {/* LangGraph Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-mono">
                  SUBSTRATE READY
                </span>
                <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-slate-100">LangGraph & LangChain Substrate</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Stateful orchestration engine supporting cyclical graphs, checkpoint recovery, and BullMQ Redis job queues.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-brand-400">
              <span>Status: Available</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>National Institute of Technology Calicut (NIT Calicut)</span>
          </div>
          <div>Agentflow_AI Operations Automation Platform • 2026</div>
        </div>
      </footer>
    </div>
  );
}
