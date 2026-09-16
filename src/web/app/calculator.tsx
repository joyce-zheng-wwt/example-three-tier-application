'use client';

import { useState } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'operation' | 'equals' | 'clear';
}

function Button({ children, onClick, className = '', variant = 'default' }: ButtonProps) {
  const baseClass = 'p-4 text-lg font-semibold rounded-lg transition-colors';
  const variants = {
    default: 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-50',
    operation: 'bg-blue-500 hover:bg-blue-600 text-white',
    equals: 'bg-green-500 hover:bg-green-600 text-white',
    clear: 'bg-red-500 hover:bg-red-600 text-white',
  };
  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

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
    if (operation && previousValue !== null) {
      const currentValue = parseFloat(display);
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
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 shadow-lg">
        {/* Display */}
        <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 mb-6">
          <div className="text-right text-4xl font-bold text-white break-words">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <Button onClick={handleClear} variant="clear" className="col-span-2">
            Clear
          </Button>
          <Button onClick={handleBackspace} variant="operation">
            ←
          </Button>
          <Button onClick={() => handleOperation('/')} variant="operation">
            ÷
          </Button>

          {/* Row 2 */}
          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button onClick={() => handleOperation('*')} variant="operation">
            ×
          </Button>

          {/* Row 3 */}
          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button onClick={() => handleOperation('-')} variant="operation">
            −
          </Button>

          {/* Row 4 */}
          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button onClick={() => handleOperation('+')} variant="operation">
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
      </div>
    </div>
  );
}
