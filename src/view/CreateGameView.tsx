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
    <fieldset
      style={{ display: "flex", flexDirection: "column", margin: "2rem" }}
    >
      <h2>Create a new CrazyWords Game</h2>
      <label htmlFor="gameName">Name of game</label>
      <input
        id="gameName"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="winningScore">Winning Score</label>
      <input
        id="winningScore"
        min="1"
        type="number"
        value={winningScore}
        onChange={(e) => setWinningScore(Number(e.target.value))}
      />
      <label htmlFor="playerName">Your name</label>
      <input
        id="playerName"
        type="text"
        value={player}
        onChange={(e) => setPlayer(e.target.value)}
      />
      <button
        className="button"
        onClick={() => game.createGame({ owner: player, name, winningScore })}
      >
        Create
      </button>
    </fieldset>
  );
}
