import { Game } from "./Game";

export { Game } from "./Game";
export { Letter } from "./Letter";
export { Player } from "./Player";
export { Task } from "./Task";
export { Word } from "./Word";

export async function createGame(remote = false) {
  return remote
    ? import("./RemoteGame").then(m => new m.RemoteGame())
    : new Game();
}
