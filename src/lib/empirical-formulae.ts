export type EmpiricalMode =
  "masses" | "fraction" | "percent" | "molecular" | "experiment";
const positive = (v: number, label: string) => {
  if (!Number.isFinite(v) || v <= 0)
    throw Error(`${label} must be positive and finite`);
};
export function elementAmounts(
  masses: readonly number[],
  atomicMasses: readonly number[],
) {
  if (masses.length < 2 || masses.length !== atomicMasses.length)
    throw Error("Supply each element mass and atomic mass");
  return masses.map((mass, i) => {
    positive(mass, "Element mass");
    positive(atomicMasses[i], "Atomic mass");
    return mass / atomicMasses[i];
  });
}
export function normaliseAmounts(amounts: readonly number[]) {
  if (amounts.length < 2) throw Error("Supply at least two elements");
  amounts.forEach((v) => positive(v, "Element amount"));
  const smallest = Math.min(...amounts);
  return amounts.map((v) => v / smallest);
}
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}
/** Tolerance must reflect the supplied measurement precision; it is not permission to round 1.5 to 2. */
export function wholeNumberRatio(amounts: readonly number[], tolerance = 1e-8) {
  if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 0.05)
    throw Error("Supply a justified small ratio tolerance");
  const normalised = normaliseAmounts(amounts);
  for (let multiplier = 1; multiplier <= 12; multiplier++) {
    const scaled = normalised.map((v) => v * multiplier),
      counts = scaled.map(Math.round);
    if (scaled.every((v, i) => Math.abs(v - counts[i]) <= tolerance + 1e-10)) {
      const common = counts.reduce(gcd);
      return { normalised, multiplier, counts: counts.map((v) => v / common) };
    }
  }
  return { normalised, multiplier: null, counts: null };
}
export function formulaFromCounts(
  symbols: readonly string[],
  counts: readonly number[],
) {
  if (symbols.length !== counts.length || symbols.length < 1)
    throw Error("Match each element and count");
  return symbols
    .map((s, i) => {
      if (
        !/^[A-Z][a-z]?$/.test(s) ||
        !Number.isInteger(counts[i]) ||
        counts[i] < 1
      )
        throw Error("Use element symbols and positive whole subscripts");
      return s + (counts[i] === 1 ? "" : counts[i]);
    })
    .join("");
}
export function molecularScale(empiricalMass: number, molecularMass: number) {
  positive(empiricalMass, "Empirical formula mass");
  positive(molecularMass, "Relative molecular mass");
  const factor = molecularMass / empiricalMass,
    integer = Math.round(factor);
  return {
    factor,
    consistent: integer >= 1 && Math.abs(factor - integer) < 1e-8,
    multiplier:
      integer >= 1 && Math.abs(factor - integer) < 1e-8 ? integer : null,
  };
}
export function crucibleAmounts(
  tare: number,
  withMetal: number,
  final: number,
) {
  if (
    !Number.isFinite(tare) ||
    tare < 0 ||
    !Number.isFinite(withMetal) ||
    !Number.isFinite(final) ||
    withMetal <= tare ||
    final <= withMetal
  )
    throw Error("Supply a positive metal mass and oxygen gain");
  return { metalMass: withMetal - tare, oxygenMass: final - withMetal };
}
export const empiricalRecords = {
  masses: {
    initial: {
      label: "4.8 g Mg and 3.2 g O; Ar 24 and 16",
      symbols: ["Mg", "O"],
      masses: [4.8, 3.2],
      atomic: [24, 16],
      unit: "g",
    },
    larger: {
      label: "9.6 g Mg and 6.4 g O; Ar 24 and 16",
      symbols: ["Mg", "O"],
      masses: [9.6, 6.4],
      atomic: [24, 16],
      unit: "g",
    },
    kilograms: {
      label: "0.0048 kg Mg and 3.2 g O; Ar 24 and 16",
      symbols: ["Mg", "O"],
      masses: [4.8, 3.2],
      atomic: [24, 16],
      unit: "mixed",
    },
  },
  fraction: {
    initial: {
      label: "Al:O relative amounts 0.4:0.6",
      symbols: ["Al", "O"],
      amounts: [0.4, 0.6],
    },
    halves: {
      label: "P:O relative amounts 0.3:0.75",
      symbols: ["P", "O"],
      amounts: [0.3, 0.75],
    },
    thirds: {
      label: "Fe:O relative amounts 0.6:0.8",
      symbols: ["Fe", "O"],
      amounts: [0.6, 0.8],
    },
  },
  percent: {
    initial: {
      label: "37.5% C, 12.5% H, 50.0% O; Ar 12, 1, 16",
      symbols: ["C", "H", "O"],
      masses: [37.5, 12.5, 50],
      atomic: [12, 1, 16],
      tolerance: 1e-8,
    },
    rounded: {
      label: "40.0% C, 6.7% H, 53.3% O; rounded analysis, Ar 12, 1, 16",
      symbols: ["C", "H", "O"],
      masses: [40, 6.7, 53.3],
      atomic: [12, 1, 16],
      tolerance: 0.025,
    },
    larger: {
      label: "A 200 g sample: 75 g C, 25 g H, 100 g O; same composition",
      symbols: ["C", "H", "O"],
      masses: [75, 25, 100],
      atomic: [12, 1, 16],
      tolerance: 1e-8,
    },
  },
  molecular: {
    initial: {
      label: "Empirical CH3; molecular Mr 30; Ar C=12, H=1",
      symbols: ["C", "H"],
      counts: [1, 3],
      empiricalMass: 15,
      molecularMass: 30,
    },
    larger: {
      label: "Empirical CH2; molecular Mr 56; Ar C=12, H=1",
      symbols: ["C", "H"],
      counts: [1, 2],
      empiricalMass: 14,
      molecularMass: 56,
    },
    peroxide: {
      label: "Empirical HO; molecular Mr 34; Ar H=1, O=16",
      symbols: ["H", "O"],
      counts: [1, 1],
      empiricalMass: 17,
      molecularMass: 34,
    },
    inconsistent: {
      label: "Empirical CH2; claimed molecular Mr 35; exact supplied data",
      symbols: ["C", "H"],
      counts: [1, 2],
      empiricalMass: 14,
      molecularMass: 35,
    },
  },
  experiment: {
    initial: {
      label:
        "Crucible 20.00 g; with Mg 20.48 g; cooled final readings 20.80, 20.80 g",
      tare: 20,
      withMetal: 20.48,
      previous: 20.8,
      final: 20.8,
      stable: true,
    },
    larger: {
      label:
        "Crucible 30.00 g; with Mg 30.72 g; cooled final readings 31.20, 31.20 g",
      tare: 30,
      withMetal: 30.72,
      previous: 31.2,
      final: 31.2,
      stable: true,
    },
    premature: {
      label:
        "Crucible 20.00 g; with Mg 20.48 g; cooled readings still rising: 20.68, 20.72 g",
      tare: 20,
      withMetal: 20.48,
      previous: 20.68,
      final: 20.72,
      stable: false,
    },
  },
} as const;
export const empiricalChoices: Record<
  EmpiricalMode,
  Record<string, readonly string[]>
