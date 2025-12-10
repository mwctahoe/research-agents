import React, { useState, useEffect, useRef } from 'react';
import useSnakeGame from './useSnakeGame';
import WebGLCanvas from './WebGLCanvas';

const App = () => {
  const { gameState, direction, setDirection, score, gameOver, resetGame } = useSnakeGame();

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 1, y: 0 });
          break;
        case 'r':
        case 'R':
          if (gameOver) resetGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection, gameOver, resetGame]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Snake Game (WebGL)</h1>
      <div style={{ position: 'relative', border: '2px solid #555' }}>
        <WebGLCanvas gameState={gameState} width={400} height={400} />
        {gameOver && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            color: 'red'
          }}>
            <h2>Game Over</h2>
            <p>Score: {score}</p>
            <p>Press 'R' to Restart</p>
          </div>
        )}
      </div>
      <p>Score: {score}</p>
      <p>Controls: Arrow Keys to move</p>
    </div>
  );
};

export default App;
