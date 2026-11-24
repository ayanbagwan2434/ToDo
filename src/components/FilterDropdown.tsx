import { ArrowDownUp, RotateCcw, Trash2 } from 'lucide-react';
import type {
  Category,
  SortDirection,
  SortField,
  TaskPriority,
  TaskStatus,
} from '../types/task';

interface FilterDropdownProps {
  priority: TaskPriority | 'all';
  status: TaskStatus | 'all';
  category: string | 'all';
  categories: Category[];
  sortBy: SortField;
  sortDir: SortDirection;
  completedCount: number;
  hasActiveFilters: boolean;
  hideCategoryFilter?: boolean;
  onPriorityChange: (val: TaskPriority | 'all') => void;
  onStatusChange: (val: TaskStatus | 'all') => void;
  onCategoryChange: (val: string | 'all') => void;
  onSortByChange: (val: SortField) => void;
  onToggleSortDir: () => void;
  onResetFilters: () => void;
  onClearCompleted: () => void;
}

export function FilterDropdown({
  priority,
  status,
  category,
  categories,
  sortBy,
  sortDir,
  completedCount,
  hasActiveFilters,
  hideCategoryFilter = false,
  onPriorityChange,
  onStatusChange,
  onCategoryChange,
  onSortByChange,
  onToggleSortDir,
  onResetFilters,
  onClearCompleted,
}: FilterDropdownProps) {
  const selectClass =
    'h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-priority" className="sr-only">
            Filter by priority
          </label>
          <select
            id="filter-priority"
            aria-label="Filter by priority"
            value={priority}
            onChange={(e) =>
              onPriorityChange(e.target.value as TaskPriority | 'all')
            }
            className={selectClass}
          >
            <option value="all">Priority: All</option>
            <option value="high">Priority: High</option>
            <option value="medium">Priority: Medium</option>
            <option value="low">Priority: Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="filter-status"
            aria-label="Filter by status"
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as TaskStatus | 'all')
            }
            className={selectClass}
          >
            <option value="all">Status: All</option>
            <option value="pending">Status: Pending</option>
            <option value="in_progress">Status: In Progress</option>
            <option value="completed">Status: Completed</option>
          </select>
        </div>

        {/* Category Filter */}
        {!hideCategoryFilter && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="filter-category"
              aria-label="Filter by category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={selectClass}
            >
              <option value="all">Category: All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  Category: {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Select & Direction */}
        <div className="flex items-center gap-1">
          <label htmlFor="sort-tasks" className="sr-only">
            Sort tasks by
          </label>
          <select
            id="sort-tasks"
            aria-label="Sort tasks by"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortField)}
            className={selectClass}
          >
            <option value="due_date">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="created_at">Sort: Created Date</option>
            <option value="title">Sort: Title</option>
          </select>
          <button
            type="button"
            onClick={onToggleSortDir}
            aria-label={`Sort direction: ${
              sortDir === 'asc' ? 'Ascending' : 'Descending'
            }. Click to toggle.`}
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <ArrowDownUp className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>{sortDir === 'asc' ? 'Asc' : 'Desc'}</span>
          </button>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {completedCount > 0 && (
        <button
          type="button"
          onClick={onClearCompleted}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400 whitespace-nowrap shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Clear Completed ({completedCount})</span>
        </button>
      )}
    </div>
  );
}
