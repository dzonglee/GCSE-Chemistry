"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { checkBoard, initialBoard } from "@/lib/workbench";
import { covalentMolecules, covalentLedger } from "@/lib/covalent";
import { CovalentDiagram } from "./CovalentDiagram";
import { CovalentScene3D } from "./CovalentScene3D";
export function CovalentWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "covalent-share" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model),
    spec = covalentMolecules[model.molecule],
    ledger = covalentLedger(model.molecule, board);
  const [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [asset, setAsset] = useState(false);
  const change = (key: string, delta: number) => {
    if (history.length >= 500) {
      setCorrect(false);
      setFeedback(
        "Saved-step limit reached. Undo or reset this electron model to continue.",
      );
      return;
    }
    setFeedback("");
    setCorrect(false);
    setAsset(false);
    onChange([...history, { ...board, [key]: Number(board[key]) + delta }]);
  };
  return (
    <section
      className="model task-workbench covalent-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <div className="covalent-controls">
        {spec.partners.map((atom, i) => (
          <div key={i} className="covalent-bond-controls">
            <strong>
              Bond region {i + 1}: {spec.centre.symbol} and {atom.symbol}
            </strong>
            {(["centre", "partner"] as const).map((side) => {
              const key = `${side}${i}`,
                symbol = side === "centre" ? spec.centre.symbol : atom.symbol,
                remaining =
                  side === "centre"
                    ? ledger.centreRemaining
                    : ledger.partnerRemaining[i];
              return (
                <div key={key} className="covalent-electron-row">
                  <span>
                    {symbol} {side === "centre" ? "dots" : "crosses"}
                  </span>
                  <div className="stepper">
                    <button
                      className="button"
                      aria-label={`Return one ${side} ${symbol} electron from bond ${i + 1}`}
                      disabled={Number(board[key]) === 0}
                      onClick={() => change(key, -1)}
                    >
                      −
                    </button>
                    <strong>{board[key]}</strong>
                    <button
                      className="button"
                      aria-label={`Move one ${side} ${symbol} electron into bond ${i + 1}`}
                      disabled={remaining === 0 || Number(board[key]) === 3}
                      onClick={() => change(key, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = checkBoard(model, board);
            setCorrect(result.correct);
            setFeedback(result.feedback);
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            setFeedback("");
            setAsset(false);
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFeedback("");
            setAsset(false);
            onChange([initialBoard(model)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p className={`feedback ${correct ? "correct" : ""}`} role="status">
          {feedback}
        </p>
      )}
      <CovalentDiagram
        molecule={model.molecule}
        own={ledger.own}
        other={ledger.other}
        unshared={ledger.centreRemaining}
        partnerUnshared={ledger.partnerRemaining}
      />
      <div
        className="covalent-inventory"
        data-total-electrons={ledger.displayedTotal}
      >
        <strong>
          Whole-molecule outer-electron inventory: {ledger.displayedTotal} of{" "}
          {ledger.total}
        </strong>
        <p>
          Each electron appears once in this inventory. Shared electrons count
          around BOTH bonded atoms when checking their filled outer shells.
        </p>
      </div>
      <table className="particle-facts">
        <caption>Electrons around each selected atom</caption>
        <thead>
          <tr>
            <th scope="col">Atom</th>
            <th scope="col">Unshared</th>
            <th scope="col">Around it, including shared</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Reference {spec.centre.symbol}</th>
            <td>{ledger.centreRemaining}</td>
            <td>{ledger.centreAround}</td>
          </tr>
          {spec.partners.map((atom, i) => (
            <tr key={i}>
              <th scope="row">
                Partner {atom.symbol} {i + 1}
              </th>
              <td>{ledger.partnerRemaining[i]}</td>
              <td>{ledger.partnerAround[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ledger.correct && (
        <button className="text-button" onClick={() => setAsset(!asset)}>
          {asset ? "Hide 3D molecule" : "Inspect 3D molecule"}
        </button>
      )}
      {asset && ledger.correct && <CovalentScene3D molecule={model.molecule} />}
      <details>
        <summary>What does this electron model leave out?</summary>
        <p>
          Only outer electrons are shown. Dots/crosses identify origins, not
          different kinds of electron. The circles, overlaps and marker
          positions are schematic; they are not paths, measured angles or a
          universal model of every compound. Hydrogen fills with two electrons;
          the other selected atoms fill with eight. Covalent sharing does not
          mean every bond shares electrons equally, and it does not turn these
          neutral molecules into the ions of an ionic transfer model.
          Dot-and-cross drawings omit a molecule’s 3D shape.
        </p>
      </details>
    </section>
  );
}
