"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  aqueousChoices,
  aqueousExpected,
  aqueousPrediction,
  aqueousRecords,
  initialAqueousBoard,
  type AqueousMode,
} from "@/lib/aqueous-products";
import { CopperTransfer3D } from "./CopperTransfer3D";
const labels: Record<string, string> = {
  Cu: "Copper, Cu",
  Ag: "Silver, Ag",
  Na: "Sodium, Na",
  Mg: "Magnesium, Mg",
  K: "Potassium, K",
  H2: "Hydrogen, H2",
  O2: "Oxygen, O2",
  Cl2: "Chlorine, Cl2",
  Br2: "Bromine, Br2",
  "Cl−": "Chloride ion, Cl−",
  SO4: "Sulfate as a supposed product",
  "metal-below-hydrogen": "Metal is below hydrogen in the supplied series",
  "water-competes": "Water-derived species give hydrogen instead",
  "no-water": "Molten binary salt: no water is present",
  "salt-metal-always": "The salt's metal always forms, even in water",
  "copper-dissolves": "Copper dissolves from the positive anode",
  "oxygen-forms": "Oxygen forms at the inert anode",
  "copper-deposits": "Copper deposits at the positive anode",
  "no-change": "No anode reaction",
  "copper-ions-replenished":
    "Copper ions are replenished; concentration approximately unchanged at fixed volume",
  "copper-ions-decrease": "Copper ions decrease at fixed volume",
  "copper-ions-increase": "Copper ions increase at fixed volume",
  "hydrogen-only": "Hydrogen only",
  "chlorine-only": "Chlorine only",
  both: "Both lines",
  neither: "Neither line",
  "pop-and-relight":
    "Cathode gas gives a squeaky pop; anode gas relights a glowing splint",
  "bubbles-only": "Only colourless bubbles are reported",
  "controlled-comparison":
    "Only electrode material changes under comparable conditions",
  "several-changes": "Electrode material, current and duration change",
  "hypothesis-supported": "Supplied gas tests support the hypothesis",
  "identity-not-established":
    "Gas formation is observed; identities remain unestablished",
  "material-effect-comparable":
    "The comparison can investigate electrode material",
  "material-effect-not-isolated":
    "The electrode material effect is not isolated",
  "bubbles-prove-hydrogen": "Bubbles alone prove hydrogen",
};
const fields: Record<AqueousMode, [string, string][]> = {
  reading: [],
  cathode: [
    ["product", "Your cathode product"],
    ["reason", "Your cathode reason"],
  ],
  products: [
    ["cathode", "Your aqueous cathode product"],
    ["anode", "Your aqueous anode product"],
  ],
  transfer: [
    ["anode", "Your anode change"],
    ["solution", "Your copper-ion change"],
  ],
  graph: [
    ["direct", "Your direct-proportion classification"],
    ["positive", "Your positive-correlation classification"],
  ],
  investigation: [
    ["observation", "Your observation summary"],
    ["decision", "Your evidence decision"],
  ],
};
const headings: Record<AqueousMode, string> = {
  reading: "Read the inverted gas cylinder",
  cathode: "Metal or hydrogen?",
  products: "Predict both aqueous products",
  transfer: "Track electrode and solution copper",
  graph: "Read and classify collected gas",
  investigation: "Evaluate the supplied practical evidence",
};
const hints: Record<AqueousMode, string> = {
  reading:
    "The printed inverted gas scale increases downwards. Each small interval is 0.2 cm³. Read the gas–water boundary; do not reverse the scale or count the water as collected gas.",
  cathode:
    "In the standard aqueous GCSE model, a metal below hydrogen deposits; a metal above hydrogen gives hydrogen from water-derived species. The molten binary case has no water.",
  products:
    "Use the stated inert electrodes, reactivity and electrolyte. Standard GCSE halide cases give a halogen at anode; other supplied sulfate/nitrate cases give oxygen. Name neutral products.",
  transfer:
    "An active copper anode supplies copper ions, unlike an inert anode producing oxygen. Matched copper transfer at fixed volume replenishes what the cathode removes.",
  graph:
    "Read the hydrogen line at the supplied time. Direct proportion needs a straight line through the origin; positive correlation means volume increases as time increases. Collected volume does not uniquely identify a loss mechanism.",
  investigation:
    "Match supplied diagnostic tests to gas identities. Bubbles alone do not identify a gas. To investigate electrode material, control the other stated variables.",
};
export function AqueousProductsWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: AqueousMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialAqueousBoard(mode),
    key = String(b.record),
    records = aqueousRecords[mode] as Record<string, { label: string }>,
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
    onChange([
      ...history,
      {
        ...b,
        [field]: value,
        ...(mode === "graph" && field === "record"
          ? { volume: "0" }
          : mode === "reading" && field === "record"
            ? { ticks: "0" }
            : {}),
      },
    ]);
  }
  const select = (f: string, l: string) => (
    <label key={f}>
      {l}
      <select
        aria-label={l}
        value={b[f]}
        onChange={(e) => change(f, e.target.value)}
      >
        {aqueousChoices[mode][f].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : f === "record"
                ? records[v].label
                : (labels[v] ?? v)}
          </option>
        ))}
      </select>
      {f !== "record" && b[f] !== "unset" && (
        <span className="metal-selected">
          Selected: {labels[String(b[f])] ?? String(b[f])}
        </span>
      )}
    </label>
  );
  function check() {
    const p = aqueousPrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete every prediction before checking."
        : p.correct
          ? mode === "reading"
            ? "That’s right. Gas volume: " +
              (Number(b.ticks) / 5).toFixed(1) +
              " cm³. Read the printed scale: values increase downwards in 0.2 cm³ intervals."
            : "That's right. " +
              Object.entries(aqueousExpected(mode, b))
                .map(
                  ([k, v]) =>
                    (k === "ticks"
                      ? "Scale steps of 0.2 cm³"
                      : k === "volume"
                        ? "Hydrogen volume / cm³"
                        : fields[mode].find(([f]) => f === k)?.[1]) +
                    ": " +
                    (labels[v] ?? v),
                )
                .join("; ") +
              "."
          : "Not yet. " + hints[mode],
    );
  }
  return (
    <section
      className="model task-workbench aqueous-products-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "graph" && (
        <div className="electrolysis-ion-controls">
          <button
            className="button particle-choice"
            disabled={Number(b.volume) <= 0}
            onClick={() => change("volume", String(Number(b.volume) - 1))}
          >
            ↓ Move reading down 1 cm³
          </button>
          <button
            className="button particle-choice"
            disabled={Number(b.volume) >= 10}
            onClick={() => change("volume", String(Number(b.volume) + 1))}
          >
            ↑ Move reading up 1 cm³
          </button>
        </div>
      )}
      {mode === "reading" && (
        <div className="electrolysis-ion-controls">
          <button
            className="button particle-choice"
            disabled={Number(b.ticks) <= 0}
            onClick={() => change("ticks", String(Number(b.ticks) - 1))}
          >
            ↑ Move reading up 0.2 cm³
          </button>
          <button
            className="button particle-choice"
            disabled={Number(b.ticks) >= 40}
            onClick={() => change("ticks", String(Number(b.ticks) + 1))}
          >
            ↓ Move reading down 0.2 cm³
          </button>
        </div>
      )}
      <div className="metal-predictions">
        {fields[mode].map(([f, l]) => select(f, l))}
      </div>
      {select("record", "Explore a supplied aqueous record")}
      <p className="metal-record">{records[key].label}.</p>
      <p className="position-caption">
        Use the record stated in the answer task. Changing this model does not
        change that question.
      </p>
      {mode === "graph" &&
        (() => {
          const r =
              aqueousRecords.graph[key as keyof typeof aqueousRecords.graph],
            x = (t: number) => 68 + t * 18,
            y = (v: number) => 280 - v * 23,
            chlorine: [
              [number, number],
              [number, number],
              [number, number],
              [number, number],
              [number, number],
            ] = [
              [0, 0],
              [4, 0.1],
              [8, 0.7],
              [12, 2.4],
              [16, 4.4],
            ];
          return (
            <figure className="aqueous-gas-graph">
              <p>
                Your hydrogen reading at {r.time} minutes:{" "}
                <strong>{b.volume} cm³</strong>.
              </p>
              <svg
                viewBox="0 0 400 365"
                role="img"
                aria-label={
                  "Illustrative hydrogen and chlorine gas collection; your hydrogen marker at " +
                  r.time +
                  " minutes and " +
                  b.volume +
                  " cm³"
                }
              >
                {[0, 2, 4, 6, 8, 10].map((v) => (
                  <g key={v}>
                    <line
                      x1="68"
                      x2="356"
                      y1={y(v)}
                      y2={y(v)}
                      stroke="#d9dfeb"
                    />
                    <text x="53" y={y(v) + 7} textAnchor="end" fontSize="24">
                      {v}
                    </text>
                  </g>
                ))}
                {[0, 4, 8, 12, 16].map((t) => (
                  <g key={t}>
                    <line
                      x1={x(t)}
                      x2={x(t)}
                      y1="50"
                      y2="280"
                      stroke="#d9dfeb"
                    />
                    <text x={x(t)} y="311" textAnchor="middle" fontSize="24">
                      {t}
                    </text>
                  </g>
                ))}
                <path
                  d={
                    "M " +
                    x(0) +
                    " " +
                    y(r.offset ? 2 : 0) +
                    " L " +
                    x(16) +
                    " " +
                    y(r.offset ? 10 : 8)
                  }
                  fill="none"
                  stroke="#3349c6"
                  strokeWidth="4"
                />
                <polyline
                  points={chlorine.map(([t, v]) => x(t) + "," + y(v)).join(" ")}
                  fill="none"
                  stroke="#0c827d"
                  strokeWidth="4"
                  strokeDasharray="8 5"
                />
                <circle
                  cx={x(r.time)}
                  cy={y(Number(b.volume))}
                  r="9"
                  fill="#d8a332"
                  stroke="#6d5217"
                  strokeWidth="2"
                />
                <text x="212" y="354" textAnchor="middle" fontSize="24">
                  Time / minutes
                </text>
                <text x="68" y="29" fontSize="24">
                  Collected volume / cm³
                </text>
              </svg>
              <figcaption>
                Hydrogen: solid blue line. Chlorine: dashed green line. Gold:
                your reading, including an incorrect reading. Original
                illustrative data, not a reproduced exam graph or universal
                gas-collection curve.
              </figcaption>
              <table>
                <caption>Supplied collected volumes / cm³</caption>
                <thead>
                  <tr>
                    <th scope="col">Time / min</th>
                    <th scope="col">Hydrogen</th>
                    <th scope="col">Chlorine</th>
                  </tr>
                </thead>
                <tbody>
                  {chlorine.map(([t, v]) => (
                    <tr key={t}>
                      <th scope="row">{t}</th>
                      <td>{t / 2 + (r.offset ? 2 : 0)}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </figure>
          );
        })()}
      {mode === "transfer" && key === "initial" && <CopperTransfer3D />}
      {mode === "transfer" && key !== "initial" && (
        <p>
          The selected-atom copper-electrode reference is hidden for this
          changed record. Use its stated electrode material and assumptions; an
          inert anode does not supply copper.
        </p>
      )}
      {mode === "reading" &&
        (() => {
          const r =
              aqueousRecords.reading[
                key as keyof typeof aqueousRecords.reading
              ],
            y = (ticks: number) => 40 + ticks * 6.5,
            reading = Number(b.ticks) / 5;
          return (
            <figure className="aqueous-inverted-scale">
              <p>
                Your gas-volume reading:{" "}
                <strong>{reading.toFixed(1)} cm³</strong>. Each small interval
                is 0.2 cm³.
              </p>
              <svg
                viewBox="0 0 400 360"
                role="img"
                aria-label={
                  "Inverted cylinder; gas–water boundary at " +
                  (r.ticks / 5).toFixed(1) +
                  " cm³; your gold reading " +
                  reading.toFixed(1) +
                  " cm³"
                }
              >
                <rect
                  x="125"
                  y="40"
                  width="125"
                  height="260"
                  fill="#fff"
                  stroke="#7785a0"
                  strokeWidth="3"
                />
                <rect
                  x="128"
                  y={y(r.ticks)}
                  width="119"
                  height={300 - y(r.ticks)}
                  fill="#d9e8fc"
                />
                <line
                  x1="128"
                  x2="247"
                  y1={y(r.ticks)}
                  y2={y(r.ticks)}
                  stroke="#3349c6"
                  strokeWidth="3"
                />
                {Array.from({ length: 41 }, (_, i) => (
                  <g key={i}>
                    <line
                      x1="125"
                      x2={i % 5 === 0 ? 151 : 139}
                      y1={y(i)}
                      y2={y(i)}
                      stroke="#54617b"
                    />
                    {i % 5 === 0 && (
                      <text x="111" y={y(i) + 7} textAnchor="end" fontSize="24">
                        {i / 5}
                      </text>
                    )}
                  </g>
                ))}
                <path
                  d={"M 266 " + y(Number(b.ticks)) + " l 16 -8 v 16 z"}
                  fill="#d8a332"
                  stroke="#6d5217"
                />
                <text x="190" y="333" textAnchor="middle" fontSize="24">
                  Gas scale / cm³
                </text>
              </svg>
              <figcaption>
                Gas lies above the blue gas–water boundary; water lies below it.
                Printed volume increases downwards. Gold marker is your reading
                and retains errors. Supplied upright image of an inverted
                gas-collection cylinder; simplified flat boundary and
                illustrative dimensions.
              </figcaption>
            </figure>
          );
        })()}
      {mode === "cathode" && (
        <p>
          Supplied series for these records: sodium and magnesium above
          hydrogen; copper and silver below hydrogen. The molten sodium record
          has no water.
        </p>
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
        <p>{hints[mode]}</p>
        <p>
          Supplied Foundation product, electrode and practical-evidence records.
          Real product competition can depend on concentration, electrode
          material and operating conditions. Practical observations are provided
          for interpretation; real chemical experiments require qualified school
          supervision.
        </p>
      </details>
    </section>
  );
}
