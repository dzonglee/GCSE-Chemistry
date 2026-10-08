export function InvertedGasScale({
  ticks,
  boundaryDescription,
}: {
  ticks: number;
  boundaryDescription: string;
}) {
  const y = (i: number) => 30 + i * 6;
  return (
    <figure
      className="aqueous-independent-scale"
      style={{ maxWidth: 320, marginInline: "auto" }}
    >
      <svg
        viewBox="0 0 400 330"
        style={{ width: "100%", display: "block" }}
        role="img"
        aria-label={
          "Inverted gas cylinder: numbers increase downwards from 0 to 8 cm³, small divisions 0.2 cm³. " +
          boundaryDescription
        }
      >
        <rect
          x="125"
          y="30"
          width="125"
          height="240"
          fill="#fff"
          stroke="#7785a0"
          strokeWidth="3"
        />
        <rect
          x="128"
          y={y(ticks)}
          width="119"
          height={270 - y(ticks)}
          fill="#d9e8fc"
        />
        <line
          x1="128"
          x2="247"
          y1={y(ticks)}
          y2={y(ticks)}
          stroke="#3349c6"
          strokeWidth="3"
        />
        {Array.from({ length: 41 }, (_, i) => (
          <g key={i}>
            <line
              x1="125"
              x2={i % 5 === 0 ? 151 : 139}
              y1={y(i)}
              y2={y(i)}
              stroke="#54617b"
            />
            {i % 5 === 0 && (
              <text x="111" y={y(i) + 7} textAnchor="end" fontSize="24">
                {i / 5}
              </text>
            )}
          </g>
        ))}
        <text x="190" y="312" textAnchor="middle" fontSize="24">
          Gas scale / cm³
        </text>
      </svg>
      <figcaption>
        Supplied scale: gas above the blue gas–water boundary, water below.
        Simplified flat boundary; each small interval is 0.2 cm³.
      </figcaption>
    </figure>
  );
}
