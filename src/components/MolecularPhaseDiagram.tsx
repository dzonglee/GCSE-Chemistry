import {
  molecularLedger,
  type MolecularPhase,
} from "@/lib/molecular-properties";
/** Schematic equal-inventory comparison: bond lines remain within each pair. */
export function MolecularPhaseDiagram({ phase }: { phase: MolecularPhase }) {
  const centres =
    phase === "liquid"
      ? [
          [130, 110],
          [235, 110],
          [130, 190],
          [235, 190],
        ]
      : [
          [65, 65],
          [285, 65],
          [90, 245],
          [300, 220],
        ];
  const ledger = molecularLedger(phase);
  return (
    <figure className="molecular-phase-diagram">
      <svg
        viewBox="0 0 380 310"
        role="img"
        aria-label={`${phase} chlorine: four intact neutral Cl2 molecules, eight chlorine atoms and four unchanged covalent bonds. ${phase === "liquid" ? "Dashed attractions connect neighbouring molecules." : "Molecules are farther apart; this does not break their internal bonds."}`}
        data-phase={phase}
        data-molecules={ledger.molecules}
        data-atoms={ledger.atoms}
      >
        {phase === "liquid" && (
          <g
            stroke="#b37f23"
            strokeWidth="3"
            strokeDasharray="5 5"
            data-intermolecular-attractions="true"
          >
            <path d="M160 110H205 M130 140V160 M235 140V160 M160 190H205" />
          </g>
        )}
        {centres.map(([x, y], i) => (
          <g key={i} data-intact-molecule={i + 1}>
            <line
              x1={x - 20}
              y1={y}
              x2={x + 20}
              y2={y}
              stroke="#3048ca"
              strokeWidth="5"
              data-covalent-bond="true"
            />
            {[-25, 25].map((offset) => (
              <g key={offset}>
                <circle
                  cx={x + offset}
                  cy={y}
                  r="21"
                  fill="#e2f3e7"
                  stroke="#26734c"
                  strokeWidth="2"
                />
                <text
                  x={x + offset}
                  y={y + 7}
                  textAnchor="middle"
                  fontSize="20"
                  fill="#183e2c"
                >
                  Cl
                </text>
              </g>
            ))}
          </g>
        ))}
        <text x="190" y="294" textAnchor="middle" fontSize="18" fill="#3b465d">
          4 Cl₂ molecules · 8 atoms · 4 bonds
        </text>
      </svg>
      <figcaption>
        Solid blue: strong covalent bonds WITHIN molecules. Dashed gold: weaker
        attractions BETWEEN molecules in the liquid. Positions and distances are
        schematic; the gas still has intermolecular attractions, usually much
        less significant at these larger separations.
      </figcaption>
    </figure>
  );
}
