export type ExtractionMode =
  "route" | "source" | "oxygen" | "grade" | "decision";
export const extractionRecords = {
  route: {
    initial: {
      label: "Given C > Fe: obtain Fe from iron oxide",
      route: "carbon-reduction",
      reason: "carbon-more-reactive",
    },
    aluminium: {
      label:
        "Given Al > C: obtain Al from aluminium oxide; compare carbon reduction and electrolysis",
      route: "electrolysis",
      reason: "carbon-cannot-reduce",
    },
    copper: {
      label:
        "Given C > Cu: obtain Cu from copper oxide under supplied suitable conditions",
      route: "carbon-reduction",
      reason: "carbon-more-reactive",
    },
    carbide: {
      label:
        "Given metal X reacts with carbon to form an unwanted carbide; the supplied non-carbon process gives pure X",
      route: "supplied-noncarbon-process",
      reason: "carbon-contaminates-product",
    },
  },
  source: {
    initial: {
      label: "An ore contains copper oxide mixed with unwanted rock",
      identity: "metal-compound-in-mixture",
      change: "chemical-reduction-needed",
    },
    gold: {
      label: "Identified native gold grains are mixed with sand",
      identity: "uncombined-metal-in-mixture",
      change: "physical-separation-may-be-needed",
    },
    crushed: {
      label:
        "Copper oxide ore is crushed and concentrated; copper remains in CuO",
      identity: "metal-compound-in-mixture",
      change: "not-yet-reduced-to-metal",
    },
    carbonate: {
      label:
        "A zinc ore contains ZnCO3; a supplied heating step gives ZnO + CO2, not zinc metal",
      identity: "metal-compound-in-mixture",
      change: "oxide-preparation-not-metal-extraction",
    },
  },
  oxygen: {
    initial: {
      label: "2CuO + C → 2Cu + CO2",
      reduced: "CuO",
      carbonProduct: "CO2",
      oxygen: 2,
    },
    nickel: {
      label: "NiO + C → Ni + CO",
      reduced: "NiO",
      carbonProduct: "CO",
      oxygen: 1,
    },
    zinc: {
      label: "ZnO + C → Zn + CO",
      reduced: "ZnO",
      carbonProduct: "CO",
      oxygen: 1,
    },
  },
  grade: {
    initial: {
      label:
        "100 kg ore contains 25% CuO; CuO has relative mass 80, of which Cu contributes 64",
      ore: 100,
      percent: 25,
      fraction: 64 / 80,
    },
    richer: {
      label:
        "100 kg ore contains 40% CuO; Cu contributes 64 of CuO relative mass 80",
      ore: 100,
      percent: 40,
      fraction: 64 / 80,
    },
    aluminium: {
      label:
        "40 kg rock contains 38% Al2O3; Al contributes 54 of Al2O3 relative mass 102",
      ore: 40,
      percent: 38,
      fraction: 54 / 102,
    },
    iron: {
      label:
        "200 kg ore contains 30% Fe2O3; Fe contributes 112 of Fe2O3 relative mass 160",
      ore: 200,
      percent: 30,
      fraction: 112 / 160,
    },
  },
  decision: {
    initial: {
      label:
        "Same required metal/purity: A recovers 20 kg for £80 with 22 kg CO2; B recovers 25 kg for £112.50 with 16 kg CO2. Choose lowest cost per kg",
      priority: "cost",
    },
    emissions: {
      label:
        "Same batches A/B: choose lowest supplied CO2 emissions per kg of recovered metal",
      priority: "emissions",
    },
    both: {
      label:
        "Same batches A/B: require cost ≤ £4.20/kg AND supplied CO2 ≤ 0.90 kg/kg",
      priority: "both",
    },
  },
} as const;
export const extractionChoices: Record<
  ExtractionMode,
  Record<string, string[]>
> = {
  route: {
    record: ["initial", "aluminium", "copper", "carbide"],
    route: [
      "unset",
      "carbon-reduction",
      "electrolysis",
      "supplied-noncarbon-process",
      "crushing-only",
    ],
    reason: [
      "unset",
      "carbon-more-reactive",
      "carbon-cannot-reduce",
      "carbon-contaminates-product",
      "cheapest-always-works",
    ],
  },
  source: {
    record: ["initial", "gold", "crushed", "carbonate"],
    identity: [
      "unset",
      "metal-compound-in-mixture",
      "uncombined-metal-in-mixture",
      "pure-metal-guaranteed",
    ],
    change: [
      "unset",
      "chemical-reduction-needed",
      "physical-separation-may-be-needed",
      "not-yet-reduced-to-metal",
      "oxide-preparation-not-metal-extraction",
      "crushing-removes-oxygen",
    ],
  },
  oxygen: {
    record: ["initial", "nickel", "zinc"],
    reduced: ["unset", "CuO", "NiO", "ZnO", "C"],
    carbonProduct: ["unset", "CO", "CO2", "always-CO2"],
    oxygen: ["unset", "0", "1", "2", "3"],
  },
  grade: {
    record: ["initial", "richer", "aluminium", "iron"],
    oxide: ["unset", "15.2", "20", "25", "32", "40", "60", "100"],
    metal: [
      "unset",
      "8.047058823529412",
      "15.2",
      "20",
      "25",
      "32",
      "40",
      "42",
      "60",
    ],
  },
  decision: {
    record: ["initial", "emissions", "both"],
    costA: ["unset", "4", "4.5", "80"],
    costB: ["unset", "4", "4.5", "112.5"],
    route: ["unset", "A", "B", "both", "neither"],
  },
};
export function initialExtractionBoard(
  mode: ExtractionMode,
): Record<string, string> {
  return Object.fromEntries(
    Object.keys(extractionChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : "unset",
    ]),
  );
}
export function validExtractionBoard(
  mode: ExtractionMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    fields = extractionChoices[mode];
  return (
    Object.keys(b).length === Object.keys(fields).length &&
    Object.entries(fields).every(
      ([k, choices]) =>
        typeof b[k] === "string" && choices.includes(b[k] as string),
    )
  );
}
export function extractionExpected(
  mode: ExtractionMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "route") {
    const r =
      extractionRecords.route[key as keyof typeof extractionRecords.route];
    return { route: r.route, reason: r.reason };
  }
  if (mode === "source") {
    const r =
      extractionRecords.source[key as keyof typeof extractionRecords.source];
    return { identity: r.identity, change: r.change };
  }
  if (mode === "oxygen") {
    const r =
      extractionRecords.oxygen[key as keyof typeof extractionRecords.oxygen];
    return {
      reduced: r.reduced,
      carbonProduct: r.carbonProduct,
      oxygen: String(r.oxygen),
    };
  }
  if (mode === "grade") {
    const r =
        extractionRecords.grade[key as keyof typeof extractionRecords.grade],
      oxide = (r.ore * r.percent) / 100;
    return { oxide: String(oxide), metal: String(oxide * r.fraction) };
  }
  return {
    costA: "4",
    costB: "4.5",
    route: key === "initial" ? "A" : key === "emissions" ? "B" : "neither",
  };
}
export function extractionPrediction(
  mode: ExtractionMode,
  b: Record<string, string | number>,
) {
  if (!validExtractionBoard(mode, b))
    return { complete: false, correct: false };
  const expected = extractionExpected(mode, b),
    complete = Object.keys(expected).every((k) => b[k] !== "unset");
  return {
    complete,
    correct: complete && Object.entries(expected).every(([k, v]) => b[k] === v),
  };
}
