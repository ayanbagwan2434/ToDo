import { useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Flag,
  Folder,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import type { Category, Task } from '../types/task';
import {
  formatDateTimeLabel,
  formatDueDateLabel,
  formatPriorityLabel,
  formatStatusLabel,
  isTaskOverdue,
} from '../utils/taskLogic';

interface TaskDetailsModalProps {
  task: Task | null;
  categories: Category[];
  onClose: () => void;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskDetailsModal({
  task,
  categories,
  onClose,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskDetailsModalProps) {
  useEffect(() => {
    if (!task) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [task, onClose]);

  if (!task) return null;

  const now = new Date();
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task, now);
  const categoryObj = categories.find((c) => c.name === task.category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111827]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="min-w-0 flex-1">
            {overdue && (
              <div className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Overdue Task</span>
              </div>
            )}
            <h2
              id="task-details-title"
              className={`font-display text-lg font-semibold ${
                isCompleted
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500">
              Description
            </h3>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {task.description || 'No description provided.'}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Status</span>
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {formatStatusLabel(task.status)}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Priority</span>
              </dt>
              <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {formatPriorityLabel(task.priority)}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Due Date</span>
              </dt>
              <dd
                className={`mt-1 font-mono text-sm tabular-nums ${
                  overdue
                    ? 'font-semibold text-red-600 dark:text-red-400'
                    : 'font-medium text-slate-900 dark:text-slate-100'
                }`}
              >
                {formatDueDateLabel(task.due_date, now)}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Folder className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Category</span>
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                {task.category ? (
                  <>
                    <span
                      className="h-2.5 w-2.5 rounded-xs"
                      style={{
                        backgroundColor: categoryObj?.color ?? '#64748B',
                      }}
                      aria-hidden="true"
                    />
                    <span>{task.category}</span>
                  </>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">None</span>
                )}
              </dd>
            </div>
          </dl>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <div>
              <span>Created</span>
              <p className="mt-0.5 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {formatDateTimeLabel(task.created_at)}
              </p>
            </div>
            <div>
              <span>Last Updated</span>
              <p className="mt-0.5 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {formatDateTimeLabel(task.updated_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(task);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mark Pending</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span>Mark Completed</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
