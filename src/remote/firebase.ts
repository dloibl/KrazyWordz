import firebase from "firebase/app";
import "firebase/firestore";
import { Player } from "../model";
import { GameEventHandler } from "../model/Playable";

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

export class Firestore {
  private name?: string;
  private localPlayer?: string;

  constructor(
    private handler: GameEventHandler,
    private db = firebase.firestore()
  ) {
    console.log("creating firestore");
  }

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
          const data: any = doc.data();
          console.log("received player event", player, data);
          this.handler.onPlayerEvent(player, data);
        });
      });
  }

  updatePlayer(player: Player) {
    console.log("fire player event", player);
    this.getGame()
      .collection("players")
      .doc(this.localPlayer)
      .update({
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
    await this.getGame().set({ owner, winningScore });
    await this.subscribe();
  }

  setLocalPlayer(name: string) {
    this.localPlayer = name;
  }

  addPlayer(name: string) {
    this.setLocalPlayer(name);
    return this.getGame().collection("players").doc(name).set({ name });
  }

  updateGame({
    additionalCardId = null as string | null,
    playerCount = 0,
    roundCounter = 1,
  }) {
    this.getGame().update({
      additionalCardId,
      playerCount,
      roundCounter,
    });
  }
}
