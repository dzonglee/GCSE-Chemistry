"use client";
import { useId, useState } from "react";
import { FUEL_GRID_SUBDIVISIONS, type FuelPlotRecord } from "../lib/alcohols";
export function fuelCoordinate(raw: string | undefined) {
  return raw !== undefined &&
    /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(raw) &&
    raw.length <= 20 &&
    Number(raw) <= 1000
    ? Number(raw)
    : null;
}
export function FuelPlotEditor({
  data,
  board,
  inputValues = board,
  onChange,
  disabled = false,
  contextLabel,
  compact = false,
}: {
  data: FuelPlotRecord;
  board: Record<string, string>;
  inputValues?: Record<string, string>;
  onChange: (changes: Record<string, string>) => void;
  disabled?: boolean;
  contextLabel?: string;
  compact?: boolean;
}) {
  const uid = useId(),
    [selected, setSelected] = useState(0),
    [layer, setLayer] = useState<"point" | "curve">("point"),
    straight = data.fitKind === "straight",
    fitName = straight ? "line" : "curve",
    indices =
      straight && layer === "curve"
        ? [0, data.points.length - 1]
        : data.points.map((_, i) => i),
    index = indices.includes(selected) ? selected : indices[0],
    left = 100,
    right = 620,
    top = 35,
    bottom = 335,
    px = (x: number) =>
      left + ((x - data.xMin) / (data.xMax - data.xMin)) * (right - left),
    py = (y: number) =>
      bottom - ((y - data.yMin) / (data.yMax - data.yMin)) * (bottom - top),
    inside = (x: number, y: number) =>
      x >= data.xMin && x <= data.xMax && y >= data.yMin && y <= data.yMax,
    points = data.points.map((_, i) => ({
      i,
      x: fuelCoordinate(board["p" + i + "x"]),
      y: fuelCoordinate(board["p" + i + "y"]),
    })),
    curve = data.points.flatMap(([x], i) =>
      straight && i !== 0 && i !== data.points.length - 1
        ? []
        : [{ x, y: fuelCoordinate(board["c" + i]) }],
    ),
    estimateValue = fuelCoordinate(board.estimate),
    extensionX = data.independentExtrapolation
      ? fuelCoordinate(board.extensionX)
      : data.targetX,
    extrapolationAnchor =
      extensionX === null
        ? null
        : extensionX < curve[0].x
          ? curve[0]
          : extensionX > curve.at(-1)!.x
            ? curve.at(-1)!
            : null,
    hasCurve = curve.every((c) => c.y !== null),
    projectedY =
      hasCurve && straight && extensionX !== null
        ? curve[0].y! +
          ((extensionX - curve[0].x) * (curve[1].y! - curve[0].y!)) /
            (curve[1].x - curve[0].x)
        : data.independentExtrapolation
          ? null
          : estimateValue,
    outside = points
      .filter((p) => p.x !== null && p.y !== null && !inside(p.x, p.y))
      .map((p) => "Point " + (p.i + 1))
      .concat(
        curve
          .filter((c) => c.y !== null && !inside(c.x, c.y))
          .map((c) => fitName + " height at x=" + c.x),
      )
      .concat(
        estimateValue !== null && !inside(data.targetX, estimateValue)
          ? ["Proposed estimate"]
          : [],
      )
      .concat(
        straight && projectedY !== null && !inside(extensionX!, projectedY)
          ? ["Your extrapolated line crossing"]
          : [],
      ),
    curvePoints = curve.map((c) => ({ x: px(c.x), y: py(c.y ?? data.yMin) }));
  let path = "";
  if (hasCurve) {
    path = "M" + curvePoints[0].x + "," + curvePoints[0].y;
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p0 = curvePoints[Math.max(0, i - 1)],
        p1 = curvePoints[i],
        p2 = curvePoints[i + 1],
        p3 = curvePoints[Math.min(curvePoints.length - 1, i + 2)];
      if (straight) {
        path += ` L${p2.x},${p2.y}`;
        continue;
      }
      path += ` C${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`;
    }
  }
  function place(x: number, y: number) {
    const clean = (n: number) => String(Number(n.toFixed(straight ? 1 : 2))),
      nx = clean(Math.max(data.xMin, Math.min(data.xMax, x))),
      ny = clean(Math.max(data.yMin, Math.min(data.yMax, y)));
    onChange(
      layer === "curve"
        ? { ["c" + index]: ny }
        : { ["p" + index + "x"]: nx, ["p" + index + "y"]: ny },
    );
  }
  function keyboard(key: string) {
    if (layer === "curve" && ["ArrowLeft", "ArrowRight"].includes(key)) {
      const position = indices.indexOf(index);
      setSelected(
        indices[
          Math.max(
            0,
            Math.min(
              indices.length - 1,
              position + (key === "ArrowLeft" ? -1 : 1),
            ),
          )
        ],
      );
      return;
    }
    const x = fuelCoordinate(board["p" + index + "x"]) ?? data.xMin,
      y =
        fuelCoordinate(
          board[layer === "curve" ? "c" + index : "p" + index + "y"],
        ) ?? data.yMin,
      dx = data.xTick / 10,
      dy = data.yTick / 10;
    place(
      x + (key === "ArrowLeft" ? -dx : key === "ArrowRight" ? dx : 0),
      y + (key === "ArrowUp" ? dy : key === "ArrowDown" ? -dy : 0),
    );
  }
  const coordinateFields = (
    <>
      <div className="organic-fields">
        {(layer === "point"
          ? ["p" + index + "x", "p" + index + "y"]
          : ["c" + index]
        ).map((key, i) => (
          <div className="organic-field" key={key}>
            <label htmlFor={uid + "-" + key}>
              {layer === "curve"
                ? `Your fit height at original x=${data.points[index][0]} (${data.yUnit})`
                : `${straight ? "Point" : "Your plotted point"} ${index + 1} ${i === 0 ? "x" + (data.xUnit ? " (" + data.xUnit + ")" : "") : "y" + (data.yUnit ? " (" + data.yUnit + ")" : "")}`}
            </label>
            <input
              id={uid + "-" + key}
              data-plot-field={key}
              inputMode="decimal"
              disabled={disabled}
              value={inputValues[key]}
              onChange={(e) => onChange({ [key]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </>
  );
  return (
    <section
      className="fuel-plot-editor"
      aria-label={
        contextLabel
          ? `${contextLabel}: observation plot editor`
          : data.context === "temperature"
            ? "Temperature observation plot editor"
            : "Fuel observation plot editor"
      }
    >
      {(straight || compact) && coordinateFields}
      <div className="organic-field">
        <label htmlFor={uid + "-selected"}>
          {straight
            ? "Choose an observation or line end"
            : "Choose the observation to plot or curve height to edit"}
        </label>
        <select
          id={uid + "-selected"}
          value={index}
          disabled={disabled}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          {indices.map((i) => (
            <option key={i} value={i}>
              {!straight
                ? `Observation ${i + 1}; curve anchor x=${data.points[i][0]}`
                : layer === "point"
                  ? `Observation ${i + 1}`
                  : `Line end at ${data.points[i][0]} ${data.xUnit}`}
            </option>
          ))}
        </select>
      </div>
      <div className="model-controls">
        <button
          type="button"
          disabled={disabled}
          aria-pressed={layer === "point"}
          onClick={() => setLayer("point")}
        >
          {disabled ? "View observation points" : "Edit observation point"}
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={layer === "curve"}
          onClick={() => setLayer("curve")}
        >
          {disabled
            ? `View fit ${fitName}`
            : straight
              ? "Edit your best-fit line"
              : "Edit your fit curve"}
        </button>
      </div>
      <p>
        The original scales stay fixed. Tap the plot, or focus it and use arrow
        keys (one tenth of a labelled interval). In {fitName} mode, edit the
        chosen fixed-x {fitName} anchor’s height. Enter any coordinate{" "}
        {straight ? "above" : "below"}. Use Shift+Left/Right to scroll
        horizontally.
      </p>
      <div
        className="fuel-plot-scroll"
        role="region"
        aria-label={
          contextLabel
            ? `${contextLabel}: graph with fixed original scales`
            : data.context === "temperature"
              ? "Temperature graph with fixed original scales"
              : "Fuel graph with fixed original scales"
        }
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.shiftKey && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            e.currentTarget.scrollLeft += e.key === "ArrowLeft" ? -80 : 80;
            return;
          }
          if (
            !disabled &&
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            keyboard(e.key);
          }
        }}
      >
        <svg
          viewBox="0 0 650 450"
          style={{ minWidth: 390, maxWidth: 650 }}
          role="img"
          aria-label={`Your plotted points and separate chosen fit ${fitName}. The y-axis starts at the printed original minimum, not necessarily zero. Keyboard and labelled coordinate inputs provide alternatives.`}
          onClick={
            disabled
              ? undefined
              : (e) => {
                  const b = e.currentTarget.getBoundingClientRect(),
                    x = ((e.clientX - b.left) * 650) / b.width,
                    y = ((e.clientY - b.top) * 450) / b.height;
                  if (x >= left && x <= right && y >= top && y <= bottom)
                    place(
                      data.xMin +
                        ((x - left) / (right - left)) * (data.xMax - data.xMin),
                      data.yMin +
                        ((bottom - y) / (bottom - top)) *
                          (data.yMax - data.yMin),
                    );
                }
          }
        >
          <defs>
            <clipPath id={uid + "-clip"}>
              <rect
                x={left - 8}
                y={top - 8}
                width={right - left + 16}
                height={bottom - top + 16}
              />
            </clipPath>
          </defs>
          {Array.from(
            {
              length:
                Math.round(
                  ((data.xMax - data.xMin) / data.xTick) *
                    FUEL_GRID_SUBDIVISIONS,
                ) + 1,
            },
            (_, i) =>
              i % FUEL_GRID_SUBDIVISIONS === 0 ? null : (
                <line
                  key={"minor-x" + i}
                  x1={px(data.xMin + (i * data.xTick) / FUEL_GRID_SUBDIVISIONS)}
                  x2={px(data.xMin + (i * data.xTick) / FUEL_GRID_SUBDIVISIONS)}
                  y1={top}
                  y2={bottom}
                  stroke="#e2e7f1"
                  data-minor-grid="x"
                />
              ),
          )}
          {Array.from(
            {
              length:
                Math.round(
                  ((data.yMax - data.yMin) / data.yTick) *
                    FUEL_GRID_SUBDIVISIONS,
                ) + 1,
            },
            (_, i) =>
              i % FUEL_GRID_SUBDIVISIONS === 0 ? null : (
                <line
                  key={"minor-y" + i}
                  x1={left}
                  x2={right}
                  y1={py(data.yMin + (i * data.yTick) / FUEL_GRID_SUBDIVISIONS)}
                  y2={py(data.yMin + (i * data.yTick) / FUEL_GRID_SUBDIVISIONS)}
                  stroke="#e2e7f1"
                  data-minor-grid="y"
                />
              ),
          )}
          {Array.from(
            { length: Math.round((data.xMax - data.xMin) / data.xTick) + 1 },
            (_, i) => {
              const x = data.xMin + i * data.xTick;
              return (
                <g key={"x" + i}>
                  <line
                    x1={px(x)}
                    y1={top}
                    x2={px(x)}
                    y2={bottom}
                    stroke="#d5ddea"
                  />
                  <text x={px(x)} y={bottom + 28} textAnchor="middle">
                    {Number(x.toFixed(2))}
                  </text>
                </g>
              );
            },
          )}
          {Array.from(
            { length: Math.round((data.yMax - data.yMin) / data.yTick) + 1 },
            (_, i) => {
              const y = data.yMin + i * data.yTick;
              return (
                <g key={"y" + i}>
                  <line
                    x1={left}
                    y1={py(y)}
                    x2={right}
                    y2={py(y)}
                    stroke="#d5ddea"
                  />
                  <text x={left - 12} y={py(y) + 7} textAnchor="end">
                    {Number(y.toFixed(2))}
                  </text>
                </g>
              );
            },
          )}
          <line
            x1={left}
            y1={top}
            x2={left}
            y2={bottom}
            stroke="#445674"
            strokeWidth="2"
          />
          <line
            x1={left}
            y1={bottom}
            x2={right}
            y2={bottom}
            stroke="#445674"
            strokeWidth="2"
          />
          <g clipPath={`url(#${uid}-clip)`}>
            {hasCurve && (
              <path
                d={path}
                fill="none"
                stroke="#bd7624"
                strokeWidth="3"
                data-fit={straight ? "your-chosen-line" : "your-chosen-curve"}
              />
            )}
            {hasCurve && extrapolationAnchor && projectedY !== null && (
              <line
                x1={px(extrapolationAnchor.x)}
                y1={py(extrapolationAnchor.y!)}
                x2={px(extensionX!)}
                y2={py(projectedY)}
                stroke="#bd7624"
                strokeWidth="3"
                strokeDasharray="7 5"
                data-fit-extrapolation="your-proposal"
              />
            )}
            {points.map((p) =>
              p.x === null || p.y === null ? null : (
                <g key={p.i} data-plot-point={p.i} data-x={p.x} data-y={p.y}>
                  <line
                    x1={px(p.x) - 6}
                    y1={py(p.y) - 6}
                    x2={px(p.x) + 6}
                    y2={py(p.y) + 6}
                    stroke="#3347be"
                    strokeWidth="3"
                  />
                  <line
                    x1={px(p.x) - 6}
                    y1={py(p.y) + 6}
                    x2={px(p.x) + 6}
                    y2={py(p.y) - 6}
                    stroke="#3347be"
                    strokeWidth="3"
                  />
                </g>
              ),
            )}
            {fuelCoordinate(board.estimate) !== null && (
              <circle
                cx={px(data.targetX)}
                cy={py(fuelCoordinate(board.estimate)!)}
                r="7"
                fill="none"
                stroke="#bd7624"
                strokeWidth="3"
                data-estimate="your-proposal"
              />
            )}
          </g>
          <text x={(left + right) / 2} y="399" textAnchor="middle">
            {data.xName}
          </text>
          <text x={(left + right) / 2} y="431" textAnchor="middle">
            {data.xUnit ? `(${data.xUnit})` : ""}
          </text>
          <text x="16" y="19">
            {data.yName} ({data.yUnit})
          </text>
        </svg>
      </div>
      <p>
        Each labelled interval has five small squares. Blue crosses: your
        plotted observations. Amber {fitName}: your chosen fit, drawn only after
        {straight ? " both end heights" : " all curve heights"} are entered.
        Open amber circle: your proposed estimate at x={data.targetX}. Neither
        fit nor estimate is automatically examiner-marked.
      </p>
      {hasCurve && extrapolationAnchor && projectedY !== null && (
        <p>
          {straight
            ? "The dashed segment extends your straight line using its slope. Compare its y-axis crossing with your separate estimate circle; neither is automatically marked."
            : "The dashed segment joins your own outer fit height to your chosen extrapolated estimate. It represents your proposal beyond the original observations and is self-reviewed."}
        </p>
      )}
      {outside.length > 0 && (
        <p role="status">
          Retained outside the original printed scale: {outside.join("; ")}. The
          axis limits have not changed.
        </p>
      )}
      {!straight && !compact && coordinateFields}
      {data.independentExtrapolation && (
        <div className="organic-field">
          <label htmlFor={uid + "-extension"}>
            Your extrapolated line end x ({data.xUnit})
          </label>
          <input
            id={uid + "-extension"}
            inputMode="decimal"
            disabled={disabled}
            value={inputValues.extensionX}
            onChange={(e) => onChange({ extensionX: e.target.value })}
          />
          <p>
            Choose where to extend your fitted line. Its dashed extension
            appears only after you enter an endpoint outside the observed x
            range.
          </p>
        </div>
      )}
      <div className="organic-field">
        <label htmlFor={uid + "-estimate"}>
          Your proposed estimate at x={data.targetX} ({data.yUnit})
        </label>
        <input
          id={uid + "-estimate"}
          inputMode="decimal"
          disabled={disabled}
          value={inputValues.estimate}
          onChange={(e) => onChange({ estimate: e.target.value })}
        />
      </div>
    </section>
  );
}
