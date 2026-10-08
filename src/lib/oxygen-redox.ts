export type OxygenMode =
  "oxidation" | "transfer" | "agent" | "mass" | "evidence";
export const oxygenRecords = {
  oxidation: {
    initial: { label: "2Mg + O2 → 2MgO", metal: "Mg", oxygen: 2 },
    aluminium: { label: "4Al + 3O2 → 2Al2O3", metal: "Al", oxygen: 6 },
    copper: { label: "2Cu + O2 → 2CuO", metal: "Cu", oxygen: 2 },
  },
  transfer: {
    initial: {
      label: "2CuO + C → 2Cu + CO2",
      reduced: "CuO",
      oxidised: "C",
      oxygen: 2,
    },
    nickel: {
      label: "NiO + C → Ni + CO",
      reduced: "NiO",
      oxidised: "C",
      oxygen: 1,
    },
    iron: {
      label: "Fe2O3 + 3CO → 2Fe + 3CO2",
      reduced: "Fe2O3",
      oxidised: "CO",
      oxygen: 3,
    },
    aluminium: {
      label: "Fe2O3 + 2Al → 2Fe + Al2O3",
      reduced: "Fe2O3",
      oxidised: "Al",
      oxygen: 3,
    },
  },
  agent: {
    initial: { label: "2CuO + C → 2Cu + CO2", agent: "C", receiver: "C" },
    monoxide: {
      label: "Fe2O3 + 3CO → 2Fe + 3CO2",
      agent: "CO",
      receiver: "CO",
    },
    aluminium: {
      label: "Fe2O3 + 2Al → 2Fe + Al2O3",
      agent: "Al",
      receiver: "Al",
    },
  },
  mass: {
    initial: {
      label: "Open sample: 0.48 g Mg becomes 0.80 g MgO; no solid lost",
      before: 0.48,
      after: 0.8,
      oxygen: 0.32,
      direction: "oxygen-entered",
    },
    copper: {
      label: "Open sample: 1.28 g Cu becomes 1.60 g CuO; no solid lost",
      before: 1.28,
      after: 1.6,
      oxygen: 0.32,
      direction: "oxygen-entered",
    },
    reduction: {
      label:
        "Track only oxide/metal: 1.60 g CuO becomes 1.28 g Cu; oxygen goes into a separate carbon oxide product",
      before: 1.6,
      after: 1.28,
      oxygen: 0.32,
      direction: "oxygen-left-this-sample",
    },
    enclosed: {
      label:
        "Sealed complete apparatus: 30.00 g before and 30.00 g after CuO/carbon reaction; all products retained",
      before: 30,
      after: 30,
      oxygen: 0,
      direction: "internal-transfer-no-total-change",
    },
  },
  evidence: {
    initial: {
      label:
        "CuO + carbon gives identified Cu metal and a carbon oxide under supplied suitable conditions",
      conclusion: "oxide-reduction-supported",
      reason: "metal-formed-oxygen-transferred",
    },
    colourOnly: {
      label:
        "An unknown black powder changes colour on heating; products and composition untested",
      conclusion: "not-enough-evidence",
      reason: "colour-not-product-identification",
    },
    acid: {
      label:
        "CuO + 2HCl → CuCl2 + H2O; supplied copper ions remain Cu2+ in both compounds",
      conclusion: "neutralisation-not-metal-reduction",
      reason: "copper-remains-ion-not-metal",
    },
    noOxygen: {
      label:
        "Zn + CuSO4 → ZnSO4 + Cu; sulfate unchanged, no oxygen gain/loss of either metal",
      conclusion: "oxygen-model-insufficient",
      reason: "broader-electron-redox-separate",
    },
  },
} as const;
export const oxygenChoices: Record<OxygenMode, Record<string, string[]>> = {
  oxidation: {
    record: ["initial", "aluminium", "copper"],
    oxygen: ["unset", "0", "1", "2", "3", "4", "5", "6"],
    change: ["unset", "oxidation", "reduction", "physical-change"],
  },
  transfer: {
    record: ["initial", "nickel", "iron", "aluminium"],
    reduced: ["unset", "CuO", "NiO", "Fe2O3", "C", "CO", "Al"],
    oxidised: ["unset", "C", "CO", "Al", "CuO", "NiO", "Fe2O3"],
    oxygen: ["unset", "0", "1", "2", "3", "4", "5", "6"],
  },
  agent: {
    record: ["initial", "monoxide", "aluminium"],
    agent: ["unset", "C", "CO", "Al", "CuO", "Fe2O3", "Cu"],
    reason: [
      "unset",
      "receives-oxygen-and-is-oxidised",
      "loses-oxygen-and-is-reduced",
      "always-the-metal-product",
    ],
  },
  mass: {
    record: ["initial", "copper", "reduction", "enclosed"],
    oxygen: ["unset", "0", "0.16", "0.32", "0.48", "0.8", "1.28", "1.6"],
    direction: [
      "unset",
      "oxygen-entered",
      "oxygen-left-this-sample",
      "internal-transfer-no-total-change",
      "atoms-destroyed",
      "new-metal-created",
    ],
  },
  evidence: {
    record: ["initial", "colourOnly", "acid", "noOxygen"],
    conclusion: [
      "unset",
      "oxide-reduction-supported",
      "not-enough-evidence",
      "neutralisation-not-metal-reduction",
      "oxygen-model-insufficient",
      "every-oxygen-movement-is-redox",
      "all-oxygen-free-reactions-nonredox",
    ],
    reason: [
      "unset",
      "metal-formed-oxygen-transferred",
      "colour-not-product-identification",
      "copper-remains-ion-not-metal",
      "broader-electron-redox-separate",
      "colour-proves-everything",
    ],
  },
};
export function initialOxygenBoard(mode: OxygenMode): Record<string, string> {
  return Object.fromEntries(
    Object.keys(oxygenChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : "unset",
    ]),
  );
}
export function validOxygenBoard(
  mode: OxygenMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    keys = Object.keys(oxygenChoices[mode]);
  return (
    Object.keys(b).length === keys.length &&
    keys.every(
      (k) =>
        typeof b[k] === "string" &&
        oxygenChoices[mode][k].includes(b[k] as string),
    )
  );
}
export function oxygenExpected(
  mode: OxygenMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "oxidation") {
    const r =
      oxygenRecords.oxidation[key as keyof typeof oxygenRecords.oxidation];
    return { oxygen: String(r.oxygen), change: "oxidation" };
  }
  if (mode === "transfer") {
    const r =
      oxygenRecords.transfer[key as keyof typeof oxygenRecords.transfer];
    return {
      oxygen: String(r.oxygen),
      reduced: r.reduced,
      oxidised: r.oxidised,
    };
  }
  if (mode === "agent") {
    const r = oxygenRecords.agent[key as keyof typeof oxygenRecords.agent];
    return { agent: r.agent, reason: "receives-oxygen-and-is-oxidised" };
  }
  if (mode === "mass") {
    const r = oxygenRecords.mass[key as keyof typeof oxygenRecords.mass];
    return { oxygen: String(r.oxygen), direction: r.direction };
  }
  const r = oxygenRecords.evidence[key as keyof typeof oxygenRecords.evidence];
  return { conclusion: r.conclusion, reason: r.reason };
}
export function oxygenPrediction(
  mode: OxygenMode,
  b: Record<string, string | number>,
) {
  if (!validOxygenBoard(mode, b)) return { complete: false, correct: false };
  const expected = oxygenExpected(mode, b),
    complete = Object.keys(expected).every((k) => b[k] !== "unset");
  return {
    complete,
    correct: complete && Object.entries(expected).every(([k, v]) => b[k] === v),
  };
}
