export function MeasurementDistribution({
  values,
  excluded = 0,
  minimum,
  maximum,
  unit,
  proposedMean,
  reference,
  second,
}: {
  values: readonly number[];
  excluded?: number;
  minimum: number;
  maximum: number;
  unit: string;
  proposedMean?: number;
  reference?: number;
  second?: readonly number[];
}) {
  const x = (v: number) => 80 + ((v - minimum) / (maximum - minimum)) * 520;
  const readings = second ? [...values, ...second] : values;
  const h = second ? 370 : 290;
  return (
    <figure className="measurement-distribution">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 700 ${h}`}
        role="img"
        aria-label={`Repeat distribution in ${unit}, shared axis ${minimum} to ${maximum}. First set: ${values.join(", ")}.${second ? ` Second investigator: ${second.join(", ")}.` : ""}${excluded ? ` Trial ${excluded} is shown as excluded, not removed.` : ""}${Number.isFinite(proposedMean) ? ` Your proposed mean marker: ${proposedMean} ${unit}.` : ""}${reference !== undefined ? ` Supplied reference: ${reference} ${unit}.` : ""}`}
      >
        {reference !== undefined && (
          <line
            x1={x(reference)}
            x2={x(reference)}
            y1="20"
            y2={h - 65}
            stroke="#161c2d"
            strokeWidth="4"
            strokeDasharray="8 6"
            data-reference-position={reference}
          />
        )}
        {Number.isFinite(proposedMean) &&
          proposedMean! >= minimum &&
          proposedMean! <= maximum && (
            <line
              x1={x(proposedMean!)}
              x2={x(proposedMean!)}
              y1="20"
              y2={h - 65}
              stroke="#bd8c24"
              strokeWidth="5"
              data-proposed-mean={proposedMean}
            />
          )}
        {readings.map((v, i) => {
          const removed = !second && excluded === i + 1;
          return (
            <g
              key={i}
              data-measurement-value={v}
              data-measurement-included={!removed}
            >
              <text x="10" y={50 + i * 38} fontSize="40">
                {second
                  ? i < values.length
                    ? `A${i + 1}`
                    : `B${i - values.length + 1}`
                  : i + 1}
              </text>
              <circle
                cx={x(v)}
                cy={40 + i * 38}
                r="12"
                fill={
                  removed
                    ? "#8f96a8"
                    : second && i >= values.length
                      ? "#247b72"
                      : "#394fc5"
                }
              />
              {removed && (
                <path
                  d={`M${x(v) - 15} ${25 + i * 38} l30 30 m-30 0 l30 -30`}
                  stroke="#343b4c"
                  strokeWidth="4"
                />
              )}
            </g>
          );
        })}
        <line
          x1="80"
          x2="600"
          y1={h - 55}
          y2={h - 55}
          stroke="#63708b"
          strokeWidth="3"
        />
        {[minimum, (minimum + maximum) / 2, maximum].map((v) => (
          <g key={v}>
            <line
              x1={x(v)}
              x2={x(v)}
              y1={h - 60}
              y2={h - 45}
              stroke="#63708b"
              strokeWidth="3"
            />
            <text x={x(v)} y={h - 12} textAnchor="middle" fontSize="40">
              {Number(v.toFixed(2))}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        Axis: {unit}. Rows retain each original trial.{" "}
        {second
          ? "A and B are different investigators measuring the same quantity."
          : excluded
            ? "The crossed grey point is excluded but its recorded value stays visible."
            : "All recorded points stay visible."}{" "}
        {Number.isFinite(proposedMean)
          ? proposedMean! >= minimum && proposedMean! <= maximum
            ? "Gold marks your proposed mean; it is not automatically corrected."
            : `Your proposed mean ${proposedMean} ${unit} is outside this plotted axis.`
          : ""}{" "}
        {reference !== undefined
          ? "The dashed line is the supplied reference."
          : ""}
      </figcaption>
    </figure>
  );
}
