import { Player } from "./Player";
import { Word } from "./Word";

export interface Playable {
  isStarted: boolean;
  haveAllPlayersGuessed: boolean;
  areAllPlayersReadyForNextRound: boolean;
  isGuessTime: boolean;
  players: Player[];
  activePlayer: Player;
  robot: Player;
  start(): void;
  addPlayer(name: string): void;
  deletePlayer(name: string): void;
  playWord(player: Player, word: Word): void;
  makeYourGuess(player: Player): void;
  nextRound(): void;
}
