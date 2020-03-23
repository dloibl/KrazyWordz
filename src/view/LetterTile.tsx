import { Letter } from "../model";
import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

export function LetterTile({ letter }: { letter: Letter }) {
  const [{ isDragging }, drag] = useDrag({
    item: {
      type: ItemTypes.LETTER,
      letter
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  });
  return (
    <div ref={drag} className={`letter-tile ${isDragging ? "dragging" : ""}`}>
      {letter.value}
    </div>
  );
}
