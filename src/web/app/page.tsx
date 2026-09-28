import { getTasks, createTask, toggleTask, deleteTask } from './actions';
import Link from 'next/link';

function isOverdue(task: { completed: boolean; due_date: string | null }): boolean {
  if (task.completed || !task.due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date + 'T00:00:00Z');
  return dueDate < today;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function Home() {
  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            To-Do List
          </h1>
          <Link
            href="/counter"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
          >
            Counter →
          </Link>
        </div>

        {/* Add task form */}
        <form action={createTask} className="flex flex-col gap-2 mb-8">
          <div className="flex gap-2">
            <input
              name="title"
              type="text"
              required
              placeholder="Add a new task..."
              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Add
            </button>
          </div>
          <input
            name="due_date"
            type="date"
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </form>

        {/* Task list */}
        <ul className="space-y-2">
          {tasks.length === 0 && (
            <li className="text-zinc-400 text-center py-8">No tasks yet. Add one above!</li>
          )}
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                isOverdue(task)
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
              }`}
            >
              <form
                action={async () => {
                  'use server';
                  await toggleTask(task.id, !task.completed);
                }}
              >
                <button
                  type="submit"
                  className={`h-5 w-5 rounded border-2 flex-shrink-0 transition-colors ${
                    task.completed
                      ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50'
                      : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500'
                  }`}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && (
                    <svg viewBox="0 0 12 12" className="text-white dark:text-zinc-900 w-full h-full p-0.5">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>
              <div className="flex-1">
                <span
                  className={`block text-sm ${
                    task.completed
                      ? 'line-through text-zinc-400'
                      : 'text-zinc-800 dark:text-zinc-100'
                  }`}
                >
                  {task.title}
                </span>
                {task.due_date && (
                  <span
                    className={`block text-xs mt-1 ${
                      isOverdue(task)
                        ? 'text-red-600 dark:text-red-400 font-medium'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {isOverdue(task) ? '⚠ Overdue: ' : 'Due: '}
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
              <form
                action={async () => {
                  'use server';
                  await deleteTask(task.id);
                }}
              >
                <button
                  type="submit"
                  className="flex-shrink-0 rounded p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label={`Delete ${task.title}`}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M3 4h10M6.5 4V2.5h3V4M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </li>
          ))}
        </ul>

        {tasks.length > 0 && (
          <p className="mt-4 text-xs text-zinc-400 text-right">
            {tasks.filter((t) => t.completed).length} / {tasks.length} completed
          </p>
        )}
      </div>
    </div>
  );
}
