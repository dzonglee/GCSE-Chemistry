import { useId } from "react";
export type PracticalGraphData = {
  points: readonly (readonly [number, number])[];
  xLabel: string;
  xMax: number;
  yMin: number;
  yMax: number;
  line?: boolean;
  fits?: readonly (readonly (readonly [number, number])[])[];
};
export function PracticalPlot({
  data,
  selected = [],
  marker,
}: {
  data: PracticalGraphData;
  selected?: readonly number[];
  marker?: readonly [number, number];
}) {
  const id = useId(),
    intervals =
      data.xMax <= 5 ? 5 : data.xMax === 40 ? 4 : data.xMax === 25 ? 5 : 6,
    x = (v: number) => 90 + (v / data.xMax) * 360,
    y = (v: number) => 270 - ((v - data.yMin) / (data.yMax - data.yMin)) * 220;
  const endpoint = (line: readonly (readonly [number, number])[]) => {
    const [a, b] = line;
    const m = (b[1] - a[1]) / (b[0] - a[0]),
      c = a[1] - m * a[0];
    return [
      [0, c],
      [data.xMax, c + m * data.xMax],
    ] as const;
  };
  return (
    <figure className="practical-plot" style={{ margin: "12px 0" }}>
      <svg
        viewBox="0 0 500 365"
        role="img"
        aria-labelledby={id}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title
          id={id}
        >{`Temperature against ${data.xLabel}. Axis ranges: horizontal0 to${data.xMax}; temperature${data.yMin} to${data.yMax}°C. Your selections do not change supplied observations. Supplied coordinates: ${data.points.map((p) => `(${p[0]}, ${p[1]})`).join("; ")}.`}</title>
        <defs>
          <clipPath id={id + "-clip"}>
            <rect x="90" y="50" width="360" height="220" />
          </clipPath>
        </defs>
        <text x="90" y="33" fontSize="34">
          Temperature / °C
        </text>
        {Array.from(
          { length: 5 },
          (_, i) => data.yMin + (i * (data.yMax - data.yMin)) / 4,
        ).map((t) => (
          <g key={t}>
            <line x1="90" y1={y(t)} x2="450" y2={y(t)} stroke="#d5ddec" />
            <text x="80" y={y(t) + 10} textAnchor="end" fontSize="34">
              {t}
            </text>
          </g>
        ))}
        {Array.from(
          { length: intervals + 1 },
          (_, i) => (i * data.xMax) / intervals,
        ).map((t) => (
          <g key={t}>
            <line x1={x(t)} y1="50" x2={x(t)} y2="270" stroke="#e7ebf2" />
            <text x={x(t)} y="315" textAnchor="middle" fontSize="34">
              {t}
            </text>
          </g>
        ))}
        {Array.from(
          { length: Math.round((data.yMax - data.yMin) * 2) - 1 },
          (_, i) => data.yMin + (i + 1) / 2,
        ).map((t) => (
          <line
            key={"minor-y-" + t}
            x1="90"
            y1={y(t)}
            x2="450"
            y2={y(t)}
            stroke="#e7ebf2"
            strokeWidth=".6"
          />
        ))}
        <path
          d="M90 50 V270 H450"
          fill="none"
          stroke="#35415a"
          strokeWidth="2"
        />
        <g clipPath={`url(#${id}-clip)`}>
          {data.line && (
            <polyline
              points={data.points.map((p) => `${x(p[0])},${y(p[1])}`).join(" ")}
              fill="none"
              stroke="#3544ce"
              strokeWidth="3"
            />
          )}
          {data.fits?.map((line, i) => (
            <polyline
              key={i}
              points={endpoint(line)
                .map((p) => `${x(p[0])},${y(p[1])}`)
                .join(" ")}
              fill="none"
              stroke={i ? "#c39127" : "#3544ce"}
              strokeWidth="3"
              strokeDasharray="8 5"
            />
          ))}
          {selected.length === 2 &&
            selected.every((i) => i >= 0 && i < data.points.length) && (
              <path
                data-testid="gradient-triangle"
                d={`M${x(data.points[selected[0]][0])} ${y(data.points[selected[0]][1])} H${x(data.points[selected[1]][0])} V${y(data.points[selected[1]][1])}`}
                fill="none"
                stroke="#c39127"
                strokeWidth="4"
              />
            )}
          {data.points.map((p, i) => (
            <circle
              key={i}
              data-observation-index={i}
              cx={x(p[0])}
              cy={y(p[1])}
              r={selected.includes(i) ? 8 : 5}
              fill={selected.includes(i) ? "#c39127" : "#3544ce"}
            />
          ))}
          {marker && (
            <g data-testid="intersection-prediction">
              <path
                d={`M${x(marker[0]) - 9} ${y(marker[1])} h18 M${x(marker[0])} ${y(marker[1]) - 9} v18`}
                stroke="#7536b8"
                strokeWidth="4"
              />
            </g>
          )}
        </g>
        <text x="270" y="358" textAnchor="middle" fontSize="34">
          {data.xLabel}
        </text>
      </svg>
      <figcaption>
        {data.fits
          ? "Blue points: supplied observations. Dashed blue and gold lines: supplied fits. "
          : data.xLabel === "Time / s"
            ? "Supplied temperature observations. "
            : "Supplied best-fit line and fitted-line coordinates. "}
        {selected.length > 0 && "Gold marks: your selected points. "}
        {marker && "Purple cross: your estimated intersection."}
      </figcaption>
    </figure>
  );
}
