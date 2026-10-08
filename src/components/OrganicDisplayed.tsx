export function organicAttachment(
  n: number,
  c: number,
  slot: number,
): [number, number] {
  const x = 100 * (c + 1);
  if (c === n - 1)
    return [
      [x - 55, 65],
      [x - 55, 195],
      [x + 55, 195],
      [x + 55, 65],
    ][slot] as [number, number];
  return slot === 0
    ? [x, 45]
    : slot === 1
      ? [x, 215]
      : slot === 2
        ? [x - (c === 0 ? 65 : 35), c === 0 ? 130 : 175]
        : [x + 35, 20];
}
export function OrganicDisplayed({
  n,
  board,
  onToggle,
  supplied = false,
}: {
  n: number;
  board: Record<string, string>;
  onToggle?: (key: string) => void;
  supplied?: boolean;
}) {
  const width = n * 100 + 170,
    terminal = n * 100,
    oxygen = board.hydroxyl === "yes",
    carbonyl = Number(board.carbonyl),
    slots = Array.from({ length: n * 4 }, (_, i) => ({
      key: "h" + i,
      c: Math.floor(i / 4),
      slot: i % 4,
    }));
  return (
    <div
      className="organic-diagram-scroll"
      role="region"
      aria-label={
        supplied
          ? "Original supplied organic structure"
          : "Displayed organic construction proposal"
      }
      tabIndex={0}
    >
      <svg
        viewBox={`0 0 ${width} 260`}
        style={{ maxWidth: width, minWidth: Math.ceil((width * 12) / 26) }}
        role="img"
        aria-label={
          supplied
            ? "Original supplied C,H,O atoms and displayed covalent bonds. Two parallel lines denote a double bond."
            : "Your C,H,O construction. Empty + markers are vacant slots, not atoms. Labelled controls provide a keyboard alternative."
        }
        onClick={
          onToggle
            ? (e) => {
                const box = e.currentTarget.getBoundingClientRect(),
                  x = ((e.clientX - box.left) * width) / box.width,
                  y = ((e.clientY - box.top) * 260) / box.height,
                  hit = slots.find((s) => {
                    const [p, q] = organicAttachment(n, s.c, s.slot);
                    return Math.hypot(x - p, y - q) < 24;
                  });
                if (hit) onToggle(hit.key);
              }
            : undefined
        }
      >
        {Array.from({ length: n - 1 }, (_, i) => (
          <line
            key={"cc" + i}
            x1={100 * (i + 1)}
            y1="130"
            x2={100 * (i + 2)}
            y2="130"
            stroke="#445674"
            strokeWidth="3"
          />
        ))}
        {slots.map(({ key, c, slot }) => {
          const [x, y] = organicAttachment(n, c, slot),
            placed = board[key] === "yes";
          if (supplied && !placed) return null;
          return (
            <g
              key={key}
              data-attachment={key}
              data-placed={placed ? "yes" : "no"}
            >
              {placed && (
                <line
                  x1={100 * (c + 1)}
                  y1="130"
                  x2={x}
                  y2={y}
                  stroke="#445674"
                  strokeWidth="3"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r="17"
                fill={placed ? "white" : "#f6f8fd"}
                stroke={placed ? "none" : "#c1cde1"}
                strokeDasharray={placed ? undefined : "3 3"}
              />
              <text x={x} y={y + 9} textAnchor="middle">
                {placed ? "H" : "+"}
              </text>
            </g>
          );
        })}
        {oxygen && (
          <g data-hydroxyl="yes">
            <line
              x1={terminal}
              y1="130"
              x2={terminal + 85}
              y2="130"
              stroke="#445674"
              strokeWidth="3"
            />
            {board.oxygenH === "yes" && (
              <line
                x1={terminal + 85}
                y1="130"
                x2={terminal + 145}
                y2="130"
                stroke="#445674"
                strokeWidth="3"
              />
            )}
            <circle cx={terminal + 85} cy="130" r="18" fill="white" />
            <text x={terminal + 85} y="139" textAnchor="middle">
              O
            </text>
            {board.oxygenH === "yes" && (
              <g>
                <circle cx={terminal + 145} cy="130" r="18" fill="white" />
                <text x={terminal + 145} y="139" textAnchor="middle">
                  H
                </text>
              </g>
            )}
          </g>
        )}
        {carbonyl > 0 && (
          <g data-carbonyl-order={carbonyl}>
            {(carbonyl === 2 ? [-4, 4] : [0]).map((offset) => (
              <line
                key={offset}
                x1={terminal + offset}
                y1="130"
                x2={terminal + offset}
                y2="30"
                stroke="#445674"
                strokeWidth="3"
              />
            ))}
            <circle cx={terminal} cy="30" r="18" fill="white" />
            <text x={terminal} y="39" textAnchor="middle">
              O
            </text>
          </g>
        )}
        {Array.from({ length: n }, (_, c) => (
          <g key={"c" + c}>
            <circle cx={100 * (c + 1)} cy="130" r="18" fill="white" />
            <text
              x={100 * (c + 1)}
              y="139"
              textAnchor="middle"
              fontWeight="700"
            >
              C
            </text>
          </g>
        ))}
      </svg>
      <p>
        {supplied
          ? "Original supplied displayed structure; the layout does not claim actual bond angles."
          : "Displayed proposal, not actual molecular angles. Each line is a single bond; parallel lines are double. Empty + markers are vacant slots, not H atoms. Scroll if needed; use labelled buttons to edit each H."}
      </p>
    </div>
  );
}
export function OrganicHydrogens({
  n,
  board,
  onToggle,
  disabled = false,
}: {
  n: number;
  board: Record<string, string>;
  onToggle: (key: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="organic-attachments">
      {Array.from({ length: n }, (_, c) => {
        const names =
          c === n - 1
            ? ["upper left", "lower left", "lower right", "upper right"]
            : ["upper", "lower", "left", "upper right"];
        return (
          <fieldset key={c}>
            <legend>Carbon {c + 1}: H attachments</legend>
            <div className="organic-attachment-buttons">
              {names.map((name, slot) => {
                const key = "h" + (c * 4 + slot);
                return (
                  <button
                    type="button"
                    key={key}
                    data-h-slot={key}
                    aria-label={`Hydrogen at carbon ${c + 1}, ${name} slot`}
                    aria-pressed={board[key] === "yes"}
                    disabled={disabled}
                    onClick={() => onToggle(key)}
                  >
                    {name}: {board[key] === "yes" ? "H" : "empty"}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
