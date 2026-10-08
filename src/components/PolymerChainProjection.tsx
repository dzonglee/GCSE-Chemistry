import { polymerChain } from "@/lib/polymer-structures";
export function PolymerChainProjection({
  units = 3,
  highlight = false,
  assessment = false,
}: {
  units?: number;
  highlight?: boolean;
  assessment?: boolean;
}) {
  const { atoms, bonds, continuation } = polymerChain(units),
    selected = 2,
    neighbours = new Set(
      bonds
        .filter((b) => b.a === selected || b.b === selected)
        .map((b) => (b.a === selected ? b.b : b.a)),
    );
  const point = (id: number) => {
    const a = atoms[id];
    return [
      260 + (a.carbon - (units * 2 - 1) / 2) * 48,
      a.element === "C" ? 175 : (a.id - units * 2) % 2 === 0 ? 95 : 255,
    ];
  };
  return (
    <figure className="polymer-chain-projection">
      <svg
        viewBox="0 0 520 350"
        role="img"
        aria-label={
          assessment
            ? `${units} connected two-carbon sections, with two hydrogen atoms at each carbon and continuation at both ends.`
            : `A covalently joined poly(ethene) section containing ${units} shown repeat units. Interior carbon has two carbon and two hydrogen neighbours; continuation is omitted.`
        }
      >
        {bonds.map((b) => {
          const a = point(b.a),
            c = point(b.b),
            focus = highlight && (b.a === selected || b.b === selected);
          return (
            <line
              key={`${b.a}-${b.b}`}
              data-polymer-bond={`${b.a}-${b.b}`}
              x1={a[0]}
              y1={a[1]}
              x2={c[0]}
              y2={c[1]}
              stroke={focus ? "#b47e19" : "#7e8ba3"}
              strokeWidth={focus ? 4 : 2}
            />
          );
        })}
        {continuation.map((c) => {
          const a = point(c.from),
            b = [a[0] + (c.from === 0 ? -40 : 40), 175];
          return (
            <g key={c.from}>
              <line
                data-chain-continuation={c.from}
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                stroke="#8797af"
                strokeDasharray="5 4"
                strokeWidth="2"
              />
              <text x={b[0]} y={b[1] + 30} fontSize="32" textAnchor="middle">
                …
              </text>
            </g>
          );
        })}
        {atoms.map((a) => {
          const p = point(a.id),
            focus = a.id === selected,
            n = highlight && neighbours.has(a.id);
          return (
            <g key={a.id} data-polymer-atom={a.id} data-element={a.element}>
              <circle
                cx={p[0]}
                cy={p[1]}
                r={a.element === "C" ? 16 : 13}
                fill={
                  focus
                    ? "#e9c052"
                    : n
                      ? "#d2d9f5"
                      : a.element === "H"
                        ? "#edf0f6"
                        : "#d9dfe9"
                }
                stroke="#71809a"
              />
              <text x={p[0]} y={p[1] + 10} textAnchor="middle" fontSize="30">
                {a.element}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        {assessment
          ? "Letters identify atoms; lines join them. Dotted ends indicate omitted continuation. This is a short section, not a full molecular formula or measured conformation."
          : "Shown section of one very large covalently linked molecule, not many separate repeat-unit molecules. Interior carbons have four bonds. Endpoint continuation is omitted; the whole chain is much longer. This is a flat connectivity drawing; atom sizes, bond lengths and angles are schematic."}
      </figcaption>
    </figure>
  );
}
