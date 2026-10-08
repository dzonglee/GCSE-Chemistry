"use client";
import type { PathwayMode } from "../lib/pathways";
import {
  initialPathwayBoard,
  validPathwayHistory,
  pathwayHistoryStep,
  type PathwayBoard,
} from "../lib/pathway-board";
import { PathwayAddition } from "./PathwayAddition";
import { PathwayProcess } from "./PathwayProcess";
import { PathwayMap } from "./PathwayMap";
import { PathwayEvidence } from "./PathwayEvidence";
export function OrganicPathwayWorkbench({
  mode,
  history,
  onChange,
  record = "initial",
}: {
  mode: PathwayMode;
  history: PathwayBoard[];
  onChange: (next: PathwayBoard[]) => void;
  record?: string;
  instruction?: string;
}) {
  const valid = validPathwayHistory(mode, history),
    b = history.at(-1) ?? initialPathwayBoard(mode, record),
    locked = history.length >= 500;
  function append(next: PathwayBoard) {
    if (valid && !locked && pathwayHistoryStep(mode, b, next))
      onChange([...history, next]);
  }
  if (!valid)
    return (
      <section
        className="pathway-workbench"
        role="region"
        aria-label="Task model"
      >
        <p role="status">
          The original saved reaction history cannot be read. It remains
          retained until you explicitly start a new model history.
        </p>
        <button
          type="button"
          onClick={() => onChange([initialPathwayBoard(mode, record)])}
        >
          Start a new reaction history
        </button>
      </section>
    );
  return (
    <div className="pathway-workbench" role="region" aria-label="Task model">
      <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="sr-only">Chemical prediction controls</legend>
        {mode === "addition" ? (
          <PathwayAddition board={b} onChange={append} />
        ) : mode === "process" ? (
          <PathwayProcess board={b} onChange={append} />
        ) : mode === "map" ? (
          <PathwayMap board={b} onChange={append} />
        ) : (
          <PathwayEvidence mode={mode} board={b} onChange={append} />
        )}
      </fieldset>
      <div className="model-controls">
        <button
          type="button"
          disabled={history.length < 2}
          onClick={() => onChange(history.slice(0, -1))}
        >
          Undo model change
        </button>
        <button
          type="button"
          onClick={() => onChange([initialPathwayBoard(mode, record)])}
        >
          Reset model history
        </button>
      </div>
      {b.record !== record && (
        <p className="pathway-comparison-note">
          You are exploring another model comparison. Return to this task’s
          original reaction with Reset model history before answering the
          question above.
        </p>
      )}
      {locked && (
        <p role="status">
          This history has reached 500 changes. Undo a change or explicitly
          reset this model history to continue.
        </p>
      )}
    </div>
  );
}
