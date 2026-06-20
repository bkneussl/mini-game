// Tigerenten-Club Casino — Bootstrap: Szenen-Manager, Loop, Input-Dispatch.

import { COLORS } from "./core/draw.js";
import { createWallet } from "./core/wallet.js";
import { createLobby } from "./scenes/lobby.js";
import { createShop } from "./scenes/shop.js";
import { createDuckDebug } from "./games/duckdebug.js";
import { createBlackjack } from "./games/blackjack.js";
import { createSlots } from "./games/slots.js";
import { createHigherLower } from "./games/higherlower.js";
import { createRoulette } from "./games/roulette.js";
import { createSnake } from "./games/snake.js";
import { createPinball } from "./games/pinball.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const wallet = createWallet();

// Schriften vorladen, damit der Canvas sie nutzt (Render läuft pro Frame, sie "poppen" sonst nach).
if (document.fonts && document.fonts.load) {
  Promise.all([
    document.fonts.load("500 20px Jost"),
    document.fonts.load("600 20px Jost"),
    document.fonts.load("700 20px Jost"),
    document.fonts.load("400 20px Cinzel"),
    document.fonts.load("800 20px Cinzel"),
  ]).catch(() => {});
}

const app = { canvas, ctx, W, H, wallet };

// Spiele-Registry. create=null => Kachel ist gesperrt ("Bald") und wird Schritt für Schritt
// freigeschaltet, sobald das Spiel gebaut ist.
app.games = [
  { id: "blackjack", name: "Blackjack", tag: "Kartentisch", accent: COLORS.gold, create: createBlackjack },
  { id: "crash", name: "Enten-Crash", tag: "High-Roller", accent: COLORS.crimson, create: null },
  { id: "roulette", name: "Enten-Roulette", tag: "Rad", accent: COLORS.gold, create: createRoulette },
  { id: "slots", name: "Tigerenten-Slot", tag: "Automat", accent: COLORS.gold, create: createSlots },
  { id: "higherlower", name: "Higher / Lower", tag: "Karten", accent: COLORS.cream, create: createHigherLower },
  { id: "duckdebug", name: "Rubber Duck Debugging", tag: "Arcade", accent: COLORS.emeraldHi, create: createDuckDebug },
  { id: "snake", name: "Enten-Snake", tag: "Arcade", accent: COLORS.emeraldHi, create: createSnake },
  { id: "pinball", name: "Tigerenten-Pinball", tag: "Arcade", accent: COLORS.crimson, create: createPinball },
];

let current = null;
function setScene(scene) {
  if (current && current.exit) current.exit();
  current = scene;
  if (current && current.enter) current.enter();
}
app.setScene = setScene;
app.goToLobby = () => setScene(createLobby(app));
app.openShop = () => setScene(createShop(app));

// --- Eingaben ---
addEventListener("keydown", (e) => current && current.onKeyDown && current.onKeyDown(e));
addEventListener("keyup", (e) => current && current.onKeyUp && current.onKeyUp(e));

function posFromEvent(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}
canvas.addEventListener("mousedown", (e) => current && current.onMouseDown && current.onMouseDown(posFromEvent(e)));
canvas.addEventListener("mousemove", (e) => current && current.onMouseMove && current.onMouseMove(posFromEvent(e)));

// --- Loop ---
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (current && current.update) current.update(dt);
  if (current && current.render) current.render();
  requestAnimationFrame(frame);
}

setScene(createLobby(app));
requestAnimationFrame(frame);
