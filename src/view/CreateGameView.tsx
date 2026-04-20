import React, { useState } from "react";
import { observer } from "mobx-react";
import { Game } from "../model/Game";
import { PageKicker, PagePanel } from "./ui";
import { BrandIllustration } from "./BrandIllustration";

const fantasyLabNames = [
  "Einhornmanufaktur",
  "Drachenlabor",
  "Mondstaubwerkstatt",
  "Koboldküche",
  "Feenfabrik",
  "Sternenbrauerei",
];

const createFantasyLabName = () =>
  fantasyLabNames[Math.floor(Math.random() * fantasyLabNames.length)];

export const CreateGameView = observer(function CreateGameView({
  game,
}: {
  game: Game;
}) {
  const [name, setName] = useState(createFantasyLabName);
  const [player, setPlayer] = useState("");
  const [winningScore, setWinningScore] = useState(15);
  const [botCount, setBotCount] = useState(0);
  const canCreate = name.trim() && player.trim() && winningScore > 0;

  const handleCreate = async () => {
    if (!name.trim() || !player.trim()) {
      game.setError("Please enter both a game name and your player name.");
      return;
    }
    await game.createGame({
      owner: player.trim(),
      name: name.trim(),
      winningScore,
      botCount,
    });
  };

  return (
    <div className="page">
      <PagePanel className="hero-panel">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr_0.9fr] lg:items-center">
          <div>
            <PageKicker>Einbruch im</PageKicker>
            <h1 className="hero-title">Wortlabor</h1>
            <p className="max-w-xl text-xl font-bold">
              Mischt Buchstaben, braut Fantasiewörter und findet heraus, wer
              welche Karte aus dem Labor geschmuggelt hat.
            </p>
{/*            <>
              <div className="comic-badges">
                <span className="badge warning">Party</span>
                <span className="badge secondary">Labor</span>
                <span className="badge danger">Wortchaos</span>
              </div>
            </>*/}
          </div>

          <BrandIllustration className="hero-lab-art" />

          <fieldset className="form-group start-card border border-4 border-thick">
            <legend>Neue Runde</legend>
            <label htmlFor="gameName">Raumname</label>
            <input
              className="input-block"
              id="gameName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="winningScore">Zielpunkte</label>
            <input
              className="input-block"
              id="winningScore"
              min="1"
              type="number"
              value={winningScore}
              onChange={(e) => setWinningScore(Number(e.target.value))}
            />
            <label htmlFor="playerName">Dein Name</label>
            <input
              className="input-block"
              id="playerName"
              type="text"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
            />
            <label htmlFor="botCount">KI-Mitspieler</label>
            <select
              className="input-block"
              id="botCount"
              value={botCount}
              onChange={(e) => setBotCount(Number(e.target.value))}
            >
              {[0, 1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <button
              className="paper-btn btn-primary btn-large btn-block start-button"
              disabled={!canCreate || game.creating}
              onClick={handleCreate}
            >
              {game.creating ? "Wird gebaut..." : "Spiel starten"}
            </button>
          </fieldset>
        </div>
      </PagePanel>
    </div>
  );
});
