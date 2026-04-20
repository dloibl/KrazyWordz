import {
  collection,
  doc,
  Firestore as FirebaseFirestore,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Player } from "../model";
import { GameEventHandler } from "../model/Playable";
import { BotProfile } from "../model/BotProfile";
import { app } from "./firebaseApp";

export class Firestore {
  private name?: string;
  private localPlayer?: string;

  constructor(
    private handler: GameEventHandler,
    private db: FirebaseFirestore = getFirestore(app)
  ) {}

  private getGame() {
    return doc(this.db, "games", this.name!);
  }

  private getPlayers() {
    return collection(this.getGame(), "players");
  }

  subscribe() {
    onSnapshot(
      this.getGame(),
      (querySnapshot) => {
        const game: any = querySnapshot.data();
        game && this.handler.onGameEvent(game);
      },
      (error) => {
        console.error("game subscription failed", error);
        this.handler.onError?.(error);
      }
    );

    onSnapshot(
      this.getPlayers(),
      (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const player = doc.id;
          const data: any = doc.data();
          this.handler.onPlayerEvent(player, data);
        });
      },
      (error) => {
        console.error("player subscription failed", error);
        this.handler.onError?.(error);
      }
    );
  }

  updatePlayer(player: Player, playerName = this.localPlayer) {
    if (!playerName) {
      throw new Error("No player selected for update");
    }
    updateDoc(doc(this.getPlayers(), playerName), {
      state: player.state,
      word: player.word ? player.word.word : null,
      cardId: player.card?.id,
      cardText: player.card?.task,
      letters: player.letters.map((it) => it.value),
      guess: player.guessConfirmed ? player.stringifyGuess() : null,
      totalScore: player.totalScore,
      isBot: player.isBot || null,
      botProfileId: player.botProfileId || null,
      botProfile: player.botProfile || null,
      botStatus: player.botStatus || null,
    });
  }

  joinGame(name: string) {
    this.name = name;
    this.subscribe();
  }

  async newGame({
    name,
    owner,
    winningScore = 15,
    botCount = 0,
    botProfileIds = [],
  }: {
    name: string;
    owner: string;
    winningScore: number;
    botCount?: number;
    botProfileIds?: string[];
  }) {
    this.name = name;
    await setDoc(this.getGame(), {
      owner,
      winningScore,
      botCount,
      botProfileIds,
      botAutomationVersion: 1,
    });
    await this.subscribe();
  }

  setLocalPlayer(name: string) {
    this.localPlayer = name;
  }

  addPlayer(name: string) {
    this.setLocalPlayer(name);
    return setDoc(doc(this.getPlayers(), name), { name, isBot: false });
  }

  addBotPlayer(playerId: string, botProfile: BotProfile) {
    return setDoc(doc(this.getPlayers(), playerId), {
      name: botProfile.name,
      isBot: true,
      botProfileId: botProfile.id,
      botProfile,
      botStatus: "idle",
    });
  }

  updateGame({
    additionalCardId = null as string | null,
    additionalCardText = null as string | null,
    playerCount = 0,
    roundCounter = 1,
  }) {
    updateDoc(this.getGame(), {
      additionalCardId,
      additionalCardText,
      playerCount,
      roundCounter,
    });
  }
}
