import { Task, Word } from "../model";
import React from "react";

export function MatchedCard({
  card,
  word,
  onDelete,
}: {
  onDelete?: (card: Task) => void;
  card: Task;
  word: Word;
}) {
  return (
    <div className="task-card match">
      {card.task} = {word.word}
      {onDelete && <button onClick={() => onDelete(card)}>X</button>}
    </div>
  );
}
