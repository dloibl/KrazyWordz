import { Player } from "./Player";
import { Word } from "./Word";
import { Task } from "./Task";

export enum GameState {
  LOADING = "LOADING",
  CREATE = "CREATE",
  JOIN = "JOIN",
  PLAY_WORD = "PLAY_WORD",
  MAKE_GUESS = "MAKE_GUESS",
  SHOW_SCORE = "SHOW_SCORE",
  FINISHED = "FINSIHED",
}

export enum PlayerState {
  INIT = "INIT",
  PLAY = "PLAY",
  GUESS = "GUESS",
  SHOW_SCORE = "SHOW_SCORE",
  NEXT_ROUND = "NEXT_ROUND",
}
export interface PlayerEventData {
  name: string;
  state: PlayerState;
  word?: string;
  cardId?: string;
  letters?: string[];
  guess?: string;
  totalScore?: number;
}

export interface Playable {
  state?: GameState;
  players: Player[];
  activePlayer: Player;
  additionalCard?: Task;
  start(): void;
  addPlayer(name: string): void;
  playWord(player: Player, word: Word): void;
  makeYourGuess(player: Player): void;
  nextRound(player: Player): void;
  isOwner(player: { name: string }): boolean;
}

export interface GameEventHandler {
  onPlayerEvent(playerName: string, data: PlayerEventData): void;
  onGameEvent: (gameData: {
    started: boolean;
    additionalCardId: string;
    owner: string;
    playerCount: number;
    winningScore: number;
  }) => void;
}
