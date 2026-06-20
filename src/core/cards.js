// Karten-Helfer: Deck bauen, mischen, zeichnen (mit Tigerenten-Kartenrücken).

import { COLORS, panel, drawTigerente } from "./draw.js";

export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function freshDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ rank: r, suit: s });
  return deck;
}

export function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function isRed(card) {
  return card.suit === "♥" || card.suit === "♦";
}

// Blackjack-Wert eines Blattes (Asse 11, runter auf 1 wenn nötig).
export function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === "A") {
      total += 11;
      aces++;
    } else if (["K", "Q", "J", "10"].includes(c.rank)) total += 10;
    else total += Number(c.rank);
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export const CARD_W = 72;
export const CARD_H = 100;

export function drawCard(ctx, x, y, card, faceDown = false) {
  if (faceDown) {
    panel(ctx, x, y, CARD_W, CARD_H, 9, COLORS.gold, COLORS.goldDark, 2);
    ctx.save();
    panel(ctx, x + 6, y + 6, CARD_W - 12, CARD_H - 12, 6);
    ctx.clip();
    ctx.strokeStyle = COLORS.stripe;
    ctx.lineWidth = 6;
    for (let i = -2; i <= CARD_W / 10 + 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 14, y - 4);
      ctx.lineTo(x + i * 14 - 24, y + CARD_H + 4);
      ctx.stroke();
    }
    ctx.restore();
    drawTigerente(ctx, x + CARD_W / 2, y + CARD_H / 2, 14);
    return;
  }

  panel(ctx, x, y, CARD_W, CARD_H, 9, COLORS.white, "#d8d8d8", 1.5);
  const color = isRed(card) ? "#c0223a" : "#1a1a1a";
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";

  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(card.rank, x + 8, y + 26);
  ctx.font = "16px system-ui, sans-serif";
  ctx.fillText(card.suit, x + 8, y + 44);

  ctx.font = "34px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(card.suit, x + CARD_W / 2, y + CARD_H / 2 + 14);

  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(card.rank, x + CARD_W - 8, y + CARD_H - 12);
}
