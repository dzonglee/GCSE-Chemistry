import { bondReactions } from "@/lib/bond-energy";
type Species =
  | "H2"
  | "Cl2"
  | "HCl"
  | "N2"
  | "NH3"
  | "O2"
  | "H2O"
  | "CH4"
  | "CO2"
  | "Br2"
  | "CH3Br"
  | "HBr";
const drawings: Record<
  Species,
  { symbols: string[]; points: [number, number][]; orders: number[] }
> = {
  H2: {
    symbols: ["H", "H"],
    points: [
      [55, 90],
      [145, 90],
    ],
    orders: [1],
  },
  Cl2: {
    symbols: ["Cl", "Cl"],
    points: [
      [55, 90],
      [145, 90],
    ],
    orders: [1],
  },
  HCl: {
    symbols: ["H", "Cl"],
    points: [
      [55, 90],
      [145, 90],
    ],
    orders: [1],
  },
  N2: {
    symbols: ["N", "N"],
    points: [
      [55, 90],
      [145, 90],
    ],
    orders: [3],
  },
  O2: {
    symbols: ["O", "O"],
    points: [
      [55, 90],
      [145, 90],
    ],
    orders: [2],
  },
  Br2: {
    symbols: ["Br", "Br"],
    points: [
      [55, 90],
      [145, 90],
    ],
    orders: [1],
  },
  HBr: {
    symbols: ["H", "Br"],
    points: [
      [55, 90],
      [145, 90],
    ],
    orders: [1],
  },
  CH4: {
    symbols: ["C", "H", "H", "H", "H"],
    points: [
      [100, 90],
      [100, 30],
      [35, 90],
      [165, 90],
      [100, 150],
    ],
    orders: [1, 1, 1, 1],
  },
  CH3Br: {
    symbols: ["C", "H", "H", "Br", "H"],
    points: [
      [100, 90],
      [100, 30],
      [35, 90],
      [165, 90],
      [100, 150],
    ],
    orders: [1, 1, 1, 1],
  },
  NH3: {
    symbols: ["N", "H", "H", "H"],
    points: [
      [100, 90],
      [100, 30],
      [35, 120],
      [165, 120],
    ],
    orders: [1, 1, 1],
  },
  H2O: {
    symbols: ["O", "H", "H"],
    points: [
      [100, 65],
      [40, 120],
      [160, 120],
    ],
    orders: [1, 1],
  },
  CO2: {
    symbols: ["C", "O", "O"],
    points: [
      [100, 90],
      [25, 90],
      [175, 90],
    ],
    orders: [2, 2],
  },
};
const equations: Record<string, [number, Species][][]> = {
  hydrogenChloride: [
    [
      [1, "H2"],
      [1, "Cl2"],
    ],
    [[2, "HCl"]],
  ],
  water: [
    [
      [2, "H2"],
      [1, "O2"],
    ],
    [[2, "H2O"]],
  ],
  ammonia: [
    [
      [1, "N2"],
      [3, "H2"],
    ],
    [[2, "NH3"]],
  ],
  ammoniaOxidation: [
    [
      [4, "NH3"],
      [3, "O2"],
    ],
    [
      [2, "N2"],
      [6, "H2O"],
    ],
  ],
  methane: [
    [
      [1, "CH4"],
      [2, "O2"],
    ],
    [
      [1, "CO2"],
      [2, "H2O"],
    ],
  ],
  splitHCl: [
    [[2, "HCl"]],
    [
      [1, "H2"],
      [1, "Cl2"],
    ],
  ],
  doubleHCl: [
    [
      [2, "H2"],
      [2, "Cl2"],
    ],
    [[4, "HCl"]],
  ],
  bromination: [
    [
      [1, "CH4"],
      [1, "Br2"],
    ],
    [
      [1, "CH3Br"],
      [1, "HBr"],
    ],
  ],
};
export function BondReactionDiagram({ reaction }: { reaction: string }) {
  const base = reaction.startsWith("unknown")
      ? reaction === "unknownOH"
        ? "water"
        : "hydrogenChloride"
      : reaction,
    sides = equations[base];
  return (
    <figure className="bond-reaction-diagram">
      <figcaption>
        {bondReactions[reaction].equation}. Displayed formulae; each picture
        represents one molecule. Apply the labelled coefficient to that entire
        molecule.
      </figcaption>
      {sides.map((side, i) => (
        <div
          role="group"
          key={i}
          aria-label={
            i ? "Product displayed formulae" : "Reactant displayed formulae"
          }
        >
          <p className="bond-side-heading">
            <strong>{i ? "Products" : "Reactants"}</strong>
          </p>
          <div className="bond-formula-grid">
            {side.map(([coefficient, species]) => {
              const d = drawings[species];
              return (
                <div key={species}>
                  <strong>
                    {coefficient} ×{" "}
                    {species.replace(/\d/g, (n) => "₀₁₂₃₄₅₆₇₈₉"[Number(n)])}
                  </strong>
                  <svg
                    viewBox="0 0 200 180"
                    role="img"
                    aria-label={`${species} displayed formula; atoms ${d.symbols.join(", ")}; reference atom connects with bond orders ${d.orders.join(", ")}`}
                    data-species={species}
                    data-coefficient={coefficient}
                    data-bond-connections={d.orders.length}
                    data-bond-orders={d.orders.join(",")}
                  >
                    {d.orders.flatMap((order, j) => {
                      const [x, y] = d.points[0],
                        [u, v] = d.points[j + 1],
                        dx = u - x,
                        dy = v - y,
                        length = Math.hypot(dx, dy);
                      return Array.from({ length: order }, (_, n) => {
                        const offset = (n - (order - 1) / 2) * 6;
                        return (
                          <line
                            key={j + "-" + n}
                            x1={x + dx * 0.23 - (dy / length) * offset}
                            y1={y + dy * 0.23 + (dx / length) * offset}
                            x2={u - dx * 0.23 - (dy / length) * offset}
                            y2={v - dy * 0.23 + (dx / length) * offset}
                            stroke="#475569"
                            strokeWidth="2"
                          />
                        );
                      });
                    })}
                    {d.symbols.map((s, j) => (
                      <text
                        key={j}
                        x={d.points[j][0]}
                        y={d.points[j][1] + 8}
                        fontSize="26"
                        textAnchor="middle"
                        fill="#172033"
                      >
                        {s}
                      </text>
                    ))}
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </figure>
  );
}
