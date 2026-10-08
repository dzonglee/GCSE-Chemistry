"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  moleChoices,
  moleSpecies,
  massSamples,
  populations,
  standardCount,
  initialMoleBoard,
  molePrediction,
  type MoleMode,
  type MoleSpecies,
} from "@/lib/mole-amounts";
import { CovalentScene3D } from "./CovalentScene3D";
export function MoleWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: MoleMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialMoleBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [show3D, setShow3D] = useState(false);
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
    unit: string,
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
        {(moleChoices[mode] as Record<string, readonly (string | number)[]>)[
          key
        ].map((value) => {
          let text = value === "unset" ? "Predict" : `${value}${unit}`;
          if (key === "species")
            text = moleSpecies[value as MoleSpecies].formula;
          if (key === "sample") {
            const d = massSamples[value as keyof typeof massSamples];
            text = d.formula;
          }
          if (key === "population") {
            const d = standardCount(
              populations[value as keyof typeof populations],
            );
            text = `${d.coefficient} × 10^${d.power}`;
          }
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </label>
  );
  const sample =
      mode === "mass"
        ? massSamples[b.sample as keyof typeof massSamples]
        : undefined,
    species =
      mode !== "mass" ? moleSpecies[b.species as MoleSpecies] : undefined,
    population =
      mode === "inverse"
        ? standardCount(populations[b.population as keyof typeof populations])
        : undefined,
    prediction = (key: string, unit: string) =>
      b[key] === "unset" ? "not entered" : `${b[key]} ${unit}`;
  return (
    <section
      className="model task-workbench mole-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      {sample && (
        <p>
          Shown mass:{" "}
          {b.unit === "mg"
            ? sample.grams * 1000
            : b.unit === "kg"
              ? sample.grams / 1000
              : sample.grams}{" "}
          {b.unit} of {sample.formula}.
        </p>
      )}
      <div className="ionic-structure-controls">
        {mode === "mass" && (
          <>
            {select("Supplied sample", "sample", "")}
            {select("Displayed mass unit", "unit", "")}
            {select("Your converted mass", "grams", " g")}
            {select("Your molar mass", "molarMass", " g/mol")}
            {select("Your amount", "amount", " mol")}
          </>
        )}
        {mode === "reverse" && (
          <>
            {select("Supplied formula", "species", "")}
            {select("Supplied amount", "amount", " mol", true)}
            {select("Your molar mass", "molarMass", " g/mol")}
            {select("Your sample mass", "mass", " g")}
          </>
        )}
        {mode === "entities" && (
          <>
            {select("Supplied formula", "species", "")}
            {select("Supplied amount", "amount", " mol", true)}
            {select("Your named complete entities", "entity", "")}
            {select("Your count coefficient", "coefficient", "")}
            {select("Your count exponent", "power", "")}
            {select(
              "Your total constituent amount",
              "constituentAmount",
              " mol",
            )}
          </>
        )}
        {mode === "inverse" && (
          <>
            {select("Supplied formula", "species", "")}
            {select("Supplied entity count", "population", "")}
            {select("Your amount", "amount", " mol")}
            {select("Your sample mass", "mass", " g")}
          </>
        )}
      </div>
      <p className="phase-boundary-note">
        {sample
          ? `Supplied ${sample.formula} sample: ${b.unit === "mg" ? sample.grams * 1000 : b.unit === "kg" ? sample.grams / 1000 : sample.grams} ${b.unit}. Supplied Aᵣ: ${sample.ar}. Unit changes preserve this sample's mass.`
          : mode === "reverse"
            ? `Supplied ${b.amount} mol ${species!.formula}; Aᵣ: ${species!.ar}. Construct M in g/mol.`
            : mode === "entities"
              ? `The supplied ${b.amount} mol counts complete ${species!.entity} of ${species!.formula}. Predict their named entity count, then total constituent ${species!.constituentKind} amount. A coefficient must be at least 1 and below 10 for normalized standard form.`
              : `Supplied ${population!.coefficient} × 10^${population!.power} ${species!.entity} of ${species!.formula}. Supplied molar mass ${species!.molarMass} g/mol. Count ÷ Nₐ gives mol, then mol × M gives g.`}
      </p>
      {(mode === "mass" || mode === "reverse") && (
        <div className="mole-prediction-ledger">
          <strong>Your working, retained as entered</strong>
          <p>
            {mode === "mass"
              ? `${prediction("grams", "g")} ÷ (${prediction("molarMass", "g/mol")}) → your ${prediction("amount", "mol")}`
              : `${b.amount} mol × (${prediction("molarMass", "g/mol")}) → your ${prediction("mass", "g")}`}
          </p>
          <p>
            n = m ÷ M; m = n × M. Relative formula mass has no unit; molar mass
            is in g/mol.
          </p>
        </div>
      )}
      {(mode === "entities" || mode === "inverse") && (
        <>
          <p>
            Supplied Nₐ = 6.02 × 10²³ mol⁻¹ (GCSE-rounded value). N = n × Nₐ; n
            = N ÷ Nₐ.
          </p>
          {mode === "entities" && (
            <div className="mole-prediction-ledger">
              <strong>Your complete-entity count</strong>
              <p>
                {b.coefficient === "unset" || b.power === "unset"
                  ? "Predict both coefficient and exponent."
                  : `${b.coefficient} × 10^${b.power} ${b.entity === "unset" ? "(name the entity)" : b.entity}`}
              </p>
              <p>
                {species!.counts}. Your total constituent prediction:{" "}
                {prediction(
                  "constituentAmount",
                  `mol ${species!.constituentKind}`,
                )}
                .
              </p>
            </div>
          )}
          {species!.entity === "formula units" ? (
            <figure className="mole-formula-ratio">
              <div>
                <strong>Na⁺</strong>
                <strong>Cl⁻</strong>
              </div>
              <figcaption>
                One NaCl formula-unit ratio accounts for one Na⁺ and one Cl⁻.
                These tiles show composition accounting within the ionic
                lattice, not a discrete molecule or an entire mole.
              </figcaption>
            </figure>
          ) : (
            <>
              <button
                className="button"
                aria-expanded={show3D}
                onClick={() => setShow3D(!show3D)}
              >
                {show3D
                  ? "Hide representative molecule"
                  : "Show one representative molecule"}
              </button>
              {show3D && (
                <>
                  <p>
                    This asset shows ONE {species!.formula} molecule and its
                    constituent atoms, not a mole or the enormous sample
                    population calculated above.
                  </p>
                  <CovalentScene3D
                    key={String(b.species)}
                    molecule={b.species as "H2O" | "O2" | "CO2"}
                    context="formula-count"
                  />
                </>
              )}
            </>
          )}
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = molePrediction(mode, b);
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
