import { PolymerRepeatDiagram } from "./PolymerRepeatDiagram";
export function PolymerPhaseComparison() {
  return (
    <div className="polymer-phase-comparison">
      <p>
        <strong>Supplied room-temperature evidence:</strong> methane is a gas;
        poly(ethene) is a solid. Both contain strong covalent bonds within their
        molecules.
      </p>
      <div className="polymer-phase-cards">
        <div>
          <strong>Methane: small CH₄ molecules</strong>
          <svg
            viewBox="0 0 250 240"
            role="img"
            aria-label="One methane molecule with one carbon singly bonded to four hydrogens."
          >
            <path
              d="M 125 65 V 97 M 125 137 V 170 M 70 117 H 103 M 147 117 H 180"
              stroke="#63718d"
              strokeWidth="3"
            />
            {[
              ["C", 125, 127],
              ["H", 125, 50],
              ["H", 125, 205],
              ["H", 45, 127],
              ["H", 205, 127],
            ].map(([t, x, y]) => (
              <text
                key={`${x}-${y}`}
                x={Number(x)}
                y={Number(y)}
                textAnchor="middle"
                fontSize="32"
              >
                {t}
              </text>
            ))}
          </svg>
        </div>
        <div>
          <strong>Poly(ethene): very large chains</strong>
          <PolymerRepeatDiagram assessment />
        </div>
      </div>
      <p>
        Compare forces between molecules and the energy needed to overcome them.
        The repeating drawing represents a long molecule; n is large.
      </p>
    </div>
  );
}
