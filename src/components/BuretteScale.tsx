export function BuretteScale({
  top,
  reading,
  boundaryDescription,
}: {
  top: number;
  reading: number;
  boundaryDescription: string;
}) {
  const y = 30 + (reading - top) * 350;
  return (
    <figure
      className="technique-fine-scale"
      style={{ maxWidth: 300, marginInline: "auto" }}
    >
      <svg
        viewBox="0 0 400 355"
        role="img"
        aria-label={
          "Burette scale window in cm³. Values increase downwards; small divisions 0.10 cm³. " +
          boundaryDescription
        }
      >
        <rect
          x="135"
          y="30"
          width="125"
          height="280"
          fill="#fff"
          stroke="#7785a0"
          strokeWidth="3"
        />
        <path
          d={
            "M138 " +
            (y - 9) +
            " Q197.5 " +
            (y + 9) +
            " 257 " +
            (y - 9) +
            " L257 307 L138 307 Z"
          }
          fill="#d9e8fc"
        />
        <path
          d={"M138 " + (y - 9) + " Q197.5 " + (y + 9) + " 257 " + (y - 9)}
          fill="none"
          stroke="#3349c6"
          strokeWidth="3"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <line
              x1="135"
              x2={i % 2 === 0 ? 164 : 150}
              y1={30 + i * 35}
              y2={30 + i * 35}
              stroke="#54617b"
              strokeWidth="2"
            />
            {i % 2 === 0 && (
              <text x="119" y={38 + i * 35} textAnchor="end" fontSize="24">
                {(top + i / 10).toFixed(1)}
              </text>
            )}
          </g>
        ))}
        <line
          x1="285"
          x2="202"
          y1={y}
          y2={y}
          stroke="#a84619"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <text x="197" y="344" textAnchor="middle" fontSize="24">
          Burette / cm³
        </text>
      </svg>
      <figcaption>
        Read the bottom of the concave meniscus at eye level. Small divisions
        are 0.10 cm³; estimate halfway to 0.05 cm³.
      </figcaption>
    </figure>
  );
}
