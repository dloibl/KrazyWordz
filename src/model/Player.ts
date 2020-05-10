import { Task } from "./Task";
import { Word } from "./Word";
import { Letter } from "./Letter";
import { observable } from "mobx";
import { Guess } from "./Guess";
import { CardPool } from "./CardPool";
import { LetterPool } from "./LetterPool";
import { PlayerState } from "./Playable";

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
  waitingForNextRound = false;
  @observable
  state = PlayerState.INIT;

  constructor(public name: string, public color: string = "blue") {}

  stringifyGuess() {
    const guess: { [key: string]: string } = {};
    this.guess.forEach((player, task) => (guess[task.id] = player.name));
    return JSON.stringify(guess);
  }

  drawCard(cardPool: CardPool, cardId?: string) {
    this.card = cardPool.draw(cardId);
    this.state = PlayerState.PLAY;
  }

  drawLetters(letterPool: LetterPool, letters?: string[]) {
    this.letters = letters
      ? letters.map((it) => new Letter(it))
      : letterPool.drawLetters();
  }

  playWord(word: Word) {
    this.word = word;
    this.state = PlayerState.GUESS;
  }

  setReadyForNextRound(totalScore?: number) {
    this.waitingForNextRound = true;
    this.totalScore = totalScore || this.totalScore;
    this.state = PlayerState.NEXT_ROUND;
  }

  addGuess(card: Task, player: Player) {
    this.guess.set(card, player);
  }

  confirmGuess() {
    this.guessConfirmed = true;
    this.state = PlayerState.SHOW_SCORE;
  }

  addScorePoint() {
    this.roundScore++;
    this.totalScore++;
  }

  reset() {
    this.card = undefined;
    this.letters = [];
    this.word = undefined;
    this.guess.clear();
    this.guessConfirmed = false;
    this.roundScore = 0;
    this.waitingForNextRound = false;
    this.correctGuesses = 0;
    this.state = PlayerState.INIT;
  }
}
