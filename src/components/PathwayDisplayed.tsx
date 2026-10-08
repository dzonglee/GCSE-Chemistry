import type { PathwayBoard } from "../lib/pathway-board";
export function PathwayDisplayed({
  board: b,
  label = "Your displayed structure",
}: {
  board: PathwayBoard;
  label?: string;
}) {
  const n = Number(b.n),
    width = Math.max(260, n * 120 + 80),
    cy = 110,
    x = (i: number) => 70 + i * 120;
  if (!n) return <p>No carbon chain constructed yet.</p>;
  const text =
    Array.from(
      { length: n },
      (_, i) =>
        `Carbon ${i + 1}: ${b["h" + i]} hydrogen atoms; ${b["x" + i] === "none" ? "no halogen" : b["x" + i].replace("2", "") + (b["x" + i].endsWith("2") ? " twice" : " once")}; ${b["o" + i] === "1" ? (b["oh" + i] === "1" ? "oxygen with an O–H bond" : "oxygen without an O–H hydrogen") : "no oxygen"}${i < n - 1 ? `; ${b["b" + i] === "0" ? "no" : b["b" + i] === "1" ? "single" : "double"} bond to carbon ${i + 2}` : ""}`,
    ).join(". ") +
    `. Polymer brackets ${b.brackets === "1" ? "present" : "absent"}; repeat notation ${b.countMark === "none" ? "absent" : b.countMark}.`;
  // Every selected hydrogen gets its own bond. Wrong extra attachments remain visible.
  return (
    <figure>
      <div
        tabIndex={0}
        role="region"
        aria-label={label + "; scroll horizontally if needed"}
        style={{ overflowX: "auto" }}
      >
        <svg
          role="img"
          aria-label={label + ". " + text}
          viewBox={`0 0 ${width} 230`}
          style={{
            width: `max(100%, ${(width * 13) / 20}px)`,
            maxWidth: width,
            height: "auto",
            display: "block",
            fontSize: 20,
          }}
        >
          {Array.from({ length: n }, (_, i) => {
            const groups: string[] = [];
            for (let h = 0; h < Number(b["h" + i]); h++) groups.push("H");
            const hal = b["x" + i];
            if (hal !== "none") {
              groups.push(hal.replace("2", ""));
              if (hal.endsWith("2")) groups.push(hal.replace("2", ""));
            }
            if (b["o" + i] === "1")
              groups.push(b["oh" + i] === "1" ? "OH" : "O");
            return (
              <g key={i}>
                <text x={x(i)} y={cy + 7} textAnchor="middle">
                  C
                </text>
                {groups.map((g, j) => {
                  const slots = [
                      [-25, -55],
                      [25, 55],
                      [25, -55],
                      [-25, 55],
                      [0, -95],
                      [0, 95],
                    ],
                    s = slots[j] ?? [
                      (j % 2 ? 1 : -1) * 45,
                      (j % 2 ? 1 : -1) * 95,
                    ],
                    gx = x(i) + s[0],
                    gy = cy + s[1],
                    ohDy = j >= 3 ? (j === 5 ? -40 : 40) : 0;
                  return (
                    <g key={j}>
                      <line
                        x1={x(i)}
                        y1={cy + (s[1] < 0 ? -17 : 17)}
                        x2={gx}
                        y2={gy + (s[1] < 0 ? 15 : -17)}
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <text x={gx} y={gy + 7} textAnchor="middle">
                        {g === "OH" ? "O" : g}
                      </text>
                      {g === "OH" && (
                        <>
                          <line
                            x1={gx + 12}
                            y1={gy + Math.sign(ohDy) * 4}
                            x2={gx + 35}
                            y2={gy + ohDy - Math.sign(ohDy) * 4}
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <text
                            x={gx + 49}
                            y={gy + ohDy + 7}
                            textAnchor="middle"
                          >
                            H
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
                {i < n - 1 && b["b" + i] !== "0" && (
                  <>
                    {Array.from({ length: Number(b["b" + i]) }, (_, j) => (
                      <line
                        key={j}
                        x1={x(i) + 17}
                        y1={cy + (b["b" + i] === "2" ? (j ? 4 : -4) : 0)}
                        x2={x(i + 1) - 17}
                        y2={cy + (b["b" + i] === "2" ? (j ? 4 : -4) : 0)}
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    ))}
                  </>
                )}
              </g>
            );
          })}
          {b.brackets === "1" && (
            <>
              <path
                d={`M 43 20 h -16 v 190 h 16 M ${width - 35} 20 h 16 v 190 h -16`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </>
          )}
          {b.countMark !== "none" && (
            <text
              x={b.countMark === "inside" ? width - 65 : width - 12}
              y={205}
            >
              {b.countMark === "N" ? "N" : "n"}
            </text>
          )}
        </svg>
      </div>
      <figcaption>{label}. Each shown atom has its own bond.</figcaption>
    </figure>
  );
}
