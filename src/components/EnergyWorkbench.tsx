"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  energyRecords,
  energyChoices,
  initialEnergyBoard,
  energyPrediction,
  symbolicEnergyLedger,
  type EnergyMode,
} from "@/lib/energy-transfer";
import { TemperatureTrace } from "./TemperatureTrace";
import { EnergyCup3D } from "./EnergyCup3D";
const headings: Record<EnergyMode, string> = {
  transfer: "Follow conserved energy",
  temperature: "Predict the temperature change",
  trace: "Choose the relevant readings",
  use: "Apply every supplied constraint",
  evidence: "Explain what evidence supports",
};
const fields: Record<EnergyMode, [string, string][]> = {
  transfer: [["classification", "Your energy classification"]],
  temperature: [["classification", "Your energy classification"]],
  trace: [
    ["baseline", "Your pre-mixing baseline"],
    ["extreme", "Your reaction-stage extreme"],
    ["classification", "Your energy classification"],
    ["late", "Your later-stage interpretation"],
  ],
  use: [
    ["selected", "Your qualifying option"],
    ["reason", "Your comparison reason"],
  ],
  evidence: [
    ["claim", "Your supported claim"],
    ["reason", "Your evidence reason"],
  ],
};
const labels: Record<string, string> = {
  unset: "Predict",
  exothermic: "Exothermic",
  endothermic: "Endothermic",
  "not-established": "Not established by the supplied evidence",
  none: "No detectable reaction-stage extreme",
  A: "A",
  B: "B",
  both: "Both",
  neither: "Neither",
  "all-constraints": "Every supplied constraint is met",
  "largest-temperature": "Choose the largest temperature",
  "longest-duration": "Choose the longest duration",
  "not-enough-evidence": "Insufficient comparison data",
  "cooling-after-reaction": "Later cooling towards room temperature",
  "warming-after-reaction": "Later warming towards room temperature",
  "reaction-reversed": "The completed reaction must have reversed",
  "exothermic-supported": "Exothermic transfer supported",
  "endothermic-process": "Endothermic process; new substances not established",
  "electrical-heating": "Specified electrical heating",
  conserved: "Energy is conserved",
  "always-endothermic": "Heat involvement always means endothermic",
  "energy-created": "Energy is created",
  "energy-to-surroundings": "Energy transferred to surroundings",
  "initial-input-not-overall": "Starting input differs from overall transfer",
  "external-input-confounds": "External heater confounds the observation",
  "unequal-starting-temperature":
    "Unequal starting temperatures confound the observation",
  "process-not-new-substance-proof":
    "A process label does not prove new substances",
  "no-reaction-evidence": "No chemical reaction in the pad is supplied",
  "transfer-not-creation": "Energy transfer rather than creation",
  "use-reaction-stage":
    "Use reaction-stage change rather than the last segment",
  "uncontrolled-thermal-context":
    "Mass, heat capacity and reacted amounts are uncontrolled",
  "heat-means-endothermic": "Heat involvement proves endothermic",
  "hot-means-reaction": "A warm object proves a reaction",
  "last-point-only": "Classify from the last point alone",
};
export function EnergyWorkbench({
  mode,
  record = "initial",
  instruction,
  history,
  onChange,
}: {
  mode: EnergyMode;
  record?: string;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({});
  const b = history.at(-1) ?? initialEnergyBoard(mode, record),
    key = String(b.record),
    records = energyRecords[mode] as Record<string, { label: string }>;
  const [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const trace =
    mode === "trace"
      ? energyRecords.trace[key as keyof typeof energyRecords.trace]
      : null;
  const temperature =
    mode === "temperature"
      ? energyRecords.temperature[key as keyof typeof energyRecords.temperature]
      : null;
  const transfer =
    mode === "transfer"
      ? energyRecords.transfer[key as keyof typeof energyRecords.transfer]
      : null;
  const use =
    mode === "use"
      ? energyRecords.use[key as keyof typeof energyRecords.use]
      : null;
  const stores =
    mode === "transfer" ? symbolicEnergyLedger(Number(b.transfer)) : null;
  function change(field: string, value: string) {
    if (field === "record") setRaw({});
    if (b[field] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    const next =
      field === "record"
        ? initialEnergyBoard(mode, value)
        : { ...b, [field]: value };
    setFeedback("");
    onChange([...history, next]);
  }
  const select = (field: string, label: string) => {
    const values =
      (field === "baseline" || field === "extreme") && trace
        ? energyChoices[mode][field].filter(
            (v) =>
              v === "unset" || v === "none" || Number(v) < trace.times.length,
          )
        : energyChoices[mode][field];
    return (
      <label key={field}>
        {label}
        <select
          aria-label={label}
          value={b[field]}
          onChange={(e) => change(field, e.target.value)}
        >
          {values.map((v) => (
            <option key={v} value={v}>
              {field === "record"
                ? records[v].label
                : trace &&
                    (field === "baseline" || field === "extreme") &&
                    v !== "none" &&
                    v !== "unset"
                  ? trace.times[Number(v)] +
                    " min: " +
                    trace.temperatures[Number(v)] +
                    " °C"
                  : (labels[v] ?? v)}
            </option>
          ))}
        </select>
        {field !== "record" && b[field] !== "unset" && (
          <span className="metal-selected">
            Selected:{" "}
            {trace &&
            (field === "baseline" || field === "extreme") &&
            b[field] !== "none"
              ? trace.times[Number(b[field])] +
                " min, " +
                trace.temperatures[Number(b[field])] +
                " °C"
              : (labels[String(b[field])] ?? String(b[field]))}
          </span>
        )}
      </label>
    );
  };
  const guess = (
    <label>
      Your requested temperature change / °C
      <input
        aria-label="Your requested temperature change / °C"
        type="text"
        inputMode="decimal"
        maxLength={64}
        step=".1"
        min="-50"
        max="50"
        value={raw.guess ?? String(Number(b.guess) / 10)}
        onChange={(e) => {
          const text = e.target.value,
            n = Number(text);
          setFeedback("");
          if (
            /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) &&
            Number.isFinite(n) &&
            n >= -50 &&
            n <= 50 &&
            Math.abs(n * 10 - Math.round(n * 10)) < 1e-8
          ) {
            setRaw({});
            change("guess", String(Math.round(n * 10)));
          } else setRaw({ guess: text });
        }}
      />
    </label>
  );
  const first = fields[mode][0];
  const initial =
    temperature?.initial ??
    (trace
      ? trace.temperatures[trace.baseline]
      : transfer?.direction === -1
        ? 22
        : 20);
  const final =
    temperature?.extreme ??
    (trace
      ? trace.temperatures[trace.extreme ?? trace.baseline]
      : transfer?.direction === -1
        ? 15.5
        : 32);
  return (
    <section
      className="model task-workbench energy-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "transfer" ? (
        <div className="electrolysis-ion-controls">
          <button
            className="button particle-choice"
            disabled={Number(b.transfer) <= -4}
            onClick={() => change("transfer", String(Number(b.transfer) - 1))}
          >
            Move energy to system
          </button>
          <button
            className="button particle-choice"
            disabled={Number(b.transfer) >= 4}
            onClick={() => change("transfer", String(Number(b.transfer) + 1))}
          >
            Move energy to surroundings
          </button>
        </div>
      ) : mode === "temperature" ? (
        guess
      ) : (
        select(first[0], first[1])
      )}
      {select("record", "Supplied energy observation")}
      <p className="selected-scenario">{records[key].label}</p>
      {stores && (
        <div className="energy-stores" aria-live="polite">
          <div>
            <strong>Reacting system: {stores.system} symbolic shares</strong>
            <div className="energy-markers">
              {Array.from({ length: stores.system }, (_, i) => (
                <span key={i} aria-hidden="true" />
              ))}
            </div>
          </div>
          <div>
            <strong>Surroundings: {stores.surroundings} symbolic shares</strong>
            <div className="energy-markers">
              {Array.from({ length: stores.surroundings }, (_, i) => (
                <span key={i} aria-hidden="true" />
              ))}
            </div>
          </div>
          <p>
            Total: {stores.total} symbolic shares, conserved. These are
            arbitrary energy markers, not atoms, measured joules or
            temperatures.
          </p>
        </div>
      )}
      {mode === "trace" && guess}
      {(mode === "transfer" || mode === "temperature"
        ? fields[mode]
        : fields[mode].slice(1)
      ).map(([field, label]) => select(field, label))}
      {trace && (
        <TemperatureTrace
          points={trace.times.map((time, i) => ({
            time,
            temperature: trace.temperatures[i],
          }))}
          mixedAfter={trace.times[trace.baseline]}
          selectedBaseline={
            b.baseline === "unset" ? undefined : Number(b.baseline)
          }
          selectedExtreme={
            b.extreme === "unset" || b.extreme === "none"
              ? undefined
              : Number(b.extreme)
          }
        />
      )}
      {use && (
        <table className="data-table">
          <caption>Supplied original comparison</caption>
          <thead>
            <tr>
              <th scope="col">Option</th>
              <th scope="col">Temperature / °C</th>
              <th scope="col">Duration / min</th>
            </tr>
          </thead>
          <tbody>
            {use.options.map((r) => (
              <tr key={r.id}>
                <th scope="row">{r.id}</th>
                <td>{r.temperature}</td>
                <td>{r.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="position-caption">
        {instruction} Use the data stated in the answer question; changing the
        model does not change that question.
      </p>
      <div className="bench-actions">
        <button
          className="button"
          onClick={() => {
            if (Object.keys(raw).length) {
              setCorrect(false);
              setFeedback(
                "Your typed prediction is retained. Enter a decimal change from −50 to 50 °C with at most one decimal place before checking.",
              );
              return;
            }
            const p = energyPrediction(mode, b);
            setCorrect(p.correct);
            setFeedback(
              (p.correct
                ? "That’s right. "
                : "Your proposed answer is retained. ") + p.explanation,
            );
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length <= 1 && !Object.keys(raw).length}
          onClick={() => {
            setFeedback("");
            if (Object.keys(raw).length) {
              setRaw({});
              return;
            }
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFeedback("");
            setRaw({});
            onChange([initialEnergyBoard(mode, record)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={"feedback " + (correct ? "correct" : "retry")}
        >
          {feedback}
        </p>
      )}
      {(mode === "transfer" || mode === "temperature" || mode === "trace") && (
        <details>
          <summary>3D temperature apparatus reference</summary>
          {mode === "transfer" && (
            <p>
              Illustrative temperature observations for the stated
              warming/cooling direction. Symbolic energy-marker counts do not
              calculate these temperatures.
            </p>
          )}
          <EnergyCup3D initial={initial} final={final} />
        </details>
      )}
    </section>
  );
}
