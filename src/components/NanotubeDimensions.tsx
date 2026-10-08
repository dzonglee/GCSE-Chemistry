export function NanotubeDimensions({
  length,
  diameter,
}: {
  length: number;
  diameter: number;
}) {
  const w = diameter === 1 ? 44 : diameter === 2 ? 70 : 104,
    h = length === 500 ? 120 : length === 1000 ? 190 : 260;
  return (
    <figure className="nanotube-dimensions">
      <svg
        viewBox="0 0 460 370"
        role="img"
        aria-label={`Illustrative tube dimensions: length ${length} nanometres, diameter ${diameter} nanometres. Drawing is not to scale.`}
      >
        <path
          d={`M ${230 - w / 2} ${175 - h / 2} L ${230 - w / 2} ${175 + h / 2} A ${w / 2} 15 0 0 0 ${230 + w / 2} ${175 + h / 2} L ${230 + w / 2} ${175 - h / 2}`}
          fill="#dde4f3"
          stroke="#63718d"
          strokeWidth="3"
        />
        <ellipse
          cx="230"
          cy={175 - h / 2}
          rx={w / 2}
          ry="15"
          fill="white"
          stroke="#63718d"
          strokeWidth="3"
        />
        <path
          d={`M 80 ${175 - h / 2} H 105 M 92 ${175 - h / 2} V ${175 + h / 2} M 80 ${175 + h / 2} H 105`}
          stroke="#3548ca"
          strokeWidth="3"
          fill="none"
        />
        <text x="92" y="335" textAnchor="middle" fontSize="30">
          L: {length} nm
        </text>
        <path
          d={`M ${230 - w / 2} 315 V 295 M ${230 - w / 2} 305 H ${230 + w / 2} M ${230 + w / 2} 315 V 295`}
          stroke="#3548ca"
          strokeWidth="3"
          fill="none"
        />
        <text x="290" y="350" textAnchor="middle" fontSize="30">
          d: {diameter} nm
        </text>
      </svg>
      <figcaption>
        Supplied dimensions; drawing not to scale. Calculate length ÷ diameter
        using the same units. This outline illustrates dimensions, rather than
        the measured size of the atomic crop.
      </figcaption>
    </figure>
  );
}
