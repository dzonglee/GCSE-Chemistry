"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import { VoltageCell3D } from "./VoltageCell3D";
import { VoltageTable } from "./VoltageComparison";
import {
  voltageRecords,
  voltageOptions,
  initialVoltageBoard,
  validVoltageNumber,
  voltagePrediction,
  type VoltageMode,
} from "@/lib/cell-voltage";
type Board = Record<string, string | number>;
const titles: Record<VoltageMode, string> = {
  read: "Read the table",
  lead: "Reconnect the meter",
  infer: "Place relative levels",
  rank: "Order the metals",
  evidence: "Check the evidence",
};
const fields: Record<VoltageMode, string[]> = {
  read: ["row", "column", "volts", "magnitude", "moreActive"],
  lead: [
    "red",
    "black",
    "volts",
    "magnitude",
    "moreActive",
    "electronFrom",
    "electronTo",
  ],
  infer: [
    "firstLevel",
    "secondLevel",
    "operation",
    "volts",
    "magnitude",
    "moreActive",
  ],
  rank: ["rank1", "rank2", "rank3", "rank4", "rank5"],
  evidence: ["claim", "reason"],
};
const labels: Record<string, string> = {
  row: "Your selected metal1 row",
  column: "Your selected metal2 column",
  volts: "Your predicted signed reading / V",
  magnitude: "Your predicted magnitude / V",
  moreActive: "Your more reactive electrode",
  red: "Your red positive meter lead",
  black: "Your black COM meter lead",
  electronFrom: "Your discharge electron source",
  electronTo: "Your discharge electron destination",
  firstLevel: "Your first reference reading / V",
  secondLevel: "Your second reference reading / V",
  operation: "Your comparison operation",
  rank1: "Your most reactive metal",
  rank2: "Your second metal",
  rank3: "Your third metal",
  rank4: "Your fourth metal",
  rank5: "Your least reactive metal",
  claim: "Your supported claim",
  reason: "Your supporting reason",
};
const names: Record<string, string> = {
  unset: "Choose your prediction",
  metal1: "Metal1",
  metal2: "Metal2",
  first: "First target electrode",
  second: "Second target electrode",
  equal: "No relative-reactivity difference",
  none: "No net cell-driven direction",
  "first-minus-second": "First reference reading minus second",
  "second-minus-first": "Second reference reading minus first",
  "add-both": "Add both reference readings",
  "reading-sign-changes-cell-chemistry-does-not":
    "Reading sign changes; cell chemistry does not",
  "terminal-order-changes-measured-difference":
    "Terminal order changes the measured difference",
  "do-not-assume-one-unchanged-comparison":
    "Do not assume one unchanged comparison",
  "electrode-electrolyte-and-temperature-affect-voltage":
    "Electrodes, electrolyte and temperature affect voltage",
  "no-observed-reading-is-recorded": "No observed reading is recorded",
  "not-measured-is-not-a-zero-measurement":
    "Not measured is not a zero measurement",
  "pair-differences-are-unchanged": "Pair differences are unchanged",
  "equal-offsets-cancel-in-subtraction":
    "Equal display offsets cancel in subtraction",
  "these-exact-comparisons-are-inconsistent":
    "These exact comparisons are inconsistent",
  "first-minus-second-requires-minus-zero-point-seven":
    "First minus second requires −0.7 V",
  "negative-reading-is-not-negative-reactivity-or-energy":
    "Negative reading does not mean negative reactivity or energy",
  "the-minus-sign-describes-terminal-potential-order":
    "The sign describes terminal potential order",
  "no-difference-in-this-matching-electrode-comparison":
    "No difference in this matching-electrode comparison",
  "it-does-not-prove-copper-cannot-react-in-other-contexts":
    "It does not prove copper cannot react elsewhere",
  "negative-means-no-chemical-reaction":
    "A negative reading proves there is no chemical reaction",
  "not-measured-means-zero": "Not measured means zero",
  "voltage-depends-only-on-metal-name":
    "Voltage depends only on the metal name",
  "discard-an-observation-until-it-fits":
    "Discard an observation until the data fit",
};
const human = (v: string) =>
  names[v] ?? (v.length === 1 ? v : v[0].toUpperCase() + v.slice(1));
