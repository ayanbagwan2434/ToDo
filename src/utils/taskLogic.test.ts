import test from 'node:test';
import assert from 'node:assert/strict';
import type { Category, Task, TaskFilterState } from '../types/task';
import {
  computeDashboardStats,
  computeNavCounts,
  filterTasks,
  formatDueDateLabel,
  getGreeting,
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
  sortTasks,
  validateTaskInput,
} from './taskLogic';

const NOW = new Date(2026, 10, 23, 10, 30, 0); // Nov 23, 2026

const SAMPLE_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Work', color: '#4F46E5' },
  { id: 'c2', name: 'Personal', color: '#059669' },
];

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Submit quarterly budget',
    description: 'Send revised spreadsheets to finance',
    due_date: '2026-11-21', // Overdue
    priority: 'high',
    status: 'pending',
    category: 'Work',
    created_at: '2026-11-19T09:00:00.000Z',
    updated_at: '2026-11-19T09:00:00.000Z',
  },
  {
    id: '2',
    title: 'Design system review',
    description: 'Audit spacing tokens and typography',
    due_date: '2026-11-23', // Today
    priority: 'medium',
    status: 'in_progress',
    category: 'Work',
    created_at: '2026-11-20T09:00:00.000Z',
    updated_at: '2026-11-22T09:00:00.000Z',
  },
  {
    id: '3',
    title: 'Book dentist appointment',
    description: 'Routine checkup next month',
    due_date: '2026-11-26', // Upcoming
    priority: 'low',
    status: 'pending',
    category: 'Personal',
    created_at: '2026-11-21T09:00:00.000Z',
    updated_at: '2026-11-21T09:00:00.000Z',
  },
  {
    id: '4',
    title: 'Ship onboarding email flow',
    description: 'Verified copy and links',
    due_date: '2026-11-20', // Past date, but completed -> NOT overdue
    priority: 'high',
    status: 'completed',
    category: 'Work',
    created_at: '2026-11-18T09:00:00.000Z',
    updated_at: '2026-11-20T17:00:00.000Z',
  },
  {
    id: '5',
    title: 'Read architecture RFC',
    description: 'No due date set',
    due_date: null,
    priority: 'medium',
    status: 'pending',
    category: null,
    created_at: '2026-11-22T09:00:00.000Z',
    updated_at: '2026-11-22T09:00:00.000Z',
  },
];

test('overdue, today, and upcoming date checks respect completion status', () => {
  assert.equal(isTaskOverdue(SAMPLE_TASKS[0], NOW), true);
  assert.equal(isTaskOverdue(SAMPLE_TASKS[1], NOW), false);
  assert.equal(isTaskOverdue(SAMPLE_TASKS[3], NOW), false); // completed
  assert.equal(isTaskDueToday(SAMPLE_TASKS[1], NOW), true);
  assert.equal(isTaskUpcoming(SAMPLE_TASKS[2], NOW), true);
  assert.equal(isTaskUpcoming(SAMPLE_TASKS[4], NOW), false);
});

test('computeDashboardStats dynamically calculates totals and breakdowns', () => {
  const stats = computeDashboardStats(SAMPLE_TASKS, NOW);
  assert.deepEqual(stats, {
    total: 5,
    pending: 4,
    notStarted: 3,
    inProgress: 1,
    completed: 1,
    overdue: 1,
    dueToday: 1,
  });
});

test('computeNavCounts counts active tasks per category and section', () => {
  const counts = computeNavCounts(SAMPLE_TASKS, SAMPLE_CATEGORIES, NOW);
  assert.equal(counts.all, 5);
  assert.equal(counts.today, 1);
  assert.equal(counts.upcoming, 1);
  assert.equal(counts.completed, 1);
  assert.equal(counts.overdue, 1);
  assert.equal(counts.byCategory['Work'], 2); // 2 incomplete Work tasks
  assert.equal(counts.byCategory['Personal'], 1);
});

test('filterTasks filters by section, search text, priority, status, and category', () => {
  const base: TaskFilterState = {
    search: '',
    priority: 'all',
    status: 'all',
    category: 'all',
    section: 'all',
    activeCategoryName: null,
  };

  assert.equal(filterTasks(SAMPLE_TASKS, { ...base, section: 'today' }, NOW).length, 1);
  assert.equal(filterTasks(SAMPLE_TASKS, { ...base, section: 'overdue' }, NOW).length, 1);
  assert.equal(filterTasks(SAMPLE_TASKS, { ...base, section: 'completed' }, NOW).length, 1);
  assert.equal(
    filterTasks(SAMPLE_TASKS, { ...base, search: 'finance' }, NOW).map((t) => t.id).join(','),
    '1'
  );
  assert.equal(
    filterTasks(SAMPLE_TASKS, { ...base, priority: 'high', status: 'pending' }, NOW)
      .map((t) => t.id)
      .join(','),
    '1'
  );
  assert.equal(
    filterTasks(
      SAMPLE_TASKS,
      { ...base, section: 'category', activeCategoryName: 'Personal' },
      NOW
    ).length,
    1
  );
});

test('sortTasks sorts by due_date (nulls last) and by priority', () => {
  const byDueAsc = sortTasks(SAMPLE_TASKS, 'due_date', 'asc').map((t) => t.id);
  assert.deepEqual(byDueAsc, ['4', '1', '2', '3', '5']);

  const byPriorityDesc = sortTasks(SAMPLE_TASKS, 'priority', 'desc').map((t) => t.priority);
  assert.deepEqual(byPriorityDesc, ['high', 'high', 'medium', 'medium', 'low']);
});

test('validateTaskInput rejects blank titles and invalid dates', () => {
  const emptyResult = validateTaskInput({
    title: '   ',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    category: '',
  });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.title);

  const validResult = validateTaskInput({
    title: 'Review PR #42',
    description: 'Check edge cases',
    due_date: '2026-11-24',
    priority: 'high',
    status: 'pending',
    category: 'Work',
  });
  assert.equal(validResult.valid, true);
});

test('formatting helpers return accurate greeting and due date labels', () => {
  assert.equal(getGreeting(new Date(2026, 10, 23, 9, 0)), 'Good morning');
  assert.equal(getGreeting(new Date(2026, 10, 23, 14, 0)), 'Good afternoon');
  assert.equal(getGreeting(new Date(2026, 10, 23, 20, 0)), 'Good evening');
  assert.equal(formatDueDateLabel('2026-11-23', NOW), 'Today');
  assert.equal(formatDueDateLabel('2026-11-24', NOW), 'Tomorrow');
  assert.equal(formatDueDateLabel('2026-11-22', NOW), 'Yesterday');
  assert.equal(formatDueDateLabel(null, NOW), 'No due date');
});
