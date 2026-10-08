"use client";
import { useId, useState } from "react";
import type { WorkbenchState } from "@/content/types";
import { readNumber } from "@/lib/marking";
import {
  initialInverseEconomyBoard,
  inverseEconomyPrediction,
  inverseEconomyRatios,
  type InverseEconomyMode,
} from "@/lib/inverse-atom-economy";

export function InverseEconomyWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: InverseEconomyMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialInverseEconomyBoard(mode);
  const instructionId = useId();
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);
  const change = (key: string, value: string) => {
    if (value === b[key]) return;
    setFeedback("");
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    onChange([...history, { ...b, [key]: value }]);
  };
  const input = (key: string, label: string) => (
    <label>
      {key === "atomicMass"
        ? "Your proposed Aᵣ(M)"
        : key === "otherPercent"
          ? "Other-product percentage"
          : label}
      <input
        aria-label={label}
        inputMode="decimal"
        value={String(b[key])}
        maxLength={100}
        onChange={(e) => change(key, e.target.value)}
      />
    </label>
  );
  const proposed = readNumber(String(b.atomicMass));
  const valid = proposed !== null && proposed > 0 && proposed <= 1000;
  const useful = valid ? 2 * proposed : null;
  const percentage = useful === null ? null : (100 * useful) / (useful + 132);
  return (
    <section
      className="model task-workbench inverse-economy-workbench"
      aria-label="Task model"
      aria-describedby={instructionId}
    >
      <span id={instructionId} className="sr-only">
        {instruction}
      </span>
      <p className="inverse-givens">
        <strong>M₂O₃ + 3CO → 2M + 3CO₂</strong>
        <br />
        Aᵣ(C) = 12; Aᵣ(O) = 16.
        {mode !== "allocation" && (
          <>
            <br />
            Desired: M; Aᵣ(M) = x.
            <br />
            Atom economy: <strong>45.9%</strong>.
          </>
        )}
      </p>
      <div className="economy-fields">
        {mode === "allocation" &&
          input("contribution", "Other-product contribution")}
        {mode === "equation" && (
          <label>
            Your mass relationship
            <select
              aria-label="Your mass relationship"
              value={String(b.ratio)}
              onChange={(e) => change("ratio", e.target.value)}
            >
              {Object.entries(inverseEconomyRatios).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        {mode === "complement" &&
          input("otherPercent", "Your other-product percentage")}
        {mode === "solve" &&
          input("atomicMass", "Your proposed relative atomic mass")}
      </div>
      {mode === "allocation" ? (
        <p>
          Each CO₂ contains one C and two O. The coefficient multiplies the
          whole formula.
        </p>
      ) : (
        <p className="inverse-ledger">
          Desired contribution: <strong>2x</strong>
          <br />
          Other-product contribution: <strong>132</strong>
          <br />
          Complete reactant total: <strong>2x + 132</strong> (mass is
          conserved).
        </p>
      )}
      {mode === "solve" && (
        <>
          <div
            className="inverse-allocation"
            role="img"
            aria-label={
              percentage === null
                ? "Enter a positive proposed atomic mass to compare its mass allocation with the target."
                : `Your proposal: desired relative contribution ${useful}, other contribution 132, total ${(useful ?? 0) + 132}. Predicted atom economy ${percentage.toFixed(2)} percent; supplied target 45.9 percent.`
            }
          >
            <p>
              <strong>Your proposal</strong> ·{" "}
              {percentage === null
                ? "not yet a positive value"
                : `${percentage.toFixed(2)}% to M`}
            </p>
            {percentage !== null && (
              <div className="inverse-mass-bar">
                <span style={{ width: `${percentage}%` }} />
                <span style={{ width: `${100 - percentage}%` }} />
              </div>
            )}
            <p>
              <strong>Supplied target</strong> · 45.9% to M
            </p>
            <div className="inverse-mass-bar">
              <span style={{ width: "45.9%" }} />
              <span style={{ width: "54.1%" }} />
            </div>
          </div>
          <p>
            Blue: desired metal. Gold: other product. These bars show relative
            mass fractions, not atom counts or measured grams.
          </p>
          {proposed !== null && !valid && (
            <p>
              Use a positive proposal no greater than 1000 for this
              illustration. Your entry is retained.
            </p>
          )}
        </>
      )}
      <div className="model-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = inverseEconomyPrediction(mode, b);
            setCorrect(result.correct);
            setFeedback(result.feedback);
          }}
        >
          Check model
        </button>
        <button
          className="text-button model-recovery"
          disabled={history.length < 2}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback("");
          }}
        >
          Undo
        </button>
        <button
          className="text-button model-recovery"
          onClick={() => {
            onChange([initialInverseEconomyBoard(mode)]);
            setFeedback("");
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
      {mode === "solve" && (
        <details>
          <summary>Two ways to solve the unknown</summary>
          <p>
            <strong>Rearrange.</strong> Start with 2x ÷ (2x + 132) × 100 = 45.9.
            Multiply by the complete denominator: 200x = 45.9(2x + 132). Expand:
            200x = 91.8x + 6058.8. Subtract 91.8x from both sides: 108.2x =
            6058.8. Divide both sides by 108.2; round only the final value to
            three significant figures.
          </p>
          <p>
            <strong>Use the complement.</strong> The other products account for
            54.1% of the total. Complete total = 132 × 100 ÷ 54.1. Subtract 132
            to get the desired contribution 2x, then divide by 2 to find x. Keep
            full precision until the end.
          </p>
          <p>
            The unknown appears in both numerator and denominator. Treating 132
            as the complete total would leave out the metal. The supplied
            rounded percentage gives an approximate atomic mass and does not
            uniquely identify an element.
          </p>
        </details>
      )}
    </section>
  );
}
