'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const GRID_SIZE = 15;
const TICK_MS = 150;

type Point = { x: number; y: number };

const DIRECTIONS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function randomCell(exclude: Point[]): Point {
  let cell: Point;
  do {
    cell = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (exclude.some((p) => p.x === cell.x && p.y === cell.y));
  return cell;
}

const INITIAL_SNAKE: Point[] = [{ x: 7, y: 7 }];

export default function SnakePage() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>(() => randomCell(INITIAL_SNAKE));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });

  const resetGame = useCallback(() => {
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setSnake(INITIAL_SNAKE);
    setFood(randomCell(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const dir = DIRECTIONS[e.key];
      if (!dir) return;
      e.preventDefault();
      const current = directionRef.current;
      // Ignore attempts to reverse directly into the snake's own body.
      if (dir.x === -current.x && dir.y === -current.y) return;
      nextDirectionRef.current = dir;
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      directionRef.current = nextDirectionRef.current;

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead: Point = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        const hitWall =
          newHead.x < 0 ||
          newHead.y < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y >= GRID_SIZE;
        const hitSelf = prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y,
        );

        if (hitWall || hitSelf) {
          setGameOver(true);
          return prevSnake;
        }

        const ateFood = newHead.x === food.x && newHead.y === food.y;
        const newSnake = [newHead, ...prevSnake];

        if (ateFood) {
          setScore((s) => s + 1);
          setFood(randomCell(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [food, gameOver]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Snake
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Score: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{score}</span>
        </p>

        <div
          className="relative grid bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            width: '90vmin',
            height: '90vmin',
            maxWidth: '420px',
            maxHeight: '420px',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={
                  isHead
                    ? 'bg-emerald-600 dark:bg-emerald-400'
                    : isBody
                    ? 'bg-emerald-500 dark:bg-emerald-600'
                    : isFood
                    ? 'bg-red-500 rounded-full'
                    : ''
                }
              />
            );
          })}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
              <p className="text-lg font-semibold text-white">Game Over</p>
              <button
                type="button"
                onClick={resetGame}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-zinc-400 text-center">
          Use the arrow keys (or W A S D) to move.
        </p>

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
