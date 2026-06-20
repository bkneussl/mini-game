// Casino-Lobby: Automaten auswählen, Enten-Konto, Weg zum Bitcoin-Shop.

import { COLORS, clear, panel, text, drawTigerente } from "../core/draw.js";

const COLS = 4;
const GAP = 18;
const AREA = { x: 40, y: 150, w: 720, h: 396 };

export function createLobby(app) {
  const { ctx, W, H, wallet } = app;

  // Kacheln = Spiele aus der Registry + Shop am Ende.
  const tiles = [
    ...app.games,
    { id: "shop", name: "Bitcoin-Shop", tag: "Nachschub", accent: COLORS.gold, special: "shop" },
  ];

  let selected = 0;

  function layout() {
    const rows = Math.ceil(tiles.length / COLS);
    const tw = (AREA.w - (COLS - 1) * GAP) / COLS;
    const th = (AREA.h - (rows - 1) * GAP) / rows;
    return tiles.map((t, i) => {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      return { ...t, x: AREA.x + c * (tw + GAP), y: AREA.y + r * (th + GAP), w: tw, h: th, i };
    });
  }

  let rects = layout();

  function activate(tile) {
    if (tile.special === "shop") {
      app.openShop();
      return;
    }
    if (tile.create) {
      app.setScene(tile.create(app));
      return;
    }
    // gesperrt ("Bald") -> nichts tun
  }

  function render() {
    clear(ctx, W, H, COLORS.felt);

    // Kopfzeile
    drawTigerente(ctx, 70, 60, 34);
    text(ctx, "TIGERENTEN-CLUB CASINO", 120, 52, {
      font: "bold 30px system-ui, sans-serif",
      color: COLORS.gold,
    });
    text(ctx, "Wähle deinen Automaten — viel Glück!", 122, 82, {
      font: "15px system-ui, sans-serif",
      color: COLORS.muted,
    });

    // Enten-Konto (HUD oben rechts)
    panel(ctx, W - 250, 36, 210, 52, 12, COLORS.feltDark, COLORS.gold, 2);
    drawTigerente(ctx, W - 218, 62, 16);
    text(ctx, `${wallet.get()}`, W - 60, 62, {
      font: "bold 26px system-ui, sans-serif",
      color: COLORS.gold,
      align: "right",
      baseline: "middle",
    });
    text(ctx, "Goldene Gummienten", W - 60, 80, {
      font: "11px system-ui, sans-serif",
      color: COLORS.muted,
      align: "right",
      baseline: "middle",
    });

    rects = layout();
    for (const t of rects) {
      const isSel = t.i === selected;
      const locked = !t.special && !t.create;
      const accent = t.accent || COLORS.cream;

      panel(ctx, t.x, t.y, t.w, t.h, 14, locked ? "#0a2a20" : COLORS.feltLight,
        isSel ? COLORS.gold : "#0a261c", isSel ? 4 : 2);

      // Akzent-Leiste oben
      ctx.save();
      panel(ctx, t.x, t.y, t.w, 8, 4, locked ? "#3a4a44" : accent);
      ctx.restore();

      // Icon
      drawTigerente(ctx, t.x + t.w / 2, t.y + t.h * 0.42, t.w * 0.16);

      // Name + Tag
      text(ctx, t.name, t.x + t.w / 2, t.y + t.h * 0.7, {
        font: "bold 16px system-ui, sans-serif",
        color: locked ? COLORS.muted : COLORS.cream,
        align: "center",
      });
      text(ctx, locked ? "Bald" : t.tag, t.x + t.w / 2, t.y + t.h * 0.84, {
        font: "12px system-ui, sans-serif",
        color: locked ? "#6f827b" : accent,
        align: "center",
      });
    }

    // Fußzeile
    text(ctx, "Pfeiltasten = wählen   ·   Enter = spielen   ·   Maus = klicken", W / 2, H - 22, {
      font: "14px system-ui, sans-serif",
      color: COLORS.muted,
      align: "center",
    });
  }

  return {
    enter() {
      rects = layout();
    },
    exit() {},
    update() {},
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
      for (const t of rects) {
        if (p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h) {
          selected = t.i;
          break;
        }
      }
    },
    onMouseDown(p) {
      for (const t of rects) {
        if (p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h) {
          selected = t.i;
          activate(t);
          break;
        }
      }
    },
  };
}
