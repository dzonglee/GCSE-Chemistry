"use client";
import {
  chromaGivenSources,
  type ChromaGivenData,
  type ChromaGivenSource,
} from "@/lib/chromatography-givens";
export function ChromaGiven({ data }: { data: ChromaGivenData }) {
  const source = chromaGivenSources[data.record];
  if (!source)
    return <p role="alert">The original chromatogram record is unavailable.</p>;
  return <ChromaOriginalPlot source={source} />;
}
export function ChromaOriginalPlot({ source }: { source: ChromaGivenSource }) {
  const width = Math.max(380, 120 + source.lanes.length * 100),
    scale = 2.5,
    top = 30,
    height = top + source.top * scale + 65;
  const y = (coordinate: number) => top + (source.top - coordinate) * scale;
  return (
    <figure className="chroma-given" aria-label={source.title}>
      <figcaption>
        <strong>{source.title}</strong>
        <p>{source.phaseNote}</p>
      </figcaption>
      <p className="chroma-pan-hint">
        Swipe the diagram sideways, or focus it and use the arrow keys, to
        inspect the full width.
      </p>
      <div
        className="chroma-given-scroll"
        role="region"
        aria-label="Original calibrated chromatogram; scroll horizontally to inspect each lane"
        tabIndex={0}
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
          aria-label={`Original chromatogram. Origin ${source.origin} millimetres above the paper bottom; ${source.front === null ? "front unrecorded" : `front ${source.front} millimetres`}. ${source.lanes.map((l) => `${l.label}: centre${l.centres.length === 1 ? "" : "s"} at ${l.centres.join(", ")} millimetres`).join(". ")}.`}
        >
          <rect
            x="86"
            y={top}
            width={width - 106}
            height={source.top * scale}
            rx="3"
            fill="#fff"
            stroke="#c3cbd8"
          />
          <line x1="54" x2="54" y1={y(0)} y2={y(source.top)} stroke="#3a465a" />
          {Array.from(
            { length: Math.floor(source.top / 10) + 1 },
            (_, i) => i * 10,
          ).map((t) => (
            <g key={t}>
              <line x1="47" x2="60" y1={y(t)} y2={y(t)} stroke="#3a465a" />
              <text
                x="40"
                y={y(t) + 5}
                textAnchor="end"
                fontSize="14"
                fill="#253047"
              >
                {t}
              </text>
            </g>
          ))}
          <text
            x="54"
            y={top - 10}
            textAnchor="middle"
            fontSize="14"
            fill="#253047"
          >
            mm
          </text>
          <line
            x1="86"
            x2={width - 20}
            y1={y(source.origin)}
            y2={y(source.origin)}
            stroke="#4d5667"
            strokeDasharray="3 4"
            strokeWidth="2"
          />
          {source.front !== null && (
            <line
              x1="86"
              x2={width - 20}
              y1={y(source.front)}
              y2={y(source.front)}
              stroke="#2358ba"
              strokeDasharray="9 5"
              strokeWidth="2"
            />
          )}
          {source.lanes.map((lane, i) => {
            const x = 126 + i * 100;
            return (
              <g key={lane.label}>
                <text
                  x={x}
                  y={y(0) + 30}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#253047"
                >
                  {lane.label}
                </text>
                {lane.centres.map((centre, k) => (
                  <g key={k}>
                    <circle
                      cx={x}
                      cy={y(centre)}
                      r={lane.radius !== undefined ? lane.radius * scale : 7}
                      fill={
                        lane.colour === "blue"
                          ? "#2563bd"
                          : lane.colour === "pink"
                            ? "#d1478e"
                            : "#7144bf"
                      }
                      opacity="0.7"
                      stroke="#35275b"
                    />
                    <line
                      x1={x - 3}
                      x2={x + 3}
                      y1={y(centre)}
                      y2={y(centre)}
                      stroke="#302049"
                      strokeWidth="2"
                    />
                    <line
                      x1={x}
                      x2={x}
                      y1={y(centre) - 3}
                      y2={y(centre) + 3}
                      stroke="#302049"
                      strokeWidth="2"
                    />
                    <text
                      x={
                        x +
                        (lane.radius !== undefined ? lane.radius * scale : 7) +
                        7
                      }
                      y={y(centre) + 5}
                      fontSize="14"
                      fill="#253047"
                    >
                      {centre}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <dl className="chroma-given-key">
        <div>
          <dt>Origin · short grey dashes</dt>
          <dd>{source.origin} mm above paper bottom</dd>
        </div>
        <div>
          <dt>Solvent front · long blue dashes</dt>
          <dd>
            {source.front === null
              ? "Not recorded"
              : `${source.front} mm above paper bottom`}
          </dd>
        </div>
      </dl>
      <p>
        Numbers beside spots are their original centre coordinates. Dark crosses
        mark the centres. {source.note}
      </p>
    </figure>
  );
}
