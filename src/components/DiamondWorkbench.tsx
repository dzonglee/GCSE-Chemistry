"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialNetworkBoard,
  networkPrediction,
  type NetworkMode,
} from "@/lib/diamond";
import { DiamondScene3D } from "./DiamondScene3D";
import { DiamondProjection } from "./DiamondProjection";
import { SilicaNetworkDiagram } from "./SilicaNetworkDiagram";
export function DiamondWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: NetworkMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialNetworkBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [highlight, setHighlight] = useState(false);
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
    setHighlight(false);
    onChange([...history, { ...board, [key]: value }]);
  };
  return (
    <section
      className="model task-workbench diamond-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "diamond" && (
          <>
            <label>
              Bonded neighbours
              <select
                aria-label="Your bonded-neighbour count"
                value={board.neighbours}
                onChange={(e) => change("neighbours", Number(e.target.value))}
              >
                <option value={0}>Choose a count</option>
                {[2, 3, 4, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} covalently bonded neighbours
                  </option>
                ))}
              </select>
            </label>
            <label>
              Inspect an interior carbon
              <select
                aria-label="Inspect an interior carbon"
                value={board.site}
                onChange={(e) => change("site", Number(e.target.value))}
              >
                <option value={0}>Site A</option>
                <option value={1}>Site B</option>
                <option value={2}>Site C</option>
              </select>
            </label>
          </>
        )}
        {mode === "energy" && (
          <>
            <label>
              Interaction to overcome
              <select
                aria-label="Interaction to overcome in the giant network"
                value={board.force}
                onChange={(e) => change("force", e.target.value)}
              >
                <option value="unset">Choose the interaction</option>
                <option value="covalent">Strong covalent bonds</option>
                <option value="intermolecular">
                  Weak between-molecule attractions
                </option>
              </select>
            </label>
            <label>
              Extent of bond disruption
              <select
                aria-label="Extent of bond disruption"
                value={board.extent}
                onChange={(e) => change("extent", e.target.value)}
              >
                <option value="unset">Choose the extent</option>
                <option value="many">Many network bonds</option>
                <option value="one">Only one isolated molecular bond</option>
              </select>
            </label>
            <label>
              Energy consequence
              <select
                aria-label="Energy consequence for melting the network"
                value={board.energy}
                onChange={(e) => change("energy", e.target.value)}
              >
                <option value="unset">Choose the energy demand</option>
                <option value="high">Much energy required</option>
                <option value="low">Little energy required</option>
              </select>
            </label>
          </>
        )}
        {mode === "carriers" && (
          <>
            <label>
              Your conductivity prediction
              <select
                aria-label="Diamond conductivity prediction"
                value={board.conducts}
                onChange={(e) => change("conducts", e.target.value)}
              >
                <option value="unset">Choose a prediction</option>
                <option value="no">Does not conduct</option>
                <option value="yes">Conducts</option>
              </select>
            </label>
            <label>
              Your carrier explanation
              <select
                aria-label="Diamond charge-carrier explanation"
                value={board.carrier}
                onChange={(e) => change("carrier", e.target.value)}
              >
                <option value="unset">Choose the explanation</option>
                <option value="none">No mobile charged carriers</option>
                <option value="electrons">
                  Delocalised electrons carry charge
                </option>
                <option value="ions">Mobile carbon ions carry charge</option>
              </select>
            </label>
          </>
        )}
        {mode === "silica" && (
          <>
            <label>
              Structure extent
              <select
                aria-label="Silica structure extent"
                value={board.extent}
                onChange={(e) => change("extent", e.target.value)}
              >
                <option value="unset">Choose extent</option>
                <option value="giant">Connected giant network</option>
                <option value="molecules">Separate small molecules</option>
              </select>
            </label>
            <label>
              Links between Si and O
              <select
                aria-label="Links between silicon and oxygen"
                value={board.bond}
                onChange={(e) => change("bond", e.target.value)}
              >
                <option value="unset">Choose the bonding</option>
                <option value="covalent">Strong covalent bonds</option>
                <option value="ionic">
                  Attraction between full oppositely charged ions
                </option>
                <option value="weak">Weak between-molecule attractions</option>
              </select>
            </label>
          </>
        )}
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = networkPrediction(mode, board);
            setFeedback(r.feedback);
            setCorrect(r.correct);
            setHighlight(mode === "diamond");
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
            setHighlight(false);
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
            setHighlight(false);
            onChange([initialNetworkBoard(mode)]);
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
      {mode === "diamond" ? (
        <DiamondScene3D site={Number(board.site)} highlight={highlight} />
      ) : mode === "silica" ? (
        <SilicaNetworkDiagram />
      ) : (
        <DiamondProjection site={2} highlight />
      )}
      {mode === "carriers" && (
        <p>
          Shared electrons are present in every covalent bond. Their presence
          does not by itself supply freely moving charged carriers through pure
          diamond.
        </p>
      )}
    </section>
  );
}
