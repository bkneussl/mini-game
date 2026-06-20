// 🦆 Rubber Duck Debugging — Test-Version
// Steuere die Gummiente, schieße "Quacks" und zerleg die Bugs, bevor sie deinen Code fluten.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// ---- Spielzustand ----
const STATE = { START: "start", PLAYING: "playing", GAMEOVER: "gameover" };
let state = STATE.START;

let score = 0;
let lives = 3;
let highscore = Number(localStorage.getItem("rdd_highscore") || 0);

let bugs = [];
let quacks = [];
let spawnTimer = 0;
let elapsed = 0; // Sekunden, treibt die Schwierigkeit

// ---- Ente ----
const duck = {
  w: 56,
  h: 56,
  x: W / 2 - 28,
  y: H - 80,
  speed: 380, // px/s
};

// ---- Eingaben ----
const keys = {};
let shootCooldown = 0;

addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Spacebar"].includes(e.key)) {
    e.preventDefault();
  }
  keys[e.key] = true;

  if (e.key === "Enter") {
    if (state === STATE.START || state === STATE.GAMEOVER) startGame();
  }
  if ((e.key === " " || e.key === "Spacebar") && state === STATE.START) {
    startGame();
  }
});
addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function startGame() {
  state = STATE.PLAYING;
  score = 0;
  lives = 3;
  bugs = [];
  quacks = [];
  spawnTimer = 0;
  elapsed = 0;
  duck.x = W / 2 - duck.w / 2;
}

// ---- Spawning ----
function spawnBug() {
  const size = 38;
  bugs.push({
    x: Math.random() * (W - size),
    y: -size,
    w: size,
    h: size,
    speed: 60 + Math.random() * 40 + elapsed * 4, // wird mit der Zeit schneller
  });
}

function shoot() {
  quacks.push({
    x: duck.x + duck.w / 2 - 14,
    y: duck.y - 10,
    w: 28,
    h: 28,
    speed: 520,
  });
}

// ---- Kollision (AABB) ----
function hit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ---- Update ----
function update(dt) {
  if (state !== STATE.PLAYING) return;

  elapsed += dt;

  // Ente bewegen
  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) duck.x -= duck.speed * dt;
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) duck.x += duck.speed * dt;
  duck.x = Math.max(0, Math.min(W - duck.w, duck.x));

  // Schießen (mit kurzem Cooldown)
  shootCooldown -= dt;
  if ((keys[" "] || keys["Spacebar"]) && shootCooldown <= 0) {
    shoot();
    shootCooldown = 0.28;
  }

  // Quacks nach oben
  for (const q of quacks) q.y -= q.speed * dt;
  quacks = quacks.filter((q) => q.y + q.h > 0);

  // Bug-Spawn (Frequenz steigt leicht)
  spawnTimer -= dt;
  const spawnEvery = Math.max(0.45, 1.1 - elapsed * 0.02);
  if (spawnTimer <= 0) {
    spawnBug();
    spawnTimer = spawnEvery;
  }

  // Bugs nach unten
  for (const bug of bugs) bug.y += bug.speed * dt;

  // Treffer: Quack vs Bug
  for (const bug of bugs) {
    for (const q of quacks) {
      if (!bug.dead && !q.dead && hit(bug, q)) {
        bug.dead = true;
        q.dead = true;
        score++;
      }
    }
  }

  // Bug erreicht den Boden -> Leben weg
  for (const bug of bugs) {
    if (!bug.dead && bug.y + bug.h >= H) {
      bug.dead = true;
      lives--;
    }
  }

  bugs = bugs.filter((b) => !b.dead);
  quacks = quacks.filter((q) => !q.dead);

  if (lives <= 0) {
    state = STATE.GAMEOVER;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("rdd_highscore", String(highscore));
    }
  }
}

// ---- Zeichnen ----
function emoji(char, x, y, size) {
  ctx.font = `${size}px system-ui, "Apple Color Emoji", sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(char, x, y);
}

function drawHUD() {
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "20px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Bugs gefixt: ${score}`, 16, 14);

  ctx.textAlign = "right";
  ctx.fillText(`${"❤️".repeat(Math.max(0, lives))}`, W - 16, 12);
}

function drawCenteredLines(lines) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let y = H / 2 - (lines.length - 1) * 22;
  for (const l of lines) {
    ctx.fillStyle = l.color || "#f5f5f5";
    ctx.font = l.font || "22px system-ui, sans-serif";
    ctx.fillText(l.text, W / 2, y);
    y += l.gap || 44;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Hintergrund (dezenter Code-Look)
  ctx.fillStyle = "#11151c";
  ctx.fillRect(0, 0, W, H);

  if (state === STATE.PLAYING || state === STATE.GAMEOVER) {
    for (const bug of bugs) emoji("🐛", bug.x, bug.y, bug.h);
    for (const q of quacks) emoji("💬", q.x, q.y, q.h);
    emoji("🦆", duck.x, duck.y, duck.h);
    drawHUD();
  }

  if (state === STATE.START) {
    emoji("🦆", W / 2 - 40, H / 2 - 150, 80);
    drawCenteredLines([
      { text: "Rubber Duck Debugging", font: "bold 34px system-ui, sans-serif", color: "#ffd54a", gap: 50 },
      { text: "Die Bugs 🐛 fluten deinen Code. Erklär sie der Ente weg!", font: "18px system-ui, sans-serif", color: "#cfd6e0", gap: 38 },
      { text: "← →  bewegen     ·     Leertaste  quaken 💬", font: "18px system-ui, sans-serif", color: "#cfd6e0", gap: 50 },
      { text: "Enter / Leertaste zum Starten", font: "20px system-ui, sans-serif", color: "#7ee0a8" },
    ]);
  }

  if (state === STATE.GAMEOVER) {
    ctx.fillStyle = "rgba(10, 12, 16, 0.78)";
    ctx.fillRect(0, 0, W, H);
    drawCenteredLines([
      { text: "Game Over", font: "bold 38px system-ui, sans-serif", color: "#ff6b6b", gap: 52 },
      { text: `Bugs gefixt: ${score}`, font: "24px system-ui, sans-serif", gap: 38 },
      { text: `Highscore: ${highscore}`, font: "20px system-ui, sans-serif", color: "#ffd54a", gap: 52 },
      { text: "Enter zum Neustart", font: "20px system-ui, sans-serif", color: "#7ee0a8" },
    ]);
  }
}

// ---- Loop ----
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); // dt kappen (Tab-Wechsel etc.)
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
