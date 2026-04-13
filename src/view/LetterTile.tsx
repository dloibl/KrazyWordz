import { Letter } from "../model";
import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import classNames from "classnames";

type LetterDragItem = {
  type: typeof ItemTypes.LETTER;
  letter: Letter;
};

export function LetterTile({
  letter,
  disabled = false,
  onClick,
}: {
  letter: Letter;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}) {
  const [{ isDragging }, drag] = useDrag<
    LetterDragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: ItemTypes.LETTER,
    item: {
      type: ItemTypes.LETTER,
      letter,
    },
    canDrag: () => !disabled,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  return (
    <div
      ref={(node) => {
        drag(node);
      }}
      className={classNames("card border border-2 letter-tile", {
        dragging: isDragging,
        disabled,
      })}
      onClick={!disabled ? onClick : undefined}
    >
      {letter.value}
    </div>
  );
}
