export type IonicSpecies = {
  label: string;
  atoms: Record<string, number>;
  charge: number;
  state: "s" | "aq" | "l" | "g" | "";
};
export const displacementSpecies: Record<string, IonicSpecies> = {
  Cu: { label: "Cu", atoms: { Cu: 1 }, charge: 0, state: "s" },
  Cu2: { label: "Cu²⁺", atoms: { Cu: 1 }, charge: 2, state: "aq" },
  Ag: { label: "Ag", atoms: { Ag: 1 }, charge: 0, state: "s" },
  Ag1: { label: "Ag⁺", atoms: { Ag: 1 }, charge: 1, state: "aq" },
  Zn: { label: "Zn", atoms: { Zn: 1 }, charge: 0, state: "s" },
  Zn2: { label: "Zn²⁺", atoms: { Zn: 1 }, charge: 2, state: "aq" },
  Fe: { label: "Fe", atoms: { Fe: 1 }, charge: 0, state: "s" },
  Fe2: { label: "Fe²⁺", atoms: { Fe: 1 }, charge: 2, state: "aq" },
  Mg: { label: "Mg", atoms: { Mg: 1 }, charge: 0, state: "s" },
  Mg2: { label: "Mg²⁺", atoms: { Mg: 1 }, charge: 2, state: "aq" },
  Al: { label: "Al", atoms: { Al: 1 }, charge: 0, state: "s" },
  Al3: { label: "Al³⁺", atoms: { Al: 1 }, charge: 3, state: "aq" },
  H1: { label: "H⁺", atoms: { H: 1 }, charge: 1, state: "aq" },
  H2: { label: "H₂", atoms: { H: 2 }, charge: 0, state: "g" },
  Cl1: { label: "Cl⁻", atoms: { Cl: 1 }, charge: -1, state: "aq" },
  NO3: { label: "NO₃⁻", atoms: { N: 1, O: 3 }, charge: -1, state: "aq" },
  SO4: { label: "SO₄²⁻", atoms: { S: 1, O: 4 }, charge: -2, state: "aq" },
  Na1: { label: "Na⁺", atoms: { Na: 1 }, charge: 1, state: "aq" },
  OH1: { label: "OH⁻", atoms: { O: 1, H: 1 }, charge: -1, state: "aq" },
  water: { label: "H₂O", atoms: { H: 2, O: 1 }, charge: 0, state: "l" },
  electron: { label: "e⁻", atoms: {}, charge: -1, state: "" },
};
export type IonicTerm = {
  species: string;
  coefficient: number;
  state?: IonicSpecies["state"];
};
export function ionicIdentity(term: IonicTerm) {
  const s = displacementSpecies[term.species];
  if (!s) throw Error("Unknown chemical species.");
  return term.species + "@" + (term.state ?? s.state);
}
export function ionicLedger(terms: readonly IonicTerm[]) {
  const atoms: Record<string, number> = {};
  let charge = 0;
  for (const term of terms) {
    const s = displacementSpecies[term.species];
    if (
      !s ||
      !Number.isInteger(term.coefficient) ||
      term.coefficient < 1 ||
      term.coefficient > 100
    )
      throw Error("Use named species with positive whole coefficients.");
    charge += s.charge * term.coefficient;
    for (const [element, count] of Object.entries(s.atoms))
      atoms[element] = (atoms[element] ?? 0) + count * term.coefficient;
  }
  return { atoms, charge };
}
export function ionicBalance(
  left: readonly IonicTerm[],
  right: readonly IonicTerm[],
) {
  const a = ionicLedger(left),
    b = ionicLedger(right),
    elements = [...new Set([...Object.keys(a.atoms), ...Object.keys(b.atoms)])];
  return {
    left: a,
    right: b,
    atoms: elements.every((k) => (a.atoms[k] ?? 0) === (b.atoms[k] ?? 0)),
    charge: a.charge === b.charge,
  };
}
export function scaleIonic(
  terms: readonly IonicTerm[],
  multiplier: number,
): IonicTerm[] {
  if (!Number.isInteger(multiplier) || multiplier < 1 || multiplier > 12)
    throw Error("Use a positive whole multiplier.");
  return terms.map((t) => ({ ...t, coefficient: t.coefficient * multiplier }));
}
export function sameIonicCancellation(
  left: readonly IonicTerm[],
  right: readonly IonicTerm[],
) {
  ionicLedger(left);
  ionicLedger(right);
  const l = new Map<string, number>(),
    r = new Map<string, number>();
  for (const t of left)
    l.set(ionicIdentity(t), (l.get(ionicIdentity(t)) ?? 0) + t.coefficient);
  for (const t of right)
    r.set(ionicIdentity(t), (r.get(ionicIdentity(t)) ?? 0) + t.coefficient);
  return [...l.entries()]
    .filter(([id]) => r.has(id))
    .map(([id, count]) => ({ id, coefficient: Math.min(count, r.get(id)!) }));
}
export function cancelIonic(
  left: readonly IonicTerm[],
  right: readonly IonicTerm[],
) {
  const removed = sameIonicCancellation(left, right);
  function remaining(terms: readonly IonicTerm[]) {
    const budget = new Map(removed.map((r) => [r.id, r.coefficient]));
    return terms.flatMap((t) => {
      const id = ionicIdentity(t),
        deduct = Math.min(t.coefficient, budget.get(id) ?? 0);
      budget.set(id, (budget.get(id) ?? 0) - deduct);
      return t.coefficient === deduct
        ? []
        : [{ ...t, coefficient: t.coefficient - deduct }];
    });
  }
  return { left: remaining(left), right: remaining(right), removed };
}
export function leastElectronMultipliers(lost: number, gained: number) {
  if (
    !Number.isInteger(lost) ||
    !Number.isInteger(gained) ||
    lost < 1 ||
    gained < 1
  )
    throw Error("State positive whole electron counts.");
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const electrons = (lost * gained) / gcd(lost, gained);
  return {
    oxidation: electrons / lost,
    reduction: electrons / gained,
    electrons,
  };
}
const t = (species: string, coefficient = 1): IonicTerm => ({
  species,
  coefficient,
});
export const displacementCombineRecords = {
  initial: {
    label:
      "Cu loses two electrons; each Ag⁺ gains one. Use the least whole multipliers.",
    oxidationLeft: [t("Cu")],
    oxidationRight: [t("Cu2"), t("electron", 2)],
    reductionLeft: [t("Ag1"), t("electron")],
    reductionRight: [t("Ag")],
    lost: 2,
    gained: 1,
  },
  zinc: {
    label:
      "Zn is oxidised to Zn²⁺; Cu²⁺ is reduced to Cu. Use least whole multipliers.",
    oxidationLeft: [t("Zn")],
    oxidationRight: [t("Zn2"), t("electron", 2)],
    reductionLeft: [t("Cu2"), t("electron", 2)],
    reductionRight: [t("Cu")],
    lost: 2,
    gained: 2,
  },
  aluminium: {
    label:
      "Given Al→Al³⁺ and Cu²⁺→Cu under conditions where reaction occurs; use least whole multipliers. Passivation/rate are not inferred.",
    oxidationLeft: [t("Al")],
    oxidationRight: [t("Al3"), t("electron", 3)],
    reductionLeft: [t("Cu2"), t("electron", 2)],
    reductionRight: [t("Cu")],
    lost: 3,
    gained: 2,
  },
  aluminiumSilver: {
    label:
      "Given Al→Al³⁺ and Ag⁺→Ag where reaction occurs; use least whole multipliers.",
    oxidationLeft: [t("Al")],
    oxidationRight: [t("Al3"), t("electron", 3)],
    reductionLeft: [t("Ag1"), t("electron")],
    reductionRight: [t("Ag")],
    lost: 3,
    gained: 1,
  },
  magnesiumAcid: {
    label:
      "Supplied Mg/HCl reaction: Mg→Mg²⁺ and 2H⁺+2e⁻→H₂. Use least whole multipliers.",
    oxidationLeft: [t("Mg")],
    oxidationRight: [t("Mg2"), t("electron", 2)],
    reductionLeft: [t("H1", 2), t("electron", 2)],
    reductionRight: [t("H2")],
    lost: 2,
    gained: 2,
  },
} as const;
export function combinedDisplacement(
  record: keyof typeof displacementCombineRecords,
  oxidation: number,
  reduction: number,
) {
  const r = displacementCombineRecords[record];
  const left = [
    ...scaleIonic(r.oxidationLeft, oxidation),
    ...scaleIonic(r.reductionLeft, reduction),
  ];
  const right = [
    ...scaleIonic(r.oxidationRight, oxidation),
    ...scaleIonic(r.reductionRight, reduction),
  ];
  const cancelled = cancelIonic(left, right),
    electronLeft = oxidation * r.lost,
    electronRight = reduction * r.gained;
  return {
    addedLeft: left,
    addedRight: right,
    ...cancelled,
    electronsLost: electronLeft,
    electronsGained: electronRight,
    matched: electronLeft === electronRight,
    balance: ionicBalance(cancelled.left, cancelled.right),
    least: leastElectronMultipliers(r.lost, r.gained),
  };
}
export const displacementCancelRecords = {
  initial: {
    label:
      "Full ionic copper/silver nitrate equation; retain the physical nitrate ions while cancelling their equation terms.",
    left: [t("Cu"), t("Ag1", 2), t("NO3", 2)],
    right: [t("Cu2"), t("NO3", 2), t("Ag", 2)],
  },
  chloride: {
    label: "Full ionic zinc/copper chloride equation.",
    left: [t("Zn"), t("Cu2"), t("Cl1", 2)],
    right: [t("Zn2"), t("Cl1", 2), t("Cu")],
  },
  sulfate: {
    label: "Full ionic iron/copper sulfate equation, forming supplied Fe²⁺.",
    left: [t("Fe"), t("Cu2"), t("SO4")],
    right: [t("Fe2"), t("SO4"), t("Cu")],
  },
  acid: {
    label: "Full ionic magnesium/hydrochloric acid equation.",
    left: [t("Mg"), t("H1", 2), t("Cl1", 2)],
    right: [t("Mg2"), t("Cl1", 2), t("H2")],
  },
  neutralisation: {
    label:
      "Strong HCl/NaOH neutralisation: water remains a molecule. This is not metal displacement.",
    left: [t("H1"), t("Cl1"), t("Na1"), t("OH1")],
    right: [t("Na1"), t("Cl1"), t("water")],
  },
} as const;

