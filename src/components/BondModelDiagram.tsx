import {
  covalentMolecules,
  moleculePositions,
  type CovalentMolecule,
} from "@/lib/covalent";
export function BondModelDiagram({
  molecule,
  proposedOrders,
}: {
  molecule: CovalentMolecule;
  proposedOrders?: number[];
}) {
  const spec = covalentMolecules[molecule],
    orders = proposedOrders ?? spec.orders,
    atoms = [spec.centre, ...spec.partners],
    projected = moleculePositions(molecule).map(([x, y, z]) => [
      180 + 65 * (x + 0.45 * z),
      140 - 65 * (y - 0.3 * z),
    ]);
  return (
    <figure
      className={`covalent-diagram${proposedOrders ? " molecular-line-preview" : ""}`}
    >
      <svg
        viewBox="0 0 360 280"
        role="img"
        aria-label={`${proposedOrders ? "Your proposed bond-line diagram" : "Molecular bond model"}. Atom symbols: ${atoms.map((a) => a.symbol).join(", ")}. Connections from reference to each partner; lines per connection ${orders.join(", ")}. Illustrative 2D projection.`}
      >
        {orders.flatMap((order, i) => {
          const start = projected[0],
            end = projected[i + 1],
            dx = end[0] - start[0],
            dy = end[1] - start[1],
            distance = Math.hypot(dx, dy);
          return Array.from({ length: order }, (_, j) => {
            const offset = (j - (order - 1) / 2) * 6;
            return (
              <line
                key={`${i}-${j}`}
                x1={start[0] - (dy / distance) * offset}
                y1={start[1] + (dx / distance) * offset}
                x2={end[0] - (dy / distance) * offset}
                y2={end[1] + (dx / distance) * offset}
                stroke="#8793a9"
                strokeWidth="3"
              />
            );
          });
        })}
        {atoms.map((atom, i) => (
          <g key={i}>
            <circle
              cx={projected[i][0]}
              cy={projected[i][1]}
              r={atom.symbol === "H" ? 17 : 23}
              fill="#edf0ff"
              stroke="#6475a5"
            />
            <text
              x={projected[i][0]}
              y={projected[i][1] + 6}
              fontSize="21"
              textAnchor="middle"
            >
              {atom.symbol}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        {proposedOrders
          ? "Your proposed atoms and bond lines; no counts are corrected."
          : "Atoms and covalent bonds."}{" "}
        Each line represents one shared pair. Colours, sizes and positions are
        schematic. The drawing omits the unshared electrons.
      </figcaption>
    </figure>
  );
}
