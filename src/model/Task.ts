import { random } from "./util";

import cards from "../resources/de/cards.json";
const CARDS = Object.entries(cards).map(([id, value]) => ({ id, value }));
export class Task {
  private constructor(public id: string, public task: string) {}

  static draw() {
    const card = random(CARDS);
    return new Task(card.id, card.value);
  }

  equals(card: Task) {
    return card.id === this.id;
  }
}
