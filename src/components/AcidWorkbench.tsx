"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  acidChoices,
  acidExpected,
  acidPrediction,
  acidRecords,
  initialAcidBoard,
  type AcidMode,
} from "@/lib/acid-neutralisation";
import { Neutralisation3D } from "./Neutralisation3D";
const labels: Record<string, string> = {
  neutral: "Neutral for the supplied strong-acid/alkali case",
  acidic: "Acidic: supplied H+ remains in excess",
  alkaline: "Alkaline: supplied OH− remains in excess",
  "charge-alone-decides": "Decide pH from total electrical charge",
  metal: "Metal",
  oxide: "Metal oxide",
  hydroxide: "Metal hydroxide",
  carbonate: "Metal carbonate",
  none: "No gas product in this reaction pattern",
  yes: "Water forms",
  no: "Water is not a product of this pattern",
  "calcium-chloride": "Calcium chloride",
  "magnesium-nitrate": "Magnesium nitrate",
  "aluminium-sulfate": "Aluminium sulfate",
  "sodium-sulfate": "Sodium sulfate",
  "iron-II-chloride": "Iron(II) chloride",
  "calcium-nitrate": "Calcium nitrate",
  "magnesium-chloride": "Magnesium chloride",
  acid: "Acid",
  "alkali-soluble-base": "Alkali: a soluble base",
  "insoluble-base": "Insoluble base",
  "neutral-solution": "Neutral solution",
  "all-bases-soluble": "All bases must be soluble",
  "not-an-aqueous-ion-record":
    "This record identifies a solid base, not its aqueous ion supply",
  "neither-acid-nor-alkali-evidence":
    "pH 7 identifies neither acidic nor alkaline solution",
  "CO2-supported": "Carbon dioxide supported by the supplied test",
  "H2-supported": "Hydrogen supported by the supplied test",
  "neutral-supported": "Approximately neutral by the supplied chart",
  "alkaline-supported": "Alkaline supported; exact pH unknown",
  "gas-identity-not-established": "Gas identity is not established",
  "heat-release-not-complete-neutrality":
    "Heat release does not prove complete neutralisation",
  "all-bubbles-hydrogen": "Any bubbles must be hydrogen",
  "warming-proves-pH 7": "Warming proves final pH 7",
  "not-determined": "pH not determined by this record",
  "approximately-7": "Approximately pH 7",
  "not-exactly-determined": "Exact pH not determined",
  "exactly-12": "Exactly pH 12",
};
const fields: Record<AcidMode, [string, string][]> = {
  pairs: [
    ["acidRemaining", "Your final H+ units remaining"],
    ["alkaliRemaining", "Your final OH− units remaining"],
    ["classification", "Your final solution classification"],
  ],
  products: [
    ["family", "Your other reactant family"],
    ["gas", "Your gas product"],
    ["water", "Your water product"],
  ],
  salts: [
    ["name", "Your salt name"],
    ["formula", "Your salt formula"],
  ],
  identity: [
    ["kind", "Your substance classification"],
    ["ion", "Your supplied acid or alkali ion evidence"],
  ],
  evidence: [
    ["conclusion", "Your supported conclusion"],
    ["ph", "Your pH conclusion"],
  ],
};
const headings: Record<AcidMode, string> = {
  pairs: "Consume a reacting pair",
  products: "Distinguish reaction products",
  salts: "Build the salt identity",
  identity: "Distinguish acid, base and alkali",
  evidence: "Use the supplied evidence",
};
const hints: Record<AcidMode, string> = {
  pairs:
    "Consume one H+ and one OH− per reacting pair. Stop when either supplied reactant runs out; predict excess units rather than electrical net charge. Exact pH cannot be calculated from this illustrative inventory.",
  products:
    "Use the other reactant's family. Reactive metal gives hydrogen; oxide/hydroxide gives salt and water; carbonate additionally gives carbon dioxide. These are the supplied ordinary cases, not a rule for nitric acid with every metal.",
  salts:
    "The acid supplies chloride, nitrate or sulfate; the other reactant supplies the positive ion. Both salt name and formula must match. Balance charges and keep a polyatomic ion together.",
  identity:
    "Aqueous acid supplies H+; an alkali is a soluble base supplying OH−. An insoluble oxide can be a base without being an alkali. Use supplied pH and solubility evidence.",
  evidence:
    "Use the identified gas test or the supplied indicator chart. Bubbles alone do not identify a gas; litmus does not give exact pH; temperature rise alone does not establish complete neutralisation.",
};
export function AcidWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: AcidMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialAcidBoard(mode),
    key = String(b.record),
    records = acidRecords[mode] as Record<string, { label: string }>,
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
    onChange([
      ...history,
      {
        ...b,
        [field]: value,
        ...(mode === "pairs" && field === "record" ? { steps: "0" } : {}),
      },
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
        {acidChoices[mode][field].map((v) => (
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
  function check() {
    const p = acidPrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete every prediction before checking."
        : p.correct
          ? `That's right. ${Object.entries(acidExpected(mode, b))
              .map(
                ([k, v]) =>
                  `${k === "steps" ? "Pairs reacted" : fields[mode].find(([f]) => f === k)?.[1]}: ${labels[v] ?? v}`,
              )
              .join("; ")}.`
          : `Not yet. ${hints[mode]}`,
    );
  }
  return (
    <section
      className="model task-workbench acid-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "pairs" &&
        (() => {
          const r = acidRecords.pairs[key as keyof typeof acidRecords.pairs],
            steps = Number(b.steps),
            limit = Math.min(r.acid, r.alkali);
          return (
            <div className="acid-pair-inventory">
              <button
                className="button particle-choice"
                disabled={steps >= limit}
                onClick={() => change("steps", String(steps + 1))}
              >
                React one H+ / OH− pair
              </button>
              <dl>
                <div>
                  <dt>H+ units remaining now</dt>
                  <dd>{r.acid - steps}</dd>
                </div>
                <div>
                  <dt>OH− units remaining now</dt>
                  <dd>{r.alkali - steps}</dd>
                </div>
                <div>
                  <dt>Additional H2O units formed</dt>
                  <dd>{steps}</dd>
                </div>
              </dl>
              <p>
                One reacting pair forms one additional water unit in the GCSE
                shorthand. Atoms are retained in water. Counts omit ordinary
                water background and counterions; they are not the complete
                solution’s electrical charge or an exact pH calculation.
              </p>
            </div>
          );
        })()}
      <div className="metal-predictions">
        {fields[mode].map(([f, l]) => select(f, l))}
      </div>
      {select("record", "Explore a supplied acid reaction record")}
      <p className="metal-record">{records[key].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing the model
        explores another supplied case.
      </p>
      {mode === "pairs" && key === "initial" && <Neutralisation3D />}
      {mode === "pairs" && key !== "initial" && (
        <p>
          Use this record’s supplied reactive counts. The initial reference 3D
          shows one hydrated NaCl-forming pair; it is not a model of this
          changed inventory.
        </p>
      )}
      {mode === "salts" && (
        <p>
          Chloride Cl−, nitrate NO3− and sulfate SO4²− retain their ion
          identities. A dissolved salt contains separate ions; writing its
          formula does not mean it forms separate salt molecules in water.
        </p>
      )}
      {mode === "evidence" && (
        <p>
          These are supplied teacher-observed records for interpretation. Gas
          tests and chemical reactions require qualified school supervision;
          this activity gives no procedure to perform them.
        </p>
      )}
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
          Strong/weak-acid calculations, detailed pH teaching, soluble-salt
          preparation and titration need their separate lessons. This activity
          does not certify practical or exam readiness.
        </p>
      </details>
    </section>
  );
}
