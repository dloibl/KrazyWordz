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

  private usedCards: Task[] = [];

  draw() {
    const index = randomIndex(this.cards);
    const card = this.cards[index];
    this.cards.splice(index, 1);
    this.usedCards.push(card);
    return card;
  }

  getTask(id: string) {
    return this.cards
      .concat(this.usedCards)
      .find((it) => String(it.id) === String(id));
  }
}
