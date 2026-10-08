"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { checkBoard, initialBoard, sameBoard } from "@/lib/workbench";
import { LatticeScene3D } from "./LatticeScene3D";
export function IonicStructureWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "ionic-lattice" | "ionic-conduction" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [highlight, setHighlight] = useState(false);
  const change = (key: string, value: string | number) => {
    const next = { ...board, [key]: value };
    if (sameBoard(board, next)) return;
    if (history.length >= 500) {
      setFeedback(
        "This model has reached its saved-step limit. Undo or reset the model to continue.",
      );
      setCorrect(false);
      return;
    }
    setFeedback("");
    setCorrect(false);
    setHighlight(false);
    onChange([...history, next]);
  };
  const phaseLabel =
    model.kind === "ionic-conduction"
      ? {
          solid: "Solid sodium chloride",
          molten: "Molten sodium chloride",
          solution: "NaCl dissolved in water",
        }[model.phase]
      : "";
  return (
    <section
      className="model task-workbench ionic-structure"
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      {model.kind === "ionic-lattice" ? (
        <div className="ionic-structure-controls">
          <label>
            Inspect an interior ion
            <select
              aria-label="Inspect an interior ion"
              value={board.focus}
              onChange={(e) => change("focus", e.target.value)}
            >
              <option value="Na+">Sodium ion, Na⁺</option>
              <option value="Cl-">Chloride ion, Cl⁻</option>
            </select>
          </label>
          <label>
            Your nearest-neighbour count
            <select
              aria-label="Your nearest-neighbour count"
              value={board.neighbours}
              onChange={(e) => change("neighbours", Number(e.target.value))}
            >
              <option value={0}>Choose a count</option>
              {[2, 4, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n} opposite ions
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <>
          <strong>{phaseLabel}</strong>
          <div className="ionic-structure-controls">
            <label>
              Your conductivity prediction
              <select
                aria-label="Your conductivity prediction"
                value={board.conducts}
                onChange={(e) => change("conducts", e.target.value)}
              >
                <option value="no">Does not conduct</option>
                <option value="yes">Conducts</option>
              </select>
            </label>
            <label>
              Your particle explanation
              <select
                aria-label="Your particle explanation"
                value={board.carrier}
                onChange={(e) => change("carrier", e.target.value)}
              >
                <option value="electrons">Free electrons carry charge</option>
                <option value="fixed">Charged ions are fixed</option>
                <option value="mobile">Charged ions can move</option>
              </select>
            </label>
          </div>
        </>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = checkBoard(model, board);
            setFeedback(result.feedback);
            setCorrect(result.correct);
            setHighlight(model.kind === "ionic-lattice");
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length < 2}
          onClick={() => {
            setFeedback("");
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
            setHighlight(false);
            onChange([initialBoard(model)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p role="status" className={`feedback ${correct ? "correct" : ""}`}>
          {feedback}
        </p>
      )}
      {model.kind === "ionic-lattice" ? (
        <LatticeScene3D
          focus={board.focus as "Na+" | "Cl-"}
          highlight={highlight}
        />
      ) : (
        <>
          <svg
            viewBox="0 0 360 240"
            role="img"
            aria-label={`${phaseLabel}: schematic sample of four sodium ions and four chloride ions. ${model.phase === "solid" ? "Regular fixed positions." : "Disordered mobile ions; arrows show opposite directions under an applied electric field."}`}
          >
            <rect
              x="12"
              y="12"
              width="336"
              height="175"
              rx="12"
              fill={model.phase === "solution" ? "#e9f4ff" : "#f4f5fa"}
            />
            {Array.from({ length: 8 }, (_, i) => {
              const positive = ((i % 4) + Math.floor(i / 4)) % 2 === 0,
                x =
                  model.phase === "solid"
                    ? 55 + (i % 4) * 80
                    : [48, 121, 197, 299, 71, 151, 242, 306][i],
                y =
                  model.phase === "solid"
                    ? 58 + Math.floor(i / 4) * 83
                    : [55, 104, 47, 85, 137, 155, 124, 160][i];
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="19"
                    fill={positive ? "#3f4fd0" : "#783ac6"}
                  />
                  <text
                    x={x}
                    y={y + 6}
                    fill="white"
                    textAnchor="middle"
                    fontSize="20"
                  >
                    {positive ? "+" : "−"}
                  </text>
                </g>
              );
            })}
            {model.phase !== "solid" && (
              <>
                <path
                  d="M70 210h65l-12 -8m12 8l-12 8"
                  stroke="#3f4fd0"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M290 210h-65l12 -8m-12 8l12 8"
                  stroke="#783ac6"
                  strokeWidth="3"
                  fill="none"
                />
                <text x="25" y="216" fontSize="18">
                  Na⁺
                </text>
                <text x="298" y="216" fontSize="18">
                  Cl⁻
                </text>
              </>
            )}
          </svg>
          <p className="position-caption">
            Four Na⁺ and four Cl⁻ ions are shown, total charge zero.{" "}
            {model.phase === "solid"
              ? "Positions are fixed in the solid lattice; ions remain charged."
              : "Ions are mobile. Arrows show opposite directions of ion movement under an applied electric field; the disordered drawing is not a solid lattice."}{" "}
            {model.phase === "solution" &&
              "Water molecules are omitted to make the dissolved ions visible."}{" "}
            Sizes and positions are schematic.
          </p>
          <details>
            <summary>What does this phase model leave out?</summary>
            <p>
              This is a particle explanation, not a measured current or a
              practical heating procedure. The sample count does not describe
              eight-ion molecules. Dissolved sodium chloride conducts; this does
              not mean every ionic compound dissolves in water. Electrodes and
              their chemical reactions are studied later.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
