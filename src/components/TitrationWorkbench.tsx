"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialTitrationBoard,
  titrationRecords,
  titrationChoices,
  titrationPrediction,
  titrationExpected,
  type TitrationMode,
} from "@/lib/titration-calculations";
import { TitrationBurette3D } from "./TitrationBurette3D";
const relationships: Record<string, string> = {
  "final-minus-initial": "Subtract initial from final, then use n=cV",
  "final-only": "Use final reading as delivered volume",
  "add-readings": "Add initial and final readings",
  "unknown-moles-over-sample":
    "Use reacting unknown moles over its original sample volume",
  "known-concentration": "Give unknown solution the known concentration",
  "divide-by-titre": "Divide unknown moles by known solution titre",
  "unknown-over-known-coefficient":
    "Multiply known moles by unknown/known equation coefficients",
  "always-one-to-one": "Assume all acid–alkali reactions are 1:1",
  "invert-coefficients": "Multiply known moles by known/unknown coefficients",
  "multiply-named-solute-M":
    "Multiply molar concentration by the named unknown solute M",
  "divide-by-M": "Divide molar concentration by molar mass",
  "use-water-M": "Use water molar mass for the unknown solute",
  "required-moles-over-titrant-c":
    "Divide required titrant moles by titrant concentration",
  "multiply-by-c": "Multiply required titrant moles by concentration",
  "same-volume-always": "Assume both reacting solution volumes are equal",
};
const headings: Record<TitrationMode, string> = {
  titre: "Subtract the readings",
  concentration: "Track the named solution",
  ratio: "Apply the reaction factor",
  mass: "Change the concentration unit",
  volume: "Find the required delivery",
};
const fields: Record<TitrationMode, readonly [string, string, string][]> = {
  titre: [
    ["titre", "Your delivered volume", "cm³"],
    ["knownMoles", "Your NaOH amount", "mol"],
  ],
  concentration: [
    ["knownMoles", "Your known amount", "mol"],
    ["concentration", "Your unknown concentration", "mol/dm³"],
  ],
  ratio: [
    ["unknownMoles", "Your unknown amount", "mol"],
    ["concentration", "Your unknown concentration", "mol/dm³"],
  ],
  mass: [
    ["concentration", "Your molar concentration", "mol/dm³"],
    ["massConcentration", "Your mass concentration", "g/dm³"],
  ],
  volume: [
    ["titrantMoles", "Your required titrant amount", "mol"],
    ["volume", "Your required titrant volume", "cm³"],
  ],
};
const display = (v: string | number) =>
  Number.isFinite(Number(v))
    ? String(Number(Number(v).toPrecision(6)))
    : String(v);
