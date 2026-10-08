import type { TangentPoint } from "./TangentPlot";
export function GradientTriangle({
  points,
  timeUnit,
  quantityUnit,
}: {
  points: readonly [TangentPoint, TangentPoint];
  timeUnit: string;
  quantityUnit: string;
}) {
  const axisMax = (largest: number) => {
    if (largest <= 0) return 1;
    const target = largest / 4,
      power = 10 ** Math.floor(Math.log10(target));
    const step = [1, 2, 2.5, 5, 10].find((k) => k * power >= target)! * power;
    return step * 4;
  };
  const xmax = axisMax(Math.max(points[0].t, points[1].t)),
    ymax = axisMax(Math.max(points[0].q, points[1].q)),
    x = (v: number) => 65 + (400 * v) / xmax,
    y = (v: number) => 260 - (210 * v) / ymax;
  return (
    <figure className="rate-plot">
      <svg
        viewBox="0 0 500 330"
        role="img"
        aria-label={`Supplied tangent triangle: (${points[0].t} ${timeUnit}, ${points[0].q} ${quantityUnit}) to (${points[1].t} ${timeUnit}, ${points[1].q} ${quantityUnit}).`}
      >
        <path d="M65 50V260H465" fill="none" stroke="#626b7d" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={65 + i * 100}
              x2={65 + i * 100}
              y1={50}
              y2={260}
              stroke="#e2e7ef"
            />
            <line
              x1={65}
              x2={465}
              y1={260 - i * 52.5}
              y2={260 - i * 52.5}
              stroke="#e2e7ef"
            />
            <text
              x={65 + i * 100}
              y={285}
              fontSize="23"
              textAnchor="middle"
              fill="#626b7d"
            >
              {Number(((xmax * i) / 4).toFixed(5))}
            </text>
            <text
              x={56}
              y={267 - i * 52.5}
              fontSize="23"
              textAnchor="end"
              fill="#626b7d"
            >
              {Number(((ymax * i) / 4).toFixed(5))}
            </text>
          </g>
        ))}
        <text x={65} y={30} fontSize="23" fill="#626b7d">
          Quantity / {quantityUnit}
        </text>
        <text x={260} y={322} fontSize="23" textAnchor="middle" fill="#626b7d">
          Time / {timeUnit}
        </text>
        <path
          d={`M${x(points[0].t)} ${y(points[0].q)}H${x(points[1].t)}V${y(points[1].q)}`}
          fill="none"
          stroke="#5273c3"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <line
          x1={x(points[0].t)}
          y1={y(points[0].q)}
          x2={x(points[1].t)}
          y2={y(points[1].q)}
          stroke="#9e396f"
          strokeWidth="3"
        />
        {points.map((p, i) => (
          <circle key={i} cx={x(p.t)} cy={y(p.q)} r={7} fill="#9e396f" />
        ))}
      </svg>
      <figcaption>
        Purple joins the supplied points on one tangent. Blue dashes show the
        horizontal and vertical spans; calculate both from the supplied
        coordinates. These points are not two measured curve observations.
      </figcaption>
    </figure>
  );
}
