import {
  fullereneAtoms,
  fullereneBonds,
  fullereneFocusRings,
} from "@/lib/fullerenes";
export function FullereneProjection({
  ring = 0,
  highlight = false,
  payload = false,
  assessment = false,
}: {
  ring?: number;
  highlight?: boolean;
  payload?: boolean;
  assessment?: boolean;
}) {
  const selected = fullereneFocusRings[ring] ?? fullereneFocusRings[0],
    members = new Set(selected);
  const point = (id: number) => {
    const [x, y, z] = fullereneAtoms[id].position,
      c = Math.cos(0.35),
      s = Math.sin(0.35),
      xx = x * c + z * s,
      zz = -x * s + z * c;
    return [
      260 + 132 * xx,
      245 - 132 * (y * Math.cos(0.2) - zz * Math.sin(0.2)),
      y * Math.sin(0.2) + zz * Math.cos(0.2),
    ];
  };
  return (
    <figure className="fullerene-projection">
      <svg
        viewBox="0 0 520 490"
        role="img"
        aria-label={
          assessment
            ? `Carbon drawing showing a closed roughly spherical framework with an empty centre. The highlighted closed perimeter contains ${selected.length} carbon circles joined in one loop; lines join the circles.`
            : "C60 closed hollow carbon cage with sixty atoms and five- and six-membered rings. Highlighting selects one complete ring, not a separate molecule."
        }
      >
        {payload && (
          <g data-conceptual-payload>
            <circle cx="260" cy="245" r="25" fill="#7444b6" />
            <text
              x="260"
              y="254"
              textAnchor="middle"
              fill="white"
              fontSize="30"
            >
              P
            </text>
          </g>
        )}
        {fullereneBonds.map((b) => {
          const a = point(b.a),
            c = point(b.b),
            selectedBond = highlight && members.has(b.a) && members.has(b.b);
          return (
            <line
              key={`${b.a}-${b.b}`}
              data-fullerene-bond={`${b.a}-${b.b}`}
              data-selected-ring-bond={selectedBond}
              x1={a[0]}
              y1={a[1]}
              x2={c[0]}
              y2={c[1]}
              stroke={selectedBond ? "#b47e19" : "#8797af"}
              strokeWidth={selectedBond ? 5 : 2}
              opacity={selectedBond ? 1 : (a[2] + c[2]) / 2 > 0 ? 1 : 0.35}
            />
          );
        })}
        {[...fullereneAtoms]
          .sort((a, b) => point(a.id)[2] - point(b.id)[2])
          .map((a) => {
            const p = point(a.id),
              focus = highlight && members.has(a.id);
            return (
              <circle
                key={a.id}
                data-fullerene-carbon={a.id}
                data-selected-ring-carbon={focus}
                cx={p[0]}
                cy={p[1]}
                r={focus ? 9 : 4.5}
                fill={focus ? "#e9c052" : "#505e77"}
                opacity={focus || p[2] > 0 ? 1 : 0.4}
              />
            );
          })}
      </svg>
      <figcaption>
        {assessment
          ? "Circles represent carbon atoms; lines join atoms. This is a projection of a closed framework, with front and rear edges visible. Sizes and gaps are schematic."
          : "Projection of one complete C₆₀ molecule. Rings share atoms/edges within a single closed cage. Colours and thicker highlights identify the selected ring; all links are covalent cage links. Positions and equal drawn links are ideal geometry, not measured bond lengths or localised bond orders."}
        {payload &&
          " P is a conceptual enclosed payload, not an actual drug, measured molecular fit or evidence of safety."}
      </figcaption>
    </figure>
  );
}
