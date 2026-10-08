export function StateTemperatureAxis({ temperature }: { temperature: number }) {
  const x = (t: number) => 40 + ((t + 40) / 120) * 440;
  return (
    <figure className="state-temperature-axis">
      <p>
        <strong>Illustrative pure substance X:</strong> melting −20 °C; boiling
        60 °C at fixed pressure.
      </p>
      <svg
        viewBox="0 0 520 210"
        role="img"
        aria-label={`Temperature ${temperature} degrees Celsius on a proportional axis from minus 40 to 80. Melting threshold minus 20; boiling threshold 60.`}
      >
        <line
          x1="40"
          y1="105"
          x2="480"
          y2="105"
          stroke="#63718d"
          strokeWidth="3"
        />
        {[-40, -20, 0, 20, 40, 60, 80].map((t) => (
          <g key={t}>
            <line x1={x(t)} y1="98" x2={x(t)} y2="115" stroke="#63718d" />
            <text x={x(t)} y="143" textAnchor="middle" fontSize="32">
              {t < 0 ? "−" + Math.abs(t) : t}
            </text>
          </g>
        ))}
        {[-20, 60].map((t, i) => (
          <g key={t}>
            <line
              x1={x(t)}
              y1="65"
              x2={x(t)}
              y2="98"
              stroke="#b58a28"
              strokeWidth="3"
            />
            <text x={x(t)} y="48" textAnchor="middle" fontSize="32">
              {i === 0 ? "Melting" : "Boiling"}
            </text>
          </g>
        ))}
        <circle
          data-state-temperature-marker
          cx={x(temperature)}
          cy="105"
          r="10"
          fill="#3548ca"
        />
        <text x="260" y="187" textAnchor="middle" fontSize="32">
          Temperature (°C)
        </text>
      </svg>
      <figcaption>
        Equal temperature intervals have equal spacing. Below, between and above
        the supplied thresholds predict different states; at an exact threshold,
        a transition may involve both phases.
      </figcaption>
    </figure>
  );
}
