import { random } from "./util";

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
