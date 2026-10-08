"use client";
import {
  readChromaNumber,
  type ChromaBoard,
} from "@/lib/chromatography-domain";
import type { SetupSource } from "@/lib/chromatography-cases";
export function ChromaSetup2D({
  source,
  board,
}: {
  source: SetupSource;
  board: ChromaBoard;
}) {
  const level = readChromaNumber(board.solventLevel, true),
    height = source.paperTop * 2.4 + 70,
    y = (n: number) => 30 + (source.paperTop - n) * 2.4;
  const inView = level !== null && level >= 0 && level <= source.paperTop;
  return (
    <section className="chroma-setup-2d">
      <p>
        <strong>Fixed source and your proposed level</strong> · pale blue is the
        original reservoir; purple dashes show your proposal.
      </p>
      <p className="chroma-pan-hint">
        Swipe the diagram sideways, or focus it and use the arrow keys, to
        inspect the full width.
      </p>
      <div
        className="chroma-given-scroll"
        tabIndex={0}
        role="region"
        aria-label="Fixed chromatography arrangement and retained proposed solvent level; scroll horizontally to inspect"
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
          width="420"
          style={{ width: 420, minWidth: 420, height }}
          height={height}
          viewBox={`0 0 420 ${height}`}
          role="img"
          aria-label={`Original paper bottom ${source.paperBottom} millimetres, sample origin ${source.origin} millimetres and water level ${source.suppliedLevel} millimetres. ${level === null ? "No complete proposed level" : `Your proposed level ${level} millimetres`}.`}
        >
          <line
            x1="47"
            x2="47"
            y1={y(0)}
            y2={y(source.paperTop)}
            stroke="#43506a"
          />
          {Array.from(
            { length: Math.floor(source.paperTop / 10) + 1 },
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
          <path
            d={`M85 ${y(source.paperTop)} V${y(0)} H392 V${y(source.paperTop)}`}
            fill="none"
            stroke="#7a8191"
            strokeWidth="3"
          />
          <rect
            x="88"
            y={y(source.suppliedLevel)}
            width="301"
            height={source.suppliedLevel * 2.4}
            fill="#bfdaf7"
            opacity=".6"
          />
          <rect
            x="191"
            y={y(source.paperTop)}
            width="95"
            height={(source.paperTop - source.paperBottom) * 2.4}
            fill="#fffaf0"
            stroke="#7a8191"
          />
          <line
            x1="191"
            x2="286"
            y1={y(source.origin)}
            y2={y(source.origin)}
            stroke="#555f72"
            strokeWidth="2"
          />
          <circle cx="238" cy={y(source.origin)} r="6" fill="#44506b" />
          {inView && (
            <line
              x1="88"
              x2="389"
              y1={y(level)}
              y2={y(level)}
              stroke="#7343ba"
              strokeWidth="3"
              strokeDasharray="7 5"
            />
          )}
          {board.lineMaterial && (
            <line
              x1="191"
              x2="286"
              y1={y(source.origin) - 5}
              y2={y(source.origin) - 5}
              stroke={board.lineMaterial === "pencil" ? "#6b6b6b" : "#9a287f"}
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}
          <text
            x="238"
            y={height - 12}
            textAnchor="middle"
            fontSize="14"
            fill="#253047"
          >
            Fixed paper and starting sample
          </text>
        </svg>
      </div>
      {level !== null && !inView && (
        <p className="chroma-off-scale">
          Your {level} mm level is outside the displayed beaker scale. The entry
          is retained; no substitute level is drawn.
        </p>
      )}
      {board.solventLevel && level === null && (
        <p className="chroma-off-scale">
          Your unfinished or nonnumeric level “{board.solventLevel}” is
          retained. No complete proposed surface is drawn.
        </p>
      )}
      <p>
        Your proposed origin-line material:{" "}
        {board.lineMaterial === "pencil"
          ? "pencil"
          : board.lineMaterial === "ink"
            ? "soluble ink"
            : "not chosen"}
        . The small dashed line shows that material assignment at the fixed
        origin; it is offset slightly for visibility and does not move the
        sample.
      </p>
    </section>
  );
}
