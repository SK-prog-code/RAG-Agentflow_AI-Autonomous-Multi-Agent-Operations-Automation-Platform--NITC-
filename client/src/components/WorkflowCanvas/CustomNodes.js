import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Sparkles,
  Mail,
  MessageSquare,
  Disc as DiscordIcon,
  Table,
  GitFork,
  Settings2,
} from 'lucide-react';

const nodeConfigMeta = {
  trigger: {
    icon: Zap,
    title: 'Trigger',
    color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    headerBg: 'bg-amber-500/20 text-amber-300',
  },
  ai_action: {
    icon: Sparkles,
    title: 'AI Agent Reasoning',
    color: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
    headerBg: 'bg-purple-500/20 text-purple-300',
  },
  gmail: {
    icon: Mail,
    title: 'Gmail Service',
    color: 'border-red-500/50 bg-red-500/10 text-red-400',
    headerBg: 'bg-red-500/20 text-red-300',
  },
  slack: {
    icon: MessageSquare,
    title: 'Slack Hub',
    color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    headerBg: 'bg-emerald-500/20 text-emerald-300',
  },
  discord: {
    icon: DiscordIcon,
    title: 'Discord Bot',
    color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400',
    headerBg: 'bg-indigo-500/20 text-indigo-300',
  },
  google_sheets: {
    icon: Table,
    title: 'Google Sheets',
    color: 'border-green-500/50 bg-green-500/10 text-green-400',
    headerBg: 'bg-green-500/20 text-green-300',
  },
  condition: {
    icon: GitFork,
    title: 'Condition Logic',
    color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
    headerBg: 'bg-cyan-500/20 text-cyan-300',
  },
};

const GenericWorkflowNode = ({ type, data, selected }) => {
  const meta = nodeConfigMeta[type] || {
    icon: Settings2,
    title: type?.toUpperCase() || 'Node',
    color: 'border-slate-500/50 bg-slate-500/10 text-slate-300',
    headerBg: 'bg-slate-700 text-slate-200',
  };

  const Icon = meta.icon;
  const isTrigger = type === 'trigger';

  return (
    <div
      className={`w-64 rounded-2xl bg-slate-900 border transition-all duration-200 shadow-xl overflow-hidden ${
        selected ? 'ring-2 ring-brand-400 border-brand-400' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target input handle if not trigger */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-slate-400 border-2 !border-slate-900 hover:!bg-brand-400 transition"
        />
      )}

      {/* Node Header */}
      <div className={`px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800 ${meta.headerBg}`}>
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wide uppercase">{meta.title}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/60 font-mono text-slate-300">
          {data?.action || 'run'}
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-2 bg-slate-900/90">
        <div className="text-xs font-semibold text-slate-200 truncate">
          {data?.label || 'Step Action'}
        </div>
        {data?.config?.promptTemplate && (
          <div className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/50 p-1.5 rounded border border-slate-850">
            "{data.config.promptTemplate}"
          </div>
        )}
        {data?.config?.channel && (
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="text-slate-500">Channel:</span>
            <span className="font-mono text-slate-300">{data.config.channel}</span>
          </div>
        )}
        {data?.config?.to && (
          <div className="text-[11px] text-slate-400 flex items-center space-x-1 truncate">
            <span className="text-slate-500">To:</span>
            <span className="font-mono text-slate-300 truncate">{data.config.to}</span>
          </div>
        )}
      </div>

      {/* Source output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-brand-500 border-2 !border-slate-900 hover:!bg-emerald-400 transition"
      />
    </div>
  );
};

export const TriggerNode = memo((props) => <GenericWorkflowNode type="trigger" {...props} />);
export const AIActionNode = memo((props) => <GenericWorkflowNode type="ai_action" {...props} />);
export const GmailNode = memo((props) => <GenericWorkflowNode type="gmail" {...props} />);
export const SlackNode = memo((props) => <GenericWorkflowNode type="slack" {...props} />);
export const DiscordNode = memo((props) => <GenericWorkflowNode type="discord" {...props} />);
export const GoogleSheetsNode = memo((props) => <GenericWorkflowNode type="google_sheets" {...props} />);
export const ConditionNode = memo((props) => <GenericWorkflowNode type="condition" {...props} />);

export const customNodeTypes = {
  trigger: TriggerNode,
  ai_action: AIActionNode,
  gmail: GmailNode,
  slack: SlackNode,
  discord: DiscordNode,
  google_sheets: GoogleSheetsNode,
  condition: ConditionNode,
};
