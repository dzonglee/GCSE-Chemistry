export function PolymerRepeatDiagram({
  backbone = "single",
  hydrogens = 2,
  continuation = "yes",
  countMark = "n",
  assessment = false,
}: {
  backbone?: string;
  hydrogens?: number;
  continuation?: string;
  countMark?: string;
  assessment?: boolean;
}) {
  const carbon = [130, 290];
  return (
    <figure className="polymer-repeat-diagram">
      <svg
        viewBox="0 0 420 300"
        role="img"
        aria-label={`Two carbon letters inside brackets; ${backbone === "unset" ? "no" : backbone} joining bond; ${hydrogens} hydrogen letters per carbon; continuation ${continuation}; outside count marker ${countMark}.`}
      >
        <path
          d="M 95 40 H 80 V 245 H 95 M 325 40 H 340 V 245 H 325"
          stroke="#3548ca"
          strokeWidth="3"
          fill="none"
        />
        {backbone !== "unset" &&
          (backbone === "double" ? [-6, 6] : [0]).map((offset) => (
            <line
              key={offset}
              data-repeat-backbone={backbone}
              x1="146"
              y1={145 + offset}
              x2="274"
              y2={145 + offset}
              stroke="#53627d"
              strokeWidth="3"
            />
          ))}
        {continuation === "yes" && (
          <>
            <line
              data-repeat-continuation="left"
              x1="40"
              y1="145"
              x2="114"
              y2="145"
              stroke="#53627d"
              strokeWidth="3"
            />
            <line
              data-repeat-continuation="right"
              x1="306"
              y1="145"
              x2="380"
              y2="145"
              stroke="#53627d"
              strokeWidth="3"
            />
          </>
        )}
        {carbon.map((x, i) => (
          <g key={i}>
            <text x={x} y="155" textAnchor="middle" fontSize="32">
              C
            </text>
            {Array.from({ length: hydrogens }, (_, j) => {
              const p =
                hydrogens === 3
                  ? j < 2
                    ? [x + (j ? 30 : -30), 70]
                    : [x, 220]
                  : [x, j === 0 ? 70 : 220];
              return (
                <g key={j} data-repeat-hydrogen={`${i}-${j}`}>
                  <line
                    x1={x}
                    y1={j === 0 || (hydrogens === 3 && j < 2) ? 127 : 160}
                    x2={p[0]}
                    y2={p[1] + (p[1] < 145 ? 16 : -18)}
                    stroke="#53627d"
                    strokeWidth="2"
                  />
                  <text
                    x={p[0]}
                    y={p[1] + 10}
                    textAnchor="middle"
                    fontSize="30"
                  >
                    H
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        {countMark !== "unset" && (
          <text data-repeat-count={countMark} x="365" y="252" fontSize="32">
            {countMark}
          </text>
        )}
      </svg>
      <figcaption>
        {assessment
          ? "Letters identify elements; each line represents a bond. Brackets and the outside marker are part of the supplied representation. Diagram sizes and angles are schematic."
          : "Your proposed repeat-unit drawing. Changes stay visible until you revise them; brackets alone do not prove that the selected bonds, hydrogen counts or count marker are correct."}
      </figcaption>
    </figure>
  );
}
