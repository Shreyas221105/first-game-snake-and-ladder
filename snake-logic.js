export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 140;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(random = Math.random) {
  const snake = [
    { x: 2, y: 8 },
    { x: 1, y: 8 },
    { x: 0, y: 8 },
  ];

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: placeFood(snake, GRID_SIZE, random),
    score: 0,
    hasStarted: false,
    isPaused: false,
    isGameOver: false,
  };
}

export function queueDirection(state, nextDirection) {
  if (!(nextDirection in DIRECTION_VECTORS)) {
    return state;
  }

  const currentDirection = state.hasStarted ? state.pendingDirection : state.direction;
  if (OPPOSITE_DIRECTIONS[currentDirection] === nextDirection) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function stepGame(state, random = Math.random) {
  if (state.isGameOver) {
    return state;
  }

  const direction = state.pendingDirection;
  const movement = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + movement.x, y: head.y + movement.y };

  const hitsBoundary =
    nextHead.x < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y < 0 ||
    nextHead.y >= state.gridSize;

  if (hitsBoundary) {
    return {
      ...state,
      direction,
      hasStarted: true,
      isGameOver: true,
    };
  }

  const grows = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const nextSnake = [nextHead, ...state.snake];
  const trimmedSnake = grows ? nextSnake : nextSnake.slice(0, -1);

  if (hasSelfCollision(trimmedSnake)) {
    return {
      ...state,
      snake: trimmedSnake,
      direction,
      hasStarted: true,
      isGameOver: true,
    };
  }

  return {
    ...state,
    snake: trimmedSnake,
    direction,
    pendingDirection: direction,
    food: grows ? placeFood(trimmedSnake, state.gridSize, random) : state.food,
    score: grows ? state.score + 1 : state.score,
    hasStarted: true,
    isGameOver: false,
  };
}

export function placeFood(snake, gridSize, random = Math.random) {
  const occupied = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const availableCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        availableCells.push({ x, y });
      }
    }
  }

  if (availableCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * availableCells.length);
  return availableCells[index];
}

export function hasSelfCollision(snake) {
  const seen = new Set();

  for (const segment of snake) {
    const key = `${segment.x},${segment.y}`;
    if (seen.has(key)) {
      return true;
    }
    seen.add(key);
  }

  return false;
}
