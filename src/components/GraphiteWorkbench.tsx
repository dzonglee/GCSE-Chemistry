"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialGraphiteBoard,
  graphitePrediction,
  type GraphiteMode,
} from "@/lib/graphite";
import { GraphiteScene3D } from "./GraphiteScene3D";
import { GraphiteProjection } from "./GraphiteProjection";
export function GraphiteWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: GraphiteMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialGraphiteBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [highlight, setHighlight] = useState(false);
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
    setHighlight(false);
    onChange([...history, { ...board, [key]: value }]);
  };
  const select = (
    label: string,
    key: string,
    options: [string | number, string][],
    numeric = false,
  ) => (
    <label>
      {label}
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
      className="model task-workbench graphite-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "coordination" && (
          <>
            {select(
              "Bonded neighbours",
              "neighbours",
              [
                [0, "Choose a count"],
                [2, "2 neighbours"],
                [3, "3 neighbours"],
                [4, "4 neighbours"],
                [6, "6 neighbours"],
              ],
              true,
            )}
            {select(
              "Inspect a sheet",
              "site",
              [
                [0, "Lower sheet"],
                [1, "Middle sheet"],
                [2, "Upper sheet"],
              ],
              true,
            )}
          </>
        )}
        {mode === "sliding" && (
          <>
            {select("Interaction overcome during sliding", "force", [
              ["unset", "Choose interaction"],
              ["interlayer", "Weak attractions between sheets"],
              ["covalent", "Strong covalent bonds within sheets"],
            ])}
            {select("Within-sheet bonds after sliding", "effect", [
              ["unset", "Choose consequence"],
              ["intact", "Remain intact"],
              ["break", "All break into separate atoms"],
            ])}
          </>
        )}
        {mode === "carriers" && (
          <>
            {select("Graphite charge carriers", "carrier", [
              ["unset", "Choose carriers"],
              ["electrons", "Delocalised electrons"],
              ["nuclei", "Carbon nuclei"],
              ["ions", "Mobile carbon ions"],
            ])}
            {select("Carrier movement through a sheet", "mobility", [
              ["unset", "Choose movement"],
              ["mobile", "Mobile through the sheet"],
              ["fixed", "Fixed at one carbon"],
            ])}
          </>
        )}
        {mode === "melting" && (
          <>
            {select(
              "Interaction overcome in changing the giant structure",
              "force",
              [
                ["unset", "Choose interaction"],
                ["covalent", "Many strong in-sheet covalent bonds"],
                ["interlayer", "Only weak interlayer attractions"],
              ],
            )}
            {select(
              "Energy required for changing the giant structure",
              "energy",
              [
                ["unset", "Choose energy"],
                ["high", "Much energy"],
                ["low", "Little energy"],
              ],
            )}
          </>
        )}
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = graphitePrediction(mode, board);
            setFeedback(r.feedback);
            setCorrect(r.correct);
            setHighlight(mode === "coordination");
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
            setHighlight(false);
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
            setHighlight(false);
            onChange([initialGraphiteBoard(mode)]);
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
      {mode === "coordination" ? (
        <GraphiteScene3D site={Number(board.site)} highlight={highlight} />
      ) : (
        <>
          <GraphiteProjection
            site={2}
            highlight
            shift={mode === "sliding" ? Number(board.shift) : 0}
            drift={mode === "carriers" ? Number(board.drift) : 0}
            electrons={mode === "carriers"}
          />
          {mode === "sliding" && (
            <>
              <button
                className="button"
                disabled={board.shift === 3}
                onClick={() => change("shift", Number(board.shift) + 1)}
              >
                Slide the upper sheet
              </button>
              <p>
                Each whole-sheet movement preserves its carbon–carbon bonds. It
                illustrates permitted sliding without measuring real friction or
                force.
              </p>
            </>
          )}
          {mode === "carriers" && (
            <>
              <button
                className="button"
                disabled={board.drift === 3}
                onClick={() => change("drift", Number(board.drift) + 1)}
              >
                Advance electron drift
              </button>
              <p>
                The electron markers move; carbon positions stay fixed. Real
                delocalised electrons do not occupy these literal dots or
                classical paths. Conduction is represented within the sheets.
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}
