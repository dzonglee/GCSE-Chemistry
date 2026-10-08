import {
  graphiteBonds,
  graphiteFocusSites,
  graphiteNeighbours,
  graphitePositions,
} from "@/lib/graphite";
export function GraphiteProjection({
  site = 0,
  highlight = false,
  shift = 0,
  drift = 0,
  electrons = false,
  assessment = false,
}: {
  site?: number;
  highlight?: boolean;
  shift?: number;
  drift?: number;
  electrons?: boolean;
  assessment?: boolean;
}) {
  const atoms = graphitePositions(shift),
    selected = graphiteFocusSites[site] ?? graphiteFocusSites[0],
    neighbours = new Set(graphiteNeighbours(selected.id).map((a) => a.id));
  const point = (id: number) => {
    const p = atoms[id].position;
    return [230 + 70 * p[0] + 30 * p[2], 245 - 24 * p[1] - 110 * p[2]];
  };
  return (
    <figure className="graphite-projection">
      <svg
        viewBox="0 0 460 490"
        role="img"
        aria-label={
          assessment
            ? "Cropped carbon diagram showing stacked patterns of six-membered rings. Three links join the selected carbon to neighbours in its own pattern."
            : "Three stacked graphite sheets: three covalent neighbours per selected interior carbon, no covalent links between sheets. The fragment omits edge continuation."
        }
      >
        {graphiteBonds.map((b) => {
          const a = point(b.a),
            c = point(b.b),
            focus =
              highlight &&
              !electrons &&
              (b.a === selected.id || b.b === selected.id);
          return (
            <line
              key={`${b.a}-${b.b}`}
              data-graphite-bond={`${b.a}-${b.b}`}
              data-graphite-selected-bond={focus}
              x1={a[0]}
              y1={a[1]}
              x2={c[0]}
              y2={c[1]}
              stroke={
                focus
                  ? "#b47e19"
                  : ["#a3aec5", "#6c7e9a", "#36465c"][atoms[b.a].layer]
              }
              strokeWidth={focus ? 5 : 2}
            />
          );
        })}
        {atoms.map((a) => {
          const p = point(a.id),
            focus = a.id === selected.id && !electrons,
            n = highlight && !electrons && neighbours.has(a.id);
          return (
            <g
              key={a.id}
              data-graphite-carbon={a.id}
              data-graphite-layer={a.layer}
            >
              <circle
                cx={p[0]}
                cy={p[1]}
                r={focus ? 15 : n ? 9 : 4}
                fill={
                  focus
                    ? "#e9c052"
                    : n
                      ? "#3548ca"
                      : ["#a3aec5", "#6c7e9a", "#36465c"][a.layer]
                }
              />
              {focus && (
                <text x={p[0]} y={p[1] + 9} fontSize="30" textAnchor="middle">
                  C
                </text>
              )}
            </g>
          );
        })}
        {electrons &&
          atoms.map((a) => {
            const p = point(a.id);
            return (
              <circle
                key={a.id}
                data-graphite-electron={a.id}
                cx={p[0] - 19 + drift * 2}
                cy={p[1] - 12}
                r="2.5"
                fill="#7444b6"
              />
            );
          })}
      </svg>
      <figcaption>
        {assessment
          ? "Circles represent carbon atoms; lines join atoms. This is a cropped view; sizes, spacing and colours are schematic."
          : "Oblique projection of three extended hexagonal sheets. All solid links are strong covalent bonds within a sheet; no covalent links join sheets. Cut-edge continuation is omitted. Highlight colour identifies one interior site, not a different bond strength."}
        {electrons &&
          !assessment &&
          " Purple markers represent a mobile delocalised-electron pool: one contribution per represented carbon, not electrons owned by or orbiting the closest atom."}
      </figcaption>
    </figure>
  );
}
