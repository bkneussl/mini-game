// Design-System: Black & Gold High-Roller (Art Déco).
// Mattschwarz, Gold, Smaragd, Creme. Schriften Cinzel (Display) + Jost (UI/Zahlen).
// Währung = "Entenchips" (Casino-Chip mit Enten-Silhouette).

export const COLORS = {
  black: "#0B0B0D",
  bg: "#0B0B0D",
  panel: "#17171D",
  panelHi: "#20202A",
  gold: "#E8B23A",
  goldHi: "#F7D77E",
  goldDark: "#9C7320",
  emerald: "#0E5C42",
  emeraldHi: "#15795A",
  emeraldDark: "#0A3F2E",
  cream: "#F2E6C9",
  white: "#FFFFFF",
  muted: "#9A926F",
  crimson: "#B11226",
  crimsonDark: "#7C0C1A",
  ink: "#0B0B0D",
  stripe: "#0B0B0D",
  // Aliase, damit bestehende Spiele weiterlaufen (auf neue Palette gemappt)
  paper: "#17171D",
  paperDark: "#101015",
  felt: "#0E5C42",
  feltLight: "#15795A",
  feltDark: "#0A3F2E",
  leaf: "#0E5C42",
  leafDark: "#0A3F2E",
  red: "#B11226",
  redDark: "#7C0C1A",
  wheel: "#B11226",
  sky: "#2F6F6A",
  inkSoft: "#9A926F",
  tiger: "#E8B23A",
};

export const FONTS = {
  display: "'Cinzel', Georgia, serif",
  body: "'Jost', system-ui, sans-serif",
};

export function clear(ctx, W, H, color = COLORS.bg) {
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

// Déco-Panel: dunkle Fläche, feine Gold-Doppelkontur.
export function inkPanel(ctx, x, y, w, h, r, fill = COLORS.panel, lineWidth = 2) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineJoin = "miter";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  roundRectPath(ctx, x + 4, y + 4, w - 8, h - 8, Math.max(0, r - 3));
  ctx.strokeStyle = "rgba(232,178,58,0.28)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function text(ctx, str, x, y, opts = {}) {
  const {
    font = `20px ${FONTS.body}`,
    color = COLORS.cream,
    align = "left",
    baseline = "alphabetic",
    spacing = null,
  } = opts;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (spacing != null && "letterSpacing" in ctx) ctx.letterSpacing = spacing + "px";
  ctx.fillText(str, x, y);
  if (spacing != null && "letterSpacing" in ctx) ctx.letterSpacing = "0px";
}

// Déco-Eckornament (kleiner Strahlen-Fächer).
export function decoCorner(ctx, x, y, s, flipX = 1, flipY = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX, flipY);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * (i / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
    ctx.stroke();
  }
  ctx.restore();
}

// Schlanke Enten-Silhouette (Kopf + Schnabel), für Chip-Mitte & Mascot-Basis.
function duckHead(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, s, 0, Math.PI * 2);
  ctx.fill();
  // Schnabel
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.5, cy - s * 0.15);
  ctx.lineTo(cx + s * 1.5, cy);
  ctx.lineTo(cx + s * 0.55, cy + s * 0.45);
  ctx.closePath();
  ctx.fill();
}

