"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  saltChoices,
  saltExpected,
  saltPrediction,
  saltRecords,
  initialSaltBoard,
  type SaltMode,
} from "@/lib/soluble-salts";
import { Filtration3D } from "./Filtration3D";
const labels: Record<string, string> = {
  "excess-insoluble": "Add excess insoluble reactant, then filter",
  titration: "Find suitable reacting proportions by titration",
  precipitation:
    "Mix suitable soluble solutions, then recover the insoluble precipitate",
  "filter-dissolved-alkali": "Filter dissolved excess alkali out",
  sulfuric: "Sulfuric acid",
  hydrochloric: "Hydrochloric acid",
  nitric: "Nitric acid",
  "not-an-acid-preparation":
    "This supplied route is precipitation, not acid preparation",
  "filter-excess": "Filter off excess insoluble CuO",
  concentrate: "Concentrate the filtrate with controlled heating",
  cool: "Allow cooling and crystallisation",
  "recover-dry": "Recover crystals and gently pat dry",
  complete: "The supplied preparation is complete",
  "boil-dry": "Strongly heat completely dry",
  "filter-before-reaction": "Filter before the acid has reacted",
  "excess-CuO": "Excess unreacted CuO",
  "none-of-these-solids": "No supplied insoluble solid is retained",
  "salt-crystals": "Formed salt crystals",
  "all-dissolved-salt": "Every dissolved salt ion",
  "salt-solution": "Salt dissolved in water",
  "salt-and-acid": "Salt and excess acid dissolved in water",
  "salt-and-alkali": "Salt and excess alkali dissolved in water",
  "mother-liquor": "Mother liquor: water and still-dissolved salt",
  "pure-water": "Only pure water",
  "concentrate-then-cool":
    "Concentrate gently, then cool and allow crystallisation",
  "preserve-crystals": "Obtain crystals without driving off all water",
  "pat-dry": "Pat the recovered crystals dry with filter paper",
  "remove-surface-liquid":
    "Remove surface liquid while retaining hydrated crystals",
  "repeat-without-indicator": "Repeat with measured volumes without indicator",
  "avoid-indicator-contamination":
    "Avoid contaminating the intended salt with indicator",
  "choose-measured-proportions":
    "Find suitable measured acid/alkali proportions",
  "dissolved-passes-filter":
    "Dissolved excess reactant passes through ordinary paper",
  "all-water-must-be-driven-off":
    "Drive off every water molecule from the crystals",
};
const fields: Record<SaltMode, [string, string][]> = {
  method: [
    ["method", "Your preparation method"],
    ["acid", "Your acid choice"],
  ],
  sequence: [["next", "Your next step"]],
  filter: [
    ["residue", "Your residue"],
    ["filtrate", "Your filtrate"],
  ],
  cooling: [
    ["dissolved", "Your cold dissolved salt mass (g)"],
    ["crystals", "Your formed crystal mass (g)"],
  ],
  purity: [
    ["next", "Your next action"],
    ["reason", "Your reason"],
  ],
};
const headings: Record<SaltMode, string> = {
  method: "Choose a preparation method",
  sequence: "Track the practical sequence",
  filter: "Predict residue and filtrate",
  cooling: "Keep salt in the mother liquor",
  purity: "Protect product purity",
};
const hints: Record<SaltMode, string> = {
  method:
    "Use the supplied solubility and required salt anion. Insoluble excess can be filtered; dissolved excess needs suitable measured proportions. The supplied insoluble salt uses precipitation.",
  sequence:
    "Filter excess solid before concentration. Concentrate without complete dryness, then cool and allow crystals to form. Recover and gently dry the formed crystals.",
  filter:
    "Ordinary filtration retains suspended insoluble solids. Dissolved salt, acid or alkali can pass through with water. At crystal recovery, formed crystals are the solid and mother liquor passes.",
  cooling:
    "Cold capacity = supplied grams per 100 g water × water mass /100. Remaining dissolved mass is the smaller of capacity and available salt. Crystal mass is the difference; no water loss or other loss is assumed.",
  purity:
    "Distinguish concentration, cooling and drying surface liquid. Dissolved excess reactants and indicator can contaminate salt; ordinary filtering does not guarantee their removal.",
};
const states = [
  "Copper sulfate solution + excess CuO; acid has reacted",
  "Filtered copper sulfate solution; excess CuO removed",
  "Concentrated copper sulfate solution; some water removed",
  "Copper sulfate crystals in mother liquor after cooling and crystallisation",
  "Recovered crystals gently dried; some dissolved salt remains in mother liquor",
];
export function SaltWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: SaltMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialSaltBoard(mode),
    key = String(b.record),
    records = saltRecords[mode] as Record<string, { label: string }>,
    [feedback, setFeedback] = useState(""),
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
    onChange([...history, { ...b, [field]: value }]);
  }
  const select = (f: string, l: string) => (
    <label key={f}>
      {l}
      <select
        aria-label={l}
        value={b[f]}
        onChange={(e) => change(f, e.target.value)}
      >
        {saltChoices[mode][f].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : f === "record"
                ? records[v].label
                : (labels[v] ?? v)}
          </option>
        ))}
      </select>
      {f !== "record" && b[f] !== "unset" && (
        <span className="metal-selected">
          Selected: {labels[String(b[f])] ?? String(b[f])}
        </span>
      )}
    </label>
  );
  function check() {
    const p = saltPrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete every prediction before checking."
        : p.correct
          ? `That's right. ${Object.entries(saltExpected(mode, b))
              .map(
                ([k, v]) =>
                  `${fields[mode].find(([f]) => f === k)?.[1]}: ${labels[v] ?? v}`,
              )
              .join("; ")}.`
          : `Not yet. ${hints[mode]}`,
    );
  }
  return (
    <section
      className="model task-workbench salt-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      <div className="metal-predictions">
        {fields[mode].map(([f, l]) => select(f, l))}
      </div>

      {mode === "sequence" && (
        <div className="salt-sequence">
          <p className="salt-current-state">
            <strong>Stage {Number(b.stage) + 1} of 5:</strong>{" "}
            {states[Number(b.stage)]}
          </p>
          <button
            className="button particle-choice"
            disabled={
              Number(b.stage) >= 4 || b.next !== saltExpected(mode, b).next
            }
            onClick={() => change("stage", String(Number(b.stage) + 1))}
          >
            Advance the predicted correct step
          </button>
          <p className="position-caption">
            Predict and check the next action before advancing. This is a
            supplied teacher-reported simulation; it does not perform or certify
            practical work.
          </p>
        </div>
      )}
      {mode !== "sequence" &&
        select("record", "Explore a supplied salt preparation record")}
      <p className="metal-record">{records[key].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing the model
        explores another supplied case.
      </p>
      {mode === "filter" && key === "initial" && <Filtration3D />}
      {mode === "filter" && key !== "initial" && (
        <p>
          The 3D initial apparatus is hidden for this changed material record.
          Predict this mixture’s actual dissolved and solid fractions.
        </p>
      )}
      {mode === "cooling" &&
        (() => {
          const r =
            saltRecords.cooling[key as keyof typeof saltRecords.cooling];
          return (
            <div className="salt-solubility-record">
              <dl>
                <div>
                  <dt>Water mass kept constant</dt>
                  <dd>{r.water} g</dd>
                </div>
                <div>
                  <dt>Salt initially dissolved</dt>
                  <dd>{r.solute} g</dd>
                </div>
                <div>
                  <dt>Cold solubility supplied</dt>
                  <dd>{r.cold} g per 100 g water</dd>
                </div>
              </dl>
              <p>
                Use supplied anhydrous KNO3 data, no water loss and equilibrium
                crystallisation. The data do not represent copper sulfate
                hydrate masses. A capacity cannot create extra solute; some
                records give no crystals.
              </p>
            </div>
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
        <p>{hints[mode]}</p>
        <p>
          Many solids become less soluble on cooling, but not all;
          crystallisation may take time. Supplied predictions are practical
          reasoning, not certification of supervised laboratory skills.
        </p>
      </details>
    </section>
  );
}
