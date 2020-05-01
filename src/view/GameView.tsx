import React from "react";
import { observer } from "mobx-react";
import { PlayWordView } from "./PlayWordView";
import { MakeGuessView } from "./MakeGuessView";
import { FinishRoundView } from "./FinishRoundView";
import { observable } from "mobx";
import { Game } from "../model/Game";
import { CreateGameView } from "./CreateGameView";
import { JoinGameView } from "./JoinGameView";

@observer
export class GameView extends React.Component {
  @observable
  private game = new Game().init(this.params());

  private params() {
    const params = new URLSearchParams(window.location.search);
    return { join: params.get("join"), player: params.get("player") };
  }

  render() {
    const game = this.game;
    if (!game) {
      return "Loading...";
    }
    if (!game.isStarted) {
      if (!game.name) {
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
