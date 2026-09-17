'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 30;

type Tetromino = number[][];

const TETROMINOES: Tetromino[] = [
  // I
  [[1, 1, 1, 1]],
  // O
  [[1, 1], [1, 1]],
  // T
  [[0, 1, 0], [1, 1, 1]],
  // S
  [[0, 1, 1], [1, 1, 0]],
  // Z
  [[1, 1, 0], [0, 1, 1]],
  // J
  [[1, 0, 0], [1, 1, 1]],
  // L
  [[0, 0, 1], [1, 1, 1]],
];

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];

interface Piece {
  shape: Tetromino;
  x: number;
  y: number;
  color: string;
}

export default function Tetris() {
  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const [piece, setPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize grid
  useEffect(() => {
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
  }, []);

  // Create new piece
  const createNewPiece = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
    return {
      shape: TETROMINOES[randomIndex],
      x: Math.floor(GRID_WIDTH / 2) - 1,
      y: 0,
      color: COLORS[randomIndex],
    };
  }, []);

  // Check collision
  const checkCollision = useCallback((testPiece: Piece, testGrid: (string | null)[][]): boolean => {
    for (let row = 0; row < testPiece.shape.length; row++) {
      for (let col = 0; col < testPiece.shape[row].length; col++) {
        if (testPiece.shape[row][col]) {
          const x = testPiece.x + col;
          const y = testPiece.y + row;
          if (x < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return true;
          if (y >= 0 && testGrid[y]?.[x]) return true;
        }
      }
    }
    return false;
  }, []);

  // Merge piece into grid
  const mergePiece = useCallback((testPiece: Piece, testGrid: (string | null)[][]): (string | null)[][] => {
    const newGrid = testGrid.map(row => [...row]);
    for (let row = 0; row < testPiece.shape.length; row++) {
      for (let col = 0; col < testPiece.shape[row].length; col++) {
        if (testPiece.shape[row][col]) {
          const x = testPiece.x + col;
          const y = testPiece.y + row;
          if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
            newGrid[y][x] = testPiece.color;
          }
        }
      }
    }
    return newGrid;
  }, []);

  // Clear completed lines
  const clearLines = useCallback((testGrid: (string | null)[][]): { grid: (string | null)[][]; linesCleared: number } => {
    let newGrid = testGrid.map(row => [...row]);
    let linesCleared = 0;

    for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
      if (newGrid[row].every(cell => cell !== null)) {
        newGrid.splice(row, 1);
        newGrid.unshift(Array(GRID_WIDTH).fill(null));
        linesCleared++;
        row++;
      }
    }

    return { grid: newGrid, linesCleared };
  }, []);

  // Move piece down
  const movePieceDown = useCallback(() => {
    if (!piece || gameOver || !gameStarted) return;

    const newPiece = { ...piece, y: piece.y + 1 };

    if (checkCollision(newPiece, grid)) {
      // Merge piece
      const mergedGrid = mergePiece(piece, grid);
      const { grid: clearedGrid, linesCleared } = clearLines(mergedGrid);

      setGrid(clearedGrid);
      setScore(prev => prev + linesCleared * 100);

      // Create new piece
      const newPiece = createNewPiece();
      if (checkCollision(newPiece, clearedGrid)) {
        setGameOver(true);
        return;
      }
      setPiece(newPiece);
    } else {
      setPiece(newPiece);
    }
  }, [piece, grid, gameOver, gameStarted, checkCollision, mergePiece, clearLines, createNewPiece]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      movePieceDown();
    }, 500);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, movePieceDown]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || !piece) return;

      if (e.key === 'ArrowLeft') {
        const newPiece = { ...piece, x: piece.x - 1 };
        if (!checkCollision(newPiece, grid)) {
          setPiece(newPiece);
        }
      } else if (e.key === 'ArrowRight') {
        const newPiece = { ...piece, x: piece.x + 1 };
        if (!checkCollision(newPiece, grid)) {
          setPiece(newPiece);
        }
      } else if (e.key === 'ArrowDown') {
        movePieceDown();
      } else if (e.key === ' ') {
        e.preventDefault();
        // Hard drop
        let newPiece = { ...piece };
        while (!checkCollision({ ...newPiece, y: newPiece.y + 1 }, grid)) {
          newPiece.y++;
        }
        setPiece(newPiece);
        movePieceDown();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [piece, grid, gameStarted, gameOver, checkCollision, movePieceDown]);

  // Start game
  const startGame = () => {
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    setPiece(createNewPiece());
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  // Render grid with current piece
  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);

    if (piece && gameStarted) {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const x = piece.x + col;
            const y = piece.y + row;
            if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
              displayGrid[y][x] = piece.color;
            }
          }
        }
      }
    }

    return displayGrid;
  };

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
            ← Home
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Score: {score}
          </p>
        </div>

        {/* Game board */}
        <div
          className="bg-zinc-900 dark:bg-zinc-950 border-4 border-zinc-700 dark:border-zinc-800 mb-6"
          style={{
            width: GRID_WIDTH * CELL_SIZE,
            height: GRID_HEIGHT * CELL_SIZE,
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
            gap: '1px',
            padding: '2px',
          }}
        >
          {renderGrid().flat().map((cell, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: cell || '#1f2937',
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
                border: '1px solid #374151',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {!gameStarted ? (
            <button
              onClick={startGame}
              className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-3 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Start Game
            </button>
          ) : gameOver ? (
            <button
              onClick={startGame}
              className="w-full rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700 transition-colors"
            >
              Game Over - Play Again
            </button>
          ) : null}

          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <p>← → : Move</p>
            <p>↓ : Soft drop</p>
            <p>Space : Hard drop</p>
          </div>
        </div>
      </div>
    </div>
  );
}
