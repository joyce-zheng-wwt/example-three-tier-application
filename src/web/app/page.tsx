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
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const Button = ({ children, onClick, className = '', variant = 'default' }: any) => {
    const baseClass = 'w-full h-16 text-xl font-semibold rounded-lg transition-all active:scale-95';
    const variants = {
      default: 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl',
      operator: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
      equals: 'bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl col-span-2',
      clear: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl',
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClass} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-950 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-green-900 rounded-2xl shadow-2xl p-6 border-2 border-green-200 dark:border-green-700">
          {/* Header */}
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-6 text-center">
            🟢 Green Calculator
          </h1>

          {/* Display */}
          <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-800 dark:to-green-700 rounded-xl p-6 mb-6 border-2 border-green-300 dark:border-green-600">
            <div className="text-right text-5xl font-bold text-green-900 dark:text-green-100 break-words">
              {display}
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <Button onClick={handleClear} variant="clear" className="col-span-2">
              CLEAR
            </Button>
            <Button onClick={handleBackspace} variant="clear">
              ←
            </Button>
            <Button onClick={() => handleOperation('/')} variant="operator">
              ÷
            </Button>

            {/* Row 2 */}
            <Button onClick={() => handleNumber('7')}>7</Button>
            <Button onClick={() => handleNumber('8')}>8</Button>
            <Button onClick={() => handleNumber('9')}>9</Button>
            <Button onClick={() => handleOperation('*')} variant="operator">
              ×
            </Button>

            {/* Row 3 */}
            <Button onClick={() => handleNumber('4')}>4</Button>
            <Button onClick={() => handleNumber('5')}>5</Button>
            <Button onClick={() => handleNumber('6')}>6</Button>
            <Button onClick={() => handleOperation('-')} variant="operator">
              −
            </Button>

            {/* Row 4 */}
            <Button onClick={() => handleNumber('1')}>1</Button>
            <Button onClick={() => handleNumber('2')}>2</Button>
            <Button onClick={() => handleNumber('3')}>3</Button>
            <Button onClick={() => handleOperation('+')} variant="operator">
              +
            </Button>

            {/* Row 5 */}
            <Button onClick={() => handleNumber('0')} className="col-span-2">
              0
            </Button>
            <Button onClick={handleDecimal}>.</Button>
            <Button onClick={handleEquals} variant="equals">
              =
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-green-600 dark:text-green-400">
            ✓ Fully functional calculator with green theme
          </div>
        </div>
      </div>
    </div>
  );
}
