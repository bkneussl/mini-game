// Higher / Lower — wird die nächste Karte höher oder tiefer?
// Setz-Spiel mit Streak: jeder Treffer erhöht den Topf, jederzeit kassierbar.

import { COLORS, FONTS, clear, panel, text, drawTigerente, currency, drawCoin } from "../core/draw.js";
import { freshDeck, shuffle, RANKS, drawCard, CARD_W, CARD_H } from "../core/cards.js";

const MIN_BET = 25;
const BET_STEP = 25;
const STREAK_MULT = 1.6;

function rankValue(card) {
  return RANKS.indexOf(card.rank) + 1; // A=1 ... K=13
}

export function createHigherLower(app) {
  const { ctx, W, H, wallet } = app;

  let phase = "bet"; // bet | play | reveal | result
  let bet = Math.min(50, Math.max(MIN_BET, wallet.get()));
  let deck = [];
  let current = null;
  let next = null;
  let pot = 0;
  let streak = 0;
  let message = "Höher oder tiefer?";
  let outcome = "";
  let revealTimer = 0;
  let lastGuess = "";
  let buttons = [];

  function ensureDeck() {
    if (deck.length < 6) deck = shuffle(freshDeck());
  }

  function start() {
    if (!wallet.trySpend(bet)) {
      message = "Zu wenig Tigerenten — Bitcoin-Shop!";
      return;
    }
    deck = shuffle(freshDeck());
    current = deck.pop();
    next = null;
    pot = bet;
    streak = 0;
    outcome = "";
    message = "Höher oder tiefer?";
    phase = "play";
  }

  function guess(dir) {
    if (phase !== "play") return;
    ensureDeck();
    lastGuess = dir;
    next = deck.pop();
    phase = "reveal";
    revealTimer = 0.7;
  }

  function resolveReveal() {
    const cv = rankValue(current);
    const nv = rankValue(next);
    if (nv === cv) {
      message = "Gleichstand — neue Karte, Topf bleibt.";
      current = next;
      next = null;
      phase = "play";
      return;
    }
    const correct = (lastGuess === "higher" && nv > cv) || (lastGuess === "lower" && nv < cv);
    if (correct) {
      streak++;
      pot = Math.round(pot * STREAK_MULT);
      message = `Treffer! Topf ${pot}. Weiter oder kassieren?`;
      current = next;
      next = null;
      phase = "play";
    } else {
      pot = 0;
      outcome = "lose";
      message = "Daneben! Topf futsch.";
      phase = "result";
    }
  }

  function cashOut() {
    if (phase !== "play" || streak === 0) {
      if (phase === "play" && streak === 0) {
        // Einsatz unverändert zurück (kein Risiko genommen)
        wallet.add(pot);
        outcome = "win";
        message = "Kassiert (Einsatz zurück).";
        phase = "result";
      }
      return;
    }
    wallet.add(pot);
    outcome = "win";
    message = `Kassiert: +${pot} Tigerenten!`;
    phase = "result";
  }

  function newRound() {
    phase = "bet";
    current = null;
    next = null;
    pot = 0;
    streak = 0;
    outcome = "";
    message = "Höher oder tiefer?";
    bet = Math.max(MIN_BET, Math.min(wallet.get(), bet));
  }

  function update(dt) {
    if (phase === "reveal") {
      revealTimer -= dt;
      if (revealTimer <= 0) resolveReveal();
    }
  }

  function btn(x, y, w, h, label, action, opts = {}) {
    const enabled = opts.enabled !== false;
    panel(ctx, x, y, w, h, 10, enabled ? (opts.fill || COLORS.gold) : "#3a4a33",
      enabled ? COLORS.ink : "#2a3622", 3);
    text(ctx, label, x + w / 2, y + h / 2, {
      font: `bold 17px ${FONTS.body}`, color: enabled ? COLORS.ink : COLORS.muted,
      align: "center", baseline: "middle",
    });
    buttons.push({ x, y, w, h, action, enabled });
  }

  function render() {
    clear(ctx, W, H, COLORS.felt);
    buttons = [];

    drawTigerente(ctx, 50, 46, 22);
    text(ctx, "Higher / Lower", 92, 50, { font: `34px ${FONTS.display}`, color: COLORS.cream });
    panel(ctx, W - 210, 22, 186, 48, 12, COLORS.paper, COLORS.ink, 3);
    currency(ctx, W - 196, 46, wallet.get(), { r: 14, font: `900 22px ${FONTS.body}`, color: COLORS.ink });
    text(ctx, "Esc = Lobby", W - 117, 86, { font: `700 12px ${FONTS.body}`, color: COLORS.muted, align: "center" });

    // Karten
    const cy = 190;
    if (current) {
      drawCard(ctx, W / 2 - CARD_W - 30, cy, current);
    } else {
      panel(ctx, W / 2 - CARD_W - 30, cy, CARD_W, CARD_H, 9, COLORS.feltDark, COLORS.ink, 2);
    }
    // nächste Karte
    if (phase === "reveal" || (phase === "result" && next)) {
      drawCard(ctx, W / 2 + 30, cy, next);
    } else {
      drawCard(ctx, W / 2 + 30, cy, { rank: "?", suit: "?" }, true);
    }
    text(ctx, "jetzt", W / 2 - CARD_W / 2 - 30, cy + CARD_H + 22, { font: `700 13px ${FONTS.body}`, color: COLORS.muted, align: "center" });
    text(ctx, "nächste", W / 2 + 30 + CARD_W / 2, cy + CARD_H + 22, { font: `700 13px ${FONTS.body}`, color: COLORS.muted, align: "center" });

    // Topf / Streak
    if (phase !== "bet") {
      panel(ctx, W / 2 - 110, cy + CARD_H + 40, 220, 40, 10, COLORS.paper, COLORS.ink, 3);
      drawCoin(ctx, W / 2 - 90, cy + CARD_H + 60, 12);
      text(ctx, `Topf: ${pot}   ·   Serie: ${streak}`, W / 2 + 6, cy + CARD_H + 60, {
        font: `800 17px ${FONTS.body}`, color: COLORS.ink, align: "center", baseline: "middle",
      });
    }

    // Nachricht
    const col = outcome === "lose" ? "#ffd0d0" : outcome === "win" ? "#cdeccd" : COLORS.cream;
    text(ctx, message, W / 2, 150, { font: `bold 20px ${FONTS.body}`, color: col, align: "center" });

    // Steuerung
    const by = 520;
    if (phase === "bet") {
      btn(W / 2 - 200, by, 50, 46, "−", () => { bet = Math.max(MIN_BET, bet - BET_STEP); });
      panel(ctx, W / 2 - 140, by, 130, 46, 10, COLORS.paper, COLORS.ink, 3);
      currency(ctx, W / 2 - 118, by + 23, bet, { r: 13, font: `900 20px ${FONTS.body}`, color: COLORS.ink });
      btn(W / 2, by, 50, 46, "+", () => { bet = Math.min(wallet.get(), bet + BET_STEP); });
      btn(W / 2 + 70, by, 150, 46, "START", start, { fill: COLORS.wheel });
      text(ctx, "Errate die nächste Karte. Jeder Treffer × 1,6 — jederzeit kassieren.", W / 2, by + 70, {
        font: `700 13px ${FONTS.body}`, color: COLORS.muted, align: "center",
      });
    } else if (phase === "play") {
      btn(W / 2 - 240, by, 150, 46, "▲ Höher", () => guess("higher"));
      btn(W / 2 - 80, by, 150, 46, "▼ Tiefer", () => guess("lower"), { fill: COLORS.sky });
      btn(W / 2 + 80, by, 160, 46, "Kassieren", cashOut, { fill: COLORS.cream });
    } else if (phase === "result") {
      btn(W / 2 - 90, by, 180, 46, "Nochmal (Enter)", newRound, { fill: COLORS.wheel });
    }
  }

  return {
    enter() { bet = Math.max(MIN_BET, Math.min(wallet.get(), bet)); },
    exit() {},
    update,
    render,
    onKeyDown(e) {
      if (e.key === "Escape") { app.goToLobby(); return; }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (phase === "bet") {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") bet = Math.min(wallet.get(), bet + BET_STEP);
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") bet = Math.max(MIN_BET, bet - BET_STEP);
        else if (e.key === "Enter" || e.key === " ") start();
      } else if (phase === "play") {
        if (e.key === "ArrowUp" || e.key === "h" || e.key === "H") guess("higher");
        else if (e.key === "ArrowDown" || e.key === "l" || e.key === "L") guess("lower");
        else if (e.key === "Enter" || e.key === " " || e.key === "c" || e.key === "C") cashOut();
      } else if (phase === "result") {
        if (e.key === "Enter" || e.key === " ") newRound();
      }
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
