'use client';

import { useState } from 'react';
import Link from 'next/link';

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const calculateWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isBoardFull = board.every((square) => square !== null);
  const isGameOver = winner !== null || isBoardFull;

  const handleClick = (index: number) => {
    if (board[index] || isGameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const renderSquare = (index: number) => {
    return (
      <button
        onClick={() => handleClick(index)}
        className="w-20 h-20 bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-3xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        aria-label={`Square ${index}`}
      >
        <span className={board[index] === 'X' ? 'text-blue-600' : 'text-red-600'}>
          {board[index]}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Tic-Tac-Toe
          </h1>
          <Link
            href="/"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
          >
            ← Home
          </Link>
        </div>

        {/* Game Status */}
        <div className="mb-6 p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          {winner ? (
            <p className="text-lg font-semibold text-center">
              <span className={winner === 'X' ? 'text-blue-600' : 'text-red-600'}>
                Player {winner}
              </span>
              <span className="text-zinc-900 dark:text-zinc-50"> wins! 🎉</span>
            </p>
          ) : isBoardFull ? (
            <p className="text-lg font-semibold text-center text-zinc-900 dark:text-zinc-50">
              It&apos;s a draw! 🤝
            </p>
          ) : (
            <p className="text-lg font-semibold text-center text-zinc-900 dark:text-zinc-50">
              Current Player:{' '}
              <span className={isXNext ? 'text-blue-600' : 'text-red-600'}>
                {isXNext ? 'X' : 'O'}
              </span>
            </p>
          )}
        </div>

        {/* Game Board */}
        <div className="mb-6 inline-block border-4 border-zinc-300 dark:border-zinc-600">
          <div className="grid grid-cols-3 gap-0">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderSquare(index))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetGame}
          className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-3 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          New Game
        </button>

        {/* Instructions */}
        <div className="mt-8 p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">How to Play</h2>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>• Players take turns clicking squares</li>
            <li>• X goes first (blue), O goes second (red)</li>
            <li>• Get three in a row to win</li>
            <li>• Click &quot;New Game&quot; to play again</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
