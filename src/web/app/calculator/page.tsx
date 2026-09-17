'use client';

import { useReducer } from 'react';
import Link from 'next/link';
import {
  initialState,
  reduce,
  type Operator,
} from './calculator';

const KEY_CLASS =
  'rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-lg font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors';
const ACCENT_KEY_CLASS =
  'rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-3 text-lg font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors';

const OPERATOR_LABELS: Record<Operator, string> = {
  '+': 'Add',
  '−': 'Subtract',
  '×': 'Multiply',
  '÷': 'Divide',
};

export default function CalculatorPage() {
  const [state, dispatch] = useReducer(reduce, initialState);

  const digitKey = (digit: string, extraClass = '') => (
    <button
      type="button"
      onClick={() => dispatch({ type: 'digit', digit })}
      className={`${KEY_CLASS} ${extraClass}`}
    >
      {digit}
    </button>
  );

  const operatorKey = (operator: Operator) => (
    <button
      type="button"
      onClick={() => dispatch({ type: 'operator', operator })}
      className={KEY_CLASS}
      aria-label={OPERATOR_LABELS[operator]}
    >
      {operator}
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-xs mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Calculator
        </h1>

        <output className="block w-full mb-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-4 text-right text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-50 overflow-x-auto">
          {state.display}
        </output>

        <div className="grid grid-cols-4 gap-2 w-full">
          <button
            type="button"
            onClick={() => dispatch({ type: 'clear' })}
            className={`${KEY_CLASS} col-span-3`}
          >
            Clear
          </button>
          {operatorKey('÷')}

          {digitKey('7')}
          {digitKey('8')}
          {digitKey('9')}
          {operatorKey('×')}

          {digitKey('4')}
          {digitKey('5')}
          {digitKey('6')}
          {operatorKey('−')}

          {digitKey('1')}
          {digitKey('2')}
          {digitKey('3')}
          {operatorKey('+')}

          {digitKey('0', 'col-span-2')}
          <button
            type="button"
            onClick={() => dispatch({ type: 'dot' })}
            className={KEY_CLASS}
          >
            .
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'equals' })}
            className={ACCENT_KEY_CLASS}
            aria-label="Equals"
          >
            =
          </button>
        </div>

        <Link
          href="/"
          className="mt-10 text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
        >
          ← Back to To-Do List
        </Link>
      </div>
    </div>
  );
}
