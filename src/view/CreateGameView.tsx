import React, { useState } from "react";
import { RemoteGame } from "../model/RemoteGame";

export function CreateGameView({ game }: { game: RemoteGame }) {
  const [name, setName] = useState(
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substr(0, 10)
  );
  const [player, setPlayer] = useState("");
  const [winningScore, setWinningScore] = useState(15);
  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "2rem" }}>
      <h2>Create a new CrazyWords Game</h2>
      Name of game
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      Winning Score
      <input
        type="number"
        value={winningScore}
        onChange={(e) => setWinningScore(Number(e.target.value))}
      />
      Your name
      <input
        type="text"
        value={player}
        onChange={(e) => setPlayer(e.target.value)}
      />
      Join Link:
      <a href={window.location.href + `&join=${name}`}>
        {window.location.href + `&join=${name}`}
      </a>
      <button
        className="button"
        onClick={() => game.createGame({ owner: player, name, winningScore })}
      >
        Create
      </button>
    </div>
  );
}
