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

@observer
export class GameView extends React.Component {
  @observable
  private game!: Playable;

  async componentDidMount() {
    this.game = await createGame(window.location.search.includes("remote"));
    if (this.game instanceof RemoteGame) {
      const joinGame = new URLSearchParams(window.location.search).get("join");
      if (joinGame) {
        this.game.joinGame(joinGame);
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
      return (
        <div>
          {game?.activePlayer?.isOwner ? "New game" : "Join game"}
          <PlayerList game={game} />
          {!game?.activePlayer?.isOwner && <AddPlayer game={game} />}
          {game?.activePlayer?.isOwner && (
            <button onClick={() => game.start()}>Start Game</button>
          )}
        </div>
      );
    } else if (game.isGuessTime) {
      return <MakeGuessView game={game} />;
    } else if (game.haveAllPlayersGuessed) {
      return <FinishRoundView game={game} />;
    } else {
      return <PlayWordView game={game} />;
    }
  }
}

const PlayerList = observer(function ({ game }: { game: Playable }) {
  return (
    <ul>
      {game.players.map(({ name }) => (
        <li key={name}>
          {name}{" "}
          {game?.activePlayer?.isOwner && (
            <button onClick={() => game.deletePlayer(name)}>-</button>
          )}
        </li>
      ))}
    </ul>
  );
});

function AddPlayer({ game }: { game: Playable }) {
  const [name, setName] = React.useState("");
  if (game instanceof RemoteGame && game.activePlayer) {
    return null;
  }
  return (
    <div>
      {game instanceof RemoteGame ? "Join" : "Add Player"}
      <input value={name} onChange={(e) => setName(e.target.value)}></input>
      <button
        onClick={() => {
          game.addPlayer(name);
          setName("");
        }}
      >
        +
      </button>
    </div>
  );
}
