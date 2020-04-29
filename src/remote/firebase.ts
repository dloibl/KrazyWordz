import firebase from "firebase/app";
import "firebase/firestore";

var firebaseConfig = {
  apiKey: new URLSearchParams(window.location.search).get("apiKey"),
  authDomain: "krazywordz-98c48.firebaseapp.com",
  databaseURL: "https://krazywordz-98c48.firebaseio.com",
  projectId: "krazywordz-98c48",
  storageBucket: "krazywordz-98c48.appspot.com",
  messagingSenderId: "898573562197",
  appId: "1:898573562197:web:5e66487a4ddcd74361bfdc",
  measurementId: "G-MHSVRWEX5B",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

interface EventHandler {
  onPlayerEvent(
    playerName: string,
    data: {
      name: string;
      word?: string;
      cardId?: string;
      guess?: string;
      totalScore?: number;
    }
  ): void;
  onGameEvent: (gameData: {
    started: boolean;
    additionalCardId: string;
    owner: string;
    playerCount: number;
  }) => void;
}

export class Firestore {
  private name?: string;
  private localPlayer?: string;

  constructor(
    private handler: EventHandler,
    private db = firebase.firestore()
  ) {}

  private getGame() {
    return this.db.collection("games").doc(this.name);
  }

  subscribe() {
    this.getGame().onSnapshot((querySnapshot) => {
      const game: any = querySnapshot.data();
      console.log("received game event", game);
      game && this.handler.onGameEvent(game);
    });

    this.getGame()
      .collection("players")
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const player = doc.id;
          //if (player !== this.localPlayer) {
          const data: any = doc.data();
          console.log("received player event", player, data);
          this.handler.onPlayerEvent(player, data);
          //}
        });
      });
  }

  joinGame(name: string) {
    this.name = name;
    this.subscribe();
  }

  async newGame(name: string, owner: string) {
    this.name = name;
    await this.getGame().set({ started: false, owner });
    await this.subscribe();
  }

  resetRound({ additionalCardId = "" as string, score = 0 }) {
    this.getGame()
      .collection("players")
      .doc(this.localPlayer)
      .set({ totalScore: score });
    if (additionalCardId) {
      this.getGame().update({ additionalCardId });
    }
  }

  setLocalPlayer(name: string) {
    this.localPlayer = name;
  }

  addPlayer(name: string) {
    this.setLocalPlayer(name);
    return this.getGame().collection("players").doc(name).set({ name });
  }

  startGame({
    additionalCardId = undefined as string | undefined,
    playerCount = 0,
  }) {
    this.getGame().set({ started: true, additionalCardId, playerCount });
  }

  setWord(player: string, word: string, cardId: string) {
    this.getGame()
      .collection("players")
      .doc(player)
      .update({ word, cardId, guess: null });
  }

  //guess number: cardId, guess string: player name
  storeGuess(player: string, guess: { [key: string]: string }) {
    this.getGame()
      .collection("players")
      .doc(player)
      .update({ guess: JSON.stringify(guess) });
  }
}