export const displacementLedgerRecords = {
  initial: {
    label:
      "Repair Cu + Ag⁺ → Cu²⁺ + Ag using coefficients only; balanced multiples are allowed.",
    left: ["Cu", "Ag1"],
    right: ["Cu2", "Ag"],
    start: [1, 1, 1, 1],
  },
  zinc: {
    label: "Repair supplied zinc/copper displacement; coefficients only.",
    left: ["Zn", "Cu2"],
    right: ["Zn2", "Cu"],
    start: [1, 2, 1, 1],
  },
  magnesium: {
    label: "Repair supplied magnesium/HCl net equation; keep H₂ intact.",
    left: ["Mg", "H1"],
    right: ["Mg2", "H2"],
    start: [1, 1, 1, 1],
  },
  aluminium: {
    label:
      "Given Al/Cu²⁺ reaction occurs under the stated conditions; balance coefficients without inferring reaction speed.",
    left: ["Al", "Cu2"],
    right: ["Al3", "Cu"],
    start: [1, 1, 1, 1],
  },
  iron: {
    label: "Repair supplied iron/copper sulfate net equation forming Fe²⁺.",
    left: ["Fe", "Cu2"],
    right: ["Fe2", "Cu"],
    start: [1, 1, 1, 2],
  },
} as const;
export function displacementLedger(
  record: keyof typeof displacementLedgerRecords,
  coefficients: readonly number[],
) {
  if (
    coefficients.length !== 4 ||
    coefficients.some((n) => !Number.isInteger(n) || n < 1 || n > 6)
  )
    throw Error("Use four coefficients from one to six.");
  const r = displacementLedgerRecords[record],
    left = r.left.map((species, i) => ({
      species,
      coefficient: coefficients[i],
    })),
    right = r.right.map((species, i) => ({
      species,
      coefficient: coefficients[i + 2],
    }));
  return { termsLeft: left, termsRight: right, ...ionicBalance(left, right) };
}

