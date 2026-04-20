import { Firestore } from "../remote/firebase";
import { Player } from "./Player";
import { Word, Task } from ".";
import {
  Playable,
  GameState,
  PlayerEventData,
  PlayerState,
  GameEventData,
} from "./Playable";
import { observable, IReactionDisposer, action, makeObservable } from "mobx";
import { CardPool } from "./CardPool";
import { computed, reaction } from "mobx";
import { LetterPool } from "./LetterPool";
import { Guess } from "./Guess";
import { computeColor } from "./Color";
import { BotProfile, chooseBotProfiles } from "./BotProfile";
import {
  evaluateBotAssignments,
  generateBotWord,
} from "../ai/botAi";

export class Game implements Playable {
  @observable
  name?: string;

  @observable
  players: Player[] = [];

  @observable
  activePlayer: Player = null!;

  @observable
  additionalCard?: Task;

  @observable
  winningScore = 15;

  @observable
  roundCounter = 0;

  @observable
  playerCount = -1;

  @observable
  owner?: string;

  @observable
  syncing = false;

  @observable
  creating = false;

  @observable
  errorMessage?: string;

  private cardPool = CardPool.getInstance();

  private letterPool?: LetterPool;

  private stateReactionDisposer: IReactionDisposer;

  private botReactionDisposer: IReactionDisposer;

  private triggeredBotActions = new Set<string>();

  private firestore: Firestore;

  constructor(firestore?: Firestore) {
    makeObservable(this);

    this.firestore =
      firestore ||
      new Firestore({
        onGameEvent: this.syncGameState,
        onPlayerEvent: this.syncPlayerState,
        onError: this.handleError,
      });

    this.stateReactionDisposer = reaction(
      () => this.state,
      (state) => {
        if (state === GameState.SHOW_SCORE) {
          this.givePoints();
        }

        const shouldStartNextRound = () =>
          this.state === GameState.PLAY_WORD &&
          (this.activePlayer.state === PlayerState.INIT ||
            this.activePlayer.state === PlayerState.NEXT_ROUND);
        if (shouldStartNextRound()) {
          if (process.env.NODE_ENV === "test") {
            this.startNextRound();
          } else {
            this.syncing = true;
            // wait a bit for incoming events here
            setTimeout(() => {
              this.syncing = false;
              if (shouldStartNextRound()) {
                this.startNextRound();
              }
            }, 1000);
          }
        }
      }
    );

    this.botReactionDisposer = reaction(
      () => this.botActionSignature,
      () => this.runBotActions()
    );

    (window as any).Game = this;
  }

  get playerStates() {
    return this.players.map((it) => it.state);
  }

  get state() {
    if (!this.isStarted) {
      return this.name ? GameState.JOIN : GameState.CREATE;
    }
    if (!this.allPlayersLoaded()) {
      return GameState.LOADING;
    } else if (this.isGameFinished) {
      return GameState.FINISHED;
    } else if (
      this.playerStates.some((state) => state === PlayerState.PLAY) ||
      this.playerStates.every((state) => state === PlayerState.NEXT_ROUND)
    ) {
      return GameState.PLAY_WORD;
    } else if (this.playerStates.some((state) => state === PlayerState.GUESS)) {
      return GameState.MAKE_GUESS;
    } else if (
      this.playerStates.every((state) => state === PlayerState.SHOW_SCORE) ||
      this.playerStates.some((state) => state === PlayerState.NEXT_ROUND)
    ) {
      return GameState.SHOW_SCORE;
    } else if (this.players.some((it) => it.totalScore >= this.winningScore)) {
      return GameState.FINISHED;
    }
    return GameState.LOADING;
  }

  isOwner(player: { name: string }) {
    return this.owner === player?.name;
  }

  isWaitingForNextRound(player: Player) {
    const minRoundCounter = this.players
      .filter((p) => p !== player)
      .map((it) => it.waitingForNextRound)
      .sort()[0];
    return player.waitingForNextRound > minRoundCounter;
  }

  init({ join, player }: { join: string | null; player: string | null }) {
    if (join) {
      this.joinGame(join);
    }
    if (player) {
      this.setActivePlayer(player);
    }
    return this;
  }

