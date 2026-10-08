"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialNanotubeBoard,
  nanotubePrediction,
  type NanotubeMode,
} from "@/lib/nanotubes";
import { NanotubeScene3D } from "./NanotubeScene3D";
import { NanotubeDimensions } from "./NanotubeDimensions";
import { NanotubeMaterialData } from "./NanotubeMaterialData";
export function NanotubeWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: NanotubeMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialNanotubeBoard(mode),
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
      className="model task-workbench nanotube-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "tube" && (
          <>
            {select("Wall shape", "shape", [
              ["unset", "Choose shape"],
              ["tube", "Hollow cylinder"],
              ["sphere", "Spherical cage"],
              ["rod", "Solid carbon rod"],
            ])}
            {select(
              "Interior bonded neighbours",
              "neighbours",
              [
                [0, "Choose count"],
                [2, "Two"],
                [3, "Three"],
                [4, "Four"],
                [6, "Six"],
              ],
              true,
            )}
          </>
        )}
        {mode === "ratio" && (
          <>
            {select(
              "Length in nm",
              "length",
              [
                [500, "500 nm"],
                [1000, "1000 nm"],
                [2000, "2000 nm"],
              ],
              true,
            )}
            {select(
              "Diameter in nm",
              "diameter",
              [
                [1, "1 nm"],
                [2, "2 nm"],
                [4, "4 nm"],
              ],
              true,
            )}
            {select(
              "Predicted length ÷ diameter",
              "ratio",
              [
                [0, "Choose ratio"],
                [125, "125"],
                [250, "250"],
                [500, "500"],
                [1000, "1000"],
                [2000, "2000"],
              ],
              true,
            )}
          </>
        )}
        {mode === "reinforcement" && (
          <>
            {select("Material meeting all limits", "material", [
              ["unset", "Choose material"],
              ["A", "A: plain polymer"],
              ["B", "B: nanotube composite"],
              ["C", "C: metal alloy"],
            ])}
            {select("Strength explanation", "cause", [
              ["unset", "Choose explanation"],
              ["covalent", "Strong covalent bonds"],
              ["sliding", "Weak layer attractions"],
              ["electrons", "Electrons carry charge"],
            ])}
          </>
        )}
        {mode === "electronics" && (
          <>
            {select("Electrical carrier", "carrier", [
              ["unset", "Choose carrier"],
              ["electrons", "Delocalised electrons"],
              ["ions", "Moving carbon ions"],
              ["nuclei", "Moving carbon nuclei"],
            ])}
            {select("Carrier mobility", "mobility", [
              ["unset", "Choose mobility"],
              ["mobile", "Moves through structure"],
              ["fixed", "Fixed at one atom"],
            ])}
          </>
        )}
      </div>
      {mode === "ratio" ? (
        <NanotubeDimensions
          length={Number(board.length)}
          diameter={Number(board.diameter)}
        />
      ) : mode === "reinforcement" ? (
        <NanotubeMaterialData />
      ) : (
        <NanotubeScene3D highlight={mode === "tube"} />
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = nanotubePrediction(mode, board);
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
