"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  extractionChoices,
  extractionExpected,
  extractionPrediction,
  extractionRecords,
  initialExtractionBoard,
  type ExtractionMode,
} from "@/lib/metal-extraction";
import { OxygenTransfer3D } from "./OxygenTransfer3D";
const labels: Record<string, string> = {
  "carbon-reduction": "Carbon-based reduction",
  electrolysis: "Electrolysis",
  "supplied-noncarbon-process": "Supplied non-carbon process",
  "crushing-only": "Crushing only",
  "carbon-more-reactive": "Carbon is more reactive than this metal",
  "carbon-cannot-reduce": "Carbon cannot remove oxygen from this oxide",
  "carbon-contaminates-product": "Carbon forms an unwanted carbide",
  "cheapest-always-works": "The cheapest process always works",
  "metal-compound-in-mixture": "Metal compound in a mixture",
  "uncombined-metal-in-mixture": "Uncombined metal in a mixture",
  "pure-metal-guaranteed": "Guaranteed pure metal",
  "chemical-reduction-needed": "Chemical reduction is needed to obtain metal",
  "physical-separation-may-be-needed":
    "Physical separation of impurities may be needed",
  "not-yet-reduced-to-metal": "Copper oxide has not been reduced to copper",
  "oxide-preparation-not-metal-extraction":
    "An oxide is prepared; metal is not yet obtained",
  "crushing-removes-oxygen": "Crushing removes chemically combined oxygen",
  "always-CO2": "Carbon always forms CO2",
  A: "Route A",
  B: "Route B",
  both: "Both routes",
  neither: "Neither route",
  "8.047058823529412": "8.05 kg (rounded; full calculation retained)",
};
const fields: Record<ExtractionMode, [string, string][]> = {
  route: [
    ["route", "Your extraction route"],
    ["reason", "Your chemical reason"],
  ],
  source: [
    ["identity", "Your material identity"],
    ["change", "Your required change"],
  ],
  oxygen: [
    ["reduced", "Your oxide reduced"],
    ["carbonProduct", "Your carbon product"],
    ["oxygen", "Your oxygen atoms transferred"],
  ],
  grade: [
    ["oxide", "Your oxide mass / kg"],
    ["metal", "Your contained metal maximum / kg"],
  ],
  decision: [
    ["costA", "Your route A cost / £ per kg"],
    ["costB", "Your route B cost / £ per kg"],
    ["route", "Your route meeting the priority"],
  ],
};
const headings: Record<ExtractionMode, string> = {
  route: "Choose the route",
  source: "Separate metal from compound",
  oxygen: "Remove oxygen from the oxide",
  grade: "Track ore, oxide and metal",
  decision: "Compare actual recovered metal",
};
const retry: Record<ExtractionMode, string> = {
  route:
    "First check chemical suitability. Carbon can reduce the supplied compatible oxide when it is more reactive than the metal. Cheapness cannot make an unsuitable reaction work; unwanted carbide also matters.",
  source:
    "Native means chemically uncombined, not necessarily pure. Crushing changes size or separates material; it does not remove oxygen chemically. Preparing ZnO from ZnCO3 still leaves zinc in a compound.",
  oxygen:
    "The oxide loses oxygen; carbon receives it. Use the supplied equation to decide CO or CO2, and count oxygen atoms transferred.",
  grade:
    "First multiply ore mass by its oxide percentage. Then multiply oxide mass by the metal's share of relative formula mass. Oxide mass is not metal mass; this is a contained maximum, not guaranteed recovered output.",
  decision:
    "Divide each complete batch cost by its actual recovered kilograms. Supplied emissions per kg are 22/20 = 1.10 for A and 16/25 = 0.64 for B. Apply every stated constraint; neither can be valid.",
};
export function MetalExtractionWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: ExtractionMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialExtractionBoard(mode),
    key = String(b.record),
    records = extractionRecords[mode] as Record<string, { label: string }>,
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  function change(field: string, value: string) {
    if (b[field] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [field]: value }]);
  }
  function select(field: string, label: string) {
    return (
      <label key={field}>
        {label}
        <select
          aria-label={label}
          value={b[field]}
          onChange={(e) => change(field, e.target.value)}
        >
          {extractionChoices[mode][field].map((v) => (
            <option key={v} value={v}>
              {v === "unset"
                ? "Predict"
                : field === "record"
                  ? records[v].label
                  : (labels[v] ?? v)}
            </option>
          ))}
        </select>
        {field !== "record" && b[field] !== "unset" && (
          <span className="metal-selected">
            Selected: {labels[String(b[field])] ?? String(b[field])}
          </span>
        )}
      </label>
    );
  }
  function check() {
    const p = extractionPrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete every prediction before checking."
        : p.correct
          ? `That's right. ${Object.entries(extractionExpected(mode, b))
              .map(
                ([k, v]) =>
                  `${fields[mode].find(([f]) => f === k)?.[1]}: ${labels[v] ?? v}`,
              )
              .join(
                "; ",
              )}. ${mode === "grade" ? "This is the maximum contained metal, not a promise of recovered metal." : mode === "route" ? "This choice is among the supplied processes, not a claim that no other industrial method exists." : ""}`
          : `Not yet. ${retry[mode]}`,
    );
  }
  return (
    <section
      className="model task-workbench metal-extraction-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      <div className="metal-predictions">
        {fields[mode].map(([field, label]) => select(field, label))}
      </div>
      {select("record", "Explore a supplied extraction record")}
      <p className="metal-record">{records[key].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing this model
        explores a different supplied case.
      </p>
      {mode === "oxygen" && key === "initial" && <OxygenTransfer3D />}
      {mode === "oxygen" && key !== "initial" && (
        <p>
          This equation has its own stated carbon product. The CuO/carbon 3D
          inventory represents only the initial reaction.
        </p>
      )}
      {mode === "grade" &&
        (() => {
          const r =
              extractionRecords.grade[
                key as keyof typeof extractionRecords.grade
              ],
            oxide = (r.ore * r.percent) / 100,
            metal = oxide * r.fraction;
          return (
            <figure className="extraction-mass-ledger">
              <figcaption>
                Contained masses on the same ore-mass scale
              </figcaption>
              <svg
                viewBox="0 0 400 160"
                role="img"
                aria-label={`Ore ${r.ore} kg, oxide ${oxide} kg, contained metal ${Number(metal.toPrecision(6))} kg`}
              >
                {[
                  { name: "Ore", mass: r.ore, color: "#696e7c" },
                  { name: "Oxide", mass: oxide, color: "#dc8b28" },
                  { name: "Contained metal", mass: metal, color: "#3345c8" },
                ].map((row, i) => (
                  <g key={row.name}>
                    <text x="10" y={20 + i * 45} fontSize="22">
                      {row.name}: {Number(row.mass.toPrecision(6))} kg
                    </text>
                    <rect
                      x="10"
                      y={27 + i * 45}
                      width="380"
                      height="13"
                      fill="#edf0f5"
                    />
                    <rect
                      x="10"
                      y={27 + i * 45}
                      width={(380 * row.mass) / r.ore}
                      height="13"
                      fill={row.color}
                    />
                  </g>
                ))}
                <text x="10" y="156" fontSize="22">
                  0 kg
                </text>
                <text x="390" y="156" textAnchor="end" fontSize="22">
                  {r.ore} kg
                </text>
              </svg>
              <p>
                These are masses, not particle counts or volume fractions.
                Contained metal is part of the oxide; these three bars are not
                added together.
              </p>
            </figure>
          );
        })()}
      {mode === "decision" && (
        <div className="oxygen-mass-ledger">
          <table>
            <caption>
              Supplied comparable batches: same metal and required purity
            </caption>
            <thead>
              <tr>
                <th>Route</th>
                <th>Actual metal / kg</th>
                <th>Complete cost / £</th>
                <th>CO2 / kg</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>A</th>
                <td>20</td>
                <td>80</td>
                <td>22</td>
              </tr>
              <tr>
                <th>B</th>
                <td>25</td>
                <td>112.50</td>
                <td>16</td>
              </tr>
            </tbody>
          </table>
          <p>
            Both processes are chemically suitable. All stated preparation and
            energy costs are included. Emissions are illustrative supplied
            totals, not a universal claim about a process or a complete
            lifecycle assessment.
          </p>
        </div>
      )}
      <div className="bench-actions">
        <button className="button primary" onClick={check}>
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
          className={correct ? "feedback correct" : "feedback retry"}
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>About this model</summary>
        <p>{instruction}</p>
        <p>
          The supplied cases model extraction decisions and calculations. They
          are not instructions to carry out chemical processes. Detailed
          electrolysis and Higher biological extraction need their separate
          lessons.
        </p>
      </details>
    </section>
  );
}
