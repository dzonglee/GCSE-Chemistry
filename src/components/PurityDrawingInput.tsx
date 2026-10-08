"use client";
import { useId } from "react";
import {
  drawingChoices,
  drawingLabels,
  initialPurityDrawing,
  readPurityDrawing,
  referencePurityDrawing,
  separationSources,
  type PurityDrawingData,
  type PurityDrawingBoard,
} from "../lib/purity-drawing";
function materialLines(value: string): string[] {
  const lines = [""];
  for (const word of value.split(" ")) {
    const last = lines.length - 1;
    if (lines[last] && `${lines[last]} ${word}`.length > 20) lines.push(word);
    else lines[last] += (lines[last] ? " " : "") + word;
  }
  return lines;
}
const fieldLabels: Record<string, string> = {
  paper: "Filter paper position",
  residue: "Material retained on the paper",
  filtrate: "Material reaching the receiver",
  dissolved: "Account of dissolved sodium chloride",
  path: "Liquid path",
  process: "Type of process",
  source: "Starting contents of flask",
  vapour: "Material entering the vapour tube",
  cooling: "Cooling-water direction",
  receiver: "Material collected in the receiver",
  flask: "Material left at the ideal endpoint",
};
export function PurityProposalDiagram({
  data,
  board,
}: {
  data: PurityDrawingData;
  board: PurityDrawingBoard;
}) {
  const id = useId().replaceAll(":", ""),
    filter = data.mode === "filtration";
  const text = (key: string) =>
    board[key] ? drawingLabels[board[key]] : "Not chosen";
  return (
    <>
      <div
        className="purity-diagram-pan"
        tabIndex={0}
        role="group"
        aria-label="Proposed apparatus diagram; scroll horizontally to inspect"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            e.currentTarget.scrollBy({
              left: e.key === "ArrowRight" ? 80 : -80,
            });
          }
        }}
      >
        <svg
          viewBox="0 0 540 420"
          style={{ width: 540, minWidth: 540, height: 420 }}
          role="img"
          aria-label={
            filter
              ? "Your proposed filtration arrangement"
              : "Your proposed simple-distillation arrangement"
          }
        >
          <defs>
            <marker
              id={id}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10Z" fill="#3345c9" />
            </marker>
          </defs>
          {filter ? (
            <>
              <path
                d="M130 85L270 85L213 185L213 215L187 215L187 185Z"
                fill="none"
                stroke="#8790a9"
                strokeWidth="3"
              />
              <path
                d="M185 235L185 275L145 365Q140 380 160 380H240Q260 380 255 365L215 275V235"
                fill="none"
                stroke="#8790a9"
                strokeWidth="3"
              />
              {board.paper === "funnel" && (
                <path
                  d="M142 93L200 183L258 93"
                  fill="#fff4b5"
                  stroke="#ac8520"
                  strokeWidth="4"
                />
              )}
              {board.paper === "spout" && (
                <path d="M187 200H213" stroke="#ac8520" strokeWidth="6" />
              )}
              {board.paper === "receiver" && (
                <path
                  d="M153 350L200 372L247 350"
                  fill="#fff4b5"
                  stroke="#ac8520"
                  strokeWidth="4"
                />
              )}
              {board.residue && board.residue !== "none" && (
                <g fill={board.residue === "insoluble" ? "#b69b62" : "#7651a8"}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <circle
                      key={i}
                      cx={178 + i * 11}
                      cy={135 + (i % 2) * 8}
                      r="5"
                    />
                  ))}
                </g>
              )}
              {board.filtrate && board.filtrate !== "none" && (
                <path
                  d="M162 330H239L255 365Q260 380 240 380H160Q140 380 145 365Z"
                  fill={board.filtrate === "water" ? "#a8d9e8" : "#c9b7e1"}
                  opacity=".8"
                />
              )}
              {board.path === "through" && (
                <path
                  d="M200 52V115M200 155V315"
                  fill="none"
                  stroke="#3345c9"
                  strokeWidth="3"
                  markerEnd={`url(#${id})`}
                />
              )}
              {board.path === "around" && (
                <path
                  d="M200 52Q300 90 275 230Q265 275 220 315"
                  fill="none"
                  stroke="#3345c9"
                  strokeWidth="3"
                  markerEnd={`url(#${id})`}
                />
              )}
              {board.path === "blocked" && (
                <path
                  d="M185 190L215 220M215 190L185 220"
                  stroke="#b35635"
                  strokeWidth="4"
                />
              )}
              <text x="300" y="105" fontSize="14">
                Paper: {text("paper")}
              </text>
              <text x="300" y="150" fontSize="14">
                Residue:
              </text>
              <text x="300" y="175" fontSize="14" data-material-label="residue">
                {materialLines(text("residue")).map((line, i) => (
                  <tspan x="300" dy={i ? 22 : 0} key={i}>
                    {line}
                  </tspan>
                ))}
              </text>
              <text x="300" y="300" fontSize="14">
                Filtrate:
              </text>
              <text
                x="300"
                y="325"
                fontSize="14"
                data-material-label="filtrate"
              >
                {materialLines(text("filtrate")).map((line, i) => (
                  <tspan x="300" dy={i ? 22 : 0} key={i}>
                    {line}
                  </tspan>
                ))}
              </text>
            </>
          ) : (
            <>
              <path
                d="M95 140V200A60 60 0 1 0 145 200V130H240L370 250L410 250V340M440 340V265L250 105H145V70H95V140"
                fill="none"
                stroke="#8790a9"
                strokeWidth="3"
              />
              <path
                d="M230 120L365 255L385 235L250 100Z"
                fill="#e8f3f7"
                fillOpacity=".45"
                stroke="#899ab3"
                strokeWidth="3"
              />
              <path d="M120 62V128" stroke="#a84a44" strokeWidth="3" />
              <circle cx="120" cy="128" r="4" fill="#a84a44" />
              <text x="20" y="55" fontSize="14">
                Thermometer
              </text>
              <path
                d="M365 250L370 285M250 105L245 75"
                stroke="#8790a9"
                strokeWidth="5"
              />
              <path
                d="M395 330V390H465V330"
                fill="none"
                stroke="#8790a9"
                strokeWidth="3"
              />
              {board.source && (
                <path
                  d="M74 255Q70 310 120 313Q170 310 166 255Z"
                  fill={
                    board.source === "drySolid"
                      ? "#b69b62"
                      : board.source === "water"
                        ? "#a8d9e8"
                        : "#c9b7e1"
                  }
                  opacity=".8"
                />
              )}
              {board.vapour && board.vapour !== "none" && (
                <path
                  d="M120 170V125H235L370 245"
                  fill="none"
                  stroke={board.vapour === "water" ? "#3345c9" : "#7651a8"}
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  markerEnd={`url(#${id})`}
                />
              )}
              {board.cooling === "lowerUpper" && (
                <path
                  d="M375 292L380 246L247 109L245 65"
                  fill="none"
                  stroke="#167e90"
                  strokeWidth="3"
                  markerEnd={`url(#${id})`}
                />
              )}
              {board.cooling === "upperLower" && (
                <path
                  d="M245 65L247 109L380 246L375 292"
                  fill="none"
                  stroke="#167e90"
                  strokeWidth="3"
                  markerEnd={`url(#${id})`}
                />
              )}
              {board.receiver && board.receiver !== "none" && (
                <rect
                  x="397"
                  y="355"
                  width="66"
                  height="32"
                  fill={board.receiver === "solution" ? "#c9b7e1" : "#a8d9e8"}
                  opacity={board.receiver === "waterGas" ? 0.3 : 0.8}
                />
              )}
              <text x="25" y="30" fontSize="14">
                Start: {text("source")}
              </text>
              <text x="220" y="45" fontSize="14">
                Vapour: {text("vapour")}
              </text>
              <path
                d="M35 340V355L23 387H77L65 355V340"
                fill="none"
                stroke="#8790a9"
                strokeWidth="2"
              />
              {board.flask === "solute" && (
                <g fill="#7651a8">
                  {[0, 1, 2, 3].map((i) => (
                    <circle key={i} cx={35 + i * 10} cy={379} r="4" />
                  ))}
                </g>
              )}
              {board.flask === "water" && (
                <path d="M33 365H67L75 385H25Z" fill="#a8d9e8" />
              )}
              <text x="95" y="350" fontSize="14">
                Endpoint flask:
              </text>
              <text x="95" y="375" fontSize="14">
                {text("flask")}
              </text>
              <text x="330" y="305" fontSize="14">
                Receiver:
              </text>
              <text x="330" y="327" fontSize="14">
                {text("receiver")}
              </text>
            </>
          )}
        </svg>
      </div>
      <p>
        {filter
          ? "Dissolved-material account: " + text("dissolved")
          : "Cooling jacket: " + text("cooling")}
        . Process: {text("process")}.
      </p>
    </>
  );
}
export function PurityDrawingInput({
  data,
  value,
  onChange,
  disabled = false,
}: {
  data: PurityDrawingData;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const parsed =
      value === ""
        ? initialPurityDrawing(data)
        : readPurityDrawing(data, value),
    source = separationSources[data.record as keyof typeof separationSources];
  if (!parsed)
    return (
      <section>
        <p role="status">
          This retained drawing could not be read. Its raw answer has not been
          repaired.
        </p>
        <button type="button" disabled={disabled} onClick={() => onChange("")}>
          Clear only this drawing
        </button>
      </section>
    );
  return (
    <section className="purity-drawing">
      <h3>{source.title}</h3>
      <p>{source.source}</p>
      <p>
        Make your proposal. The diagram follows your choices; drawings are
        self-reviewed.
      </p>
      <div className="purity-fields">
        {Object.entries(drawingChoices[data.mode]).map(([key, options]) => (
          <label className="purity-field" key={key}>
            <span>{fieldLabels[key]}</span>
            <select
              data-drawing-field={key}
              disabled={disabled}
              value={parsed[key]}
              onChange={(e) =>
                onChange(JSON.stringify({ ...parsed, [key]: e.target.value }))
              }
            >
              <option value="">Not chosen</option>
              {(options as readonly string[]).filter(Boolean).map((v) => (
                <option key={v} value={v}>
                  {drawingLabels[v]}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <p>Pan the apparatus diagram to inspect all labels on a narrow screen.</p>
      <PurityProposalDiagram data={data} board={parsed} />
      <button type="button" disabled={disabled} onClick={() => onChange("")}>
        Clear only this drawing
      </button>
    </section>
  );
}
export function PurityDrawingReview({
  data,
  value,
  showRetained = true,
}: {
  data: PurityDrawingData;
  value: string;
  showRetained?: boolean;
}) {
  const proposal = readPurityDrawing(data, value);
  return (
    <section className="purity-drawing-review">
      {showRetained && (
        <>
          <h3>Your retained proposal</h3>
          {proposal ? (
            <PurityProposalDiagram data={data} board={proposal} />
          ) : (
            <p>No readable proposal supplied.</p>
          )}
        </>
      )}
      <h3>Separate reference for self-review</h3>
      <PurityProposalDiagram data={data} board={referencePurityDrawing(data)} />
      <p>
        Compare paper position, material paths and physical changes with your
        own answer. This reference does not replace your retained proposal or
        award examiner drawing marks.
      </p>
    </section>
  );
}
