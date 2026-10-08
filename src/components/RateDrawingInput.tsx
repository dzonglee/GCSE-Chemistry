"use client";
import { RatePlotEditor } from "./RatePlotEditor";
import type { RateData } from "@/lib/rate-measurement";
export interface RateDrawingData {
  data: RateData;
  kind: "plot-fit" | "tangent";
  atTime?: number;
}
export function emptyRateDrawing(
  kind: RateDrawingData["kind"],
): Record<string, string> {
  return Object.fromEntries(
    (kind === "tangent"
      ? ["tx0", "ty0", "tx1", "ty1"]
      : Array.from({ length: 7 }, (_, i) => [
          "p" + i + "x",
          "p" + i + "y",
          "c" + i,
        ]).flat()
    ).map((k) => [k, "0"]),
  );
}
export function readRateDrawing(
  value: string,
  kind: RateDrawingData["kind"],
): Record<string, string> | null {
  if (!value) return emptyRateDrawing(kind);
  try {
    const b = JSON.parse(value),
      keys = Object.keys(emptyRateDrawing(kind));
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== keys.length ||
      !keys.every((k) => typeof b[k] === "string" && b[k].length <= 50)
    )
      return null;
    return b;
  } catch {
    return null;
  }
}
export function RateDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  drawing: RateDrawingData;
  disabled?: boolean;
}) {
  const b = readRateDrawing(value, drawing.kind);
  if (!b)
    return (
      <div role="status">
        <p>
          Your saved drawing cannot be displayed in the current format. Its
          original answer is retained.
        </p>
        <button
          type="button"
          className="button"
          disabled={disabled}
          onClick={() =>
            onChange(JSON.stringify(emptyRateDrawing(drawing.kind)))
          }
        >
          Start a new construction
        </button>
      </div>
    );
  return (
    <div className="rate-drawing-input">
      <p>
        {drawing.kind === "tangent"
          ? "Construct a tangent at " +
            drawing.atTime +
            " s on the supplied curve."
          : "Plot the supplied observations and construct a separate supported best-fit curve."}{" "}
        This drawing is saved for self-review; no examiner mark is awarded.
      </p>
      <RatePlotEditor
        data={drawing.data}
        persistedCoordinates
        board={b}
        tangent={drawing.kind === "tangent"}
        showGivenCurve={drawing.kind === "tangent"}
        disabled={disabled}
        onChange={(changes) => onChange(JSON.stringify({ ...b, ...changes }))}
      />
      <button
        type="button"
        className="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(emptyRateDrawing(drawing.kind)))}
      >
        Clear your construction
      </button>
    </div>
  );
}
