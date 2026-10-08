import {
  diamondAtoms,
  diamondBonds,
  diamondFocusSites,
  diamondNeighbours,
} from "@/lib/diamond";
export function DiamondProjection({
  site = 0,
  highlight = false,
  assessment = false,
}: {
  site?: number;
  highlight?: boolean;
  assessment?: boolean;
}) {
  const selected = diamondFocusSites[site] ?? diamondFocusSites[0],
    neighbours = new Set(diamondNeighbours(selected.id).map((a) => a.id));
  const point = (id: number) => {
    const [x, y, z] = diamondAtoms[id].position;
    return [260 + 70 * (x - z * 0.4), 215 - 70 * (y + z * 0.3)];
  };
  return (
    <figure className="diamond-projection">
      <svg
        viewBox="0 0 520 430"
        role="img"
        aria-label={
          assessment
            ? "Cropped carbon-atom diagram: circles joined by lines. The selected C is linked to four neighbouring carbon circles, which have further links extending through the drawing."
            : "Finite projected diamond network of 64 carbon atoms. Every selected interior carbon has four covalently bonded neighbours. Edge continuation is omitted; this is not a C64 molecule."
        }
        data-atoms="64"
        data-focus={selected.id}
      >
        {diamondBonds.map((b) => {
          const a = point(b.a),
            c = point(b.b),
            focused = highlight && (b.a === selected.id || b.b === selected.id);
          return (
            <line
              key={`${b.a}-${b.b}`}
              data-covalent-network-bond={`${b.a}-${b.b}`}
              data-selected-bond={focused}
              x1={a[0]}
              y1={a[1]}
              x2={c[0]}
              y2={c[1]}
              stroke={focused ? "#b47e19" : "#a4aec2"}
              strokeWidth={focused ? 5 : 2}
            />
          );
        })}
        {[...diamondAtoms]
          .sort((a, b) => a.position[2] - b.position[2])
          .map((atom) => {
            const p = point(atom.id),
              focus = atom.id === selected.id,
              neighbor = highlight && neighbours.has(atom.id);
            return (
              <g
                key={atom.id}
                data-network-carbon={atom.id}
                data-focus-neighbour={neighbor}
              >
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={focus ? 16 : neighbor ? 9 : 4}
                  fill={focus ? "#e9c052" : neighbor ? "#3548ca" : "#505e77"}
                />
                {focus && (
                  <text
                    x={p[0]}
                    y={p[1] + 9}
                    textAnchor="middle"
                    fontSize="30"
                    fill="#242d3e"
                  >
                    C
                  </text>
                )}
              </g>
            );
          })}
      </svg>
      <figcaption>
        {assessment ? (
          "Circles represent carbon atoms; lines show links. This is a cropped view. Sizes, gaps and colours are schematic."
        ) : (
          <>
            Oblique projection, not a flat molecular sheet. Colours and thicker
            highlighted bonds identify the selected site; all links represent
            strong covalent bonds. Boundary continuation, physical atom radii
            and electrons are omitted.
          </>
        )}
      </figcaption>
    </figure>
  );
}
