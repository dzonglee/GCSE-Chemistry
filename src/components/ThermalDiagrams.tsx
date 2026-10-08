"use client";
export function EncounterEnergies({
  energies,
  minimum,
  caption,
}: {
  energies: readonly number[];
  minimum: number;
  caption: string;
}) {
  const max = Math.max(100, minimum + 10, ...energies),
    x = (energy: number) => 44 + (energy / max) * 272;
  return (
    <figure className="thermal-energy">
      <svg
        role="img"
        aria-label={`${caption}. ${energies.length} constructed encounters; minimum ${minimum} illustrative energy units.`}
        viewBox="0 0 350 210"
      >
        <line x1="44" x2="316" y1="172" y2="172" stroke="#59647a" />
        {[0, max / 2, max].map((n) => (
          <g key={n}>
            <line x1={x(n)} x2={x(n)} y1="169" y2="176" stroke="#59647a" />
            <text x={x(n)} y="191" textAnchor="middle" fontSize="12">
              {n}
            </text>
          </g>
        ))}
        <line
          x1={x(minimum)}
          x2={x(minimum)}
          y1="24"
          y2="172"
          stroke="#bb6716"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <text x={x(minimum)} y="16" textAnchor="middle" fontSize="12">
          Minimum {minimum}
        </text>
        {energies.map((e, i) => (
          <g key={i}>
            <circle
              cx={x(e)}
              cy={36 + (i / (energies.length - 1)) * 120}
              r="5"
              fill={e >= minimum ? "#087967" : "#4146c8"}
            />
            <title>
              Encounter {i + 1}: energy {e}; {e >= minimum ? "meets" : "below"}{" "}
              minimum
            </title>
          </g>
        ))}
        <text x="180" y="208" textAnchor="middle" fontSize="12">
          Encounter energy / illustrative units
        </text>
      </svg>
      <figcaption>
        {caption}. Each dot is one constructed encounter, not a measured
        molecule or an animated collision. Green dots meet the energy condition;
        blue dots fall below it. Meeting this condition alone does not guarantee
        a real reaction.
      </figcaption>
      <details>
        <summary>Read the supplied energies</summary>
        <p>
          {energies.join(", ")} illustrative units. Minimum: {minimum} units.
        </p>
      </details>
    </figure>
  );
}
export function CatalysedProfile({
  reactant,
  product,
  original,
  peak,
}: {
  reactant: number;
  product: number;
  original: number;
  peak: number;
}) {
  const maximum = Math.max(100, original + 20, peak + 20),
    y = (n: number) => 180 - (n / maximum) * 140;
  const curve = (p: number) =>
    `M 45 ${y(reactant)} L 85 ${y(reactant)} C 120 ${y(reactant)} 142 ${y(p)} 174 ${y(p)} C 205 ${y(p)} 227 ${y(product)} 267 ${y(product)} L 306 ${y(product)}`;
  return (
    <figure>
      <svg
        role="img"
        aria-label={`Reaction profile. Reactants ${reactant} kJ, products ${product} kJ, original peak ${original} kJ, proposed catalysed peak ${peak} kJ for the stated reaction amount.`}
        viewBox="0 0 350 230"
      >
        <line x1="37" x2="37" y1="23" y2="200" stroke="#59647a" />
        <line x1="37" x2="320" y1="200" y2="200" stroke="#59647a" />
        <text
          x="12"
          y="105"
          transform="rotate(-90 12 105)"
          textAnchor="middle"
          fontSize="12"
        >
          Energy / kJ
        </text>
        <text x="180" y="224" textAnchor="middle" fontSize="12">
          Reaction progress
        </text>
        <path
          d={curve(original)}
          stroke="#4549ce"
          fill="none"
          strokeWidth="3"
        />
        <path
          d={curve(peak)}
          stroke="#087967"
          fill="none"
          strokeWidth="3"
          strokeDasharray="5 3"
        />
        <text
          x="65"
          y={y(reactant) + 17}
          fontSize="11"
          stroke="#fff"
          strokeWidth="3"
          paintOrder="stroke"
          textAnchor="middle"
        >
          Reactants {reactant}
        </text>
        <text
          x="276"
          y={y(product) + 17}
          fontSize="11"
          stroke="#fff"
          strokeWidth="3"
          paintOrder="stroke"
          textAnchor="middle"
        >
          Products {product}
        </text>
        <text
          x="174"
          y={y(original) - 8}
          fontSize="11"
          stroke="#fff"
          strokeWidth="3"
          paintOrder="stroke"
          textAnchor="middle"
        >
          Original peak {original}
        </text>
        <text
          x="174"
          y={Math.abs(y(peak) - y(original)) < 18 ? y(peak) + 17 : y(peak) - 8}
          fontSize="11"
          stroke="#fff"
          strokeWidth="3"
          paintOrder="stroke"
          textAnchor="middle"
        >
          Proposed peak {peak}
        </text>
      </svg>
      {peak <= Math.max(reactant, product) && (
        <p role="status">
          This proposed peak is not above both endpoint levels. It is not a
          valid single-peak pathway for the supplied reaction.
        </p>
      )}
      <figcaption>
        Blue: original pathway. Green dashed: proposed catalysed pathway.
        Reactant and product levels are fixed. Energy is not physical height;
        horizontal position is reaction progress, not time.
      </figcaption>
    </figure>
  );
}
