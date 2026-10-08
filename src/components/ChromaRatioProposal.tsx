"use client";
import {
  readChromaNumber,
  type ChromaBoard,
} from "@/lib/chromatography-domain";
import type { RatioSource } from "@/lib/chromatography-cases";
export function ChromaRatioProposal({
  source,
  board,
}: {
  source: RatioSource;
  board: ChromaBoard;
}) {
  const millimetres = (n: number | null, unit: string) =>
    n === null ? null : n * (unit === "cm" ? 10 : 1);
  const spot = millimetres(source.spot, source.spotUnit),
    front = millimetres(source.front, source.frontUnit);
  const key =
      source.kind === "inverse"
        ? "spotDistance"
        : source.kind === "front"
          ? "frontDistance"
          : "rf",
    raw = board[key],
    value = readChromaNumber(raw, true);
  const proposal =
    value === null
      ? null
      : key === "rf"
        ? front === null
          ? null
          : value * front
        : millimetres(
            value,
            key === "spotDistance" ? source.spotUnit : source.frontUnit,
          );
  const maximum = Math.max(
      100,
      Math.ceil((Math.max(spot ?? 0, front ?? 0) * 1.25) / 20) * 20,
    ),
    x = (n: number) => 60 + (n / maximum) * 260;
  const visible = proposal !== null && proposal >= 0 && proposal <= maximum;
  return (
    <section className="chroma-ratio-proposal">
      <h4>Original travel and your proposal</h4>
      <p>
        All plotted distances are in millimetres from the original origin. Solid
        marks are supplied observations; purple dashes are your proposal.
      </p>
      <p className="chroma-pan-hint">
        Swipe the diagram sideways, or focus it and use the arrow keys, to
        inspect the full width.
      </p>
      <div
        className="chroma-given-scroll"
        tabIndex={0}
        role="region"
        aria-label="Original distance record and retained proposal; scroll horizontally to inspect"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            e.currentTarget.scrollBy({
              left: e.key === "ArrowRight" ? 80 : -80,
            });
          }
        }}
      >
        <svg
          width="380"
          style={{ width: 380, minWidth: 380, height: 190 }}
          height="190"
          viewBox="0 0 380 190"
          role="img"
          aria-label={`Original spot travel ${spot === null ? "not supplied" : spot + " millimetres"}; original front travel ${front === null ? "not supplied" : front + " millimetres"}. ${proposal === null ? "No complete proposal position." : `Your proposed ${key === "frontDistance" ? "front" : "spot"} position ${proposal} millimetres.`}`}
        >
          <line x1="60" x2="320" y1="130" y2="130" stroke="#43506a" />
          {Array.from({ length: maximum / 20 + 1 }, (_, i) => i * 20).map(
            (t) => (
              <g key={t}>
                <line x1={x(t)} x2={x(t)} y1="124" y2="137" stroke="#43506a" />
                <text
                  x={x(t)}
                  y="157"
                  textAnchor="middle"
                  fontSize="14"
                  fill="#253047"
                >
                  {t}
                </text>
              </g>
            ),
          )}
          <text
            x="190"
            y="182"
            textAnchor="middle"
            fontSize="14"
            fill="#253047"
          >
            Travel from origin (mm)
          </text>
          {front !== null && (
            <line
              x1={x(front)}
              x2={x(front)}
              y1="35"
              y2="130"
              stroke="#2358ba"
              strokeWidth="3"
            />
          )}
          {spot !== null && (
            <circle cx={x(spot)} cy="95" r="8" fill="#44506b" />
          )}
          {visible &&
            (key === "frontDistance" ? (
              <line
                x1={x(proposal)}
                x2={x(proposal)}
                y1="45"
                y2="130"
                stroke="#7343ba"
                strokeWidth="3"
                strokeDasharray="5 4"
              />
            ) : (
              <circle
                cx={x(proposal)}
                cy="70"
                r="9"
                fill="#e1d3f4"
                stroke="#7343ba"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            ))}
        </svg>
      </div>
      <p>
        Original centre · dark solid dot:{" "}
        {spot === null ? "not supplied" : `${spot} mm`}. Original front · solid
        blue line: {front === null ? "not supplied" : `${front} mm`}.
      </p>
      {proposal !== null ? (
        <p>
          Your proposed {key === "frontDistance" ? "front" : "spot"} travel:{" "}
          {Number(proposal.toPrecision(12))} mm
          {key === "rf"
            ? " (your ratio × the original front travel)"
            : ""}.{" "}
          {visible
            ? ""
            : "Outside the displayed scale; the exact raw entry is retained and no substitute position is drawn."}
        </p>
      ) : (
        <p>
          {raw
            ? `Your unfinished or nonnumeric entry “${raw}” is retained.`
            : "No proposal chosen."}
        </p>
      )}
      {source.rounding && (
        <p>
          A ratio reported to the requested significant figures can imply a
          slightly different position from the original measured centre.
        </p>
      )}
    </section>
  );
}
