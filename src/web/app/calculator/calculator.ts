export type Operator = '+' | '−' | '×' | '÷';

export type CalculatorState = {
  display: string;
  /** Left-hand side of a pending operation, if any. */
  accumulator: number | null;
  operator: Operator | null;
  /** Set after an operator or equals is pressed: the next digit starts a new operand. */
  awaitingOperand: boolean;
};

export type Key =
  | { type: 'digit'; digit: string }
  | { type: 'dot' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'clear' };

export const ERROR = 'Error';

export const initialState: CalculatorState = {
  display: '0',
  accumulator: null,
  operator: null,
  awaitingOperand: false,
};

function apply(a: number, b: number, operator: Operator): number {
  switch (operator) {
    case '+':
      return a + b;
    case '−':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return a / b;
  }
}

/** Trims floating-point noise (0.1 + 0.2 → 0.3) and reports non-finite results. */
export function format(value: number): string {
  if (!Number.isFinite(value)) return ERROR;
  return String(Number(value.toPrecision(12)));
}

export function reduce(state: CalculatorState, key: Key): CalculatorState {
  const { display, accumulator, operator, awaitingOperand } = state;
  const fresh = awaitingOperand || display === ERROR;

  switch (key.type) {
    case 'clear':
      return initialState;

    case 'digit':
      if (fresh) return { ...state, display: key.digit, awaitingOperand: false };
      return {
        ...state,
        display: display === '0' ? key.digit : display + key.digit,
      };

    case 'dot':
      if (fresh) return { ...state, display: '0.', awaitingOperand: false };
      if (display.includes('.')) return state;
      return { ...state, display: display + '.' };

    case 'operator': {
      if (display === ERROR) return state;
      // Chain left to right: finish the pending operation before starting the next.
      if (accumulator !== null && operator !== null && !awaitingOperand) {
        const result = apply(accumulator, Number(display), operator);
        return {
          display: format(result),
          accumulator: Number.isFinite(result) ? result : null,
          operator: Number.isFinite(result) ? key.operator : null,
          awaitingOperand: Number.isFinite(result),
        };
      }
      return {
        display,
        accumulator: accumulator === null ? Number(display) : accumulator,
        operator: key.operator,
        awaitingOperand: true,
      };
    }

    case 'equals': {
      if (accumulator === null || operator === null || display === ERROR) return state;
      return {
        display: format(apply(accumulator, Number(display), operator)),
        accumulator: null,
        operator: null,
        // The result stays on screen, but typing a digit starts a fresh calculation.
        awaitingOperand: true,
      };
    }
  }
}
