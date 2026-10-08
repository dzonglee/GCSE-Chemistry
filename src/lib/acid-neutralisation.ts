export type AcidMode = "pairs" | "products" | "salts" | "identity" | "evidence";
export const acidRecords = {
  pairs: {
    initial: {
      label:
        "Supplied NaCl-forming strong acid/alkali batches:4 H+ units and4 OH− units",
      acid: 4,
      alkali: 4,
      classification: "neutral",
    },
    acidExcess: {
      label: "Supplied NaCl-forming batches:6 H+ units and4 OH− units",
      acid: 6,
      alkali: 4,
      classification: "acidic",
    },
    alkaliExcess: {
      label: "Supplied KNO3-forming batches:3 H+ units and5 OH− units",
      acid: 3,
      alkali: 5,
      classification: "alkaline",
    },
    equalVolumes: {
      label:
        "Equal20 cm³ batches: acid supplies2 H+ units; alkali supplies4 OH− units",
      acid: 2,
      alkali: 4,
      classification: "alkaline",
    },
  },
  products: {
    initial: {
      label: "Hydrochloric acid + sodium hydroxide",
      family: "hydroxide",
      gas: "none",
      water: "yes",
    },
    magnesium: {
      label: "Dilute hydrochloric acid + magnesium",
      family: "metal",
      gas: "H2",
      water: "no",
    },
    oxide: {
      label: "Sulfuric acid + copper(II) oxide",
      family: "oxide",
      gas: "none",
      water: "yes",
    },
    carbonate: {
      label: "Nitric acid + calcium carbonate",
      family: "carbonate",
      gas: "CO2",
      water: "yes",
    },
    insoluble: {
      label: "Nitric acid + magnesium hydroxide",
      family: "hydroxide",
      gas: "none",
      water: "yes",
    },
  },
  salts: {
    initial: {
      label: "Hydrochloric acid + calcium hydroxide; supplied Ca2+ and Cl−",
      name: "calcium-chloride",
      formula: "CaCl2",
    },
    nitrate: {
      label: "Nitric acid + magnesium oxide; supplied Mg2+ and NO3−",
      name: "magnesium-nitrate",
      formula: "Mg(NO3)2",
    },
    sulfate: {
      label: "Sulfuric acid + aluminium oxide; supplied Al3+ and SO4²−",
      name: "aluminium-sulfate",
      formula: "Al2(SO4)3",
    },
    sodium: {
      label: "Sulfuric acid + sodium hydroxide; supplied Na+ and SO4²−",
      name: "sodium-sulfate",
      formula: "Na2SO4",
    },
    iron: {
      label: "Dilute hydrochloric acid + iron; supplied product cation Fe2+",
      name: "iron-II-chloride",
      formula: "FeCl2",
    },
  },
  identity: {
    initial: {
      label: "Hydrochloric acid solution, measured pH 2",
      kind: "acid",
      ion: "H+",
    },
    alkali: {
      label: "Sodium hydroxide solution, measured pH 12",
      kind: "alkali-soluble-base",
      ion: "OH−",
    },
    oxide: {
      label: "Insoluble CuO reacts with acid to produce salt and water",
      kind: "insoluble-base",
      ion: "not-an-aqueous-ion-record",
    },
    water: {
      label: "Water sample measured pH 7",
      kind: "neutral-solution",
      ion: "neither-acid-nor-alkali-evidence",
    },
    calcium: {
      label:
        "The dissolved part of calcium hydroxide in aqueous solution, measured pH 11",
      kind: "alkali-soluble-base",
      ion: "OH−",
    },
  },
  evidence: {
    initial: {
      label: "Supplied teacher-observed gas test:limewater becomes cloudy",
      conclusion: "CO2-supported",
      ph: "not-determined",
    },
    pop: {
      label:
        "Supplied teacher-observed gas test:a lighted splint gives a squeaky pop",
      conclusion: "H2-supported",
      ph: "not-determined",
    },
    green: {
      label:
        "Supplied universal-indicator chart:green corresponds approximately to pH 7; sample is green",
      conclusion: "neutral-supported",
      ph: "approximately-7",
    },
    litmus: {
      label:
        "Red litmus turns blue; no wide-range chart or probe reading is provided",
      conclusion: "alkaline-supported",
      ph: "not-exactly-determined",
    },
    bubbles: {
      label:
        "Bubbles appear during an unidentified reaction; no gas test is supplied",
      conclusion: "gas-identity-not-established",
      ph: "not-determined",
    },
    warming: {
      label:
        "A reacting acid/alkali mixture becomes warmer; final pH and residual reactants are unmeasured",
      conclusion: "heat-release-not-complete-neutrality",
      ph: "not-determined",
    },
  },
} as const;
export const acidChoices: Record<AcidMode, Record<string, string[]>> = {
  pairs: {
    record: ["initial", "acidExcess", "alkaliExcess", "equalVolumes"],
    steps: ["0", "1", "2", "3", "4", "5", "6"],
    acidRemaining: ["unset", "0", "1", "2", "3", "4", "5", "6"],
    alkaliRemaining: ["unset", "0", "1", "2", "3", "4", "5", "6"],
    classification: [
      "unset",
      "acidic",
      "neutral",
      "alkaline",
      "charge-alone-decides",
    ],
  },
  products: {
    record: ["initial", "magnesium", "oxide", "carbonate", "insoluble"],
    family: ["unset", "metal", "oxide", "hydroxide", "carbonate"],
    gas: ["unset", "none", "H2", "CO2", "O2"],
    water: ["unset", "yes", "no"],
  },
  salts: {
    record: ["initial", "nitrate", "sulfate", "sodium", "iron"],
    name: [
      "unset",
      "calcium-chloride",
      "magnesium-nitrate",
      "aluminium-sulfate",
      "sodium-sulfate",
      "iron-II-chloride",
      "calcium-nitrate",
      "magnesium-chloride",
    ],
    formula: [
      "unset",
      "CaCl2",
      "CaCl",
      "Mg(NO3)2",
      "MgNO3",
      "Al2(SO4)3",
      "AlSO4",
      "Na2SO4",
      "NaSO4",
      "FeCl2",
      "FeCl3",
    ],
  },
  identity: {
    record: ["initial", "alkali", "oxide", "water", "calcium"],
    kind: [
      "unset",
      "acid",
      "alkali-soluble-base",
      "insoluble-base",
      "neutral-solution",
      "all-bases-soluble",
    ],
    ion: [
      "unset",
      "H+",
      "OH−",
      "not-an-aqueous-ion-record",
      "neither-acid-nor-alkali-evidence",
      "H−",
    ],
  },
  evidence: {
    record: ["initial", "pop", "green", "litmus", "bubbles", "warming"],
    conclusion: [
      "unset",
      "CO2-supported",
      "H2-supported",
      "neutral-supported",
      "alkaline-supported",
      "gas-identity-not-established",
      "heat-release-not-complete-neutrality",
      "all-bubbles-hydrogen",
      "warming-proves-pH 7",
    ],
    ph: [
      "unset",
      "not-determined",
      "approximately-7",
      "not-exactly-determined",
      "exactly-12",
    ],
  },
};
export function initialAcidBoard(mode: AcidMode): Record<string, string> {
  return Object.fromEntries(
    Object.keys(acidChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : k === "steps" ? "0" : "unset",
    ]),
  );
}
export function validAcidBoard(
  mode: AcidMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    fields = acidChoices[mode];
  if (
    Object.keys(b).length !== Object.keys(fields).length ||
    !Object.entries(fields).every(
      ([k, v]) => typeof b[k] === "string" && v.includes(b[k] as string),
    )
  )
    return false;
  if (mode === "pairs") {
    const r = acidRecords.pairs[b.record as keyof typeof acidRecords.pairs];
    return Number(b.steps) <= Math.min(r.acid, r.alkali);
  }
  return true;
}
export function acidExpected(
  mode: AcidMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "pairs") {
    const r = acidRecords.pairs[key as keyof typeof acidRecords.pairs],
      pairs = Math.min(r.acid, r.alkali);
    return {
      steps: String(pairs),
      acidRemaining: String(r.acid - pairs),
      alkaliRemaining: String(r.alkali - pairs),
      classification: r.classification,
    };
  }
  if (mode === "products") {
    const r = acidRecords.products[key as keyof typeof acidRecords.products];
    return { family: r.family, gas: r.gas, water: r.water };
  }
  if (mode === "salts") {
    const r = acidRecords.salts[key as keyof typeof acidRecords.salts];
    return { name: r.name, formula: r.formula };
  }
  if (mode === "identity") {
    const r = acidRecords.identity[key as keyof typeof acidRecords.identity];
    return { kind: r.kind, ion: r.ion };
  }
  const r = acidRecords.evidence[key as keyof typeof acidRecords.evidence];
  return { conclusion: r.conclusion, ph: r.ph };
}
export function acidPrediction(
  mode: AcidMode,
  b: Record<string, string | number>,
) {
  if (!validAcidBoard(mode, b)) return { complete: false, correct: false };
  const e = acidExpected(mode, b),
    complete = Object.keys(e).every((k) => b[k] !== "unset");
  return {
    complete,
    correct: complete && Object.entries(e).every(([k, v]) => b[k] === v),
  };
}
