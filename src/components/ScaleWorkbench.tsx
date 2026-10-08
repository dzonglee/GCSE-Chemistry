"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { initialBoard, checkBoard } from "@/lib/workbench";
import {
  enlargedNucleusRadius,
  nanoToMetres,
  standardForm,
} from "@/lib/atomic-scale";
function Scientific({ value }: { value: number }) {
  const [coefficient, power] = standardForm(value);
  return (
    <span>
      {coefficient} × 10<sup>{power < 0 ? `−${-power}` : power}</sup>
    </span>
  );
}
export function ScaleWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "atomic-scale" | "nano-convert" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    feedback: string;
  } | null>(null);
  const change = (key: string, value: number) => {
    if (board[key] === value) return;
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback: "Undo or reset to continue; your answer is retained.",
      });
      return;
    }
    onChange([...history, { ...board, [key]: value }]);
    setFeedback(null);
  };
  const atomRadius = Number(board.radius),
    nucleusRadius = enlargedNucleusRadius(atomRadius);
  return (
    <section
      className="model task-workbench scale-workbench"
      data-model={model.kind}
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      {model.kind === "nano-convert" ? (
        <label>
          Nano prefix: power of ten
          <select
            aria-label="Nano prefix: power of ten"
            value={Number(board.exponent)}
            onChange={(e) => change("exponent", Number(e.target.value))}
          >
            {[-6, -7, -8, -9, -10, -11, -12].map((n) => (
              <option key={n} value={n}>
                10 to the power {n}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label>
          Enlarged atom radius (m)
          <select
            aria-label="Enlarged atom radius (m)"
            value={atomRadius}
            onChange={(e) => change("radius", Number(e.target.value))}
          >
            {[1, 10, 100].map((n) => (
              <option key={n} value={n}>
                {n} m
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => setFeedback(checkBoard(model, board))}
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
      {model.kind === "nano-convert" ? (
        <div className="scale-calculation" aria-live="polite">
          <strong>Your chosen conversion</strong>
          <p>
            {model.nanometres} nm × 10<sup>{Number(board.exponent)}</sup> m/nm ={" "}
            <Scientific
              value={nanoToMetres(model.nanometres, Number(board.exponent))}
            />{" "}
            m
          </p>
          <p>
            Changing the exponent changes the conversion you propose. Check
            which exponent actually means nano.
          </p>
          <p>
            A typical atom radius is about 0.1 nm. Radius runs from the centre
            to the edge; diameter spans the whole atom.
          </p>
        </div>
      ) : (
        <>
          <div className="scale-calculation" aria-live="polite">
            <strong>Supplied example: radius ratio 20 000 : 1</strong>
            <p>
              Atom: 1 × 10<sup>−10</sup> m; nucleus: 5 × 10<sup>−15</sup> m.
            </p>
            <p>Enlarged atom radius: {atomRadius} m</p>
            <p>
              Enlarged nucleus radius: {atomRadius} ÷ 20 000 ={" "}
              <Scientific value={nucleusRadius} /> m ={" "}
              {Number((nucleusRadius * 1000).toPrecision(8))} mm
            </p>
          </div>
          <figure className="scale-figure">
            <div className="scale-diagrams">
              <svg
                viewBox="0 0 270 270"
                role="img"
                aria-label={`Atom radius ${atomRadius} metres, nucleus radius ${nucleusRadius * 1000} millimetres. Main diagram has the true 20 000 radius ratio; separate nucleus inset is magnified 10 000 times.`}
              >
                <circle
                  cx="137"
                  cy="130"
                  r="120"
                  fill="#f8faff"
                  stroke="#aebbd3"
                  strokeWidth="1.5"
                />
                <circle
                  cx="137"
                  cy="130"
                  r={120 / 20000}
                  fill="#c14a31"
                  data-scale-nucleus="true"
                />
                <path
                  d="M137 130 L257 130"
                  stroke="#3445ca"
                  strokeWidth="1.5"
                />
                <text x="167" y="120" fontSize="12" fill="#263786">
                  radius {atomRadius} m
                </text>
                <text
                  x="137"
                  y="264"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#475569"
                >
                  Nucleus is too small to see at this scale
                </text>
              </svg>
              <svg
                className="nucleus-scale-inset"
                viewBox="0 0 160 190"
                role="img"
                aria-label={`Separate nucleus inset, radius ${nucleusRadius * 1000} millimetres, magnified 10 000 times relative to the main drawing.`}
              >
                <circle cx="80" cy="90" r="60" fill="#c14a31" opacity=".15" />
                <circle
                  cx="80"
                  cy="90"
                  r="60"
                  fill="none"
                  stroke="#b4452e"
                  strokeWidth="1.5"
                />
                <text
                  x="80"
                  y="86"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#8e3524"
                >
                  Nucleus inset
                </text>
                <text
                  x="80"
                  y="105"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#8e3524"
                >
                  {Number((nucleusRadius * 1000).toPrecision(8))} mm radius
                </text>
                <text
                  x="80"
                  y="175"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#475569"
                >
                  Magnified × 10 000
                </text>
              </svg>
            </div>
            <figcaption>
              The main atom fits the same drawing area at each enlargement; its
              labelled radius changes. The inset alone magnifies the nucleus. It
              does not show the actual relative size.
            </figcaption>
          </figure>
        </>
      )}
      <details className="model-boundaries">
        <summary>About this scale model</summary>
        <p>
          The specification gives an atom radius about 10⁻¹⁰ m and a nuclear
          radius less than one ten-thousandth of that. The supplied 5 × 10⁻¹⁵ m
          nucleus is an example meeting that bound; sizes vary. The enlarged
          object is an analogy, not a physical atom. No electron size or
          trajectory is represented.
        </p>
      </details>
    </section>
  );
}
