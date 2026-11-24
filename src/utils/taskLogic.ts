import type {
  Category,
  DashboardStatsData,
  NavCounts,
  SortDirection,
  SortField,
  Task,
  TaskFilterState,
  TaskFormValues,
  TaskPriority,
} from '../types/task';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function extractDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return toLocalDateKey(parsed);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return toLocalDateKey(dt);
}

export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'completed') return false;
  const dueKey = extractDateKey(task.due_date);
  if (!dueKey) return false;
  const todayKey = toLocalDateKey(now);
  return dueKey < todayKey;
}

export function isTaskDueToday(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'completed') return false;
  const dueKey = extractDateKey(task.due_date);
  if (!dueKey) return false;
  return dueKey === toLocalDateKey(now);
}

export function isTaskUpcoming(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'completed') return false;
  const dueKey = extractDateKey(task.due_date);
  if (!dueKey) return false;
  return dueKey > toLocalDateKey(now);
}

export function computeDashboardStats(
  tasks: Task[],
  now: Date = new Date()
): DashboardStatsData {
  let notStarted = 0;
  let inProgress = 0;
  let completed = 0;
  let overdue = 0;
  let dueToday = 0;

  for (const task of tasks) {
    if (task.status === 'completed') {
      completed += 1;
    } else {
      if (task.status === 'in_progress') {
        inProgress += 1;
      } else {
        notStarted += 1;
      }
      if (isTaskOverdue(task, now)) {
        overdue += 1;
      } else if (isTaskDueToday(task, now)) {
        dueToday += 1;
      }
    }
  }

  return {
    total: tasks.length,
    pending: notStarted + inProgress,
    notStarted,
    inProgress,
    completed,
    overdue,
    dueToday,
  };
}

export function computeNavCounts(
  tasks: Task[],
  categories: Category[],
  now: Date = new Date()
): NavCounts {
  let today = 0;
  let upcoming = 0;
  let completed = 0;
  let overdue = 0;
  const byCategory: Record<string, number> = {};

  for (const cat of categories) {
    byCategory[cat.name] = 0;
  }

  for (const task of tasks) {
    if (task.status === 'completed') {
      completed += 1;
    } else {
      if (isTaskOverdue(task, now)) overdue += 1;
      if (isTaskDueToday(task, now)) today += 1;
      if (isTaskUpcoming(task, now)) upcoming += 1;

      if (task.category) {
        byCategory[task.category] = (byCategory[task.category] ?? 0) + 1;
      }
    }
  }

  return {
    all: tasks.length,
    today,
    upcoming,
    completed,
    overdue,
    byCategory,
  };
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilterState,
  now: Date = new Date()
): Task[] {
  const searchLower = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    // Section filter
    switch (filters.section) {
      case 'today':
        if (!isTaskDueToday(task, now)) return false;
        break;
      case 'upcoming':
        if (!isTaskUpcoming(task, now)) return false;
        break;
      case 'completed':
        if (task.status !== 'completed') return false;
        break;
      case 'overdue':
        if (!isTaskOverdue(task, now)) return false;
        break;
      case 'category':
        if (
          filters.activeCategoryName &&
          task.category !== filters.activeCategoryName
        ) {
          return false;
        }
        break;
      case 'dashboard':
      case 'all':
      case 'settings':
      default:
        break;
    }

    // Search filter (title or description)
    if (searchLower) {
      const inTitle = task.title.toLowerCase().includes(searchLower);
      const inDescription = task.description.toLowerCase().includes(searchLower);
      const inCategory = (task.category ?? '').toLowerCase().includes(searchLower);
      if (!inTitle && !inDescription && !inCategory) return false;
    }

    // Explicit dropdown filters
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    if (filters.category !== 'all' && task.category !== filters.category) {
      return false;
    }

    return true;
  });
}

export function sortTasks(
  tasks: Task[],
  sortBy: SortField,
  sortDir: SortDirection = 'asc'
): Task[] {
  const directionMultiplier = sortDir === 'asc' ? 1 : -1;

  return [...tasks].sort((a, b) => {
    if (sortBy === 'due_date') {
      const aKey = extractDateKey(a.due_date);
      const bKey = extractDateKey(b.due_date);
      if (!aKey && !bKey) {
        return b.created_at.localeCompare(a.created_at);
      }
      if (!aKey) return 1; // Null due dates always sort to bottom
      if (!bKey) return -1;
      if (aKey !== bKey) {
        return aKey.localeCompare(bKey) * directionMultiplier;
      }
      return (PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
    }

    if (sortBy === 'priority') {
      const diff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (diff !== 0) {
        return diff * directionMultiplier;
      }
      const aKey = extractDateKey(a.due_date);
      const bKey = extractDateKey(b.due_date);
      if (aKey && bKey) return aKey.localeCompare(bKey);
      if (aKey) return -1;
      if (bKey) return 1;
      return 0;
    }

    if (sortBy === 'title') {
      return a.title.localeCompare(b.title) * directionMultiplier;
    }

    // created_at
    return a.created_at.localeCompare(b.created_at) * directionMultiplier;
  });
}

export interface TaskValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    due_date?: string;
  };
}

export function validateTaskInput(values: TaskFormValues): TaskValidationResult {
  const errors: TaskValidationResult['errors'] = {};
  const trimmedTitle = values.title.trim();

  if (!trimmedTitle) {
    errors.title = 'Task title is required.';
  } else if (trimmedTitle.length > 160) {
    errors.title = 'Task title must be 160 characters or fewer.';
  }

  if (values.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(values.due_date.trim())) {
    errors.due_date = 'Please choose a valid due date.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatHeaderDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(now);
}

export function formatDueDateLabel(
  value: string | null | undefined,
  now: Date = new Date()
): string {
  const key = extractDateKey(value);
  if (!key) return 'No due date';

  const todayKey = toLocalDateKey(now);
  const tomorrowKey = addDaysToDateKey(todayKey, 1);
  const yesterdayKey = addDaysToDateKey(todayKey, -1);

  if (key === todayKey) return 'Today';
  if (key === tomorrowKey) return 'Tomorrow';
  if (key === yesterdayKey) return 'Yesterday';

  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: dt.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(dt);
}

export function formatDateTimeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function formatStatusLabel(status: Task['status']): string {
  if (status === 'in_progress') return 'In Progress';
  if (status === 'completed') return 'Completed';
  return 'Pending';
}

export function formatPriorityLabel(priority: Task['priority']): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
