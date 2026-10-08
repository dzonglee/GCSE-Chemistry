import { gasMassBalance } from "@/lib/mass-conservation";
export function BoundaryGasDiagram({
  closed,
  stage,
}: {
  closed: boolean;
  stage: number;
}) {
  const d = gasMassBalance(closed, stage);
  return (
    <figure className="boundary-gas-diagram">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 520 290"
        role="img"
        aria-label={`${closed ? "Closed" : "Open"} weighed vessel; ${d.escaped} of three 1.5 gram carbon dioxide parcels outside, ${3 - d.escaped} inside. All parcels remain accounted for inside or outside.`}
      >
        <path
          d="M50 40 V210 H290 V40"
          stroke="#3f4fd0"
          strokeWidth="5"
          fill="#edf0fa"
        />
        {closed && (
          <line
            x1="50"
            y1="40"
            x2="290"
            y2="40"
            stroke="#3f4fd0"
            strokeWidth="8"
          />
        )}
        {d.packets.map((p) => (
          <g
            key={p.id}
            data-gas-parcel={p.id}
            data-parcel-inside={p.inside}
            transform={`translate(${p.inside ? 100 + p.id * 60 : 380},${p.inside ? 115 : 70 + p.id * 60})`}
          >
            <circle r="22" fill={p.inside ? "#394fc5" : "#247b72"} />
            <text y="10" fontSize="36" textAnchor="middle" fill="white">
              {p.id + 1}
            </text>
          </g>
        ))}
        <text x="170" y="257" fontSize="36" textAnchor="middle">
          Inside
        </text>
        <text x="380" y="257" fontSize="36" textAnchor="middle">
          Outside
        </text>
      </svg>
      <figcaption>
        Each numbered parcel represents 1.5 g of CO₂. Blue outlines the weighed
        vessel; outside gas remains in the wider accounting. Parcel sizes and
        positions are schematic.
      </figcaption>
    </figure>
  );
}
