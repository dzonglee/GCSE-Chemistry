export type ReversibleMode =
  "direction" | "energy" | "turnover" | "rates" | "boundary" | "evidence";
export type DirectionRecord = {
  label: string;
  left: string;
  right: string;
  forwardCondition: string;
  reverseCondition: string;
  target: "forward" | "reverse";
};
export const directionRecords: Record<string, DirectionRecord> = {
  initial: {
    label: "Ammonium chloride",
    left: "ammonium chloride",
    right: "ammonia + hydrogen chloride",
    forwardCondition: "Heating favours the displayed forward change",
    reverseCondition: "Cooling permits the gases to recombine",
    target: "reverse",
  },
  hydrate: {
    label: "Copper sulfate",
    left: "hydrated copper sulfate (blue)",
    right: "anhydrous copper sulfate (white) + water",
    forwardCondition: "Heating removes water of crystallisation",
    reverseCondition: "Adding water restores the hydrated salt",
    target: "forward",
  },
  hydrateReverse: {
    label: "Restore the hydrate",
    left: "hydrated copper sulfate (blue)",
    right: "anhydrous copper sulfate (white) + water",
    forwardCondition: "Heating removes water of crystallisation",
    reverseCondition: "Adding water restores the hydrated salt",
    target: "reverse",
  },
  ammonia: {
    label: "Ammonia formation",
    left: "nitrogen + hydrogen",
    right: "ammonia",
    forwardCondition: "Supplied forward direction: gases form ammonia",
    reverseCondition:
      "Supplied reverse direction: ammonia forms nitrogen and hydrogen",
    target: "forward",
  },
  ammoniaReverse: {
    label: "Ammonia decomposition",
    left: "nitrogen + hydrogen",
    right: "ammonia",
    forwardCondition: "Supplied forward direction: gases form ammonia",
    reverseCondition:
      "Supplied reverse direction: ammonia forms nitrogen and hydrogen",
    target: "reverse",
  },
  unfamiliar: {
    label: "Unfamiliar reversible change",
    left: "P + Q",
    right: "R",
    forwardCondition: "Supplied condition C favours R formation",
    reverseCondition: "Supplied condition D favours P and Q formation",
    target: "reverse",
  },
};
export type EnergyRecord = {
  label: string;
  left: number;
  right: number;
  amount: number;
  targetAmount: number;
  reverse: boolean;
};
export const reversibleEnergies: Record<string, EnergyRecord> = {
  initial: {
    label: "Reverse an endothermic batch",
    left: 20,
    right: 50,
    amount: 2,
    targetAmount: 2,
    reverse: true,
  },
  exothermic: {
    label: "Reverse an exothermic batch",
    left: 80,
    right: 25,
    amount: 5,
    targetAmount: 5,
    reverse: true,
  },
  offset: {
    label: "Shifted energy reference",
    left: 140,
    right: 170,
    amount: 3,
    targetAmount: 6,
    reverse: true,
  },
  forward: {
    label: "Larger forward batch",
    left: 10,
    right: 34,
    amount: 4,
    targetAmount: 10,
    reverse: false,
  },
  smaller: {
    label: "Smaller reverse batch",
    left: 75,
    right: 15,
    amount: 6,
    targetAmount: 1.5,
    reverse: true,
  },
  fraction: {
    label: "Fractional forward batch",
    left: 30,
    right: 42,
    amount: 2,
    targetAmount: 0.5,
    reverse: false,
  },
};
export type TurnoverRecord = {
  label: string;
  a: number;
  b: number;
  forward: number;
  reverse: number;
  closed: boolean;
};
export const turnoverRecords: Record<string, TurnoverRecord> = {
  initial: {
    label: "Unequal amounts, equal positive rates",
    a: 14,
    b: 6,
    forward: 2,
    reverse: 2,
    closed: true,
  },
  products: {
    label: "Mostly B at equilibrium",
    a: 5,
    b: 15,
    forward: 3,
    reverse: 3,
    closed: true,
  },
  equal: {
    label: "Equal amounts at equilibrium",
    a: 10,
    b: 10,
    forward: 4,
    reverse: 4,
    closed: true,
  },
  notEqual: {
    label: "Equal amounts, unequal rates",
    a: 10,
    b: 10,
    forward: 4,
    reverse: 1,
    closed: true,
  },
  reverse: {
    label: "Net reverse change",
    a: 7,
    b: 13,
    forward: 1,
    reverse: 3,
    closed: true,
  },
  stopped: {
    label: "Both processes arrested",
    a: 14,
    b: 6,
    forward: 0,
    reverse: 0,
    closed: true,
  },
};
export function tokenSnapshot(r: TurnoverRecord, step: number) {
  const ids = Array.from({ length: r.a + r.b }, (_, i) => ({
    id: i + 1,
    state: i < r.a ? "A" : "B",
    changed: false,
  }));
  for (let s = 0; s < step; s++) {
    const a = ids.filter((x) => x.state === "A"),
      b = ids.filter((x) => x.state === "B");
    const forward = Array.from(
      { length: r.forward },
      (_, j) => a[(s * r.forward + j) % a.length],
    );
    const reverse = Array.from(
      { length: r.reverse },
      (_, j) => b[(s * r.reverse + j) % b.length],
    );
    ids.forEach((x) => (x.changed = false));
    forward.forEach((x) => {
      x.state = "B";
      x.changed = true;
    });
    reverse.forEach((x) => {
      x.state = "A";
      x.changed = true;
    });
  }
  return ids;
}
export const turnoverMax = (r: TurnoverRecord) =>
  r.forward === r.reverse && r.forward > 0 ? 6 : 1;
