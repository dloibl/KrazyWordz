import { random } from "./util";
import { observable } from "mobx";
import { Word } from "./Word";

export class Letter {
  static CONSONANTS = [
    "B",
    "C",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "V",
    "W",
    "X",
    "Y",
    "Z"
  ];
  static VOCALS = ["A", "E", "I", "O", "U", "Ä", "Ö", "Ü"];

  isVocal: boolean = false;

  @observable
  position?: number = undefined;

  private constructor(public value: string) {
    this.isVocal = Letter.VOCALS.includes(value);
  }

  static vocal() {
    return new Letter(random(this.VOCALS));
  }

  static consonant() {
    return new Letter(random(this.CONSONANTS));
  }

  static take9(): Letter[] {
    const result = [] as Letter[];
    for (let i = 0; i < 3; i++) {
      result.push(this.vocal());
    }
    for (let i = 0; i < 6; i++) {
      result.push(this.consonant());
    }
    return result;
  }
}

export function getLastPlayedLetter(letters: Letter[]) {
  return getSortedPlayedLetters(letters).reverse()[0] || {};
}

export function getSortedPlayedLetters(letters: Letter[]) {
  return letters
    .filter(it => it.position != null)
    .sort((a, b) => a.position! - b.position!);
}

export function getUnplayedLetters(letters: Letter[]) {
  return letters.filter(it => it.position == null);
}

export function getNextPosition(letters: Letter[]) {
  return ((getLastPlayedLetter(letters) || { position: 0 }).position || 0) + 1;
}

export function createWord(letters: Letter[]) {
  return new Word(
    getSortedPlayedLetters(letters)
      .map(it => it.value)
      .join("")
  );
}
