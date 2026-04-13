import React from "react";
import { Playable } from "../model/Playable";
import { observer } from "mobx-react";
import { Tableau } from "./Tableau";
import { TaskCard } from "./TaskCard";
import { LetterPool } from "./LetterPool";
import { createWord } from "../model/Letter";
import classNames from "classnames";
import { PageKicker, PagePanel } from "./ui";

export const PlayWordView = observer(function ({ game }: { game: Playable }) {
  const player = game.activePlayer;
  if (!player.card || !player.letters) {
    return <div>"Drawing a card and letters..."</div>;
  }
  return (
    <div className={classNames("page", { waiting: player.word != null })}>
      <PagePanel>
        <PageKicker>Wort erfinden</PageKicker>
        <h2>Mach aus Buchstaben Bühnennebel</h2>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <TaskCard task={player.card!} disabled={true} featured />
          <div className="play-area">
            <h4>Deine Buchstaben</h4>
            <LetterPool
              letters={player.letters.filter(
                (it) => !player.word?.word.includes(it.value)
              )}
              disabled={player.word != null}
            />
            <Tableau
              color={player.color}
              letters={player.word?.getLetters() || player.letters}
              disabled={player.word != null}
            />

            {player.word ? (
              <em className="status-note">Warten auf die anderen...</em>
            ) : (
              <button
                className="paper-btn btn-primary btn-large"
                disabled={
                  player.letters.filter((it) => it.position != null).length ===
                  0
                }
                onClick={() => {
                  game.playWord(player, createWord(player.letters));
                }}
              >
                Wort spielen
              </button>
            )}
          </div>
        </div>
      </PagePanel>
    </div>
  );
});
