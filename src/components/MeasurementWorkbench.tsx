"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialMeasurementBoard,
  measurementPrediction,
  measurementSets,
  biasedReadings,
  investigatorReadings,
  type MeasurementMode,
} from "@/lib/measurement-uncertainty";
import { MeasurementDistribution } from "./MeasurementDistribution";
export function MeasurementWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: MeasurementMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialMeasurementBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
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
  const predict = (label: string, key: string, values: string[], unit = "") =>
    select(label, key, [
      ["unset", "Predict"],
      ...values.map(
        (v) => [v, `${v}${unit ? ` ${unit}` : ""}`] as [string, string],
      ),
    ]);
  const data =
    mode === "selection"
      ? measurementSets[b.case as "fault" | "valid"]
      : mode === "spread"
        ? measurementSets[b.case as "narrow" | "wide"]
        : null;
  const comparison =
    mode === "reproduce"
      ? investigatorReadings(b.case as "agree" | "differ")
      : null;
  const values =
    data?.values ??
    (mode === "bias" ? biasedReadings(Number(b.offset)) : comparison!.first);
  return (
    <section
      className="model task-workbench measurement-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "selection" && (
          <>
            {select("Recorded measurement evidence", "case", [
              ["fault", "Trial 4: confirmed fault"],
              ["valid", "All four readings are valid"],
            ])}
            {select(
              "Excluded recorded trial",
              "excluded",
              [
                [0, "None"],
                [1, "Trial 1"],
                [2, "Trial 2"],
                [3, "Trial 3"],
                [4, "Trial 4"],
              ],
              true,
            )}
            {select("Reason for selection", "reason", [
              ["unset", "Choose reason"],
              ["fault", "Confirmed fault"],
              ["keep", "No fault: keep all"],
              ["target", "Preferred mean"],
              ["furthest", "Furthest only"],
            ])}
            {predict("Your retained reading count", "count", ["3", "4", "1"])}
            {predict(
              "Your retained mean",
              "mean",
              ["10.1", "10.15", "11.075", "10", "14"],
              "g",
            )}
          </>
        )}
        {mode === "spread" && (
          <>
            {select("Repeat temperature set", "case", [
              ["narrow", "Narrower repeat scatter"],
              ["wide", "Wider repeat scatter"],
            ])}
            {predict(
              "Your observed minimum",
              "minimum",
              ["18.2", "17.9", "18.5", "0.3"],
              "°C",
            )}
            {predict(
              "Your observed maximum",
              "maximum",
              ["18.8", "19.1", "18.5", "0.6"],
              "°C",
            )}
            {predict(
              "Your full range width",
              "width",
              ["0.6", "1.2", "0.3", "18.5"],
              "°C",
            )}
            {predict(
              "Your half-range uncertainty",
              "uncertainty",
              ["0.3", "0.6", "1.2", "18.5"],
              "°C",
            )}
          </>
        )}
        {mode === "bias" && (
          <>
            {select(
              "Calibration offset",
              "offset",
              [
                [0, "No added offset"],
                [0.4, "Add 0.4 g to every reading"],
              ],
              true,
            )}
            {select("Reference information", "reference", [
              ["hidden", "No accepted value supplied"],
              ["known", "Reference: 10.0 g"],
            ])}
            {predict("Your repeat mean", "mean", ["10", "10.4", "0.4"], "g")}
            {predict(
              "Your repeat range width",
              "width",
              ["0.2", "0.4", "0", "10.4"],
              "g",
            )}
            {select("Your accuracy conclusion", "accuracy", [
              ["unset", "Choose conclusion"],
              ["unknown", "No reference: cannot assess"],
              ["aligned", "Mean matches reference"],
              ["biased", "Mean differs from reference"],
            ])}
          </>
        )}
        {mode === "reproduce" && (
          <>
            {select("Second investigator's result set", "case", [
              ["agree", "Means agree"],
              ["differ", "Second set has a common offset"],
            ])}
            {predict(
              "Your difference between means",
              "difference",
              ["0", "0.8", "0.2"],
              "g",
            )}
            {select("Repeatable within both sets", "repeatable", [
              ["unset", "Predict"],
              ["yes", "Yes: each set clusters closely"],
              ["no", "No: tight repeats cannot be repeatable"],
            ])}
            {select("Reproducible for this comparison", "reproducible", [
              ["unset", "Predict"],
              ["yes", "Yes: means agree"],
              ["no", "No: means differ"],
            ])}
          </>
        )}
      </div>
      <p className="phase-boundary-note">
        {data?.note ??
          (mode === "bias"
            ? "The same 0.4 g offset, when selected, is added to every original reading. Changing reference information reveals evidence; it does not change the recorded readings."
            : "Two investigators measure the same quantity under comparable conditions. For this example, compare their means with a supplied agreement tolerance of 0.2 g; this is not a universal threshold.")}
      </p>
      <table className="measurement-data-table">
        <caption>Original recorded readings / {data?.unit ?? "g"}</caption>
        <thead>
          <tr>
            <th>Trial</th>
            <th>Value</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {values.map((v, i) => (
            <tr key={i}>
              <th>{comparison ? `A${i + 1}` : i + 1}</th>
              <td>{v}</td>
              <td>
                {mode === "selection" && b.excluded === i + 1
                  ? "Excluded from your mean"
                  : "Retained"}
              </td>
            </tr>
          ))}
          {comparison?.second.map((v, i) => (
            <tr key={`b${i}`}>
              <th>B{i + 1}</th>
              <td>{v}</td>
              <td>Retained</td>
            </tr>
          ))}
        </tbody>
      </table>
      <MeasurementDistribution
        values={values}
        excluded={mode === "selection" ? Number(b.excluded) : 0}
        minimum={mode === "selection" ? 9 : mode === "spread" ? 17.5 : 9.5}
        maximum={mode === "selection" ? 15 : mode === "spread" ? 19.5 : 11.5}
        unit={data?.unit ?? "g"}
        proposedMean={
          mode === "selection" || mode === "bias" ? Number(b.mean) : undefined
        }
        reference={mode === "bias" && b.reference === "known" ? 10 : undefined}
        second={comparison?.second}
      />
      {mode === "spread" && (
        <p>
          Use uncertainty = (maximum − minimum) ÷ 2 for this task. Keep the two
          observed endpoints separate from the full width and the ± estimate.
          Repeat scatter alone does not establish the true temperature.
        </p>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = measurementPrediction(mode, b);
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
