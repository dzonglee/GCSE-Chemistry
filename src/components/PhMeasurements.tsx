export function PhMeasurements({
  quantity,
  unit,
  points,
  marker,
}: {
  quantity: string;
  unit: string;
  points: { amount: number; ph: number }[];
  marker?: number;
}) {
  const last = points.at(-1)!.amount,
    max = last || 1,
    x = (v: number) => 52 + (v / max) * 340,
    y = (v: number) => 246 - (v / 14) * 210;
  return (
    <figure className="ph-measurements">
      <figcaption>Supplied original pH measurements</figcaption>
      <svg
        viewBox="0 0 420 320"
        role="img"
        aria-label={
          "Supplied pH graph against " +
          quantity +
          " in " +
          unit +
          ". Exact supplied measurements are also in the table."
        }
      >
        <path d="M52 36V246H392" fill="none" stroke="#8995aa" strokeWidth="2" />
        {[0, 7, 14].map((v) => (
          <g key={v}>
            <line
              x1="46"
              x2="392"
              y1={y(v)}
              y2={y(v)}
              stroke={v === 7 ? "#b9c5e5" : "#e2e6ed"}
              strokeDasharray={v === 7 ? "4 4" : undefined}
            />
            <text
              x="38"
              y={y(v) + 7}
              fontSize="24"
              textAnchor="end"
              fill="#33405a"
            >
              {v}
            </text>
          </g>
        ))}
        <text x="12" y="23" fontSize="24" fill="#33405a">
          pH
        </text>
        <polyline
          points={points.map((p) => x(p.amount) + "," + y(p.ph)).join(" ")}
          fill="none"
          stroke="#3e50cf"
          strokeWidth="3"
        />
        {points.map((p, i) => (
          <g key={p.amount}>
            <circle
              cx={x(p.amount)}
              cy={y(p.ph)}
              r={marker === i ? 7 : 4}
              fill={marker === i ? "#ad6132" : "#3e50cf"}
            />
            <line
              x1={x(p.amount)}
              x2={x(p.amount)}
              y1="246"
              y2="254"
              stroke="#8995aa"
            />
            {(i % 2 === 0 || i === points.length - 1) && (
              <text
                x={x(p.amount)}
                y="280"
                fontSize="24"
                textAnchor={
                  i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
                }
                fill="#33405a"
              >
                {p.amount}
              </text>
            )}
          </g>
        ))}
        <text x="222" y="306" fontSize="24" textAnchor="middle" fill="#33405a">
          {quantity} / {unit}
        </text>
      </svg>
      {marker !== undefined && (
        <p className="model-readout">
          Selected observation:{" "}
          <strong>
            {points[marker].amount} {unit}
          </strong>
          , pH <strong>{points[marker].ph}</strong>.
        </p>
      )}
      <table>
        <caption>
          Fixed measured observations; joining lines do not supply extra
          measured readings
        </caption>
        <thead>
          <tr>
            <th scope="col">
              {quantity} / {unit}
            </th>
            <th scope="col">pH at 25 °C</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.amount}>
              <td>{p.amount}</td>
              <td>{p.ph}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
