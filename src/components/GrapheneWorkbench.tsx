"use client";
import { useState } from "react";
import type { WorkbenchState } from "@/content/types";
import {
  initialGrapheneBoard,
  graphenePrediction,
  type GrapheneMode,
} from "@/lib/graphene";
import { GrapheneScene3D } from "./GrapheneScene3D";
import { GrapheneProjection } from "./GrapheneProjection";
import { GraphenePanelData } from "./GraphenePanelData";
export function GrapheneWorkbench({
  mode,
  instruction,
  history,
  onChange,
}: {
  mode: GrapheneMode;
  instruction: string;
  history: WorkbenchState[];
  onChange: (h: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialGrapheneBoard(mode),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
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
  const select = (
    label: string,
    key: string,
    options: [string | number, string][],
    numeric = false,
  ) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={board[key]}
        onChange={(e) =>
          change(key, numeric ? Number(e.target.value) : e.target.value)
        }
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section
      className="model task-workbench graphene-workbench"
      aria-label="Task model"
    >
      <p className="bench-instruction">{instruction}</p>
      <div className="ionic-structure-controls">
        {mode === "sheet" && (
          <>
            {select(
              "Atom layers",
              "layers",
              [
                [0, "Choose a layer count"],
                [1, "One atom layer"],
                [3, "Three atom layers"],
                [4, "Four atom layers"],
              ],
              true,
            )}
            {select("Structure extent", "extent", [
              ["unset", "Choose structure extent"],
              ["network", "Extended sheet network"],
              ["molecule", "Separate 32-carbon molecule"],
            ])}
          </>
        )}
        {mode === "electronics" && (
          <>
            {select("Property suited to thin electronics", "property", [
              ["unset", "Choose the property"],
              ["thin-conducting", "Thin conducting sheet"],
              ["insulating", "Electrically insulating only"],
              ["layer-sliding", "Weak interlayer attractions"],
            ])}
            {select("Electrical carrier explanation", "carrier", [
              ["unset", "Choose the carrier mechanism"],
              ["mobile", "Mobile delocalised electrons"],
              ["fixed", "Electrons fixed at single atoms"],
              ["nuclei", "Carbon nuclei flow through the sheet"],
            ])}
          </>
        )}
        {mode === "composite" && (
          <>
            {select("Panel meeting both requirements", "panel", [
              ["unset", "Choose panel"],
              ["A", "A — plain polymer"],
              ["B", "B — graphene composite"],
              ["C", "C — metal"],
            ])}
            {select("Graphene strength explanation", "cause", [
              ["unset", "Choose the bonding explanation"],
              ["covalent", "Strong covalent bonds"],
              ["weak", "Weak interlayer attractions"],
              ["mobile", "Electron mobility"],
            ])}
          </>
        )}
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const r = graphenePrediction(mode, board);
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
            onChange([initialGrapheneBoard(mode)]);
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
      {mode === "sheet" ? (
        <GrapheneScene3D highlight={correct} />
      ) : mode === "composite" ? (
        <GraphenePanelData />
      ) : (
        <>
          <GrapheneProjection highlight />
          <p>
            Delocalised electrons move through the single sheet. No sliding of
            stacked layers is needed for this electrical mechanism.
          </p>
        </>
      )}
    </section>
  );
}
