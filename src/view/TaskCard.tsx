import React from "react";
import { Task } from "../model";

export function TaskCard({ task }: { task: Task }) {
  return <div className="task-card">{task.task}</div>;
}
