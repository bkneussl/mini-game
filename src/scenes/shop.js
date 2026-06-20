// Simulierter Bitcoin-Shop — PARODIE. Kein echtes Geld, keine echte Blockchain.
// "1.000 Goldene Gummienten für 1 € in BTC" — der Button täuscht die Zahlung nur vor.

import { COLORS, FONTS, clear, panel, text, drawTigerente, drawCoin } from "../core/draw.js";

const PACK = 1000;
const FAKE_ADDR = "bc1q-tig3r3nte-c4sin0-n0t-r34l-d0nt-s3nd";

export function createShop(app) {
  const { ctx, W, H, wallet } = app;

  let phase = "offer"; // offer | paid
  let qr = makeFakeQR(21);
  const btn = { x: W / 2 - 130, y: 430, w: 260, h: 56 };

  function makeFakeQR(n) {
    // Deterministisch (einmal erzeugt), damit nichts flackert.
    const grid = [];
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let y = 0; y < n; y++) {
      const row = [];
      for (let x = 0; x < n; x++) row.push(rnd() > 0.5);
      grid.push(row);
    }
    // Ecken-Marker wie ein echter QR-Code
    const marker = (ox, oy) => {
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = edge || core;
        }
    };
    marker(0, 0);
    marker(n - 7, 0);
    marker(0, n - 7);
    return grid;
  }

  function buy() {
    wallet.add(PACK);
    phase = "paid";
  }

  function drawQR(cx, cy, size) {
    const n = qr.length;
    const cell = size / n;
    panel(ctx, cx - 12, cy - 12, size + 24, size + 24, 8, COLORS.white);
    ctx.fillStyle = COLORS.ink;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        if (qr[y][x]) ctx.fillRect(cx + x * cell, cy + y * cell, cell + 0.5, cell + 0.5);
  }

  function render() {
    clear(ctx, W, H, COLORS.feltDark);

    text(ctx, "₿  BITCOIN-SHOP", W / 2, 56, {
      font: "bold 30px system-ui, sans-serif",
      color: COLORS.gold,
      align: "center",
    });
    text(ctx, "Goldene Gummienten nachkaufen", W / 2, 86, {
      font: "15px system-ui, sans-serif",
      color: COLORS.muted,
      align: "center",
    });

    // Parodie-Warnhinweis
    panel(ctx, W / 2 - 250, 104, 500, 30, 8, "#3a1414", COLORS.red, 1);
    text(ctx, "⚠  SIMULATION — kein echtes Geld, keine echte Zahlung, nur Spaß", W / 2, 124, {
      font: "13px system-ui, sans-serif",
      color: "#ff9aa6",
      align: "center",
    });

    if (phase === "offer") {
      drawQR(W / 2 - 80, 160, 160);

      drawCoin(ctx, W / 2 - 150, 360, 15);
      text(ctx, "1.000 Goldene Tigerenten  für  1 € in BTC", W / 2 + 16, 360, {
        font: `bold 22px ${FONTS.body}`,
        color: COLORS.cream,
        align: "center",
        baseline: "middle",
      });
      text(ctx, `Sende an:  ${FAKE_ADDR}`, W / 2, 392, {
        font: "13px ui-monospace, monospace",
        color: COLORS.muted,
        align: "center",
      });

      panel(ctx, btn.x, btn.y, btn.w, btn.h, 12, COLORS.gold, COLORS.goldDark, 2);
      text(ctx, "Bezahlen (simuliert)", W / 2, btn.y + btn.h / 2, {
        font: "bold 20px system-ui, sans-serif",
        color: COLORS.ink,
        align: "center",
        baseline: "middle",
      });
    } else {
      drawTigerente(ctx, W / 2 - 10, 220, 50);
      text(ctx, "✔  Zahlung bestätigt", W / 2, 320, {
        font: "bold 28px system-ui, sans-serif",
        color: "#7ee0a8",
        align: "center",
      });
      text(ctx, `+1.000 gutgeschrieben  ·  Beutel: ${wallet.get()} Tigerenten`, W / 2, 356, {
        font: `bold 18px ${FONTS.body}`,
        color: COLORS.cream,
        align: "center",
      });
      text(ctx, "(natürlich kein echtes Geld geflossen)", W / 2, 384, {
        font: "13px system-ui, sans-serif",
        color: COLORS.muted,
        align: "center",
      });
    }

    text(ctx, "Esc / Enter = zurück zur Lobby", W / 2, H - 24, {
      font: "14px system-ui, sans-serif",
      color: COLORS.muted,
      align: "center",
    });
  }

  function insideBtn(p) {
    return p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
  }

  return {
    enter() {},
    exit() {},
    update() {},
    render,
    onKeyDown(e) {
      if (e.key === "Escape") app.goToLobby();
      else if (e.key === "Enter") {
        if (phase === "offer") buy();
        else app.goToLobby();
      }
    },
    onKeyUp() {},
    onMouseDown(p) {
      if (phase === "offer" && insideBtn(p)) buy();
      else if (phase === "paid") app.goToLobby();
    },
  };
}
