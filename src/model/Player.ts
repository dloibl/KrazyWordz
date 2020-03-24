import { Task } from "./Task";
import { Word } from "./Word";
import { Letter } from "./Letter";
import { observable, action } from "mobx";
import { Guess } from "./Guess";

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
  score = 0;

  constructor(public name: string) {}

  drawCard() {
    this.word = undefined;
    this.card = Task.draw();
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
    this.guess.clear();
  }

  resetScore() {
    this.score = 0;
  }
}
