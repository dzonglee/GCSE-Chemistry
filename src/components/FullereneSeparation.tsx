import { fullereneAtoms, fullereneBonds } from "@/lib/fullerenes";
export function FullereneSeparation({ gap = 0 }: { gap?: number }) {
  const centres = [190 - gap * 24, 430 + gap * 24];
  const point = (id: number) => {
    const [x, y, z] = fullereneAtoms[id].position,
      xx = x * Math.cos(0.35) + z * Math.sin(0.35),
      zz = -x * Math.sin(0.35) + z * Math.cos(0.35);
    return [xx, y * Math.cos(0.2) - zz * Math.sin(0.2)];
  };
  return (
    <figure className="fullerene-separation">
      <svg
        viewBox="0 0 620 300"
        role="img"
        aria-label="Two intact C60 molecules, each with sixty carbon circles and ninety internal links. A dashed between-molecule attraction separates the cages; it is not a covalent bond."
      >
        <line
          data-intermolecular-link
          x1={centres[0] + 105}
          x2={centres[1] - 105}
          y1="150"
          y2="150"
          stroke="#8797af"
          strokeDasharray="5 6"
        />
        {centres.map((centre, molecule) => (
          <g key={molecule} data-intact-cage={molecule}>
            {fullereneBonds.map((b) => (
              <line
                key={`${b.a}-${b.b}`}
                data-cage-internal-bond={`${molecule}:${b.a}-${b.b}`}
                x1={centre + 57 * point(b.a)[0]}
                y1={150 - 57 * point(b.a)[1]}
                x2={centre + 57 * point(b.b)[0]}
                y2={150 - 57 * point(b.b)[1]}
                stroke="#8797af"
                strokeWidth="1.5"
              />
            ))}
            {fullereneAtoms.map((a) => (
              <circle
                key={a.id}
                data-separated-cage-carbon={`${molecule}:${a.id}`}
                cx={centre + 57 * point(a.id)[0]}
                cy={150 - 57 * point(a.id)[1]}
                r="2.5"
                fill="#505e77"
              />
            ))}
            <text x={centre} y="275" textAnchor="middle" fontSize="34">
              C₆₀
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        Separate unchanged molecules: all 120 carbon circles and 180 internal
        covalent links remain. The dashed between-molecule interaction is
        schematic, not an internal covalent bond, measured force or
        phase-transition temperature.
      </figcaption>
    </figure>
  );
}
