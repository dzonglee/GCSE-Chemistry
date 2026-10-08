"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { initialBoard, checkBoard } from "@/lib/workbench";
import { AtomicModelDiagram, scatteringPrediction } from "./AtomicModelDiagram";
export function ScatteringWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "scattering" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model);
  const distribution = board.distribution as "spread" | "central",
    approach = board.approach as "far" | "near" | "head-on";
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    feedback: string;
  } | null>(null);
  const change = (key: string, value: string) => {
    if (board[key] === value) return;
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback: "Undo or reset to continue; your answers are retained.",
      });
      return;
    }
    onChange([...history, { ...board, [key]: value }]);
    setFeedback(null);
  };
  return (
    <section
      className="model task-workbench scattering-workbench"
      data-model="scattering"
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <fieldset className="charge-distribution">
        <legend>Where is the positive charge?</legend>
        <div>
          <button
            className="prediction-card"
            aria-pressed={distribution === "spread"}
            onClick={() => change("distribution", "spread")}
          >
            Spread through the atom
          </button>
          <button
            className="prediction-card"
            aria-pressed={distribution === "central"}
            onClick={() => change("distribution", "central")}
          >
            In a tiny central region
          </button>
        </div>
      </fieldset>
      <label className="alpha-approach">
        Alpha-particle approach
        <select
          aria-label="Alpha-particle approach"
          value={approach}
          onChange={(e) => change("approach", e.target.value)}
        >
          <option value="far">Far from the centre</option>
          <option value="near">Close to the centre</option>
          <option value="head-on">Head-on towards the centre</option>
        </select>
      </label>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => setFeedback(checkBoard(model, board))}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback(null);
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([initialBoard(model)]);
            setFeedback(null);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={`feedback ${feedback.correct ? "correct" : ""}`}
        >
          {feedback.feedback}
        </p>
      )}
      <p className="scattering-prediction">
        <strong>Predicted selected path</strong>
        <span>{scatteringPrediction(distribution, approach)}</span>
      </p>
      <AtomicModelDiagram
        model={distribution === "spread" ? "pudding" : "nuclear"}
        approach={approach}
        readable
        textLegend
      />
      <div className="scattering-observations">
        <strong>Gold-foil observations</strong>
        <ul>
          <li>Most alpha particles passed nearly straight through.</li>
          <li>Some were deflected.</li>
          <li>A very small number were turned back.</li>
        </ul>
      </div>
      <details className="model-boundaries">
        <summary>About this evidence model</summary>
        <p>
          Compare the qualitative predictions of diffuse positive material and a
          tiny positive nucleus. The nuclear picture also concentrates most mass
          at the centre. Choosing a path does not set its frequency: rare close
          approaches and mostly empty space must explain the observations
          together.
        </p>
        <p>
          The arrow illustrates electrostatic repulsion, not a particle hitting
          a solid wall. This model does not calculate forces, angles, energies
          or probabilities. Shell locations, nucleus size and visible charges
          are schematic. No real radiation source or experiment is used.
        </p>
      </details>
    </section>
  );
}
