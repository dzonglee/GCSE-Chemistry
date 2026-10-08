"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  strengthRecords,
  strengthChoices,
  strengthPrediction,
  strengthExpected,
  initialStrengthBoard,
  type StrengthMode,
} from "@/lib/acid-strength";
import { AcidIonisation3D } from "./AcidIonisation3D";
const labels: Record<string, string> = {
  unset: "Predict",
  strong: "Strong: complete ionisation",
  weak: "Weak: partial ionisation",
  "not-established": "Not established by supplied evidence",
  lower: "Lower acid concentration than reference",
  equal: "Equal",
  higher: "Higher acid concentration than reference",
  increases: "H+ concentration increases",
  decreases: "H+ concentration decreases",
  unchanged: "Unchanged",
  "tenfold-lower": "Tenfold lower",
  "hundredfold-lower": "Hundredfold lower",
  "thousandfold-lower": "Thousandfold lower",
  "still-strong": "Still a strong acid",
  "now-weak": "Now a weak acid",
  HCl: "HCl",
  ethanoic: "Ethanoic acid",
  A: "A",
  B: "B",
  before: "Before dilution",
  after: "After dilution",
  "equal-concentration": "Equal total acid concentration and temperature",
  "uncontrolled-concentration":
    "Total acid concentrations are different/unknown",
  "same-acid-concentration":
    "The same fully ionised monoprotic acid at different concentrations",
  "equal-ph-not-strength":
    "Equal pH gives equal H+, without establishing strength",
  "equal-concentration-not-completeness":
    "Equal acid concentration supports relative ionisation, not proof of complete ionisation",
  "fraction-can-change":
    "A weak acid's ionised fraction can change on dilution",
  "lower-ph-always-stronger": "Lower pH always proves stronger acid",
  "ph-is-linear": "pH numbers have a linear ratio with H+ concentration",
  "strength-not-established": "Acid strength is not established",
  "ph-depends-on-both":
    "pH depends on acid concentration and extent of ionisation",
  "strong-and-dilute": "Strong and dilute",
  "two-independent-descriptors":
    "Ionisation and amount per volume describe separate properties",
  "exact-ph-change-not-established": "Exact pH change is not established",
  "strong-not-two-c-guarantee":
    "Strong example; twice total concentration is not guaranteed",
  "second-dissociation-distinct":
    "Sulfuric acid's second proton dissociation is distinct",
  "acid-ionises-not-hydrogen-ions":
    "The acid ionises; do not say hydrogen ions are ionised",
  "acid-forms-ions": "The acid forms ions while atoms are conserved",
  "equal-ions-not-absent":
    "Neither acid/alkali ion is in excess; both are present",
  "neutral-not-ion-free": "Neutrality is a balance, not an absence of ions",
  "hazard-not-established":
    "Hazard ranking is not established by strength alone",
  "strength-not-hazard-ranking":
    "Strength alone is not a comparison of all sample properties",
  "ph-proves-strength": "The measured pH proves acid strength",
  "weak-always-dilute": "Weak acids must always be dilute",
  "weak-tenfold-always-plus-one":
    "Tenfold weak-acid dilution always raises pH exactly one",
  "neutral-means-no-ions": "Neutral means there are no ions",
  "strength-equals-concentration": "Strength is the same as concentration",
  "hydrogen-ions-ionise": "Hydrogen ions themselves ionise",
};
const headings: Record<StrengthMode, string> = {
  descriptors: "Separate the descriptors",
  factors: "Count tenfold changes",
  dilution: "Follow stated HCl dilution",
  comparison: "Compare controlled samples",
  evidence: "Evaluate the evidence",
};
const fields: Record<StrengthMode, [string, string][]> = {
  descriptors: [["concentration", "Your total acid concentration comparison"]],
  factors: [
    ["direction", "Your H+ concentration direction"],
    ["factor", "Your H+ concentration change factor"],
  ],
  dilution: [
    ["ph", "Your predicted final pH"],
    ["concentration", "Your total acid concentration change"],
    ["strength", "Your acid strength after dilution"],
  ],
  comparison: [
    ["hydrogen", "Which has more H+ per unit volume?"],
    ["ph", "Which has higher pH?"],
    ["reason", "Your comparison reason"],
  ],
  evidence: [
    ["claim", "Your supported claim"],
    ["reason", "Your evidence reason"],
  ],
};
export function AcidStrengthWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: StrengthMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialStrengthBoard(mode),
    key = String(b.record),
    records = strengthRecords[mode] as Record<string, { label: string }>,
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const factor =
      mode === "factors"
        ? strengthRecords.factors[key as keyof typeof strengthRecords.factors]
        : null,
    dilution =
      mode === "dilution"
        ? strengthRecords.dilution[key as keyof typeof strengthRecords.dilution]
        : null;
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
        ? initialStrengthBoard(mode, value)
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
        {strengthChoices[mode][field].map((v) => (
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
  function check() {
    const p = strengthPrediction(mode, b),
      expected = strengthExpected(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete each prediction before checking."
        : p.correct
          ? "That’s right. " +
            Object.entries(expected)
              .map(([k, v]) => k + ": " + (labels[v] ?? v))
              .join("; ")
          : "Your proposed answer is retained. " +
            (mode === "descriptors"
              ? "Strength concerns ionisation. Compare total acid amount per volume separately with the reference."
              : mode === "factors"
                ? "Reach the stated target. Lower pH means more H+; count the whole-unit difference and multiply ten for each unit, without dividing the pH numbers."
                : mode === "dilution"
                  ? "Reach the stated target dilution. At fixed amount, volume ×10 gives concentration ÷10; the stated fully ionised monoprotic HCl model raises pH by one and remains strong."
                  : mode === "comparison"
                    ? "Check whether total acid concentration and temperature are controlled. More H+ corresponds to lower pH; a relative comparison does not prove complete ionisation."
                    : "Use only the supplied evidence. Concentration, ionisation and pH are distinct; missing evidence must not be replaced with an assumption."),
    );
  }
  return (
    <section
      className="model task-workbench acid-strength-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "descriptors" ? (
        <div
          role="group"
          aria-label="Your acid strength prediction"
          className="acid-descriptors"
        >
          {["strong", "weak", "not-established"].map((v) => (
            <button
              key={v}
              className="button particle-choice"
              aria-pressed={b.strength === v}
              onClick={() => change("strength", v)}
            >
              {v === "strong"
                ? "Strong"
                : v === "weak"
                  ? "Weak"
                  : "Not established"}
            </button>
          ))}
        </div>
      ) : (
        <p>{instruction}</p>
      )}
      {factor && (
        <>
          <p className="model-readout">
            Starting pH <strong>{factor.start}</strong>; target pH{" "}
            <strong>{factor.target}</strong>. Your chosen pH:{" "}
            <strong>{String(b.ph)}</strong>.
          </p>
          <div className="electrolysis-ion-controls">
            <button
              className="button particle-choice"
              disabled={Number(b.ph) <= 0}
              onClick={() => change("ph", String(Number(b.ph) - 1))}
            >
              Lower chosen pH by 1
            </button>
            <button
              className="button particle-choice"
              disabled={Number(b.ph) >= 14}
              onClick={() => change("ph", String(Number(b.ph) + 1))}
            >
              Raise chosen pH by 1
            </button>
          </div>
          <p>
            Each downward pH unit multiplies H+ concentration by 10; each upward
            unit divides it by 10. Equal pH spacing is not equal H+
            concentration spacing.
          </p>
        </>
      )}
      {dilution && (
        <>
          <div className="electrolysis-ion-controls">
            <button
              className="button particle-choice"
              disabled={Number(b.steps) <= 0}
              onClick={() => change("steps", String(Number(b.steps) - 1))}
            >
              Select one fewer tenfold dilution
            </button>
            <button
              className="button particle-choice"
              disabled={Number(b.steps) >= 3}
              onClick={() => change("steps", String(Number(b.steps) + 1))}
            >
              Select one more tenfold dilution
            </button>
          </div>
          <p className="model-readout">
            Initial solution volume: <strong>{dilution.volume} cm³</strong>.
            Chosen total solution volume:{" "}
            <strong>{dilution.volume * 10 ** Number(b.steps)} cm³</strong>.
            Dissolved acid amount stays fixed.
          </p>
          <p>
            These controls select a supplied state, not a procedure for removing
            water. Fully ionised monoprotic HCl only; constant temperature, no
            acid loss/reaction and negligible water contribution. This shortcut
            does not apply to every weak acid or extreme dilution near
            neutrality.
          </p>
        </>
      )}
      {factor && (
        <table className="acid-factor-table">
          <caption>
            Compare tenfold changes with the starting hydrogen-ion concentration
          </caption>
          <thead>
            <tr>
              <th scope="col">pH</th>
              <th scope="col">H+ relative to the starting value</th>
            </tr>
          </thead>
          <tbody>
            {[...new Set([factor.start, factor.target, Number(b.ph)])]
              .sort((a, c) => a - c)
              .map((ph) => {
                const difference = factor.start - ph;
                const steps = Array.from(
                  { length: Math.abs(difference) },
                  () => "10",
                ).join(" × ");
                return (
                  <tr key={ph} data-chosen={ph === Number(b.ph)}>
                    <th scope="row">
                      {ph}
                      <span className="acid-factor-state">
                        {[
                          ph === factor.start ? "Start" : "",
                          ph === factor.target ? "Target" : "",
                          ph === Number(b.ph) ? "Chosen" : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </th>
                    <td>
                      {difference === 0
                        ? "Same concentration (×1)"
                        : difference > 0
                          ? steps + " times the starting H+ concentration"
                          : "1 / (" +
                            steps +
                            ") of the starting H+ concentration"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
      {select("record", "Explore supplied acid evidence")}
      <p className="metal-record">{records[key].label}.</p>
      {fields[mode].map(([field, label]) => select(field, label))}
      <p className="position-caption">
        Use the data stated in the answer question. Changing this model does not
        change that question.
      </p>
      <div className="bench-actions">
        <button className="button" onClick={check}>
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
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
            onChange([initialStrengthBoard(mode)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <div
          role="status"
          className={"feedback " + (correct ? "correct" : "retry")}
        >
          {feedback}
        </div>
      )}
      {mode === "descriptors" && key === "initial" && <AcidIonisation3D />}
      <details>
        <summary>About this acid model</summary>
        <p>
          Acid strength is degree of ionisation; concentration is dissolved
          amount per solution volume. Whole-number pH differences give
          powers-of-ten hydrogen-ion comparisons. No logarithms or Ka
          calculation is required. Records are provided evidence, not an
          experiment performed by the app. Reference concentration is a
          comparison, not a universal boundary for dilute/concentrated. The
          selected proton-transfer asset does not encode bulk pH or a weak-acid
          percentage.
        </p>
      </details>
    </section>
  );
}
