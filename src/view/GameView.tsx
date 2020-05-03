import React from "react";
import { observer } from "mobx-react";
import { PlayWordView } from "./PlayWordView";
import { MakeGuessView } from "./MakeGuessView";
import { FinishRoundView } from "./FinishRoundView";
import { observable } from "mobx";
import { Game, GameState } from "../model";
import { CreateGameView } from "./CreateGameView";
import { JoinGameView } from "./JoinGameView";

@observer
export class GameView extends React.Component {
  @observable
  private game?: Game;

  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    this.game = new Game().init({
      join: params.get("join"),
      player: params.get("player"),
    });
  }

  componentWillUnmount() {
    this.game?.dispose();
  }

  render() {
    const game = this.game;
    if (!game) {
      return "Mounting...";
    }
    switch (game.state) {
      case GameState.LOADING:
        return "Loading...";
      case GameState.CREATE:
        return <CreateGameView game={game} />;
      case GameState.JOIN:
        return <JoinGameView game={game} />;
      case GameState.PLAY_WORD:
        return <PlayWordView game={game} />;
      case GameState.MAKE_GUESS:
        return <MakeGuessView game={game} />;
      case GameState.SHOW_SCORE:
        return <FinishRoundView game={game} />;
      default:
        return "Loading...";
    }
  }
}
