// Tigerenten Blackjack — du gegen den Tigerenten-Dealer.
// Setz-Spiel: Einsatz aus dem Enten-Konto. Blackjack zahlt 3:2.

import { COLORS, clear, panel, text, drawTigerente } from "../core/draw.js";
import { freshDeck, shuffle, handValue, drawCard, CARD_W, CARD_H } from "../core/cards.js";

const MIN_BET = 25;
const BET_STEP = 25;

export function createBlackjack(app) {
  const { ctx, W, H, wallet } = app;

  // phase: bet | player | dealer | result
  let phase = "bet";
  let bet = Math.min(100, Math.max(MIN_BET, wallet.get()));
  let staked = 0;
  let deck = [];
  let player = [];
  let dealer = [];
  let message = "";
  let outcome = ""; // win | lose | push | blackjack
  let dealerTimer = 0;

  // Klick-Buttons (werden je Phase neu gesetzt)
  let buttons = [];

  function clampBet() {
    const max = wallet.get();
    if (bet > max) bet = Math.max(0, max - (max % BET_STEP));
    if (bet < MIN_BET) bet = Math.min(MIN_BET, max);
  }

  function deal() {
    if (wallet.get() < MIN_BET) {
      message = "Zu wenig Enten — ab in den Bitcoin-Shop!";
      return;
    }
    clampBet();
    if (bet <= 0 || !wallet.trySpend(bet)) {
      message = "Einsatz nicht möglich.";
      return;
    }
    staked = bet;
    deck = shuffle(freshDeck());
    player = [deck.pop(), deck.pop()];
    dealer = [deck.pop(), deck.pop()];
    message = "";
    outcome = "";
    phase = "player";

    // Sofort-Blackjack prüfen
    if (handValue(player) === 21) stand();
  }

  function hit() {
    if (phase !== "player") return;
    player.push(deck.pop());
    if (handValue(player) > 21) {
      resolve(); // Bust
    }
  }

  function doubleDown() {
    if (phase !== "player" || player.length !== 2) return;
    if (!wallet.trySpend(bet)) {
      message = "Nicht genug Enten zum Verdoppeln.";
      return;
    }
    staked += bet;
    player.push(deck.pop());
    if (handValue(player) > 21) resolve();
    else stand();
  }

  function stand() {
    if (phase !== "player") return;
    phase = "dealer";
    dealerTimer = 0.5;
  }

  function dealerStep() {
    if (handValue(dealer) < 17) {
      dealer.push(deck.pop());
      dealerTimer = 0.5;
    } else {
      resolve();
    }
  }

  function resolve() {
    phase = "result";
    const pv = handValue(player);
    const dv = handValue(dealer);
    const playerBJ = pv === 21 && player.length === 2;
    const dealerBJ = dv === 21 && dealer.length === 2;

    if (pv > 21) {
      outcome = "lose";
      message = "Überkauft! Bug nicht gefixt.";
    } else if (playerBJ && !dealerBJ) {
      outcome = "blackjack";
      const win = Math.floor(staked * 2.5); // Einsatz zurück + 3:2
      wallet.add(win);
      message = `BLACKJACK! +${win - staked} 🦆`;
    } else if (dv > 21 || pv > dv) {
      outcome = "win";
      wallet.add(staked * 2);
      message = `Gewonnen! +${staked} 🦆`;
    } else if (pv === dv) {
      outcome = "push";
      wallet.add(staked);
      message = "Unentschieden — Einsatz zurück.";
    } else {
      outcome = "lose";
      message = "Dealer gewinnt.";
    }
  }

  function newRound() {
    phase = "bet";
    player = [];
    dealer = [];
    outcome = "";
    message = "";
    clampBet();
  }

  // ---- Eingaben ----
  function onKeyDown(e) {
    if (e.key === "Escape") {
      app.goToLobby();
      return;
    }
    if (phase === "bet") {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") bet += BET_STEP;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") bet -= BET_STEP;
      bet = Math.max(MIN_BET, Math.min(wallet.get(), bet));
      if (e.key === "Enter" || e.key === " ") deal();
    } else if (phase === "player") {
      if (e.key === "h" || e.key === "H" || e.key === "ArrowUp") hit();
      else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown" || e.key === "Enter") stand();
      else if (e.key === "d" || e.key === "D") doubleDown();
    } else if (phase === "result") {
      if (e.key === "Enter" || e.key === " ") newRound();
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
  }

  function onMouseDown(p) {
    for (const b of buttons) {
      if (b.enabled !== false && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
        b.action();
        return;
      }
    }
  }

  function update(dt) {
    if (phase === "dealer") {
      dealerTimer -= dt;
      if (dealerTimer <= 0) dealerStep();
    }
  }

  // ---- Zeichnen ----
  function drawHand(cards, cx, y, hideHole) {
    const n = cards.length;
    const spacing = CARD_W + 16;
    const total = (n - 1) * spacing + CARD_W;
    let x = cx - total / 2;
    cards.forEach((c, i) => {
      drawCard(ctx, x, y, c, hideHole && i === 1);
      x += spacing;
    });
  }

  function btn(x, y, w, h, label, action, opts = {}) {
    const enabled = opts.enabled !== false;
    panel(ctx, x, y, w, h, 10, enabled ? (opts.fill || COLORS.gold) : "#2a3a33",
      enabled ? (opts.stroke || COLORS.goldDark) : "#1d2a25", 2);
    text(ctx, label, x + w / 2, y + h / 2, {
      font: "bold 17px system-ui, sans-serif",
      color: enabled ? COLORS.ink : COLORS.muted,
      align: "center",
      baseline: "middle",
    });
    buttons.push({ x, y, w, h, action, enabled });
  }

  function render() {
    clear(ctx, W, H, COLORS.felt);
    buttons = [];

    // Kopf
    drawTigerente(ctx, 44, 42, 22);
    text(ctx, "Tigerenten Blackjack", 78, 48, { font: "bold 24px system-ui, sans-serif", color: COLORS.gold });
    panel(ctx, W - 220, 24, 180, 44, 10, COLORS.feltDark, COLORS.gold, 2);
    text(ctx, `${wallet.get()} 🦆`, W - 130, 46, { font: "bold 20px system-ui", color: COLORS.gold, align: "center", baseline: "middle" });
    text(ctx, "Esc = Lobby", W - 130, 84, { font: "12px system-ui, sans-serif", color: COLORS.muted, align: "center" });

    // Dealer
    text(ctx, "Tigerenten-Dealer", W / 2, 104, { font: "15px system-ui, sans-serif", color: COLORS.cream, align: "center" });
    if (dealer.length) {
      const hide = phase === "player";
      drawHand(dealer, W / 2, 120, hide);
      const dv = hide ? handValue([dealer[0]]) : handValue(dealer);
      text(ctx, hide ? `${dv} + ?` : `${dv}`, W / 2, 120 + CARD_H + 22, {
        font: "bold 18px system-ui", color: COLORS.cream, align: "center",
      });
    }

    // Spieler
    text(ctx, "Du", W / 2, 320, { font: "15px system-ui, sans-serif", color: COLORS.cream, align: "center" });
    if (player.length) {
      drawHand(player, W / 2, 336, false);
      text(ctx, `${handValue(player)}`, W / 2, 336 + CARD_H + 22, {
        font: "bold 20px system-ui", color: COLORS.gold, align: "center",
      });
    }

    // Nachricht
    if (message) {
      const col = outcome === "lose" ? "#ff6b6b" : outcome ? "#7ee0a8" : COLORS.cream;
      text(ctx, message, W / 2, 300, { font: "bold 20px system-ui, sans-serif", color: col, align: "center" });
    }

    // Steuerleiste
    const by = 540;
    if (phase === "bet") {
      text(ctx, "Einsatz festlegen", W / 2, 230, { font: "18px system-ui", color: COLORS.cream, align: "center" });
      btn(W / 2 - 200, by, 50, 44, "−", () => { bet = Math.max(MIN_BET, bet - BET_STEP); });
      panel(ctx, W / 2 - 140, by, 130, 44, 10, COLORS.feltDark, COLORS.gold, 2);
      text(ctx, `${bet} 🦆`, W / 2 - 75, by + 22, { font: "bold 20px system-ui", color: COLORS.gold, align: "center", baseline: "middle" });
      btn(W / 2 - 0, by, 50, 44, "+", () => { bet = Math.min(wallet.get(), bet + BET_STEP); });
      btn(W / 2 + 70, by, 130, 44, "DEAL", deal, { fill: COLORS.red, stroke: COLORS.redDark });
      text(ctx, "←/→ Einsatz · Enter = Deal · Blackjack zahlt 3:2", W / 2, by + 70, {
        font: "13px system-ui, sans-serif", color: COLORS.muted, align: "center",
      });
    } else if (phase === "player") {
      const canDouble = player.length === 2 && wallet.get() >= bet;
      btn(W / 2 - 230, by, 130, 44, "Hit (H)", hit);
      btn(W / 2 - 90, by, 130, 44, "Stand (S)", stand, { fill: COLORS.cream, stroke: "#bbb" });
      btn(W / 2 + 50, by, 180, 44, "Verdoppeln (D)", doubleDown, { enabled: canDouble });
    } else if (phase === "result") {
      btn(W / 2 - 90, by, 180, 44, "Nochmal (Enter)", newRound, { fill: COLORS.red, stroke: COLORS.redDark });
    }
  }

  return { enter() { clampBet(); }, exit() {}, update, render, onKeyDown, onKeyUp() {}, onMouseDown };
}
