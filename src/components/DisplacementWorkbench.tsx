"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  displacementRecords,
  displacementChoices,
  initialDisplacementBoard,
  displacementPrediction,
  combinedDisplacement,
  displacementLedger,
  displacementCancelRecords,
  cancelIonic,
  ionicBalance,
  ionicEquationText,
  type DisplacementMode,
} from "@/lib/displacement-redox";
import { Displacement3D } from "./Displacement3D";
const headings: Record<DisplacementMode, string> = {
  combine: "Scale the whole halves",
  cancel: "Omit unchanged terms",
  ledger: "Check atoms and signed charge",
  representation: "Choose the particle representation",
  feasibility: "Check the supplied evidence",
};
const fields: Record<DisplacementMode, [string, string][]> = {
  combine: [],
  cancel: [["selected", "Your proposed spectator cancellation"]],
  ledger: [],
  representation: [
    ["decision", "Your representation"],
    ["reason", "Your representation reason"],
  ],
  feasibility: [
    ["occurs", "Your occurrence conclusion"],
    ["reason", "Your feasibility reason"],
    ["oxidised", "Species actually oxidised"],
    ["reduced", "Species actually reduced"],
  ],
};
const labels: Record<string, string> = {
  unset: "Predict",
  none: "None",
  "NO3@aq": "NO₃⁻(aq)",
  "Cl1@aq": "Cl⁻(aq)",
  "SO4@aq": "SO₄²⁻(aq)",
  "Na1@aq": "Na⁺(aq)",
  "Cl1@aq,Na1@aq": "Cl⁻(aq) and Na⁺(aq)",
  "Cu@s": "Cu(s)",
  "Cu2@aq": "Cu²⁺(aq)",
  "Ag1@aq": "Ag⁺(aq)",
  "electron@": "e⁻",
  "separate-ions": "Separate aqueous ions",
  "keep-intact": "Keep the supplied term intact",
  "remain-in-solution": "Remain physically in solution",
  "equal-not-zero": "Equal nonzero charge is allowed",
  "do-not-cancel": "Do not cancel these different terms",
  "dissolved-salt": "Dissolved strong ionic salt",
  "solid-not-dissolved": "Stated solid, not dissolved ions",
  "molecular-product": "Molecular water product",
  "equation-shortening": "Equation shortening, not physical removal",
  "charge-conservation": "Equal signed charge is required",
  "different-species": "Different charge means different species",
  "different-state": "Different stated physical state",
  disappear: "Particles disappear",
  "split-all": "Split every formula into ions",
  "different-species-cancel": "Cancel different species",
  "all-charges-must-zero": "Both sides must have zero charge",
  "same-element-enough": "Same element alone is enough",
  "cancellation-removes-ions": "Cancellation physically removes ions",
  yes: "Occurs in the supplied comparison",
  no: "Not supported by the supplied ordering",
  "not-established": "Not established by supplied evidence",
  "no-displacement": "No different-metal displacement",
  "no-detectable-change": "No detectable change in supplied observation",
  "yes-because-balanced": "Must occur because it balances",
  "metal-more-reactive": "Displacing metal is more reactive",
  "metal-less-reactive": "Displacing metal is less reactive",
  "ordering-missing": "Relative ordering/evidence missing",
  "same-metal-pair": "Same metal/ion pair",
  "surface-barrier": "Supplied oxide surface barrier",
  "balance-proves-reaction": "Balance alone proves occurrence",
  "charge-is-reactivity": "Charge determines reactivity",
  "no-change-proves-order": "No change reverses the ordering",
  "not-detected": "No actual change detected",
  Cu: "Cu metal",
  Zn: "Zn metal",
  "Cu²⁺": "Cu²⁺ ions",
  "Ag⁺": "Ag⁺ ions",
  Cu2: "Cu²⁺ ions",
  Zn2: "Zn²⁺ ions",
  Ag1: "Ag⁺ ions",
  Ag: "Ag metal",
};
export function DisplacementWorkbench({
  mode,
  record = "initial",
  instruction,
  history,
  onChange,
}: {
  mode: DisplacementMode;
  record?: string;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialDisplacementBoard(mode, record),
    key = String(b.record),
    records = displacementRecords[mode] as Record<string, { label: string }>;
  const [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
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
    onChange([
      ...history,
      field === "record"
        ? initialDisplacementBoard(mode, value)
        : { ...b, [field]: value },
    ]);
  }
  const select = (field: string, label: string) => (
    <label key={field}>
      {label}
      <select
        aria-label={label}
        value={b[field]}
        onChange={(e) => change(field, e.target.value)}
      >
        {displacementChoices[mode][field].map((v) => (
          <option key={v} value={v}>
            {field === "record" ? records[v].label : (labels[v] ?? v)}
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
  const step = (field: string, label: string) => (
    <div className="displacement-step" key={field}>
      <span>{label}</span>
      <div className="electrolysis-ion-controls">
        <button
          className="button particle-choice"
          aria-label={"Decrease " + label}
          disabled={Number(b[field]) <= 1}
          onClick={() => change(field, String(Number(b[field]) - 1))}
        >
          −
        </button>
        <output aria-label={label}>{b[field]}</output>
        <button
          className="button particle-choice"
          aria-label={"Increase " + label}
          disabled={Number(b[field]) >= 6}
          onClick={() => change(field, String(Number(b[field]) + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
  const combination =
    mode === "combine"
      ? combinedDisplacement(
          key as keyof typeof displacementRecords.combine,
          Number(b.oxidation),
          Number(b.reduction),
        )
      : null;
  const ledger =
    mode === "ledger"
      ? displacementLedger(
          key as keyof typeof displacementRecords.ledger,
          ["a", "b", "c", "d"].map((k) => Number(b[k])),
        )
      : null;
  const full =
    mode === "cancel"
      ? displacementCancelRecords[key as keyof typeof displacementCancelRecords]
      : null;
  const cancelled = full ? cancelIonic(full.left, full.right) : null;
  const counts =
    ledger ??
    (combination
      ? combination.balance
      : full
        ? ionicBalance(full.left, full.right)
        : null);
  return (
    <section
      className="model task-workbench displacement-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "combine" && step("oxidation", "Oxidation multiplier")}
      {mode === "ledger" && step("a", "First reactant coefficient")}
      {mode !== "combine" &&
        mode !== "ledger" &&
        select(fields[mode][0][0], fields[mode][0][1])}
      {select("record", "Supplied reaction record")}
      <p className="selected-scenario">{records[key].label}</p>
      {mode === "combine" && step("reduction", "Reduction multiplier")}
      {mode === "ledger" &&
        ["b", "c", "d"].map((field, i) =>
          step(
            field,
            [
              "Second reactant coefficient",
              "First product coefficient",
              "Second product coefficient",
            ][i],
          ),
        )}
      {mode !== "combine" &&
        mode !== "ledger" &&
        fields[mode].slice(1).map(([field, label]) => select(field, label))}
      {combination && (
        <div aria-live="polite" className="displacement-equations">
          <p>
            <strong>Added halves:</strong>{" "}
            {ionicEquationText(combination.addedLeft)} →{" "}
            {ionicEquationText(combination.addedRight)}
          </p>
          <p>
            Electrons lost: {combination.electronsLost}; gained:{" "}
            {combination.electronsGained}.
          </p>
          <p>
            <strong>After identical terms cancel:</strong>{" "}
            {ionicEquationText(combination.left)} →{" "}
            {ionicEquationText(combination.right)}
          </p>
          {!combination.matched && (
            <p>
              The unequal electron transfer leaves an electron term. This is not
              a completed displacement net equation.
            </p>
          )}
        </div>
      )}
      {ledger && (
        <p aria-live="polite">
          {ionicEquationText(ledger.termsLeft)} →{" "}
          {ionicEquationText(ledger.termsRight)}
        </p>
      )}
      {full && cancelled && (
        <div className="displacement-equations">
          <p>
            <strong>Full equation:</strong> {ionicEquationText(full.left)} →{" "}
            {ionicEquationText(full.right)}
          </p>
          <details>
            <summary>Compare the unchanged-species reference</summary>
            <p>
              {ionicEquationText(cancelled.left)} →{" "}
              {ionicEquationText(cancelled.right)}
            </p>
            <p>Equal spectator terms are omitted; the physical ions remain.</p>
          </details>
        </div>
      )}
      {counts && (
        <table className="data-table">
          <caption>Separate conservation ledgers</caption>
          <thead>
            <tr>
              <th scope="col">Quantity</th>
              <th scope="col">Left</th>
              <th scope="col">Right</th>
            </tr>
          </thead>
          <tbody>
            {[
              ...new Set([
                ...Object.keys(counts.left.atoms),
                ...Object.keys(counts.right.atoms),
              ]),
            ].map((element) => (
              <tr key={element}>
                <th scope="row">{element} atoms</th>
                <td>{counts.left.atoms[element] ?? 0}</td>
                <td>{counts.right.atoms[element] ?? 0}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Total signed charge</th>
              <td>
                {counts.left.charge > 0 ? "+" : ""}
                {counts.left.charge}
              </td>
              <td>
                {counts.right.charge > 0 ? "+" : ""}
                {counts.right.charge}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <p className="position-caption">
        {instruction} Use the data stated in the answer question; changing this
        model does not change that question.
      </p>
      <div className="bench-actions">
        <button
          className="button"
          onClick={() => {
            const result = displacementPrediction(mode, b);
            setCorrect(result.correct);
            setFeedback(
              (result.correct
                ? "That’s right. "
                : "Your proposed answer is retained. ") + result.explanation,
            );
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length <= 1}
          onClick={() => {
            setFeedback("");
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFeedback("");
            onChange([initialDisplacementBoard(mode, record)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={"feedback " + (correct ? "correct" : "retry")}
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>3D copper/silver reference with nitrate spectators</summary>
        <Displacement3D />
      </details>
    </section>
  );
}
