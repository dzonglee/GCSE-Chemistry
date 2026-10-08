/** Individually authored Higher rate-transfer teaching data. Exact constructed curves are not experimental fits. */
export type TangentMode =
  "construct" | "gradient" | "moles" | "calibration" | "evidence";
export type RateCurve = {
  start: number;
  end: number;
  max: number;
  unit: string;
  quantity: string;
  origin: number;
  a: number;
  b: number;
  c: number;
  at: number;
  label: string;
};
export const curveValue = (curve: RateCurve, t: number) =>
  curve.a * (t - curve.origin) ** 2 + curve.b * (t - curve.origin) + curve.c;
export const curveSlope = (curve: RateCurve, t: number) =>
  2 * curve.a * (t - curve.origin) + curve.b;
const gas: RateCurve = {
  start: 0,
  end: 40,
  max: 60,
  unit: "cm³",
  quantity: "Gas collected",
  origin: 0,
  a: -0.025,
  b: 2.5,
  c: 0,
  at: 20,
  label:
    "Exact constructed product curve over this stated interval; the curve equation is used only to draw consistent teaching geometry.",
};
const mass: RateCurve = {
  ...gas,
  max: 5,
  unit: "g",
  quantity: "Product formed",
  a: -0.001,
  b: 0.12,
  at: 20,
};
const remaining: RateCurve = {
  ...gas,
  max: 8,
  unit: "g",
  quantity: "Reactant remaining",
  a: 0.0025,
  b: -0.2,
  c: 6,
  at: 20,
};
export const tangentRecords = {
  construct: {
    initial: {
      label:
        "Construct the tangent at 20 s on this product curve. Move two endpoints independently. Practice guidance checks contact and direction; it is not an examiner drawing mark.",
      curve: gas,
      kind: "product-formation",
    },
    early: {
      label:
        "Construct the tangent at 10 s. Its slope differs from the whole 0–40 s chord.",
      curve: { ...gas, at: 10 },
      kind: "product-formation",
    },
    late: {
      label: "Construct the tangent at 30 s; the curve is still rising.",
      curve: { ...gas, at: 30 },
      kind: "product-formation",
    },
    mass: {
      label:
        "Construct the tangent at 20 s on the product-mass graph. Use the mass axis scale.",
      curve: mass,
      kind: "product-formation",
    },
    consumption: {
      label:
        "Construct the tangent at 20 s on the remaining-reactant graph. Signed slope is negative, positive consumption is its magnitude.",
      curve: remaining,
      kind: "reactant-consumption",
    },
    flat: {
      label:
        "Construct a horizontal tangent at 30 s on the stated constant-amount curve. Nonzero height is not a nonzero rate.",
      curve: { ...gas, a: 0, b: 0, c: 40, at: 30 },
      kind: "product-formation",
    },
  },
  gradient: {
    initial: {
      label:
        "A supplied tangent passes through(10 s, 20 cm³) and(30 s, 50 cm³). These are points on the tangent, not two measured curve points. Calculate its slope and product-formation rate.",
      x0: 10,
      y0: 20,
      x1: 30,
      y1: 50,
      axisUnit: "cm³",
      timeFactor: 1,
      dx: 20,
      dy: 30,
      slope: 1.5,
      rate: 1.5,
      kind: "product-formation",
      unit: "cm³/s",
    },
    offset: {
      label:
        "Supplied product-mass tangent points(40 s, 1.4 g), (100 s, 3.2 g). Subtract both nonzero starting coordinates.",
      x0: 40,
      y0: 1.4,
      x1: 100,
      y1: 3.2,
      axisUnit: "g",
      timeFactor: 1,
      dx: 60,
      dy: 1.8,
      slope: 0.03,
      rate: 0.03,
      kind: "product-formation",
      unit: "g/s",
    },
    falling: {
      label:
        "A remaining-reactant tangent passes through(20 s, 5 g), (40 s, 1 g). Keep the signed plotted gradient distinct from positive consumption rate.",
      x0: 20,
      y0: 5,
      x1: 40,
      y1: 1,
      axisUnit: "g",
      timeFactor: 1,
      dx: 20,
      dy: -4,
      slope: -0.2,
      rate: 0.2,
      kind: "reactant-consumption",
      unit: "g/s",
    },
    horizontal: {
      label:
        "A product tangent passes through(30 s, 40 cm³), (70 s, 40 cm³). A horizontal line at nonzero height has zero slope.",
      x0: 30,
      y0: 40,
      x1: 70,
      y1: 40,
      axisUnit: "cm³",
      timeFactor: 1,
      dx: 40,
      dy: 0,
      slope: 0,
      rate: 0,
      kind: "product-formation",
      unit: "cm³/s",
    },
    minutes: {
      label:
        "The supplied gas tangent uses minutes: points(0.5 min, 12 cm³), (1.5 min, 42 cm³). Convert horizontal difference to seconds before giving cm³/s.",
      x0: 0.5,
      y0: 12,
      x1: 1.5,
      y1: 42,
      axisUnit: "cm³",
      timeFactor: 60,
      dx: 60,
      dy: 30,
      slope: 0.5,
      rate: 0.5,
      kind: "product-formation",
      unit: "cm³/s",
    },
    reverse: {
      label:
        "The same product tangent is supplied in reverse coordinate order: (30 s, 50 cm³), (10 s, 20 cm³). Reorder both coordinates consistently; slope remains 1.5 cm³/s.",
      x0: 30,
      y0: 50,
      x1: 10,
      y1: 20,
      axisUnit: "cm³",
      timeFactor: 1,
      dx: 20,
      dy: 30,
      slope: 1.5,
      rate: 1.5,
      kind: "product-formation",
      unit: "cm³/s",
    },
  },
  moles: {
    initial: {
      label:
        "0.006 mol product forms in 30 s. Calculate the mean amount rate; this is not an instantaneous tangent.",
      amountGiven: 0.006,
      time: 30,
      factor: 1,
      secondsFactor: 1,
      moles: 0.006,
      seconds: 30,
      rate: 0.0002,
      conversion: "already-mol",
    },
    consumed: {
      label:
        "Reactant falls from 0.020 mol to 0.008 mol over 40 s. The stated amount consumed is 0.012 mol. Calculate positive consumption rate.",
      amountGiven: 0.012,
      time: 40,
      factor: 1,
      secondsFactor: 1,
      moles: 0.012,
      seconds: 40,
      rate: 0.0003,
      conversion: "already-mol",
    },
    mmol: {
      label:
        "9 mmol product forms in 1.5 min. Use 1000 mmol=1 mol and 60 s=1 min.",
      amountGiven: 9,
      time: 1.5,
      factor: 0.001,
      secondsFactor: 60,
      moles: 0.009,
      seconds: 90,
      rate: 0.0001,
      conversion: "mmol-to-mol",
    },
    mass: {
      label:
        "0.44 g CO₂ forms in 20 s. Mr(CO₂)=44. Calculate moles then mean mol/s.",
      amountGiven: 0.44,
      time: 20,
      factor: 1 / 44,
      secondsFactor: 1,
      moles: 0.01,
      seconds: 20,
      rate: 0.0005,
      conversion: "mass-divided-by-Mr",
    },
    gas: {
      label:
        "240 cm³ gas forms over 50 s at the stated room temperature/pressure, where 1 mol occupies 24000 cm³. Calculate mean mol/s.",
      amountGiven: 240,
      time: 50,
      factor: 1 / 24000,
      secondsFactor: 1,
      moles: 0.01,
      seconds: 50,
      rate: 0.0002,
      conversion: "volume-divided-by-stated-molar-volume",
    },
    offset: {
      label:
        "Collected product rises from 0.003 mol at 20 s to 0.015 mol at 80 s. Stated change 0.012 mol over 60 s; do not divide final amount by final time.",
      amountGiven: 0.012,
      time: 60,
      factor: 1,
      secondsFactor: 1,
      moles: 0.012,
      seconds: 60,
      rate: 0.0002,
      conversion: "already-mol",
    },
  },
  calibration: {
    initial: {
      label:
        "Constructed falling light tangent points(20 s, 55 %), (40 s, 35 %). Calibration: each 1 percentage-point decrease corresponds to 7.1×10⁻⁵mol sulfur formed. Use the supplied tangent, not graph height/time.",
      x0: 20,
      y0: 55,
      x1: 40,
      y1: 35,
      calibration: 0.000071,
      dx: 20,
      dy: -20,
      slope: -1,
      rate: 0.000071,
      unit: "mol/s",
      operation: "magnitude-times-calibration",
    },
    shallow: {
      label:
        "Constructed tangent points(40 s, 35 %), (80 s, 25 %). The same calibration is 7.1×10⁻⁵mol per percentage-point decrease.",
      x0: 40,
      y0: 35,
      x1: 80,
      y1: 25,
      calibration: 0.000071,
      dx: 40,
      dy: -10,
      slope: -0.25,
      rate: 0.00001775,
      unit: "mol/s",
      operation: "magnitude-times-calibration",
    },
    other: {
      label:
        "A separately calibrated optical experiment gives tangent points(10 s, 80 %), (30 s, 60 %). Here 1 percentage-point decrease corresponds to 2×10⁻⁵mol product, not the calibration of another experiment.",
      x0: 10,
      y0: 80,
      x1: 30,
      y1: 60,
      calibration: 0.00002,
      dx: 20,
      dy: -20,
      slope: -1,
      rate: 0.00002,
      unit: "mol/s",
      operation: "magnitude-times-calibration",
    },
    zero: {
      label:
        "Calibrated sensor tangent points(80 s, 24 %), (120 s, 24 %). Under the stated valid local calibration, no signal change gives zero measured product-formation rate.",
      x0: 80,
      y0: 24,
      x1: 120,
      y1: 24,
      calibration: 0.000071,
      dx: 40,
      dy: 0,
      slope: 0,
      rate: 0,
      unit: "mol/s",
      operation: "magnitude-times-calibration",
    },
    increasing: {
      label:
        "A differently specified sensor rises from 10 % at 20 s to 30 % at 60 s along its tangent. Each 1 percentage-point INCREASE corresponds to 4×10⁻⁵mol product formed.",
      x0: 20,
      y0: 10,
      x1: 60,
      y1: 30,
      calibration: 0.00004,
      dx: 40,
      dy: 20,
      slope: 0.5,
      rate: 0.00002,
      unit: "mol/s",
      operation: "magnitude-times-calibration",
    },
    wider: {
      label:
        "The same constructed light tangent is read at(10 s, 65 %), (50 s, 25 %). Calibration 7.1×10⁻⁵mol per percentage-point decrease. Wider coordinate spacing changes the triangle, not its slope.",
      x0: 10,
      y0: 65,
      x1: 50,
      y1: 25,
      calibration: 0.000071,
      dx: 40,
      dy: -40,
      slope: -1,
      rate: 0.000071,
      unit: "mol/s",
      operation: "magnitude-times-calibration",
    },
  },
  evidence: {
    initial: {
      label:
        "You need reaction rate at 30 s on a curved amount-time graph. Which geometric construction is needed?",
      claim: "tangent-at-requested-time",
      reason: "local-direction-not-whole-interval",
    },
    triangle: {
      label:
        "Two readable points widely separated on the SAME tangent give a larger gradient triangle. Why prefer them to two almost adjacent points?",
      claim: "wide-readable-tangent-triangle",
      reason: "reduces-relative-coordinate-reading-error",
    },
    chord: {
      label:
        "Two points sampled from the curve at 0 s and 60 s are joined. Does this directly give reaction rate at 30 s?",
      claim: "finite-interval-mean",
      reason: "chord-differs-from-local-tangent",
    },
    uncalibrated: {
      label:
        "A light percentage falls at 0.5 percentage-points/s. No relation between light change and chemical amount has been supplied.",
      claim: "no-established-mol-per-second",
      reason: "chemical-amount-calibration-required",
    },
    remaining: {
      label:
        "A remaining-reactant tangent has gradient−0.0003 mol/s. Interpret the chemical consumption rate.",
      claim: "positive-consumption-magnitude",
      reason: "remaining-amount-falls-as-reactant-is-consumed",
    },
    limitation: {
      label:
        "An experimental curve and tangent estimate have limited graph-reading precision. Can its slope be claimed exact to ten decimal places?",
      claim: "estimate-with-supported-precision",
      reason: "drawing-and-coordinate-reading-limit-precision",
    },
  },
} as const;
export const tangentNumbers: Record<TangentMode, string[]> = {
  construct: ["tx0", "ty0", "tx1", "ty1", "slope"],
  gradient: ["dx", "dy", "slope", "rate"],
  moles: ["moles", "seconds", "rate"],
  calibration: ["dx", "dy", "slope", "rate"],
  evidence: [],
};
export const tangentOptions: Record<
  TangentMode,
  Record<string, readonly string[]>
