export const GCSE_AVOGADRO = 6.02e23;
export type MoleMode = "mass" | "reverse" | "entities" | "inverse";
export const moleSpecies = {
  H2O: {
    formula: "H₂O",
    molarMass: 18,
    entity: "molecules",
    constituents: 3,
    constituentKind: "atoms",
    ar: "H=1; O=16",
    counts: "2 H and 1 O per molecule",
  },
  O2: {
    formula: "O₂",
    molarMass: 32,
    entity: "molecules",
    constituents: 2,
    constituentKind: "atoms",
    ar: "O=16",
    counts: "2 O per molecule",
  },
  CO2: {
    formula: "CO₂",
    molarMass: 44,
    entity: "molecules",
    constituents: 3,
    constituentKind: "atoms",
    ar: "C=12; O=16",
    counts: "1 C and 2 O per molecule",
  },
  NaCl: {
    formula: "NaCl",
    molarMass: 58.5,
    entity: "formula units",
    constituents: 2,
    constituentKind: "ions",
    ar: "Na=23; Cl=35.5",
    counts: "1 Na⁺ and 1 Cl⁻ per formula-unit ratio; not a molecule",
  },
} as const;
export type MoleSpecies = keyof typeof moleSpecies;
export const massSamples = {
  water: { formula: "H₂O", grams: 9, molarMass: 18, ar: "H=1; O=16" },
  carbon: { formula: "C", grams: 12, molarMass: 12, ar: "C=12" },
  magnesium: { formula: "Mg", grams: 6, molarMass: 24, ar: "Mg=24" },
  oxygen: { formula: "O₂", grams: 16, molarMass: 32, ar: "O=16" },
  carbonDioxide: { formula: "CO₂", grams: 22, molarMass: 44, ar: "C=12; O=16" },
  sodiumChloride: {
    formula: "NaCl",
    grams: 29.25,
    molarMass: 58.5,
    ar: "Na=23; Cl=35.5",
  },
} as const;
const positive = (v: number) => {
  if (!Number.isFinite(v) || v <= 0)
    throw Error("Positive finite value required");
  return v;
};
export function molesFromMass(grams: number, molarMass: number) {
  return positive(positive(grams) / positive(molarMass));
}
export function massFromMoles(amount: number, molarMass: number) {
  return positive(positive(amount) * positive(molarMass));
}
export function numberOfEntities(amount: number) {
  return positive(positive(amount) * GCSE_AVOGADRO);
}
export function amountFromEntities(count: number) {
  return positive(count) / GCSE_AVOGADRO;
}
export function standardCount(count: number) {
  positive(count);
  let power = Math.floor(Math.log10(count)),
    coefficient = Number((count / 10 ** power).toPrecision(12));
  if (coefficient >= 10) {
    coefficient /= 10;
    power++;
  }
  return { coefficient, power };
}
export const moleChoices = {
  mass: {
    sample: [
      "water",
      "carbon",
      "magnesium",
      "oxygen",
      "carbonDioxide",
      "sodiumChloride",
    ],
    unit: ["g", "mg", "kg"],
    grams: [
      "unset",
      "0.006",
      "0.009",
      "0.012",
      "0.016",
      "0.022",
      "0.02925",
      "6",
      "9",
      "12",
      "16",
      "22",
      "29.25",
      "6000",
      "9000",
      "12000",
      "16000",
      "22000",
      "29250",
    ],
    molarMass: [
      "unset",
      "9",
      "12",
      "18",
      "24",
      "32",
      "36",
      "44",
      "58.5",
      "9000",
    ],
    amount: ["unset", "0.25", "0.5", "1", "2", "162", "500", "9000"],
  },
  reverse: {
    species: ["H2O", "O2", "CO2", "NaCl"],
    amount: [0.25, 0.5, 1, 2],
    molarMass: ["unset", "12", "18", "24", "32", "44", "58.5"],
    mass: [
      "unset",
      "0.25",
      "4.5",
      "8",
      "9",
      "11",
      "14.625",
      "16",
      "18",
      "22",
      "29.25",
      "32",
      "36",
      "44",
      "58.5",
      "64",
      "88",
      "117",
      "1000",
    ],
  },
  entities: {
    species: ["H2O", "O2", "CO2", "NaCl"],
    amount: [0.5, 1, 2],
    entity: ["unset", "molecules", "formula units", "atoms"],
    coefficient: ["unset", "1.204", "3.01", "6.02", "12.04"],
    power: ["unset", "22", "23", "24", "46"],
    constituentAmount: ["unset", "0.5", "1", "1.5", "2", "3", "4", "6"],
  },
  inverse: {
    species: ["H2O", "O2", "CO2", "NaCl"],
    population: ["half", "one", "two"],
    amount: ["unset", "0.5", "1", "2", "3.01", "6.02"],
    mass: [
      "unset",
      "9",
      "16",
      "18",
      "22",
      "29.25",
      "32",
      "36",
      "44",
      "58.5",
      "64",
      "88",
      "117",
      "3.01",
    ],
  },
} as const;
export const populations = {
  half: 3.01e23,
  one: 6.02e23,
  two: 1.204e24,
} as const;
export function initialMoleBoard(
  mode: MoleMode,
): Record<string, string | number> {
  switch (mode) {
    case "mass":
      return {
        sample: "water",
        unit: "mg",
        grams: "unset",
        molarMass: "unset",
        amount: "unset",
      };
    case "reverse":
      return {
        species: "CO2",
        amount: 0.25,
        molarMass: "unset",
        mass: "unset",
      };
    case "entities":
      return {
        species: "O2",
        amount: 0.5,
        entity: "unset",
        coefficient: "unset",
        power: "unset",
        constituentAmount: "unset",
      };
    case "inverse":
      return {
        species: "H2O",
        population: "half",
        amount: "unset",
        mass: "unset",
      };
  }
}
export function validMoleBoard(mode: MoleMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    options = moleChoices[mode];
  return (
    Object.keys(b).length === Object.keys(options).length &&
    Object.entries(options).every(([key, values]) =>
      (values as readonly unknown[]).includes(b[key]),
    )
  );
}
export function molePrediction(
  mode: MoleMode,
  b: Record<string, string | number>,
) {
  switch (mode) {
    case "mass": {
      const d = massSamples[b.sample as keyof typeof massSamples],
        amount = molesFromMass(d.grams, d.molarMass);
      return {
        correct:
          Number(b.grams) === d.grams &&
          Number(b.molarMass) === d.molarMass &&
          Number(b.amount) === amount,
        feedback: `Use ${d.grams} g and molar mass ${d.molarMass} g/mol: amount = ${d.grams} ÷ ${d.molarMass} = ${amount} mol. Relative formula/atomic mass is dimensionless; molar mass is in g/mol. Changing the displayed mass unit does not change the sample. Ionic formula units are not molecules.`,
      };
    }
    case "reverse": {
      const d = moleSpecies[b.species as MoleSpecies],
        mass = massFromMoles(Number(b.amount), d.molarMass);
      return {
        correct: Number(b.molarMass) === d.molarMass && Number(b.mass) === mass,
        feedback: `Molar mass of ${d.formula} is ${d.molarMass} g/mol. Mass = amount × molar mass = ${b.amount} × ${d.molarMass} = ${mass} g. Different substances have different grams per mole; mol is not a mass unit.`,
      };
    }
    case "entities": {
      const d = moleSpecies[b.species as MoleSpecies],
        count = standardCount(numberOfEntities(Number(b.amount))),
        constituentAmount = Number(b.amount) * d.constituents;
      return {
        correct:
          b.entity === d.entity &&
          Number(b.coefficient) === count.coefficient &&
          Number(b.power) === count.power &&
          Number(b.constituentAmount) === constituentAmount,
        feedback: `${b.amount} mol of ${d.formula} counts ${d.entity}: ${count.coefficient} × 10^${count.power}. ${d.counts}; total constituent amount = ${constituentAmount} mol of ${d.constituentKind}. Count complete molecules/formula units first, then apply formula subscripts. Use the supplied GCSE-rounded 6.02 × 10²³ mol⁻¹, not an unstated alternative constant.`,
      };
    }
    case "inverse": {
      const d = moleSpecies[b.species as MoleSpecies],
        count = populations[b.population as keyof typeof populations],
        amount = amountFromEntities(count),
        mass = massFromMoles(amount, d.molarMass),
        standard = standardCount(count);
      return {
        correct: Number(b.amount) === amount && Number(b.mass) === mass,
        feedback: `${standard.coefficient} × 10^${standard.power} ${d.entity} of ${d.formula} ÷ (6.02 × 10²³ mol⁻¹) = ${amount} mol. Mass = ${amount} × ${d.molarMass} = ${mass} g. The standard-form coefficient alone is not the amount in mol.`,
      };
    }
  }
}
