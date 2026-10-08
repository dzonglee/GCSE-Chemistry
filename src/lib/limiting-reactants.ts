/** Theoretical complete conversion. Fractional mol are never whole-event counts. */
export function limitingInventory(
  amounts: readonly number[],
  coefficients: readonly number[],
  productCoefficients: readonly number[],
) {
  if (
    amounts.length < 2 ||
    amounts.length !== coefficients.length ||
    amounts.some((v) => !Number.isFinite(v) || v < 0) ||
    coefficients.some((v) => !Number.isSafeInteger(v) || v <= 0) ||
    productCoefficients.length === 0 ||
    productCoefficients.some((v) => !Number.isSafeInteger(v) || v <= 0)
  )
    throw Error(
      "Matching nonnegative amounts and positive whole coefficients required",
    );
  const capacities = amounts.map((v, i) => v / coefficients[i]);
  const extent = Math.min(...capacities);
  const tolerance = Math.max(...capacities) * 1e-12;
  const limiting = capacities.flatMap((v, i) =>
    Math.abs(v - extent) <= tolerance ? [i] : [],
  );
  const consumed = coefficients.map((v) => v * extent);
  const remaining = amounts.map((v, i) => Math.max(0, v - consumed[i]));
  return {
    capacities,
    extent,
    limiting,
    consumed,
    remaining,
    products: productCoefficients.map((v) => v * extent),
  };
}
export function limitingFromMasses(
  masses: readonly number[],
  molarMasses: readonly number[],
  coefficients: readonly number[],
  products: readonly number[],
) {
  if (
    masses.length !== molarMasses.length ||
    molarMasses.some((v) => !Number.isFinite(v) || v <= 0)
  )
    throw Error("Matching positive molar masses required");
  const amounts = masses.map((v, i) => v / molarMasses[i]);
  return { amounts, ...limitingInventory(amounts, coefficients, products) };
}
export const limitingMoleSamples = {
  methaneExcess: { label: "3 mol CH₄; 4 mol O₂", amounts: [3, 4] },
  oxygenExcess: { label: "2 mol CH₄; 5 mol O₂", amounts: [2, 5] },
  exact: { label: "2 mol CH₄; 4 mol O₂", amounts: [2, 4] },
} as const;
export const limitingMassSamples = {
  acidLimits: { label: "12 g Mg; 14.6 g HCl", masses: [12, 14.6] },
  metalLimits: { label: "2.4 g Mg; 14.6 g HCl", masses: [2.4, 14.6] },
  exact: { label: "4.8 g Mg; 14.6 g HCl", masses: [4.8, 14.6] },
} as const;
// Carbonate + 2HCl → 2NaCl + H₂O + CO₂. Fixed .02 mol HCl.
export function carbonateCapacity(carbonate: number) {
  return limitingInventory([carbonate, 0.02], [1, 2], [1]);
}
export type LimitingMode = "capacities" | "masses" | "change" | "plateau";
export const limitingChoices = {
  capacities: {
    sample: ["methaneExcess", "oxygenExcess", "exact"],
    methaneCapacity: ["unset", "1", "2", "3", "4", "5"],
    oxygenCapacity: ["unset", "1", "2", "2.5", "4", "5"],
    limiting: ["unset", "methane", "oxygen", "both"],
    carbonDioxide: ["unset", "1", "2", "3", "4"],
    methaneLeft: ["unset", "0", "1", "2", "3"],
    oxygenLeft: ["unset", "0", "1", "2", "4"],
  },
  masses: {
    sample: ["acidLimits", "metalLimits", "exact"],
    mgAmount: ["unset", "0.1", "0.2", "0.5", "12"],
    acidAmount: ["unset", "0.2", "0.4", "14.6"],
    limiting: ["unset", "Mg", "HCl", "both"],
    hydrogenMass: ["unset", "0.2", "0.4", "0.8", "1"],
    mgLeft: ["unset", "0", "2.4", "7.2", "12"],
  },
  change: {
    added: ["none", "methane", "oxygen"],
    product: ["unset", "2", "3", "4", "5", "6"],
    limiting: ["unset", "methane", "oxygen", "both"],
    methaneLeft: ["unset", "0", "1", "2", "3"],
    oxygenLeft: ["unset", "0", "1", "2", "4"],
  },
  plateau: {
    carbonate: ["0.005", "0.01", "0.015"],
    product: ["unset", "0.005", "0.01", "0.015", "0.02"],
    left: ["unset", "0", "0.005", "0.01"],
    limiting: ["unset", "carbonate", "acid", "both"],
  },
} as const;
export function initialLimitingBoard(
  mode: LimitingMode,
): Record<string, string | number> {
  switch (mode) {
    case "capacities":
      return {
        sample: "methaneExcess",
        methaneCapacity: "unset",
        oxygenCapacity: "unset",
        limiting: "unset",
        carbonDioxide: "unset",
        methaneLeft: "unset",
        oxygenLeft: "unset",
      };
    case "masses":
      return {
        sample: "acidLimits",
        mgAmount: "unset",
        acidAmount: "unset",
        limiting: "unset",
        hydrogenMass: "unset",
        mgLeft: "unset",
      };
    case "change":
      return {
        added: "none",
        product: "unset",
        limiting: "unset",
        methaneLeft: "unset",
        oxygenLeft: "unset",
      };
    case "plateau":
      return {
        carbonate: "0.005",
        product: "unset",
        left: "unset",
        limiting: "unset",
      };
  }
}
export function validLimitingBoard(mode: LimitingMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    choices = limitingChoices[mode];
  return (
    Object.keys(b).length === Object.keys(choices).length &&
    Object.entries(choices).every(([k, v]) =>
      (v as readonly unknown[]).includes(b[k]),
    )
  );
}
const same = (a: string | number, b: number) =>
  a !== "unset" && Math.abs(Number(a) - b) <= Math.max(1, Math.abs(b)) * 1e-10;
