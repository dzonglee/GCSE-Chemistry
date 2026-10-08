/** Selected supplied GCSE gas-phase bond-energy examples, not universal constants. */
export type BondMode = "count" | "ledger" | "inverse" | "cancel" | "evidence";
export type BondKind =
  | "HH"
  | "ClCl"
  | "HCl"
  | "NN"
  | "NH"
  | "OO"
  | "OH"
  | "CH"
  | "COdouble"
  | "BrBr"
  | "CBr"
  | "HBr";
export const bondLabels: Record<BondKind, string> = {
  HH: "H–H",
  ClCl: "Cl–Cl",
  HCl: "H–Cl",
  NN: "N≡N",
  NH: "N–H",
  OO: "O=O",
  OH: "O–H",
  CH: "C–H",
  COdouble: "C=O",
  BrBr: "Br–Br",
  CBr: "C–Br",
  HBr: "H–Br",
};
export const allBondKinds = Object.keys(bondLabels) as BondKind[];
export type BondReaction = {
  label: string;
  equation: string;
  values: Partial<Record<BondKind, number>>;
  broken: Partial<Record<BondKind, number>>;
  formed: Partial<Record<BondKind, number>>;
  molecule: "H2" | "Cl2" | "HCl" | "N2" | "NH3" | "O2" | "H2O" | "CH4" | "CO2";
  unknown?: BondKind;
  suppliedChange?: number;
};
export const bondReactions: Record<string, BondReaction> = {
  hydrogenChloride: {
    label: "Hydrogen and chlorine; gases",
    equation: "H₂(g) + Cl₂(g) → 2 HCl(g)",
    values: { HH: 436, ClCl: 243, HCl: 432 },
    broken: { HH: 1, ClCl: 1 },
    formed: { HCl: 2 },
    molecule: "HCl",
  },
  water: {
    label: "Formation of water vapour",
    equation: "2 H₂(g) + O₂(g) → 2 H₂O(g)",
    values: { HH: 436, OO: 498, OH: 464 },
    broken: { HH: 2, OO: 1 },
    formed: { OH: 4 },
    molecule: "H2O",
  },
  ammonia: {
    label: "Formation of ammonia gas",
    equation: "N₂(g) + 3 H₂(g) → 2 NH₃(g)",
    values: { NN: 945, HH: 436, NH: 391 },
    broken: { NN: 1, HH: 3 },
    formed: { NH: 6 },
    molecule: "NH3",
  },
  methane: {
    label: "Methane combustion to water vapour",
    equation: "CH₄(g) + 2 O₂(g) → CO₂(g) + 2 H₂O(g)",
    values: { CH: 413, OO: 498, COdouble: 805, OH: 464 },
    broken: { CH: 4, OO: 2 },
    formed: { COdouble: 2, OH: 4 },
    molecule: "CH4",
  },
  ammoniaOxidation: {
    label: "Ammonia oxidation to nitrogen and water vapour",
    equation: "4 NH₃(g) + 3 O₂(g) → 2 N₂(g) + 6 H₂O(g)",
    values: { NH: 391, OO: 498, NN: 945, OH: 464 },
    broken: { NH: 12, OO: 3 },
    formed: { NN: 2, OH: 12 },
    molecule: "NH3",
  },
  splitHCl: {
    label: "Reverse reaction, hydrogen chloride gases",
    equation: "2 HCl(g) → H₂(g) + Cl₂(g)",
    values: { HH: 436, ClCl: 243, HCl: 432 },
    broken: { HCl: 2 },
    formed: { HH: 1, ClCl: 1 },
    molecule: "HCl",
  },
  doubleHCl: {
    label: "Twice the hydrogen/chlorine equation",
    equation: "2 H₂(g) + 2 Cl₂(g) → 4 HCl(g)",
    values: { HH: 436, ClCl: 243, HCl: 432 },
    broken: { HH: 2, ClCl: 2 },
    formed: { HCl: 4 },
    molecule: "Cl2",
  },
  bromination: {
    label: "Supplied methane bromination accounting",
    equation: "CH₄(g) + Br₂(g) → CH₃Br(g) + HBr(g)",
    values: { CH: 412, BrBr: 193, CBr: 290, HBr: 366 },
    broken: { CH: 4, BrBr: 1 },
    formed: { CH: 3, CBr: 1, HBr: 1 },
    molecule: "CH4",
    unknown: "CBr",
    suppliedChange: -51,
  },
  unknownHCl: {
    label: "Unknown H–Cl value, supplied change −185 kJ/mol reaction",
    equation: "H₂(g) + Cl₂(g) → 2 HCl(g)",
    values: { HH: 436, ClCl: 243, HCl: 432 },
    broken: { HH: 1, ClCl: 1 },
    formed: { HCl: 2 },
    molecule: "HCl",
    unknown: "HCl",
    suppliedChange: -185,
  },
  unknownOH: {
    label: "Unknown O–H value, supplied change −486 kJ/mol reaction",
    equation: "2 H₂(g) + O₂(g) → 2 H₂O(g)",
    values: { HH: 436, OO: 498, OH: 464 },
    broken: { HH: 2, OO: 1 },
    formed: { OH: 4 },
    molecule: "H2O",
    unknown: "OH",
    suppliedChange: -486,
  },
  unknownHH: {
    label: "Unknown H–H value, supplied change −185 kJ/mol reaction",
    equation: "H₂(g) + Cl₂(g) → 2 HCl(g)",
    values: { HH: 436, ClCl: 243, HCl: 432 },
    broken: { HH: 1, ClCl: 1 },
    formed: { HCl: 2 },
    molecule: "H2",
    unknown: "HH",
    suppliedChange: -185,
  },
};
export const bondEvidence = {
  breaking: {
    label: "A student says breaking bonds releases the energy of combustion.",
    claim: "Breaking requires input",
    reason: "Energy overcomes the bonded attraction",
  },
  formation: {
    label: "What happens when product bonds form?",
    claim: "Energy is released",
    reason: "Bond formation lowers the energy of the bonded system",
  },
  exothermic: {
    label:
      "Breaking requires 900 kJ; formation releases 1200 kJ for a specified amount.",
    claim: "Overall exothermic",
    reason: "Formation release exceeds breaking input",
  },
  endothermic: {
    label:
      "Breaking requires 1200 kJ; formation releases 900 kJ for a specified amount.",
    claim: "Overall endothermic",
    reason: "Breaking input exceeds formation release",
  },
  mean: {
    label:
      "A calculated value differs from a measured gas-phase reaction value.",
    claim: "An approximate estimate",
    reason: "Mean bond values depend on chemical environment",
  },
  phase: {
    label:
      "The table uses gas-phase bond values; a student claims the result exactly matches liquid water formation.",
    claim: "Phase transfer also matters",
    reason: "Gas-phase bond accounting excludes the water condensation change",
  },
  activation: {
    label:
      "A student calls the sum of all bond-breaking energies the activation energy.",
    claim: "Not established by this ledger",
    reason: "The bookkeeping path is not the actual reaction pathway",
  },
  mechanism: {
    label:
      "A drawing breaks every reactant bond into free atoms, then constructs products.",
    claim: "Hypothetical accounting path",
    reason: "It need not show actual elementary reaction steps",
  },
  double: {
    label:
      "A supplied table lists O–O and O=O separately. An O₂ molecule contains O=O.",
    claim: "Use the O=O entry once",
    reason: "One double bond is not two copies of a single-bond energy",
  },
  scale: {
    label: "An equation is doubled with identical supplied bond values.",
    claim: "Overall energy doubles",
    reason:
      "All bond counts double while energy per mole of bonds is unchanged",
  },
};
export const bondClaims = [
  ...new Set(Object.values(bondEvidence).map((e) => e.claim)),
  "Breaking releases energy",
  "Formation always requires input",
  "Every estimate is exact",
  "The bond energy doubles",
];
export const bondReasons = [
  ...new Set(Object.values(bondEvidence).map((e) => e.reason)),
  "All chemical changes release energy",
  "A double bond has twice any single-bond energy",
  "The equation coefficient changes each bond value",
];
export const bondRecords: Record<BondMode, string[]> = {
  count: [
    "ammoniaOxidation",
    "water",
    "ammonia",
    "methane",
    "hydrogenChloride",
    "doubleHCl",
  ],
  ledger: [
    "ammoniaOxidation",
    "hydrogenChloride",
    "water",
    "ammonia",
    "methane",
    "splitHCl",
    "doubleHCl",
  ],
  inverse: ["bromination", "unknownHCl", "unknownOH", "unknownHH"],
  cancel: ["bromination"],
  evidence: Object.keys(bondEvidence),
};
type Board = Record<string, string | number>;
export const bondCountKeys = (r: BondReaction) =>
  [
    ...new Set([...Object.keys(r.broken), ...Object.keys(r.formed)]),
  ] as BondKind[];
