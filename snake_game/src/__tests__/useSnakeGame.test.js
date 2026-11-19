import { describe, it, expect } from 'vitest';
import {
  CELL_COUNT,
  DIRECTIONS,
  GAME_STATUS,
  BASE_TICK_MS,
  MIN_TICK_MS,
} from '../constants';
import {
  createInitialState,
  gameReducer,
  spawnFood,
  getTickIntervalMs,
} from '../useSnakeGame';

describe('gameReducer', () => {
  it('starts in IDLE state and transitions to RUNNING on START', () => {
    const initial = createInitialState(5);
    expect(initial.status).toBe(GAME_STATUS.IDLE);
    expect(initial.highScore).toBe(5);

    const started = gameReducer(initial, { type: 'START' });
    expect(started.status).toBe(GAME_STATUS.RUNNING);
  });

  it('moves the snake forward by one cell on TICK', () => {
    const initial = createInitialState(0, GAME_STATUS.RUNNING);
    const next = gameReducer(initial, { type: 'TICK' });

    expect(next.snake).toEqual([{ x: 11, y: 10 }]);
    expect(next.score).toBe(0);
    expect(next.status).toBe(GAME_STATUS.RUNNING);
  });

  it('prevents 180-degree self-collision on rapid double keypresses within a single tick', () => {
    // Snake moving RIGHT with body behind it
    const state = {
      ...createInitialState(0, GAME_STATUS.RUNNING),
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ],
      lastMovedDirection: DIRECTIONS.RIGHT,
      directionQueue: [],
    };

    // Rapidly press UP then LEFT before any TICK happens
    const afterUp = gameReducer(state, { type: 'SET_DIRECTION', direction: DIRECTIONS.UP });
    const afterLeft = gameReducer(afterUp, { type: 'SET_DIRECTION', direction: DIRECTIONS.LEFT });

    expect(afterLeft.directionQueue).toEqual([DIRECTIONS.UP, DIRECTIONS.LEFT]);

    // Tick 1: moves UP (safe)
    const afterTick1 = gameReducer(afterLeft, { type: 'TICK' });
    expect(afterTick1.status).toBe(GAME_STATUS.RUNNING);
    expect(afterTick1.snake[0]).toEqual({ x: 10, y: 9 });
    expect(afterTick1.lastMovedDirection).toEqual(DIRECTIONS.UP);

    // Tick 2: moves LEFT (safe, does not collide with body)
    const afterTick2 = gameReducer(afterTick1, { type: 'TICK' });
    expect(afterTick2.status).toBe(GAME_STATUS.RUNNING);
    expect(afterTick2.snake[0]).toEqual({ x: 9, y: 9 });
    expect(afterTick2.lastMovedDirection).toEqual(DIRECTIONS.LEFT);
  });

  it('ignores direct opposite direction or opposite reversal in queue', () => {
    const state = createInitialState(0, GAME_STATUS.RUNNING);
    // Moving RIGHT -> pressing LEFT should be ignored
    const afterLeft = gameReducer(state, { type: 'SET_DIRECTION', direction: DIRECTIONS.LEFT });
    expect(afterLeft.directionQueue).toEqual([]);

    // Moving RIGHT -> press UP then DOWN -> DOWN is opposite to UP and must be ignored
    const afterUp = gameReducer(state, { type: 'SET_DIRECTION', direction: DIRECTIONS.UP });
    const afterDown = gameReducer(afterUp, { type: 'SET_DIRECTION', direction: DIRECTIONS.DOWN });
    expect(afterDown.directionQueue).toEqual([DIRECTIONS.UP]);
  });

  it('allows moving into the cell vacated by the tail when not eating food', () => {
    // 2x2 loop where head at (5,5) moving UP enters (5,4) currently occupied by the tail
    const state = {
      ...createInitialState(0, GAME_STATUS.RUNNING),
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 4 },
        { x: 5, y: 4 },
      ],
      food: { x: 0, y: 0 },
      lastMovedDirection: DIRECTIONS.UP,
      directionQueue: [],
    };

    const next = gameReducer(state, { type: 'TICK' });
    expect(next.status).toBe(GAME_STATUS.RUNNING);
    expect(next.snake).toEqual([
      { x: 5, y: 4 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 4 },
    ]);
  });

  it('grows snake, increments score once, updates highScore, and spawns new food when eating', () => {
    const state = {
      ...createInitialState(0, GAME_STATUS.RUNNING),
      snake: [{ x: 10, y: 10 }],
      food: { x: 11, y: 10 },
      lastMovedDirection: DIRECTIONS.RIGHT,
    };

    const next = gameReducer(state, { type: 'TICK' }, () => 0);
    expect(next.snake).toEqual([
      { x: 11, y: 10 },
      { x: 10, y: 10 },
    ]);
    expect(next.score).toBe(1);
    expect(next.highScore).toBe(1);
    expect(next.food).not.toEqual({ x: 11, y: 10 });
    expect(next.food).not.toEqual({ x: 10, y: 10 });
  });

  it('transitions to GAME_OVER on wall collision and preserves highScore', () => {
    const state = {
      ...createInitialState(2, GAME_STATUS.RUNNING),
      snake: [{ x: CELL_COUNT - 1, y: 5 }],
      score: 4,
      highScore: 2,
      lastMovedDirection: DIRECTIONS.RIGHT,
    };

    const next = gameReducer(state, { type: 'TICK' });
    expect(next.status).toBe(GAME_STATUS.GAME_OVER);
    expect(next.highScore).toBe(4);
  });

  it('transitions to GAME_OVER on self-collision', () => {
    const state = {
      ...createInitialState(0, GAME_STATUS.RUNNING),
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
        { x: 6, y: 5 },
        { x: 6, y: 4 },
      ],
      food: { x: 0, y: 0 },
      lastMovedDirection: DIRECTIONS.RIGHT,
    };

    const next = gameReducer(state, { type: 'TICK' });
    expect(next.status).toBe(GAME_STATUS.GAME_OVER);
  });

  it('transitions to WON when snake fills the entire board', () => {
    // 2x2 test using spawnFood directly, and full 20x20 win condition in reducer
    const fullMinusOne = [];
    for (let y = 0; y < CELL_COUNT; y += 1) {
      for (let x = 0; x < CELL_COUNT; x += 1) {
        if (!(x === 0 && y === 0)) {
          fullMinusOne.push({ x, y });
        }
      }
    }
    // Place head adjacent to (0,0) moving LEFT from (1,0)
    const headIndex = fullMinusOne.findIndex((c) => c.x === 1 && c.y === 0);
    const [head] = fullMinusOne.splice(headIndex, 1);
    const snake = [head, ...fullMinusOne];

    const state = {
      ...createInitialState(0, GAME_STATUS.RUNNING),
      snake,
      food: { x: 0, y: 0 },
      lastMovedDirection: DIRECTIONS.LEFT,
      score: CELL_COUNT * CELL_COUNT - 2,
      highScore: 0,
    };

    const next = gameReducer(state, { type: 'TICK' });
    expect(next.status).toBe(GAME_STATUS.WON);
    expect(next.food).toBeNull();
    expect(next.snake.length).toBe(CELL_COUNT * CELL_COUNT);
    expect(next.score).toBe(CELL_COUNT * CELL_COUNT - 1);
  });

  it('toggles pause and freezes ticks while paused', () => {
    const running = createInitialState(0, GAME_STATUS.RUNNING);
    const paused = gameReducer(running, { type: 'TOGGLE_PAUSE' });
    expect(paused.status).toBe(GAME_STATUS.PAUSED);

    const tickedWhilePaused = gameReducer(paused, { type: 'TICK' });
    expect(tickedWhilePaused).toBe(paused);

    const resumed = gameReducer(paused, { type: 'TOGGLE_PAUSE' });
    expect(resumed.status).toBe(GAME_STATUS.RUNNING);
  });

  it('resets game while preserving highScore', () => {
    const over = {
      ...createInitialState(10, GAME_STATUS.GAME_OVER),
      score: 10,
      highScore: 10,
    };
    const reset = gameReducer(over, { type: 'RESET' });
    expect(reset.status).toBe(GAME_STATUS.RUNNING);
    expect(reset.score).toBe(0);
    expect(reset.highScore).toBe(10);
    expect(reset.snake).toEqual([{ x: 10, y: 10 }]);
  });
});

describe('spawnFood', () => {
  it('never spawns food on an occupied snake cell', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    const food = spawnFood(snake, 2, () => 0);
    expect(food).toEqual({ x: 1, y: 1 });
  });

  it('returns null when the board is completely full', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];
    expect(spawnFood(snake, 2)).toBeNull();
  });
});

describe('getTickIntervalMs', () => {
  it('decreases tick interval with score and clamps at MIN_TICK_MS', () => {
    expect(getTickIntervalMs(0)).toBe(BASE_TICK_MS);
    expect(getTickIntervalMs(10)).toBeLessThan(BASE_TICK_MS);
    expect(getTickIntervalMs(1000)).toBe(MIN_TICK_MS);
  });
});
