"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  compositionCases,
  compositionData,
  initialCompositionBoard,
  compositionPrediction,
  roundOne,
  type CompositionMode,
} from "@/lib/percentage-composition";
import { CompositionStrip } from "./CompositionStrip";
import { CompositionSampleAxis } from "./CompositionSampleAxis";
const pretty = (formula: string) =>
  formula.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
export function CompositionWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: CompositionMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialCompositionBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const change = (key: string, value: string | number) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      setCorrect(false);
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [key]: value }]);
  };
  const select = (
    label: string,
    key: string,
    values: [string | number, string][],
    numeric = false,
  ) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {values.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
  const spec =
      compositionCases[(b.compound ?? "CaCO3") as "CaCO3" | "MgO" | "CO2"],
    d = compositionData(spec.formula, spec.ar, spec.element);
  return (
    <section
      className="model task-workbench composition-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "contribution" && (
          <>
            {select("Compound and named element", "compound", [
              ["CaCO3", "Ca in CaCO₃"],
              ["MgO", "Mg in MgO"],
              ["CO2", "O in CO₂"],
            ])}
            {select("Your element mass contribution", "numerator", [
              ["unset", "Predict numerator"],
              ...["40", "24", "32", "16", "48", "12", "1", "2", "3"].map(
                (v) => [v, v] as [string, string],
              ),
            ])}
            {select("Your complete compound Mᵣ", "denominator", [
              ["unset", "Predict denominator"],
              ...["100", "40", "44", "60", "80", "132", "5", "3", "2"].map(
                (v) => [v, v] as [string, string],
              ),
            ])}
            {select("Your mass percentage", "percent", [
              ["unset", "Predict percent"],
              ...["40", "60", "72.7", "20", "50", "66.7", ".4"].map(
                (v) => [v, `${Number(v)}%`] as [string, string],
              ),
            ])}
          </>
        )}
        {mode === "count-mass" && (
          <>
            {select("Compare a compound", "compound", [
              ["MgO", "Mg in MgO"],
              ["CO2", "O in CO₂"],
            ])}
            {select("Basis for percentage by mass", "basis", [
              ["unset", "Choose basis"],
              ["mass", "Count × Aᵣ contributions"],
              ["count", "Atom numbers alone"],
            ])}
            {select("Your mass percentage", "percent", [
              ["unset", "Predict percent"],
              ...["60", "72.7", "50", "66.7", "40"].map(
                (v) => [v, `${Number(v)}%`] as [string, string],
              ),
            ])}
          </>
        )}
        {mode === "sample" && (
          <>
            {select(
              "Pure CaCO₃ sample mass",
              "sample",
              [
                [10, "10 g"],
                [25, "25 g"],
                [50, "50 g"],
              ],
              true,
            )}
            {select("Your calcium mass in g", "elementMass", [
              ["unset", "Predict calcium mass"],
              ...["4", "10", "20", "40", "100"].map(
                (v) => [v, v] as [string, string],
              ),
            ])}
            {select("Your calcium mass percentage", "percent", [
              ["unset", "Predict percent"],
              ...["40", "4", "10", "20", ".4"].map(
                (v) => [v, `${Number(v)}%`] as [string, string],
              ),
            ])}
          </>
        )}
        {mode === "compare" && (
          <>
            {select("Element to compare", "element", [
              ["N", "Nitrogen"],
              ["O", "Oxygen"],
            ])}
            {select("Highest mass percentage", "winner", [
              ["unset", "Predict compound"],
              ["urea", "Urea: CH₄N₂O"],
              ["nitrate", "Ammonium nitrate"],
              ["sulfate", "Ammonium sulfate"],
            ])}
            {select("Reason for comparison", "basis", [
              ["unset", "Choose reason"],
              ["mass", "Element contribution ÷ Mᵣ"],
              ["count", "Most atoms of that element"],
              ["safe", "It must always be safest"],
            ])}
          </>
        )}
      </div>
      {(mode === "contribution" || mode === "count-mass") && (
        <>
          <p className="phase-boundary-note">
            <strong>
              {pretty(spec.formula)}; named element {spec.element}
            </strong>
            <br />
            Supplied Aᵣ: {d.rows.map((r) => `${r.element}=${r.ar}`).join(", ")}.
            Formula counts:{" "}
            {d.rows.map((r) => `${r.element}=${r.count}`).join(", ")}. Give any
            non-integer percentage to one decimal place.
          </p>
          {mode === "contribution" ? (
            <CompositionStrip
              label="Relative-mass contributions to the complete compound"
              shares={d.rows.map((r) => ({
                element: r.element,
                value: r.contribution,
              }))}
            />
          ) : (
            <>
              <CompositionStrip
                label="Atom-count shares — counts are not mass"
                shares={d.rows.map((r) => ({
                  element: r.element,
                  value: r.count,
                }))}
              />
              <CompositionStrip
                label="Mass shares — counts weighted by Aᵣ"
                shares={d.rows.map((r) => ({
                  element: r.element,
                  value: r.contribution,
                }))}
              />
            </>
          )}
          <p>
            For {spec.element}: mass share {d.contribution}/{d.total};
            atom-count share {d.count}/{d.rows.reduce((s, r) => s + r.count, 0)}
            . Use the quantity the question asks for.
          </p>
        </>
      )}
      {mode === "sample" && (
        <>
          <p>
            Pure CaCO₃: supplied Aᵣ Ca=40, C=12, O=16; Mᵣ=100. Calcium
            contributes 40/100 of the mass.
          </p>
          <CompositionSampleAxis mass={Number(b.sample)} />
        </>
      )}
      {mode === "compare" && (
        <>
          <p>
            Supplied Aᵣ: C=12, H=1, N=14, O=16, S=32. Compare pure compounds at
            equal total mass. These percentages alone do not establish practical
            or environmental suitability.
          </p>
          <div className="composition-comparison-cards">
            {(["urea", "nitrate", "sulfate"] as const).map((key) => {
              const compound = compositionCases[key],
                data = compositionData(
                  compound.formula,
                  compound.ar,
                  String(b.element),
                );
              return (
                <article key={key}>
                  <h3>
                    {key === "urea"
                      ? "Urea"
                      : key === "nitrate"
                        ? "Ammonium nitrate"
                        : "Ammonium sulfate"}
                    : {pretty(compound.formula)}
                  </h3>
                  <p>
                    {b.element}: {data.count}×
                    {data.rows.find((r) => r.element === b.element)!.ar} / Mᵣ{" "}
                    {data.total} ×100 = {roundOne(data.percent)}%
                  </p>
                  <CompositionStrip
                    label={`${b.element} mass share`}
                    shares={[
                      { element: String(b.element), value: data.contribution },
                      {
                        element: "Other elements",
                        value: data.total - data.contribution,
                      },
                    ]}
                  />
                </article>
              );
            })}
          </div>
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = compositionPrediction(mode, b);
            setFeedback(r.feedback);
            setCorrect(r.correct);
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
    </section>
  );
}
