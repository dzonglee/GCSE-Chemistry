"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { checkBoard, initialBoard } from "@/lib/workbench";
import {
  displayFormula,
  formulaCases,
  formulaIons,
  formulaLedger,
} from "@/lib/ionic-formulae";
export function IonicFormulaWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "ionic-formula" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model),
    spec = formulaCases[model.compound],
    ledger = formulaLedger(
      spec.cation,
      spec.anion,
      Number(board.cations),
      Number(board.anions),
    );
  const [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const change = (key: string, delta: number) => {
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Saved-step limit reached. Undo or reset this model to continue.",
      );
      return;
    }
    setFeedback("");
    setCorrect(false);
    onChange([...history, { ...board, [key]: Number(board[key]) + delta }]);
  };
  return (
    <section
      className="model task-workbench ionic-formula-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <div className="ionic-formula-counts">
        {(["cations", "anions"] as const).map((key) => {
          const ion = formulaIons[key === "cations" ? spec.cation : spec.anion];
          return (
            <div key={key} className="ionic-formula-count">
              <div>
                <strong>{ion.name} ions</strong>
                <p>
                  Given ion: {displayFormula(ion.formula)}
                  <sup>
                    {Math.abs(ion.charge) === 1 ? "" : Math.abs(ion.charge)}
                    {ion.charge > 0 ? "+" : "−"}
                  </sup>
                </p>
              </div>
              <div className="stepper">
                <button
                  className="button"
                  aria-label={`Remove one ${ion.name} ion`}
                  disabled={Number(board[key]) === 1}
                  onClick={() => change(key, -1)}
                >
                  −
                </button>
                <strong aria-label={`${ion.name} ion count`}>
                  {board[key]}
                </strong>
                <button
                  className="button"
                  aria-label={`Add one ${ion.name} ion`}
                  disabled={Number(board[key]) === 6}
                  onClick={() => change(key, 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="ionic-formula-proposal"
        data-formula={ledger.formula}
        data-charge={ledger.charge}
      >
        <p>
          Your proposed ratio: {board.cations}:{board.anions}
        </p>
        <strong>{displayFormula(ledger.formula)}</strong>
        <p>
          Positive charge {ledger.positiveCharge > 0 ? "+" : ""}
          {ledger.positiveCharge}; negative charge {ledger.negativeCharge};
          total {ledger.charge > 0 ? "+" : ""}
          {ledger.charge}
        </p>
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = checkBoard(model, board);
            setFeedback(result.feedback);
            setCorrect(result.correct);
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
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
            onChange([initialBoard(model)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p className={`feedback ${correct ? "correct" : ""}`} role="status">
          {feedback}
        </p>
      )}
      <div className="ionic-formula-groups">
        {(["cations", "anions"] as const).map((key) => {
          const ion = formulaIons[key === "cations" ? spec.cation : spec.anion];
          return (
            <div key={key}>
              <h3>
                {ion.name}: {board[key]} whole ion
                {Number(board[key]) === 1 ? "" : "s"}
              </h3>
              <div className="ionic-group-tokens">
                {Array.from({ length: Number(board[key]) }, (_, i) => (
                  <span
                    key={i}
                    className={
                      key === "cations" ? "ion-positive" : "ion-negative"
                    }
                  >
                    {displayFormula(ion.formula)}
                    <sup>
                      {Math.abs(ion.charge) === 1 ? "" : Math.abs(ion.charge)}
                      {ion.charge > 0 ? "+" : "−"}
                    </sup>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <table className="atomic-data-table">
        <caption>Atoms in your proposed ratio</caption>
        <thead>
          <tr>
            <th scope="col">Element</th>
            <th scope="col">Total atoms</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(ledger.atoms).map(([element, count]) => (
            <tr key={element}>
              <th scope="row">{element}</th>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="position-caption">
        Each token represents one whole ion. Its internal atom counts are fixed.
        Counts show a proposed formula ratio in an extended ionic compound, not
        a molecule or a scale drawing.
      </p>
      <details>
        <summary>Why keep groups inside parentheses?</summary>
        <p>
          A subscript outside parentheses multiplies every atom in that ion
          group. For example, (OH)₂ means two oxygen atoms and two hydrogen
          atoms; OH₂ means one oxygen and two hydrogen atoms. Charge balance
          changes the number of whole ions, not the formula or charge of an
          individual ion.
        </p>
      </details>
    </section>
  );
}
