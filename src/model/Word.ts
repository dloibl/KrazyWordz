import { Letter } from "./Letter";

export class Word {
  constructor(public word: string) {}

  getLetters(): Letter[] {
    if (!this.word) {
      return [];
    }
    return this.word.split("").map((char, index) => {
      const letter = new Letter(char);
      letter.position = index + 1;
      return letter;
    });
  }
}