export type RateRecord = {
  label: string;
  a: number;
  b: number;
  forward: number;
  reverse: number;
  seconds: number;
  closed: boolean;
};
export const reversibleRates: Record<string, RateRecord> = {
  initial: {
    label: "Equal rates, unequal amounts",
    a: 14,
    b: 6,
    forward: 2,
    reverse: 2,
    seconds: 2,
    closed: true,
  },
  increasing: {
    label: "Net product formation",
    a: 16,
    b: 4,
    forward: 3,
    reverse: 1,
    seconds: 2,
    closed: true,
  },
  decreasing: {
    label: "Net reactant formation",
    a: 6,
    b: 14,
    forward: 1,
    reverse: 3,
    seconds: 2,
    closed: true,
  },
  equalAmounts: {
    label: "Equal amounts alone",
    a: 10,
    b: 10,
    forward: 2,
    reverse: 1,
    seconds: 3,
    closed: true,
  },
  arrested: {
    label: "Zero directional rates",
    a: 14,
    b: 6,
    forward: 0,
    reverse: 0,
    seconds: 4,
    closed: true,
  },
  faster: {
    label: "Catalysed equilibrium comparison",
    a: 14,
    b: 6,
    forward: 6,
    reverse: 6,
    seconds: 1,
    closed: true,
  },
};
export function rateOutcome(r: RateRecord) {
  const net = (r.forward - r.reverse) * r.seconds;
  return {
    net,
    a: r.a - net,
    b: r.b + net,
    equilibrium: r.closed && r.forward === r.reverse && r.forward > 0,
  };
}
export type BoundaryRecord = {
  label: string;
  description: string;
  boundary: "closed" | "open";
  rates: "equalPositive" | "unequal" | "zero" | "unknown";
  amounts: "constant" | "changing" | "oneSnapshot";
  classification: "equilibrium" | "notEquilibrium" | "insufficient";
  reason: string;
};
export const boundaryRecords: Record<string, BoundaryRecord> = {
  initial: {
    label: "Closed, continuing reaction",
    description:
      "All reacting matter is retained. At fixed temperature, A and B amounts stay constant while forward and reverse reactions continue at equal positive rates.",
    boundary: "closed",
    rates: "equalPositive",
    amounts: "constant",
    classification: "equilibrium",
    reason: "closedEqualContinuing",
  },
  escaping: {
    label: "Product gas escapes",
    description:
      "A reversible gas reaction has an outlet. Product escapes and the measured forward and reverse rates differ.",
    boundary: "open",
    rates: "unequal",
    amounts: "changing",
    classification: "notEquilibrium",
    reason: "matterEscapes",
  },
  stopped: {
    label: "Arrested change",
    description:
      "A closed sample has constant amounts because both measured reaction rates are zero. The report provides no continuing reactions.",
    boundary: "closed",
    rates: "zero",
    amounts: "constant",
    classification: "notEquilibrium",
    reason: "noContinuing",
  },
  equalAmounts: {
    label: "One equal-amount snapshot",
    description:
      "A closed sample contains equal amounts of A and B in one snapshot. No time series or directional rates were measured.",
    boundary: "closed",
    rates: "unknown",
    amounts: "oneSnapshot",
    classification: "insufficient",
    reason: "amountsNotRates",
  },
  flow: {
    label: "Steady flow",
    description:
      "A enters and B leaves an open flow apparatus. Constant vessel amounts result from external flow; the chemical forward and reverse rates are unequal.",
    boundary: "open",
    rates: "unequal",
    amounts: "constant",
    classification: "notEquilibrium",
    reason: "externalFlow",
  },
  plateau: {
    label: "Plateau without rate evidence",
    description:
      "In a closed sample, amounts appear constant over the observation period. No evidence distinguishes continuing balanced reactions from an arrested process.",
    boundary: "closed",
    rates: "unknown",
    amounts: "constant",
    classification: "insufficient",
    reason: "plateauAlone",
  },
};
export type EvidenceRecord = {
  label: string;
  times: number[];
  a: number[];
  b: number[];
  forward: number[];
  reverse: number[];
  closed: boolean;
  first: number | null;
  reason: string;
};
export const equilibriumEvidence: Record<string, EvidenceRecord> = {
  initial: {
    label: "Approach from mostly A",
    times: [0, 2, 4, 6, 8],
    a: [18, 14, 13, 13, 13],
    b: [2, 6, 7, 7, 7],
    forward: [4, 3, 2, 2, 2],
    reverse: [1, 2, 2, 2, 2],
    closed: true,
    first: 4,
    reason: "equalContinuing",
  },
  reverse: {
    label: "Approach from mostly B",
    times: [0, 3, 6, 9, 12],
    a: [3, 12, 15, 15, 15],
    b: [17, 8, 5, 5, 5],
    forward: [0.5, 1, 2, 2, 2],
    reverse: [4.5, 3, 2, 2, 2],
    closed: true,
    first: 6,
    reason: "equalContinuing",
  },
  equalAmounts: {
    label: "Amounts cross once",
    times: [0, 1, 2, 3],
    a: [14, 10, 8, 7],
    b: [6, 10, 12, 13],
    forward: [6, 4, 2, 2],
    reverse: [1, 1, 1, 1],
    closed: true,
    first: null,
    reason: "amountsNotRates",
  },
  stopped: {
    label: "Flat but stopped",
    times: [0, 2, 4, 6],
    a: [14, 14, 14, 14],
    b: [6, 6, 6, 6],
    forward: [0, 0, 0, 0],
    reverse: [0, 0, 0, 0],
    closed: true,
    first: null,
    reason: "noContinuing",
  },
  catalyst: {
    label: "Faster continuing turnover",
    times: [0, 1, 2, 3, 4],
    a: [18, 14, 13, 13, 13],
    b: [2, 6, 7, 7, 7],
    forward: [8, 6, 4, 4, 4],
    reverse: [2, 4, 4, 4, 4],
    closed: true,
    first: 2,
    reason: "equalContinuing",
  },
  open: {
    label: "Open steady flow",
    times: [0, 2, 4, 6],
    a: [12, 12, 12, 12],
    b: [8, 8, 8, 8],
    forward: [3, 3, 3, 3],
    reverse: [1, 1, 1, 1],
    closed: false,
    first: null,
    reason: "externalFlow",
  },
};
