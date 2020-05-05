import { observable } from "mobx";
import { Word } from "./Word";

export class Letter {
  @observable
  position?: number = undefined;

  constructor(public value: string) {}
}

export function getLastPlayedLetter(letters: Letter[]) {
  return getSortedPlayedLetters(letters).reverse()[0] || {};
}

export function getSortedPlayedLetters(letters: Letter[]) {
  return letters
    .filter((it) => it.position != null)
    .sort((a, b) => a.position! - b.position!);
}

export function getUnplayedLetters(letters: Letter[]) {
  return letters.filter((it) => it.position == null);
}

export function getNextPosition(letters: Letter[]) {
  return ((getLastPlayedLetter(letters) || { position: 0 }).position || 0) + 1;
}

export function createWord(letters: Letter[]) {
  return new Word(
    getSortedPlayedLetters(letters)
      .map((it) => it.value)
      .join("")
  );
}
