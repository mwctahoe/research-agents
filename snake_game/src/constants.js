export const GRID_SIZE = 20;
export const CANVAS_SIZE = 400;
export const CELL_COUNT = CANVAS_SIZE / GRID_SIZE;

export const BASE_TICK_MS = 150;
export const MIN_TICK_MS = 65;
export const SPEED_STEP_MS = 3;

export const MAX_INPUT_QUEUE_LENGTH = 2;
export const HIGH_SCORE_STORAGE_KEY = 'snake_game_high_score';

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const GAME_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  WON: 'won',
};

export const INITIAL_SNAKE = [{ x: 10, y: 10 }];
export const INITIAL_FOOD = { x: 15, y: 15 };
export const INITIAL_DIRECTION = DIRECTIONS.RIGHT;
