"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { checkBoard, initialBoard } from "@/lib/workbench";

export function HistoricalTestWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "historical-test" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model);
  const [feedback, setFeedback] = useState<ReturnType<
    typeof checkBoard
  > | null>(null);
  const match = board.candidate === "match";
  function change(key: string, value: string) {
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
  }
  return (
    <section
      className="model task-workbench historical-test-workbench"
      aria-label="Task model"
      data-model="historical-test"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <label>
        Discovery record
        <select
          aria-label="Discovery record"
          value={board.candidate}
          onChange={(e) => change("candidate", e.target.value)}
        >
          <option value="conflict">Candidate Y’s record</option>
          <option value="match">Candidate X’s record</option>
        </select>
      </label>
      <div className="historical-evidence-records">
        <section aria-label="Prediction made before discovery">
          <h3>Before discovery</h3>
          <p>Predicted: a metal forming +2 ions.</p>
        </section>
        <section aria-label="Observed discovery record">
          <h3>Measured afterwards</h3>
          <p>
            {match
              ? "X: a metal forming +2 ions."
              : "Y: a non-metal forming −1 ions."}
          </p>
        </section>
      </div>
      <p className="position-caption">
        Invented classroom records; ion language is modern.
      </p>
      <label>
        What does this evidence justify?
        <select
          aria-label="Evidence conclusion"
          value={board.verdict}
          onChange={(e) => change("verdict", e.target.value)}
        >
          <option value="support">Supports this prediction</option>
          <option value="investigate">Investigate the mismatch</option>
          <option value="proof">Permanently proves the whole table</option>
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
      <details className="model-boundaries">
        <summary>About these records</summary>
        <p>
          These are invented classroom candidates, not historical measurements.
          Ion language is a modern description of the chemical family. Choosing
          a record does not change its measured properties. Mendeleev used
          observed element and compound properties; he did not know modern
          electron structures.
        </p>
      </details>
    </section>
  );
}
