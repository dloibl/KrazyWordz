import { Task, Word } from "../model";
import React from "react";

export function MatchedCard({
  card,
  word,
  color,
  onDelete,
}: {
  onDelete?: (card: Task) => void;
  card: Task;
  word: Word;
  color: string;
}) {
  return (
    <div
      className="task-card match"
      style={{
        borderColor: color,
      }}
    >
      {card?.task} = {word?.word}
      {onDelete && <button onClick={() => onDelete(card)}>X</button>}
    </div>
  );
}