export const bondTotals = (r: BondReaction) => {
  const total = (side: Partial<Record<BondKind, number>>) =>
    Object.entries(side).reduce(
      (sum, [k, n]) => sum + n! * r.values[k as BondKind]!,
      0,
    );
  const input = total(r.broken),
    release = total(r.formed);
  return { input, release, change: input - release };
};
export const bondInitial = (
  mode: BondMode,
  record = bondRecords[mode][0],
): Board => {
  if (!bondRecords[mode].includes(record)) throw Error("Unknown bond record");
  if (mode === "evidence") return { record, claim: "unset", reason: "unset" };
  if (mode === "inverse") return { record, unknown: "0" };
  if (mode === "cancel")
    return { record, cancelBroken: "0", cancelFormed: "0", change: "0" };
  if (mode === "ledger")
    return {
      record,
      input: "0",
      release: "0",
      change: "0",
      classification: "unset",
    };
  return Object.fromEntries([
    ["record", record],
    ...allBondKinds.flatMap((k) => [
      ["broken-" + k, "0"],
      ["formed-" + k, "0"],
    ]),
  ]);
};
export const bondInteger = (x: unknown, min = -20000, max = 20000) =>
  typeof x === "string" &&
  /^-?(0|[1-9]\d*)$/.test(x) &&
  String(Number(x)) === x &&
  Number(x) >= min &&
  Number(x) <= max;