> = {
  construct: {
    record: [],
    kind: [
      "unset",
      "product-formation",
      "reactant-consumption",
      "uncalibrated-signal",
    ],
  },
  gradient: {
    record: [],
    kind: [
      "unset",
      "product-formation",
      "reactant-consumption",
      "whole-graph-height",
    ],
    unit: ["unset", "g/s", "cm³/s", "s/g", "s/cm³"],
  },
  moles: {
    record: [],
    conversion: [
      "unset",
      "already-mol",
      "mmol-to-mol",
      "mass-divided-by-Mr",
      "volume-divided-by-stated-molar-volume",
      "multiply-mass-by-Mr",
    ],
    unit: ["unset", "mol/s", "mol", "s/mol", "g/s"],
  },
  calibration: {
    record: [],
    operation: [
      "unset",
      "magnitude-times-calibration",
      "signed-slope-times-calibration",
      "magnitude-divided-by-calibration",
      "divide-percentage-by100-again",
    ],
    unit: ["unset", "mol/s", "percentage-points/s", "s/mol", "mol"],
  },
  evidence: {
    record: [],
    claim: [
      "unset",
      "tangent-at-requested-time",
      "wide-readable-tangent-triangle",
      "finite-interval-mean",
      "no-established-mol-per-second",
      "positive-consumption-magnitude",
      "estimate-with-supported-precision",
      "final-height-is-rate",
      "negative-consumption",
      "exact-experimental-rate",
    ],
    reason: [
      "unset",
      "local-direction-not-whole-interval",
      "reduces-relative-coordinate-reading-error",
      "chord-differs-from-local-tangent",
      "chemical-amount-calibration-required",
      "remaining-amount-falls-as-reactant-is-consumed",
      "drawing-and-coordinate-reading-limit-precision",
      "height-divided-by-time-always",
      "sensor-percent-is-moles",
    ],
  },
};
for (const mode of Object.keys(tangentRecords) as TangentMode[])
  tangentOptions[mode].record = Object.keys(tangentRecords[mode]);
