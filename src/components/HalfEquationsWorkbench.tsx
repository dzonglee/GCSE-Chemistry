"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  balance,
  coefficientBalance,
  diagnoseRecords,
  electronRecords,
  halfChoices,
  halfEquationRecords,
  halfPrediction,
  initialHalfBoard,
  ionicRecords,
  species,
  type HalfEquationKey,
  type HalfMode,
} from "@/lib/half-equations";
import { HydroxideOxidation3D } from "./HydroxideOxidation3D";
const labels: Record<string, string> = {
  unset: "Predict",
  left: "Left: electrons gained",
  right: "Right: electrons lost",
  oxidation: "Oxidation",
  reduction: "Reduction",
  both: "Atoms and charge",
  "atoms-only": "Atoms only",
  "charge-only": "Charge only",
  neither: "Neither atoms nor charge",
};
const headings: Record<HalfMode, string> = {
  electrons: "Change the charge",
  cation: "Build a reduction half equation",
  anion: "Build an oxidation half equation",
  diagnose: "Test atoms and charge separately",
  ionic: "Identify the reacting species",
};
export function HalfEquationsWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: HalfMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialHalfBoard(mode),
    key = String(b.record),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  const records =
    mode === "electrons"
      ? electronRecords
      : mode === "diagnose"
        ? diagnoseRecords
        : mode === "ionic"
          ? ionicRecords
          : halfEquationRecords;
  function change(field: string, value: string) {
    if (b[field] === value) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([
      ...history,
      field === "record"
        ? { ...initialHalfBoard(mode), record: value }
        : { ...b, [field]: value },
    ]);
  }
  function select(field: string, label: string) {
    return (
      <label key={field}>
        {label}
        <select
          aria-label={label}
          value={b[field]}
          onChange={(e) => change(field, e.target.value)}
        >
          {halfChoices[mode][field].map((v) => (
            <option key={v} value={v}>
              {field === "record"
                ? (records as Record<string, { label: string }>)[v].label
                : (labels[v] ?? v)}
            </option>
          ))}
        </select>
        {field !== "record" && b[field] !== "unset" && (
          <span className="metal-selected">
            Selected: {labels[String(b[field])] ?? String(b[field])}
          </span>
        )}
      </label>
    );
  }
  function counter(field: string, label: string) {
    const values = halfChoices[mode][field],
      value = Number(b[field]);
    return (
      <div className="half-counter" key={field}>
        <strong>{label}</strong>
        <div className="counter-steps">
          <button
            aria-label={"Decrease " + label}
            disabled={!values.includes(String(value - 1))}
            onClick={() => change(field, String(value - 1))}
          >
            −
          </button>
          <output aria-label={label}>{value}</output>
          <button
            aria-label={"Increase " + label}
            disabled={!values.includes(String(value + 1))}
            onClick={() => change(field, String(value + 1))}
          >
            +
          </button>
        </div>
      </div>
    );
  }
  const electron = electronRecords[key as keyof typeof electronRecords];
  const coeff =
    mode === "cation" || mode === "anion" ? coefficientBalance(mode, b) : null;
  const diagnosis =
    mode === "diagnose"
      ? diagnoseRecords[key as keyof typeof diagnoseRecords]
      : null;
  const diagnostic = diagnosis
    ? balance([...diagnosis.left], [...diagnosis.right])
    : null;
  const eq =
    mode === "cation" || mode === "anion"
      ? halfEquationRecords[key as HalfEquationKey]
      : null;
  const atomText = (a: Record<string, number>) =>
    Object.entries(a)
      .map(([e, n]) => e + ": " + n)
      .join("; ");
  function check() {
    const p = halfPrediction(mode, b);
    setCorrect(p.correct);
    setFeedback(
      !p.complete
        ? "Complete the prediction before checking."
        : p.correct
          ? "That’s right. " +
            (mode === "electrons"
              ? "Electron gain lowers charge; loss raises it. Nuclear identity stays unchanged."
              : mode === "cation" || mode === "anion"
                ? "Each element and total signed charge match. Balanced positive multiples are accepted."
                : mode === "diagnose"
                  ? "Atoms and charge are separate conservation checks."
                  : "Oxidation is electron loss; reduction is gain. The named spectator remains unchanged.")
          : "Your proposed answer is retained. " +
            (mode === "electrons"
              ? "Check target charge and whether electrons are gained or lost."
              : mode === "cation" || mode === "anion"
                ? "Compare each element and signed charge below. Keep formulas fixed and include water for hydroxide oxidation."
                : mode === "diagnose"
                  ? "Count each element, then add charges including −1 per electron."
                  : "Track charge change of the reacting species; omit unchanged spectators from the net ionic equation."),
    );
  }
  const term = (id: string, count: string | number) =>
    String(count) + " " + species[id].label;
  const eqLeft = eq
    ? term(eq.left[0], b.a) +
      (b.electronSide === "left"
        ? " + " + term("electron", mode === "cation" ? b.b : b.d)
        : "")
    : "";
  const eqRight = eq
    ? term(eq.right[0], mode === "cation" ? b.c : b.b) +
      (mode === "anion" && Number(b.c) > 0 ? " + " + term("water", b.c) : "") +
      (b.electronSide === "right"
        ? " + " + term("electron", mode === "cation" ? b.b : b.d)
        : "")
    : "";

  return (
    <section
      className="model task-workbench half-equations-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      <p>{instruction}</p>
      {mode === "electrons" && (
        <>
          <div className="electrolysis-ion-controls">
            <button
              className="button secondary particle-choice"
              disabled={Number(b.delta) <= -6}
              onClick={() => change("delta", String(Number(b.delta) - 1))}
            >
              Gain one electron
            </button>
            <button
              className="button secondary particle-choice"
              disabled={Number(b.delta) >= 6}
              onClick={() => change("delta", String(Number(b.delta) + 1))}
            >
              Lose one electron
            </button>
          </div>
          <p className="model-readout">
            Your signed change: <strong>{String(b.delta)}</strong>. Charge now:{" "}
            <strong>{electron.start + Number(b.delta)}</strong>; target:{" "}
            <strong>{electron.target}</strong>.
          </p>
          {select("redox", "Your redox classification")}
        </>
      )}
      {select("record", "Supplied reaction")}
      <p className="half-supplied">
        {(records as Record<string, { label: string }>)[key].label}
      </p>
      {eq && (
        <>
          <p>
            Keep the supplied species fixed. Choose coefficients and the
            electron side. The record’s full label names the transformation;
            changing the model does not change the answer question.
          </p>
          {counter("a", "Starting species coefficient")}
          {mode === "cation" ? (
            <>
              {counter("b", "Electron coefficient")}
              {counter("c", "Product coefficient")}
            </>
          ) : (
            <>
              {counter("b", "Product coefficient")}
              {counter("c", "Water coefficient")}
              {counter("d", "Electron coefficient")}
            </>
          )}
          {select("electronSide", "Your electron side")}
          <p
            className="half-equation-preview"
            aria-label="Your proposed half equation"
          >
            {eqLeft} → {eqRight}
          </p>
          <div
            className="half-balance"
            role="group"
            aria-label="Your atom and charge inventory"
          >
            <p>
              Left atoms: {atomText(coeff!.left.atoms)}. Right atoms:{" "}
              {atomText(coeff!.right.atoms)}.
            </p>
            <p>
              Left total charge: {coeff!.left.charge}. Right total charge:{" "}
              {coeff!.right.charge}.
            </p>
            <p>
              All-zero coefficients do not describe a reaction. Check your model
              to evaluate the chosen positive coefficients.
            </p>
          </div>
        </>
      )}
      {mode === "diagnose" && select("claim", "Your conservation claim")}
      {mode === "ionic" && (
        <>
          {select("oxidised", "Your oxidised species")}
          {select("reduced", "Your reduced species")}
          {select("spectator", "Your spectator ion")}
        </>
      )}
      <div className="bench-actions">
        <button className="button" onClick={check}>
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
            onChange([initialHalfBoard(mode)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <div
          className={"feedback " + (correct ? "correct" : "retry")}
          role="status"
        >
          {feedback}
          {diagnostic && (
            <p>
              Left: {atomText(diagnostic.left.atoms)}, charge{" "}
              {diagnostic.left.charge}. Right:{" "}
              {atomText(diagnostic.right.atoms)}, charge{" "}
              {diagnostic.right.charge}.
            </p>
          )}
        </div>
      )}
      {mode === "anion" && key === "hydroxide" && <HydroxideOxidation3D />}
      <details>
        <summary>About this model</summary>
        <p>
          These are supplied reactions, not a rule that every dissolved metal
          ion deposits. A molten salt contains no water. Keep ionic charges and
          molecular formulas fixed; vary whole-number coefficients. Electron
          charge is −1, with no atomic-element count. Native model work and
          feedback are assisted practice.
        </p>
      </details>
    </section>
  );
}
