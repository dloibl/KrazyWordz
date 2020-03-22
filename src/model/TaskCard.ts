import { random } from "./util";

export class TaskCard {
  static CARDS = [
    { id: 0, value: "Maskottchen eines Boxers" },
    { id: 1, value: "Ist mal klein und mal groß" },
    { id: 2, value: "Zwielichtige Gestalt" }
  ];

  private constructor(public id: number, public task: string) {}

  static draw() {
    const card = random(this.CARDS);
    return new TaskCard(card.id, card.value);
  }

  equals(card: TaskCard) {
    return card.id === this.id;
  }
}
