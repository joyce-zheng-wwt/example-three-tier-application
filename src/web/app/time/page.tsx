'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TimePage() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Current Time
        </h1>

        <p className="text-5xl font-mono font-bold text-zinc-900 dark:text-zinc-50 mb-2 tabular-nums">
          {now ? now.toLocaleTimeString() : '--:--:--'}
        </p>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          {now ? now.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) : ''}
        </p>

        <Link
          href="/"
          className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
        >
          ← Back to To-Do List
        </Link>
      </div>
    </div>
  );
}