// Mascot: "The Golden Drake" — dapperer Gold-Erpel mit Zylinder & Fliege.
export function drawTigerente(ctx, cx, cy, s) {
  ctx.save();
  ctx.lineJoin = "round";
  const gold = COLORS.gold, dark = COLORS.black;

  // Körper
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.15, s, s * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fliege
  ctx.fillStyle = COLORS.crimson;
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.25, cy - s * 0.15);
  ctx.lineTo(cx + s * 0.7, cy - s * 0.4);
  ctx.lineTo(cx + s * 0.7, cy + s * 0.1);
  ctx.closePath();
  ctx.moveTo(cx + s * 0.25, cy - s * 0.15);
  ctx.lineTo(cx - s * 0.2, cy - s * 0.4);
  ctx.lineTo(cx - s * 0.2, cy + s * 0.1);
  ctx.closePath();
  ctx.fill();

  // Kopf
  const hx = cx + s * 0.55, hy = cy - s * 0.5, hr = s * 0.5;
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.fill();

  // Schnabel
  ctx.beginPath();
  ctx.moveTo(hx + hr * 0.5, hy - hr * 0.05);
  ctx.lineTo(hx + hr * 1.5, hy + hr * 0.05);
  ctx.lineTo(hx + hr * 0.55, hy + hr * 0.45);
  ctx.closePath();
  ctx.fill();

  // Zylinder
  ctx.fillStyle = dark;
  ctx.fillRect(hx - hr * 0.8, hy - hr * 2.1, hr * 1.6, hr * 1.3);
  ctx.fillRect(hx - hr * 1.15, hy - hr * 0.95, hr * 2.3, hr * 0.32);
  ctx.fillStyle = gold;
  ctx.fillRect(hx - hr * 0.8, hy - hr * 1.1, hr * 1.6, hr * 0.22);

  // Auge
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(hx + hr * 0.16, hy - hr * 0.05, Math.max(1.5, s * 0.09), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Währungs-Icon: Entenchip (Casino-Chip mit Enten-Silhouette). r = Radius.
export function drawCoin(ctx, cx, cy, r) {
  ctx.save();
  // Außenring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.gold;
  ctx.fill();
  // Randkerben
  ctx.fillStyle = COLORS.black;
  const notches = 8;
  for (let i = 0; i < notches; i++) {
    const a = (i / notches) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.86);
    ctx.rotate(a);
    ctx.fillRect(-r * 0.06, -r * 0.18, r * 0.12, r * 0.36);
    ctx.restore();
  }
  // Innenfeld
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.emerald;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = COLORS.gold;
  ctx.stroke();
  // Enten-Silhouette in der Mitte
  duckHead(ctx, cx - r * 0.12, cy, r * 0.26, COLORS.gold);
  ctx.restore();
}

export const drawChip = drawCoin;

// Währungsanzeige: Chip + Zahl. Gibt die Gesamtbreite zurück.
export function currency(ctx, x, y, amount, opts = {}) {
  const r = opts.r || 13;
  const font = opts.font || `600 ${Math.round(r * 1.5)}px ${FONTS.body}`;
  const color = opts.color || COLORS.gold;
  drawCoin(ctx, x + r, y, r);
  const label = amount.toLocaleString("de-DE");
  text(ctx, label, x + r * 2 + 8, y, { font, color, align: "left", baseline: "middle" });
  ctx.font = font;
  return r * 2 + 8 + ctx.measureText(label).width;
}

// Standard-HUD-Badge (dunkel + Gold): Chip + Betrag, zentriert. Optionales Label darunter.
export function chipBadge(ctx, x, y, w, h, amount, label) {
  inkPanel(ctx, x, y, w, h, 8, COLORS.panel, 2);
  const r = 13;
  const font = `600 22px ${FONTS.body}`;
  ctx.font = font;
  const num = amount.toLocaleString("de-DE");
  const total = r * 2 + 8 + ctx.measureText(num).width;
  const sx = x + (w - total) / 2;
  const cyMid = label ? y + h / 2 - 5 : y + h / 2;
  currency(ctx, sx, cyMid, amount, { r, font, color: COLORS.gold });
  if (label) {
    text(ctx, label, x + w / 2, y + h - 9, {
      font: `500 9px ${FONTS.body}`, color: COLORS.muted, align: "center", spacing: 1.5,
    });
  }
}

// Einsatz-Box (dunkel + Gold): Chip + Betrag, zentriert.
export function betBox(ctx, x, y, w, h, amount) {
  inkPanel(ctx, x, y, w, h, 8, COLORS.panelHi, 2);
  const r = 12;
  const font = `600 19px ${FONTS.body}`;
  ctx.font = font;
  const num = amount.toLocaleString("de-DE");
  const total = r * 2 + 8 + ctx.measureText(num).width;
  const sx = x + (w - total) / 2;
  currency(ctx, sx, y + h / 2, amount, { r, font, color: COLORS.gold });
}
