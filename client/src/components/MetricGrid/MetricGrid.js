import { GitBranch, CheckCircle2, PlaySquare, Clock, Cpu, ArrowUpRight } from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const cards = [
    {
      title: 'Total Workflows',
      value: metrics.totalWorkflows ?? 0,
      sub: `${metrics.activeWorkflows ?? 0} active currently`,
      icon: GitBranch,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Success Rate',
      value: metrics.successRate ?? '100%',
      sub: `${metrics.completedExecutions ?? 0} succeeded runs`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Executions',
      value: metrics.totalExecutions ?? 0,
      sub: `${metrics.failedExecutions ?? 0} errors recovered`,
      icon: PlaySquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Avg Execution Latency',
      value: `${metrics.avgExecutionTimeMs ?? 0}ms`,
      sub: 'Multi-agent pipelining',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition duration-200 shadow-sm relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight">
                {card.value}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>{card.sub}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
