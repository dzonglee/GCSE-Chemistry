"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  formulaMassCases,
  initialFormulaMassBoard,
  formulaMassPrediction,
  massLedger,
  type FormulaMassMode,
} from "@/lib/formula-mass";
import { CovalentScene3D } from "./CovalentScene3D";
import { FormulaMassGroups } from "./FormulaMassGroups";
export function FormulaMassWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: FormulaMassMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialFormulaMassBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const change = (key: string, value: string | number) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      setCorrect(false);
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [key]: value }]);
  };
  const spec =
      formulaMassCases[(b.formula ?? "H2O") as keyof typeof formulaMassCases],
    rows = massLedger(spec.formula, spec.ar).rows;
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
  const counts: [string, string][] = [
    ["unset", "Predict count"],
    ...["0", "1", "2", "3", "4", "6", "8", "12"].map(
      (v) => [v, v] as [string, string],
    ),
  ];
  const proposals = rows.map((r, i) => ({
      ...r,
      proposed:
        b[["countA", "countB", "countC"][i]] === "unset"
          ? null
          : Number(b[["countA", "countB", "countC"][i]]),
    })),
    sum = proposals.reduce((total, r) => total + (r.proposed ?? 0) * r.ar, 0);
  return (
    <section
      className="model task-workbench formula-mass-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode !== "quantity" && (
          <>
            {select(
              "Inspect a formula",
              "formula",
              mode === "count"
                ? [
                    ["H2O", "H₂O"],
                    ["CO2", "CO₂"],
                  ]
                : mode === "mass"
                  ? [
                      ["MgCl2", "MgCl₂"],
                      ["NaCl", "NaCl"],
                    ]
                  : [
                      ["CaOH", "Ca(OH)₂"],
                      ["MgNO3", "Mg(NO₃)₂"],
                    ],
            )}
            {rows.map((r, i) =>
              select(
                `Your ${r.element} count`,
                ["countA", "countB", "countC"][i],
                counts,
              ),
            )}
            {mode === "mass" &&
              select("Your predicted Mᵣ", "total", [
                ["unset", "Predict total"],
                ...["59.5", "58.5", "95", "71", "24", "23", "119"].map(
                  (v) => [v, v] as [string, string],
                ),
              ])}
          </>
        )}
        {mode === "quantity" && (
          <>
            {select(
              "Coefficient before H₂O",
              "coefficient",
              [
                [1, "1: one water molecule"],
                [2, "2: two water molecules"],
                [3, "3: three water molecules"],
              ],
              true,
            )}
            {select("Total represented H atoms", "hydrogen", counts)}
            {select("Total represented O atoms", "oxygen", counts)}
            {select("Mᵣ of one H₂O formula", "mr", [
              ["unset", "Predict per-formula Mᵣ"],
              ["18", "18"],
              ["36", "36"],
              ["54", "54"],
              ["17", "17"],
            ])}
          </>
        )}
      </div>
      {mode === "count" && (
        <CovalentScene3D
          context="formula-count"
          molecule={String(b.formula) as "H2O" | "CO2"}
        />
      )}{" "}
      {mode === "mass" && (
        <figure className="formula-mass-ledger">
          <figcaption>
            Supplied Aᵣ values:{" "}
            {rows.map((r) => `${r.element} = ${r.ar}`).join("; ")}. Build the
            ledger from your counts; a displayed sum does not confirm those
            counts.
          </figcaption>
          <dl>
            {proposals.map((r, i) => (
              <div
                key={r.element}
                data-mass-contribution={r.element}
                data-relative-contribution={
                  r.proposed === null ? "unset" : r.proposed * r.ar
                }
              >
                <dt>{r.element}</dt>
                <dd>
                  {r.proposed === null
                    ? "Count not chosen"
                    : `${r.proposed} × ${r.ar} = ${r.proposed * r.ar}`}
                </dd>
                <div
                  className="mass-contribution-bar"
                  aria-hidden="true"
                  style={{
                    width: `${sum && r.proposed !== null ? ((r.proposed * r.ar) / sum) * 100 : 0}%`,
                    background: i ? "#7662d6" : "#3c50d2",
                  }}
                />
              </div>
            ))}
          </dl>
          <p>
            Your count-based sum: <strong>{sum}</strong>. Mᵣ has no units. Bars
            compare contributions within this current ledger; they are not atom
            sizes.
          </p>
        </figure>
      )}
      {mode === "brackets" && (
        <FormulaMassGroups formula={String(b.formula) as "CaOH" | "MgNO3"} />
      )}{" "}
      {mode === "quantity" && (
        <figure className="formula-quantity">
          <div className="formula-quantity-cards">
            {Array.from({ length: Number(b.coefficient) }, (_, i) => (
              <span data-water-formula={i} key={i}>
                H₂O
              </span>
            ))}
          </div>
          <figcaption>
            Each card represents one complete water molecule, not one atom. The
            coefficient counts molecules; each card’s formula stays H₂O.
            Supplied Aᵣ: H = 1, O = 16. Calculate Mᵣ for one formula.
          </figcaption>
        </figure>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = formulaMassPrediction(mode, b);
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
