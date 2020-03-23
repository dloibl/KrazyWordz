import React from "react";

export function Tableau({ color = "teal" }: { color?: string }) {
  return (
    <div
      className="tableau"
      style={{
        borderColor: color
      }}
    >
      Drop Zone
    </div>
  );
}
