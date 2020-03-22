import { Game } from "../model/Game";
import React from "react";
import { Guess } from "../model/Guess";
import { observer } from "mobx-react";

export const MakeGuessView = observer(function({ game }: { game: Game }) {
  const player = game.activePlayer;

  return (
    <div>
      <h3>Ok {player.name}, make your guess</h3>
      <div>
        {game.players
          .map(it => it.card?.task)
          .map(task => (
            <div
              key={task}
              style={{ padding: "1rem", border: "1px solid black" }}
            >
              {task}
            </div>
          ))}
      </div>
      <div>
        {game.players
          .map(it => it.word?.word)
          .map(word => (
            <div key={word} style={{ border: "1px solid black" }}>
              {word}
            </div>
          ))}
      </div>
      <button onClick={() => game.makeYourGuess(player, new Guess())}>
        Guess
      </button>
    </div>
  );
});
