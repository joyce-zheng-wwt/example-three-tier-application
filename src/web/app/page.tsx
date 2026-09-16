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

  const buttonStyle = (variant: string) => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '64px',
      fontSize: '20px',
      fontWeight: '600',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: 'Arial, sans-serif',
    };

    const variants: { [key: string]: React.CSSProperties } = {
      default: {
        ...baseStyle,
        backgroundColor: '#22c55e',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)',
      },
      operator: {
        ...baseStyle,
        backgroundColor: '#16a34a',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.3)',
      },
      equals: {
        ...baseStyle,
        backgroundColor: '#15803d',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(21, 128, 61, 0.3)',
        gridColumn: 'span 2',
      },
      clear: {
        ...baseStyle,
        backgroundColor: '#ef4444',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
      },
    };

    return variants[variant] || variants.default;
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #dcfce7, #d1fae5)',
    padding: '32px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    border: '2px solid #bbf7d0',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: '24px',
    textAlign: 'center',
  };

  const displayStyle: React.CSSProperties = {
    background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '2px solid #86efac',
    textAlign: 'right',
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#166534',
    wordBreak: 'break-word',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '14px',
    color: '#059669',
    marginTop: '24px',
  };

  const Button = ({ children, onClick, variant = 'default', colSpan = 1 }: any) => {
    const style = buttonStyle(variant);
    if (colSpan > 1) {
      style.gridColumn = `span ${colSpan}`;
    }

    return (
      <button
        onClick={onClick}
        style={style}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = 'translateY(-2px)';
          target.style.boxShadow = '0 15px 20px -5px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = 'translateY(0)';
          target.style.boxShadow = buttonStyle(variant).boxShadow || '';
        }}
        onMouseDown={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = 'translateY(-2px)';
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headerStyle}>🟢 Green Calculator</h1>

        <div style={displayStyle}>{display}</div>

        <div style={gridStyle}>
          {/* Row 1 */}
          <Button onClick={handleClear} variant="clear" colSpan={2}>
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
          <Button onClick={() => handleNumber('0')} colSpan={2}>
            0
          </Button>
          <Button onClick={handleDecimal}>.</Button>
          <Button onClick={handleEquals} variant="equals">
            =
          </Button>
        </div>

        <div style={footerStyle}>✓ Fully functional calculator with green theme</div>
      </div>
    </div>
  );
}
