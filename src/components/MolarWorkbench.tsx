"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialMolarBoard,
  molarChoices,
  molarPrediction,
  molarRecords,
  type MolarMode,
} from "@/lib/molar-concentration";
import { MolarDilution3D } from "./MolarDilution3D";
const names: Record<string, string> = {
  "amount-over-final-volume": "Dissolved amount ÷ final solution volume",
  "amount-times-volume": "Multiply amount by volume",
  "water-volume": "Use starting water volume",
  "concentration-times-volume": "Concentration × solution volume",
  "concentration-divide-volume": "Concentration ÷ solution volume",
  "concentration-is-amount": "Concentration is already the sample amount",
  "amount-times-molar-mass": "Dissolved amount × molar mass",
  "concentration-is-grams": "Molar concentration gives grams directly",
  "molar-mass-divide-amount": "Molar mass ÷ amount",
  "grams-divide-molar-mass": "Grams per dm³ ÷ molar mass",
  "grams-times-molar-mass": "Grams per dm³ × molar mass",
  "same-number-different-unit": "Keep the number and change the unit",
  "sample-retains-c-dilution-retains-n":
    "Sampling retains concentration; dilution retains amount",
  "sampling-lowers-c": "Taking a sample lowers its concentration",
  "adding-water-removes-solute": "Adding water removes solute",
};
const fields: Record<MolarMode, readonly [string, string, string][]> = {
  concentration: [
    ["volume", "Final solution volume", "dm³"],
    ["answer", "Your concentration", "mol/dm³"],
    ["reason", "Your relationship", ""],
  ],
  amount: [
    ["volume", "Final sample volume", "dm³"],
    ["answer", "Your dissolved amount", "mol"],
    ["reason", "Your relationship", ""],
  ],
  mass: [
    ["moles", "Your solute amount", "mol"],
    ["answer", "Your solute mass", "g"],
    ["reason", "Your relationship", ""],
  ],
  units: [
    ["answer", "Your molar concentration", "mol/dm³"],
    ["reason", "Your conversion", ""],
  ],
  sampling: [
    ["moles", "Your sampled amount", "mol"],
    ["sample", "Sample concentration", "mol/dm³"],
    ["answer", "After dilution", "mol/dm³"],
    ["reason", "Your explanation", ""],
  ],
};
const headings: Record<MolarMode, string> = {
  concentration: "Amount per dm³",
  amount: "Amount in a sample",
  mass: "From moles to grams",
  units: "Change the numerator",
  sampling: "Sample, then dilute",
};
const rules: Record<MolarMode, string> = {
  concentration: "c = n ÷ V, with final solution V in dm³.",
  amount: "n = c × V, with sample V in dm³.",
  mass: "n = c × V; then solute m = n × M.",
  units: "mol/dm³ = (g/dm³) ÷ molar mass in g/mol.",
  sampling:
    "A homogeneous sample keeps c. Adding solvent retains its n and increases V.",
};
export function MolarWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: MolarMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialMolarBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const records = molarRecords[mode] as Record<string, { label: string }>;
  const change = (key: string, value: string) => {
    if (board[key] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, { ...board, [key]: value }]);
  };
  const select = (key: string, label: string, unit: string) => (
    <label key={key} className={key === "reason" ? "molar-wide" : undefined}>
      {label}
      <select
        aria-label={label}
        value={board[key]}
        onChange={(e) => change(key, e.target.value)}
      >
        {molarChoices[mode][key].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : key === "record"
                ? records[v].label
                : (names[v] ?? `${v} ${unit}`)}
          </option>
        ))}
      </select>
    </label>
  );
  const numericFields = fields[mode].filter(([, , unit]) => unit);
  const point = (() => {
    if (mode === "concentration") {
      const r =
        molarRecords.concentration[
          board.record as keyof typeof molarRecords.concentration
        ];
      return {
        x: r.volume / 1000,
        y: r.moles,
        predictionX: 1,
        label: "Your amount per 1 dm³",
      };
    }
    if (mode === "amount") {
      const r =
        molarRecords.amount[board.record as keyof typeof molarRecords.amount];
      return {
        x: 1,
        y: r.concentration,
        predictionX: r.volume / 1000,
        label: "Your sample amount",
      };
    }
    return null;
  })();
  const predicted = board.answer === "unset" ? null : Number(board.answer);
  const ymax = point ? Math.max(point.y, predicted ?? 0, 0.1) * 1.15 : 1;
  const px = (x: number) => 60 + x * 290;
  const py = (y: number) => 210 - (y / ymax) * 150;
  return (
    <section
      className="model task-workbench molar-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      <div className="molar-fields">
        {numericFields
          .slice(0, 2)
          .map(([key, label, unit]) => select(key, label, unit))}
      </div>
      {select("record", "Explore a solution record", "")}
      <p className="molar-record">{records[String(board.record)].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing this model
        explores another solution.
      </p>
      <div className="molar-fields">
        {fields[mode]
          .filter(
            ([key]) => !numericFields.slice(0, 2).some(([k]) => k === key),
          )
          .map(([key, label, unit]) => select(key, label, unit))}
      </div>
      {board.reason !== "unset" && (
        <p className="molar-selected-reason">
          Your selected relationship: {names[String(board.reason)]}.
        </p>
      )}
      <figure className="molar-working">
        <figcaption>Your predictions, retained when wrong</figcaption>
        <svg
          viewBox={`0 0 420 ${numericFields.length * 67 + 20}`}
          role="img"
          aria-label={numericFields
            .map(
              ([key, label, unit]) =>
                `${label}: ${board[key] === "unset" ? "not entered" : board[key]} ${unit}`,
            )
            .join("; ")}
        >
          {numericFields.map(([key, label, unit], i) => (
            <g key={key}>
              <text x="8" y={i * 67 + 19} fontSize="20">
                {label}
              </text>
              <text x="8" y={i * 67 + 44} fontSize="20" fill="#866219">
                {board[key] === "unset"
                  ? "Not entered"
                  : `${board[key]} ${unit}`}
              </text>
            </g>
          ))}
        </svg>
      </figure>
      {point && (
        <figure className="molar-amount-volume">
          <figcaption>
            One concentration connects amount and solution volume
          </figcaption>
          <svg
            viewBox="0 0 420 290"
            role="img"
            aria-label={`Supplied amount ${point.y} mol at ${point.x} dm³. ${point.label}: ${predicted === null ? "not entered" : `${predicted} mol at ${point.predictionX} dm³`}. Blue supplied point; gold your prediction.`}
          >
            <path d="M60 50V210H380" fill="none" stroke="#748096" />
            <text x="8" y="30" fontSize="20">
              Dissolved amount / mol
            </text>
            <text x="12" y="65" fontSize="20">
              {Number(ymax.toPrecision(3))}
            </text>
            <text x="30" y="215" fontSize="20">
              0
            </text>
            <text x="55" y="235" fontSize="20">
              0
            </text>
            <text x={px(1) - 6} y="235" fontSize="20">
              1
            </text>
            <text x="65" y="270" fontSize="20">
              Final solution volume / dm³
            </text>
            <circle cx={px(point.x)} cy={py(point.y)} r="7" fill="#4056ce" />
            {predicted !== null && (
              <>
                <path
                  d={`M60 210L${px(point.predictionX)} ${py(predicted)}`}
                  stroke="#c7972a"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx={px(point.predictionX)}
                  cy={py(predicted)}
                  r="7"
                  fill="#c7972a"
                />
              </>
            )}
          </svg>
          <p className="position-caption">
            Blue: supplied amount/volume. Gold: your prediction and its ratio
            line. A consistent concentration places both points on the same line
            through zero.
          </p>
        </figure>
      )}
      <p>{rules[mode]}</p>
      {mode === "sampling" && (
        <MolarDilution3D
          key={String(board.record)}
          dilutes={board.record !== "noDilution"}
        />
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = molarPrediction(mode, board);
            setCorrect(r.correct);
            setFeedback(
              !r.complete
                ? "Complete each prediction and choose a relationship before checking."
                : r.correct
                  ? `That's right. ${rules[mode]}`
                  : `Not yet. ${rules[mode]} Check the named solute, final volume and retained quantity.`,
            );
          }}
        >
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
          className={`feedback ${correct ? "correct" : "retry"}`}
          role="status"
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>About this model</summary>
        <p>
          {instruction} Final solution volume is used throughout. The displayed
          solute mass is not total solution mass. The selected no-water record
          keeps both represented volumes equal; dilution records double volume.
          The conserved ion counts are illustrative, not one mole.
        </p>
      </details>
    </section>
  );
}
