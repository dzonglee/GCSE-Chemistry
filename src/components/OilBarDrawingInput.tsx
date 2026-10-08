"use client";
import { useId } from "react";
import { OilBarChart } from "./OilBarChart";
import {
  emptyOilBarDrawing,
  readOilBarDrawing,
  oilBarNumber,
  type OilBarDrawingData,
} from "../lib/oil-bar-drawing";
export function OilBarDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  drawing: OilBarDrawingData;
  disabled?: boolean;
}) {
  const uid = useId(),
    b = readOilBarDrawing(value);
  if (!b)
    return (
      <div role="status">
        <p>
          Your saved chart cannot be displayed in this format. The original
          response is retained.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(emptyOilBarDrawing()))}
        >
          Start a new chart
        </button>
      </div>
    );
  const save = (key: string, v: string) =>
      onChange(JSON.stringify({ ...b, [key]: v })),
    source = b.selected,
    height = oilBarNumber(b["p" + source]),
    scale = oilBarNumber(b.step);
  const place = () => {
    if (height !== null && height <= drawing.max)
      onChange(
        JSON.stringify({
          ...b,
          ["v" + source]: b["p" + source],
          ["placed" + source]: "yes",
        }),
      );
  };
  return (
    <section className="oil-drawing" aria-label="Percentage chart construction">
      <p>{drawing.note}</p>
      <table>
        <caption>
          Original {drawing.fraction.toLowerCase()} observations — percentage by
          mass
        </caption>
        <thead>
          <tr>
            <th>Source</th>
            <th>Percentage / %</th>
          </tr>
        </thead>
        <tbody>
          {drawing.percentages.map((v, i) => (
            <tr key={i}>
              <th scope="row">{i === 0 ? "A" : "B"}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Construct an axis from 0 to {drawing.max}% with {drawing.intervals}{" "}
        equal major intervals. Original observations are supplied above; the
        drawing receives no automatic examiner mark.
      </p>
      <label htmlFor={uid + "-step"}>
        Your major interval / percentage points
      </label>
      <input
        id={uid + "-step"}
        inputMode="decimal"
        value={b.step}
        disabled={disabled}
        onChange={(e) => save("step", e.target.value)}
      />
      <p className="oil-chart-heading">{drawing.fraction} / % by mass</p>
      <OilBarChart
        max={drawing.max}
        step={b.step}
        bars={[b.vA, b.vB]}
        placed={[b.placedA === "yes", b.placedB === "yes"]}
        onChoose={
          disabled
            ? undefined
            : (s, h) =>
                onChange(
                  JSON.stringify({ ...b, selected: s, ["p" + s]: String(h) }),
                )
        }
      />
      <p>Source</p>
      <label htmlFor={uid + "-source"}>Choose source bar</label>
      <select
        id={uid + "-source"}
        disabled={disabled}
        value={source}
        onChange={(e) => save("selected", e.target.value)}
      >
        <option>A</option>
        <option>B</option>
      </select>
      <label htmlFor={uid + "-height"}>Selected bar height / %</label>
      <input
        id={uid + "-height"}
        disabled={disabled}
        inputMode="decimal"
        value={b["p" + source]}
        onChange={(e) => save("p" + source, e.target.value)}
      />
      <div className="model-controls">
        <button
          type="button"
          disabled={disabled || height === null || height <= 0}
          onClick={() => save("p" + source, String(Math.max(0, height! - 1)))}
        >
          Lower bar
        </button>
        <button
          type="button"
          disabled={disabled || height === null || height >= drawing.max}
          onClick={() => save("p" + source, String(height! + 1))}
        >
          Raise bar
        </button>
        <button
          type="button"
          disabled={disabled || height === null || height > drawing.max}
          onClick={place}
        >
          Place selected bar
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(emptyOilBarDrawing()))}
        >
          Clear construction
        </button>
      </div>
      <p>
        Placed bars: A{b.placedA === "yes" ? ` at ${b.vA}%` : " not placed"}; B
        {b.placedB === "yes" ? ` at ${b.vB}%` : " not placed"}. Editing a height
        changes the pending prediction; use Place selected bar to update the
        drawn bar.
      </p>
      {((height === null && b["p" + source] !== "") ||
        (height !== null && height > drawing.max) ||
        (scale === null && b.step !== "") ||
        (scale !== null &&
          (scale <= 0 ||
            !Number.isInteger(drawing.max / scale) ||
            drawing.max / scale > 20))) && (
        <p role="status">
          Keep the raw draft, then use an ordinary non-negative decimal height
          within the stated chart range and a suitable equal scale interval. The
          last explicitly placed bars remain visible.
        </p>
      )}
    </section>
  );
}
