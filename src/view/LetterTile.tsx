import { Letter } from "../model";
import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import classNames from "classnames";

export function LetterTile({
  letter,
  disabled = false,
  onClick,
}: {
  letter: Letter;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}) {
  const [{ isDragging }, drag] = useDrag({
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
      ref={drag}
      className={classNames("letter-tile", {
        dragging: isDragging,
        disabled,
      })}
      onClick={!disabled ? onClick : undefined}
    >
      {letter.value}
    </div>
  );
}
