import React from "react";
import { observer } from "mobx-react";
import { Playable, PlayerState, GameState } from "../model/Playable";
import { MatchedCard } from "./MatchedCard";
import { Player } from "../model";
import classNames from "classnames";
import { emojisplosions } from "emojisplosion";
import { PageKicker, PagePanel } from "./ui";

export const FinishRoundView = observer(function ({
  game,
}: {
  game: Playable;
}) {
  React.useEffect(() => {
    if (game.state === GameState.FINISHED) {
      emojisplosions({
        container: () => document.querySelector(".page")!,
        interval: 3000,
      });
    }
  });

  const sortedPlayers = game.players
    .slice()
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        (b.word?.word || b.name).localeCompare(a.word?.word || a.name)
    );
  const winner = game.state === GameState.FINISHED && sortedPlayers[0];
  return (
    <div
      className={classNames("page", {
        waiting: game.activePlayer.state === PlayerState.NEXT_ROUND,
      })}
    >
      <PagePanel>
        <PageKicker>Runde {game.roundCounter}</PageKicker>
        <h2>{winner ? `${winner.name} gewinnt!` : "Punkte auf den Tisch"}</h2>
        <div className="score-table-wrap">
          <table className="score-table">
            <thead>
              <tr>
                <th>Spieler</th>
                <th>Karte und Wort</th>
                <th>Richtig geraten von</th>
                <th>Punkte</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.name}
                  className={classNames({
                    winner: index === 0 && winner,
                  })}
                >
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
                  <td>{getCorrectGuesserAsString(game.players, player)}</td>
                  <td className={classNames({ loading: index === 0 })}>
                    {player.totalScore}{" "}
                    {index === 0 && (
                      <span role="img" aria-label="Crown">
                        👑
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {game.activePlayer.state === PlayerState.NEXT_ROUND
          ? <em className="status-note">Warten auf die anderen...</em>
          : !winner && (
              <button
                className="paper-btn btn-primary btn-large"
                onClick={() => {
                  game.nextRound(game.activePlayer);
                }}
              >
                Nächste Runde
              </button>
            )}
      </PagePanel>
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
