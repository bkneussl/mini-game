// Tigerenten-Slot — 3-Walzen-Automat. Setz-Spiel.
// 3 Gleiche zahlen nach Tabelle; 2 Tigerenten zahlen x2.

import { COLORS, FONTS, clear, panel, text, drawTigerente, currency } from "../core/draw.js";

const MIN_BET = 25;
const BET_STEP = 25;

// Symbole mit Gewicht (Häufigkeit) und Multiplikator für 3 Gleiche.
const SYMBOLS = [
  { id: "duck", weight: 1, mult: 20, kind: "duck" },
  { id: "seven", weight: 2, mult: 12, emoji: "7️⃣" },
  { id: "btc", weight: 2, mult: 8, emoji: "₿", color: COLORS.gold },
  { id: "bell", weight: 3, mult: 6, emoji: "🔔" },
  { id: "cherry", weight: 4, mult: 4, emoji: "🍒" },
  { id: "bug", weight: 5, mult: 2, emoji: "🐛" },
];

const STOP_AT = [0.7, 1.0, 1.35]; // gestaffeltes Stoppen der Walzen

export function createSlots(app) {
  const { ctx, W, H, wallet } = app;

  let bet = Math.min(50, Math.max(MIN_BET, wallet.get()));
  let phase = "idle"; // idle | spinning
  let t = 0;
  let final = [SYMBOLS[5], SYMBOLS[5], SYMBOLS[5]];
  let display = [SYMBOLS[5], SYMBOLS[5], SYMBOLS[5]];
  let flick = [0, 0, 0];
  let stopped = [true, true, true];
  let message = "Drück SPIN!";
  let win = 0;
  let buttons = [];

  const totalWeight = SYMBOLS.reduce((a, s) => a + s.weight, 0);

  function pick() {
    let r = Math.random() * totalWeight;
    for (const s of SYMBOLS) {
      r -= s.weight;
      if (r <= 0) return s;
    }
    return SYMBOLS[SYMBOLS.length - 1];
  }

  function randomSym() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }

  function spin() {
    if (phase === "spinning") return;
    if (!wallet.trySpend(bet)) {
      message = "Zu wenig Enten — Bitcoin-Shop!";
      return;
    }
    phase = "spinning";
    t = 0;
    win = 0;
    message = "";
    final = [pick(), pick(), pick()];
    stopped = [false, false, false];
    flick = [0, 0, 0];
  }

  function evaluate() {
    const [a, b, c] = final;
    if (a.id === b.id && b.id === c.id) {
      win = bet * a.mult;
      message = a.id === "duck" ? `JACKPOT!  +${win - bet} Tigerenten` : `3× ${labelOf(a)}!  +${win - bet} Tigerenten`;
    } else {
      const ducks = final.filter((s) => s.id === "duck").length;
      if (ducks === 2) {
        win = bet * 2;
        message = `2 Tigerenten!  +${win - bet} Tigerenten`;
      } else {
        win = 0;
        message = "Kein Gewinn — nochmal!";
      }
    }
    if (win > 0) wallet.add(win);
  }

  function labelOf(s) {
    return s.kind === "duck" ? "Tigerente" : s.emoji;
  }

  function update(dt) {
    if (phase !== "spinning") return;
    t += dt;
    let allStopped = true;
    for (let i = 0; i < 3; i++) {
      if (t >= STOP_AT[i]) {
        display[i] = final[i];
        stopped[i] = true;
      } else {
        allStopped = false;
        flick[i] -= dt;
        if (flick[i] <= 0) {
          display[i] = randomSym();
          flick[i] = 0.06;
        }
      }
    }
    if (allStopped) {
      phase = "idle";
      evaluate();
    }
  }

  function drawSymbol(s, cx, cy, size) {
    if (s.kind === "duck") {
      drawTigerente(ctx, cx, cy - size * 0.1, size * 0.42);
    } else {
      ctx.font = `${size}px system-ui, "Apple Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = s.color || COLORS.white;
      ctx.fillText(s.emoji, cx, cy);
    }
  }

  function btn(x, y, w, h, label, action, opts = {}) {
    const enabled = opts.enabled !== false;
    panel(ctx, x, y, w, h, 10, enabled ? (opts.fill || COLORS.gold) : "#2a3a33",
      enabled ? (opts.stroke || COLORS.goldDark) : "#1d2a25", 2);
    text(ctx, label, x + w / 2, y + h / 2, {
      font: "bold 18px system-ui, sans-serif",
      color: enabled ? COLORS.ink : COLORS.muted,
      align: "center", baseline: "middle",
    });
    buttons.push({ x, y, w, h, action, enabled });
  }

  function render() {
    clear(ctx, W, H, COLORS.felt);
    buttons = [];

    drawTigerente(ctx, 50, 46, 22);
    text(ctx, "Tigerenten-Slot", 92, 50, { font: `34px ${FONTS.display}`, color: COLORS.cream });
    panel(ctx, W - 210, 22, 186, 48, 12, COLORS.paper, COLORS.ink, 3);
    currency(ctx, W - 196, 46, wallet.get(), { r: 14, font: `900 22px ${FONTS.body}`, color: COLORS.ink });
    text(ctx, "Esc = Lobby", W - 117, 86, { font: `700 12px ${FONTS.body}`, color: COLORS.muted, align: "center" });

    // Walzen
    const rw = 150, rh = 150, gap = 26;
    const totalW = rw * 3 + gap * 2;
    const startX = W / 2 - totalW / 2;
    const ry = 150;
    for (let i = 0; i < 3; i++) {
      const x = startX + i * (rw + gap);
      panel(ctx, x, ry, rw, rh, 14, COLORS.feltDark, stopped[i] ? COLORS.gold : "#0a261c", 3);
      drawSymbol(display[i], x + rw / 2, ry + rh / 2, 84);
    }

    // Gewinnlinie
    ctx.strokeStyle = "rgba(255,207,63,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX - 10, ry + rh / 2);
    ctx.lineTo(startX + totalW + 10, ry + rh / 2);
    ctx.stroke();

    // Nachricht
    const col = win > 0 ? "#7ee0a8" : COLORS.cream;
    text(ctx, message, W / 2, ry + rh + 50, { font: "bold 22px system-ui, sans-serif", color: col, align: "center" });

    // Paytable
    text(ctx, "3× Ente = x20   ·   7️⃣ x12   ·   ₿ x8   ·   🔔 x6   ·   🍒 x4   ·   🐛 x2   ·   2× Ente = x2", W / 2, ry + rh + 84, {
      font: `700 12px ${FONTS.body}`, color: COLORS.cream, align: "center",
    });

    // Steuerung
    const by = 510;
    const spinning = phase === "spinning";
    btn(W / 2 - 200, by, 50, 46, "−", () => { if (!spinning) bet = Math.max(MIN_BET, bet - BET_STEP); }, { enabled: !spinning });
    panel(ctx, W / 2 - 140, by, 130, 46, 10, COLORS.paper, COLORS.ink, 3);
    currency(ctx, W / 2 - 118, by + 23, bet, { r: 13, font: `900 20px ${FONTS.body}`, color: COLORS.ink });
    btn(W / 2 - 0, by, 50, 46, "+", () => { if (!spinning) bet = Math.min(wallet.get(), bet + BET_STEP); }, { enabled: !spinning });
    btn(W / 2 + 70, by, 150, 46, spinning ? "..." : "SPIN", spin, { fill: COLORS.red, stroke: COLORS.redDark, enabled: !spinning });
  }

  return {
    enter() {},
    exit() {},
    update,
    render,
    onKeyDown(e) {
      if (e.key === "Escape") { app.goToLobby(); return; }
      if (phase === "spinning") return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") bet = Math.min(wallet.get(), bet + BET_STEP);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") bet = Math.max(MIN_BET, bet - BET_STEP);
      else if (e.key === "Enter" || e.key === " ") spin();
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
    },
    onKeyUp() {},
    onMouseDown(p) {
      for (const b of buttons) {
        if (b.enabled !== false && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
          b.action();
          return;
        }
      }
    },
  };
}
