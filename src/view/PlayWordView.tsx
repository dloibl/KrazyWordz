import React from "react";
import { Playable } from "../model/Playable";
import { observer } from "mobx-react";
import { Tableau } from "./Tableau";
import { TaskCard } from "./TaskCard";
import { LetterPool } from "./LetterPool";
import { createWord } from "../model/Letter";

export const PlayWordView = observer(function({ game }: { game: Playable }) {
  const player = game.activePlayer;
  return (
    <div>
      <h3>It's your turn {player.name}</h3>
      Your task is:
      <TaskCard task={player.card!} disabled={true} />
      Your available letters:
      <LetterPool letters={player.letters} />
      <div style={{ display: "flex" }}>
        <Tableau letters={player.letters} />
        <button
          className="button"
          disabled={player.letters.length === 0}
          style={{ margin: "1em" }}
          onClick={() => {
            game.playWord(player, createWord(player.letters));
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
});
