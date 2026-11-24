import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type {
  Category,
  Task,
  TaskFormValues,
  TaskPriority,
  TaskStatus,
} from '../types/task';
import { extractDateKey, validateTaskInput } from '../utils/taskLogic';

interface TaskFormProps {
  isOpen: boolean;
  editingTask: Task | null;
  categories: Category[];
  defaultCategory?: string | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues, taskId?: string) => Promise<void>;
}

export function TaskForm({
  isOpen,
  editingTask,
  categories,
  defaultCategory,
  onClose,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<{ title?: string; due_date?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? '');
      setDueDate(extractDateKey(editingTask.due_date) ?? '');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setCategory(editingTask.category ?? '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setStatus('pending');
      setCategory(defaultCategory ?? '');
    }
    setErrors({});
    setIsSubmitting(false);
  }, [isOpen, editingTask, defaultCategory]);

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

    const values: TaskFormValues = {
      title,
      description,
      due_date: dueDate,
      priority,
      status,
      category,
    };

    const validation = validateTaskInput(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(values, editingTask?.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500';

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
        aria-labelledby="task-form-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111827]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2
            id="task-form-title"
            className="font-display text-lg font-semibold text-slate-900 dark:text-white"
          >
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close task form"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
          {/* Title */}
          <div>
            <label
              htmlFor="task-title-input"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Finalize quarterly roadmap"
              className={`${inputClass} ${
                errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {errors.title && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description-input"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>
            <textarea
              id="task-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add helpful context, links, or next steps..."
              className={inputClass}
            />
          </div>

          {/* Due Date & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-due-date-input"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Due Date
              </label>
              <input
                id="task-due-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
              {errors.due_date && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.due_date}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="task-category-select"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Category
              </label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-priority-select"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="task-status-select"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={inputClass}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {isSubmitting
                ? 'Saving...'
                : editingTask
                  ? 'Save Changes'
                  : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
