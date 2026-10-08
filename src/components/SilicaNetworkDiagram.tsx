export function SilicaNetworkDiagram({
  assessment = false,
}: {
  assessment?: boolean;
}) {
  const centre = [200, 180],
    oxygen = [
      [200, 95],
      [285, 180],
      [200, 265],
      [115, 180],
    ],
    silicon = [
      [200, 30],
      [350, 180],
      [200, 330],
      [50, 180],
    ];
  return (
    <figure className="silica-network-diagram">
      <svg
        viewBox="0 0 400 360"
        role="img"
        aria-label={
          assessment
            ? "Si and O atom diagram. The selected Si is linked to four O markers. Each O marker links two Si markers. Further lines leave the cropped frame."
            : "Local silica network projection. Selected silicon has four oxygen neighbours; every depicted bridging oxygen connects two silicon atoms. Lines continue out of the frame, so this is not a separate Si5O4 molecule."
        }
        data-selected-si-bonds="4"
      >
        <g stroke="#718099" strokeWidth="4">
          {oxygen.map((o, i) => (
            <g key={i}>
              <line x1={centre[0]} y1={centre[1]} x2={o[0]} y2={o[1]} />
              <line x1={o[0]} y1={o[1]} x2={silicon[i][0]} y2={silicon[i][1]} />
            </g>
          ))}
          <path d="M200 30L180 0M200 30V-10M200 30L220 0M350 180L400 160M350 180H405M350 180L400 200M200 330L180 360M200 330V370M200 330L220 360M50 180L0 160M50 180H-5M50 180L0 200" />
        </g>
        {[centre, ...silicon].map((p, i) => (
          <g key={i} data-silicon={i}>
            <circle
              cx={p[0]}
              cy={p[1]}
              r="22"
              fill={i === 0 ? "#e9bf52" : "#e9e2d8"}
              stroke="#9b814d"
              strokeWidth="2"
            />
            <text
              x={p[0]}
              y={p[1] + 7}
              fontSize="24"
              textAnchor="middle"
              fill="#493c24"
            >
              Si
            </text>
          </g>
        ))}
        {oxygen.map((p, i) => (
          <g key={i} data-bridging-oxygen={i}>
            <circle
              cx={p[0]}
              cy={p[1]}
              r="19"
              fill="#f8d9df"
              stroke="#b25167"
              strokeWidth="2"
            />
            <text
              x={p[0]}
              y={p[1] + 7}
              fontSize="24"
              textAnchor="middle"
              fill="#762f41"
            >
              O
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        {assessment ? (
          "Labels identify silicon and oxygen atoms. Lines show links; some continue beyond this cropped view. Positions, radii and colours are schematic."
        ) : (
          <>
            Local 2D projection of a giant 3D silica network. Solid lines are
            covalent bonds; cut lines continue beyond the frame. This is not a
            small molecule or a full unit-cell count. The bulk formula SiO₂
            gives a 1:2 atom ratio; the cropped fragment does not supply that
            bulk ratio by simple counting.
          </>
        )}
      </figcaption>
    </figure>
  );
}
