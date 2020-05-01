import { Firestore } from "../remote/firebase";
import { Player } from "./Player";
import { Word, Task } from ".";
import { Playable } from "./Playable";
import { observable, IReactionDisposer } from "mobx";
import { CardPool } from "./CardPool";
import { computed, reaction } from "mobx";
import { RobotPlayer } from "./RobotPlayer";
import { LetterPool } from "./LetterPool";
import { Guess } from "./Guess";

export class Game implements Playable {
  @observable
  name?: string;

  @observable
  players: Player[] = [];

  @observable
  activePlayer: Player & { isOwner?: boolean } = null!;

  @observable
  robot = new RobotPlayer();

  @observable
  isGameFinished: boolean = false;

  @observable
  winningScore = 15;

  @observable
  roundCounter = 0;

  @observable
  playerCount = -1;

  private cardPool = CardPool.getInstance();

  private letterPool?: LetterPool;

  private readyReactionDisposer: IReactionDisposer;

  constructor(
    private firestore = new Firestore({
      onGameEvent: (game) => this.syncGameState(game),
      onPlayerEvent: (playerName, data) => {
        this.syncPlayer(playerName);
        this.syncWordAndCard(playerName, data);
        this.syncGuess(playerName, data);
        this.syncScore(playerName, data);
        this.syncNextRound(playerName, data);
      },
    })
  ) {
    (window as any).Game = this;

    this.readyReactionDisposer = reaction(
      () => this.areAllPlayersReadyForNextRound,
      (value) => {
        if (value) {
          this.nextRound();
        }
      }
    );
  }

  init({ join, player }: { join: string | null; player: string | null }) {
    if (join) {
      this.joinGame(join);
    }
    if (player) {
      this.setActivePlayer(player);
    }
    return this;
  }

  dispose() {
    this.readyReactionDisposer();
  }

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
    if (started && this.name && this.activePlayer && !this.isStarted) {
      console.log("Starting game");
      this.start();
    }
    if (winningScore) {
      this.winningScore = winningScore;
    }
    if (additionalCardId != null && !this.robot.card) {
      this.robot.card = CardPool.getInstance().getTask(additionalCardId);
    }
    if (owner && this.activePlayer?.name === owner) {
      this.activePlayer.isOwner = true;
    }
    if (playerCount && this.playerCount < 0) {
      this.playerCount = playerCount;
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
    const player = this.getPlayer(playerName)!;

    if (data.guess) {
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
        this.makeYourGuess(player);
      }
    }
  }

  private syncPlayer(playerName: string) {
    playerName && this.addPlayerLocal(playerName);
  }

  private syncWordAndCard(
    playerName: string,
    data: { cardId?: string; word?: string }
  ) {
    const player = this.getPlayer(playerName)!;
    if (data.word && data.cardId) {
      player.card = CardPool.getInstance().getTask(data.cardId);
      this.playWord(player, new Word(data.word));
    }
  }

  private syncNextRound(
    playerName: string,
    data: { totalScore?: number; cardId?: string }
  ) {
    const player = this.getPlayer(playerName)!;
    if (data.totalScore != null && data.cardId == null) {
      player.readyForNextRound = true;
    }
  }

  private getPlayer(name: string) {
    return (
      this.players.find((it) => it.name === name) || this.addPlayerLocal(name)
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
    if (this.roundCounter > 0) {
      this.players.forEach((player) => this.resetRound(player));
      this.firestore.resetRound({
        additionalCardId: this.activePlayer.isOwner ? this.robot.card?.id : "",
        score: this.activePlayer.totalScore,
      });
    }
    this.roundCounter++;

    this.letterPool = new LetterPool();
    this.drawCardAndLetters(this.activePlayer);
  }

  resetRound(player: Player) {
    player.resetGuess();
    player.resetLetters();
    player.resetWord();
    player.resetTask();
    player.resetRoundScore();
    player.readyForNextRound = false;
    this.robot.resetTask();
  }

  drawCardAndLetters(player: Player) {
    if (player.isOwner) {
      this.robot.drawCard(this.cardPool);
    }
    player.drawCard(this.cardPool);
    player.drawLetters(this.letterPool!);
  }

  deletePlayer(): void {
    throw new Error("Method not implemented.");
  }

  start() {
    this.nextRound();
    this.firestore.startGame({
      additionalCardId: this.activePlayer.isOwner ? this.robot.card?.id : "",
      playerCount: this.players.length,
    });
  }

  setActivePlayer(name: string) {
    this.firestore.setLocalPlayer(name);
    this.addPlayerLocal(name);
    this.activePlayer = this.players.find((it) => it.name === name)!;
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
    player.playWord(word);
    this.firestore.setWord(player.name, word.word, player.card!.id);
  }

  makeYourGuess(player: Player) {
    player.confirmGuess();

    if (this.haveAllPlayersGuessed) {
      this.givePoints();
    }
    const guess: { [key: string]: string } = {};
    player.guess.forEach((player, task) => (guess[task.id] = player.name));
    this.firestore.storeGuess(player.name, guess);
  }

  private givePoints() {
    this.players.forEach((guessingPlayer) =>
      this.evaluateGuess(guessingPlayer, guessingPlayer.guess!)
    );

    this.isGameFinished = this.players.some((player) =>
      this.hasWinningScore(player)
    );
  }

  evaluateGuess(guessingPlayer: Player, guess: Guess) {
    guess.forEach((player, task) =>
      this.distributePoints(guessingPlayer, task, player)
    );
  }

  hasWinningScore(player: Player) {
    return player.totalScore >= this.winningScore;
  }

  distributePoints(guessingPlayer: Player, task: Task, player: Player) {
    if (player.card?.id === task.id) {
      guessingPlayer.correctGuesses++;
      guessingPlayer.addScorePoint();
      player.addScorePoint();
    }
  }

  addPlayerLocal(name: string) {
    if (!name) {
      throw new Error("Name must be given");
    }
    if (this.players.find((it) => it.name === name) != null) {
      console.warn(`Player with ${name} already exists`);
      return;
    }
    const player = new Player(name, this.computeColor(this.players.length));

    this.players.push(player);

    return player;
  }

  private computeColor(index: number) {
    const colors = [
      "#326f0f",
      "#bb510a",
      "#1bbed0",
      "#853f02",
      "#aa7d47",
      "#433d46",
      "#00806d",
    ];

    return colors[index];
  }

  @computed
  get haveAllPlayersGuessed() {
    return (
      this.allPlayersLoaded() &&
      this.players.every((player) => player.guessConfirmed === true)
    );
  }

  private allPlayersLoaded() {
    return this.playerCount === this.players.length;
  }

  @computed
  get isGuessTime() {
    return (
      this.allPlayersLoaded() &&
      this.players.every((player) => player.word != null) &&
      !this.haveAllPlayersGuessed
    );
  }

  @computed
  get isStarted() {
    return this.roundCounter > 0;
  }

  @computed
  get areAllPlayersReadyForNextRound() {
    return (
      this.allPlayersLoaded() &&
      this.players.every((it) => it.readyForNextRound)
    );
  }
}
