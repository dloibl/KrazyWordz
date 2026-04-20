# KI-Mitspieler Implementierungsplan

## Ziel

Die App soll KI-Mitspieler fuer das Multiplayer-Wortspiel unterstuetzen. Da das Projekt ein privates Uebungsprojekt ist, nutzen wir die Spark-kompatible Variante mit Firebase AI Logic im Client statt Firebase Cloud Functions.

Wichtig:

- Kein Cloud-Functions-Deploy.
- Kein Firebase Functions Secret.
- Kein serverseitiger Gemini-Key in diesem Projekt.
- KI-Aufrufe laufen im Host-Client ueber Firebase AI Logic und Gemini Developer API.
- Firestore bleibt die Quelle fuer den Spielzustand.

Diese Architektur ist fuer ein privates Projekt und Vorfuehrungen ausreichend. Fuer eine oeffentliche Produktivversion sollte die KI-Logik wieder in einen Server-Layer oder Firestore-Trigger verschoben werden.

## Bestehende Architektur

- React/TypeScript-App mit MobX-Modellklassen in `src/model/`.
- Firebase-App-Initialisierung in `src/remote/firebaseApp.ts`.
- Firestore-Clientzugriff in `src/remote/firebase.ts`.
- Spielablauf in `src/model/Game.ts`.
- Rundenerstellung in `src/view/CreateGameView.tsx`.
- KI-Logik im Client unter `src/ai/`.

## Zielarchitektur

### Frontend

- UI zur Bot-Auswahl beim Erstellen eines Spiels: 0 bis 4 Bots.
- Bots werden als normale Spieler in Firestore angelegt.
- Der Host-Client steuert Bot-Aktionen:
  - Wort erzeugen, wenn ein Bot in der Wortphase ist.
  - Zuordnung erzeugen, wenn alle Woerter vorliegen.
- Firebase AI Logic wird direkt aus dem Client aufgerufen.
- App Check sollte vor einer oeffentlichen Freigabe eingerichtet werden, um API-Missbrauch zu erschweren.

### Game Logic

- Spielregeln bleiben in `src/model/Game.ts`:
  - Runden starten.
  - Karten und Buchstaben verteilen.
  - Spielerzustaende auswerten.
  - Punkte verteilen.
  - Bot-Aktionen anstossen.
- Bots nutzen das bestehende Player-Dokumentformat.

### AI Logic

- KI-Logik liegt in `src/ai/`.
- Prompts, Parsing, Validierung, Fallbacks und Assignment-Bias sind als reine TypeScript-Helper strukturiert.
- Die Zuordnungsphase ist hybrid:
  - Gemini erzeugt Scores/Rankings.
  - Code waehlt final mit Personality-Bias, Skill und Fehlerquote.

## Ordnerstruktur

```text
src/
  ai/
    assignmentBias.ts
    botAi.ts
    firebaseAiClient.ts
    letterValidation.ts
    prompts.ts
    responseParsers.ts
    rng.ts
    types.ts
  model/
    BotProfile.ts
  remote/
    firebaseApp.ts
    firebase.ts
```

## Firestore-Datenmodell

### `games/{gameId}`

Bestehend:

- `owner`
- `winningScore`
- `roundCounter`
- `playerCount`
- `additionalCardId`

Neu:

- `additionalCardText?: string`
- `botCount?: number`
- `botProfileIds?: string[]`
- `botAutomationVersion?: number`

### `games/{gameId}/players/{playerId}`

Bestehend:

- `name`
- `state`
- `word`
- `cardId`
- `letters`
- `guess`
- `totalScore`

Neu:

- `cardText?: string`
- `isBot?: boolean`
- `botProfileId?: string`
- `botProfile?: BotProfile`
- `botStatus?: "idle" | "generatingWord" | "guessing" | "error"`

## BotProfile-System

```ts
export interface BotProfile {
  id: string;
  name: string;
  style: string;
  creativity: number; // 0..1
  deduction: number; // 0..1
  deception: number; // 0..1
  humor: number; // 0..1
  mistakeRate: number; // 0..1
}
```

Start-Personas:

- `professor`: hohe deduction, niedrige mistakeRate, gelehrter Stil.
- `chaotic`: hohe creativity/humor, hoehere mistakeRate.
- `poetic`: hohe creativity, mittlere deduction, melodischer Stil.
- `trickster`: hohe deception, mittlere deduction, bewusst leicht irrefuehrend.
- `pragmatic`: solide deduction, niedrige creativity, kurze funktionale Begriffe.

## Prompt-Regeln

### Worterzeugung

- Genau ein erfundener Begriff oder absichtlich leer.
- Nur verfuegbare Buchstaben verwenden.
- Kein Buchstabe haeufiger als vorhanden.
- Nicht alle Buchstaben muessen verwendet werden.
- Deutsch priorisieren, aber englische, franzoesische, spanische, lateinische oder andere vertraute Sprachassoziationen erlauben.
- Ausgabe als kompaktes JSON: `{"word":"..."}`

