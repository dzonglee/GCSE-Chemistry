"use client";
import { useId } from "react";
import { gasChoiceLabels } from "@/lib/gas-tests-domain";
import {
  gasDrawingSources,
  gasDrawingPlacements,
  initialGasDrawing,
  referenceGasDrawing,
  readGasDrawing,
  writeGasDrawing,
  type GasDrawingData,
  type GasDrawingBoard,
} from "@/lib/gas-tests-drawing";
const fields = ["material", "observation", "conclusion"] as const;
const labels = {
  material: "Initial test material and condition",
  observation: "Positive observation",
  conclusion: "Warranted conclusion",
};
const points: Record<string, [number, number]> = {
  mouth: [95, 72],
  inside: [95, 139],
  belowLiquid: [95, 215],
  aboveLiquid: [95, 163],
  gasContact: [95, 120],
  away: [289, 72],
};
export function GasProposalDiagram({
  data,
  board,
  label = "Your retained construction",
}: {
  data: GasDrawingData;
  board: GasDrawingBoard;
  label?: string;
}) {
  const point = points[board.placement],
    far =
      point && point[0] === 95 && point[1] > 72
        ? [95, 38]
        : point
          ? [point[0] + 35, point[1] - 42]
          : null;
  return (
    <figure className="gas-drawing-figure">
      <figcaption>
        <strong>{label}</strong>. Grey is the supplied schematic; purple is the
        retained placement. The labels below belong to this construction.
      </figcaption>
      <p className="gas-caption">
        Pan sideways, or focus the figure and use the arrow keys, to inspect its
        full width.
      </p>
      <div
        className="gas-drawing-pan"
        role="region"
        tabIndex={0}
        aria-label={`${label}; pan horizontally to inspect`}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            event.currentTarget.scrollBy({
              left: event.key === "ArrowRight" ? 80 : -80,
            });
          }
        }}
      >
        <svg
          width="340"
          height="285"
          viewBox="0 0 340 285"
          role="img"
          aria-label={`${label}. Placement: ${board.placement ? gasChoiceLabels[board.placement] : "not chosen"}. Initial material: ${board.material || "not labelled"}. Observation: ${board.observation || "not labelled"}. Conclusion: ${board.conclusion || "not labelled"}.`}
        >
          <rect width="340" height="285" rx="10" fill="#f4f7fc" />
          <path
            d="M75 72 V225 Q75 250 95 250 Q115 250 115 225 V72"
            fill="#e5edf6"
            fillOpacity=".45"
            stroke="#65768c"
            strokeWidth="2"
          />
          <ellipse
            cx="95"
            cy="72"
            rx="20"
            ry="4"
            fill="none"
            stroke="#65768c"
          />
          <line x1="118" y1="72" x2="160" y2="72" stroke="#65768c" />
          <text x="166" y="77" fontSize="14">
            Open end
          </text>
          {data.mode === "liquid" && (
            <>
              <path
                d="M78 190 H112 V225 Q112 246 95 246 Q78 246 78 225 Z"
                fill="#dde7ed"
              />
              <line x1="78" y1="190" x2="112" y2="190" stroke="#65768c" />
              <text x="145" y="195" fontSize="14">
                Receiving-liquid level
              </text>
            </>
          )}
          {point && far && data.mode === "splint" && (
            <line
              x1={point[0]}
              y1={point[1]}
              x2={far[0]}
              y2={far[1]}
              stroke="#633ec0"
              strokeWidth="5"
            />
          )}
          {point && data.mode === "liquid" && (
            <path
              d={`M40 32 H${point[0]} V${point[1]}`}
              fill="none"
              stroke="#633ec0"
              strokeWidth="5"
            />
          )}
          {point && data.mode === "litmus" && (
            <>
              <rect
                x={point[0] - 6}
                y={point[1] - 18}
                width="12"
                height="36"
                fill="none"
                stroke="#633ec0"
                strokeWidth="3"
              />
              <line
                x1={point[0]}
                y1={point[1] - 18}
                x2={point[0]}
                y2={point[1] - 52}
                stroke="#633ec0"
                strokeWidth="2"
              />
            </>
          )}
          {point && (
            <>
              <circle
                cx={point[0]}
                cy={point[1]}
                r="11"
                fill="none"
                stroke="#633ec0"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <text x="18" y="20" fontSize="14" fill="#633ec0">
                Retained contact position
              </text>
            </>
          )}
          {!point && (
            <text x="18" y="20" fontSize="14">
              No contact position chosen
            </text>
          )}
          <text x="18" y="272" fontSize="14">
            Schematic; no result is simulated
          </text>
        </svg>
      </div>
      <dl className="gas-drawing-labels">
        <div>
          <dt>Contact position</dt>
          <dd>
            {board.placement ? gasChoiceLabels[board.placement] : "Not chosen"}
          </dd>
        </div>
        {fields.map((field) => (
          <div key={field}>
            <dt>{labels[field]}</dt>
            <dd>{board[field] || "Not labelled"}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
export function GasDrawingInput({
  data,
  value,
  onChange,
  readOnly = false,
  label = "Your retained construction",
}: {
  data: GasDrawingData;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  label?: string;
}) {
  const uid = useId(),
    source = gasDrawingSources[data.record];
  if (!source || source.mode !== data.mode)
    return <p role="alert">Original drawing source unavailable.</p>;
  const board = readGasDrawing(value, data);
  if (!board)
    return (
      <div className="gas-drawing">
        <p role="alert">
          This retained drawing cannot be read. Its exact original bytes are
          preserved.
        </p>
        {!readOnly && onChange && (
          <button
            type="button"
            onClick={() =>
              onChange(writeGasDrawing(data, initialGasDrawing(data)))
            }
          >
            Start a new drawing for this task
          </button>
        )}
      </div>
    );
  const edit = (field: keyof GasDrawingBoard, text: string) =>
    onChange?.(writeGasDrawing(data, { ...board, [field]: text }));
  return (
    <div className="gas-drawing">
      <section
        className="gas-drawing-source"
        aria-label="Original drawing givens"
      >
        <strong>Original givens</strong>
        <p>{source.given}</p>
      </section>
      {!readOnly && (
        <div className="gas-drawing-fields">
          <label htmlFor={`${uid}-placement`}>
            <span id={`${uid}-placement-label`}>Proposed contact position</span>
            <select
              id={`${uid}-placement`}
              data-drawing-field="placement"
              aria-labelledby={`${uid}-placement-label`}
              aria-describedby={
                board.placement ? `${uid}-placement-choice` : undefined
              }
              value={board.placement}
              onChange={(event) => edit("placement", event.target.value)}
            >
              {gasDrawingPlacements.map((position) => (
                <option key={position} value={position}>
                  {position
                    ? gasChoiceLabels[position]
                    : "Choose your placement"}
                </option>
              ))}
            </select>
            {board.placement && (
              <span className="gas-selected" id={`${uid}-placement-choice`}>
                {gasChoiceLabels[board.placement]}
              </span>
            )}
          </label>
          {fields.map((field) => (
            <label key={field} htmlFor={`${uid}-${field}`}>
              <span id={`${uid}-${field}-label`}>{labels[field]}</span>
              <textarea
                id={`${uid}-${field}`}
                aria-labelledby={`${uid}-${field}-label`}
                data-drawing-field={field}
                value={board[field]}
                maxLength={300}
                rows={2}
                onChange={(event) => edit(field, event.target.value)}
              />
            </label>
          ))}
        </div>
      )}
      <GasProposalDiagram data={data} board={board} label={label} />
      {!readOnly && onChange && (
        <button
          type="button"
          disabled={!board.placement && fields.every((field) => !board[field])}
          onClick={() =>
            onChange(writeGasDrawing(data, initialGasDrawing(data)))
          }
        >
          Clear construction
        </button>
      )}
      <p className="gas-caption">
        Written and drawn responses are self-reviewed against separate criteria.
        Saving a construction does not award an automatic examiner mark.
      </p>
    </div>
  );
}
export function GasDrawingReview({
  data,
  value,
  showRetained = true,
}: {
  data: GasDrawingData;
  value: string;
  showRetained?: boolean;
}) {
  const board = readGasDrawing(value, data),
    reference = referenceGasDrawing(data);
  return (
    <div className="gas-drawing-review">
      <h3>Your construction and a separate reference</h3>
      <p>
        The reference does not replace or repair your retained response. Compare
        placement, starting condition, positive observation and conclusion using
        the task criteria.
      </p>
      {showRetained &&
        (board ? (
          <GasProposalDiagram data={data} board={board} />
        ) : (
          <p role="alert">
            Your original drawing cannot be read; its bytes are preserved.
          </p>
        ))}
      <GasProposalDiagram
        data={data}
        board={reference}
        label="Separate reference"
      />
    </div>
  );
}
