export function atomCounts(
  protons: number,
  neutrons: number,
  electrons: number,
) {
  return {
    atomicNumber: protons,
    massNumber: protons + neutrons,
    charge: protons - electrons,
    shells: [
      Math.min(electrons, 2),
      Math.min(Math.max(electrons - 2, 0), 8),
      Math.min(Math.max(electrons - 10, 0), 8),
      Math.max(electrons - 18, 0),
    ].filter((n) => n > 0),
  };
}
export function waterBalance(hydrogen: number, oxygen: number, water: number) {
  return {
    leftH: 2 * hydrogen,
    rightH: 2 * water,
    leftO: 2 * oxygen,
    rightO: water,
    balanced: 2 * hydrogen === 2 * water && 2 * oxygen === water,
    minimal: hydrogen === 2 && oxygen === 1 && water === 2,
  };
}
export function profile(
  reactants: number,
  products: number,
  barrier: number,
  catalyst: boolean,
) {
  const peak = Math.max(reactants, products) + barrier * (catalyst ? 0.55 : 1);
  return { peak, activation: peak - reactants, change: products - reactants };
}
export function organicHydrogen(carbons: number, family: string) {
  return family === "alkane" || family === "alcohol"
    ? 2 * carbons + 2
    : 2 * carbons;
}
export function shift(
  pressure: string,
  temperature: string,
  reactant: string,
): "products" | "reactants" | "same" | "multiple" {
  if (
    [pressure !== "same", temperature !== "same", reactant !== "same"].filter(
      Boolean,
    ).length > 1
  )
    return "multiple";
  if (pressure === "high" || temperature === "low" || reactant === "add")
    return "products";
  if (pressure === "low" || temperature === "high") return "reactants";
  return "same";
}
export function rf(spot: number, front: number) {
  return front > 0 && spot >= 0 && spot <= front ? spot / front : null;
}
