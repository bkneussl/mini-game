// Tigerenten-Club Casino — Bootstrap: Szenen-Manager, Loop, Input-Dispatch.

import { COLORS } from "./core/draw.js";
import { createWallet } from "./core/wallet.js";
import { createLobby } from "./scenes/lobby.js";
import { createShop } from "./scenes/shop.js";
import { createDuckDebug } from "./games/duckdebug.js";
import { createBlackjack } from "./games/blackjack.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const wallet = createWallet();

const app = { canvas, ctx, W, H, wallet };

// Spiele-Registry. create=null => Kachel ist gesperrt ("Bald") und wird Schritt für Schritt
// freigeschaltet, sobald das Spiel gebaut ist.
app.games = [
  { id: "blackjack", name: "Blackjack", tag: "Kartentisch", accent: COLORS.red, create: createBlackjack },
  { id: "slots", name: "Tigerenten-Slot", tag: "Automat", accent: COLORS.gold, create: null },
  { id: "duckdebug", name: "Rubber Duck Debugging", tag: "Arcade", accent: "#7ee0a8", create: createDuckDebug },
  { id: "higherlower", name: "Higher / Lower", tag: "Karten", accent: "#5ec8ff", create: null },
  { id: "roulette", name: "Enten-Roulette", tag: "Rad", accent: "#ff9a3c", create: null },
  { id: "snake", name: "Enten-Snake", tag: "Arcade", accent: "#9be36b", create: null },
  { id: "pinball", name: "Tigerenten-Pinball", tag: "Arcade", accent: "#d98cff", create: null },
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