export function TitrationWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: TitrationMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialTitrationBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    key = String(b.record),
    records = titrationRecords[mode] as Record<string, { label: string }>;
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
    onChange([...history, { ...b, [field]: value }]);
  }
  const select = (field: string, label: string, unit = "") => (
    <label key={field}>
      {label}
      {unit ? ` / ${unit}` : ""}
      <select
        aria-label={label}
        value={b[field]}
        onChange={(e) => change(field, e.target.value)}
      >
        {titrationChoices[mode][field].map((v) => (
          <option key={v} value={v}>
            {v === "unset"
              ? "Predict"
              : field === "record"
                ? records[v].label
                : (relationships[v] ?? v)}
          </option>
        ))}
      </select>
    </label>
  );
  let equation = "",
    known = "",
    unknown = "",
    knownC = 0,
    knownV = 0,
    sample = 0,
    knownCoefficient = 1,
    unknownCoefficient = 1,
    M = 0;
  if (mode === "concentration" || mode === "ratio" || mode === "mass") {
    const r = (
      titrationRecords[mode] as Record<
        string,
        {
          equation: string;
          known: string;
          unknown: string;
          c: number;
          v: number;
          sample: number;
          k: number;
          u: number;
          M?: number;
        }
      >
    )[key];
    equation = r.equation;
    known = r.known;
    unknown = r.unknown;
    knownC = r.c;
    knownV = r.v;
    sample = r.sample;
    knownCoefficient = r.k;
    unknownCoefficient = r.u;
    M = r.M ?? 0;
  }
  if (mode === "volume") {
    const r =
      titrationRecords.volume[key as keyof typeof titrationRecords.volume];
    equation = r.equation;
    known = r.sample;
    unknown = r.titrant;
    knownC = r.c;
    knownV = r.v;
    knownCoefficient = r.k;
    unknownCoefficient = r.u;
  }
  const named =
    mode === "volume" ? `Required ${unknown}` : `Original ${unknown}`;
  function check() {
    const result = titrationPrediction(mode, b);
    setCorrect(result.correct);
    if (!result.complete) {
      setFeedback(
        "Complete both predictions and choose a relationship before checking.",
      );
      return;
    }
    if (!result.correct) {
      setFeedback(
        mode === "titre"
          ? "Not yet. The delivered volume is final minus initial; convert that difference to dm³ before multiplying by NaOH concentration."
          : mode === "ratio"
            ? `Not yet. ${equation}. Apply unknown coefficient ${unknownCoefficient} divided by known coefficient ${knownCoefficient}, then use the original ${unknown} sample volume.`
            : mode === "mass"
              ? `Not yet. First calculate original ${unknown} molar concentration using its reacting amount and sample volume; multiply by ${unknown} M=${M} g/mol.`
              : mode === "volume"
                ? `Not yet. Find the ${unknown} amount required by ${equation}, then divide by its own titrant concentration and convert dm³ to cm³.`
                : `Not yet. Known ${known} amount is cV with V in dm³. Use the equation ratio, then divide ${unknown} moles by the original ${unknown} sample volume.`,
      );
      return;
    }
    const expected = titrationExpected(mode, b);
    setFeedback(
      `That's right. ${fields[mode].map(([field, label, unit]) => `${label.replace("Your ", "")} = ${display(expected[field])} ${unit}`).join("; ")}. ${relationships[expected.reason]}.`,
    );
  }
  return (
    <section
      className="model task-workbench titration-workbench"
      aria-label="Task model"
    >
      <h3>{headings[mode]}</h3>
      <div className="titration-fields">
        {fields[mode].map(([field, label, unit]) => select(field, label, unit))}
      </div>
      {select("record", "Explore a reacting record")}
      <p className="titration-record">{records[key].label}.</p>
      <p className="position-caption">
        The answer task uses its stated initial record. Changing this model
        explores another set of reacting data.
      </p>
      {equation && (
        <p className="formula-callout">
          Balanced equation: <strong>{equation}</strong>
        </p>
      )}
      {select("reason", "Your relationship")}
      {b.reason !== "unset" && (
        <p>Your selected relationship: {relationships[String(b.reason)]}.</p>
      )}
      {equation && (
        <figure className="titration-ledger">
          <figcaption>
            Keep substance, amount and solution volume together
          </figcaption>
          <table>
            <thead>
              <tr>
                <th>Quantity</th>
                <th>Given or predicted value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Known {known} concentration</th>
                <td>{display(knownC)} mol/dm³</td>
              </tr>
              <tr>
                <th>Reacting {known} volume</th>
                <td>
                  {display(knownV)} cm³ = {display(knownV / 1000)} dm³
                </td>
              </tr>
              <tr>
                <th>Unknown:known mole ratio</th>
                <td>
                  {unknownCoefficient}:{knownCoefficient}
                </td>
              </tr>
              {sample > 0 && (
                <tr>
                  <th>Original {unknown} sample</th>
                  <td>
                    {display(sample)} cm³ = {display(sample / 1000)} dm³
                  </td>
                </tr>
              )}
              {mode === "mass" && (
                <tr>
                  <th>{unknown} molar mass</th>
                  <td>{M} g/mol</td>
                </tr>
              )}
              {mode === "volume" && (
                <tr>
                  <th>{unknown} titrant concentration</th>
                  <td>
                    {
                      titrationRecords.volume[
                        key as keyof typeof titrationRecords.volume
                      ].titrantC
                    }{" "}
                    mol/dm³
                  </td>
                </tr>
              )}
              {fields[mode].map(([field, label, unit]) => (
                <tr key={field}>
                  <th>
                    {field === "knownMoles" ? `Known ${known}` : named}:{" "}
                    {label.replace("Your ", "")}
                  </th>
                  <td>
                    {b[field] === "unset"
                      ? "Not entered"
                      : `${String(b[field])} ${unit}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
      {mode === "titre" && (
        <TitrationBurette3D
          initial={
            titrationRecords.titre[key as keyof typeof titrationRecords.titre]
              .initial
          }
          final={
            titrationRecords.titre[key as keyof typeof titrationRecords.titre]
              .final
          }
        />
      )}
      <div className="bench-actions">
        <button className="button primary" onClick={check}>
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback("");
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([]);
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
        <p>{instruction}</p>
        <p>
          Supplied reacting volumes represent a suitable endpoint estimate for
          the given complete reaction. A measured endpoint is an experimental
          estimate of stoichiometric equivalence. Reading precision, concordance
          and supervised technique require the separate practical lesson.
          Display rounds to six significant digits; calculations retain full
          intermediate precision.
        </p>
      </details>
    </section>
  );
}