export const displacementRepresentationRecords = {
  initial: {
    label:
      "In aqueous silver nitrate, which particle description is appropriate for the ionic equation?",
    decision: "separate-ions",
    reason: "dissolved-salt",
    explanation:
      "Dissolved silver nitrate is represented by separate Ag⁺ and NO₃⁻ ions, not intact AgNO₃ molecules.",
  },
  solid: {
    label:
      "AgCl(s) forms in a supplied precipitation equation. Should it be split into Ag⁺(aq) and Cl⁻(aq) on that product side?",
    decision: "keep-intact",
    reason: "solid-not-dissolved",
    explanation:
      "The stated solid AgCl(s) remains a solid formula term; it is not written as dissolved aqueous ions.",
  },
  water: {
    label:
      "H₂O(l) is a product of the supplied strong-acid/hydroxide neutralisation. Should the product term be split into H⁺ and OH⁻?",
    decision: "keep-intact",
    reason: "molecular-product",
    explanation:
      "The water product remains H₂O(l); splitting it back into the reacting ions would erase the represented neutralisation.",
  },
  cancel: {
    label:
      "Two NO₃⁻(aq) terms cancel from the full ionic Cu/AgNO₃ equation. What happens to the physical nitrate ions?",
    decision: "remain-in-solution",
    reason: "equation-shortening",
    explanation:
      "Cancellation shortens the equation by omitting unchanged terms. It does not filter out or destroy nitrate ions.",
  },
  nonzero: {
    label:
      "Cu +2Ag⁺ → Cu²⁺ +2Ag has charge+2 on each side after the nitrate spectators are omitted. Must both sides instead total zero?",
    decision: "equal-not-zero",
    reason: "charge-conservation",
    explanation:
      "Each side has the same total charge,+2. Charge balance requires equality; a net ionic equation need not have zero charge on each side.",
  },
  identity: {
    label:
      "Zn(s) becomes Zn²⁺(aq). May Zn and Zn²⁺ cancel because both contain zinc?",
    decision: "do-not-cancel",
    reason: "different-species",
    explanation:
      "A metal atom and its dissolved ion are different species. Cancellation requires identical formula, charge and state on both sides.",
  },
  phase: {
    label:
      "A supplied phase-change equation has H₂O(l) on one side and H₂O(g) on the other. May those terms cancel?",
    decision: "do-not-cancel",
    reason: "different-state",
    explanation:
      "Their formula matches but their states differ. Cancelling them would erase the physical change being represented.",
  },
} as const;
export const displacementFeasibilityRecords = {
  initial: {
    label:
      "Given Zn is more reactive than Cu, clean zinc is placed in Cu²⁺ solution under suitable conditions.",
    occurs: "yes",
    reason: "metal-more-reactive",
    oxidised: "Zn",
    reduced: "Cu²⁺",
    explanation:
      "The supplied ordering supports zinc displacing copper: zinc atoms lose electrons and Cu²⁺ ions gain them.",
  },
  reverse: {
    label:
      "Given Zn is more reactive than Cu, copper is placed in Zn²⁺ solution. The proposed reverse equation balances atoms and charge.",
    occurs: "no",
    reason: "metal-less-reactive",
    oxidised: "none",
    reduced: "none",
    explanation:
      "Balancing alone does not establish feasibility. The less reactive copper does not displace zinc under the stated conditions.",
  },
  silver: {
    label:
      "Given Cu is more reactive than Ag, copper contacts Ag⁺ solution under suitable conditions.",
    occurs: "yes",
    reason: "metal-more-reactive",
    oxidised: "Cu",
    reduced: "Ag⁺",
    explanation:
      "Copper supplies electrons to Ag⁺ ions. Copper is oxidised; Ag⁺ is reduced to silver metal.",
  },
  unknown: {
    label:
      "The proposed M +X²⁺ → M²⁺ +X equation balances. No reactivity or experimental evidence is supplied for M versus X.",
    occurs: "not-established",
    reason: "ordering-missing",
    oxidised: "not-established",
    reduced: "not-established",
    explanation:
      "If the proposed reaction occurred, M would be oxidised and X²⁺ reduced. Its balance alone does not establish that it actually occurs.",
  },
  same: {
    label:
      "Copper is placed in a solution already containing Cu²⁺; no different metal species or reaction-driving evidence is supplied.",
    occurs: "no-displacement",
    reason: "same-metal-pair",
    oxidised: "none",
    reduced: "none",
    explanation:
      "This is the same metal/ion pair, not displacement of a different metal. Do not invent a net displacement.",
  },
  passivation: {
    label:
      "Al is above Cu in the series, but an intact oxide surface prevents detectable change during the short supplied observation.",
    occurs: "no-detectable-change",
    reason: "surface-barrier",
    oxidised: "not-detected",
    reduced: "not-detected",
    explanation:
      "The observed lack of change can reflect a surface barrier. It does not establish that aluminium is below copper in reactivity.",
  },
} as const;