export function validTangentNumber(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^-?(?:0|[1-9]\d*)(?:\.\d{1,10})?$/.test(v) &&
    v !== "-0" &&
    Math.abs(Number(v)) <= 100000
  );
}
export function initialTangentBoard(
  mode: TangentMode,
  record = "initial",
): Record<string, string> {
  if (!tangentOptions[mode].record.includes(record))
    throw Error("Unknown tangent teaching case");
  return Object.fromEntries([
    ...Object.keys(tangentOptions[mode]).map((k) => [
      k,
      k === "record" ? record : "unset",
    ]),
    ...tangentNumbers[mode].map((k) => [k, "0"]),
  ]);
}
export function validTangentBoard(
  mode: TangentMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>;
  return (
    Object.keys(b).length === Object.keys(initialTangentBoard(mode)).length &&
    Object.entries(tangentOptions[mode]).every(
      ([k, opts]) => typeof b[k] === "string" && opts.includes(b[k] as string),
    ) &&
    tangentNumbers[mode].every((k) => validTangentNumber(b[k]))
  );
}
export function tangentHistoryStep(mode: TangentMode, a: unknown, b: unknown) {
  if (!validTangentBoard(mode, a) || !validTangentBoard(mode, b)) return false;
  if (a.record !== b.record) {
    const reset = initialTangentBoard(mode, b.record);
    return Object.keys(reset).every((k) => b[k] === reset[k]);
  }
  return Object.keys(a).filter((k) => a[k] !== b[k]).length === 1;
}
const near = (a: number, b: number, tolerance = 1e-10) =>
  Math.abs(a - b) <= tolerance;