> = {
  masses: {
    record: ["initial", "larger", "kilograms"],
    firstAmount: ["unset", "0.0048", "0.2", "0.4", "3.2", "4.8", "9.6"],
    secondAmount: ["unset", "0.2", "0.4", "3.2", "4.8", "6.4"],
    first: ["unset", "1", "2", "3"],
    second: ["unset", "1", "2", "3"],
    reason: ["unset", "mass-over-Ar", "mass-ratio", "equal-mass-equal-atoms"],
  },
  fraction: {
    record: ["initial", "halves", "thirds"],
    multiplier: ["unset", "1", "2", "3", "4"],
    first: ["unset", "1", "2", "3", "4"],
    second: ["unset", "1", "2", "3", "4", "5"],
    reason: [
      "unset",
      "multiply-all-then-simplify",
      "round-each",
      "multiply-one",
    ],
  },
  percent: {
    record: ["initial", "rounded", "larger"],
    first: ["unset", "1", "2", "3"],
    second: ["unset", "1", "2", "3", "4", "6"],
    third: ["unset", "1", "2", "3"],
    reason: [
      "unset",
      "percent-to-mass-to-amount",
      "percent-is-atom-ratio",
      "same-multiplier-one-element",
    ],
  },
  molecular: {
    record: ["initial", "larger", "peroxide", "inconsistent"],
    empiricalMass: ["unset", "14", "15", "17", "30", "35", "56"],
    multiplier: ["unset", "1", "2", "2.5", "4"],
    first: ["unset", "1", "2", "4", "undefined"],
    second: ["unset", "2", "3", "6", "8", "undefined"],
    reason: [
      "unset",
      "whole-molecular-multiple",
      "multiply-one-subscript",
      "divide-molecular-subscripts",
    ],
  },
  experiment: {
    record: ["initial", "larger", "premature"],
    metalMass: ["unset", "0.48", "0.72", "20.48", "30.72"],
    oxygenMass: [
      "unset",
      "0.24",
      "0.32",
      "0.48",
      "0.8",
      "1.2",
      "20.72",
      "20.8",
    ],
    first: ["unset", "1", "2", "3", "4"],
    second: ["unset", "1", "2", "3", "4"],
    reason: [
      "unset",
      "constant-mass-supports-ratio",
      "not-yet-constant",
      "use-total-product-as-oxygen",
      "oxygen-is-one-atom-per-gram",
    ],
  },
};
export function initialEmpiricalBoard(
  mode: EmpiricalMode,
): Record<string, string> {
  return Object.fromEntries(
    Object.keys(empiricalChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : "unset",
    ]),
  );
}
export function validEmpiricalBoard(
  mode: EmpiricalMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    keys = Object.keys(empiricalChoices[mode]);
  return (
    Object.keys(b).length === keys.length &&
    keys.every(
      (k) =>
        typeof b[k] === "string" &&
        empiricalChoices[mode][k].includes(b[k] as string),
    )
  );
}
export function empiricalExpected(
  mode: EmpiricalMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "masses") {
    const r =
        empiricalRecords.masses[key as keyof typeof empiricalRecords.masses],
      amounts = elementAmounts(r.masses, r.atomic),
      ratio = wholeNumberRatio(amounts);
    return {
      firstAmount: String(amounts[0]),
      secondAmount: String(amounts[1]),
      first: String(ratio.counts![0]),
      second: String(ratio.counts![1]),
      reason: "mass-over-Ar",
    };
  }
  if (mode === "fraction") {
    const r =
        empiricalRecords.fraction[
          key as keyof typeof empiricalRecords.fraction
        ],
      ratio = wholeNumberRatio(r.amounts);
    return {
      multiplier: String(ratio.multiplier),
      first: String(ratio.counts![0]),
      second: String(ratio.counts![1]),
      reason: "multiply-all-then-simplify",
    };
  }
  if (mode === "percent") {
    const r =
        empiricalRecords.percent[key as keyof typeof empiricalRecords.percent],
      ratio = wholeNumberRatio(elementAmounts(r.masses, r.atomic), r.tolerance);
    return {
      first: String(ratio.counts![0]),
      second: String(ratio.counts![1]),
      third: String(ratio.counts![2]),
      reason: "percent-to-mass-to-amount",
    };
  }
  if (mode === "molecular") {
    const r =
        empiricalRecords.molecular[
          key as keyof typeof empiricalRecords.molecular
        ],
      scale = molecularScale(r.empiricalMass, r.molecularMass);
    return {
      empiricalMass: String(r.empiricalMass),
      multiplier: String(scale.factor),
      first: scale.consistent
        ? String(r.counts[0] * scale.multiplier!)
        : "undefined",
      second: scale.consistent
        ? String(r.counts[1] * scale.multiplier!)
        : "undefined",
      reason: "whole-molecular-multiple",
    };
  }
  const r =
      empiricalRecords.experiment[
        key as keyof typeof empiricalRecords.experiment
      ],
    masses = crucibleAmounts(r.tare, r.withMetal, r.final),
    ratio = wholeNumberRatio(
      elementAmounts([masses.metalMass, masses.oxygenMass], [24, 16]),
    );
  return {
    metalMass: String(masses.metalMass),
    oxygenMass: String(masses.oxygenMass),
    first: String(ratio.counts![0]),
    second: String(ratio.counts![1]),
    reason: r.stable ? "constant-mass-supports-ratio" : "not-yet-constant",
  };
}
export function empiricalPrediction(
  mode: EmpiricalMode,
  b: Record<string, string | number>,
) {
  if (!validEmpiricalBoard(mode, b)) return { correct: false, complete: false };
  const expected = empiricalExpected(mode, b),
    complete = Object.keys(expected).every((k) => b[k] !== "unset");
  return {
    complete,
    correct:
      complete &&
      Object.entries(expected).every(
        ([k, value]) =>
          b[k] === value ||
          (!["reason", "first", "second", "third"].includes(k) &&
            Number.isFinite(Number(b[k])) &&
            Math.abs(Number(b[k]) - Number(value)) < 1e-7),
      ),
  };
}
