// Design-System im Stil von Janoschs Tigerente: warmes Papier, Tinten-Strich,
// Tiger-Gold, Räder-Rot, Panama-Grün. + Maskottchen & goldene Tigerenten-Münze (Währung).

export const COLORS = {
  paper: "#F0E0BC",
  paperDark: "#E4D0A2",
  ink: "#2B2118",
  inkSoft: "#6B5B45",
  tiger: "#F4B73E", // Tigerenten-Gelb
  gold: "#E8A21C", // Währungsgold
  goldHi: "#FFD45E",
  goldDark: "#B9790F",
  wheel: "#C5482E", // rote Räder / CTA
  wheelDark: "#9A331D",
  leaf: "#5E7A3A", // Tisch-Grün
  leafDark: "#3E5526",
  sky: "#6FA8C7",
  cream: "#FBF1D8",
  white: "#ffffff",
  muted: "#C7B68F", // helle Hinweise auf dunklem Grund
  stripe: "#241B12",
  // Legacy-Aliase, damit bestehende Spiele weiter passen
  felt: "#4E6A30",
  feltLight: "#5E7A3A",
  feltDark: "#37502A",
  red: "#C5482E",
  redDark: "#9A331D",
};

export const FONTS = {
  display: "'Patrick Hand', 'Comic Sans MS', system-ui, cursive",
  body: "'Nunito', system-ui, sans-serif",
};

export function clear(ctx, W, H, color = COLORS.paper) {
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

// Panel mit Janosch-Tintenkontur (kräftiger Außenstrich + feine Innenlinie).
export function inkPanel(ctx, x, y, w, h, r, fill, lineWidth = 3) {
  roundRectPath(ctx, x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineJoin = "round";
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  roundRectPath(ctx, x + 3, y + 3, w - 6, h - 6, Math.max(0, r - 3));
  ctx.strokeStyle = "rgba(43,33,24,0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function text(ctx, str, x, y, opts = {}) {
  const {
    font = `20px ${FONTS.body}`,
    color = COLORS.ink,
    align = "left",
    baseline = "alphabetic",
  } = opts;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

// Maskottchen: Janoschs Tigerente als Holz-Zugtier (gelber Körper, schwarze
// Streifen, oranger Schnabel, rote Räder, grüne Zugschnur). s = Körperradius.
export function drawTigerente(ctx, cx, cy, s) {
  ctx.save();
  ctx.lineJoin = "round";
  const ink = COLORS.ink;
  const lw = Math.max(1.5, s * 0.08);

  // Zugschnur
  ctx.strokeStyle = "#4E7A3A";
  ctx.lineWidth = Math.max(1.5, s * 0.07);
  ctx.beginPath();
  ctx.moveTo(cx - s * 1.05, cy + s * 0.95);
  ctx.quadraticCurveTo(cx - s * 1.5, cy + s * 1.1, cx - s * 1.7, cy + s * 0.7);
  ctx.stroke();

  // Räder
  const wy = cy + s * 0.82;
  const wr = s * 0.28;
  for (const wx of [cx - s * 0.5, cx + s * 0.55]) {
    ctx.beginPath();
    ctx.arc(wx, wy, wr, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.wheel;
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.strokeStyle = ink;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wx, wy, wr * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
  }

  // Körper
  ctx.beginPath();
  ctx.ellipse(cx, cy, s, s * 0.72, 0, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.tiger;
  ctx.fill();

  // Streifen (auf Körper geclippt)
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = COLORS.stripe;
  ctx.lineWidth = Math.max(2, s * 0.13);
  ctx.lineCap = "round";
  for (let i = -2; i <= 2; i++) {
    const ox = cx + i * s * 0.42 - s * 0.08;
    ctx.beginPath();
    ctx.moveTo(ox, cy - s * 0.75);
    ctx.quadraticCurveTo(ox + s * 0.2, cy, ox, cy + s * 0.75);
    ctx.stroke();
  }
  ctx.restore();

  // Körper-Kontur
  ctx.beginPath();
  ctx.ellipse(cx, cy, s, s * 0.72, 0, 0, Math.PI * 2);
  ctx.lineWidth = lw;
  ctx.strokeStyle = ink;
  ctx.stroke();

  // Kopf
  const hx = cx + s * 0.6;
  const hy = cy - s * 0.62;
  const hr = s * 0.5;
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.tiger;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = ink;
  ctx.stroke();

  // Kopf-Streifen
  ctx.beginPath();
  ctx.arc(hx, hy, hr * 0.92, -Math.PI * 0.85, -Math.PI * 0.25);
  ctx.lineWidth = Math.max(1.5, s * 0.11);
  ctx.strokeStyle = COLORS.stripe;
  ctx.stroke();

  // Schnabel
  ctx.beginPath();
  ctx.moveTo(hx + hr * 0.45, hy - hr * 0.08);
  ctx.lineTo(hx + hr * 1.55, hy + hr * 0.04);
  ctx.lineTo(hx + hr * 0.5, hy + hr * 0.5);
  ctx.closePath();
  ctx.fillStyle = "#EE8A2B";
  ctx.fill();
  ctx.lineWidth = lw * 0.8;
  ctx.strokeStyle = ink;
  ctx.stroke();

  // Auge
  ctx.beginPath();
  ctx.arc(hx + hr * 0.16, hy - hr * 0.16, Math.max(1.6, s * 0.1), 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();

  ctx.restore();
}

// Währungs-Icon: goldene Tigerenten-Münze. r = Radius.
export function drawCoin(ctx, cx, cy, r) {
  ctx.save();
  ctx.lineJoin = "round";

  // Münzkörper mit Verlauf
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
  g.addColorStop(0, COLORS.goldHi);
  g.addColorStop(1, COLORS.gold);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.strokeStyle = COLORS.ink;
  ctx.stroke();

  // Tiger-Streifen über die Münze (geclippt)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = COLORS.stripe;
  ctx.lineWidth = Math.max(1.4, r * 0.16);
  ctx.lineCap = "round";
  for (let i = -1; i <= 1; i++) {
    const ox = cx + i * r * 0.5;
    ctx.beginPath();
    ctx.moveTo(ox, cy - r);
    ctx.quadraticCurveTo(ox + r * 0.22, cy, ox, cy + r);
    ctx.stroke();
  }
  ctx.restore();

  // kleiner Schnabel + Auge -> erkennbar als Ente
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.2, cy - r * 0.12);
  ctx.lineTo(cx + r * 0.78, cy - r * 0.02);
  ctx.lineTo(cx + r * 0.22, cy + r * 0.22);
  ctx.closePath();
  ctx.fillStyle = "#EE8A2B";
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = COLORS.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - r * 0.05, cy - r * 0.22, Math.max(1.2, r * 0.1), 0, Math.PI * 2);
  ctx.fillStyle = COLORS.ink;
  ctx.fill();

  ctx.restore();
}

// Währungsanzeige: Münze + Zahl. Gibt die Gesamtbreite zurück.
export function currency(ctx, x, y, amount, opts = {}) {
  const r = opts.r || 13;
  const font = opts.font || `bold ${Math.round(r * 1.5)}px ${FONTS.body}`;
  const color = opts.color || COLORS.ink;
  drawCoin(ctx, x + r, y, r);
  const label = amount.toLocaleString("de-DE");
  text(ctx, label, x + r * 2 + 8, y, { font, color, align: "left", baseline: "middle" });
  ctx.font = font;
  return r * 2 + 8 + ctx.measureText(label).width;
}
