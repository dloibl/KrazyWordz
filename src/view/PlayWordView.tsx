import React from "react";
import { Playable } from "../model/Playable";
import { observer } from "mobx-react";
import { Tableau } from "./Tableau";
import { TaskCard } from "./TaskCard";
import { LetterPool } from "./LetterPool";
import { createWord } from "../model/Letter";
import classNames from "classnames";

export const PlayWordView = observer(function ({ game }: { game: Playable }) {
  const player = game.activePlayer;
  if (!player.card || !player.letters) {
    return <div>"Drawing a card and letters..."</div>;
  }
  return (
    <div className={classNames("page", { waiting: player.word != null })}>
      <h4>Time to be creative! Invent a word for</h4>
      <TaskCard task={player.card!} disabled={true} />
      <h4>Your letters are</h4>
      <LetterPool
        letters={player.letters.filter(
          (it) => !player.word?.word.includes(it.value)
        )}
        disabled={player.word != null}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Tableau
          color={player.color}
          letters={player.word?.getLetters() || player.letters}
          disabled={player.word != null}
        />

        {player.word ? (
          <em style={{ margin: "1em" }}>Waiting for other players...</em>
        ) : (
          <button
            className="button"
            style={{ margin: "1em" }}
            disabled={
              player.letters.filter((it) => it.position != null).length === 0
            }
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
