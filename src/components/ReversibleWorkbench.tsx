"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import type { ReversibleMode } from "../lib/reversible-equilibrium";
import {
  directionRecords,
  reversibleEnergies,
  turnoverRecords,
  turnoverMax,
  reversibleRates,
  boundaryRecords,
  equilibriumEvidence,
} from "../lib/reversible-equilibrium";
import {
  initialReversibleBoard,
  validReversibleBoard,
  reversibleBoardCheck,
  reversibleRecords,
} from "../lib/reversible-board";
import type { ReversibleBoard } from "../lib/reversible-board";
import {
  TurnoverMap,
  ReversalEnergy,
  EquilibriumTraces,
} from "./ReversibleDiagrams";
type SavedBoard = Record<string, string | number>;
const titles: Record<ReversibleMode, string> = {
  direction: "Read the chosen reaction direction",
  energy: "Reverse the energy transfer",
  turnover: "See continuing reactions",
  rates: "Separate gross rates from net change",
  boundary: "Inspect the system and evidence",
  evidence: "Compare amount and rate traces",
};
const classifications = [
  ["equilibrium", "Dynamic equilibrium demonstrated"],
  ["notEquilibrium", "Not dynamic equilibrium under the stated conditions"],
  ["insufficient", "Insufficient evidence"],
] as const;
const reasons = [
  ["closedEqualContinuing", "Closed system; equal continuing rates"],
  ["matterEscapes", "Reacting matter escapes"],
  ["noContinuing", "No continuing reaction measured"],
  ["amountsNotRates", "Equal amounts do not establish equal rates"],
  ["externalFlow", "External flow keeps amounts constant"],
  ["plateauAlone", "Plateau alone cannot distinguish stopped from continuing"],
] as const;
export function ReversibleWorkbench({
  mode,
  history,
  onChange,
  record: originalRecord = "initial",
  instruction,
}: {
  mode: ReversibleMode;
  history: SavedBoard[];
  onChange: (history: SavedBoard[]) => void;
  record?: string;
  instruction?: string;
}) {
  const uid = useId(),
    value = (history.at(-1) ??
      initialReversibleBoard(mode, originalRecord)) as ReversibleBoard;
  const [raw, setRaw] = useWorkbenchInputDraft<ReversibleBoard | null>(null),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    b = raw ?? value,
    record = b.record;
  const append = (next: ReversibleBoard) => {
    if (
      history.length < 500 &&
      Object.keys(next).some((k) => next[k] !== value[k])
    )
      onChange([...history, next]);
  };
  const update = (key: string, v: string) => {
    const next = { ...b, [key]: v };
    setFeedback(null);
    if (validReversibleBoard(mode, next)) {
      setRaw(null);
      append(next);
    } else setRaw(next);
  };
  const select = (
    key: string,
    label: string,
    choices: readonly (readonly string[])[],
  ) => (
    <div key={key}>
      <label htmlFor={uid + "-" + key}>{label}</label>
      <select
        id={uid + "-" + key}
        value={b[key]}
        onChange={(e) => update(key, e.target.value)}
      >
        {key !== "direction" && <option value="">Choose a prediction</option>}
        {choices.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
      {(choices.find(([v]) => v === b[key])?.[1]?.length ?? 0) > 20 && (
        <p className="reversible-selection">
          Selected: {choices.find(([v]) => v === b[key])?.[1]}
        </p>
      )}
    </div>
  );
  const number = (key: string, label: string) => (
    <div key={key}>
      <label htmlFor={uid + "-" + key}>{label}</label>
      <input
        id={uid + "-" + key}
        type="text"
        inputMode={["change", "net"].includes(key) ? "text" : "decimal"}
        value={b[key]}
        onChange={(e) => update(key, e.target.value)}
      />
    </div>
  );
  let controls: React.ReactNode = null,
    visual: React.ReactNode = null,
    predictions: React.ReactNode = null;
  if (mode === "turnover") {
    const r = turnoverRecords[record],
      step = Number(value.step);
    controls = (
      <button
        type="button"
        className="button"
        disabled={
          raw !== null || step >= turnoverMax(r) || history.length >= 500
        }
        onClick={() => update("step", String(step + 1))}
      >
        Advance one interval
      </button>
    );
    visual = (
      <>
        <p>
          Each constructed interval: {r.forward} A → B events and {r.reverse} B
          → A events. All events use different tokens present at the start of
          that interval. Interval {step} of {turnoverMax(r)}.
        </p>
        {step >= turnoverMax(r) && (
          <p role="status">
            {r.forward === r.reverse && r.forward > 0
              ? "All six supplied intervals are shown. This display limit does not mean the equilibrium reactions stop."
              : "Only this supplied interval is shown; no later rate law is assumed."}
          </p>
        )}
        <TurnoverMap record={r} step={step} />
      </>
    );
    predictions = (
      <>
        {number("a", "Your current A token count")}
        {number("b", "Your current B token count")}
        {number("forward", "Your cumulative forward events")}
        {number("reverse", "Your cumulative reverse events")}
        {select(
          "classification",
          "Your dynamic-equilibrium conclusion",
          classifications.slice(0, 2),
        )}
      </>
    );
  }
  if (mode === "direction") {
    const r = directionRecords[record];
    controls = select("direction", "Direction to inspect", [
      ["forward", "Forward: left to right"],
      ["reverse", "Reverse: right to left"],
    ]);
    visual = (
      <>
        <p className="reversible-equation">
          {r.left}
          <strong aria-label="reversible reaction"> ⇌ </strong>
          {r.right}
        </p>
        <div
          className="reversible-reading"
          aria-label="Selected reaction reading"
        >
          <p>
            <strong>Start</strong>
            <span>{b.direction === "forward" ? r.left : r.right}</span>
          </p>
          <span aria-hidden="true" className="reversible-reading-arrow">
            →
          </span>
          <p>
            <strong>Formed</strong>
            <span>{b.direction === "forward" ? r.right : r.left}</span>
          </p>
        </div>
        <dl>
          <dt>Supplied forward condition</dt>
          <dd>{r.forwardCondition}</dd>
          <dt>Supplied reverse condition</dt>
          <dd>{r.reverseCondition}</dd>
        </dl>
        <p>
          Requested direction for this record: {r.target}. Forward and reverse
          refer to this displayed equation; heating does not universally mean
          forward.
        </p>
      </>
    );
    predictions = (
      <>
        {select("input", "Your starting substances", [
          ["left", "Displayed left side"],
          ["right", "Displayed right side"],
        ])}
        {select("output", "Your formed substances", [
          ["left", "Displayed left side"],
          ["right", "Displayed right side"],
        ])}
        {select("condition", "Your applicable supplied condition", [
          ["forward", "Supplied forward condition"],
          ["reverse", "Supplied reverse condition"],
        ])}
      </>
    );
  }
  if (mode === "energy") {
    const r = reversibleEnergies[record];
    controls = select("direction", "Energy direction to inspect", [
      ["forward", "Forward"],
      ["reverse", "Reverse"],
    ]);
    visual = (
      <>
        <p>
          Requested: {r.reverse ? "reverse" : "forward"} change for the target
          batch. Displayed forward reference endpoints: {r.left} → {r.right} kJ.
        </p>
        <ReversalEnergy record={r} direction={b.direction} />
      </>
    );
    predictions = (
      <>
        {number("change", "Your signed target energy change / kJ")}
        {number("magnitude", "Your magnitude transferred / kJ")}
        {select("flow", "Your direction of energy transfer", [
          ["toSurroundings", "To the surroundings"],
          ["fromSurroundings", "From the surroundings"],
        ])}
      </>
    );
  }
  if (mode === "rates") {
    const r = reversibleRates[record];
    controls = number("net", "Your signed net B change / tokens");
    visual = (
      <>
        <p>
          Constructed 1:1 A ⇌ B in a fixed closed volume. Initial {r.a} A and{" "}
          {r.b} B. Supplied gross rates held for this one {r.seconds} s
          interval; no extrapolation beyond it.
        </p>
        <table>
          <caption>Supplied directional event rates</caption>
          <thead>
            <tr>
              <th>Direction</th>
              <th>Events / s</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>A → B</th>
              <td>{r.forward}</td>
            </tr>
            <tr>
              <th>B → A</th>
              <td>{r.reverse}</td>
            </tr>
          </tbody>
        </table>
        <p>
          The rate unit is the same in both columns. A zero net change does not
          by itself establish a continuing reaction.
        </p>
      </>
    );
    predictions = (
      <>
        {number("a", "Your A count after the interval")}
        {number("b", "Your B count after the interval")}
        {select(
          "classification",
          "Your dynamic-equilibrium conclusion",
          classifications.slice(0, 2),
        )}
      </>
    );
  }
  if (mode === "boundary") {
    const r = boundaryRecords[record];
    controls = select(
      "classification",
      "Your evidence-based conclusion",
      classifications,
    );
    visual = (
      <>
        <p>{r.description}</p>
        <p className="reversible-boundary">
          <strong>Boundary: {r.boundary}</strong> —{" "}
          {r.boundary === "closed"
            ? "reacting matter retained"
            : "reacting matter can cross"}
        </p>
      </>
    );
    predictions = select("reason", "Your supporting reason", reasons);
  }
  if (mode === "evidence") {
    const r = equilibriumEvidence[record];
    controls = select("time", "Your earliest demonstrated equilibrium / s", [
      ...r.times.map((t) => [String(t), String(t)]),
      ["none", "None in the supplied observation period"],
    ]);
    visual = <EquilibriumTraces record={r} />;
    predictions = select(
      "reason",
      "Your supporting rate and boundary evidence",
      reasons
        .filter(([v]) =>
          [
            "closedEqualContinuing",
            "amountsNotRates",
            "noContinuing",
            "externalFlow",
          ].includes(v),
        )
        .map(([v, t]) => [
          v === "closedEqualContinuing" ? "equalContinuing" : v,
          t,
        ]),
    );
  }
  return (
    <section
      className="model task-workbench reversible-workbench"
      aria-label="Task model"
    >
      <h3 className={mode === "turnover" ? "sr-only" : undefined}>
        {titles[mode]}
      </h3>
      <div className="reversible-fields">{controls}</div>
      <p>
        {
          (reversibleRecords[mode] as Record<string, { label: string }>)[record]
            .label
        }
      </p>
      {instruction && record === originalRecord && <p>{instruction}</p>}
      {record !== originalRecord && (
        <p role="status">
          You are exploring another supplied comparison. Check model applies to
          it; Reset model returns to the lesson question.
        </p>
      )}
      {history.length >= 500 && (
        <p role="status">
          The saved history is full. Undo or reset before another saved change.
        </p>
      )}
      {raw && (
        <p role="status">
          This unfinished entry is visible but is not saved. Enter a plain
          number, undo it, or reset the model.
        </p>
      )}
      {visual}
      <div className="reversible-fields">{predictions}</div>
      <div className="reversible-actions">
        <button
          type="button"
          className="button"
          onClick={() => setFeedback(reversibleBoardCheck(mode, b))}
        >
          Check model
        </button>
        <button
          type="button"
          className="button"
          disabled={!raw && history.length < 2}
          onClick={() => {
            setFeedback(null);
            if (raw) setRaw(null);
            else onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          className="button"
          onClick={() => {
            setRaw(null);
            setFeedback(null);
            onChange([initialReversibleBoard(mode, originalRecord)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={feedback.correct ? "feedback correct" : "feedback retry"}
        >
          {feedback.message}
        </p>
      )}
      <details>
        <summary>Change the supplied teaching case</summary>
        <label htmlFor={uid + "-record"}>Supplied comparison</label>
        <select
          id={uid + "-record"}
          value={record}
          onChange={(e) => {
            setRaw(null);
            setFeedback(null);
            if (e.target.value !== value.record)
              append(initialReversibleBoard(mode, e.target.value));
          }}
        >
          {Object.entries(reversibleRecords[mode]).map(([id, r]) => (
            <option key={id} value={id}>
              {r.label}
            </option>
          ))}
        </select>
      </details>
      <details>
        <summary>About this model</summary>
        <p>
          These are constructed comparisons and supplied observations. Token
          changes are not a molecular mechanism or universal rate law. Dynamic
          equilibrium requires a closed reacting system and continuing equal
          forward and reverse rates at fixed conditions. Constant amounts need
          not be equal. No unsupervised practical procedure is provided.
        </p>
      </details>
    </section>
  );
}
