import { random } from "./util";

export class Task {
  static CARDS = [
    { id: 0, value: "Maskottchen eines Boxers" },
    { id: 1, value: "Ist mal klein und mal groß" },
    { id: 2, value: "Zwielichtige Gestalt" }
  ];

  private constructor(public id: number, public task: string) {}

  static draw() {
    const card = random(this.CARDS);
    return new Task(card.id, card.value);
  }

  equals(card: Task) {
    return card.id === this.id;
  }
}
