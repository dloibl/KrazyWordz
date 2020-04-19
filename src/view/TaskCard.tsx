import React from "react";
import { Task } from "../model";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

export function TaskCard({
  task,
  disabled = true,
}: {
  task: Task;
  disabled?: boolean;
}) {
  const [, drag] = useDrag({
    item: {
      type: ItemTypes.CARD,
      card: task,
    },
    canDrag: () => !disabled,
  });

  return (
    <div
      ref={drag}
      className="task-card"
      style={{
        borderColor: "darkgray",
      }}
    >
      {task.task}
    </div>
  );
}
