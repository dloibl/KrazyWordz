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
      className="card border border-4 task-card match"
      style={{
        borderColor: color,
      }}
    >
      <div className="card-body">
        <p>{card?.task}</p>
        <strong>= {word?.word}</strong>
      </div>
      {onDelete && (
        <button
          className="paper-btn btn-danger btn-small match-delete"
          onClick={() => onDelete(card)}
        >
          X
        </button>
      )}
    </div>
  );
}
