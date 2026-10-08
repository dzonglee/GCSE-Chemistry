"use client";
import { useState } from "react";
import { metalReactionReference } from "@/lib/metal-reaction-reference";
export function MetalReactionReference() {
  const [selected, setSelected] = useState(0),
    [medium, setMedium] = useState<"water" | "acid">("water"),
    entry = metalReactionReference[selected];
  return (
    <aside
      className="metal-reaction-reference"
      aria-label="Eight-metal reaction reference"
    >
      <h3>Explore a metal</h3>
      <label htmlFor="metal-reference-conditions">Reaction conditions</label>
      <select
        id="metal-reference-conditions"
        value={medium}
        onChange={(e) => setMedium(e.target.value as "water" | "acid")}
      >
        <option value="water">Room-temperature water</option>
        <option value="acid">Suitable dilute HCl</option>
      </select>
      <div className="metal-reference-buttons">
        {metalReactionReference.map((m, i) => (
          <button
            type="button"
            key={m.symbol}
            aria-label={`${m.symbol}: ${m.name}`}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            {m.symbol}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <p>
          <strong>{entry.name}</strong>
        </p>
        <p>{entry[medium]}</p>
      </div>
      <p className="muted">
        Core order: {"K > Na > Li > Ca > Mg > Zn > Fe > Cu"}. Greater reactivity
        means greater tendency to form positive ions; positions are not equal
        numerical strengths. Supplied records, not laboratory instructions.
      </p>
    </aside>
  );
}
