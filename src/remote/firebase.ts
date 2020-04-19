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

export class Firestore {
  private name?: string;
  private localPlayer?: string;
  onPlayerAdded!: (player: string) => void;
  onGameStarted!: () => void;
  onWordPlayed!: (
    player: string,
    wordAndCard: { word: string; cardId: string }
  ) => void;
  onPlayerGuessed!: (player: string, guess: { [key: string]: string }) => void;
  onSyncAdditionalCard!: (cardId: string) => void;

  constructor(private db = firebase.firestore()) {}

  private getGame() {
    return this.db.collection("games").doc(this.name);
  }

  subscribe() {
    this.getGame().onSnapshot((querySnapshot) => {
      const game = querySnapshot.data();
      console.log("received game event", game);
      if (!game) {
        return;
      }
      if (isStartGame(game)) {
        this.onGameStarted();
      }
      if (isSyncAdditionalCard(game)) {
        this.onSyncAdditionalCard(game.additionalCardId);
      }
    });

    this.getGame()
      .collection("players")
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const player = doc.id;
          if (player !== this.localPlayer) {
            const data = doc.data();
            console.log("received player event", player, data);
            if (isMakeGuess(data)) {
              this.onPlayerGuessed(player, JSON.parse(data.guess));
            } else if (isPlayWord(data)) {
              this.onWordPlayed(
                player,
                data as { word: string; cardId: string }
              );
            } else if (isAddPlayer(data)) {
              this.onPlayerAdded(data.name);
            }
          }
        });
      });
  }

  joinGame(name: string) {
    this.name = name;
    this.subscribe();
  }

  async newGame(name: string) {
    this.name = name;
    this.getGame().set({ started: false });
    this.subscribe();
  }

  resetRound({ additionalCardId = undefined as string | undefined }) {
    this.getGame().collection("players").doc(this.localPlayer).set({});
    if (additionalCardId) {
      this.getGame().update({ additionalCardId });
    }
  }

  addPlayer(name: string) {
    this.localPlayer = name;
    this.getGame().collection("players").doc(name).set({ name });
  }

  startGame({ additionalCardId = undefined as string | undefined }) {
    this.getGame().set({ started: true, additionalCardId });
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

const isMakeGuess = (data: any) => !!data.guess;
const isPlayWord = (data: any) => data.word != null && data.guess == null;
const isSyncAdditionalCard = (data: any) => data.additionalCardId != null;
const isStartGame = (data: any) => data.started === true;
const isAddPlayer = (data: any) => data.name != null && data.word == null;
