export type SaltMode = "method" | "sequence" | "filter" | "cooling" | "purity";
export const saltRecords = {
  method: {
    initial: {
      label:
        "Copper sulfate is soluble; CuO is insoluble and reacts with dilute sulfuric acid",
      method: "excess-insoluble",
      acid: "sulfuric",
    },
    magnesium: {
      label:
        "Magnesium chloride is soluble; MgO is insoluble and reacts with dilute hydrochloric acid",
      method: "excess-insoluble",
      acid: "hydrochloric",
    },
    sodium: {
      label: "Sodium chloride is soluble; sodium hydroxide dissolves in water",
      method: "titration",
      acid: "hydrochloric",
    },
    nitrate: {
      label:
        "Potassium nitrate is soluble; potassium hydroxide dissolves in water",
      method: "titration",
      acid: "nitric",
    },
    insoluble: {
      label:
        "Barium sulfate is supplied as insoluble; mix supplied soluble barium chloride and sodium sulfate solutions",
      method: "precipitation",
      acid: "not-an-acid-preparation",
    },
  },
  sequence: {
    initial: {
      label:
        "Teacher has reacted dilute sulfuric acid with excess CuO: copper sulfate solution and unreacted CuO remain",
    },
  },
  filter: {
    initial: {
      label:
        "After complete acid consumption: insoluble excess CuO in copper sulfate solution",
      residue: "excess-CuO",
      filtrate: "salt-solution",
    },
    early: {
      label:
        "CuO was insufficient: all CuO reacted and acid remains dissolved with copper sulfate",
      residue: "none-of-these-solids",
      filtrate: "salt-and-acid",
    },
    alkali: {
      label: "Excess NaOH remains dissolved in sodium chloride solution",
      residue: "none-of-these-solids",
      filtrate: "salt-and-alkali",
    },
    crystals: {
      label: "Cooled copper sulfate mixture: crystals in mother liquor",
      residue: "salt-crystals",
      filtrate: "mother-liquor",
    },
  },
  cooling: {
    initial: {
      label:
        "Supplied KNO3 data:50 g water;40 g dissolved salt; cold solubility 32 g per 100 g water",
      water: 50,
      solute: 40,
      cold: 32,
    },
    smaller: {
      label:
        "Supplied KNO3 data:25 g water;20 g dissolved salt; cold solubility 32 g per 100 g water",
      water: 25,
      solute: 20,
      cold: 32,
    },
    unsaturated: {
      label:
        "Supplied KNO3 data:50 g water;10 g dissolved salt; cold solubility 32 g per 100 g water",
      water: 50,
      solute: 10,
      cold: 32,
    },
    larger: {
      label:
        "Supplied KNO3 data:75 g water;60 g dissolved salt; cold solubility 32 g per 100 g water",
      water: 75,
      solute: 60,
      cold: 32,
    },
  },
  purity: {
    initial: {
      label:
        "Warm filtered copper sulfate solution must yield hydrated crystals",
      next: "concentrate-then-cool",
      reason: "preserve-crystals",
    },
    wet: {
      label:
        "Recovered crystals carry droplets of mother liquor; a suitable school method uses gentle filter-paper drying",
      next: "pat-dry",
      reason: "remove-surface-liquid",
    },
    indicator: {
      label:
        "An acid/alkali titration finds the needed volumes using indicator; product must be uncontaminated by indicator",
      next: "repeat-without-indicator",
      reason: "avoid-indicator-contamination",
    },
    soluble: {
      label:
        "A solution contains salt and dissolved excess alkali; proposed filtration cannot remove dissolved alkali",
      next: "choose-measured-proportions",
      reason: "dissolved-passes-filter",
    },
  },
} as const;
export const saltChoices: Record<SaltMode, Record<string, string[]>> = {
  method: {
    record: Object.keys(saltRecords.method),
    method: [
      "unset",
      "excess-insoluble",
      "titration",
      "precipitation",
      "filter-dissolved-alkali",
    ],
    acid: [
      "unset",
      "sulfuric",
      "hydrochloric",
      "nitric",
      "not-an-acid-preparation",
    ],
  },
  sequence: {
    record: ["initial"],
    stage: ["0", "1", "2", "3", "4"],
    next: [
      "unset",
      "filter-excess",
      "concentrate",
      "cool",
      "recover-dry",
      "complete",
      "boil-dry",
      "filter-before-reaction",
    ],
  },
  filter: {
    record: Object.keys(saltRecords.filter),
    residue: [
      "unset",
      "excess-CuO",
      "none-of-these-solids",
      "salt-crystals",
      "all-dissolved-salt",
    ],
    filtrate: [
      "unset",
      "salt-solution",
      "salt-and-acid",
      "salt-and-alkali",
      "mother-liquor",
      "pure-water",
    ],
  },
  cooling: {
    record: Object.keys(saltRecords.cooling),
    dissolved: ["unset", "0", "8", "10", "16", "20", "24", "32", "40", "60"],
    crystals: [
      "unset",
      "0",
      "8",
      "10",
      "12",
      "16",
      "20",
      "24",
      "32",
      "36",
      "40",
      "60",
    ],
  },
  purity: {
    record: Object.keys(saltRecords.purity),
    next: [
      "unset",
      "concentrate-then-cool",
      "pat-dry",
      "repeat-without-indicator",
      "choose-measured-proportions",
      "boil-dry",
      "filter-dissolved-alkali",
    ],
    reason: [
      "unset",
      "preserve-crystals",
      "remove-surface-liquid",
      "avoid-indicator-contamination",
      "dissolved-passes-filter",
      "all-water-must-be-driven-off",
    ],
  },
};
export function initialSaltBoard(mode: SaltMode): Record<string, string> {
  return Object.fromEntries(
    Object.keys(saltChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : k === "stage" ? "0" : "unset",
    ]),
  );
}
export function validSaltBoard(
  mode: SaltMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>;
  return (
    Object.keys(b).length === Object.keys(saltChoices[mode]).length &&
    Object.entries(saltChoices[mode]).every(
      ([k, values]) =>
        typeof b[k] === "string" && values.includes(b[k] as string),
    )
  );
}
export function saltExpected(
  mode: SaltMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "method") {
    const r = saltRecords.method[key as keyof typeof saltRecords.method];
    return { method: r.method, acid: r.acid };
  }
  if (mode === "sequence")
    return {
      next: ["filter-excess", "concentrate", "cool", "recover-dry", "complete"][
        Number(b.stage)
      ],
    };
  if (mode === "filter") {
    const r = saltRecords.filter[key as keyof typeof saltRecords.filter];
    return { residue: r.residue, filtrate: r.filtrate };
  }
  if (mode === "cooling") {
    const r = saltRecords.cooling[key as keyof typeof saltRecords.cooling],
      d = Math.min(r.solute, (r.water * r.cold) / 100);
    return { dissolved: String(d), crystals: String(r.solute - d) };
  }
  const r = saltRecords.purity[key as keyof typeof saltRecords.purity];
  return { next: r.next, reason: r.reason };
}
export function saltPrediction(
  mode: SaltMode,
  b: Record<string, string | number>,
) {
  if (!validSaltBoard(mode, b)) return { complete: false, correct: false };
  const e = saltExpected(mode, b),
    complete = Object.keys(e).every((k) => b[k] !== "unset");
  return {
    complete,
    correct: complete && Object.entries(e).every(([k, v]) => b[k] === v),
  };
}
