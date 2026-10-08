"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialTechniqueBoard,
  techniqueChoices,
  techniquePrediction,
  techniqueRecords,
  techniqueReadingRecords,
  techniqueRepeatRecords,
  techniqueSequenceRecords,
  selectedTitres,
  type TechniqueMode,
} from "@/lib/titration-technique";
import { BuretteScale } from "./BuretteScale";
import { TitrationApparatus3D } from "./TitrationApparatus3D";
const labels: Record<string, string> = {
  unset: "Predict",
  "bottom-eye-level": "Bottom of meniscus at eye level",
  "top-above": "Top edge viewed from above",
  "bottom-below": "Bottom viewed from below",
  yes: "Yes, this group meets the stated rule",
  no: "No, this group does not meet the stated rule",
  larger: "Larger",
  smaller: "Smaller",
  unchanged: "Unchanged",
  "diluted-titrant": "Titrant diluted before delivery",
  "diluted-aliquot": "Measured sample diluted before its fixed volume is taken",
  "same-aliquot-amount": "Water added after measuring; sample amount unchanged",
  "jet-filling-counted": "Column loss includes filling the jet",
  "extra-titrant": "Extra titrant after the endpoint",
  "unrecorded-topup": "Extra input after the initial reading",
  "more-water-always-more-titrant": "More water always requires more titrant",
  "dropwise-swirl": "Add dropwise near endpoint and swirl",
  "continue-dropwise": "Continue controlled dropwise addition and mixing",
  "repeat-carefully": "Repeat with a fresh measured aliquot",
  "choose-suitable-single-indicator":
    "Choose a suitable sharp single indicator",
  "add-fast": "Add rapidly without mixing",
  "claim-exact-ph7": "Claim every endpoint is exactly pH 7",
  "faint-pink": "First faint persistent pink",
  colourless: "First persistent colourless solution",
  orange: "First persistent orange under this protocol",
  "not-yet-persistent": "Required colour does not yet persist",
  "beyond-specified-endpoint": "Beyond the specified endpoint",
  "sharp-transition": "A suitable sharp transition",
  "deep-pink": "Aim for deep pink",
  "control-final-volume": "Control the final delivered volume",
  "local-not-mixed": "A local colour patch disappears on mixing",
  "cannot-recover-delivered-volume":
    "Overshoot has already added excess measured volume",
  "broad-colour-range": "Broad colour sequence obscures a sharp endpoint",
  "all-endpoints-neutral": "Every indicator endpoint proves exact neutrality",
};
const headings: Record<TechniqueMode, string> = {
  reading: "Read the same burette",
  repeats: "Select and evaluate repeat titres",
  errors: "Predict the titre",
  endpoint: "Control the endpoint",
  sequence: "Repair the method sequence",
};
export function TitrationTechniqueWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: TechniqueMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({});
  const b = history.at(-1) ?? initialTechniqueBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    key = String(b.record);
  const records = techniqueRecords[mode] as Record<string, { label: string }>;
  function push(next: WorkbenchState) {
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, next]);
  }
  function change(field: string, value: string) {
    if (field === "record") setRaw({});
    if (b[field] === value) return;
    push(
      field === "record"
        ? initialTechniqueBoard(mode, value)
        : { ...b, [field]: value },
    );
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
          {techniqueChoices[mode][field].map((value) => (
            <option key={value} value={value}>
              {labels[value] ?? value}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const reading =
    mode === "reading"
      ? techniqueReadingRecords[key as keyof typeof techniqueReadingRecords]
      : null;
  const repeat =
    mode === "repeats"
      ? techniqueRepeatRecords[key as keyof typeof techniqueRepeatRecords]
      : null;
  const selected = String(b.selected ?? "")
    .split(",")
    .filter(Boolean);
  const summary = repeat
    ? selectedTitres(repeat.readings, selected, repeat.maximumSpanHundredths)
    : null;
  const sequence =
    mode === "sequence"
      ? techniqueSequenceRecords[key as keyof typeof techniqueSequenceRecords]
      : null;
  const order = sequence ? String(b.order).split(",").map(Number) : [];
  function toggle(id: string) {
    if (!repeat) return;
    const chosen = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    change(
      "selected",
      repeat.readings
        .filter((r) => chosen.includes(r.id))
        .map((r) => r.id)
        .join(","),
    );
  }
  function swap(index: number, delta: number) {
    const next = [...order],
      other = index + delta;
    [next[index], next[other]] = [next[other], next[index]];
    change("order", next.join(","));
  }
  function check() {
    if (Object.keys(raw).length) {
      setCorrect(false);
      setFeedback(
        "Your typed prediction is retained. Enter a decimal titre from 0 to 50 cm³ with at most two decimal places before checking.",
      );
      return;
    }
    const p = techniquePrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete the prediction before checking."
        : p.correct
          ? "That’s right. " + p.explanation
          : "Your proposed answer is retained. " + p.explanation,
    );
  }
  return (
    <section
      className="model task-workbench technique-workbench"
      aria-label="Task model"
    >
      {mode !== "errors" && mode !== "endpoint" && <h3>{headings[mode]}</h3>}
      {reading && (
        <>
          <p className="model-readout">
            Initial <strong>{reading.initial.toFixed(2)} cm³</strong>; final{" "}
            <strong>{reading.final.toFixed(2)} cm³</strong>.
          </p>
          <label>
            Your predicted delivered titre
            <input
              aria-label="Your predicted delivered titre"
              type="text"
              inputMode="decimal"
              maxLength={64}
              min={0}
              max={50}
              step={0.01}
              value={raw.guess ?? String(Number(b.guess) / 100)}
              onChange={(e) => {
                const text = e.target.value,
                  n = Number(text);
                setFeedback("");
                if (
                  /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) &&
                  Number.isFinite(n) &&
                  n >= 0 &&
                  n <= 50 &&
                  Math.abs(n * 100 - Math.round(n * 100)) < 1e-7
                ) {
                  setRaw({});
                  change("guess", String(Math.round(n * 100)));
                } else setRaw({ guess: text });
              }}
            />
          </label>
          {select("meniscus", "Your reading position")}
          <div
            className="technique-scales"
            role="img"
            aria-label={
              "Same burette: initial " +
              reading.initial.toFixed(2) +
              ", final " +
              reading.final.toFixed(2) +
              " cm³; zero at the top and fifty at the bottom."
            }
          >
            {(["Initial", "Final"] as const).map((label, index) => {
              const value = index ? reading.final : reading.initial;
              return (
                <svg key={label} viewBox="0 0 160 340" aria-hidden="true">
                  <text x="80" y="22" textAnchor="middle" fontSize="18">
                    {label}
                  </text>
                  <rect
                    x="54"
                    y="40"
                    width="35"
                    height="250"
                    fill="#f8fafc"
                    stroke="#536078"
                  />
                  <rect
                    x="56"
                    y={40 + value * 5}
                    width="31"
                    height={250 - value * 5}
                    fill="#a3b5dc"
                  />
                  {Array.from({ length: 11 }, (_, i) => (
                    <g key={i}>
                      <line
                        x1="54"
                        x2="72"
                        y1={40 + i * 25}
                        y2={40 + i * 25}
                        stroke="#273449"
                      />
                      <text x="101" y={46 + i * 25} fontSize="17">
                        {i * 5}
                      </text>
                    </g>
                  ))}
                  <path
                    d={
                      "M56 " +
                      (40 + value * 5 - 2) +
                      " Q71.5 " +
                      (40 + value * 5 + 2) +
                      " 87 " +
                      (40 + value * 5 - 2)
                    }
                    fill="none"
                    stroke="#334bc0"
                    strokeWidth="2"
                  />
                  <text x="80" y="322" textAnchor="middle" fontSize="17">
                    {value.toFixed(2)} cm³
                  </text>
                </svg>
              );
            })}
          </div>
          <details>
            <summary>Inspect fine divisions around the final meniscus</summary>
            <BuretteScale
              top={Math.floor(reading.final * 5) / 5 - 0.2}
              reading={reading.final}
              boundaryDescription="The final meniscus aligns with the supplied final numerical reading; the scale increases downwards."
            />
          </details>
          <p className="muted">
            Schematic whole-burette scales. Use the supplied numerical readings
            for hundredths; these drawings do not show 0.05 cm³ divisions.
          </p>
        </>
      )}
      {repeat && (
        <>
          <div
            className="technique-repeat-buttons"
            role="group"
            aria-label="Select titre readings"
          >
            {repeat.readings.map((r) => (
              <button
                className="button particle-choice"
                key={r.id}
                aria-pressed={selected.includes(r.id)}
                onClick={() => toggle(r.id)}
              >
                {r.rough ? "Rough" : r.id.toUpperCase()}:{" "}
                {(r.hundredths / 100).toFixed(2)} cm³
              </button>
            ))}
          </div>
          <p>
            Protocol: at least two careful readings, rough estimate excluded;
            maximum span{" "}
            <strong>
              {(repeat.maximumSpanHundredths / 100).toFixed(2)} cm³
            </strong>
            , inclusive.
          </p>
          {summary && (
            <div className="model-readout">
              <p>
                Selected: <strong>{summary.count}</strong>. Full span:{" "}
                <strong>
                  {summary.spanCm3 === null
                    ? "—"
                    : summary.spanCm3.toFixed(2) + " cm³"}
                </strong>
                .
              </p>
              <p>
                Provisional selected mean:{" "}
                <strong>
                  {summary.meanCm3 === null
                    ? "—"
                    : summary.meanCm3.toFixed(2) + " cm³"}
                </strong>
                . This is not an accepted mean until your selection is
                evaluated.
              </p>
            </div>
          )}
          {select("decision", "Does your selected group meet this protocol?")}
        </>
      )}
      {mode === "errors" && (
        <>
          <p className="model-readout">{records[key].label}</p>
          {select("direction", "Your titre or measured-delivery direction")}
          {select("reason", "Your error mechanism")}
        </>
      )}
      {mode === "endpoint" && (
        <>
          <p className="model-readout">{records[key].label}</p>
          {select("action", "Your next action")}
          {select("colour", "Your endpoint observation")}
          {select("reason", "Your endpoint reason")}
        </>
      )}
      {sequence && (
        <ol className="technique-sequence">
          {order.map((step, index) => (
            <li key={step}>
              <p>{sequence.steps[step]}</p>
              <div className="electrolysis-ion-controls">
                <button
                  className="button particle-choice"
                  aria-label={"Move step " + (step + 1) + " earlier"}
                  disabled={index === 0}
                  onClick={() => swap(index, -1)}
                >
                  ↑ Earlier
                </button>
                <button
                  className="button particle-choice"
                  aria-label={"Move step " + (step + 1) + " later"}
                  disabled={index === order.length - 1}
                  onClick={() => swap(index, 1)}
                >
                  Later ↓
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <label>
        Supplied record
        <select
          aria-label="Supplied record"
          value={key}
          onChange={(e) => change("record", e.target.value)}
        >
          {Object.entries(records).map(([id, r]) => (
            <option key={id} value={id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <p className="metal-selected">{records[key].label}</p>
      {mode !== "reading" && <p className="muted">{instruction}</p>}
      <div className="bench-actions">
        <button className="button primary" onClick={check}>
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2 && !Object.keys(raw).length}
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
            onChange([initialTechniqueBoard(mode)]);
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
      <p className="muted">
        Use the data stated in the answer question. Changing the model does not
        change that question.
      </p>
      {reading && (
        <TitrationApparatus3D
          key={key}
          initial={reading.initial}
          final={reading.final}
        />
      )}
    </section>
  );
}
