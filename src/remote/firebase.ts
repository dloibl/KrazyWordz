import { initializeApp } from "firebase/app";
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

const env = (name: string) => process.env[name] || "";

const firebaseConfig = {
  apiKey: env("REACT_APP_FIREBASE_API_KEY"),
  authDomain: env("REACT_APP_FIREBASE_AUTH_DOMAIN"),
  databaseURL: env("REACT_APP_FIREBASE_DATABASE_URL"),
  projectId: env("REACT_APP_FIREBASE_PROJECT_ID"),
  storageBucket: env("REACT_APP_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("REACT_APP_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("REACT_APP_FIREBASE_APP_ID"),
  measurementId: env("REACT_APP_FIREBASE_MEASUREMENT_ID"),
};

if (!firebaseConfig.apiKey && process.env.NODE_ENV !== "test") {
  console.warn(
    "Missing REACT_APP_FIREBASE_API_KEY. Firebase requests may fail until it is configured."
  );
}

const app = initializeApp(firebaseConfig);

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

  updatePlayer(player: Player) {
    updateDoc(doc(this.getPlayers(), this.localPlayer), {
      state: player.state,
      word: player.word?.word || null,
      cardId: player.card?.id,
      letters: player.letters.map((it) => it.value),
      guess: player.guessConfirmed ? player.stringifyGuess() : null,
      totalScore: player.totalScore,
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
  }: {
    name: string;
    owner: string;
    winningScore: number;
  }) {
    this.name = name;
    await setDoc(this.getGame(), { owner, winningScore });
    await this.subscribe();
  }

  setLocalPlayer(name: string) {
    this.localPlayer = name;
  }

  addPlayer(name: string) {
    this.setLocalPlayer(name);
    return setDoc(doc(this.getPlayers(), name), { name });
  }

  updateGame({
    additionalCardId = null as string | null,
    playerCount = 0,
    roundCounter = 1,
  }) {
    updateDoc(this.getGame(), {
      additionalCardId,
      playerCount,
      roundCounter,
    });
  }
}
