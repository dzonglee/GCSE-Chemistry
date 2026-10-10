export type RatesMode =
  "interval" | "mass" | "plot" | "trend" | "compare" | "evidence";
export type RateData = {
  times: readonly number[];
  values: readonly number[];
  unit: string;
  quantity: string;
  max: number;
  step: number;
  label: string;
};
export const gasData: RateData = {
  times: [0, 10, 20, 30, 40, 50, 60],
  values: [0, 20, 34, 44, 50, 50, 50],
  unit: "cm³",
  quantity: "Gas collected",
  max: 60,
  step: 10,
  label:
    "Constructed measured gas volume; cumulative product, not instantaneous rate.",
};
export const specimenData: RateData = {
  times: [0, 20, 40, 60, 80, 100, 120],
  values: [0, 1.6, 2.6, 2.9, 3.7, 4, 4],
  unit: "g",
  quantity: "Mass lost",
  max: 5,
  step: 1,
  label:
    "Actual specimen Foundation Q 09 observations; retain the anomalous 60 s point.",
};
export const reactantData: RateData = {
  times: [0, 10, 20, 30, 40, 50, 60],
  values: [6, 4, 2.6, 1.6, 1, 1, 1],
  unit: "g",
  quantity: "Reactant remaining",
  max: 7,
  step: 1,
  label:
    "Constructed remaining-reactant data. Another limiting reactant is exhausted; some of this reactant remains.",
};
export const lightData: RateData = {
  times: [0, 20, 40, 60, 80, 100, 120],
  values: [95, 55, 37, 28, 24, 24, 24],
  unit: "%",
  quantity: "Light reaching sensor",
  max: 100,
  step: 20,
  label:
    "Constructed readings matching the falling shape of the actual 2022 experiment; light percentage is an indirect signal, not calibrated chemical amount.",
};
export const anomalousGas: RateData = {
  ...gasData,
  values: [0, 20, 34, 60, 50, 50, 50],
  label:
    "Constructed gas data retain the unusual 30 s observation 60 cm³. Separate repeats at 30 s give 44/45/46 cm³; use those to justify a fit, not to erase the original.",
};
export const acceleratingData: RateData = {
  ...gasData,
  values: [0, 2, 6, 12, 20, 30, 42],
  label:
    "Exact constructed increasing-rate product data; no plateau has been established in this interval.",
};
export const uniformData: RateData = {
  ...gasData,
  values: [0, 5, 10, 15, 20, 25, 30],
  label:
    "Exact constructed constant-rate product data over the displayed interval; no completed-reaction claim.",
};
export const ratesRecords = {
  interval: {
    initial: {
      label:
        "Gas rises from 20 cm³ at 10 s to 44 cm³ at 30 s. Calculate this interval mean, not final volume divided by final time.",
      startTime: 10,
      endTime: 30,
      startQuantity: 20,
      endQuantity: 44,
      quantity: 24,
      seconds: 20,
      rate: 1.2,
      operation: "change-over-elapsed-time",
      kind: "product-formation",
      unit: "cm³/s",
    },
    whole: {
      label:
        "Gas rises from 0 to 50 cm³ over 0–40 s. Calculate the whole stated-interval mean.",
      startTime: 0,
      endTime: 40,
      startQuantity: 0,
      endQuantity: 50,
      quantity: 50,
      seconds: 40,
      rate: 1.25,
      operation: "change-over-elapsed-time",
      kind: "product-formation",
      unit: "cm³/s",
    },
    late: {
      label:
        "Gas rises from 44 cm³ at 30 s to 50 cm³ at 40 s. Calculate the late interval mean.",
      startTime: 30,
      endTime: 40,
      startQuantity: 44,
      endQuantity: 50,
      quantity: 6,
      seconds: 10,
      rate: 0.6,
      operation: "change-over-elapsed-time",
      kind: "product-formation",
      unit: "cm³/s",
    },
    stopped: {
      label:
        "Gas stays 50 cm³ from 40 s to 60 s. Calculate the observed interval mean, not 50/60.",
      startTime: 40,
      endTime: 60,
      startQuantity: 50,
      endQuantity: 50,
      quantity: 0,
      seconds: 20,
      rate: 0,
      operation: "change-over-elapsed-time",
      kind: "product-formation",
      unit: "cm³/s",
    },
    consumption: {
      label:
        "Reactant remaining falls from 6 g at 10 s to 2 g at 30 s. Calculate its positive mean consumption rate.",
      startTime: 10,
      endTime: 30,
      startQuantity: 6,
      endQuantity: 2,
      quantity: 4,
      seconds: 20,
      rate: 0.2,
      operation: "change-over-elapsed-time",
      kind: "reactant-consumption",
      unit: "g/s",
    },
    minutes: {
      label:
        "Actual specimen different-reaction values:9.85 g lost in 2 minutes 30 seconds. Enter 150 s and the mean rounded to TWO decimal places.",
      startTime: 0,
      endTime: 150,
      startQuantity: 0,
      endQuantity: 9.85,
      quantity: 9.85,
      seconds: 150,
      rate: 0.07,
      operation: "change-over-elapsed-time",
      kind: "product-formation",
      unit: "g/s",
    },
    offset: {
      label:
        "A reaction is first sampled at 1min 20 s with 12 cm³ gas and again at 2min 20 s with 42 cm³ gas. Calculate only that sampled interval.",
      startTime: 80,
      endTime: 140,
      startQuantity: 12,
      endQuantity: 42,
      quantity: 30,
      seconds: 60,
      rate: 0.5,
      operation: "change-over-elapsed-time",
      kind: "product-formation",
      unit: "cm³/s",
    },
  },
  mass: {
    initial: {
      label:
        "Same flask+contents balance:182.4 g at 0 s,178.4 g at 100 s. Only produced CO₂ escapes; no evaporation/spray. Porous cotton wool retains droplets. Infer escaped-gas mean.",
      startMass: 182.4,
      endMass: 178.4,
      startTime: 0,
      endTime: 100,
      quantity: 4,
      seconds: 100,
      rate: 0.04,
      cause: "gas-escaped",
      closure: "porous-cotton-wool",
      claim: "mass-loss-tracks-escaped-gas",
    },
    later: {
      label:
        "Same porous flask:180.8 g at 20 s and 178.7 g at 80 s. Only CO₂ escapes. Calculate this interval, not total contents mass/time.",
      startMass: 180.8,
      endMass: 178.7,
      startTime: 20,
      endTime: 80,
      quantity: 2.1,
      seconds: 60,
      rate: 0.035,
      cause: "gas-escaped",
      closure: "porous-cotton-wool",
      claim: "mass-loss-tracks-escaped-gas",
    },
    sealed: {
      label:
        "A safely specified sealed demonstration retains produced gas:182.4 g at 0 s and 182.4 g at 100 s although chemical reaction occurs. Report observed balance loss/time; do not invent a zero chemical rate. This is boundary interpretation, not practical instructions.",
      startMass: 182.4,
      endMass: 182.4,
      startTime: 0,
      endTime: 100,
      quantity: 0,
      seconds: 100,
      rate: 0,
      cause: "gas-retained",
      closure: "sealed-boundary",
      claim: "balance-loss-does-not-establish-chemical-rate",
    },
    evaporation: {
      label:
        "Open flask loses 0.6 g in 60 s. Both CO₂ loss and solvent evaporation may contribute. Report observed balance-loss rate, then state its chemical interpretation limit.",
      startMass: 110.6,
      endMass: 110,
      startTime: 0,
      endTime: 60,
      quantity: 0.6,
      seconds: 60,
      rate: 0.01,
      cause: "gas-and-solvent-loss",
      closure: "open-neck",
      claim: "balance-loss-does-not-establish-chemical-rate",
    },
    spray: {
      label:
        "Open flask loses 0.5 g in 50 s, but gas and liquid spray escape. Report observed mass-loss rate; the reading cannot isolate the chemical gas-production rate.",
      startMass: 90.5,
      endMass: 90,
      startTime: 0,
      endTime: 50,
      quantity: 0.5,
      seconds: 50,
      rate: 0.01,
      cause: "gas-and-droplet-loss",
      closure: "open-neck",
      claim: "balance-loss-does-not-establish-chemical-rate",
    },
    total: {
      label:
        "Same porous flask+contents falls 95.6→94.7 g during 0–30 s; flask mass is 60 g and retained material remains. Only CO₂ escapes. Do not divide total flask mass by time.",
      startMass: 95.6,
      endMass: 94.7,
      startTime: 0,
      endTime: 30,
      quantity: 0.9,
      seconds: 30,
      rate: 0.03,
      cause: "gas-escaped",
      closure: "porous-cotton-wool",
      claim: "mass-loss-tracks-escaped-gas",
    },
  },
  plot: {
    initial: {
      label:
        "Plot all seven actual specimen observations, including 60 s/2.9 g. Construct a separate supported smooth fit using the shown practice guidance bands. A useful fit is not a requirement to pass through the anomaly.",
      data: specimenData,
      curve: [0, 1.6, 2.6, 3.25, 3.7, 4, 4],
      tolerance: 0.15,
      reason: "retain-observation-fit-supported-pattern",
    },
    clean: {
      label:
        "Plot the constructed gas observations and draw the stated practice fit through the supplied guidance bands. The nonzero plateau means no further gas change, not zero total gas.",
      data: gasData,
      curve: [0, 20, 34, 44, 50, 50, 50],
      tolerance: 1,
      reason: "retain-observation-fit-supported-pattern",
    },
    reactant: {
      label:
        "Plot remaining-reactant observations and separately construct their falling practice fit. Keep 1 g residual; do not force the curve to zero.",
      data: reactantData,
      curve: [6, 4, 2.6, 1.6, 1, 1, 1],
      tolerance: 0.15,
      reason: "retain-observation-fit-supported-pattern",
    },
    light: {
      label:
        "Plot the constructed light-percentage observations and separately draw their falling supported fit. Neither a percentage-point slope nor geometry is a calibrated chemical amount rate.",
      data: lightData,
      curve: [95, 55, 37, 28, 24, 24, 24],
      tolerance: 1,
      reason: "retain-observation-fit-supported-pattern",
    },
    anomaly: {
      label:
        "Plot the original unusual 30 s/60 cm³ point without erasing it. Repeats 44/45/46 cm³ justify a separate fit near 45 cm³ at 30 s. Other supplied guidance bands retain the supported trend.",
      data: anomalousGas,
      curve: [0, 20, 34, 45, 50, 50, 50],
      tolerance: 1,
      reason: "retain-observation-fit-supported-pattern",
    },
  },
  trend: {
    initial: {
      label:
        "Inspect gas collected against time. Classify signal direction and interval-rate trend, then distinguish final amount from rate at a moment.",
      data: gasData,
      direction: "rising-then-flat",
      rateTrend: "slowing-then-zero",
      fastest: "earliest-interval",
      endClaim: "no-further-net-product",
      rateView: "tangent-at-moment",
    },
    reactant: {
      label:
        "Inspect remaining-reactant against time. Consumption is positive although the plotted change is negative;1 g remains after the other limiting reactant is exhausted.",
      data: reactantData,
      direction: "falling-then-flat",
      rateTrend: "slowing-then-zero",
      fastest: "earliest-interval",
      endClaim: "not-all-reactants-must-be-used-up",
      rateView: "tangent-at-moment",
    },
    light: {
      label:
        "Inspect the constructed light-percentage signal with the stated cloudiness link. It falls and flattens; this indirect signal does not give a calibrated mass or volume rate.",
      data: lightData,
      direction: "falling-then-flat",
      rateTrend: "slowing-then-zero",
      fastest: "earliest-interval",
      endClaim: "signal-change-has-stopped",
      rateView: "tangent-at-moment",
    },
    accelerating: {
      label:
        "Exact increasing-rate product data. Compare successive equal 10 s intervals; no reaction-completion plateau is shown.",
      data: acceleratingData,
      direction: "rising-throughout",
      rateTrend: "speeding-up",
      fastest: "latest-interval",
      endClaim: "no-completion-shown",
      rateView: "tangent-at-moment",
    },
    uniform: {
      label:
        "Exact constant-rate product data. Equal product changes occur in equal 10 s intervals; final height is not instantaneous rate.",
      data: uniformData,
      direction: "rising-throughout",
      rateTrend: "constant-nonzero",
      fastest: "equal-interval-means",
      endClaim: "no-completion-shown",
      rateView: "tangent-at-moment",
    },
    plateau: {
      label:
        "The constructed collected gas is already 50 cm³ throughout 40–60 s. Distinguish its nonzero amount from its zero change/time.",
      data: {
        ...gasData,
        times: [40, 45, 50, 55, 60],
        values: [50, 50, 50, 50, 50],
      },
      direction: "flat-throughout",
      rateTrend: "zero-throughout",
      fastest: "equal-interval-means",
      endClaim: "no-further-net-product",
      rateView: "tangent-at-moment",
    },
  },
  compare: {
    initial: {
      label:
        "Matching observed intervals: A 20 cm³/10 s; B 20 cm³/20 s. Their final collected amounts both 50 cm³. Compare interval mean and final amount separately.",
      aQuantity: 20,
      aSeconds: 10,
      bQuantity: 20,
      bSeconds: 20,
      aFinal: 50,
      bFinal: 50,
      aRate: 2,
      bRate: 1,
      faster: "A",
      yield: "equal-final-amounts",
      basis: "changes-over-their-elapsed-times",
    },
    yield: {
      label:
        "A gives 20 cm³/10 s, final 30 cm³; B gives 15 cm³/10 s, final 60 cm³. Faster interval does not guarantee more final product.",
      aQuantity: 20,
      aSeconds: 10,
      bQuantity: 15,
      bSeconds: 10,
      aFinal: 30,
      bFinal: 60,
      aRate: 2,
      bRate: 1.5,
      faster: "A",
      yield: "B-more-final-product",
      basis: "changes-over-their-elapsed-times",
    },
    equal: {
      label:
        "A gives 30 cm³/15 s; B gives 40 cm³/20 s. Both finish at 60 cm³. Different raw amounts/time can give equal interval means.",
      aQuantity: 30,
      aSeconds: 15,
      bQuantity: 40,
      bSeconds: 20,
      aFinal: 60,
      bFinal: 60,
      aRate: 2,
      bRate: 2,
      faster: "equal",
      yield: "equal-final-amounts",
      basis: "changes-over-their-elapsed-times",
    },
    different: {
      label:
        "A gives 24 cm³/12 s, final 40 cm³; B gives 36 cm³/6 s, final 60 cm³. Compare actual changes/time, not time alone.",
      aQuantity: 24,
      aSeconds: 12,
      bQuantity: 36,
      bSeconds: 6,
      aFinal: 40,
      bFinal: 60,
      aRate: 2,
      bRate: 6,
      faster: "B",
      yield: "B-more-final-product",
      basis: "changes-over-their-elapsed-times",
    },
    reversal: {
      label:
        "A gives 30 cm³/30 s, final 80 cm³; B gives 20 cm³/5 s, final 50 cm³. B is faster over its stated interval although A finally gives more gas.",
      aQuantity: 30,
      aSeconds: 30,
      bQuantity: 20,
      bSeconds: 5,
      aFinal: 80,
      bFinal: 50,
      aRate: 1,
      bRate: 4,
      faster: "B",
      yield: "A-more-final-product",
      basis: "changes-over-their-elapsed-times",
    },
  },
  evidence: {
    initial: {
      label:
        "The balance loses mass while CO₂ leaves an open flask. Explain the boundary without claiming destroyed atoms.",
      claim: "mass-leaves-the-weighed-boundary",
      reason: "produced-gas-escapes-while-atoms-are-conserved",
    },
    sensor: {
      label:
        "A light signal falls from 95 % to 24 % and stays 24 %. No amount calibration is supplied. Judge what can be inferred numerically.",
      claim: "no-calibrated-chemical-amount-rate",
      reason: "percentage-light-is-an-indirect-signal",
    },
    endpoint: {
      label:
        "Two same-path cross-disappearance times 30 s and 60 s are compared under matching geometry/endpoint. Judge 1/time, without assigning it g/s.",
      claim: "inverse-time-is-a-relative-rate-index",
      reason: "same-endpoint-is-required-and-units-are-per-second",
    },
    anomaly: {
      label:
        "Retain the original 60 cm³ point at 30 s. Repeats at 30 s are 44,45,46 cm³ and other points follow a smooth plateau. Justify the separate fit.",
      claim: "retain-original-and-fit-supported-pattern",
      reason: "repeats-support-the-trend-without-changing-observations",
    },
    controls: {
      label:
        "One experiment changes metal mass and acid concentration; another changes only acid concentration. Can an effect of concentration be isolated from the first?",
      claim: "two-changes-do-not-isolate-one-effect",
      reason: "other-relevant-variables-must-be-controlled",
    },
    sealed: {
      label:
        "A specified closed reacting system retains all products and its balance reading stays constant. Is chemical reaction absent?",
      claim: "constant-total-mass-does-not-prove-no-reaction",
      reason: "retained-products-preserve-the-weighed-total",
    },
  },
} as const;
const common = { record: [] as readonly string[] };
export const ratesOptions: Record<
  RatesMode,
  Record<string, readonly string[]>
