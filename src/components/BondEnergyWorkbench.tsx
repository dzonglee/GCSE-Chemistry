"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  bondReactions,
  bondEvidence,
  bondClaims,
  bondReasons,
  bondRecords,
  bondLabels,
  bondCountKeys,
  bondInitial,
  bondInteger,
  bondCorrect,
  bondTotals,
  type BondMode,
  type BondKind,
} from "@/lib/bond-energy";
import { CovalentScene3D } from "./CovalentScene3D";
import { BondReactionDiagram } from "./BondReactionDiagram";
const headings: Record<BondMode, string> = {
  count: "Count bonds in the equation",
  ledger: "Build the energy ledger",
  inverse: "Find the unknown bond energy",
  cancel: "Cancel equal entries",
  evidence: "Explain the energy accounting",
};
export function BondEnergyWorkbench({
  mode,
  record,
  instruction,
  history,
  onChange,
}: {
  mode: BondMode;
  record?: string;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? bondInitial(mode, record),
    key = String(b.record),
    r = mode === "evidence" ? null : bondReactions[key];
  const [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({});
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
      k === "record" ? bondInitial(mode, v) : { ...b, [k]: v },
    ]);
  }
  function input(k: string, label: string) {
    return (
      <label>
        {label}
        <input
          aria-label={label}
          inputMode={k === "change" ? "text" : "numeric"}
          value={raw[k] ?? String(b[k])}
          onChange={(e) => {
            const value = e.target.value;
            setRaw({ ...raw, [k]: value });
            if (bondInteger(value, k === "change" ? -20000 : 0, 20000))
              change(k, value);
          }}
        />
        <small>
          Enter a whole number{k === "change" ? ", including its sign" : ""}.
          Complete your prediction before checking.
        </small>
      </label>
    );
  }
  function counter(k: string, label: string) {
    return (
      <div className="particle-choice" key={k}>
        <label>{label}</label>
        <div className="electrolysis-ion-controls">
          <button
            className="button secondary"
            aria-label={"Decrease " + label}
            disabled={Number(b[k]) === 0}
            onClick={() => change(k, String(Number(b[k]) - 1))}
          >
            −1
          </button>
          <output aria-label={label}>{b[k]}</output>
          <button
            className="button secondary"
            aria-label={"Increase " + label}
            disabled={Number(b[k]) === 24}
            onClick={() => change(k, String(Number(b[k]) + 1))}
          >
            +1
          </button>
        </div>
      </div>
    );
  }
  function select(k: string, label: string, values: string[]) {
    return (
      <label>
        {label}
        <select
          aria-label={label}
          value={String(b[k])}
          onChange={(e) => change(k, e.target.value)}
        >
          <option value="unset">Predict</option>
          {[...new Set(values)].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <small>Selected: {b[k] === "unset" ? "Predict" : String(b[k])}</small>
      </label>
    );
  }
  const firstKey = r ? bondCountKeys(r)[0] : null;
  const totals = r ? bondTotals(r) : null;
  return (
    <section
      className="model task-workbench bond-energy-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      {mode === "count" &&
        firstKey &&
        counter(
          "broken-" + firstKey,
          "Your reactant " + bondLabels[firstKey] + " bond count",
        )}
      {mode === "ledger" &&
        input(
          "input",
          "Your total bond-breaking input / kJ per mole of reaction",
        )}
      {mode === "inverse" &&
        input("unknown", "Your unknown bond energy / kJ per mole of bonds")}
      {mode === "cancel" &&
        counter("cancelBroken", "Your cancelled reactant C–H entries")}
      {mode === "evidence" &&
        select("claim", "Your bond-energy claim", bondClaims)}
      <label>
        Supplied bond-energy example
        <select
          aria-label="Supplied bond-energy example"
          value={key}
          onChange={(e) => change("record", e.target.value)}
        >
          {bondRecords[mode].map((id) => (
            <option key={id} value={id}>
              {mode === "evidence"
                ? bondEvidence[id as keyof typeof bondEvidence].label
                : bondReactions[id].label}
            </option>
          ))}
        </select>
      </label>
      {r && (
        <>
          <BondReactionDiagram reaction={key} />
          <p>
            All quantities refer to one mole of the reaction exactly as written.
            Bond values are positive kJ per mole of bonds; counts include
            equation coefficients.
          </p>
          <table className="isotope-data">
            <caption>Supplied bond-energy table</caption>
            <thead>
              <tr>
                <th scope="col">Bond</th>
                <th scope="col">Energy / kJ mol⁻¹ bonds</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(r.values).map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{bondLabels[k as BondKind]}</th>
                  <td>{mode === "inverse" && k === r.unknown ? "X" : v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {mode === "count" &&
        r &&
        bondCountKeys(r).flatMap((k) => [
          k !== firstKey
            ? counter(
                "broken-" + k,
                "Your reactant " + bondLabels[k] + " bond count",
              )
            : null,
          counter(
            "formed-" + k,
            "Your product " + bondLabels[k] + " bond count",
          ),
        ])}
      {mode === "ledger" && (
        <>
          {input(
            "release",
            "Your total bond-formation release / kJ per mole of reaction",
          )}
          {input(
            "change",
            "Your signed overall change / kJ per mole of reaction",
          )}
          {select("classification", "Your reaction classification", [
            "exothermic",
            "endothermic",
            "no-net-change",
          ])}
          <p>
            Your ledger: {b.input} − ({b.release}) ={" "}
            {Number(b.input) - Number(b.release)} kJ per mole of the reaction.
            Your submitted overall prediction remains {b.change}; this
            arithmetic does not replace it.
          </p>
        </>
      )}
      {mode === "inverse" && r && (
        <p>
          Supplied overall change: {r.suppliedChange} kJ per mole of the
          reaction as written. Count all entries, then rearrange input − release
          = overall. The unknown may occur more than once.
        </p>
      )}
      {mode === "cancel" && r && (
        <>
          {counter("cancelFormed", "Your cancelled product C–H entries")}
          {input(
            "change",
            "Your signed overall change / kJ per mole of reaction",
          )}
          <p>
            Remaining C–H entries:{" "}
            {Math.max(0, (r.broken.CH ?? 0) - Number(b.cancelBroken))} on
            reactants;{" "}
            {Math.max(0, (r.formed.CH ?? 0) - Number(b.cancelFormed))} on
            products. Any excessive proposal is retained: source has{" "}
            {r.broken.CH} and {r.formed.CH}, respectively. Equal matched
            cancellation preserves the difference; unequal cancellation does
            not.
          </p>
        </>
      )}
      {mode === "evidence" && (
        <>
          <p>{bondEvidence[key as keyof typeof bondEvidence].label}</p>
          {select("reason", "Your bond-energy reason", bondReasons)}
        </>
      )}
      {r && (
        <details className="bond-structure">
          <summary>Inspect one supplied molecule: {r.molecule}</summary>
          <CovalentScene3D molecule={r.molecule} context="bond-count" />
        </details>
      )}
      <p className="position-caption">
        {instruction} Changing the supplied example does not change the question
        alongside it. The ledger is a hypothetical energy-accounting path, not
        proof that all molecules first split into isolated atoms.
      </p>
      <div className="bench-actions">
        <button
          className="button"
          onClick={() => {
            if (
              Object.entries(raw).some(
                ([k, v]) => !bondInteger(v, k === "change" ? -20000 : 0, 20000),
              )
            ) {
              setCorrect(false);
              setFeedback(
                "Complete valid whole-number predictions before checking.",
              );
              return;
            }
            const ok = bondCorrect(mode, b);
            setCorrect(ok);
            setFeedback(
              ok
                ? mode === "evidence"
                  ? "That’s right. " +
                    bondEvidence[key as keyof typeof bondEvidence].reason
                  : mode === "inverse"
                    ? "That’s right. The unknown reproduces the supplied signed overall change with its correct bond multiplicity."
                    : mode === "cancel"
                      ? "That’s right. Matching C–H entries cancel equally, leaving the same overall difference."
                      : mode === "count"
                        ? "That’s right. Every bond connection is counted with the equation coefficient; distinct multiple-bond entries stay separate."
                        : "That’s right. " +
                          totals!.input +
                          " − " +
                          totals!.release +
                          " = " +
                          totals!.change +
                          " kJ per mole of reaction."
                : "Keep your proposal. Recount each displayed bond and coefficient, check breaking input minus formation release, or reconsider the supplied evidence. Your entries have not been corrected.",
            );
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            setFeedback("");
            setRaw({});
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFeedback("");
            setRaw({});
            onChange([bondInitial(mode, record)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          className={correct ? "feedback correct" : "feedback retry"}
          role="status"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
