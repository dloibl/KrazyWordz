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
  @observable
  readyForNextRound = true;

  constructor(public name: string, public color: string = "blue") {}

  drawCard(cardPool: CardPool) {
    this.card = cardPool.draw();
  }

  drawLetters(letterPool: LetterPool) {
    this.letters = letterPool.drawLetters();
  }

  playWord(word: Word) {
    this.word = word;
    this.readyForNextRound = false;
  }

  @action
  addGuess(card: Task, player: Player) {
    this.guess.set(card, player);
  }

  confirmGuess() {
    this.guessConfirmed = true;
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
    this.guessConfirmed = false;
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
