import Link from 'next/link';
import {
  getCounters,
  createCounter,
  stepCounter,
  resetCounter,
  deleteCounter,
} from '../actions';

export default async function CountersPage() {
  const counters = await getCounters();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Counters
        </h1>
        <Link
          href="/"
          className="inline-block mb-8 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          ← Back to to-do list
        </Link>

        {/* Add counter form */}
        <form action={createCounter} className="flex gap-2 mb-8">
          <input
            name="name"
            type="text"
            required
            placeholder="New counter name..."
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Counter list */}
        <ul className="space-y-2">
          {counters.length === 0 && (
            <li className="text-zinc-400 text-center py-8">
              No counters yet. Add one above!
            </li>
          )}
          {counters.map((counter) => (
            <li
              key={counter.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
            >
              <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-100">
                {counter.name}
              </span>

              <form
                action={async () => {
                  'use server';
                  await stepCounter(counter.id, -1);
                }}
              >
                <button
                  type="submit"
                  aria-label={`Decrement ${counter.name}`}
                  className="h-8 w-8 rounded-lg border border-zinc-300 dark:border-zinc-600 text-lg leading-none text-zinc-700 dark:text-zinc-200 hover:border-zinc-500 transition-colors"
                >
                  −
                </button>
              </form>

              <span className="w-12 text-center font-mono text-lg tabular-nums text-zinc-900 dark:text-zinc-50">
                {counter.value}
              </span>

              <form
                action={async () => {
                  'use server';
                  await stepCounter(counter.id, 1);
                }}
              >
                <button
                  type="submit"
                  aria-label={`Increment ${counter.name}`}
                  className="h-8 w-8 rounded-lg border border-zinc-300 dark:border-zinc-600 text-lg leading-none text-zinc-700 dark:text-zinc-200 hover:border-zinc-500 transition-colors"
                >
                  +
                </button>
              </form>

              <form
                action={async () => {
                  'use server';
                  await resetCounter(counter.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  Reset
                </button>
              </form>

              <form
                action={async () => {
                  'use server';
                  await deleteCounter(counter.id);
                }}
              >
                <button
                  type="submit"
                  aria-label={`Delete ${counter.name}`}
                  className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>

        {counters.length > 0 && (
          <p className="mt-4 text-xs text-zinc-400 text-right">
            Total: {counters.reduce((sum, c) => sum + c.value, 0)}
          </p>
        )}
      </div>
    </div>
  );
}
