// Arcade-Automat: "Rubber Duck Debugging" — als Casino-Szene.
// Skill-Spiel: zahlt am Ende Goldene Gummienten nach Score aus.

import { COLORS, clear, text, drawTigerente } from "../core/draw.js";

const PAYOUT_PER_BUG = 5; // Enten pro gefixtem Bug

export function createDuckDebug(app) {
  const { ctx, W, H, wallet } = app;

  const STATE = { START: "start", PLAYING: "playing", GAMEOVER: "gameover" };
  let state = STATE.START;

  let score = 0;
  let lives = 3;
  let payout = 0;

  let bugs = [];
  let quacks = [];
  let spawnTimer = 0;
  let elapsed = 0;
  let shootCooldown = 0;

  const keys = {};
  const duck = { w: 56, h: 56, x: W / 2 - 28, y: H - 80, speed: 380 };

  function startGame() {
    state = STATE.PLAYING;
    score = 0;
    lives = 3;
    payout = 0;
    bugs = [];
    quacks = [];
    spawnTimer = 0;
    elapsed = 0;
    duck.x = W / 2 - duck.w / 2;
  }

  function spawnBug() {
    const size = 38;
    bugs.push({
      x: Math.random() * (W - size),
      y: -size,
      w: size,
      h: size,
      speed: 60 + Math.random() * 40 + elapsed * 4,
    });
  }

  function shoot() {
    quacks.push({ x: duck.x + duck.w / 2 - 14, y: duck.y - 10, w: 28, h: 28, speed: 520 });
  }

  function hit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function endGame() {
    state = STATE.GAMEOVER;
    payout = score * PAYOUT_PER_BUG;
    if (payout > 0) wallet.add(payout);
  }

  function update(dt) {
    if (state !== STATE.PLAYING) return;
    elapsed += dt;

    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) duck.x -= duck.speed * dt;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) duck.x += duck.speed * dt;
    duck.x = Math.max(0, Math.min(W - duck.w, duck.x));

    shootCooldown -= dt;
    if ((keys[" "] || keys["Spacebar"]) && shootCooldown <= 0) {
      shoot();
      shootCooldown = 0.28;
    }

    for (const q of quacks) q.y -= q.speed * dt;
    quacks = quacks.filter((q) => q.y + q.h > 0);

    spawnTimer -= dt;
    const spawnEvery = Math.max(0.45, 1.1 - elapsed * 0.02);
    if (spawnTimer <= 0) {
      spawnBug();
      spawnTimer = spawnEvery;
    }

    for (const bug of bugs) bug.y += bug.speed * dt;

    for (const bug of bugs) {
      for (const q of quacks) {
        if (!bug.dead && !q.dead && hit(bug, q)) {
          bug.dead = true;
          q.dead = true;
          score++;
        }
      }
    }
    for (const bug of bugs) {
      if (!bug.dead && bug.y + bug.h >= H) {
        bug.dead = true;
        lives--;
      }
    }
    bugs = bugs.filter((b) => !b.dead);
    quacks = quacks.filter((q) => !q.dead);

    if (lives <= 0) endGame();
  }

  function emoji(char, x, y, size) {
    ctx.font = `${size}px system-ui, "Apple Color Emoji", sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = COLORS.white;
    ctx.fillText(char, x, y);
  }

  function centered(lines) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let y = H / 2 - (lines.length - 1) * 24;
    for (const l of lines) {
      ctx.fillStyle = l.color || COLORS.cream;
      ctx.font = l.font || "22px system-ui, sans-serif";
      ctx.fillText(l.text, W / 2, y);
      y += l.gap || 46;
    }
  }

  function render() {
    clear(ctx, W, H, "#11151c");

    if (state === STATE.PLAYING || state === STATE.GAMEOVER) {
      for (const bug of bugs) emoji("🐛", bug.x, bug.y, bug.h);
      for (const q of quacks) emoji("💬", q.x, q.y, q.h);
      emoji("🦆", duck.x, duck.y, duck.h);

      text(ctx, `Bugs gefixt: ${score}`, 16, 26, { font: "20px system-ui, sans-serif", color: COLORS.white });
      text(ctx, "❤️".repeat(Math.max(0, lives)), W - 16, 24, { align: "right", font: "20px system-ui" });
      text(ctx, "Esc = Lobby", W - 16, 52, { align: "right", font: "13px system-ui, sans-serif", color: COLORS.muted });
    }

    if (state === STATE.START) {
      drawTigerente(ctx, W / 2 - 10, H / 2 - 150, 44);
      centered([
        { text: "Rubber Duck Debugging", font: "bold 34px system-ui, sans-serif", color: COLORS.gold, gap: 52 },
        { text: "Bugs 🐛 fluten deinen Code. Erklär sie der Ente weg!", font: "18px system-ui, sans-serif", color: COLORS.cream, gap: 38 },
        { text: "← →  bewegen   ·   Leertaste  quaken 💬   ·   pro Bug +5 Enten", font: "17px system-ui, sans-serif", color: COLORS.cream, gap: 50 },
        { text: "Enter / Leertaste = Start    ·    Esc = Lobby", font: "18px system-ui, sans-serif", color: "#7ee0a8" },
      ]);
    }

    if (state === STATE.GAMEOVER) {
      ctx.fillStyle = "rgba(10,12,16,0.78)";
      ctx.fillRect(0, 0, W, H);
      centered([
        { text: "Game Over", font: "bold 38px system-ui, sans-serif", color: "#ff6b6b", gap: 50 },
        { text: `Bugs gefixt: ${score}`, font: "24px system-ui, sans-serif", gap: 40 },
        { text: `+${payout} 🦆 Goldene Gummienten`, font: "22px system-ui, sans-serif", color: COLORS.gold, gap: 34 },
        { text: `Konto: ${wallet.get()} 🦆`, font: "18px system-ui, sans-serif", color: COLORS.cream, gap: 50 },
        { text: "Enter = nochmal    ·    Esc = Lobby", font: "18px system-ui, sans-serif", color: "#7ee0a8" },
      ]);
    }
  }

  return {
    enter() {},
    exit() {},
    update,
    render,
    onKeyDown(e) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Spacebar"].includes(e.key)) e.preventDefault();
      keys[e.key] = true;
      if (e.key === "Escape") {
        app.goToLobby();
        return;
      }
      if (e.key === "Enter" && (state === STATE.START || state === STATE.GAMEOVER)) startGame();
      if ((e.key === " " || e.key === "Spacebar") && state === STATE.START) startGame();
    },
    onKeyUp(e) {
      keys[e.key] = false;
    },
  };
}
