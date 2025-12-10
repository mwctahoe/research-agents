import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400; // Assuming 400x400 canvas
const CELL_COUNT = CANVAS_SIZE / GRID_SIZE;

const useSnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Use a ref for direction to avoid closure issues in the interval
  const directionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const newHead = {
        x: prevSnake[0].x + directionRef.current.x,
        y: prevSnake[0].y + directionRef.current.y,
      };

      // Check collisions
      if (
        newHead.x < 0 ||
        newHead.x >= CELL_COUNT ||
        newHead.y < 0 ||
        newHead.y >= CELL_COUNT ||
        prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 1);
        spawnFood(newSnake);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver]);

  const spawnFood = (currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT),
      };
      // Make sure food doesn't spawn on snake
      const onSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!onSnake) break;
    }
    setFood(newFood);
  };

  useEffect(() => {
    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [moveSnake]);

  // Handle direction change safely (prevent 180 turns)
  const handleSetDirection = (newDir) => {
    setDirection((prevDir) => {
      if (prevDir.x !== 0 && newDir.x !== 0) return prevDir; // horizontal collision
      if (prevDir.y !== 0 && newDir.y !== 0) return prevDir; // vertical collision
      return newDir;
    });
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
  };

  return {
    gameState: { snake, food, gridSize: GRID_SIZE, cellCount: CELL_COUNT },
    direction,
    setDirection: handleSetDirection,
    score,
    gameOver,
    resetGame,
  };
};

export default useSnakeGame;
