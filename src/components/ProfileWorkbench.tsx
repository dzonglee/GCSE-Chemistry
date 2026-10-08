"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  profileRecords,
  profileChoices,
  initialProfileBoard,
  profilePrediction,
  type ProfileMode,
} from "@/lib/reaction-profiles";
import { ReactionProfile, type ProfileDiagram } from "./ReactionProfile";
const headings: Record<ProfileMode, string> = {
  build: "Construct the energy profile",
  read: "Read the energy differences",
  arrows: "Place the energy arrows",
  catalyst: "Build a lower-barrier route",
  evidence: "Explain the profile evidence",
};
const labels: Record<string, string> = {
  unset: "Predict",
  exothermic: "Exothermic",
  endothermic: "Endothermic",
  "no-net-difference": "No net energy difference",
  "reactants-peak": "Reactants → peak",
  "products-peak": "Products → peak",
  "zero-peak": "Zero reference → peak",
  "reactants-products": "Reactants → products",
  "products-reactants": "Products → reactants",
  "peak-products": "Peak → products",
  "barrier-and-release": "Starting barrier and overall release can coexist",
  "time-not-established": "Time is not established",
  "not-same-catalysed-reaction": "Not the same overall catalysed reaction",
  "invalid-simple-profile": "Invalid proposed simple profile",
  "differences-unchanged": "Energy differences unchanged",
  "rate-not-established": "Rate is not established",
  "not-guaranteed": "Reaction is not guaranteed",
  "not-temperature": "Energy is not temperature",
  "single-hump-not-universal": "A single hump is not universal",
  "all-reactions-immediate": "Every exothermic reaction is immediate",
  "energy-created": "Energy is created",
  "different-spans": "Barrier and overall change use different spans",
  "progress-not-time": "Reaction progress is not elapsed time",
  "endpoints-must-remain": "Same reaction keeps both endpoint energies",
  "peak-above-both": "The simple peak must be above both endpoints",
  "same-offset-cancels": "A shared reference shift cancels in subtraction",
  "width-not-time": "Uncalibrated width does not measure time",
  "orientation-also-matters": "Suitable collision orientation also matters",
  "read-axis-unit": "Read the axis quantity and units",
  "schematic-not-mechanism-proof":
    "A simple schematic does not prove every mechanism",
  "peak-is-overall": "The peak height is always the overall change",
  "hot-means-energy-created": "Heat proves energy creation",
};
const fieldLabels: Record<string, string> = {
  reactant: "Reactant energy level",
  product: "Product energy level",
  peak: "Proposed peak energy level",
  activation: "Your forward activation energy / kJ",
  overall: "Your requested overall quantity / kJ",
  classification: "Your profile classification",
  activationArrow: "Your activation arrow",
  overallArrow: "Your overall-change arrow",
  claim: "Your supported profile claim",
  reason: "Your profile evidence reason",
  record: "Supplied profile scenario",
};
export function ProfileWorkbench({
  mode,
  record = "initial",
  instruction,
  history,
  onChange,
}: {
  mode: ProfileMode;
  record?: string;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({});
  const b = history.at(-1) ?? initialProfileBoard(mode, record),
    key = String(b.record),
    records = profileRecords[mode] as Record<string, { label: string }>;
  const [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const source =
    mode === "evidence" ? null : (records[key] as unknown as ProfileDiagram);
  const constructed = {
    reactant: Number(b.reactant),
    product: Number(b.product),
    peak: Number(b.peak),
    max: 240,
    step: 40,
  };
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
    setFeedback("");
    onChange([
      ...history,
      field === "record"
        ? initialProfileBoard(mode, value)
        : { ...b, [field]: value },
    ]);
  }
  const select = (field: string) => (
    <label key={field}>
      {fieldLabels[field]}
      <select
        aria-label={fieldLabels[field]}
        value={String(b[field])}
        onChange={(e) => change(field, e.target.value)}
      >
        {profileChoices[mode][field].map((v) => (
          <option key={v} value={v}>
            {field === "record" ? records[v].label : (labels[v] ?? v)}
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
  const numeric = (field: string) => (
    <label key={field}>
      {fieldLabels[field]}
      <input
        aria-label={fieldLabels[field]}
        type="text"
        inputMode="decimal"
        maxLength={64}
        min="-240"
        max="240"
        step="1"
        value={raw[field] ?? String(b[field])}
        onChange={(e) => {
          const text = e.target.value,
            n = Number(text);
          setFeedback("");
          if (
            /^[+-]?\d+$/.test(text) &&
            Number.isInteger(n) &&
            n >= -240 &&
            n <= 240
          ) {
            setRaw((old) =>
              Object.fromEntries(
                Object.entries(old).filter(([k]) => k !== field),
              ),
            );
            change(field, String(n));
          } else setRaw((old) => ({ ...old, [field]: text }));
        }}
      />
    </label>
  );
  const counter = (field: string) => (
    <div className="profile-level-controls" key={field}>
      <span id={"profile-" + field}>{fieldLabels[field]} / kJ</span>
      <div className="electrolysis-ion-controls">
        <button
          className="button particle-choice"
          disabled={Number(b[field]) === 0}
          onClick={() => change(field, String(Number(b[field]) - 5))}
          aria-label={"Decrease " + fieldLabels[field]}
        >
          −5 kJ
        </button>
        <output aria-labelledby={"profile-" + field}>{String(b[field])}</output>
        <button
          className="button particle-choice"
          disabled={Number(b[field]) === 240}
          onClick={() => change(field, String(Number(b[field]) + 5))}
          aria-label={"Increase " + fieldLabels[field]}
        >
          +5 kJ
        </button>
      </div>
    </div>
  );
  const first =
    mode === "build"
      ? counter("reactant")
      : mode === "read"
        ? numeric("activation")
        : mode === "arrows"
          ? select("activationArrow")
          : mode === "catalyst"
            ? counter("peak")
            : select("claim");
  return (
    <section
      className="model task-workbench profile-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {first}
      {select("record")}
      <p className="selected-scenario">{records[key].label}</p>
      {mode === "build" && (
        <>
          {counter("product")}
          {counter("peak")}
        </>
      )}
      {mode === "catalyst" && (
        <>
          {counter("reactant")}
          {counter("product")}
        </>
      )}
      {mode === "read" && (
        <>
          {numeric("overall")}
          {select("classification")}
        </>
      )}
      {mode === "arrows" && select("overallArrow")}
      {mode === "evidence" && select("reason")}
      {source && (
        <ReactionProfile
          profile={
            mode === "build"
              ? constructed
              : mode === "catalyst"
                ? { ...source, max: 240, step: 40 }
                : source
          }
          alternative={mode === "catalyst" ? constructed : undefined}
          constructed={mode === "build"}
          downloadable
          activationArrow={
            mode === "arrows" ? String(b.activationArrow) : undefined
          }
          overallArrow={mode === "arrows" ? String(b.overallArrow) : undefined}
        />
      )}
      <p className="position-caption">
        {instruction} The question uses its stated profile; changing the model
        does not change that question. These are schematic energy levels for the
        stated amount, not temperature or elapsed time.
      </p>
      <div className="bench-actions">
        <button
          className="button"
          onClick={() => {
            if (Object.keys(raw).length) {
              setCorrect(false);
              setFeedback(
                "Your typed entries are retained. Enter whole numbers from −240 to 240 kJ before checking; the diagram shows the accepted energy levels.",
              );
              return;
            }
            const p = profilePrediction(mode, b);
            setCorrect(p.correct);
            setFeedback(
              (p.correct
                ? "That’s right. "
                : "Your proposed profile answer is retained. ") + p.explanation,
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
            onChange([initialProfileBoard(mode, record)]);
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
    </section>
  );
}
