import { canonicalHydrogens } from "@/lib/cracking";
import { AlkeneDisplayed } from "./AlkeneDisplayed";
export interface HydrocarbonGivenData {
  carbons: number;
  doubleBond: number | null;
  ring?: boolean;
}
export function HydrocarbonGiven({
  carbons,
  doubleBond,
  ring = false,
}: HydrocarbonGivenData) {
  if (!ring) {
    const flags: Record<string, string> = {};
    for (let c = 0; c < carbons; c++)
      for (let slot = 0; slot < 4; slot++)
        flags["h" + (4 * c + slot)] = canonicalHydrogens(
          carbons,
          doubleBond,
          c,
        ).includes(slot)
          ? "yes"
          : "no";
    return (
      <figure className="hydrocarbon-given">
        <figcaption>Original supplied displayed structure</figcaption>
        <AlkeneDisplayed
          n={carbons}
          double={doubleBond}
          flags={flags}
          supplied
        />
      </figure>
    );
  }
  const cs = [
      [100, 100],
      [220, 100],
      [220, 220],
      [100, 220],
    ],
    hs = [
      [
        [100, 40],
        [40, 100],
      ],
      [
        [220, 40],
        [280, 100],
      ],
      [
        [280, 220],
        [220, 280],
      ],
      [
        [40, 220],
        [100, 280],
      ],
    ];
  return (
    <figure className="hydrocarbon-given">
      <figcaption>
        Original supplied four-carbon ring; every bond shown is single.
      </figcaption>
      <div
        className="alkene-diagram-scroll"
        role="region"
        aria-label="Supplied ring structure"
        tabIndex={0}
      >
        <svg
          viewBox="0 0 320 320"
          role="img"
          aria-label="Four carbon atoms joined in a ring by four single bonds; each carbon is bonded to two hydrogen atoms."
          style={{ minWidth: 160, maxWidth: 320 }}
        >
          {cs.map(([x, y], i) => {
            const next = cs[(i + 1) % 4];
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={y}
                  x2={next[0]}
                  y2={next[1]}
                  stroke="#445674"
                  strokeWidth="3"
                />
                {hs[i].map(([hx, hy], j) => (
                  <g key={j}>
                    <line
                      x1={x}
                      y1={y}
                      x2={hx}
                      y2={hy}
                      stroke="#445674"
                      strokeWidth="3"
                    />
                    <circle cx={hx} cy={hy} r="18" fill="white" />
                    <text x={hx} y={hy + 9} textAnchor="middle">
                      H
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
          {cs.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="18" fill="white" />
              <text x={x} y={y + 9} textAnchor="middle">
                C
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p>
        Displayed structure; the square layout does not claim actual bond
        angles.
      </p>
    </figure>
  );
}
