import type { PlotRecord } from "./rates-practical";
import type { PracticalBoard } from "./rates-practical-board";
/** A labelled interpolation preview, not a unique statistical/examiner fit. Raw points remain untouched. */
export function practicalFitPoints(
  r: PlotRecord,
  b: PracticalBoard,
): { x: number; y: number }[] | null {
  if (!b.fit || b.fitView !== "yes") return null;
  const points = r.times.map((_, i) => ({
    x: Number(b["x" + i]),
    y: Number(b["y" + i]),
    placed: b["placed" + i] === "yes",
    i,
  }));
  if (
    points.some(
      (p) => !p.placed || !Number.isFinite(p.x) || !Number.isFinite(p.y),
    )
  )
    return null;
  const selected = points
    .filter((p) => !(b.fit === "investigateSmooth" && p.i === r.anomalous))
    .sort((a, c) => a.x - c.x);
  if (selected.some((p, i) => i > 0 && p.x <= selected[i - 1].x)) return null;
  if (b.fit === "joinEveryPoint") return selected.map(({ x, y }) => ({ x, y }));
  if (b.fit === "straightRising")
    return [selected[0], selected.at(-1)!].map(({ x, y }) => ({ x, y }));
  const slope = selected
    .slice(1)
    .map((p, i) => (p.y - selected[i].y) / (p.x - selected[i].x));
  const tangents = selected.map((_, i) =>
    i === 0
      ? slope[0]
      : i === selected.length - 1
        ? slope.at(-1)!
        : slope[i - 1] * slope[i] <= 0
          ? 0
          : 2 / (1 / slope[i - 1] + 1 / slope[i]),
  );
  // Segmentwise limiter preserves each segment's direction and prevents overshoot.
  slope.forEach((s, i) => {
    if (s === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      return;
    }
    const a = tangents[i] / s,
      c = tangents[i + 1] / s,
      len = Math.hypot(a, c);
    if (len > 3) {
      tangents[i] = ((3 * a) / len) * s;
      tangents[i + 1] = ((3 * c) / len) * s;
    }
  });
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < selected.length - 1; i++) {
    const a = selected[i],
      c = selected[i + 1],
      h = c.x - a.x;
    for (let j = 0; j <= 20; j++) {
      if (i > 0 && j === 0) continue;
      const t = j / 20;
      out.push({
        x: a.x + t * h,
        y:
          (2 * t ** 3 - 3 * t ** 2 + 1) * a.y +
          (t ** 3 - 2 * t ** 2 + t) * h * tangents[i] +
          (-2 * t ** 3 + 3 * t ** 2) * c.y +
          (t ** 3 - t ** 2) * h * tangents[i + 1],
      });
    }
  }
  return out;
}
