import { reactionMass } from "./reacting-masses";
import {
  percentYield,
  actualFromYield,
  theoreticalFromYield,
} from "./percentage-yield";
import { limitingFromMasses } from "./limiting-reactants";
export function yieldFromReactant(
  reactantGrams: number,
  reactantM: number,
  reactantCoefficient: number,
  productM: number,
  productCoefficient: number,
  actualGrams: number,
) {
  const theory = reactionMass(
    reactantGrams,
    reactantM,
    reactantCoefficient,
    productM,
    productCoefficient,
  );
  return { ...theory, ...percentYield(actualGrams, theory.mass) };
}
export function collectedFromReactant(
  reactantGrams: number,
  reactantM: number,
  reactantCoefficient: number,
  productM: number,
  productCoefficient: number,
  percentage: number,
) {
  const theory = reactionMass(
    reactantGrams,
    reactantM,
    reactantCoefficient,
    productM,
    productCoefficient,
  );
  return { ...theory, actual: actualFromYield(theory.mass, percentage) };
}
export function reactantForCollected(
  actualGrams: number,
  percentage: number,
  reactantM: number,
  reactantCoefficient: number,
  productM: number,
  productCoefficient: number,
) {
  const theoreticalProduct = theoreticalFromYield(actualGrams, percentage),
    inverse = reactionMass(
      theoreticalProduct,
      productM,
      productCoefficient,
      reactantM,
      reactantCoefficient,
    );
  return {
    theoreticalProduct,
    productAmount: inverse.givenAmount,
    reactantAmount: inverse.requestedAmount,
    reactantGrams: inverse.mass,
  };
}
export function yieldFromLimitedReactants(
  masses: readonly number[],
  molarMasses: readonly number[],
  coefficients: readonly number[],
  productM: number,
  productCoefficient: number,
  actualGrams: number,
) {
  if (!Number.isFinite(productM) || productM <= 0)
    throw Error("Positive product molar mass required");
  const inventory = limitingFromMasses(masses, molarMasses, coefficients, [
      productCoefficient,
    ]),
    theoreticalMass = inventory.products[0] * productM;
  return {
    ...inventory,
    theoreticalMass,
    ...percentYield(actualGrams, theoreticalMass),
  };
}
export const maximumSamples = {
  standard: { label: "14 g N2; 4 g H2", grams: 14, hydrogen: 4 },
  double: { label: "28 g N2; 8 g H2", grams: 28, hydrogen: 8 },
  kilograms: { label: "0.028 kg N2; 8 g H2", grams: 28, hydrogen: 8 },
} as const;
export const productYieldSamples = {
  standard: { label: "16 g Fe2O3; 9.8 g Fe collected", grams: 16, actual: 9.8 },
  half: { label: "8 g Fe2O3; 4.2 g Fe collected", grams: 8, actual: 4.2 },
  larger: {
    label: "24 g Fe2O3; 15.12 g Fe collected",
    grams: 24,
    actual: 15.12,
  },
  suspect: {
    label: "16 g Fe2O3; 13.44 g apparent sample",
    grams: 16,
    actual: 13.44,
  },
} as const;
export const collectedSamples = {
  standard: { label: "25 g CaCO3; 80% yield", grams: 25, percentage: 80 },
  double: { label: "50 g CaCO3; 75% yield", grams: 50, percentage: 75 },
  kilograms: { label: "0.025 kg CaCO3; 80% yield", grams: 25, percentage: 80 },
  larger: { label: "75 g CaCO3; 60% yield", grams: 75, percentage: 60 },
} as const;
export const requiredSamples = {
  standard: {
    label: "19 g dry MgCl2 collected; 80% yield",
    actual: 19,
    percentage: 80,
  },
  double: {
    label: "38 g dry MgCl2 collected; 80% yield",
    actual: 38,
    percentage: 80,
  },
  lower: {
    label: "19 g dry MgCl2 collected; 50% yield",
    actual: 19,
    percentage: 50,
  },
} as const;
export const limitedYieldSamples = {
  aluminium: {
    label: "270 g Al; 1000 g Fe2O3; 420 g Fe collected",
    masses: [270, 1000],
    actual: 420,
  },
  oxide: {
    label: "540 g Al; 800 g Fe2O3; 448 g Fe collected",
    masses: [540, 800],
    actual: 448,
  },
  exact: {
    label: "270 g Al; 800 g Fe2O3; 392 g Fe collected",
    masses: [270, 800],
    actual: 392,
  },
} as const;
export type TheoryMode =
  "maximum" | "percentage" | "collected" | "required" | "limited";
