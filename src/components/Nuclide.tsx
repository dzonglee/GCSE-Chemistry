import type { Question } from "@/content/types";
export function Nuclide({
  notation,
}: {
  notation: NonNullable<Question["notation"]>;
}) {
  const charge = notation.charge ?? 0;
  const chargeLabel =
    charge === 0
      ? ""
      : `${Math.abs(charge) === 1 ? "" : Math.abs(charge)}${charge > 0 ? "+" : "−"}`;
  return (
    <div className="nuclide-card">
      <span
        className="nuclide"
        role="img"
        aria-label={
          notation.annotated
            ? `${notation.symbol}, mass number ${notation.massNumber}, atomic number ${notation.atomicNumber}${charge ? `, charge ${charge}` : ""}`
            : `${notation.symbol}, upper-left number ${notation.massNumber}, lower-left number ${notation.atomicNumber}${charge ? `, upper-right charge ${chargeLabel}` : ""}`
        }
      >
        <span className="nuclide-numbers" aria-hidden="true">
          <span>{notation.massNumber}</span>
          <span>{notation.atomicNumber}</span>
        </span>
        <strong aria-hidden="true">{notation.symbol}</strong>
        {chargeLabel && (
          <sup className="nuclide-charge" aria-hidden="true">
            {chargeLabel}
          </sup>
        )}
      </span>
      {notation.annotated ? (
        <p>
          Mass number at the top.
          <br />
          Atomic number at the bottom.
        </p>
      ) : (
        <p>
          Nuclear symbol
          <br />
          {charge ? "Ion" : "Neutral atom"}
        </p>
      )}
    </div>
  );
}
