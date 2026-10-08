"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialPhBoard,
  phChoices,
  phExpected,
  phPrediction,
  phRecords,
  universalChart,
  type PhMode,
} from "@/lib/ph-evidence";
import { PhProbe3D } from "./PhProbe3D";
import { PhMeasurements } from "./PhMeasurements";
const labels: Record<string, string> = {
  unset: "Predict",
  acidic: "Acidic",
  neutral: "Neutral",
  alkaline: "Alkaline",
  "H+": "Hydrogen ions in excess",
  "OH−": "Hydroxide ions in excess",
  balanced: "Neither in excess; neutral solution still has both",
  none: "No ions are present",
  approximate: "Approximate estimate from a colour chart",
  "exact-every-time": "Exact numerical pH from colour alone",
  red: "Red",
  yellow: "Yellow",
  pink: "Pink",
  blue: "Blue",
  purple: "Purple",
  colourless: "Colourless",
  green: "Green",
  yes: "Yes: the supplied pH is neutral",
  no: "No: the supplied pH is not neutral",
  "not-established": "Neutrality is not established by this colour",
  matched: "Neutral point: neither reactant in excess",
  "no-ions": "No ions of any kind are present",
  "reported-reading": "Report the supplied numerical probe reading",
  "approx-range": "Report an approximate chart range",
  "acidic-only": "Acidic response without a numerical pH",
  "accuracy-unchecked": "Accuracy needs checking or remains unestablished",
  "exact-from-colour": "Report exact pH from colour alone",
  "checked-reference": "Reference-buffer checks agree",
  "chart-range": "The colour maps to an approximate range",
  "failed-reference": "The known reference reading disagrees",
  "repeat-not-accuracy": "Repeats alone do not establish accuracy",
  "limited-indicator": "The named indicator does not provide an exact number",
  "digits-prove-accuracy": "More displayed digits prove accuracy",
};
const heading: Record<PhMode, string> = {
  classification: "Read pH",
  colour: "Match the supplied colour chart",
  indicator: "Use the named indicator",
  neutralisation: "Read the neutralisation data",
  measurement: "Evaluate measurement evidence",
};
const fields: Record<PhMode, [string, string][]> = {
  classification: [["ions", "Your acid/alkali ion comparison"]],
  colour: [["certainty", "Your reading confidence"]],
  indicator: [
    ["colour", "Your indicator colour"],
    ["neutrality", "Does the supplied evidence establish neutrality?"],
  ],
  neutralisation: [["excess", "Your neutralisation reactant excess"]],
  measurement: [
    ["decision", "Your measurement conclusion"],
    ["reason", "Your evidence reason"],
  ],
};
export function PhWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: PhMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialPhBoard(mode),
    key = String(b.record),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    records = phRecords[mode] as Record<string, { label: string }>;
  const classification =
    mode === "classification"
      ? phRecords.classification[key as keyof typeof phRecords.classification]
      : null;
  const colour =
    mode === "colour"
      ? phRecords.colour[key as keyof typeof phRecords.colour]
      : null;
  const indicator =
    mode === "indicator"
      ? phRecords.indicator[key as keyof typeof phRecords.indicator]
      : null;
  const experiment =
    mode === "neutralisation"
      ? phRecords.neutralisation[key as keyof typeof phRecords.neutralisation]
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
        ? { ...initialPhBoard(mode), record: value }
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
        {phChoices[mode][field].map((v) => (
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
  const classify = () => (
    <div
      className="ph-classification"
      role="group"
      aria-label="Your pH classification"
    >
      {["acidic", "neutral", "alkaline"].map((v) => (
        <button
          key={v}
          className="button particle-choice"
          aria-pressed={b.classification === v}
          onClick={() => change("classification", v)}
        >
          {labels[v]}
        </button>
      ))}
    </div>
  );
  function check() {
    const p = phPrediction(mode, b),
      expected = phExpected(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete each prediction before checking."
        : p.correct
          ? "That’s right. " +
            Object.entries(expected)
              .map(([k, v]) => k + ": " + (labels[v] ?? v))
              .join("; ") +
            (colour
              ? ". Your chosen approximate pH " +
                b.guess +
                " matches the supplied band."
              : "")
          : "Your proposed answer is retained. " +
            (mode === "classification"
              ? "Compare the supplied reading with 7 at 25 °C. Neutral does not mean no ions."
              : mode === "colour"
                ? "Match the supplied colour band and choose an approximate estimate; do not invent decimal precision."
                : mode === "indicator"
                  ? "Use this named indicator's response. Colourless phenolphthalein does not by itself establish neutrality."
                  : mode === "neutralisation"
                    ? "Read the selected measured pH. After the neutral point, additional alkali may remain in excess."
                    : "A known-reference check supports accuracy; digits or repeat agreement alone do not."),
    );
  }
  return (
    <section
      className="model task-workbench ph-workbench"
      aria-label="Task model"
    >
      <h3>{heading[mode]}</h3>
      {mode !== "classification" && <p>{instruction}</p>}
      {classification && (
        <>
          <p className="model-readout">
            Supplied pH: <strong>{classification.ph.toFixed(1)}</strong> at 25
            °C.
          </p>
          {classify()}
        </>
      )}
      {colour && (
        <>
          <p>
            Supplied observation: <strong>{colour.colour}</strong>.
          </p>
          <div className="electrolysis-ion-controls">
            <button
              className="button particle-choice"
              disabled={Number(b.guess) <= 0}
              onClick={() => change("guess", String(Number(b.guess) - 1))}
            >
              ← Decrease guess by 1
            </button>
            <button
              className="button particle-choice"
              disabled={Number(b.guess) >= 14}
              onClick={() => change("guess", String(Number(b.guess) + 1))}
            >
              Increase guess by 1 →
            </button>
          </div>
          <p>
            Your pH guess: <strong>{String(b.guess)}</strong>
          </p>
          {classify()}
        </>
      )}
      {experiment && (
        <>
          <div className="electrolysis-ion-controls">
            <button
              className="button particle-choice"
              disabled={Number(b.point) <= 0}
              onClick={() => change("point", String(Number(b.point) - 1))}
            >
              ← Previous observation
            </button>
            <button
              className="button particle-choice"
              disabled={Number(b.point) >= 6}
              onClick={() => change("point", String(Number(b.point) + 1))}
            >
              Next observation →
            </button>
          </div>
          <p>
            Selected measurement:{" "}
            <strong>
              {experiment.amounts[Number(b.point)]} {experiment.unit}
            </strong>
            ; pH <strong>{experiment.ph[Number(b.point)]}</strong>.
          </p>
          {classify()}
        </>
      )}
      {select("record", "Explore a supplied pH record")}
      <p className="metal-record">{records[key].label}.</p>
      {fields[mode].map(([f, l]) => select(f, l))}
      {colour && (
        <table className="ph-colour-chart">
          <caption>
            Supplied illustrative universal-indicator chart: approximate colour
            bands
          </caption>
          <thead>
            <tr>
              <th scope="col">Colour</th>
              <th scope="col">pH region</th>
            </tr>
          </thead>
          <tbody>
            {universalChart.map((row) => (
              <tr key={row.colour}>
                <td>
                  <span
                    className="ph-swatch"
                    style={{ background: row.hex }}
                    aria-hidden="true"
                  />
                  {row.colour}
                </td>
                <td>
                  {row.min === row.max
                    ? "Near " + row.min
                    : row.min + "–" + row.max}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {indicator && (
        <p>
          Reference examples at supplied pH 2/7/12: litmus red/purple/blue;
          methyl orange red/yellow/yellow; phenolphthalein
          colourless/colourless/pink. Different indicators have different change
          intervals. Colourless phenolphthalein and yellow methyl orange do not
          prove pH 7.
        </p>
      )}
      {experiment && (
        <PhMeasurements
          quantity={experiment.quantity}
          unit={experiment.unit}
          points={experiment.amounts.map((amount, i) => ({
            amount,
            ph: experiment.ph[i],
          }))}
          marker={Number(b.point)}
        />
      )}
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
            onChange([initialPhBoard(mode)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <div
          className={"feedback " + (correct ? "correct" : "retry")}
          role="status"
        >
          {feedback}
        </div>
      )}
      {classification && (
        <PhProbe3D key={classification.ph} reading={classification.ph} />
      )}
      {mode === "measurement" && key === "initial" && (
        <PhProbe3D reading={5.2} />
      )}
      <details>
        <summary>About this pH model</summary>
        <p>
          All supplied samples are at 25 °C in the usual GCSE 0–14 range. pH is
          dimensionless. Indicator colours estimate readings; do not derive
          hydrogen-ion ratios by subtracting pH. Those factors and acid strength
          belong to Higher work. Graphs show original provided observations, not
          a practical performed here. The apparatus reference contains no atomic
          particles.
        </p>
      </details>
    </section>
  );
}
