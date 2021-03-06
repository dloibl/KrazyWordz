import React from "react";

import { observer } from "mobx-react";
import { Playable } from "../model/Playable";

export const JoinGameView = observer(function ({ game }: { game: Playable }) {
  return (
    <div className="page join-game">
      <PlayerList game={game} />
      {!game.activePlayer && <AddPlayer game={game} />}
      <JoinLink />
      {game?.isOwner(game.activePlayer) && (
        <button onClick={() => game.start()}>Start Game</button>
      )}
    </div>
  );
});

function JoinLink() {
  return (
    <blockquote>
      <label htmlFor="joinLink">
        Invite other players by sharing this link
      </label>
      <a id="joinLink" href={window.location.href.replace(/&player=(.)*/, "")}>
        {window.location.href.replace(/&player=(.)*/, "")}
      </a>
    </blockquote>
  );
}

const PlayerList = observer(function ({ game }: { game: Playable }) {
  return (
    <>
      <label htmlFor="players">Players</label>
      <ul id="players" className="players">
        {game.players
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ name, color }) => (
            <li className="player" style={{ borderColor: color }} key={name}>
              {name} {game.isOwner({ name }) && "(Owner)"}
            </li>
          ))}
      </ul>
    </>
  );
});

function AddPlayer({ game }: { game: Playable }) {
  const [name, setName] = React.useState("");
  if (game.activePlayer) {
    return null;
  }
  return (
    <div>
      <label htmlFor="playerName">Join as</label>
      <input
        id="playerName"
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></input>
      <button
        className="button button-clear"
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
