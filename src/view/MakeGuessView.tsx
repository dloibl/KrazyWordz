import React from "react";
import { observer } from "mobx-react";
import { TaskCard } from "./TaskCard";
import { Tableau } from "./Tableau";
import { MatchedCard } from "./MatchedCard";
import { Playable } from "../model/Playable";
import { shuffle } from "../util/shuffle";

export const MakeGuessView = observer(function ({ game }: { game: Playable }) {
  const player = game.activePlayer;
  const unmatchedWords = game.players
    .filter((p) => p !== player)
    .filter((p) => !Array.from(player.guess.values()).includes(p));
  return (
    <div className="page">
      <h4>What's what?</h4>
      {unmatchedWords.length > 0 && (
        <div className="match-panel">
          <div className="task-cards-panel">
            {shuffle(
              game.players
                .filter((p) => p !== player)
                .map((it) => it.card!)
                .concat([game.additionalCard!])
                .filter((card) => card && !player.guess.has(card))
            ).map((card) => (
              <TaskCard key={card.id} task={card} disabled={false} />
            ))}
          </div>
          <div className="center" style={{ width: "8rem" }}>
            <svg width="24px" height="24px" viewBox="0 0 24 24">
              <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"></path>
            </svg>
          </div>
          <div style={{ margin: "auto 0" }}>
            {shuffle(unmatchedWords).map((p) => (
              <Tableau
                key={p.name}
                disabled={true}
                color={p.color}
                letters={p.word?.getLetters() || []}
                onDropCard={(card) => player.addGuess(card, p)}
              ></Tableau>
            ))}
          </div>
        </div>
      )}
      {Array.from(player.guess.entries()).map(([card, p]) => (
        <MatchedCard
          key={card.id}
          card={card}
          word={p.word!}
          color={p.color}
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
