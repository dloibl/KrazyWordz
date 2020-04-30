import { Player } from "./Player";
import { observable, computed, action, reaction } from "mobx";
import { Word } from "./Word";
import { Guess } from "./Guess";
import { Task } from "./Task";
import { RobotPlayer } from "./RobotPlayer";
import { CardPool } from "./CardPool";
import { LetterPool } from "./LetterPool";
import { Playable } from "./Playable";

export class Game implements Playable {
  @observable
  players: Player[] = [];

  robot = new RobotPlayer();

  winningScore = 15;

  @observable
  isGameFinished: boolean = false;

  @observable
  roundCounter = 0;

  private cardPool = CardPool.getInstance();

  private letterPool?: LetterPool;

  activePlayer: Player = null!;

  @observable
  playerCount = -1;

  constructor() {
    (window as any).Game = this;

    reaction(
      () => this.areAllPlayersReadyForNextRound,
      (value) => {
        if (value) {
          this.nextRound();
        }
      }
    );
  }

  start() {
    this.nextRound();
  }

  @action
  drawCardAndLetters(player: Player) {
    if (player.isOwner) {
      this.robot.drawCard(this.cardPool);
    }
    player.drawCard(this.cardPool);
    player.drawLetters(this.letterPool!);
  }

  @action
  playWord(player: Player, word: Word) {
    player.playWord(word);
  }

  @action
  makeYourGuess(player: Player) {
    player.confirmGuess();

    if (this.haveAllPlayersGuessed) {
      this.givePoints();
    }
  }

  evaluateGuess(guessingPlayer: Player, guess: Guess) {
    guess.forEach((player, task) =>
      this.distributePoints(guessingPlayer, task, player)
    );
  }

  distributePoints(guessingPlayer: Player, task: Task, player: Player) {
    if (player.card?.id === task.id) {
      guessingPlayer.correctGuesses++;
      guessingPlayer.addScorePoint();
      player.addScorePoint();
    }
  }

  private givePoints() {
    this.players.forEach((guessingPlayer) =>
      this.evaluateGuess(guessingPlayer, guessingPlayer.guess!)
    );

    this.isGameFinished = this.players.some((player) =>
      this.hasWinningScore(player)
    );
  }

  hasWinningScore(player: Player) {
    return player.totalScore >= this.winningScore;
  }

  @computed
  get areAllPlayersReadyForNextRound() {
    return (
      this.allPlayersLoaded() &&
      this.players.every((it) => it.readyForNextRound)
    );
  }

  nextRound() {
    this.roundCounter++;
    if (this.roundCounter > 0) {
      this.players.forEach((player) => this.resetRound(player));
    }
    this.letterPool = new LetterPool();
    this.drawCardAndLetters(this.activePlayer);
  }

  finishGame() {
    this.isGameFinished = true;
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

  @computed
  get isStarted() {
    return this.roundCounter > 0;
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
  get haveAllPlayersGuessed() {
    return (
      this.allPlayersLoaded() &&
      this.players.every((player) => player.guessConfirmed === true)
    );
  }

  private allPlayersLoaded() {
    return this.playerCount === this.players.length;
  }

  deletePlayer(name: string) {
    this.players = this.players.filter((it) => it.name !== name);
  }

  addPlayer = (name: string) => {
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
  };

  private computeColor(index: number) {
    const colors = ["red", "blue", "green", "teal", "pink", "purple", "orange"];

    return colors[index];
  }
}
