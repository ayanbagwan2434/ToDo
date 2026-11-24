import {
  CalendarClock,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import type { Category, NavCounts, NavSection } from '../types/task';

interface SidebarProps {
  activeSection: NavSection;
  activeCategoryName: string | null;
  categories: Category[];
  counts: NavCounts;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onSelectSection: (section: NavSection, categoryName?: string) => void;
  onOpenNewCategory: () => void;
}

export function Sidebar({
  activeSection,
  activeCategoryName,
  categories,
  counts,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onSelectSection,
  onOpenNewCategory,
}: SidebarProps) {
  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: typeof LayoutDashboard;
    count?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all', label: 'My Tasks', icon: ListTodo, count: counts.all },
    { id: 'today', label: 'Today', icon: CalendarDays, count: counts.today },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarClock, count: counts.upcoming },
    { id: 'completed', label: 'Completed', icon: CheckCheck, count: counts.completed },
  ];

  const handleNavClick = (section: NavSection, categoryName?: string) => {
    onSelectSection(section, categoryName);
    onCloseMobile();
  };

  const sidebarContent = (isMobile: boolean) => {
    const isCompact = !isMobile && collapsed;

    return (
      <div className="flex h-full flex-col bg-white dark:bg-[#0F1521] border-r border-slate-200 dark:border-slate-800">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            {!isCompact && (
              <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                TaskFlow
              </span>
            )}
          </button>

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCompact ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCompact ? 'Expand sidebar' : 'Collapse sidebar'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {isCompact ? (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCompact ? item.label : undefined}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                      aria-hidden="true"
                    />
                    {!isCompact && (
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    )}
                  </span>
                  {!isCompact && item.count !== undefined && (
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        isActive
                          ? 'font-semibold text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Categories Section */}
          <div>
            {!isCompact ? (
              <div className="mb-2 flex items-center justify-between px-3">
                <span className="text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500">
                  Categories
                </span>
                <button
                  type="button"
                  onClick={onOpenNewCategory}
                  aria-label="Create new category"
                  title="Create new category"
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="mb-2 flex justify-center">
                <button
                  type="button"
                  onClick={onOpenNewCategory}
                  aria-label="Create new category"
                  title="Create new category"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <FolderKanban className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="space-y-1">
              {categories.map((cat) => {
                const isActive =
                  activeSection === 'category' && activeCategoryName === cat.name;
                const catCount = counts.byCategory[cat.name] ?? 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleNavClick('category', cat.name)}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCompact ? `${cat.name} (${catCount})` : undefined}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: cat.color }}
                        aria-hidden="true"
                      />
                      {!isCompact && (
                        <span className="truncate whitespace-nowrap">{cat.name}</span>
                      )}
                    </span>
                    {!isCompact && (
                      <span className="font-mono text-xs tabular-nums text-slate-400 dark:text-slate-500">
                        {catCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom Settings Link */}
        <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            aria-current={activeSection === 'settings' ? 'page' : undefined}
            title={isCompact ? 'Settings' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeSection === 'settings'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCompact && <span className="whitespace-nowrap">Settings</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop collapsible sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-[252px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent(false)}</div>
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-50 h-full w-64 max-w-[80vw]">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
