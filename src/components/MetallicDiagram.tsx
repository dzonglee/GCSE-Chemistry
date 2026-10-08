import { metalCorePositions, metallicLedger } from "@/lib/metallic-properties";
export function MetallicDiagram({
  alloy = false,
  layerShift = 0,
  electronDrift = 0,
  proposedCarrier = "unset",
}: {
  alloy?: boolean;
  layerShift?: number;
  electronDrift?: number;
  proposedCarrier?: string;
}) {
  const ledger = metallicLedger();
  return (
    <figure className="metallic-diagram">
      <svg
        viewBox="0 0 380 290"
        role="img"
        aria-label={`${alloy ? "Alloy with different-sized cores and distorted layers" : "Pure illustrative metal with regular equal-sized cores"}. Twelve positive cores and twelve negative delocalised electrons give zero net charge. ${layerShift ? "The top layer is deliberately displaced while electron attraction remains." : "Core positions are fixed during conduction."} ${proposedCarrier !== "unset" ? `Your proposed carrier is ${proposedCarrier}; this is a prediction, not a verified mechanism.` : "No carrier prediction has been selected."}`}
        data-core-count={ledger.cores}
        data-electron-count={ledger.delocalisedElectrons}
        data-net-charge={ledger.netCharge}
      >
        <rect
          x="20"
          y="25"
          width="340"
          height="250"
          rx="20"
          fill="#eaf0ff"
          stroke="#bcc8eb"
          strokeWidth="2"
        />
        {metalCorePositions.map((core) => {
          const other = alloy && [2, 5, 9].includes(core.id),
            x =
              core.x +
              (core.row === 0 ? layerShift : 0) +
              (alloy ? (core.id % 2 === 0 ? -7 : 7) : 0),
            y = core.y + (alloy ? (other ? 8 : -4) : 0);
          return (
            <g key={core.id} data-metal-core={core.id} data-core-row={core.row}>
              <circle
                cx={x}
                cy={y}
                r={other ? 28 : 21}
                fill={other ? "#fde4c7" : "#d9e3f7"}
                stroke="#485ea0"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 7}
                fontSize="20"
                textAnchor="middle"
                fill="#203b75"
              >
                {other ? "X⁺" : "M⁺"}
              </text>
            </g>
          );
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const x = 35 + ((67 + (i % 4) * 77 + electronDrift) % 300),
            y = [107, 182, 255][Math.floor(i / 4)];
          return (
            <g key={i} data-delocalised-electron={i}>
              <circle cx={x} cy={y} r="13" fill="#7341bb" />
              <text
                x={x}
                y={y + 7}
                fontSize="20"
                textAnchor="middle"
                fill="white"
              >
                −
              </text>
              {proposedCarrier === "electrons" && (
                <path
                  d={`M${x - 10} ${y + 19}h20l-5-4m5 4-5 4`}
                  stroke="#7341bb"
                  strokeWidth="2"
                  fill="none"
                />
              )}
            </g>
          );
        })}
        {proposedCarrier === "cores" && (
          <g
            stroke="#bc6721"
            strokeWidth="2"
            fill="none"
            data-proposed-core-motion="true"
          >
            <path d="M40 39h45l-6-5m6 5-6 5 M180 39h45l-6-5m6 5-6 5" />
          </g>
        )}
      </svg>
      <figcaption>
        Positive cores include the nuclei AND inner electrons. M⁺/X⁺ and one
        outer electron per core illustrate a monovalent example, not every
        metal’s charge. Negative markers show delocalised electrons, not fixed
        orbits. This finite 2D projection stands for a giant 3D structure;
        colours, gaps, sizes and paths are schematic.{" "}
        {proposedCarrier !== "unset" &&
          "Carrier arrows are your proposed motion; check the explanation before treating it as correct."}
      </figcaption>
    </figure>
  );
}
