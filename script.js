const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const snake = [{ x: 200, y: 200 }];
let direction = { x: gridSize, y: 0 };
let apple = spawnApple();

let lastAppleTime = Date.now();
let depressed = false;
let depressedSince = null;
let score = 0;
let pepTalksLeft = 2;

const quotes = [
  "Ayyoo enikku vishakkanu 🍽",
  "Enikk ini vayya 😩",
  "Entammo enthokke nadakkunnu 😭",
  "Apple kittiyillenkil njan povaa 😢",
  "Mone snake aan njan... human alla 😔",
  "Ithu enthonnu jeevitham 🤡",
  "Apple venda... oru pazhamengilum tharumoo...? 🍌"
];

let currentQuote = "😊 Snake is happy!";

document.addEventListener("keydown", (e) => {
  if (depressed && Math.random() < 0.7) return;

  switch (e.key) {
    case "ArrowUp": if (direction.y === 0) direction = { x: 0, y: -gridSize }; break;
    case "ArrowDown": if (direction.y === 0) direction = { x: 0, y: gridSize }; break;
    case "ArrowLeft": if (direction.x === 0) direction = { x: -gridSize, y: 0 }; break;
    case "ArrowRight": if (direction.x === 0) direction = { x: gridSize, y: 0 }; break;
  }
});

function gameLoop() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  snake.unshift(head);

  // Wrap around
  if (head.x < 0) head.x = canvas.width - gridSize;
  else if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - gridSize;
  else if (head.y >= canvas.height) head.y = 0;

  // Check collision with self
  if (snake.slice(1).some(p => p.x === head.x && p.y === head.y)) {
    gameOver("Snake got emotionally tangled 😵");
    return;
  }

  // Apple check
  if (head.x === apple.x && head.y === apple.y) {
    apple = spawnApple();
    lastAppleTime = Date.now();
    depressed = false;
    depressedSince = null;
    currentQuote = "😊 Snake is happy!";
    score++;
    document.getElementById("score").textContent = `🍎 Score: ${score}`;
  } else {
    snake.pop();
  }

  // Depression logic
  const timeSinceApple = (Date.now() - lastAppleTime) / 1000;
  if (timeSinceApple > 8) {
    if (!depressed) {
      depressed = true;
      depressedSince = Date.now();
      // Immediately show random sad quote when becoming depressed
      currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }

    const depressionDuration = (Date.now() - depressedSince) / 1000;
    
    if (depressionDuration > 30) {
      gameOver("💀 Snake died of chronic depression... too sad for too long");
      return;
    }
    
    if (depressionDuration > 6 && pepTalksLeft <= 0) {
      gameOver("💀 Snake gave up... no pep talks left 😭");
      return;
    }

    if (Math.random() < 0.05) {
      currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }
  } else {
    if (depressed) {
      currentQuote = "😊 Snake is happy!";
    }
    depressed = false;
    depressedSince = null;
  }

  document.getElementById("quote").textContent = currentQuote;

  draw();
  setTimeout(gameLoop, depressed ? 220 : 100);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Snake
  ctx.fillStyle = depressed ? "#555" : "lime";
  snake.forEach(s => {
    ctx.fillRect(s.x, s.y, gridSize, gridSize);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(s.x, s.y, gridSize, gridSize);
  });

  // Apple
  ctx.fillStyle = depressed ? "#800" : "red";
  ctx.beginPath();
  ctx.arc(apple.x + gridSize / 2, apple.y + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
}

function spawnApple() {
  let newApple;
  do {
    newApple = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
  } while (snake.some(segment => segment.x === newApple.x && segment.y === newApple.y));
  
  return newApple;
}

function gameOver(message) {
  clearCanvas();
  ctx.fillStyle = "red";
  ctx.font = "20px Courier New";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width/2, canvas.height/2);
  document.getElementById("quote").textContent = "Game Over.";
  document.getElementById("pepBtn").disabled = true;
}

function clearCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function givePepTalk() {
  if (!depressed || pepTalksLeft <= 0) return;

  depressed = false;
  depressedSince = null;
  lastAppleTime = Date.now();
  currentQuote = "🗣 Snake feels heard!";
  pepTalksLeft--;
  document.getElementById("pepBtn").textContent = `🗣 Pep Talk (${pepTalksLeft} left)`;

  if (pepTalksLeft === 0) {
    document.getElementById("pepBtn").disabled = true;
  }
}

// Initialize the game
document.getElementById("score").textContent = `🍎 Score: ${score}`;
document.getElementById("pepBtn").textContent = `🗣 Pep Talk (${pepTalksLeft} left)`;
gameLoop();