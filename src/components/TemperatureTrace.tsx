import { useId } from "react";
export type TemperatureObservation = { time: number; temperature: number };
export function TemperatureTrace({
  points,
  mixedAfter,
  min = 0,
  max = 40,
  selectedBaseline,
  selectedExtreme,
}: {
  points: readonly TemperatureObservation[];
  mixedAfter: number;
  min?: number;
  max?: number;
  selectedBaseline?: number;
  selectedExtreme?: number;
}) {
  const id = useId(),
    end = points.at(-1)!.time,
    x = (time: number) => 75 + (time / end) * 400,
    y = (temperature: number) =>
      275 - ((temperature - min) / (max - min)) * 230;
  const ticks = Array.from(
    { length: 5 },
    (_, i) => min + (i * (max - min)) / 4,
  );
  return (
    <figure className="temperature-trace">
      <svg
        viewBox="0 0 500 340"
        role="img"
        aria-labelledby={id}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id={id}>
          Surrounding solution temperature against time; mixing after{" "}
          {mixedAfter} minutes.
        </title>
        <text x="75" y="28" fontSize="28">
          Temperature / °C
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1="75" y1={y(t)} x2="475" y2={y(t)} stroke="#d5ddec" />
            <text x="65" y={y(t) + 8} textAnchor="end" fontSize="28">
              {t}
            </text>
          </g>
        ))}
        {Array.from(
          { length: Math.floor(max - min) - 1 },
          (_, i) => min + i + 1,
        )
          .filter((t) => !ticks.includes(t))
          .map((t) => (
            <line
              key={t}
              x1="75"
              y1={y(t)}
              x2="475"
              y2={y(t)}
              stroke="#e7ebf2"
              strokeWidth=".7"
            />
          ))}
        <line x1="75" y1="45" x2="75" y2="275" stroke="#35415a" />
        <line x1="75" y1="275" x2="475" y2="275" stroke="#35415a" />
        {points.map((p, i) => (
          <g key={i}>
            <line
              x1={x(p.time)}
              y1="275"
              x2={x(p.time)}
              y2="281"
              stroke="#35415a"
            />
            <text x={x(p.time)} y="307" textAnchor="middle" fontSize="28">
              {p.time}
            </text>
          </g>
        ))}
        <text x="275" y="335" textAnchor="middle" fontSize="28">
          Time / min
        </text>
        <polyline
          points={points
            .map((p) => x(p.time) + "," + y(p.temperature))
            .join(" ")}
          stroke="#3b44c9"
          strokeWidth="3"
          fill="none"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(p.time)}
            cy={y(p.temperature)}
            r="4"
            fill="#3b44c9"
          />
        ))}
        {[
          ["baseline", selectedBaseline, "#cf8d29"],
          ["extreme", selectedExtreme, "#8f3aba"],
        ].map(([label, index, colour]) =>
          typeof index === "number" && points[index] ? (
            <g key={String(label)}>
              <circle
                cx={x(points[index].time)}
                cy={y(points[index].temperature)}
                r="10"
                fill="none"
                stroke={String(colour)}
                strokeWidth="3"
              />
              <title>
                Your selected {label}: time {points[index].time} min,{" "}
                {points[index].temperature} °C.
              </title>
            </g>
          ) : null,
        )}
      </svg>
      <figcaption>Reactants are mixed after {mixedAfter} min.</figcaption>
      <details>
        <summary>Equivalent temperature data</summary>
        <table className="data-table">
          <caption>Supplied observations</caption>
          <thead>
            <tr>
              <th scope="col">Time / min</th>
              <th scope="col">Temperature / °C</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i}>
                <td>{p.time}</td>
                <td>{p.temperature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
