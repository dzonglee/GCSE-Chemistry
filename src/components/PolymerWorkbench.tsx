"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialPolymerBoard,
  polymerPrediction,
  type PolymerMode,
} from "@/lib/polymer-structures";
import { PolymerScene3D } from "./PolymerScene3D";
import { PolymerRepeatDiagram } from "./PolymerRepeatDiagram";
import { PolymerSeparation } from "./PolymerSeparation";
import { PolymerPhaseComparison } from "./PolymerPhaseComparison";
export function PolymerWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: PolymerMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialPolymerBoard(mode),
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
      className="model task-workbench polymer-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "chain" && (
          <>
            {select("Structure extent", "extent", [
              ["unset", "Choose extent"],
              ["molecule", "One very large molecule"],
              ["network", "Extended covalent network"],
              ["separate-units", "Separate small units"],
            ])}
            {select("Links within the chain", "bond", [
              ["unset", "Choose link type"],
              ["covalent", "Strong covalent bonds"],
              ["between", "Between-molecule forces"],
            ])}
          </>
        )}
        {mode === "repeat" && (
          <>
            {select("Carbon backbone bond", "backbone", [
              ["unset", "Choose bond"],
              ["single", "Single"],
              ["double", "Double"],
            ])}
            {select(
              "Hydrogens per carbon",
              "hydrogens",
              [
                [0, "Choose count"],
                [1, "One"],
                [2, "Two"],
                [3, "Three"],
              ],
              true,
            )}
            {select("Continuation through brackets", "continuation", [
              ["unset", "Choose continuation"],
              ["yes", "Bonds cross both sides"],
              ["no", "No outside bonds"],
            ])}
            {select("Repeat count marker", "countMark", [
              ["unset", "Choose marker"],
              ["n", "Lower-case n"],
              ["N", "Upper-case N"],
            ])}
          </>
        )}
        {mode === "separation" && (
          <>
            {select("Interaction overcome", "interaction", [
              ["unset", "Choose interaction"],
              ["between", "Between-molecule forces"],
              ["covalent", "Chain covalent bonds"],
            ])}
            {select("Internal chain bonds", "internal", [
              ["unset", "Predict internal bonds"],
              ["intact", "Remain intact"],
              ["break", "Break into units"],
            ])}
          </>
        )}
        {mode === "phase" && (
          <>
            {select("Poly(ethene) molecule size", "size", [
              ["unset", "Compare with methane"],
              ["larger", "Much larger"],
              ["smaller", "Much smaller"],
            ])}
            {select("Between-molecule forces", "forces", [
              ["unset", "Compare attractions"],
              ["stronger", "Stronger than methane"],
              ["weaker", "Weaker than methane"],
              ["covalent", "Only covalent bonds matter"],
            ])}
            {select("Energy to overcome these forces", "energy", [
              ["unset", "Compare energy"],
              ["more", "More energy"],
              ["less", "Less energy"],
            ])}
          </>
        )}
      </div>
      {mode === "chain" && (
        <>
          <div className="bench-actions">
            <button
              className="button"
              disabled={Number(board.units) >= 4}
              onClick={() => change("units", Number(board.units) + 1)}
            >
              Add one repeat unit
            </button>
            <button
              className="text-button"
              disabled={Number(board.units) <= 2}
              onClick={() => change("units", Number(board.units) - 1)}
            >
              Remove one repeat unit
            </button>
          </div>
          <PolymerScene3D units={Number(board.units)} highlight />
        </>
      )}
      {mode === "repeat" && (
        <PolymerRepeatDiagram
          backbone={String(board.backbone)}
          hydrogens={Number(board.hydrogens)}
          continuation={String(board.continuation)}
          countMark={String(board.countMark)}
        />
      )}
      {mode === "separation" && (
        <>
          <PolymerSeparation gap={Number(board.gap)} />
          <button
            className="button"
            disabled={Number(board.gap) >= 3}
            onClick={() => change("gap", Number(board.gap) + 1)}
          >
            Separate intact chains
          </button>
        </>
      )}
      {mode === "phase" && <PolymerPhaseComparison />}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = polymerPrediction(mode, board);
            setFeedback(r.feedback);
            setCorrect(r.correct);
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={!history.length}
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
            onChange([]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          className={`feedback ${correct ? "correct" : "retry"}`}
          role="status"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
