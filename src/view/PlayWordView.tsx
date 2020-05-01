import React from "react";
import { Playable } from "../model/Playable";
import { observer } from "mobx-react";
import { Tableau } from "./Tableau";
import { TaskCard } from "./TaskCard";
import { LetterPool } from "./LetterPool";
import { createWord } from "../model/Letter";

export const PlayWordView = observer(function ({ game }: { game: Playable }) {
  const player = game.activePlayer;
  if (!player.card || !player.letters) {
    return <div>"Drawing a card and letters..."</div>;
  }
  return (
    <div className="page">
      <h4>Time to be creative! Invent a word for</h4>
      <TaskCard task={player.card!} disabled={true} />
      <h4>Your letters are</h4>
      <LetterPool letters={player.letters} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Tableau color={player.color} letters={player.letters} />

        {player.word ? (
          <em style={{ margin: "1em" }}>Waiting for other players...</em>
        ) : (
          <button
            className="button"
            style={{ margin: "1em" }}
            disabled={player.letters.length === 0}
            onClick={() => {
              game.playWord(player, createWord(player.letters));
            }}
          >
            Play
          </button>
        )}
      </div>
    </div>
  );
});
