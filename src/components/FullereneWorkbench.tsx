"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialFullereneBoard,
  fullerenePrediction,
  type FullereneMode,
} from "@/lib/fullerenes";
import { FullereneScene3D } from "./FullereneScene3D";
import { FullereneSeparation } from "./FullereneSeparation";
export function FullereneWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: FullereneMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialFullereneBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const change = (key: string, value: string | number) => {
    if (board[key] === value) return;
    if (history.length >= 500) {
      setFeedback(
        "Undo or reset this model to continue: the saved-step limit has been reached.",
      );
      setCorrect(false);
      return;
    }
    setFeedback("");
    setCorrect(false);
    onChange([...history, { ...board, [key]: value }]);
  };
  const select = (
    label: string,
    key: string,
    options: [string | number, string][],
    numeric = false,
    visibleLabel = label,
  ) => (
    <label>
      {visibleLabel}
      <select
        aria-label={label}
        value={board[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section
      className="model task-workbench fullerene-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "cage" && (
          <>
            {select("Structure extent", "extent", [
              ["unset", "Choose extent"],
              ["molecule", "Discrete hollow molecule"],
              ["sheet", "Extended planar sheet"],
            ])}
            <div className="fullerene-ring-controls">
              {select(
                "Inspect a ring",
                "ring",
                [
                  [0, "Ring A"],
                  [1, "Ring B"],
                  [2, "Ring C"],
                ],
                true,
                "Inspect ring",
              )}
              {select(
                "Carbons in the selected ring",
                "count",
                [
                  [0, "Choose"],
                  [5, "5"],
                  [6, "6"],
                  [7, "7"],
                ],
                true,
                "Ring carbons",
              )}
            </div>
          </>
        )}
        {mode === "separation" && (
          <>
            {select("Interaction overcome in separation", "force", [
              ["unset", "Choose interaction"],
              ["between", "Between-molecule attractions"],
              ["covalent", "Internal covalent cage bonds"],
            ])}
            {select("Internal bonds after separation", "internal", [
              ["unset", "Choose consequence"],
              ["intact", "All remain intact"],
              ["break", "All break into separate atoms"],
            ])}
          </>
        )}
        {mode === "carrier" && (
          <>
            {select("Feature supporting a possible carrier role", "feature", [
              ["unset", "Choose feature"],
              ["hollow", "Hollow cage shape"],
              ["colour", "Colour alone"],
              ["sliding", "Sliding graphite-style sheets"],
            ])}
            {select("Does shape alone guarantee suitability?", "guarantee", [
              ["unset", "Choose inference"],
              ["no", "No — further evidence is needed"],
              ["yes", "Yes — every payload is safe and fits"],
            ])}
          </>
        )}
      </div>
      {mode === "separation" ? (
        <>
          <FullereneSeparation gap={Number(board.gap)} />
          <button
            className="button"
            disabled={board.gap === 3}
            onClick={() => change("gap", Number(board.gap) + 1)}
          >
            Separate the intact molecules
          </button>
        </>
      ) : (
        <FullereneScene3D
          ring={mode === "cage" ? Number(board.ring) : 0}
          highlight={mode === "cage"}
          payload={mode === "carrier" && board.payload === 1}
        />
      )}
      {mode === "carrier" && (
        <>
          <button
            className="button"
            onClick={() => change("payload", board.payload === 1 ? 0 : 1)}
          >
            {board.payload === 1
              ? "Remove conceptual payload"
              : "Show conceptual enclosure"}
          </button>
          <p>
            A conceptual marker illustrates enclosure. It supplies no actual
            drug dimensions, dosage, release test or safety evidence.
          </p>
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = fullerenePrediction(mode, board);
            setFeedback(r.feedback);
            setCorrect(r.correct);
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            setFeedback("");
            setCorrect(false);
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFeedback("");
            setCorrect(false);
            onChange([initialFullereneBoard(mode)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={`feedback ${correct ? "correct" : "retry"}`}
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
