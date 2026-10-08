export function IonicSlice({
  assessment = false,
}: { assessment?: boolean } = {}) {
  return (
    <figure>
      <svg
        viewBox="0 0 320 300"
        role="img"
        aria-label={
          assessment
            ? "Supplied ion diagram: four rows of four alternating Na+ and Cl- ions. Blue represents Na+, purple represents Cl-."
            : "Finite 2D slice of a sodium chloride lattice: four rows of four alternating Na+ and Cl- ions, eight of each. The 3D crystal continues beyond this slice."
        }
      >
        {Array.from({ length: 16 }, (_, i) => {
          const x = i % 4,
            y = Math.floor(i / 4),
            positive = (x + y) % 2 === 0;
          return (
            <g key={i}>
              <circle
                cx={50 + 73 * x}
                cy={45 + 68 * y}
                r={positive ? 24 : 30}
                fill={positive ? "#3f4fd0" : "#783ac6"}
              />
              <text
                x={50 + 73 * x}
                y={51 + 68 * y}
                textAnchor="middle"
                fontSize="19"
                fill="white"
              >
                {positive ? "Na⁺" : "Cl⁻"}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        {assessment
          ? "Blue: Na⁺ · Purple: Cl⁻. Supplied ion diagram."
          : "Finite 2D slice; illustrative sizes and colours. The giant 3D lattice continues beyond the slice."}
      </figcaption>
    </figure>
  );
}
