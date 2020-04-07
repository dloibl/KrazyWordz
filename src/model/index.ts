import { Game } from "./Game";
import { Playable } from "./Playable";

export { Game } from "./Game";
export { Letter } from "./Letter";
export { Player } from "./Player";
export { Task } from "./Task";
export { Word } from "./Word";

export async function createGame(remote = false): Promise<Playable> {
  return remote
    ? import("./RemoteGame").then(m => new m.RemoteGame())
    : new Game();
}
