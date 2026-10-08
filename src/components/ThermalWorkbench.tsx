"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import {
  initialThermalBoard,
  thermalBoardCheck,
  thermalRecords,
  validThermalBoard,
} from "../lib/thermal-board";
import type { ThermalBoard } from "../lib/thermal-board";
import {
  additiveEvidence,
  energySamples,
  thermalProfiles,
  thermalComparisons,
  thresholdSamples,
} from "../lib/temperature-catalysts";
import type { ThermalMode } from "../lib/temperature-catalysts";
import { CatalysedProfile, EncounterEnergies } from "./ThermalDiagrams";
const modes: Record<ThermalMode, string> = {
  heating: "Warm the same sample",
  threshold: "Change the pathway",
  profile: "Construct the catalysed profile",
  identification: "Identify the catalyst evidence",
  comparison: "Compare measured means",
  evidence: "Repair the explanation",
};
const claimOptions = [
  ["barrier", "A different pathway lowers the barrier"],
  ["energy", "Heating raises particle energies"],
  ["time", "Speed changes; final available amount stays fixed"],
  ["regenerated", "A catalyst is regenerated overall"],
  ["specific", "Enzymes need suitable substrates and conditions"],
  ["noUniversalFactor", "No universal exact rate multiplier"],
];
const reasonOptions = [
  ["pathway", "Alternative pathway at unchanged temperature"],
  ["temperature", "Same pathway at a higher temperature"],
  ["amount", "Same fixed reactant amounts and complete reaction"],
  ["overall", "Participation is possible; no overall consumption"],
  ["conditions", "Biological catalysts are specific and condition-sensitive"],
  ["measurements", "An exact multiplier needs relevant measured evidence"],
];
type SavedBoard = Record<string, string | number>;
export function ThermalWorkbench({
  mode,
  history,
  onChange,
  record: originalRecord = "initial",
  instruction,
}: {
  mode: ThermalMode;
  history: SavedBoard[];
  onChange: (history: SavedBoard[]) => void;
  record?: string;
  instruction?: string;
}) {
  const unique = useId();
  const value = (history.at(-1) ??
    initialThermalBoard(mode, originalRecord)) as ThermalBoard;
  const onUpdate = (next: ThermalBoard) => {
    if (
      history.length < 500 &&
      Object.keys(next).some((k) => next[k] !== value[k])
    )
      onChange([...history, next]);
  };
  const [raw, setRaw] = useWorkbenchInputDraft<ThermalBoard | null>(null),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null);
  const b = raw ?? value,
    record = b.record;
  const update = (key: string, v: string) => {
    const next = { ...b, [key]: v };
    setFeedback(null);
    if (validThermalBoard(mode, next)) {
      setRaw(null);
      onUpdate(next);
    } else setRaw(next);
  };
  const select = (
    key: string,
    label: string,
    choices: readonly (readonly string[])[],
  ) => (
    <div key={key}>
      <label htmlFor={unique + "-" + key}>{label}</label>
      <select
        id={unique + "-" + key}
        value={b[key]}
        onChange={(e) => update(key, e.target.value)}
      >
        {!["state", "pathway"].includes(key) && (
          <option value="">Choose a prediction</option>
        )}
        {choices.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
      {(choices.find(([v]) => v === b[key])?.[1]?.length ?? 0) > 20 && (
        <p className="thermal-selection">
          Selected: {choices.find(([v]) => v === b[key])?.[1]}
        </p>
      )}
    </div>
  );
  const numeric = (key: string, label: string) => (
    <div key={key}>
      <label htmlFor={unique + "-" + key}>{label}</label>
      <input
        id={unique + "-" + key}
        type="text"
        inputMode={key === "change" ? "text" : "decimal"}
        value={b[key]}
        onChange={(e) => update(key, e.target.value)}
      />
    </div>
  );
  let visual: React.ReactNode = null,
    controls: React.ReactNode = null,
    predictions: React.ReactNode = null;
  if (mode === "heating") {
    const r = energySamples[record as keyof typeof energySamples];
    controls = select("state", "Supplied thermal snapshot", [
      ["cool", "Cooler"],
      ["warm", "Warmer"],
    ]);
    visual = (
      <EncounterEnergies
        energies={b.state === "warm" ? r.warm : r.cool}
        minimum={r.barrier}
        caption={
          b.state === "warm"
            ? "Warmer supplied snapshot"
            : "Cooler supplied snapshot"
        }
      />
    );
    predictions = (
      <>
        {numeric("adequate", "Your encounters meeting the minimum")}
        {numeric("total", "Your total encounter count")}
        {select(
          "average",
          "Average particle energy compared with cooler state",
          [
            ["higher", "Higher"],
            ["same", "Unchanged"],
            ["lower", "Lower"],
          ],
        )}
        {select("frequency", "Expected collision frequency on heating", [
          ["higher", "Higher"],
          ["same", "Unchanged"],
          ["lower", "Lower"],
        ])}
        {select("barrier", "Activation energy of the unchanged pathway", [
          ["same", "Unchanged"],
          ["lower", "Lower"],
          ["higher", "Higher"],
        ])}
      </>
    );
  }
  if (mode === "threshold") {
    const r = thresholdSamples[record as keyof typeof thresholdSamples];
    controls = select("pathway", "Reaction pathway at fixed temperature", [
      ["original", "Original"],
      ["catalysed", "Catalysed"],
    ]);
    visual = (
      <EncounterEnergies
        energies={r.energies}
        minimum={b.pathway === "catalysed" ? r.catalysed : r.original}
        caption="Same encounter energies at unchanged temperature"
      />
    );
    predictions = (
      <>
        {numeric("adequate", "Your encounters meeting this minimum")}
        {numeric("total", "Your total encounter count")}
        {select("average", "Average particle energy when catalyst is added", [
          ["same", "Unchanged"],
          ["higher", "Higher"],
          ["lower", "Lower"],
        ])}
        {select("barrier", "Activation energy of catalysed pathway", [
          ["lower", "Lower"],
          ["same", "Unchanged"],
          ["higher", "Higher"],
        ])}
      </>
    );
  }
  if (mode === "profile") {
    const r = thermalProfiles[record as keyof typeof thermalProfiles];
    controls = numeric("peak", "Proposed catalysed peak / kJ");
    visual = (
      <CatalysedProfile
        reactant={r.reactant}
        product={r.product}
        original={r.original}
        peak={
          /^(?:0|[1-9]\d{0,5})(?:\.\d{1,10})?$/.test(b.peak) &&
          Number(b.peak) <= 100000
            ? Number(b.peak)
            : Number(value.peak)
        }
      />
    );
    predictions = (
      <>
        {numeric("activation", "Your forward activation energy / kJ")}
        {numeric("change", "Your signed overall energy change / kJ")}
        {select("endpoints", "Reactant and product energy levels", [
          ["same", "Unchanged"],
          ["changed", "Changed"],
        ])}
      </>
    );
  }
  if (mode === "identification") {
    const r = additiveEvidence[record as keyof typeof additiveEvidence];
    visual = (
      <>
        {record === "initial" && (
          <figure>
            <p className="thermal-equation">
              <span>
                2 H<sub>2</sub>O<sub>2</sub>
              </span>
              <span className="thermal-reaction-arrow">
                <small>X</small>
                <span aria-hidden="true">→</span>
              </span>
              <span>
                2 H<sub>2</sub>O + O<sub>2</sub>
              </span>
            </p>
            <figcaption>
              Overall reaction: hydrogen peroxide → water + oxygen. X is
              supplied as a catalyst above the arrow, not as a consumed reactant
              or overall product. Read this together with the rate and recovery
              evidence.
            </figcaption>
          </figure>
        )}
        <dl>
          <dt>Rate increase observed</dt>
          <dd>{r.faster ? "Yes" : "No"}</dd>
          <dt>Matched other conditions</dt>
          <dd>{r.controlled ? "Yes" : "No"}</dd>
          <dt>Same recovered chemical identity</dt>
          <dd>
            {r.sameIdentity === null
              ? "Not checked"
              : r.sameIdentity
                ? "Yes"
                : "No"}
          </dd>
          <dt>Recovered dry mass</dt>
          <dd>
            {r.before.toFixed(2)} g before; {r.after.toFixed(2)} g after
          </dd>
          <dt>Same products</dt>
          <dd>{r.sameProducts ? "Yes" : "No"}</dd>
        </dl>
      </>
    );
    controls = select("classification", "Your classification", [
      ["supports", "Supports catalyst identification"],
      ["reactant", "Material consumed as a reactant"],
      ["insufficient", "Insufficient catalyst evidence"],
    ]);
    predictions = select("reason", "Your supporting observation", [
      [
        "rateIdentityControls",
        "Faster matched reaction; same material regenerated",
      ],
      ["consumed", "Material consumed and chemically changed"],
      ["massAlone", "Chemical identity not checked"],
      ["confounded", "Temperature also changed"],
      ["noRateChange", "No measurable rate increase"],
    ]);
  }
  if (mode === "comparison") {
    const r = thermalComparisons[record as keyof typeof thermalComparisons];
    visual = (
      <table>
        <caption>Supplied measured results</caption>
        <thead>
          <tr>
            <th>Trial</th>
            <th>Amount</th>
            <th>Time / s</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>A</th>
            <td>
              {r.amountA} {r.unit === "g/s" ? "g" : "cm³"}
            </td>
            <td>{r.timeA}</td>
          </tr>
          <tr>
            <th>B</th>
            <td>
              {r.amountB} {r.unit === "g/s" ? "g" : "cm³"}
            </td>
            <td>{r.timeB}</td>
          </tr>
        </tbody>
      </table>
    );
    controls = (
      <>
        {numeric("rateA", `Your trial A mean rate / ${r.unit}`)}
        {numeric("rateB", `Your trial B mean rate / ${r.unit}`)}
      </>
    );
    predictions = (
      <>
        {select("greater", "Your greater measured mean rate", [
          ["A", "Trial A"],
          ["B", "Trial B"],
          ["equal", "Equal"],
        ])}
        {select(
          "final",
          "Final amount of product in stated complete reactions",
          [
            ["same", "Same"],
            ["greater", "Greater in B"],
            ["lower", "Lower in B"],
          ],
        )}
      </>
    );
  }
  if (mode === "evidence")
    controls = (
      <>
        {select("claim", "Your supported claim", claimOptions)}
        {select("reason", "Your supporting reason", reasonOptions)}
      </>
    );
  return (
    <section
      className="model task-workbench thermal-workbench"
      aria-label="Task model"
    >
      <h3 className={mode === "heating" ? "sr-only" : undefined}>
        {modes[mode]}
      </h3>
      {mode === "heating" && <div className="thermal-fields">{controls}</div>}
      <p>
        {
          (thermalRecords[mode] as Record<string, { label: string }>)[record]
            ?.label
        }
      </p>
      {instruction && record === originalRecord && <p>{instruction}</p>}
      {record !== originalRecord && (
        <p role="status">
          You are exploring another comparison. Use Check model for it. Reset
          model returns to the lesson question.
        </p>
      )}
      {mode !== "heating" && <div className="thermal-fields">{controls}</div>}
      {history.length >= 500 && (
        <p role="status">
          The saved history is full. Undo or reset the model before making
          another saved change.
        </p>
      )}
      {raw && (
        <p role="status">
          This unfinished entry is visible but is not saved. Enter a plain
          number, undo it, or reset the model.
        </p>
      )}
      {visual}
      <div className="thermal-fields">{predictions}</div>
      <div className="thermal-actions">
        <button
          type="button"
          className="button"
          onClick={() => setFeedback(thermalBoardCheck(mode, b))}
        >
          Check model
        </button>
        <button
          type="button"
          className="button"
          disabled={!raw && history.length < 2}
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
          className="button"
          onClick={() => {
            setRaw(null);
            setFeedback(null);
            onChange([initialThermalBoard(mode, originalRecord)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={feedback.correct ? "feedback correct" : "feedback retry"}
        >
          {feedback.message}
        </p>
      )}
      <details>
        <summary>Change the supplied teaching case</summary>
        <label htmlFor={unique + "-record"}>Supplied comparison</label>
        <select
          id={unique + "-record"}
          value={record}
          onChange={(e) => {
            setRaw(null);
            setFeedback(null);
            onUpdate(initialThermalBoard(mode, e.target.value));
          }}
        >
          {Object.keys(thermalRecords[mode]).map((id) => (
            <option key={id} value={id}>
              {id === "initial"
                ? "Starting comparison"
                : id
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (x) => x.toUpperCase())}
            </option>
          ))}
        </select>
      </details>
      <details>
        <summary>About this model</summary>
        <p>
          Illustrative constructed teaching cases. Encounter energies use stated
          illustrative units; profiles use kJ for the stated reaction amount.
          This is not a measured energy distribution, physical reaction path or
          exact rate law. Chemical explanations and measured data are needed
          alongside it.
        </p>
      </details>
    </section>
  );
}
