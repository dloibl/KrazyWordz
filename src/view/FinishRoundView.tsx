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
    <div className="page">
      <h3>Scores Round {game.roundCounter}</h3>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Card and Word</th>
            <th>Guessed correctly by</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {game.players
            .slice()
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((player, _, players) => (
              <tr key={player.name}>
                <td>{player.name}</td>
                <td>
                  {player.card && player.word && (
                    <MatchedCard
                      key={player.card?.id}
                      card={player.card!}
                      word={player.word!}
                      color={player.color}
                    />
                  )}
                </td>
                <td>{getCorrectGuesserAsString(players, player)}</td>
                <td>{player.totalScore}</td>
              </tr>
            ))}
        </tbody>
      </table>

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
