import { gasChoiceLabels, type GasBoard } from "@/lib/gas-tests-domain";
const points: Record<string, [number, number]> = {
  mouth: [150, 100],
  inside: [150, 174],
  belowLiquid: [150, 247],
  aboveLiquid: [150, 184],
  gasContact: [150, 123],
  away: [330, 100],
};
export function GasApparatus2D({
  board,
  original = false,
}: {
  board: GasBoard;
  original?: boolean;
}) {
  const point = points[board.placement],
    splint = board.material.endsWith("Splint"),
    liquid = board.material === "limewater" || board.material === "water",
    paper = board.material.endsWith("Litmus");
  const far =
    point && point[0] === 150 && point[1] > 100
      ? [150, Math.min(point[1] - 110, 65)]
      : point
        ? [point[0] + 60, point[1] - 62]
        : null;
  return (
    <figure className="gas-apparatus">
      <div
        className="gas-svg-pan"
        tabIndex={0}
        role="region"
        aria-label="Schematic apparatus; pan horizontally to inspect"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            event.currentTarget.scrollBy({
              left: event.key === "ArrowRight" ? 80 : -80,
            });
          }
        }}
      >
        <svg
          width="410"
          height="335"
          viewBox="0 0 410 335"
          role="img"
          aria-label={`${original ? "Original arrangement" : "Your retained apparatus proposal"}. Material: ${gasChoiceLabels[board.material] ?? "not chosen"}. Placement: ${gasChoiceLabels[board.placement] ?? "not chosen"}. No result is simulated.`}
        >
          <rect width="410" height="335" rx="12" fill="#f4f7fc" />
          <path
            d="M125 100 V265 Q125 294 150 294 Q175 294 175 265 V100"
            fill="#e5edf6"
            fillOpacity=".45"
            stroke="#49627e"
            strokeWidth="3"
          />
          <ellipse
            cx="150"
            cy="100"
            rx="25"
            ry="5"
            fill="none"
            stroke="#49627e"
            strokeWidth="2"
          />
          <path d="M100 294 H200 V307 H100 Z" fill="#273955" />
          <line x1="177" y1="100" x2="220" y2="100" stroke="#6c7889" />
          <text x="226" y="105" fontSize="14">
            Open end
          </text>
          <text x="105" y="327" fontSize="14">
            Schematic test tube
          </text>
          {liquid && (
            <>
              <path
                d="M128 215 H172 V264 Q172 290 150 290 Q128 290 128 264 Z"
                fill="#a9d7e0"
                fillOpacity=".5"
              />
              <line
                x1="128"
                y1="215"
                x2="172"
                y2="215"
                stroke="#558ca0"
                strokeWidth="2"
              />
              <text x="210" y="230" fontSize="14">
                Clear receiving liquid
              </text>
            </>
          )}
          {point && far && splint && (
            <>
              <line
                x1={point[0]}
                y1={point[1]}
                x2={far[0]}
                y2={far[1]}
                stroke="#b98a4e"
                strokeWidth="6"
              />
              <circle
                cx={point[0]}
                cy={point[1]}
                r="4"
                fill={board.material === "unlitSplint" ? "#65584b" : "#e06a26"}
              />
              {board.material === "burningSplint" && (
                <path
                  d={`M${point[0] - 7} ${point[1]} Q${point[0] - 9} ${point[1] - 10} ${point[0]} ${point[1] - 23} Q${point[0] + 10} ${point[1] - 9} ${point[0] + 7} ${point[1]} Z`}
                  fill="#edac24"
                  stroke="#b97612"
                />
              )}
            </>
          )}
          {point && liquid && (
            <>
              <path
                d={`M85 45 H${point[0]} V${point[1]}`}
                fill="none"
                stroke="#6d91a9"
                strokeWidth="6"
              />
              <circle
                cx={point[0]}
                cy={point[1]}
                r="4"
                fill="#fff"
                stroke="#506d86"
                strokeWidth="2"
              />
            </>
          )}
          {point && paper && (
            <>
              <rect
                x={point[0] - 8}
                y={point[1] - 23}
                width="16"
                height="46"
                fill="#4266bc"
                stroke="#273955"
              />
              <line
                x1={point[0]}
                y1={point[1] - 23}
                x2={point[0]}
                y2={point[1] - 55}
                stroke="#273955"
                strokeWidth="2"
              />
              <text x="20" y="70" fontSize="14">
                {board.material === "dampBlueLitmus"
                  ? "Damp paper"
                  : "Dry paper"}
              </text>
            </>
          )}
          {point && board.material && (
            <>
              <circle
                cx={point[0]}
                cy={point[1]}
                r="12"
                fill="none"
                stroke="#633ec0"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <text x="20" y="28" fontSize="14" fill="#633ec0">
                {original
                  ? "Original contact position"
                  : "Your selected contact position"}
              </text>
            </>
          )}
          {!board.material || !point ? (
            <text x="20" y="52" fontSize="14">
              Unchosen proposal fields stay blank.
            </text>
          ) : null}
        </svg>
      </div>
      <figcaption>
        {original ? "Original supplied arrangement" : "Your apparatus proposal"}
        . {gasChoiceLabels[board.material] ?? "Material not chosen"};{" "}
        {gasChoiceLabels[board.placement] ?? "position not chosen"}. No positive
        result is predicted. Pan the schematic on narrow screens.
      </figcaption>
    </figure>
  );
}
