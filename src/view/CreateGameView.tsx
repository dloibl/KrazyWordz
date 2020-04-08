import React, { useState } from "react";
import { RemoteGame } from "../model/RemoteGame";

export function CreateGameView({ game }: { game: RemoteGame }) {
  const [name, setName] = useState("");
  const [winningPoints, setWinningPoints] = useState(15);
  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "2rem" }}>
      <h2>Create a new CrazyWords Game</h2>
      Name
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      Winning Points
      <input
        type="number"
        value={winningPoints}
        onChange={(e) => setWinningPoints(Number(e.target.value))}
      />
      <button
        className="button"
        onClick={() => game.createGame(name, winningPoints)}
      >
        Create
      </button>
    </div>
  );
}