  dispose() {
    this.stateReactionDisposer();
    this.botReactionDisposer();
  }

  @action
  private handleError = (error: Error) => {
    console.error(error);
    this.errorMessage = error.message || "Unexpected Firebase error";
  };

  @action
  setError(message: string) {
    this.errorMessage = message;
  }

  @action
  clearError() {
    this.errorMessage = undefined;
  }

  @action
  syncGameState = ({
    additionalCardId,
    roundCounter,
    owner,
    playerCount,
    winningScore,
    additionalCardText,
  }: GameEventData) => {
    this.roundCounter = roundCounter || this.roundCounter;
    this.winningScore = winningScore || this.winningScore;
    this.owner = owner || this.owner;
    this.playerCount = playerCount || this.playerCount;
    if (
      additionalCardId != null &&
      this.additionalCard?.id !== additionalCardId
    ) {
      this.additionalCard = CardPool.getInstance().getTask(additionalCardId);
      if (additionalCardText) {
        this.additionalCard.task = additionalCardText;
      }
    }
  };

  @action
  syncPlayerState = (playerName: string, data: PlayerEventData) => {
    const player = this.getPlayer(playerName);
    const state = data.state;
    player.isBot = Boolean(data.isBot);
    player.botProfileId = data.botProfileId;
    player.botProfile = data.botProfile;
    player.botStatus = data.botStatus;

    // sync score
    if (data.totalScore && !player.totalScore) {
      player.totalScore = data.totalScore;
    }

    //  sync card and letters
    if (state === PlayerState.PLAY) {
      if (player.state !== PlayerState.PLAY) {
        player.reset();
      }
      this.syncCardAndLetters(player, data);
    }

    // sync word
    if (
      state === PlayerState.GUESS &&
      player.state !== PlayerState.GUESS &&
      data.word != null
    ) {
      if (!player.card || !player.letters) {
        this.syncCardAndLetters(player, data);
      }
      player.playWord(new Word(data.word));
    }

    // sync guess
    if (
      state === PlayerState.SHOW_SCORE &&
      data.guess &&
      player.state !== PlayerState.SHOW_SCORE
    ) {
      if (!player.card) {
        this.syncCardAndLetters(player, data);
      }
      if (!player.word && data.word != null) {
        player.playWord(new Word(data.word));
      }
      const guess: { [key: string]: string } = JSON.parse(data.guess);
      Object.entries(guess).forEach(([taskId, guessedPlayer]) => {
        const task = CardPool.getInstance().getTask(taskId);
        const p = this.getPlayer(guessedPlayer);
        if (task && p) {
          player.addGuess(task, p);
        }
      });
      player.confirmGuess();
    }

    // sync next round
    if (
      state === PlayerState.NEXT_ROUND &&
      player.state !== PlayerState.NEXT_ROUND
    ) {
      player.setReadyForNextRound(data.totalScore);
    }
  };

  private syncCardAndLetters(
    player: Player,
    { cardId, letters }: PlayerEventData
  ) {
    if (cardId && letters) {
      player.drawCard(this.cardPool, cardId);
      player.drawLetters(this.letterPool!, letters);
    }
  }

  getPlayer(name: string) {
    return (this.players.find((it) => it.name === name) ||
      this.addPlayerLocal(name))!;
  }

  @action
  startNextRound() {
    this.letterPool = new LetterPool();
    this.drawCardAndLetters(this.activePlayer);
    if (this.isOwner(this.activePlayer)) {
      this.roundCounter++;
      this.triggeredBotActions.clear();
      this.players
        .filter((player) => player.isBot)
        .forEach((player) => this.drawCardAndLetters(player));
      const additionalCard = this.cardPool.draw();
      this.firestore.updateGame({
        additionalCardId: additionalCard.id,
        additionalCardText: additionalCard.task,
        roundCounter: this.roundCounter,
        playerCount: this.players.length,
      });
    }
  }

  start() {
    this.startNextRound();
  }

  setActivePlayer(name: string) {
    this.firestore.setLocalPlayer(name);
    this.addPlayerLocal(name);
    this.activePlayer = this.players.find((it) => it.name === name)!;
  }

