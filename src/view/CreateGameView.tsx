import React, { useState } from "react";
import { observer } from "mobx-react";
import { Game } from "../model/Game";

export const CreateGameView = observer(function CreateGameView({
  game,
}: {
  game: Game;
}) {
  const [name, setName] = useState(
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substr(0, 10)
  );
  const [player, setPlayer] = useState("");
  const [winningScore, setWinningScore] = useState(15);
  const canCreate = name.trim() && player.trim() && winningScore > 0;

  const handleCreate = async () => {
    if (!name.trim() || !player.trim()) {
      game.setError("Please enter both a game name and your player name.");
      return;
    }
    await game.createGame({
      owner: player.trim(),
      name: name.trim(),
      winningScore,
    });
  };

  return (
    <div className="page">
      <fieldset>
        <h2>Create a Game</h2>
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
        <button disabled={!canCreate || game.creating} onClick={handleCreate}>
          {game.creating ? "Creating..." : "Create"}
        </button>
      </fieldset>
    </div>
  );
});
