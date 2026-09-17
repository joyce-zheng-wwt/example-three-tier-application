'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Counter
        </h1>

        <p className="text-6xl font-mono font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          {count}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCount((c) => c - 1)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-5 py-2 font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Decrement"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setCount(0)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-5 py-2 font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            aria-label="Increment"
          >
            +
          </button>
        </div>

        <Link
          href="/"
          className="mt-10 text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
        >
          ← Back to To-Do List
        </Link>
      </div>
    </div>
  );
}
