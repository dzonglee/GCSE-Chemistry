"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import {
  compressionRecords,
  compressionSnapshot,
  pressureRecords,
  temperatureRecords,
  concentrationRecords,
  combinedRecords,
  shiftEvidence,
  gasTotal,
  atomTotals,
  type ShiftMode,
} from "../lib/equilibrium-shifts";
import {
  shiftRecords,
  initialShiftBoard,
  validShiftBoard,
  shiftBoardCheck,
  type ShiftBoard,
} from "../lib/equilibrium-shift-board";
import { EquilibriumScene3D } from "./EquilibriumScene3D";
type Saved = Record<string, string | number>;
const directionChoices = [
  ["forward", "Forward (towards displayed products)"],
  ["reverse", "Reverse (towards displayed reactants)"],
  ["unchanged", "No equilibrium-position change"],
  ["insufficient", "Cannot determine from these conditions"],
] as const;
const titles: Record<ShiftMode, string> = {
  compression: "Separate compression from reaction",
  pressure: "Count the gas coefficients",
  temperature: "Choose the energy direction",
  concentration: "Compare the immediate and later mixture",
  combined: "Consider each change separately",
  evidence: "Separate final amount from arrival time",
};
export function EquilibriumShiftWorkbench({
  mode,
  history,
  onChange,
  record: originalRecord = "initial",
  instruction,
}: {
  mode: ShiftMode;
  history: Saved[];
  onChange: (history: Saved[]) => void;
  record?: string;
  instruction?: string;
}) {
  const uid = useId(),
    value = (history.at(-1) ??
      initialShiftBoard(mode, originalRecord)) as ShiftBoard;
  const [raw, setRaw] = useWorkbenchInputDraft<ShiftBoard | null>(null),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null);
  const b = raw ?? value,
    record = b.record;
  function append(next: ShiftBoard) {
    if (
      history.length < 500 &&
      Object.keys(next).some((k) => next[k] !== value[k])
    )
      onChange([...history, next]);
  }
  function update(key: string, v: string) {
    const next = { ...b, [key]: v };
    setFeedback(null);
    if (validShiftBoard(mode, next)) {
      setRaw(null);
      append(next);
    } else setRaw(next);
  }
  function select(
    key: string,
    label: string,
    choices: readonly (readonly string[])[],
  ) {
    const selected = choices.find(([v]) => v === b[key])?.[1];
    return (
      <div key={key}>
        <label htmlFor={uid + "-" + key}>{label}</label>
        <select
          id={uid + "-" + key}
          value={b[key]}
          onChange={(e) => update(key, e.target.value)}
        >
          <option value="">Choose a prediction</option>
          {choices.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
        {selected && selected.length > 20 && (
          <p className="shift-selection">Selected: {selected}</p>
        )}
      </div>
    );
  }
  function number(key: string, label: string) {
    return (
      <div key={key}>
        <label htmlFor={uid + "-" + key}>{label}</label>
        <input
          id={uid + "-" + key}
          type="text"
          inputMode={
            mode === "compression" || mode === "pressure"
              ? "numeric"
              : "decimal"
          }
          value={b[key]}
          onChange={(e) => update(key, e.target.value)}
        />
      </div>
    );
  }
  function tally(key: string, label: string) {
    const amount = Number(b[key]),
      draw =
        Number.isInteger(amount) && amount >= 0
          ? Math.min(Math.floor(amount), 12)
          : 0;
    return (
      <section>
        <h4>{label}</h4>
        {number(
          key,
          key === "left"
            ? "Gas coefficient total on the left"
            : "Gas coefficient total on the right",
        )}
        <div className="shift-tally" aria-hidden="true">
          {Array.from({ length: draw }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <p>
          {!Number.isInteger(amount) || amount < 0
            ? "Use a non-negative whole number to construct this gas tally."
            : `Your constructed total: ${b[key]}.`}
          {amount > 12 ? " First twelve counters shown." : ""}
        </p>
        <div className="model-controls">
          <button
            type="button"
            disabled={raw !== null || amount <= 0 || history.length >= 500}
            onClick={() => update(key, String(amount - 1))}
          >
            Remove one {key === "left" ? "left" : "right"} gas count
          </button>
          <button
            type="button"
            disabled={raw !== null || amount >= 12 || history.length >= 500}
            onClick={() => update(key, String(amount + 1))}
          >
            Add one {key === "left" ? "left" : "right"} gas count
          </button>
        </div>
      </section>
    );
  }
  let opening: React.ReactNode = null,
    visual: React.ReactNode = null,
    predictions: React.ReactNode = null;
  if (mode === "compression") {
    const r = compressionRecords[record],
      stage = Number(value.step) as 0 | 1 | 2,
      s = compressionSnapshot(r, stage),
      atoms = atomTotals(s.inventory);
    opening = (
      <button
        type="button"
        className="button"
        disabled={stage >= 2 || raw !== null || history.length >= 500}
        onClick={() => update("step", String(stage + 1))}
      >
        {stage === 0
          ? "Change the occupied volume"
          : stage === 1
            ? "Show supplied later composition"
            : "Later equilibrium shown"}
      </button>
    );
    visual = (
      <>
        <p className="shift-equation">N₂(g) + 3H₂(g) ⇌ 2NH₃(g)</p>
        <p>
          Temperature stays fixed through these three stages.{" "}
          {r.volume < 1 ? "Reduce" : "Increase"} relative occupied volume from 1
          to about {r.volume.toFixed(3)}. Other supplied comparisons may use
          different temperatures and starting mixtures.
        </p>
        <p className="shift-stage">
          {
            [
              "Before the change: equilibrium",
              "Immediately after volume changes",
              "Supplied later equilibrium",
            ][stage]
          }
        </p>
        <EquilibriumScene3D record={r} stage={stage} />
        <div className="shift-scroll">
          <table>
            <caption>Current supplied molecule inventory</caption>
            <thead>
              <tr>
                <th scope="col">Substance</th>
                <th scope="col">Molecules</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Nitrogen N₂</th>
                <td>{s.inventory.nitrogen}</td>
              </tr>
              <tr>
                <th scope="row">Hydrogen H₂</th>
                <td>{s.inventory.hydrogen}</td>
              </tr>
              <tr>
                <th scope="row">Ammonia NH₃</th>
                <td>{s.inventory.ammonia}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Total {gasTotal(s.inventory)} gas molecules. Conserved atoms:{" "}
          {atoms.nitrogen} nitrogen, {atoms.hydrogen} hydrogen.
        </p>
        <p>
          Relative occupied volume now: approximately {s.volume.toFixed(3)}. At
          fixed temperature, number per volume compares pressure.
        </p>
        <div className="shift-scroll">
          <table>
            <caption>
              Pressure comparison: molecules per relative volume
            </caption>
            <thead>
              <tr>
                <th scope="col">Stage</th>
                <th scope="col">Number per volume</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Original</th>
                <td>{gasTotal(r.initial).toFixed(2)}</td>
              </tr>
              {stage >= 1 && (
                <tr>
                  <th scope="row">After volume change</th>
                  <td>{(gasTotal(r.initial) / r.volume).toFixed(2)}</td>
                </tr>
              )}
              {stage >= 2 && (
                <tr>
                  <th scope="row">Supplied later</th>
                  <td>{(gasTotal(r.later) / r.volume).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p>
          Schematic counts, not measured moles or pressure units. Volumes are
          shown to 3 decimal places; numbers per volume to 2 decimal places.
        </p>
      </>
    );
    predictions = (
      <>
        {number(
          "immediate",
          "Total gas molecules immediately after volume changes",
        )}
        {number(
          "later",
          "Total gas molecules in the supplied later equilibrium",
        )}
        {select(
          "direction",
          "Direction of the subsequent net reaction",
          directionChoices,
        )}
        {select(
          "response",
          "Does the later reaction restore the original pressure?",
          [
            ["partial", "Partially opposes the change; does not restore it"],
            ["complete", "Restores the original pressure exactly"],
            ["noResponse", "There is no response"],
          ],
        )}
      </>
    );
  }
  if (mode === "pressure") {
    const r = pressureRecords[record];
    visual = (
      <>
        <p className="shift-equation">{r.equation}</p>
        <p>
          {r.increase
            ? "Higher pressure by compression"
            : "Lower pressure by expansion"}
          , at fixed temperature. Read the state symbols; only gases contribute
          to the gas coefficient totals.
        </p>
        <div className="shift-two">
          {tally("left", "Build the reactant-side gas count")}
          {tally("right", "Build the product-side gas count")}
        </div>
        <p>
          The totals describe one balanced reaction event, not the actual
          numbers currently in the container.
        </p>
      </>
    );
    predictions = (
      <>
        {select("direction", "Equilibrium-position change", directionChoices)}
        {select("reason", "Reason for that pressure response", [
          ["fewerGas", "Higher pressure favours fewer gaseous molecules"],
          ["moreGas", "Lower pressure favours more gaseous molecules"],
          ["equalGas", "Equal gaseous coefficients: neither side favoured"],
          ["heavierGas", "Pressure always favours heavier molecules"],
        ])}
      </>
    );
  }
  if (mode === "temperature") {
    const r = temperatureRecords[record],
      exo = r.forward === "exothermic";
    visual = (
      <>
        <p className="shift-equation">{r.equation}</p>
        <p>
          The displayed forward reaction is <strong>{r.forward}</strong>.{" "}
          {r.heating ? "Increase" : "Decrease"} the temperature.
        </p>
        <figure>
          <p className="shift-chart-heading">Relative chemical energy</p>
          <svg
            viewBox="0 0 480 190"
            role="img"
            aria-label={`Relative energy endpoints: forward is ${r.forward}. No activation barrier is plotted.`}
          >
            <line
              x1="70"
              y1={exo ? 65 : 125}
              x2="195"
              y2={exo ? 65 : 125}
              stroke="#3344c8"
              strokeWidth="5"
            />
            <line
              x1="285"
              y1={exo ? 125 : 65}
              x2="410"
              y2={exo ? 125 : 65}
              stroke="#c39725"
              strokeWidth="5"
            />
            <text x="70" y="163">
              Reactants
            </text>
            <text x="285" y="163">
              Products
            </text>
            <path
              d={
                exo
                  ? "M220 65 L260 125 L248 119 M260 125 L260 111"
                  : "M220 125 L260 65 L248 71 M260 65 L260 79"
              }
              fill="none"
              stroke="#131b2b"
              strokeWidth="3"
            />
          </svg>
          <figcaption>
            Energy endpoints only: the reverse reaction has the opposite energy
            direction. Heat is energy transfer, not an extra gas molecule.
          </figcaption>
        </figure>
      </>
    );
    predictions = (
      <>
        {select(
          "favoured",
          "Which energy direction does this temperature change favour?",
          [
            ["exothermic", "Exothermic direction"],
            ["endothermic", "Endothermic direction"],
          ],
        )}
        {select(
          "direction",
          "Equilibrium-position change relative to this equation",
          directionChoices,
        )}
        {select(
          "rate",
          "Usual GCSE reaction-rate effect of this temperature change",
          [
            ["faster", "Higher temperature: faster reactions"],
            ["slower", "Lower temperature: slower reactions"],
            ["unchanged", "Temperature does not affect reaction rate"],
          ],
        )}
      </>
    );
  }
  if (mode === "concentration") {
    const r = concentrationRecords[record];
    visual = (
      <>
        <p className="shift-equation">{r.equation}</p>
        <p>
          The starting mixture is at equilibrium. The {r.edited} is {r.action}.
          Temperature and solution volume stay fixed. Supplied macroscopic
          amounts in mmol; decimal amounts are not fractional individual
          molecules.
        </p>
        <div className="shift-scroll">
          <table className="shift-data-table">
            <caption>
              Before, immediately edited, and later equilibrium amounts
            </caption>
            <thead>
              <tr>
                <th scope="col">Stage</th>
                <th scope="col">Reactant / mmol</th>
                <th scope="col">Product / mmol</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Before", r.initial],
                ["After edit", r.immediate],
                ["Later state", r.later],
              ].map(([label, amounts]) => (
                <tr key={String(label)}>
                  <th scope="row">{String(label)}</th>
                  {(amounts as number[]).map((n, i) => (
                    <td key={i}>{n}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          These later amounts are provided data. The qualitative rule determines
          a direction, not an exact numerical composition.
        </p>
      </>
    );
    predictions = (
      <>
        {number("immediate", `Immediately edited ${r.edited} amount / mmol`)}
        {number("later", `Supplied later ${r.edited} amount / mmol`)}
        {select("direction", "Net reaction after the edit", directionChoices)}
        {select(
          "response",
          "How does the later reaction respond to the edit?",
          [
            ["partial", "Partially opposes the edit"],
            ["complete", "Exactly restores the original value"],
            ["noResponse", "No reaction response"],
          ],
        )}
      </>
    );
  }
  if (mode === "combined") {
    const r = combinedRecords[record];
    visual = (
      <>
        <p className="shift-equation">{r.equation}</p>
        <p>
          Forward is <strong>{r.forward}</strong>. Only the stated qualitative
          information is available.
        </p>
        <div className="shift-two">
          <section>
            <h4>Pressure change</h4>
            <p>
              {r.increasePressure
                ? "Increase pressure by compression"
                : "Decrease pressure by expansion"}
              . {r.left} gaseous coefficients left; {r.right} right.
            </p>
          </section>
          <section>
            <h4>Temperature change</h4>
            <p>
              {r.heating ? "Increase" : "Decrease"} temperature. Determine the
              energy direction favoured.
            </p>
          </section>
        </div>
        <p>
          Consider each change separately first. No numerical equilibrium data
          or relative effect sizes are supplied.
        </p>
      </>
    );
    predictions = (
      <>
        {select(
          "pressure",
          "Pressure effect considered alone",
          directionChoices,
        )}
        {select(
          "temperature",
          "Temperature effect considered alone",
          directionChoices,
        )}
        {select(
          "overall",
          "Overall change supported by the supplied information",
          directionChoices,
        )}
        {select("reason", "How do these effects combine?", [
          ["agree", "Both effects favour the same direction"],
          ["oppose", "Opposing effects: relative sizes are unknown"],
          ["pressureNeutral", "Pressure is neutral; use temperature effect"],
          ["temperatureNeutral", "Temperature is neutral; use pressure effect"],
        ])}
      </>
    );
  }
  if (mode === "evidence") {
    const r = shiftEvidence[record],
      max = Math.max(...r.control, ...r.changed) * 1.1,
      last = r.times.at(-1)!;
    const points = (values: number[]) =>
      values
        .map(
          (n, i) =>
            `${70 + (r.times[i] / last) * 350},${190 - (n / max) * 145}`,
        )
        .join(" ");
    visual = (
      <>
        <p>{r.context}</p>
        <p>
          Both runs are closed reacting systems. Their final plateaus are
          supplied as known dynamic equilibria; a flat concentration trace alone
          would not establish this.
        </p>
        <figure>
          <p className="shift-chart-heading">
            Product concentration / mol dm⁻³
          </p>
          <svg
            viewBox="0 0 480 265"
            role="img"
            aria-label="Supplied concentration against time; complete numeric readings follow in the table."
          >
            <path d="M70 45 V190 H425" fill="none" stroke="#74829a" />
            <polyline
              points={points(r.control)}
              fill="none"
              stroke="#3344c8"
              strokeWidth="4"
            />
            <polyline
              points={points(r.changed)}
              fill="none"
              stroke="#b47b15"
              strokeWidth="4"
              strokeDasharray="7 5"
            />
            {r.times.map((t) => (
              <text
                key={t}
                x={70 + (t / last) * 350}
                y="213"
                textAnchor="middle"
              >
                {t}
              </text>
            ))}
            <text x="155" y="250">
              Time / minutes
            </text>
            <text x="14" y="195">
              0
            </text>
            <text x="14" y="36">
              {max.toFixed(2)}
            </text>
          </svg>
          <figcaption>
            Blue solid: control. Gold dashed: changed condition. Joined supplied
            readings, not measured continuous kinetics. Arrival means the first
            sample at the continuing final plateau.
          </figcaption>
        </figure>
        <div className="shift-scroll">
          <table className="shift-data-table">
            <caption>Supplied concentration readings / mol dm⁻³</caption>
            <thead>
              <tr>
                <th scope="col">Time / min</th>
                <th scope="col">Control</th>
                <th scope="col">Changed</th>
              </tr>
            </thead>
            <tbody>
              {r.times.map((t, i) => (
                <tr key={t}>
                  <th scope="row">{t}</th>
                  <td>{r.control[i]}</td>
                  <td>{r.changed[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
    predictions = (
      <>
        {select(
          "final",
          "Final product concentration in changed run versus control",
          [
            ["higher", "Higher"],
            ["lower", "Lower"],
            ["same", "Same"],
          ],
        )}
        {select(
          "arrival",
          "First continuing-plateau sample in changed run versus control",
          [
            ["earlier", "Earlier"],
            ["later", "Later"],
            ["same", "Same sampled time"],
          ],
        )}
        {number(
          "controlTime",
          "Control: first continuing-plateau sample / min",
        )}
        {number(
          "changedTime",
          "Changed: first continuing-plateau sample / min",
        )}
      </>
    );
  }
  return (
    <section
      className="model task-workbench shift-workbench"
      aria-label="Task model"
    >
      <h3 className={mode === "compression" ? "shift-visually-hidden" : ""}>
        {instruction ?? titles[mode]}
      </h3>
      {opening}
      {visual}
      <div className="shift-fields">{predictions}</div>
      <div className="model-controls">
        <button
          type="button"
          className="button"
          onClick={() => setFeedback(shiftBoardCheck(mode, b))}
        >
          Check model
        </button>
        <button
          type="button"
          disabled={!raw && history.length <= 1}
          onClick={() => {
            setFeedback(null);
            if (raw) setRaw(null);
            else onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            setRaw(null);
            setFeedback(null);
            onChange([initialShiftBoard(mode, originalRecord)]);
          }}
        >
          Reset model
        </button>
      </div>
      {raw && (
        <p role="status">
          Use whole numbers for gas counts and ordinary non-negative decimals
          for amounts or times. Your invalid entry is visible but is not saved;
          Undo discards it.
        </p>
      )}
      {history.length >= 500 && (
        <p role="status">History is full. Undo or reset to continue.</p>
      )}
      {feedback && (
        <p
          role="status"
          className={"feedback " + (feedback.correct ? "correct" : "retry")}
        >
          {feedback.message}
        </p>
      )}
      <details>
        <summary>Choose another supplied comparison</summary>
        <label htmlFor={uid + "-record"}>Supplied comparison</label>
        <select
          id={uid + "-record"}
          value={record}
          onChange={(e) => {
            setRaw(null);
            setFeedback(null);
            if (e.target.value !== value.record)
              append(initialShiftBoard(mode, e.target.value));
          }}
        >
          {Object.entries(shiftRecords[mode]).map(([id, r]) => (
            <option key={id} value={id}>
              {r.title}
            </option>
          ))}
        </select>
        <p className="shift-selection">
          Selected: {shiftRecords[mode][record].title}
        </p>
        <p>
          A different record starts a pristine prediction. Selecting the current
          record preserves its predictions.
        </p>
      </details>
    </section>
  );
}
