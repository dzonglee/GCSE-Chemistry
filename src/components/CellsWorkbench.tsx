"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useState } from "react";
import {
  cellsOptions,
  cellsRecords,
  cellsPrediction,
  initialCellsBoard,
  validCellsNumber,
  type CellsMode,
} from "@/lib/cells-and-fuel-cells";
import { SimpleCell3D } from "./SimpleCell3D";
import { CellsComparison } from "./CellsComparison";
type Board = Record<string, string | number>;
const titles: Record<CellsMode, string> = {
  setup: "Construct the supplied cell",
  series: "Build a series battery",
  restore: "Restore the right energy source",
  reaction: "Balance the overall fuel-cell reaction",
  compare: "Choose from the supplied evidence",
  evidence: "Test the chemical claim",
};
const labels: Record<string, string> = {
  left: "Your left electrode",
  right: "Your right electrode",
  liquid: "Your electrolyte",
  volts: "Your predicted voltage / V",
  connection: "Your cell connection",
  count: "Your number of cells",
  reversed: "Your number of reversed cells",
  action: "Your restoration action",
  reason: "Your supporting reason",
  hydrogen: "Your H₂ coefficient",
  oxygen: "Your O₂ coefficient",
  water: "Your H₂O coefficient",
  source: "Your selected source",
  evidence: "Your comparison evidence",
  claim: "Your supported chemical claim",
};
const fields: Record<CellsMode, string[]> = {
  setup: ["left", "right", "liquid", "volts"],
  series: ["count", "connection", "reversed", "volts"],
  restore: ["action", "reason"],
  reaction: ["hydrogen", "oxygen", "water"],
  compare: ["source", "evidence", "reason"],
  evidence: ["claim", "reason"],
};
const names: Record<string, string> = {
  unset: "Choose your prediction",
  copper: "Copper",
  zinc: "Zinc",
  magnesium: "Magnesium",
  cobalt: "Cobalt",
  "sodium-chloride": "Sodium chloride solution",
  "copper-sulfate": "Copper sulfate solution",
  "distilled-water": "Specified distilled-water comparison",
  series: "In series",
  parallel: "In parallel",
  unconnected: "Unconnected",
  "replace-cell": "Replace the specified primary cell",
  "primary-not-designed-to-reverse":
    "Its primary-cell reaction is not designed to be reversed",
  "external-electrical-supply": "Use the specified external electrical supply",
  "reverse-cell-reactions":
    "Electrical energy reverses the rechargeable cell's reactions",
  "restore-hydrogen-feed": "Restore the specified hydrogen feed",
  "continual-reactant-supply": "Fuel must continue to be supplied",
  "restore-oxygen-feed": "Restore the specified oxygen feed",
  "both-reactants-needed": "Both hydrogen and oxygen are reactants",
  "close-load-circuit": "Complete the external load circuit",
  "voltage-does-not-guarantee-current":
    "Potential difference can exist without current through an open load circuit",
  "add-water": "Add arbitrary water",
  "create-reactants-from-nothing": "Create reactants from nothing",
  "all-cells-refuel": "Every cell is restored by refuelling",
  "no-chemical-change": "No chemical reactions are involved",
  "fuel-cell": "Hydrogen fuel-cell system",
  rechargeable: "Rechargeable battery",
  neither: "Neither supplied source",
  "fuel-meets-both-limits":
    "Fuel system meets both stated range and restoration limits",
  "battery-fails-range-and-time": "Battery fails both required limits",
  "battery-meets-range-and-cheaper":
    "Battery meets the required range at the lower stated cost",
  "both-have-time-and-infrastructure":
    "Both have sufficient restoration time and compatible local infrastructure",
  "battery-has-local-supply":
    "Battery has an available compatible local supply",
  "fuel-feed-unavailable": "Required hydrogen supply is unavailable",
  "both-below-required-range":
    "Both have less than the required non-stop range",
  "must-meet-stated-constraint": "The non-stop range requirement must be met",
  "fuel-always-best": "Fuel cells are always the best choice",
  "ignore-constraints": "Ignore the stated constraints",
  "water-only-new-product": "Water is the only new chemical product",
  "hydrogen-and-oxygen-form-water": "Hydrogen and oxygen react to form water",
  "lifecycle-not-carbon-free": "The stated lifecycle is not carbon-free",
  "production-emissions-count":
    "The supplied production process releases carbon dioxide",
  "production-can-use-renewable-energy":
    "The specified production can use renewable energy",
  "full-lifecycle-not-established":
    "Unreported manufacturing and transport effects remain unknown",
  "match-solution-concentration-temperature":
    "Match solution concentration and solution temperature",
  "metal-varied-voltage-measured": "MetalX is varied; voltage is measured",
  "wire-electrons-electrolyte-ions":
    "Electrons in the wire; ions in the electrolyte",
  "different-conduction-paths":
    "The external wire and electrolyte conduct differently",
  "feeds-do-not-imply-infinite-life":
    "Continuing feeds do not guarantee infinite stack life",
  "components-can-degrade":
    "Components can degrade despite replenished reactants",
  "all-outlet-gases-water": "Every outlet substance must be water",
  "no-emissions-ever": "No emissions anywhere in the lifecycle",
  "voltage-is-current": "Voltage is the same quantity as current",
  "electricity-creates-elements": "Electricity creates new elements",
  "hydrogen-always-renewable": "Every hydrogen supply is renewable",
};
export function CellsWorkbench({
  mode,
  record = "initial",
  instruction,
  history,
  onChange,
}: {
  mode: CellsMode;
  record?: string;
  instruction: string;
  history: Board[];
  onChange: (h: Board[]) => void;
}) {
  const b = history.at(-1) ?? initialCellsBoard(mode, record),
    key = String(b.record);
  const records = cellsRecords[mode] as Record<string, { label: string }>;
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  function change(k: string, v: string) {
    if (b[k] === v) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    if (k === "record") setRaw({});
    onChange([
      ...history,
      k === "record" ? initialCellsBoard(mode, v) : { ...b, [k]: v },
    ]);
  }
  function control(k: string) {
    return (
      <label key={k}>
        {labels[k]}
        {cellsOptions[mode][k] ? (
          <select
            aria-label={labels[k]}
            value={b[k]}
            onChange={(e) => change(k, e.target.value)}
          >
            {cellsOptions[mode][k].map((v) => (
              <option key={v} value={v}>
                {names[v] ?? v}
              </option>
            ))}
          </select>
        ) : (
          <input
            aria-label={labels[k]}
            inputMode="decimal"
            value={raw[k] ?? String(b[k])}
            onChange={(e) => {
              const v = e.target.value;
              setRaw({ ...raw, [k]: v });
              setFeedback("");
              if (validCellsNumber(v)) change(k, v);
            }}
          />
        )}
        {cellsOptions[mode][k] &&
          b[k] !== "unset" &&
          (names[String(b[k])] ?? "").length > 30 && (
            <span className="cells-selected-text">
              Your selection: {names[String(b[k])]}
            </span>
          )}
      </label>
    );
  }
  const series =
    mode === "series"
      ? cellsRecords.series[key as keyof typeof cellsRecords.series]
      : null;
  const count = Number(b.count),
    reversed = Number(b.reversed);
  const shownCells =
    series && Number.isInteger(count) && count >= 0 && count <= 12
      ? Array.from({ length: count }, (_, i) => i)
      : [];
  const h = Number(b.hydrogen),
    o = Number(b.oxygen),
    w = Number(b.water);
  return (
    <section
      className="model task-workbench cells-workbench"
      aria-label="Task model"
    >
      <h3>{titles[mode]}</h3>
      {control(fields[mode][0])}
      <p>{instruction}</p>
      <details>
        <summary>Choose another supplied case</summary>
        <label>
          Supplied cells investigation
          <select
            aria-label="Supplied cells investigation"
            value={key}
            onChange={(e) => change("record", e.target.value)}
          >
            {Object.entries(records).map(([k, r]) => (
              <option key={k} value={k}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </details>
      <p className="model-context">{records[key].label}</p>
      {mode === "compare" && (
        <CellsComparison
          sources={[
            {
              label: "Fuel cell",
              rangeKm: 450,
              restorationMinutes: 5,
              tripCostPounds: 60,
            },
            {
              label: "Battery",
              rangeKm: 300,
              restorationMinutes: 40,
              tripCostPounds: 9,
            },
          ]}
        />
      )}
      {mode === "compare" && (
        <p className="cells-selected-text">
          These supplied values support this comparison; they are not current
          market prices or universal source properties.
        </p>
      )}
      {fields[mode].slice(1).map(control)}
      {mode === "setup" && (
        <figure className="cell-apparatus">
          <svg
            viewBox="0 0 500 350"
            role="img"
            aria-label={`Your proposed cell: ${names[String(b.left)] ?? "unselected left plate"}, ${names[String(b.right)] ?? "unselected right plate"}; ${names[String(b.liquid)] ?? "unselected electrolyte"}. Predicted voltage${b.volts}V; this is your prediction, not a measurement.`}
          >
            <path
              d="M110 120V315H390V120"
              fill="none"
              stroke="#8295ad"
              strokeWidth="5"
            />
            <path
              d="M114 185H386V310H114Z"
              fill={b.liquid === "copper-sulfate" ? "#c1dcef" : "#e4f1f5"}
            />
            <path
              d="M160 140V55H205M340 140V55H295"
              fill="none"
              stroke="#3848bf"
              strokeWidth="5"
            />
            <circle
              cx="250"
              cy="55"
              r="43"
              fill="white"
              stroke="#273249"
              strokeWidth="3"
            />
            <text x="250" y="67" textAnchor="middle" fontSize="32">
              V
            </text>
            <rect
              x="145"
              y="120"
              width="30"
              height="155"
              fill={b.left === "copper" ? "#bb713e" : "#8798b2"}
            />
            <rect
              x="325"
              y="120"
              width="30"
              height="155"
              fill={b.right === "copper" ? "#bb713e" : "#8798b2"}
            />
            <text x="90" y="110" fontSize="28">
              Left plate
            </text>
            <text x="300" y="110" fontSize="28">
              Right plate
            </text>
            <text x="250" y="245" textAnchor="middle" fontSize="28">
              Electrolyte
            </text>
          </svg>
          <figcaption>
            The plates are separate and immersed. Labels and your selections
            describe the proposed apparatus; your predicted voltage is not an
            automatically supplied reading.
          </figcaption>
        </figure>
      )}
      {series && (
        <figure>
          <div
            className="cells-series-diagram"
            role="img"
            aria-label={`Your proposed ${names[String(b.connection)] ?? "unselected connection"}: ${count} cells, ${reversed} reversed. Each supplied cell${series.cell}V. Your predicted net voltage${b.volts}V.`}
          >
            {shownCells.map((i) => (
              <span
                key={i}
                className="cells-battery"
                data-reversed={i < reversed}
              >
                {i < reversed ? "+ | −" : "− | +"}
                <small>{series.cell}V</small>
              </span>
            ))}
          </div>
          <figcaption>
            {Number.isInteger(count) && count >= 0 && count <= 12
              ? "Polarity shows your entered reversed-cell count; choose the connection separately."
              : "Your cell count is retained. The diagram displays whole counts from0 to12; use the written prediction for other entries."}{" "}
            Net voltage remains your own prediction.
          </figcaption>
        </figure>
      )}
      {series && shownCells.length > 0 && (
        <details>
          <summary>Inspect your proposed electrical connections</summary>
          <svg
            className="cells-circuit"
            viewBox={`0 0 500 ${shownCells.length * 78 + 70}`}
            role="img"
            aria-label={`Connection schematic for your ${count} supplied cells: ${names[String(b.connection)] ?? "no connection selected"}, ${reversed} reversed. The terminal voltage remains your prediction.`}
          >
            {shownCells.map((i) => {
              const y = 50 + i * 78,
                reverse = i < reversed;
              return (
                <g key={i}>
                  {b.connection === "series" && (
                    <>
                      <path
                        d={`M150 ${y - 35}V${y - 10}M150 ${y + 10}V${y + 43}`}
                        stroke="#35415a"
                        strokeWidth="4"
                      />
                      <path
                        d={`M${reverse ? 137 : 120} ${y - 8}H${reverse ? 163 : 180}M${reverse ? 120 : 137} ${y + 8}H${reverse ? 180 : 163}`}
                        stroke="#35415a"
                        strokeWidth="5"
                      />
                    </>
                  )}
                  {b.connection === "parallel" && (
                    <>
                      <path
                        d={`M70 15V${shownCells.length * 78 + 25}M210 15V${shownCells.length * 78 + 25}M70 ${y}H132M158 ${y}H210`}
                        stroke="#35415a"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        d={`M${reverse ? 155 : 135} ${y - 20}V${y + 20}M${reverse ? 135 : 155} ${y - 10}V${y + 10}`}
                        stroke="#35415a"
                        strokeWidth="5"
                      />
                    </>
                  )}
                  {(b.connection === "unset" ||
                    b.connection === "unconnected") && (
                    <path
                      d={`M135 ${y - 20}V${y + 20}M155 ${y - 10}V${y + 10}`}
                      stroke="#35415a"
                      strokeWidth="5"
                    />
                  )}
                  <text x="245" y={y + 8} fontSize="28">
                    Cell {i + 1}: {reverse ? "reversed" : "forward"}
                  </text>
                  <text x="245" y={y + 36} fontSize="26">
                    {series.cell} V
                  </text>
                </g>
              );
            })}
          </svg>
          <p>
            The connection and polarity are your proposed state. Opposing and
            mismatched connections are ideal comparisons, not instructions for
            building a real battery. Parallel connections do not add the cell
            voltages in series.
          </p>
        </details>
      )}
      {mode === "reaction" && (
        <div className="cells-atom-ledger">
          <p aria-label="Your proposed overall equation">
            {b.hydrogen}H₂ + {b.oxygen}O₂ → {b.water}H₂O
          </p>
          <table>
            <caption>Atom counts from your entered coefficients</caption>
            <thead>
              <tr>
                <th>Element</th>
                <th>Reactants</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>H</th>
                <td>{2 * h}</td>
                <td>{2 * w}</td>
              </tr>
              <tr>
                <th>O</th>
                <td>{2 * o}</td>
                <td>{w}</td>
              </tr>
            </tbody>
          </table>
          <p>
            The fixed formulas stay H₂, O₂ and H₂O. Check both elements and the
            requested coefficient scale.
          </p>
        </div>
      )}
      <div className="bench-actions">
        <button
          type="button"
          className="button"
          onClick={() => {
            if (
              Object.entries(raw).some(
                ([k, v]) => !validCellsNumber(v) || v !== String(b[k]),
              )
            ) {
              setCorrect(false);
              setFeedback(
                "Enter a valid decimal prediction before checking. Your unfinished input remains visible.",
              );
              return;
            }
            const result = cellsPrediction(mode, b);
            setCorrect(result.correct);
            setFeedback(result.explanation);
          }}
        >
          Check model
        </button>
        <button
          type="button"
          className="text-button"
          disabled={history.length <= 1}
          onClick={() => {
            setRaw({});
            setFeedback("");
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setRaw({});
            setFeedback("");
            onChange([initialCellsBoard(mode, record)]);
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
          {correct ? "Your prediction matches. " : "Review your prediction. "}
          {feedback}
        </p>
      )}
      {mode === "setup" &&
        b.left !== "unset" &&
        b.right !== "unset" &&
        b.liquid !== "unset" && (
          <details>
            <summary>Inspect the real 3D simple cell</summary>
            <SimpleCell3D
              left={b.left as "copper" | "zinc" | "magnesium" | "cobalt"}
              right={b.right as "copper" | "zinc" | "magnesium" | "cobalt"}
              liquid={String(b.liquid)}
            />
          </details>
        )}
      <details>
        <summary>About this model</summary>
        <p>
          Supplied data and an ideal series model support chemical reasoning.
          They do not predict every real cell voltage, current, capacity or
          lifetime. Actual experiments require school supervision. Written
          evaluation is self-reviewed.
        </p>
      </details>
    </section>
  );
}
