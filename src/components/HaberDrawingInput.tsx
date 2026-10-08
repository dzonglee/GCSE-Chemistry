"use client";
import { useId, useState } from "react";
import {
  emptyHaberDrawing,
  readHaberDrawing,
  haberDrawingPoints,
  smoothHaberPath,
  type HaberDrawing,
} from "@/lib/haber-drawing";
import { readNumber } from "@/lib/marking";
export function HaberDrawingInput({
  drawing,
  value,
  onChange,
  disabled = false,
  compact = false,
}: {
  drawing: HaberDrawing;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const uid = useId(),
    [selected, setSelected] = useState(0),
    b = readHaberDrawing(value);
  if (!b)
    return (
      <p role="status">
        Saved graph construction is unreadable. Your original response is
        retained. Use Clear answer to start again.
      </p>
    );
  const xMax = readNumber(b.xMax),
    yMax = readNumber(b.yMax),
    xStep = readNumber(b.xStep),
    yStep = readNumber(b.yStep);
  const scale =
    !!xMax &&
    !!yMax &&
    !!xStep &&
    !!yStep &&
    xMax > 0 &&
    yMax > 0 &&
    xStep > 0 &&
    yStep > 0 &&
    xMax / xStep <= 20 &&
    yMax / yStep <= 20 &&
    Number.isInteger(xMax / xStep) &&
    Number.isInteger(yMax / yStep);
  const x = (n: number) => 60 + (340 * n) / (xMax || 400),
    y = (n: number) => 245 - (205 * n) / (yMax || 40);
  const points = scale ? haberDrawingPoints(b, xMax, yMax) : [];
  const curve = scale
    ? drawing.points
        .map(([px], i) => ({ x: px, y: readNumber(b["c" + i]) }))
        .filter(
          (p): p is { x: number; y: number } =>
            p.y !== null && p.x <= xMax && p.y >= 0 && p.y <= yMax,
        )
    : [];
  function edit(k: string, v: string) {
    onChange(JSON.stringify({ ...b, [k]: v }));
  }
  return (
    <div className="haber-drawing">
      {!compact && (
        <p>
          {drawing.note} This construction is saved for manual review; it
          receives no automatic graph mark.
        </p>
      )}
      {compact ? (
        <div
          className="assessment-data-pan"
          tabIndex={0}
          role="group"
          aria-label="Original pressure–yield observations; scroll horizontally"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              e.currentTarget.scrollBy({
                left: e.key === "ArrowLeft" ? -60 : 60,
              });
            }
          }}
        >
          <table>
            <caption>
              Scroll for all seven; illustrative data at fixed temperature.
            </caption>
            <tbody>
              <tr>
                <th scope="row">Pressure / atm</th>
                {drawing.points.map(([px]) => (
                  <td key={px}>{px}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Yield / %</th>
                {drawing.points.map(([px, py]) => (
                  <td key={px}>{py}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <table>
          <caption>Original pressure–yield observations</caption>
          <thead>
            <tr>
              <th scope="col">Pressure / atm</th>
              <th scope="col">Equilibrium yield / %</th>
            </tr>
          </thead>
          <tbody>
            {drawing.points.map(([px, py]) => (
              <tr key={px}>
                <th scope="row">{px}</th>
                <td>{py}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <fieldset disabled={disabled}>
        <legend>Choose equal axis scales</legend>
        <div className="haber-fields">
          {(
            [
              ["xMax", "Maximum pressure / atm", ["400", "500", "600"]],
              [
                "xStep",
                "Pressure per major interval / atm",
                ["50", "100", "200"],
              ],
              ["yMax", "Maximum yield / %", ["40", "50", "60"]],
              [
                "yStep",
                "Yield per major interval / percentage points",
                ["5", "10", "20"],
              ],
            ] as const
          ).map(([k, label, opts]) => (
            <label key={k} htmlFor={uid + k}>
              {label}
              <select
                id={uid + k}
                value={b[k]}
                onChange={(e) => edit(k, e.target.value)}
              >
                <option value="">Choose…</option>
                {opts.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </fieldset>
      {compact && (
        <p>
          {drawing.note} This construction is saved for manual review; no
          automatic graph mark.
        </p>
      )}
      <figure className="haber-graph">
        <div
          className="haber-graph-scroll"
          tabIndex={0}
          aria-label="Scrollable pressure–yield drawing"
        >
          <svg
            viewBox="0 0 420 300"
            role="img"
            aria-label="Your pressure–yield graph and separate best-fit curve"
            onPointerDown={(e) => {
              if (disabled || !scale) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const px = ((e.clientX - rect.left) / rect.width) * 420,
                py = ((e.clientY - rect.top) / rect.height) * 300;
              if (px < 60 || px > 400 || py < 40 || py > 245) return;
              onChange(
                JSON.stringify({
                  ...b,
                  ["p" + selected + "x"]: String(
                    Math.round(((px - 60) / 340) * xMax * 10) / 10,
                  ),
                  ["p" + selected + "y"]: String(
                    Math.round(((245 - py) / 205) * yMax * 10) / 10,
                  ),
                }),
              );
            }}
          >
            <path
              d="M60 40 V245 H400"
              stroke="#252e46"
              fill="none"
              strokeWidth="2"
            />
            {scale &&
              Array.from({ length: xMax / xStep + 1 }, (_, i) => (
                <g key={"x" + i}>
                  <line
                    x1={x(i * xStep)}
                    x2={x(i * xStep)}
                    y1="40"
                    y2="245"
                    stroke="#d5dbe7"
                  />
                  <text x={x(i * xStep)} y="268" textAnchor="middle">
                    {i * xStep}
                  </text>
                </g>
              ))}
            {scale &&
              Array.from({ length: yMax / yStep + 1 }, (_, i) => (
                <g key={"y" + i}>
                  <line
                    x1="60"
                    x2="400"
                    y1={y(i * yStep)}
                    y2={y(i * yStep)}
                    stroke="#d5dbe7"
                  />
                  <text x="48" y={y(i * yStep) + 5} textAnchor="end">
                    {i * yStep}
                  </text>
                </g>
              ))}
            <text x="230" y="294" textAnchor="middle">
              Pressure / atm
            </text>
            <text x="60" y="21">
              Equilibrium yield / %
            </text>
            {points.map((p) => (
              <g
                key={p.i}
                className="haber-free-point"
                data-x={p.x}
                data-y={p.y}
              >
                <path
                  d={`M${x(p.x) - 5} ${y(p.y) - 5} l10 10 M${x(p.x) - 5} ${y(p.y) + 5} l10 -10`}
                  stroke="#a7760c"
                  strokeWidth="3"
                />
              </g>
            ))}
            {curve.length === drawing.points.length && (
              <path
                className="haber-best-fit"
                d={smoothHaberPath(curve.map((p) => [x(p.x), y(p.y)]))}
                fill="none"
                stroke="#0f7a73"
                strokeWidth="3"
              />
            )}
          </svg>
        </div>
        <figcaption>
          Gold crosses are your observations; green is your separately chosen
          smooth best-fit curve. Incorrect observations are not erased or moved
          to the curve. No given observations are preplotted. Tap the plot to
          position the selected point, or use the labelled coordinate fields.
        </figcaption>
      </figure>
      {!scale && (
        <p role="status">
          Choose positive equal intervals that divide each axis maximum. The
          graph stays blank until its scales are usable.
        </p>
      )}
      <fieldset disabled={disabled}>
        <legend>Plot your seven observations</legend>
        <label htmlFor={uid + "selected"}>
          Point to place by touch
          <select
            id={uid + "selected"}
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
          >
            {drawing.points.map((_, i) => (
              <option key={i} value={i}>
                Point{i + 1}
              </option>
            ))}
          </select>
        </label>
        <div className="haber-coordinate-fields">
          {drawing.points.map((_, i) => (
            <div key={i}>
              {(["x", "y"] as const).map((axis) => (
                <label key={axis} htmlFor={uid + i + axis}>
                  Point{i + 1} {axis === "x" ? "pressure / atm" : "yield / %"}
                  <input
                    id={uid + i + axis}
                    value={b["p" + i + axis]}
                    maxLength={32}
                    inputMode="decimal"
                    onChange={(e) => edit("p" + i + axis, e.target.value)}
                  />
                </label>
              ))}
            </div>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={disabled}>
        <legend>Shape a separate smooth best-fit curve</legend>
        <p>
          Choose curve heights at the listed pressures. The curve smooths
          between these control heights; its purpose is to represent the trend,
          not force every observation onto it.
        </p>
        <div className="haber-fields">
          {drawing.points.map(([px], i) => (
            <label key={i} htmlFor={uid + "c" + i}>
              Curve control at{px} atm / %
              <input
                id={uid + "c" + i}
                value={b["c" + i]}
                inputMode="decimal"
                maxLength={32}
                onChange={(e) => edit("c" + i, e.target.value)}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <p className="haber-plot-values">
        Plotted entries:
        {drawing.points
          .map(
            (_, i) =>
              `(${b["p" + i + "x"] || "unknown"},${b["p" + i + "y"] || "unknown"})`,
          )
          .join("; ")}
        . Out-of-range or malformed values stay in fields and are not plotted.
        Fraction/scientific notation is accepted when numerically valid.
      </p>
      <button
        type="button"
        className="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(emptyHaberDrawing()))}
      >
        Clear graph construction
      </button>
    </div>
  );
}
