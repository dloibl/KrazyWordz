import React from "react";
import { observer } from "mobx-react";
import { Letter } from "../model";
import { LetterTile } from "./LetterTile";
import { ItemTypes } from "./ItemTypes";
import { useDrop } from "react-dnd";
import { getNextPosition } from "../model/Letter";

export const LetterPool = observer(function ({
  letters = [],
}: {
  letters: Letter[];
}) {
  const [, drop] = useDrop({
    accept: ItemTypes.LETTER,
    drop: (drop) => {
      const letter = ((drop as any) as { letter: Letter }).letter;
      letter.position = undefined;
    },
  });
  return (
    <div ref={drop} className="letters">
      {letters
        .filter((letter) => !letter.position)
        .map((letter, index) => (
          <LetterTile
            key={index}
            letter={letter}
            onClick={() => (letter.position = getNextPosition(letters))}
          />
        ))}
    </div>
  );
});
