"use client";
import { useState } from "react";
export function NanoFootprintDiagram({
  base,
  height,
  interactive = false,
}: {
  base: number;
  height: number;
  interactive?: boolean;
}) {
  const [rectangle, setRectangle] = useState(!interactive);
  return (
    <figure className="model nano-footprint">
      {interactive && (
        <button
          type="button"
          className="button secondary"
          aria-pressed={rectangle}
          onClick={() => setRectangle(!rectangle)}
        >
          {rectangle ? "Hide matching rectangle" : "Show matching rectangle"}
        </button>
      )}
      <svg
        viewBox="0 0 480 340"
        role="img"
        aria-label={`Ideal triangular coating footprint: base ${base} nm, perpendicular height ${height} nm. ${rectangle ? "Matching rectangle shown." : "Matching rectangle hidden."} Not to scale.`}
      >
        {rectangle && (
          <rect
            x="55"
            y="45"
            width="275"
            height="210"
            fill="#f3f1ff"
            stroke="#666"
            strokeWidth="3"
            strokeDasharray="9 7"
          />
        )}
        <path
          d="M55 255 L330 255 L55 45 Z"
          fill="#c9c4ff"
          stroke="#4338ca"
          strokeWidth="4"
        />
        <path
          d="M55 231 H79 V255"
          fill="none"
          stroke="#111827"
          strokeWidth="3"
        />
        <path
          className="height-dimension"
          d="M340 45 V255"
          stroke="#111827"
          strokeWidth="3"
          strokeDasharray="7 6"
        />
        <text x="193" y="302" textAnchor="middle" fontSize="34">
          {base} nm base
        </text>
        <text x="410" y="120" textAnchor="middle" fontSize="34">
          {height}
        </text>
        <text x="410" y="156" textAnchor="middle" fontSize="34">
          nm
        </text>
        <text x="410" y="190" textAnchor="middle" fontSize="34">
          height
        </text>
      </svg>
      <figcaption>
        Ideal coating footprints, not a particle’s total surface area or atom
        count. Height is perpendicular; not to scale.
      </figcaption>
    </figure>
  );
}
