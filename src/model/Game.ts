import { Player } from "./Player";
import { observable, computed, action } from "mobx";
import { Word } from "./Word";
import { Guess } from "./Guess";
import { Task } from "./Task";
import { RobotPlayer } from "./RobotPlayer";

export class Game {
  @observable
  players: Player[] = [new Player("Pia")];

  robot = new RobotPlayer();

  winningScore = 15;

  @observable
  isGameFinished: boolean = false;

  @observable
  activePlayerIndex = -1;

  @observable
  roundCounter = 0;

  @computed
  get activePlayer() {
    return this.players[this.activePlayerIndex];
  }

  constructor() {
    (window as any).Game = this;
  }

  start() {
    this.roundCounter++;

    this.robot.drawCard();
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
  makeYourGuess(player: Player) {
    player.confirmGuess();

    // temp until parallel playing
    this.nextPlayer();
  }

  evaluateGuess(guessingPlayer: Player, guess: Guess) {
    guess.forEach((player, task) =>
      this.distributePoints(guessingPlayer, task, player)
    );
  }

  distributePoints(guessingPlayer: Player, task: Task, player: Player) {
    if (player.card?.id === task.id) {
      guessingPlayer.addScorePoint();
      player.addScorePoint();
    }
  }

  nextPlayer() {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    if (!this.activePlayer) {
      return;
    }
    if (this.isGuessTime) {
      // what to do?
    } else if (this.haveAllPlayersGuessed) {
      //give points
      this.players.forEach(guessingPlayer =>
        this.evaluateGuess(guessingPlayer, guessingPlayer.guess!)
      );

      this.isGameFinished = this.players.some(player =>
        this.hasWinningScore(player)
      );
    } else {
      this.drawCardAndLetters(this.activePlayer);
    }
  }

  hasWinningScore(player: Player) {
    return player.score >= this.winningScore;
  }

  nextRound() {
    this.roundCounter++;
    this.players.forEach(player => this.resetRound(player));

    //temp until parallel playing
    this.nextPlayer();
  }

  finishGame() {
    this.isGameFinished = true;
  }

  resetRound(player: Player) {
    player.resetGuess();
    player.resetLetters();
    player.resetWord();
    player.resetTask();
    player.resetGuessConfirmation();
  }

  @computed
  get isStarted() {
    return this.roundCounter > 0;
  }

  @computed
  get isGuessTime() {
    return (
      this.players.every(player => player.word != null) &&
      !this.haveAllPlayersGuessed
    );
  }

  @computed
  get haveAllPlayersGuessed() {
    return this.players.every(player => player.guessConfirmed === true);
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
