import { TaskCard } from "./TaskCard";
import { Word } from "./Word";
import { Letter } from "./Letter";
import { observable } from "mobx";
import { Guess } from "./Guess";

export class Player {
  @observable
  card?: TaskCard;
  @observable
  letters: Letter[] = [];
  @observable
  word?: Word;
  @observable
  guess?: Guess;
  score = 0;

  constructor(public name: string) {}

  drawCard() {
    this.word = undefined;
    this.card = TaskCard.draw();
  }

  drawLetters() {
    this.letters = Letter.take9();
  }

  playWord(word: Word) {
    this.word = word;
  }

  makeGuess(guess: Guess) {
    this.guess = guess;
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
    this.guess = undefined;
  }

  resetScore() {
    this.score = 0;
  }
}
