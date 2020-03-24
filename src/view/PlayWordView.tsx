import React from "react";
import { Game } from "../model";
import { observer } from "mobx-react";
import { Tableau } from "./Tableau";
import { TaskCard } from "./TaskCard";
import { LetterPool } from "./LetterPool";
import { createWord } from "../model/Letter";

export const PlayWordView = observer(function({ game }: { game: Game }) {
  const player = game.activePlayer;
  return (
    <div>
      <h3>It's your turn {player.name}</h3>
      Your task is:
      <TaskCard task={player.card!} />
      Your available letters:
      <LetterPool letters={player.letters} />
      <div style={{ display: "flex" }}>
        <Tableau letters={player.letters} />
        <button
          className="button"
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
