import {
  nanoSizeRanges,
  readNanoSizeRanges,
  nanoSizePosition,
} from "@/lib/nano-size-ranges";

export function NanoSizeRangeDisplay({
  value,
  reference = false,
}: {
  value: string;
  reference?: boolean;
}) {
  const entries = readNanoSizeRanges(value);
  return (
    <figure className="nano-size-display">
      <svg
        viewBox="0 0 480 360"
        role="img"
        aria-label={`Your unmarked diameter ranges on a logarithmic nm scale. ${entries.map((e) => `${e.name}: ${e.lowerRaw || "blank"} to ${e.upperRaw || "blank"} nm${e.plotted ? "" : ", not plotted"}`).join(". ")}. Entries are not corrected automatically.`}
      >
        {[1, 10, 100, 1000, 10000].map((tick) => (
          <g key={tick}>
            <line
              x1={nanoSizePosition(tick)!}
              x2={nanoSizePosition(tick)!}
              y1="75"
              y2="275"
              stroke="#d8deea"
            />
            <text
              x={nanoSizePosition(tick)!}
              y="311"
              fontSize="28"
              textAnchor="middle"
            >
              {tick}
            </text>
          </g>
        ))}
        {entries.map((entry, index) => (
          <g key={entry.id}>
            <text x="35" y={61 + index * 80} fontSize="30">
              {entry.name}
            </text>
            {entry.plotted && (
              <g data-size-range={entry.id}>
                <line
                  x1={entry.x1!}
                  x2={entry.x2!}
                  y1={94 + index * 80}
                  y2={94 + index * 80}
                  stroke="#b17c25"
                  strokeWidth="12"
                />
                <circle
                  cx={entry.x1!}
                  cy={94 + index * 80}
                  r="7"
                  fill="#5542b8"
                />
                <circle
                  cx={entry.x2!}
                  cy={94 + index * 80}
                  r="7"
                  fill="#5542b8"
                />
              </g>
            )}
          </g>
        ))}
        <text x="240" y="349" fontSize="28" textAnchor="middle">
          Diameter / nm · logarithmic scale
        </text>
      </svg>
      <figcaption>
        Your entries draw these ranges, including incorrect ones. Equal
        horizontal steps mean multiplying diameter by 10. These are diameter
        intervals, not particles drawn to physical scale.
      </figcaption>
      {entries.some((e) => (e.lowerRaw || e.upperRaw) && !e.plotted) && (
        <p className="nano-size-unplotted">
          Not plotted:{" "}
          {entries
            .filter((e) => (e.lowerRaw || e.upperRaw) && !e.plotted)
            .map(
              (e) =>
                `${e.name}: ${e.lowerRaw || "blank"} to ${e.upperRaw || "blank"} nm`,
            )
            .join("; ")}
          . Complete both limits from 1 to 10000 on this fixed scale, lower
          limit first. Your raw entries remain in the fields.
        </p>
      )}
      {reference && (
        <>
          <p>
            <strong>Size reference — AQA GCSE ranges</strong>
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Diameter / nm</th>
              </tr>
            </thead>
            <tbody>
              {nanoSizeRanges.map((range) => (
                <tr key={range.id}>
                  <th scope="row">{range.name}</th>
                  <td>
                    {range.lower}–{range.upper}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            1 nm = 10⁻⁹ m. Fine: 1 × 10⁻⁷ to 2.5 × 10⁻⁶ m. Coarse: 2.5 × 10⁻⁶ to
            1 × 10⁻⁵ m. AQA calls fine particles PM2.5 and coarse dust PM10. The
            stated ranges share endpoints; use clearly internal values when
            assigning a single category.
          </p>
        </>
      )}
    </figure>
  );
}
