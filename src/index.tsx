import React from "react";
import ReactDOM from "react-dom";
import { GameView } from "./view/GameView";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

import "milligram/dist/milligram.css";
import "./styles/index.css";

ReactDOM.render(
  <React.StrictMode>
    <DndProvider backend={Backend}>
      <header>
        <span className="header-title">
          CRAZY W
          <span role="img" aria-label="O">
            😋
          </span>
          RDS
        </span>
      </header>
      <div className="content">
        <GameView />
      </div>
      <footer>v0.0.1</footer>
    </DndProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
