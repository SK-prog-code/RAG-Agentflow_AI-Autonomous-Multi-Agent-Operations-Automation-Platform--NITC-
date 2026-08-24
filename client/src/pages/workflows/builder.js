import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  Save,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Zap,
  Code2,
  RefreshCw,
} from 'lucide-react';

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const { generateWorkflowFromPrompt, saveWorkflow, nodes, edges, currentWorkflow, isGenerating, isSaving, error } =
    useWorkflowStore();
  const [prompt, setPrompt] = useState('');
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const promptSuggestions = [
    {
      title: 'IT Incident Alert Pipeline',
      prompt: 'When an incident webhook arrives, use AI to classify urgency, send a Slack message to #duty-channel, log row in Google Sheets, and notify admin via Gmail.',
    },
    {
      title: 'Student Academic Service Dispatcher',
      prompt: 'Process student request submission, summarize details using AI, append record to Google Sheets, and send confirmation email via Gmail.',
    },
    {
      title: 'Campus Event Alert & Discord Broadcast',
      prompt: 'On daily schedule at 9am, extract key announcements with AI, and post an embed message to the Discord operations desk channel.',
    },
  ];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setGenerationSuccess(false);
    const result = await generateWorkflowFromPrompt(prompt);
    if (result.success) {
      setGenerationSuccess(true);
    }
  };

  const handleApplySuggestion = (text) => {
    setPrompt(text);
  };

  const handleSaveAndOpen = async () => {
    const result = await saveWorkflow();
    if (result.success && result.workflow?._id) {
      router.push(`/workflows/${result.workflow._id}`);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-7xl mx-auto space-y-6 h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-0.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>NIT CALICUT AI WORKFLOW COMPILER</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <span>Prompt-to-Workflow Generator</span>
              </h1>
            </div>

            {nodes.length > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveAndOpen}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition transform active:scale-95 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save & Open Canvas</span>
                </button>
              </div>
            )}
          </div>

          {/* Split Pane: Prompt Input Panel on Left, Interactive Canvas Preview on Right */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Left Panel: Prompt Input & Templates (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                    Describe Automation in Plain English
                  </label>
                  <form onSubmit={handleGenerate} className="space-y-2">
                    <textarea
                      rows={4}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. When a new grievance email arrives, summarize the issue with AI, notify the operator on Slack, and log the entry into Google Sheets..."
                      className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500 transition leading-relaxed"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Synthesizing Multi-Agent Graph...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Workflow Graph</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Suggestions */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    NIT Calicut Starter Templates
                  </span>
                  <div className="space-y-2">
                    {promptSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplySuggestion(item.prompt)}
                        className="w-full text-left p-3 rounded-xl bg-slate-850/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group"
                      >
                        <div className="text-xs font-bold text-slate-200 group-hover:text-brand-300 flex items-center justify-between">
                          <span>{item.title}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-brand-400 transition" />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compilation Metadata */}
              {generationSuccess && currentWorkflow && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Graph Synthesized Successfully</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    {nodes.length} Nodes • {edges.length} Directed Edges
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    "{currentWorkflow.name}"
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel: Live React Flow Canvas Preview (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner flex flex-col">
              <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Interactive Graph Preview
                  </span>
                </div>
                {nodes.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 font-mono">
                    {nodes.length} compiled nodes
                  </span>
                )}
              </div>

              <div className="flex-1 relative">
                {nodes.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                    <Bot className="w-12 h-12 text-slate-700 mb-3" />
                    <h3 className="text-sm font-bold text-slate-300">No Graph Generated Yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Type an automation prompt on the left or select a pre-built template to compile a visual workflow.
                    </p>
                  </div>
                ) : (
                  <WorkflowCanvas />
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
