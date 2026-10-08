"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialMassBoard,
  massPrediction,
  inventoryCases,
  inventoryMass,
  gasMassBalance,
  oxidationMass,
  weightedMass,
  type MassMode,
} from "@/lib/mass-conservation";
import { CompositionStrip } from "./CompositionStrip";
import { BoundaryGasDiagram } from "./BoundaryGasDiagram";
import { BoundaryGas3D } from "./BoundaryGas3D";
const pretty = (formula: string) =>
  formula.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
export function MassWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: MassMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialMassBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [view3D, setView3D] = useState(false);
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
  const prediction = (
    label: string,
    key: string,
    values: string[],
    unit = "",
  ) =>
    select(label, key, [
      ["unset", "Predict"],
      ...values.map(
        (v) => [v, `${v}${unit ? " " + unit : ""}`] as [string, string],
      ),
    ]);
  const inventory =
      mode === "inventory"
        ? inventoryMass(
            b.case as "complete" | "leftover",
            b.boundary as "contents" | "apparatus",
          )
        : null,
    inventorySpec =
      mode === "inventory"
        ? inventoryCases[b.case as "complete" | "leftover"]
        : null,
    gas =
      mode === "gas"
        ? gasMassBalance(b.closure === "closed", Number(b.stage))
        : null,
    oxidation =
      mode === "oxidation"
        ? oxidationMass(Number(b.scale), b.boundary as "sample" | "closed")
        : null,
    weighted =
      mode === "weighted"
        ? weightedMass(b.reaction as "water" | "magnesium", [
            Number(b.a),
            Number(b.b),
            Number(b.c),
          ])
        : null;
  return (
    <section
      className="model task-workbench mass-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "inventory" && (
          <>
            {select("Supplied reaction inventory", "case", [
              ["complete", "All reactants consumed"],
              ["leftover", "Unused reactant remains"],
            ])}
            {select("Weighed collection", "boundary", [
              ["apparatus", "Vessel and all contents"],
              ["contents", "Contents only"],
            ])}
            {prediction(
              "Your final balance reading",
              "reading",
              ["20", "70", "17", "67", "13", "50", "4"],
              "g",
            )}
            {prediction(
              "Your new product mass total",
              "productTotal",
              ["20", "17", "13", "70", "67"],
              "g",
            )}
          </>
        )}
        {mode === "gas" && (
          <>
            {select("Vessel boundary", "closure", [
              ["closed", "Closed: gas retained"],
              ["open", "Open: gas may leave"],
            ])}
            {select(
              "Gas release stage",
              "stage",
              [
                [0, "0: no parcels released"],
                [1, "1: first parcel"],
                [2, "2: first two parcels"],
                [3, "3: all three parcels"],
              ],
              true,
            )}
            {prediction(
              "Your vessel-plus-contents reading",
              "reading",
              ["75", "73.5", "72", "70.5", "25", "4.5", "20.5"],
              "g",
            )}
            {select("Reason for the reading", "reason", [
              ["unset", "Choose cause"],
              ["retained", "No material crosses out"],
              ["escaped", "CO₂ crosses out of the vessel"],
              ["destroyed", "Atoms are destroyed"],
              ["weightless", "Gas has no mass"],
            ])}
          </>
        )}
        {mode === "oxidation" && (
          <>
            {select(
              "Supplied reacting masses",
              "scale",
              [
                [1, "12 g Mg and 8 g oxygen"],
                [2, "24 g Mg and 16 g oxygen"],
              ],
              true,
            )}
            {select("Accounting boundary", "boundary", [
              ["sample", "Original magnesium sample only"],
              ["closed", "Magnesium + reacting oxygen"],
            ])}
            {prediction(
              "Your final oxide mass",
              "after",
              ["20", "40", "12", "24", "8", "16"],
              "g",
            )}
            {prediction(
              "Your mass increase for this boundary",
              "gain",
              ["0", "8", "16", "12", "24"],
              "g",
            )}
            {select("Cause within this boundary", "reason", [
              ["unset", "Choose cause"],
              ["entered", "Oxygen was outside the original sample"],
              ["retained", "Oxygen was already included"],
              ["created", "The reaction creates extra atoms"],
              ["heat", "Heat is the added chemical material"],
            ])}
          </>
        )}
        {weighted && (
          <>
            {select("Relative-mass equation", "reaction", [
              ["water", "H₂ + O₂ → H₂O"],
              ["magnesium", "Mg + O₂ → MgO"],
            ])}
            {weighted.rows.map((row, i) =>
              select(
                `Coefficient of ${pretty(row.formula)}`,
                ["a", "b", "c"][i],
                [1, 2, 3, 4].map((v) => [v, String(v)]),
                true,
              ),
            )}
            {prediction("Your weighted reactant total", "left", [
              "34",
              "36",
              "68",
              "72",
              "56",
              "80",
              "160",
              "2",
              "32",
            ])}
            {prediction("Your weighted product total", "right", [
              "18",
              "36",
              "40",
              "80",
              "160",
              "72",
              "34",
            ])}
          </>
        )}
      </div>
      {inventory && inventorySpec && (
        <>
          <p className="phase-boundary-note">
            Supplied unchanged vessel: {inventorySpec.apparatus} g. Initial
            reactants: {inventorySpec.reactants.join(" g + ")} g. New products:{" "}
            {inventorySpec.products.join(" g + ")} g. Unused reactant:{" "}
            {inventorySpec.unreacted} g. Nothing leaves this closed accounting.
          </p>
          <CompositionStrip
            label="Retained mass contributions / g for the chosen weighed collection"
            shares={[
              ...(b.boundary === "apparatus"
                ? [{ element: "Vessel", value: inventorySpec.apparatus }]
                : []),
              ...inventorySpec.products.map((value, i) => ({
                element: `Product ${i + 1}`,
                value,
              })),
              ...(inventorySpec.unreacted
                ? [
                    {
                      element: "Unused reactant",
                      value: inventorySpec.unreacted,
                    },
                  ]
                : []),
            ]}
          />
          <p>
            The boundary determines the reading. Every retained component
            contributes; unused reactant remains matter without becoming a newly
            formed product.
          </p>
        </>
      )}
      {gas && (
        <>
          <p className="phase-boundary-note">
            Initial apparatus 50 g + reaction mixture 25 g = 75 g. The supplied
            reaction has produced 4.5 g CO₂, shown as three 1.5 g parcels. Other
            material remains in the vessel; CO₂ is the only possible transfer.
            Closing the model boundary retains every parcel.
          </p>
          <BoundaryGasDiagram
            closed={b.closure === "closed"}
            stage={Number(b.stage)}
          />
          <p>
            All three parcels remain accounted for, including {gas.escaped}{" "}
            outside. Compare open and closed systems, including gas in the
            surroundings as well as in the vessel.
          </p>
          <button
            className="button"
            aria-expanded={view3D}
            onClick={() => setView3D(!view3D)}
          >
            {view3D ? "Hide 3D boundary" : "Show 3D boundary"}
          </button>
          {view3D && (
            <BoundaryGas3D
              key={`${b.closure}:${b.stage}`}
              closed={b.closure === "closed"}
              stage={Number(b.stage)}
            />
          )}
        </>
      )}
      {oxidation && (
        <>
          <p className="phase-boundary-note">
            Supplied complete reaction: {oxidation.magnesium} g Mg +{" "}
            {oxidation.oxygen} g O₂ → magnesium oxide. No material is lost.
            Balanced formula ratio: 2Mg + O₂ → 2MgO.
          </p>
          <div className="mass-oxidation-boundaries">
            <article>
              <h3>
                Before:{" "}
                {b.boundary === "sample"
                  ? "original solid sample"
                  : "whole reacting collection"}
              </h3>
              <p data-original-magnesium={oxidation.magnesium}>
                Mg: {oxidation.magnesium} g
              </p>
              <p data-reacting-oxygen={oxidation.oxygen}>
                {b.boundary === "sample"
                  ? "Outside original sample"
                  : "Already inside accounting"}
                : reacting O₂, {oxidation.oxygen} g
              </p>
            </article>
            <article>
              <h3>After: retained oxide</h3>
              <CompositionStrip
                label="Mass contributions / g in the complete oxide"
                shares={[
                  { element: "Mg contribution", value: oxidation.magnesium },
                  { element: "O contribution", value: oxidation.oxygen },
                ]}
              />
            </article>
          </div>
          <p>
            For a solid-only comparison, oxygen crosses into the original
            sample’s accounting. In the complete closed collection it was
            included from the start. The added mass is chemical material, not
            heat.
          </p>
        </>
      )}
      {weighted && (
        <>
          <p className="phase-boundary-note">
            Supplied Aᵣ: H=1, O=16, Mg=24. The table uses complete Mᵣ and
            equation amounts. These relative-mass bookkeeping totals are not
            measured grams.
          </p>
          <table className="mass-data-table">
            <caption>Coefficient × supplied relative mass</caption>
            <thead>
              <tr>
                <th scope="col">Species</th>
                <th scope="col">Aᵣ/Mᵣ</th>
                <th scope="col">Coeff.</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {weighted.rows.map((row) => (
                <tr
                  key={row.formula}
                  data-weighted-formula={row.formula}
                  data-weighted-contribution={row.weighted}
                >
                  <th scope="row">{pretty(row.formula)}</th>
                  <td>{row.mr}</td>
                  <td>{row.coefficient}</td>
                  <td>{row.weighted}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            {weighted.atoms.balanced
              ? "Every element currently matches. Now total both sides."
              : "The current equation still has an element mismatch. Repair coefficients before comparing final conserved totals."}
          </p>
          <p>
            Check every element as well as mass accounting. Matching a total
            alone cannot establish correct substance identities.
          </p>
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = massPrediction(mode, b);
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
