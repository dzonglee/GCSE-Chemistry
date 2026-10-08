export function VolumeConversionAxis({
  sourceCm3,
  proposedDm3,
  proposedCm3,
}: {
  sourceCm3?: number;
  proposedDm3?: number;
  proposedCm3?: number;
}) {
  const x = (v: number) => 70 + (v / 1000) * 540,
    dmValue = proposedDm3 === undefined ? undefined : proposedDm3 * 1000;
  const finite = (v: number | undefined) =>
    v !== undefined && Number.isFinite(v);
  return (
    <figure className="volume-conversion-axis">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 700 200"
        role="img"
        aria-label={`Shared volume axis from 0 to 1000 cubic centimetres.${finite(sourceCm3) ? ` Supplied final solution volume ${sourceCm3} cm³.` : ""}${finite(proposedDm3) ? ` Your prediction ${proposedDm3} dm³ corresponds to ${dmValue} cm³ on this axis.` : ""}${finite(proposedCm3) ? ` Your cm³ prediction ${proposedCm3}.` : ""}`}
      >
        <line
          x1="70"
          x2="610"
          y1="130"
          y2="130"
          stroke="#63708b"
          strokeWidth="3"
        />
        {finite(sourceCm3) && (
          <rect
            x="70"
            y="40"
            width={(sourceCm3! / 1000) * 540}
            height="32"
            fill="#394fc5"
            data-supplied-volume={sourceCm3}
          />
        )}
        {finite(dmValue) && dmValue! >= 0 && dmValue! <= 1000 && (
          <line
            x1={x(dmValue!)}
            x2={x(dmValue!)}
            y1="25"
            y2="145"
            stroke="#bd8c24"
            strokeWidth="5"
            data-proposed-dm3={proposedDm3}
          />
        )}
        {finite(proposedCm3) && proposedCm3! >= 0 && proposedCm3! <= 1000 && (
          <circle
            cx={x(proposedCm3!)}
            cy="105"
            r="10"
            fill="#247b72"
            data-proposed-cm3={proposedCm3}
          />
        )}
        {[0, 500, 1000].map((v) => (
          <g key={v}>
            <line
              x1={x(v)}
              x2={x(v)}
              y1="125"
              y2="145"
              stroke="#63708b"
              strokeWidth="3"
            />
            <text x={x(v)} y="183" fontSize="32" textAnchor="middle">
              {v}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        Axis: cm³. 1 dm³ = 1000 cm³.{" "}
        {finite(sourceCm3)
          ? "Blue shows the supplied final solution volume."
          : ""}{" "}
        {finite(proposedDm3)
          ? dmValue! <= 1000 && dmValue! >= 0
            ? "Gold shows your dm³ prediction on the same axis."
            : `Your prediction ${proposedDm3} dm³ is outside this axis.`
          : ""}{" "}
        {finite(proposedCm3) ? "Green is your separate cm³ prediction." : ""}{" "}
        Wrong predictions stay as entered.
      </figcaption>
    </figure>
  );
}
