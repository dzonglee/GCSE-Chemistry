export type ElectrolysisMode =
  "movement" | "conductivity" | "products" | "mixture" | "anode";
export const electrolysisRecords = {
  movement: {
    initial: {
      label:
        "Zn2+ in molten ZnCl2; left electrode negative cathode, right positive anode",
      ion: "Zn2+",
      target: -3,
      name: "cathode",
    },
    chloride: {
      label:
        "Cl− in molten ZnCl2; left electrode negative cathode, right positive anode",
      ion: "Cl−",
      target: 3,
      name: "anode",
    },
    reversed: {
      label:
        "Zn2+ in molten ZnCl2; left electrode positive anode, right negative cathode",
      ion: "Zn2+",
      target: 3,
      name: "cathode",
    },
    bromide: {
      label:
        "Br− in molten PbBr2; left electrode positive anode, right negative cathode",
      ion: "Br−",
      target: -3,
      name: "anode",
    },
  },
  conductivity: {
    initial: {
      label: "Solid sodium chloride: ions present but fixed in the lattice",
      conduction: "not-mobile-ionic",
      carrier: "fixed-ions",
    },
    molten: {
      label: "Molten sodium chloride: ions are free to move",
      conduction: "ionic-electrolyte",
      carrier: "mobile-ions",
    },
    solution: {
      label: "Sodium chloride dissolved in water: mobile dissolved ions",
      conduction: "ionic-electrolyte",
      carrier: "mobile-ions",
    },
    copper: {
      label:
        "Copper connecting wire: metal conducts through delocalised electrons",
      conduction: "metallic-conductor",
      carrier: "mobile-electrons",
    },
    sugar: {
      label:
        "Supplied pure sugar/water sample: molecular solute, no useful ionic conduction in this record",
      conduction: "not-mobile-ionic",
      carrier: "no-supplied-mobile-ions",
    },
  },
  products: {
    initial: {
      label: "Molten ZnCl2 with inert electrodes; no water",
      cathode: "Zn",
      anode: "Cl2",
    },
    lead: {
      label: "Molten PbBr2 with inert electrodes; no water",
      cathode: "Pb",
      anode: "Br2",
    },
    sodium: {
      label: "Molten NaCl with inert electrodes; no water",
      cathode: "Na",
      anode: "Cl2",
    },
    calcium: {
      label: "Molten CaCl2 with inert electrodes; no water",
      cathode: "Ca",
      anode: "Cl2",
    },
    potassium: {
      label: "Molten KBr with inert electrodes; no water",
      cathode: "K",
      anode: "Br2",
    },
  },
  mixture: {
    initial: {
      label:
        "Aluminium oxide dissolved in molten cryolite; compare with needing to melt pure aluminium oxide",
      reason: "lower-operating-temperature",
      energy: "heating-and-current-still-needed",
    },
    carbon: {
      label:
        "Aluminium is above carbon in the supplied reactivity series; choose why carbon reduction is unsuitable",
      reason: "carbon-cannot-reduce-oxide",
      energy: "heating-and-current-still-needed",
    },
    aqueous: {
      label:
        "Aluminium is above hydrogen; a proposed aqueous route gives hydrogen rather than aluminium in the supplied GCSE case",
      reason: "water-competes",
      energy: "not-valid-aluminium-production",
    },
  },
  anode: {
    initial: {
      label:
        "Simplified supplied aluminium cell: oxygen product reacts with carbon anode to form CO2",
      change: "carbon-consumed",
      action: "replace-carbon-anode",
    },
    inert: {
      label:
        "Supplied binary molten salt with genuinely inert electrodes under stated conditions",
      change: "not-consumed-in-this-record",
      action: "no-carbon-oxygen-replacement-reason",
    },
    identity: {
      label:
        "Supplied CO2-forming anode record:12 g carbon combines with32 g oxygen",
      change: "carbon-consumed",
      action: "replace-carbon-anode",
    },
  },
} as const;
export const electrolysisChoices: Record<
  ElectrolysisMode,
  Record<string, string[]>
