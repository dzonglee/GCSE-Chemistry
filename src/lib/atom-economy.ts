/** Equation-weighted masses are relative contributions, not measured grams. */
export type EquationTerm = {
  formula: string;
  coefficient: number;
  relativeMass: number;
};
export function atomEconomy(
  reactants: readonly EquationTerm[],
  products: readonly EquationTerm[],
  desired: readonly string[],
) {
  if (
    !reactants.length ||
    !products.length ||
    !desired.length ||
    new Set(desired).size !== desired.length
  )
    throw Error("Nonempty equation and distinct desired products required");
  for (const term of [...reactants, ...products])
    if (
      !term.formula ||
      !Number.isSafeInteger(term.coefficient) ||
      term.coefficient <= 0 ||
      !Number.isFinite(term.relativeMass) ||
      term.relativeMass <= 0
    )
      throw Error("Positive whole coefficients and relative masses required");
  if (
    new Set(products.map((t) => t.formula)).size !== products.length ||
    desired.some((f) => !products.some((t) => t.formula === f))
  )
    throw Error("Select identified equation products");
  const total = reactants.reduce(
      (s, t) => s + t.coefficient * t.relativeMass,
      0,
    ),
    productTotal = products.reduce(
      (s, t) => s + t.coefficient * t.relativeMass,
      0,
    );
  if (Math.abs(total - productTotal) > 1e-10 * Math.max(total, productTotal))
    throw Error("Equation relative mass totals must balance");
  const useful = products
    .filter((t) => desired.includes(t.formula))
    .reduce((s, t) => s + t.coefficient * t.relativeMass, 0);
  return {
    total,
    useful,
    other: total - useful,
    percentage: (useful / total) * 100,
  };
}
export const economyEquations = {
  copper: {
    equation: "2CuO + C → 2Cu + CO2",
    reactants: [
      { formula: "CuO", coefficient: 2, relativeMass: 79.5 },
      { formula: "C", coefficient: 1, relativeMass: 12 },
    ],
    products: [
      { formula: "Cu", coefficient: 2, relativeMass: 63.5 },
      { formula: "CO2", coefficient: 1, relativeMass: 44 },
    ],
  },
  carbonate: {
    equation: "CaCO3 → CaO + CO2",
    reactants: [{ formula: "CaCO3", coefficient: 1, relativeMass: 100 }],
    products: [
      { formula: "CaO", coefficient: 1, relativeMass: 56 },
      { formula: "CO2", coefficient: 1, relativeMass: 44 },
    ],
  },
  addition: {
    equation: "C2H4 + H2 → C2H6",
    reactants: [
      { formula: "C2H4", coefficient: 1, relativeMass: 28 },
      { formula: "H2", coefficient: 1, relativeMass: 2 },
    ],
    products: [{ formula: "C2H6", coefficient: 1, relativeMass: 30 }],
  },
  methane: {
    equation: "CH4 + 2O2 → CO2 + 2H2O",
    reactants: [
      { formula: "CH4", coefficient: 1, relativeMass: 16 },
      { formula: "O2", coefficient: 2, relativeMass: 32 },
    ],
    products: [
      { formula: "CO2", coefficient: 1, relativeMass: 44 },
      { formula: "H2O", coefficient: 2, relativeMass: 18 },
    ],
  },
} as const;
export type EconomyMode = "weighted" | "desired" | "contrast" | "partition";
export const economyChoices = {
  weighted: {
    numerator: ["unset", "63.5", "127", "171"],
    denominator: ["unset", "91.5", "171", "159", "215"],
    percentage: ["unset", "37.1", "69.4", "74.3", "100"],
  },
  desired: {
    desired: ["CaO", "CO2", "both"],
    scale: [1, 2, 5],
    numerator: [
      "unset",
      "44",
      "56",
      "100",
      "88",
      "112",
      "200",
      "220",
      "280",
      "500",
    ],
    denominator: ["unset", "100", "200", "500", "56", "44"],
    percentage: ["unset", "44", "56", "100", "40", "60"],
  },
  contrast: {
    actual: [0, 18, 30],
    economy: ["unset", "0", "60", "100"],
    yield: ["unset", "0", "60", "100"],
  },
  partition: {
    desired: ["CO2", "H2O"],
    useful: ["unset", "18", "36", "44", "80"],
    other: ["unset", "18", "36", "44", "80"],
    denominator: ["unset", "48", "80", "100"],
    percentage: ["unset", "22.5", "33.3", "45", "55", "100"],
    fate: ["unset", "byproduct", "destroyed", "lostmass"],
  },
} as const;
export function initialEconomyBoard(
  mode: EconomyMode,
): Record<string, string | number> {
  if (mode === "weighted")
    return { numerator: "unset", denominator: "unset", percentage: "unset" };
  if (mode === "desired")
    return {
      desired: "CaO",
      scale: 1,
      numerator: "unset",
      denominator: "unset",
      percentage: "unset",
    };
  if (mode === "contrast")
    return { actual: 18, economy: "unset", yield: "unset" };
  return {
    desired: "CO2",
    useful: "unset",
    other: "unset",
    denominator: "unset",
    percentage: "unset",
    fate: "unset",
  };
}
export function validEconomyBoard(
  mode: EconomyMode,
  board: Record<string, unknown>,
) {
  const initial = initialEconomyBoard(mode),
    options = economyChoices[mode] as Record<
      string,
      readonly (string | number)[]
    >;
  return (
    Object.keys(board).length === Object.keys(initial).length &&
    Object.keys(initial).every((k) =>
      options[k].includes(board[k] as string | number),
    )
  );
}
export function economyPrediction(
  mode: EconomyMode,
  b: Record<string, string | number>,
) {
  const chosen = (k: string, n: number) =>
    b[k] !== "unset" && Math.abs(Number(b[k]) - n) <= 1e-10;
  if (mode === "weighted") {
    const e = economyEquations.copper,
      r = atomEconomy(e.reactants, e.products, ["Cu"]);
    return {
      correct:
        chosen("numerator", 127) &&
        chosen("denominator", 171) &&
        chosen("percentage", 74.3),
      feedback:
        "Desired copper: 2 × 63.5 = 127. All reactants: 2 × 79.5 + 12 = 171. Atom economy = 127/171 × 100 = 74.3% to one decimal place. Multiply both sides by their equation coefficients; counting copper atoms or omitting a CuO does not give the mass fraction.",
      ...r,
    };
  }
  if (mode === "desired") {
    const e = economyEquations.carbonate,
      scale = Number(b.scale),
      products = e.products.map((t) => ({
        ...t,
        coefficient: t.coefficient * scale,
      })),
      reactants = e.reactants.map((t) => ({
        ...t,
        coefficient: t.coefficient * scale,
      })),
      desired = b.desired === "both" ? ["CaO", "CO2"] : [String(b.desired)],
      r = atomEconomy(reactants, products, desired);
    return {
      correct:
        chosen("numerator", r.useful) &&
        chosen("denominator", r.total) &&
        chosen("percentage", r.percentage),
      feedback: `Desired contribution ${r.useful}; all reactants ${r.total}. Atom economy = ${Number(r.percentage.toPrecision(12))}%. Scaling every coefficient multiplies both contributions equally, so the percentage is unchanged. Selecting a different desired product changes the useful fraction. Selecting all products is not the atom economy of one specified desired product.`,
      ...r,
    };
  }
  if (mode === "contrast") {
    const e = economyEquations.addition,
      r = atomEconomy(e.reactants, e.products, ["C2H6"]),
      percent = (Number(b.actual) / 30) * 100;
    return {
      correct: chosen("economy", 100) && chosen("yield", percent),
      feedback: `The equation has one product: all relative reactant mass 28 + 2 = 30 contributes to ethane, so its atom economy is 100%. Actual collected ${b.actual} g / supplied theoretical 30 g gives ${percent}% yield. Changing collection changes yield, not the balanced equation's atom economy. Neither 100% economy nor conservation guarantees 100% collected yield.`,
      ...r,
    };
  }
  const e = economyEquations.methane,
    r = atomEconomy(e.reactants, e.products, [String(b.desired)]);
  return {
    correct:
      chosen("useful", r.useful) &&
      chosen("other", r.other) &&
      chosen("denominator", 80) &&
      chosen("percentage", r.percentage) &&
      b.fate === "byproduct",
    feedback: `Desired ${b.desired} contributes ${r.useful} of the total relative mass 80: ${Number(r.percentage.toPrecision(12))}% atom economy. The other product contributes ${r.other}. All C, H and O atoms remain in the products; they are not destroyed. Economy uses mass contributions, not the fraction of balls or molecules. This supplied reaction illustrates allocation, not a recommended industrial pathway.`,
    ...r,
  };
}
