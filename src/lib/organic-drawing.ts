export type OrganicDrawingData = { maxCarbons: 4; note: string };
export type OrganicDrawing = Record<string, string>;
export function emptyOrganicDrawing(): OrganicDrawing {
  return {
    n: "",
    hydroxyl: "no",
    carbonyl: "0",
    oxygenH: "no",
    ...Object.fromEntries(
      Array.from({ length: 16 }, (_, i) => ["h" + i, "no"]),
    ),
  };
}
export function readOrganicDrawing(raw: string): OrganicDrawing | null {
  if (!raw) return emptyOrganicDrawing();
  try {
    const d = JSON.parse(raw),
      keys = Object.keys(emptyOrganicDrawing());
    if (
      !d ||
      typeof d !== "object" ||
      Array.isArray(d) ||
      Object.keys(d).length !== keys.length ||
      !keys.every((k) => Object.hasOwn(d, k) && typeof d[k] === "string") ||
      !["", "1", "2", "3", "4"].includes(d.n) ||
      !["yes", "no"].includes(d.hydroxyl) ||
      !["0", "1", "2"].includes(d.carbonyl) ||
      !["yes", "no"].includes(d.oxygenH) ||
      !keys
        .filter((k) => /^h\d+$/.test(k))
        .every((k) => ["yes", "no"].includes(d[k]))
    )
      return null;
    return d;
  } catch {
    return null;
  }
}
export function drawingOrganicCounts(d: OrganicDrawing) {
  return {
    C: Number(d.n),
    H:
      Array.from({ length: Number(d.n) * 4 }, (_, i) =>
        d["h" + i] === "yes" ? 1 : 0,
      ).reduce<number>((sum, n) => sum + n, 0) +
      (d.hydroxyl === "yes" && d.oxygenH === "yes" ? 1 : 0),
    O: (d.hydroxyl === "yes" ? 1 : 0) + (Number(d.carbonyl) > 0 ? 1 : 0),
  };
}
export function describeOrganicDrawing(raw: string) {
  const d = readOrganicDrawing(raw);
  if (!d)
    return "Saved organic drawing cannot be displayed; original response retained";
  if (!d.n) return "No carbon scaffold chosen";
  const c = drawingOrganicCounts(d);
  return `${c.C} C, ${c.H} H and ${c.O} O atoms in the active proposal; terminal C–O ${d.hydroxyl === "yes" ? "present" : "absent"}, O–H ${d.hydroxyl === "yes" && d.oxygenH === "yes" ? "present" : "absent"}, separate C–O bond order ${d.carbonyl}. Compare all local valences and the whole functional group using the self-review rubric.`;
}