Empfohlene Parameter:

- `temperature`: `0.9`
- `topP`: `0.9`
- `maxOutputTokens`: `80`

### Zuordnungsbewertung

- Scores fuer moegliche Wort-Karten-Kombinationen erzeugen.
- Keine eigene Karte und kein eigenes Wort einbeziehen.
- Leere Woerter sind gueltige Hinweise.
- Ausgabe als kompaktes JSON: `{"scores":[{"wordPlayerId":"...","cardId":"...","score":0.72,"reasoningTag":"sound_hint"}]}`

Empfohlene Parameter:

- `temperature`: `0.35`
- `topP`: `0.8`
- `maxOutputTokens`: mindestens `600`, dynamisch hoeher bei mehr Kombinationen.

## Fallback-Strategien

### Worterzeugung

Wenn Firebase AI Logic oder Gemini ungueltig antwortet:

1. JSON tolerant extrahieren.
2. Wort normalisieren.
3. Letter-Validation ausfuehren.
4. Falls ungueltig: lokales Fallback-Wort aus erlaubten Buchstaben erzeugen.

Leerer String ist ein gueltiger Spielzug.

### Zuordnung

Wenn Gemini unvollstaendig antwortet:

1. Existierende gueltige Scores behalten.
2. Fehlende Kombinationen mit Fallback-Scores ergaenzen.
3. Ungueltige Kombinationen entfernen.
4. Eigene Karte und eigenes Wort ausschliessen.
5. Finale Auswahl ueber Bias-Helper treffen.

## Fehlerfall-Dokumentation und Debugging

Da die Spark-Variante im Client laeuft:

- Fehler werden mit `console.warn` protokolliert.
- Normales Spielerlebnis wird nicht mit technischen Details gestoert.
- Bei Fehlern greifen lokale Fallbacks, damit Bots das Spiel nicht blockieren.
- Eine spaetere Entwickleranzeige im Score-Screen kann Bot-Fallbacks sichtbar machen.

## Abhakbare ToDo-Liste

- [x] Spark-kompatible Zielarchitektur festlegen.
- [x] Cloud-Functions-Konfiguration aus `firebase.json` entfernen.
- [x] Functions-Package wieder entfernen.
- [x] Firebase-App-Initialisierung in `src/remote/firebaseApp.ts` trennen.
- [x] Firebase AI Logic Client in `src/ai/firebaseAiClient.ts` anbinden.
- [x] `src/ai/types.ts` mit KI-DTOs anlegen.
- [x] `src/model/BotProfile.ts` mit 5 Start-Personas anlegen.
- [x] `src/ai/prompts.ts` mit Prompt-Buildern fuer Worterzeugung und Zuordnungsbewertung anlegen.
- [x] `src/ai/responseParsers.ts` mit tolerantem JSON-Parsing anlegen.
- [x] `src/ai/letterValidation.ts` mit `normalizeWord` und `validateWordUsesOnlyAllowedLetters` anlegen.
- [x] Leeres Wort als gueltigen Spielzug in Validierung und Fallbacks beruecksichtigen.
- [x] Mehrsprachige Hinweise in Prompts erlauben, aber deutsche Spielassoziationen priorisieren.
- [x] `src/ai/assignmentBias.ts` mit `applyAssignmentBias` und `chooseAssignmentFromRankedCandidates` anlegen.
- [x] `src/ai/rng.ts` fuer deterministischen seeded RNG anlegen.
- [x] `src/ai/botAi.ts` als clientseitigen Bot-KI-Service anlegen.
- [x] `CreateGameView` um Auswahl `0..4` KI-Mitspieler erweitern.
- [x] `Game.createGame` um `botCount`/Bot-Profile erweitern.
- [x] `Firestore.newGame` um Bot-Metadaten erweitern.
- [x] Methode zum Anlegen von Bot-Player-Dokumenten implementieren.
- [x] Bot-Spieler beim Rundenstart mit Karten und Buchstaben versorgen.
- [x] Bot-Worterzeugung ausloesen, wenn Bot-Spieler in `PLAY` ist.
- [x] Bot-Zuordnung ausloesen, wenn Bot-Spieler in `GUESS` ist und alle Woerter vorliegen.
- [x] Guess-Ergebnis der Bots im bestehenden Firestore-Format speichern.
- [x] React-App bauen und bestehende Tests ausfuehren.
- [ ] Firebase AI Logic im Firebase-Projekt aktivieren und Gemini Developer API Provider auswaehlen.
- [ ] Optional App Check einrichten, bevor die App geteilt wird.
- [ ] Lokalen manuellen Test mit Bot-Runde durchfuehren.
- [ ] Unit-Tests fuer Letter-Validation, Parser, Fallbacks und Assignment-Bias schreiben.
- [ ] Optionalen Entwicklungs-Hinweis im Score-Screen fuer Bot-Fallbacks pruefen.
- [ ] Spaeter entscheiden, ob bei oeffentlicher Nutzung wieder Server/Functions/Trigger eingefuehrt werden.
