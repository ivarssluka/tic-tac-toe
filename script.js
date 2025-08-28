let gameMode = "pvc";
let currentPlayer = "X";
let computerStartsFirst = false;
let playerXStartsFirst = true;

const toggleModeBtn = document.getElementById("toggleModeBtn");
const currentModeDisplay = document.getElementById("currentMode");

const gameBoard = document.getElementById("gameBoard");
const gameStatus = document.getElementById("gameStatus");
const playerWins = document.getElementById("playerWins");
const computerWins = document.getElementById("computerWins");
const draws = document.getElementById("draws");
const totalGames = document.getElementById("totalGames");
const newGameBtn = document.getElementById("newGameBtn");
const resetStatsBtn = document.getElementById("resetStatsBtn");

let currentGameBoard = Array(9).fill(null);
let isGameCurrentlyActive = true;
let isProcessingMove = false;

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let gameStatistics = {
  player: 0,
  computer: 0,
  playerX: 0,
  playerO: 0,
  draws: 0,
  totalGames: 0,
};

function enablePlayerClicks() {
  [...gameBoard.children].forEach((cell) => {
    cell.addEventListener("click", handlePlayerMove);
  });
}

function disablePlayerClicks() {
  [...gameBoard.children].forEach((cell) => {
    cell.removeEventListener("click", handlePlayerMove);
  });
}

function toggleGameMode() {
  if (gameMode === "pvc") {
    gameMode = "pvp";
    toggleModeBtn.textContent = "Switch to PvC";
    currentModeDisplay.textContent = "Mode: Player vs Player";
  } else {
    gameMode = "pvc";
    toggleModeBtn.textContent = "Switch to PvP";
    currentModeDisplay.textContent = "Mode: Player vs Computer";
  }
  updateToggleButtonText();
  creategameBoard();
}

function togglePvPStarter() {
  playerXStartsFirst = !playerXStartsFirst;
  updateToggleButtonText();
  if (gameMode === "pvp") {
    creategameBoard();
  }
}

function toggleComputerStarter() {
  computerStartsFirst = !computerStartsFirst;
  updateToggleButtonText();
  if (gameMode === "pvc") {
    creategameBoard();
  }
}

function toggleStarter() {
  if (gameMode === "pvp") {
    togglePvPStarter();
  } else {
    toggleComputerStarter();
  }
}

function updateToggleButtonText() {
  const toggleStartBtn = document.getElementById("toggleStartBtn");
  if (toggleStartBtn) {
    if (gameMode === "pvp") {
      toggleStartBtn.textContent = playerXStartsFirst
        ? "'X' Starts"
        : "'O' Starts";

      if (!playerXStartsFirst) {
        toggleStartBtn.classList.add("switch");
      } else {
        toggleStartBtn.classList.remove("switch");
      }
    } else {
      toggleStartBtn.textContent = computerStartsFirst
        ? "Computer Starts"
        : "Player Starts";

      if (computerStartsFirst) {
        toggleStartBtn.classList.add("switch");
      } else {
        toggleStartBtn.classList.remove("switch");
      }
    }
  }
}

toggleModeBtn.addEventListener("click", toggleGameMode);

function creategameBoard() {
  gameBoard.innerHTML = "";
  currentGameBoard = Array(9).fill(null);
  isGameCurrentlyActive = true;
  isProcessingMove = false;
  currentPlayer = "X";

  if (gameMode === "pvp") {
    currentPlayer = playerXStartsFirst ? "X" : "O";
  }

  for (let i = 0; i < 9; i++) {
    const singleCell = document.createElement("div");
    singleCell.classList.add("cell");
    singleCell.dataset.index = i;
    gameBoard.appendChild(singleCell);
    if (gameMode === "pvp" || (gameMode === "pvc" && !computerStartsFirst)) {
      singleCell.addEventListener("click", handlePlayerMove);
    }
  }

  gameStatus.classList.remove("game-status-x-win");
  gameStatus.classList.remove("game-status-draw");
  gameStatus.classList.remove("game-status-o-win");

  [...gameBoard.children].forEach((cell) => {
    cell.classList.remove("winning-cell");
    cell.classList.remove("winning-cell-x");
    cell.classList.remove("winning-cell-o");
  });

  if (gameMode === "pvp") {
    gameStatus.textContent = `Player ${currentPlayer}'s turn - click a cell`;
    enablePlayerClicks();
  } else {
    if (computerStartsFirst) {
      gameStatus.textContent = "Computer is thinking...";
      setTimeout(() => {
        handleComputerMove();
      }, 1000);
    } else {
      gameStatus.textContent = "Your turn!";
      enablePlayerClicks();
    }
  }
}

function drawMarkOnBoard(boardPosition, playerMark) {
  const targetCell = gameBoard.children[boardPosition];

  if (targetCell.querySelector(".scanning")) return;
  const scanningAnimation = document.createElement("div");
  scanningAnimation.classList.add("scanning");
  targetCell.appendChild(scanningAnimation);

  setTimeout(() => {
    scanningAnimation.remove();
    const mark = document.createElement("span");
    mark.classList.add("mark");
    mark.textContent = playerMark;
    targetCell.appendChild(mark);
  }, 1000);
}

