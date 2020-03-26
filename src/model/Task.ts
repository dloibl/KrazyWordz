import { random } from "./util";
import { CardPool } from "./CardPool";

export class Task {
  constructor(public id: string, public task: string) {}

  equals(card: Task) {
    return card.id === this.id;
  }
}
