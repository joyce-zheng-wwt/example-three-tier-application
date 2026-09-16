'use client';

import { useState } from 'react';

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
      setDisplay(result.toString());
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
      setDisplay(result.toString());
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

  const buttonClass = (variant: 'number' | 'operation' | 'equals' | 'clear') => {
    const base = 'w-full h-16 rounded-lg font-semibold text-lg transition-all active:scale-95';
    switch (variant) {
      case 'number':
        return `${base} bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 border-2 border-green-300 dark:border-green-700`;
      case 'operation':
        return `${base} bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 border-2 border-green-600 dark:border-green-700`;
      case 'equals':
        return `${base} bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800 border-2 border-green-700 dark:border-green-800`;
      case 'clear':
        return `${base} bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 border-2 border-red-600 dark:border-red-700`;
      default:
        return base;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-green-900 rounded-2xl shadow-2xl p-6 border-4 border-green-500 dark:border-green-600">
          <h1 className="text-3xl font-bold text-center text-green-700 dark:text-green-300 mb-6">
            🟢 Green Calculator
          </h1>

          {/* Display */}
          <div className="bg-green-900 dark:bg-green-950 rounded-lg p-4 mb-6 border-2 border-green-700">
            <div className="text-right text-4xl font-bold text-green-300 break-words">
              {display}
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <button
              onClick={handleClear}
              className={`${buttonClass('clear')} col-span-2`}
            >
              Clear
            </button>
            <button
              onClick={handleBackspace}
              className={buttonClass('operation')}
            >
              ←
            </button>
            <button
              onClick={() => handleOperation('/')}
              className={buttonClass('operation')}
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleNumber('7')}
              className={buttonClass('number')}
            >
              7
            </button>
            <button
              onClick={() => handleNumber('8')}
              className={buttonClass('number')}
            >
              8
            </button>
            <button
              onClick={() => handleNumber('9')}
              className={buttonClass('number')}
            >
              9
            </button>
            <button
              onClick={() => handleOperation('*')}
              className={buttonClass('operation')}
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleNumber('4')}
              className={buttonClass('number')}
            >
              4
            </button>
            <button
              onClick={() => handleNumber('5')}
              className={buttonClass('number')}
            >
              5
            </button>
            <button
              onClick={() => handleNumber('6')}
              className={buttonClass('number')}
            >
              6
            </button>
            <button
              onClick={() => handleOperation('-')}
              className={buttonClass('operation')}
            >
              −
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleNumber('1')}
              className={buttonClass('number')}
            >
              1
            </button>
            <button
              onClick={() => handleNumber('2')}
              className={buttonClass('number')}
            >
              2
            </button>
            <button
              onClick={() => handleNumber('3')}
              className={buttonClass('number')}
            >
              3
            </button>
            <button
              onClick={() => handleOperation('+')}
              className={buttonClass('operation')}
            >
              +
            </button>

            {/* Row 5 */}
            <button
              onClick={() => handleNumber('0')}
              className={`${buttonClass('number')} col-span-2`}
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className={buttonClass('number')}
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className={buttonClass('equals')}
            >
              =
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-green-700 dark:text-green-300 text-sm">
          <p>🌱 Eco-friendly Calculator 🌱</p>
        </div>
      </div>
    </div>
  );
}
