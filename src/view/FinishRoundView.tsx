import React from "react";
import { observer } from "mobx-react";
import { Playable } from "../model/Playable";

export const FinishRoundView = observer(function({ game }: { game: Playable }) {
  return (
    <div>
      <h3>See what the players have guessed</h3>
      <div>
        {game.players.map(player => (
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
