# Tigerenten-Club Casino — Design

## Context
Aus der Test-Version „Rubber Duck Debugging" wird ein **Tigerenten-Club Casino**: eine
Spielhalle, in der man durch eine Lobby läuft und aus mehreren Automaten wählt. Highlight ist
ein Kartentisch (**Blackjack**) gegen den Tigerenten-Dealer. Die **Tigerente** (Janoschs
schwarz-gelb gestreifte Ente) ist Maskottchen und erfüllt zugleich die Pflicht-Vorgabe der
Challenge („Gummiente muss vorkommen").

Theme-Vorgabe vom Nutzer:
- Casino-Lobby zum Auswählen von Spielen.
- **Geteiltes Chip-Konto** über alle Spiele (in Arcade verdienen, am Tisch setzen).
- Kartentisch-Highlight: **Blackjack**.
- Arcade-Automaten: **Tigerenten-Slot, Rubber Duck Debugging, Enten-Roulette, Higher/Lower,
  Snake, Pinball**.

## Architektur
Vanilla JS als **ES-Module** (kein Build-Step; läuft über lokalen Server / VS Code Live Preview).
Ein einziges `<canvas>` (800×600), gesteuert von einem schlanken Szenen-Manager.

```
index.html              → lädt src/main.js als type="module"
src/main.js             → Bootstrap: Loop, Input-Dispatch, Szenen-Wechsel
src/core/scene-manager  → setScene(), aktuelle Szene, enter/exit
src/core/wallet.js      → geteiltes Chip-Konto (localStorage 'casino_chips')
src/core/draw.js        → Palette, Helfer (Text, Panels), drawTigerente()
src/core/audio.js       → optionale WebAudio-Blips (später)
src/scenes/lobby.js     → Spielhalle: Automaten auswählen, Chip-HUD
src/games/<spiel>.js    → je Spiel eine isolierte Szene
```

**Szenen-Interface** (jede Szene, auch Lobby, implementiert dasselbe):
```
createScene(app) → {
  enter(), exit(),
  update(dt), render(),
  onKeyDown(e), onKeyUp(e)
}
// app = { canvas, ctx, wallet, goToLobby(), W, H }
```
So ist jedes Spiel unabhängig testbar und kennt nur das `app`-Interface + sein eigenes State.

**Chip-Ökonomie** (`wallet`): Start-Guthaben (z. B. 100). Methoden `get()`, `add(n)`,
`trySpend(n) → bool`. Setz-Spiele (Slot, Roulette, Blackjack, Higher/Lower) ziehen Einsatz ab und
zahlen Gewinn aus; Skill-Spiele (Snake, Pinball, Duck Debugging) zahlen Chips nach Score aus.
Bei 0 Chips kleiner „Nachschub"-Bonus, damit man nie hart festsitzt.

**Steuerung:** Pfeiltasten + Enter/Leertaste in allen Szenen; Maus-Klick in der Lobby und an
Tischen wo sinnvoll. `Esc` (oder Lobby-Button) führt aus jedem Spiel zurück in die Halle.

## Build-Reihenfolge (Push nach jedem Punkt)
1. **Fundament**: Szenen-Manager, Wallet, Lobby-Shell, Chip-HUD; bestehendes
   „Rubber Duck Debugging" in die neue Struktur überführen (= erster spielbarer Automat).
2. **Blackjack** (Highlight): gegen Tigerenten-Dealer, Hit/Stand/Double, Einsatz aus Wallet.
3. **Tigerenten-Slot**: 3 Walzen, Tigerenten-Symbole, Einsatz/Auszahlungstabelle.
4. **Higher/Lower**: offene Karte, höher/tiefer tippen, Einsatz, Streak-Bonus.
5. **Enten-Roulette**: vereinfachtes Rad, Setzen auf Farbe/Zahl/Tigerente.
6. **Snake**: Tigerente frisst Brotkrumen, wächst; Score → Chips.
7. **Pinball**: einfacher Flipper-Tisch (Physik light), Score → Chips.
8. **Polish-Pass**: einheitlicher Look, Übergänge, optionale Sounds, Aufräumen.

## Look
Warme Casino-Palette (Tiefrot/Grün-Filz, Gold), schwarz-gelbe Tigerenten-Streifen als Motiv.
Maskottchen `drawTigerente()` wird programmatisch gezeichnet (nicht Emoji) und überall
wiederverwendet, für einen zusammenhängenden Stil. Wo Tempo wichtig ist, dürfen Emoji als
Platzhalter bleiben und im Polish-Pass ersetzt werden.

## Verifikation
Pro Spiel im Browser (lokaler Server) testen: Lobby → Automat starten → Kern-Loop spielbar →
Chips verändern sich korrekt → `Esc` zurück zur Lobby. Nach jedem Punkt committen und zu
`origin` pushen.

## Scope-Hinweis
7 Spiele + Framework sind ein großer Build über mehrere Schritte. Pinball ist am aufwändigsten
(Physik) und wird bewusst als solide, einfache Version umgesetzt. Reihenfolge ist so gewählt,
dass nach Schritt 1 bereits etwas Spielbares steht und jeder weitere Schritt eigenständig
pushbar ist.
