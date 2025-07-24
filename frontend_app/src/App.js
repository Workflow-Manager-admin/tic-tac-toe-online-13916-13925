import React, { useState, useEffect, useRef } from 'react';
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

/**
 * AICommentator - Generates playful commentary based on board state & moves.
 *
 * Props:
 *   - board: Array[9] with current squares.
 *   - lastMove: index of last played cell (null for game start/reset)
 *   - nextPlayer: "X" or "O"
 *   - winner, winLine, draw: various game results
 *   - mode: game mode
 */
function AICommentator({ board, lastMove, nextPlayer, winner, winLine, draw, mode }) {
  // Maintain history of comments
  const [commentaries, setCommentaries] = useState([]);
  const prevBoardRef = useRef(board);
  const prevWinnerRef = useRef(null);

  // PUBLIC_INTERFACE
  // Commentary generator for current context
  function generateComment({ board, lastMove, nextPlayer, winner, winLine, draw, mode }) {
    // Clever, fun lines, tailored to state.
    // For each scenario, give slightly different flavor.

    // Game start
    if (board.every((cell) => !cell) && lastMove == null) {
      return mode === "AI"
        ? "The crowd is buzzing! Can you outsmart the AI with your moves?"
        : "Classic face-off! X and O, let the best person win!";
    }
    // Just finished (draw or win)
    if (winner) {
      if (winner === "X") {
        return [
          "X claims victory! O will want a rematch.",
          "X takes the crown! 💪",
          "X is victorious! The board trembles."
        ][Math.floor(Math.random() * 3)];
      }
      if (winner === "O" && mode === "AI") {
        return [
          "O (the AI!) wins! Trickier than it looks.",
          "O with a cunning triumph! Can you beat AI next time?",
          "O prevails! Humans will return stronger.",
        ][Math.floor(Math.random() * 3)];
      }
      if (winner === "O") {
        return [
          "O scores! That was a strategic play.",
          "O wins! A big round of applause.",
          "O clinches the victory! Excitement all around.",
        ][Math.floor(Math.random() * 3)];
      }
    }
    if (draw) {
      return [
        "Nobody wins, but everybody played like a champ!",
        "A draw! What a balanced showdown.",
        "It's a tie game – the suspense continues...",
      ][Math.floor(Math.random() * 3)];
    }
    // Mid-game: after a move
    if (lastMove != null) {
      const marker = board[lastMove];
      const moveRow = Math.floor(lastMove / 3) + 1;
      const moveCol = (lastMove % 3) + 1;
      if (marker) {
        // Playful lines mixing taunts/praise/banter, slightly randomized
        if (marker === "X") {
          const lines = [
            `X drops the marker at (${moveRow},${moveCol}). Will O respond with style?`,
            "Bold move from X!",
            "X is plotting victory. O, don't blink!",
            "Strategy intensifies. What's X up to?"
          ];
          return lines[Math.floor(Math.random() * lines.length)];
        }
        if (marker === "O") {
          const lines = [
            `O moves at (${moveRow},${moveCol}). X, it's your turn to shine!`,
            "O is in the game! Will X retaliate?",
            "O takes charge! X needs to rethink their plan.",
            "Momentum shifts. O makes a statement."
          ];
          // Different message if AI mode and O is AI
          if (mode === "AI") {
            lines.push("The AI ponders... and O makes a move!");
            lines.push("O (the AI) seizes the moment. Are you worried?");
          }
          return lines[Math.floor(Math.random() * lines.length)];
        }
      }
    }
    // Fallback
    return [
      "Both players tread carefully. Who will strike first?",
      "Crowd murmurs, the tension rises...",
      "Smart play, let's see how it unfolds."
    ][Math.floor(Math.random() * 3)];
  }

  // Update commentary on game events or board changes
  useEffect(() => {
    // Avoid duplicate comment on re-render
    if (
      winner !== prevWinnerRef.current ||
      board.toString() !== prevBoardRef.current.toString()
    ) {
      const line = generateComment({ board, lastMove, nextPlayer, winner, winLine, draw, mode });
      setCommentaries((prev) =>
        prev.length > 0 && prev[prev.length - 1] === line
        ? prev
        : [...prev, line]
      );
      prevBoardRef.current = board;
      prevWinnerRef.current = winner;
    }
    // Reset on new game
    if ((board.every((cell) => !cell) && lastMove == null)) {
      setCommentaries([]);
    }
  // eslint-disable-next-line
  }, [board, lastMove, winner, draw, mode]);

  return (
    <div
      className="ai-commentator"
      style={{
        background: "var(--bg-secondary)",
        color: "var(--text-secondary)",
        borderRadius: 10,
        margin: "0 auto 12px auto",
        padding: "14px 20px 6px 20px",
        maxWidth: 420,
        minHeight: 38,
        fontStyle: "italic",
        fontSize: 16,
        letterSpacing: ".01em",
        boxShadow: "0 1.5px 6px #e7eef866",
        border: "1.5px solid var(--border-color)",
        textAlign: "center"
      }}
      aria-live="polite"
      tabIndex={0}
    >
      <span
        style={{
          fontWeight: "bold",
          marginRight: 7,
          color: "var(--color-primary)",
          fontSize: 18
        }}>🎙️
      </span>
      {commentaries.length === 0 ? (
        <span>Ready for some hot Tic Tac Toe action!</span>
      ) : (
        <span>{commentaries[commentaries.length - 1]}</span>
      )}
    </div>
  );
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

  // Track the last move for AI commentator
  const [lastMove, setLastMove] = useState(null); // index of last played cell

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
    setLastMove(idx);
  };

  // PUBLIC_INTERFACE
  // Handler: Start/reset game
  const handleNewGame = (optionalMode = mode) => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameActive(true);
    setMode(optionalMode);
    setLastMove(null);
  };

  // Play AI if needed
  useEffect(() => {
    if (mode === 'AI' && !winner && !draw && !xIsNext && gameActive) {
      const timeout = setTimeout(() => {
        const aiMove = getAIMove(squares);
        if (aiMove != null) {
          const next = squares.slice();
          next[aiMove] = 'O';
          setSquares(next);
          setXIsNext(true);
          setLastMove(aiMove);
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
        {/* AI Commentator feature */}
        <AICommentator
          board={squares}
          lastMove={lastMove}
          nextPlayer={xIsNext ? "X" : "O"}
          winner={winner}
          winLine={winLine}
          draw={draw}
          mode={mode}
        />
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
