import { Game } from "./Game";
import { Firestore } from "../remote/firebase";
import { PlayerEventData, PlayerState, GameState } from "./Playable";
import { when } from "mobx";
import { Word } from "./Word";
import { doesNotReject } from "assert";

describe("Crazy Words Game", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game(firestore);
    delete window.location;
    window.location = new URL("http://crazy-words") as any;
  });

  const firestore: Firestore & { fireGameEvent: any; firePlayerEvent: any } = {
    setLocalPlayer: jest.fn(),
    addPlayer: jest.fn(() => Promise.resolve()),
    updatePlayer: jest.fn(),
    newGame: jest.fn(() => Promise.resolve()),
    joinGame: jest.fn(),
    updateGame: jest.fn(),
    fireGameEvent: (data: any) => {
      game.syncGameState(data);
    },
    firePlayerEvent(data: PlayerEventData & { state: PlayerState }) {
      game.syncPlayerState(data.name, data);
    },
  } as any;

  it("is constructable", () => {
    expect(game).toBeDefined();
  });

  it("inital game state is CREATE", () => {
    expect(game.state).toEqual(GameState.CREATE);
    expect(game.isStarted).toEqual(false);
  });

  it("can create a new game", async () => {
    await game.createGame({
      name: "test",
      winningScore: 5,
      owner: "me",
    });
    expect(firestore.newGame).toBeCalled();
    expect(firestore.addPlayer).toBeCalled();
    expect(window.location.search).toEqual("?join=test&player=me");
    expect(firestore.joinGame).toBeCalled();
    expect(game.state).toEqual(GameState.JOIN);
  }, 3000);

  it("can join a game", async () => {
    game.init({ join: "game", player: null });
    expect(game.name).toEqual("game");
    await game.addPlayer("you");
    expect(firestore.addPlayer).toBeCalled();
    expect(window.location.search).toContain("player=you");
    expect(game.activePlayer.name).toEqual("you");
  });

  it("can rejoin a game", () => {
    game.init({ join: "game", player: "Me" });
    expect(game.state).toEqual(GameState.JOIN);
    expect(game.activePlayer).toBeDefined();
    expect(game.activePlayer.name).toEqual("Me");
  });

  it("game creator is the owner", async () => {
    await game.createGame({
      name: "oasd",
      owner: "homer",
    });
    expect(game.isOwner({ name: "homer" })).toEqual(true);
    expect(game.isOwner({ name: "barney" })).toEqual(false);
  });

  it("game joiners receive the owner", async () => {
    game.joinGame("bla");
    firestore.fireGameEvent({ owner: "homer" });
    expect(game.isOwner({ name: "homer" })).toEqual(true);
  });

  it("owner can start the game", async () => {
    await game.addPlayer("A");
    await game.addPlayer("B");
    game.owner = "B";
    game.playerCount = 2;
    game.start();
    expect(firestore.updateGame).toBeCalled();
    expect(game.state).toEqual(GameState.PLAY_WORD);
    expect(game.activePlayer.card).toBeDefined();
  });

  it("can start game of joiners", () => {
    game.init({ join: "test", player: "B" });
    firestore.firePlayerEvent({
      name: "A",
      cardId: "42",
      letters: ["A", "B"],
      state: PlayerState.PLAY,
    });
    firestore.firePlayerEvent({ name: "B" });
    firestore.fireGameEvent({
      roundCounter: 1,
      playerCount: 2,
    });
    expect(game.playerCount).toEqual(2);
    expect(game.players.length).toEqual(2);
    expect(game.state).toEqual(GameState.PLAY_WORD);
    expect(game.activePlayer.state).toEqual(PlayerState.PLAY);
    expect(game.activePlayer.card).toBeDefined();
    expect(game.activePlayer.letters).toBeDefined();
  });

  it("synchronizes card and letters", () => {
    game.init({ join: "test", player: "B" });
    firestore.firePlayerEvent({ name: "A" });
    firestore.firePlayerEvent({ name: "B" });
    firestore.fireGameEvent({
      roundCounter: 1,
      playerCount: 2,
    });
    firestore.firePlayerEvent({
      name: "A",
      state: PlayerState.PLAY,
      letters: ["A", "B", "C"],
      cardId: "1",
    });
    const a = game.getPlayer("A");
    expect(a.card).toBeDefined();
    expect(a.letters).toBeDefined();
  });

  it("is guessing time when all players have played there words", () => {
    startGameWithTwoPlayers();
    game.playWord(game.activePlayer, new Word("BLA"));
    expect(game.state).toEqual(GameState.PLAY_WORD);
    expect(game.activePlayer.state).toEqual(PlayerState.GUESS);
    firestore.firePlayerEvent({
      name: "A",
      state: PlayerState.GUESS,
      word: "FOO",
      cardId: 1,
    });
    expect(game.state).toEqual(GameState.MAKE_GUESS);
  });

  it("show score when all players made there guesses", () => {
    startGameWithTwoPlayers();
    playWords();
    const b = game.getPlayer("B");
    const a = game.getPlayer("A");
    b.addGuess(a.card!, a);
    game.makeYourGuess(b);

    expect(game.state).toEqual(GameState.MAKE_GUESS);
    expect(b.state).toEqual(PlayerState.SHOW_SCORE);

    firestore.firePlayerEvent({
      name: "A",
      state: PlayerState.SHOW_SCORE,
      guess: '{"2":"B"}',
    });

    expect(game.state).toEqual(GameState.SHOW_SCORE);
  });

  it("plays next round when all players are ready", () => {
    startGameWithTwoPlayers();
    const oldAdditionalCardId = game.additionalCard?.id;
    expect(game.roundCounter).toEqual(1);
    playWords();
    makeGuesses();

    game.nextRound(game.activePlayer);
    expect(game.state).toEqual(GameState.SHOW_SCORE);
    expect(game.activePlayer.state).toEqual(PlayerState.NEXT_ROUND);
    firestore.firePlayerEvent({
      name: "A",
      state: PlayerState.NEXT_ROUND,
    });

    expect(game.state).toEqual(GameState.PLAY_WORD);
    firestore.fireGameEvent({
      additionalCardId: "42",
      roundCounter: 2,
    });
    expect(game.roundCounter).toEqual(2);
    expect(game.additionalCard).toBeDefined();
    expect(oldAdditionalCardId).not.toEqual(game.additionalCard?.id);
  });

  it("game ends when some player has reached winning score", () => {
    startGameWithTwoPlayers();
    game.winningScore = 3;
    game.activePlayer.totalScore = 3;
    expect(game.state).toEqual(GameState.FINISHED);
  });

  const startGameWithTwoPlayers = () => {
    game.init({ join: "test", player: "B" });
    firestore.firePlayerEvent({ name: "A" });
    firestore.firePlayerEvent({ name: "B" });
    firestore.fireGameEvent({
      roundCounter: 1,
      playerCount: 2,
    });
    firestore.firePlayerEvent({
      name: "A",
      cardId: "1",
      letters: ["A", "B", "C"],
      state: PlayerState.PLAY,
    });
    firestore.firePlayerEvent({
      name: "B",
      cardId: "2",
      letters: ["A", "D", "E"],
      state: PlayerState.PLAY,
    });
  };

  const playWords = () => {
    firestore.firePlayerEvent({
      name: "A",
      state: PlayerState.GUESS,
      word: "FOO",
      cardId: 1,
    });
    firestore.firePlayerEvent({
      name: "B",
      state: PlayerState.GUESS,
      word: "BLA",
      cardId: 2,
    });
  };

  const makeGuesses = () => {
    firestore.firePlayerEvent({
      name: "A",
      state: PlayerState.SHOW_SCORE,
      guess: '{"2":"B"}',
    });
    firestore.firePlayerEvent({
      name: "B",
      state: PlayerState.SHOW_SCORE,
      guess: '{"1":"A"}',
    });
  };
});