  private joinMyGame(name: string, owner: string) {
    const params = new URLSearchParams(window.location.search);
    params.append("join", name);
    params.append("player", owner);
    window.location.search = params.toString();
    // page reload but for testing purpose!
    return this.init({ join: name, player: owner });
  }

  /**
   * join an existing game by name
   * @synchronized
   */
  @action("join game")
  joinGame(name: string) {
    this.clearError();
    this.name = name;
    this.firestore.joinGame(name);
  }

  /**
   * create a new game by owner
   * @synchronized
   */
  @action("create game")
  async createGame({
    name,
    winningScore = 15,
    owner,
    botCount = 0,
  }: {
    name: string;
    winningScore?: number;
    owner: string;
    botCount?: number;
  }) {
    this.clearError();
    this.creating = true;
    try {
      const botProfiles = chooseBotProfiles(botCount);
      await this.firestore.newGame({
        name,
        owner,
        winningScore,
        botCount,
        botProfileIds: botProfiles.map((profile) => profile.id),
      });
      await this.firestore.addPlayer(owner);
      await Promise.all(
        botProfiles.map((profile) =>
          this.firestore.addBotPlayer(profile.name, profile)
        )
      );
      this.owner = owner;

      return this.joinMyGame(name, owner);
    } catch (error) {
      this.handleError(error as Error);
    } finally {
      this.creating = false;
    }
  }

