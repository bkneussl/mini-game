// Casino-Lobby im Janosch-Bilderbuchstil: Papier, Tintenstrich, Holzschild-Automaten,
// goldene Tigerenten als Währung.

import { COLORS, FONTS, clear, panel, inkPanel, text, drawTigerente, drawCoin, currency } from "../core/draw.js";

const COLS = 4;
const GAP = 20;
const AREA = { x: 36, y: 196, w: 728, h: 348 };

export function createLobby(app) {
  const { ctx, W, H, wallet } = app;

  const tiles = [
    ...app.games,
    { id: "shop", name: "Bitcoin-Shop", tag: "Nachschub", accent: COLORS.wheel, special: "shop" },
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
    // Hero-Schild
    inkPanel(ctx, 24, 20, W - 48, 150, 16, COLORS.leaf, 3);

    // Maskottchen links auf dem Schild
    drawTigerente(ctx, 96, 86, 40);

    text(ctx, "Tigerenten-Club", 176, 70, { font: `52px ${FONTS.display}`, color: COLORS.goldHi });
    text(ctx, "C A S I N O", 180, 112, { font: `28px ${FONTS.display}`, color: COLORS.cream });
    text(ctx, "Such dir einen Automaten aus — oh, wie schön ist Spielen!", 182, 142, {
      font: `16px ${FONTS.body}`, color: COLORS.muted,
    });

    // Konto-Tafel oben rechts (Münze + Betrag)
    const bw = 196, bx = W - 24 - bw, by = 38;
    inkPanel(ctx, bx, by, bw, 64, 12, COLORS.paper, 3);
    text(ctx, "DEIN BEUTEL", bx + 16, by + 18, { font: `700 11px ${FONTS.body}`, color: COLORS.inkSoft });
    currency(ctx, bx + 16, by + 42, wallet.get(), { r: 15, font: `900 26px ${FONTS.body}`, color: COLORS.ink });
  }

  function render() {
    clear(ctx, W, H, COLORS.paper);
    header();
    rects = layout();

    for (const tile of rects) {
      const isSel = tile.i === selected;
      const locked = !tile.special && !tile.create;
      const accent = tile.accent || COLORS.gold;
      const lift = isSel ? 6 : 0;
      const x = tile.x, y = tile.y - lift, w = tile.w, h = tile.h;

      // Schatten
      ctx.fillStyle = "rgba(43,33,24,0.18)";
      panel(ctx, x + 3, y + 6, w, h, 14);
      ctx.fill();

      // Schild
      inkPanel(ctx, x, y, w, h, 14, locked ? COLORS.paperDark : COLORS.cream, isSel ? 4 : 3);

      // Kopfband in Akzentfarbe
      ctx.save();
      roundClip(ctx, x, y, w, h, 14);
      ctx.fillStyle = locked ? "#b6a079" : accent;
      ctx.fillRect(x, y, w, 30);
      ctx.restore();
      text(ctx, locked ? "BALD" : tile.tag.toUpperCase(), x + w / 2, y + 20, {
        font: `700 11px ${FONTS.body}`, color: locked ? "#5a4a36" : COLORS.cream, align: "center", baseline: "middle",
      });

      // Icon
      ctx.globalAlpha = locked ? 0.4 : 1;
      drawTigerente(ctx, x + w / 2 - 2, y + h * 0.5, w * 0.15);
      ctx.globalAlpha = 1;

      // Name
      text(ctx, tile.name, x + w / 2, y + h - 22, {
        font: `22px ${FONTS.display}`, color: locked ? "#8a7a5e" : COLORS.ink, align: "center",
      });

      // Auswahl-Glow
      if (isSel) {
        ctx.save();
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgba(232,162,28,0.6)";
        ctx.shadowBlur = 14;
        panel(ctx, x - 2, y - 2, w + 4, h + 4, 16, null, COLORS.gold, 3);
        ctx.restore();
      }
    }

    // Fußleiste auf Papierstreifen
    inkPanel(ctx, W / 2 - 260, H - 38, 520, 28, 8, COLORS.paperDark, 2);
    text(ctx, "Pfeiltasten = wählen    ·    Enter = spielen    ·    Maus = klicken", W / 2, H - 24, {
      font: `700 13px ${FONTS.body}`, color: COLORS.inkSoft, align: "center", baseline: "middle",
    });
  }

  function roundClip(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    ctx.clip();
  }

  return {
    enter() {
      rects = layout();
    },
    exit() {},
    update(dt) {
      t += dt;
    },
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
