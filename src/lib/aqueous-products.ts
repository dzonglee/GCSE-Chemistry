export type AqueousMode =
  "cathode" | "products" | "transfer" | "graph" | "investigation" | "reading";
export const aqueousRecords = {
  reading: {
    initial: {
      label:
        "Inverted gas cylinder A: numbers increase downwards; each small interval is 0.2 cm³; supplied boundary shown in blue",
      ticks: 22,
    },
    low: {
      label:
        "Inverted gas cylinder B: same 0.2 cm³ divisions; a different supplied boundary shown in blue",
      ticks: 14,
    },
    high: {
      label:
        "Inverted gas cylinder C: same 0.2 cm³ divisions; a different supplied boundary shown in blue",
      ticks: 31,
    },
  },

  cathode: {
    initial: {
      label:
        "Aqueous copper sulfate, inert electrodes; copper is below hydrogen in the supplied reactivity series",
      product: "Cu",
      reason: "metal-below-hydrogen",
    },
    sodium: {
      label:
        "Aqueous sodium chloride, inert electrodes; sodium is above hydrogen",
      product: "H2",
      reason: "water-competes",
    },
    silver: {
      label:
        "Aqueous silver nitrate, inert electrodes; silver is below hydrogen",
      product: "Ag",
      reason: "metal-below-hydrogen",
    },
    magnesium: {
      label:
        "Aqueous magnesium sulfate, inert electrodes; magnesium is above hydrogen",
      product: "H2",
      reason: "water-competes",
    },
    molten: {
      label: "Molten sodium chloride, inert electrodes; no water is present",
      product: "Na",
      reason: "no-water",
    },
  },
  products: {
    initial: {
      label:
        "Concentrated aqueous sodium chloride, inert electrodes; supplied GCSE chlorine-producing case",
      cathode: "H2",
      anode: "Cl2",
    },
    copper: {
      label: "Aqueous copper sulfate, inert electrodes; supplied GCSE case",
      cathode: "Cu",
      anode: "O2",
    },
    bromide: {
      label:
        "Aqueous potassium bromide, inert electrodes; standard GCSE halide prediction",
      cathode: "H2",
      anode: "Br2",
    },
    copperChloride: {
      label:
        "Aqueous copper chloride, inert electrodes; supplied chlorine-producing case",
      cathode: "Cu",
      anode: "Cl2",
    },
    sulfate: {
      label: "Aqueous sodium sulfate, inert electrodes",
      cathode: "H2",
      anode: "O2",
    },
    acid: {
      label: "Water acidified with sulfuric acid, inert electrodes",
      cathode: "H2",
      anode: "O2",
    },
    silver: {
      label: "Aqueous silver nitrate, inert electrodes",
      cathode: "Ag",
      anode: "O2",
    },
  },
  transfer: {
    initial: {
      label:
        "Copper sulfate solution with copper electrodes; equal copper transfer at both electrodes, fixed solution volume",
      anode: "copper-dissolves",
      solution: "copper-ions-replenished",
    },
    inert: {
      label:
        "Copper sulfate solution with inert electrodes; copper deposits at cathode and oxygen forms at anode, fixed solution volume",
      anode: "oxygen-forms",
      solution: "copper-ions-decrease",
    },
    mass: {
      label:
        "Pure copper electrodes: anode starts at 12.00 g and ends at 11.80 g; supplied equal copper transfer, no losses",
      anode: "copper-dissolves",
      solution: "copper-ions-replenished",
    },
    purification: {
      label:
        "Supplied purification case: impure copper anode, pure copper cathode; matched copper transfer at fixed solution volume; insoluble impurities form anode sludge",
      anode: "copper-dissolves",
      solution: "copper-ions-replenished",
    },
  },
  graph: {
    initial: {
      label:
        "Illustrative gas collection: read hydrogen at 8 minutes; hydrogen is a straight line through the origin, chlorine initially curves",
      time: 8,
      volume: 4,
      direct: "hydrogen-only",
      positive: "both",
      offset: false,
    },
    later: {
      label: "Same illustrative gas collection: read hydrogen at 16 minutes",
      time: 16,
      volume: 8,
      direct: "hydrogen-only",
      positive: "both",
      offset: false,
    },
    offset: {
      label:
        "Different supplied record: hydrogen volume starts at 2 cm³ at time zero and increases linearly; chlorine initially curves; read hydrogen at 8 minutes",
      time: 8,
      volume: 6,
      direct: "neither",
      positive: "both",
      offset: true,
    },
  },
  investigation: {
    initial: {
      label:
        "School-supervised inert-electrode investigation: hypothesise hydrogen at cathode and oxygen at anode in aqueous sodium sulfate; decide the supporting observations",
      observation: "pop-and-relight",
      decision: "hypothesis-supported",
    },
    bubbles: {
      label:
        "Only colourless bubbles are reported at both electrodes; no gas tests have been provided",
      observation: "bubbles-only",
      decision: "identity-not-established",
    },
    controlled: {
      label:
        "Compare inert and copper electrodes in copper sulfate: same initial solution concentration and volume, same exposed area, current, duration and temperature",
      observation: "controlled-comparison",
      decision: "material-effect-comparable",
    },
    confounded: {
      label:
        "Compare inert and copper electrodes, but also double current and duration for the copper run",
      observation: "several-changes",
      decision: "material-effect-not-isolated",
    },
  },
} as const;
export const aqueousChoices: Record<AqueousMode, Record<string, string[]>> = {
  reading: {
    record: Object.keys(aqueousRecords.reading),
    ticks: Array.from({ length: 41 }, (_, i) => String(i)),
  },

  cathode: {
    record: Object.keys(aqueousRecords.cathode),
    product: ["unset", "Cu", "Ag", "Na", "Mg", "H2", "O2"],
    reason: [
      "unset",
      "metal-below-hydrogen",
      "water-competes",
      "no-water",
      "salt-metal-always",
    ],
  },
  products: {
    record: Object.keys(aqueousRecords.products),
    cathode: ["unset", "H2", "Cu", "Ag", "Na", "K", "Cl2"],
    anode: ["unset", "Cl2", "Br2", "O2", "H2", "Cl−", "SO4"],
  },
  transfer: {
    record: Object.keys(aqueousRecords.transfer),
    anode: [
      "unset",
      "copper-dissolves",
      "oxygen-forms",
      "copper-deposits",
      "no-change",
    ],
    solution: [
      "unset",
      "copper-ions-replenished",
      "copper-ions-decrease",
      "copper-ions-increase",
    ],
  },
  graph: {
    record: Object.keys(aqueousRecords.graph),
    volume: Array.from({ length: 11 }, (_, i) => String(i)),
    direct: ["unset", "hydrogen-only", "chlorine-only", "both", "neither"],
    positive: ["unset", "hydrogen-only", "chlorine-only", "both", "neither"],
  },
  investigation: {
    record: Object.keys(aqueousRecords.investigation),
    observation: [
      "unset",
      "pop-and-relight",
      "bubbles-only",
      "controlled-comparison",
      "several-changes",
    ],
    decision: [
      "unset",
      "hypothesis-supported",
      "identity-not-established",
      "material-effect-comparable",
      "material-effect-not-isolated",
      "bubbles-prove-hydrogen",
    ],
  },
};
export function initialAqueousBoard(mode: AqueousMode): Record<string, string> {
  return Object.fromEntries(
    Object.keys(aqueousChoices[mode]).map((k) => [
      k,
      k === "record"
        ? "initial"
        : k === "volume" || k === "ticks"
          ? "0"
          : "unset",
    ]),
  );
}
export function validAqueousBoard(
  mode: AqueousMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>;
  return (
    Object.keys(b).length === Object.keys(aqueousChoices[mode]).length &&
    Object.entries(aqueousChoices[mode]).every(
      ([k, vs]) => typeof b[k] === "string" && vs.includes(b[k] as string),
    )
  );
}
export function aqueousExpected(
  mode: AqueousMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "reading") {
    const r =
      aqueousRecords.reading[key as keyof typeof aqueousRecords.reading];
    return { ticks: String(r.ticks) };
  }

  if (mode === "cathode") {
    const r =
      aqueousRecords.cathode[key as keyof typeof aqueousRecords.cathode];
    return { product: r.product, reason: r.reason };
  }
  if (mode === "products") {
    const r =
      aqueousRecords.products[key as keyof typeof aqueousRecords.products];
    return { cathode: r.cathode, anode: r.anode };
  }
  if (mode === "transfer") {
    const r =
      aqueousRecords.transfer[key as keyof typeof aqueousRecords.transfer];
    return { anode: r.anode, solution: r.solution };
  }
  if (mode === "graph") {
    const r = aqueousRecords.graph[key as keyof typeof aqueousRecords.graph];
    return { volume: String(r.volume), direct: r.direct, positive: r.positive };
  }
  const r =
    aqueousRecords.investigation[
      key as keyof typeof aqueousRecords.investigation
    ];
  return { observation: r.observation, decision: r.decision };
}
export function aqueousPrediction(
  mode: AqueousMode,
  b: Record<string, string | number>,
) {
  if (!validAqueousBoard(mode, b)) return { complete: false, correct: false };
  const e = aqueousExpected(mode, b),
    complete = Object.keys(e).every((k) => b[k] !== "unset");
  return {
    complete,
    correct: complete && Object.entries(e).every(([k, v]) => b[k] === v),
  };
}
