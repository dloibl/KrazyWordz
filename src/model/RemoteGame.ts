import { Game } from "./Game";
import { Firestore } from "../remote/firebase";
import { Player } from "./Player";
import { Word } from ".";
import { Playable } from "./Playable";
import { observable } from "mobx";

export class RemoteGame implements Playable {
  localGame: Game = new Game();
  @observable
  name?: string;
  isStarted: boolean = false; // TODO
  haveAllPlayersGuessed: boolean = false; // TODO
  isGuessTime: boolean = false; // TODO
  players: Player[] = this.localGame.players;
  activePlayer: Player = null!;
  robot: Player = this.localGame.robot;

  constructor(private firestore = new Firestore()) {
    this.firestore.onPlayerAdded = this.localGame.addPlayer;
    // this.firesotre.onWordPlaay = super.playWord
  }

  createGame(name: string, winningPoints?: number) {
    this.name = name;
    // todo rounds
    this.localGame.winningScore = winningPoints || 15;
    this.firestore.newGame(name);
  }

  nextRound() {}

  deletePlayer(): void {
    throw new Error("Method not implemented.");
  }

  start() {
    this.localGame.start();
    this.firestore.startGame();
  }

  addPlayer(name: string) {
    this.firestore.addPlayer(name);
    this.localGame.addPlayer(name);
    this.activePlayer = this.players.find((it) => it.name === name)!;
    // TODO: sync with localstorage to enable browser refresh
  }

  playWord(player: Player, word: Word) {
    this.localGame.playWord(player, word);
    this.firestore.setWord(player.name, word.word);
  }

  makeYourGuess(player: Player) {
    this.localGame.makeYourGuess(player);
    const guess = new Map();
    player.guess.forEach((player, task) => guess.set(task.id, player.name));
    this.firestore.storeGuess(player.name, guess);
  }
}
