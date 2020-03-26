import { Task } from "./Task";
import { Word } from "./Word";
import { Letter } from "./Letter";
import { observable, action } from "mobx";
import { Guess } from "./Guess";
import { RobotPlayer } from "./RobotPlayer";
import { TaskCard } from "../view/TaskCard";
import { CardPool } from "./CardPool";

export class Player {
  @observable
  card?: Task;
  @observable
  letters: Letter[] = [];
  @observable
  word?: Word;
  @observable
  guess: Guess = new Map();
  @observable
  tempGuess: Guess = new Map();
  @observable
  guessConfirmed = false;
  @observable
  score = 0;

  constructor(public name: string) {}

  drawCard(cardPool: CardPool) {
    this.card = cardPool.draw();
  }

  drawLetters() {
    this.letters = Letter.take9();
  }

  playWord(word: Word) {
    this.word = word;
  }

  @action
  addGuess(card: Task, player: Player) {
    this.guess.set(card, player);
  }

  @action
  addTempGuess(card: Task, player: Player) {
    this.tempGuess.set(card, player);
  }

  confirmGuess() {
    this.guessConfirmed = true;
  }

  resetGuessConfirmation() {
    this.guessConfirmed = false;
  }

  addScorePoint() {
    this.score++;
  }

  resetTask() {
    this.card = undefined;
  }

  resetLetters() {
    this.letters = [];
  }

  resetWord() {
    this.word = undefined;
  }

  resetGuess() {
    this.guess.clear();
  }

  resetScore() {
    this.score = 0;
  }
}
