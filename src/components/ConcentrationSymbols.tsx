"use client";
import { useState } from "react";
const meanings = [
  [
    "=",
    "Equal to",
    "C = 40 g/dm³ for a supplied mass of 8 g and final volume 0.200 dm³.",
  ],
  [
    "<",
    "Less than",
    "20 g/dm³ < 40 g/dm³. Compare concentrations in matching units.",
  ],
  [
    "<<",
    "Much less than",
    "0.01 g/dm³ << 100 g/dm³ illustrates a large difference; the symbol sets no universal ratio.",
  ],
  [
    ">>",
    "Much greater than",
    "100 g/dm³ >> 0.01 g/dm³ illustrates a large difference; no exact multiplier is specified.",
  ],
  [
    ">",
    "Greater than",
    "40 g/dm³ > 20 g/dm³. Compare concentrations in matching units.",
  ],
  [
    "∝",
    "Proportional to",
    "C ∝ m at fixed final volume. C ∝ 1/V at fixed dissolved mass. If both change, divide the mass factor by the volume factor.",
  ],
  [
    "~",
    "Approximately equal to",
    "20.1 g/dm³ ~ 20 g/dm³ when rounded to the nearest whole number. AQA lists ~; ≈ is another common notation. This is not proportionality.",
  ],
];
export function ConcentrationSymbols() {
  const [selected, setSelected] = useState(0);
  const entry = meanings[selected];
  return (
    <aside
      className="concentration-symbols"
      aria-label="Concentration symbol reference"
    >
      <h3>Explore a symbol</h3>
      <div className="concentration-symbol-buttons">
        {meanings.map(([symbol, meaning], i) => (
          <button
            type="button"
            key={symbol}
            aria-label={`${symbol}: ${meaning}`}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            {symbol}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <p>
          <strong>
            {entry[0]} — {entry[1]}
          </strong>
        </p>
        <p>{entry[2]}</p>
      </div>
      <p className="muted">
        A guided reference. Independent checks ask you to recall the meanings.
      </p>
    </aside>
  );
}