export function tangentPrediction(
  mode: TangentMode,
  b: Record<string, string | number>,
) {
  if (!validTangentBoard(mode, b)) return false;
  if (mode === "construct") {
    const r =
        tangentRecords.construct[
          b.record as keyof typeof tangentRecords.construct
        ],
      curve = r.curve;
    const x0 = Number(b.tx0),
      x1 = Number(b.tx1),
      y0 = Number(b.ty0),
      y1 = Number(b.ty1),
      span = x1 - x0;
    if (
      Math.abs(span) < (curve.end - curve.start) / 4 ||
      curve.at < Math.min(x0, x1) ||
      curve.at > Math.max(x0, x1) ||
      [x0, x1].some((x) => x < curve.start || x > curve.end) ||
      [y0, y1].some((y) => y < 0 || y > curve.max)
    )
      return false;
    const slope = (y1 - y0) / span,
      contact = y0 + slope * (curve.at - x0),
      expected = curveSlope(curve, curve.at);
    return (
      near(contact, curveValue(curve, curve.at), curve.max / 100) &&
      near(slope, expected, Math.max(0.001, Math.abs(expected) * 0.02)) &&
      near(Number(b.slope), slope, 1e-8) &&
      b.kind === r.kind
    );
  }
  const r = tangentRecords[mode][b.record as never] as unknown as Record<
    string,
    unknown
  >;
  return [
    ...tangentNumbers[mode],
    ...Object.keys(tangentOptions[mode]).filter((k) => k !== "record"),
  ].every((k) =>
    mode === "moles" && k === "unit"
      ? b[k] === "mol/s"
      : typeof r[k] === "number"
        ? near(Number(b[k]), r[k] as number)
        : b[k] === r[k],
  );
}
/** Diagnostic feedback follows the submitted prediction without changing any saved field. */
export function tangentDiagnostic(
  mode: TangentMode,
  b: Record<string, string | number>,
): string {
  if (!validTangentBoard(mode, b))
    return "Your entries are retained. Enter finite signed decimals and choose all required interpretations.";
  if (mode === "construct") {
    const r =
        tangentRecords.construct[
          b.record as keyof typeof tangentRecords.construct
        ],
      c = r.curve,
      x0 = Number(b.tx0),
      x1 = Number(b.tx1),
      y0 = Number(b.ty0),
      y1 = Number(b.ty1);
    if (Math.abs(x1 - x0) < (c.end - c.start) / 4)
      return "Your endpoints are retained. Choose a wider readable triangle on one line; a zero or tiny time span does not provide a reliable gradient.";
    if (c.at < Math.min(x0, x1) || c.at > Math.max(x0, x1))
      return "Your endpoints are retained. Place the visible line on both sides of the requested moment so its contact can be inspected.";
    if (
      [x0, x1].some((x) => x < c.start || x > c.end) ||
      [y0, y1].some((y) => y < 0 || y > c.max)
    )
      return "Your off-axis coordinates are retained. Use points on your line within the supplied scales so the complete triangle is visible.";
    const slope = (y1 - y0) / (x1 - x0),
      contact = y0 + slope * (c.at - x0),
      expected = curveSlope(c, c.at);
    if (!near(contact, curveValue(c, c.at), c.max / 100))
      return "Your line is retained. At the requested moment it misses the supplied curve; adjust the endpoints without replacing the curve or changing the requested time.";
    if (!near(slope, expected, Math.max(0.001, Math.abs(expected) * 0.02)))
      return "Your line is retained. It does not follow the curve’s local direction at the requested moment. A line joining other curve observations is a chord and can give a different gradient.";
    if (!near(Number(b.slope), slope, 1e-8))
      return "Your gradient prediction is retained. Calculate the vertical difference divided by the horizontal difference of your OWN displayed tangent endpoints.";
    return "Your line is retained. Identify whether the graph shows product formed or reactant remaining; a falling remaining amount has a negative plotted gradient but positive consumption.";
  }
  if (mode === "evidence")
    return "Your choices are retained. Match the conclusion to the actual construction, units and stated evidence: tangent for a moment, chord for an interval, calibration for chemical amount, and supported precision for a graph estimate.";
  const r = tangentRecords[mode][b.record as never] as unknown as Record<
    string,
    unknown
  >;
  for (const k of tangentNumbers[mode])
    if (!near(Number(b[k]), Number(r[k]))) {
      if (k === "dx" || k === "seconds")
        return "Your time prediction is retained. Subtract the two stated times where applicable, then convert the elapsed interval into seconds once; final clock time is not elapsed time.";
      if (k === "dy")
        return "Your signed vertical difference is retained. Use later minus earlier ordinate; the difference is negative when the recorded remaining amount or optical signal falls.";
      if (k === "slope")
        return "Your signed gradient is retained. Divide the signed vertical change by the corresponding positive time span; graph height alone is not a rate.";
      if (k === "moles")
        return "Your amount prediction is retained. Use the explicitly stated amount conversion: mmol÷1000, mass÷Mr, or volume÷the supplied molar volume under its stated conditions.";
      return mode === "calibration"
        ? "Your chemical-rate prediction is retained. Multiply the signal-slope magnitude in the stated direction by the supplied mol-per-percentage-point calibration. Do not divide the percentage-point change by100 again."
        : "Your chemical-rate prediction is retained. Divide the positive amount formed or consumed by elapsed seconds. Keep a negative remaining-amount gradient distinct from positive consumption.";
    }
  return "Your numerical entries are retained. Check the chemical quantity role, stated amount conversion or calibration operation, and final units; reciprocal time-per-amount units are not a rate.";
}
