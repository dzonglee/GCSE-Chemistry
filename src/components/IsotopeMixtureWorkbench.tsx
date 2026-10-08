"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { initialBoard, checkBoard } from "@/lib/workbench";
import { weightedIsotopeMean } from "@/lib/isotope-mixture";
export function IsotopeMixtureWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "isotope-mixture" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model),
    light = Number(board.lightPercent),
    heavy = 100 - light;
  const mean = weightedIsotopeMean(model.masses, [light, heavy]);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    feedback: string;
  } | null>(null);
  const change = (value: number) => {
    if (value === light) return;
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback: "Undo or reset to continue; your answer is retained.",
      });
      return;
    }
    onChange([...history, { lightPercent: value }]);
    setFeedback(null);
  };
  const clean = (value: number) => Number(value.toFixed(8));
  return (
    <section
      className="model task-workbench mixture-workbench"
      aria-label="Task model"
      data-model="isotope-mixture"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <label>
        Percentage of mass-{model.masses[0]} atoms
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={light}
          aria-label={`Percentage of mass-${model.masses[0]} atoms`}
          onChange={(e) => change(Number(e.target.value))}
        />
      </label>
      <div className="mixture-percentages" aria-live="polite">
        <strong>
          Mass {model.masses[0]}: {light}%
        </strong>
        <strong>
          Mass {model.masses[1]}: {heavy}%
        </strong>
      </div>
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
      <figure className="mixture-figure">
        <svg
          viewBox="0 0 360 170"
          role="img"
          aria-label={`Mixture: ${light} percent mass ${model.masses[0]}, ${heavy} percent mass ${model.masses[1]}. Weighted average ${clean(mean)}, between the supplied masses.`}
        >
          <rect
            x="20"
            y="20"
            width={(320 * light) / 100}
            height="38"
            fill="#3e4ed0"
          />
          <rect
            x={20 + (320 * light) / 100}
            y="20"
            width={(320 * heavy) / 100}
            height="38"
            fill="#b8541c"
          />
          <text x="20" y="80" fontSize="13" fill="#273786">
            mass {model.masses[0]}
          </text>
          <text x="340" y="80" textAnchor="end" fontSize="13" fill="#874016">
            mass {model.masses[1]}
          </text>
          <path
            d="M20 120 H340 M20 112 V128 M340 112 V128"
            fill="none"
            stroke="#63728b"
            strokeWidth="2"
          />
          <circle cx={20 + (320 * heavy) / 100} cy="120" r="7" fill="#172033" />
          <text
            x="180"
            y="154"
            textAnchor="middle"
            fontSize="14"
            fill="#172033"
          >
            Weighted average: {clean(mean)}
          </text>
        </svg>
        <figcaption>
          Bar widths show abundance. The marker moves toward the more abundant
          isotope. It represents an average, not a new kind of atom.
        </figcaption>
      </figure>
      <table className="mixture-table">
        <caption>Contributions for 100 atoms</caption>
        <thead>
          <tr>
            <th scope="col">Mass number</th>
            <th scope="col">Atoms per 100</th>
            <th scope="col">Contribution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{model.masses[0]}</th>
            <td>{light}</td>
            <td>{clean(model.masses[0] * light)}</td>
          </tr>
          <tr>
            <th scope="row">{model.masses[1]}</th>
            <td>{heavy}</td>
            <td>{clean(model.masses[1] * heavy)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mixture-formula" aria-live="polite">
        A<sub>r</sub> = ({model.masses[0]} × {light} + {model.masses[1]} ×{" "}
        {heavy}) ÷ 100 = <strong>{clean(mean)}</strong>
      </p>
      <details className="model-boundaries">
        <summary>About this mixture model</summary>
        <p>
          This supplied two-isotope example uses mass numbers as approximate
          relative isotope masses, as in the reviewed exam calculations.
          Relative atomic mass is a ratio and has no unit. The percentages
          describe atom counts, not percentages of the sample’s total mass.
          Exact isotope masses and natural abundances can differ from these
          simplified examples.
        </p>
      </details>
    </section>
  );
}
