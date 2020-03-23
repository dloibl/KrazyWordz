import React from "react";
import { Game } from "../model";
import { observer } from "mobx-react";

export const FinishRoundView = observer(function({ game }: { game: Game }) {
  const players = game.players;

  return (
    <div>
      <h3>See what the players have guessed</h3>
      <div>
        {players.map(player => (
          <div key={player.name}>
            {" "}
            {player.name} guessed: xyz and earned xxx points and therefore has
            now {player.score} points!{" "}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          game.nextRound();
        }}
      >
        Next Round
      </button>
    </div>
  );
});
