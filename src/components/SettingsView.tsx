import { useState } from 'react';
import { Database, Download, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { Category, Task, ThemeMode, UserProfile } from '../types/task';
import { ThemeToggle } from './ThemeToggle';

interface SettingsViewProps {
  profile: UserProfile;
  theme: ThemeMode;
  categories: Category[];
  tasks: Task[];
  isSupabaseConfigured: boolean;
  onUpdateProfile: (profile: UserProfile) => void;
  onToggleTheme: () => void;
  onCreateCategory: (name: string, color: string) => Promise<void>;
  onDeleteCategory: (category: Category) => Promise<void>;
  onResetDemoData: () => void;
}

const SWATCH_COLORS = ['#4F46E5', '#0284C7', '#059669', '#D97706', '#E11D48', '#475569'];

export function SettingsView({
  profile,
  theme,
  categories,
  tasks,
  isSupabaseConfigured,
  onUpdateProfile,
  onToggleTheme,
  onCreateCategory,
  onDeleteCategory,
  onResetDemoData,
}: SettingsViewProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(SWATCH_COLORS[0]);
  const [catError, setCatError] = useState<string | null>(null);
  const [addingCat, setAddingCat] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdateProfile({
      ...profile,
      name: name.trim(),
      email: email.trim() || profile.email,
      role: role.trim() || profile.role,
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addingCat) return;
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCatError('Please enter a category name.');
      return;
    }
    setCatError(null);
    setAddingCat(true);
    try {
      await onCreateCategory(trimmed, newCategoryColor);
      setNewCategoryName('');
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Unable to add category.');
    } finally {
      setAddingCat(false);
    }
  };

  const handleExportTasks = () => {
    const blob = new Blob([JSON.stringify({ tasks, categories }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
          Workspace Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your profile, categories, theme preference, and workspace storage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111827]">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Profile Details
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Personalize your greeting and workspace identity.
          </p>

          <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="profile-name"
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="profile-role"
                  className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Role
                </label>
                <input
                  id="profile-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Save Profile
              </button>
            </div>
          </form>
        </section>

        {/* Appearance & Storage */}
        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111827]">
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Appearance & Data
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Switch themes or export and manage your local task records.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Color Theme
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently using {theme === 'dark' ? 'Dark' : 'Light'} mode
                </p>
              </div>
              <ThemeToggle theme={theme} onToggle={onToggleTheme} showLabel />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
              <Database className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Storage Backend:{' '}
                  {isSupabaseConfigured ? 'Supabase Cloud' : 'Browser LocalStorage'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {isSupabaseConfigured
                    ? 'Tasks and categories sync directly to your authenticated Supabase account with RLS enabled.'
                    : 'All tasks, categories, and settings persist automatically in localStorage across page reloads.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleExportTasks}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export JSON</span>
            </button>

            {!isSupabaseConfigured && (
              <button
                type="button"
                onClick={onResetDemoData}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Restore Sample Tasks</span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Category Management */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Categories & Projects
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create and organize categories used across your sidebar and task filters.
            </p>
          </div>

          <form onSubmit={handleAddCategory} className="flex flex-wrap items-center gap-2">
            <label htmlFor="settings-new-category" className="sr-only">
              New category name
            </label>
            <input
              id="settings-new-category"
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (catError) setCatError(null);
              }}
              placeholder="New category name..."
              className="h-9 w-48 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <div className="flex items-center gap-1">
              {SWATCH_COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Color ${swatch}`}
                  aria-pressed={newCategoryColor === swatch}
                  onClick={() => setNewCategoryColor(swatch)}
                  className={`h-6 w-6 rounded-md border ${
                    newCategoryColor === swatch
                      ? 'border-slate-900 ring-2 ring-indigo-500/40 dark:border-white'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={addingCat}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Category</span>
            </button>
          </form>
        </div>

        {catError && (
          <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
            {catError}
          </p>
        )}

        <div className="mt-5 divide-y divide-slate-200/80 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {categories.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              No categories created yet.
            </p>
          ) : (
            categories.map((cat) => {
              const count = tasks.filter((t) => t.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-xs"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-slate-400 dark:text-slate-500">
                      {count} {count === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat)}
                    aria-label={`Delete category "${cat.name}"`}
                    className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Remove</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
