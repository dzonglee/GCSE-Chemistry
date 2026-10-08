export type NaturalHelixData = { positions: number; turns: number };
export function NaturalHelixDiagram({
  data,
  compact = false,
}: {
  data: NaturalHelixData;
  compact?: boolean;
}) {
  const h = 260,
    w = 280,
    A = 72,
    cx = w / 2,
    phase = 0.2,
    theta = (t: number) => phase + 2 * Math.PI * data.turns * t;
  const path = (side: number) =>
    Array.from({ length: 121 }, (_, i) => {
      const t = i / 120;
      return `${i ? "L" : "M"} ${cx + side * A * Math.sin(theta(t))} ${22 + t * 216}`;
    }).join(" ");
  return (
    <figure className="natural-helix-given">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={
          compact ? { width: "auto", height: 150, maxWidth: "100%" } : undefined
        }
        role="img"
        aria-label="Supplied polymer-structure diagram: two long curved chains wind around the same central line, passing alternately in front of one another. Short cross-marks connect corresponding positions."
      >
        {Array.from({ length: data.positions }, (_, i) => {
          const t = (i + 0.5) / data.positions,
            x = A * Math.sin(theta(t)),
            y = 22 + t * 216;
          return (
            <line
              key={i}
              x1={cx - x}
              y1={y}
              x2={cx + x}
              y2={y}
              stroke="#bac4d8"
              strokeWidth={3}
            />
          );
        })}
        <path
          d={path(1)}
          fill="none"
          stroke="#526cb0"
          strokeWidth={11}
          strokeLinecap="round"
        />
        <path
          d={path(-1)}
          fill="none"
          stroke="#a087b5"
          strokeWidth={11}
          strokeLinecap="round"
        />
      </svg>
      <figcaption>
        {compact
          ? "Schematic; not atom sizes."
          : "Supplied polymer-structure diagram · schematic, not atom sizes."}
      </figcaption>
    </figure>
  );
}
