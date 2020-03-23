import React from "react";
import ReactDOM from "react-dom";
import { GameView } from "./view/GameView";
import "./styles/index.css";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

ReactDOM.render(
  <React.StrictMode>
    <DndProvider backend={Backend}>
      <GameView />
    </DndProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
