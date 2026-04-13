import React, { useState } from "react";
import { observer } from "mobx-react";
import { TaskCard } from "./TaskCard";
import { Tableau } from "./Tableau";
import { MatchedCard } from "./MatchedCard";
import { Playable } from "../model/Playable";
import { shuffle } from "../util/shuffle";
import { Player, Task } from "../model";
import classNames from "classnames";
import { PageKicker, PagePanel } from "./ui";

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
      <PagePanel>
        <PageKicker>Zuordnen</PageKicker>
        <h2>Welche Karte gehört zu welchem Wort?</h2>
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
            <div className="swap-badge" aria-hidden="true">
              ↔
            </div>
            <div className="answer-column">
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
        <div className="matched-grid">
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
        </div>
        {activePlayer.guessConfirmed ? (
          <em className="status-note">Warten auf die anderen...</em>
        ) : (
          <button
            disabled={activePlayer.guess.size !== game.players.length - 1}
            className="paper-btn btn-primary btn-large"
            onClick={() => game.makeYourGuess(activePlayer)}
          >
            Tipp abgeben
          </button>
        )}
      </PagePanel>
    </div>
  );
});
