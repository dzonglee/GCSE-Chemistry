"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialOxygenBoard,
  oxygenRecords,
  oxygenChoices,
  oxygenExpected,
  oxygenPrediction,
  type OxygenMode,
} from "@/lib/oxygen-redox";
import { OxygenTransfer3D } from "./OxygenTransfer3D";
const labels: Record<string, string> = {
  oxidation: "Oxidation: metal gains oxygen",
  reduction: "Reduction: oxide loses oxygen",
  "physical-change": "Only a physical change",
  "receives-oxygen-and-is-oxidised": "Receives oxygen and is itself oxidised",
  "loses-oxygen-and-is-reduced": "Loses oxygen and is itself reduced",
  "always-the-metal-product": "Always the resulting metal product",
  "oxygen-entered": "Oxygen enters the tracked sample",
  "oxygen-left-this-sample": "Oxygen leaves this sample for another product",
  "internal-transfer-no-total-change":
    "Internal transfer; zero net mass crosses the complete boundary",
  "atoms-destroyed": "Oxygen atoms are destroyed",
  "new-metal-created": "New metal atoms are created",
  "oxide-reduction-supported":
    "Identified oxide-to-metal reduction is supported",
  "not-enough-evidence": "Product identities are not established",
  "neutralisation-not-metal-reduction":
    "Neutralisation to a copper salt, not reduction to metal",
  "oxygen-model-insufficient":
    "The oxygen-only description cannot rule out broader redox",
  "every-oxygen-movement-is-redox": "Every movement of oxygen means redox",
  "all-oxygen-free-reactions-nonredox": "No oxygen change means no redox",
  "metal-formed-oxygen-transferred":
    "Metal forms; oxygen transfers to the reducing agent",
  "colour-not-product-identification":
    "Colour alone does not establish product identity",
  "copper-remains-ion-not-metal":
    "Copper remains Cu2+ in a salt rather than becoming metal",
  "broader-electron-redox-separate":
    "Use the separate broader electron-based redox description",
  "colour-proves-everything":
    "Colour proves the complete chemical interpretation",
};
const fields: Record<OxygenMode, [string, string][]> = {
  oxidation: [["change", "Your metal change"]],
  transfer: [
    ["reduced", "Your substance reduced"],
    ["oxidised", "Your substance oxidised"],
  ],
  agent: [
    ["agent", "Your reducing agent"],
    ["reason", "Your reason"],
  ],
  mass: [
    ["oxygen", "Your net crossing mass / g"],
    ["direction", "Your boundary interpretation"],
  ],
  evidence: [
    ["conclusion", "Your supported conclusion"],
    ["reason", "Your evidence rule"],
  ],
};
const headings: Record<OxygenMode, string> = {
  oxidation: "Count the gained oxygen",
  transfer: "Follow conserved oxygen",
  agent: "Separate the two roles",
  mass: "Choose the boundary",
  evidence: "Check the chemical evidence",
};
export function OxygenRedoxWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: OxygenMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialOxygenBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    key = String(b.record),
    records = oxygenRecords[mode] as Record<string, { label: string }>;
  function change(field: string, value: string) {
    if (b[field] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [field]: value }]);
  }
  const select = (field: string, label: string) => (
    <label key={field}>
      {label}
      <select
        aria-label={label}
        value={b[field]}
        onChange={(e) => change(field, e.target.value)}
      >
        {oxygenChoices[mode][field].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : field === "record"
                ? records[v].label
                : (labels[v] ?? v)}
          </option>
        ))}
      </select>
      {field !== "record" && b[field] !== "unset" && (
        <span className="metal-selected">
          Selected: {labels[String(b[field])] ?? String(b[field])}
        </span>
      )}
    </label>
  );
  const count = Number(b.oxygen === "unset" ? 0 : b.oxygen),
    countMode = mode === "oxidation" || mode === "transfer";
  function check() {
    const p = oxygenPrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete every prediction before checking."
        : p.correct
          ? `That's right. ${Object.entries(oxygenExpected(mode, b))
              .map(
                ([k, v]) =>
                  `${k === "oxygen" ? (mode === "mass" ? "Net oxygen mass crossing this boundary / g" : mode === "transfer" ? "Oxygen atoms transferred" : "Oxygen atoms gained") : k === "reduced" ? "Substance reduced" : k === "oxidised" ? "Substance oxidised" : k === "agent" ? "Reducing agent" : k === "change" ? "Metal change" : k === "direction" ? "Boundary interpretation" : k === "reason" ? "Reason" : "Conclusion"}: ${labels[v] ?? v}`,
              )
              .join("; ")}.`
          : mode === "oxidation"
            ? "Not yet. Count all oxygen atoms in the coefficient-weighted metal inventory. Metal oxygen gain is oxidation."
            : mode === "transfer"
              ? "Not yet. The original oxide loses oxygen while the receiving reactant gains it. Count oxygen transferred, not all oxygen already present in the final products."
              : mode === "agent"
                ? "Not yet. In these supplied oxide reactions, the reducing agent receives oxygen from the oxide and is itself oxidised. It is different from the oxide reduced."
                : mode === "mass"
                  ? "Not yet. Identify the tracked boundary. Sample gain or loss is oxygen crossing that boundary; a complete sealed apparatus retains all mass despite internal transfer."
                  : "Not yet. Identify the actual products and distinguish neutralisation from oxide-to-metal reduction. Colour alone is insufficient; an oxygen-only description cannot decide every redox case.",
    );
  }
  return (
    <section
      className="model task-workbench oxygen-redox-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {countMode && (
        <div className="oxygen-counter">
          <span>
            Your oxygen atoms {mode === "transfer" ? "transferred" : "gained"}
          </span>
          <div className="oxygen-counter-actions">
            <button
              className="particle-choice"
              aria-label="Add oxygen atom"
              disabled={count >= 6}
              onClick={() => change("oxygen", String(count + 1))}
            >
              + Add O
            </button>
            <strong aria-live="polite">
              {b.oxygen === "unset" ? "Not entered" : count}
            </strong>
            <button
              className="particle-choice"
              aria-label="Remove oxygen atom"
              disabled={count === 0}
              onClick={() => change("oxygen", String(count - 1))}
            >
              − Remove O
            </button>
          </div>
          <div
            className="oxygen-predicted-atoms"
            role="group"
            aria-label={`${count} predicted oxygen atoms`}
          >
            {Array.from({ length: count }, (_, i) => (
              <span key={i}>O</span>
            ))}
          </div>
          <p className="position-caption">
            Count markers represent atoms for bookkeeping, not free oxygen
            particles or a reaction mechanism.
          </p>
        </div>
      )}
      <div className="metal-predictions">
        {fields[mode].map(([field, label]) => select(field, label))}
      </div>
      {select("record", "Explore a supplied reaction record")}
      <p className="metal-record">{records[key].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing the model
        explores another supplied case.
      </p>
      {mode === "transfer" && key === "initial" && <OxygenTransfer3D />}
      {mode === "transfer" && key !== "initial" && (
        <p>
          Track the oxygen in this supplied equation. The CuO/carbon 3D view
          belongs to the initial record; it does not represent this different
          reaction.
        </p>
      )}
      {mode === "mass" &&
        (() => {
          const r = oxygenRecords.mass[key as keyof typeof oxygenRecords.mass];
          return (
            <figure className="oxygen-mass-ledger">
              <figcaption>
                Mass of the stated sample or complete apparatus
              </figcaption>
              <table>
                <thead>
                  <tr>
                    <th>Before / g</th>
                    <th>After / g</th>
                    <th>After − before / g</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{r.before.toFixed(2)}</td>
                    <td>{r.after.toFixed(2)}</td>
                    <td>{Number((r.after - r.before).toPrecision(6))}</td>
                  </tr>
                </tbody>
              </table>
              <p>
                A signed sample change is different from the magnitude of net
                oxygen mass crossing its boundary. Zero complete-system change
                does not mean no oxygen moved between substances.
              </p>
            </figure>
          );
        })()}
      <div className="bench-actions">
        <button className="button primary" onClick={check}>
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback("");
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([]);
            setFeedback("");
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={correct ? "feedback correct" : "feedback retry"}
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>About this model</summary>
        <p>{instruction}</p>
        <p>
          Use the named reactants and their actual supplied formulas. Oxygen
          atoms are transferred, not created or destroyed. A reducing agent
          removes oxygen from another substance and gains it itself in these
          oxide cases. Full extraction and Higher electron half-equations
          require their separate lessons. These are supplied-data
          interpretations, not practical instructions.
        </p>
      </details>
    </section>
  );
}
