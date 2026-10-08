"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialLimitingBoard,
  limitingChoices,
  limitingPrediction,
  limitingMoleSamples,
  limitingMassSamples,
  type LimitingMode,
} from "@/lib/limiting-reactants";
import { LimitingInventory3D } from "./LimitingInventory3D";
export function LimitingWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: LimitingMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialLimitingBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [show3D, setShow3D] = useState(false);
  const change = (key: string, v: string) => {
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
    methaneExcess: "3 CH₄; 4 O₂",
    oxygenExcess: "2 CH₄; 5 O₂",
    exact: mode === "masses" ? "4.8 g Mg; 14.6 g HCl" : "2 CH₄; 4 O₂",
    acidLimits: "12 g Mg; 14.6 g HCl",
    metalLimits: "2.4 g Mg; 14.6 g HCl",
    methane: mode === "change" ? "Add 2 mol CH₄" : "CH₄",
    oxygen: mode === "change" ? "Add 4 mol O₂" : "O₂",
    none: "Original supplies",
    both: "Both; no excess",
    carbonate: "Na₂CO₃",
    acid: "HCl",
  };
  const select = (label: string, key: string, unit = "") => (
    <label>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) => change(key, e.target.value)}
      >
        {(limitingChoices[mode] as Record<string, readonly string[]>)[key].map(
          (v) => (
            <option key={v} value={v}>
              {v === "unset" ? "Predict" : (names[v] ?? `${v}${unit}`)}
            </option>
          ),
        )}
      </select>
    </label>
  );
  // Do not reuse action labels for reactant identity predictions.
  const limitSelect = (labels: Record<string, string>) => (
    <label>
      Your limiting reactant
      <select
        aria-label="Your limiting reactant"
        value={b.limiting}
        onChange={(e) => change("limiting", e.target.value)}
      >
        {limitingChoices[mode].limiting.map((v) => (
          <option key={v} value={v}>
            {v === "unset" ? "Predict" : (labels[v] ?? v)}
          </option>
        ))}
      </select>
    </label>
  );
  const quantity = (key: string) =>
    b[key] === "unset" ? "not entered" : String(b[key]);
  const mole =
    mode === "capacities"
      ? limitingMoleSamples[b.sample as keyof typeof limitingMoleSamples]
      : null;
  const mass =
    mode === "masses"
      ? limitingMassSamples[b.sample as keyof typeof limitingMassSamples]
      : null;
  const changed =
    mode === "change"
      ? b.added === "methane"
        ? [5, 4]
        : b.added === "oxygen"
          ? [3, 8]
          : [3, 4]
      : null;
  return (
    <section
      className="model task-workbench limiting-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      {mode === "capacities" && (
        <>
          <p>
            <strong>CH₄ + 2O₂ → CO₂ + 2H₂O</strong>
          </p>
          <div className="bench-fields">
            {select("Supplied mole inventory", "sample")}
          </div>
          <p>{mole!.label}. Predict each supply divided by its coefficient.</p>
          <div className="bench-fields">
            {select("Your CH₄ capacity", "methaneCapacity", " mol")}
            {select("Your O₂ capacity", "oxygenCapacity", " mol")}
            {limitSelect({
              methane: "CH₄",
              oxygen: "O₂",
              both: "Both; no excess",
            })}
            {select("Your maximum CO₂", "carbonDioxide", " mol")}
            {select("Your CH₄ remaining", "methaneLeft", " mol")}
            {select("Your O₂ remaining", "oxygenLeft", " mol")}
          </div>
          <table className="element-ledger">
            <caption>Available supply and your capacity prediction</caption>
            <thead>
              <tr>
                <th>Reactant</th>
                <th>Available / mol</th>
                <th>Coefficient</th>
                <th>Your capacity / mol</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>CH₄</th>
                <td>{mole!.amounts[0]}</td>
                <td>1</td>
                <td>{quantity("methaneCapacity")}</td>
              </tr>
              <tr>
                <th>O₂</th>
                <td>{mole!.amounts[1]}</td>
                <td>2</td>
                <td>{quantity("oxygenCapacity")}</td>
              </tr>
            </tbody>
          </table>
          <p className="position-caption">
            Capacity means how much of this equation the supply can support.
            Compare on the same scale; it is not the raw mol of every different
            substance.
          </p>
        </>
      )}
      {mode === "masses" && (
        <>
          <p>
            <strong>Mg + 2HCl → MgCl₂ + H₂</strong>
          </p>
          <div className="bench-fields">
            {select("Supplied mass inventory", "sample")}
          </div>
          <p>
            {mass!.label}. M(Mg)=24, M(HCl)=36.5, M(MgCl₂)=95, M(H₂)=2 g/mol.
          </p>
          <div className="bench-fields">
            {select("Your initial Mg amount", "mgAmount", " mol")}
            {select("Your initial HCl amount", "acidAmount", " mol")}
            {limitSelect({ Mg: "Mg", HCl: "HCl", both: "Both; no excess" })}
            {select("Your maximum H₂ mass", "hydrogenMass", " g")}
            {select("Your Mg remaining mass", "mgLeft", " g")}
          </div>
          <p className="inventory-readout">
            Your predictions: Mg {quantity("mgAmount")} mol; HCl{" "}
            {quantity("acidAmount")} mol; H₂ {quantity("hydrogenMass")} g;
            unused Mg {quantity("mgLeft")} g.
          </p>
          <p className="position-caption">
            Convert each mass to mol, then divide by its coefficient. Unused
            material remains in the total inventory.
          </p>
        </>
      )}
      {mode === "change" && (
        <>
          <p>
            <strong>CH₄ + 2O₂ → CO₂ + 2H₂O</strong>
          </p>
          <p>
            Original supply: 3 mol CH₄ and 4 mol O₂. Each choice sets a fresh
            starting mixture.
          </p>
          <div className="bench-fields">
            {select("Change the starting supply", "added")}
          </div>
          <p>
            <strong>
              Now: {changed![0]} mol CH₄ and {changed![1]} mol O₂.
            </strong>
          </p>
          <div className="bench-fields">
            {select("Your maximum CO₂", "product", " mol")}
            {limitSelect({
              methane: "CH₄",
              oxygen: "O₂",
              both: "Both; no excess",
            })}
            {select("Your CH₄ remaining", "methaneLeft", " mol")}
            {select("Your O₂ remaining", "oxygenLeft", " mol")}
          </div>
          <p className="inventory-readout">
            Your predicted maximum CO₂: {quantity("product")} mol. CH₄
            remaining: {quantity("methaneLeft")} mol; O₂ remaining:{" "}
            {quantity("oxygenLeft")} mol.
          </p>
        </>
      )}
      {mode === "plateau" && (
        <>
          <p>
            <strong>Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂</strong>
          </p>
          <p>
            HCl stays fixed at 0.02 mol. Predict theoretical complete
            conversion.
          </p>
          <div className="bench-fields">
            {select("Supplied carbonate amount", "carbonate", " mol")}
            {select("Your maximum CO₂", "product", " mol")}
            {select("Your carbonate remaining", "left", " mol")}
            {limitSelect({
              carbonate: "Na₂CO₃",
              acid: "HCl",
              both: "Both; no excess",
            })}
          </div>
          <svg
            className="limiting-capacity-graph"
            viewBox="0 0 400 280"
            role="img"
            aria-label={`Theoretical carbon dioxide capacity graph. At ${b.carbonate} mol carbonate your predicted CO₂ is ${quantity("product")} mol.`}
          >
            <line x1="70" y1="210" x2="370" y2="210" stroke="currentColor" />
            <line x1="70" y1="210" x2="70" y2="35" stroke="currentColor" />
            <polyline
              points="70,210 220,122.5 370,122.5"
              fill="none"
              stroke="#3046c8"
              strokeWidth="4"
            />
            <text x="68" y="230">
              0
            </text>
            <text x="199" y="230">
              0.01
            </text>
            <text x="337" y="230">
              0.02
            </text>
            <text x="17" y="128">
              0.01
            </text>
            <text x="17" y="40">
              0.02
            </text>
            <text x="78" y="18">
              Maximum CO₂ / mol
            </text>
            <text x="112" y="263">
              Supplied carbonate / mol
            </text>
            {b.product !== "unset" && (
              <>
                <circle
                  cx={70 + Number(b.carbonate) * 15000}
                  cy={210 - Number(b.product) * 8750}
                  r="6"
                  fill="#c7972a"
                />
                <text x="86" y="62">
                  Your prediction: {b.product} mol
                </text>
              </>
            )}
          </svg>
          <p className="position-caption">
            Blue: theoretical product capacity. Gold: your prediction, retained
            even when wrong. This is product amount, not reaction rate or
            temperature. At equal capacities neither reactant remains in excess.
          </p>
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = limitingPrediction(mode, b);
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
      {mode === "capacities" && (
        <>
          <button
            className="button secondary"
            aria-expanded={show3D}
            onClick={() => setShow3D((v) => !v)}
          >
            {show3D ? "Hide" : "Inspect"} a small 3D inventory
          </button>
          {show3D && <LimitingInventory3D />}
          <p className="position-caption">
            Optional 3D always shows the illustrative initial 3 CH₄ + 4 O₂
            collection. It does not change with mol-supply choices. Mol
            predictions above remain a separate continuous calculation.
          </p>
        </>
      )}
      <details>
        <summary>About this model</summary>
        <p>
          Supplied formulas and coefficients are fixed. Complete conversion and
          no loss of material are assumed for these theoretical maxima; real
          yields can be lower. Compare available amount divided by coefficient
          for every reactant and keep all unused material in the inventory. A
          model-assisted prediction is practice, not fresh independent evidence.
        </p>
      </details>
    </section>
  );
}
