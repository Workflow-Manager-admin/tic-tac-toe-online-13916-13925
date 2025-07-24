import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Main Application for Tic Tac Toe.
 * Modern, responsive, light theme with custom color variables.
 *
 * Features:
 *  - Two-player mode
 *  - Play against AI
 *  - Start/reset game
 *  - Responsive UI, status/controls
 *  - Game board/state display with win highlight
 */

// Theme colors from work item
const PRIMARY = '#4A90E2';
const SECONDARY = '#FFFFFF';
const ACCENT = '#D0021B';

/**
 * Square component renders an individual Tic Tac Toe cell.
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? ' highlight' : ''}`}
      onClick={onClick}
      aria-label={`Cell ${value ? value : 'empty'}`}
      tabIndex={0}
    >
      {value}
    </button>
  );
}

/**
 * Board component renders the game grid.
 */
function Board({ squares, onClick, winLine }) {
  function isHighlighted(idx) {
    return winLine && winLine.includes(idx);
  }
  return (
    <div className="ttt-board">
      {[0, 1, 2].map(row => (
        <div className="ttt-row" key={row}>
          {[0, 1, 2].map(col => {
            const idx = row * 3 + col;
            return (
              <Square
                key={idx}
                value={squares[idx]}
                onClick={() => onClick(idx)}
                highlight={isHighlighted(idx)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Returns the winner and winning line if exists (otherwise null)
 */
function calculateWinner(squares) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diags
  ];
  for (let l = 0; l < lines.length; l++) {
    const [a, b, c] = lines[l];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

/**
 * Random move AI that picks first available cell.
 */
function getAIMove(squares) {
  // Simple (can be upgraded): random empty square
  const empties = squares
    .map((val, idx) => (val ? null : idx))
    .filter(idx => idx !== null);
  // Defensive/Offensive AI: Block or win if possible
  for (const player of ['O', 'X']) {
    for (let idx of empties) {
      const copy = squares.slice();
      copy[idx] = player;
      if (calculateWinner(copy)) return idx;
    }
  }
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

/**
 * Returns true if all squares are filled.
 */
function isBoardFull(squares) {
  return squares.every(v => v);
}

// Main App
// PUBLIC_INTERFACE
function App() {
  // Game state hooks
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState('HUMAN2'); // 'HUMAN2' or 'AI'
  const [gameActive, setGameActive] = useState(true);
  const [theme] = useState('light'); // Light theme only for this project
  const [showControls, setShowControls] = useState(false);

  // Winner detection
  const winnerData = calculateWinner(squares);
  const winner = winnerData ? winnerData.winner : null;
  const winLine = winnerData ? winnerData.line : null;
  const draw = !winner && isBoardFull(squares);

  // PUBLIC_INTERFACE
  // Handler: Click cell
  const handleClick = idx => {
    if (!gameActive || squares[idx] || (winner || draw)) return;
    const current = squares.slice();
    current[idx] = xIsNext ? 'X' : 'O';
    setSquares(current);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  // Handler: Start/reset game
  const handleNewGame = (optionalMode = mode) => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameActive(true);
    setMode(optionalMode);
  };

  // Play AI if needed
  useEffect(() => {
    // If AI mode, O is AI, play on O's turn
    if (mode === 'AI' && !winner && !draw && !xIsNext && gameActive) {
      const timeout = setTimeout(() => {
        const aiMove = getAIMove(squares);
        if (aiMove != null) {
          const next = squares.slice();
          next[aiMove] = 'O';
          setSquares(next);
          setXIsNext(true);
        }
      }, 400); // AI "delay"
      return () => clearTimeout(timeout);
    }
  }, [mode, squares, xIsNext, winner, draw, gameActive]);

  useEffect(() => {
    // Stop game when over
    if (winner || draw) setGameActive(false);
  }, [winner, draw]);

  // Responsive layout: handle show/hide controls on mobile
  useEffect(() => {
    function handleResize() {
      setShowControls(window.innerWidth < 400);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PUBLIC_INTERFACE
  // Status line
  let status;
  if (winner) {
    status = (
      <span>
        Winner: <span className="ttt-winner" style={{ color: ACCENT }}>{winner}</span>
      </span>
    );
  } else if (draw) {
    status = <span>It's a <span className="ttt-draw">draw!</span></span>;
  } else {
    status = (
      <span>
        Next move: <span className="ttt-turn" style={{ color: xIsNext ? PRIMARY : ACCENT }}>
          {xIsNext ? 'X' : 'O'}
        </span>
      </span>
    );
  }

  return (
    <div className="App tic-tac-toe-main-app">
      <header className="ttt-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <div className="ttt-controls">
          <span className="ttt-mode-label">Mode:</span>
          <button
            className={`ttt-btn${mode === "HUMAN2" ? " active" : ""}`}
            style={mode === "HUMAN2" ? {background: PRIMARY} : undefined}
            onClick={() => handleNewGame('HUMAN2')}
            disabled={mode === "HUMAN2" && gameActive}
          >
            2 Players
          </button>
          <button
            className={`ttt-btn${mode === "AI" ? " active" : ""}`}
            style={mode === "AI" ? {background: ACCENT} : undefined}
            onClick={() => handleNewGame('AI')}
            disabled={mode === "AI" && gameActive}
          >
            Play vs AI
          </button>
          <button
            className="ttt-btn ttt-reset"
            style={{ marginLeft: 12, background: '#eee', color: PRIMARY }}
            onClick={() => handleNewGame(mode)}
          >
            Reset
          </button>
        </div>
        <div className="ttt-status">{status}</div>
      </header>
      <main>
        <div className="ttt-board-container">
          <Board squares={squares} onClick={handleClick} winLine={winLine} />
        </div>
      </main>
      <footer className="ttt-footer">
        <p style={{ color: '#aaa', fontSize: 14, margin: 0}}>
          Modern React ⚛️ &bull; <span style={{color:PRIMARY}}>Primary</span>, <span style={{color:SECONDARY, background: '#333', borderRadius: 4, padding: '2px 6px'}}>Secondary</span>, <span style={{color:ACCENT}}>Accent</span>
        </p>
        <p style={{ fontSize: 13, color: "#bbb", margin: 0 }}>By KAVIA | Play again anytime!</p>
      </footer>
    </div>
  );
}

export default App;
