import Link from 'next/link';
import { getAlarms, createAlarm } from '../actions';
import AlarmClock from './alarm-clock';

export default async function AlarmPage() {
  const alarms = await getAlarms();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Alarms
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
          >
            ← To-Do List
          </Link>
        </div>

        {/* Add alarm form */}
        <form action={createAlarm} className="flex gap-2 mb-8">
          <input
            name="time"
            type="time"
            required
            aria-label="Alarm time"
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <input
            name="label"
            type="text"
            maxLength={200}
            placeholder="Label (optional)"
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Add
          </button>
        </form>

        <AlarmClock alarms={alarms} />
      </div>
    </div>
  );
}
