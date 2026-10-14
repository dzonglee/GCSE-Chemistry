export type MeasurementPoint = { x: number; y: number };

/** Interpolate entered heights without overshooting a plateau or local extremum.
 * Coordinates stay exactly as entered; this constructs the curve between them.
 */
export function measurementCurveSegments(points: MeasurementPoint[]) {
  if (points.length < 2) return [];
  const h = points.slice(1).map((p, i) => p.x - points[i].x);
  if (
    h.some((value) => value <= 0) ||
    points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))
  )
    throw new Error(
      "Measurement curve needs finite points in increasing x order",
    );
  const delta = h.map((width, i) => (points[i + 1].y - points[i].y) / width);
  const slopes = points.map((_, i) => {
    if (i === 0) return delta[0];
    if (i === points.length - 1) return delta.at(-1)!;
    const before = delta[i - 1],
      after = delta[i];
    if (before * after <= 0) return 0;
    const firstWeight = 2 * h[i] + h[i - 1],
      secondWeight = h[i] + 2 * h[i - 1];
    return (
      (firstWeight + secondWeight) /
      (firstWeight / before + secondWeight / after)
    );
  });
  // Limit both tangents together; flat neighboring anchors have zero tangents.
  for (let i = 0; i < delta.length; i++) {
    if (delta[i] === 0) {
      slopes[i] = 0;
      slopes[i + 1] = 0;
      continue;
    }
    const alpha = slopes[i] / delta[i],
      beta = slopes[i + 1] / delta[i];
    const length = Math.hypot(alpha, beta);
    if (length > 3) {
      const scale = 3 / length;
      slopes[i] = scale * alpha * delta[i];
      slopes[i + 1] = scale * beta * delta[i];
    }
  }
  return h.map((width, i) => ({
    from: points[i],
    first: {
      x: points[i].x + width / 3,
      y: points[i].y + (slopes[i] * width) / 3,
    },
    second: {
      x: points[i + 1].x - width / 3,
      y: points[i + 1].y - (slopes[i + 1] * width) / 3,
    },
    to: points[i + 1],
  }));
}
