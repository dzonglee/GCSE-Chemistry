/** Actual and theoretical quantities must describe the same product in matching units.
 * An apparent yield above100 is retained numerically and flagged, never silently capped. */
export function percentYield(actual: number, theoretical: number) {
  if (
    !Number.isFinite(actual) ||
    actual < 0 ||
    !Number.isFinite(theoretical) ||
    theoretical <= 0
  )
    throw Error(
      "Nonnegative actual and positive theoretical quantity required",
    );
  const percentage = (actual / theoretical) * 100;
  return { percentage, apparentExcess: actual > theoretical };
}
export function actualFromYield(theoretical: number, percentage: number) {
  if (
    !Number.isFinite(theoretical) ||
    theoretical <= 0 ||
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  )
    throw Error("Positive theoretical amount and a percentage0–100 required");
  return (theoretical * percentage) / 100;
}
export function theoreticalFromYield(actual: number, percentage: number) {
  if (
    !Number.isFinite(actual) ||
    actual <= 0 ||
    !Number.isFinite(percentage) ||
    percentage <= 0 ||
    percentage > 100
  )
    throw Error(
      "Positive actual amount and a percentage above0 up to100 required",
    );
  return actual / (percentage / 100);
}
export function recoveredInventory(portions: number) {
  if (!Number.isSafeInteger(portions) || portions < 0 || portions > 10)
    throw Error("Recovered portions must be a whole count0–10");
  return {
    formed: 20,
    collected: portions * 2,
    unrecovered: (10 - portions) * 2,
    percentage: portions * 10,
  };
}
export const yieldSamples = {
  standard: {
    label: "15 g actual; 20 g theoretical",
    actual: 15,
    theoretical: 20,
    reactantMass: 12,
  },
  mixedUnits: {
    label: "900 g actual; 1.2 kg theoretical",
    actual: 900,
    theoretical: 1200,
    reactantMass: 500,
  },
  none: {
    label: "0 g actual; 20 g theoretical",
    actual: 0,
    theoretical: 20,
    reactantMass: 12,
  },
  complete: {
    label: "20 g actual; 20 g theoretical",
    actual: 20,
    theoretical: 20,
    reactantMass: 12,
  },
} as const;
export const actualYieldSamples = {
  first: { label: "20 g theoretical; 75%", theoretical: 20, percentage: 75 },
  second: { label: "50 g theoretical; 60%", theoretical: 50, percentage: 60 },
  kilograms: {
    label: "1.5 kg theoretical; 80%",
    theoretical: 1500,
    percentage: 80,
  },
} as const;
export const reverseYieldSamples = {
  first: { label: "18 g actual; 60%", actual: 18, percentage: 60 },
  second: { label: "12 g actual; 80%", actual: 12, percentage: 80 },
} as const;
export type YieldMode = "fraction" | "actual" | "reverse" | "collection";
export const yieldChoices = {
  fraction: {
    sample: ["standard", "mixedUnits", "none", "complete"],
    actual: ["unset", "0", "15", "20", "900", "1.2"],
    theoretical: ["unset", "15", "20", "12", "500", "900", "1200", "1.2"],
    percentage: ["unset", "0", "25", "75", "100", "125"],
  },
  actual: {
    sample: ["first", "second", "kilograms"],
    factor: ["unset", "0.6", "0.75", "0.8", "1.6", "60", "75", "80"],
    mass: ["unset", "15", "30", "1200", "20", "50", "1500"],
  },
  reverse: {
    sample: ["first", "second"],
    factor: ["unset", "0.6", "0.8", "1.6", "1.8", "60", "80"],
    theoretical: ["unset", "10.8", "14.4", "15", "18", "30"],
  },
  collection: {
    recovered: [6, 8, 10],
    collected: ["unset", "12", "16", "20"],
    unrecovered: ["unset", "0", "4", "8"],
    percentage: ["unset", "60", "80", "100"],
    interpretation: ["unset", "remains", "destroyed", "extra-atoms"],
  },
} as const;
export function initialYieldBoard(
  mode: YieldMode,
): Record<string, string | number> {
  switch (mode) {
    case "fraction":
      return {
        sample: "standard",
        actual: "unset",
        theoretical: "unset",
        percentage: "unset",
      };
    case "actual":
      return { sample: "first", factor: "unset", mass: "unset" };
    case "reverse":
      return { sample: "first", factor: "unset", theoretical: "unset" };
    case "collection":
      return {
        recovered: 8,
        collected: "unset",
        unrecovered: "unset",
        percentage: "unset",
        interpretation: "unset",
      };
  }
}
export function validYieldBoard(mode: YieldMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    choices = yieldChoices[mode];
  return (
    Object.keys(b).length === Object.keys(choices).length &&
    Object.entries(choices).every(([k, v]) =>
      (v as readonly unknown[]).includes(b[k]),
    )
  );
}
export function yieldPrediction(
  mode: YieldMode,
  b: Record<string, string | number>,
) {
  if (mode === "fraction") {
    const d = yieldSamples[b.sample as keyof typeof yieldSamples],
      r = percentYield(d.actual, d.theoretical);
    return {
      correct:
        Number(b.actual) === d.actual &&
        Number(b.theoretical) === d.theoretical &&
        Number(b.percentage) === r.percentage,
      feedback: `Compare the same product in matching units: actual ${d.actual} g / theoretical ${d.theoretical} g ×100 = ${r.percentage}%. The theoretical product amount is the denominator, not starting reactant mass, recovered mass or the shortfall. Zero collected product gives 0%; equal actual and theoretical gives 100%.`,
    };
  }
  if (mode === "actual") {
    const d = actualYieldSamples[b.sample as keyof typeof actualYieldSamples],
      mass = actualFromYield(d.theoretical, d.percentage);
    return {
      correct:
        Number(b.factor) === d.percentage / 100 && Number(b.mass) === mass,
      feedback: `${d.percentage}% is a factor ${d.percentage / 100}. Actual product=${d.theoretical} g ×${d.percentage / 100}=${mass} g. A theoretical1.5 kg is1500 g when the requested actual output is grams. Yield means product obtained, not percentage loss.`,
    };
  }
  if (mode === "reverse") {
    const d = reverseYieldSamples[b.sample as keyof typeof reverseYieldSamples],
      mass = theoreticalFromYield(d.actual, d.percentage);
    return {
      correct:
        Number(b.factor) === d.percentage / 100 &&
        Number(b.theoretical) === mass,
      feedback: `Actual ${d.actual} g represents ${d.percentage}% of the theoretical amount. Theoretical = ${d.actual} ÷ ${d.percentage / 100} = ${mass} g. Divide by the yield factor; adding the missing percentage to the actual mass uses the wrong base. This rearrangement uses a supplied percentage; deriving theoretical mass from reactant stoichiometry is a separate Higher lesson.`,
    };
  }
  const d = recoveredInventory(Number(b.recovered));
  return {
    correct:
      Number(b.collected) === d.collected &&
      Number(b.unrecovered) === d.unrecovered &&
      Number(b.percentage) === d.percentage &&
      b.interpretation === "remains",
    feedback: `All 20 g of theoretical product formed. Of ten illustrative 2-g portions, ${b.recovered} are collected: ${d.collected} g. ${d.unrecovered} g remains in the transfer/filter apparatus, outside the collected sample. Collected percentage yield = ${d.collected}/20 × 100 = ${d.percentage}%. Atoms are not destroyed. The product-formation amount and collected amount differ; incomplete conversion is not the cause in this supplied scenario.`,
  };
}
