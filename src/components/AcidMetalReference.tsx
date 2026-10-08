"use client";
import { useState } from "react";
import {
  acidMetalEquation,
  acidMetalReference,
} from "@/lib/acid-metal-reference";
export function AcidMetalReference({
  electrons = false,
}: {
  electrons?: boolean;
}) {
  const [metal, setMetal] = useState(0);
  const [acid, setAcid] = useState<"HCl" | "H2SO4">("HCl");
  const entry = acidMetalReference[metal];
  return (
    <aside
      className="acid-metal-reference"
      aria-label="Six metal–acid combinations"
    >
      <h3>Compare a metal and acid</h3>
      <p className="caption">
        The question keeps its stated reactants. Switching this reference
        explores other reactions.
      </p>
      <label htmlFor="acid-metal-reagent">Dilute acid</label>
      <select
        id="acid-metal-reagent"
        value={acid}
        onChange={(e) => setAcid(e.target.value as "HCl" | "H2SO4")}
      >
        <option value="HCl">Hydrochloric acid</option>
        <option value="H2SO4">Sulfuric acid</option>
      </select>
      <div className="acid-metal-buttons">
        {acidMetalReference.map((m, i) => (
          <button
            type="button"
            key={m.symbol}
            aria-pressed={metal === i}
            aria-label={`${m.symbol}: ${m.name}`}
            onClick={() => setMetal(i)}
          >
            {m.symbol}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <p>
          <strong>{acidMetalEquation(metal, acid)}</strong>
        </p>
        <p>
          {entry.name} forms {entry.name.toLowerCase()}
          {metal === 2 ? "(II)" : ""} {acid === "HCl" ? "chloride" : "sulfate"}{" "}
          and hydrogen. Bubbling and the metal becoming smaller are expected; a
          supplied squeaky-pop test supports hydrogen identity.
        </p>
        <p>
          Water is not an additional product of these metal reactions. Changing
          the acid changes the salt’s negative ion; Fe forms Fe2+ in these
          dilute-acid cases.
        </p>
        {electrons && (
          <section
            className="acid-metal-electrons"
            aria-label="Higher electron account"
          >
            <h4>Higher: both electron changes</h4>
            <p>
              {entry.symbol} → {entry.symbol}2+ + 2e−: the metal loses two
              electrons and is oxidised.
            </p>
            <p>2H+ + 2e− → H2: hydrogen ions gain electrons and are reduced.</p>
            <p>
              {entry.symbol} + 2H+ → {entry.symbol}2+ + H2. The{" "}
              {acid === "HCl" ? "chloride" : "sulfate"} ions remain spectators.
              Atoms and total charge are conserved; the two electrons cancel
              from the combined equation.
            </p>
          </section>
        )}
      </div>
      <p className="muted">
        Supplied dilute-acid examples. No prediction for every metal or every
        acid; comparable conditions are needed for rate comparisons.
      </p>
    </aside>
  );
}
