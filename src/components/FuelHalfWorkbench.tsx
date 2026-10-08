"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import { FuelCell3D } from "./FuelCell3D";
import { balance, species } from "../lib/half-equations";
import {
  fuelHalfRecords,
  fuelHalfOptions,
  initialFuelHalfBoard,
  validFuelHalfNumber,
  fuelConstructionLedger,
  fuelCombinationLedger,
  fuelHalfPrediction,
  type FuelHalfMode,
} from "../lib/fuel-half";
type Board = Record<string, string | number>;
const titles: Record<FuelHalfMode, string> = {
  construct: "Build a half equation",
  combine: "Match, add and cancel",
  path: "Propose the charge route",
  diagnose: "Diagnose the proposed equation",
  evidence: "Support the chemical statement",
};
const fields: Record<FuelHalfMode, string[]> = {
  construct: [
    "a",
    "b",
    "c",
    "d",
    "electronSide",
    "process",
    "electrode",
    "leftCharge",
    "rightCharge",
  ],
  combine: [
    "hMultiplier",
    "oMultiplier",
    "electrons",
    "protons",
    "cancel",
    "hydrogen",
    "oxygen",
    "water",
  ],
  path: ["carrier", "path", "direction", "hydrogenSign", "oxygenSign"],
  diagnose: ["leftCharge", "rightCharge", "claim", "reason"],
  evidence: ["claim", "reason"],
};
const labels: Record<string, string> = {
  a: "Your H₂ or O₂ coefficient",
  b: "Your H⁺ coefficient",
  c: "Your electron coefficient",
  d: "Your H₂O coefficient",
  electronSide: "Your electron side",
  process: "Your electrode process",
  electrode: "Your electrode name and sign",
  leftCharge: "Your predicted left charge",
  rightCharge: "Your predicted right charge",
  hMultiplier: "Your hydrogen-half multiplier",
  oMultiplier: "Your oxygen-half multiplier",
  electrons: "Your electrons cancelled on each side",
  protons: "Your H⁺ cancelled on each side",
  cancel: "Your cancellation rule",
  hydrogen: "Your net H₂ coefficient",
  oxygen: "Your net O₂ coefficient",
  water: "Your net H₂O coefficient",
  carrier: "Your proposed charge carrier",
  path: "Your proposed conducting path",
  direction: "Your proposed direction",
  hydrogenSign: "Your hydrogen-electrode sign",
  oxygenSign: "Your oxygen-electrode sign",
  claim: "Your supported claim",
  reason: "Your chemical reason",
};
const names: Record<string, string> = {
  unset: "Choose your prediction",
  left: "Reactant / left side",
  right: "Product / right side",
  oxidation: "Oxidation: electron loss",
  reduction: "Reduction: electron gain",
  "negative-anode": "Negative anode",
  "positive-cathode": "Positive cathode",
  "positive-anode": "Positive anode",
  "negative-cathode": "Negative cathode",
  "electrons-and-protons": "Equal electrons and H⁺ on opposite sides",
  "electrons-only": "Only electrons, ignoring shared H⁺",
  "water-only": "Only one-sided water",
  "all-substances": "Delete all substances",
  electrons: "Electrons",
  protons: "H⁺ ions",
  "conventional-positive-direction":
    "Conventional current direction (extension)",
  "neutral-hydrogen": "Neutral hydrogen gas",
  "external-wire": "External metal wire",
  electrolyte: "Proton-conducting electrolyte",
  "gas-inlet": "Gas inlet",
  "hydrogen-to-oxygen": "Hydrogen electrode → oxygen electrode",
  "oxygen-to-hydrogen": "Oxygen electrode → hydrogen electrode",
  negative: "Negative",
  positive: "Positive",
  "charge-mismatch": "Atoms balance; charge does not",
  "atom-mismatch": "Charge balances; atom counts do not",
  "balanced-wrong-process": "Balanced; wrong stated process direction",
  "fully-correct-for-stated-electrode":
    "Fully correct for the stated electrode",
  "electron-count-does-not-balance-charge":
    "The electron count fails the charge balance",
  "fixed-formula-atom-counts-differ":
    "The fixed formulas have unequal atom counts",
  "reduction-not-stated-hydrogen-oxidation":
    "It is reduction, not the required hydrogen oxidation",
  "electrons-on-wrong-side-for-oxidation":
    "Electrons are on the wrong side for hydrogen oxidation",
  "balanced-atoms-always-enough":
    "Atom balance alone always proves the stated reaction",
  "minus-one-charge-no-h-or-o-atoms": "−1 charge; no H or O atoms",
  "electron-is-not-a-hydrogen-or-oxygen-nucleus":
    "An electron is not a hydrogen or oxygen nucleus",
  "multiply-every-term-on-both-sides": "Multiply every term on both sides",
  "preserve-atoms-charge-and-reaction-ratio":
    "Preserve atoms, charge and the reaction ratio",
  "cancel-equal-identical-opposite-terms":
    "Cancel equal identical terms on opposite sides",
  "no-net-consumption-of-these-shared-terms":
    "These shared terms have no net consumption",
  "hydrogen-and-oxygen-form-water": "Hydrogen and oxygen form water",
  "electron-transfer-does-not-leave-net-electrons-in-overall-equation":
    "Electron transfer leaves no net electrons in the overall equation",
  "anode-means-oxidation-sign-depends-on-cell":
    "Anode means oxidation; sign depends on the cell",
  "electrolysis-positive-anode-is-not-a-universal-sign-rule":
    "The positive electrolysis anode is not a universal sign rule",
  "use-the-supplied-acidic-species": "Use the supplied acidic species",
  "different-electrolyte-accounts-must-not-be-mixed":
    "Do not mix different electrolyte accounts",
  "electrons-are-hydrogen-atoms": "Electrons are hydrogen atoms",
  "anode-always-positive": "Every anode is positive",
  "charge-can-be-ignored": "Charge can be ignored",
  "delete-any-unwanted-substance": "Delete any unwanted substance",
};
function human(v: string) {
  return names[v] ?? v.replaceAll("-", " ");
}
function terms(list: readonly { species: string; coefficient: number }[]) {
  return list
    .map(
      (t) =>
        `${t.coefficient === 1 ? "" : t.coefficient}${species[t.species].label}`,
    )
    .join(" + ");
}
export function FuelHalfWorkbench({
  mode,
  record,
  instruction,
  history,
  onChange,
}: {
  mode: FuelHalfMode;
  record?: string;
  instruction: string;
  history: Board[];
  onChange: (h: Board[]) => void;
}) {
  const controlId = useId();
  const b = history.at(-1) ?? initialFuelHalfBoard(mode, record),
    key = String(b.record),
    records = fuelHalfRecords[mode] as Record<string, { label: string }>;
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  function change(k: string, v: string) {
    if (b[k] === v) return;
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    setFeedback("");
    if (k === "record") setRaw({});
    onChange([
      ...history,
      k === "record" ? initialFuelHalfBoard(mode, v) : { ...b, [k]: v },
    ]);
  }
  const construction =
    mode === "construct"
      ? fuelHalfRecords.construct[key as keyof typeof fuelHalfRecords.construct]
      : null;
  const active = fields[mode].filter(
    (k) => !(construction?.kind === "hydrogen" && k === "d"),
  );
  function control(k: string) {
    const label =
        k === "a" && construction
          ? `Your ${construction.kind === "hydrogen" ? "H₂" : "O₂"} coefficient`
          : labels[k],
      options = fuelHalfOptions[mode][k];
    const stepper =
      (mode === "construct" && ["a", "b", "c", "d"].includes(k)) ||
      (mode === "combine" && !options);
    function step(delta: number) {
      const next = String(Number(raw[k] ?? b[k]) + delta);
      if (!validFuelHalfNumber(next)) return;
      setRaw({ ...raw, [k]: next });
      change(k, next);
    }
    return (
      <div
        key={k}
        className={`fuel-field ${options ? "fuel-choice" : "fuel-number"}`}
      >
        <label htmlFor={`${controlId}-${k}`}>{label}</label>
        {options ? (
          <select
            id={`${controlId}-${k}`}
            aria-label={label}
            value={b[k]}
            onChange={(e) => change(k, e.target.value)}
          >
            {options.map((v) => (
              <option key={v} value={v}>
                {human(v)}
              </option>
            ))}
          </select>
        ) : (
          <div className="fuel-stepper">
            {stepper && (
              <button
                className="button"
                aria-label={`Decrease ${label.slice(5)}`}
                disabled={
                  !validFuelHalfNumber(raw[k] ?? String(b[k])) ||
                  Number(raw[k] ?? b[k]) <= -10000
                }
                onClick={() => step(-1)}
              >
                −
              </button>
            )}
            <input
              id={`${controlId}-${k}`}
              aria-label={label}
              inputMode="decimal"
              value={raw[k] ?? String(b[k])}
              onChange={(e) => {
                const v = e.target.value;
                setRaw({ ...raw, [k]: v });
                setFeedback("");
                if (validFuelHalfNumber(v)) change(k, v);
              }}
            />
            {stepper && (
              <button
                className="button"
                aria-label={`Increase ${label.slice(5)}`}
                disabled={
                  !validFuelHalfNumber(raw[k] ?? String(b[k])) ||
                  Number(raw[k] ?? b[k]) >= 10000
                }
                onClick={() => step(1)}
              >
                +
              </button>
            )}
          </div>
        )}
        {options && b[k] !== "unset" && human(String(b[k])).length > 30 && (
          <span className="cells-selected-text">
            Your selection: {human(String(b[k]))}
          </span>
        )}
      </div>
    );
  }

  const ledger =
    mode === "construct"
      ? fuelConstructionLedger(key, b)
      : mode === "diagnose"
        ? balance(
            [
              ...fuelHalfRecords.diagnose[
                key as keyof typeof fuelHalfRecords.diagnose
              ].left,
            ],
            [
              ...fuelHalfRecords.diagnose[
                key as keyof typeof fuelHalfRecords.diagnose
              ].right,
            ],
          )
        : null;
  const combined = mode === "combine" ? fuelCombinationLedger(key, b) : null;
  const invalid = Object.values(raw).some((v) => !validFuelHalfNumber(v));
  return (
    <section
      className="model task-workbench fuel-half-workbench"
      aria-label="Task model"
    >
      <h3>{titles[mode]}</h3>
      {control(active[0])}
      <p>{instruction}</p>
      <details>
        <summary>Choose another supplied case</summary>
        <label>
          Supplied fuel-cell case
          <select
            aria-label="Supplied fuel-cell case"
            value={key}
            onChange={(e) => change("record", e.target.value)}
          >
            {Object.entries(records).map(([id, r]) => (
              <option key={id} value={id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </details>
      <p className="model-context">{records[key].label}</p>
      <div className="fuel-controls">{active.slice(1).map(control)}</div>
      {construction && (
        <figure>
          <p className="fuel-equation" aria-label="Your proposed equation">
            {`${b.a}${construction.kind === "hydrogen" ? "H₂" : "O₂"}${construction.kind === "oxygen" ? ` + ${b.b}H⁺` : ""}${b.electronSide === "left" ? ` + ${b.c}e⁻` : ""} → ${construction.kind === "hydrogen" ? `${b.b}H⁺` : `${b.d}H₂O`}${b.electronSide === "right" ? ` + ${b.c}e⁻` : ""}${b.electronSide === "unset" ? "; electron side not chosen" : ""}`}
          </p>
          <figcaption>
            Coefficients and electron side stay as you entered them. Keep
            species formulas fixed; zero or fractional coefficients are retained
            predictions, not automatically corrected equations.
          </figcaption>
        </figure>
      )}
      {mode === "diagnose" && (
        <p className="fuel-equation">
          {terms(
            fuelHalfRecords.diagnose[
              key as keyof typeof fuelHalfRecords.diagnose
            ].left,
          )}{" "}
          →{" "}
          {terms(
            fuelHalfRecords.diagnose[
              key as keyof typeof fuelHalfRecords.diagnose
            ].right,
          )}
        </p>
      )}
      {ledger && (
        <div className="fuel-ledger">
          <h4>Inventory of the displayed proposal</h4>
          <table>
            <caption>
              Calculated counts help you inspect your proposal; they do not
              certify its stated process.
            </caption>
            <thead>
              <tr>
                <th scope="col">Inventory</th>
                <th scope="col">Left</th>
                <th scope="col">Right</th>
              </tr>
            </thead>
            <tbody>
              {["H", "O"].map((atom) => (
                <tr key={atom}>
                  <th scope="row">{atom} atoms</th>
                  <td>{ledger.left.atoms[atom] ?? 0}</td>
                  <td>{ledger.right.atoms[atom] ?? 0}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Your predicted charge</th>
                <td>{b.leftCharge}</td>
                <td>{b.rightCharge}</td>
              </tr>
              {feedback && (
                <tr>
                  <th scope="row">Calculated charge after checking</th>
                  <td>{ledger.left.charge}</td>
                  <td>{ledger.right.charge}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {combined && (
        <figure>
          <p>
            From your multipliers: {combined.hydrogen}H₂ →{" "}
            {combined.protonsRight}H⁺ + {combined.electronsRight}e⁻
          </p>
          <p>
            {combined.oxygen}O₂ + {combined.protonsLeft}H⁺ +{" "}
            {combined.electronsLeft}e⁻ → {combined.water}H₂O
          </p>
          <p>
            After your cancellation amounts: left H⁺{" "}
            {combined.remainingProtonsLeft}, e⁻{" "}
            {combined.remainingElectronsLeft}; right H⁺{" "}
            {combined.remainingProtonsRight}, e⁻{" "}
            {combined.remainingElectronsRight}.
          </p>
          <p>
            Your proposed net equation: {b.hydrogen}H₂ + {b.oxygen}O₂ →{" "}
            {b.water}H₂O.
          </p>
          <figcaption>
            All displayed counts follow your entries. Negative remainders reveal
            over-cancellation; they do not represent negative particles. The net
            coefficients remain your separate predictions.
          </figcaption>
        </figure>
      )}
      {mode === "path" && (
        <>
          <figure>
            <svg
              viewBox="0 0 500 340"
              role="img"
              aria-label={`Your route: ${human(String(b.carrier))}; ${human(String(b.path))}; ${human(String(b.direction))}. Hydrogen sign ${human(String(b.hydrogenSign))}; oxygen sign ${human(String(b.oxygenSign))}.`}
            >
              <path
                d="M105 160V50H210M290 50H395V160"
                fill="none"
                stroke="#35415a"
                strokeWidth="5"
              />
              <rect
                x="210"
                y="25"
                width="80"
                height="50"
                rx="8"
                fill="#eef0fd"
                stroke="#35415a"
              />
              <text x="250" y="57" textAnchor="middle" fontSize="22">
                Load
              </text>
              <rect x="75" y="150" width="65" height="140" fill="#66748c" />
              <rect x="140" y="150" width="220" height="140" fill="#d8d4f1" />
              <rect x="360" y="150" width="65" height="140" fill="#66748c" />
              <text x="105" y="135" textAnchor="middle" fontSize="22">
                H₂ side
              </text>
              <text x="395" y="135" textAnchor="middle" fontSize="22">
                O₂ side
              </text>
              <text x="250" y="250" textAnchor="middle" fontSize="22">
                Electrolyte
              </text>
              {b.direction !== "unset" &&
                b.path !== "unset" &&
                b.carrier !== "unset" && (
                  <text
                    x="250"
                    y={
                      b.path === "external-wire"
                        ? 110
                        : b.path === "electrolyte"
                          ? 195
                          : 320
                    }
                    textAnchor="middle"
                    fontSize="30"
                    fill="#3848bf"
                  >
                    {b.direction === "hydrogen-to-oxygen" ? "→" : "←"}
                  </text>
                )}
            </svg>
            <figcaption>
              The arrow shows your proposed direction on your selected path,
              including wrong routes. Carrier and signs are given in your
              controls and text; geometry does not decide the answer.
            </figcaption>
          </figure>
          <details>
            <summary>Inspect your route in actual 3D</summary>
            <FuelCell3D
              route={{
                carrier: String(b.carrier),
                path: String(b.path),
                direction: String(b.direction),
                hydrogenSign: String(b.hydrogenSign),
                oxygenSign: String(b.oxygenSign),
              }}
            />
          </details>
        </>
      )}
      {invalid && (
        <p role="alert">
          Enter a signed decimal number. Fractions, scientific notation and
          incomplete entries cannot be checked; your raw entry remains visible.
        </p>
      )}
      <div className="bench-actions">
        <button
          className="button"
          disabled={invalid}
          onClick={() => {
            const result = fuelHalfPrediction(mode, b);
            setCorrect(result.correct);
            setFeedback(
              (result.correct ? "That’s right. " : "Not yet. ") +
                result.explanation,
            );
          }}
        >
          Check model
        </button>
        <button
          className="button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setRaw({});
            setFeedback("");
          }}
        >
          Undo
        </button>
        <button
          className="button"
          onClick={() => {
            onChange([initialFuelHalfBoard(mode, record)]);
            setRaw({});
            setFeedback("");
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={correct ? "feedback correct" : "feedback retry"}
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>About this model</summary>
        <p>
          This supplied acidic account uses fixed H₂, O₂, H⁺, e⁻ and H₂O
          species. Atom counts, signed charge and the required process direction
          are distinct checks. Macroscopic 3D layers and proposed route arrows
          are schematic. It does not award examiner marks or certify practical
          work.
        </p>
      </details>
    </section>
  );
}
