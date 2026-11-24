import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Layers,
} from 'lucide-react';
import type { DashboardStatsData, NavSection } from '../types/task';

interface DashboardStatsProps {
  stats: DashboardStatsData;
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

export function DashboardStats({
  stats,
  activeSection,
  onSelectSection,
}: DashboardStatsProps) {
  const cards: Array<{
    id: NavSection;
    label: string;
    value: number;
    subtitle: string;
    icon: typeof Layers;
    iconClass: string;
    valueClass: string;
  }> = [
    {
      id: 'all',
      label: 'Total Tasks',
      value: stats.total,
      subtitle: `${stats.dueToday} due today`,
      icon: Layers,
      iconClass: 'text-indigo-600 dark:text-indigo-400',
      valueClass: 'text-slate-900 dark:text-white',
    },
    {
      id: 'dashboard',
      label: 'Pending Tasks',
      value: stats.pending,
      subtitle: `${stats.notStarted} to do · ${stats.inProgress} in progress`,
      icon: Clock3,
      iconClass: 'text-amber-600 dark:text-amber-400',
      valueClass: 'text-slate-900 dark:text-white',
    },
    {
      id: 'completed',
      label: 'Completed Tasks',
      value: stats.completed,
      subtitle:
        stats.total > 0
          ? `${Math.round((stats.completed / stats.total) * 100)}% completion rate`
          : 'No tasks recorded yet',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      valueClass: 'text-slate-900 dark:text-white',
    },
    {
      id: 'overdue',
      label: 'Overdue Tasks',
      value: stats.overdue,
      subtitle: stats.overdue > 0 ? 'Requires attention' : 'All deadlines on track',
      icon: AlertTriangle,
      iconClass:
        stats.overdue > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-slate-400 dark:text-slate-500',
      valueClass:
        stats.overdue > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-slate-900 dark:text-white',
    },
  ];

  return (
    <section aria-label="Task summary statistics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isHighlighted = activeSection === card.id && card.id !== 'dashboard';

        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectSection(card.id)}
            className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-5 ${
              isHighlighted
                ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-500/40 dark:bg-indigo-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#111827] dark:hover:border-slate-700'
            }`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm">
                {card.label}
              </span>
              <Icon className={`h-4 w-4 shrink-0 ${card.iconClass}`} aria-hidden="true" />
            </div>

            <div className="mt-2 sm:mt-3">
              <p
                className={`font-display text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl ${card.valueClass}`}
              >
                {card.value}
              </p>
              <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
                {card.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
}
