'use client';

import { useState } from 'react';
import Link from 'next/link';

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameHistory, setGameHistory] = useState<{ wins: number; losses: number; draws: number }>({
    wins: 0,
    losses: 0,
    draws: 0,
  });

  const calculateWinner = (squares: Player[]): { winner: Player; line: number[] | null } => {
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
        return { winner: squares[a], line: lines[i] };
      }
    }
    return { winner: null, line: null };
  };

  const result = calculateWinner(board);
  const winner = result.winner;
  const winLine = result.line;
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

  const handleGameEnd = () => {
    if (winner === 'X') {
      setGameHistory((prev) => ({ ...prev, wins: prev.wins + 1 }));
    } else if (winner === 'O') {
      setGameHistory((prev) => ({ ...prev, losses: prev.losses + 1 }));
    } else if (isBoardFull) {
      setGameHistory((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
    resetGame();
  };

  const isWinningSquare = (index: number) => winLine?.includes(index) ?? false;

  const renderSquare = (index: number) => {
    const isWinning = isWinningSquare(index);
    return (
      <button
        onClick={() => handleClick(index)}
        className={`
          w-24 h-24 text-4xl font-bold transition-all duration-200
          border-2 border-zinc-300 dark:border-zinc-600
          ${
            board[index]
              ? 'bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-700 dark:to-zinc-800 cursor-default'
              : 'bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer hover:scale-105'
          }
          ${isWinning ? 'ring-4 ring-yellow-400 dark:ring-yellow-300 scale-110 animate-pulse' : ''}
        `}
        aria-label={`Square ${index}`}
        disabled={isGameOver}
      >
        <span
          className={`
            inline-block transition-all duration-300
            ${board[index] === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}
            ${isWinning ? 'scale-125' : 'scale-100'}
          `}
        >
          {board[index]}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Tic-Tac-Toe
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Classic strategy game</p>
          </div>
          <Link
            href="/"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors underline"
          >
            ← Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {/* Game Status Card */}
            <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg">
              {winner ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    GAME OVER
                  </p>
                  <p className="text-3xl font-bold">
                    <span className={winner === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}>
                      Player {winner}
                    </span>
                    <span className="text-zinc-900 dark:text-zinc-50"> wins! 🎉</span>
                  </p>
                </div>
              ) : isBoardFull ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    GAME OVER
                  </p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    It&apos;s a draw! 🤝
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    CURRENT TURN
                  </p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    Player{' '}
                    <span className={isXNext ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}>
                      {isXNext ? 'X' : 'O'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Game Board */}
            <div className="mb-8 flex justify-center">
              <div className="inline-block p-4 rounded-2xl bg-white dark:bg-zinc-800 shadow-2xl border border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderSquare(index))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGameEnd}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 px-6 py-3 font-semibold text-white hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isGameOver}
              >
                {isGameOver ? 'Play Again' : 'Game in Progress'}
              </button>
              <button
                onClick={resetGame}
                className="rounded-lg border-2 border-zinc-300 dark:border-zinc-600 px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg">
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50 mb-4 text-lg">Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Wins (X)</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gameHistory.wins}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <span className="text-sm font-semibold text-red-900 dark:text-red-300">Losses (O)</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">{gameHistory.losses}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">Draws</span>
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{gameHistory.draws}</span>
                </div>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg">
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50 mb-4 text-lg">How to Play</h2>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                <li className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span>Players take turns clicking squares</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                  <span>X goes first (blue)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                  <span>O goes second (red)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                  <span>Get three in a row to win</span>
                </li>
              </ul>
            </div>

            {/* Tips Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 shadow-lg">
              <h2 className="font-bold text-purple-900 dark:text-purple-300 mb-3 text-lg">💡 Pro Tips</h2>
              <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-2">
                <li>• Control the center square</li>
                <li>• Block opponent&apos;s winning moves</li>
                <li>• Create multiple winning paths</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
