'use client';

import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f4f4f4',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
      maxWidth: '400px',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '32px',
      textAlign: 'center' as const,
    },
    displayBox: {
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      padding: '32px',
      marginBottom: '32px',
      textAlign: 'center' as const,
    },
    label: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '8px',
    },
    count: {
      fontSize: '56px',
      fontWeight: 'bold',
      color: '#333',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
    },
    buttonSmall: {
      flex: 1,
      padding: '12px 16px',
      fontSize: '18px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    decrementBtn: {
      backgroundColor: '#ef4444',
      color: 'white',
    },
    decrementBtnHover: {
      backgroundColor: '#dc2626',
    },
    incrementBtn: {
      backgroundColor: '#22c55e',
      color: 'white',
    },
    incrementBtnHover: {
      backgroundColor: '#16a34a',
    },
    resetBtn: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      fontWeight: '600',
      backgroundColor: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    resetBtnHover: {
      backgroundColor: '#555',
    },
    info: {
      marginTop: '24px',
      textAlign: 'center' as const,
      fontSize: '14px',
      color: '#999',
    },
  };

  const [decrementHover, setDecrementHover] = useState(false);
  const [incrementHover, setIncrementHover] = useState(false);
  const [resetHover, setResetHover] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Counter App</h1>

        <div style={styles.displayBox}>
          <p style={styles.label}>Current Count</p>
          <p style={styles.count}>{count}</p>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={decrement}
            onMouseEnter={() => setDecrementHover(true)}
            onMouseLeave={() => setDecrementHover(false)}
            style={{
              ...styles.buttonSmall,
              ...styles.decrementBtn,
              ...(decrementHover ? styles.decrementBtnHover : {}),
            }}
          >
            −
          </button>
          <button
            onClick={increment}
            onMouseEnter={() => setIncrementHover(true)}
            onMouseLeave={() => setIncrementHover(false)}
            style={{
              ...styles.buttonSmall,
              ...styles.incrementBtn,
              ...(incrementHover ? styles.incrementBtnHover : {}),
            }}
          >
            +
          </button>
        </div>

        <button
          onClick={reset}
          onMouseEnter={() => setResetHover(true)}
          onMouseLeave={() => setResetHover(false)}
          style={{
            ...styles.resetBtn,
            ...(resetHover ? styles.resetBtnHover : {}),
          }}
        >
          Reset
        </button>

        <p style={styles.info}>Click the buttons to change the counter</p>
      </div>
    </div>
  );
}
