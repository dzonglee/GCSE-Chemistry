"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import {
  alkaliMetals,
  alkaliEvidence,
  waterEquationCounts,
  type AlkaliMetal,
  type AlkaliPartner,
} from "@/lib/alkali";
import { initialBoard, checkBoard } from "@/lib/workbench";
import { ShellDiagram } from "./ShellDiagram";
export function AlkaliWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<
    TaskModel,
    { kind: "alkali-reaction" | "alkali-water-equation" }
  >;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialBoard(model);
  const [feedback, setFeedback] = useState<ReturnType<
    typeof checkBoard
  > | null>(null);
  const change = (key: string, value: string | number) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback: "Undo or reset to continue; your answer is retained.",
      });
      return;
    }
    onChange([...history, { ...b, [key]: value }]);
    setFeedback(null);
  };
  const actions = (
    <>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => setFeedback(checkBoard(model, b))}
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
    </>
  );
  if (model.kind === "alkali-water-equation") {
    const keys = ["metal", "water", "hydroxide", "hydrogen"],
      formula = [model.symbol, "H₂O", `${model.symbol}OH`, "H₂"],
      counts = waterEquationCounts(keys.map((k) => Number(b[k])));
    return (
      <section
        className="model task-workbench alkali-workbench"
        aria-label="Task model"
        data-model={model.kind}
      >
        <p className="bench-instruction">{model.instruction}</p>
        <div className="alkali-coefficients">
          {keys.map((k, i) => (
            <label key={k}>
              Coefficient of {formula[i]}
              <select
                aria-label={`Model coefficient ${formula[i]}`}
                value={Number(b[k])}
                onChange={(e) => change(k, Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {actions}
        <p className="alkali-equation" aria-live="polite">
          {b.metal} {model.symbol} + {b.water} H₂O → {b.hydroxide}{" "}
          {model.symbol}OH + {b.hydrogen} H₂
        </p>
        <table className="alkali-count-table">
          <caption>Your current atom counts</caption>
          <thead>
            <tr>
              <th scope="col">Element</th>
              <th scope="col">Left</th>
              <th scope="col">Right</th>
            </tr>
          </thead>
          <tbody>
            {(["metal", "oxygen", "hydrogen"] as const).map((k) => (
              <tr key={k}>
                <th scope="row">{k === "metal" ? model.symbol : k}</th>
                <td>{counts.left[k]}</td>
                <td>{counts.right[k]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="position-caption">
          Coefficients count particles or formula units. The ledger retains
          wrong counts so you can repair them; subscripts in the chemical
          formulae stay fixed.
        </p>
      </section>
    );
  }
  const metal = b.metal as AlkaliMetal,
    partner = b.partner as AlkaliPartner,
    m = alkaliMetals[metal],
    evidence = alkaliEvidence(metal, partner);
  return (
    <section
      className="model task-workbench alkali-workbench"
      aria-label="Task model"
      data-model={model.kind}
    >
      <p className="bench-instruction">{model.instruction}</p>
      <div className="position-controls">
        <label>
          Metal
          <select
            aria-label="Comparison metal"
            value={metal}
            onChange={(e) => change("metal", e.target.value)}
          >
            {Object.entries(alkaliMetals).map(([key, m]) => (
              <option key={key} value={key}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reactant
          <select
            aria-label="Comparison reactant"
            value={partner}
            onChange={(e) => change("partner", e.target.value)}
          >
            {["water", "chlorine", "oxygen"].map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {actions}
      <div className="alkali-evidence">
        <p className="eyebrow">Reported demonstration observations</p>
        <p data-alkali-observation>{evidence.observation}</p>
        <p className="eyebrow">Chemical interpretation</p>
        <p className="alkali-equation" data-alkali-products>
          {evidence.equation}
        </p>
        <p>{evidence.interpretation}</p>
      </div>
      <div className="alkali-shell-comparison">
        <ShellDiagram
          counts={alkaliMetals.lithium.shells}
          label="Lithium reference atom"
          labelFontSize={16}
          textLegend
          viewRings={m.shells.length}
        />
        <ShellDiagram
          counts={m.shells}
          label={`${m.name} comparison atom`}
          labelFontSize={16}
          textLegend
          viewRings={m.shells.length}
        />
      </div>
      <p className="position-caption">
        Lithium: 2,1. Your comparison: {m.name}, {m.shells.join(",")}. Each has
        one outer electron. More occupied inner shells give more shielding; the
        outer electron is farther from the nucleus and more easily lost down
        Group 1 despite the greater nuclear charge.
      </p>
      <details className="model-boundaries">
        <summary>About this reaction evidence</summary>
        <p>
          These are typical reported observations, not measured rates or a
          procedure. Flame/ignition depends on conditions. Schematics show
          energy levels and counts, not true radii or electron paths. Oxygen
          product composition can be more complex than a simple oxide formula;
          detailed peroxide chemistry is outside this GCSE lesson.
        </p>
      </details>
    </section>
  );
}
