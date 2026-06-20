// Casino-Lobby im Black & Gold High-Roller Look (Art Déco).
// Schwarz/Gold, Déco-Rahmen, eigene Vorschau-Icons je Spiel, Entenchip-Konto.

import { COLORS, FONTS, clear, panel, inkPanel, text, decoCorner, chipBadge, drawTigerente } from "../core/draw.js";
import { drawGameIcon } from "../core/icons.js";

const COLS = 4;
const GAP = 18;
const AREA = { x: 34, y: 196, w: 732, h: 350 };

export function createLobby(app) {
  const { ctx, W, H, wallet } = app;

  const tiles = [
    ...app.games,
    { id: "shop", name: "Entenchip-Shop", tag: "Kasse", accent: COLORS.crimson, special: "shop" },
  ];

  let selected = 0;
  let t = 0;

  function layout() {
    const rows = Math.ceil(tiles.length / COLS);
    const tw = (AREA.w - (COLS - 1) * GAP) / COLS;
    const th = (AREA.h - (rows - 1) * GAP) / rows;
    return tiles.map((tile, i) => {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      return { ...tile, x: AREA.x + c * (tw + GAP), y: AREA.y + r * (th + GAP), w: tw, h: th, i };
    });
  }

  let rects = layout();

  function activate(tile) {
    if (!tile) return;
    if (tile.special === "shop") return app.openShop();
    if (tile.create) return app.setScene(tile.create(app));
  }

  function header() {
    inkPanel(ctx, 22, 20, W - 44, 150, 6, COLORS.panel, 2);
    decoCorner(ctx, 38, 36, 20, 1, 1);
    decoCorner(ctx, W - 38, 36, 20, -1, 1);
    decoCorner(ctx, 38, 154, 20, 1, -1);
    decoCorner(ctx, W - 38, 154, 20, -1, -1);

    drawTigerente(ctx, 96, 92, 34);

    text(ctx, "TIGERENTEN-CLUB", 156, 70, { font: `40px ${FONTS.display}`, color: COLORS.gold, spacing: 2 });
    text(ctx, "C A S I N O   R O Y A L E", 158, 104, { font: `18px ${FONTS.display}`, color: COLORS.cream, spacing: 4 });
    // feine Goldlinie
    ctx.strokeStyle = COLORS.goldDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(158, 118);
    ctx.lineTo(420, 118);
    ctx.stroke();
    text(ctx, "Members only · 19+ · setze deine Entenchips", 158, 140, {
      font: `500 13px ${FONTS.body}`, color: COLORS.muted, spacing: 1,
    });

    // Konto rechts
    chipBadge(ctx, W - 232, 44, 188, 66, wallet.get(), "ENTENCHIPS");
  }

  function render() {
    clear(ctx, W, H, COLORS.bg);
    header();
    rects = layout();

    for (const tile of rects) {
      const isSel = tile.i === selected;
      const locked = !tile.special && !tile.create;
      const accent = tile.accent || COLORS.gold;
      const lift = isSel ? 5 : 0;
      const x = tile.x, y = tile.y - lift, w = tile.w, h = tile.h;

      // Schild
      panel(ctx, x, y, w, h, 6, locked ? "#101013" : COLORS.panel, isSel ? COLORS.gold : COLORS.goldDark, isSel ? 2.5 : 1.5);
      if (isSel) {
        ctx.save();
        ctx.shadowColor = "rgba(232,178,58,0.5)";
        ctx.shadowBlur = 16;
        panel(ctx, x, y, w, h, 6, null, COLORS.gold, 2.5);
        ctx.restore();
      }

      // Icon-Feld
      ctx.globalAlpha = locked ? 0.35 : 1;
      drawGameIcon(ctx, tile.id, x + w / 2, y + h * 0.42, w * 0.2);
      ctx.globalAlpha = 1;

      // Trennlinie
      ctx.strokeStyle = COLORS.goldDark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 14, y + h - 44);
      ctx.lineTo(x + w - 14, y + h - 44);
      ctx.stroke();

      // Name (auto-skaliert, damit er in die Kachel passt)
      const name = tile.name.toUpperCase();
      let fs = 15;
      ctx.font = `${fs}px ${FONTS.display}`;
      while (ctx.measureText(name).width > w - 22 && fs > 9) {
        fs -= 0.5;
        ctx.font = `${fs}px ${FONTS.display}`;
      }
      text(ctx, name, x + w / 2, y + h - 26, {
        font: `${fs}px ${FONTS.display}`, color: locked ? COLORS.muted : COLORS.gold, align: "center",
      });
      // Tag
      text(ctx, locked ? "BALD" : tile.tag.toUpperCase(), x + w / 2, y + h - 11, {
        font: `500 9px ${FONTS.body}`, color: locked ? "#5d5740" : accent, align: "center", spacing: 1.5,
      });
    }

    // Fußzeile
    text(ctx, "PFEILTASTEN  WÄHLEN   ·   ENTER  SPIELEN   ·   MAUS  KLICKEN", W / 2, H - 22, {
      font: `500 11px ${FONTS.body}`, color: COLORS.muted, align: "center", spacing: 2,
    });
  }

  return {
    enter() { rects = layout(); },
    exit() {},
    update(dt) { t += dt; },
    render,
    onKeyDown(e) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(e.key)) e.preventDefault();
      const n = tiles.length;
      if (e.key === "ArrowRight") selected = (selected + 1) % n;
      else if (e.key === "ArrowLeft") selected = (selected - 1 + n) % n;
      else if (e.key === "ArrowDown") selected = Math.min(n - 1, selected + COLS);
      else if (e.key === "ArrowUp") selected = Math.max(0, selected - COLS);
      else if (e.key === "Enter") activate(rects[selected]);
    },
    onKeyUp() {},
    onMouseMove(p) {
      for (const tile of rects) {
        if (p.x >= tile.x && p.x <= tile.x + tile.w && p.y >= tile.y - 6 && p.y <= tile.y + tile.h) {
          selected = tile.i;
          break;
        }
      }
    },
    onMouseDown(p) {
      for (const tile of rects) {
        if (p.x >= tile.x && p.x <= tile.x + tile.w && p.y >= tile.y - 6 && p.y <= tile.y + tile.h) {
          selected = tile.i;
          activate(tile);
          break;
        }
      }
    },
  };
}
