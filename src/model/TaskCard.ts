import { random } from "./util";

export class TaskCard {
  static CARDS = [
    "Maskottchen eines Boxers",
    "Ist mal klein und mal groß",
    "Zwielichtige Gestalt"
  ];

  private constructor(public task: string) {}

  static take() {
    return new TaskCard(random(this.CARDS));
  }
}