> = {
  movement: {
    record: Object.keys(electrolysisRecords.movement),
    position: ["-3", "-2", "-1", "0", "1", "2", "3"],
    electrode: ["unset", "cathode", "anode", "container-wall"],
  },
  conductivity: {
    record: Object.keys(electrolysisRecords.conductivity),
    conduction: [
      "unset",
      "not-mobile-ionic",
      "ionic-electrolyte",
      "metallic-conductor",
    ],
    carrier: [
      "unset",
      "fixed-ions",
      "mobile-ions",
      "mobile-electrons",
      "no-supplied-mobile-ions",
    ],
  },
  products: {
    record: Object.keys(electrolysisRecords.products),
    cathode: ["unset", "Zn", "Pb", "Na", "Ca", "K", "H2", "Cl2", "Zn2+"],
    anode: ["unset", "Cl2", "Br2", "O2", "H2", "Cl−", "Zn"],
  },
  mixture: {
    record: Object.keys(electrolysisRecords.mixture),
    reason: [
      "unset",
      "lower-operating-temperature",
      "carbon-cannot-reduce-oxide",
      "water-competes",
      "cryolite-eliminates-current",
      "carbon-is-more-reactive",
    ],
    energy: [
      "unset",
      "heating-and-current-still-needed",
      "not-valid-aluminium-production",
      "no-heating-or-current",
    ],
  },
  anode: {
    record: Object.keys(electrolysisRecords.anode),
    change: [
      "unset",
      "carbon-consumed",
      "not-consumed-in-this-record",
      "carbon-just-melts",
    ],
    action: [
      "unset",
      "replace-carbon-anode",
      "no-carbon-oxygen-replacement-reason",
      "replace-cathode-instead",
    ],
  },
};
export function initialElectrolysisBoard(
  mode: ElectrolysisMode,
): Record<string, string> {
  return Object.fromEntries(
    Object.keys(electrolysisChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : k === "position" ? "0" : "unset",
    ]),
  );
}
export function validElectrolysisBoard(
  mode: ElectrolysisMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>;
  return (
    Object.keys(b).length === Object.keys(electrolysisChoices[mode]).length &&
    Object.entries(electrolysisChoices[mode]).every(
      ([k, vs]) => typeof b[k] === "string" && vs.includes(b[k] as string),
    )
  );
}
export function electrolysisExpected(
  mode: ElectrolysisMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "movement") {
    const r =
      electrolysisRecords.movement[
        key as keyof typeof electrolysisRecords.movement
      ];
    return { position: String(r.target), electrode: r.name };
  }
  if (mode === "conductivity") {
    const r =
      electrolysisRecords.conductivity[
        key as keyof typeof electrolysisRecords.conductivity
      ];
    return { conduction: r.conduction, carrier: r.carrier };
  }
  if (mode === "products") {
    const r =
      electrolysisRecords.products[
        key as keyof typeof electrolysisRecords.products
      ];
    return { cathode: r.cathode, anode: r.anode };
  }
  if (mode === "mixture") {
    const r =
      electrolysisRecords.mixture[
        key as keyof typeof electrolysisRecords.mixture
      ];
    return { reason: r.reason, energy: r.energy };
  }
  const r =
    electrolysisRecords.anode[key as keyof typeof electrolysisRecords.anode];
  return { change: r.change, action: r.action };
}
export function electrolysisPrediction(
  mode: ElectrolysisMode,
  b: Record<string, string | number>,
) {
  if (!validElectrolysisBoard(mode, b))
    return { complete: false, correct: false };
  const e = electrolysisExpected(mode, b),
    complete = Object.keys(e).every((k) => b[k] !== "unset");
  return {
    complete,
    correct: complete && Object.entries(e).every(([k, v]) => b[k] === v),
  };
}
