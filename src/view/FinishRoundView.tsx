import React from "react";
import { observer } from "mobx-react";
import { Playable } from "../model/Playable";
import { MatchedCard } from "./MatchedCard";
import { Player } from "../model";

export const FinishRoundView = observer(function ({
  game,
}: {
  game: Playable;
}) {
  return (
    <div>
      <div>
        <h3>Solution</h3>
        {game.players.map((player) => (
          <div key={player.name}>
            {player.name} said:
            <MatchedCard
              key={player.card!.id}
              card={player.card!}
              word={player.word!}
            />
            This was guessed correctly by{" "}
            {getCorrectGuesserAsString(game.players, player)}
            <br />
            <br />
          </div>
        ))}
      </div>
      <h3>See the new scores</h3>
      <div>
        {game.players.map((player) => (
          <div key={player.name}>
            {player.name} earned {player.roundScore} points in this round and
            therefore has now {player.totalScore} points!{" "}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          game.nextRound();
        }}
      >
        Next Round
      </button>
    </div>
  );
});

function getCorrectGuesserAsString(players: Player[], player: Player) {
  return (
    players
      .filter((p) => p.guess.get(player.card!)?.name === player.name)
      .map((p) => p.name)
      .join(", ") || "no one"
  );
}
