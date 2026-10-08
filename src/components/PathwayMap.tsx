"use client";
import { useId, useState } from "react";
import { mapCases } from "../lib/pathways";
import {
  initialPathwayBoard,
  checkPathwayBoard,
  type PathwayBoard,
} from "../lib/pathway-board";
const products: [string, string][] = [
  ["", "Choose"],
  ["ethanol", "Ethanol"],
  ["ethane", "Ethane"],
  ["ethanoicAcid", "Ethanoic acid"],
  ["ethylEthanoate", "Ethyl ethanoate"],
  ["polyethene", "Poly(ethene)"],
  ["polyester", "Polyester"],
  ["carbonDioxide", "Carbon dioxide"],
];
const methods: [string, string][] = [
  ["", "Choose"],
  ["hydration", "Hydration"],
  ["hydrogenation", "Hydrogenation"],
  ["oxidation", "Oxidation"],
  ["esterification", "Esterification"],
  ["fermentation", "Fermentation"],
  ["additionPolymerisation", "Addition polymerisation"],
  ["condensationPolymerisation", "Condensation polymerisation"],
];
const feeds: [string, string][] = [
  ["", "Choose"],
  ["steam", "Steam"],
  ["hydrogen", "Hydrogen"],
  ["oxidisingAgent", "Oxidising agent"],
  ["ethanol", "Ethanol"],
  ["yeast", "Yeast"],
  ["moreMonomers", "More alkene monomers"],
  ["diol", "Supplied diol"],
  ["bromine", "Bromine"],
];
const byproducts: [string, string][] = [
  ["", "Choose"],
  ["none", "None"],
  ["water", "Water"],
  ["carbonDioxide", "Carbon dioxide"],
  ["hydrogen", "Hydrogen"],
];
const name = (options: [string, string][], v: string) =>
  options.find((a) => a[0] === v)?.[1] ?? "Not selected";
export function PathwayMap({
  board: b,
  onChange: setB,
}: {
  board: PathwayBoard;
  onChange: (next: PathwayBoard) => void;
}) {
  const id = useId(),
    [result, setResult] = useState<{ key: string; message: string } | null>(
      null,
    ),
    r = mapCases[b.record];
  const feedback = result?.key === JSON.stringify(b) ? result.message : "";
  function setFeedback(message: string) {
    setResult(message ? { key: JSON.stringify(b), message } : null);
  }
  function field(k: string, label: string, options: [string, string][]) {
    return (
      <div key={k}>
        <label htmlFor={id + k}>{label}</label>
        <select
          id={id + k}
          data-field={k}
          value={b[k]}
          onChange={(e) => {
            if (k === "record" && e.target.value === b.record) return;
            setB(
              k === "record"
                ? initialPathwayBoard("map", e.target.value)
                : { ...b, [k]: e.target.value },
            );
            setFeedback("");
          }}
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
  return (
    <section className="addition">
      <span>
        Learn the method · Reaction routes
        {r.higher ? " · Higher Chemistry" : ""}
      </span>
      <h2>Choose a chemically possible route</h2>
      <p>
        <strong>Target:</strong> {r.title}. Use the original starting material
        and identify the second feed, process and product.
      </p>
      <p>
        <strong>Given starting material:</strong> {r.source},{" "}
        {r.sourceFormula.replace(/[0-9]/g, (c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)])}.
      </p>
      {r.given && <p>{r.given}</p>}
      <div className="process-fields">
        {field("feed", "Second feed or biological agent", feeds)}
        {field("method", "Process on your arrow", methods)}
        {field("product", "Proposed organic product", products)}
        {field("byproduct", "Separate small by-product", byproducts)}
      </div>
      <div className="process-flow">
        <div>
          <strong>Fixed start</strong>
          <p>{r.source}</p>
          <p>
            {r.sourceFormula.replace(/[0-9]/g, (c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)])}
          </p>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <strong>Your reaction arrow</strong>
          <p>{b.method ? name(methods, b.method) : "Process not selected"}</p>
          <p>Added feed: {b.feed ? name(feeds, b.feed) : "Not selected"}</p>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <strong>Your proposed output</strong>
          <p>
            {b.product ? name(products, b.product) : "Product not selected"}
          </p>
          <p>
            By-product:{" "}
            {b.byproduct ? name(byproducts, b.byproduct) : "Not selected"}
          </p>
        </div>
      </div>
      {b.record === "ester" && (
        <p>
          The starting acid supplies two carbons. Account separately for any
          carbons supplied by the chosen alcohol.
        </p>
      )}
      {b.record === "oxidation" && (
        <p>
          This case uses primary ethanol. An acid-product rule cannot be applied
          automatically to every alcohol isomer.
        </p>
      )}
      {b.record === "polyester" && (
        <p>
          The supplied diol is HO–CH₂–CH₂–OH. Both reactants have two reactive
          groups. This Higher comparison does not imply a water count for a
          finite chain.
        </p>
      )}
      <button
        type="button"
        onClick={() => setFeedback(checkPathwayBoard("map", b).message)}
      >
        Check this route
      </button>
      {feedback && <p role="status">{feedback}</p>}
      <details>
        <summary>Investigate another reaction route</summary>
        {field(
          "record",
          "Supplied pathway",
          Object.entries(mapCases).map(([v, r]) => [v, r.title]),
        )}
      </details>
    </section>
  );
}
