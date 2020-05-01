- karte syncen und letters
- eingabe sperren, wenn wort gespielt wurde
- eingabe sperren, wenn guess confirmed
- additional card geht manchmal verloren
- winning score implementieren

Optional:

- spieler löschen umsetzen
- farbe der spieler syncen
- guess syncen jederzeit
- Guess, Task, etc. ändern, sodass Ids und nicht Instanzen verwendet werden
- change Maps zu Objects

function getWinner(game: Playable) {
return game.players.reduce(function (prev, current) {
return prev.totalScore > current.totalScore ? prev : current;
});
}
