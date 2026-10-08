"use client";
import { useId, useState } from "react";
import {
  checkIon,
  initialIon,
  ionChoices,
  ionFieldLabels,
  ionFields,
  ionLabels,
  ionLedger,
  ionRecord,
  validIonHistory,
  type IonBoard,
  type IonMode,
} from "@/lib/ion-tests";
import { IonPortions3D } from "./IonPortions3D";
const flameColours: Record<string, string> = {
  crimson: "#bd2440",
  yellowFlame: "#f6d343",
  lilac: "#a88bdd",
  orangeRed: "#e46c36",
  greenFlame: "#27875b",
};
export function IonTestsWorkbench({
  mode,
  record,
  history: retained,
  onChange,
}: {
  mode: IonMode;
  record: string;
  history?: IonBoard[];
  onChange?: (h: IonBoard[]) => void;
}) {
  const uid = useId(),
    [local, setLocal] = useState<IonBoard[]>(() => [initialIon(mode, record)]),
    [checked, setChecked] = useState<ReturnType<typeof checkIon> | null>(null),
    [stage, setStage] = useState(0),
    [show2D, setShow2D] = useState(false),
    [unavailable, setUnavailable] = useState(false),
    [notice, setNotice] = useState("");
  const history = retained ?? local;
  if (!validIonHistory(mode, record, history))
    return (
      <section className="ion-tests-workbench" aria-label="Task model">
        <p role="alert">
          The retained model history cannot be read. Its original values are
          preserved; use the task’s explicit new-model action to replace only
          this model.
        </p>
      </section>
    );
  const b = history[history.length - 1],
    r = ionRecord(mode, record)!,
    rows = r.observations ?? [];
  function change(next: IonBoard[]) {
    if (onChange) onChange(next);
    else setLocal(next);
    setChecked(null);
    setNotice("");
  }
  const ledger = mode === "equation" ? ionLedger(b) : null;
  return (
    <section
      className="ion-tests-workbench"
      aria-label="Task model"
      data-ion-mode={mode}
      data-ion-record={record}
    >
      <div className="ion-original">
        <h3>Original evidence</h3>
        <p>{r.given}</p>
        {mode === "hydroxide" ? (
          <>
            <div
              className="ion-actions"
              role="group"
              aria-label="Read the recorded stages"
            >
              {rows.map((row, i) => (
                <button
                  type="button"
                  key={row.label}
                  aria-pressed={i === stage}
                  onClick={() => setStage(i)}
                >
                  {i + 1}. {row.label}
                </button>
              ))}
            </div>
            <p className="ion-recorded">
              <strong>{rows[stage]?.label}: </strong>
              {rows[stage]?.text}
            </p>
            <p className="ion-small">
              These are recorded observations, not a new experiment. Your
              proposal does not change them.
            </p>
          </>
        ) : rows.length > 0 ? (
          <dl>
            {rows.map((row, i) => (
              <div key={i}>
                <dt>{row.label}</dt>
                <dd>
                  {mode === "flame" && (
                    <span
                      className="ion-swatch"
                      aria-hidden="true"
                      style={{
                        background: flameColours[r.expected.observation],
                      }}
                    />
                  )}
                  {row.text}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      {mode === "equation" && r.metal && (
        <p className="ion-equation" aria-label="Fixed ionic species">
          {b.metal || "__"} {r.metal.symbol}
          <sup>{r.metal.charge}+</sup>(aq) + {b.hydroxide || "__"} OH
          <sup>−</sup>(aq) → {b.product || "__"} {r.metal.symbol}(OH)
          <sub>{r.metal.charge}</sub>(s)
        </p>
      )}
      <div className={`ion-fields ${mode === "anion" ? "ion-chain" : ""}`}>
        {ionFields[mode].map((field, i) => (
          <label key={field} htmlFor={`${uid}-${field}`}>
            <span id={`${uid}-${field}-label`}>
              {mode === "anion" ? (
                <span className="ion-step" aria-hidden="true">
                  {i + 1}
                </span>
              ) : null}
              {ionFieldLabels[field]}
            </span>
            <select
              id={`${uid}-${field}`}
              data-field={field}
              aria-labelledby={`${uid}-${field}-label`}
              aria-describedby={b[field] ? `${uid}-${field}-choice` : undefined}
              value={b[field]}
              onChange={(event) => {
                if (history.length >= 500) {
                  setNotice(
                    "This edit history is full. Clear this proposal explicitly to begin a new one.",
                  );
                  return;
                }
                if (event.target.value !== b[field])
                  change([...history, { ...b, [field]: event.target.value }]);
              }}
            >
              <option value="">Choose your answer</option>
              {ionChoices[field].map((value) => (
                <option key={value} value={value}>
                  {ionLabels[value] ?? value}
                </option>
              ))}
            </select>
            {b[field] && (
              <span className="ion-selected" id={`${uid}-${field}-choice`}>
                <strong>Your choice: </strong>
                {ionLabels[b[field]] ?? b[field]}
              </span>
            )}
          </label>
        ))}
      </div>
      {ledger && (
        <div className="ion-ledger" aria-label="Your atom and charge ledger">
          <table>
            <caption>Your retained equation counts</caption>
            <thead>
              <tr>
                <th scope="col">Quantity</th>
                <th scope="col">Left</th>
                <th scope="col">Right</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Metal", ledger.metalLeft, ledger.metalRight],
                ["Oxygen", ledger.oxygenLeft, ledger.oxygenRight],
                ["Hydrogen", ledger.hydrogenLeft, ledger.hydrogenRight],
                ["Net charge", ledger.chargeLeft, ledger.chargeRight],
              ].map(([label, left, right]) => (
                <tr key={String(label)}>
                  <th scope="row">{label}</th>
                  <td>{left ?? "Unknown"}</td>
                  <td>{right ?? "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            The fixed formulas stay unchanged. A zero coefficient omits a
            species; a balanced multiple still needs the smallest requested
            ratio.
          </p>
        </div>
      )}
      <div className="ion-actions">
        <button type="button" onClick={() => setChecked(checkIon(mode, b))}>
          Check proposal
        </button>
        <button
          type="button"
          disabled={history.length < 2}
          onClick={() => change(history.slice(0, -1))}
        >
          Undo
        </button>
        <button
          type="button"
          disabled={ionFields[mode].every((f) => b[f] === "")}
          onClick={() => change([initialIon(mode, record)])}
        >
          Clear proposal
        </button>
      </div>
      {notice && <p role="status">{notice}</p>}
      {checked && (
        <p
          className={`ion-feedback ${checked.correct ? "ion-correct" : "ion-reconsider"}`}
          role="status"
        >
          {checked.message}
        </p>
      )}
      {mode === "anion" && (
        <>
          <IonPortions3D board={b} onUnavailable={setUnavailable} />
          <button
            type="button"
            className="ion-toggle"
            disabled={unavailable}
            aria-expanded={show2D || unavailable}
            onClick={() => setShow2D((v) => !v)}
          >
            {unavailable
              ? "2D portions are open"
              : show2D
                ? "Close 2D portions"
                : "Inspect the 2D portions"}
          </button>
          {(show2D || unavailable) && (
            <div
              className="ion-portions-2d"
              aria-label="Your retained sample-portion proposal"
            >
              {[
                "Fresh separate portion",
                "Already treated portion",
                "Reserved original portion",
              ].map((label, i) => (
                <div
                  key={label}
                  className={
                    (b.portion === "fresh" && i === 0) ||
                    (b.portion === "reused" && i === 1)
                      ? "ion-portion-selected"
                      : ""
                  }
                >
                  <span className="ion-tube" aria-hidden="true" />
                  <strong>{label}</strong>
                  {((b.portion === "fresh" && i === 0) ||
                    (b.portion === "reused" && i === 1)) && (
                    <p>Your selected portion</p>
                  )}
                </div>
              ))}
              <p>
                First reagent: {ionLabels[b.acid] ?? "not chosen"}. Then:{" "}
                {ionLabels[b.reagent] ?? "not chosen"}. No chemical outcome is
                simulated.
              </p>
            </div>
          )}
        </>
      )}
      <p className="ion-small">
        Your proposal is separate from the original evidence. A recorded
        observation stays unchanged when you edit your answer.
      </p>
    </section>
  );
}
