/** Individually reviewed lesson62 model: supplied school data, not universal electrode potentials. */
export type CellsMode =
  "setup" | "series" | "restore" | "reaction" | "compare" | "evidence";
export const cellsRecords = {
  setup: {
    initial: {
      label:
        "Matched copper/zinc plates in sodium chloride solution. The supplied school reading is 1.10 V; distilled water gives negligible output in this simplified comparison.",
      left: "copper",
      right: "zinc",
      liquid: "sodium-chloride",
      volts: 1.1,
    },
    identical: {
      label:
        "Two matching copper plates, same electrolyte conditions at each plate, no concentration or temperature gradient. Predict their reading.",
      left: "copper",
      right: "copper",
      liquid: "sodium-chloride",
      volts: 0,
    },
    magnesium: {
      label:
        "Fixed copper and variable electrodeX in matched copper sulfate solution. Supplied measured magnitudes: Mg 2.71 V, Zn 1.10 V, Co 0.62 V. Construct the largest measured output.",
      left: "copper",
      right: "magnesium",
      liquid: "copper-sulfate",
      volts: 2.71,
    },
    cobalt: {
      label:
        "Same supplied copper sulfate comparison: construct the smallest non-zero measured output, using fixed copper and Co 0.62 V, Zn 1.10 V or Mg 2.71 V.",
      left: "copper",
      right: "cobalt",
      liquid: "copper-sulfate",
      volts: 0.62,
    },
    water: {
      label:
        "Copper and zinc with the supplied distilled-water comparison: the source records negligible output, represented as 0 V in this simplified model. This does not describe all water samples.",
      left: "copper",
      right: "zinc",
      liquid: "distilled-water",
      volts: 0,
    },
  },
  series: {
    initial: {
      label:
        "Construct 12 V from identical supplied 1.5 V cells in an ideal series circuit, all facing the same direction.",
      cell: 1.5,
      count: 8,
      reversed: 0,
      volts: 12,
    },
    six: {
      label:
        "Construct 6 V from supplied 1.5 V cells in an ideal series circuit, all facing the same direction.",
      cell: 1.5,
      count: 4,
      reversed: 0,
      volts: 6,
    },
    decimal: {
      label:
        "Construct 7.2 V from supplied 1.2 V cells in an ideal series circuit, all facing the same direction.",
      cell: 1.2,
      count: 6,
      reversed: 0,
      volts: 7.2,
    },
    oppose: {
      label:
        "Use exactly four supplied 1.5 V series cells. One faces the opposite direction. Predict the signed voltage in the reference direction.",
      cell: 1.5,
      count: 4,
      reversed: 1,
      volts: 3,
    },
    cancel: {
      label:
        "Use exactly four supplied 1.5 V series cells; two face the opposite direction. Predict the signed net voltage.",
      cell: 1.5,
      count: 4,
      reversed: 2,
      volts: 0,
    },
  },
  restore: {
    initial: {
      label:
        "A specified primary alkaline cell has used up a reactant. Choose the appropriate way to restore the device's power.",
      action: "replace-cell",
      reason: "primary-not-designed-to-reverse",
    },
    secondary: {
      label:
        "A supplied rechargeable cell is discharged, undamaged and within its rated life. Choose the stated source-restoration mechanism.",
      action: "external-electrical-supply",
      reason: "reverse-cell-reactions",
    },
    hydrogen: {
      label:
        "A working hydrogen fuel-cell system has oxygen and an intact external circuit, but its hydrogen feed has stopped.",
      action: "restore-hydrogen-feed",
      reason: "continual-reactant-supply",
    },
    oxygen: {
      label:
        "A working hydrogen fuel-cell system has hydrogen and an intact external circuit, but its oxygen feed has stopped.",
      action: "restore-oxygen-feed",
      reason: "both-reactants-needed",
    },
    open: {
      label:
        "A supplied chemical cell retains a measured potential difference, but the external load circuit is open. Restore current through the load.",
      action: "close-load-circuit",
      reason: "voltage-does-not-guarantee-current",
    },
  },
  reaction: {
    initial: {
      label:
        "Construct the smallest whole-number overall hydrogen–oxygen fuel-cell equation. The only new chemical product is water.",
      hydrogen: 2,
      oxygen: 1,
      water: 2,
    },
    doubled: {
      label:
        "Use exactly 2 O₂ in a balanced whole-number overall fuel-cell equation; choose matching H₂ and H₂O coefficients.",
      hydrogen: 4,
      oxygen: 2,
      water: 4,
    },
    tripled: {
      label:
        "Use exactly 6 H₂ in a balanced overall fuel-cell equation; choose matching O₂ and H₂O coefficients.",
      hydrogen: 6,
      oxygen: 3,
      water: 6,
    },
  },
  compare: {
    initial: {
      label:
        "Required: 400 km without a stop and restoration within 10 min. Both compatible supplies are available. Cost is secondary. Use the original fleet data below.",
      source: "fuel-cell",
      evidence: "fuel-meets-both-limits",
      reason: "battery-fails-range-and-time",
    },
    short: {
      label:
        "Required: 200 km, overnight restoration allowed. Both compatible supplies are available. Minimise the stated trip-energy cost using the original data below.",
      source: "rechargeable",
      evidence: "battery-meets-range-and-cheaper",
      reason: "both-have-time-and-infrastructure",
    },
    infrastructure: {
      label:
        "Required: 200 km, overnight restoration allowed. Compatible chargers are available; no hydrogen station or delivery is available. Use the original data below.",
      source: "rechargeable",
      evidence: "battery-has-local-supply",
      reason: "fuel-feed-unavailable",
    },
    neither: {
      label:
        "Required: 500 km without a stop. No range extension or intermediate supply is permitted. Use the original data below.",
      source: "neither",
      evidence: "both-below-required-range",
      reason: "must-meet-stated-constraint",
    },
  },
  evidence: {
    initial: {
      label:
        "A hydrogen–oxygen fuel cell is operating normally. Judge the new chemical product, rather than every substance leaving its air-fed outlet.",
      claim: "water-only-new-product",
      reason: "hydrogen-and-oxygen-form-water",
    },
    fossil: {
      label:
        "The supplied hydrogen is produced using fossil feedstock and a process releasing carbon dioxide. Judge the claim that the whole system is automatically carbon-free.",
      claim: "lifecycle-not-carbon-free",
      reason: "production-emissions-count",
    },
    renewable: {
      label:
        "Hydrogen is produced by water electrolysis powered by specified renewable electricity. The source provides no manufacturing or transport-emission inventory.",
      claim: "production-can-use-renewable-energy",
      reason: "full-lifecycle-not-established",
    },
    controls: {
      label:
        "Compare variable metalX with fixed copper in copper sulfate solution; measure voltage. Select valid controls.",
      claim: "match-solution-concentration-temperature",
      reason: "metal-varied-voltage-measured",
    },
    carriers: {
      label:
        "A simple cell supplies a closed external circuit and contains an ion-conducting electrolyte. Distinguish the charge carriers.",
      claim: "wire-electrons-electrolyte-ions",
      reason: "different-conduction-paths",
    },
    durability: {
      label:
        "Hydrogen and oxygen can be replenished continuously. A supplier nevertheless specifies a finite service life for the fuel-cell stack.",
      claim: "feeds-do-not-imply-infinite-life",
      reason: "components-can-degrade",
    },
  },
} as const;
export const cellsOptions: Record<
  CellsMode,
  Record<string, readonly string[]>
