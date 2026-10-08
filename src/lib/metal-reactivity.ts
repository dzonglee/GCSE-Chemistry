export type MetalMode =
  "series" | "observations" | "displacement" | "evidence" | "fair";
/** Ordinal GCSE reference only; gaps have no quantitative meaning. */
export const reactivityReference = [
  "K",
  "Na",
  "Li",
  "Ca",
  "Mg",
  "Al",
  "C",
  "Zn",
  "Fe",
  "H",
  "Cu",
  "Ag",
  "Au",
] as const;
export type ReactiveSpecies = (typeof reactivityReference)[number];
export function moreReactive(a: ReactiveSpecies, b: ReactiveSpecies) {
  if (!reactivityReference.includes(a) || !reactivityReference.includes(b))
    throw Error("Use a listed species");
  return reactivityReference.indexOf(a) < reactivityReference.indexOf(b);
}
export function metalDisplacement(
  added: "Zn" | "Mg" | "Fe" | "Cu",
  dissolved: "Zn" | "Mg" | "Fe" | "Cu",
) {
  if (
    !["Zn", "Mg", "Fe", "Cu"].includes(added) ||
    !["Zn", "Mg", "Fe", "Cu"].includes(dissolved)
  )
    throw Error("Use the supplied metal/sulfate cases");
  const reacts = moreReactive(added, dissolved);
  return {
    reacts,
    solid: reacts ? dissolved : "unchanged",
    cation: reacts ? added : dissolved,
    charge: 2,
    equation: reacts
      ? `${added} + ${dissolved}SO4 → ${added}SO4 + ${dissolved}`
      : "No displacement",
  };
}
export function evidenceOrder(
  names: readonly string[],
  edges: readonly (readonly [string, string])[],
) {
  if (names.length < 2 || new Set(names).size !== names.length)
    throw Error("Use distinct named metals");
  const reach = new Map(names.map((n) => [n, new Set<string>()]));
  for (const [a, b] of edges) {
    if (a === b || !reach.has(a) || !reach.has(b))
      throw Error("Use comparisons between different listed metals");
    reach.get(a)!.add(b);
  }
  for (const via of names)
    for (const a of names)
      if (reach.get(a)!.has(via))
        for (const b of reach.get(via)!) reach.get(a)!.add(b);
  if (names.some((n) => reach.get(n)!.has(n)))
    return { consistent: false, complete: false, order: null };
  const complete = names.every((a) =>
    names.every((b) => a === b || reach.get(a)!.has(b) || reach.get(b)!.has(a)),
  );
  return {
    consistent: true,
    complete,
    order: complete
      ? [...names].sort((a, b) => (reach.get(a)!.has(b) ? -1 : 1))
      : null,
  };
}
export const metalRecords = {
  series: {
    initial: {
      label: "Order Cu, Mg and Zn from most to least reactive",
      metals: ["Cu", "Mg", "Zn"],
      answer: "Mg,Zn,Cu",
    },
    alkali: {
      label: "Order Li, K and Na from most to least reactive",
      metals: ["Li", "K", "Na"],
      answer: "K,Na,Li",
    },
    water: {
      label: "Order Ca, Mg and Na from most to least reactive",
      metals: ["Mg", "Na", "Ca"],
      answer: "Na,Ca,Mg",
    },
  },
  observations: {
    initial: {
      label: "Mg + dilute HCl at room temperature; visible gas bubbles",
      metal: "Mg",
      medium: "dilute HCl",
      gas: "hydrogen",
      interpretation: "salt-and-hydrogen",
      equation: "Mg + 2HCl → MgCl2 + H2",
    },
    slow: {
      label:
        "Mg + room-temperature water; no obvious bubbles in this brief record",
      metal: "Mg",
      medium: "room-temperature water",
      gas: "not-detected",
      interpretation: "short-observation-not-no-reaction",
      equation:
        "Reaction with room-temperature water is very slow; this brief observation does not establish zero reaction.",
    },
    copper: {
      label: "Cu + dilute HCl at room temperature; no hydrogen evolves",
      metal: "Cu",
      medium: "dilute HCl",
      gas: "none",
      interpretation: "below-hydrogen",
      equation:
        "No displacement of hydrogen from this dilute non-oxidising acid.",
    },
    calcium: {
      label: "Ca + room-temperature water; bubbles and cloudy suspension",
      metal: "Ca",
      medium: "room-temperature water",
      gas: "hydrogen",
      interpretation: "hydroxide-and-hydrogen",
      equation: "Ca + 2H2O → Ca(OH)2 + H2",
    },
    potassium: {
      label:
        "K + room-temperature water; supplied very vigorous reaction record",
      metal: "K",
      medium: "room-temperature water",
      gas: "hydrogen",
      interpretation: "hydroxide-and-hydrogen",
      equation: "2K + 2H2O → 2KOH + H2",
    },
  },
  displacement: {
    initial: {
      label: "Zn metal + CuSO4 solution",
      added: "Zn",
      dissolved: "Cu",
    },
    magnesium: {
      label: "Mg metal + CuSO4 solution",
      added: "Mg",
      dissolved: "Cu",
    },
    iron: {
      label: "Fe metal + CuSO4 solution; supplied product Fe2+",
      added: "Fe",
      dissolved: "Cu",
    },
    reverse: {
      label: "Cu metal + ZnSO4 solution",
      added: "Cu",
      dissolved: "Zn",
    },
    same: { label: "Cu metal + CuSO4 solution", added: "Cu", dissolved: "Cu" },
  },
  evidence: {
    initial: {
      label: "Complete observable tests: A displaces B; B displaces C",
      names: ["A", "B", "C"],
      edges: [
        ["A", "B"],
        ["B", "C"],
      ],
      conclusion: "A>B>C",
      reason: "chain-transitive",
    },
    partial: {
      label:
        "Complete observable tests: A displaces C; B displaces C; A/B untested",
      names: ["A", "B", "C"],
      edges: [
        ["A", "C"],
        ["B", "C"],
      ],
      conclusion: "A/B-undetermined-C-last",
      reason: "missing-comparison",
    },
    contradictory: {
      label:
        "Under identical suitable conditions: A displaces B AND B displaces A",
      names: ["A", "B"],
      edges: [
        ["A", "B"],
        ["B", "A"],
      ],
      conclusion: "inconsistent",
      reason: "check-conflicting-data",
    },
  },
  fair: {
    initial: {
      label:
        "Mg powder:0.10 g,30 cm³ H2 in10 s; Zn chips:1.00 g,18 cm³ H2 in10 s; same dilute HCl",
      conclusion: "unfair-comparison",
      reason: "control-metal-amount-and-division",
    },
    matched: {
      label:
        "Supplied comparable Mg/Zn trials: same metal masses and comparable exposed areas, acid volume/concentration/temperature; Mg30,Zn18 cm³ H2 in10 s",
      conclusion: "Mg-more-reactive-in-given-test",
      reason: "comparable-progress-over-time",
    },
    finalOnly: {
      label:
        "Complete Mg/Zn acid reactions both yield50 cm³ H2; no times recorded",
      conclusion: "cannot-rank-final-yield",
      reason: "yield-does-not-measure-rate",
    },
  },
} as const;
export const metalChoices: Record<MetalMode, Record<string, string[]>> = {
  series: {
    record: ["initial", "alkali", "water"],
    order: [
      "Cu,Mg,Zn",
      "Cu,Zn,Mg",
      "Mg,Cu,Zn",
      "Mg,Zn,Cu",
      "Zn,Cu,Mg",
      "Zn,Mg,Cu",
      "Li,K,Na",
      "Li,Na,K",
      "K,Li,Na",
      "K,Na,Li",
      "Na,Li,K",
      "Na,K,Li",
      "Mg,Na,Ca",
      "Mg,Ca,Na",
      "Na,Mg,Ca",
      "Na,Ca,Mg",
      "Ca,Mg,Na",
      "Ca,Na,Mg",
    ],
  },
  observations: {
    record: ["initial", "slow", "copper", "calcium", "potassium"],
    gas: ["unset", "hydrogen", "oxygen", "none", "not-detected"],
    interpretation: [
      "unset",
      "salt-and-hydrogen",
      "hydroxide-and-hydrogen",
      "below-hydrogen",
      "short-observation-not-no-reaction",
      "all-metals-instantly-react",
      "all-gas-is-oxygen",
    ],
  },
  displacement: {
    record: ["initial", "magnesium", "iron", "reverse", "same"],
    outcome: ["unset", "displacement", "no-displacement"],
    solid: ["unset", "Cu", "Zn", "Mg", "Fe", "unchanged"],
    reason: [
      "unset",
      "added-metal-more-reactive",
      "added-metal-not-more-reactive",
      "every-metal-displaces",
      "elements-transform",
    ],
  },
  evidence: {
    record: ["initial", "partial", "contradictory"],
    conclusion: [
      "unset",
      "A>B>C",
      "B>A>C",
      "A/B-undetermined-C-last",
      "inconsistent",
    ],
    reason: [
      "unset",
      "chain-transitive",
      "missing-comparison",
      "check-conflicting-data",
      "force-a-complete-order",
    ],
  },
  fair: {
    record: ["initial", "matched", "finalOnly"],
    conclusion: [
      "unset",
      "unfair-comparison",
      "Mg-more-reactive-in-given-test",
      "cannot-rank-final-yield",
      "equal-final-volume-equal-reactivity",
    ],
    reason: [
      "unset",
      "control-metal-amount-and-division",
      "comparable-progress-over-time",
      "yield-does-not-measure-rate",
      "bigger-final-volume-always-reactive",
    ],
  },
};
export function initialMetalBoard(mode: MetalMode): Record<string, string> {
  return Object.fromEntries(
    Object.keys(metalChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : k === "order" ? "Cu,Mg,Zn" : "unset",
    ]),
  );
}
export function validMetalBoard(
  mode: MetalMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    keys = Object.keys(metalChoices[mode]);
  if (
    Object.keys(b).length !== keys.length ||
    !keys.every(
      (k) =>
        typeof b[k] === "string" &&
        metalChoices[mode][k].includes(b[k] as string),
    )
  )
    return false;
  if (mode === "series") {
    const r = metalRecords.series[b.record as keyof typeof metalRecords.series],
      order = String(b.order).split(",");
    return (
      order.length === 3 &&
      new Set(order).size === 3 &&
      order.every((n) => (r.metals as readonly string[]).includes(n))
    );
  }
  return true;
}
export function metalExpected(
  mode: MetalMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "series")
    return {
      order:
        metalRecords.series[key as keyof typeof metalRecords.series].answer,
    };
  if (mode === "observations") {
    const r =
      metalRecords.observations[key as keyof typeof metalRecords.observations];
    return { gas: r.gas, interpretation: r.interpretation };
  }
  if (mode === "displacement") {
    const r =
        metalRecords.displacement[
          key as keyof typeof metalRecords.displacement
        ],
      a = metalDisplacement(r.added, r.dissolved);
    return {
      outcome: a.reacts ? "displacement" : "no-displacement",
      solid: a.solid,
      reason: a.reacts
        ? "added-metal-more-reactive"
        : "added-metal-not-more-reactive",
    };
  }
  if (mode === "evidence") {
    const r = metalRecords.evidence[key as keyof typeof metalRecords.evidence];
    return { conclusion: r.conclusion, reason: r.reason };
  }
  const r = metalRecords.fair[key as keyof typeof metalRecords.fair];
  return { conclusion: r.conclusion, reason: r.reason };
}
export function metalPrediction(
  mode: MetalMode,
  b: Record<string, string | number>,
) {
  if (!validMetalBoard(mode, b)) return { complete: false, correct: false };
  const expected = metalExpected(mode, b),
    complete = Object.keys(expected).every((k) => b[k] !== "unset");
  return {
    complete,
    correct: complete && Object.entries(expected).every(([k, v]) => b[k] === v),
  };
}
