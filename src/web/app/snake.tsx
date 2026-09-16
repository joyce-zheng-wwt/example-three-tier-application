'use client';

import { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

interface Position {
  x: number;
  y: number;
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [nextDirection, setNextDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random food position
  const generateFood = (currentSnake: Position[]): Position => {
    let newFood: Position;
    let isOnSnake = true;

    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOnSnake = currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    }

    return newFood;
  };

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        // Apply next direction
        setDirection(nextDirection);
        head.x += nextDirection.x;
        head.y += nextDirection.y;

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => prev + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 100);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameOver, isPaused, food, nextDirection]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setNextDirection((prev) => (prev.y === 0 ? { x: 0, y: -1 } : prev));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setNextDirection((prev) => (prev.y === 0 ? { x: 0, y: 1 } : prev));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setNextDirection((prev) => (prev.x === 0 ? { x: -1, y: 0 } : prev));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setNextDirection((prev) => (prev.x === 0 ? { x: 1, y: 0 } : prev));
          break;
        case ' ':
          e.preventDefault();
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleReset = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 1, y: 0 });
    setNextDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const handleDirectionButton = (newDir: Position) => {
    // Prevent reversing into itself
    if (newDir.x !== -direction.x || newDir.y !== -direction.y) {
      setNextDirection(newDir);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
        {/* Score */}
        <div className="text-center mb-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Score</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{score}</p>
        </div>

        {/* Game Board */}
        <div
          className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-2 mb-4 inline-block mx-auto"
          style={{
            width: GRID_SIZE * CELL_SIZE + 16,
            height: GRID_SIZE * CELL_SIZE + 16,
          }}
        >
          <div
            className="relative bg-zinc-800 dark:bg-zinc-900 rounded"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
            }}
          >
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded-sm transition-all ${
                  index === 0
                    ? 'bg-green-500 shadow-lg shadow-green-500/50'
                    : 'bg-green-400'
                }`}
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE - 1,
                  height: CELL_SIZE - 1,
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-red-500 rounded-full shadow-lg shadow-red-500/50"
              style={{
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
              }}
            />

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded">
                <div className="text-center">
                  <p className="text-white text-2xl font-bold mb-2">Game Over!</p>
                  <p className="text-white text-lg">Final Score: {score}</p>
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                <p className="text-white text-xl font-bold">Paused</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Direction Buttons */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleDirectionButton({ x: 0, y: -1 })}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
              aria-label="Up"
            >
              ↑
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleDirectionButton({ x: -1, y: 0 })}
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                aria-label="Left"
              >
                ←
              </button>
              <button
                onClick={() => handleDirectionButton({ x: 0, y: 1 })}
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                aria-label="Down"
              >
                ↓
              </button>
              <button
                onClick={() => handleDirectionButton({ x: 1, y: 0 })}
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                aria-label="Right"
              >
                →
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              disabled={gameOver}
              className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center space-y-1">
            <p>Use arrow keys or buttons to move</p>
            <p>Press Space to pause/resume</p>
          </div>
        </div>
      </div>
    </div>
  );
}
