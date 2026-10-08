/** Original schematic; dot positions show counts, never electron paths. */
export function ShellDiagram({
  counts,
  label = "Electron shell diagram",
  guides = false,
  labelFontSize = 10,
  textLegend = false,
  tightView = false,
  viewRings = counts.length,
}: {
  counts: readonly number[];
  label?: string;
  guides?: boolean;
  labelFontSize?: number;
  textLegend?: boolean;
  tightView?: boolean;
  viewRings?: number;
}) {
  const rings = guides ? 4 : Math.max(1, counts.length);
  const radius = 42 + (Math.max(rings, viewRings) - 1) * 36;
  const extent = radius + 14;
  const description = `${label}. ${counts.map((n, i) => `Shell ${i + 1}: ${n} electron${n === 1 ? "" : "s"}`).join(". ")}. Nucleus magnified; not to scale. Rings are energy-level guides, not electron paths.`;
  return (
    <figure className={`shell-diagram${textLegend ? " with-text-legend" : ""}`}>
      <svg
        viewBox={
          textLegend || tightView
            ? `${170 - extent} ${170 - extent} ${extent * 2} ${extent * 2}`
            : "0 0 340 340"
        }
        role="img"
        aria-label={description}
        data-shells={counts.join(",")}
      >
        <circle cx="170" cy="170" r="21" fill="#edf0ff" stroke="#cbd4ee" />
        <text
          x="170"
          y="174"
          textAnchor="middle"
          fill="#283784"
          fontSize={labelFontSize}
        >
          nucleus
        </text>
        {Array.from({ length: rings }, (_, shell) => {
          const radius = 42 + shell * 36;
          const count = counts[shell] ?? 0;
          return (
            <g key={shell}>
              <circle
                cx="170"
                cy="170"
                r={radius}
                fill="none"
                stroke={count ? "#a9b5cd" : "#d7deeb"}
                strokeWidth="1.5"
                strokeDasharray={count ? undefined : "4 4"}
              />
              <text
                x="174"
                y={170 - radius + 13}
                fontSize={labelFontSize}
                fill="#4b5563"
              >
                {shell + 1}
              </text>
              {Array.from({ length: count }, (_, i) => {
                const angle = (i * 2 * Math.PI) / count - Math.PI / 2 + 0.2;
                return (
                  <circle
                    key={i}
                    cx={170 + radius * Math.cos(angle)}
                    cy={170 + radius * Math.sin(angle)}
                    r="5.5"
                    fill="#6b3fc4"
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <figcaption>
        {textLegend && (
          <>
            <strong>{label}</strong>
            <span>
              Electrons by shell (inner → outer): {counts.join(", ")}.
            </span>
          </>
        )}
        {(textLegend || tightView) && "Pale centre = magnified nucleus · "}
        Purple dot = electron · rings show shells, not paths · not to scale
      </figcaption>
    </figure>
  );
}
