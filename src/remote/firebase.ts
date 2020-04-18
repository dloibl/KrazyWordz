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

enum ActionType {
  START_GAME,
  ADD_PLAYER,
  PLAY_WORD,
  MAKE_GUESS,
}

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

  constructor(private db = firebase.firestore()) {}

  private getGame() {
    return this.db.collection("games").doc(this.name);
  }

  subscribe() {
    this.getGame().onSnapshot((querySnapshot) => {
      const game = querySnapshot.data();
      if (getActionType(game) === ActionType.START_GAME) {
        this.onGameStarted();
      }
    });

    this.getGame()
      .collection("players")
      .onSnapshot((querySnapshot) => {
        // const numberOfPlayers = querySnapshot.size;
        querySnapshot.forEach((doc) => {
          const player = doc.id;
          if (player !== this.localPlayer) {
            const data = doc.data(); // {word: "", guess}
            console.log(data, player);
            switch (getActionType(data)) {
              case ActionType.ADD_PLAYER:
                this.onPlayerAdded(data.name);
                break;
              case ActionType.PLAY_WORD:
                this.onWordPlayed(
                  player,
                  data as { word: string; cardId: string }
                );
                break;
              case ActionType.MAKE_GUESS:
                this.onPlayerGuessed(player, JSON.parse(data.guess));
                break;
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

  resetRound() {
    this.getGame().collection("players").doc(this.localPlayer).set({});
  }

  addPlayer(name: string) {
    this.localPlayer = name;
    this.getGame().collection("players").doc(name).set({ name });
  }

  startGame() {
    this.getGame().set({ started: true });
  }

  setWord(player: string, word: string, cardId: string) {
    this.getGame().collection("players").doc(player).update({ word, cardId });
  }

  //guess number: cardId, guess string: player name
  storeGuess(player: string, guess: { [key: string]: string }) {
    this.getGame()
      .collection("players")
      .doc(player)
      .update({ guess: JSON.stringify(guess) });
  }
}

function getActionType(data: any) {
  if (data == null) {
    return;
  }
  if (data.guess) {
    return ActionType.MAKE_GUESS;
  }
  if (data.word) {
    return ActionType.PLAY_WORD;
  }
  if (data.started) {
    return ActionType.START_GAME;
  }
  if (data.name) {
    return ActionType.ADD_PLAYER;
  }
}
