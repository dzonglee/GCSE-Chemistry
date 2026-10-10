import { readNumber } from "./marking";

export const nanoSizeRanges = [
  { id: "nano", name: "Nano", lower: 1, upper: 100 },
  { id: "fine", name: "Fine", lower: 100, upper: 2500 },
  { id: "coarse", name: "Coarse / dust", lower: 2500, upper: 10000 },
] as const;

export function nanoSizePosition(value: number): number | null {
  return Number.isFinite(value) && value >= 1 && value <= 10000
    ? 35 + (Math.log10(value) / 4) * 395
    : null;
}

export function readNanoSizeRanges(raw: string) {
  let values: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      values = parsed as Record<string, unknown>;
  } catch {
    // A malformed retained draft is not replaced by a plausible reference.
  }
  return nanoSizeRanges.map((range) => {
    const lowerRaw = values[`${range.id}Lower`];
    const upperRaw = values[`${range.id}Upper`];
    const lower = typeof lowerRaw === "string" ? readNumber(lowerRaw) : null;
    const upper = typeof upperRaw === "string" ? readNumber(upperRaw) : null;
    const x1 = lower === null ? null : nanoSizePosition(lower);
    const x2 = upper === null ? null : nanoSizePosition(upper);
    return {
      id: range.id,
      name: range.name,
      lowerRaw: typeof lowerRaw === "string" ? lowerRaw : "",
      upperRaw: typeof upperRaw === "string" ? upperRaw : "",
      x1,
      x2,
      plotted: x1 !== null && x2 !== null && lower! <= upper!,
    };
  });
}
