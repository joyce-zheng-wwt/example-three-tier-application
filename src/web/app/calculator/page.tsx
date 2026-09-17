'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CalculatorPage() {
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
      case '−':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
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
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const buttonClass = 'rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors';
  const operationButtonClass = 'rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-3 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 text-center">
          Calculator
        </h1>

        {/* Display */}
        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-lg p-6 mb-6">
          <div className="text-right text-5xl font-mono font-bold text-white dark:text-zinc-50 break-words">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className={`${operationButtonClass} col-span-2`}
          >
            Clear
          </button>
          <button
            onClick={handleBackspace}
            className={buttonClass}
            aria-label="Backspace"
          >
            ⌫
          </button>
          <button
            onClick={() => handleOperation('÷')}
            className={operationButtonClass}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button onClick={() => handleNumber('7')} className={buttonClass}>
            7
          </button>
          <button onClick={() => handleNumber('8')} className={buttonClass}>
            8
          </button>
          <button onClick={() => handleNumber('9')} className={buttonClass}>
            9
          </button>
          <button
            onClick={() => handleOperation('×')}
            className={operationButtonClass}
          >
            ×
          </button>

          {/* Row 3 */}
          <button onClick={() => handleNumber('4')} className={buttonClass}>
            4
          </button>
          <button onClick={() => handleNumber('5')} className={buttonClass}>
            5
          </button>
          <button onClick={() => handleNumber('6')} className={buttonClass}>
            6
          </button>
          <button
            onClick={() => handleOperation('−')}
            className={operationButtonClass}
          >
            −
          </button>

          {/* Row 4 */}
          <button onClick={() => handleNumber('1')} className={buttonClass}>
            1
          </button>
          <button onClick={() => handleNumber('2')} className={buttonClass}>
            2
          </button>
          <button onClick={() => handleNumber('3')} className={buttonClass}>
            3
          </button>
          <button
            onClick={() => handleOperation('+')}
            className={operationButtonClass}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleNumber('0')}
            className={`${buttonClass} col-span-2`}
          >
            0
          </button>
          <button onClick={handleDecimal} className={buttonClass}>
            .
          </button>
          <button
            onClick={handleEquals}
            className={operationButtonClass}
          >
            =
          </button>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
        >
          ← Back to To-Do List
        </Link>
      </div>
    </div>
  );
}
