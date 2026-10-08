export const acidMetalReference = [
  { symbol: "Mg", name: "Magnesium", chloride: "MgCl2", sulfate: "MgSO4" },
  { symbol: "Zn", name: "Zinc", chloride: "ZnCl2", sulfate: "ZnSO4" },
  { symbol: "Fe", name: "Iron", chloride: "FeCl2", sulfate: "FeSO4" },
] as const;
export function acidMetalEquation(index: number, acid: "HCl" | "H2SO4") {
  const metal = acidMetalReference[index];
  return acid === "HCl"
    ? `${metal.symbol}(s) + 2HCl(aq) → ${metal.chloride}(aq) + H2(g)`
    : `${metal.symbol}(s) + H2SO4(aq) → ${metal.sulfate}(aq) + H2(g)`;
}
