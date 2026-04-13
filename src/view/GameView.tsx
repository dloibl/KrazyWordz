import React from "react";
import { observer } from "mobx-react";
import { PlayWordView } from "./PlayWordView";
import { MakeGuessView } from "./MakeGuessView";
import { FinishRoundView } from "./FinishRoundView";
import { makeObservable, observable } from "mobx";
import { Game, GameState } from "../model";
import { CreateGameView } from "./CreateGameView";
import { JoinGameView } from "./JoinGameView";

@observer
export class GameView extends React.Component {
  @observable
  private game?: Game;

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

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
    if (!game || game.syncing) {
      return <Loading />;
    }
    let view: React.ReactNode;
    switch (game.state) {
      case GameState.LOADING:
        view = <Loading />;
        break;
      case GameState.CREATE:
        view = <CreateGameView game={game} />;
        break;
      case GameState.JOIN:
        view = <JoinGameView game={game} />;
        break;
      case GameState.PLAY_WORD:
        view = <PlayWordView game={game} />;
        break;
      case GameState.MAKE_GUESS:
        view = <MakeGuessView game={game} />;
        break;
      case GameState.SHOW_SCORE:
      case GameState.FINISHED:
        view = <FinishRoundView game={game} />;
        break;
      default:
        view = <Loading />;
    }
    return (
      <>
        {game.errorMessage && <ErrorBanner message={game.errorMessage} />}
        {view}
      </>
    );
  }
}

const Loading = () => (
  <div className="loader center">
    <span role="img" aria-label="loading">
      😋
    </span>
  </div>
);

const ErrorBanner = ({ message }: { message: string }) => (
  <div
    style={{
      background: "#f8d7da",
      color: "#721c24",
      padding: "1rem",
      textAlign: "center",
      borderBottom: "1px solid #f5c6cb",
    }}
  >
    {message}
  </div>
);