export type DisplacementMode =
  "combine" | "cancel" | "ledger" | "representation" | "feasibility";
export const displacementRecords = {
  combine: displacementCombineRecords,
  cancel: displacementCancelRecords,
  ledger: displacementLedgerRecords,
  representation: displacementRepresentationRecords,
  feasibility: displacementFeasibilityRecords,
};
const integers = (n: number) =>
  Array.from({ length: n }, (_, i) => String(i + 1));
const unique = (a: readonly string[]) => [...new Set(a)];
export const displacementChoices: Record<
  DisplacementMode,
  Record<string, string[]>
> = {
  combine: {
    record: Object.keys(displacementCombineRecords),
    oxidation: integers(6),
    reduction: integers(6),
  },
  cancel: {
    record: Object.keys(displacementCancelRecords),
    selected: [
      "none",
      "NO3@aq",
      "Cl1@aq",
      "SO4@aq",
      "Na1@aq",
      "Cl1@aq,Na1@aq",
      "Cu@s",
      "Cu2@aq",
      "Ag1@aq",
      "electron@",
    ],
  },
  ledger: {
    record: Object.keys(displacementLedgerRecords),
    a: integers(6),
    b: integers(6),
    c: integers(6),
    d: integers(6),
  },
  representation: {
    record: Object.keys(displacementRepresentationRecords),
    decision: unique([
      "unset",
      ...Object.values(displacementRepresentationRecords).map(
        (r) => r.decision,
      ),
      "disappear",
      "split-all",
      "different-species-cancel",
    ]),
    reason: unique([
      "unset",
      ...Object.values(displacementRepresentationRecords).map((r) => r.reason),
      "all-charges-must-zero",
      "same-element-enough",
      "cancellation-removes-ions",
    ]),
  },
  feasibility: {
    record: Object.keys(displacementFeasibilityRecords),
    occurs: unique([
      "unset",
      ...Object.values(displacementFeasibilityRecords).map((r) => r.occurs),
      "yes-because-balanced",
    ]),
    reason: unique([
      "unset",
      ...Object.values(displacementFeasibilityRecords).map((r) => r.reason),
      "balance-proves-reaction",
      "charge-is-reactivity",
      "no-change-proves-order",
    ]),
    oxidised: unique([
      "unset",
      ...Object.values(displacementFeasibilityRecords).map((r) => r.oxidised),
      "Cu2",
      "Zn2",
      "Ag1",
    ]),
    reduced: unique([
      "unset",
      ...Object.values(displacementFeasibilityRecords).map((r) => r.reduced),
      "Cu",
      "Zn",
      "Ag",
    ]),
  },
};
export function initialDisplacementBoard(
  mode: DisplacementMode,
  record = "initial",
): Record<string, string> {
  if (!displacementChoices[mode].record.includes(record))
    throw Error("Unknown supplied record.");
  const b: Record<string, string> = Object.fromEntries(
    Object.keys(displacementChoices[mode]).map((k) => [
      k,
      k === "record" ? record : "unset",
    ]),
  );
  if (mode === "combine") {
    b.oxidation = "1";
    b.reduction = "1";
  }
  if (mode === "cancel") b.selected = "none";
  if (mode === "ledger") {
    const r =
      displacementLedgerRecords[
        record as keyof typeof displacementLedgerRecords
      ];
    ["a", "b", "c", "d"].forEach((key, i) => {
      b[key] = String(r.start[i]);
    });
  }
  return b;
}
export function validDisplacementBoard(
  mode: DisplacementMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  return (
    Object.keys(v).length === Object.keys(displacementChoices[mode]).length &&
    Object.entries(displacementChoices[mode]).every(
      ([key, choices]) =>
        typeof v[key] === "string" && choices.includes(v[key] as string),
    )
  );
}
export function displacementPrediction(
  mode: DisplacementMode,
  b: Record<string, string | number>,
) {
  const key = String(b.record);
  if (mode === "combine") {
    const value = combinedDisplacement(
      key as keyof typeof displacementCombineRecords,
      Number(b.oxidation),
      Number(b.reduction),
    );
    const least =
      Number(b.oxidation) === value.least.oxidation &&
      Number(b.reduction) === value.least.reduction;
    return {
      correct: value.matched && least,
      explanation: !value.matched
        ? "The electron totals do not match. Multiply every term in each half-equation; the same number of electrons must be lost and gained."
        : !least
          ? "These multiples conserve atoms and charge, but this task explicitly asks for the least whole multipliers. Divide both multipliers by their common factor."
          : "Equal electron totals cancel from the added equation. Every term was scaled, so atoms and total signed charge remain balanced.",
    };
  }
  if (mode === "cancel") {
    const r =
      displacementCancelRecords[key as keyof typeof displacementCancelRecords];
    const expected = cancelIonic(r.left, r.right)
      .removed.map((x) => x.id)
      .sort()
      .join(",");
    return {
      correct: String(b.selected) === expected,
      explanation:
        "Cancel only unchanged species with identical formula, charge and state on both sides. They remain physically present; omitting their terms gives the net ionic equation.",
    };
  }
  if (mode === "ledger") {
    const r = displacementLedger(
      key as keyof typeof displacementLedgerRecords,
      ["a", "b", "c", "d"].map((k) => Number(b[k])),
    );
    return {
      correct: r.atoms && r.charge,
      explanation:
        r.atoms && r.charge
          ? "Both atom counts and total signed charge match. Balanced multiples are accepted here; the charges on the two sides need not be zero."
          : !r.atoms
            ? "At least one element count differs. Change whole-formula coefficients, never the identities or subscripts."
            : "Atoms match, but total signed charge does not. Count each ion's charge multiplied by its coefficient.",
    };
  }
  if (mode === "representation") {
    const r =
      displacementRepresentationRecords[
        key as keyof typeof displacementRepresentationRecords
      ];
    return {
      correct: b.decision === r.decision && b.reason === r.reason,
      explanation: r.explanation,
    };
  }
  const r =
    displacementFeasibilityRecords[
      key as keyof typeof displacementFeasibilityRecords
    ];
  return {
    correct:
      b.occurs === r.occurs &&
      b.reason === r.reason &&
      b.oxidised === r.oxidised &&
      b.reduced === r.reduced,
    explanation: r.explanation,
  };
}
export function ionicEquationText(terms: readonly IonicTerm[], states = true) {
  return terms
    .map((term) => {
      const s = displacementSpecies[term.species],
        state = term.state ?? s.state;
      return (
        (term.coefficient === 1 ? "" : String(term.coefficient) + " ") +
        s.label +
        (states && state ? "(" + state + ")" : "")
      );
    })
    .join(" + ");
}
