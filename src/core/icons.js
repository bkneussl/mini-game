// Unterscheidbare Gold-Vorschau-Icons je Spiel für die Lobby-Kacheln.
// drawGameIcon(ctx, id, cx, cy, s) — s ~ halbe Icon-Breite.

import { COLORS } from "./draw.js";

function card(ctx, x, y, w, h, rot, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = fill || COLORS.cream;
  ctx.strokeStyle = COLORS.black;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const r = 4;
  ctx.moveTo(-w / 2 + r, -h / 2);
  ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
  ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
  ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
  ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function pip(ctx, x, y, s, color, sym) {
  ctx.fillStyle = color;
  ctx.font = `bold ${s}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sym, x, y);
}

export function drawGameIcon(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.lineJoin = "round";
  const G = COLORS.gold, K = COLORS.black, E = COLORS.emerald, C = COLORS.crimson, CR = COLORS.cream;

  switch (id) {
    case "blackjack": {
      card(ctx, cx - s * 0.32, cy + s * 0.05, s * 0.78, s * 1.1, -0.22, CR);
      card(ctx, cx + s * 0.32, cy + s * 0.05, s * 0.78, s * 1.1, 0.22, CR);
      pip(ctx, cx + s * 0.36, cy + s * 0.05, s * 0.5, C, "A");
      pip(ctx, cx - s * 0.34, cy + s * 0.05, s * 0.45, K, "♠");
      break;
    }
    case "slots": {
      ctx.fillStyle = COLORS.panelHi;
      ctx.strokeStyle = G;
      ctx.lineWidth = 2.5;
      roundRect(ctx, cx - s, cy - s * 0.7, s * 2, s * 1.4, 5, true, true);
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = K;
        roundRect(ctx, cx + i * s * 0.62 - s * 0.26, cy - s * 0.5, s * 0.52, s * 1.0, 3, true, false);
        pip(ctx, cx + i * s * 0.62, cy, s * 0.55, G, "7");
      }
      break;
    }
    case "roulette": {
      ctx.strokeStyle = G;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * s * 0.3, cy + Math.sin(a) * s * 0.3);
        ctx.lineTo(cx + Math.cos(a) * s * 0.92, cy + Math.sin(a) * s * 0.92);
        ctx.stroke();
      }
      ctx.fillStyle = C;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = CR;
      ctx.beginPath();
      ctx.arc(cx + s * 0.66, cy - s * 0.5, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "higherlower": {
      card(ctx, cx - s * 0.1, cy, s * 0.9, s * 1.25, 0, CR);
      pip(ctx, cx - s * 0.1, cy, s * 0.55, K, "?");
      ctx.fillStyle = G;
      tri(ctx, cx + s * 0.7, cy - s * 0.35, s * 0.3, -1);
      ctx.fillStyle = C;
      tri(ctx, cx + s * 0.7, cy + s * 0.35, s * 0.3, 1);
      break;
    }
    case "duckdebug": {
      // Zielkreis + Käfer
      ctx.strokeStyle = G;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy);
      ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s);
      ctx.stroke();
      ctx.fillStyle = E;
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 0.32, s * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = K;
      ctx.lineWidth = 1.5;
      for (const sgn of [-1, 1]) {
        for (const oy of [-0.25, 0, 0.25]) {
          ctx.beginPath();
          ctx.moveTo(cx + sgn * s * 0.28, cy + oy * s);
          ctx.lineTo(cx + sgn * s * 0.6, cy + oy * s - sgn * 0.05 * s);
          ctx.stroke();
        }
      }
      break;
    }
    case "snake": {
      ctx.strokeStyle = G;
      ctx.lineWidth = s * 0.42;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.8, cy + s * 0.6);
      ctx.lineTo(cx + s * 0.2, cy + s * 0.6);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.1);
      ctx.lineTo(cx - s * 0.5, cy - s * 0.1);
      ctx.lineTo(cx - s * 0.5, cy - s * 0.7);
      ctx.stroke();
      ctx.fillStyle = CR; // Ei
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.6, cy - s * 0.5, s * 0.24, s * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "pinball": {
      // Flipper
      ctx.strokeStyle = C;
      ctx.lineWidth = s * 0.28;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.7, cy + s * 0.5); ctx.lineTo(cx - s * 0.1, cy + s * 0.85);
      ctx.moveTo(cx + s * 0.7, cy + s * 0.5); ctx.lineTo(cx + s * 0.1, cy + s * 0.85);
      ctx.stroke();
      ctx.fillStyle = G; // Bumper
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.35, s * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = CR; // Ball
      ctx.beginPath();
      ctx.arc(cx + s * 0.45, cy - s * 0.6, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "crash": {
      // Steigende Kurve + Ente
      ctx.strokeStyle = G;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.85, cy + s * 0.7);
      ctx.quadraticCurveTo(cx, cy + s * 0.6, cx + s * 0.7, cy - s * 0.7);
      ctx.stroke();
      ctx.fillStyle = C;
      ctx.beginPath();
      ctx.arc(cx + s * 0.72, cy - s * 0.72, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      // kleine Ente
      ctx.fillStyle = CR;
      ctx.beginPath();
      ctx.arc(cx + s * 0.72, cy - s * 0.72, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "shop": {
      // Chip-Stapel
      for (let i = 0; i < 3; i++) {
        const yy = cy + s * 0.5 - i * s * 0.38;
        ctx.fillStyle = i % 2 ? COLORS.crimson : COLORS.gold;
        ctx.strokeStyle = K;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, yy, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    default:
      ctx.fillStyle = G;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.6, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
}

function tri(ctx, x, y, s, dir) {
  ctx.beginPath();
  ctx.moveTo(x, y - dir * s * 0.6);
  ctx.lineTo(x - s * 0.6, y + dir * s * 0.4);
  ctx.lineTo(x + s * 0.6, y + dir * s * 0.4);
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
