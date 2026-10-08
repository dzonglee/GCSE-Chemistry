import { useId } from "react";
type Model = "solid" | "pudding" | "nuclear" | "bohr" | "neutrons";
type Approach = "far" | "near" | "head-on";
const descriptions: Record<Model, string> = {
  solid: "A solid sphere with no smaller particles shown.",
  pudding:
    "Negative electrons embedded in a ball of spread positive charge. No nucleus is present.",
  nuclear:
    "A tiny positive central nucleus, with negative electrons outside it and mostly empty space.",
  bohr: "A small positive nucleus with negative electrons at specific distances, shown as two shell guides.",
  neutrons:
    "A nucleus containing positive protons and neutral neutrons, with electrons in shells outside it.",
};
export function scatteringPrediction(
  distribution: "spread" | "central",
  approach: Approach,
) {
  return distribution === "spread"
    ? "No large deflection in this diffuse model"
    : approach === "far"
      ? "Nearly straight"
      : approach === "near"
        ? "Deflected away from the positive centre"
        : "Turns back before reaching the centre";
}
export function AtomicModelDiagram({
  model,
  approach,
  readable = false,
  compact = false,
  textLegend = false,
}: {
  model: Model;
  approach?: Approach;
  readable?: boolean;
  compact?: boolean;
  textLegend?: boolean;
}) {
  const arrow = useId().replaceAll(":", "");
  const compactLabels: Record<Model, string> = {
    solid: "Indivisible sphere.",
    pudding: "− electrons in spread + charge.",
    nuclear: "− electrons outside a tiny + nucleus.",
    bohr: "− electrons at specific distances.",
    neutrons: "Nucleus: p⁺ and n⁰; electrons outside.",
  };
  if (compact)
    return (
      <figure
        className="atomic-model-diagram compact-historical-diagram"
        aria-label={`${descriptions[model]} Schematic, not to scale.`}
      >
        <div className="historical-thumbnail" aria-hidden="true">
          <AtomicModelDiagram model={model} />
        </div>
        <details className="historical-diagram-enlarge">
          <summary>Enlarge · not to scale</summary>
          <AtomicModelDiagram model={model} readable textLegend />
        </details>
        <figcaption>{compactLabels[model]}</figcaption>
      </figure>
    );
  const central = model !== "solid" && model !== "pudding";
  const y = approach === "far" ? 61 : approach === "near" ? 98 : 110;
  const path =
    central && approach === "head-on"
      ? `M 18 ${y} L 170 ${y} Q 182 88 162 88 L 48 88`
      : central && approach === "near"
        ? `M 18 ${y} L 148 ${y} Q 178 98 190 76 L 278 28`
        : `M 18 ${y} L 345 ${approach === "near" && model === "pudding" ? y - 8 : y}`;
  const electronPositions =
    model === "pudding"
      ? [
          [148, 78],
          [213, 65],
          [230, 126],
          [156, 153],
        ]
      : model === "nuclear"
        ? [
            [142, 80],
            [223, 43],
            [245, 141],
            [150, 166],
          ]
        : [
            [148, 110],
            [232, 110],
            [190, 37],
            [190, 183],
          ];
  return (
    <figure
      className={`atomic-model-diagram${textLegend ? " with-text-legend" : ""}`}
    >
      <svg
        viewBox="0 0 380 230"
        role="img"
        aria-label={`${descriptions[model]} ${approach ? `Positive alpha particle on a ${approach} approach. ${scatteringPrediction(central ? "central" : "spread", approach)}.` : ""} Schematic, not to scale.`}
        data-atomic-model={model}
        data-prediction={
          approach
            ? scatteringPrediction(central ? "central" : "spread", approach)
            : undefined
        }
      >
        <defs>
          <marker
            id={arrow}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 Z" fill="#ab4c15" />
          </marker>
        </defs>
        <circle
          cx="190"
          cy="110"
          r="76"
          fill={
            model === "solid"
              ? "#e1e7f7"
              : model === "pudding"
                ? "#fff0df"
                : "#f8faff"
          }
          stroke="#aebbd3"
          strokeWidth="1.5"
        />
        {model === "solid" ? (
          <text
            x="190"
            y="115"
            textAnchor="middle"
            fontSize="14"
            fill="#334155"
          >
            sphere
          </text>
        ) : (
          <>
            {model === "pudding" ? (
              <>
                <text
                  className="atomic-charge-symbol"
                  x="190"
                  y="114"
                  textAnchor="middle"
                  fontSize="26"
                  fill="#a54e20"
                >
                  +
                </text>
                <text
                  x="190"
                  y="211"
                  textAnchor="middle"
                  fontSize={readable ? 22 : 11}
                  fill="#7a431e"
                >
                  positive charge spread through the ball
                </text>
              </>
            ) : model === "neutrons" ? (
              <g>
                {[
                  [181, 103, true],
                  [190, 101, false],
                  [199, 105, true],
                  [181, 113, false],
                  [191, 111, true],
                  [200, 115, false],
                  [184, 123, true],
                  [194, 122, false],
                  [189, 132, false],
                ].map(([x, y, proton], i) => (
                  <g key={i}>
                    <circle
                      cx={Number(x)}
                      cy={Number(y)}
                      r="6"
                      fill={proton ? "#3f4fd0" : "#d8a12e"}
                    />
                    {proton && (
                      <text
                        className="atomic-charge-symbol"
                        x={Number(x)}
                        y={Number(y) + 3}
                        textAnchor="middle"
                        fontSize="9"
                        fill="white"
                      >
                        +
                      </text>
                    )}
                  </g>
                ))}
                <text
                  x="190"
                  y="211"
                  textAnchor="middle"
                  fontSize={readable ? 22 : 11}
                  fill="#334155"
                >
                  blue p⁺ · gold n⁰ · nucleus magnified
                </text>
              </g>
            ) : (
              <>
                <circle
                  cx="190"
                  cy="110"
                  r={readable ? 14 : 8}
                  fill="#c64f35"
                />
                <text
                  className="atomic-charge-symbol"
                  x="190"
                  y="114"
                  textAnchor="middle"
                  fontSize={readable ? 24 : 12}
                  fill="white"
                >
                  +
                </text>
                <text
                  x="190"
                  y="211"
                  textAnchor="middle"
                  fontSize={readable ? 22 : 11}
                  fill="#7a431e"
                >
                  tiny positive nucleus · magnified
                </text>
              </>
            )}
            {(model === "bohr" || model === "neutrons") &&
              [42, 73].map((r) => (
                <circle
                  key={r}
                  cx="190"
                  cy="110"
                  r={r}
                  fill="none"
                  stroke="#bbc6dc"
                  strokeWidth="1"
                />
              ))}
            {electronPositions.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={readable ? 14 : 7} fill="#6b3fc4" />
                <text
                  className="atomic-charge-symbol"
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize={readable ? 24 : 12}
                  fill="white"
                >
                  −
                </text>
              </g>
            ))}
          </>
        )}
        {approach && (
          <>
            <path
              d={path}
              stroke="#ab4c15"
              strokeWidth="2.5"
              fill="none"
              markerEnd={`url(#${arrow})`}
            />
            <text x="18" y="26" fontSize={readable ? 22 : 11} fill="#873d13">
              positive α particle
            </text>
          </>
        )}
      </svg>
      <figcaption>
        {textLegend ? (
          <>
            {descriptions[model]}{" "}
            {approach &&
              "The orange arrow is one positive alpha-particle path; no numerical scattering law is calculated. "}
            Magnified; not to scale.
          </>
        ) : readable && !approach ? (
          "Historical model; magnified, not to scale."
        ) : (
          <>
            {approach
              ? "One selected path; no collision rate or numerical scattering law is calculated. "
              : "Historical teaching representation. "}
            Particles and nucleus are magnified; not to scale.
          </>
        )}
      </figcaption>
    </figure>
  );
}
