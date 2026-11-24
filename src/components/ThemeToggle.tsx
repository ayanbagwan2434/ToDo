import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../types/task';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  showLabel?: boolean;
}

export function ThemeToggle({
  theme,
  onToggle,
  showLabel = false,
}: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white whitespace-nowrap shrink-0"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
      )}
      {showLabel && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
    </button>
  );
}
