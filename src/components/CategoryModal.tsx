import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const COLOR_OPTIONS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Sky', value: '#0284C7' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Slate', value: '#475569' },
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => Promise<void>;
}

export function CategoryModal({
  isOpen,
  onClose,
  onCreate,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setColor(COLOR_OPTIONS[0].value);
    setError(null);
    setIsSubmitting(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name is required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate(trimmed, color);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111827]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2
            id="category-modal-title"
            className="font-display text-lg font-semibold text-slate-900 dark:text-white"
          >
            New Category
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close category modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
          <div>
            <label
              htmlFor="category-name-input"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              id="category-name-input"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., Marketing, Engineering, Errands"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {error && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Color Marker
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_OPTIONS.map((opt) => {
                const selected = color === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-label={`Select ${opt.label} color`}
                    aria-pressed={selected}
                    onClick={() => setColor(opt.value)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-transform ${
                      selected
                        ? 'scale-105 border-slate-900 ring-2 ring-indigo-500/40 dark:border-white'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: opt.value }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
