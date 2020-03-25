import { Task } from "./Task";
import { Word } from "./Word";
import { Letter } from "./Letter";
import { observable, action } from "mobx";
import { Guess } from "./Guess";
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
