import type { Question } from "@/content/types";
export function IonDotCross({
  symbol,
  charge,
  dots,
  crosses,
  proposed = false,
  shellsOmitted = false,
  showBrackets,
  textLegend = false,
}: NonNullable<Question["ionDotCross"]> & { textLegend?: boolean }) {
  const total = dots + crosses,
    chargeLabel =
      charge === 0
        ? "0"
        : `${Math.abs(charge) === 1 ? "" : Math.abs(charge)}${charge > 0 ? "+" : "−"}`;
  const bracketed = showBrackets ?? charge !== 0;
  return (
    <figure
      className="ion-dot-cross"
      data-dots={dots}
      data-crosses={crosses}
      data-charge={charge}
      data-shells-omitted={shellsOmitted}
      data-brackets={bracketed}
    >
      <svg
        viewBox="0 0 260 205"
        role="img"
        aria-label={`${proposed ? "Proposed diagram" : "Current outer-shell diagram"}: ${symbol}, displayed charge ${chargeLabel}; square brackets ${bracketed ? "drawn" : "omitted"}; ${shellsOmitted ? "Electron shells omitted in this symbol; this does not mean no electrons." : `${dots} ${dots === 1 ? "dot" : "dots"} and ${crosses} ${crosses === 1 ? "cross" : "crosses"}. Inner electrons omitted.`}`}
      >
        {!shellsOmitted && (
          <circle cx="120" cy="96" r="61" fill="#f5f6fc" stroke="#c5cede" />
        )}
        <text
          x="120"
          y="104"
          textAnchor="middle"
          fontSize="25"
          fontWeight="700"
        >
          {symbol}
        </text>
        {Array.from({ length: total }, (_, i) => {
          const a = (i * 2 * Math.PI) / Math.max(total, 1) - Math.PI / 2,
            x = 120 + 61 * Math.cos(a),
            y = 96 + 61 * Math.sin(a);
          return i < dots ? (
            <circle
              key={i}
              data-marker="dot"
              cx={x}
              cy={y}
              r="5"
              fill="#703fb7"
            />
          ) : (
            <g key={i} data-marker="cross" stroke="#3547ce" strokeWidth="3">
              <path d={`M${x - 5} ${y - 5}l10 10m-10 0l10-10`} />
            </g>
          );
        })}
        {bracketed && (
          <>
            <path
              d="M45 24H33V168H45 M196 24H208V168H196"
              fill="none"
              stroke="#34405b"
              strokeWidth="2"
            />
          </>
        )}
        {(charge !== 0 || bracketed) && (
          <text x="216" y="28" fontSize="23">
            {chargeLabel}
          </text>
        )}
        <text x="120" y="190" textAnchor="middle" fontSize="19">
          {shellsOmitted
            ? "Shells omitted"
            : `${dots} ${dots === 1 ? "dot" : "dots"} + ${crosses} ${crosses === 1 ? "cross" : "crosses"}`}
        </text>
      </svg>
      <figcaption>
        {textLegend && (
          <>
            <strong>
              {symbol} · displayed charge {chargeLabel}
            </strong>
            <span>
              {dots} dots + {crosses} crosses · brackets{" "}
              {bracketed ? "drawn" : "omitted"}
            </span>
          </>
        )}
        {proposed
          ? "Your proposed diagram; it is not corrected automatically."
          : shellsOmitted
            ? "Electron shells omitted in this transfer symbol; this does not mean no electrons."
            : "Outer occupied shell shown; inner electrons omitted."}{" "}
        Dots/crosses identify origins, not different kinds of electron.
      </figcaption>
    </figure>
  );
}
