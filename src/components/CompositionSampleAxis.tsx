export function CompositionSampleAxis({ mass }: { mass: number }) {
  const calcium = mass * 0.4;
  return (
    <figure className="composition-sample-axis">
      <svg
        viewBox="0 0 520 190"
        role="img"
        aria-label={`Pure sample mass ${mass} grams, calcium contribution ${calcium} grams, 40 percent of the whole sample.`}
      >
        <rect x="40" y="40" width="440" height="38" rx="8" fill="#edf0f8" />
        <rect x="40" y="40" width="176" height="38" rx="8" fill="#3c50c5" />
        <line
          x1="40"
          y1="100"
          x2="480"
          y2="100"
          stroke="#75819a"
          strokeWidth="3"
        />
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1={40 + 440 * f}
              y1="92"
              x2={40 + 440 * f}
              y2="110"
              stroke="#75819a"
              strokeWidth="3"
            />
            <text x={40 + 440 * f} y="148" fontSize="30" textAnchor="middle">
              {mass * f}
            </text>
          </g>
        ))}
        <text x="260" y="183" fontSize="30" textAnchor="middle">
          Sample mass / g
        </text>
      </svg>
      <figcaption>
        Blue represents the calcium mass contribution, {calcium} g of {mass} g.
        The full axis rescales with sample size; the fraction stays 40%. This is
        a mass-allocation diagram, not separated calcium in an actual sample.
      </figcaption>
    </figure>
  );
}
