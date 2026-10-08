import { balance } from "./half-equations";
export type FuelHalfMode =
  "construct" | "combine" | "path" | "diagnose" | "evidence";
export const fuelHalfRecords = {
  construct: {
    initial: {
      label:
        "Supplied acidic fuel cell: oxidise exactly one H₂ at the negative hydrogen anode. Keep H₂, H⁺ and e⁻ fixed.",
      kind: "hydrogen",
      a: 1,
      b: 2,
      c: 2,
      d: 0,
      electronSide: "right",
      process: "oxidation",
      electrode: "negative-anode",
    },
    oxygen: {
      label:
        "Supplied acidic fuel cell: reduce exactly one O₂ at the positive oxygen cathode. Keep O₂, H⁺, e⁻ and H₂O fixed.",
      kind: "oxygen",
      a: 1,
      b: 4,
      c: 4,
      d: 2,
      electronSide: "left",
      process: "reduction",
      electrode: "positive-cathode",
    },
    hydrogenDouble: {
      label:
        "Supplied acidic fuel cell: oxidise exactly two H₂ at the negative hydrogen anode. Balance every term at this specified scale.",
      kind: "hydrogen",
      a: 2,
      b: 4,
      c: 4,
      d: 0,
      electronSide: "right",
      process: "oxidation",
      electrode: "negative-anode",
    },
    oxygenDouble: {
      label:
        "Supplied acidic fuel cell: reduce exactly two O₂ at the positive oxygen cathode. Balance every term at this specified scale.",
      kind: "oxygen",
      a: 2,
      b: 8,
      c: 8,
      d: 4,
      electronSide: "left",
      process: "reduction",
      electrode: "positive-cathode",
    },
  },
  combine: {
    initial: {
      label:
        "Combine H₂→2H⁺+2e⁻ with O₂+4H⁺+4e⁻→2H₂O. Use the smallest positive multipliers, then retain the combined scale.",
      hBase: 1,
      oBase: 1,
      hMultiplier: 2,
      oMultiplier: 1,
      electrons: 4,
      protons: 4,
      hydrogen: 2,
      oxygen: 1,
      water: 2,
    },
    matched: {
      label:
        "Combine 2H₂→4H⁺+4e⁻ with O₂+4H⁺+4e⁻→2H₂O. These supplied electron counts already match. Use the smallest positive multipliers.",
      hBase: 2,
      oBase: 1,
      hMultiplier: 1,
      oMultiplier: 1,
      electrons: 4,
      protons: 4,
      hydrogen: 2,
      oxygen: 1,
      water: 2,
    },
    oxygenDouble: {
      label:
        "Combine H₂→2H⁺+2e⁻ with 2O₂+8H⁺+8e⁻→4H₂O. Use the smallest positive multipliers; retain the resulting combined scale rather than reducing it afterwards.",
      hBase: 1,
      oBase: 2,
      hMultiplier: 4,
      oMultiplier: 1,
      electrons: 8,
      protons: 8,
      hydrogen: 4,
      oxygen: 2,
      water: 4,
    },
    unequal: {
      label:
        "Combine 3H₂→6H⁺+6e⁻ with O₂+4H⁺+4e⁻→2H₂O. Use the smallest positive multipliers; retain the resulting combined scale.",
      hBase: 3,
      oBase: 1,
      hMultiplier: 2,
      oMultiplier: 3,
      electrons: 12,
      protons: 12,
      hydrogen: 6,
      oxygen: 3,
      water: 6,
    },
  },
  path: {
    initial: {
      label:
        "Propose the electron route in the supplied discharging acidic fuel cell. Hydrogen is oxidised at the anode; oxygen is reduced at the cathode.",
      carrier: "electrons",
      path: "external-wire",
      direction: "hydrogen-to-oxygen",
      hydrogenSign: "negative",
      oxygenSign: "positive",
    },
    proton: {
      label:
        "Propose the H⁺ route in the supplied acidic, proton-conducting fuel-cell account. Do not send electrons through its electrolyte.",
      carrier: "protons",
      path: "electrolyte",
      direction: "hydrogen-to-oxygen",
      hydrogenSign: "negative",
      oxygenSign: "positive",
    },
    conventional: {
      label:
        "Propose the direction of conventional current in the external wire of this discharging cell. This is a positive-charge convention, opposite to electron flow—not actual protons moving through the metal.",
      carrier: "conventional-positive-direction",
      path: "external-wire",
      direction: "oxygen-to-hydrogen",
      hydrogenSign: "negative",
      oxygenSign: "positive",
    },
  },
  diagnose: {
    initial: {
      label:
        "At the stated hydrogen-oxidation electrode, a student writes H₂→2H⁺+e⁻. Diagnose the proposed half equation.",
      left: [{ species: "H2", coefficient: 1 }],
      right: [
        { species: "H1", coefficient: 2 },
        { species: "electron", coefficient: 1 },
      ],
      claim: "charge-mismatch",
      reason: "electron-count-does-not-balance-charge",
      leftCharge: 0,
      rightCharge: 1,
    },
    oxygenCharge: {
      label:
        "At the stated oxygen-reduction electrode, a student writes O₂+4H⁺+2e⁻→2H₂O. Diagnose it.",
      left: [
        { species: "O2", coefficient: 1 },
        { species: "H1", coefficient: 4 },
        { species: "electron", coefficient: 2 },
      ],
      right: [{ species: "water", coefficient: 2 }],
      claim: "charge-mismatch",
      reason: "electron-count-does-not-balance-charge",
      leftCharge: 2,
      rightCharge: 0,
    },
    hydrogenAtoms: {
      label:
        "At the stated hydrogen-oxidation electrode, a student writes H₂→H⁺+e⁻. Diagnose it.",
      left: [{ species: "H2", coefficient: 1 }],
      right: [
        { species: "H1", coefficient: 1 },
        { species: "electron", coefficient: 1 },
      ],
      claim: "atom-mismatch",
      reason: "fixed-formula-atom-counts-differ",
      leftCharge: 0,
      rightCharge: 0,
    },
    reversed: {
      label:
        "For the fuel cell's stated hydrogen-oxidation electrode, a student writes 2H⁺+2e⁻→H₂. Decide whether balancing alone makes this correct for that electrode.",
      left: [
        { species: "H1", coefficient: 2 },
        { species: "electron", coefficient: 2 },
      ],
      right: [{ species: "H2", coefficient: 1 }],
      claim: "balanced-wrong-process",
      reason: "reduction-not-stated-hydrogen-oxidation",
      leftCharge: 0,
      rightCharge: 0,
    },
    waterAtoms: {
      label:
        "At the stated oxygen-reduction electrode, a student writes O₂+4H⁺+4e⁻→4H₂O. Diagnose it.",
      left: [
        { species: "O2", coefficient: 1 },
        { species: "H1", coefficient: 4 },
        { species: "electron", coefficient: 4 },
      ],
      right: [{ species: "water", coefficient: 4 }],
      claim: "atom-mismatch",
      reason: "fixed-formula-atom-counts-differ",
      leftCharge: 0,
      rightCharge: 0,
    },
    wrongSide: {
      label:
        "At the stated hydrogen-oxidation electrode, a student writes H₂+2e⁻→2H⁺. Diagnose its atom and charge inventories.",
      left: [
        { species: "H2", coefficient: 1 },
        { species: "electron", coefficient: 2 },
      ],
      right: [{ species: "H1", coefficient: 2 }],
      claim: "charge-mismatch",
      reason: "electrons-on-wrong-side-for-oxidation",
      leftCharge: -2,
      rightCharge: 2,
    },
  },
  evidence: {
    initial: {
      label:
        "Judge how an electron contributes to the H/O/charge ledger in these half equations.",
      claim: "minus-one-charge-no-h-or-o-atoms",
      reason: "electron-is-not-a-hydrogen-or-oxygen-nucleus",
    },
    scale: {
      label:
        "A hydrogen half equation needs doubling to match the oxygen half equation's electron count.",
      claim: "multiply-every-term-on-both-sides",
      reason: "preserve-atoms-charge-and-reaction-ratio",
    },
    cancel: {
      label:
        "After correctly matching and adding the acidic half equations, H⁺ and e⁻ have equal coefficients on opposite sides.",
      claim: "cancel-equal-identical-opposite-terms",
      reason: "no-net-consumption-of-these-shared-terms",
    },
    net: {
      label:
        "Judge the overall equation obtained after cancelling matched H⁺ and e⁻ terms.",
      claim: "hydrogen-and-oxygen-form-water",
      reason:
        "electron-transfer-does-not-leave-net-electrons-in-overall-equation",
    },
    sign: {
      label:
        "Hydrogen is oxidised at the negative anode in this discharging fuel cell. Compare the word anode with its use in electrolysis.",
      claim: "anode-means-oxidation-sign-depends-on-cell",
      reason: "electrolysis-positive-anode-is-not-a-universal-sign-rule",
    },
    conditions: {
      label:
        "The stated fuel-cell account is acidic and proton-conducting. Decide what its half equations describe.",
      claim: "use-the-supplied-acidic-species",
      reason: "different-electrolyte-accounts-must-not-be-mixed",
    },
  },
} as const;
export const fuelHalfOptions: Record<
  FuelHalfMode,
  Record<string, readonly string[]>
