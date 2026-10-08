export function weightedIsotopeMean(
  masses: readonly number[],
  weights: readonly number[],
) {
  if (
    masses.length !== weights.length ||
    !masses.length ||
    masses.some((m) => !Number.isFinite(m) || m <= 0) ||
    weights.some((w) => !Number.isFinite(w) || w < 0)
  )
    throw new Error("Invalid isotope data");
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new Error("No atoms supplied");
  return masses.reduce((sum, mass, i) => sum + mass * weights[i], 0) / total;
}
