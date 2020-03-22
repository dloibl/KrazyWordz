import { TaskCard } from "./TaskCard";
import { Word } from "./Word";
import { Letter } from "./Letter";
import { observable } from "mobx";

export class Player {
  @observable
  card?: TaskCard;
  @observable
  letters: Letter[] = [];
  word?: Word;

  constructor(public name: string) {}

  takeCard() {
    this.word = undefined;
    this.card = TaskCard.take();
  }

  takeLetters() {
    this.letters = Letter.take9();
  }

  placeWord(word: Word) {
    this.word = word;
  }
}
