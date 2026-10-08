"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialConcentrationBoard,
  concentrationPrediction,
  concentrationChoices,
  type ConcentrationMode,
} from "@/lib/solution-concentration";
import { VolumeConversionAxis } from "./VolumeConversionAxis";
import { SolutionVolume3D } from "./SolutionVolume3D";
export function ConcentrationWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: ConcentrationMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialConcentrationBoard(mode),
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
    values: [string | number, string][],
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
        {values.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
  const predict = (label: string, key: string, unit: string) =>
    select(
      label,
      key,
      (concentrationChoices[mode] as Record<string, readonly string[]>)[
        key
      ].map((v) => [v, v === "unset" ? "Predict" : `${v} ${unit}`]),
    );
  return (
    <section
      className="model task-workbench concentration-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "unit-rate" && (
          <>
            {select(
              "Dissolved solute mass",
              "mass",
              [4, 10, 20].map((v) => [v, `${v} g`]),
              true,
            )}
            {select(
              "Final solution volume",
              "cm3",
              [100, 200, 250, 500, 1000].map((v) => [v, `${v} cm³`]),
              true,
            )}
            {predict("Your converted solution volume", "dm3", "dm³")}
            {predict("Your concentration", "concentration", "g/dm³")}
          </>
        )}
        {mode === "basis" && (
          <>
            {select("Chosen numerator mass", "numerator", [
              ["solute", "Dissolved solute: 5 g"],
              ["whole", "Whole solution: 260 g"],
            ])}
            {select("Chosen denominator volume", "denominator", [
              ["solution", "Final solution: 250 cm³"],
              ["solvent", "Starting solvent: 240 cm³"],
            ])}
            {predict("Your concentration", "concentration", "g/dm³")}
          </>
        )}
        {mode === "mass" && (
          <>
            {select(
              "Supplied concentration",
              "concentration",
              [4, 20, 40].map((v) => [v, `${v} g/dm³`]),
              true,
            )}
            {select(
              "Homogeneous solution sample volume",
              "cm3",
              [25, 100, 250, 500].map((v) => [v, `${v} cm³`]),
              true,
            )}
            {predict("Your converted sample volume", "dm3", "dm³")}
            {predict("Your dissolved solute mass", "mass", "g")}
          </>
        )}
        {mode === "volume" && (
          <>
            {select(
              "Supplied dissolved solute mass",
              "mass",
              [4, 10, 20].map((v) => [v, `${v} g`]),
              true,
            )}
            {select(
              "Supplied concentration",
              "concentration",
              [20, 40, 80].map((v) => [v, `${v} g/dm³`]),
              true,
            )}
            {predict("Your final solution volume", "dm3", "dm³")}
            {predict("Your converted final volume", "cm3", "cm³")}
          </>
        )}
      </div>
      {mode === "basis" ? (
        <p className="phase-boundary-note">
          Supplied measured data: 5 g solute is fully dissolved. Final solution
          volume 250 cm³; original solvent volume 240 cm³; whole solution mass
          260 g. Choose the concentration quantities. Solute mass and solvent
          volume are not assumed to add to a final volume without measurement.
        </p>
      ) : (
        <p className="phase-boundary-note">
          {mode === "unit-rate"
            ? `Supplied dissolved solute: ${b.mass} g. Final solution volume: ${b.cm3} cm³.`
            : mode === "mass"
              ? `Supplied homogeneous solution: ${b.concentration} g dissolved solute per 1 dm³. The specified sample volume is ${b.cm3} cm³.`
              : `Supplied dissolved solute: ${b.mass} g; concentration: ${b.concentration} g/dm³. Find final solution volume.`}{" "}
          The concentration counts dissolved solute, not whole-solution mass.
          All supplied solute is dissolved; no reaction or loss occurs.
        </p>
      )}
      {mode !== "basis" && (
        <VolumeConversionAxis
          sourceCm3={mode !== "volume" ? Number(b.cm3) : undefined}
          proposedDm3={Number(b.dm3)}
          proposedCm3={mode === "volume" ? Number(b.cm3) : undefined}
        />
      )}
      <p>
        {mode === "mass"
          ? "Solute mass (g) = concentration (g/dm³) × solution volume (dm³)."
          : mode === "volume"
            ? "Solution volume (dm³) = dissolved-solute mass (g) ÷ concentration (g/dm³)."
            : "Concentration (g/dm³) = dissolved-solute mass (g) ÷ final solution volume (dm³)."}
      </p>
      {mode === "unit-rate" && (
        <>
          <button
            className="button"
            aria-expanded={show3D}
            onClick={() => setShow3D(!show3D)}
          >
            {show3D ? "Hide 3D solution volume" : "Show 3D solution volume"}
          </button>
          {show3D && (
            <SolutionVolume3D
              key={`${b.mass}:${b.cm3}`}
              mass={Number(b.mass)}
              cm3={Number(b.cm3)}
            />
          )}
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = concentrationPrediction(mode, b);
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
