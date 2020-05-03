import React from "react";
import { observer } from "mobx-react";
import { Playable, PlayerState } from "../model/Playable";
import { MatchedCard } from "./MatchedCard";
import { Player } from "../model";

export const FinishRoundView = observer(function ({
  game,
}: {
  game: Playable;
}) {
  return (
    <div className="plage">
      <div>
        <h3>Solution</h3>
        {game.players.map((player) => (
          <div key={player.name}>
            <p style={{ color: player.color }}> {player.name} </p> played:
            <MatchedCard
              key={player.card!.id}
              card={player.card!}
              word={player.word!}
              color={player.color}
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
            <p style={{ color: player.color }}> {player.name} </p> earned{" "}
            {player.roundScore} points in this round and therefore has now{" "}
            {player.totalScore} points!{" "}
          </div>
        ))}
      </div>
      {game.activePlayer.state === PlayerState.NEXT_ROUND ? (
        "Waiting for other players"
      ) : (
        <button
          onClick={() => {
            game.nextRound(game.activePlayer);
          }}
        >
          Next Round
        </button>
      )}
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
