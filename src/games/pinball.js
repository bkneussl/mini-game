// Tigerenten-Pinball — einfacher Flipper-Tisch mit leichter Physik.
// Skill-Spiel: Score zahlt Tigerenten aus. Flipper: ← und →.

import { COLORS, FONTS, clear, panel, text, drawTigerente, drawCoin } from "../core/draw.js";

// Tischfeld
const FX = 280, FY = 110, FW = 240, FH = 470;
const BALL_R = 9;
const G = 1100; // Gravitation px/s²
const PAYOUT_DIV = 10;

export function createPinball(app) {
  const { ctx, W, H, wallet } = app;

  let phase = "start"; // start | playing | over
  let score = 0;
  let balls = 3;
  let payout = 0;
  let ball = { x: 0, y: 0, vx: 0, vy: 0 };

  const bumpers = [
    { x: FX + FW * 0.5, y: FY + 110, r: 22 },
    { x: FX + FW * 0.28, y: FY + 180, r: 18 },
    { x: FX + FW * 0.72, y: FY + 180, r: 18 },
  ];

  const L = 66;
  const left = { px: FX + 20, py: FY + FH - 54, ang: 0.5, key: false };
  const right = { px: FX + FW - 20, py: FY + FH - 54, ang: 0.5, key: false };

  function leftEnd() {
    return { x: left.px + L * Math.cos(left.ang), y: left.py + L * Math.sin(left.ang) };
  }
  function rightEnd() {
    return { x: right.px - L * Math.cos(right.ang), y: right.py + L * Math.sin(right.ang) };
  }

  function spawn() {
    ball = { x: FX + FW - 24, y: FY + 40, vx: -40 - Math.random() * 40, vy: 60 };
  }

  function start() {
    score = 0;
    balls = 3;
    payout = 0;
    spawn();
    phase = "playing";
  }

  function loseBall() {
    balls--;
    if (balls <= 0) {
      phase = "over";
      payout = Math.floor(score / PAYOUT_DIV);
      if (payout > 0) wallet.add(payout);
    } else {
      spawn();
    }
  }

  function reflect(vx, vy, nx, ny, rest) {
    const dot = vx * nx + vy * ny;
    return { vx: (vx - 2 * dot * nx) * rest, vy: (vy - 2 * dot * ny) * rest };
  }

  function closestOnSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return { x: ax + t * dx, y: ay + t * dy };
  }

  function flipperHit(fl, end) {
    const c = closestOnSeg(ball.x, ball.y, fl.px, fl.py, end.x, end.y);
    const dx = ball.x - c.x, dy = ball.y - c.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    if (dist < BALL_R + 6) {
      const nx = dx / dist, ny = dy / dist;
      ball.x = c.x + nx * (BALL_R + 6);
      ball.y = c.y + ny * (BALL_R + 6);
      const r = reflect(ball.vx, ball.vy, nx, ny, 0.7);
      ball.vx = r.vx;
      ball.vy = r.vy;
      if (fl.key) {
        // Kick nach oben
        ball.vy -= 420;
        ball.vx += nx * 160;
      }
    }
  }

  function update(dt) {
    if (phase !== "playing") return;
    dt = Math.min(dt, 0.024);

    // Flipper-Winkel zum Ziel bewegen
    const tgt = -0.5;
    left.ang += ((left.key ? tgt : 0.5) - left.ang) * Math.min(1, dt * 26);
    right.ang += ((right.key ? tgt : 0.5) - right.ang) * Math.min(1, dt * 26);

    ball.vy += G * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Wände
    if (ball.x < FX + BALL_R) { ball.x = FX + BALL_R; ball.vx = Math.abs(ball.vx) * 0.8; }
    if (ball.x > FX + FW - BALL_R) { ball.x = FX + FW - BALL_R; ball.vx = -Math.abs(ball.vx) * 0.8; }
    if (ball.y < FY + BALL_R) { ball.y = FY + BALL_R; ball.vy = Math.abs(ball.vy) * 0.8; }

    // Bumper
    for (const b of bumpers) {
      const dx = ball.x - b.x, dy = ball.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < b.r + BALL_R) {
        const nx = dx / (dist || 1), ny = dy / (dist || 1);
        ball.x = b.x + nx * (b.r + BALL_R);
        ball.y = b.y + ny * (b.r + BALL_R);
        const r = reflect(ball.vx, ball.vy, nx, ny, 0.95);
        ball.vx = r.vx + nx * 180;
        ball.vy = r.vy + ny * 180;
        score += 100;
      }
    }

    // Flipper
    flipperHit(left, leftEnd());
    flipperHit(right, rightEnd());

    // Geschwindigkeit begrenzen
    const sp = Math.hypot(ball.vx, ball.vy);
    if (sp > 900) { ball.vx *= 900 / sp; ball.vy *= 900 / sp; }

    // Abfluss
    if (ball.y > FY + FH + 30) loseBall();
  }

  function drawTable() {
    panel(ctx, FX - 10, FY - 10, FW + 20, FH + 20, 16, COLORS.leafDark, COLORS.ink, 4);

    // Abfluss-Markierung unten
    text(ctx, "ABFLUSS", FX + FW / 2, FY + FH + 2, { font: `700 11px ${FONTS.body}`, color: "#3a4a30", align: "center" });

    // Bumper
    for (const b of bumpers) {
      const g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, b.x, b.y, b.r);
      g.addColorStop(0, COLORS.goldHi);
      g.addColorStop(1, COLORS.gold);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = COLORS.ink;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.wheel;
      ctx.fill();
    }

    // Flipper
    drawFlipper(left.px, left.py, leftEnd());
    drawFlipper(right.px, right.py, rightEnd());

    // Ball
    if (phase === "playing" || phase === "over") drawCoin(ctx, ball.x, ball.y, BALL_R);
  }

  function drawFlipper(px, py, end) {
    ctx.lineCap = "round";
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.strokeStyle = COLORS.wheel;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  function render() {
    clear(ctx, W, H, COLORS.felt);

    drawTigerente(ctx, 50, 46, 22);
    text(ctx, "Tigerenten-Pinball", 92, 50, { font: `34px ${FONTS.display}`, color: COLORS.cream });

    // HUD
    panel(ctx, 40, 130, 210, 130, 12, COLORS.paper, COLORS.ink, 3);
    text(ctx, "PUNKTE", 60, 158, { font: `700 12px ${FONTS.body}`, color: COLORS.inkSoft });
    text(ctx, String(score), 60, 192, { font: `900 32px ${FONTS.body}`, color: COLORS.ink });
    text(ctx, "Kugeln", 60, 224, { font: `700 12px ${FONTS.body}`, color: COLORS.inkSoft });
    for (let i = 0; i < balls; i++) drawCoin(ctx, 64 + i * 26, 244, 10);

    panel(ctx, 40, 280, 210, 90, 12, COLORS.paper, COLORS.ink, 3);
    text(ctx, "Steuerung", 60, 306, { font: `700 12px ${FONTS.body}`, color: COLORS.inkSoft });
    text(ctx, "←  linker Flipper", 60, 330, { font: `15px ${FONTS.body}`, color: COLORS.ink });
    text(ctx, "→  rechter Flipper", 60, 352, { font: `15px ${FONTS.body}`, color: COLORS.ink });

    text(ctx, "Esc = Lobby", 145, 420, { font: `700 13px ${FONTS.body}`, color: COLORS.muted, align: "center" });

    drawTable();

    if (phase === "start") {
      overlay();
      text(ctx, "Tigerenten-Pinball", W / 2, 250, { font: `46px ${FONTS.display}`, color: COLORS.goldHi, align: "center" });
      text(ctx, "Halt die Kugel im Spiel — Bumper geben 100 Punkte.", W / 2, 300, { font: `17px ${FONTS.body}`, color: COLORS.cream, align: "center" });
      text(ctx, "← / →  flippern    ·    Punkte ÷ 10 = Tigerenten", W / 2, 330, { font: `16px ${FONTS.body}`, color: COLORS.cream, align: "center" });
      text(ctx, "Enter / Leertaste = Start", W / 2, 372, { font: `bold 18px ${FONTS.body}`, color: "#cdeccd", align: "center" });
    } else if (phase === "over") {
      overlay();
      text(ctx, "Alle Kugeln weg!", W / 2, 250, { font: `44px ${FONTS.display}`, color: "#ff9a9a", align: "center" });
      text(ctx, `${score} Punkte`, W / 2, 300, { font: `24px ${FONTS.body}`, color: COLORS.cream, align: "center" });
      text(ctx, `+${payout} Goldene Tigerenten`, W / 2, 336, { font: `26px ${FONTS.display}`, color: COLORS.goldHi, align: "center" });
      text(ctx, `Beutel: ${wallet.get()} Tigerenten`, W / 2, 368, { font: `16px ${FONTS.body}`, color: COLORS.cream, align: "center" });
      text(ctx, "Enter = nochmal    ·    Esc = Lobby", W / 2, 404, { font: `bold 17px ${FONTS.body}`, color: "#cdeccd", align: "center" });
    }
  }

  function overlay() {
    ctx.fillStyle = "rgba(20,30,16,0.74)";
    ctx.fillRect(0, 0, W, H);
  }

  return {
    enter() {},
    exit() {},
    update,
    render,
    onKeyDown(e) {
      if (e.key === "Escape") { app.goToLobby(); return; }
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (phase === "playing") {
        if (e.key === "ArrowLeft") left.key = true;
        else if (e.key === "ArrowRight") right.key = true;
      } else if (e.key === "Enter" || e.key === " ") start();
    },
    onKeyUp(e) {
      if (e.key === "ArrowLeft") left.key = false;
      else if (e.key === "ArrowRight") right.key = false;
    },
  };
}
