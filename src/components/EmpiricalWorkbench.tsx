"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  empiricalChoices,
  empiricalRecords,
  empiricalPrediction,
  initialEmpiricalBoard,
  elementAmounts,
  crucibleAmounts,
  formulaFromCounts,
  type EmpiricalMode,
} from "@/lib/empirical-formulae";
import { EthaneFormula3D } from "./EthaneFormula3D";
const names: Record<string, string> = {
  "mass-over-Ar": "Divide each mass by its own Ar",
  "mass-ratio": "Use the gram ratio as the atom ratio",
  "equal-mass-equal-atoms": "Equal gram masses always mean equal atom counts",
  "multiply-all-then-simplify":
    "Multiply every ratio part, then keep smallest whole counts",
  "round-each": "Round each fraction independently",
  "multiply-one": "Multiply only the fractional part",
  "percent-to-mass-to-amount":
    "Use a mass basis, convert every element, then simplify",
  "percent-is-atom-ratio": "Use mass percentages directly as atom counts",
  "same-multiplier-one-element": "Scale only one element",
  "whole-molecular-multiple":
    "Require a positive whole molecular multiple and scale every subscript",
  "multiply-one-subscript": "Multiply only the largest subscript",
  "divide-molecular-subscripts": "Divide the empirical subscripts",
  "constant-mass-supports-ratio":
    "Stable cooled mass supports the calculated ratio under stated assumptions",
  "not-yet-constant":
    "The ratio is provisional because the cooled mass is still changing",
  "use-total-product-as-oxygen": "Use the entire product mass as oxygen",
  "oxygen-is-one-atom-per-gram": "Count one oxygen atom for every gram",
  undefined: "No consistent whole molecular count",
};
const headings: Record<EmpiricalMode, string> = {
  masses: "Convert each element",
  fraction: "Preserve the ratio",
  percent: "Use a mass basis",
  molecular: "Scale the whole formula",
  experiment: "Subtract the apparatus",
};
const fields: Record<EmpiricalMode, readonly [string, string, string][]> = {
  masses: [
    ["firstAmount", "Your Mg relative amount", ""],
    ["secondAmount", "Your O relative amount", ""],
    ["first", "Your Mg subscript", ""],
    ["second", "Your O subscript", ""],
  ],
  fraction: [
    ["first", "First element subscript", ""],
    ["second", "Second element subscript", ""],
    ["multiplier", "Your common multiplier", ""],
  ],
  percent: [
    ["first", "Your C subscript", ""],
    ["second", "Your H subscript", ""],
    ["third", "Your O subscript", ""],
  ],
  molecular: [
    ["empiricalMass", "Your empirical formula mass", ""],
    ["multiplier", "Your molecular multiplier", ""],
    ["first", "First element atom count", ""],
    ["second", "Second element atom count", ""],
  ],
  experiment: [
    ["metalMass", "Your Mg mass", "g"],
    ["oxygenMass", "Your oxygen gain", "g"],
    ["first", "Your Mg ratio part", ""],
    ["second", "Your O ratio part", ""],
  ],
};
const display = (v: number) => String(Number(v.toPrecision(6)));
export function EmpiricalWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: EmpiricalMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialEmpiricalBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    records = empiricalRecords[mode] as Record<string, { label: string }>;
  function change(key: string, value: string) {
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
  }
  const select = (key: string, label: string, unit = "") => (
    <label
      key={key}
      className={key === "reason" ? "empirical-wide" : undefined}
    >
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) => change(key, e.target.value)}
      >
        {empiricalChoices[mode][key].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : key === "record"
                ? records[v].label
                : (names[v] ?? `${v}${unit ? " " + unit : ""}`)}
          </option>
        ))}
      </select>
    </label>
  );
  const key = String(b.record);
  let symbols: readonly string[] = [],
    massRows: readonly number[] | undefined,
    amounts: readonly number[] | undefined;
  if (mode === "masses") {
    const r =
      empiricalRecords.masses[key as keyof typeof empiricalRecords.masses];
    symbols = r.symbols;
    massRows = r.masses;
    amounts = elementAmounts(r.masses, r.atomic);
  }
  if (mode === "fraction") {
    const r =
      empiricalRecords.fraction[key as keyof typeof empiricalRecords.fraction];
    symbols = r.symbols;
    amounts = r.amounts;
  }
  if (mode === "percent") {
    const r =
      empiricalRecords.percent[key as keyof typeof empiricalRecords.percent];
    symbols = r.symbols;
    massRows = r.masses;
    amounts = elementAmounts(r.masses, r.atomic);
  }
  if (mode === "molecular") {
    symbols =
      empiricalRecords.molecular[key as keyof typeof empiricalRecords.molecular]
        .symbols;
  }
  if (mode === "experiment") {
    const r =
        empiricalRecords.experiment[
          key as keyof typeof empiricalRecords.experiment
        ],
      a = crucibleAmounts(r.tare, r.withMetal, r.final);
    symbols = ["Mg", "O"];
    massRows = [a.metalMass, a.oxygenMass];
    amounts = elementAmounts(massRows, [24, 16]);
  }
  const predicted = [
    b.first,
    b.second,
    ...(mode === "percent" ? [b.third] : []),
  ];
  const whole = predicted.every(
    (v) =>
      v !== "unset" &&
      v !== "undefined" &&
      Number.isInteger(Number(v)) &&
      Number(v) > 0,
  );
  const selectedFormula = whole
    ? formulaFromCounts(symbols, predicted.map(Number))
    : null;
  return (
    <section
      className="model task-workbench empirical-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      <div className="empirical-fields">
        {fields[mode].slice(0, 2).map(([k, l, u]) => select(k, l, u))}
      </div>
      {select("record", "Explore a composition record")}
      <p className="empirical-record">{records[key].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing this model
        explores another composition.
      </p>
      <div className="empirical-fields">
        {fields[mode].slice(2).map(([k, l, u]) => select(k, l, u))}
        {select("reason", "Your relationship")}
      </div>
      {b.reason !== "unset" && (
        <p>Your selected relationship: {names[String(b.reason)]}.</p>
      )}
      {mode === "percent" && (
        <p>
          {key === "larger"
            ? "The supplied 200 g sample preserves the same composition."
            : "Use a convenient 100 g calculation sample; percentage numbers become gram masses."}
          {key === "rounded"
            ? " These masses were rounded to one decimal place; small near-integer deviations are judged using that supplied precision."
            : ""}
        </p>
      )}
      {amounts && (
        <figure className="empirical-ledger">
          <figcaption>
            {mode === "fraction"
              ? "Supplied relative amounts"
              : "Element working for the selected record"}
          </figcaption>
          <table>
            <thead>
              <tr>
                <th>Element</th>
                {massRows && <th>Mass / g</th>}
                <th>Relative amount</th>
                <th>
                  Your{" "}
                  {mode === "masses" || mode === "experiment"
                    ? "ratio part"
                    : "subscript"}
                </th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol, i) => (
                <tr key={symbol}>
                  <th>{symbol}</th>
                  {massRows && <td>{display(massRows[i])}</td>}
                  <td>{display(amounts![i])}</td>
                  <td>
                    {predicted[i] === "unset"
                      ? "Not entered"
                      : String(predicted[i])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="position-caption">
            Displayed calculated amounts are rounded to 6 significant digits;
            the calculation retains intermediate precision. Atom ratios compare
            amounts, not gram masses. Your predicted whole parts remain visible
            when wrong.
          </p>
        </figure>
      )}
      {selectedFormula && (
        <p className="formula-callout">
          Your selected{" "}
          {mode === "molecular" ? "molecular counts" : "ratio notation"}:{" "}
          <strong>
            {mode === "experiment" && key === "premature"
              ? `Mg:O = ${b.first}:${b.second}`
              : selectedFormula}
          </strong>
          {mode === "experiment" && key === "premature"
            ? " — provisional ratio; the final compound formula is not established."
            : ""}
        </p>
      )}
      {mode === "molecular" && (
        <p>
          Relative molecular mass ÷ relative empirical formula mass gives the
          multiplier. A whole molecule needs a positive integer multiplier for
          every subscript; incompatible exact data must be checked.
        </p>
      )}
      {mode === "molecular" && key === "initial" && <EthaneFormula3D />}
      {mode === "experiment" && (
        <p>
          Mg mass = initial crucible+Mg − empty crucible. Oxygen gain = final
          crucible+oxide − initial crucible+Mg. These are supplied supervised
          measurements. Constant mass alone does not prove purity or absence of
          product loss.
        </p>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = empiricalPrediction(mode, b);
            setCorrect(r.correct);
            setFeedback(
              !r.complete
                ? "Complete every prediction and choose a relationship before checking."
                : r.correct
                  ? mode === "molecular" && key === "inconsistent"
                    ? "That's right. The exact supplied masses give a non-integer multiplier; no consistent whole molecular formula follows."
                    : mode === "experiment" && key === "premature"
                      ? "That's right. The provisional mass ratio is 4:3, but changing cooled mass does not establish a final compound formula."
                      : "That's right. The element quantities and common scaling agree under the supplied assumptions."
                  : "Not yet. Check each element mass, its own atomic mass, common scaling and whether the measurement supports a final formula.",
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
      <details>
        <summary>About this model</summary>
        <p>
          {instruction} The smallest whole atom ratio describes empirical
          composition. Molecular counts and compound identity need additional
          evidence. A 100 g basis is a calculation convenience. No unsupervised
          practical work is instructed.
        </p>
      </details>
    </section>
  );
}
