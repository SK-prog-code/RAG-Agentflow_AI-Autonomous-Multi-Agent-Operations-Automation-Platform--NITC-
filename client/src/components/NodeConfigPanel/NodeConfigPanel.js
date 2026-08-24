import { Trash2, X, Sliders, Check } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeData, deleteSelectedNode, setSelectedNode } = useWorkflowStore();

  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;
  const config = data?.config || {};

  const handleTextChange = (field, value) => {
    updateNodeData(id, {
      ...data,
      config: {
        ...config,
        [field]: value,
      },
    });
  };

  const handleLabelChange = (value) => {
    updateNodeData(id, {
      ...data,
      label: value,
    });
  };

  const handleActionChange = (value) => {
    updateNodeData(id, {
      ...data,
      action: value,
    });
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-20">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Configure Node</h3>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Node Identifier */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Node ID
          </label>
          <input
            type="text"
            disabled
            value={id}
            className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-500 font-mono text-xs cursor-not-allowed"
          />
        </div>

        {/* Display Label */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Step Label
          </label>
          <input
            type="text"
            value={data?.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Step display name"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Action
          </label>
          <input
            type="text"
            value={data?.action || ''}
            onChange={(e) => handleActionChange(e.target.value)}
            placeholder="e.g. send_email, post_message"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500 transition font-mono"
          />
        </div>

        {/* Dynamic Properties based on Node Type */}
        {type === 'gmail' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Recipient Email (To)</label>
              <input
                type="text"
                value={config.to || ''}
                onChange={(e) => handleTextChange('to', e.target.value)}
                placeholder="recipient@nitc.ac.in or {{previous_node.email}}"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => handleTextChange('subject', e.target.value)}
                placeholder="Notification Subject"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Body Template</label>
              <textarea
                rows={3}
                value={config.body || ''}
                onChange={(e) => handleTextChange('body', e.target.value)}
                placeholder="Content with variables like {{summary}}"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {type === 'slack' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Slack Channel</label>
              <input
                type="text"
                value={config.channel || ''}
                onChange={(e) => handleTextChange('channel', e.target.value)}
                placeholder="#general, #alerts"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Message Text</label>
              <textarea
                rows={3}
                value={config.message || ''}
                onChange={(e) => handleTextChange('message', e.target.value)}
                placeholder="Message payload with {{variables}}"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {type === 'discord' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Channel ID / Name</label>
              <input
                type="text"
                value={config.channelId || ''}
                onChange={(e) => handleTextChange('channelId', e.target.value)}
                placeholder="channel-ops-feed"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Alert Content</label>
              <textarea
                rows={3}
                value={config.content || ''}
                onChange={(e) => handleTextChange('content', e.target.value)}
                placeholder="Alert payload..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {type === 'google_sheets' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Spreadsheet ID</label>
              <input
                type="text"
                value={config.spreadsheetId || ''}
                onChange={(e) => handleTextChange('spreadsheetId', e.target.value)}
                placeholder="nitc_operations_audit_log"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Range</label>
              <input
                type="text"
                value={config.range || ''}
                onChange={(e) => handleTextChange('range', e.target.value)}
                placeholder="Sheet1!A:E"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>
        )}

        {type === 'ai_action' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Agent Prompt Directive</label>
              <textarea
                rows={3}
                value={config.promptTemplate || ''}
                onChange={(e) => handleTextChange('promptTemplate', e.target.value)}
                placeholder="Explain what the AI agent should extract, reason or summarize..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {type === 'trigger' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cron Expression (if scheduled)</label>
              <input
                type="text"
                value={config.cronExpression || ''}
                onChange={(e) => handleTextChange('cronExpression', e.target.value)}
                placeholder="0 9 * * *"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Webhook Path</label>
              <input
                type="text"
                value={config.webhookPath || ''}
                onChange={(e) => handleTextChange('webhookPath', e.target.value)}
                placeholder="/webhook/incoming"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <button
          onClick={deleteSelectedNode}
          className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>

        <span className="text-[10px] text-slate-500 flex items-center space-x-1">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>Auto-synced</span>
        </span>
      </div>
    </div>
  );
}
