import { Task } from "./Task";
import { Word } from "./Word";
import { Letter } from "./Letter";
import { observable, action } from "mobx";
import { Guess } from "./Guess";
import { CardPool } from "./CardPool";
import { LetterPool } from "./LetterPool";

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
  guessConfirmed = false;
  @observable
  totalScore = 0;
  @observable
  roundScore = 0;
  @observable
  correctGuesses = 0;
  @observable
  isOwner?: boolean = false;

  constructor(public name: string, public color: string = "blue") {}

  drawCard(cardPool: CardPool) {
    this.card = cardPool.draw();
  }

  drawLetters(letterPool: LetterPool) {
    this.letters = letterPool.drawLetters();
  }

  playWord(word: Word) {
    this.word = word;
  }

  @action
  addGuess(card: Task, player: Player) {
    this.guess.set(card, player);
  }

  confirmGuess() {
    this.guessConfirmed = true;
  }

  resetGuessConfirmation() {
    this.guessConfirmed = false;
  }

  addScorePoint() {
    this.roundScore++;
    this.totalScore++;
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

  resetTotalScore() {
    this.totalScore = 0;
  }

  resetRoundScore() {
    this.roundScore = 0;
  }

  resetCorrectGuesses() {
    this.correctGuesses = 0;
  }
}
