"use client";
import { useId, useState } from "react";
import type { GasMode } from "@/lib/gas-tests-cases";
import {
  checkGas,
  expectedGas,
  gasChoiceLabels,
  gasChoices,
  gasFields,
  gasRecord,
  gasTargets,
  initialGas,
  updateGas,
  validGasHistory,
  type GasBoard,
  type GasCheck,
  type GasFocus,
} from "@/lib/gas-tests-domain";
import { GasGiven } from "./GasGiven";
import { GasApparatus2D } from "./GasApparatus2D";
import { GasScene3D } from "./GasScene3D";
const labels: Record<string, string> = {
  material: "Proposed test material and starting condition",
  placement: "Proposed contact position",
  observation: "Observation actually recorded",
  gas: "Gas supported by the stated test",
  result: "Positive observation in this record",
  claim: "Extent of the conclusion",
  difference: "Decisive method difference",
  usefulRecord: "Record performing the specified identification test",
  limitation: "Limitation of the recorded method",
  correction: "Necessary method correction",
  ruledOut: "Does this record rule out the target gas?",
  conclusion: "Conclusion warranted by the evidence",
  focus: "What needs correcting?",
  replacement: "Proposed corrected wording",
};
export function GasTestsWorkbench({
  mode,
  record,
  focus = "all",
  history: retained,
  onChange,
}: {
  mode: GasMode;
  record: string;
  focus?: GasFocus;
  history?: GasBoard[];
  onChange?: (history: GasBoard[]) => void;
}) {
  const uid = useId(),
    [local, setLocal] = useState<GasBoard[]>(() => [initialGas(mode, record)]),
    [checked, setChecked] = useState<GasCheck | null>(null),
    [message, setMessage] = useState(""),
    [fallback, setFallback] = useState(false),
    [show2D, setShow2D] = useState(false),
    history = retained ?? local;
  if (!validGasHistory(mode, record, history))
    return (
      <section className="gas-tests-workbench" aria-label="Task model">
        <p role="alert">
          This retained model history cannot be read. Its original bytes are
          preserved. Use the task’s explicit new-model action to replace only
          this model.
        </p>
      </section>
    );
  const board = history[history.length - 1],
    targets = gasTargets(mode, focus),
    source = gasRecord(mode, record)!;
  function setHistory(next: GasBoard[]) {
    if (onChange) onChange(next);
    else setLocal(next);
    setChecked(null);
    setMessage("");
  }
  function change(field: string, value: string) {
    if (history.length >= 500) {
      setMessage(
        "This proposal has reached its edit-history limit. Clear this proposal explicitly to start a new one.",
      );
      return;
    }
    if (board[field] !== value)
      setHistory([...history, updateGas(mode, board, field, value)]);
  }
  const fields = targets.map((field) => (
    <label key={field} htmlFor={`${uid}-${field}`}>
      <span id={`${uid}-${field}-label`}>{labels[field]}</span>
      <select
        id={`${uid}-${field}`}
        data-field={field}
        aria-labelledby={`${uid}-${field}-label`}
        aria-describedby={board[field] ? `${uid}-${field}-choice` : undefined}
        value={board[field]}
        onChange={(event) => change(field, event.target.value)}
      >
        <option value="">Choose your answer</option>
        {gasChoices(mode, field, record).map((value) => (
          <option key={value} value={value}>
            {gasChoiceLabels[value] ?? value}
          </option>
        ))}
      </select>
      {board[field] && (
        <span className="gas-selected" id={`${uid}-${field}-choice`}>
          <strong>Your choice: </strong>
          {gasChoiceLabels[board[field]] ?? board[field]}
        </span>
      )}
    </label>
  ));
  return (
    <section
      className="gas-tests-workbench"
      aria-label="Task model"
      data-gas-mode={mode}
      data-gas-record={record}
    >
      <GasGiven key={`${mode}-${record}`} mode={mode} record={record} />
      {mode === "evidence" ? (
        <div
          className="gas-evidence-chain"
          role="group"
          aria-label="Your test–observation–conclusion chain"
        >
          {fields.map((field, index) => (
            <div className="gas-evidence-step" key={targets[index]}>
              <span className="gas-step-number">{index + 1}</span>
              {field}
            </div>
          ))}
        </div>
      ) : (
        <div className="gas-fields">{fields}</div>
      )}
      <div className="gas-model-actions">
        <button
          type="button"
          onClick={() => setChecked(checkGas(mode, board, focus))}
        >
          Check proposal
        </button>
        <button
          type="button"
          disabled={history.length < 2}
          onClick={() => setHistory(history.slice(0, -1))}
        >
          Undo
        </button>
        <button
          type="button"
          disabled={gasFields[mode].every((field) => board[field] === "")}
          onClick={() => setHistory([initialGas(mode, record)])}
        >
          Clear proposal
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      {checked && (
        <div
          className={`gas-feedback ${checked.correct ? "gas-correct" : "gas-reconsider"}`}
          role="status"
        >
          <p>{checked.message}</p>
          {checked.wrong.length > 0 && (
            <>
              <ul>
                {checked.wrong.map((field) => (
                  <li key={field}>
                    <strong>{labels[field]}: </strong>
                    {gasChoiceLabels[expectedGas(mode, record)[field]] ??
                      expectedGas(mode, record)[field]}
                  </li>
                ))}
              </ul>
              <p>{source.note}</p>
            </>
          )}
        </div>
      )}
      {mode === "procedure" && (
        <>
          {source.originalMaterial || source.originalPlacement ? (
            <details>
              <summary>Inspect the original supplied arrangement</summary>
              <GasApparatus2D
                original
                board={{
                  ...initialGas("procedure", record),
                  material: source.originalMaterial ?? "",
                  placement: source.originalPlacement ?? "",
                }}
              />
            </details>
          ) : null}
          <GasScene3D board={board} onUnavailable={setFallback} />
          <button
            type="button"
            className="gas-2d-toggle"
            aria-expanded={show2D || fallback}
            disabled={fallback}
            onClick={() => setShow2D((value) => !value)}
          >
            {fallback
              ? "2D apparatus is open"
              : show2D
                ? "Close 2D apparatus"
                : "Inspect the 2D apparatus"}
          </button>
          {(show2D || fallback) && <GasApparatus2D board={board} />}
        </>
      )}
      <p className="gas-caption">
        Your choices remain separate from the original experiment. Supplied
        observations do not change when you edit the proposal.
      </p>
    </section>
  );
}
