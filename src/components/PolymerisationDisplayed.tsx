import type { FourGroups } from "../lib/polymerisation";
export function PolymerisationDisplayed({
  groups,
  bond = "1",
  left = "1",
  right = "1",
  brackets = "1",
  countMark = "n",
  units = 1,
  start = 0,
  length = 2,
  label = "Your displayed polymerisation proposal",
  compact = false,
}: {
  groups: FourGroups;
  bond?: string;
  left?: string;
  right?: string;
  brackets?: string;
  countMark?: string;
  units?: number;
  start?: number;
  length?: number;
  label?: string;
  compact?: boolean;
}) {
  const count = units * 2,
    w = 110 + count * 90,
    y = 120,
    x = (i: number) => 85 + i * 90,
    valid =
      Number.isInteger(start) &&
      Number.isInteger(length) &&
      start >= 0 &&
      length > 0 &&
      start + length <= count;
  return (
    <figure className="polymerisation-displayed">
      <div
        className="polymerisation-scroll"
        tabIndex={0}
        role="region"
        aria-label={label + "; scroll horizontally if needed"}
      >
        <svg
          viewBox={`0 0 ${w} 235`}
          width={compact ? (w * 150) / 235 : w}
          height={compact ? 150 : 235}
          style={{
            width: compact ? (w * 150) / 235 : units === 1 ? "100%" : w,
            height: compact ? 150 : units === 1 ? "auto" : 235,
            maxWidth: !compact && units === 1 ? w : "none",
          }}
          role="img"
          aria-label={label}
        >
          {Array.from({ length: count }, (_, i) => (
            <g key={i}>
              <text x={x(i)} y={y + 7} textAnchor="middle">
                C
              </text>
              {[0, 1].map((j) => {
                const g = groups[(i % 2) * 2 + j],
                  yy = j === 0 ? 48 : 192;
                return (
                  <g key={j}>
                    {g !== "none" ? (
                      <>
                        <line
                          x1={x(i)}
                          y1={j === 0 ? y - 16 : y + 16}
                          x2={x(i)}
                          y2={j === 0 ? yy + 14 : yy - 20}
                        />
                        <text x={x(i)} y={yy + 6} textAnchor="middle">
                          {g === "CH3" ? "CH₃" : g === "C2H5" ? "C₂H₅" : g}
                        </text>
                      </>
                    ) : (
                      <text
                        x={x(i)}
                        y={yy + 6}
                        className="polymerisation-vacant"
                        textAnchor="middle"
                      >
                        +
                      </text>
                    )}
                  </g>
                );
              })}
              {i < count - 1 &&
                (i % 2 === 0
                  ? bond !== "0"
                  : left === "1" && right === "1") && (
                  <>
                    {
                      <line
                        x1={x(i) + 17}
                        y1={y + (i % 2 === 0 && bond === "2" ? -4 : 0)}
                        x2={x(i + 1) - 17}
                        y2={y + (i % 2 === 0 && bond === "2" ? -4 : 0)}
                      />
                    }{" "}
                    {i % 2 === 0 && bond === "2" && (
                      <line
                        x1={x(i) + 17}
                        y1={y + 4}
                        x2={x(i + 1) - 17}
                        y2={y + 4}
                      />
                    )}
                  </>
                )}
            </g>
          ))}
          {left === "1" && <line x1="20" y1={y} x2={x(0) - 17} y2={y} />}
          {right === "1" && (
            <line x1={x(count - 1) + 17} y1={y} x2={w - 25} y2={y} />
          )}
          {valid && (
            <g className="polymerisation-brackets">
              {brackets === "1" && (
                <path
                  d={`M${x(start) - 30 + 8},20 h-8 v185 h8 M${x(start + length - 1) + 30 - 8},20 h8 v185 h-8`}
                />
              )}
              {countMark !== "none" && (
                <text
                  x={
                    countMark === "inside"
                      ? x(start + length - 1) + 10
                      : x(start + length - 1) + 43
                  }
                  y={countMark === "inside" ? 120 : 210}
                >
                  {countMark === "N" ? "N" : "n"}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
      {!compact && (
        <figcaption>
          CH₃/C₂H₅ denote side groups; + denotes an empty slot. Parallel lines
          mean a double bond. Outward bonds continue the chain. Scroll sideways
          for longer structures.
        </figcaption>
      )}
    </figure>
  );
}
