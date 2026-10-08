"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialStateBoard,
  statePrediction,
  stateFromData,
  transitionData,
  type StateMode,
  type ParticlePhase,
} from "@/lib/states-of-matter";
import { StateScene3D } from "./StateScene3D";
import { StateTemperatureAxis } from "./StateTemperatureAxis";
import { StateTransitionDiagram } from "./StateTransitionDiagram";
export function StateWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: StateMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialStateBoard(mode),
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
  const forecast = stateFromData(Number(board.temperature ?? 0), -20, 60);
  return (
    <section
      className="model task-workbench state-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "solid" && (
          <>
            {select("Predicted particle arrangement", "arrangement", [
              ["unset", "Choose arrangement"],
              ["close-ordered", "Close and regular"],
              ["far", "Widely separated"],
              ["close-random", "Close and disordered"],
            ])}
            {select("Predicted solid movement", "motion", [
              ["unset", "Choose movement"],
              ["vibrate", "Vibrate in fixed positions"],
              ["still", "Do not move at all"],
              ["flow", "Move past one another"],
            ])}
          </>
        )}
        {mode === "liquid-gas" && (
          <>
            {select("Inspect a state", "phase", [
              ["liquid", "Liquid"],
              ["gas", "Gas"],
            ])}
            {select("Predicted arrangement", "arrangement", [
              ["unset", "Choose arrangement"],
              ["close-random", "Close and disordered"],
              ["far-random", "Widely spaced and random"],
              ["close-ordered", "Close and regular"],
            ])}
            {select("Predicted movement", "motion", [
              ["unset", "Choose movement"],
              ["past", "Move past one another"],
              ["rapid", "Rapid random movement"],
              ["still", "No movement"],
            ])}
          </>
        )}
        {mode === "forecast" && (
          <>
            {select(
              "Temperature in °C",
              "temperature",
              [
                [-40, "−40 °C"],
                [-20, "−20 °C"],
                [0, "0 °C"],
                [20, "20 °C"],
                [40, "40 °C"],
                [60, "60 °C"],
                [80, "80 °C"],
              ],
              true,
            )}
            {select("Your predicted state", "prediction", [
              ["unset", "Choose predicted state"],
              ["solid", "Solid"],
              ["liquid", "Liquid"],
              ["gas", "Gas"],
              ["solid/liquid", "Solid + liquid boundary"],
              ["liquid/gas", "Liquid + gas boundary"],
            ])}
          </>
        )}
        {mode === "transition" && (
          <>
            {select("Physical change", "change", [
              ["melting", "Melting"],
              ["freezing", "Freezing"],
              ["boiling", "Boiling"],
              ["condensing", "Condensing"],
            ])}
            {select("Energy transfer", "energy", [
              ["unset", "Choose direction"],
              ["in", "Into the substance"],
              ["out", "To the surroundings"],
            ])}
            {select("Particle identity", "identity", [
              ["unset", "Predict particle identity"],
              ["same", "Chemical identity retained"],
              ["grow", "Particles grow larger"],
              ["chemical", "A new substance forms"],
            ])}
          </>
        )}
      </div>
      {(mode === "solid" || mode === "liquid-gas") && (
        <>
          <button
            className="button"
            disabled={Number(board.frame) >= 3}
            onClick={() => change("frame", Number(board.frame) + 1)}
          >
            Advance illustrative motion
          </button>
          <p className="position-caption">
            Frame {board.frame} of 3. Track the gold particle; movement is
            illustrative rather than measured speed.
          </p>
          <StateScene3D
            phase={
              mode === "solid"
                ? "solid"
                : (String(board.phase) as ParticlePhase)
            }
            frame={Number(board.frame)}
          />
        </>
      )}
      {mode === "forecast" && (
        <>
          <StateTemperatureAxis temperature={Number(board.temperature)} />
          {forecast.includes("/") ? (
            <p className="phase-boundary-note">
              <strong>Transition boundary:</strong>{" "}
              {forecast === "solid/liquid"
                ? "solid and liquid"
                : "liquid and gas"}{" "}
              may coexist. Temperature alone does not determine their
              proportions.
            </p>
          ) : (
            <StateScene3D phase={forecast as ParticlePhase} />
          )}
        </>
      )}
      {mode === "transition" && (
        <StateTransitionDiagram
          change={String(board.change) as keyof typeof transitionData}
        />
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = statePrediction(mode, board);
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
