import React from "react";
import { createRoot } from "react-dom/client";
import { GameView } from "./view/GameView";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BrandIllustration } from "./view/BrandIllustration";

import "papercss/dist/paper.min.css";
import "./styles/index.scss";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <header>
        <div className="brand-lockup">
          <BrandIllustration />
          <span className="header-title">Wortlabor</span>
        </div>
      </header>
      <div className="content">
        <GameView />
      </div>
      <footer>v0.0.1</footer>
    </DndProvider>
  </React.StrictMode>
);
