export function PolymerSeparation({ gap = 0 }: { gap?: number }) {
  const point = (chain: number, carbon: number, hydrogen?: number) => [
    70 + carbon * 52,
    (chain ? 280 + gap * 10 : 100 - gap * 10) +
      (hydrogen === undefined ? 0 : hydrogen === 0 ? -35 : 35),
  ];
  return (
    <figure className="polymer-separation">
      <svg
        viewBox="0 0 520 380"
        role="img"
        aria-label="Two intact polymer-chain sections, each with eight carbon atoms and sixteen hydrogen atoms. Dashed attractions between molecules are distinct from internal covalent bonds."
      >
        {[0, 1].map((chain) => (
          <g key={chain} data-intact-polymer-chain={chain}>
            {Array.from({ length: 8 }, (_, i) => {
              const c = point(chain, i);
              return (
                <g key={i}>
                  {i < 7 && (
                    <line
                      data-polymer-internal-bond={`${chain}-C${i}-C${i + 1}`}
                      x1={c[0] + 12}
                      y1={c[1]}
                      x2={c[0] + 40}
                      y2={c[1]}
                      stroke="#63718d"
                      strokeWidth="2"
                    />
                  )}
                  {[0, 1].map((h) => {
                    const p = point(chain, i, h);
                    return (
                      <g key={h}>
                        <line
                          data-polymer-internal-bond={`${chain}-C${i}-H${h}`}
                          x1={c[0]}
                          y1={c[1] + (h ? 12 : -12)}
                          x2={p[0]}
                          y2={p[1] + (h ? -12 : 12)}
                          stroke="#63718d"
                          strokeWidth="2"
                        />
                        <text
                          data-chain-hydrogen={`${chain}-${i}-${h}`}
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
                  <text
                    data-chain-carbon={`${chain}-${i}`}
                    x={c[0]}
                    y={c[1] + 10}
                    textAnchor="middle"
                    fontSize="30"
                  >
                    C
                  </text>
                </g>
              );
            })}
            <text x="25" y={point(chain, 0)[1] + 10} fontSize="30">
              …
            </text>
            <text x="478" y={point(chain, 0)[1] + 10} fontSize="30">
              …
            </text>
          </g>
        ))}
        {[174, 330].map((x) => (
          <line
            key={x}
            data-between-chain-attraction
            x1={x}
            y1={155 - gap * 10}
            x2={x}
            y2={225 + gap * 10}
            stroke="#b68a27"
            strokeWidth="3"
            strokeDasharray="6 5"
          />
        ))}
      </svg>
      <figcaption>
        Two unchanged molecular sections with continuation omitted at both ends.
        Solid links are internal covalent bonds; dashed lines represent
        between-molecule attractions. Separation changes spacing, not either
        chain’s connectivity. Schematic geometry, not a phase threshold.
      </figcaption>
    </figure>
  );
}
