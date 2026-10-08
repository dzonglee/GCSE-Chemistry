// Reviewed equivalences in the original short sets. Sample labels and option
// order do not change a question's demand. Different numerical givens remain
// separate even when their answers happen to agree.
const forms = (prefix: string, slot: number) =>
  [0, 1, 2, 3].map((form) => `${prefix}-${form}-${slot}`);
export const assessmentExposureGroups: readonly (readonly string[])[] = [
  [...forms("paper", 1), "tm-v1-w-charge"],
  [...forms("paper", 2), "mp-v1-p-bonds"],
  [...forms("paper", 5), "an-v1-r-salt"],
  forms("paper", 6),
  forms("paper", 8),
  [...forms("paper", 10), "ct-v1-check-a-explain"],
  [...forms("paper", 13), "pollution-v1-p-acid"],
  [...forms("paper", 14), "water-v1-p-clear"],
  [...forms("higher-paper", 1), "ge-v1-ca-conduction"],
  [...forms("higher-paper", 5), "he-v1-p-aluminium"],
  [...forms("higher-paper", 8), "bond-v1-d-a-explain"],
  [...forms("higher-paper", 9), "es-v1-p-temperature-written"],
  [...forms("higher-paper", 10), "es-v1-p-pressure-written"],
  [...forms("higher-paper", 13), "diagnostic-1-16", "climate-v1-p-weather"],
  [...forms("higher-paper", 14), "extracting-metals-5"],
  // These numerical sources match exactly, rather than merely sharing an answer.
  ["diagnostic-1-0", "higher-paper-0-0", "iso-v1-p-sulfide"],
  ["diagnostic-1-4", "higher-paper-1-2"],
  ["diagnostic-0-19", "materials-v1-cA-zinc"],
];
const equivalentIds = new Map<string, readonly string[]>();
for (const group of assessmentExposureGroups) {
  for (const id of group) {
    if (equivalentIds.has(id))
      throw Error(`Overlapping reviewed exposure group: ${id}`);
    equivalentIds.set(id, group);
  }
}
// Direct, explicitly reviewed links only. No inferred transitive closure, no
// mutation of lesson questions and no migration of the learner's saved history.
export function assessmentExposureIds(id: string): readonly string[] {
  return equivalentIds.get(id) ?? [];
}
