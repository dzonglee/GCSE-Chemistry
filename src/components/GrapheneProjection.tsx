import {
  grapheneAtoms,
  grapheneBonds,
  grapheneFocusSites,
  grapheneNeighbours,
} from "@/lib/graphene";
export function GrapheneProjection({
  site = 0,
  highlight = false,
  assessment = false,
}: {
  site?: number;
  highlight?: boolean;
  assessment?: boolean;
}) {
  const selected = grapheneFocusSites[site] ?? grapheneFocusSites[0],
    neighbours = new Set(grapheneNeighbours(selected.id).map((a) => a.id));
  const point = (id: number) => {
    const p = grapheneAtoms[id].position;
    return [250 + 95 * p[0], 215 - 65 * p[1]];
  };
  return (
    <figure className="graphene-projection">
      <svg
        viewBox="0 0 500 430"
        role="img"
        aria-label={
          assessment
            ? "Cropped carbon drawing: interconnected six-membered rings form one planar pattern. Three lines meet the selected carbon."
            : "One graphene sheet, with three coplanar covalent neighbours around the selected interior carbon. The drawing is a finite crop of an extended network."
        }
      >
        {grapheneBonds.map((b) => {
          const a = point(b.a),
            c = point(b.b),
            focused = highlight && (b.a === selected.id || b.b === selected.id);
          return (
            <line
              key={`${b.a}-${b.b}`}
              data-graphene-bond={`${b.a}-${b.b}`}
              data-graphene-selected-bond={focused}
              x1={a[0]}
              y1={a[1]}
              x2={c[0]}
              y2={c[1]}
              stroke={focused ? "#b47e19" : "#8797af"}
              strokeWidth={focused ? 5 : 2}
            />
          );
        })}
        {grapheneAtoms.map((a) => {
          const p = point(a.id),
            focus = a.id === selected.id,
            n = highlight && neighbours.has(a.id);
          return (
            <g key={a.id} data-graphene-carbon={a.id}>
              <circle
                cx={p[0]}
                cy={p[1]}
                r={focus ? 18 : n ? 10 : 5}
                fill={focus ? "#e9c052" : n ? "#3548ca" : "#505e77"}
              />
              {focus && (
                <text x={p[0]} y={p[1] + 10} textAnchor="middle" fontSize="30">
                  C
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption>
        {assessment
          ? "Circles represent carbon atoms; lines join atoms. This is a cropped view; sizes and gaps are schematic."
          : "Face-on projection of one extended hexagonal sheet. Three strong covalent links meet each selected interior carbon. Cut-edge continuation is omitted; the 32 represented atoms are not a C₃₂ molecule. Colour and thicker highlights identify a site, not different bond strengths."}
      </figcaption>
    </figure>
  );
}
