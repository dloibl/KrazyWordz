import React from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { Letter } from "../model";
import { LetterTile } from "./LetterTile";
import { observer } from "mobx-react";
import {
  getLastPlayedLetter,
  getUnplayedLetters,
  getSortedPlayedLetters,
  getNextPosition
} from "../model/Letter";

export const Tableau = observer(function({
  color = "teal",
  letters = []
}: {
  color?: string;
  letters: Letter[];
}) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.LETTER,
    drop: drop => {
      const letter = ((drop as any) as { letter: Letter }).letter;
      letter.position = getNextPosition(letters);
    },
    collect: mon => ({
      isOver: !!mon.isOver()
    })
  });

  const handleInput = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      getLastPlayedLetter(letters).position = undefined;
    } else {
      const letter = getUnplayedLetters(letters).find(
        it => it.value.toUpperCase() === e.key.toUpperCase()
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
        borderColor: color
      }}
    >
      {getSortedPlayedLetters(letters).map((letter, index) => (
        <LetterTile key={index} letter={letter} />
      ))}
      <input
        autoFocus={true}
        tabIndex={1}
        value=""
        style={{ width: "100%" }}
        onChange={() => null}
      />
    </div>
  );
});
