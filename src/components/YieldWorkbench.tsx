"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialYieldBoard,
  yieldChoices,
  yieldPrediction,
  yieldSamples,
  actualYieldSamples,
  reverseYieldSamples,
  type YieldMode,
} from "@/lib/percentage-yield";
import { YieldRecovery3D } from "./YieldRecovery3D";
export function YieldWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: YieldMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialYieldBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [show3D, setShow3D] = useState(false);
  const change = (key: string, v: string | number) => {
    if (b[key] === v) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [key]: v }]);
  };
  const names: Record<string, string> = {
    standard: "15 g /20 g",
    mixedUnits: "900 g /1.2 kg",
    none: "0 g /20 g",
    complete: "20 g /20 g",
    first: mode === "actual" ? "20 g; 75%" : "18 g; 60%",
    second: mode === "actual" ? "50 g; 60%" : "12 g; 80%",
    kilograms: "1.5 kg; 80%",
    remains: "Retained in apparatus",
    destroyed: "Atoms were destroyed",
    "extra-atoms": "New atoms appeared",
  };
  const select = (label: string, key: string, unit = "", numeric = false) => (
    <label
      className={key === "interpretation" ? "yield-interpretation" : undefined}
    >
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {(yieldChoices[mode] as Record<string, readonly (string | number)[]>)[
          key
        ].map((v) => (
          <option key={v} value={v}>
            {v === "unset" ? "Predict" : (names[String(v)] ?? `${v}${unit}`)}
          </option>
        ))}
      </select>
    </label>
  );
  const d =
      mode === "fraction"
        ? yieldSamples[b.sample as keyof typeof yieldSamples]
        : null,
    a =
      mode === "actual"
        ? actualYieldSamples[b.sample as keyof typeof actualYieldSamples]
        : null,
    r =
      mode === "reverse"
        ? reverseYieldSamples[b.sample as keyof typeof reverseYieldSamples]
        : null;
  const predicted = (key: string) =>
    b[key] === "unset" ? null : Number(b[key]);
  const rows =
    mode === "fraction"
      ? [
          { label: "Actual product", value: d!.actual, student: false },
          {
            label: "Theoretical product",
            value: d!.theoretical,
            student: false,
          },
          {
            label: "Your denominator",
            value: predicted("theoretical"),
            student: true,
          },
        ]
      : mode === "actual"
        ? [
            {
              label: "Theoretical product",
              value: a!.theoretical,
              student: false,
            },
            {
              label: "Your actual product",
              value: predicted("mass"),
              student: true,
            },
          ]
        : mode === "reverse"
          ? [
              { label: "Actual product", value: r!.actual, student: false },
              {
                label: "Your theoretical mass",
                value: predicted("theoretical"),
                student: true,
              },
            ]
          : [
              { label: "Formed product", value: 20, student: false },
              {
                label: "Your collected mass",
                value: predicted("collected"),
                student: true,
              },
              {
                label: "Your retained mass",
                value: predicted("unrecovered"),
                student: true,
              },
            ];
  const max = Math.max(1, ...rows.map((row) => row.value ?? 0));
  return (
    <section
      className="model task-workbench yield-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      {mode === "fraction" && (
        <>
          <div className="yield-fields">
            {select("Supplied product report", "sample")}
          </div>
          <p>
            <strong>{d!.label}.</strong> The supplied starting reactant mass is{" "}
            {d!.reactantMass} g. Use matching product units; the denominator
            represents 100% possible product.
          </p>
          <div className="yield-fields">
            {select("Your actual product mass", "actual", " g")}
            {select("Your theoretical product mass", "theoretical", " g")}
            {select("Your percentage yield", "percentage", "%")}
          </div>
          <p className="inventory-readout">
            Your fraction: {b.actual === "unset" ? "?" : b.actual} g ÷{" "}
            {b.theoretical === "unset" ? "?" : b.theoretical} g ×100. Your
            percentage:{" "}
            {b.percentage === "unset" ? "not entered" : `${b.percentage}%`}.
          </p>
        </>
      )}
      {mode === "actual" && (
        <>
          <div className="yield-fields">
            {select("Supplied yield report", "sample")}
          </div>
          <p>
            <strong>{a!.label}.</strong> Predict actual product in grams.
          </p>
          <div className="yield-fields">
            {select("Your decimal yield factor", "factor")}
            {select("Your actual product mass", "mass", " g")}
          </div>
          <p>
            Actual mass = theoretical mass × yield factor. Keep the requested
            unit.
          </p>
        </>
      )}
      {mode === "reverse" && (
        <>
          <div className="yield-fields">
            {select("Supplied reverse report", "sample")}
          </div>
          <p>
            <strong>{r!.label}.</strong> Actual mass is the stated fraction of
            an unknown 100% amount.
          </p>
          <div className="yield-fields">
            {select("Your decimal yield factor", "factor")}
            {select("Your theoretical product mass", "theoretical", " g")}
          </div>
          <p>
            Theoretical mass = actual mass ÷ yield factor. This uses a supplied
            percentage, not a reactant/equation calculation.
          </p>
        </>
      )}
      {mode === "collection" && (
        <>
          <p>
            All 20 g theoretical product forms, as ten illustrative 2-g
            portions. The uncollected product remains in apparatus.
          </p>
          <div className="yield-fields">
            {select(
              "Number of recovered portions",
              "recovered",
              " of 10",
              true,
            )}
            {select("Your collected product mass", "collected", " g")}
            {select("Your retained product mass", "unrecovered", " g")}
            {select("Your collected percentage yield", "percentage", "%")}
            {select(
              "Your explanation of uncollected product",
              "interpretation",
            )}
          </div>
          <p>
            <strong>Supplied inventory:</strong> {b.recovered} portions
            recovered; {10 - Number(b.recovered)} retained. Each is 2 g. Predict
            all masses before checking.
          </p>
          <p className="position-caption">
            The total formed product remains 20 g. Recovery changes which
            portion is in the measured sample; no atoms are destroyed.
          </p>
        </>
      )}
      <svg
        className="yield-mass-chart"
        viewBox="0 0 400 240"
        role="img"
        aria-label={`Product mass comparison in grams. ${rows.map((row) => `${row.label}: ${row.value === null ? "not predicted" : `${row.value} g`}`).join("; ")}`}
      >
        {rows.map((row, i) => (
          <g key={row.label}>
            <text x="45" y={30 + i * 50}>
              {row.label}
            </text>
            <text x="370" y={30 + i * 50} textAnchor="end">
              {row.value === null ? "not entered" : `${row.value} g`}
            </text>
            <rect
              x="45"
              y={38 + i * 50}
              width="325"
              height="15"
              fill="#edf0f7"
            />
            {row.value !== null && (
              <rect
                x="45"
                y={38 + i * 50}
                width={(row.value / max) * 325}
                height="15"
                fill={row.student ? "#c7972a" : "#3046c8"}
              />
            )}
          </g>
        ))}
        <line x1="45" y1="183" x2="370" y2="183" stroke="currentColor" />
        <text x="45" y="205">
          0
        </text>
        <text x="370" y="205" textAnchor="end">
          {max}
        </text>
        <text x="148" y="231">
          Product mass / g
        </text>
      </svg>
      <p className="position-caption">
        Blue: supplied product mass. Gold: your prediction, retained even when
        wrong. All bars use the same gram scale; a cube or bar is not an atom
        count.
      </p>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = yieldPrediction(mode, b);
            setFeedback(result.feedback);
            setCorrect(result.correct);
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={!history.length}
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
            onChange([]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={`feedback ${correct ? "correct" : "retry"}`}
        >
          {feedback}
        </p>
      )}
      {mode === "collection" && (
        <>
          <button
            className="button secondary"
            aria-expanded={show3D}
            onClick={() => setShow3D((v) => !v)}
          >
            {show3D ? "Hide" : "Inspect"} recovery inventory in 3D
          </button>
          {show3D && (
            <YieldRecovery3D
              key={String(b.recovered)}
              recovered={Number(b.recovered)}
            />
          )}
          <p className="position-caption">
            Actual 3D retains ten identified 2-g markers across formed-product
            and final collected/apparatus views. They are macroscopic mass
            portions, not molecular particles.
          </p>
        </>
      )}
      <details>
        <summary>About this model</summary>
        <p>
          The theoretical amount is supplied. Actual and theoretical values must
          refer to the same desired product on matching pure/dry and unit bases.
          Collection loss is distinct from incomplete reaction or side
          reactions. The model assists practice; it does not certify independent
          exam performance.
        </p>
      </details>
    </section>
  );
}
