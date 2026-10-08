export const formulaIons = {
  sodium: {
    name: "sodium",
    formula: "Na",
    charge: 1,
    atoms: { Na: 1 },
    group: false,
  },
  potassium: {
    name: "potassium",
    formula: "K",
    charge: 1,
    atoms: { K: 1 },
    group: false,
  },
  magnesium: {
    name: "magnesium",
    formula: "Mg",
    charge: 2,
    atoms: { Mg: 1 },
    group: false,
  },
  calcium: {
    name: "calcium",
    formula: "Ca",
    charge: 2,
    atoms: { Ca: 1 },
    group: false,
  },
  aluminium: {
    name: "aluminium",
    formula: "Al",
    charge: 3,
    atoms: { Al: 1 },
    group: false,
  },
  ironIII: {
    name: "iron(III)",
    formula: "Fe",
    charge: 3,
    atoms: { Fe: 1 },
    group: false,
  },
  ammonium: {
    name: "ammonium",
    formula: "NH4",
    charge: 1,
    atoms: { N: 1, H: 4 },
    group: true,
  },
  chloride: {
    name: "chloride",
    formula: "Cl",
    charge: -1,
    atoms: { Cl: 1 },
    group: false,
  },
  oxide: {
    name: "oxide",
    formula: "O",
    charge: -2,
    atoms: { O: 1 },
    group: false,
  },
  hydroxide: {
    name: "hydroxide",
    formula: "OH",
    charge: -1,
    atoms: { O: 1, H: 1 },
    group: true,
  },
  nitrate: {
    name: "nitrate",
    formula: "NO3",
    charge: -1,
    atoms: { N: 1, O: 3 },
    group: true,
  },
  carbonate: {
    name: "carbonate",
    formula: "CO3",
    charge: -2,
    atoms: { C: 1, O: 3 },
    group: true,
  },
  sulfate: {
    name: "sulfate",
    formula: "SO4",
    charge: -2,
    atoms: { S: 1, O: 4 },
    group: true,
  },
} as const;
export type FormulaIon = keyof typeof formulaIons;
export const formulaCases = {
  sodiumSulfate: { cation: "sodium", anion: "sulfate" },
  magnesiumHydroxide: { cation: "magnesium", anion: "hydroxide" },
  calciumNitrate: { cation: "calcium", anion: "nitrate" },
  aluminiumSulfate: { cation: "aluminium", anion: "sulfate" },
} as const satisfies Record<string, { cation: FormulaIon; anion: FormulaIon }>;
export type FormulaCase = keyof typeof formulaCases;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export function formulaRatio(cation: FormulaIon, anion: FormulaIon) {
  const positive = formulaIons[cation].charge,
    negative = -formulaIons[anion].charge;
  if (positive <= 0 || negative <= 0)
    throw Error("Formula needs a positive and a negative ion.");
  const divisor = gcd(positive, negative);
  return [negative / divisor, positive / divisor] as const;
}
export function formulaTerm(ion: FormulaIon, count: number) {
  const spec = formulaIons[ion];
  return count === 1
    ? spec.formula
    : `${spec.group ? `(${spec.formula})` : spec.formula}${count}`;
}
export function formulaLedger(
  cation: FormulaIon,
  anion: FormulaIon,
  positiveCount: number,
  negativeCount: number,
) {
  const positive = formulaIons[cation],
    negative = formulaIons[anion],
    ratio = formulaRatio(cation, anion),
    atoms: Record<string, number> = {};
  for (const [ion, count] of [
    [positive, positiveCount],
    [negative, negativeCount],
  ] as const)
    for (const [element, amount] of Object.entries(ion.atoms))
      atoms[element] = (atoms[element] ?? 0) + count * amount;
  return {
    positiveCharge: positiveCount * positive.charge,
    negativeCharge: negativeCount * negative.charge,
    charge: positiveCount * positive.charge + negativeCount * negative.charge,
    formula:
      formulaTerm(cation, positiveCount) + formulaTerm(anion, negativeCount),
    atoms,
    simplest: positiveCount === ratio[0] && negativeCount === ratio[1],
  };
}
/** Normalise presentation only; chemical symbol capitalisation remains significant. */
export function normaliseFormula(raw: string) {
  return raw
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit)))
    .replace(/\s/g, "")
    .replace(/\(([A-Za-z0-9]+)\)(?!\d)/g, "$1");
}
export function displayFormula(raw: string) {
  return raw.replace(/\d/g, (digit) => "₀₁₂₃₄₅₆₇₈₉"[Number(digit)]);
}
