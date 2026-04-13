import React from "react";
import classNames from "classnames";

export function BrandIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={classNames("brand-mark", className)}
      viewBox="0 0 180 160"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="lab-burst"
        d="M86 5 101 30 132 18 128 50 162 58 137 78 156 106 122 105 113 138 88 116 61 154 56 112 20 120 42 88 8 72 45 55 35 22 68 35Z"
      />
      <g className="professor">
        <path
          className="professor-hair"
          d="M42 47 23 33 39 66 17 65 40 84 24 101 56 94 64 120 76 94 103 105 92 78 116 63 85 60 88 32 65 52Z"
        />
        <circle className="professor-face" cx="66" cy="75" r="29" />
        <circle className="goggle" cx="54" cy="70" r="10" />
        <circle className="goggle" cx="78" cy="70" r="10" />
        <path className="goggle-bridge" d="M64 70 H68" />
        <path className="professor-mouth" d="M54 88 Q66 98 80 87" />
        <path className="bowtie" d="M52 109 68 101 68 117Z M84 109 68 101 68 117Z" />
      </g>
      <g className="test-tube">
        <path className="tube-glass" d="M112 28 H154 L147 125 Q144 149 121 143 Q99 137 104 113Z" />
        <path className="tube-liquid" d="M108 92 Q122 83 136 93 T151 91 L148 122 Q144 142 123 137 Q105 132 108 112Z" />
        <circle className="lab-bubble bubble-a" cx="119" cy="30" r="8" />
        <circle className="lab-bubble bubble-b" cx="146" cy="22" r="7" />
        <circle className="lab-bubble bubble-c" cx="158" cy="45" r="6" />
        <text className="tube-letter" x="119" y="111">A</text>
        <text className="tube-letter" x="137" y="126">B</text>
        <text className="tube-letter" x="128" y="94">C</text>
      </g>
    </svg>
  );
}
