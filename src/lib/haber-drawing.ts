import { readNumber } from "./marking";
export type HaberDrawing = {
  points: readonly (readonly [number, number])[];
  note: string;
};
export const haberDrawingKeys = [
  "xMax",
  "xStep",
  "yMax",
  "yStep",
  ...Array.from({ length: 7 }, (_, i) => [
    "p" + i + "x",
    "p" + i + "y",
    "c" + i,
  ]).flat(),
];
export function emptyHaberDrawing(): Record<string, string> {
  return Object.fromEntries(haberDrawingKeys.map((k) => [k, ""]));
}
export function readHaberDrawing(value: string): Record<string, string> | null {
  if (!value) return emptyHaberDrawing();
  try {
    const b = JSON.parse(value);
    return b &&
      typeof b === "object" &&
      !Array.isArray(b) &&
      Object.getPrototypeOf(b) === Object.prototype &&
      Object.keys(b).length === haberDrawingKeys.length &&
      haberDrawingKeys.every(
        (k) => typeof b[k] === "string" && b[k].length <= 32,
      )
      ? b
      : null;
  } catch {
    return null;
  }
}
export function smoothHaberPath(
  points: readonly (readonly [number, number])[],
) {
  if (points.length < 2) return "";
  const [first, ...rest] = points;
  let d = `M${first[0]} ${first[1]}`;
  for (let i = 0; i < rest.length; i++) {
    const p = rest[i],
      n = rest[i + 1];
    d += n
      ? ` Q${p[0]} ${p[1]} ${(p[0] + n[0]) / 2} ${(p[1] + n[1]) / 2}`
      : ` T${p[0]} ${p[1]}`;
  }
  return d;
}
export function haberDrawingPoints(
  b: Record<string, string>,
  xMax: number,
  yMax: number,
) {
  return Array.from({ length: 7 }, (_, i) => ({
    i,
    x: readNumber(b["p" + i + "x"]),
    y: readNumber(b["p" + i + "y"]),
  })).filter(
    (p): p is { i: number; x: number; y: number } =>
      p.x !== null &&
      p.y !== null &&
      p.x >= 0 &&
      p.x <= xMax &&
      p.y >= 0 &&
      p.y <= yMax,
  );
}
