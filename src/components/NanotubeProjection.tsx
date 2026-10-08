import {
  nanotubeAtoms,
  nanotubeBonds,
  nanotubeFocusSites,
  nanotubeNeighbours,
} from "@/lib/nanotubes";
export function NanotubeProjection({
  site = 0,
  highlight = false,
  assessment = false,
}: {
  site?: number;
  highlight?: boolean;
  assessment?: boolean;
}) {
  const selected = nanotubeFocusSites[site] ?? nanotubeFocusSites[0],
    neighbours = new Set(nanotubeNeighbours(selected.id).map((a) => a.id));
  const point = (id: number) => {
    const [x, y, z] = nanotubeAtoms[id].position;
    return [240 + 105 * (x * 0.94 + z * 0.34), 245 - 100 * y + 20 * z];
  };
  return (
    <figure className="nanotube-projection">
      <svg
        viewBox="0 0 480 490"
        role="img"
        aria-label={
          assessment
            ? "Carbon circles and links form a hollow cylindrical wall with a joined seam and cut ends; three links meet the selected interior circle."
            : "A single joined hollow nanotube wall. Three covalent neighbours meet the selected interior carbon; open ends are cut boundaries."
        }
      >
        {nanotubeBonds.map((b) => {
          const a = point(b.a),
            c = point(b.b),
            focused = highlight && (b.a === selected.id || b.b === selected.id);
          return (
            <line
              key={`${b.a}-${b.b}`}
              data-nanotube-bond={`${b.a}-${b.b}`}
              data-nanotube-selected-bond={focused}
              x1={a[0]}
              y1={a[1]}
              x2={c[0]}
              y2={c[1]}
              stroke={focused ? "#b47e19" : "#8797af"}
              strokeWidth={focused ? 5 : 2}
              opacity={
                focused ? 1 : nanotubeAtoms[b.a].position[2] > 0 ? 0.9 : 0.45
              }
            />
          );
        })}
        {nanotubeAtoms.map((a) => {
          const p = point(a.id),
            focus = a.id === selected.id,
            n = highlight && neighbours.has(a.id);
          return (
            <circle
              key={a.id}
              data-nanotube-carbon={a.id}
              cx={p[0]}
              cy={p[1]}
              r={focus ? 8 : n ? 6 : 3.5}
              fill={focus ? "#e9c052" : n ? "#3548ca" : "#505e77"}
              opacity={focus || n ? 1 : a.position[2] > 0 ? 1 : 0.6}
            />
          );
        })}
      </svg>
      <figcaption>
        {assessment
          ? "Circles represent carbon atoms; lines join atoms. This is a cropped drawing with cut ends, not measured dimensions."
          : "The circumference joins across the seam. Three strong covalent links meet each selected interior carbon. Cut-end continuation and termination are omitted; the 72 displayed atoms are not a C₇₂ molecular formula. This single-wall schematic is not every possible nanotube."}
      </figcaption>
    </figure>
  );
}
