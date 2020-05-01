import React from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { Letter, Task } from "../model";
import { LetterTile } from "./LetterTile";
import { observer } from "mobx-react";
import {
  getLastPlayedLetter,
  getUnplayedLetters,
  getSortedPlayedLetters,
  getNextPosition,
} from "../model/Letter";

export const Tableau = observer(function ({
  color = "teal",
  letters = [],
  disabled = false,
  onDropCard,
}: {
  color?: string;
  letters: Letter[];
  disabled?: boolean;
  onDropCard?: (card: Task) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: [ItemTypes.LETTER, ItemTypes.CARD],
    drop: (drop) => {
      if (drop.type === ItemTypes.LETTER) {
        const letter = ((drop as any) as { letter: Letter }).letter;
        letter.position = getNextPosition(letters);
      }
      if (drop.type === ItemTypes.CARD && onDropCard) {
        onDropCard((drop as any).card);
      }
    },
    collect: (mon) => ({
      isOver: !!mon.isOver(),
    }),
  });

  const handleInput = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      getLastPlayedLetter(letters).position = undefined;
    } else {
      const letter = getUnplayedLetters(letters).find(
        (it) => it.value.toUpperCase() === e.key.toUpperCase()
      );
      if (letter) {
        letter.position = getNextPosition(letters);
      }
    }
  };
  return (
    <div
      onKeyDown={handleInput}
      ref={drop}
      className={`tableau ${isOver ? "dropping" : ""}`}
      style={{
        borderColor: color,
      }}
    >
      {getSortedPlayedLetters(letters).map((letter, index) => (
        <LetterTile key={index} letter={letter} disabled={disabled} />
      ))}
      {!disabled && (
        <input
          autoFocus={true}
          tabIndex={1}
          type="text"
          value=""
          style={{ width: "100%" }}
          onChange={() => null}
        />
      )}
    </div>
  );
});
