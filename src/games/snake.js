// Enten-Snake — die Tigerente frisst goldene Münzen und wächst.
// Skill-Spiel: zahlt am Ende Tigerenten nach Score aus.

import { COLORS, FONTS, clear, panel, text, drawTigerente, drawCoin, currency } from "../core/draw.js";

const COLS = 26;
const ROWS = 17;
const CELL = 26;
const OX = (800 - COLS * CELL) / 2;
const OY = 118;
const PAYOUT = 8;

export function createSnake(app) {
  const { ctx, W, H, wallet } = app;

  let phase = "start"; // start | playing | over
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 0, y: 0 };
  let score = 0;
  let payout = 0;
  let stepTimer = 0;

  function step() {
    return Math.max(0.07, 0.15 - score * 0.004);
  }

  function placeFood() {
    let c;
    do {
      c = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 };
    } while (snake.some((s) => s.x === c.x && s.y === c.y));
    food = c;
  }

  function start() {
    const cy = (ROWS / 2) | 0;
    snake = [
      { x: 6, y: cy },
      { x: 5, y: cy },
      { x: 4, y: cy },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    payout = 0;
    stepTimer = 0;
    placeFood();
    phase = "playing";
  }

  function endGame() {
    phase = "over";
    payout = score * PAYOUT;
    if (payout > 0) wallet.add(payout);
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return endGame();
    if (snake.some((s) => s.x === head.x && s.y === head.y)) return endGame();

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      placeFood();
    } else {
      snake.pop();
    }
  }

  function update(dt) {
    if (phase !== "playing") return;
    stepTimer -= dt;
    if (stepTimer <= 0) {
      tick();
      stepTimer = step();
    }
  }

  function setDir(x, y) {
    // kein Umkehren in sich selbst
    if (dir.x === -x && dir.y === -y) return;
    nextDir = { x, y };
  }

  function cellRect(c) {
    return { x: OX + c.x * CELL, y: OY + c.y * CELL };
  }

  function render() {
    clear(ctx, W, H, COLORS.felt);

    drawTigerente(ctx, 50, 46, 22);
    text(ctx, "Enten-Snake", 92, 50, { font: `34px ${FONTS.display}`, color: COLORS.cream });
    panel(ctx, W - 210, 22, 186, 48, 12, COLORS.paper, COLORS.ink, 3);
    currency(ctx, W - 196, 46, wallet.get(), { r: 14, font: `900 22px ${FONTS.body}`, color: COLORS.ink });
    text(ctx, "Esc = Lobby", W - 117, 86, { font: `700 12px ${FONTS.body}`, color: COLORS.muted, align: "center" });
    text(ctx, `Münzen: ${score}`, 92, 86, { font: `700 15px ${FONTS.body}`, color: COLORS.gold });

    // Spielfeld
    panel(ctx, OX - 8, OY - 8, COLS * CELL + 16, ROWS * CELL + 16, 12, COLORS.leafDark, COLORS.ink, 3);

    // Futter (Münze)
    const f = cellRect(food);
    drawCoin(ctx, f.x + CELL / 2, f.y + CELL / 2, CELL * 0.38);

    // Schlange
    snake.forEach((s, i) => {
      const r = cellRect(s);
      if (i === 0) {
        drawTigerente(ctx, r.x + CELL / 2, r.y + CELL / 2, CELL * 0.4);
      } else {
        panel(ctx, r.x + 2, r.y + 2, CELL - 4, CELL - 4, 6, COLORS.tiger, COLORS.ink, 2);
        ctx.strokeStyle = COLORS.stripe;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(r.x + CELL * 0.5, r.y + 4);
        ctx.lineTo(r.x + CELL * 0.5, r.y + CELL - 4);
        ctx.stroke();
      }
    });

    if (phase === "start") {
      overlay();
      text(ctx, "Enten-Snake", W / 2, 250, { font: `46px ${FONTS.display}`, color: COLORS.goldHi, align: "center" });
      text(ctx, "Friss die goldenen Münzen und wachse — pro Münze +8 Tigerenten.", W / 2, 300, {
        font: `17px ${FONTS.body}`, color: COLORS.cream, align: "center",
      });
      text(ctx, "Pfeiltasten / WASD steuern", W / 2, 332, { font: `16px ${FONTS.body}`, color: COLORS.cream, align: "center" });
      text(ctx, "Enter / Leertaste = Start    ·    Esc = Lobby", W / 2, 372, {
        font: `bold 17px ${FONTS.body}`, color: "#cdeccd", align: "center",
      });
    } else if (phase === "over") {
      overlay();
      text(ctx, "Aufgegessen!", W / 2, 250, { font: `46px ${FONTS.display}`, color: "#ff9a9a", align: "center" });
      text(ctx, `${score} Münzen gefressen`, W / 2, 300, { font: `22px ${FONTS.body}`, color: COLORS.cream, align: "center" });
      text(ctx, `+${payout} Goldene Tigerenten`, W / 2, 336, { font: `26px ${FONTS.display}`, color: COLORS.goldHi, align: "center" });
      text(ctx, `Beutel: ${wallet.get()} Tigerenten`, W / 2, 368, { font: `16px ${FONTS.body}`, color: COLORS.cream, align: "center" });
      text(ctx, "Enter = nochmal    ·    Esc = Lobby", W / 2, 404, { font: `bold 17px ${FONTS.body}`, color: "#cdeccd", align: "center" });
    }
  }

  function overlay() {
    ctx.fillStyle = "rgba(20,30,16,0.78)";
    ctx.fillRect(0, 0, W, H);
  }

  return {
    enter() {},
    exit() {},
    update,
    render,
    onKeyDown(e) {
      if (e.key === "Escape") { app.goToLobby(); return; }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (phase === "playing") {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") setDir(0, -1);
        else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setDir(0, 1);
        else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") setDir(-1, 0);
        else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") setDir(1, 0);
      } else {
        if (e.key === "Enter" || e.key === " ") start();
      }
    },
    onKeyUp() {},
  };
}
