import { CheckSquare, Plus, RotateCcw } from 'lucide-react';
import type { Category, Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  hasActiveFilters: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onToggleComplete: (task: Task) => void;
  onViewDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddTask: () => void;
  onResetFilters: () => void;
}

export function TaskList({
  tasks,
  categories,
  loading,
  hasActiveFilters,
  emptyTitle = 'No tasks to display',
  emptyDescription = 'Create a new task to get started organizing your day.',
  onToggleComplete,
  onViewDetails,
  onEdit,
  onDelete,
  onAddTask,
  onResetFilters,
}: TaskListProps) {
  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading tasks"
        className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-[#111827]"
      >
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex flex-1 items-start gap-3.5">
              <div className="mt-0.5 h-5 w-5 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-80 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
              </div>
            </div>
            <div className="h-7 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-[#111827]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <CheckSquare className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">
          {emptyTitle}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {emptyDescription}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Clear Filters</span>
            </button>
          )}
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="task-list"
      className="divide-y divide-slate-200/80 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-[#111827]"
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          categories={categories}
          onToggleComplete={onToggleComplete}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
