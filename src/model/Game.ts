import { Player } from "./Player";
import { observable, computed, action } from "mobx";
import { Word } from "./Word";
import { Guess } from "./Guess";

export class Game {
  @observable
  players: Player[] = [new Player("Pia")];

  @observable
  activePlayerIndex = -1;

  @observable
  turnCounter = 0;

  @computed
  get activePlayer() {
    return this.players[this.activePlayerIndex];
  }

  start() {
    this.turnCounter++;

    // temp until parallel playing
    this.nextPlayer();
  }

  @action
  drawCardAndLetters(player: Player) {
    player.drawCard();
    player.drawLetters();
  }

  @action
  playWord(player: Player, word: Word) {
    player.playWord(word);

    // temp until parallel playing
    this.nextPlayer();
  }

  @action
  makeYourGuess(player: Player, guess: Guess) {
    player.makeGuess(guess);

    // temp until parallel playing
    this.nextPlayer();
  }

  nextPlayer() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    if (!this.activePlayer) {
      return;
    }
    if (this.isGuessTime) {
      // what to do?
    } else {
      this.drawCardAndLetters(this.activePlayer);
    }
  }

  /** ends game */
  finish() {}

  @computed
  get isStarted() {
    return this.turnCounter > 0;
  }

  @computed
  get isGuessTime() {
    return this.players.every(player => player.word != null);
  }

  deletePlayer(name: string) {
    this.players = this.players.filter(it => it.name !== name);
  }

  addPlayer(name: string) {
    if (!name) {
      throw new Error("Name must be given");
    }
    if (this.players.find(it => it.name === name) != null) {
      throw new Error(`Player with ${name} already exists`);
    }
    this.players.push(new Player(name));
  }
}
