import { Letter } from "../model";
import React from "react";

export function LetterTile({ letter }: { letter: Letter }) {
  return <div className="letter-tile">{letter.value}</div>;
}
