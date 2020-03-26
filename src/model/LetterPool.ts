import { randomIndex, random } from "./util";
import { Letter } from "./Letter";

export class LetterPool {
  private consonants = [
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
    "Z",
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
    "Z"
  ];
  private vocals = [
    "A",
    "A",
    "A",
    "A",
    "E",
    "E",
    "E",
    "E",
    "I",
    "I",
    "I",
    "O",
    "O",
    "O",
    "O",
    "U",
    "U",
    "U",
    "U",
    "Ä",
    "Ö",
    "Ü",
    "Y"
  ];

  constructor() {}

  drawLetters() {
    const result = [] as Letter[];

    this.drawConsonants(result, 6);
    this.drawVocals(result, 3);

    return result;
  }
  drawVocals(result: Letter[], number: number) {
    for (let i = 0; i < number; i++) {
      const drawnLetterIndex = randomIndex(this.vocals);
      result.push(new Letter(this.vocals[drawnLetterIndex]));
      this.vocals.splice(drawnLetterIndex, 1);
    }
    return result;
  }
  drawConsonants(result: Letter[], number: number) {
    for (let i = 0; i < number; i++) {
      const drawnLetterIndex = randomIndex(this.consonants);
      result.push(new Letter(this.consonants[drawnLetterIndex]));
      this.consonants.splice(drawnLetterIndex, 1);
    }
    return result;
  }
}