const limitLabel = (
  r: ReturnType<typeof limitingInventory>,
  names: readonly string[],
) => (r.limiting.length === 2 ? "both" : names[r.limiting[0]]);
const displayQuantity = (value: number) => Number(value.toPrecision(12));
export function limitingPrediction(
  mode: LimitingMode,
  b: Record<string, string | number>,
) {
  if (mode === "capacities") {
    const d = limitingMoleSamples[b.sample as keyof typeof limitingMoleSamples],
      r = limitingInventory(d.amounts, [1, 2], [1, 2]);
    return {
      correct:
        same(b.methaneCapacity, r.capacities[0]) &&
        same(b.oxygenCapacity, r.capacities[1]) &&
        b.limiting === limitLabel(r, ["methane", "oxygen"]) &&
        same(b.carbonDioxide, r.products[0]) &&
        same(b.methaneLeft, r.remaining[0]) &&
        same(b.oxygenLeft, r.remaining[1]),
      feedback: `For CH₄ + 2O₂ → CO₂ + 2H₂O, compare CH₄ ${d.amounts[0]}/1=${displayQuantity(r.capacities[0])} and O₂ ${d.amounts[1]}/2=${displayQuantity(r.capacities[1])} mol of equation extent. The smaller capacity sets the maximum: ${displayQuantity(r.products[0])} mol CO₂ and ${displayQuantity(r.products[1])} mol H₂O. Remaining CH₄=${displayQuantity(r.remaining[0])} mol; O₂=${displayQuantity(r.remaining[1])} mol. ${r.limiting.length === 2 ? "Equal capacities: both are consumed, no excess." : "Compare normalized capacities, not the raw mol numbers."}`,
    };
  }
  if (mode === "masses") {
    const d = limitingMassSamples[b.sample as keyof typeof limitingMassSamples],
      r = limitingFromMasses(d.masses, [24, 36.5], [1, 2], [1, 1]);
    return {
      correct:
        same(b.mgAmount, r.amounts[0]) &&
        same(b.acidAmount, r.amounts[1]) &&
        b.limiting === limitLabel(r, ["Mg", "HCl"]) &&
        same(b.hydrogenMass, r.products[1] * 2) &&
        same(b.mgLeft, r.remaining[0] * 24),
      feedback: `Mg + 2HCl → MgCl₂ + H₂. Mg ${d.masses[0]}/24=${displayQuantity(r.amounts[0])} mol; HCl ${d.masses[1]}/36.5=${displayQuantity(r.amounts[1])} mol. Compare Mg capacity ${displayQuantity(r.capacities[0])} with HCl capacity ${displayQuantity(r.capacities[1])}. Maximum H₂=${Number((r.products[1] * 2).toPrecision(12))} g; Mg remaining=${Number((r.remaining[0] * 24).toPrecision(12))} g. The smaller gram mass alone cannot identify the limiting reactant. Product and unused reactants together retain the initial total mass.`,
    };
  }
  if (mode === "change") {
    const amounts =
        b.added === "methane" ? [5, 4] : b.added === "oxygen" ? [3, 8] : [3, 4],
      r = limitingInventory(amounts, [1, 2], [1, 2]);
    return {
      correct:
        same(b.product, r.products[0]) &&
        b.limiting === limitLabel(r, ["methane", "oxygen"]) &&
        same(b.methaneLeft, r.remaining[0]) &&
        same(b.oxygenLeft, r.remaining[1]),
      feedback: `Supplies CH₄=${amounts[0]} mol, O₂=${amounts[1]} mol; capacities ${displayQuantity(r.capacities[0])} and ${displayQuantity(r.capacities[1])}. Maximum CO₂=${displayQuantity(r.products[0])} mol; remaining CH₄=${displayQuantity(r.remaining[0])}, O₂=${displayQuantity(r.remaining[1])} mol. Adding methane alone to the initial oxygen-limited mixture leaves the maximum at 2 mol CO₂. Adding enough oxygen instead increases the maximum to 3 mol and switches the limiting reactant to methane. These are fresh theoretical starting inventories, not an animation of a completed experiment.`,
    };
  }
  const carbonate = Number(b.carbonate),
    r = carbonateCapacity(carbonate);
  return {
    correct:
      same(b.product, r.products[0]) &&
      same(b.left, r.remaining[0]) &&
      b.limiting === limitLabel(r, ["carbonate", "acid"]),
    feedback: `Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂. Fixed 0.02 mol HCl can supply only 0.01 mol CO₂. With ${carbonate} mol carbonate, maximum CO₂=${displayQuantity(r.products[0])} mol; carbonate remaining=${Number(r.remaining[0].toPrecision(12))} mol. Beyond 0.01 mol carbonate, extra carbonate cannot increase this maximum because all acid is consumed. This graph shows theoretical product amount, not temperature or reaction rate.`,
  };
}
