"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { checkBoard, initialBoard } from "@/lib/workbench";
const cards = [
  { name: "A", weight: 10, property: "Soft metal; forms +1 ions" },
  { name: "B", weight: 14, property: "Metal; forms +2 ions" },
  { name: "C", weight: 18, property: "Non-metal; forms −1 ions" },
  { name: "D", weight: 26, property: "Soft metal; forms +1 ions" },
  { name: "E", weight: 34, property: "Non-metal; forms −1 ions" },
];
export function HistoricalGapWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "historical-gap" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model);
  const gap = board.arrangement === "gap";
  const [feedback, setFeedback] = useState<ReturnType<
    typeof checkBoard
  > | null>(null);
  return (
    <section
      className="model task-workbench history-workbench"
      aria-label="Task model"
      data-model="historical-gap"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <label>
        Proposed arrangement
        <select
          aria-label="Proposed historical arrangement"
          value={String(board.arrangement)}
          onChange={(e) => {
            if (e.target.value === board.arrangement) return;
            if (history.length >= 500) {
              setFeedback({
                correct: false,
                feedback: "Undo or reset to continue; your answer is retained.",
              });
              return;
            }
            onChange([...history, { arrangement: e.target.value }]);
            setFeedback(null);
          }}
        >
          <option value="force">Fill every cell in weight order</option>
          <option value="gap">Leave a gap to preserve properties</option>
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
      <p className="position-caption">
        Original classroom dataset: letters and weights are invented, not
        historical element measurements. Weights increase A → E; properties
        repeat.
      </p>
      <div className="history-grid" aria-label="Proposed property families">
        {["Family 1", "Family 2", "Family 3"].map((name) => (
          <strong key={name}>{name}</strong>
        ))}
        {[
          cards[0],
          cards[1],
          cards[2],
          cards[3],
          gap ? null : cards[4],
          gap ? cards[4] : null,
        ].map((card, i) => (
          <div
            key={i}
            className={card ? "history-card" : "history-card history-gap"}
            data-history-cell={i}
          >
            {card ? (
              <>
                <strong>{card.name}</strong>
                <span>Weight {card.weight}</span>
                <span>{card.property}</span>
              </>
            ) : (
              <>
                <strong>{gap && i === 4 ? "Gap" : "Empty"}</strong>
                <span>
                  {gap && i === 4
                    ? "What properties should fit here?"
                    : "No element placed"}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
      <details className="model-boundaries">
        <summary>About this evidence puzzle</summary>
        <p>
          These three simplified families illustrate classification by chemical
          properties. They are not a complete periodic table or a claim that
          historical scientists knew electron structures. Mendeleev used
          measured element and compound properties, left gaps, and sometimes
          departed from weight order.
        </p>
      </details>
    </section>
  );
}
