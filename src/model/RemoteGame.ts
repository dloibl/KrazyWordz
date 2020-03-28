import { Game } from "./Game";
import { Firestore } from "../remote/firebase";
import { Player } from "./Player";
import { Word } from ".";

export class RemoteGame extends Game {
  constructor(private firestore = new Firestore()) {
    super();
    this.firestore.newGame("test-game");
  }

  start() {
    super.start();
    this.firestore.startGame();
  }

  addPlayer(name: string) {
    super.addPlayer(name);
    this.firestore.addPlayer(name);
  }

  playWord(player: Player, word: Word) {
    super.playWord(player, word);
    this.firestore.setWord(player.name, word.word);
  }

  makeYourGuess(player: Player) {
    super.makeYourGuess(player);
    const guess = new Map();
    player.guess.forEach((player, task) => guess.set(task.id, player.name));
    this.firestore.storeGuess(player.name, guess);
  }
}
