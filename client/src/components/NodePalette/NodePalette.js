import { Zap, Sparkles, Mail, MessageSquare, Disc as DiscordIcon, Table, GitFork, Plus } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodePalette() {
  const { addNode } = useWorkflowStore();

  const paletteCategories = [
    {
      category: 'Triggers',
      items: [
        { type: 'trigger', action: 'manual', label: 'Manual Trigger', icon: Zap, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
        { type: 'trigger', action: 'webhook', label: 'Webhook Trigger', icon: Zap, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
        { type: 'trigger', action: 'schedule', label: 'Schedule Trigger', icon: Zap, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
      ],
    },
    {
      category: 'AI Agents',
      items: [
        { type: 'ai_action', action: 'summarize_text', label: 'Text Summarizer', icon: Sparkles, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
        { type: 'ai_action', action: 'classify_intent', label: 'Intent Classifier', icon: Sparkles, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
        { type: 'ai_action', action: 'extract_entities', label: 'Entity Extractor', icon: Sparkles, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
      ],
    },
    {
      category: 'Third-Party Actions',
      items: [
        { type: 'gmail', action: 'send_email', label: 'Gmail: Send Email', icon: Mail, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
        { type: 'slack', action: 'post_message', label: 'Slack: Post Message', icon: MessageSquare, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
        { type: 'discord', action: 'post_message', label: 'Discord: Send Alert', icon: DiscordIcon, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
        { type: 'google_sheets', action: 'append_row', label: 'Sheets: Append Row', icon: Table, color: 'text-green-400 border-green-500/30 bg-green-500/10' },
      ],
    },
    {
      category: 'Logic & Flow',
      items: [
        { type: 'condition', action: 'evaluate', label: 'Condition Branch', icon: GitFork, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
      ],
    },
  ];

  const onDragStart = (event, nodeType, action, label) => {
    event.dataTransfer.setData('application/agentflow-nodetype', nodeType);
    event.dataTransfer.setData('application/agentflow-action', action);
    event.dataTransfer.setData('application/agentflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden select-none">
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Node Palette</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Drag to canvas or click to add</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {paletteCategories.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              {cat.category}
            </span>
            <div className="space-y-1.5">
              {cat.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIdx}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type, item.action, item.label)}
                    onClick={() => addNode(item.type, { x: 300, y: 150 + itemIdx * 80 }, { label: item.label, action: item.action })}
                    className="p-2.5 rounded-xl bg-slate-850/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 cursor-grab active:cursor-grabbing transition duration-150 flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {item.label}
                      </span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