export function validBondBoard(mode: BondMode, b: unknown): b is Board {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const q = b as Board;
  if (typeof q.record !== "string" || !bondRecords[mode].includes(q.record))
    return false;
  const start = bondInitial(mode, q.record),
    keys = Object.keys(start);
  if (Object.keys(q).length !== keys.length || keys.some((k) => !(k in q)))
    return false;
  return keys.every((k) =>
    k === "record" || k === "classification"
      ? k === "record" ||
        ["unset", "exothermic", "endothermic", "no-net-change"].includes(
          String(q[k]),
        )
      : k === "claim"
        ? typeof q[k] === "string" &&
          ["unset", ...bondClaims].includes(q[k] as string)
        : k === "reason"
          ? typeof q[k] === "string" &&
            ["unset", ...bondReasons].includes(q[k] as string)
          : bondInteger(
              q[k],
              k === "change" ? -20000 : 0,
              k.startsWith("broken-") ||
                k.startsWith("formed-") ||
                k.startsWith("cancel")
                ? 24
                : 20000,
            ),
  );
}
export function bondCorrect(mode: BondMode, b: Board): boolean {
  if (!validBondBoard(mode, b)) return false;
  if (mode === "evidence") {
    const e = bondEvidence[b.record as keyof typeof bondEvidence];
    return b.claim === e.claim && b.reason === e.reason;
  }
  const r = bondReactions[String(b.record)],
    t = bondTotals(r);
  if (mode === "count")
    return allBondKinds.every(
      (k) =>
        Number(b["broken-" + k]) === (r.broken[k] ?? 0) &&
        Number(b["formed-" + k]) === (r.formed[k] ?? 0),
    );
  if (mode === "inverse") return Number(b.unknown) === r.values[r.unknown!]!;
  if (mode === "cancel")
    return (
      Number(b.cancelBroken) === Number(b.cancelFormed) &&
      Number(b.cancelBroken) > 0 &&
      Number(b.cancelBroken) <= Math.min(r.broken.CH ?? 0, r.formed.CH ?? 0) &&
      Number(b.change) === t.change
    );
  return (
    Number(b.input) === t.input &&
    Number(b.release) === t.release &&
    Number(b.change) === t.change &&
    b.classification ===
      (t.change < 0
        ? "exothermic"
        : t.change > 0
          ? "endothermic"
          : "no-net-change")
  );
}
export function bondHistoryStep(mode: BondMode, a: Board, b: Board): boolean {
  if (!validBondBoard(mode, a) || !validBondBoard(mode, b)) return false;
  if (a.record !== b.record) {
    const initial = bondInitial(mode, String(b.record));
    return Object.keys(initial).every((k) => b[k] === initial[k]);
  }
  const changed = Object.keys(a).filter((k) => a[k] !== b[k]);
  if (changed.length !== 1) return false;
  const k = changed[0];
  if (
    k.startsWith("broken-") ||
    k.startsWith("formed-") ||
    k.startsWith("cancel")
  )
    return Math.abs(Number(a[k]) - Number(b[k])) === 1;
  return true;
}
export function validBondHistory(mode: BondMode, h: unknown): h is Board[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validBondBoard(mode, b))
  )
    return false;
  const start = bondInitial(mode, String(h[0].record));
  return (
    Object.keys(start).every((k) => start[k] === h[0][k]) &&
    h.slice(1).every((b, i) => bondHistoryStep(mode, h[i], b))
  );
}
