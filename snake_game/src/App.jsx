import React, { useEffect } from 'react';
import useSnakeGame from './useSnakeGame';
import WebGLCanvas from './WebGLCanvas';
import { BASE_TICK_MS, CANVAS_SIZE, DIRECTIONS, GAME_STATUS } from './constants';

const KEY_TO_DIRECTION = {
  ArrowUp: DIRECTIONS.UP,
  w: DIRECTIONS.UP,
  W: DIRECTIONS.UP,
  ArrowDown: DIRECTIONS.DOWN,
  s: DIRECTIONS.DOWN,
  S: DIRECTIONS.DOWN,
  ArrowLeft: DIRECTIONS.LEFT,
  a: DIRECTIONS.LEFT,
  A: DIRECTIONS.LEFT,
  ArrowRight: DIRECTIONS.RIGHT,
  d: DIRECTIONS.RIGHT,
  D: DIRECTIONS.RIGHT,
};

const App = () => {
  const {
    gameState,
    score,
    highScore,
    status,
    tickIntervalMs,
    setDirection,
    startGame,
    togglePause,
    resetGame,
  } = useSnakeGame();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === ' '
      ) {
        e.preventDefault();
      }

      const nextDirection = KEY_TO_DIRECTION[e.key];
      if (nextDirection) {
        setDirection(nextDirection);
        return;
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (status === GAME_STATUS.IDLE) {
          startGame();
        } else if (status === GAME_STATUS.RUNNING || status === GAME_STATUS.PAUSED) {
          togglePause();
        } else if (e.key === ' ' && (status === GAME_STATUS.GAME_OVER || status === GAME_STATUS.WON)) {
          resetGame();
        }
        return;
      }

      if (e.key === 'Enter') {
        if (status === GAME_STATUS.IDLE) {
          startGame();
        } else if (status === GAME_STATUS.GAME_OVER || status === GAME_STATUS.WON) {
          resetGame();
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        if (
          status === GAME_STATUS.GAME_OVER ||
          status === GAME_STATUS.WON ||
          status === GAME_STATUS.PAUSED
        ) {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, setDirection, startGame, togglePause, resetGame]);

  const speedMultiplier = (BASE_TICK_MS / tickIntervalMs).toFixed(1);

  return (
    <main className="game-container">
      <header className="game-header">
        <h1 className="game-title">Snake Game (WebGL)</h1>
        <div className="hud-bar">
          <div className="hud-card">
            <span className="hud-label">Score</span>
            <span className="hud-value">{score}</span>
          </div>
          <div className="hud-card">
            <span className="hud-label">High Score</span>
            <span className="hud-value high-score">{highScore}</span>
          </div>
          <div className="hud-card">
            <span className="hud-label">Speed</span>
            <span className="hud-value">{speedMultiplier}x</span>
          </div>
        </div>
      </header>

      <div className="board-frame">
        <WebGLCanvas gameState={gameState} width={CANVAS_SIZE} height={CANVAS_SIZE} />

        {status === GAME_STATUS.IDLE && (
          <div className="board-overlay">
            <h2 className="overlay-title idle">Ready to Play</h2>
            <p className="overlay-subtitle">Press Arrow Keys, WASD, or Space to start</p>
            <div className="overlay-actions">
              <button type="button" className="btn btn-primary" onClick={startGame}>
                Start Game
              </button>
            </div>
          </div>
        )}

        {status === GAME_STATUS.PAUSED && (
          <div className="board-overlay">
            <h2 className="overlay-title paused">Paused</h2>
            <p className="overlay-subtitle">Press Space or P to resume</p>
            <div className="overlay-actions">
              <button type="button" className="btn btn-primary" onClick={togglePause}>
                Resume
              </button>
              <button type="button" className="btn" onClick={() => resetGame()}>
                Restart
              </button>
            </div>
          </div>
        )}

        {status === GAME_STATUS.GAME_OVER && (
          <div className="board-overlay">
            <h2 className="overlay-title game-over">Game Over</h2>
            <p className="overlay-subtitle">
              Final Score: {score} {score > 0 && score === highScore ? '· New High Score!' : ''}
            </p>
            <div className="overlay-actions">
              <button type="button" className="btn btn-primary" onClick={() => resetGame()}>
                Play Again
              </button>
            </div>
          </div>
        )}

        {status === GAME_STATUS.WON && (
          <div className="board-overlay">
            <h2 className="overlay-title won">You Won!</h2>
            <p className="overlay-subtitle">Board cleared! Final Score: {score}</p>
            <div className="overlay-actions">
              <button type="button" className="btn btn-primary" onClick={() => resetGame()}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="controls-bar">
        <p className="controls-hint">Move: Arrows / WASD · Pause: Space / P · Restart: R</p>
        {(status === GAME_STATUS.RUNNING || status === GAME_STATUS.PAUSED) && (
          <div className="controls-buttons">
            <button type="button" className="btn" onClick={togglePause}>
              {status === GAME_STATUS.PAUSED ? 'Resume' : 'Pause'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
