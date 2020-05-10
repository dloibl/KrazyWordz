import React from "react";
import { Task } from "../model";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import classNames from "classnames";

export function TaskCard({
  task,
  disabled = true,
  active = false,
  onClick,
}: {
  task: Task;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    item: {
      type: ItemTypes.CARD,
      card: task,
    },
    canDrag: () => !disabled,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={classNames("task-card", { active, dragging: isDragging })}
      style={{
        borderColor: "darkgray",
      }}
      onClick={onClick}
    >
      {task.task}
    </div>
  );
}
