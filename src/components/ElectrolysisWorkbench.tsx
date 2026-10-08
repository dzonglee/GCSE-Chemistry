"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  electrolysisChoices,
  electrolysisExpected,
  electrolysisPrediction,
  electrolysisRecords,
  initialElectrolysisBoard,
  type ElectrolysisMode,
} from "@/lib/electrolysis";
import { MoltenElectrolysis3D } from "./MoltenElectrolysis3D";
const labels: Record<string, string> = {
  cathode: "Negative cathode",
  anode: "Positive anode",
  "container-wall": "Container wall",
  "not-mobile-ionic": "No mobile ionic conduction in this supplied record",
  "ionic-electrolyte": "Ionic electrolyte",
  "metallic-conductor": "Metal conductor, not an ionic electrolyte",
  "fixed-ions": "Ions present but fixed in the solid lattice",
  "mobile-ions": "Mobile ions in melt or solution",
  "mobile-electrons": "Delocalised electrons in the metal",
  "no-supplied-mobile-ions": "No supplied useful mobile-ion population",
  Zn: "Zinc, Zn",
  Pb: "Lead, Pb",
  Na: "Sodium, Na",
  Ca: "Calcium, Ca",
  K: "Potassium, K",
  H2: "Hydrogen, H2",
  Cl2: "Chlorine, Cl2",
  Br2: "Bromine, Br2",
  O2: "Oxygen, O2",
  "Zn2+": "Zinc ion, Zn2+",
  "Cl−": "Chloride ion, Cl−",
  "lower-operating-temperature": "Lower the operating temperature",
  "carbon-cannot-reduce-oxide":
    "Carbon cannot reduce the aluminium oxide in the supplied GCSE model",
  "water-competes": "Water-derived ions compete in the supplied aqueous case",
  "cryolite-eliminates-current": "Cryolite removes the need for current",
  "carbon-is-more-reactive": "Carbon is more reactive than aluminium",
  "heating-and-current-still-needed":
    "Heating and electric current remain needed",
  "not-valid-aluminium-production":
    "This supplied aqueous route does not produce aluminium",
  "no-heating-or-current": "No heating or current needed",
  "carbon-consumed": "Carbon is consumed in the oxygen reaction",
  "not-consumed-in-this-record":
    "Genuinely inert electrode is not consumed in this supplied record",
  "carbon-just-melts": "Carbon only melts; no chemical consumption",
  "replace-carbon-anode": "Replace the consumed carbon anode",
  "no-carbon-oxygen-replacement-reason":
    "No carbon/oxygen consumption reason in this supplied inert case",
  "replace-cathode-instead": "Replace the cathode instead",
};
const fields: Record<ElectrolysisMode, [string, string][]> = {
  movement: [["electrode", "Your destination electrode"]],
  conductivity: [
    ["conduction", "Your conduction classification"],
    ["carrier", "Your charge carrier"],
  ],
  products: [
    ["cathode", "Your final cathode product"],
    ["anode", "Your final anode product"],
  ],
  mixture: [
    ["reason", "Your process reason"],
    ["energy", "Your continuing energy requirement"],
  ],
  anode: [
    ["change", "Your anode material change"],
    ["action", "Your replacement decision"],
  ],
};
const headings: Record<ElectrolysisMode, string> = {
  movement: "Move the supplied ion",
  conductivity: "Distinguish mobile charge carriers",
  products: "Predict both molten products",
  mixture: "Explain the molten mixture",
  anode: "Track carbon anode consumption",
};
const hints: Record<ElectrolysisMode, string> = {
  movement:
    "Cations move toward the negative cathode, anions toward the positive anode. Read polarity; page side can reverse. Move the ion to the appropriate electrode and predict its name.",
  conductivity:
    "Ions carry charge in the melt or ionic solution; electrons carry it through metal wire. Solid ionic compounds contain fixed ions. Use the supplied material and phase.",
  products:
    "This is a molten binary ionic compound with inert electrodes and no water. The cathode product is the neutral metal and the anode product the neutral non-metal. Starting ions are not the final neutral products.",
  mixture:
    "Cryolite allows lower operating temperature, but current and heating remain needed. Carbon cannot reduce aluminium oxide in the supplied GCSE model; an aqueous route has water-derived competition.",
  anode:
    "In the supplied simplified record, oxygen reacts with carbon to form CO2; carbon is consumed and the anode needs replacement. Do not apply this consumption to a genuinely inert electrode.",
};
export function ElectrolysisWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: ElectrolysisMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialElectrolysisBoard(mode),
    key = String(b.record),
    records = electrolysisRecords[mode] as Record<string, { label: string }>,
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
        ...(mode === "movement" && field === "record" ? { position: "0" } : {}),
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
        {electrolysisChoices[mode][f].map((v) => (
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
    const p = electrolysisPrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete every prediction before checking."
        : p.correct
          ? "That's right. " +
            Object.entries(electrolysisExpected(mode, b))
              .map(
                ([k, v]) =>
                  (k === "position"
                    ? "Schematic destination position"
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
      className="model task-workbench electrolysis-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "movement" && (
        <div className="electrolysis-ion-controls">
          <button
            className="button particle-choice"
            disabled={Number(b.position) <= -3}
            onClick={() => change("position", String(Number(b.position) - 1))}
          >
            ← Move ion one step left
          </button>
          <button
            className="button particle-choice"
            disabled={Number(b.position) >= 3}
            onClick={() => change("position", String(Number(b.position) + 1))}
          >
            Move ion one step right →
          </button>
        </div>
      )}
      <div className="metal-predictions">
        {fields[mode].map(([f, l]) => select(f, l))}
      </div>
      {select("record", "Explore a supplied electrolysis record")}
      <p className="metal-record">{records[key].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing the model
        explores another supplied case.
      </p>
      {mode === "movement" &&
        (() => {
          const r =
              electrolysisRecords.movement[
                key as keyof typeof electrolysisRecords.movement
              ],
            reversed = key === "reversed" || key === "bromide",
            position = Number(b.position),
            x = 60 + ((position + 3) * 280) / 6;
          return (
            <figure className="electrolysis-movement">
              <div className="metal-state-labels">
                <strong>
                  {reversed ? "Left: positive anode" : "Left: negative cathode"}
                </strong>
                <strong>
                  {reversed
                    ? "Right: negative cathode"
                    : "Right: positive anode"}
                </strong>
              </div>
              <svg
                viewBox="0 0 400 170"
                role="img"
                aria-label={
                  r.ion +
                  " at schematic position " +
                  position +
                  " between the labelled electrodes"
                }
              >
                <line
                  x1="60"
                  x2="340"
                  y1="100"
                  y2="100"
                  stroke="#a7b2c7"
                  strokeWidth="3"
                />
                {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
                  <g key={v}>
                    <line
                      x1={60 + ((v + 3) * 280) / 6}
                      x2={60 + ((v + 3) * 280) / 6}
                      y1="94"
                      y2="106"
                      stroke="#66738a"
                    />
                    <text
                      x={60 + ((v + 3) * 280) / 6}
                      y="143"
                      textAnchor="middle"
                      fontSize="24"
                    >
                      {v}
                    </text>
                  </g>
                ))}
                <rect x="43" y="35" width="15" height="80" fill="#6b7993" />
                <rect x="342" y="35" width="15" height="80" fill="#6b7993" />
                <circle
                  cx={x}
                  cy="67"
                  r="16"
                  fill={r.ion === "Zn2+" ? "#7184b5" : "#3caa72"}
                />
                <text x={x} y="27" textAnchor="middle" fontSize="24">
                  {r.ion}
                </text>
              </svg>
              <figcaption>
                {r.ion} is at schematic position {position}. Coordinate sign
                means left/right displacement, not ion charge. Electrode
                polarity controls the destination; opposite charges attract.
              </figcaption>
              <p className="position-caption">
                One-step positions are a learning aid, not exact distances,
                times, straight microscopic paths or a complete circuit.
                Movement retains ion identity; discharge is a separate electrode
                change.
              </p>
            </figure>
          );
        })()}
      {mode === "products" && key === "initial" && <MoltenElectrolysis3D />}
      {mode === "products" && key !== "initial" && (
        <p>
          The ZnCl2 reference is hidden for this changed salt. Use its stated
          binary ions and molten phase to predict both neutral element products.
        </p>
      )}
      {mode === "anode" && key === "identity" && (
        <p>
          Supplied simplified record: 12 g carbon + 32 g oxygen → 44 g CO2. The
          anode loses 12 g carbon, not the full 44 g product mass. Other
          industrial gases are outside this record.
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
          Foundation process, molten product and extraction reasoning. Detailed
          aqueous competition, practical investigation and Higher half equations
          need separate lessons. This simulation does not certify practical or
          exam readiness.
        </p>
      </details>
    </section>
  );
}
