"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import { MolecularBoilingChart } from "./MolecularBoilingChart";
import { MolecularPhaseDiagram } from "./MolecularPhaseDiagram";
import {
  initialMolecularBoard,
  molecularPropertyPrediction,
  unbranchedAlkaneBoilingData,
  type MolecularPropertyMode,
  molecularLedger,
  type MolecularPhase,
} from "@/lib/molecular-properties";
export function MolecularPropertiesWorkbench({
  history,
  onChange,
  instruction,
  mode,
}: {
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
  instruction: string;
  mode: MolecularPropertyMode;
}) {
  const board = history.at(-1) ?? initialMolecularBoard(mode);
  const phase = board.phase as MolecularPhase;
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);
  const update = (key: string, value: string) => {
    if (board[key] === value) return;
    if (history.length >= 500) {
      setFeedback(
        "Undo or reset this model to continue: the saved-step limit has been reached.",
      );
      setCorrect(false);
      return;
    }
    setFeedback("");
    setCorrect(false);
    onChange([...history, { ...board, [key]: value }]);
  };
  const ledger = molecularLedger(phase);
  const check = () => {
    const result = molecularPropertyPrediction(mode, board);
    setFeedback(result.feedback);
    setCorrect(result.correct);
  };
  return (
    <section
      className="model task-workbench molecular-properties"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "trend" ? (
          <>
            <label>
              Butane attractions compared with ethane
              <select
                aria-label="Butane attractions compared with ethane"
                value={board.strength}
                onChange={(e) => update("strength", e.target.value)}
              >
                <option value="unset">Choose strength</option>
                <option value="stronger">Stronger</option>
                <option value="weaker">Weaker</option>
              </select>
            </label>
            <label>
              Energy needed to separate butane molecules
              <select
                aria-label="Energy needed to separate butane molecules"
                value={board.energy}
                onChange={(e) => update("energy", e.target.value)}
              >
                <option value="unset">Choose energy demand</option>
                <option value="more">More energy</option>
                <option value="less">Less energy</option>
              </select>
            </label>
          </>
        ) : mode === "boiling" ? (
          <label>
            Force overcome on boiling
            <select
              aria-label="Attraction overcome on boiling"
              value={board.force}
              onChange={(e) => update("force", e.target.value)}
            >
              <option value="unset">Choose your prediction</option>
              <option value="between">Between separate molecules</option>
              <option value="within">Within each molecule</option>
            </select>
          </label>
        ) : (
          <>
            <label>
              Your conductivity prediction
              <select
                aria-label="Your conductivity prediction"
                value={board.conducts}
                onChange={(e) => update("conducts", e.target.value)}
              >
                <option value="unset">Choose a prediction</option>
                <option value="yes">Conducts</option>
                <option value="no">Does not conduct</option>
              </select>
            </label>
            <label>
              Your particle explanation
              <select
                aria-label="Your particle explanation"
                value={board.carrier}
                onChange={(e) => update("carrier", e.target.value)}
              >
                <option value="unset">Choose an explanation</option>
                <option value="neutral">Moving molecules are neutral</option>
                <option value="ions">Molecules become mobile ions</option>
                <option value="electrons">
                  Bond electrons move freely through the sample
                </option>
              </select>
            </label>
          </>
        )}
      </div>
      <div className="bench-actions">
        <button className="button primary" onClick={check}>
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            setFeedback("");
            setCorrect(false);
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFeedback("");
            setCorrect(false);
            onChange([initialMolecularBoard(mode)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <div
          role="status"
          className={`feedback ${correct ? "correct" : "retry"}`}
        >
          {feedback}
        </div>
      )}
      {mode !== "trend" && (
        <>
          <div className="bench-actions">
            <button
              className="button"
              disabled={phase === "liquid"}
              onClick={() => update("phase", "liquid")}
            >
              Inspect liquid
            </button>
            <button
              className="button"
              disabled={
                phase === "gas" ||
                (mode === "boiling" && board.force === "unset")
              }
              onClick={() => update("phase", "gas")}
            >
              Compare gas
            </button>
          </div>
          <MolecularPhaseDiagram phase={phase} />
          <p
            className="molecular-inventory"
            data-molecules={ledger.molecules}
            data-atoms={ledger.atoms}
            data-covalent-bonds={ledger.covalentBonds}
          >
            Inventory: {ledger.molecules} neutral molecules, {ledger.atoms}{" "}
            atoms and {ledger.covalentBonds} intact covalent bonds in either
            state. Overall charge of each molecule: 0.
          </p>
        </>
      )}
      {mode === "trend" && <MolecularBoilingChart />}
      {mode === "trend" && (
        <table className="particle-facts">
          <caption>
            Supplied rounded boiling points, approximately atmospheric pressure;
            similar unbranched hydrocarbons.
          </caption>
          <thead>
            <tr>
              <th>Substance</th>
              <th>Formula</th>
              <th>Boiling point / °C</th>
            </tr>
          </thead>
          <tbody>
            {unbranchedAlkaneBoilingData.map((d) => (
              <tr key={d.name}>
                <td>{d.name}</td>
                <td>{d.formula}</td>
                <td>{d.boiling}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <details>
        <summary>What this model does not show</summary>
        <p>
          {mode === "trend" ? (
            "This supplied comparison uses a similar unbranched family, not a universal size-only rule. Shape and types of attraction can matter across unrelated substances. Values are rounded supplied data, not measurements from this app."
          ) : (
            <>
              This is a qualitative comparison of chlorine arrangements, not a
              measured boiling temperature, apparatus simulation or instruction
              to handle chlorine. Molecules remain intact during a change of
              state. No electron orbit paths or measured distances are shown.
              The gas is not shown as ions; atoms within molecules still contain
              charged particles.
            </>
          )}
        </p>
      </details>
    </section>
  );
}
