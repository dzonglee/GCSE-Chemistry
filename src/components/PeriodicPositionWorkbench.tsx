"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { elements } from "@/content/elements";
import { firstTwentyArrangement } from "@/lib/shells";
import { periodicPosition } from "@/lib/periodic-position";
import { initialBoard, checkBoard } from "@/lib/workbench";
import { ShellDiagram } from "./ShellDiagram";
import { FirstTwentyReference } from "./FirstTwentyReference";
export function PeriodicPositionWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "periodic-place" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model),
    group = Number(board.group),
    period = Number(board.period),
    element = elements.find((e) => e.protons === model.atomicNumber)!;
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    feedback: string;
  } | null>(null);
  const change = (key: string, value: number) => {
    if (board[key] === value) return;
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback: "Undo or reset to continue; your answer is retained.",
      });
      return;
    }
    onChange([...history, { ...board, [key]: value }]);
    setFeedback(null);
  };
  const groups = [1, 2, 3, 4, 5, 6, 7, 0];
  return (
    <section
      className="model task-workbench position-workbench"
      data-model="periodic-place"
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <div className="position-controls">
        <label>
          GCSE group
          <select
            aria-label="Proposed GCSE group"
            value={group}
            onChange={(e) => change("group", Number(e.target.value))}
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                Group {g}
              </option>
            ))}
          </select>
        </label>
        <label>
          Period
          <select
            aria-label="Proposed period"
            value={period}
            onChange={(e) => change("period", Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((p) => (
              <option key={p} value={p}>
                Period {p}
              </option>
            ))}
          </select>
        </label>
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
      <p className="position-selection" aria-live="polite">
        Your placement:{" "}
        <strong>
          {element.name}, Group {group}, period {period}
        </strong>
      </p>
      <table className="position-table">
        <caption>First 20 elements: your proposed placement</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            {groups.map((g) => (
              <th key={g} scope="col" aria-label={`Group ${g}`}>
                {g}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4].map((p) => (
            <tr key={p}>
              <th scope="row">{p}</th>
              {groups.map((g) => {
                const known = elements.find((e) => {
                  const pos = periodicPosition(e.protons);
                  return (
                    pos.group === g &&
                    pos.period === p &&
                    e.protons !== element.protons
                  );
                });
                const selected = g === group && p === period;
                return (
                  <td
                    key={g}
                    className={selected ? "position-proposed" : undefined}
                    data-proposed={selected ? "true" : undefined}
                  >
                    {selected ? (
                      <strong>{element.symbol}</strong>
                    ) : (
                      (known?.symbol ?? "")
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="position-caption">
        The highlighted symbol follows your choices, including a wrong
        placement; it is not automatically corrected. The target’s usual cell is
        left blank. Other shown symbols provide table context.
      </p>
      <ShellDiagram
        textLegend
        counts={firstTwentyArrangement(model.atomicNumber)}
        label={`${element.name} atom: supplied electron arrangement`}
      />
      <FirstTwentyReference />
      <details className="model-boundaries">
        <summary>About this position model</summary>
        <p>
          For the first 20 ground-state atoms, period counts occupied shells.
          Main GCSE Groups 1–7 relate to outer electrons; Group 0 has a full
          outer shell, including helium’s two electrons. Modern Groups 13–18
          correspond to GCSE 3–7 and 0. This partial table omits transition
          metals and the later period-4 elements; empty cells are not claims
          that those elements do not exist.
        </p>
      </details>
    </section>
  );
}
