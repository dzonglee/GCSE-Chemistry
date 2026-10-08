const attachmentNames = ["upper", "lower", "left", "right"];
export function attachmentPoint(
  n: number,
  c: number,
  slot: number,
): [number, number] {
  const x = 100 * (c + 1);
  return slot === 0
    ? [x, 45]
    : slot === 1
      ? [x, 195]
      : slot === 2
        ? [x - (c === 0 ? 65 : 35), c === 0 ? 120 : 160]
        : [x + (c === n - 1 ? 65 : 35), c === n - 1 ? 120 : 80];
}
export function AlkeneDisplayed({
  n,
  double,
  flags,
  onToggle,
  supplied = false,
}: {
  n: number;
  double: number | null;
  flags: Record<string, string>;
  onToggle?: (key: string) => void;
  supplied?: boolean;
}) {
  const width = 100 * n + 100,
    slots = Array.from({ length: n * 4 }, (_, i) => ({
      key: "h" + i,
      c: Math.floor(i / 4),
      slot: i % 4,
    }));
  return (
    <div
      className="alkene-diagram-scroll"
      role="region"
      aria-label={
        supplied
          ? "Original supplied displayed structure"
          : "Displayed alkene construction proposal"
      }
      tabIndex={0}
    >
      <svg
        viewBox={`0 0 ${width} 240`}
        style={{ minWidth: Math.ceil((width * 12) / 26), maxWidth: width }}
        role="img"
        aria-label={
          supplied
            ? "Original displayed structure. Every shown C–H connection is single; two parallel C–C lines denote a double bond."
            : "Your displayed carbon and hydrogen construction. Two parallel C–C lines denote the chosen double bond. Labelled attachment buttons provide a keyboard alternative."
        }
        onClick={
          onToggle
            ? (e) => {
                const box = e.currentTarget.getBoundingClientRect(),
                  x = ((e.clientX - box.left) * width) / box.width,
                  y = ((e.clientY - box.top) * 240) / box.height;
                const chosen = slots.find((s) => {
                  const [p, q] = attachmentPoint(n, s.c, s.slot);
                  return Math.hypot(x - p, y - q) <= 26;
                });
                if (chosen) onToggle(chosen.key);
              }
            : undefined
        }
      >
        {Array.from({ length: Math.max(0, n - 1) }, (_, i) => (
          <g key={i} data-carbon-bond={i} data-order={double === i ? 2 : 1}>
            {(double === i ? [-4, 4] : [0]).map((offset) => (
              <line
                key={offset}
                x1={100 * (i + 1)}
                y1={120 + offset}
                x2={100 * (i + 2)}
                y2={120 + offset}
                stroke="#445674"
                strokeWidth="3"
              />
            ))}
          </g>
        ))}
        {slots.map(({ key, c, slot }) => {
          const [x, y] = attachmentPoint(n, c, slot),
            placed = flags[key] === "yes";
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
                  y1="120"
                  x2={x}
                  y2={y}
                  stroke="#445674"
                  strokeWidth="3"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r="18"
                fill={placed ? "#fff" : "#f6f8fd"}
                stroke={placed ? "none" : "#c1cde1"}
                strokeDasharray={placed ? undefined : "3 3"}
              />
              <text x={x} y={y + 9} textAnchor="middle">
                {placed ? "H" : "+"}
              </text>
            </g>
          );
        })}
        {Array.from({ length: n }, (_, i) => (
          <g key={i}>
            <circle cx={100 * (i + 1)} cy="120" r="19" fill="#fff" />
            <text
              x={100 * (i + 1)}
              y="129"
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
          ? "Original displayed bonds; the layout does not claim actual molecular bond angles. Scroll horizontally if needed."
          : "Displayed proposal, not molecular bond angles. Empty + markers are vacant slots, not hydrogen atoms. Scroll horizontally if needed; use the labelled buttons to edit attachments."}
      </p>
    </div>
  );
}
export function AttachmentButtons({
  n,
  flags,
  onToggle,
  disabled = false,
  from = 0,
  to = n,
}: {
  n: number;
  flags: Record<string, string>;
  onToggle: (key: string) => void;
  disabled?: boolean;
  from?: number;
  to?: number;
}) {
  return (
    <div className="alkene-attachments">
      {Array.from({ length: Math.max(0, to - from) }, (_, i) => {
        const c = from + i;
        return (
          <fieldset key={c}>
            <legend>Carbon {c + 1}: H attachments</legend>
            <div className="alkene-attachment-buttons">
              {attachmentNames.map((name, slot) => {
                const key = "h" + (c * 4 + slot);
                return (
                  <button
                    type="button"
                    key={key}
                    disabled={disabled}
                    aria-label={`Hydrogen at carbon ${c + 1}, ${name} slot`}
                    aria-pressed={flags[key] === "yes"}
                    data-h-slot={key}
                    onClick={() => onToggle(key)}
                  >
                    {name}: {flags[key] === "yes" ? "H" : "empty"}
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
