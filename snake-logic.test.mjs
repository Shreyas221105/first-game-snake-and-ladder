import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  placeFood,
  queueDirection,
  stepGame,
} from "../src/snake-logic.js";

test("moves the snake one cell in the current direction", () => {
  const state = createInitialState(() => 0);
  const nextState = stepGame(state, () => 0);

  assert.deepEqual(nextState.snake[0], { x: 3, y: 8 });
  assert.equal(nextState.snake.length, 3);
  assert.equal(nextState.hasStarted, true);
});

test("grows and increments score after eating food", () => {
  const state = {
    ...createInitialState(() => 0),
    food: { x: 3, y: 8 },
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.score, 1);
  assert.equal(nextState.snake.length, 4);
  assert.notDeepEqual(nextState.food, { x: 3, y: 8 });
});

test("prevents immediate reversal into the opposite direction", () => {
  const state = createInitialState(() => 0);
  const queued = queueDirection(state, "left");

  assert.equal(queued.pendingDirection, "right");
});

test("ends the game when hitting a boundary", () => {
  const state = {
    ...createInitialState(() => 0),
    snake: [{ x: 15, y: 8 }, { x: 14, y: 8 }, { x: 13, y: 8 }],
    direction: "right",
    pendingDirection: "right",
  };

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.isGameOver, true);
});

test("places food on an unoccupied cell", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = placeFood(snake, 4, () => 0);

  assert.deepEqual(food, { x: 3, y: 0 });
});