> = {
  interval: {
    ...common,
    kind: [
      "unset",
      "product-formation",
      "reactant-consumption",
      "whole-apparatus-mass",
    ],
    operation: [
      "unset",
      "change-over-elapsed-time",
      "end-value-over-end-time",
      "elapsed-time-over-change",
    ],
    unit: ["unset", "g/s", "cm³/s", "s/g", "s/cm³"],
  },
  mass: {
    ...common,
    cause: [
      "unset",
      "gas-escaped",
      "gas-retained",
      "gas-and-solvent-loss",
      "gas-and-droplet-loss",
      "atoms-destroyed",
    ],
    closure: ["unset", "porous-cotton-wool", "sealed-boundary", "open-neck"],
    claim: [
      "unset",
      "mass-loss-tracks-escaped-gas",
      "balance-loss-does-not-establish-chemical-rate",
      "constant-balance-proves-no-reaction",
    ],
  },
  plot: {
    ...common,
    reason: [
      "unset",
      "retain-observation-fit-supported-pattern",
      "erase-observation-to-improve-curve",
      "join-every-observation-with-straight-segments",
    ],
  },
  trend: {
    ...common,
    direction: [
      "unset",
      "rising-then-flat",
      "falling-then-flat",
      "rising-throughout",
      "flat-throughout",
    ],
    rateTrend: [
      "unset",
      "slowing-then-zero",
      "speeding-up",
      "constant-nonzero",
      "zero-throughout",
    ],
    fastest: [
      "unset",
      "earliest-interval",
      "latest-interval",
      "equal-interval-means",
    ],
    endClaim: [
      "unset",
      "no-further-net-product",
      "not-all-reactants-must-be-used-up",
      "signal-change-has-stopped",
      "no-completion-shown",
      "all-reactants-must-be-gone",
    ],
    rateView: [
      "unset",
      "tangent-at-moment",
      "whole-interval-chord",
      "final-height-alone",
    ],
  },
  compare: {
    ...common,
    faster: ["unset", "A", "B", "equal"],
    yield: [
      "unset",
      "equal-final-amounts",
      "A-more-final-product",
      "B-more-final-product",
    ],
    basis: [
      "unset",
      "changes-over-their-elapsed-times",
      "final-amounts-alone",
      "times-alone",
    ],
  },
  evidence: {
    ...common,
    claim: [
      "unset",
      "mass-leaves-the-weighed-boundary",
      "no-calibrated-chemical-amount-rate",
      "inverse-time-is-a-relative-rate-index",
      "retain-original-and-fit-supported-pattern",
      "two-changes-do-not-isolate-one-effect",
      "constant-total-mass-does-not-prove-no-reaction",
      "all-zero-signals-prove-no-reaction",
      "atoms-are-destroyed",
    ],
    reason: [
      "unset",
      "produced-gas-escapes-while-atoms-are-conserved",
      "percentage-light-is-an-indirect-signal",
      "same-endpoint-is-required-and-units-are-per-second",
      "repeats-support-the-trend-without-changing-observations",
      "other-relevant-variables-must-be-controlled",
      "retained-products-preserve-the-weighed-total",
      "graph-height-is-always-rate",
      "all-products-must-escape",
    ],
  },
};
for (const mode of Object.keys(ratesRecords) as RatesMode[])
  ratesOptions[mode].record = Object.keys(ratesRecords[mode]);
