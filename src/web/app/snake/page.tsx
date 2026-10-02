'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random food position
  const generateFood = (currentSnake: Position[]): Position => {
    let newFood: Position = { x: 0, y: 0 };
    let isOnSnake = true;

    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }

    return newFood;
  };

  // Reset game function
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setNextDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setGameStarted(true);
        return;
      }

      if (gameOver && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setNextDirection((prev) => (prev !== 'DOWN' ? 'UP' : prev));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setNextDirection((prev) => (prev !== 'UP' ? 'DOWN' : prev));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setNextDirection((prev) => (prev !== 'RIGHT' ? 'LEFT' : prev));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setNextDirection((prev) => (prev !== 'LEFT' ? 'RIGHT' : prev));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        let newHead: Position;

        switch (nextDirection) {
          case 'UP':
            newHead = { x: head.x, y: (head.y - 1 + GRID_SIZE) % GRID_SIZE };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: (head.y + 1) % GRID_SIZE };
            break;
          case 'LEFT':
            newHead = { x: (head.x - 1 + GRID_SIZE) % GRID_SIZE, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: (head.x + 1) % GRID_SIZE, y: head.y };
            break;
        }

        // Check collision with self
        if (
          prevSnake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 100);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, nextDirection, food]);

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
            ← Home
          </Link>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Game Canvas */}
          <div className="relative bg-zinc-900 dark:bg-zinc-950 rounded-lg overflow-hidden border-4 border-zinc-700 dark:border-zinc-800">
            <svg
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="bg-zinc-900 dark:bg-zinc-950"
            >
              {/* Grid lines */}
              {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                <g key={`grid-${i}`}>
                  <line
                    x1={i * CELL_SIZE}
                    y1={0}
                    x2={i * CELL_SIZE}
                    y2={GRID_SIZE * CELL_SIZE}
                    stroke="#3f3f46"
                    strokeWidth="0.5"
                  />
                  <line
                    x1={0}
                    y1={i * CELL_SIZE}
                    x2={GRID_SIZE * CELL_SIZE}
                    y2={i * CELL_SIZE}
                    stroke="#3f3f46"
                    strokeWidth="0.5"
                  />
                </g>
              ))}

              {/* Snake */}
              {snake.map((segment, index) => (
                <rect
                  key={`snake-${index}`}
                  x={segment.x * CELL_SIZE + 1}
                  y={segment.y * CELL_SIZE + 1}
                  width={CELL_SIZE - 2}
                  height={CELL_SIZE - 2}
                  fill={index === 0 ? '#22c55e' : '#16a34a'}
                  rx="2"
                />
              ))}

              {/* Food */}
              <circle
                cx={food.x * CELL_SIZE + CELL_SIZE / 2}
                cy={food.y * CELL_SIZE + CELL_SIZE / 2}
                r={CELL_SIZE / 2 - 2}
                fill="#ef4444"
              />
            </svg>
          </div>

          {/* Score */}
          <div className="text-center">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Score: {score}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Length: {snake.length}
            </p>
          </div>

          {/* Game Status */}
          <div className="text-center">
            {!gameStarted && !gameOver && (
              <div className="space-y-4">
                <p className="text-lg text-zinc-600 dark:text-zinc-300">
                  Press <span className="font-bold">SPACE</span> or <span className="font-bold">ENTER</span> to start
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Use arrow keys to move
                </p>
              </div>
            )}

            {gameOver && (
              <div className="space-y-4">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Game Over!
                </p>
                <p className="text-lg text-zinc-600 dark:text-zinc-300">
                  Final Score: {score}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Press <span className="font-bold">SPACE</span> or <span className="font-bold">ENTER</span> to play again
                </p>
              </div>
            )}

            {gameStarted && !gameOver && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Use arrow keys to move
              </p>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetGame}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-6 py-3 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}
