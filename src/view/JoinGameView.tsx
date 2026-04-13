import React from "react";

import { observer } from "mobx-react";
import { Playable } from "../model/Playable";
import { PageKicker, PagePanel } from "./ui";

export const JoinGameView = observer(function ({ game }: { game: Playable }) {
  return (
    <div className="page join-game">
      <PagePanel className="lobby-panel">
        <PageKicker>Lobby</PageKicker>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h2>Die Bande sammelt sich</h2>
            <PlayerList game={game} />
          </div>
          <aside className="card border border-3 invite-card w-full lg:max-w-sm">
            <div className="card-body">
              <JoinLink />
              {!game.activePlayer && <AddPlayer game={game} />}
              {game?.isOwner(game.activePlayer) && (
                <button
                  className="paper-btn btn-primary btn-large btn-block"
                  onClick={() => game.start()}
                >
                  Experiment starten
                </button>
              )}
            </div>
          </aside>
        </div>
      </PagePanel>
    </div>
  );
});

function JoinLink() {
  const joinUrl = window.location.href.replace(/&player=(.)*/, "");
  return (
    <div className="join-code">
      <span className="badge secondary">Einladungslink</span>
      <a id="joinLink" href={joinUrl}>
        {joinUrl}
      </a>
    </div>
  );
}

const PlayerList = observer(function ({ game }: { game: Playable }) {
  return (
    <>
      <label htmlFor="players">Players</label>
      <ul id="players" className="players grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {game.players
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ name, color }) => (
            <li
              className="card border border-2 player"
              style={{ borderColor: color }}
              key={name}
            >
              <div className="card-body">
                <span className="player-token" style={{ background: color }} />
                <strong>{name}</strong>
                {game.isOwner({ name }) && <span className="badge warning">Host</span>}
              </div>
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
    <div className="form-group">
      <label htmlFor="playerName">Join as</label>
      <input
        className="input-block"
        id="playerName"
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></input>
      <button
        className="paper-btn btn-secondary btn-block"
        onClick={() => {
          game.addPlayer(name);
          setName("");
        }}
      >
        Beitreten
      </button>
    </div>
  );
}
