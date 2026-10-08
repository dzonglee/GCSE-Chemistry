"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  reactingChoices,
  initialReactingBoard,
  reactingPrediction,
  reactingData,
  ratioCases,
  type ReactionMode,
} from "@/lib/reacting-masses";
import { AmmoniaRatio3D } from "./AmmoniaRatio3D";
export function ReactingWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: ReactionMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialReactingBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [show3D, setShow3D] = useState(false);
  const change = (k: string, v: string | number) => {
    if (b[k] === v) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    onChange([...history, { ...b, [k]: v }]);
  };
  const labels: Record<string, string> = {
    nitrogen: "Given N₂",
    hydrogen: "Given H₂",
    reverse: "Given NH₃",
    ammonia: "Ammonia",
    water: "Water",
    magnesium: "Magnesium oxide",
    small: "Small sample",
    middle: "Middle sample",
    large: "Large sample",
  };
  const select = (label: string, key: string, unit = "", numeric = false) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={b[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {(
          reactingChoices[mode] as Record<string, readonly (string | number)[]>
        )[key].map((v) => (
          <option key={v} value={v}>
            {v === "unset" ? "Predict" : (labels[String(v)] ?? `${v}${unit}`)}
          </option>
        ))}
      </select>
    </label>
  );
  const d =
      mode === "forward" || mode === "required"
        ? reactingData(mode, b)
        : undefined,
    r =
      mode === "ratio"
        ? ratioCases[b.example as keyof typeof ratioCases]
        : undefined;
  const prediction = (k: string, u: string) =>
    b[k] === "unset" ? "not entered" : `${b[k]} ${u}`;
  return (
    <section
      className="model task-workbench reacting-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <p>
        <strong>{d?.equation ?? "N₂ + 3H₂ → 2NH₃"}</strong>
      </p>
      <div className="ionic-structure-controls">
        {mode === "ratio" && (
          <>
            {select("Known substance", "example")}
            {select("Given coefficient", "givenCoefficient")}
            {select("Requested coefficient", "requestedCoefficient")}
            {select("Your requested amount", "requestedAmount", " mol")}
          </>
        )}
        {mode === "forward" && (
          <>
            {select("Supplied reaction", "reaction")}
            {select("Supplied sample", "size")}
            {select("Your given amount", "givenAmount", " mol")}
            {select("Your requested amount", "requestedAmount", " mol")}
            {select("Your requested mass", "mass", " g")}
          </>
        )}
        {mode === "required" && (
          <>
            {select("Supplied silica sample", "size")}
            {select("Displayed mass unit", "unit")}
            {select("Your converted mass", "grams", " g")}
            {select("Your given amount", "givenAmount", " mol")}
            {select("Your required Mg amount", "requestedAmount", " mol")}
            {select("Your required Mg mass", "mass", " g")}
          </>
        )}
        {mode === "conserved" && (
          <>
            {select("Supplied N₂ amount", "scale", " mol", true)}
            {select(
              "Your total molecule amount before",
              "beforeAmount",
              " mol",
            )}
            {select("Your total molecule amount after", "afterAmount", " mol")}
            {select("Your total mass before", "beforeMass", " g")}
            {select("Your total mass after", "afterMass", " g")}
          </>
        )}
      </div>
      <p className="phase-boundary-note">
        {r
          ? `Given ${r.amount} mol ${r.given}; requested ${r.requested}. Use the balanced equation's coefficient for each named substance.`
          : d
            ? `Given ${mode === "required" && b.unit === "kg" ? d.grams / 1000 : d.grams} ${mode === "required" ? b.unit : "g"} ${d.given}; requested ${d.requested}. Supplied Aᵣ: ${d.ar}; M(${d.given})=${d.givenM} g/mol, M(${d.requested})=${d.requestedM} g/mol.`
            : `Before: ${b.scale} mol N₂ and ${3 * Number(b.scale)} mol H₂. Supplied M: N₂=28, H₂=2, NH₃=17 g/mol. Assume theoretical complete conversion of those stoichiometric amounts.`}
      </p>
      {r && (
        <figure className="reaction-mole-shares">
          <strong>Compare mole amounts</strong>
          <p>
            Given {r.given}: {r.amount} mol
          </p>
          <div className="reaction-mole-bar" aria-hidden="true">
            <span
              style={{
                width: `${(100 * r.amount) / Math.max(3, Number(b.requestedAmount) || 0)}%`,
              }}
            />
          </div>
          <p>
            Your {r.requested}: {prediction("requestedAmount", "mol")}
          </p>
          <div className="reaction-mole-bar prediction" aria-hidden="true">
            <span
              style={{
                width: `${(100 * (Number(b.requestedAmount) || 0)) / Math.max(3, Number(b.requestedAmount) || 0)}%`,
              }}
            />
          </div>
          <figcaption>
            Both bars use the same mole scale. The gold bar keeps your
            prediction; it is not corrected automatically. These are mol
            amounts, not gram masses.
          </figcaption>
        </figure>
      )}
      {mode !== "conserved" ? (
        <div className="mole-prediction-ledger">
          <strong>Your working, retained as entered</strong>
          <p>
            {r
              ? `${r.amount} mol ${r.given} × (${prediction("requestedCoefficient", "")} ÷ ${prediction("givenCoefficient", "")}) → your ${prediction("requestedAmount", "mol")} ${r.requested}`
              : `Given ${d!.given}: your ${prediction("givenAmount", "mol")} → requested ${d!.requested}: your ${prediction("requestedAmount", "mol")} → your ${prediction("mass", "g")}`}
          </p>
          <p>
            Requested mol = given mol × (requested coefficient ÷ given
            coefficient). For masses, use n = m ÷ M before this step, then m = n
            × M.
          </p>
        </div>
      ) : (
        <>
          <div className="mole-prediction-ledger">
            <strong>Your before-and-after predictions</strong>
            <p>
              Before: {prediction("beforeAmount", "mol molecules")};{" "}
              {prediction("beforeMass", "g")}. After:{" "}
              {prediction("afterAmount", "mol molecules")};{" "}
              {prediction("afterMass", "g")}.
            </p>
            <p>
              Atom accounting for the equation: before N=2, H=6; after N=2, H=6.
              Molecules: 4 before and 2 after. Weighted mass ratio: (1×28 + 3×2)
              : (2×17) = 34 : 34.
            </p>
          </div>
          <button
            className="button"
            aria-expanded={show3D}
            onClick={() => setShow3D(!show3D)}
          >
            {show3D
              ? "Hide equation event"
              : "Inspect one equation event in 3D"}
          </button>
          {show3D && <AmmoniaRatio3D />}
        </>
      )}
      <p>
        These are theoretical amounts: assume complete conversion and sufficient
        reactants. A required-reactant calculation gives the stoichiometric
        amount needed for the stated product or other reactant. Coefficients are
        mole ratios; mass ratios also require molar masses. Actual yield and
        limiting reactants are separate lessons.
      </p>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = reactingPrediction(mode, b);
            setCorrect(r.correct);
            setFeedback(r.feedback);
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
