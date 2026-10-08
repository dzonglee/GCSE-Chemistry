export type ThermalMode =
  | "heating"
  | "threshold"
  | "profile"
  | "identification"
  | "comparison"
  | "evidence";
// These are constructed encounter-energy snapshots, not a sampled Maxwell–Boltzmann
// distribution, measured particle speeds, temperature conversion, or a rate law.
export const energySamples = {
  initial: {
    label:
      "Keep reacting-particle density and pathway fixed. Compare cooler and warmer snapshots of 12 illustrative encounters.",
    cool: [4, 8, 10, 12, 14, 16, 18, 20, 22, 26, 30, 40],
    warm: [8, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 60],
    barrier: 30,
  },
  highBarrier: {
    label:
      "Same encounters, higher stated barrier. Compare cooler and warmer snapshots. Reacting-particle density and pathway are fixed.",
    cool: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    warm: [10, 15, 25, 30, 40, 45, 50, 60, 65, 70, 80, 90],
    barrier: 60,
  },
  lowerBarrier: {
    label:
      "Compare snapshots for a pathway with a lower stated minimum. Reacting-particle density and pathway are fixed.",
    cool: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 30],
    warm: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 60],
    barrier: 20,
  },
  equality: {
    label:
      "An encounter at exactly the stated minimum meets the energy condition. Reacting-particle density and pathway are fixed.",
    cool: [5, 10, 15, 20, 25, 30, 35, 40],
    warm: [10, 20, 30, 40, 50, 60, 70, 80],
    barrier: 40,
  },
  allAdequate: {
    label:
      "Both supplied samples already meet the energy minimum. More energy does not imply extra particles. Reacting-particle density and pathway are fixed.",
    cool: [10, 12, 14, 16, 18, 20, 22, 24],
    warm: [20, 24, 28, 32, 36, 40, 44, 48],
    barrier: 10,
  },
  noneCool: {
    label:
      "All cooler encounters fall below the minimum in this constructed snapshot. Reacting-particle density and pathway are fixed.",
    cool: [2, 4, 6, 8, 10, 12, 14, 16],
    warm: [4, 8, 12, 16, 20, 24, 28, 32],
    barrier: 20,
  },
};
export const thresholdSamples = {
  initial: {
    label:
      "Same temperature and 12 encounter energies; switch from the original to the catalysed pathway.",
    energies: [4, 8, 10, 12, 14, 16, 18, 20, 22, 26, 30, 40],
    original: 30,
    catalysed: 18,
  },
  equality: {
    label:
      "The catalysed minimum equals one encounter energy. Count that encounter as adequate.",
    energies: [5, 10, 15, 20, 25, 30, 35, 40],
    original: 35,
    catalysed: 20,
  },
  high: {
    label: "A relatively high barrier is lowered, without heating.",
    energies: [10, 15, 25, 30, 40, 45, 50, 60, 65, 70, 80, 90],
    original: 80,
    catalysed: 50,
  },
  all: {
    label:
      "All supplied encounters meet both minima; the sample is not a complete rate prediction.",
    energies: [20, 25, 30, 35, 40, 45, 50, 55],
    original: 20,
    catalysed: 10,
  },
  noneOriginal: {
    label:
      "No encounter meets the original minimum, but some meet the catalysed minimum.",
    energies: [2, 4, 6, 8, 10, 12, 14, 16],
    original: 20,
    catalysed: 12,
  },
  noneEither: {
    label:
      "Both barriers exceed this small illustrative sample. A finite sample is not a proof that the real reaction never occurs.",
    energies: [2, 4, 6, 8, 10, 12, 14, 16],
    original: 30,
    catalysed: 20,
  },
};
export const thermalProfiles = {
  initial: {
    label:
      "Same exothermic reaction: reactants 40 kJ, products 10 kJ, original peak 100 kJ. Construct a catalysed pathway with forward activation energy 25 kJ.",
    reactant: 40,
    product: 10,
    original: 100,
    catalysedEa: 25,
  },
  endothermic: {
    label:
      "Same endothermic reaction: reactants 20 kJ, products 50 kJ, original peak 100 kJ. Catalysed forward activation energy 45 kJ.",
    reactant: 20,
    product: 50,
    original: 100,
    catalysedEa: 45,
  },
  offset: {
    label:
      "Changed zero reference: reactants 140 kJ, products 110 kJ, original peak 200 kJ. Catalysed forward activation energy 25 kJ.",
    reactant: 140,
    product: 110,
    original: 200,
    catalysedEa: 25,
  },
  equalEnds: {
    label:
      "Reactants and products both 30 kJ; original peak 90 kJ. Catalysed forward activation energy 20 kJ.",
    reactant: 30,
    product: 30,
    original: 90,
    catalysedEa: 20,
  },
  inverse: {
    label:
      "Reactants 70 kJ, products 25 kJ, original peak 150 kJ. Catalysed forward activation energy 35 kJ.",
    reactant: 70,
    product: 25,
    original: 150,
    catalysedEa: 35,
  },
  absorbed: {
    label:
      "Reactants 10 kJ, products 55 kJ, original peak 120 kJ. Catalysed forward activation energy 60 kJ.",
    reactant: 10,
    product: 55,
    original: 120,
    catalysedEa: 60,
  },
};
export const additiveEvidence = {
  initial: {
    label:
      "Under matched conditions additive X speeds the same reaction; it is recovered chemically unchanged with dry mass 1.00 g before and after. No extra product is created.",
    faster: true,
    sameIdentity: true,
    before: 1,
    after: 1,
    sameProducts: true,
    controlled: true,
    answer: "supports",
  },
  consumed: {
    label:
      "Additive Y speeds product formation but 1.00 g falls to 0.40 g after complete recovery. It has reacted to form a different substance.",
    faster: true,
    sameIdentity: false,
    before: 1,
    after: 0.4,
    sameProducts: false,
    controlled: true,
    answer: "reactant",
  },
  inert: {
    label:
      "Additive Z is recovered unchanged at 1.00 g, but there is no measurable rate change in matched trials.",
    faster: false,
    sameIdentity: true,
    before: 1,
    after: 1,
    sameProducts: true,
    controlled: true,
    answer: "insufficient",
  },
  massOnly: {
    label:
      "An additive speeds a matched reaction. Recovered dry mass is unchanged, but chemical identity has not been checked.",
    faster: true,
    sameIdentity: null,
    before: 1,
    after: 1,
    sameProducts: true,
    controlled: true,
    answer: "insufficient",
  },
  confounded: {
    label:
      "With additive X the reaction is faster, but this trial also used a higher temperature. The additive was recovered unchanged.",
    faster: true,
    sameIdentity: true,
    before: 1,
    after: 1,
    sameProducts: true,
    controlled: false,
    answer: "insufficient",
  },
  enzyme: {
    label:
      "Under suitable fixed conditions an enzyme speeds its substrate reaction, gives the same products and is regenerated chemically unchanged overall.",
    faster: true,
    sameIdentity: true,
    before: 1,
    after: 1,
    sameProducts: true,
    controlled: true,
    answer: "supports",
  },
} as const;
export const thermalComparisons = {
  initial: {
    label:
      "Same 24 cm³ endpoint and reactant amounts: without catalyst 60 s; with catalyst 30 s. Both complete reactions finally give 48 cm³.",
    amountA: 24,
    timeA: 60,
    amountB: 24,
    timeB: 30,
    unit: "cm³/s",
    finalA: 48,
    finalB: 48,
    factorCause: "catalyst",
  },
  heating: {
    label:
      "Same 30 cm³ endpoint: cooler trial 75 s, warmer trial 30 s; fixed reactant amounts finally give 60 cm³ in both complete reactions.",
    amountA: 30,
    timeA: 75,
    amountB: 30,
    timeB: 30,
    unit: "cm³/s",
    finalA: 60,
    finalB: 60,
    factorCause: "temperature",
  },
  nonDouble: {
    label:
      "Same 20 cm³ endpoint: without catalyst 50 s, with catalyst 40 s. Fixed amounts finally give 40 cm³ in both complete reactions.",
    amountA: 20,
    timeA: 50,
    amountB: 20,
    timeB: 40,
    unit: "cm³/s",
    finalA: 40,
    finalB: 40,
    factorCause: "catalyst",
  },
  differentEndpoint: {
    label:
      "Trial A collects 15 cm³ in 15 s; trial B 30 cm³ in 25 s. Final volume is 60 cm³ for both complete reactions. Compare measured means, not times alone.",
    amountA: 15,
    timeA: 15,
    amountB: 30,
    timeB: 25,
    unit: "cm³/s",
    finalA: 60,
    finalB: 60,
    factorCause: "unspecified",
  },
  mass: {
    label:
      "Same 0.60 g mass-loss endpoint: without catalyst 120 s, with catalyst 40 s. Both complete reactions finally lose 1.20 g.",
    amountA: 0.6,
    timeA: 120,
    amountB: 0.6,
    timeB: 40,
    unit: "g/s",
    finalA: 1.2,
    finalB: 1.2,
    factorCause: "catalyst",
  },
  equal: {
    label:
      "Two matched trials each collect 18 cm³ in 30 s. Both finally give 36 cm³. This evidence does not show a rate increase.",
    amountA: 18,
    timeA: 30,
    amountB: 18,
    timeB: 30,
    unit: "cm³/s",
    finalA: 36,
    finalB: 36,
    factorCause: "unspecified",
  },
};
export const thermalClaims = {
  initial: {
    label:
      "At fixed temperature a catalyst is added. A student claims every particle moves faster.",
    claim: "barrier",
    reason: "pathway",
  },
  heating: {
    label:
      "The same uncatalysed reaction is warmed. A student claims its activation energy is lowered by heating.",
    claim: "energy",
    reason: "temperature",
  },
  final: {
    label:
      "Same reactant amounts, same products and complete reaction: a student claims a catalyst doubles the final product amount.",
    claim: "time",
    reason: "amount",
  },
  inert: {
    label:
      "A student claims a catalyst cannot participate at any stage because it is not consumed overall.",
    claim: "regenerated",
    reason: "overall",
  },
  enzyme: {
    label:
      "A student claims every enzyme catalyses every reaction and stays effective at arbitrarily high temperatures.",
    claim: "specific",
    reason: "conditions",
  },
  factor: {
    label:
      "A student claims every 10°C temperature increase must exactly double every chemical reaction rate.",
    claim: "noUniversalFactor",
    reason: "measurements",
  },
} as const;
export const adequateCount = (energies: readonly number[], minimum: number) =>
  energies.filter((e) => e >= minimum).length;
export const energyMean = (energies: readonly number[]) =>
  energies.reduce((s, x) => s + x, 0) / energies.length;
export const thermalRate = (amount: number, time: number) => amount / time;
