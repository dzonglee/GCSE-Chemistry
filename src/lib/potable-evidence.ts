import type { WaterGiven, WaterMode } from "./water";

/** Read only the fixed givens, never the learner's proposal or expected answer. */
export function potableEvidence(data: WaterGiven, mode: WaterMode): string {
  if (data.summary) return data.summary;
  if (data.balance) {
    const { empty, cooled, volume } = data.balance;
    return `Sample ${volume} cm³; empty dish ${empty.toFixed(2)} g; dish + dry cooled stable nonvolatile residue ${cooled.toFixed(2)} g.`;
  }
  if (data.membrane) {
    const { feed, product, salt } = data.membrane;
    return `Ideal feed ${feed} litres with ${salt} g salt; product ${product} litres. No volume loss; complete salt rejection.`;
  }
  if (data.energy) {
    const { a, b, volume } = data.energy;
    return `Matched exercise totals: A ${a} kWh, B ${b} kWh; ${volume} m³ treated by each route, within the same boundary.`;
  }
  if (data.repeat) {
    const { masses, volume } = data.repeat;
    return `Dry cooled residue after dish subtraction: ${masses.map((m) => m.toFixed(2)).join(", ")} g; each sample ${volume} cm³.`;
  }
  if (mode === "treatment") return data.rows.map((r) => r.text).join(" ");
  return data.note;
}
