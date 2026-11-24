export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type NavSection =
  | 'dashboard'
  | 'all'
  | 'today'
  | 'upcoming'
  | 'completed'
  | 'overdue'
  | 'category'
  | 'settings';

export type SortField = 'due_date' | 'priority' | 'created_at' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface TaskFilterState {
  search: string;
  priority: TaskPriority | 'all';
  status: TaskStatus | 'all';
  category: string | 'all';
  section: NavSection;
  activeCategoryName: string | null;
}

export interface DashboardStatsData {
  total: number;
  pending: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueToday: number;
}

export interface NavCounts {
  all: number;
  today: number;
  upcoming: number;
  completed: number;
  overdue: number;
  byCategory: Record<string, number>;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export type ThemeMode = 'light' | 'dark';
