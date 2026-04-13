import React from "react";
import { createRoot } from "react-dom/client";
import { GameView } from "./view/GameView";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "./styles/index.scss";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
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
  </React.StrictMode>
);
