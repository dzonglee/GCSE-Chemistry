import { oilBarNumber } from "../lib/oil-bar-drawing";
export function OilBarChart({
  max,
  step,
  bars,
  placed,
  onChoose,
}: {
  max: number;
  step: string;
  bars: [string, string];
  placed: [boolean, boolean];
  onChoose?: (source: "A" | "B", height: number) => void;
}) {
  const interval = oilBarNumber(step),
    count =
      interval &&
      interval > 0 &&
      max / interval <= 20 &&
      Number.isInteger(max / interval)
        ? max / interval
        : 0;
  const ticks = count
      ? Array.from({ length: count + 1 }, (_, i) => i * interval!)
      : [0, max],
    labelEvery = count > 7 ? 2 : 1;
  return (
    <svg
      viewBox="0 0 420 300"
      role="img"
      aria-label="Constructed percentage bar chart for sources A and B. Use the labelled fields and placement buttons for a keyboard alternative."
      onClick={
        onChoose
          ? (e) => {
              const box = e.currentTarget.getBoundingClientRect(),
                x = ((e.clientX - box.left) * 420) / box.width,
                y = ((e.clientY - box.top) * 300) / box.height;
              if (x >= 90 && x <= 400 && y >= 40 && y <= 240)
                onChoose(
                  x < 245 ? "A" : "B",
                  Math.round(
                    Math.max(0, Math.min(max, ((240 - y) * max) / 200)),
                  ),
                );
            }
          : undefined
      }
    >
      {ticks.map((value, i) => {
        const y = 240 - (value / max) * 200;
        return (
          <g key={value}>
            <line x1="90" x2="400" y1={y} y2={y} stroke="#dbe2ef" />
            {(i % labelEvery === 0 || i === ticks.length - 1) && (
              <text x="65" y={y + 9} textAnchor="end">
                {value}
              </text>
            )}
          </g>
        );
      })}
      <path d="M90 40 V240 H400" fill="none" stroke="#334155" strokeWidth="2" />
      {bars.map((raw, i) => {
        const value = oilBarNumber(raw),
          height =
            value === null
              ? 0
              : (Math.max(0, Math.min(max, value)) * 200) / max;
        return placed[i] && value !== null ? (
          <rect
            key={i}
            data-bar-source={i === 0 ? "A" : "B"}
            data-bar-value={value}
            x={i === 0 ? 135 : 290}
            y={240 - height}
            width="65"
            height={height}
            fill={i === 0 ? "#3545bf" : "#b67927"}
          />
        ) : null;
      })}
      <text x="167" y="278" textAnchor="middle">
        A
      </text>
      <text x="322" y="278" textAnchor="middle">
        B
      </text>
    </svg>
  );
}
