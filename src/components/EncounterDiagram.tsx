export function EncounterDiagram({
  contact,
  reactingPartner,
  energy,
  activation,
  molecular,
  suitableOrientation,
}: {
  contact: boolean;
  reactingPartner: boolean;
  energy: number;
  activation: number;
  molecular: boolean;
  suitableOrientation: boolean;
}) {
  const right = contact ? 164 : 218,
    max = Math.max(activation * 2, energy),
    scale = 220 / max;
  return (
    <figure style={{ margin: "16px 0" }}>
      <svg
        role="img"
        aria-label={`Schematic encounter: ${contact ? "particles touch" : "particles do not touch"}, ${reactingPartner ? "reacting partner" : "inert partner"}. Collision energy ${energy}; stated minimum ${activation}.${molecular ? " Yellow sites mark the stated reactive ends." : ""}`}
        viewBox="0 0 320 160"
        style={{ width: "100%", display: "block", maxHeight: 210 }}
      >
        <circle cx={120} cy={40} r={22} fill="#3344c8" />
        <circle
          cx={right}
          cy={40}
          r={22}
          fill={reactingPartner ? "#7541bb" : "#8b95a8"}
        />
        {molecular && (
          <>
            <circle cx={142} cy={40} r={5} fill="#f3cc40" />
            <circle
              cx={right + (suitableOrientation ? -22 : 22)}
              cy={40}
              r={5}
              fill="#f3cc40"
            />
          </>
        )}
        <text x={100} y={82} textAnchor="middle" fontSize={12}>
          Reactant
        </text>
        <text x={right + 24} y={82} textAnchor="middle" fontSize={12}>
          {reactingPartner ? "Partner" : "Inert"}
        </text>
        <rect x={40} y={110} width={220} height={14} fill="#e7ebf5" />
        <rect
          x={40}
          y={110}
          width={energy * scale}
          height={14}
          fill="#3344c8"
        />
        <path
          d={`M${40 + activation * scale},102v30`}
          stroke="#a86a12"
          strokeWidth={2}
        />
        <text x={40} y={149} fontSize={12}>
          Energy {energy}; minimum {activation}
        </text>
      </svg>
      <figcaption>
        One simplified encounter, with illustrative energy units.{" "}
        {molecular
          ? "Yellow sites show the reactive ends for this stated molecular example."
          : "This atomic example has no molecular-end condition."}{" "}
        This is not a measured collision trajectory.
      </figcaption>
    </figure>
  );
}
