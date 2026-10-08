"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  massBalanceChoices,
  massBalanceSamples,
  candidateSamples,
  initialMassBalanceBoard,
  massBalancePrediction,
  type MassBalanceMode,
} from "@/lib/balancing-masses";
import { balanceLedger } from "@/lib/equation-balancing";
import { CovalentScene3D } from "./CovalentScene3D";
export function MassBalanceWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: MassBalanceMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialMassBalanceBoard(mode),
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
  const d =
      mode === "amounts"
        ? massBalanceSamples[b.sample as keyof typeof massBalanceSamples]
        : undefined,
    candidate =
      mode === "candidates"
        ? candidateSamples[b.sample as keyof typeof candidateSamples]
        : undefined;
  const labelValues: Record<string, string> = {
    small: "Original sample",
    double: "Double sample",
    one: "Product sample A",
    two: "Product sample B",
    CuO: "CuO candidate",
    Cu2O: "Cu₂O candidate",
  };
  const select = (label: string, key: string, unit = "", numeric = false) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {(
          massBalanceChoices[mode] as Record<
            string,
            readonly (string | number)[]
          >
        )[key].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : (labelValues[String(v)] ?? `${v}${unit}`)}
          </option>
        ))}
      </select>
    </label>
  );
  const prediction = (key: string, unit: string) =>
    b[key] === "unset" ? "not entered" : `${b[key]} ${unit}`;
  const coefficients =
      mode === "fraction"
        ? [
            Number(b.ethane),
            Number(b.oxygen),
            Number(b.carbonDioxide),
            Number(b.water),
          ]
        : undefined,
    ledger = coefficients
      ? balanceLedger(["C2H6", "O2"], ["CO2", "H2O"], coefficients)
      : undefined;
  return (
    <section
      className="model task-workbench mass-balance-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "amounts" && (
          <>
            {select("Supplied reacted sample", "sample")}
            {select(`Mg ${d!.masses[0]} g: your amount`, "mgAmount", " mol")}
            {select(
              `O₂ ${d!.masses[1]} g: your amount`,
              "oxygenAmount",
              " mol",
            )}
            {select(
              `MgO ${d!.masses[2]} g: your amount`,
              "oxideAmount",
              " mol",
            )}
            {select("Your shared divisor", "divisor", " mol")}
            {select("Your smallest coefficient ratio", "ratio")}
          </>
        )}
        {mode === "candidates" && (
          <>
            {select("Supplied product sample", "sample")}
            {select(
              `Cu ${candidate!.copper} g: your amount`,
              "copperAmount",
              " mol",
            )}
            {select(
              `H₂O ${candidate!.water} g: your amount`,
              "waterAmount",
              " mol",
            )}
            {select("Your matching candidate", "equation")}
          </>
        )}
        {mode === "fraction" && (
          <>
            {select("Your O₂ ratio entry", "oxygenRatio")}
            {select("Your whole-ratio multiplier", "multiplier")}
            {select("Your C₂H₆ coefficient", "ethane", "", true)}
            {select("Your O₂ coefficient", "oxygen", "", true)}
            {select("Your CO₂ coefficient", "carbonDioxide", "", true)}
            {select("Your H₂O coefficient", "water", "", true)}
          </>
        )}
        {mode === "consumed" && (
          <>
            {select("Your reacted O₂ mass", "oxygenMass", " g")}
            {select("Your reacted Mg amount", "mgAmount", " mol")}
            {select("Your reacted O₂ amount", "oxygenAmount", " mol")}
            {select("Your produced MgO amount", "oxideAmount", " mol")}
            {select("Your smallest coefficient ratio", "ratio")}
          </>
        )}
      </div>
      <p className="phase-boundary-note">
        {d
          ? `Supplied reacted masses: Mg ${d.masses[0]} g; O₂ ${d.masses[1]} g; MgO ${d.masses[2]} g. M values:24,32,40 g/mol. The fixed formulas are Mg + O₂ → MgO; derive numbers before them.`
          : candidate
            ? `Measured products: ${candidate.copper} g Cu and ${candidate.water} g H₂O. Supplied M(Cu)=63.5, M(H₂O)=18 g/mol. Candidate A: CuO + H₂ → Cu + H₂O. Candidate B: Cu₂O + H₂ → 2Cu + H₂O. Both are atom-balanced; test the product amounts.`
            : mode === "fraction"
              ? "Supplied reacted masses:3 g C₂H₆,11.2 g O₂,8.8 g CO₂,5.4 g H₂O. M values:30,32,44,18 g/mol. Their amounts are0.1:0.35:0.2:0.3 mol. Divide all by0.1, then make the whole ratio integer without rounding entries."
              : "Initial6 g Mg and10 g O₂; produced10 g MgO with6 g O₂ unreacted. M values:24,32,40 g/mol. Use initial minus remaining oxygen in the reaction ratio. No material is removed from the closed mass inventory."}
      </p>
      <div className="mole-prediction-ledger">
        <strong>Your proposed amounts and ratio</strong>
        {mode === "fraction" ? (
          <>
            <p>
              Your normalized O₂ entry: {prediction("oxygenRatio", "")}; your
              multiplier: {prediction("multiplier", "")}.
            </p>
            <p>
              {b.ethane} C₂H₆ + {b.oxygen} O₂ → {b.carbonDioxide} CO₂ +{" "}
              {b.water} H₂O
            </p>
          </>
        ) : candidate ? (
          <>
            <p>
              Cu: {prediction("copperAmount", "mol")}; H₂O:
              {prediction("waterAmount", "mol")}.
            </p>
            <p>
              Your candidate:
              {b.equation === "unset"
                ? "not selected"
                : b.equation === "CuO"
                  ? "CuO + H₂ → Cu + H₂O"
                  : "Cu₂O + H₂ → 2Cu + H₂O"}
              .
            </p>
          </>
        ) : (
          <>
            <p>
              Mg: {prediction("mgAmount", "mol")}; O₂:
              {prediction("oxygenAmount", "mol")}; MgO:
              {prediction("oxideAmount", "mol")}.
            </p>
            <p>
              {mode === "amounts"
                ? `Your shared divisor: ${prediction("divisor", "mol")}`
                : `Your reacted oxygen: ${prediction("oxygenMass", "g")}`}
              .
            </p>
            <p>
              Your coefficient ratio:
              {b.ratio === "unset" ? "not entered" : b.ratio}.
            </p>
          </>
        )}
      </div>
      {ledger && (
        <>
          <table className="element-ledger">
            <caption>Atoms in your proposed equation</caption>
            <thead>
              <tr>
                <th>Element</th>
                <th>Reactants</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {ledger.rows.map((row) => (
                <tr key={row.element}>
                  <th>{row.element}</th>
                  <td>{row.left}</td>
                  <td>{row.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            {ledger.balanced
              ? ledger.smallest
                ? "Your equation conserves every element and uses the smallest whole-number coefficients."
                : "Your equation conserves every element, but its whole-number coefficients share a factor."
              : "Your equation does not yet conserve every element. Keep every supplied formula unchanged."}
          </p>
        </>
      )}
      {mode === "amounts" && (
        <>
          <button
            className="button"
            aria-expanded={show3D}
            onClick={() => setShow3D(!show3D)}
          >
            {show3D ? "Hide oxygen molecule" : "Inspect one O₂ molecule in 3D"}
          </button>
          {show3D && (
            <>
              <p>
                ONE O₂ molecule contains two O atoms; its supplied molar mass
                is32 g/mol. This is not a mole-sized sample. MgO is ionic and is
                not represented as an isolated covalent molecule.
              </p>
              <CovalentScene3D molecule="O2" context="formula-count" />
            </>
          )}
        </>
      )}
      <p>
        Coefficients describe reacted/produced mol ratios. Use the same scaling
        factor throughout. A fractional intermediate may be valid; do not round
        away a half. These exact instructional data do not justify blanket
        rounding of uncertain real measurements.
      </p>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = massBalancePrediction(mode, b);
            setCorrect(result.correct);
            setFeedback(result.feedback);
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
