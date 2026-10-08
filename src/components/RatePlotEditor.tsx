"use client";
import { useId, useState } from "react";
import { RatePlot, RateDataTable, type RatePoint } from "./RatePlot";
import { validRatesNumber, type RateData } from "@/lib/rate-measurement";
type Board = Record<string, string | number>;
export function RatePlotEditor({
  data,
  board,
  onChange,
  onInvalid,
  tangent = false,
  showGivenCurve = false,
  disabled = false,
  persistedCoordinates = false,
  rawCoordinates,
  onRawChange,
}: {
  data: RateData;
  board: Board;
  onChange: (changes: Record<string, string>) => void;
  onInvalid?: (invalid: boolean) => void;
  tangent?: boolean;
  showGivenCurve?: boolean;
  disabled?: boolean;
  persistedCoordinates?: boolean;
  rawCoordinates?: Record<string, string>;
  onRawChange?: (coordinates: Record<string, string>) => void;
}) {
  const id = useId(),
    [selected, setSelected] = useState(1),
    [kind, setKind] = useState<"point" | "curve">("point"),
    [localRaw, setLocalRaw] = useState<Record<string, string>>({}),
    raw = rawCoordinates ?? localRaw;
  const coordinateKeys = tangent
    ? ["tx0", "ty0", "tx1", "ty1"]
    : data.times.flatMap((_, i) => [`p${i}x`, `p${i}y`, `c${i}`]);
  const hasInvalidCoordinate = (draft: Record<string, string>) =>
    coordinateKeys.some((key) => !validRatesNumber(draft[key] ?? board[key]));
  const numeric = (key: string) => {
    const v = raw[key] ?? board[key];
    return validRatesNumber(v) ? Number(v) : NaN;
  };
  const keys = tangent
    ? [`tx${selected % 2}`, `ty${selected % 2}`]
    : kind === "point"
      ? [`p${selected}x`, `p${selected}y`]
      : [`c${selected}`];
  function updateMany(changes: Record<string, string>) {
    const next = { ...raw, ...changes };
    if (!persistedCoordinates) (onRawChange ?? setLocalRaw)(next);
    onInvalid?.(hasInvalidCoordinate(next));
    onChange(changes);
  }
  function update(key: string, value: string) {
    updateMany({ [key]: value });
  }
  function move(axis: "time" | "quantity", direction: number) {
    const key = tangent
      ? axis === "time"
        ? `tx${selected % 2}`
        : `ty${selected % 2}`
      : kind === "curve"
        ? axis === "quantity"
          ? `c${selected}`
          : null
        : axis === "time"
          ? `p${selected}x`
          : `p${selected}y`;
    if (!key) return;
    const current = numeric(key);
    if (!Number.isFinite(current)) return;
    const step = axis === "time" ? 1 : data.step / 10;
    update(key, String(Number((current + direction * step).toFixed(5))));
  }
  function input(key: string) {
    const unit = key.includes("x") ? "s" : data.unit,
      label =
        (tangent
          ? "Your tangent endpoint " + ((selected % 2) + 1)
          : kind === "point"
            ? "Your plotted observation " + (selected + 1)
            : "Your curve knot at " + data.times[selected] + " s") +
        (key.includes("x") ? " time" : " quantity") +
        " / " +
        unit;
    return (
      <label key={key} htmlFor={id + "-" + key}>
        {label}
        <input
          id={id + "-" + key}
          aria-label={label}
          inputMode="decimal"
          maxLength={64}
          value={raw[key] ?? String(board[key] ?? "0")}
          onChange={(e) => update(key, e.target.value)}
        />
      </label>
    );
  }
  const points = data.times
      .map((_, i) => ({ t: numeric("p" + i + "x"), q: numeric("p" + i + "y") }))
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.q)),
    curve = data.times.map((_, i) => numeric("c" + i)),
    validCurve = curve.every(Number.isFinite),
    line: readonly [RatePoint, RatePoint] = [
      { t: numeric("tx0"), q: numeric("ty0") },
      { t: numeric("tx1"), q: numeric("ty1") },
    ];
  return (
    <fieldset className="rate-plot-editor" disabled={disabled}>
      <legend>
        {tangent
          ? "Construct your tangent"
          : "Plot observations and draw a separate curve"}
      </legend>
      <label>
        Marker to edit
        <select
          aria-label="Graph marker to edit"
          value={selected}
          onChange={(e) => {
            setSelected(Number(e.target.value));
          }}
        >
          {(tangent ? [0, 1] : data.times.map((_, i) => i)).map((i) => (
            <option key={i} value={i}>
              {tangent
                ? "Tangent endpoint " + (i + 1)
                : "Observation/knot " +
                  (i + 1) +
                  " at supplied " +
                  data.times[i] +
                  " s"}
            </option>
          ))}
        </select>
      </label>
      {!tangent && (
        <label>
          Graph element
          <select
            aria-label="Graph element to edit"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as "point" | "curve");
            }}
          >
            <option value="point">Your observed point</option>
            <option value="curve">Your separate curve knot</option>
          </select>
        </label>
      )}
      {!tangent && kind === "curve" && (
        <p>
          The curve knot stays at the supplied {data.times[selected]} s. Adjust
          its height; original observations remain independently editable.
        </p>
      )}
      <div className="rate-plot-fields">{keys.map(input)}</div>
      <p>
        {tangent
          ? "Move the two endpoints of your line so it touches the supplied curve at the requested moment and follows its local direction. No numerical gradient is required here."
          : "Retain the original observations, including unusual points. Edit the separate curve knots to follow the supported pattern; the curve preview does not replace your measurements."}
      </p>
      <RatePlot
        data={data}
        points={tangent ? undefined : points}
        curve={showGivenCurve ? data.values : validCurve ? curve : undefined}
        line={
          tangent &&
          line.every((p) => Number.isFinite(p.t) && Number.isFinite(p.q))
            ? line
            : undefined
        }
        annotation={
          tangent
            ? "Supplied graph and your proposed tangent"
            : "Your constructed graph"
        }
        onPlace={
          disabled
            ? undefined
            : (p) => {
                if (tangent) {
                  updateMany({
                    ["tx" + (selected % 2)]: String(p.t),
                    ["ty" + (selected % 2)]: String(p.q),
                  });
                } else if (kind === "curve")
                  update("c" + selected, String(p.q));
                else {
                  updateMany({
                    ["p" + selected + "x"]: String(p.t),
                    ["p" + selected + "y"]: String(p.q),
                  });
                }
              }
        }
        onMove={disabled ? undefined : move}
      />
      <div className="bench-actions">
        <button
          type="button"
          className="button"
          disabled={!tangent && kind === "curve"}
          onClick={() => move("time", -1)}
        >
          Move left 1 s
        </button>
        <button
          type="button"
          className="button"
          disabled={!tangent && kind === "curve"}
          onClick={() => move("time", 1)}
        >
          Move right 1 s
        </button>
        <button
          type="button"
          className="button"
          onClick={() => move("quantity", -1)}
        >
          Move down {data.step / 10} {data.unit}
        </button>
        <button
          type="button"
          className="button"
          onClick={() => move("quantity", 1)}
        >
          Move up {data.step / 10} {data.unit}
        </button>
      </div>
      {hasInvalidCoordinate(raw) && (
        <p role="status">
          Your invalid coordinate is retained. Enter a finite signed decimal
          before that marker can be drawn.
        </p>
      )}
      <details>
        <summary>Review all your coordinates</summary>
        <ul>
          {tangent
            ? [0, 1].map((i) => (
                <li key={i}>
                  Endpoint {i + 1}: ({board["tx" + i]}, {board["ty" + i]})
                </li>
              ))
            : data.times.map((t, i) => (
                <li key={i}>
                  Observation {i + 1}: ({board["p" + i + "x"]},{" "}
                  {board["p" + i + "y"]}); separate curve at {t} s:{" "}
                  {board["c" + i]} {data.unit}.
                </li>
              ))}
        </ul>
      </details>
      <RateDataTable data={data} />
    </fieldset>
  );
}
