import { Coffee, PlugZap, Wifi } from "lucide-react";

import type { Cafe } from "@/data/cafes";

type CafeSketchProps = {
  cafe: Cafe;
  compact?: boolean;
};

export function CafeSketch({ cafe, compact = false }: CafeSketchProps) {
  const isOutdoor = cafe.outdoor;

  return (
    <div
      className={`cafe-sketch cafe-sketch--${cafe.color} ${compact ? "cafe-sketch--compact" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 220 120" role="presentation">
        <path className="sketch-line sketch-window" d="M18 18 C62 14 108 18 203 14" />
        <path className="sketch-line sketch-window" d="M18 22 L18 76 M202 18 L202 76" />
        <path className="sketch-line sketch-table" d="M54 76 C83 70 137 72 167 76" />
        <path className="sketch-line sketch-table" d="M69 78 L61 109 M153 77 L160 108" />
        <path className="sketch-line sketch-chair" d="M35 69 C31 85 33 99 41 107 M35 86 L59 87" />
        <path className="sketch-line sketch-chair" d="M184 70 C187 84 185 99 178 107 M160 87 L185 87" />
        {isOutdoor && (
          <>
            <path className="sketch-line sketch-plant" d="M194 74 C184 60 190 46 200 36" />
            <path className="sketch-line sketch-plant" d="M196 59 C181 57 181 48 184 43 M198 50 C209 47 211 40 208 35" />
          </>
        )}
      </svg>
      <Coffee className="cafe-sketch__cup" strokeWidth={1.8} />
      <Wifi className="cafe-sketch__wifi" strokeWidth={1.8} />
      {cafe.outlets !== "None" && (
        <PlugZap className="cafe-sketch__plug" strokeWidth={1.8} />
      )}
    </div>
  );
}
