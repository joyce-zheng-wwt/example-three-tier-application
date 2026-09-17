'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

type Position = { x: number; y: number };
type Direction = { x: number; y: number };

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const directionRef = useRef(direction);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    );
    return newFood;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  }, [generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        resetGame();
        return;
      }

      if (gameOver) return;

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        return;
      }

      const currentDir = directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y === 0) {
            setDirection({ x: 0, y: -1 });
            directionRef.current = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
          if (currentDir.y === 0) {
            setDirection({ x: 0, y: 1 });
            directionRef.current = { x: 0, y: 1 };
          }
          break;
        case 'ArrowLeft':
          if (currentDir.x === 0) {
            setDirection({ x: -1, y: 0 });
            directionRef.current = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
          if (currentDir.x === 0) {
            setDirection({ x: 1, y: 0 });
            directionRef.current = { x: 1, y: 0 };
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, gameStarted, resetGame]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, isPaused, food, generateFood]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      food.x * CELL_SIZE + 2,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#22c55e' : '#4ade80';
      ctx.fillRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );
    });
  }, [snake, food]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Snake Game
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Score: {score}
            </div>
            <button
              onClick={resetGame}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              New Game
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="border-2 border-zinc-300 dark:border-zinc-600 rounded"
            />
          </div>

          {!gameStarted && (
            <div className="text-center text-zinc-600 dark:text-zinc-400 mb-4">
              <p className="text-lg font-semibold mb-2">Press any arrow key to start!</p>
            </div>
          )}

          {gameOver && (
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                Game Over!
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                Final Score: {score}
              </p>
            </div>
          )}

          {isPaused && !gameOver && gameStarted && (
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                Paused
              </p>
            </div>
          )}

          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p className="font-semibold">Controls:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Arrow keys: Move the snake</li>
              <li>Space: Pause/Resume</li>
              <li>New Game button: Restart</li>
            </ul>
            <p className="mt-4">
              <span className="font-semibold">Goal:</span> Eat the red food to grow and increase your score. Don&apos;t hit the walls or yourself!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
