"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  changeChoices,
  initialChangeBoard,
  changePrediction,
  type ChangeMode,
} from "@/lib/changing-concentration";
import { SolutionVolume3D } from "./SolutionVolume3D";
const reasons: Record<string, string> = {
  "mass-over-volume": "Mass factor ÷ volume factor",
  multiply: "Multiply both factors",
  "mass-only": "Use mass factor only",
  "volume-only": "Use volume factor only",
  "retained-more-volume": "Solute retained; use final volume",
  "solute-lost": "Dilution removes solute",
  "same-strength": "Dilution keeps concentration",
  "both-proportional": "Mass and volume scale together",
  "all-solute-retained": "All solute stays in retained part",
  "final-minus-initial": "Final volume minus original",
  "target-is-added": "Final volume is added volume",
  "lose-solute": "Reach target by losing solute",
};
export function ChangingConcentrationWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: ChangeMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialChangeBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [show3D, setShow3D] = useState(false);
  const change = (key: string, value: string | number) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [key]: value }]);
  };
  const select = (
    label: string,
    key: string,
    unit: string,
    numeric = false,
  ) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {(changeChoices[mode] as Record<string, readonly (string | number)[]>)[
          key
        ].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : key === "reason"
                ? reasons[v]
                : `${v}${unit}`}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section
      className="model task-workbench changing-concentration-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "factors" && (
          <>
            {select("Dissolved-mass factor", "massFactor", "×", true)}
            {select("Final-volume factor", "volumeFactor", "×", true)}
            {select("Your concentration factor", "factor", "×")}
          </>
        )}
        {mode === "dilution" && (
          <>
            {select("Final solution volume", "finalCm3", " cm³", true)}
            {select("Your retained solute mass", "mass", " g")}
            {select("Your concentration", "concentration", " g/dm³")}
          </>
        )}
        {mode === "portion" && (
          <>
            {select("Retained solution volume", "retainedCm3", " cm³", true)}
            {select("Your retained solute mass", "mass", " g")}
            {select("Your retained concentration", "concentration", " g/dm³")}
          </>
        )}
        {mode === "target" && (
          <>
            {select("Target concentration", "target", " g/dm³", true)}
            {select("Your final solution volume", "finalCm3", " cm³")}
            {select("Your added solvent volume", "addedCm3", " cm³")}
          </>
        )}
        {select("Your reason", "reason", "")}
      </div>
      <p className="phase-boundary-note">
        {mode === "factors"
          ? `Compare separate samples of the same fully dissolved solute. Initial: 8 g in 250 cm³. New dissolved mass: ${8 * Number(b.massFactor)} g; final solution volume: ${250 * Number(b.volumeFactor)} cm³. Neither mass nor volume is assumed fixed.`
          : mode === "dilution"
            ? `Initial solution: 10 g in 250 cm³. All 10 g solute is retained; pure solvent changes the measured final volume to ${b.finalCm3} cm³.`
            : mode === "portion"
              ? `Original homogeneous solution: 10 g in 500 cm³. Retained: ${b.retainedCm3} cm³. Removed: ${500 - Number(b.retainedCm3)} cm³. Account for solute in both parts.`
              : `Original solution: 10 g in 250 cm³. Retain all solute and target ${b.target} g/dm³. For this example only, assume solution and added pure-solvent volumes are additive.`}{" "}
        No reaction or unaccounted solute loss occurs.
      </p>
      {mode === "factors" && (
        <figure className="concentration-factor-axis">
          <svg
            viewBox="0 0 700 180"
            role="img"
            aria-label="Student concentration factor on a zero-to-eight scale"
          >
            <line
              x1="55"
              x2="655"
              y1="95"
              y2="95"
              stroke="#929bad"
              strokeWidth="3"
            />
            {[0, 1, 2, 4, 6, 8].map((v) => (
              <g key={v}>
                <line
                  x1={55 + 75 * v}
                  x2={55 + 75 * v}
                  y1="88"
                  y2="105"
                  stroke="#929bad"
                />
                <text x={55 + 75 * v} y="145" textAnchor="middle" fontSize="40">
                  {v}×
                </text>
              </g>
            ))}
            <line
              x1="130"
              x2="130"
              y1="28"
              y2="110"
              stroke="#3f4fd0"
              strokeWidth="4"
            />
            {b.factor !== "unset" && (
              <line
                data-proposed-factor={b.factor}
                x1={55 + 75 * Number(b.factor)}
                x2={55 + 75 * Number(b.factor)}
                y1="45"
                y2="110"
                stroke="#bd8c24"
                strokeWidth="5"
              />
            )}
          </svg>
          <figcaption>
            Blue marks the original concentration factor 1. Gold shows your
            prediction as entered; it is not corrected by the diagram.
          </figcaption>
        </figure>
      )}
      {mode === "portion" && (
        <div className="changing-portion-cards">
          <p>
            <strong>Retained portion</strong>
            <br />
            {b.retainedCm3} cm³
            <br />
            Your solute prediction:{" "}
            {b.mass === "unset" ? "not entered" : `${b.mass} g`}
          </p>
          <p>
            <strong>Removed portion</strong>
            <br />
            {500 - Number(b.retainedCm3)} cm³
            <br />
            {b.mass === "unset"
              ? "Predict retained mass first"
              : `10 g − your ${b.mass} g = ${10 - Number(b.mass)} g claimed removed`}
          </p>
        </div>
      )}
      <p>
        Concentration (g/dm³) = dissolved-solute mass (g) ÷ final solution
        volume (dm³).
      </p>
      {mode === "dilution" && (
        <>
          <button
            className="button"
            aria-expanded={show3D}
            onClick={() => setShow3D(!show3D)}
          >
            {show3D
              ? "Hide retained-solute 3D model"
              : "Show retained-solute 3D model"}
          </button>
          {show3D && (
            <SolutionVolume3D
              key={String(b.finalCm3)}
              mass={10}
              cm3={Number(b.finalCm3)}
            />
          )}
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = changePrediction(mode, b);
            setCorrect(r.correct);
            setFeedback(r.feedback);
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={!history.length}
          onClick={() => {
            setFeedback("");
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFeedback("");
            onChange([]);
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