> = {
  construct: {
    record: Object.keys(fuelHalfRecords.construct),
    electronSide: ["unset", "left", "right"],
    process: ["unset", "oxidation", "reduction"],
    electrode: [
      "unset",
      "negative-anode",
      "positive-cathode",
      "positive-anode",
      "negative-cathode",
    ],
  },
  combine: {
    record: Object.keys(fuelHalfRecords.combine),
    cancel: [
      "unset",
      "electrons-and-protons",
      "electrons-only",
      "water-only",
      "all-substances",
    ],
  },
  path: {
    record: Object.keys(fuelHalfRecords.path),
    carrier: [
      "unset",
      "electrons",
      "protons",
      "conventional-positive-direction",
      "neutral-hydrogen",
    ],
    path: ["unset", "external-wire", "electrolyte", "gas-inlet"],
    direction: ["unset", "hydrogen-to-oxygen", "oxygen-to-hydrogen"],
    hydrogenSign: ["unset", "negative", "positive"],
    oxygenSign: ["unset", "negative", "positive"],
  },
  diagnose: {
    record: Object.keys(fuelHalfRecords.diagnose),
    claim: [
      "unset",
      "charge-mismatch",
      "atom-mismatch",
      "balanced-wrong-process",
      "fully-correct-for-stated-electrode",
    ],
    reason: [
      "unset",
      ...new Set(Object.values(fuelHalfRecords.diagnose).map((r) => r.reason)),
      "balanced-atoms-always-enough",
    ],
  },
  evidence: {
    record: Object.keys(fuelHalfRecords.evidence),
    claim: [
      "unset",
      ...Object.values(fuelHalfRecords.evidence).map((r) => r.claim),
      "electrons-are-hydrogen-atoms",
      "anode-always-positive",
    ],
    reason: [
      "unset",
      ...Object.values(fuelHalfRecords.evidence).map((r) => r.reason),
      "charge-can-be-ignored",
      "delete-any-unwanted-substance",
    ],
  },
};
const numeric: Record<FuelHalfMode, readonly string[]> = {
  construct: ["a", "b", "c", "d", "leftCharge", "rightCharge"],
  combine: [
    "hMultiplier",
    "oMultiplier",
    "electrons",
    "protons",
    "hydrogen",
    "oxygen",
    "water",
  ],
  path: [],
  diagnose: ["leftCharge", "rightCharge"],
  evidence: [],
};
export function initialFuelHalfBoard(
  mode: FuelHalfMode,
  record = "initial",
): Record<string, string> {
  if (!fuelHalfOptions[mode].record.includes(record))
    throw Error("Unknown supplied fuel-half record");
  return Object.fromEntries([
    ...Object.keys(fuelHalfOptions[mode]).map((k) => [
      k,
      k === "record" ? record : "unset",
    ]),
    ...numeric[mode].map((k) => [k, "0"]),
  ]);
}
export function validFuelHalfNumber(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^-?(?:0|[1-9]\d*)(?:\.\d{1,3})?$/.test(v) &&
    v !== "-0" &&
    Math.abs(Number(v)) <= 10000
  );
}
export function validFuelHalfBoard(
  mode: FuelHalfMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  return (
    Object.keys(v).length === Object.keys(initialFuelHalfBoard(mode)).length &&
    Object.entries(fuelHalfOptions[mode]).every(
      ([k, opts]) => typeof v[k] === "string" && opts.includes(v[k] as string),
    ) &&
    numeric[mode].every((k) => validFuelHalfNumber(v[k]))
  );
}
export function fuelConstructionLedger(
  record: string,
  b: Record<string, string | number>,
) {
  const r =
    fuelHalfRecords.construct[record as keyof typeof fuelHalfRecords.construct];
  const left: { species: string; coefficient: number }[] = [],
    right: { species: string; coefficient: number }[] = [];
  if (r.kind === "hydrogen") {
    left.push({ species: "H2", coefficient: Number(b.a) });
    right.push({ species: "H1", coefficient: Number(b.b) });
  } else {
    left.push(
      { species: "O2", coefficient: Number(b.a) },
      { species: "H1", coefficient: Number(b.b) },
    );
    right.push({ species: "water", coefficient: Number(b.d) });
  }
  if (b.electronSide === "left")
    left.push({ species: "electron", coefficient: Number(b.c) });
  if (b.electronSide === "right")
    right.push({ species: "electron", coefficient: Number(b.c) });
  return balance(left, right);
}
export function fuelCombinationLedger(
  record: string,
  b: Record<string, string | number>,
) {
  const r =
      fuelHalfRecords.combine[record as keyof typeof fuelHalfRecords.combine],
    h = r.hBase * Number(b.hMultiplier),
    o = r.oBase * Number(b.oMultiplier);
  return {
    hydrogen: h,
    oxygen: o,
    water: 2 * o,
    protonsLeft: 4 * o,
    protonsRight: 2 * h,
    electronsLeft: 4 * o,
    electronsRight: 2 * h,
    remainingProtonsLeft: 4 * o - Number(b.protons),
    remainingProtonsRight: 2 * h - Number(b.protons),
    remainingElectronsLeft: 4 * o - Number(b.electrons),
    remainingElectronsRight: 2 * h - Number(b.electrons),
  };
}
export function fuelHalfPrediction(
  mode: FuelHalfMode,
  b: Record<string, string | number>,
) {
  if (!validFuelHalfBoard(mode, b))
    return {
      correct: false,
      explanation:
        "Complete your prediction using the supplied acidic-cell conditions.",
    };
  const r = (fuelHalfRecords[mode] as Record<string, Record<string, unknown>>)[
    b.record
  ];
  const eq = (k: string) =>
    typeof r[k] === "number"
      ? Math.abs(Number(b[k]) - Number(r[k])) < 1e-7
      : b[k] === r[k];
  if (mode === "construct") {
    const ledger = fuelConstructionLedger(b.record, b);
    return {
      correct:
        ["a", "b", "c", "d", "electronSide", "process", "electrode"].every(
          eq,
        ) &&
        Number(b.leftCharge) === ledger.left.charge &&
        Number(b.rightCharge) === ledger.right.charge &&
        ledger.atoms &&
        ledger.charge,
      explanation:
        r.kind === "hydrogen"
          ? "Hydrogen loses electrons: H₂→2H⁺+2e⁻, scaled together when required. H atoms match; positive-ion charge and negative-electron charge sum to zero. This is oxidation at the supplied discharging fuel cell's negative anode."
          : "Oxygen gains electrons: O₂+4H⁺+4e⁻→2H₂O, scaled together when required. Both H/O inventories and total charge match. This is reduction at the supplied fuel cell's positive cathode.",
    };
  }
  if (mode === "combine")
    return {
      correct:
        [
          "hMultiplier",
          "oMultiplier",
          "electrons",
          "protons",
          "hydrogen",
          "oxygen",
          "water",
        ].every(eq) && b.cancel === "electrons-and-protons",
      explanation: `For this supplied pair, multiply the hydrogen half by ${r.hMultiplier} and the oxygen half by ${r.oMultiplier}. Both then transfer ${r.electrons} electrons; equal ${r.protons}H⁺ also occur on opposite sides. Cancel only those matched terms. Retain the requested combined scale: ${r.hydrogen}H₂ + ${r.oxygen}O₂ → ${r.water}H₂O. Cancellation is net accounting, not destruction of atoms or charge.`,
    };
  if (mode === "path")
    return {
      correct: [
        "carrier",
        "path",
        "direction",
        "hydrogenSign",
        "oxygenSign",
      ].every(eq),
      explanation:
        b.record === "conventional"
          ? "Conventional current in the external wire is defined opposite to electron flow, from positive oxygen cathode towards negative hydrogen anode. It does not mean actual protons travel through the metal wire."
          : b.record === "proton"
            ? "In this supplied acidic account H⁺ is produced at the negative hydrogen anode and consumed at the positive oxygen cathode. It travels through the proton-conducting electrolyte; electrons use the external circuit."
            : "Hydrogen oxidation supplies electrons at the negative anode; oxygen reduction consumes them at the positive cathode. Electrons travel through the external wire from hydrogen to oxygen, not through the proton-conducting electrolyte.",
    };
  if (mode === "diagnose")
    return {
      correct: ["claim", "reason", "leftCharge", "rightCharge"].every(eq),
      explanation: `The proposed equation has total charge ${r.leftCharge} on the left and ${r.rightCharge} on the right. ${b.record === "reversed" ? "Both atoms and charge balance, but electrons are consumed: this is reduction, not the required hydrogen oxidation." : b.record === "hydrogenAtoms" ? "Charge balances, but there are two H atoms on the left and only one on the right." : b.record === "waterAtoms" ? "Charge balances, but H counts are 4 versus 8 and O counts are 2 versus 4; the water coefficient is wrong." : b.record === "wrongSide" ? "H atom counts match, but placing electrons on the reactant side makes charge −2 versus +2 and cannot describe the required hydrogen electron loss." : b.record === "oxygenCharge" ? "H/O atom counts match, but only two electrons offset four H⁺: left charge is +2, whereas neutral water has charge 0." : "H atom counts match, but one electron offsets only one unit of the two H⁺ ions' +2 charge. Two product electrons are needed for neutral H₂'s charge 0."}`,
    };
  return {
    correct: ["claim", "reason"].every(eq),
    explanation:
      b.record === "initial"
        ? "Each electron contributes −1 charge and no hydrogen or oxygen atoms. Balance its charge separately from the fixed formulas' atom counts."
        : b.record === "sign"
          ? "Anode identifies oxidation. It is negative in this supplied discharging fuel cell and positive in the earlier electrolysis account; electrode sign is contextual."
          : b.record === "conditions"
            ? "The supplied account uses H⁺ under acidic conditions. Do not mix it with a different electrolyte's species while retaining its half-equation coefficients."
            : b.record === "scale"
              ? "Scale all chemical and electron terms on both sides together. Changing only the electron count breaks the half equation's charge balance."
              : b.record === "cancel"
                ? "Cancel only equal amounts of the same species on opposite sides after the electron counts match. One-sided water cannot simply be deleted."
                : "Matched acidic half equations give 2H₂+O₂→2H₂O after H⁺ and e⁻ cancel. Internal electron transfer drives the external circuit without leaving electrons as net chemical products.",
  };
}
export function fuelHalfHistoryStep(
  mode: FuelHalfMode,
  a: unknown,
  b: unknown,
) {
  if (!validFuelHalfBoard(mode, a) || !validFuelHalfBoard(mode, b))
    return false;
  if (a.record !== b.record) {
    const reset = initialFuelHalfBoard(mode, b.record);
    return Object.keys(reset).every((k) => b[k] === reset[k]);
  }
  return Object.keys(a).filter((k) => a[k] !== b[k]).length === 1;
}