export const theoryChoices = {
  maximum: {
    sample: ["standard", "double", "kilograms"],
    grams: ["unset", "14", "28", "0.028"],
    reactantAmount: ["unset", "0.5", "1", "14", "28"],
    productAmount: ["unset", "0.5", "1", "2"],
    theoretical: ["unset", "14", "17", "28", "34", "56"],
  },
  percentage: {
    sample: ["standard", "half", "larger", "suspect"],
    reactantAmount: ["unset", "0.05", "0.1", "0.15", "0.2", "16"],
    productAmount: ["unset", "0.05", "0.1", "0.2", "0.3", "0.6"],
    theoretical: ["unset", "5.6", "11.2", "16.8", "8", "16", "24"],
    percentage: ["unset", "75", "87.5", "90", "120", "61.25", "70", "63"],
  },
  collected: {
    sample: ["standard", "double", "kilograms", "larger"],
    reactantAmount: ["unset", "0.25", "0.5", "0.75", "25"],
    theoretical: ["unset", "14", "28", "42", "25", "50", "75"],
    factor: ["unset", "0.6", "0.75", "0.8", "60", "75", "80"],
    actual: ["unset", "11.2", "21", "25.2", "14", "28", "42"],
  },
  required: {
    sample: ["standard", "double", "lower"],
    factor: ["unset", "0.5", "0.8", "50", "80"],
    theoretical: ["unset", "15.2", "19", "23.75", "38", "47.5"],
    productAmount: ["unset", "0.2", "0.25", "0.4", "0.5"],
    reactantMass: ["unset", "4.8", "6", "9.6", "12", "19"],
  },
  limited: {
    sample: ["aluminium", "oxide", "exact"],
    fromAl: ["unset", "5", "10", "12.5", "20", "270", "540"],
    fromOxide: ["unset", "5", "6.25", "10", "12.5", "20", "800", "1000"],
    limiting: ["unset", "Al", "Fe2O3", "both"],
    theoretical: ["unset", "280", "560", "700", "1120", "270", "800"],
    percentage: ["unset", "70", "75", "80", "100", "50"],
  },
} as const;
export function initialTheoryBoard(
  mode: TheoryMode,
): Record<string, string | number> {
  const initial = Object.fromEntries(
    Object.keys(theoryChoices[mode]).map((k) => [
      k,
      k === "sample"
        ? mode === "limited"
          ? "aluminium"
          : "standard"
        : "unset",
    ]),
  );
  return initial;
}
export function validTheoryBoard(mode: TheoryMode, b: Record<string, unknown>) {
  const opts = theoryChoices[mode] as Record<string, readonly string[]>;
  return (
    Object.keys(b).length === Object.keys(opts).length &&
    Object.keys(opts).every(
      (k) => typeof b[k] === "string" && opts[k].includes(b[k] as string),
    )
  );
}
const display = (v: number) => Number(v.toPrecision(12));
export function theoryPrediction(
  mode: TheoryMode,
  b: Record<string, string | number>,
) {
  const chosen = (key: string, expected: number) =>
    b[key] !== "unset" && Math.abs(Number(b[key]) - expected) <= 1e-10;
  if (mode === "maximum") {
    const d = maximumSamples[b.sample as keyof typeof maximumSamples],
      r = reactionMass(d.grams, 28, 1, 17, 2),
      hydrogenConsumed = r.givenAmount * 3 * 2,
      hydrogenRemaining = d.hydrogen - hydrogenConsumed;
    return {
      correct:
        chosen("grams", d.grams) &&
        chosen("reactantAmount", r.givenAmount) &&
        chosen("productAmount", r.requestedAmount) &&
        chosen("theoretical", r.mass),
      theoretical: r.mass,
      reactantGrams: d.grams,
      feedback: `${d.grams} g N2 ÷ 28 g/mol = ${display(r.givenAmount)} mol N2. Multiply by 2/1 to obtain ${display(r.requestedAmount)} mol NH3, then by 17 g/mol: theoretical ${display(r.mass)} g. Hydrogen is sufficient: ${display(hydrogenConsumed)} g reacts and ${display(hydrogenRemaining)} g remains. The ideal maximum assumes complete conversion of the limiting nitrogen; it does not guarantee real Haber conversion or collection.`,
    };
  }
  if (mode === "percentage") {
    const d = productYieldSamples[b.sample as keyof typeof productYieldSamples],
      r = yieldFromReactant(d.grams, 160, 1, 56, 2, d.actual);
    return {
      correct:
        chosen("reactantAmount", r.givenAmount) &&
        chosen("productAmount", r.requestedAmount) &&
        chosen("theoretical", r.mass) &&
        chosen("percentage", r.percentage),
      theoretical: r.mass,
      actual: d.actual,
      reactantGrams: d.grams,
      feedback: `${d.grams}/160 = ${display(r.givenAmount)} mol Fe2O3; multiply by 2 to obtain ${display(r.requestedAmount)} mol Fe. Theoretical iron = ${display(r.mass)} g. Yield = ${d.actual}/${display(r.mass)} × 100 = ${display(r.percentage)}%. The denominator is theoretical iron, not initial oxide. ${r.apparentExcess ? "This apparent value exceeds 100%; check purity, dryness, measurement and the assumed reaction maximum. No percentage is silently capped." : "Excess CO is stated; the maximum is constructed before comparing collected product."}`,
    };
  }
  if (mode === "collected") {
    const d = collectedSamples[b.sample as keyof typeof collectedSamples],
      r = collectedFromReactant(d.grams, 100, 1, 56, 1, d.percentage);
    return {
      correct:
        chosen("reactantAmount", r.givenAmount) &&
        chosen("theoretical", r.mass) &&
        chosen("factor", d.percentage / 100) &&
        chosen("actual", r.actual),
      theoretical: r.mass,
      actual: r.actual,
      reactantGrams: d.grams,
      feedback: `${d.grams}/100 = ${display(r.givenAmount)} mol CaCO3. The equation gives the same mol CaO, with maximum ${display(r.mass)} g. Collected product = ${display(r.mass)} × ${d.percentage / 100} = ${display(r.actual)} g. Apply yield to the theoretical PRODUCT amount, not directly to starting carbonate. The supplied yield does not by itself identify the cause of lower collection.`,
    };
  }
  if (mode === "required") {
    const d = requiredSamples[b.sample as keyof typeof requiredSamples],
      r = reactantForCollected(d.actual, d.percentage, 24, 1, 95, 1);
    return {
      correct:
        chosen("factor", d.percentage / 100) &&
        chosen("theoretical", r.theoreticalProduct) &&
        chosen("productAmount", r.productAmount) &&
        chosen("reactantMass", r.reactantGrams),
      theoretical: r.theoreticalProduct,
      actual: d.actual,
      reactantGrams: r.reactantGrams,
      feedback: `First recover the product maximum: ${d.actual} ÷ ${d.percentage / 100} = ${display(r.theoreticalProduct)} g dry MgCl2. Divide by 95 g/mol: ${display(r.productAmount)} mol MgCl2. The 1:1 ratio needs ${display(r.reactantAmount)} mol Mg, or ${display(r.reactantGrams)} g. This assumes excess HCl and the supplied yield applies. Collected yield alone does not establish how much Mg actually reacted rather than remained unused.`,
    };
  }
  const d = limitedYieldSamples[b.sample as keyof typeof limitedYieldSamples],
    r = yieldFromLimitedReactants(d.masses, [27, 160], [2, 1], 56, 2, d.actual),
    fromAl = d.masses[0] / 27,
    fromOxide = (d.masses[1] / 160) * 2,
    limiting =
      r.limiting.length === 2 ? "both" : r.limiting[0] === 0 ? "Al" : "Fe2O3";
  return {
    correct:
      chosen("fromAl", fromAl) &&
      chosen("fromOxide", fromOxide) &&
      b.limiting === limiting &&
      chosen("theoretical", r.theoreticalMass) &&
      chosen("percentage", r.percentage),
    theoretical: r.theoreticalMass,
    actual: d.actual,
    feedback: `Al could produce ${display(fromAl)} mol Fe; oxide could produce ${display(fromOxide)} mol Fe. Use the smaller product capacity; ${limiting === "both" ? "both supplies are exactly stoichiometric" : limiting + " limits"}. Theoretical Fe = ${display(r.products[0])} × 56 = ${display(r.theoreticalMass)} g. Actual ${d.actual} g / theoretical ${display(r.theoreticalMass)} g gives ${display(r.percentage)}% yield. Grams alone do not identify the limit, and fractional mol are never floored to whole molecular events.`,
  };
}
