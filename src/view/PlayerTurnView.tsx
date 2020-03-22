import React from "react";
import { Word } from "../model/Word";
import { Game } from "../model/Game";
import { observer } from "mobx-react";

export const PlayerTurnView = observer(function({ game }: { game: Game }) {
  const player = game.activePlayer;
  const [answer, setAnswer] = React.useState("");
  return (
    <div>
      <h3>It's your turn {player.name}</h3>
      Your task is:
      <span>{player.card?.task}</span>
      <div>
        Your available letters:
        {player.letters.map(letter => letter.value).join(" ")}
      </div>
      Your answer:
      <input onChange={e => setAnswer(e.target.value)} />
      <button
        onClick={() => {
          player.placeWord(new Word(answer));
          game.nextPlayer();
        }}
      >
        Next
      </button>
    </div>
  );
});
