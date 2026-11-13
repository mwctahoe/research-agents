import { useReducer, useEffect, useCallback } from 'react';
import {
  GRID_SIZE,
  CELL_COUNT,
  BASE_TICK_MS,
  MIN_TICK_MS,
  SPEED_STEP_MS,
  MAX_INPUT_QUEUE_LENGTH,
  HIGH_SCORE_STORAGE_KEY,
  GAME_STATUS,
  INITIAL_SNAKE,
  INITIAL_FOOD,
  INITIAL_DIRECTION,
} from './constants';

export const loadHighScore = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 0;
    const raw = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
};

export const saveHighScore = (highScore) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(highScore));
  } catch {
    // Ignore storage quota or sandbox errors
  }
};

export const getTickIntervalMs = (score) =>
  Math.max(MIN_TICK_MS, BASE_TICK_MS - score * SPEED_STEP_MS);

export const isSameDirection = (a, b) => a.x === b.x && a.y === b.y;

export const isOppositeDirection = (a, b) => a.x + b.x === 0 && a.y + b.y === 0;

/**
 * Selects a random unoccupied cell on the grid in O(N) time (where N = cellCount^2).
 * Returns null when the snake occupies every cell on the board.
 */
export const spawnFood = (snake, cellCount = CELL_COUNT, rng = Math.random) => {
  const occupied = new Uint8Array(cellCount * cellCount);
  for (let i = 0; i < snake.length; i += 1) {
    const seg = snake[i];
    if (seg.x >= 0 && seg.x < cellCount && seg.y >= 0 && seg.y < cellCount) {
      occupied[seg.y * cellCount + seg.x] = 1;
    }
  }

  const available = [];
  for (let y = 0; y < cellCount; y += 1) {
    for (let x = 0; x < cellCount; x += 1) {
      if (occupied[y * cellCount + x] === 0) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * available.length);
  return available[index];
};

export const createInitialState = (highScore = 0, status = GAME_STATUS.IDLE) => ({
  snake: INITIAL_SNAKE.map((segment) => ({ ...segment })),
  food: { ...INITIAL_FOOD },
  lastMovedDirection: { ...INITIAL_DIRECTION },
  directionQueue: [],
  score: 0,
  highScore,
  status,
});

export const gameReducer = (state, action, rng = Math.random) => {
  switch (action.type) {
    case 'START': {
      if (state.status !== GAME_STATUS.IDLE) return state;
      return {
        ...state,
        status: GAME_STATUS.RUNNING,
      };
    }

    case 'TOGGLE_PAUSE': {
      if (state.status === GAME_STATUS.RUNNING) {
        return { ...state, status: GAME_STATUS.PAUSED };
      }
      if (state.status === GAME_STATUS.PAUSED) {
        return { ...state, status: GAME_STATUS.RUNNING };
      }
      return state;
    }

    case 'RESET': {
      const nextStatus = action.autoStart === false ? GAME_STATUS.IDLE : GAME_STATUS.RUNNING;
      return createInitialState(state.highScore, nextStatus);
    }

    case 'SET_DIRECTION': {
      const newDir = action.direction;
      if (!newDir) return state;

      if (state.status !== GAME_STATUS.RUNNING && state.status !== GAME_STATUS.IDLE) {
        return state;
      }

      const nextState =
        state.status === GAME_STATUS.IDLE
          ? { ...state, status: GAME_STATUS.RUNNING }
          : state;

      if (nextState.directionQueue.length >= MAX_INPUT_QUEUE_LENGTH) {
        return nextState;
      }

      const effectiveLastDir =
        nextState.directionQueue.length > 0
          ? nextState.directionQueue[nextState.directionQueue.length - 1]
          : nextState.lastMovedDirection;

      if (
        isSameDirection(effectiveLastDir, newDir) ||
        isOppositeDirection(effectiveLastDir, newDir)
      ) {
        return nextState;
      }

      return {
        ...nextState,
        directionQueue: [...nextState.directionQueue, { x: newDir.x, y: newDir.y }],
      };
    }

    case 'TICK': {
      if (state.status !== GAME_STATUS.RUNNING) return state;

      const [queuedDir, ...remainingQueue] = state.directionQueue;
      const moveDir = queuedDir || state.lastMovedDirection;

      const currentHead = state.snake[0];
      const newHead = {
        x: currentHead.x + moveDir.x,
        y: currentHead.y + moveDir.y,
      };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= CELL_COUNT ||
        newHead.y < 0 ||
        newHead.y >= CELL_COUNT
      ) {
        return {
          ...state,
          directionQueue: [],
          highScore: Math.max(state.highScore, state.score),
          status: GAME_STATUS.GAME_OVER,
        };
      }

      const isEating =
        state.food !== null && newHead.x === state.food.x && newHead.y === state.food.y;

      // Exclude the vacating tail segment when not growing on this tick
      const bodyToCheck = isEating ? state.snake : state.snake.slice(0, -1);
      const hitSelf = bodyToCheck.some(
        (segment) => segment.x === newHead.x && segment.y === newHead.y,
      );

      if (hitSelf) {
        return {
          ...state,
          directionQueue: [],
          highScore: Math.max(state.highScore, state.score),
          status: GAME_STATUS.GAME_OVER,
        };
      }

      const newSnake = isEating
        ? [newHead, ...state.snake]
        : [newHead, ...state.snake.slice(0, -1)];

      if (!isEating) {
        return {
          ...state,
          snake: newSnake,
          lastMovedDirection: moveDir,
          directionQueue: remainingQueue,
        };
      }

      const nextScore = state.score + 1;
      const nextHighScore = Math.max(state.highScore, nextScore);
      const nextFood = spawnFood(newSnake, CELL_COUNT, rng);

      if (nextFood === null) {
        return {
          ...state,
          snake: newSnake,
          food: null,
          lastMovedDirection: moveDir,
          directionQueue: [],
          score: nextScore,
          highScore: nextHighScore,
          status: GAME_STATUS.WON,
        };
      }

      return {
        ...state,
        snake: newSnake,
        food: nextFood,
        lastMovedDirection: moveDir,
        directionQueue: remainingQueue,
        score: nextScore,
        highScore: nextHighScore,
      };
    }

    default:
      return state;
  }
};

const useSnakeGame = () => {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(loadHighScore()),
  );

  const tickIntervalMs = getTickIntervalMs(state.score);

  useEffect(() => {
    saveHighScore(state.highScore);
  }, [state.highScore]);

  useEffect(() => {
    if (state.status !== GAME_STATUS.RUNNING) return undefined;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [state.status, tickIntervalMs]);

  const setDirection = useCallback((direction) => {
    dispatch({ type: 'SET_DIRECTION', direction });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);

  const resetGame = useCallback((autoStart = true) => {
    dispatch({ type: 'RESET', autoStart });
  }, []);

  return {
    gameState: {
      snake: state.snake,
      food: state.food,
      gridSize: GRID_SIZE,
      cellCount: CELL_COUNT,
    },
    score: state.score,
    highScore: state.highScore,
    status: state.status,
    tickIntervalMs,
    gameOver: state.status === GAME_STATUS.GAME_OVER,
    setDirection,
    startGame,
    togglePause,
    resetGame,
  };
};

export default useSnakeGame;
