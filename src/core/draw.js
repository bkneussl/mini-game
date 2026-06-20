// Gemeinsame Zeichen-Helfer + Casino-Palette + Tigerenten-Maskottchen.

export const COLORS = {
  felt: "#0d3b2e",
  feltLight: "#155c45",
  feltDark: "#082017",
  gold: "#ffcf3f",
  goldDark: "#c9991f",
  cream: "#fdf3d7",
  red: "#c0223a",
  redDark: "#7e0f22",
  ink: "#0d1117",
  white: "#ffffff",
  muted: "#9fb3aa",
  black: "#1a1a1a",
  stripe: "#1a1a1a",
};

export function clear(ctx, W, H, color = COLORS.felt) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
}

export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function panel(ctx, x, y, w, h, r, fill, stroke, lineWidth = 2) {
  roundRectPath(ctx, x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function text(ctx, str, x, y, opts = {}) {
  const {
    font = "20px system-ui, sans-serif",
    color = COLORS.cream,
    align = "left",
    baseline = "alphabetic",
  } = opts;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

// Zeichnet eine Tigerente (gelb, schwarze Streifen) — Maskottchen & Währungssymbol.
// cx/cy = Mittelpunkt des Körpers, s = Körperradius (px).
export function drawTigerente(ctx, cx, cy, s) {
  ctx.save();

  // Körper
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.ellipse(cx, cy, s, s * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Streifen auf dem Körper (auf Körper geclippt)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, s, s * 0.72, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = COLORS.stripe;
  ctx.lineWidth = Math.max(2, s * 0.12);
  ctx.lineCap = "round";
  for (let i = -2; i <= 2; i++) {
    const ox = cx + i * s * 0.42 - s * 0.1;
    ctx.beginPath();
    ctx.moveTo(ox, cy - s * 0.7);
    ctx.quadraticCurveTo(ox + s * 0.18, cy, ox, cy + s * 0.7);
    ctx.stroke();
  }
  ctx.restore();

  // Kopf
  const hx = cx + s * 0.62;
  const hy = cy - s * 0.62;
  const hr = s * 0.5;
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.fill();

  // Kopf-Streifen
  ctx.strokeStyle = COLORS.stripe;
  ctx.lineWidth = Math.max(1.5, s * 0.1);
  ctx.beginPath();
  ctx.arc(hx, hy, hr * 0.95, -Math.PI * 0.85, -Math.PI * 0.25);
  ctx.stroke();

  // Schnabel
  ctx.fillStyle = "#f0892b";
  ctx.beginPath();
  ctx.moveTo(hx + hr * 0.5, hy - hr * 0.05);
  ctx.lineTo(hx + hr * 1.5, hy + hr * 0.05);
  ctx.lineTo(hx + hr * 0.55, hy + hr * 0.45);
  ctx.closePath();
  ctx.fill();

  // Auge
  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.arc(hx + hr * 0.18, hy - hr * 0.18, Math.max(1.5, s * 0.09), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
