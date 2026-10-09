"use client";
import { useId, useState } from "react";
import {
  additionCases,
  conditionCases,
  inferCases,
  ledgerCases,
  originalCounts,
  formula,
  type AdditionCase,
} from "../lib/pathways";
import {
  initialPathwayBoard,
  checkPathwayBoard,
  referencePathwayDrawing,
  emptyPathwayDrawing,
  type PathwayBoard,
} from "../lib/pathway-board";
import { PathwayDisplayed } from "./PathwayDisplayed";
import { originalHydrogens } from "../lib/pathways";
function source(r: AdditionCase) {
  const b = emptyPathwayDrawing();
  b.n = String(r.n);
  originalHydrogens(r).forEach((h, i) => (b["h" + i] = String(h)));
  for (let i = 0; i < r.n - 1; i++) b["b" + i] = i === r.double ? "2" : "1";
  return b;
}
export function PathwayEvidence({
  mode,
  board: b,
  onChange: setB,
}: {
  mode: "conditions" | "infer" | "ledger";
  board: PathwayBoard;
  onChange: (next: PathwayBoard) => void;
}) {
  const id = useId(),
    [result, setResult] = useState<{ key: string; message: string } | null>(
      null,
    ),
    records =
      mode === "conditions"
        ? conditionCases
        : mode === "infer"
          ? inferCases
          : ledgerCases,
    record = records[b.record],
    addition = record.addition,
    r = addition ? additionCases[addition] : null;
  const feedback = result?.key === JSON.stringify(b) ? result.message : "";
  function setFeedback(message: string) {
    setResult(message ? { key: JSON.stringify(b), message } : null);
  }
  function set(k: string, v: string) {
    if (k === "record" && v === b.record) return;
    setB(k === "record" ? initialPathwayBoard(mode, v) : { ...b, [k]: v });
    setFeedback("");
  }
  function field(k: string, label: string, options: [string, string][]) {
    return (
      <div key={k}>
        <label htmlFor={id + k}>{label}</label>
        <select
          id={id + k}
          data-field={k}
          value={b[k]}
          onChange={(e) => set(k, e.target.value)}
        >
          {options.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </div>
    );
  }
  function number(k: string, label: string) {
    return (
      <div key={k}>
        <label htmlFor={id + k}>{label}</label>
        <input
          id={id + k}
          data-field={k}
          type="text"
          inputMode="decimal"
          value={b[k]}
          onChange={(e) => set(k, e.target.value)}
        />
      </div>
    );
  }
  const headings = {
    conditions: "Reaction conditions",
    infer: "Infer the reagent",
    ledger: "Count product atoms",
  };
  return (
    <section className="addition">
      <span>
        Learn the method ·{" "}
        {mode === "conditions"
          ? "Conditions and evidence"
          : mode === "infer"
            ? "Inverse reasoning"
            : "Molecular inventory"}
      </span>
      <h2>{headings[mode]}</h2>
      {mode === "conditions" ? (
        <>
          <p>
            <strong>Supplied reactants:</strong>{" "}
            {r
              ? r.title
              : "Propane and bromine water at ordinary room conditions without UV"}
            .
          </p>
          <div className="process-fields">
            {field("reaction", "Reaction type", [
              ["", "Choose"],
              ["hydrogenation", "Hydrogenation"],
              ["hydration", "Hydration"],
              ["halogenAddition", "Halogen addition"],
              ["noAddition", "No alkene addition"],
              ["fermentation", "Fermentation"],
              ["substitution", "Substitution"],
            ])}
            {field("catalyst", "Catalyst", [
              ["", "Choose"],
              ["nickel", "Nickel"],
              ["phosphoricAcid", "Phosphoric acid"],
              ["yeast", "Yeast"],
              ["notRequired", "Not required for this test"],
              ["notSpecified", "Not specified"],
            ])}
            {field("thermal", "Heating or light", [
              ["", "Choose"],
              ["warmed", "Suitable heating"],
              ["heatedSteam", "Heated steam"],
              ["ordinaryRoom", "Ordinary room conditions"],
              ["UV", "UV light"],
              ["notSpecified", "Not specified"],
            ])}
            {field("pressure", "Pressure requirement", [
              ["", "Choose"],
              ["pressurised", "Pressurised industrial reaction"],
              ["ordinary", "Ordinary test conditions"],
              ["notSpecified", "Not specified"],
            ])}
            {field("observation", "Specified colour observation", [
              ["", "Choose"],
              ["orangeToColourless", "Orange to colourless"],
              ["staysOrange", "Stays orange"],
              ["colourlessToOrange", "Colourless to orange"],
              ["notSpecified", "No colour test supplied"],
            ])}
          </div>
          <p>
            Choose the process, catalyst and conditions. An observation is
            required only where a colour test is specified.
          </p>
        </>
      ) : (
        <>
          {r && mode === "infer" && (
            <>
              <p>
                <strong>Original molecule:</strong> {r.name},{" "}
                {formula(originalCounts(r)).replace(
                  /[0-9]/g,
                  (c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)],
                )}
                .
              </p>
              <div className="process-fields">
                {field("reagent", "Inferred added reagent", [
                  ["", "Choose"],
                  ["hydrogen", "Hydrogen"],
                  ["water", "Water"],
                  ["chlorine", "Chlorine"],
                  ["bromine", "Bromine"],
                  ["iodine", "Iodine"],
                  ["hydrogenBromide", "Hydrogen bromide"],
                ])}
              </div>
              <p>
                Infer the added reagent from the supplied product; do not treat
                this comparison as a spontaneous reverse reaction.
              </p>
              <div className="structure-pair">
                <PathwayDisplayed
                  board={source(r)}
                  label="Supplied original alkene"
                />
                <PathwayDisplayed
                  board={referencePathwayDrawing(addition!)}
                  label="Supplied product for inference"
                />
              </div>
              <p>
                Count only the atom gain in one addition, not every atom in the
                product.
              </p>
            </>
          )}
          {r && mode === "ledger" && (
            <>
              <div className="process-fields">
                {number("C", "Product C atoms")}
              </div>
              <p>
                Use the given fully displayed product. Include hydrogens bonded
                to oxygen and both halogen atoms.
              </p>
              <PathwayDisplayed
                board={referencePathwayDrawing(addition!)}
                label="Supplied molecule to count"
              />
              <p>
                Supplied relative atomic masses: C 12; H 1; O 16; Cl 35.5; Br
                80; I 127.
              </p>
            </>
          )}
          <div className="process-fields">
            {["C", "H", "O", "Cl", "Br", "I"]
              .filter((e) => !(r && mode === "ledger" && e === "C"))
              .map((e) =>
                number(
                  e,
                  (mode === "infer" ? "Added " : "Product ") + e + " atoms",
                ),
              )}
            {mode === "infer" ? (
              <>
                {field("kind", "Type of chemical change", [
                  ["", "Choose"],
                  ["addition", "Addition"],
                  ["substitution", "Substitution"],
                  ["combustion", "Combustion"],
                  ["polymerisation", "Polymerisation"],
                  ["physical", "Physical change"],
                ])}
              </>
            ) : (
              <>
                {number("Mr", "Relative molecular mass")}
                {field("extent", "What did you count?", [
                  ["", "Choose"],
                  ["molecule", "One discrete molecule"],
                  ["batch", "Whole reaction batch"],
                  ["polymer", "Repeating polymer"],
                ])}
                {field("family", "Product family", [
                  ["", "Choose"],
                  ["saturatedHydrocarbon", "Saturated hydrocarbon"],
                  ["alcohol", "Alcohol"],
                  ["saturatedHalogenCompound", "Saturated; halogen"],
                  ["alkene", "Alkene"],
                ])}
              </>
            )}
          </div>
        </>
      )}
      <p className="pathway-record-title">{record.title}</p>
      <button
        type="button"
        onClick={() => setFeedback(checkPathwayBoard(mode, b).message)}
      >
        Check this{" "}
        {mode === "conditions"
          ? "conditions choice"
          : mode === "infer"
            ? "inference"
            : "inventory"}
      </button>
      {feedback && <p role="status">{feedback}</p>}
      <details>
        <summary>Compare another supplied case</summary>
        {field(
          "record",
          "Supplied comparison",
          Object.entries(records).map(([v, r]) => [v, r.title]),
        )}
      </details>
    </section>
  );
}