> = {
  setup: {
    record: Object.keys(cellsRecords.setup),
    left: ["unset", "copper", "zinc", "magnesium", "cobalt"],
    right: ["unset", "copper", "zinc", "magnesium", "cobalt"],
    liquid: ["unset", "sodium-chloride", "copper-sulfate", "distilled-water"],
  },
  series: {
    record: Object.keys(cellsRecords.series),
    connection: ["unset", "series", "parallel", "unconnected"],
  },
  restore: {
    record: Object.keys(cellsRecords.restore),
    action: [
      "unset",
      ...Object.values(cellsRecords.restore).map((r) => r.action),
      "add-water",
      "create-reactants-from-nothing",
    ],
    reason: [
      "unset",
      ...Object.values(cellsRecords.restore).map((r) => r.reason),
      "all-cells-refuel",
      "no-chemical-change",
    ],
  },
  reaction: { record: Object.keys(cellsRecords.reaction) },
  compare: {
    record: Object.keys(cellsRecords.compare),
    source: ["unset", "fuel-cell", "rechargeable", "neither"],
    evidence: [
      "unset",
      ...Object.values(cellsRecords.compare).map((r) => r.evidence),
      "fuel-always-best",
    ],
    reason: [
      "unset",
      ...Object.values(cellsRecords.compare).map((r) => r.reason),
      "ignore-constraints",
    ],
  },
  evidence: {
    record: Object.keys(cellsRecords.evidence),
    claim: [
      "unset",
      ...Object.values(cellsRecords.evidence).map((r) => r.claim),
      "all-outlet-gases-water",
      "no-emissions-ever",
      "voltage-is-current",
    ],
    reason: [
      "unset",
      ...Object.values(cellsRecords.evidence).map((r) => r.reason),
      "electricity-creates-elements",
      "hydrogen-always-renewable",
    ],
  },
};
const numeric: Record<CellsMode, readonly string[]> = {
  setup: ["volts"],
  series: ["count", "reversed", "volts"],
  restore: [],
  reaction: ["hydrogen", "oxygen", "water"],
  compare: [],
  evidence: [],
};
export function initialCellsBoard(
  mode: CellsMode,
  record = "initial",
): Record<string, string> {
  if (!cellsOptions[mode].record.includes(record))
    throw Error("Unknown cells record");
  return Object.fromEntries([
    ...Object.keys(cellsOptions[mode]).map((k) => [
      k,
      k === "record" ? record : "unset",
    ]),
    ...numeric[mode].map((k) => [k, "0"]),
  ]);
}
export function validCellsNumber(s: unknown): s is string {
  return (
    typeof s === "string" &&
    /^-?(?:0|[1-9]\d*)(?:\.\d{1,3})?$/.test(s) &&
    s !== "-0" &&
    Math.abs(Number(s)) <= 10000
  );
}
export function validCellsBoard(
  mode: CellsMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  return (
    Object.keys(v).length === Object.keys(initialCellsBoard(mode)).length &&
    Object.entries(cellsOptions[mode]).every(
      ([k, opts]) => typeof v[k] === "string" && opts.includes(v[k] as string),
    ) &&
    numeric[mode].every((k) => validCellsNumber(v[k]))
  );
}
export function cellsPrediction(
  mode: CellsMode,
  b: Record<string, string | number>,
) {
  if (!validCellsBoard(mode, b))
    return {
      correct: false,
      explanation:
        "Complete your prediction using the supplied conditions and data.",
    };
  const r = (cellsRecords[mode] as Record<string, Record<string, unknown>>)[
    b.record
  ];
  const equal = (k: string) =>
    typeof r[k] === "number"
      ? Math.abs(Number(b[k]) - Number(r[k])) < 1e-7
      : b[k] === r[k];
  const fields: Record<CellsMode, string[]> = {
    setup: ["left", "right", "liquid", "volts"],
    series: ["count", "reversed", "volts"],
    restore: ["action", "reason"],
    reaction: ["hydrogen", "oxygen", "water"],
    compare: ["source", "evidence", "reason"],
    evidence: ["claim", "reason"],
  };
  const explanations: Record<CellsMode, string> = {
    setup:
      "This is a supplied comparison under stated conditions, not a universal voltage derived from a reactivity rank.",
    series:
      "Series connection matters: forward contributions add and reversed contributions subtract. Parallel connections do not add voltages in series. This ideal comparison does not predict real load current or capacity.",
    restore:
      "Match the restoration mechanism to the stated source and fault. This model does not give unsupervised practical instructions.",
    reaction:
      "Keep formulas fixed and use the requested coefficient scale. The smallest whole-number ratio is 2:1:2; proportional multiples conserve atoms too. This is the overall electrochemical reaction.",
    compare:
      "Meet the required use before applying secondary priorities. The judgement depends on these original data and stated conditions.",
    evidence:
      "Use the stated chemical conditions and evidence; do not extend the conclusion beyond them.",
  };
  const specific: Partial<Record<CellsMode, Record<string, string>>> = {
    restore: {
      initial:
        "A reactant in this specified primary cell is depleted. Replace the cell: it is not designed for electrical reversal and reuse.",
      secondary:
        "Use the specified external electrical supply to drive the reverse reactions and restore the rechargeable cell's reactants.",
      hydrogen:
        "Restore the missing hydrogen feed. Oxygen alone cannot sustain the hydrogen–oxygen reaction.",
      oxygen:
        "Restore the missing oxygen feed. Hydrogen alone cannot sustain the hydrogen–oxygen reaction.",
      open: "Complete the external load circuit. The measured potential difference does not by itself establish a current through an open load circuit.",
    },
    compare: {
      initial:
        "The fuel system meets both limits: 450 km ≥ 400 km and 5 min ≤ 10 min. The battery fails with 300 km and 40 min; its lower cost does not overcome those requirements.",
      short:
        "Both sources meet 200 km and have time and compatible supplies. Choose the battery for the stated cost priority: £9 < £60.",
      infrastructure:
        "The battery meets 200 km and has a compatible local charger. The fuel system cannot be restored locally without its hydrogen supply.",
      neither:
        "Neither meets 500 km without a stop: 450 km and 300 km are both below the required range.",
    },
    evidence: {
      initial:
        "Hydrogen and oxygen form water as the only new chemical product. Unused inlet gases can also leave an air-fed outlet without becoming new products.",
      fossil:
        "The supplied hydrogen-production process releases carbon dioxide, so this full system is not carbon-free even though the cell reaction forms water.",
      renewable:
        "The specified electrolysis uses renewable electricity. Manufacturing and transport impacts are unreported, so a carbon-free full lifecycle is not established.",
      controls:
        "Match solution concentration and solution temperature while comparing metalX against fixed copper. MetalX is varied and voltage is measured; neither is a control for this comparison.",
      carriers:
        "Electrons carry charge in the external metal wire; ions carry charge through the electrolyte. These are distinct conduction paths.",
      durability:
        "Replenished reactants can sustain the reaction, but components can still degrade. The specified finite stack life is compatible with continuing feeds.",
    },
  };
  let detail = specific[mode]?.[b.record] ?? "";
  if (mode === "setup") {
    const data =
      cellsRecords.setup[b.record as keyof typeof cellsRecords.setup];
    detail = `The supplied ${data.left}/${data.right} comparison in ${data.liquid.replaceAll("-", " ")} gives ${data.volts} V.`;
    if (b.record === "identical")
      detail +=
        " The matching identical plates have no difference in the specified equal conditions.";
    if (b.record === "water")
      detail +=
        " This simplified low-conductivity distilled-water case does not describe all water samples.";
  }
  if (mode === "series") {
    const data =
      cellsRecords.series[b.record as keyof typeof cellsRecords.series];
    detail = `Use ${data.count} cells in series, with ${data.reversed} reversed: (${data.count} − 2 × ${data.reversed}) × ${data.cell} V = ${data.volts} V in the reference direction.`;
  }
  if (mode === "reaction") {
    const data =
      cellsRecords.reaction[b.record as keyof typeof cellsRecords.reaction];
    detail = `${data.hydrogen}H₂ + ${data.oxygen}O₂ → ${data.water}H₂O gives ${2 * data.hydrogen} H and ${2 * data.oxygen} O atoms on each side.`;
  }
  return {
    correct:
      fields[mode].every(equal) &&
      (mode !== "series" || b.connection === "series"),
    explanation: detail + " " + explanations[mode],
  };
}
export function cellsHistoryStep(mode: CellsMode, a: unknown, b: unknown) {
  if (!validCellsBoard(mode, a) || !validCellsBoard(mode, b)) return false;
  if (a.record !== b.record) {
    const initial = initialCellsBoard(mode, b.record);
    return Object.keys(initial).every((k) => b[k] === initial[k]);
  }
  return Object.keys(a).filter((k) => a[k] !== b[k]).length === 1;
}
