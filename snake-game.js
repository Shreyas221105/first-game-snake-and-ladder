import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  queueDirection,
  stepGame,
} from "./snake-logic.js";

const boardElement = document.querySelector("#game-board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#game-status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState();
let intervalId = null;

function renderBoard() {
  const snakeMap = new Map(
    state.snake.map((segment, index) => [`${segment.x},${segment.y}`, index]),
  );
  const fragment = document.createDocumentFragment();

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const cell = document.createElement("div");
      const snakeIndex = snakeMap.get(`${x},${y}`);

      cell.className = "cell";

      if (snakeIndex !== undefined) {
        cell.classList.add("cell--snake");
        if (snakeIndex === 0) {
          cell.classList.add("cell--head");
        }
      } else if (state.food && state.food.x === x && state.food.y === y) {
        cell.classList.add("cell--food");
      }

      cell.setAttribute("role", "gridcell");
      fragment.appendChild(cell);
    }
  }

  boardElement.replaceChildren(fragment);
}

function renderStatus() {
  scoreElement.textContent = String(state.score);

  if (state.isGameOver) {
    statusElement.textContent = "Game over. Press restart to play again.";
    return;
  }

  if (state.isPaused) {
    statusElement.textContent = "Paused. Press pause again or hit Space to continue.";
    return;
  }

  if (!state.hasStarted) {
    statusElement.textContent = "Use arrow keys or WASD to start.";
    return;
  }

  statusElement.textContent = "Collect food and avoid walls or yourself.";
}

function render() {
  pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
  renderBoard();
  renderStatus();
}

function stopLoop() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function tick() {
  state = stepGame(state);
  render();

  if (state.isGameOver) {
    stopLoop();
  }
}

function startLoop() {
  if (intervalId !== null || state.isGameOver || state.isPaused) {
    return;
  }

  intervalId = window.setInterval(tick, TICK_MS);
}

function updateDirection(direction) {
  if (state.isGameOver) {
    return;
  }

  if (state.isPaused) {
    state = { ...state, isPaused: false };
  }

  state = queueDirection(state, direction);
  render();
  startLoop();
}

function togglePause() {
  if (!state.hasStarted || state.isGameOver) {
    return;
  }

  state = { ...state, isPaused: !state.isPaused };

  if (state.isPaused) {
    stopLoop();
  } else {
    startLoop();
  }

  render();
}

function restartGame() {
  stopLoop();
  state = createInitialState();
  render();
}

function onKeyDown(event) {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    a: "left",
    A: "left",
    s: "down",
    S: "down",
    d: "right",
    D: "right",
  };

  const direction = keyMap[event.key];

  if (event.key === " " || event.key === "Spacebar" || event.key === "p" || event.key === "P") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (!direction) {
    return;
  }

  event.preventDefault();
  updateDirection(direction);
}

pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", restartGame);
document.addEventListener("keydown", onKeyDown);

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    updateDirection(button.dataset.direction);
  });
}

render();