  /**
   * add a player to the game and set it as active (=local) player,
   * player is added to search query params for later usages (e.g. browser refresh)
   * @synchronized
   * @param name name of player to be added
   */
  @action("add player")
  async addPlayer(name: string) {
    this.clearError();
    try {
      await this.firestore.addPlayer(name);
      this.setActivePlayer(name);

      const params = new URLSearchParams(window.location.search);
      if (!params.has("player")) {
        params.append("player", name);
        window.location.search = params.toString();
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * draw a new card and letters to play the next word
   * @synchronized
   * @param player performing the action
   */
  @action("draw card and letters")
  drawCardAndLetters(player: Player) {
    player.reset();
    player.drawCard(this.cardPool);
    player.drawLetters(this.letterPool!);
    this.firestore.updatePlayer(player, player.name);
  }

  /**
   * player invented a word for his task
   * @synchronized
   * @param player performing the action
   * @param word invented by player for this card
   */
  @action("play word")
  playWord(player: Player, word: Word) {
    player.playWord(word);
    this.firestore.updatePlayer(player, player.name);
  }

  /**
   * player matched cards and words from other players and confirm his guess
   * @synchronized
   * @param player performing the action
   */
  @action("make guess")
  makeYourGuess(player: Player) {
    player.confirmGuess();
    this.firestore.updatePlayer(player, player.name);
  }

  /**
   * player is finished watching the round score and is ready for playing the next round
   * @synchronized
   * @param player performing the action
   */
  @action("next round")
  nextRound(player: Player) {
    player.setReadyForNextRound();
    this.firestore.updatePlayer(player, player.name);
    if (this.isOwner(player)) {
      this.players
        .filter((it) => it.isBot && it.state === PlayerState.SHOW_SCORE)
        .forEach((bot) => {
          bot.setReadyForNextRound();
          this.firestore.updatePlayer(bot, bot.name);
        });
    }
  }

  private givePoints() {
    this.players.forEach((guessingPlayer) =>
      this.evaluateGuess(guessingPlayer, guessingPlayer.guess!)
    );
  }

  private get isGameFinished() {
    return this.players.some(this.hasWinningScore);
  }

  private evaluateGuess(guessingPlayer: Player, guess: Guess) {
    guess.forEach((player, task) =>
      this.distributePoints(guessingPlayer, task, player)
    );
  }

  private hasWinningScore = (player: Player) => {
    return player.totalScore >= this.winningScore;
  };

  private distributePoints(guessingPlayer: Player, task: Task, player: Player) {
    if (player.card?.id === task.id) {
      guessingPlayer.correctGuesses++;
      guessingPlayer.addScorePoint();
      player.addScorePoint();
    }
  }

  @action
  private addPlayerLocal(name: string) {
    if (!name) {
      throw new Error("Name must be given");
    }
    if (this.players.find((it) => it.name === name) != null) {
      return;
    }
    const player = new Player(name, computeColor(this.players.length));

    this.players.push(player);

    return player;
  }

  private allPlayersLoaded() {
    return this.playerCount === this.players.length;
  }

  private get botActionSignature() {
    return this.players
      .map((player) =>
        [
          player.name,
          player.isBot,
          player.state,
          player.word ? "word" : "no-word",
          player.guessConfirmed,
          player.botStatus,
          this.state,
          this.roundCounter,
        ].join(":")
      )
      .join("|");
  }

  private runBotActions() {
    if (!this.isOwner(this.activePlayer) || !this.isStarted) {
      return;
    }

    this.players
      .filter((player) => player.isBot)
      .forEach((bot) => {
        if (bot.state === PlayerState.PLAY && bot.botStatus === "idle") {
          this.triggerBotWord(bot);
        }
        if (
          this.state === GameState.MAKE_GUESS &&
          bot.state === PlayerState.GUESS &&
          bot.botStatus === "idle" &&
          this.players.every((player) => player.word != null)
        ) {
          this.triggerBotAssignments(bot);
        }
      });
  }

  private triggerBotWord(bot: Player) {
    const key = `${this.roundCounter}:${bot.name}:word`;
    if (this.triggeredBotActions.has(key)) {
      return;
    }
    this.triggeredBotActions.add(key);
    bot.botStatus = "generatingWord";
    generateBotWord({
      questionCard: bot.card?.task || "",
      availableLetters: bot.letters.map((letter) => letter.value),
      botProfile: this.getBotProfile(bot),
      seed: `${this.name}:${this.roundCounter}:${bot.name}`,
    })
      .then(({ word }) => {
        bot.playWord(new Word(word));
        bot.botStatus = "idle";
        this.firestore.updatePlayer(bot, bot.name);
      })
      .catch((error) => {
        this.triggeredBotActions.delete(key);
        bot.botStatus = "idle";
        this.handleError(error as Error);
      });
  }

  private triggerBotAssignments(bot: Player) {
    const key = `${this.roundCounter}:${bot.name}:guess`;
    if (this.triggeredBotActions.has(key)) {
      return;
    }
    this.triggeredBotActions.add(key);
    bot.botStatus = "guessing";
    evaluateBotAssignments({
      allQuestionCards: this.getGuessableQuestionCards(bot),
      allSubmittedWords: this.getGuessableSubmittedWords(bot),
      selfPlayerId: bot.name,
      selfQuestionCard: {
        cardId: bot.card?.id || "",
        text: bot.card?.task || "",
      },
      selfWord: bot.word?.word || "",
      botProfile: this.getBotProfile(bot),
      seed: `${this.name}:${this.roundCounter}:${bot.name}`,
    })
      .then(({ guess }) => {
        Object.entries(guess).forEach(([taskId, guessedPlayer]) => {
          const task = this.cardPool.getTask(taskId);
          const player = this.getPlayer(guessedPlayer);
          if (task && player) {
            bot.addGuess(task, player);
          }
        });
        bot.confirmGuess();
        bot.botStatus = "idle";
        this.firestore.updatePlayer(bot, bot.name);
      })
      .catch((error) => {
        this.triggeredBotActions.delete(key);
        bot.botStatus = "idle";
        this.handleError(error as Error);
      });
  }

  private getBotProfile(bot: Player): BotProfile {
    if (bot.botProfile) {
      return bot.botProfile;
    }
    return (
      chooseBotProfiles(4).find((profile) => profile.id === bot.botProfileId) ||
      chooseBotProfiles(1)[0]
    );
  }

  private getGuessableQuestionCards(bot: Player) {
    const playerCards = this.players
      .filter((player) => player !== bot)
      .filter((player) => player.card)
      .map((player) => ({
        cardId: player.card!.id,
        text: player.card!.task,
      }));

    if (this.additionalCard) {
      playerCards.push({
        cardId: this.additionalCard.id,
        text: this.additionalCard.task,
      });
    }

    return playerCards;
  }

  private getGuessableSubmittedWords(bot: Player) {
    return this.players
      .filter((player) => player !== bot)
      .map((player) => ({
        playerId: player.name,
        word: player.word?.word || "",
      }));
  }

  @computed
  get isStarted() {
    return this.roundCounter > 0;
  }
}
