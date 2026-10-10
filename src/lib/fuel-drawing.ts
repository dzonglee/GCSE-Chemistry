import type { FuelPlotRecord } from "./alcohols";
export type FuelDrawingData = {
  data: FuelPlotRecord;
  note: string;
  referenceLine?: [number, number];
};
export function emptyFuelDrawing(data: FuelPlotRecord): Record<string, string> {
  return Object.fromEntries(
    [
      ...data.points.flatMap((_, i) => ["p" + i + "x", "p" + i + "y", "c" + i]),
      ...(data.independentExtrapolation ? ["extensionX"] : []),
      "estimate",
    ].map((k) => [k, ""]),
  );
}
export function readFuelDrawing(
  raw: string,
  data: FuelPlotRecord,
): Record<string, string> | null {
  if (!raw) return emptyFuelDrawing(data);
  try {
    const b = JSON.parse(raw),
      keys = Object.keys(emptyFuelDrawing(data));
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== keys.length ||
      !keys.every(
        (k) =>
          Object.hasOwn(b, k) && typeof b[k] === "string" && b[k].length <= 50,
      )
    )
      return null;
    return b;
  } catch {
    return null;
  }
}
export function describeFuelDrawing(raw: string, data: FuelPlotRecord) {
  const b = readFuelDrawing(raw, data);
  if (!b) return "Saved graph cannot be displayed; original response retained";
  const coordinate = (s: string) =>
    /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(s) && Number(s) <= 1000;
  const points = data.points.map((_, i) =>
    coordinate(b["p" + i + "x"]) && coordinate(b["p" + i + "y"])
      ? "(" + b["p" + i + "x"] + ", " + b["p" + i + "y"] + ")"
      : "incomplete point " + (i + 1),
  );
  return (
    "Your observation coordinates: " +
    points.join("; ") +
    ". Your fit and estimate require the graph self-review rubric."
  );
}
