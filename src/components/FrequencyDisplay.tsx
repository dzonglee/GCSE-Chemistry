import type { FrequencyDisplayData } from "@/lib/frequency-display";
import { readNumber } from "@/lib/marking";

export function FrequencyDisplay({
  data,
  value,
}: {
  data: FrequencyDisplayData;
  value: string;
}) {
  let values: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      values = parsed as Record<string, unknown>;
  } catch {
    /* An empty or retained malformed draft is never replaced. */
  }
  const count =
    data.kind === "histogram" ? data.ticks.length - 1 : data.ticks.length;
  const width = 400 / count;
  const entries = Array.from({ length: count }, (_, i) => {
    const raw = values[`f${i}`];
    const n = typeof raw === "string" ? readNumber(raw) : null;
    return {
      raw,
      n,
      plotted: n !== null && Number.isInteger(n) && n >= 0 && n <= 8,
    };
  });
  return (
    <figure className="frequency-display">
      <svg
        viewBox="0 0 520 360"
        role="img"
        aria-label={`Your unmarked ${data.kind === "histogram" ? "equal-width histogram" : "bar chart"}. Frequencies in class order: ${entries.map((e) => (typeof e.raw === "string" && e.raw ? e.raw : "blank")).join(", ")}. Invalid or off-scale entries remain in the fields and are not plotted.`}
      >
        <text x="80" y="38" fontSize="32">
          Frequency
        </text>
        {[0, 2, 4, 6, 8].map((n) => (
          <g key={n}>
            <line
              x1="80"
              x2="480"
              y1={260 - n * 25}
              y2={260 - n * 25}
              stroke="#d8deea"
            />
            <text x="65" y={270 - n * 25} fontSize="32" textAnchor="end">
              {n}
            </text>
          </g>
        ))}
        {entries.map((e, i) =>
          e.plotted ? (
            <rect
              key={i}
              data-frequency={e.n!}
              data-frequency-index={i}
              x={80 + i * width + (data.kind === "bar" ? width * 0.15 : 0)}
              y={260 - e.n! * 25}
              width={data.kind === "bar" ? width * 0.7 : width}
              height={e.n! * 25}
              fill="#5542b8"
              stroke="white"
              strokeWidth="1"
            />
          ) : null,
        )}
        <path
          d="M80 60 V260 H480"
          fill="none"
          stroke="#63708b"
          strokeWidth="3"
        />
        {data.ticks.map((tick, i) => (
          <text
            key={i}
            x={80 + (data.kind === "bar" ? i + 0.5 : i) * width}
            y="305"
            fontSize="32"
            textAnchor="middle"
          >
            {tick}
          </text>
        ))}
        <text x="290" y="349" fontSize="32" textAnchor="middle">
          Reading / {data.unit}
        </text>
      </svg>
      <figcaption>
        Your entries draw this display; it does not correct them.{" "}
        {data.kind === "histogram"
          ? "Classes have equal widths. Bars touch and their areas are proportional to frequency. Unequal-width classes require frequency density."
          : "These are exact recorded values; the separated bars show their frequencies."}
      </figcaption>
      {entries.some(
        (e) => typeof e.raw === "string" && e.raw.trim() && !e.plotted,
      ) && (
        <p className="frequency-unplotted">
          Not plotted:{" "}
          {entries
            .flatMap((e, i) =>
              typeof e.raw === "string" && e.raw.trim() && !e.plotted
                ? [`field ${i + 1}: ${e.raw}`]
                : [],
            )
            .join("; ")}
          . Keep a whole-number count from 0 to 8 on this fixed scale.
        </p>
      )}
    </figure>
  );
}
