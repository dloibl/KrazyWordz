import React from "react";
import ReactDOM from "react-dom";
import { GameView } from "./view/GameView";
import "./styles/index.css";

ReactDOM.render(
  <React.StrictMode>
    <GameView />
  </React.StrictMode>,
  document.getElementById("root")
);
