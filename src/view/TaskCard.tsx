import React from "react";
import { Task } from "../model";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import classNames from "classnames";

type TaskDragItem = {
  type: typeof ItemTypes.CARD;
  card: Task;
};

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
  const [{ isDragging }, drag] = useDrag<
    TaskDragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: ItemTypes.CARD,
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
      ref={(node) => {
        drag(node);
      }}
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
