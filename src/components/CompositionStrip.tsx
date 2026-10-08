export const compositionColours = ["#394fc5", "#c09427", "#7460c7", "#247b72"];
export function CompositionStrip({
  shares,
  label,
}: {
  shares: { element: string; value: number }[];
  label: string;
}) {
  const total = shares.reduce((sum, s) => sum + s.value, 0);
  if (!Number.isFinite(total) || total <= 0)
    throw Error("Use positive complete strip values");
  return (
    <figure className="composition-strip">
      <figcaption>{label}</figcaption>
      <div
        className="composition-strip-track"
        role="img"
        aria-label={shares
          .map(
            (s) =>
              `${s.element}: ${((100 * s.value) / total).toFixed(1)} percent`,
          )
          .join("; ")}
      >
        {shares.map((s, i) => (
          <span
            key={s.element}
            data-composition-element={s.element}
            data-composition-share={s.value / total}
            style={{
              width: `${(100 * s.value) / total}%`,
              background: compositionColours[i % compositionColours.length],
            }}
          />
        ))}
      </div>
      <ul className="composition-strip-key">
        {shares.map((s, i) => (
          <li key={s.element}>
            <span
              aria-hidden="true"
              style={{
                background: compositionColours[i % compositionColours.length],
              }}
            />
            {s.element}: {s.value} of {total}
          </li>
        ))}
      </ul>
      <p className="position-caption">
        The full strip is the whole shown quantity. Segment widths use unrounded
        values; labels may be rounded. These are quantity shares, not physical
        atom sizes.
      </p>
    </figure>
  );
}
