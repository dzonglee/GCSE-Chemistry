export type AlkaneDrawingData = { maxCarbons: 4; note: string };
export type AlkaneDrawing = Record<string, string>;
export function emptyAlkaneDrawing(): AlkaneDrawing {
  return {
    n: "",
    ...Object.fromEntries(
      Array.from({ length: 16 }, (_, i) => ["h" + i, "no"]),
    ),
  };
}
export function readAlkaneDrawing(raw: string): AlkaneDrawing | null {
  if (!raw) return emptyAlkaneDrawing();
  try {
    const b = JSON.parse(raw),
      keys = Object.keys(emptyAlkaneDrawing());
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== keys.length ||
      !keys.every((k) => Object.hasOwn(b, k) && typeof b[k] === "string") ||
      !["", "1", "2", "3", "4"].includes(b.n) ||
      !keys
        .filter((k) => k !== "n")
        .every((k) => b[k] === "yes" || b[k] === "no")
    )
      return null;
    return b;
  } catch {
    return null;
  }
}
export function drawingHydrogens(b: AlkaneDrawing) {
  return Array.from({ length: Number(b.n) * 4 }, (_, i) =>
    b["h" + i] === "yes" ? 1 : 0,
  ).reduce<number>((sum, x) => sum + x, 0);
}
export function describeAlkaneDrawing(raw: string) {
  const b = readAlkaneDrawing(raw);
  if (!b)
    return "Saved molecular drawing cannot be displayed; original response retained";
  if (!b.n) return "No carbon scaffold chosen";
  return `${b.n} carbon atom${b.n === "1" ? "" : "s"}; ${drawingHydrogens(b)} attached hydrogen atoms. Compare every bond and atom with the self-review rubric.`;
}
