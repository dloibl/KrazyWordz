import React from "react";
import { observer } from "mobx-react";
import { TaskCard } from "./TaskCard";
import { Tableau } from "./Tableau";
import { MatchedCard } from "./MatchedCard";
import { Playable } from "../model/Playable";

export const MakeGuessView = observer(function ({ game }: { game: Playable }) {
  const player = game.activePlayer;
  return (
    <div>
      <h3>Ok {player.name}, make your guess</h3>
      <div className="match-panel">
        <div className="task-cards-panel">
          {game.players
            .concat(new Array(game.robot))
            .filter((p) => p !== player)
            .map((it) => it.card!)
            .filter((card) => card && !player.guess.has(card))
            .map((card) => (
              <TaskCard key={card.id} task={card} disabled={false} />
            ))}
        </div>
        <div>
          {game.players
            .filter((p) => p !== player)
            .filter((p) => !Array.from(player.guess.values()).includes(p))
            .map((p) => (
              <Tableau
                key={p.name}
                disabled={true}
                letters={p.word!.getLetters()}
                onDropCard={(card) => player.addGuess(card, p)}
              ></Tableau>
            ))}
        </div>
      </div>
      {Array.from(player.guess.entries()).map(([card, p]) => (
        <MatchedCard
          key={card.id}
          card={card}
          word={p.word!}
          onDelete={(task) => player.guess.delete(task)}
        />
      ))}
      {player.guessConfirmed ? (
        "Waiting for other players..."
      ) : (
        <button
          disabled={player.guess.size !== game.players.length - 1}
          className="button"
          onClick={() => game.makeYourGuess(player)}
        >
          Guess
        </button>
      )}
    </div>
  );
});
