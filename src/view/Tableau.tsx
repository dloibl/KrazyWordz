import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { Letter } from "../model";
import { LetterTile } from "./LetterTile";

export function Tableau({ color = "teal" }: { color?: string }) {
  const [values, setValues] = useState<Letter[]>([]);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.LETTER,
    drop: drop => setValues([...values, (drop as any).letter]),
    collect: mon => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop()
    })
  });
  return (
    <div
      ref={drop}
      className={`tableau ${isOver ? "dropping" : ""}`}
      style={{
        borderColor: color
      }}
    >
      {values.map((letter, index) => (
        <LetterTile key={index} letter={letter} />
      ))}
    </div>
  );
}
