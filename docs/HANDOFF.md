# Session-Handoff — Tigerenten-Club Casino

Stand: nach Commit `690d1ca`. Working Tree sauber, alles gepusht.

## Wo wir stehen
Großer **Redesign läuft**: vom Janosch-Bilderbuch → **„Black & Gold High-Roller" (Art Déco)**,
erwachsenes Casino (19–30). Währung umbenannt **„Goldene Tigerenten" → „Entenchips"**.
Vollständiger Plan: `~/.claude/plans/mach-mal-eine-kleine-quirky-peach.md`.

### Schon fertig & gepusht
- **Design-System** `src/core/draw.js`: Art-Déco-Palette (`COLORS`), `FONTS` (Cinzel/Jost),
  `drawTigerente` = dapperer Gold-Erpel (Zylinder+Fliege), `drawCoin`/`drawChip` = Entenchip,
  `currency()` (Gold), `inkPanel`, `decoCorner`, `chipBadge`, `betBox`.
- **`src/core/icons.js`** (neu): `drawGameIcon(ctx, id, cx, cy, s)` — eigenes Vorschau-Icon je Spiel.
- **Lobby** `src/scenes/lobby.js`: komplett Art-Déco, per-Spiel-Icons, Auto-Fit-Namen,
  Konto-Badge, Kachel „Entenchip-Shop".
- **`index.html`/`style.css`**: Cinzel+Jost, Schwarz-Gold-Rahmen.
- **`main.js`**: Font-Preload, Registry neu sortiert, `crash`-Eintrag (noch `create: null`),
  Shop-Kachel heißt „Entenchip-Shop".

→ **Lobby sieht fertig & gut aus** (im Browser verifiziert).

## Noch zu tun (genau hier weitermachen)
1. **Spiel-HUDs reskinnen** (Kontrast!). In `blackjack, slots, higherlower, roulette, snake`
   steht im Header identisch:
   ```js
   panel(ctx, W - 210, 22, 186, 48, 12, COLORS.paper, COLORS.ink, 3);
   currency(ctx, W - 196, 46, wallet.get(), { r: 14, font: `900 22px ${FONTS.body}`, color: COLORS.ink });
   ```
   → ersetzen durch `chipBadge(ctx, W - 210, 22, 186, 56, wallet.get(), "ENTENCHIPS");`
   und `chipBadge, betBox` in die Imports aus `../core/draw.js` aufnehmen.
   **Pinball** hat eigene HUD-Panels (PUNKTE/Kugeln/Steuerung) mit `COLORS.paper`+`COLORS.ink`
   → auf dunkel + Gold/Creme-Text umstellen.
2. **Einsatz-Boxen** (`betBox`) je Spiel: die `panel(...COLORS.paper, COLORS.ink...)`+`currency`-
   Paare für den Einsatz ersetzen durch `betBox(ctx, x, y, w, h, bet)` (Positionen je Datei leicht
   unterschiedlich — siehe blackjack/slots/higherlower/roulette).
3. **Währungswort** „Tigerenten" → „Entenchips" in Nachrichten (NICHT die Spieltitel
   „Tigerenten-Slot/-Blackjack/-Pinball"!). Betroffene Stellen siehe
   `grep -rn "Tigerenten" src/games`.
4. **Shop** `src/scenes/shop.js`: „Bitcoin-Shop" → „Entenchip-Shop" (Titel + die Fehlermeldungen
   „… — Bitcoin-Shop!" in roulette.js/higherlower.js), Art-Déco-Reskin. **Simulations-/Parodie-
   Hinweis bleibt** (kein echtes Geld). Kauft 1.000 Entenchips.
5. **Neues Spiel** `src/games/crash.js` (**Enten-Crash**, Aviator-Style): Einsatz → Multiplikator
   steigt (Kurve + fliegende Ente) → vor dem Crash kassieren (×Mult), sonst Einsatz weg, zufälliger
   Crash-Punkt. In `main.js` importieren und beim `crash`-Eintrag `create: createCrash` setzen.
6. **README** + Spec aktualisieren (Entenchips, Art-Déco, Enten-Crash).

## Testen
```bash
python3 -m http.server 8000   # dann http://localhost:8000
node --check src/<datei>.js
```
Playwright-Hinweis: Der Nutzer nutzt denselben Browser parallel — vor Screenshots ggf. neu zu
`http://127.0.0.1:<port>/index.html` navigieren.

## Wichtig / Fallen
- **localStorage-Key bleibt `casino_ducks`** (in `wallet.js`) — nicht umbenennen, sonst sind
  gespeicherte Guthaben weg.
- Spielmechaniken NICHT ändern — reiner Reskin (außer Crash = neu).
- Push-Regel (Projekt-CLAUDE.md): nach jedem fertigen Schritt sofort committen + zu `origin` pushen.
- Alle 7 bestehenden Spiele + Lobby + Shop funktionieren mechanisch; offen ist v. a. Kontrast/
  Benennung + das neue Crash-Spiel.
