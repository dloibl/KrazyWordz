import cards from "../resources/de/cards.json";
import { randomIndex } from "./util";
import { Task } from "./Task";

export class CardPool {
  private static INSTANCE = new CardPool();

  static getInstance() {
    return this.INSTANCE;
  }

  private constructor() {}

  private cards = Object.entries(cards).map(
    ([id, value]) => new Task(id, value)
  );

  draw() {
    const index = randomIndex(this.cards);
    const card = this.cards[index];
    this.cards.splice(index, 1);
    return card;
  }

  getTask(id: string) {
    return this.cards.find((it) => it.id === id);
  }
}
