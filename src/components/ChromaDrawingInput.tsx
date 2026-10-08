"use client";
import { useId } from "react";
import { readChromaNumber } from "@/lib/chromatography-domain";
import {
  chromaDrawingSources,
  chromaDrawingFields,
  chromaDrawingChoices,
  chromaDrawingLabels,
  initialChromaDrawing,
  referenceChromaDrawing,
  readChromaDrawing,
  updateChromaDrawing,
  type ChromaDrawingData,
  type ChromaDrawingBoard,
} from "@/lib/chromatography-drawing";
export function ChromaProposalDiagram({
  data,
  board,
  label = "Your retained proposal",
}: {
  data: ChromaDrawingData;
  board: ChromaDrawingBoard;
  label?: string;
}) {
  const source = chromaDrawingSources[data.record];
  if (!source || source.mode !== data.mode)
    return <p role="alert">Original drawing source unavailable.</p>;
  const maximum = source.mode === "setup" ? source.top : source.front + 20;
  const scale = 2.4,
    top = 30,
    min = -15,
    width = 440,
    height = top + (maximum - min) * scale + 48;
  const y = (n: number) => top + (maximum - n) * scale,
    inside = (n: number) => n >= min && n <= maximum;
  const proposals = Object.entries(board.placed).filter(
    (pair): pair is [string, number] => pair[1] !== null,
  );
  const offScale = proposals.filter(([, n]) => !inside(n));
  return (
    <>
      <p className="chroma-proposal-heading">
        <strong>{label}</strong> · grey is original apparatus or supplied
        boundaries; purple dashes are{" "}
        {label === "Separate reference"
          ? "the separate reference positions"
          : "your proposal"}
        .
      </p>
      <p className="chroma-pan-hint">
        Swipe the diagram sideways, or focus it and use the arrow keys, to
        inspect the full width.
      </p>
      <div
        className="chroma-given-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${label}; scroll horizontally to inspect`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            e.currentTarget.scrollBy({
              left: e.key === "ArrowRight" ? 80 : -80,
            });
          }
        }}
      >
        <svg
          width={width}
          style={{ width, minWidth: width, height }}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${label}. ${proposals.map(([k, n]) => `${chromaDrawingLabels[k]} ${n} millimetres`).join(". ") || "No positions chosen."}`}
        >
          <line x1="47" x2="47" y1={y(0)} y2={y(maximum)} stroke="#43506a" />
          {Array.from(
            { length: Math.floor(maximum / 10) + 1 },
            (_, i) => i * 10,
          ).map((n) => (
            <g key={n}>
              <line x1="42" x2="53" y1={y(n)} y2={y(n)} stroke="#43506a" />
              <text
                x="34"
                y={y(n) + 5}
                fontSize="14"
                textAnchor="end"
                fill="#253047"
              >
                {n}
              </text>
            </g>
          ))}
          <text x="47" y="18" textAnchor="middle" fontSize="14" fill="#253047">
            mm
          </text>
          {source.mode === "chromatogram" ? (
            <>
              <rect
                x="83"
                y={y(maximum)}
                width="317"
                height={maximum * scale}
                fill="#fff"
                stroke="#c3cbd8"
              />
              <line
                x1="83"
                x2="400"
                y1={y(source.origin)}
                y2={y(source.origin)}
                stroke="#7a8191"
              />
              <line
                x1="83"
                x2="400"
                y1={y(source.front)}
                y2={y(source.front)}
                stroke="#7a8191"
                strokeDasharray="10 4"
              />
              <text
                x="173"
                y={height - 16}
                fontSize="14"
                textAnchor="middle"
                fill="#253047"
              >
                Sample A
              </text>
              <text
                x="320"
                y={height - 16}
                fontSize="14"
                textAnchor="middle"
                fill="#253047"
              >
                Sample B
              </text>
              {proposals
                .filter(([, n]) => inside(n))
                .map(([key, n]) =>
                  key === "origin" || key === "front" ? (
                    <line
                      key={key}
                      x1="83"
                      x2="400"
                      y1={y(n)}
                      y2={y(n)}
                      stroke="#7343ba"
                      strokeWidth="3"
                      strokeDasharray={key === "origin" ? "3 4" : "10 5"}
                    />
                  ) : (
                    <g key={key}>
                      <circle
                        cx={key === "b1" ? 320 : 173}
                        cy={y(n)}
                        r="10"
                        fill="#d8c5f3"
                        stroke="#7343ba"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={key === "b1" ? 338 : 191}
                        y={y(n) + 5}
                        fontSize="14"
                        fill="#50218a"
                      >
                        {key.toUpperCase()}
                      </text>
                    </g>
                  ),
                )}
            </>
          ) : (
            <>
              <path
                d={`M92 ${y(source.top)} V${y(0)} H397 V${y(source.top)}`}
                fill="none"
                stroke="#7a8191"
                strokeWidth="3"
              />
              <rect
                x="200"
                y={y(source.top)}
                width="82"
                height={(source.top - source.bottom) * scale}
                fill="#fffaf0"
                stroke="#7a8191"
              />
              <rect
                x="95"
                y={y(source.originalLevel)}
                width="299"
                height={source.originalLevel * scale}
                fill="#bfdaf7"
                opacity=".45"
              />
              <line
                x1="95"
                x2="394"
                y1={y(source.originalLevel)}
                y2={y(source.originalLevel)}
                stroke="#70859e"
              />
              <line
                x1="200"
                x2="282"
                y1={y(source.origin)}
                y2={y(source.origin)}
                stroke="#555f72"
                strokeWidth="2"
              />
              <circle cx="241" cy={y(source.origin)} r="6" fill="#44506b" />
              {board.placed.solventLevel !== null &&
                inside(board.placed.solventLevel) && (
                  <line
                    x1="95"
                    x2="394"
                    y1={y(board.placed.solventLevel)}
                    y2={y(board.placed.solventLevel)}
                    stroke="#7343ba"
                    strokeWidth="3"
                    strokeDasharray="6 5"
                  />
                )}
              <text
                x="241"
                y={height - 16}
                fontSize="14"
                textAnchor="middle"
                fill="#253047"
              >
                Fixed paper and sample origin
              </text>
            </>
          )}
        </svg>
      </div>
      {offScale.length > 0 && (
        <p role="status" className="chroma-off-scale">
          Outside the displayed coordinate scale:{" "}
          {offScale
            .map(([k, n]) => `${chromaDrawingLabels[k]} ${n} mm`)
            .join("; ")}
          . These positions are retained; no replacement position is drawn.
        </p>
      )}
      {Object.entries(board.raw)
        .filter(([, raw]) => raw !== "" && readChromaNumber(raw, true) === null)
        .map(([key, raw]) => (
          <p key={key} className="chroma-off-scale">
            {chromaDrawingLabels[key]} has an unfinished or nonnumeric entry “
            {raw}”. Its last placed position is{" "}
            {board.placed[key] === null ? "none" : `${board.placed[key]} mm`}.
          </p>
        ))}
    </>
  );
}
export function ChromaDrawingInput({
  data,
  value,
  onChange,
  readOnly = false,
  label = "Your retained proposal",
}: {
  data: ChromaDrawingData;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  label?: string;
}) {
  const uid = useId(),
    source = chromaDrawingSources[data.record];
  if (!source || source.mode !== data.mode)
    return <p role="alert">The original drawing source is unavailable.</p>;
  const board = readChromaDrawing(value, data),
    fields = chromaDrawingFields(data);
  if (!board)
    return (
      <div className="chroma-drawing">
        <p role="alert">
          The retained drawing cannot be read. Its original bytes are preserved.
        </p>
        {!readOnly && onChange && (
          <button
            type="button"
            onClick={() => onChange(JSON.stringify(initialChromaDrawing(data)))}
          >
            Start a new drawing for this task
          </button>
        )}
      </div>
    );
  const edit = (key: string, raw: string) =>
    onChange?.(JSON.stringify(updateChromaDrawing(data, board, key, raw)));
  return (
    <div className="chroma-drawing">
      <div className="chroma-drawing-source">
        <strong>Original givens</strong>
        <p>
          {source.mode === "chromatogram"
            ? `Coordinates above paper bottom: origin ${source.origin} mm; front ${source.front} mm. Sample A: Rf ${source.aRf[0]} and ${source.aRf[1]}; sample B: Rf ${source.bRf}.`
            : `Heights above beaker base: paper bottom ${source.bottom} mm; sample origin ${source.origin} mm; original solvent level ${source.originalLevel} mm; original line ${source.originalLine}.`}
        </p>
        <p>{source.note}</p>
      </div>
      <div className="chroma-drawing-fields">
        {fields.numbers.map((key) =>
          readOnly ? (
            <div
              className="chroma-retained-field"
              key={key}
              data-drawing-field={key}
            >
              <strong>{chromaDrawingLabels[key]} (mm)</strong>
              <p>{board.raw[key] || "Not chosen"}</p>
            </div>
          ) : (
            <label key={key} htmlFor={uid + "-" + key}>
              <span>{chromaDrawingLabels[key]} (mm)</span>
              <input
                id={uid + "-" + key}
                data-drawing-field={key}
                type="text"
                inputMode="decimal"
                value={board.raw[key]}
                maxLength={24}
                onChange={(e) => edit(key, e.target.value)}
                autoComplete="off"
              />
            </label>
          ),
        )}
        {fields.choices.map((key) =>
          readOnly ? (
            <div
              className="chroma-retained-field"
              key={key}
              data-drawing-field={key}
            >
              <strong>{chromaDrawingLabels[key]}</strong>
              <p>
                {board.choices[key]
                  ? chromaDrawingLabels[board.choices[key]]
                  : "Not chosen"}
              </p>
            </div>
          ) : (
            <label key={key} htmlFor={uid + "-" + key}>
              <span>{chromaDrawingLabels[key]}</span>
              <select
                id={uid + "-" + key}
                data-drawing-field={key}
                value={board.choices[key]}
                onChange={(e) => edit(key, e.target.value)}
              >
                {chromaDrawingChoices[
                  key as keyof typeof chromaDrawingChoices
                ].map((option) => (
                  <option key={option} value={option}>
                    {option ? chromaDrawingLabels[option] : "Choose…"}
                  </option>
                ))}
              </select>
            </label>
          ),
        )}
      </div>
      <ChromaProposalDiagram data={data} board={board} label={label} />
      <p>
        {label === "Separate reference"
          ? "These positions and labels belong to the separate reference."
          : "These are your proposed positions and labels."}{" "}
        Written and drawn responses use separate review criteria; saving a
        drawing does not award an automatic examiner mark.
      </p>
    </div>
  );
}
// Call only inside the post-submission self-review branch. This reference never
// writes to the learner's controlled value or workbench history.
export function ChromaDrawingReview({
  data,
  value,
  showRetained = true,
}: {
  data: ChromaDrawingData;
  value: string;
  showRetained?: boolean;
}) {
  return (
    <section className="chroma-drawing-review">
      {showRetained && (
        <>
          <h3>Your retained proposal</h3>
          <ChromaDrawingInput data={data} value={value} readOnly />
        </>
      )}
      <h3>Separate reference for self-review</h3>
      <ChromaDrawingInput
        data={data}
        value={JSON.stringify(referenceChromaDrawing(data))}
        readOnly
        label="Separate reference"
      />
      <p>
        Compare this separate example and the criteria with your actual retained
        response. The reference does not replace your positions or award an
        automatic examiner mark. Valid setup heights are not unique.
      </p>
    </section>
  );
}
