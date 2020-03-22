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
  guess?: Guess;

  constructor(public name: string) {}

  drawCard() {
    this.word = undefined;
    this.card = TaskCard.take();
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
}
