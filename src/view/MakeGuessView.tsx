import React, { useState } from "react";
import { observer } from "mobx-react";
import { TaskCard } from "./TaskCard";
import { Tableau } from "./Tableau";
import { MatchedCard } from "./MatchedCard";
import { Playable } from "../model/Playable";
import { shuffle } from "../util/shuffle";
import { Player, Task } from "../model";
import classNames from "classnames";

export const MakeGuessView = observer(function ({ game }: { game: Playable }) {
  const activePlayer = game.activePlayer;
  const [shuffleRandom] = useState(Math.random());

  const unmatchedWords = shuffle(
    game.players
      .filter((p) => p !== activePlayer)
      .filter((p) => !Array.from(activePlayer.guess.values()).includes(p)),
    shuffleRandom
  );

  const playerCards = shuffle(
    game.players
      .filter((p) => p !== activePlayer)
      .map((it) => it.card!)
      .concat([game.additionalCard!])
      .filter((card) => card && !activePlayer.guess.has(card)),
    shuffleRandom
  );

  const [selected, setSelected] = useState({
    card: undefined as Task | undefined,
    player: undefined as Player | undefined,
  });

  const handleSelect = ({ card, player }: { card?: Task; player?: Player }) => {
    const newState = {
      card: selected?.card?.id === card?.id ? undefined : card || selected.card,
      player:
        selected?.player?.name === player?.name
          ? undefined
          : player || selected.player,
    };
    setSelected(newState);
    if (newState.card && newState.player) {
      onGuess(newState.card, newState.player);
    }
  };

  const onGuess = (card: Task, player: Player) => {
    activePlayer.addGuess(card, player);
    setSelected({ card: undefined, player: undefined });
  };

  return (
    <div
      className={classNames("page", { waiting: activePlayer.guessConfirmed })}
    >
      <h4>What's what?</h4>
      {unmatchedWords.length > 0 && (
        <div className="match-panel">
          <div className="task-cards-panel">
            {playerCards.map((card) => (
              <TaskCard
                active={card.id === selected?.card?.id}
                key={card.id}
                task={card}
                disabled={false}
                onClick={() => handleSelect({ card })}
              />
            ))}
          </div>
          <div className="center" style={{ width: "auto" }}>
            <svg width="24px" height="24px" viewBox="0 0 24 24">
              <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"></path>
            </svg>
          </div>
          <div style={{ margin: "auto 0" }}>
            {unmatchedWords.map((p) => (
              <Tableau
                key={p.name}
                disabled={true}
                color={p.color}
                word={p.word?.word}
                letters={p.word?.getLetters() || []}
                onDropCard={(card) => activePlayer.addGuess(card, p)}
                onClick={() => handleSelect({ player: p })}
                active={p.name === selected?.player?.name}
              ></Tableau>
            ))}
          </div>
        </div>
      )}
      {Array.from(activePlayer.guess.entries()).map(([card, p]) => (
        <MatchedCard
          key={card.id}
          card={card}
          word={p.word!}
          color={p.color}
          onDelete={
            activePlayer.guessConfirmed
              ? undefined
              : (task) => activePlayer.guess.delete(task)
          }
        />
      ))}
      {activePlayer.guessConfirmed ? (
        "Waiting for other players..."
      ) : (
        <button
          disabled={activePlayer.guess.size !== game.players.length - 1}
          className="button"
          onClick={() => game.makeYourGuess(activePlayer)}
        >
          Guess
        </button>
      )}
    </div>
  );
});
