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
  @observable
  activePlayer: Player & { isOwner?: boolean } = null!;
  robot: Player = this.localGame.robot;

  constructor(
    private firestore = new Firestore({
      onGameEvent: (game) => this.syncGameState(game),
      onPlayerEvent: (playerName, data) => {
        this.syncPlayer(playerName);
        this.syncWordAndCard(playerName, data);
        this.syncGuess(playerName, data);
        this.syncScore(playerName, data);
      },
    })
  ) {}

  private syncGameState({
    additionalCardId,
    started,
    owner,
    playerCount,
    winningScore,
  }: {
    additionalCardId: string;
    started: boolean;
    owner: string;
    playerCount: number;
    winningScore: number;
  }) {
    if (
      started &&
      this.name &&
      this.activePlayer &&
      !this.localGame.isStarted
    ) {
      console.log("Starting game");
      this.localGame.start();
    }
    if (winningScore) {
      this.localGame.winningScore = winningScore;
    }
    if (additionalCardId != null && !this.localGame.robot.card) {
      this.localGame.robot.card = CardPool.getInstance().getTask(
        additionalCardId
      );
    }
    if (owner && this.activePlayer?.name === owner) {
      this.activePlayer.isOwner = true;
    }
    if (playerCount && this.localGame.playerCount < 0) {
      this.localGame.playerCount = playerCount;
    }
  }

  private syncScore(
    playerName: string,
    data: {
      totalScore?: number | undefined;
    }
  ) {
    if (data.totalScore) {
      const player = this.getPlayer(playerName);
      if (player && !player.totalScore) {
        player.totalScore = data.totalScore;
      }
    }
  }

  private syncGuess(
    playerName: string,
    data: {
      guess?: string;
    }
  ) {
    if (data.guess) {
      const player = this.getPlayer(playerName);
      const guess: {
        [key: string]: string;
      } = JSON.parse(data.guess);
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
    }
  }

  private syncPlayer(playerName: string) {
    playerName && this.localGame.addPlayer(playerName);
  }

  private syncWordAndCard(
    playerName: string,
    data: { cardId?: string; word?: string }
  ) {
    if (data.word && data.cardId) {
      const player = this.getPlayer(playerName);
      if (player && !player.word) {
        player.card = CardPool.getInstance().getTask(data.cardId);
        player && this.localGame.playWord(player, new Word(data.word));
      }
    }
  }

  private getPlayer(name: string) {
    return (
      this.players.find((it) => it.name === name) ||
      this.localGame.addPlayer(name)
    );
  }

  joinGame(name: string) {
    this.name = name;
    this.firestore.joinGame(name);
  }

  async createGame({
    name,
    winningScore = 15,
    owner,
  }: {
    name: string;
    winningScore?: number;
    owner: string;
  }) {
    await this.firestore.newGame({ name, owner, winningScore });
    await this.firestore.addPlayer(owner);

    return this.joinMyGame(name, owner);
  }

  private joinMyGame(name: string, owner: string) {
    const params = new URLSearchParams(window.location.search);
    params.append("join", name);
    params.append("player", owner);
    window.location.search = params.toString();
    // page reload!
  }

  nextRound() {
    this.localGame.nextRound();
    this.firestore.resetRound({
      additionalCardId: this.activePlayer.isOwner
        ? this.localGame.robot.card?.id
        : "",
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
      playerCount: this.players.length,
    });
  }

  setActivePlayer(name: string) {
    this.firestore.setLocalPlayer(name);
    this.localGame.addPlayer(name);
    this.activePlayer = this.players.find((it) => it.name === name)!;
    this.localGame.activePlayer = this.activePlayer;
  }

  async addPlayer(name: string) {
    await this.firestore.addPlayer(name);
    this.setActivePlayer(name);

    const params = new URLSearchParams(window.location.search);
    if (!params.has("player")) {
      params.append("player", name);
      window.location.search = params.toString();
    }
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
