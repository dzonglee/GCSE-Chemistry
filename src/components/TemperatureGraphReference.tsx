import { useId } from "react";
import type { FuelDrawingData } from "../lib/fuel-drawing";

/** Shown only after a saved self-review response or whole-set submission. */
export function TemperatureGraphReference({
  drawing,
}: {
  drawing: FuelDrawingData;
}) {
  const captionId = useId();
  const d = drawing.data,
    ends = drawing.referenceLine;
  if (d.context !== "temperature" || !ends) return null;
  const first = d.points[0][0],
    last = d.points.at(-1)![0];
  const temperature = (x: number) =>
    ends[0] + ((x - first) * (ends[1] - ends[0])) / (last - first);
  const px = (x: number) => 100 + ((x - d.xMin) / (d.xMax - d.xMin)) * 520;
  const py = (y: number) => 335 - ((y - d.yMin) / (d.yMax - d.yMin)) * 300;
  return (
    <details className="temperature-graph-reference">
      <summary>Compare a reference graph</summary>
      <p>
        One suitable straight fit; other balanced lines are possible. Compare
        every point, your line and its extrapolation on the same scales.
      </p>
      <p id={captionId} className="graph-axis-caption">
        Horizontal axis: {d.xName}
        {d.xUnit ? ` (${d.xUnit})` : ""}; vertical axis: {d.yName}
        {d.yUnit ? ` (${d.yUnit})` : ""}.
      </p>
      <div
        className="fuel-plot-scroll"
        aria-describedby={captionId}
        role="region"
        aria-label="Reference temperature graph, scroll horizontally"
        tabIndex={0}
      >
        <svg
          viewBox="0 0 650 450"
          style={{ minWidth: 390, maxWidth: 650 }}
          role="img"
          aria-label={`Reference observations with one balanced straight fit and its extrapolation to zero ${d.xName.toLowerCase()}`}
        >
          {Array.from(
            { length: Math.round((d.xMax - d.xMin) / d.xTick) + 1 },
            (_, i) => {
              const x = d.xMin + i * d.xTick;
              return (
                <g key={"x" + i}>
                  <line
                    x1={px(x)}
                    x2={px(x)}
                    y1="35"
                    y2="335"
                    stroke="#d5ddea"
                  />
                  <text x={px(x)} y="363" textAnchor="middle">
                    {x}
                  </text>
                </g>
              );
            },
          )}
          {Array.from(
            { length: Math.round((d.yMax - d.yMin) / d.yTick) + 1 },
            (_, i) => {
              const y = d.yMin + i * d.yTick;
              return (
                <g key={"y" + i}>
                  <line
                    x1="100"
                    x2="620"
                    y1={py(y)}
                    y2={py(y)}
                    stroke="#d5ddea"
                  />
                  <text x="88" y={py(y) + 7} textAnchor="end">
                    {y}
                  </text>
                </g>
              );
            },
          )}
          <line
            x1="100"
            x2="100"
            y1="35"
            y2="335"
            stroke="#445674"
            strokeWidth="2"
          />
          <line
            x1="100"
            x2="620"
            y1="335"
            y2="335"
            stroke="#445674"
            strokeWidth="2"
          />
          <line
            x1={px(first)}
            y1={py(ends[0])}
            x2={px(last)}
            y2={py(ends[1])}
            stroke="#bd7624"
            strokeWidth="3"
          />
          <line
            x1={px(first)}
            y1={py(ends[0])}
            x2={px(0)}
            y2={py(temperature(0))}
            stroke="#bd7624"
            strokeWidth="3"
            strokeDasharray="7 5"
          />
          {d.points.map(([x, y], i) => (
            <g key={i}>
              <line
                x1={px(x) - 6}
                x2={px(x) + 6}
                y1={py(y) - 6}
                y2={py(y) + 6}
                stroke="#3347be"
                strokeWidth="3"
              />
              <line
                x1={px(x) - 6}
                x2={px(x) + 6}
                y1={py(y) + 6}
                y2={py(y) - 6}
                stroke="#3347be"
                strokeWidth="3"
              />
            </g>
          ))}
          <text x="360" y="399" textAnchor="middle">
            {d.xName}
          </text>
          <text x="360" y="431" textAnchor="middle">
            ({d.xUnit})
          </text>
          <text x="16" y="19">
            {d.yName} ({d.yUnit})
          </text>
        </svg>
      </div>
      <p>
        {d.note} Its extrapolated intercept is approximately{" "}
        {temperature(0).toFixed(1)} °C. A reading allowance of half a small
        square checks consistency with the chosen line. It does not award marks
        for the complete graph.
      </p>
    </details>
  );
}
