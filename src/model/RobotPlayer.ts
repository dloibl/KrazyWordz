import { Player } from "./Player";

export class RobotPlayer extends Player {
  constructor() {
    super("robot");
  }

  drawLetters() {
    //robot only has a taskcard
    return;
  }
}
