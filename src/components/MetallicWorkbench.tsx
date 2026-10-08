"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialMetallicBoard,
  metallicPrediction,
  metallicLedger,
  type MetallicMode,
} from "@/lib/metallic-properties";
import { MetallicScene3D } from "./MetallicScene3D";
import { MetallicDiagram } from "./MetallicDiagram";
export function MetallicWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: MetallicMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialMetallicBoard(mode),
    [show3D, setShow3D] = useState(false),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    ledger = metallicLedger();
  const change = (key: string, value: string | number) => {
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
  return (
    <section
      className="model task-workbench metallic-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "attraction" && (
          <label>
            Particles that attract
            <select
              aria-label="Particles that attract in metallic bonding"
              value={board.attraction}
              onChange={(e) => change("attraction", e.target.value)}
            >
              <option value="unset">Choose the interaction</option>
              <option value="core-electron">
                Positive cores and delocalised electrons
              </option>
              <option value="core-core">
                Positive cores and other positive cores
              </option>
              <option value="molecules">Separate neutral molecules</option>
            </select>
          </label>
        )}
        {mode === "conduction" && (
          <label>
            Your charge carriers
            <select
              aria-label="Charge carriers in the solid metal"
              value={board.carrier}
              onChange={(e) => change("carrier", e.target.value)}
            >
              <option value="unset">Choose your prediction</option>
              <option value="electrons">Delocalised electrons</option>
              <option value="cores">Positive cores</option>
              <option value="neutral">Neutral molecules</option>
            </select>
          </label>
        )}
        {mode === "layers" && (
          <label>
            Bonding during layer movement
            <select
              aria-label="Bonding during layer movement"
              value={board.bonding}
              onChange={(e) => change("bonding", e.target.value)}
            >
              <option value="unset">Choose what happens</option>
              <option value="remains">Attraction to electrons remains</option>
              <option value="vanishes">
                All metallic attraction disappears
              </option>
            </select>
          </label>
        )}
        {mode === "alloy" && (
          <>
            <label>
              Inspect the sample
              <select
                aria-label="Inspect pure metal or alloy"
                value={board.sample}
                onChange={(e) => change("sample", e.target.value)}
              >
                <option value="pure">Pure metal</option>
                <option value="alloy">Illustrated alloy</option>
              </select>
            </label>
            <label>
              Atom sizes in the alloy
              <select
                aria-label="Atom sizes in the alloy"
                value={board.size}
                onChange={(e) => change("size", e.target.value)}
              >
                <option value="unset">Choose the difference</option>
                <option value="different">Different sizes</option>
                <option value="same">Same sizes</option>
              </select>
            </label>
            <label>
              Effect on sliding
              <select
                aria-label="Effect of alloy distortion on sliding"
                value={board.sliding}
                onChange={(e) => change("sliding", e.target.value)}
              >
                <option value="unset">Choose the consequence</option>
                <option value="harder">Layers slide less easily</option>
                <option value="easier">Layers slide more easily</option>
              </select>
            </label>
          </>
        )}
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = metallicPrediction(mode, board);
            setFeedback(r.feedback);
            setCorrect(r.correct);
          }}
        >
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
            onChange([initialMetallicBoard(mode)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={`feedback ${correct ? "correct" : "retry"}`}
        >
          {feedback}
        </p>
      )}
      {mode === "conduction" && (
        <>
          <div className="bench-actions">
            <button
              className="button"
              disabled={Number(board.drift) >= 4}
              onClick={() => change("drift", Number(board.drift) + 1)}
            >
              Advance electron drift
            </button>
            <button
              className="text-button"
              disabled={board.drift === 0}
              onClick={() => change("drift", Number(board.drift) - 1)}
            >
              Step drift back
            </button>
          </div>
          <p>
            Compare snapshots of electron drift under an applied electric field.
            Positive cores stay in their solid positions. The arrows show your
            proposed carrier; they are checked separately.
          </p>
        </>
      )}
      {mode === "layers" && (
        <div className="bench-actions">
          <button
            className="button"
            disabled={Number(board.shift) >= 3}
            onClick={() => change("shift", Number(board.shift) + 1)}
          >
            Displace the top layer
          </button>
          <button
            className="text-button"
            disabled={board.shift === 0}
            onClick={() => change("shift", Number(board.shift) - 1)}
          >
            Step layer back
          </button>
        </div>
      )}
      <div className="bench-actions">
        <button
          className="button"
          aria-expanded={show3D}
          onClick={() => setShow3D(!show3D)}
        >
          {show3D ? "Hide 3D layers" : "Inspect layers in 3D"}
        </button>
      </div>
      {show3D && (
        <MetallicScene3D
          alloy={board.sample === "alloy"}
          shift={Number(board.shift ?? 0)}
          drift={Number(board.drift ?? 0)}
        />
      )}
      <MetallicDiagram
        alloy={board.sample === "alloy"}
        layerShift={Number(board.shift ?? 0) * 10}
        electronDrift={Number(board.drift ?? 0) * 12}
        proposedCarrier={String(board.carrier ?? "unset")}
      />
      <p
        className="metallic-inventory"
        data-cores={ledger.cores}
        data-electrons={ledger.delocalisedElectrons}
      >
        This illustrative fragment: {ledger.cores} positive cores (+
        {ledger.coreCharge}) and {ledger.delocalisedElectrons} delocalised
        electrons ({ledger.electronCharge}); net charge {ledger.netCharge}. The
        electron population remains during shaping and alloy comparison.
      </p>
      {mode === "alloy" && (
        <p>
          Different-sized atoms distort regular layers. The illustration
          explains more difficult sliding; it does not mean alloys are immovable
          or electrical insulators. Alloy compositions and measured properties
          vary.
        </p>
      )}
      <details>
        <summary>Limits of this model</summary>
        <p>
          Actual metals have giant three-dimensional structures, vibrating cores
          and electron motion in many directions. This projection and drift
          snapshots are qualitative: spacing, sizes, charge contributions and
          movement are simplified. Positive cores include inner electrons, so
          they are not bare nuclei. One illustrated contribution is not a
          universal valency rule. No measured hardness, conductivity, melting
          point or electron speed is calculated from this picture.
        </p>
      </details>
    </section>
  );
}
