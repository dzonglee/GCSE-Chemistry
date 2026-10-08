"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialPracticalBoard,
  practicalOptions,
  practicalRecords,
  practicalPrediction,
  validPracticalNumber,
  type PracticalMode,
} from "@/lib/energy-practical";
import { PracticalPlot, type PracticalGraphData } from "./PracticalPlot";
import { EnergyCup3D } from "./EnergyCup3D";
const headings: Record<PracticalMode, string> = {
  plan: "Plan a fair investigation",
  observe: "Select the relevant readings",
  repeat: "Review the repeated trials",
  graph: "Construct a gradient triangle",
  fit: "Estimate the fitted maximum",
  evaluate: "Explain the measurement evidence",
};
const fields: Record<PracticalMode, [string, string][]> = {
  plan: [
    ["independent", "Your independent variable"],
    ["dependent", "Your measured response"],
    ["instrument", "Your measuring instrument"],
    ["controls", "Your controlled conditions"],
    ["sequence", "Your measurement sequence"],
  ],
  observe: [
    ["baseline", "Your pre-mixing reading"],
    ["extreme", "Your reaction-stage extremum"],
  ],
  repeat: [
    ["retained", "Your retained trials"],
    ["reason", "Your reason for retaining or excluding trials"],
  ],
  graph: [
    ["first", "Your first fitted-line point"],
    ["second", "Your second fitted-line point"],
    ["unit", "Your gradient unit"],
  ],
  fit: [],
  evaluate: [
    ["claim", "Your supported practical claim"],
    ["reason", "Your evidence reason"],
  ],
};
const names: Record<string, string> = {
  unset: "Choose your prediction",
  "carbonate-mass": "Mass of sodium carbonate",
  "alkali-volume": "Added sodium hydroxide volume",
  "metal-identity": "Identity of metal",
  insulation: "Supplied insulation",
  "highest-temperature": "Highest reaction-stage temperature",
  "acid-start": "Starting acid temperature",
  "temperature-change": "Reaction-stage temperature change",
  "desired-result": "The result we hope to obtain",
  balance: "Balance",
  "measuring-cylinder": "Measuring cylinder",
  thermometer: "Thermometer",
  stopwatch: "Stopwatch",
  "acid-volume-concentration-start":
    "Initial acid volume, concentration and starting temperature",
  "solution-volume-concentration-start-and-metal-amount":
    "Solution volume, concentration, starting temperature and specified metal amount",
  "reactant-amounts-concentrations-start":
    "Reactant amounts, concentrations and starting temperatures",
  "force-final-temperature": "Force every final temperature to be the same",
  nothing: "No conditions need controlling",
  "initial-add-stir-peak-repeat":
    "Measure initial temperature → add measured reactant → stir → record extremum → repeat",
  "add-read-final-only":
    "Add reactant → wait until the final reading → record it",
  "peak-before-addition": "Record reaction peak → add reactant",
  all: "Retain all supplied trials",
  "first-two": "Retain trials1 and2",
  "last-two": "Retain trials2 and3",
  "first-only": "Retain only trial1",
  "ordinary-spread": "Ordinary variation; no recorded procedural failure",
  "documented-failure":
    "A recorded procedural failure makes that trial unsuitable",
  "retain-and-investigate": "Retain the unexplained spread and investigate it",
  "compare-changes-not-peaks":
    "Compare each peak with its own starting temperature",
  "delete-highest": "Always delete the highest result",
  "repeat-removes-all-error": "Repeating removes every measurement error",
  "degree-per-gram": "°C/g",
  "degree-per-cubic-centimetre": "°C/cm³",
  "gram-per-degree": "g/°C",
  "degrees-only": "°C",
  "insulation-reduces-transfer": "Insulation reduces unwanted energy transfer",
  "smaller-unwanted-heat-exchange":
    "Less unwanted heat exchange with the external environment",
  "stir-for-representative-temperature":
    "Stir for a more representative temperature reading",
  "reduce-spatial-temperature-differences":
    "Stirring reduces temperature differences within the solution",
  "repeat-estimate-mean-and-spread": "Repeat to estimate the mean and spread",
  "random-variation-remains":
    "Random variation can remain between matched trials",
  "repetition-does-not-remove-bias":
    "Repeating this method does not remove its bias",
  "same-systematic-effect-remains":
    "The same heat-loss effect persists in each trial",
  "total-volume-increases": "Total solution volume increases",
  "added-volume-is-not-constant-total-volume":
    "Successive additions increase total volume",
  "temperature-alone-insufficient-energy":
    "Temperature rise alone cannot rank total released energy",
  "amount-and-heat-capacity-not-controlled":
    "Solution amount and heat capacity are not controlled",
  "record-reaction-stage-maximum": "Record the reaction-stage maximum",
  "final-cooling-misses-peak":
    "Later cooling makes the final reading miss the peak",
  "intercept-is-estimate": "The intercept is an estimated initial temperature",
  "extrapolation-not-direct-observation":
    "Extrapolation is not a directly measured trial",
  "rise-then-level": "Idealised highest temperature rises then levels off",
  "acid-limits-further-reaction":
    "Acid becomes limiting, so extra carbonate does not all react",
  "sampled-maximum-tied": "The sampled maximum is tied",
  "fit-estimate-distinct-from-observation":
    "A fitted intersection differs from a measured observation",
  "insulation-stops-all-transfer": "Insulation stops all energy transfer",
  "repeat-removes-bias": "Repeating removes systematic bias",
  "largest-rise-always-largest-energy":
    "The largest temperature rise always means most energy",
  "reaction-reversed": "The reaction reverses during later cooling",
  "energy-created-by-stirring": "Stirring creates reaction energy",
  "all-errors-average-away": "Every error averages away",
  "finer-resolution-not-guaranteed-accuracy":
    "Finer resolution; accuracy is not guaranteed",
  "smaller-division-not-calibration-proof":
    "Smaller divisions do not prove calibration or accuracy",
  "follow-prescribed-eye-protection":
    "Follow the supplied supervised-school eye-protection protocol",
  "address-supplied-eye-splash-risk":
    "The prescribed goggles address the stated eye-splash risk",
  "temperature-equals-joules": "Temperature is the same quantity as energy",
};
export function EnergyPracticalWorkbench({
  mode,
  record = "initial",
  instruction,
  history,
  onChange,
}: {
  mode: PracticalMode;
  record?: string;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialPracticalBoard(mode, record),
    key = String(b.record),
    records = practicalRecords[mode] as Record<string, { label: string }>;
  const [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({});
  const trace =
    mode === "observe"
      ? practicalRecords.observe[key as keyof typeof practicalRecords.observe]
      : null;
  const graph =
    mode === "graph"
      ? practicalRecords.graph[key as keyof typeof practicalRecords.graph]
      : null;
  const fit =
    mode === "fit"
      ? practicalRecords.fit[key as keyof typeof practicalRecords.fit]
      : null;
  const repeat =
    mode === "repeat"
      ? practicalRecords.repeat[key as keyof typeof practicalRecords.repeat]
      : null;
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
      k === "record" ? initialPracticalBoard(mode, v) : { ...b, [k]: v },
    ]);
  }
  function option(k: string, v: string) {
    if (k === "record") return records[v].label;
    if (trace && v !== "unset" && (k === "baseline" || k === "extreme"))
      return `${trace.times[Number(v)]}s: ${trace.temperatures[Number(v)]}°C`;
    if (graph && v !== "unset" && (k === "first" || k === "second"))
      return `(${graph.points[Number(v)][0]}, ${graph.points[Number(v)][1]})`;
    return names[v] ?? v;
  }
  function select(k: string, label: string) {
    return (
      <label key={k}>
        {label}
        <select
          aria-label={label}
          value={b[k]}
          onChange={(e) => change(k, e.target.value)}
        >
          {practicalOptions[mode][k].map((v) => (
            <option value={v} key={v}>
              {option(k, v)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  function input(k: string, label: string) {
    return (
      <label key={k}>
        {label}
        <input
          aria-label={label}
          inputMode="decimal"
          value={raw[k] ?? String(b[k])}
          onChange={(e) => {
            const v = e.target.value;
            setRaw({ ...raw, [k]: v });
            setFeedback("");
            if (validPracticalNumber(v)) change(k, v);
          }}
        />
        <small>
          Enter a number, including its sign where needed. Complete your
          prediction before checking.
        </small>
      </label>
    );
  }
  let data: PracticalGraphData | null = null;
  if (trace)
    data = {
      points: trace.times.map((t, i) => [t, trace.temperatures[i]] as const),
      xLabel: "Time / s",
      xMax: trace.times.at(-1)!,
      yMin: trace.temperatures.some((v) => v < 0) ? -5 : 15,
      yMax: trace.temperatures.some((v) => v < 0) ? 5 : 35,
      line: true,
    };
  if (graph)
    data = {
      points: graph.points,
      xLabel:
        graph.unit === "degree-per-gram" ? "Mass / g" : "Added volume / cm³",
      xMax: graph.points.at(-1)![0],
      yMin: 20,
      yMax: 32,
      line: true,
    };
  if (fit)
    data = {
      points: fit.points,
      xLabel: "Added volume / cm³",
      xMax: 40,
      yMin: 20,
      yMax: 36,
      fits: [fit.rising, fit.falling],
    };
  const selected = trace
    ? [b.baseline, b.extreme].filter((v) => v !== "unset").map(Number)
    : graph
      ? [b.first, b.second].filter((v) => v !== "unset").map(Number)
      : [];
  return (
    <section
      className="model task-workbench energy-practical-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "fit" &&
        input("volume", "Your estimated intersection volume / cm³")}
      {fields[mode].length > 0 &&
        select(fields[mode][0][0], fields[mode][0][1])}
      <p>{instruction}</p>
      {select("record", "Supplied practical investigation")}
      <p className="practical-record">{records[key].label}</p>
      {data && (
        <>
          <PracticalPlot
            data={data}
            selected={selected}
            marker={fit ? [Number(b.volume), Number(b.temperature)] : undefined}
          />
          <details>
            <summary>Read the supplied data table</summary>
            <table className="isotope-data">
              <caption>
                Supplied {graph ? "fitted-line coordinates" : "observations"}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{data.xLabel}</th>
                  <th scope="col">Temperature / °C</th>
                </tr>
              </thead>
              <tbody>
                {data.points.map((p, i) => (
                  <tr key={i}>
                    <td>{p[0]}</td>
                    <td>{p[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
      {repeat && (
        <table className="isotope-data">
          <caption>Supplied temperature changes</caption>
          <thead>
            <tr>
              <th scope="col">Trial</th>
              <th scope="col">Temperature rise / °C</th>
            </tr>
          </thead>
          <tbody>
            {repeat.values.map((v, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {fields[mode].slice(1).map(([k, l]) => select(k, l))}
      {mode === "observe" &&
        input("change", "Your signed temperature change / °C")}
      {mode === "repeat" &&
        input("mean", "Your mean retained temperature rise / °C")}
      {mode === "graph" && (
        <>
          {input("rise", "Your matching temperature difference / °C")}
          {input(
            "run",
            graph?.unit === "degree-per-gram"
              ? "Your matching mass difference / g"
              : "Your matching volume difference / cm³",
          )}
          {input("gradient", "Your fitted-line gradient")}
          {input("intercept", "Your extrapolated initial temperature / °C")}
        </>
      )}
      {mode === "fit" && (
        <>
          {input("temperature", "Your estimated maximum temperature / °C")}
          <p>
            Your purple cross displays the estimate you entered; it is not
            corrected automatically. Read to about 0.2 of each axis unit.
          </p>
        </>
      )}
      <div className="bench-actions">
        <button
          className="button"
          onClick={() => {
            if (
              Object.entries(raw).some(
                ([k, v]) => !validPracticalNumber(v) || v !== String(b[k]),
              )
            ) {
              setCorrect(false);
              setFeedback(
                "Complete your prediction using numbers before checking.",
              );
              return;
            }
            const result = practicalPrediction(mode, b);
            setCorrect(result.correct);
            setFeedback(
              (result.correct
                ? "Your prediction matches the supplied evidence. "
                : "Reconsider your prediction. ") + result.explanation,
            );
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            setRaw({});
            setFeedback("");
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setRaw({});
            setFeedback("");
            onChange([initialPracticalBoard(mode, record)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          className={"feedback " + (correct ? "correct" : "retry")}
          role="status"
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>Inspect the real 3D cup apparatus</summary>
        <EnergyCup3D initial={20} final={28} />
        <p>
          The cutaway is a representation aid. The probe enters the solution;
          the lid and insulation reduce unwanted heat exchange. Its illustrative
          20 °C and 28 °C states are independent of the selected investigation.
          This reference does not generate the supplied measurements or certify
          laboratory competence.
        </p>
      </details>
    </section>
  );
}
