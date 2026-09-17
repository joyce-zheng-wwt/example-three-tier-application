'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type Alarm, toggleAlarm, deleteAlarm } from '../actions';

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

/** "HH:MM" for display, from the "HH:MM:SS" the API returns. */
function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function AlarmClock({ alarms }: { alarms: Alarm[] }) {
  const [now, setNow] = useState<Date | null>(null);
  const [ringing, setRinging] = useState<Alarm | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<{ ctx: AudioContext; stop: () => void } | null>(null);

  // Tick once a second. Starts on mount so server and client markup match.
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fire an alarm the first time its minute comes around.
  useEffect(() => {
    if (!now) return;
    const currentMinute = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const key = `${now.toDateString()} ${currentMinute}`;

    for (const alarm of alarms) {
      if (!alarm.enabled) continue;
      if (formatTime(alarm.time) !== currentMinute) continue;
      const fireKey = `${key} #${alarm.id}`;
      if (firedRef.current.has(fireKey)) continue;
      firedRef.current.add(fireKey);
      setRinging(alarm);
      break;
    }
  }, [now, alarms]);

  // Beep for as long as an alarm is ringing.
  useEffect(() => {
    if (!ringing) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    oscillator.connect(gain);
    oscillator.start();

    // Pulse the volume so it sounds like a ring rather than a flat tone.
    const beep = () => {
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.35);
    };
    beep();
    const pulse = setInterval(beep, 700);

    const stop = () => {
      clearInterval(pulse);
      oscillator.stop();
      ctx.close();
    };
    audioRef.current = { ctx, stop };

    return () => {
      audioRef.current = null;
      stop();
    };
  }, [ringing]);

  const dismiss = useCallback(() => setRinging(null), []);

  const nextAlarm = alarms.find((alarm) => alarm.enabled) ?? null;

  return (
    <div className="w-full">
      {/* Live clock */}
      <p className="text-center text-5xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
        {now
          ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
          : '--:--:--'}
      </p>
      <p className="mt-2 mb-8 text-center text-xs text-zinc-400">
        {nextAlarm
          ? `Next enabled alarm at ${formatTime(nextAlarm.time)} — ${nextAlarm.label}`
          : 'No alarms enabled'}
      </p>

      {/* Ringing banner */}
      {ringing && (
        <div
          role="alert"
          className="mb-8 flex items-center gap-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3"
        >
          <span className="flex-1 text-sm font-medium text-red-800 dark:text-red-200">
            ⏰ {formatTime(ringing.time)} — {ringing.label}
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-500 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Alarm list */}
      <ul className="space-y-2">
        {alarms.length === 0 && (
          <li className="text-zinc-400 text-center py-8">
            No alarms yet. Add one above!
          </li>
        )}
        {alarms.map((alarm) => (
          <li
            key={alarm.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
          >
            <span
              className={`font-mono text-lg ${
                alarm.enabled
                  ? 'text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {formatTime(alarm.time)}
            </span>
            <span
              className={`flex-1 text-sm ${
                alarm.enabled
                  ? 'text-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {alarm.label}
            </span>
            <button
              type="button"
              onClick={() => toggleAlarm(alarm.id, !alarm.enabled)}
              aria-label={`${alarm.enabled ? 'Disable' : 'Enable'} ${alarm.label}`}
              className={`h-5 w-9 flex-shrink-0 rounded-full p-0.5 transition-colors ${
                alarm.enabled
                  ? 'bg-zinc-900 dark:bg-zinc-50'
                  : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                  alarm.enabled ? 'translate-x-4' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => deleteAlarm(alarm.id)}
              className="flex-shrink-0 rounded p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label={`Delete ${alarm.label}`}
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4">
                <path
                  d="M3 4h10M6.5 4V2.5h3V4M5 4l.5 9h5L11 4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