export const rateNumbers: Record<RatesMode, string[]> = {
  interval: ["quantity", "seconds", "rate"],
  mass: ["quantity", "seconds", "rate"],
  plot: [
    ...Array.from({ length: 7 }, (_, i) => [
      "p" + i + "x",
      "p" + i + "y",
      "c" + i,
    ]).flat(),
  ],
  trend: [],
  compare: ["aRate", "bRate"],
  evidence: [],
};
export function validRatesNumber(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^-?(?:0|[1-9]\d*)(?:\.\d{1,5})?$/.test(v) &&
    v !== "-0" &&
    Math.abs(Number(v)) <= 100000
  );
}
export function initialRatesBoard(
  mode: RatesMode,
  record = "initial",
): Record<string, string> {
  if (!ratesOptions[mode].record.includes(record))
    throw Error("Unknown supplied rates case");
  return Object.fromEntries([
    ...Object.keys(ratesOptions[mode]).map((k) => [
      k,
      k === "record" ? record : "unset",
    ]),
    ...rateNumbers[mode].map((k) => [k, "0"]),
  ]);
}
export function validRatesBoard(
  mode: RatesMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>;
  return (
    Object.keys(b).length === Object.keys(initialRatesBoard(mode)).length &&
    Object.entries(ratesOptions[mode]).every(
      ([k, opts]) => typeof b[k] === "string" && opts.includes(b[k] as string),
    ) &&
    rateNumbers[mode].every((k) => validRatesNumber(b[k]))
  );
}
export function ratesHistoryStep(mode: RatesMode, a: unknown, b: unknown) {
  if (!validRatesBoard(mode, a) || !validRatesBoard(mode, b)) return false;
  if (a.record !== b.record) {
    const reset = initialRatesBoard(mode, b.record);
    return Object.keys(reset).every((k) => b[k] === reset[k]);
  }
  return Object.keys(a).filter((k) => a[k] !== b[k]).length === 1;
}
export function plotReference(
  mode: RatesMode,
  board: Record<string, string | number>,
): RateData | undefined {
  if (mode === "plot")
    return ratesRecords.plot[board.record as keyof typeof ratesRecords.plot]
      .data;
  if (mode === "trend")
    return ratesRecords.trend[board.record as keyof typeof ratesRecords.trend]
      .data;
  return undefined;
}
/** Monotone cubic Hermite interpolation within each segment; wrong knot values remain the student's values. */
export function rateCurveSamples(
  times: readonly number[],
  values: readonly number[],
  subdivisions = 16,
) {
  if (
    times.length !== values.length ||
    times.length < 2 ||
    !times.every(Number.isFinite) ||
    !values.every(Number.isFinite) ||
    times.some((t, i) => i > 0 && t <= times[i - 1])
  )
    return [];
  const n = times.length,
    delta = times
      .slice(1)
      .map((t, i) => (values[i + 1] - values[i]) / (t - times[i])),
    m = values.map((_, i) =>
      i === 0
        ? delta[0]
        : i === n - 1
          ? delta[n - 2]
          : delta[i - 1] * delta[i] <= 0
            ? 0
            : 2 / (1 / delta[i - 1] + 1 / delta[i]),
    );
  for (let i = 0; i < n - 1; i++) {
    if (delta[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / delta[i],
      b = m[i + 1] / delta[i],
      s = a * a + b * b;
    if (s > 9) {
      const scale = 3 / Math.sqrt(s);
      m[i] = scale * a * delta[i];
      m[i + 1] = scale * b * delta[i];
    }
  }
  const points: { t: number; q: number }[] = [];
  for (let i = 0; i < n - 1; i++)
    for (let j = 0; j < subdivisions; j++) {
      const u = j / subdivisions,
        h = times[i + 1] - times[i],
        q =
          (2 * u ** 3 - 3 * u * u + 1) * values[i] +
          (u ** 3 - 2 * u * u + u) * h * m[i] +
          (-2 * u ** 3 + 3 * u * u) * values[i + 1] +
          (u ** 3 - u * u) * h * m[i + 1];
      points.push({ t: times[i] + h * u, q });
    }
  points.push({ t: times[n - 1], q: values[n - 1] });
  return points;
}
export function ratesPrediction(
  mode: RatesMode,
  b: Record<string, string | number>,
) {
  if (!validRatesBoard(mode, b))
    return {
      correct: false,
      explanation:
        "This saved state has invalid fields; the supplied canonical reset remains available.",
    };
  const r = (
    ratesRecords[mode] as unknown as Record<string, Record<string, unknown>>
  )[b.record];
  let correct = false;
  if (mode === "plot") {
    const p = ratesRecords.plot[b.record as keyof typeof ratesRecords.plot],
      curve = p.data.times.map((_, i) => Number(b["c" + i]));
    correct =
      p.data.times.every(
        (t, i) =>
          Number(b["p" + i + "x"]) === t &&
          Number(b["p" + i + "y"]) === p.data.values[i],
      ) &&
      curve.every(
        (v, i) =>
          v >= 0 &&
          v <= p.data.max &&
          Math.abs(v - p.curve[i]) <= p.tolerance + 1e-9 &&
          (i === 0 || p.curve[i] === p.curve[i - 1]
            ? i === 0 || v === curve[i - 1]
            : p.curve[i] > p.curve[i - 1]
              ? v >= curve[i - 1]
              : v <= curve[i - 1]),
      ) &&
      b.reason === p.reason;
    return {
      correct,
      explanation: correct
        ? "Every original observation is retained at its supplied coordinates. Your separate smooth curve lies within the stated practice guidance bands and preserves the plateau/remaining amount. It does not rewrite the anomaly. These guidance checks are practice support, not examiner graph marks."
        : "Retain each original point, including the unusual one, at its actual time/quantity. Edit the separate curve knots to follow the supported pattern and stated practice guidance bands; preserve any plateau. Do not erase or move an observation to make the fit look better.",
    };
  }
  correct = Object.keys(b)
    .filter((k) => k !== "record")
    .every((k) =>
      rateNumbers[mode].includes(k)
        ? Math.abs(Number(b[k]) - Number(r[k])) < 1e-9
        : b[k] === r[k],
    );
  if (mode === "interval" && b.record === "minutes")
    correct = correct && /^\d+\.\d{2}$/.test(String(b.rate));
  const explanations: Record<RatesMode, string> = {
    interval: `Use quantity change ${r.quantity} over elapsed ${r.seconds} s, keeping the stated ${r.kind === "reactant-consumption" ? "positive reactant consumption" : "product formation"} convention. The requested mean is ${r.rate} ${r.unit}; ${b.record === "minutes" ? "9.85/150 is rounded only at the final requested two decimal places. " : ""}A finite-interval mean is not an instantaneous tangent slope or final graph height.`,
    mass: `Observed same-boundary balance loss is ${r.quantity} g over ${r.seconds} s, giving ${r.rate} g/s. ${r.claim === "mass-loss-tracks-escaped-gas" ? "Under the stated no-evaporation/no-spray conditions, this tracks escaped gas. The flask itself and retained contents must not become the numerator." : "This observed balance-loss rate does not by itself establish chemical gas-production rate under the stated retained-gas or mixed-loss conditions."} Atoms are conserved across the wider system.`,
    plot: "",
    trend: `Distinguish the recorded ${String(r.direction).replaceAll("-", " ")} signal from ${String(r.rateTrend).replaceAll("-", " ")} reaction/observed-change behaviour. The stated evidence supports ${String(r.endClaim).replaceAll("-", " ")}. Compare equal-time changes; rate at a specific moment is represented by a tangent, not the endpoint height. A falling reactant amount can have positive consumption rate, and a falling light signal is not a calibrated chemical amount.`,
    compare: `A mean ${r.aRate} cm³/s; B mean ${r.bRate} cm³/s. Compare quantity changes divided by their own elapsed times; ${r.faster === "equal" ? "these interval means match" : r.faster + " is faster over its stated interval"}. Final product comparison is a separate claim: ${String(r.yield).replaceAll("-", " ")}. These interval means do not establish the rate at every instant.`,
    evidence: `Supported claim: ${String(r.claim).replaceAll("-", " ")}. Reason: ${String(r.reason).replaceAll("-", " ")}. Preserve observations and measurement boundaries; distinguish chemical amount, indirect signal, calibrated units and relevant controlled conditions.`,
  };
  return {
    correct,
    explanation: correct
      ? explanations[mode]
      : "Check each independent quantity, elapsed time, interpretation and stated unit/condition. Your chosen values remain unchanged. " +
        explanations[mode],
  };
}
