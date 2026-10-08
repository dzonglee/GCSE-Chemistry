"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  economyChoices,
  initialEconomyBoard,
  economyPrediction,
  economyEquations,
  type EconomyMode,
} from "@/lib/atom-economy";
import { EconomyAllocation3D } from "./EconomyAllocation3D";
export function EconomyWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: EconomyMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialEconomyBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [show3D, setShow3D] = useState(false);
  const change = (key: string, value: string | number) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [key]: value }]);
  };
  const labels: Record<string, string> = {
    CaO: "Calcium oxide",
    CO2: "Carbon dioxide",
    H2O: "Water",
    both: "Both products",
    byproduct: "In the other product",
    destroyed: "Atoms destroyed",
    lostmass: "Mass disappeared",
  };
  const select = (label: string, key: string, numeric = false, unit = "") => (
    <label className={key === "fate" ? "economy-reason" : undefined}>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {(economyChoices[mode] as Record<string, readonly (string | number)[]>)[
          key
        ].map((v) => (
          <option key={v} value={v}>
            {v === "unset" ? "Predict" : (labels[String(v)] ?? `${v}${unit}`)}
          </option>
        ))}
      </select>
    </label>
  );
  const result = economyPrediction(mode, b),
    equation =
      mode === "weighted"
        ? economyEquations.copper
        : mode === "desired"
          ? economyEquations.carbonate
          : mode === "contrast"
            ? economyEquations.addition
            : economyEquations.methane;
  const value = (key: string) => (b[key] === "unset" ? null : Number(b[key]));
  const rows =
    mode === "contrast"
      ? [
          {
            label: "Supplied theoretical product / g",
            value: 30,
            student: false,
          },
          {
            label: "Collected product / g",
            value: Number(b.actual),
            student: false,
          },
        ]
      : [
          {
            label: "Equation reactant total",
            value: result.total,
            student: false,
          },
          {
            label: "Your desired contribution",
            value: value(mode === "partition" ? "useful" : "numerator"),
            student: true,
          },
          {
            label: "Your denominator",
            value: value("denominator"),
            student: true,
          },
        ];
  if (mode === "partition")
    rows.push({
      label: "Your other-product contribution",
      value: value("other"),
      student: true,
    });
  const factor = mode === "desired" ? Number(b.scale) : 1;
  const equationLabel = [
    ...[equation.reactants, equation.products].map((terms) =>
      terms
        .map(
          (t) =>
            `${t.coefficient * factor === 1 ? "" : t.coefficient * factor}${t.formula}`,
        )
        .join(" + "),
    ),
  ].join(" → ");
  const axisY = rows.length * 52 + 30;
  const maximum = Math.max(1, ...rows.map((r) => r.value ?? 0));
  return (
    <section
      className="model task-workbench economy-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">
        {mode === "weighted" ? <strong>{equationLabel}</strong> : instruction}
      </p>
      {mode !== "weighted" && (
        <p className="economy-equation">
          <strong>{equationLabel}</strong>
          {mode === "desired" && Number(b.scale) !== 1 && (
            <> — every coefficient multiplied by {b.scale}</>
          )}
        </p>
      )}
      {mode === "weighted" && (
        <>
          <p className="economy-relative-masses">
            Mr(CuO) = 79.5; Ar(C) = 12; Ar(Cu) = 63.5.
          </p>
          <div className="economy-fields">
            {select("Your copper contribution", "numerator")}
            {select("Your reactant total", "denominator")}
            {select("Your atom economy", "percentage", false, "%")}
          </div>
        </>
      )}
      {mode === "desired" && (
        <>
          <div className="economy-fields">
            {select("Desired product", "desired")}
            {select("Whole equation scale", "scale", true, "×")}
          </div>
          <p>
            Relative masses: CaCO3 100; CaO 56; CO2 44. Multiply every
            coefficient by the same selected scale.
          </p>
          <div className="economy-fields">
            {select("Your desired contribution", "numerator")}
            {select("Your reactant total", "denominator")}
            {select("Your atom economy", "percentage", false, "%")}
          </div>
        </>
      )}
      {mode === "contrast" && (
        <>
          <div className="economy-fields">
            {select("Actual collected ethane", "actual", true, " g")}
          </div>
          <p>
            Relative masses: C2H4 28; H2 2; C2H6 30. Supplied theoretical
            ethane: 30 g. Collection can vary while this equation stays fixed.
          </p>
          <div className="economy-fields">
            {select("Your atom economy", "economy", false, "%")}
            {select("Your collected percentage yield", "yield", false, "%")}
          </div>
        </>
      )}
      {mode === "partition" && (
        <>
          <div className="economy-fields">
            {select("Desired product", "desired")}
          </div>
          <p>
            Relative masses: CH4 16; O2 32; CO2 44; H2O 18. Keep both O2 and
            both waters.
          </p>
          <div className="economy-fields">
            {select("Your desired contribution", "useful")}
            {select("Your other-product contribution", "other")}
            {select("Your reactant total", "denominator")}
            {select("Your atom economy", "percentage", false, "%")}
            {select("Where are the other atoms?", "fate")}
          </div>
        </>
      )}
      <svg
        className="economy-mass-chart"
        viewBox={`0 0 420 ${rows.length * 52 + 79}`}
        role="img"
        aria-label={rows
          .map(
            (r) => `${r.label}: ${r.value === null ? "not entered" : r.value}`,
          )
          .join("; ")}
      >
        {rows.map((r, i) => (
          <g key={r.label}>
            <text x="20" y={26 + i * 52}>
              {r.label}
            </text>
            <text x="400" y={26 + i * 52} textAnchor="end">
              {r.value === null ? "?" : r.value}
            </text>
            <rect
              x="20"
              y={34 + i * 52}
              width="380"
              height="16"
              fill="#e9edf6"
            />
            {r.value !== null && (
              <rect
                x="20"
                y={34 + i * 52}
                width={(r.value / maximum) * 380}
                height="16"
                fill={r.student ? "#c7972a" : "#3345c8"}
              />
            )}
          </g>
        ))}
        <line x1="20" x2="400" y1={axisY} y2={axisY} stroke="currentColor" />
        <text x="20" y={axisY + 18}>
          0
        </text>
        <text x="400" y={axisY + 18} textAnchor="end">
          {maximum}
        </text>
        <text x="210" y={axisY + 36} textAnchor="middle">
          {mode === "contrast"
            ? "Product mass / g"
            : "Relative mass contribution"}
        </text>
      </svg>
      <p className="position-caption">
        Blue: supplied equation total or product mass. Gold: your proposed
        contribution or denominator, retained when wrong.{" "}
        {mode === "contrast"
          ? "Both bars use grams of the same product."
          : "Equation contributions are relative masses, not measured grams or atom counts. All bars use the same scale."}
      </p>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            setCorrect(result.correct);
            setFeedback(
              result.correct ? result.feedback : `Not yet. ${result.feedback}`,
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
          role="status"
          className={`feedback ${correct ? "correct" : "retry"}`}
        >
          {feedback}
        </p>
      )}
      {mode === "partition" && (
        <>
          <button
            className="button"
            aria-expanded={show3D}
            onClick={() => setShow3D((v) => !v)}
          >
            {show3D
              ? "Hide molecular allocation in 3D"
              : "Inspect molecular allocation in 3D"}
          </button>
          <p className="position-caption">
            The actual asset shows complete CH4, O2, CO2 and H2O molecules with
            unchanged element totals. Selected-product frames mark allocation;
            balls are not a mass scale.
          </p>
          {show3D && (
            <EconomyAllocation3D
              key={String(b.desired)}
              desired={b.desired as "CO2" | "H2O"}
            />
          )}
        </>
      )}
      <details>
        <summary>About this model</summary>
        <p>
          Atom economy = coefficient-weighted relative mass of the specified
          desired product ÷ total coefficient-weighted relative mass of all
          reactants × 100. The balanced equation also conserves the total across
          all products. Actual collection has its own theoretical-product
          denominator for yield. Selection or scaling does not create or destroy
          atoms.
        </p>
      </details>
    </section>
  );
}
