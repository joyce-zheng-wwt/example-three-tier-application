'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  GRID_WIDTH,
  hardDrop,
  move,
  newGame,
  rotatePiece,
  tick,
  withPiece,
  type GameState,
} from './game';

const CELL_SIZE = 26;
const TICK_MS = 500;

export default function TetrisPage() {
  const [state, setState] = useState<GameState | null>(null);

  const started = state !== null;
  const gameOver = state?.gameOver ?? false;

  const start = useCallback(() => setState(newGame()), []);

  // Gravity. Functional updates keep this from reading stale state.
  useEffect(() => {
    if (!started || gameOver) return;
    const id = setInterval(() => setState((s) => (s ? tick(s) : s)), TICK_MS);
    return () => clearInterval(id);
  }, [started, gameOver]);

  useEffect(() => {
    if (!started || gameOver) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const action = {
        ArrowLeft: (s: GameState) => move(s, -1),
        ArrowRight: (s: GameState) => move(s, 1),
        ArrowDown: (s: GameState) => tick(s),
        ArrowUp: rotatePiece,
        ' ': hardDrop,
      }[e.key];

      if (!action) return;
      e.preventDefault();
      setState((s) => (s ? action(s) : s));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [started, gameOver]);

  const cells = state
    ? withPiece(state).flat()
    : Array<string | null>(GRID_WIDTH * 20).fill(null);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Tetris
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
          >
            ← To-Do List
          </Link>
        </div>

        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Score{' '}
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {state?.score ?? 0}
          </span>
        </p>

        <div
          className="grid gap-px bg-zinc-200 dark:bg-zinc-800 p-px rounded-lg w-fit mb-6"
          style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
          }}
        >
          {cells.map((cell, i) => (
            <div
              key={i}
              className={cell ? '' : 'bg-white dark:bg-zinc-900'}
              style={{
                height: CELL_SIZE,
                backgroundColor: cell ?? undefined,
              }}
            />
          ))}
        </div>

        {(!started || gameOver) && (
          <button
            onClick={start}
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-3 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors mb-4"
          >
            {gameOver ? 'Game over — play again' : 'Start game'}
          </button>
        )}

        <dl className="text-sm text-zinc-500 dark:text-zinc-400 space-y-1">
          <div className="flex gap-2">
            <dt className="w-20 font-medium">← →</dt>
            <dd>Move</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 font-medium">↑</dt>
            <dd>Rotate</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 font-medium">↓</dt>
            <dd>Soft drop</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 font-medium">Space</dt>
            <dd>Hard drop</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
