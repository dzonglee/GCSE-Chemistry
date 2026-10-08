"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialBalanceBoard,
  balancePrediction,
  boardReaction,
  balanceLedger,
  type BalanceMode,
} from "@/lib/equation-balancing";
import { ReactionAmounts3D } from "./ReactionAmounts3D";
const pretty = (formula: string) =>
  formula.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
export function BalancingWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: BalanceMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialBalanceBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    reaction = boardReaction(mode, b),
    ledger = balanceLedger(
      reaction.left,
      reaction.right,
      reaction.coefficients,
    );
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
  const formulas = [...reaction.left, ...reaction.right],
    keys = ["a", "b", "c", "d"];
  return (
    <section
      className="model task-workbench balancing-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {(mode === "ledger" || mode === "molecules") &&
          select(
            "Reaction to balance",
            "reaction",
            mode === "ledger"
              ? [
                  ["water", "Hydrogen + oxygen → water"],
                  ["magnesium", "Magnesium + oxygen → oxide"],
                  ["aluminium", "Aluminium + oxygen → oxide"],
                ]
              : [
                  ["methane", "Methane combustion"],
                  ["ethane", "Ethane combustion"],
                ],
          )}
        {mode === "identity" ? (
          <>
            {select("Specified water product formula", "product", [
              ["H2O", "H₂O: water"],
              ["H2O2", "H₂O₂: hydrogen peroxide"],
            ])}
            {select("Why restore the specified formula?", "reason", [
              ["unset", "Choose explanation"],
              ["identity", "The subscript fixes substance identity"],
              ["counts", "The peroxide equation never matches counts"],
              ["both", "Water and peroxide are the same substance"],
            ])}
          </>
        ) : (
          <>
            {mode === "words" && (
              <>
                {select("Potassium hydroxide formula", "hydroxide", [
                  ["unset", "Choose product"],
                  ["KOH", "KOH"],
                  ["KO", "KO"],
                ])}
                {select("Hydrogen gas formula", "hydrogen", [
                  ["unset", "Choose product"],
                  ["H2", "H₂"],
                  ["H", "H"],
                ])}
              </>
            )}
            {formulas.map((f, i) =>
              select(
                `Coefficient of ${pretty(f)}`,
                keys[i],
                [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8].map((v) => [
                  v,
                  String(v),
                ]),
                true,
              ),
            )}
          </>
        )}
      </div>
      {mode === "words" &&
        (b.hydroxide === "unset" || b.hydrogen === "unset") && (
          <p className="phase-boundary-note">
            Choose both product formulas. The preview currently uses the
            supplied KOH and H₂ placeholders; this is not a completed
            prediction.
          </p>
        )}
      <p className="journey-equation" aria-label="Your current equation">
        {formulas.map((f, i) => (
          <span key={i}>
            {i === reaction.left.length ? " → " : i ? " + " : ""}
            <strong>{reaction.coefficients[i]}</strong>
            {pretty(f)}
          </span>
        ))}
      </p>
      <div
        className="balance-element-ledger"
        role="table"
        aria-label="Element counts on both sides"
      >
        <div role="row" className="balance-ledger-header">
          <span role="columnheader">Element</span>
          <span role="columnheader">Reactants</span>
          <span role="columnheader">Products</span>
          <span role="columnheader">Match?</span>
        </div>
        {ledger.rows.map((r) => (
          <div
            role="row"
            key={r.element}
            data-balance-element={r.element}
            data-left-count={r.left}
            data-right-count={r.right}
          >
            <strong role="cell">{r.element}</strong>
            <span role="cell">{r.left}</span>
            <span role="cell">{r.right}</span>
            <span role="cell">{r.left === r.right ? "Yes" : "Not yet"}</span>
          </div>
        ))}
      </div>
      <p className="position-caption">
        Count coefficient × each element’s formula count, then add contributions
        across every formula on that side. Formula subscripts stay fixed.
        Fractional entries represent proportional amounts, not fragments of
        individual atoms or molecules.
      </p>
      {mode === "identity" && (
        <p>
          Specified reaction: hydrogen + oxygen → water. The all-one peroxide
          equation can match counts and still represent the wrong product.
          Restoring water fixes identity; its coefficients still need balancing.
        </p>
      )}
      {mode === "molecules" && (
        <>
          <div className="balance-molecule-amounts">
            {(["Reactants", "Products"] as const).map((side, j) => (
              <article key={side}>
                <h3>{side}: complete-molecule amounts</h3>
                {(j === 0 ? reaction.left : reaction.right).map((f, k) => {
                  const amount =
                    reaction.coefficients[
                      (j === 0 ? 0 : reaction.left.length) + k
                    ];
                  return (
                    <p
                      key={f}
                      data-molecule-formula={f}
                      data-molecule-amount={amount}
                    >
                      <strong>
                        {amount} × {pretty(f)}
                      </strong>{" "}
                      {Number.isInteger(amount) ? (
                        Array.from({ length: amount }, (_, i) => (
                          <span className="balance-molecule-token" key={i}>
                            {pretty(f)}
                          </span>
                        ))
                      ) : (
                        <span>
                          Fractional intermediate ratio, not half an actual
                          molecule.
                        </span>
                      )}
                    </p>
                  );
                })}
              </article>
            ))}
          </div>
          {b.reaction === "methane" && ledger.integer ? (
            <ReactionAmounts3D
              key={reaction.coefficients.join(",")}
              coefficients={reaction.coefficients}
            />
          ) : (
            <p className="position-caption">
              Use the labelled formula amounts for this intermediate or ethane
              example. The methane 3D collection appears for complete
              whole-number molecular amounts.
            </p>
          )}
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = balancePrediction(mode, b);
            setCorrect(result.correct);
            setFeedback(result.feedback);
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
