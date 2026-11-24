import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  Category,
  Task,
  TaskFormValues,
  ThemeMode,
  UserProfile,
} from '../types/task';
import { addDaysToDateKey, toLocalDateKey } from '../utils/taskLogic';

const TASKS_KEY = 'taskflow_tasks_v1';
const CATEGORIES_KEY = 'taskflow_categories_v1';
const THEME_KEY = 'taskflow_theme_v1';
const PROFILE_KEY = 'taskflow_profile_v1';

export const DEFAULT_AVATAR_URL =
  '/src/assets/images/avatar_taskflow_user_1795506503089.jpg';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  name: 'Elena Vance',
  email: 'elena@taskflow.app',
  role: 'Product Lead',
  avatarUrl: DEFAULT_AVATAR_URL,
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work', color: '#4F46E5' },
  { id: 'cat-design', name: 'Design', color: '#0284C7' },
  { id: 'cat-personal', name: 'Personal', color: '#059669' },
  { id: 'cat-health', name: 'Health', color: '#D97706' },
];

export function createSeedTasks(now: Date = new Date()): Task[] {
  const todayKey = toLocalDateKey(now);
  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const tomorrowKey = addDaysToDateKey(todayKey, 1);
  const nextWeekKey = addDaysToDateKey(todayKey, 4);
  const twoDaysAgoIso = new Date(now.getTime() - 2 * 86400000).toISOString();
  const yesterdayIso = new Date(now.getTime() - 86400000).toISOString();

  return [
    {
      id: 'seed-1',
      title: 'Finalize Q4 product roadmap brief',
      description:
        'Align engineering milestones with customer discovery insights before Friday leadership sync.',
      due_date: todayKey,
      priority: 'high',
      status: 'in_progress',
      category: 'Work',
      created_at: twoDaysAgoIso,
      updated_at: yesterdayIso,
    },
    {
      id: 'seed-2',
      title: 'Submit vendor security questionnaire',
      description:
        'Complete SOC 2 compliance checklist and attach updated data retention policy.',
      due_date: yesterdayKey,
      priority: 'high',
      status: 'pending',
      category: 'Work',
      created_at: twoDaysAgoIso,
      updated_at: twoDaysAgoIso,
    },
    {
      id: 'seed-3',
      title: 'Refine mobile navigation drawer spacing',
      description:
        'Ensure 44px touch targets across all sidebar items and verify dark mode contrast.',
      due_date: todayKey,
      priority: 'medium',
      status: 'pending',
      category: 'Design',
      created_at: yesterdayIso,
      updated_at: yesterdayIso,
    },
    {
      id: 'seed-4',
      title: 'Schedule annual dental checkup',
      description: 'Call Westside Dental Clinic for an early morning slot.',
      due_date: tomorrowKey,
      priority: 'low',
      status: 'pending',
      category: 'Health',
      created_at: yesterdayIso,
      updated_at: yesterdayIso,
    },
    {
      id: 'seed-5',
      title: 'Plan weekend coastal hike & grocery list',
      description: 'Check trail conditions and pack hydration gear.',
      due_date: nextWeekKey,
      priority: 'low',
      status: 'pending',
      category: 'Personal',
      created_at: yesterdayIso,
      updated_at: yesterdayIso,
    },
    {
      id: 'seed-6',
      title: 'Audit onboarding email sequence copy',
      description: 'Updated welcome CTA and verified tracking links across templates.',
      due_date: yesterdayKey,
      priority: 'medium',
      status: 'completed',
      category: 'Work',
      created_at: twoDaysAgoIso,
      updated_at: yesterdayIso,
    },
  ];
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// LocalStorage operations
export function loadLocalTasks(): Task[] {
  const raw = localStorage.getItem(TASKS_KEY);
  if (raw === null) {
    const seeded = createSeedTasks();
    localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return safeJsonParse<Task[]>(raw, []);
}

export function saveLocalTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadLocalCategories(): Category[] {
  const raw = localStorage.getItem(CATEGORIES_KEY);
  if (raw === null) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return safeJsonParse<Category[]>(raw, DEFAULT_CATEGORIES);
}

export function saveLocalCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function loadTheme(): ThemeMode {
  const raw = localStorage.getItem(THEME_KEY);
  if (raw === 'dark' || raw === 'light') return raw;
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

export function saveTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadLocalProfile(): UserProfile {
  const raw = localStorage.getItem(PROFILE_KEY);
  const parsed = safeJsonParse<Partial<UserProfile>>(raw, {});
  return {
    ...DEFAULT_PROFILE,
    ...parsed,
    avatarUrl: parsed.avatarUrl || DEFAULT_AVATAR_URL,
  };
}

export function saveLocalProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function resetLocalDemoData(): { tasks: Task[]; categories: Category[] } {
  const tasks = createSeedTasks();
  const categories = [...DEFAULT_CATEGORIES];
  saveLocalTasks(tasks);
  saveLocalCategories(categories);
  return { tasks, categories };
}

// Unified Persistence API (Supabase when configured & authenticated, otherwise localStorage)
export async function fetchTasks(userId?: string): Promise<Task[]> {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      ...row,
      due_date: row.due_date ? String(row.due_date).slice(0, 10) : null,
      description: row.description ?? '',
    }));
  }
  return loadLocalTasks();
}

