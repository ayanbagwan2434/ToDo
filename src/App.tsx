import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { CategoryModal } from './components/CategoryModal';
import { DashboardStats } from './components/DashboardStats';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { FilterDropdown } from './components/FilterDropdown';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { SupabaseAuthGate } from './components/SupabaseAuthGate';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { ToastNotification } from './components/ToastNotification';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  clearCompletedTaskRecords,
  createCategoryRecord,
  createTaskRecord,
  deleteCategoryRecord,
  deleteTaskRecord,
  fetchCategories,
  fetchTasks,
  generateId,
  loadLocalProfile,
  loadTheme,
  resetLocalDemoData,
  saveLocalProfile,
  saveTheme,
  updateTaskRecord,
} from './services/taskStorage';
import type {
  Category,
  NavSection,
  SortDirection,
  SortField,
  Task,
  TaskFilterState,
  TaskFormValues,
  TaskPriority,
  TaskStatus,
  ThemeMode,
  ToastMessage,
  ToastType,
  UserProfile,
} from './types/task';
import {
  computeDashboardStats,
  computeNavCounts,
  filterTasks,
  formatHeaderDate,
  getGreeting,
  sortTasks,
} from './utils/taskLogic';

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: 'Workspace Overview',
  all: 'My Tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed Tasks',
  overdue: 'Overdue Tasks',
  category: 'Category',
  settings: 'Settings',
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured);

  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [profile, setProfile] = useState<UserProfile>(() => loadLocalProfile());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    priority: 'all',
    status: 'all',
    category: 'all',
    section: 'dashboard',
    activeCategoryName: null,
  });

  const [sortBy, setSortBy] = useState<SortField>('due_date');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  // Modals
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [clearCompletedOpen, setClearCompletedOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, type, title, description }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Supabase Auth listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const activeUserId = session?.user?.id;

  const loadWorkspaceData = useCallback(async () => {
    if (isSupabaseConfigured && !activeUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [loadedTasks, loadedCategories] = await Promise.all([
        fetchTasks(activeUserId),
        fetchCategories(activeUserId),
      ]);
      setTasks(loadedTasks);
      setCategories(loadedCategories);

      if (session?.user?.email) {
        setProfile((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email ?? prev.email,
        }));
      }
    } catch (err) {
      pushToast(
        'error',
        'Failed to load tasks',
        err instanceof Error ? err.message : 'Please try refreshing.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeUserId, session?.user?.email, session?.user?.id, pushToast]);

  useEffect(() => {
    if (authChecked) {
      loadWorkspaceData();
    }
  }, [authChecked, loadWorkspaceData]);

  // Keep open details modal synced when tasks change
  useEffect(() => {
    if (!detailsTask) return;
    const latest = tasks.find((t) => t.id === detailsTask.id) ?? null;
    setDetailsTask(latest);
  }, [tasks, detailsTask]);

  const stats = useMemo(() => computeDashboardStats(tasks), [tasks]);
  const navCounts = useMemo(
    () => computeNavCounts(tasks, categories),
    [tasks, categories]
  );

  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filters);
    return sortTasks(filtered, sortBy, sortDir);
  }, [tasks, filters, sortBy, sortDir]);

  const hasActiveFilters = Boolean(
    filters.search.trim() ||
      filters.priority !== 'all' ||
      filters.status !== 'all' ||
      filters.category !== 'all'
  );

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectSection = (section: NavSection, categoryName?: string) => {
    setFilters((prev) => ({
      ...prev,
      section,
      activeCategoryName: section === 'category' ? (categoryName ?? null) : null,
    }));
  };

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      priority: 'all',
      status: 'all',
      category: 'all',
    }));
  };

  const handleTaskSubmit = async (values: TaskFormValues, taskId?: string) => {
    try {
      if (taskId) {
        const { tasks: nextTasks } = await updateTaskRecord(
          taskId,
          values,
          tasks,
          activeUserId
        );
        setTasks(nextTasks);
        pushToast('success', 'Task updated', `"${values.title.trim()}" has been saved.`);
      } else {
        const { tasks: nextTasks } = await createTaskRecord(
          values,
          tasks,
          activeUserId
        );
        setTasks(nextTasks);
        pushToast('success', 'Task created', `"${values.title.trim()}" added to your list.`);
      }
    } catch (err) {
      pushToast(
        'error',
        taskId ? 'Could not update task' : 'Could not create task',
        err instanceof Error ? err.message : undefined
      );
      throw err;
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === 'completed' ? 'pending' : 'completed';
    try {
      const { tasks: nextTasks } = await updateTaskRecord(
        task.id,
        { status: nextStatus },
        tasks,
        activeUserId
      );
      setTasks(nextTasks);
      pushToast(
        'success',
        nextStatus === 'completed' ? 'Task completed' : 'Task reopened',
        task.title
      );
    } catch (err) {
      pushToast(
        'error',
        'Failed to update status',
        err instanceof Error ? err.message : undefined
      );
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!deletingTask || isMutating) return;
    setIsMutating(true);
    const title = deletingTask.title;
    try {
      const nextTasks = await deleteTaskRecord(
        deletingTask.id,
        tasks,
        activeUserId
      );
      setTasks(nextTasks);
      setDeletingTask(null);
      pushToast('success', 'Task deleted', `"${title}" was permanently removed.`);
    } catch (err) {
      pushToast(
        'error',
        'Could not delete task',
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setIsMutating(false);
    }
  };

  const handleConfirmClearCompleted = async () => {
    if (isMutating) return;
    setIsMutating(true);
    const count = stats.completed;
    try {
      const nextTasks = await clearCompletedTaskRecords(tasks, activeUserId);
      setTasks(nextTasks);
      setClearCompletedOpen(false);
      pushToast(
        'success',
        'Completed tasks cleared',
        `Removed ${count} completed ${count === 1 ? 'task' : 'tasks'}.`
      );
    } catch (err) {
      pushToast(
        'error',
        'Could not clear completed tasks',
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setIsMutating(false);
    }
  };

  const handleCreateCategory = async (name: string, color: string) => {
    const nextCategories = await createCategoryRecord(
      name,
      color,
      categories,
      activeUserId
    );
    setCategories(nextCategories);
    pushToast('success', 'Category created', `"${name}" is ready to use.`);
  };

  const handleDeleteCategory = async (cat: Category) => {
    try {
      const result = await deleteCategoryRecord(
        cat.id,
        cat.name,
        categories,
        tasks,
        activeUserId
      );
      setCategories(result.categories);
      setTasks(result.tasks);
      if (
        filters.section === 'category' &&
        filters.activeCategoryName === cat.name
      ) {
        handleSelectSection('all');
      }
      pushToast('success', 'Category removed', `"${cat.name}" was deleted.`);
    } catch (err) {
      pushToast(
        'error',
        'Could not remove category',
        err instanceof Error ? err.message : undefined
      );
    }
  };

  const handleUpdateProfile = (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    saveLocalProfile(nextProfile);
    pushToast('success', 'Profile updated', 'Your workspace settings were saved.');
  };

  const handleResetDemoData = () => {
    const reset = resetLocalDemoData();
    setTasks(reset.tasks);
    setCategories(reset.categories);
    pushToast('info', 'Sample tasks restored', 'Default workspace tasks are loaded.');
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
      setTasks([]);
    }
  };

  if (isSupabaseConfigured && authChecked && !session) {
    return (
      <>
        <SupabaseAuthGate onSuccess={loadWorkspaceData} />
        <ToastNotification toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const currentHeading =
    filters.section === 'category' && filters.activeCategoryName
      ? filters.activeCategoryName
      : SECTION_TITLES[filters.section];

  const getEmptyStateCopy = () => {
    if (hasActiveFilters) {
      return {
        title: 'No matching tasks found',
        description:
          'Try adjusting your search query or clearing your active priority, status, or category filters.',
      };
    }
    switch (filters.section) {
      case 'today':
        return {
          title: 'Nothing due today',
          description: 'Enjoy the breathing room or schedule a task for today.',
        };
      case 'upcoming':
        return {
          title: 'No upcoming tasks scheduled',
          description: 'Tasks with future due dates will appear here automatically.',
        };
      case 'completed':
        return {
          title: 'No completed tasks yet',
          description: 'Checked-off tasks appear here so you can track progress.',
        };
      case 'overdue':
        return {
          title: 'No overdue tasks',
          description: 'You are completely caught up on all past deadlines.',
        };
      case 'category':
        return {
          title: `No tasks in ${filters.activeCategoryName ?? 'this category'}`,
          description: 'Create a task in this category to organize your project.',
        };
      default:
        return {
          title: 'Your task list is empty',
          description: 'Click Add Task to create your first task and start tracking work.',
        };
    }
  };

  const emptyCopy = getEmptyStateCopy();

  return (
    <div className="flex min-h-screen bg-[#FAFAFB] text-slate-900 dark:bg-[#0B0F17] dark:text-slate-100">
      <Sidebar
        activeSection={filters.section}
        activeCategoryName={filters.activeCategoryName}
        categories={categories}
        counts={navCounts}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSelectSection={handleSelectSection}
        onOpenNewCategory={() => setCategoryModalOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          profile={profile}
          theme={theme}
          searchQuery={filters.search}
          tasks={tasks}
          isSupabaseAuth={Boolean(isSupabaseConfigured && session)}
          onSearchChange={(search) =>
            setFilters((prev) => ({ ...prev, search }))
          }
          onToggleTheme={handleToggleTheme}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onAddTask={() => {
            setEditingTask(null);
            setTaskFormOpen(true);
          }}
          onSelectTask={(task) => setDetailsTask(task)}
          onOpenSettings={() => handleSelectSection('settings')}
          onSignOut={handleSignOut}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="sm:hidden">
            <h1 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {getGreeting()}, {profile.name.trim().split(/\s+/)[0] || 'there'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatHeaderDate()}
            </p>
          </div>

          {filters.section === 'settings' ? (
            <SettingsView
              profile={profile}
              theme={theme}
              categories={categories}
              tasks={tasks}
              isSupabaseConfigured={isSupabaseConfigured}
              onUpdateProfile={handleUpdateProfile}
              onToggleTheme={handleToggleTheme}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              onResetDemoData={handleResetDemoData}
            />
          ) : (
            <>
              {/* Summary Statistics */}
              <DashboardStats
                stats={stats}
                activeSection={filters.section}
                onSelectSection={handleSelectSection}
              />

              {/* Section Header + Filter & Sort Controls */}
              <section aria-label={currentHeading} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                      {currentHeading}
                    </h2>
                    <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {visibleTasks.length}{' '}
                      {visibleTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                </div>

                <div className="md:hidden">
                  <SearchBar
                    inputId="mobile-task-search"
                    value={filters.search}
                    onChange={(search) =>
                      setFilters((prev) => ({ ...prev, search }))
                    }
                  />
                </div>

                <FilterDropdown
                  priority={filters.priority}
                  status={filters.status}
                  category={filters.category}
                  categories={categories}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  completedCount={stats.completed}
                  hasActiveFilters={hasActiveFilters}
                  hideCategoryFilter={filters.section === 'category'}
                  onPriorityChange={(priority: TaskPriority | 'all') =>
                    setFilters((prev) => ({ ...prev, priority }))
                  }
                  onStatusChange={(status: TaskStatus | 'all') =>
                    setFilters((prev) => ({ ...prev, status }))
                  }
                  onCategoryChange={(category: string | 'all') =>
                    setFilters((prev) => ({ ...prev, category }))
                  }
                  onSortByChange={setSortBy}
                  onToggleSortDir={() =>
                    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  onResetFilters={handleResetFilters}
                  onClearCompleted={() => setClearCompletedOpen(true)}
                />

                <TaskList
                  tasks={visibleTasks}
                  categories={categories}
                  loading={loading}
                  hasActiveFilters={hasActiveFilters}
                  emptyTitle={emptyCopy.title}
                  emptyDescription={emptyCopy.description}
                  onToggleComplete={handleToggleComplete}
                  onViewDetails={(task) => setDetailsTask(task)}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setTaskFormOpen(true);
                  }}
                  onDelete={(task) => setDeletingTask(task)}
                  onAddTask={() => {
                    setEditingTask(null);
                    setTaskFormOpen(true);
                  }}
                  onResetFilters={handleResetFilters}
                />
              </section>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <TaskForm
        isOpen={taskFormOpen}
        editingTask={editingTask}
        categories={categories}
        defaultCategory={
          filters.section === 'category' ? filters.activeCategoryName : null
        }
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
      />

      <TaskDetailsModal
        task={detailsTask}
        categories={categories}
        onClose={() => setDetailsTask(null)}
        onToggleComplete={handleToggleComplete}
        onEdit={(task) => {
          setEditingTask(task);
          setTaskFormOpen(true);
        }}
        onDelete={(task) => setDeletingTask(task)}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(deletingTask)}
        title="Delete Task"
        message={
          deletingTask
            ? `Are you sure you want to permanently delete "${deletingTask.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Task"
        isProcessing={isMutating}
        onCancel={() => setDeletingTask(null)}
        onConfirm={handleConfirmDeleteTask}
      />

      <DeleteConfirmationModal
        isOpen={clearCompletedOpen}
        title="Clear Completed Tasks"
        message={`Are you sure you want to permanently remove all ${stats.completed} completed ${
          stats.completed === 1 ? 'task' : 'tasks'
        }? This action cannot be undone.`}
        confirmLabel="Clear Completed"
        isProcessing={isMutating}
        onCancel={() => setClearCompletedOpen(false)}
        onConfirm={handleConfirmClearCompleted}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCreate={handleCreateCategory}
      />

      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
