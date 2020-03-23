import React from "react";
import { Game, Word } from "../model";
import { observer } from "mobx-react";
import { LetterTile } from "./LetterTile";
import { Tableau } from "./Tableau";
import { TaskCard } from "./TaskCard";

export const PlayWordView = observer(function({ game }: { game: Game }) {
  const player = game.activePlayer;
  const [answer, setAnswer] = React.useState("");
  return (
    <div>
      <h3>It's your turn {player.name}</h3>
      Your task is:
      <TaskCard task={player.card!} />
      Your available letters:
      <div className="letters">
        {player.letters.map((letter, index) => (
          <LetterTile key={index} letter={letter} />
        ))}
      </div>
      <Tableau />
      Your answer:
      <input onChange={e => setAnswer(e.target.value)} />
      <button
        onClick={() => {
          game.playWord(player, new Word(answer));
        }}
      >
        Play
      </button>
    </div>
  );
});
