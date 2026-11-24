import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  LogOut,
  Menu,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import type { Task, ThemeMode, UserProfile } from '../types/task';
import {
  formatDueDateLabel,
  formatHeaderDate,
  getGreeting,
  isTaskDueToday,
  isTaskOverdue,
} from '../utils/taskLogic';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  profile: UserProfile;
  theme: ThemeMode;
  searchQuery: string;
  tasks: Task[];
  isSupabaseAuth: boolean;
  onSearchChange: (q: string) => void;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onAddTask: () => void;
  onSelectTask: (task: Task) => void;
  onOpenSettings: () => void;
  onSignOut?: () => void;
}

export function Header({
  profile,
  theme,
  searchQuery,
  tasks,
  isSupabaseAuth,
  onSearchChange,
  onToggleTheme,
  onOpenMobileMenu,
  onAddTask,
  onSelectTask,
  onOpenSettings,
  onSignOut,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const greeting = getGreeting(now);
  const formattedDate = formatHeaderDate(now);
  const firstName = profile.name.trim().split(/\s+/)[0] || 'there';

  const overdueTasks = tasks.filter((t) => isTaskOverdue(t, now));
  const dueTodayTasks = tasks.filter((t) => isTaskDueToday(t, now));
  const alertTasks = [...overdueTasks, ...dueTodayTasks];

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const initials = profile.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#FAFAFB]/95 backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B0F17]/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Mobile menu button + Greeting & Date */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <span className="font-display block truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:hidden">
              TaskFlow
            </span>
            <h1 className="font-display hidden truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:block">
              {greeting}, {firstName}
            </h1>
            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Center/Right: Search (md+) + Controls + Primary Action */}
        <div className="flex shrink-0 items-center justify-end gap-2 md:flex-1 md:max-w-xl">
          <SearchBar
            inputId="header-task-search"
            value={searchQuery}
            onChange={onSearchChange}
            className="hidden min-w-0 flex-1 md:flex"
          />

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              aria-label={`Notifications (${alertTasks.length} actionable)`}
              aria-expanded={notifOpen}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {alertTasks.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 font-mono text-[10px] font-semibold tabular-nums text-white">
                  {alertTasks.length > 9 ? '9+' : alertTasks.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                role="region"
                aria-label="Task reminders"
                className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Reminders
                  </span>
                  <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    {alertTasks.length} active
                  </span>
                </div>

                {alertTasks.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    You have no overdue or due-today tasks.
                  </p>
                ) : (
                  <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                    {alertTasks.map((task) => {
                      const overdue = isTaskOverdue(task, now);
                      return (
                        <li key={task.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              onSelectTask(task);
                            }}
                            className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                          >
                            {overdue ? (
                              <AlertTriangle
                                className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                                aria-hidden="true"
                              />
                            ) : (
                              <CalendarClock
                                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                                aria-hidden="true"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                                {task.title}
                              </p>
                              <p
                                className={`mt-0.5 text-[11px] ${
                                  overdue
                                    ? 'font-medium text-red-600 dark:text-red-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {overdue ? 'Overdue' : 'Due Today'} ·{' '}
                                {formatDueDateLabel(task.due_date, now)}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              aria-label={`Account menu for ${profile.name}`}
              aria-expanded={profileOpen}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              {profile.avatarUrl && !avatarError ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="h-7 w-7 rounded-md object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {initials || <User className="h-3.5 w-3.5" aria-hidden="true" />}
                </span>
              )}
              <span className="hidden max-w-[110px] truncate text-xs font-medium text-slate-700 dark:text-slate-200 xl:inline">
                {profile.name}
              </span>
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {profile.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {profile.email}
                  </p>
                </div>
                <div className="mt-1 space-y-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      onOpenSettings();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    Workspace & Profile
                  </button>
                  {isSupabaseAuth && onSignOut && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        onSignOut();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary Add Task CTA */}
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F17] sm:px-4 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}
