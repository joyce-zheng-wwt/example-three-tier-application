import { getAlarms, createAlarm, toggleAlarm, deleteAlarm } from '../actions';
import Link from 'next/link';

export default async function AlarmsPage() {
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
            To-Do List →
          </Link>
        </div>

        {/* Add alarm form */}
        <form action={createAlarm} className="space-y-3 mb-8 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Alarm Name
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g., Morning Workout"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Time
            </label>
            <input
              id="time"
              name="time"
              type="time"
              required
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Repeat
            </label>
            <select
              id="days"
              name="days"
              defaultValue="daily"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="once">Once</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Add Alarm
          </button>
        </form>

        {/* Alarms list */}
        <ul className="space-y-2">
          {alarms.length === 0 && (
            <li className="text-zinc-400 text-center py-8">No alarms set. Add one above!</li>
          )}
          {alarms.map((alarm) => (
            <li
              key={alarm.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
            >
              <form
                action={async () => {
                  'use server';
                  await toggleAlarm(alarm.id, !alarm.enabled);
                }}
              >
                <button
                  type="submit"
                  className={`h-5 w-5 rounded border-2 flex-shrink-0 transition-colors ${
                    alarm.enabled
                      ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50'
                      : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500'
                  }`}
                  aria-label={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                >
                  {alarm.enabled && (
                    <svg viewBox="0 0 12 12" className="text-white dark:text-zinc-900 w-full h-full p-0.5">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  alarm.enabled
                    ? 'text-zinc-800 dark:text-zinc-100'
                    : 'line-through text-zinc-400'
                }`}>
                  {alarm.title}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {alarm.time} • {alarm.days}
                </div>
              </div>
              <form
                action={async () => {
                  'use server';
                  await deleteAlarm(alarm.id);
                }}
              >
                <button
                  type="submit"
                  className="flex-shrink-0 rounded p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label={`Delete ${alarm.title}`}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M3 4h10M6.5 4V2.5h3V4M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
