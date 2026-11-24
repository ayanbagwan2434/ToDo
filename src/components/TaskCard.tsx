import {
  AlertTriangle,
  Calendar,
  Check,
  Eye,
  Flag,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { Category, Task } from '../types/task';
import {
  formatDueDateLabel,
  formatPriorityLabel,
  formatStatusLabel,
  isTaskDueToday,
  isTaskOverdue,
} from '../utils/taskLogic';

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onToggleComplete: (task: Task) => void;
  onViewDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({
  task,
  categories,
  onToggleComplete,
  onViewDetails,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const now = new Date();
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task, now);
  const dueToday = isTaskDueToday(task, now);
  const categoryObj = categories.find((c) => c.name === task.category);

  const priorityColorClass =
    task.priority === 'high'
      ? 'text-red-600 dark:text-red-400'
      : task.priority === 'medium'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-slate-500 dark:text-slate-400';

  const statusColorClass =
    task.status === 'completed'
      ? 'text-emerald-600 dark:text-emerald-400'
      : task.status === 'in_progress'
        ? 'text-indigo-600 dark:text-indigo-400'
        : 'text-slate-500 dark:text-slate-400';

  return (
    <article
      data-testid={`task-row-${task.id}`}
      className={`group flex flex-col gap-3 px-4 py-3.5 transition-colors duration-150 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
        overdue
          ? 'bg-red-50/35 hover:bg-red-50/60 dark:bg-red-950/15 dark:hover:bg-red-950/25'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Left: Checkbox + Content */}
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={
            isCompleted
              ? `Mark "${task.title}" as pending`
              : `Mark "${task.title}" as completed`
          }
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isCompleted
              ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-slate-300 bg-white hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-indigo-400'
          }`}
        >
          {isCompleted && <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <button
              type="button"
              onClick={() => onViewDetails(task)}
              className={`text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline ${
                isCompleted
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400'
              }`}
            >
              {task.title}
            </button>

            {overdue && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Overdue</span>
              </span>
            )}
          </div>

          {task.description && (
            <p
              className={`mt-0.5 line-clamp-1 text-xs ${
                isCompleted
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Unboxed Clean Metadata Row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {task.category && (
              <>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <span
                    className="h-2 w-2 rounded-xs"
                    style={{
                      backgroundColor: categoryObj?.color ?? '#64748B',
                    }}
                    aria-hidden="true"
                  />
                  <span>{task.category}</span>
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                  ·
                </span>
              </>
            )}

            <span
              className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                overdue
                  ? 'font-medium text-red-600 dark:text-red-400'
                  : dueToday
                    ? 'font-medium text-amber-600 dark:text-amber-400'
                    : ''
              }`}
            >
              <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{formatDueDateLabel(task.due_date, now)}</span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>

            <span className={`inline-flex items-center gap-1 font-medium ${priorityColorClass}`}>
              <Flag className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{formatPriorityLabel(task.priority)}</span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>

            <span className={`font-medium ${statusColorClass}`}>
              {formatStatusLabel(task.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Explicit Task Actions */}
      <div className="flex shrink-0 items-center justify-end gap-1 sm:opacity-85 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onViewDetails(task)}
          aria-label={`View details for "${task.title}"`}
          title="View details"
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Details</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          aria-label={
            isCompleted
              ? `Mark "${task.title}" as pending`
              : `Complete "${task.title}"`
          }
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {isCompleted ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Reopen</span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Complete</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          title="Edit task"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
          title="Delete task"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
