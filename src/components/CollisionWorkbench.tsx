"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import { EncounterDiagram } from "./EncounterDiagram";
import { CollisionScene3D } from "./CollisionScene3D";
import { SolutionDensityDiagram } from "./SolutionDensityDiagram";
import {
  collisionRecords,
  collisionOptions,
  collisionNumbers,
  initialCollisionBoard,
  validCollisionNumber,
  collisionBoardCheck,
} from "../lib/collision-board";
import type { CollisionMode } from "../lib/collision-theory";
type Board = Record<string, string | number>;
const titles: Record<CollisionMode, string> = {
  conditions: "Test one encounter",
  solution: "Build the concentration comparison",
  gas: "Compress a conserved particle count",
  surface: "Expose the solid surface",
  comparison: "Compare measured means",
  evidence: "Check the causal claim",
};
const labels: Record<string, string> = {
  contact: "Do the particles collide?",
  partner: "Collision partner",
  orientation: "Molecular orientation",
  outcome: "Your reaction prediction",
  energy: "Collision energy / stated units",
  particles: "Reacting-particle symbols",
  occupiedVolume: "Occupied volume / schematic units",
  density: "Your reacting density / symbols per unit",
  direction: "Your density comparison",
  kinetic: "Your average kinetic-energy comparison",
  divisions: "Pieces along each edge",
  separated: "Are pieces separated and fully wetted?",
  pieces: "Your number of solid pieces",
  area: "Your accessible area / mm²",
  volume: "Your material volume / mm³",
  ratio: "Your area/volume / mm⁻¹",
  rateFactor: "Is an exact chemical-rate factor established?",
  rateA: "Your trial A mean rate",
  rateB: "Your trial B mean rate",
  faster: "Your greater mean rate",
  claim: "Your supported claim",
  reason: "Your supporting reason",
};
const words: Record<string, string> = {
  unset: "Choose a prediction",
  yes: "Yes",
  no: "No",
  reactant: "Reacting partner",
  inert: "Inert particle",
  suitable: "Reactive sites meet",
  unsuitable: "Reactive sites do not meet",
  more: "Higher",
  less: "Lower",
  same: "Equal",
  unchanged: "Unchanged",
  higher: "Higher",
  lower: "Lower",
  "known-exact": "Yes, an exact factor",
  "not-established": "No exact factor established",
  A: "Trial A",
  B: "Trial B",
  frequency: "Concentration changes collision frequency",
  "direction-only": "Expected direction; no exact rate factor",
  "speed-not-amount": "Speed changes, available final amount does not",
  "outer-faces": "Only exterior faces accessible",
  "frequency-decreases": "Collision frequency decreases",
  "energy-and-speed": "Cooling changes speed and energetic fraction",
  density: "More reacting particles per unit volume",
  "measurement-needed": "Exact rate factors need suitable evidence",
  "same-material": "Same material amount",
  "interfaces-blocked": "Reactant cannot enter touching interfaces",
  "reactant-consumed": "Reactant is consumed",
  "temperature-lower": "Temperature is lower",
};
const caseNames: Record<CollisionMode, Record<string, string>> = {
  conditions: {
    initial: "Below the energy minimum",
    threshold: "At the energy minimum",
    noContact: "No collision",
    inert: "An inert partner",
    molecular: "Molecular reactive sites",
    atomic: "An atomic encounter",
  },
  solution: {
    initial: "More particles, same volume",
    dilution: "More solution volume",
    equal: "Equal number densities",
    vessel: "A larger vessel",
    lessDespiteCount: "More particles, lower density",
    moreDespiteCount: "Fewer particles, higher density",
  },
  gas: {
    initial: "Compression",
    expansion: "Expansion",
    unchanged: "Unchanged volume",
    stronger: "Greater compression",
    inert: "Optional: inert addition",
    inertCompression: "Optional: compress a mixture",
  },
  surface: {
    initial: "Eight separated pieces",
    whole: "One whole cube",
    fine: "Sixty-four separated pieces",
    joinedEight: "Eight touching pieces",
    joinedFine: "Sixty-four touching pieces",
    separateWhole: "One fully wetted cube",
  },
  comparison: {
    initial: "Same twenty-cm³ endpoint",
    slower: "Same fifteen-cm³ endpoint",
    reverse: "Reverse the faster trial",
    differentAmount: "Different gas endpoints",
    equalRate: "Equal measured means",
    mass: "Measured product mass",
  },
  evidence: {
    initial: "Concentration and energy",
    exactRate: "An exact-rate claim",
    solidAmount: "Speed and final amount",
    joined: "Internal touching faces",
    depletion: "Reactant consumption",
    cooling: "Cooling at fixed count and volume",
  },
};
export function CollisionWorkbench({
  mode,
  record = "initial",
  instruction,
  history,
  onChange,
}: {
  mode: CollisionMode;
  record?: string;
  instruction: string;
  history: Board[];
  onChange: (history: Board[]) => void;
}) {
  const id = useId(),
    b = history.at(-1) ?? initialCollisionBoard(mode, record),
    key = String(b.record);
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const records = collisionRecords[mode] as Record<string, { label: string }>;
  function change(k: string, value: string) {
    if (b[k] === value) return;
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
      k === "record"
        ? initialCollisionBoard(mode, value)
        : { ...b, [k]: value },
    ]);
  }
  function control(k: string) {
    const opts = collisionOptions[mode][k];
    return (
      <div key={k} style={{ minWidth: 0 }}>
        <label htmlFor={`${id}-${k}`}>{labels[k]}</label>
        {opts ? (
          <select
            id={`${id}-${k}`}
            value={b[k]}
            onChange={(e) => change(k, e.target.value)}
          >
            {opts.map((value) => (
              <option key={value} value={value}>
                {words[value] ?? value}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`${id}-${k}`}
            type="text"
            inputMode="decimal"
            value={raw[k] ?? String(b[k])}
            onChange={(e) => {
              const value = e.target.value.slice(0, 40);
              setRaw({ ...raw, [k]: value });
              setFeedback("");
              if (validCollisionNumber(value)) change(k, value);
            }}
          />
        )}
      </div>
    );
  }
  const buildFields: Record<CollisionMode, string[]> = {
    conditions: ["energy", "contact", "partner", "orientation"],
    solution: ["particles", "occupiedVolume"],
    gas: ["occupiedVolume"],
    surface: ["divisions", "separated"],
    comparison: [],
    evidence: [],
  };
  const fields = [
    ...Object.keys(collisionOptions[mode]).filter((k) => k !== "record"),
    ...collisionNumbers[mode],
  ];
  const predictions = fields.filter((k) => !buildFields[mode].includes(k));
  const invalid = Object.keys(raw).some((k) => !validCollisionNumber(raw[k]));
  const gas =
    mode === "gas"
      ? collisionRecords.gas[key as keyof typeof collisionRecords.gas]
      : undefined;
  return (
    <section
      className="model task-workbench collision-workbench"
      aria-label="Task model"
    >
      <h3 className={mode === "conditions" ? "sr-only" : undefined}>
        {titles[mode]}
      </h3>
      {key !== record && (
        <p className="model-context" role="status">
          You are exploring another comparison. Use Check model for it. Reset
          model returns to the lesson question.
        </p>
      )}
      {mode !== "conditions" && <p>{records[key].label}</p>}
      <div className="collision-fields">
        {buildFields[mode]
          .filter(
            (k) =>
              k !== "orientation" ||
              mode !== "conditions" ||
              collisionRecords.conditions[
                key as keyof typeof collisionRecords.conditions
              ].molecular,
          )
          .map(control)}
      </div>
      {invalid && (
        <p role="alert">
          Use a non-negative decimal number. The invalid entry remains visible;
          correct it before checking. It is not saved as a model step.
        </p>
      )}
      {mode === "conditions" && <p>Starting encounter: {records[key].label}</p>}
      <p>
        {key === record
          ? instruction
          : "Make a prediction for this additional comparison, then check the model."}
      </p>
      {mode === "conditions" && (
        <p>
          The stated minimum is{" "}
          {
            collisionRecords.conditions[
              key as keyof typeof collisionRecords.conditions
            ].activation
          }{" "}
          illustrative energy units.{" "}
          {collisionRecords.conditions[
            key as keyof typeof collisionRecords.conditions
          ].molecular
            ? "The specified molecular example also requires reactive sites to meet."
            : "This atomic example has no molecular-end condition."}
        </p>
      )}
      {mode === "conditions" && (
        <EncounterDiagram
          contact={b.contact === "yes"}
          reactingPartner={b.partner === "reactant"}
          energy={Number(b.energy)}
          activation={
            collisionRecords.conditions[
              key as keyof typeof collisionRecords.conditions
            ].activation
          }
          molecular={
            collisionRecords.conditions[
              key as keyof typeof collisionRecords.conditions
            ].molecular
          }
          suitableOrientation={b.orientation === "suitable"}
        />
      )}
      {mode === "surface" && (
        <CollisionScene3D
          state={{
            kind: "solid",
            divisions: Number(b.divisions) as 1 | 2 | 4,
            separated: b.separated === "yes",
          }}
        />
      )}
      {gas && (
        <>
          <p>
            {gas.particles} reacting symbols; {gas.afterInert} inert symbols.
            Temperature is fixed. These particle symbols are schematic, not
            measured moles.
          </p>
          <CollisionScene3D
            state={{
              kind: "gas",
              reacting: gas.particles,
              inert: gas.afterInert,
              volume: Number(b.occupiedVolume),
            }}
          />
        </>
      )}
      {mode === "solution" && (
        <>
          <SolutionDensityDiagram
            particles={Number(b.particles)}
            volume={Number(b.occupiedVolume)}
          />
          <p>
            Reacting count: {b.particles}; occupied volume: {b.occupiedVolume}{" "}
            schematic units. Fixed temperature. Flask capacity is not the
            denominator.
          </p>
        </>
      )}
      <div className="collision-fields">{predictions.map(control)}</div>
      <div className="model-controls">
        <button
          type="button"
          className="button"
          disabled={invalid}
          onClick={() => {
            const result = collisionBoardCheck(mode, b);
            setCorrect(result.correct);
            setFeedback(result.feedback);
          }}
        >
          Check model
        </button>
        <button
          type="button"
          disabled={history.length < 2}
          onClick={() => {
            onChange(history.slice(0, -1));
            setRaw({});
            setFeedback("");
          }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            onChange([initialCollisionBoard(mode, record)]);
            setRaw({});
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
          {correct ? "The prediction matches. " : "Review the prediction. "}
          {feedback}
        </p>
      )}
      <details>
        <summary>Change the supplied teaching case</summary>
        <label htmlFor={`${id}-record`}>Supplied teaching case</label>
        <select
          id={`${id}-record`}
          value={key}
          onChange={(e) => change("record", e.target.value)}
        >
          {Object.keys(records).map((value) => (
            <option key={value} value={value}>
              {caseNames[mode][value]}
            </option>
          ))}
        </select>
      </details>
      <details>
        <summary>About this model</summary>
        <p>
          These are controlled teaching comparisons. Stationary 3D geometry
          represents occupied volume or accessible solid faces. It does not
          measure collisions or establish an exact reaction-rate factor.
          Practical situations are simulated; real experiments require qualified
          school supervision.
        </p>
      </details>
    </section>
  );
}