export async function createTaskRecord(
  values: TaskFormValues,
  currentTasks: Task[],
  userId?: string
): Promise<{ task: Task; tasks: Task[] }> {
  const nowIso = new Date().toISOString();
  const trimmedTitle = values.title.trim();
  const normalizedCategory = values.category.trim() || null;
  const normalizedDueDate = values.due_date.trim() || null;

  if (isSupabaseConfigured && supabase && userId) {
    const payload = {
      user_id: userId,
      title: trimmedTitle,
      description: values.description.trim(),
      due_date: normalizedDueDate ? `${normalizedDueDate}T12:00:00.000Z` : null,
      priority: values.priority,
      status: values.status,
      category: normalizedCategory,
    };
    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const created: Task = {
      ...data,
      due_date: data.due_date ? String(data.due_date).slice(0, 10) : null,
      description: data.description ?? '',
    };
    return { task: created, tasks: [created, ...currentTasks] };
  }

  const created: Task = {
    id: generateId(),
    title: trimmedTitle,
    description: values.description.trim(),
    due_date: normalizedDueDate,
    priority: values.priority,
    status: values.status,
    category: normalizedCategory,
    created_at: nowIso,
    updated_at: nowIso,
  };
  const nextTasks = [created, ...currentTasks];
  saveLocalTasks(nextTasks);
  return { task: created, tasks: nextTasks };
}

export async function updateTaskRecord(
  taskId: string,
  updates: Partial<TaskFormValues>,
  currentTasks: Task[],
  userId?: string
): Promise<{ task: Task; tasks: Task[] }> {
  const nowIso = new Date().toISOString();
  const existing = currentTasks.find((t) => t.id === taskId);
  if (!existing) throw new Error('Task not found.');

  const merged: Task = {
    ...existing,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    description:
      updates.description !== undefined
        ? updates.description.trim()
        : existing.description,
    due_date:
      updates.due_date !== undefined
        ? updates.due_date.trim() || null
        : existing.due_date,
    priority: updates.priority ?? existing.priority,
    status: updates.status ?? existing.status,
    category:
      updates.category !== undefined
        ? updates.category.trim() || null
        : existing.category,
    updated_at: nowIso,
  };

  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: merged.title,
        description: merged.description,
        due_date: merged.due_date ? `${merged.due_date}T12:00:00.000Z` : null,
        priority: merged.priority,
        status: merged.status,
        category: merged.category,
        updated_at: nowIso,
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const updated: Task = {
      ...data,
      due_date: data.due_date ? String(data.due_date).slice(0, 10) : null,
      description: data.description ?? '',
    };
    const nextTasks = currentTasks.map((t) => (t.id === taskId ? updated : t));
    return { task: updated, tasks: nextTasks };
  }

  const nextTasks = currentTasks.map((t) => (t.id === taskId ? merged : t));
  saveLocalTasks(nextTasks);
  return { task: merged, tasks: nextTasks };
}

export async function deleteTaskRecord(
  taskId: string,
  currentTasks: Task[],
  userId?: string
): Promise<Task[]> {
  if (isSupabaseConfigured && supabase && userId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return currentTasks.filter((t) => t.id !== taskId);
  }

  const nextTasks = currentTasks.filter((t) => t.id !== taskId);
  saveLocalTasks(nextTasks);
  return nextTasks;
}

export async function clearCompletedTaskRecords(
  currentTasks: Task[],
  userId?: string
): Promise<Task[]> {
  if (isSupabaseConfigured && supabase && userId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'completed');
    if (error) throw new Error(error.message);
    return currentTasks.filter((t) => t.status !== 'completed');
  }

  const nextTasks = currentTasks.filter((t) => t.status !== 'completed');
  saveLocalTasks(nextTasks);
  return nextTasks;
}

export async function fetchCategories(userId?: string): Promise<Category[]> {
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, color')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    if (data && data.length > 0) return data;
    return DEFAULT_CATEGORIES;
  }
  return loadLocalCategories();
}

export async function createCategoryRecord(
  name: string,
  color: string,
  currentCategories: Category[],
  userId?: string
): Promise<Category[]> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Category name is required.');
  if (
    currentCategories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    throw new Error(`Category "${trimmed}" already exists.`);
  }

  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name: trimmed, color })
      .select('id, name, color')
      .single();
    if (error) throw new Error(error.message);
    return [...currentCategories, data];
  }

  const created: Category = { id: generateId(), name: trimmed, color };
  const next = [...currentCategories, created];
  saveLocalCategories(next);
  return next;
}

export async function deleteCategoryRecord(
  categoryId: string,
  categoryName: string,
  currentCategories: Category[],
  currentTasks: Task[],
  userId?: string
): Promise<{ categories: Category[]; tasks: Task[] }> {
  if (isSupabaseConfigured && supabase && userId) {
    const { error: catErr } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);
    if (catErr) throw new Error(catErr.message);

    await supabase
      .from('tasks')
      .update({ category: null })
      .eq('user_id', userId)
      .eq('category', categoryName);

    return {
      categories: currentCategories.filter((c) => c.id !== categoryId),
      tasks: currentTasks.map((t) =>
        t.category === categoryName ? { ...t, category: null } : t
      ),
    };
  }

  const nextCategories = currentCategories.filter((c) => c.id !== categoryId);
  const nextTasks = currentTasks.map((t) =>
    t.category === categoryName ? { ...t, category: null } : t
  );
  saveLocalCategories(nextCategories);
  saveLocalTasks(nextTasks);
  return { categories: nextCategories, tasks: nextTasks };
}