export function VoltageWorkbench({
  mode,
  record,
  instruction,
  history,
  onChange,
}: {
  mode: VoltageMode;
  record?: string;
  instruction: string;
  history: Board[];
  onChange: (h: Board[]) => void;
}) {
  const id = useId(),
    b = history.at(-1) ?? initialVoltageBoard(mode, record),
    key = String(b.record),
    records = voltageRecords[mode] as Record<string, { label: string }>;
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [active, setActive] = useState("firstLevel");
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
    if (k === "record") {
      setRaw({});
      setActive("firstLevel");
    }
    onChange([
      ...history,
      k === "record" ? initialVoltageBoard(mode, v) : { ...b, [k]: v },
    ]);
  }
  function shift(k: string, delta: number) {
    const current = raw[k] ?? String(b[k]);
    if (!validVoltageNumber(current)) return;
    const next = String(Number((Number(current) + delta).toFixed(3)));
    if (!validVoltageNumber(next)) return;
    setRaw({ ...raw, [k]: next });
    change(k, next);
  }
  function control(k: string) {
    const opts = voltageOptions[mode][k];
    return (
      <div
        className={`voltage-field ${opts ? "voltage-choice" : "voltage-number"}`}
        key={k}
      >
        <label htmlFor={`${id}-${k}`}>{labels[k]}</label>
        {opts ? (
          <select
            id={`${id}-${k}`}
            aria-label={labels[k]}
            value={b[k]}
            onChange={(e) => change(k, e.target.value)}
          >
            {opts.map((v) => (
              <option key={v} value={v}>
                {human(v)}
              </option>
            ))}
          </select>
        ) : (
          <div className="voltage-stepper">
            {mode === "infer" && k.endsWith("Level") && (
              <button
                className="button"
                aria-label={`Decrease ${labels[k].slice(5)}`}
                disabled={
                  !validVoltageNumber(raw[k] ?? String(b[k])) ||
                  Number(b[k]) <= -10000
                }
                onClick={() => shift(k, -0.1)}
              >
                −
              </button>
            )}
            <input
              id={`${id}-${k}`}
              aria-label={labels[k]}
              inputMode="decimal"
              value={raw[k] ?? String(b[k])}
              onChange={(e) => {
                const value = e.target.value;
                setRaw({ ...raw, [k]: value });
                setFeedback("");
                if (validVoltageNumber(value)) change(k, value);
              }}
            />
            {mode === "infer" && k.endsWith("Level") && (
              <button
                className="button"
                aria-label={`Increase ${labels[k].slice(5)}`}
                disabled={
                  !validVoltageNumber(raw[k] ?? String(b[k])) ||
                  Number(b[k]) >= 10000
                }
                onClick={() => shift(k, 0.1)}
              >
                +
              </button>
            )}
          </div>
        )}
        {opts && b[k] !== "unset" && human(String(b[k])).length > 30 && (
          <span className="cells-selected-text">
            Your selection: {human(String(b[k]))}
          </span>
        )}
      </div>
    );
  }
  const lead =
      mode === "lead"
        ? voltageRecords.lead[key as keyof typeof voltageRecords.lead]
        : null,
    infer =
      mode === "infer"
        ? voltageRecords.infer[key as keyof typeof voltageRecords.infer]
        : null,
    rank =
      mode === "rank"
        ? voltageRecords.rank[key as keyof typeof voltageRecords.rank]
        : null;
  const numericInvalid = Object.values(raw).some((v) => !validVoltageNumber(v)),
    first = Number(b.firstLevel),
    second = Number(b.secondLevel),
    inside = (v: number) => v >= -2 && v <= 3,
    x = (v: number) => 40 + (420 * (v + 2)) / 5;
  const colourFor = (leadRole: string) =>
    leadRole === "metal1" ? -1 : leadRole === "metal2" ? 1 : 0;
  return (
    <section
      className="model task-workbench voltage-workbench"
      aria-label="Task model"
    >
      <h3>{titles[mode]}</h3>
      {control(fields[mode][0])}
      <p>{instruction}</p>
      <details>
        <summary>Choose another supplied case</summary>
        <label>
          Supplied voltage comparison
          <select
            aria-label="Supplied voltage comparison"
            value={key}
            onChange={(e) => change("record", e.target.value)}
          >
            {Object.entries(records).map(([value, r]) => (
              <option key={value} value={value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </details>
      <p className="model-context">{records[key].label}</p>
      <div className="voltage-fields">{fields[mode].slice(1).map(control)}</div>
      {mode === "read" && (
        <VoltageTable row={String(b.row)} column={String(b.column)} />
      )}
      {mode === "evidence" && key === "missing" && <VoltageTable />}
      {lead && (
        <>
          <figure>
            <svg
              viewBox="0 0 500 330"
              role="img"
              aria-label={`Physical metal1 ${lead.metal1}; metal2 ${lead.metal2}. Your red lead ${human(String(b.red))}, black COM lead ${human(String(b.black))}. Your predicted reading ${b.volts} volts. The separate conducting load and metals remain fixed.`}
            >
              <path
                d="M60 155V310H440V155"
                fill="#e1eff5"
                stroke="#8293aa"
                strokeWidth="4"
              />
              <rect x="105" y="125" width="35" height="150" fill="#8c9aaf" />
              <rect x="360" y="125" width="35" height="150" fill="#8c9aaf" />
              <rect
                x="215"
                y="15"
                width="70"
                height="40"
                rx="5"
                fill="#e4e9f1"
              />
              <text x="250" y="43" fontSize="22" textAnchor="middle">
                Load
              </text>
              <path
                d="M122 125V35H215M285 35H378V125"
                stroke="#35435b"
                strokeWidth="4"
                fill="none"
              />
              <rect
                x="205"
                y="72"
                width="90"
                height="65"
                rx="8"
                fill="white"
                stroke="#35435b"
                strokeWidth="3"
              />
              <text x="250" y="101" fontSize="23" textAnchor="middle">
                V meter
              </text>
              <circle cx="225" cy="124" r="5" fill="#ba4351" />
              <circle cx="275" cy="124" r="5" fill="#24334c" />
              {b.red !== "unset" && (
                <path
                  d={`M225 124V145H${colourFor(String(b.red)) < 0 ? 122 : 378}V160`}
                  stroke="#ba4351"
                  strokeWidth="4"
                  fill="none"
                />
              )}
              {b.black !== "unset" && (
                <path
                  d={`M275 124V175H${colourFor(String(b.black)) < 0 ? 122 : 378}V190`}
                  stroke="#24334c"
                  strokeWidth="4"
                  fill="none"
                />
              )}
              <text x="122" y="300" fontSize="23" textAnchor="middle">
                Metal1
              </text>
              <text x="378" y="300" fontSize="23" textAnchor="middle">
                Metal2
              </text>
            </svg>
            <figcaption>
              Red is the positive meter input; black is COM. The separate load
              connects the same two physical plates. Crossed drawing lines
              without a junction dot are not electrical connections. The reading
              remains your prediction; no measured current is invented.
            </figcaption>
          </figure>
          <details>
            <summary>Inspect your meter wiring in actual 3D</summary>
            <VoltageCell3D
              state={{
                metal1: lead.metal1,
                metal2: lead.metal2,
                red: String(b.red),
                black: String(b.black),
                electronFrom: String(b.electronFrom),
                electronTo: String(b.electronTo),
                volts: String(b.volts),
              }}
            />
          </details>
        </>
      )}
      {infer && (
        <figure className="voltage-reference-line">
          <label>
            Marker to move
            <select
              aria-label="Marker to move"
              value={active}
              onChange={(e) => setActive(e.target.value)}
            >
              <option value="firstLevel">First: {infer.first}</option>
              <option value="secondLevel">Second: {infer.second}</option>
            </select>
          </label>
          <svg
            viewBox="0 0 500 170"
            role="group"
            tabIndex={0}
            aria-label="Place your relative comparison markers"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                shift(active, e.key === "ArrowLeft" ? -0.1 : 0.1);
              }
            }}
            onClick={(e) => {
              const box = e.currentTarget.getBoundingClientRect(),
                px = ((e.clientX - box.left) * 500) / box.width,
                value =
                  Math.round(
                    ((Math.max(40, Math.min(460, px)) - 40) / 420) * 50 - 20,
                  ) / 10;
              setRaw({ ...raw, [active]: String(value) });
              change(active, String(value));
            }}
          >
            <line
              x1="40"
              y1="100"
              x2="460"
              y2="100"
              stroke="#4e5b73"
              strokeWidth="3"
            />
            {Array.from({ length: 51 }, (_, i) => (
              <line
                key={i}
                x1={40 + 8.4 * i}
                y1={i % 10 === 0 ? 88 : 96}
                x2={40 + 8.4 * i}
                y2={i % 10 === 0 ? 112 : 104}
                stroke="#59667c"
              />
            ))}
            {[-2, -1, 0, 1, 2, 3].map((v) => (
              <text key={v} x={x(v)} y="144" textAnchor="middle" fontSize="23">
                {v}
              </text>
            ))}
            {inside(first) && (
              <>
                <circle cx={x(first)} cy="70" r="8" fill="#394ac6" />
                <text x={x(first)} y="52" textAnchor="middle" fontSize="22">
                  1: {b.firstLevel}
                </text>
              </>
            )}
            {inside(second) && (
              <>
                <circle cx={x(second)} cy="112" r="7" fill="#bb892b" />
                <text x={x(second)} y="164" textAnchor="middle" fontSize="22">
                  2: {b.secondLevel}
                </text>
              </>
            )}
            {inside(first) && inside(second) && first !== second && (
              <path
                d={`M${x(second)} 80H${x(first)}l${first > second ? -8 : 8} -5M${x(first)} 80l${first > second ? -8 : 8} 5`}
                stroke="#394ac6"
                strokeWidth="3"
                fill="none"
              />
            )}
          </svg>
          <figcaption>
            Your placed levels: first {b.firstLevel} V, second {b.secondLevel}{" "}
            V. The directed difference convention runs from the second level to
            the first; predict its signed value and unsigned magnitude
            independently. The supplied common reference is {infer.reference}.
            These are relative comparison readings, not absolute
            isolated-electrode voltages.{" "}
            {!inside(first) &&
              "Your first marker is outside the displayed −2 to +3 V range. "}
            {!inside(second) &&
              "Your second marker is outside the displayed −2 to +3 V range."}
          </figcaption>
          <div className="bench-actions">
            <button className="button" onClick={() => shift(active, -0.1)}>
              Move selected marker left 0.1 V
            </button>
            <button className="button" onClick={() => shift(active, 0.1)}>
              Move selected marker right 0.1 V
            </button>
          </div>
        </figure>
      )}
      {rank && (
        <>
          <table>
            <caption>
              Given comparison; reference is metal
              {rank.referenceRole === "second" ? "2" : "1"}. Values are
              supplied, not universal constants.
            </caption>
            <thead>
              <tr>
                <th scope="col">Metal</th>
                <th scope="col">Given reading / V</th>
              </tr>
            </thead>
            <tbody>
              {rank.metals.map((metal, i) => (
                <tr key={metal}>
                  <th scope="row">{human(metal)}</th>
                  <td>{rank.readings[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Your proposed most-to-least order:{" "}
            {["rank1", "rank2", "rank3", "rank4", "rank5"]
              .map((k) => human(String(b[k])))
              .join(" → ")}
            .
          </p>
        </>
      )}
      {numericInvalid && (
        <p role="alert">
          Enter a signed decimal number. Fractions, scientific notation and
          incomplete entries cannot be checked; your raw entry remains visible.
        </p>
      )}
      <div className="bench-actions">
        <button
          className="button"
          disabled={numericInvalid}
          onClick={() => {
            const result = voltagePrediction(mode, b);
            setCorrect(result.correct);
            setFeedback(
              (result.correct ? "That’s right. " : "Not yet. ") +
                result.explanation,
            );
          }}
        >
          Check model
        </button>
        <button
          className="button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setRaw({});
            setFeedback("");
          }}
        >
          Undo
        </button>
        <button
          className="button"
          onClick={() => {
            onChange([initialVoltageBoard(mode, record)]);
            setRaw({});
            setFeedback("");
            setActive("firstLevel");
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
        <summary>About this comparison</summary>
        <p>
          Use the declared terminal roles, supplied sign rule and matching
          conditions. Voltage is a difference; lead reversal is separate from
          chemical direction. A missing observation is not 0 V. Exact
          constructed data differ from real measurements with stated
          uncertainty. This model does not calculate universal voltages, award
          examiner marks or certify practical work.
        </p>
      </details>
    </section>
  );
}
