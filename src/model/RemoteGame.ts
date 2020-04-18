import { Game } from "./Game";
import { Firestore } from "../remote/firebase";
import { Player } from "./Player";
import { Word } from ".";
import { Playable } from "./Playable";
import { observable } from "mobx";
import { CardPool } from "./CardPool";

export class RemoteGame implements Playable {
  localGame: Game = new Game();
  @observable
  name?: string;
  isStarted: boolean = false; // TODO
  get haveAllPlayersGuessed() {
    return this.localGame.haveAllPlayersGuessed;
  }
  get isGuessTime() {
    return this.localGame.isGuessTime;
  }
  players: Player[] = this.localGame.players;
  activePlayer: Player = null!;
  robot: Player = this.localGame.robot;

  constructor(private firestore = new Firestore()) {
    this.firestore.onPlayerAdded = this.localGame.addPlayer;

    this.firestore.onWordPlayed = (playerName, word) => {
      const player = this.getPlayer(playerName);
      player && this.localGame.playWord(player, new Word(word));
    };

    this.firestore.onPlayerGuessed = (playerName, guess) => {
      const player = this.getPlayer(playerName);
      if (player) {
        guess.forEach((guessedPlayer, taskId) => {
          const task = CardPool.getInstance().getTask(taskId);
          const p = this.getPlayer(guessedPlayer);
          if (task && p) {
            player.addGuess(task, p);
          }
        });
        this.localGame.makeYourGuess(player);
      }
    };
  }

  private getPlayer(name: string) {
    return this.players.find((it) => it.name === name);
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
