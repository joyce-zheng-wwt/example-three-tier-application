'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const handleNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setWaitingForNewValue(true);
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return prev / current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    const currentValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 py-16 px-4">
      <div className="max-w-sm mx-auto">
        <Link
          href="/"
          className="inline-block mb-8 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
        >
          ← Back to Tasks
        </Link>

        <div className="bg-white dark:bg-green-900 rounded-2xl shadow-2xl p-6 border-2 border-green-200 dark:border-green-700">
          <h1 className="text-3xl font-bold text-green-900 dark:text-green-50 mb-6 text-center">
            🟢 Green Calculator
          </h1>

          {/* Display */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 rounded-lg p-6 mb-6 border-2 border-green-300 dark:border-green-600">
            <div className="text-right text-4xl font-bold text-green-900 dark:text-green-50 break-words">
              {display}
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <button
              onClick={handleClear}
              className="col-span-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              Clear
            </button>
            <button
              onClick={handleBackspace}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              ←
            </button>
            <button
              onClick={() => handleOperation('/')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleNumber('7')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              7
            </button>
            <button
              onClick={() => handleNumber('8')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              8
            </button>
            <button
              onClick={() => handleNumber('9')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              9
            </button>
            <button
              onClick={() => handleOperation('*')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleNumber('4')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              4
            </button>
            <button
              onClick={() => handleNumber('5')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              5
            </button>
            <button
              onClick={() => handleNumber('6')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              6
            </button>
            <button
              onClick={() => handleOperation('-')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              −
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleNumber('1')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              1
            </button>
            <button
              onClick={() => handleNumber('2')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              2
            </button>
            <button
              onClick={() => handleNumber('3')}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              3
            </button>
            <button
              onClick={() => handleOperation('+')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              onClick={() => handleNumber('0')}
              className="col-span-2 bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className="bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-green-50 font-bold py-4 rounded-lg transition-colors text-lg border-2 border-green-300 dark:border-green-600"
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              =
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
