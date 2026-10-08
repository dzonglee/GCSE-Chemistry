"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialPathwayBoard,
  pathwayChoices,
  pathwayPrediction,
  pathwayOutputRecords,
  throughputRecords,
  byproductRecords,
  conditionRecords,
  decisionRoutes,
  type PathwayMode,
} from "@/lib/production-pathways";
const fields = {
  output: [
    ["a", "A collected product", " kg"],
    ["b", "B collected product", " kg"],
    ["best", "Greater collected output", ""],
  ],
  throughput: [
    ["a", "A collected output", " kg/h"],
    ["b", "B collected output", " kg/h"],
    ["best", "Greater hourly output", ""],
  ],
  byproducts: [
    ["waste", "B unsold co-product", " kg"],
    ["credit", "B sales credit", " £"],
    ["a", "A net included cost", " £"],
    ["b", "B net included cost", " £"],
    ["best", "Lower included cost", ""],
    ["economy", "Desired-product atom economy", ""],
  ],
  conditions: [
    ["equilibrium", "Supplied equilibrium yield", "%"],
    ["rate", "Your collected output", " kg/h"],
    ["eligible", "Within the energy limit?", ""],
    ["catalyst", "Catalyst effect on equilibrium", ""],
  ],
  decision: [
    ["eligible", "Your eligible routes", ""],
    ["best", "Your route for this purpose", ""],
    ["reason", "Your decision rule", ""],
  ],
} as const;
const labels: Record<string, string> = {
  A: "Route A",
  B: "Route B",
  C: "Route C",
  BC: "Routes B and C",
  ABC: "All three routes",
  none: "No route",
  yes: "Yes",
  no: "No",
  same: "Unchanged",
  higher: "Higher",
  lower: "Lower",
  unchanged: "Unchanged",
  increased: "Increased",
  decreased: "Decreased",
  objective: "Meet constraints, then compare the stated objective",
  largestEconomy: "Always take the largest economy percentage",
  averagePercentages: "Average the supplied percentages",
  economy: "Highest atom economy",
  rate: "Greatest collected kg/h",
};
export function PathwayWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: PathwayMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialPathwayBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const result = pathwayPrediction(mode, b);
  const recordLabels: Record<string, { label: string }> =
    mode === "output"
      ? pathwayOutputRecords
      : mode === "throughput"
        ? throughputRecords
        : mode === "byproducts"
          ? byproductRecords
          : conditionRecords;
  const change = (key: string, value: string) => {
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
  const select = (key: string, label: string, unit = "") => (
    <label>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) => change(key, e.target.value)}
      >
        {(pathwayChoices[mode] as Record<string, readonly string[]>)[key].map(
          (v) => (
            <option key={v} value={v}>
              {v === "unset"
                ? "Predict"
                : key === "record"
                  ? recordLabels[v].label
                  : (labels[v] ??
                    (unit.trim() === "£" ? `£${v}` : `${v}${unit}`))}
            </option>
          ),
        )}
      </select>
    </label>
  );
  const value = (key: string) => (b[key] === "unset" ? null : Number(b[key]));
  const chart = (
    title: string,
    unit: string,
    rows: { label: string; value: number | null; student: boolean }[],
    fixedMaximum?: number,
  ) => {
    const maximum = Math.max(
        fixedMaximum ?? 1,
        ...rows.map((r) => r.value ?? 0),
      ),
      axisY = rows.length * 52 + 30;
    return (
      <figure className="pathway-chart">
        <figcaption>{title}</figcaption>
        <svg
          viewBox={`0 0 420 ${rows.length * 52 + 79}`}
          role="img"
          aria-label={`${title}. ${rows.map((r) => `${r.label}: ${r.value === null ? "not entered" : r.value} ${unit}`).join("; ")}`}
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
            {unit}
          </text>
        </svg>
      </figure>
    );
  };
  const output =
      pathwayOutputRecords[b.record as keyof typeof pathwayOutputRecords],
    throughput = throughputRecords[b.record as keyof typeof throughputRecords],
    byproduct = byproductRecords[b.record as keyof typeof byproductRecords],
    condition = conditionRecords[b.record as keyof typeof conditionRecords];
  return (
    <section
      className="model task-workbench pathway-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">
        <strong>
          {mode === "output"
            ? "Equal reactant feeds"
            : mode === "throughput"
              ? "Use complete batch times"
              : mode === "byproducts"
                ? "Compare costs for 100 kg desired product"
                : mode === "conditions"
                  ? "Given condition records; 25 kWh/kg limit"
                  : "Require at least 30 kg/h"}
        </strong>
      </p>
      {mode === "output" && (
        <div className="pathway-fields">
          {fields.output.slice(0, 2).map(([key, label, unit]) => (
            <span key={key}>{select(key, label, unit)}</span>
          ))}
        </div>
      )}
      {mode === "decision" ? (
        <div className="pathway-fields">
          {select("energy", "Maximum energy", " kWh/kg")}
          {select("goal", "Purpose of this comparison")}
        </div>
      ) : (
        <div className="pathway-fields">
          {select("record", "Process record")}
        </div>
      )}
      {mode !== "decision" && (
        <p className="pathway-selected">
          <strong>{recordLabels[String(b.record)].label}.</strong>
        </p>
      )}
      {mode === "output" && (
        <p className="pathway-record">
          A: maximum {output.aTheory} kg, collected yield {output.aYield}%, atom
          economy 80%. B: maximum {output.bTheory} kg, yield {output.bYield}%,
          economy 60%. These are supplied records for reactants in
          balanced-equation proportions for the same desired product. Actual
          inventory locations are not given.
        </p>
      )}
      {mode === "throughput" && (
        <p className="pathway-record">
          A: {throughput.aMass} kg dry product in {throughput.aTime} h. B:{" "}
          {throughput.bMass} kg in {throughput.bTime} h. Times include reaction
          and separation. Repeated batches have no additional downtime in this
          supplied record.
        </p>
      )}
      {mode === "byproducts" && (
        <p className="pathway-record">
          A: £120 base costs; 10 kg other product, all disposed at £2/kg. B:
          £130 base costs; 25 kg other product; sell {byproduct.sold} kg at
          £3/kg and dispose of the rest at £2/kg. Each makes 100 kg desired
          product. Base costs include all other costs for this calculation.
        </p>
      )}
      {mode === "conditions" && (
        <p className="pathway-record">
          Supplied equilibrium yield {condition.equilibrium}%. Actual collected
          product {condition.mass} kg in {condition.time} h per complete batch;
          energy {condition.energy} kWh/kg. Repeated batches have no added
          downtime. The warmer record and its catalysed version both have 45%
          equilibrium yield.
        </p>
      )}
      {mode === "decision" && (
        <p className="pathway-selected">
          <strong>
            Purpose:{" "}
            {b.goal === "economy"
              ? "highest atom economy"
              : "greatest collected output per hour"}{" "}
            among eligible routes.
          </strong>{" "}
          Minimum output 30 kg/h; maximum energy {b.energy} kWh/kg.
        </p>
      )}
      {mode === "decision" && (
        <div className="pathway-records">
          {decisionRoutes.map((r) => (
            <div key={r.id}>
              <strong>Route {r.id}</strong>
              <p>
                Atom economy {r.economy}%; collected yield {r.yield}%. Output{" "}
                {r.rate} kg/h; energy {r.energy} kWh/kg.
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="pathway-fields">
        {fields[mode]
          .slice(mode === "output" ? 2 : 0)
          .map(([key, label, unit]) => (
            <span
              className={key === "reason" ? "pathway-wide" : undefined}
              key={key}
            >
              {select(key, label, unit)}
            </span>
          ))}
      </div>
      <p className="position-caption">
        The answer task uses the quantities stated in its question. Changing
        this model explores another comparison.
      </p>
      {mode === "output" &&
        chart(
          "Constructed maximum and collected prediction",
          "Desired product / kg",
          [
            {
              label: "A supplied maximum",
              value: output.aTheory,
              student: false,
            },
            {
              label: "A your collected amount",
              value: value("a"),
              student: true,
            },
            {
              label: "B supplied maximum",
              value: output.bTheory,
              student: false,
            },
            {
              label: "B your collected amount",
              value: value("b"),
              student: true,
            },
          ],
        )}
      {mode === "throughput" &&
        chart("Your comparable hourly output", "Collected output / kg/h", [
          { label: "Route A prediction", value: value("a"), student: true },
          { label: "Route B prediction", value: value("b"), student: true },
        ])}
      {mode === "byproducts" &&
        chart(
          "Your included net cost for equal product",
          "Net cost / £ per 100 kg product",
          [
            { label: "Route A prediction", value: value("a"), student: true },
            { label: "Route B prediction", value: value("b"), student: true },
          ],
        )}
      {mode === "conditions" && (
        <>
          {chart(
            "Your equilibrium reading",
            "Equilibrium yield / %",
            [
              {
                label: "Supplied equilibrium",
                value: condition.equilibrium,
                student: false,
              },
              {
                label: "Your stated percentage",
                value: value("equilibrium"),
                student: true,
              },
            ],
            100,
          )}
          {chart(
            "Your production-rate calculation",
            "Collected output / kg/h",
            [
              {
                label: "Your collected hourly output",
                value: value("rate"),
                student: true,
              },
            ],
          )}
        </>
      )}
      {mode === "decision" && (
        <p className="position-caption">
          The percentages, kg/h and kWh/kg measure different things. Apply both
          stated limits before choosing a route for this purpose; there is no
          combined score or automatic environmental verdict.
        </p>
      )}
      {mode !== "decision" && (
        <p className="position-caption">
          Blue: supplied quantities. Gold: your predictions, retained when
          wrong. Each chart compares only its labelled quantity and unit.
          Equilibrium percentage and kg/h use separate axes.
        </p>
      )}
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
          className={`feedback ${correct ? "correct" : "retry"}`}
          role="status"
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>About this comparison</summary>
        <p>
          {instruction} State the purpose, compare on a matching basis and
          respect any required limits. These original supplied process records
          support a limited decision. They do not prove an overall safest,
          cheapest or most sustainable industrial process. Useful by-products,
          hazards, energy, recovery, sale demand and included costs require
          evidence.
        </p>
      </details>
    </section>
  );
}
