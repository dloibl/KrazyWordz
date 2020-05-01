import React from "react";
import { createGame } from "../model";
import { observer } from "mobx-react";
import { PlayWordView } from "./PlayWordView";
import { MakeGuessView } from "./MakeGuessView";
import { FinishRoundView } from "./FinishRoundView";
import { observable } from "mobx";
import { Playable } from "../model/Playable";
import { RemoteGame } from "../model/RemoteGame";
import { CreateGameView } from "./CreateGameView";
import { JoinGameView } from "./JoinGameView";

@observer
export class GameView extends React.Component {
  @observable
  private game!: Playable;

  async componentDidMount() {
    this.game = await createGame(window.location.search.includes("remote"));
    if (this.game instanceof RemoteGame) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("join")) {
        this.game.joinGame(params.get("join")!);
      }
      if (params.has("player")) {
        this.game.setActivePlayer(params.get("player")!);
      }
    }
  }

  render() {
    const game = this.game;
    if (!game) {
      return "Loading...";
    }
    if (!game.isStarted) {
      if (game instanceof RemoteGame && !game.name) {
        return <CreateGameView game={game} />;
      }
      return <JoinGameView game={game} />;
    } else if (game.isGuessTime) {
      return <MakeGuessView game={game} />;
    } else if (
      game.haveAllPlayersGuessed &&
      !game.areAllPlayersReadyForNextRound
    ) {
      return <FinishRoundView game={game} />;
    } else {
      return <PlayWordView game={game} />;
    }
  }
}
