export type AlkeneDrawingData = { maxCarbons: 5; note: string };
export type AlkeneDrawing = Record<string, string>;
export function emptyAlkeneDrawing(): AlkeneDrawing {
  return {
    n: "",
    double: "",
    ...Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => ["h" + i, "no"]),
    ),
  };
}
export function readAlkeneDrawing(raw: string): AlkeneDrawing | null {
  if (!raw) return emptyAlkeneDrawing();
  try {
    const b = JSON.parse(raw),
      keys = Object.keys(emptyAlkeneDrawing());
    if (
      !b ||
      typeof b !== "object" ||
      Array.isArray(b) ||
      Object.keys(b).length !== keys.length ||
      !keys.every((k) => Object.hasOwn(b, k) && typeof b[k] === "string") ||
      !["", "2", "3", "4", "5"].includes(b.n) ||
      !["", "0", "1", "2", "3"].includes(b.double) ||
      !keys
        .filter((k) => /^h\d+$/.test(k))
        .every((k) => b[k] === "yes" || b[k] === "no")
    )
      return null;
    return b;
  } catch {
    return null;
  }
}
export function activeAlkeneDouble(b: AlkeneDrawing) {
  return b.n !== "" && b.double !== "" && Number(b.double) < Number(b.n) - 1
    ? Number(b.double)
    : null;
}
export function alkeneDrawingHydrogens(b: AlkeneDrawing) {
  return Array.from({ length: Number(b.n) * 4 }, (_, i) =>
    b["h" + i] === "yes" ? 1 : 0,
  ).reduce<number>((sum, x) => sum + x, 0);
}
export function describeAlkeneDrawing(raw: string) {
  const b = readAlkeneDrawing(raw);
  if (!b)
    return "Saved alkene drawing cannot be displayed; original response retained";
  if (!b.n) return "No carbon scaffold chosen";
  const d = activeAlkeneDouble(b);
  return `${b.n} carbon atoms; ${alkeneDrawingHydrogens(b)} attached hydrogen atoms; ${d === null ? (b.double === "" ? "no C=C selected" : "saved C=C choice is outside the current scaffold") : `C=C between carbon ${d + 1} and ${d + 2}`}. Compare every atom and bond using the self-review rubric.`;
}
