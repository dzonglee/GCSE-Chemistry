"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { initialBoard, checkBoard } from "@/lib/workbench";
import { ionicCompounds, ionicLedger, transferCells } from "@/lib/ionic";
import { IonDotCross } from "./IonDotCross";
export function IonicTransferWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "ionic-transfer" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialBoard(model),
    spec = ionicCompounds[model.compound],
    ledger = ionicLedger(model.compound, b),
    [feedback, setFeedback] = useState<ReturnType<typeof checkBoard> | null>(
      null,
    );
  const change = (key: string, amount: number) => {
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback:
          "Undo or reset to continue. Your saved transfers are retained.",
      });
      return;
    }
    onChange([...history, { ...b, [key]: Number(b[key]) + amount }]);
    setFeedback(null);
  };
  return (
    <section
      className="model task-workbench ionic-transfer"
      aria-label="Task model"
    >
      <strong>{model.instruction}</strong>
      <div className="ionic-transfer-controls">
        {transferCells(model.compound).map((c) => (
          <div className="ionic-transfer-row" key={c.key}>
            <span>
              {spec.metal.symbol}
              {spec.donors > 1 ? ` ${c.donor + 1}` : ""} →{" "}
              {spec.nonmetal.symbol}
              {spec.acceptors > 1 ? ` ${c.acceptor + 1}` : ""}
            </span>
            <div className="counter-steps">
              <button
                aria-label={`Return electron from ${spec.nonmetal.name.toLowerCase()} ${c.acceptor + 1} to ${spec.metal.name.toLowerCase()} ${c.donor + 1}`}
                disabled={Number(b[c.key]) === 0}
                onClick={() => change(c.key, -1)}
              >
                −
              </button>
              <output
                aria-label={`Transferred electrons from donor ${c.donor + 1} to acceptor ${c.acceptor + 1}`}
              >
                {b[c.key]}
              </output>
              <button
                aria-label={`Transfer electron from ${spec.metal.name.toLowerCase()} ${c.donor + 1} to ${spec.nonmetal.name.toLowerCase()} ${c.acceptor + 1}`}
                disabled={ledger.lost[c.donor] >= spec.metal.outer}
                onClick={() => change(c.key, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => setFeedback(checkBoard(model, b))}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback(null);
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([initialBoard(model)]);
            setFeedback(null);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={`feedback ${feedback.correct ? "correct" : ""}`}
        >
          {feedback.feedback}
        </p>
      )}
      <p className="ionic-origin-legend">
        <strong>×</strong> = from metal atoms · <strong>•</strong> = from
        non-metal atoms. Electron transfer forms ions; attraction between
        opposite charges is the ionic bond.
      </p>
      <div className="ionic-ion-cards">
        {ledger.donors.map((p) => (
          <div key={`d${p.index}`}>
            <h3>
              {spec.metal.name} {p.charge > 0 ? "ion" : "atom"} {p.index + 1}
            </h3>
            <IonDotCross
              symbol={p.symbol}
              charge={p.charge}
              dots={0}
              crosses={spec.metal.outer - ledger.lost[p.index]}
              shellsOmitted={
                p.charge > 0 && ledger.lost[p.index] === spec.metal.outer
              }
            />
            <p>
              {p.protons} protons; {p.electrons} electrons
              <br />
              Arrangement: <strong>{p.shells.join(",")}</strong>
            </p>
          </div>
        ))}
        {ledger.acceptors.map((p) => (
          <div key={`a${p.index}`}>
            <h3>
              {p.charge < 0
                ? p.symbol === "Cl"
                  ? "Chloride ion"
                  : "Oxide ion"
                : spec.nonmetal.name + " atom"}{" "}
              {p.index + 1}
            </h3>
            <IonDotCross
              symbol={p.symbol}
              charge={p.charge}
              dots={p.dots}
              crosses={p.crosses}
            />
            <p>
              {p.protons} protons; {p.electrons} electrons
              <br />
              Arrangement: <strong>{p.shells.join(",")}</strong>
            </p>
          </div>
        ))}
      </div>
      <div
        className="ionic-conservation"
        data-total-electrons={ledger.totalElectrons}
        data-total-protons={ledger.totalProtons}
        data-total-charge={ledger.charge}
      >
        <strong>Conservation across all shown particles</strong>
        <p>
          {ledger.totalProtons} protons unchanged · {ledger.totalElectrons}{" "}
          electrons retained · total charge {ledger.charge}
        </p>
      </div>
      <p className="model-caption">
        Whole-particle counts include the inner electrons omitted from these
        outer-shell diagrams.
      </p>
      <details>
        <summary>What does this diagram leave out?</summary>
        <p>
          These transfer diagrams show the tracked outer electrons. Fully formed
          metal-ion shells are omitted, with full electron arrangements given
          separately. After a metal loses an outer shell’s electrons, its
          previous inner shell becomes the outer occupied shell. Real ionic
          solids contain giant repeating lattices, not isolated molecules of
          these drawn ions. Dots and crosses are tracking symbols; all electrons
          are the same kind of particle. Shell circles are schematic, not paths
          or atomic scale. This is a reasoning model, not an experimental
          procedure.
        </p>
      </details>
    </section>
  );
}