function handlePlayerMove(click) {
  const index = click.target.dataset.index;
  if (!isGameCurrentlyActive || currentGameBoard[index] || isProcessingMove)
    return;

  isProcessingMove = true;
  disablePlayerClicks();

  const playerMark = gameMode === "pvp" ? currentPlayer : "X";

  currentGameBoard[index] = playerMark;
  drawMarkOnBoard(index, playerMark);

  setTimeout(() => {
    if (determineWinner(playerMark)) {
      const winningCombo = getWinningCombination(playerMark);

      if (gameMode === "pvp") {
        gameStatus.textContent = `Player '${playerMark}' wins!`;
        if (playerMark === "X") {
          gameStatistics.playerX++;
          gameStatus.classList.add("game-status-x-win");
        } else {
          gameStatistics.playerO++;
          gameStatus.classList.add("game-status-o-win");
        }
      } else {
        gameStatus.textContent = "You win!";
        gameStatistics.player++;
      }

      if (winningCombo) {
        winningCombo.forEach((index) => {
          gameBoard.children[index].classList.add(
            "winning-cell",
            playerMark === "X" ? "winning-cell-x" : "winning-cell-o"
          );
        });
      }

      gameStatistics.totalGames++;
      isGameCurrentlyActive = false;
      updateStatistics();
      return;
    }

    if (isGameOver()) {
      gameStatus.textContent = "It's a draw!";
      gameStatus.classList.add("game-status-draw");
      gameStatistics.draws++;
      gameStatistics.totalGames++;
      isGameCurrentlyActive = false;
      updateStatistics();
      return;
    }

    if (gameMode === "pvp") {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      gameStatus.textContent = `Player ${currentPlayer}'s turn - click a cell`;
      isProcessingMove = false;
      enablePlayerClicks();
    } else {
      gameStatus.textContent = "Computer is thinking...";
      setTimeout(handleComputerMove, 500);
    }
  }, 1000);
}

function handleComputerMove() {
  function findCriticalMove(targetPlayer, count) {
    for (let combination of winningCombinations) {
      let [a, b, c] = combination;
      let positions = [
        currentGameBoard[a],
        currentGameBoard[b],
        currentGameBoard[c],
      ];

      let playerCount = positions.filter(
        (position) => position === targetPlayer
      ).length;
      let emptyCount = positions.filter((position) => position === null).length;

      if (playerCount === count && emptyCount === 1) {
        for (let i = 0; i < 3; i++) {
          if (currentGameBoard[combination[i]] === null) {
            return combination[i];
          }
        }
      }
    }
    return null;
  }

  if (!isGameCurrentlyActive) return;

  const emptyIndices = currentGameBoard
    .map((value, index) => (value === null ? index : null))
    .filter((index) => index !== null);
  if (emptyIndices.length === 0) return;

  let moveIndex = null;

  moveIndex = findCriticalMove("O", 2);

  if (moveIndex === null) {
    moveIndex = findCriticalMove("X", 2);
  }

  if (moveIndex === null) {
    const center = 4;
    const corners = [0, 2, 6, 8];
    const sides = [1, 3, 5, 7];

    if (currentGameBoard[center] === null) {
      moveIndex = center;
    } else {
      const freeCorners = corners.filter((i) => currentGameBoard[i] === null);
      if (freeCorners.length > 0) {
        moveIndex = freeCorners[Math.floor(Math.random() * freeCorners.length)];
      } else {
        const freeSides = sides.filter((i) => currentGameBoard[i] === null);
        moveIndex = freeSides[Math.floor(Math.random() * freeSides.length)];
      }
    }
  }

  currentGameBoard[moveIndex] = "O";
  drawMarkOnBoard(moveIndex, "O");

  setTimeout(() => {
    if (determineWinner("O")) {
      const winningCombo = getWinningCombination("O");
      gameStatus.textContent = "Computer wins!";
      gameStatus.classList.add("game-status-o-win");
      if (winningCombo) {
        winningCombo.forEach((index) => {
          gameBoard.children[index].classList.add(
            "winning-cell",
            "winning-cell-o"
          );
        });
      }
      gameStatistics.computer++;
      gameStatistics.totalGames++;
      isGameCurrentlyActive = false;
      updateStatistics();
      return;
    }

    if (isGameOver()) {
      gameStatus.textContent = "It's a draw!";
      gameStatus.classList.add("game-status-draw");
      gameStatistics.draws++;
      gameStatistics.totalGames++;
      isGameCurrentlyActive = false;
      updateStatistics();
      return;
    }

    gameStatus.textContent = "Your turn!";
    isProcessingMove = false;
    enablePlayerClicks();
  }, 1000);
}

function determineWinner(player) {
  return winningCombinations.some((combo) =>
    combo.every((index) => currentGameBoard[index] === player)
  );
}

function getWinningCombination(player) {
  for (let combo of winningCombinations) {
    if (combo.every((index) => currentGameBoard[index] === player)) {
      return combo;
    }
  }
  return null;
}

function isGameOver() {
  return currentGameBoard.every((cell) => cell !== null);
}

function updateStatistics() {
  if (gameMode === "pvp") {
    playerWins.textContent = gameStatistics.playerX;
    computerWins.textContent = gameStatistics.playerO;
  } else {
    playerWins.textContent = gameStatistics.player;
    computerWins.textContent = gameStatistics.computer;
  }
  draws.textContent = gameStatistics.draws;
  totalGames.textContent = gameStatistics.totalGames;
}

updateStatistics();

newGameBtn.addEventListener("click", creategameBoard);

resetStatsBtn.addEventListener("click", () => {
  gameStatistics = {
    player: 0,
    computer: 0,
    playerX: 0,
    playerO: 0,
    draws: 0,
    totalGames: 0,
  };
  updateStatistics();
});

const toggleStartBtn = document.getElementById("toggleStartBtn");
if (toggleStartBtn) {
  updateToggleButtonText();
  toggleStartBtn.addEventListener("click", toggleStarter);
}

creategameBoard();
