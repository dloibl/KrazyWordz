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
  measurementId: "G-MHSVRWEX5B"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

export class Firestore {
  private name?: string;

  constructor(private db = firebase.firestore()) {}

  private getGame() {
    return this.db.collection("games").doc(this.name);
  }

  newGame(name: string) {
    this.name = name;
    this.getGame().set({ started: false });
  }

  addPlayer(name: string) {
    this.getGame()
      .collection("players")
      .doc(name)
      .set({ name });
  }

  startGame() {
    this.getGame().set({ started: true });
  }

  setWord(player: string, word: string) {
    this.getGame()
      .collection("players")
      .doc(player)
      .set({ word });
  }
}
