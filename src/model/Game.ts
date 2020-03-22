import { Player } from "./Player";
import { observable, computed } from "mobx";

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
    this.nextPlayer();
  }

  nextPlayer() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    if (this.activePlayer) {
      this.activePlayer.takeCard();
      this.activePlayer.takeLetters();
    }
  }

  finish() {}

  @computed
  get isStarted() {
    return this.turnCounter > 0;
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
