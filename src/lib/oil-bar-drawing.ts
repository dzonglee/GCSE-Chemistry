export type OilBarDrawingData = {
  fraction: string;
  percentages: [number, number];
  max: number;
  intervals: number;
  note: string;
};
export type OilBarDrawing = Record<string, string>;
export const emptyOilBarDrawing = (): OilBarDrawing => ({
  step: "",
  pA: "",
  pB: "",
  vA: "0",
  vB: "0",
  placedA: "no",
  placedB: "no",
  selected: "A",
});
/** Raw drafts are preserved; only explicitly placed canonical heights drive the drawing. */
export function readOilBarDrawing(raw: string): OilBarDrawing | null {
  if (!raw) return emptyOilBarDrawing();
  try {
    const b = JSON.parse(raw),
      keys = Object.keys(emptyOilBarDrawing());
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== keys.length ||
      !keys.every((k) => typeof b[k] === "string" && b[k].length <= 50) ||
      !["A", "B"].includes(b.selected) ||
      !["yes", "no"].includes(b.placedA) ||
      !["yes", "no"].includes(b.placedB) ||
      ![b.vA, b.vB].every(
        (x) => /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(x) && Number(x) <= 100000,
      )
    )
      return null;
    return b;
  } catch {
    return null;
  }
}
export const oilBarNumber = (s: string) =>
  /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(s) && Number(s) <= 100000
    ? Number(s)
    : null;
