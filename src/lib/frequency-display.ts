export type FrequencyDisplayData = {
  kind: "histogram" | "bar";
  ticks: number[];
  unit: string;
};

export function classFrequencies(
  values: readonly number[],
  edges: readonly number[],
) {
  if (
    edges.length < 2 ||
    edges.some((n, i) => !Number.isFinite(n) || (i > 0 && n <= edges[i - 1]))
  )
    throw new Error("Ordered class boundaries required");
  if (
    values.some(
      (n) => !Number.isFinite(n) || n < edges[0] || n >= edges.at(-1)!,
    )
  )
    throw new Error("Every observation must belong to a class");
  return edges
    .slice(0, -1)
    .map((low, i) => values.filter((n) => n >= low && n < edges[i + 1]).length);
}
