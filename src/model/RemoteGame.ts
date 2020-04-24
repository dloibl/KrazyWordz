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
  get isStarted() {
    return this.localGame.isStarted;
  }
  get haveAllPlayersGuessed() {
    return this.localGame.haveAllPlayersGuessed;
  }
  get isGuessTime() {
    return this.localGame.isGuessTime;
  }
  players: Player[] = this.localGame.players;
  activePlayer: Player & { isOwner?: boolean } = null!;
  robot: Player = this.localGame.robot;

  constructor(private firestore = new Firestore()) {
    this.firestore.onPlayerAdded = this.localGame.addPlayer;

    this.firestore.onGameStarted = () => {
      if (this.name && this.activePlayer && !this.localGame.isStarted) {
        console.log("Starting game");
        this.localGame.start();
      }
    };

    this.firestore.onSyncAdditionalCard = (cardId) => {
      if (cardId != null && !this.localGame.robot.card) {
        this.localGame.robot.card = CardPool.getInstance().getTask(cardId);
      }
    };

    this.firestore.onWordPlayed = (playerName, { word, cardId }) => {
      const player = this.getPlayer(playerName);
      if (player) {
        player.card = CardPool.getInstance().getTask(cardId);
        player && this.localGame.playWord(player, new Word(word));
      }
    };

    this.firestore.onPlayerGuessed = (playerName, guess) => {
      const player = this.getPlayer(playerName);
      console.log("get guess for player", player, player!.guessConfirmed);
      if (player && !player.guessConfirmed) {
        Object.entries(guess).forEach(([taskId, guessedPlayer]) => {
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

  joinGame(name: string) {
    this.name = name;
    this.firestore.joinGame(name);
  }

  createGame({
    name,
    winningPoints,
    owner,
  }: {
    name: string;
    winningPoints?: number;
    owner: string;
  }) {
    this.name = name;
    // todo rounds
    this.localGame.winningScore = winningPoints || 15;
    this.firestore.newGame(name);
    this.addPlayer(owner);
    this.activePlayer.isOwner = true;
  }

  nextRound() {
    this.localGame.nextRound();
    this.firestore.resetRound({
      additionalCardId: this.activePlayer.isOwner
        ? this.localGame.robot.card?.id
        : undefined,
      score: this.activePlayer.totalScore,
    });
  }

  deletePlayer(): void {
    throw new Error("Method not implemented.");
  }

  start() {
    this.localGame.start();
    this.firestore.startGame({
      additionalCardId: this.activePlayer.isOwner
        ? this.localGame.robot.card?.id
        : undefined,
    });
  }

  addPlayer(name: string) {
    this.firestore.addPlayer(name);
    this.localGame.addPlayer(name);
    this.activePlayer = this.players.find((it) => it.name === name)!;
    this.localGame.activePlayer = this.activePlayer;
    // TODO: sync with localstorage to enable browser refresh
  }

  playWord(player: Player, word: Word) {
    this.localGame.playWord(player, word);
    this.firestore.setWord(player.name, word.word, player.card!.id);
  }

  makeYourGuess(player: Player) {
    this.localGame.makeYourGuess(player);
    const guess: { [key: string]: string } = {};
    player.guess.forEach((player, task) => (guess[task.id] = player.name));
    this.firestore.storeGuess(player.name, guess);
  }
}
