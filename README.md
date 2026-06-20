# 🐯🦆 Tigerenten-Club Casino

Ein Mini-Casino im warmen Bilderbuch-Stil von **Janoschs Tigerente**. Du betrittst eine
Spielhalle, wählst aus mehreren Automaten und Tischen und spielst um **Goldene Tigerenten** —
die Währung des Hauses. Gebaut für die SKAILE Academy Building Challenge.

> **Themen-Vorgabe der Challenge:** „Irgendwo muss eine Gummiente vorkommen."
> Hier ist die Gummiente das durchgängige Motiv: die **Tigerente** (Janoschs gelb-schwarz
> gestreiftes Holz-Zugtier) ist Maskottchen, Spielfigur **und** Währungsmünze.

## 🎮 Spielen

Reines HTML/Canvas/JavaScript, **kein Build nötig**. Über einen lokalen Server öffnen
(ES-Module brauchen `http://`, kein `file://`):

```bash
python3 -m http.server 8000
# dann im Browser: http://localhost:8000
```

Oder in VS Code die Extension **Live Preview** → „Show Preview".

## 🕹️ Die Spiele

Aus der Lobby (Pfeiltasten/Maus wählen, Enter spielen, Esc zurück) erreichbar:

| Automat | Typ | Kurz |
|---|---|---|
| **Blackjack** | Kartentisch | Gegen den Tigerenten-Dealer, Hit/Stand/Double, Blackjack zahlt 3:2 |
| **Tigerenten-Slot** | Automat | 3 Walzen, gewichtete Symbole, Jackpot bei 3× Tigerente (×20) |
| **Enten-Roulette** | Rad | Rot/Schwarz/Gerade/Ungerade (×2) oder Tigerente (×12) |
| **Higher / Lower** | Karten | Höher oder tiefer? Streak-Multiplikator ×1,6, jederzeit kassieren |
| **Rubber Duck Debugging** | Arcade | Bugs abschießen, bevor sie den Code fluten |
| **Enten-Snake** | Arcade | Tigerente frisst Münzen und wächst |
| **Tigerenten-Pinball** | Arcade | Flipper-Tisch mit Bumpern (← / → flippern) |

Dazu der **Bitcoin-Shop** für Nachschub — siehe Hinweis unten.

## 🪙 Währung: Goldene Tigerenten

- Jeder startet mit **1.000** Goldenen Tigerenten (gespeichert im Browser via `localStorage`).
- Setz-Spiele ziehen den Einsatz ab und zahlen Gewinne aus; Arcade-Spiele zahlen nach Score.
- Geht der Beutel leer, gibt's im **Bitcoin-Shop** Nachschub.

> ⚠️ **Der Bitcoin-Shop ist eine Parodie/Simulation.** Es fließt **kein echtes Geld**, es gibt
> keine echte Bitcoin- oder Wallet-Anbindung. Der „Bezahlen"-Button täuscht den Kauf nur vor und
> schreibt 1.000 Tigerenten gut — als augenzwinkernder Casino-Gag.

## 🧱 Technik

- Vanilla JavaScript als **ES-Module**, ein `<canvas>`, schlanker Szenen-Manager.
- Jedes Spiel ist eine isolierte Szene unter `src/games/`, gemeinsame Bausteine in `src/core/`
  (Zeichen-Helfer, Tigerenten-Münze, geteiltes Konto).
- Design: Janosch-Palette (Papier, Tinte, Tiger-Gold, Räder-Rot, Panama-Grün),
  Schriften „Patrick Hand" + „Nunito". Maskottchen & Karten werden programmatisch gezeichnet.

```
index.html
src/
  main.js            Bootstrap: Loop, Input, Szenen-Wechsel
  core/              draw.js (Design-System) · wallet.js · cards.js
  scenes/            lobby.js · shop.js
  games/             blackjack · slots · roulette · higherlower · duckdebug · snake · pinball
docs/superpowers/specs/   Design-Spec
```

Viel Spaß in der Spielhalle — oh, wie schön ist Spielen! 🦆
