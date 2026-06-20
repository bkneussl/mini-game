// Enten-Roulette — vereinfachtes Rad: 12 Zahlen + 1 Tigerente (das "Zéro").
// Setze auf Rot/Schwarz, Gerade/Ungerade (x2) oder Tigerente (x12).

import { COLORS, FONTS, clear, panel, text, drawTigerente, currency } from "../core/draw.js";

const MIN_BET = 25;
const BET_STEP = 25;
const SEGMENTS = 13; // Index 0 = Tigerente, 1..12 = Zahlen
const SEG = (Math.PI * 2) / SEGMENTS;
const REDS = new Set([1, 2, 5, 6, 9, 10]); // Rest (außer 0) ist Schwarz

const BETS = [
  { id: "red", label: "Rot", mult: 2, color: COLORS.wheel },
  { id: "black", label: "Schwarz", mult: 2, color: COLORS.stripe },
  { id: "even", label: "Gerade", mult: 2, color: COLORS.sky },
  { id: "odd", label: "Ungerade", mult: 2, color: COLORS.leafDark },
  { id: "duck", label: "Tigerente", mult: 12, color: COLORS.gold },
];

function colorOf(n) {
  if (n === 0) return "duck";
  return REDS.has(n) ? "red" : "black";
}

export function createRoulette(app) {
  const { ctx, W, H, wallet } = app;

  let bet = Math.min(50, Math.max(MIN_BET, wallet.get()));
  let activeBet = 0; // Index in BETS
  let phase = "bet"; // bet | spin | result
  let rot = 0;
  let vel = 0;
  let landed = null;
  let message = "Setz und dreh!";
  let outcome = "";
  let buttons = [];

  const cx = 270, cy = 300, R = 150;

  function spin() {
    if (phase === "spin") return;
    if (!wallet.trySpend(bet)) {
      message = "Zu wenig Tigerenten — Bitcoin-Shop!";
      return;
    }
    phase = "spin";
    outcome = "";
    landed = null;
    message = "";
    vel = 9 + Math.random() * 5;
  }

  function resolve() {
    // Segment unter dem Zeiger (oben = -90°)
    const a = ((-Math.PI / 2 - rot) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const idx = Math.floor(a / SEG) % SEGMENTS;
    landed = idx; // 0 = Tigerente, sonst Zahl
    const number = idx; // idx 1..12 ist die Zahl, 0 = Ente
    const bt = BETS[activeBet];

    let win = 0;
    if (bt.id === "duck") {
      if (idx === 0) win = bet * bt.mult;
    } else if (idx !== 0) {
      const col = colorOf(number);
      const ok =
        (bt.id === "red" && col === "red") ||
        (bt.id === "black" && col === "black") ||
        (bt.id === "even" && number % 2 === 0) ||
        (bt.id === "odd" && number % 2 === 1);
      if (ok) win = bet * bt.mult;
    }

    const where = idx === 0 ? "Tigerente" : `${number} (${colorOf(number) === "red" ? "Rot" : "Schwarz"})`;
    if (win > 0) {
      wallet.add(win);
      outcome = "win";
      message = `${where} — gewonnen! +${win - bet} Tigerenten`;
    } else {
      outcome = "lose";
      message = `${where} — verloren.`;
    }
    phase = "result";
  }

  function update(dt) {
    if (phase === "spin") {
      rot += vel * dt;
      vel *= Math.exp(-1.1 * dt);
      if (vel < 0.06) resolve();
    }
  }

  function drawWheel() {
    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < SEGMENTS; i++) {
      const a0 = i * SEG + rot;
      const a1 = a0 + SEG;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, a0, a1);
      ctx.closePath();
      ctx.fillStyle = i === 0 ? COLORS.gold : REDS.has(i) ? COLORS.wheel : COLORS.stripe;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = COLORS.ink;
      ctx.stroke();

      // Label
      const mid = a0 + SEG / 2;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(R * 0.72, 0);
      ctx.rotate(Math.PI / 2);
      if (i === 0) {
        drawTigerente(ctx, 0, -2, 12);
      } else {
        text(ctx, String(i), 0, 0, { font: `bold 16px ${FONTS.body}`, color: COLORS.cream, align: "center", baseline: "middle" });
      }
      ctx.restore();
    }

    // Nabe
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.paper;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.ink;
    ctx.stroke();
    ctx.restore();

    // Zeiger oben
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - R - 6);
    ctx.lineTo(cx + 14, cy - R - 6);
    ctx.lineTo(cx, cy - R + 16);
    ctx.closePath();
    ctx.fillStyle = COLORS.paper;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = COLORS.ink;
    ctx.stroke();
  }

  function btn(x, y, w, h, label, action, opts = {}) {
    const enabled = opts.enabled !== false;
    const sel = opts.selected;
    panel(ctx, x, y, w, h, 9, enabled ? (opts.fill || COLORS.gold) : "#3a4a33",
      sel ? COLORS.goldHi : COLORS.ink, sel ? 4 : 2);
    text(ctx, label, x + w / 2, y + h / 2, {
      font: `bold 15px ${FONTS.body}`, color: opts.textColor || COLORS.ink,
      align: "center", baseline: "middle",
    });
    buttons.push({ x, y, w, h, action, enabled });
  }

  function render() {
    clear(ctx, W, H, COLORS.felt);
    buttons = [];

    drawTigerente(ctx, 50, 46, 22);
    text(ctx, "Enten-Roulette", 92, 50, { font: `34px ${FONTS.display}`, color: COLORS.cream });
    panel(ctx, W - 210, 22, 186, 48, 12, COLORS.paper, COLORS.ink, 3);
    currency(ctx, W - 196, 46, wallet.get(), { r: 14, font: `900 22px ${FONTS.body}`, color: COLORS.ink });
    text(ctx, "Esc = Lobby", W - 117, 86, { font: `700 12px ${FONTS.body}`, color: COLORS.muted, align: "center" });

    drawWheel();

    // Setz-Panel rechts
    const px = 500, pw = 270;
    text(ctx, "Dein Einsatz", px, 130, { font: `20px ${FONTS.display}`, color: COLORS.cream });
    const spinning = phase === "spin";
    BETS.forEach((b, i) => {
      const y = 150 + i * 52;
      btn(px, y, pw, 42, `${b.label}   ×${b.mult}`, () => { if (!spinning) activeBet = i; },
        { selected: activeBet === i, fill: b.color, enabled: !spinning,
          textColor: b.id === "black" || b.id === "odd" ? COLORS.cream : COLORS.ink });
    });

    // Einsatzhöhe + SPIN
    const by = 150 + BETS.length * 52 + 8;
    btn(px, by, 46, 44, "−", () => { if (!spinning) bet = Math.max(MIN_BET, bet - BET_STEP); }, { enabled: !spinning });
    panel(ctx, px + 54, by, 100, 44, 9, COLORS.paper, COLORS.ink, 3);
    currency(ctx, px + 66, by + 22, bet, { r: 12, font: `900 18px ${FONTS.body}`, color: COLORS.ink });
    btn(px + 162, by, 46, 44, "+", () => { if (!spinning) bet = Math.min(wallet.get(), bet + BET_STEP); }, { enabled: !spinning });
    btn(px + 216, by, 54, 44, spinning ? "..." : "DREH", spin, { fill: COLORS.wheel, textColor: COLORS.cream, enabled: !spinning });

    // Nachricht
    const col = outcome === "lose" ? "#ffd0d0" : outcome === "win" ? "#cdeccd" : COLORS.cream;
    text(ctx, message, cx, cy + R + 50, { font: `bold 18px ${FONTS.body}`, color: col, align: "center" });

    if (phase === "result") {
      text(ctx, "Enter / DREH = nochmal", cx, cy + R + 78, { font: `700 13px ${FONTS.body}`, color: COLORS.muted, align: "center" });
    }
  }

  return {
    enter() { bet = Math.max(MIN_BET, Math.min(wallet.get(), bet)); },
    exit() {},
    update,
    render,
    onKeyDown(e) {
      if (e.key === "Escape") { app.goToLobby(); return; }
      if (phase === "spin") return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowDown") activeBet = (activeBet + 1) % BETS.length;
      else if (e.key === "ArrowUp") activeBet = (activeBet - 1 + BETS.length) % BETS.length;
      else if (e.key === "ArrowRight") bet = Math.min(wallet.get(), bet + BET_STEP);
      else if (e.key === "ArrowLeft") bet = Math.max(MIN_BET, bet - BET_STEP);
      else if (e.key === "Enter" || e.key === " ") spin();
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
