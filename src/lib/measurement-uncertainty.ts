export type MeasurementMode = "selection" | "spread" | "bias" | "reproduce";
export const measurementSets = {
  fault: {
    values: [10.2, 10, 10.1, 14],
    unit: "g",
    note: "The notebook confirms that trial 4 was spoiled by spilled material entering the weighed sample. Investigate and exclude this poor measurement; retain its record.",
  },
  valid: {
    values: [10, 10.1, 10.2, 10.3],
    unit: "g",
    note: "All four repeat measurements were made correctly under the same conditions. No measurement fault is identified.",
  },
  narrow: {
    values: [18.2, 18.6, 18.8, 18.4],
    unit: "°C",
    note: "Four repeat lowest temperatures. Use the supplied half-range convention to estimate scatter about the mean.",
  },
  wide: {
    values: [17.9, 18.7, 19.1, 18.3],
    unit: "°C",
    note: "Four repeat lowest temperatures with wider scatter. Use the same half-range convention.",
  },
} as const;
const clean = (v: number) => Number(v.toFixed(9));
export function repeatStats(values: readonly number[]) {
  if (!values.length || values.some((v) => !Number.isFinite(v)))
    throw Error("Supply finite repeat readings");
  const minimum = Math.min(...values),
    maximum = Math.max(...values);
  return {
    count: values.length,
    mean: clean(values.reduce((s, v) => s + v, 0) / values.length),
    minimum,
    maximum,
    width: clean(maximum - minimum),
    halfRange: clean((maximum - minimum) / 2),
  };
}
export function selectedReadings(caseId: "fault" | "valid", excluded: number) {
  if (!Number.isInteger(excluded) || excluded < 0 || excluded > 4)
    throw Error("Choose none or one recorded trial");
  return measurementSets[caseId].values.filter((_, i) => i + 1 !== excluded);
}
export function biasedReadings(offset: number) {
  if (offset !== 0 && offset !== 0.4)
    throw Error("Choose the supplied calibration offsets");
  return [9.9, 10, 10.1].map((v) => clean(v + offset));
}
export function investigatorReadings(caseId: "agree" | "differ") {
  return {
    first: [9.9, 10, 10.1],
    second: caseId === "agree" ? [10.1, 9.9, 10] : [10.7, 10.9, 10.8],
    suppliedMeanTolerance: 0.2,
  };
}
export function initialMeasurementBoard(
  mode: MeasurementMode,
): Record<string, string | number> {
  switch (mode) {
    case "selection":
      return {
        case: "fault",
        excluded: 0,
        reason: "unset",
        count: "unset",
        mean: "unset",
      };
    case "spread":
      return {
        case: "narrow",
        minimum: "unset",
        maximum: "unset",
        width: "unset",
        uncertainty: "unset",
      };
    case "bias":
      return {
        offset: 0.4,
        reference: "hidden",
        mean: "unset",
        width: "unset",
        accuracy: "unset",
      };
    case "reproduce":
      return {
        case: "differ",
        difference: "unset",
        repeatable: "unset",
        reproducible: "unset",
      };
  }
}
export const measurementChoices = {
  selection: {
    case: ["fault", "valid"],
    excluded: [0, 1, 2, 3, 4],
    reason: ["unset", "fault", "keep", "target", "furthest"],
    count: ["unset", "3", "4", "1"],
    mean: ["unset", "10.1", "10.15", "11.075", "10", "14"],
  },
  spread: {
    case: ["narrow", "wide"],
    minimum: ["unset", "18.2", "17.9", "18.5", "0.3"],
    maximum: ["unset", "18.8", "19.1", "18.5", "0.6"],
    width: ["unset", "0.6", "1.2", "0.3", "18.5"],
    uncertainty: ["unset", "0.3", "0.6", "1.2", "18.5"],
  },
  bias: {
    offset: [0, 0.4],
    reference: ["hidden", "known"],
    mean: ["unset", "10", "10.4", "0.4"],
    width: ["unset", "0.2", "0.4", "0", "10.4"],
    accuracy: ["unset", "unknown", "aligned", "biased"],
  },
  reproduce: {
    case: ["agree", "differ"],
    difference: ["unset", "0", "0.8", "0.2"],
    repeatable: ["unset", "yes", "no"],
    reproducible: ["unset", "yes", "no"],
  },
} as const;
export function validMeasurementBoard(mode: MeasurementMode, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    choices = measurementChoices[mode];
  return (
    Object.keys(b).length === Object.keys(choices).length &&
    Object.entries(choices).every(([key, values]) =>
      (values as readonly unknown[]).includes(b[key]),
    )
  );
}
export function measurementPrediction(
  mode: MeasurementMode,
  b: Record<string, string | number>,
) {
  switch (mode) {
    case "selection": {
      const stats = repeatStats(
          selectedReadings(b.case as "fault" | "valid", Number(b.excluded)),
        ),
        justified =
          b.case === "fault"
            ? b.excluded === 4 && b.reason === "fault"
            : b.excluded === 0 && b.reason === "keep";
      return {
        correct:
          justified &&
          Number(b.count) === stats.count &&
          Number(b.mean) === stats.mean,
        feedback:
          justified &&
          Number(b.count) === stats.count &&
          Number(b.mean) === stats.mean
            ? "The retained mean uses the retained number of readings. The excluded record stays visible. A confirmed measurement fault justifies exclusion; a preferred answer or the greatest distance alone does not."
            : "Choose readings using the supplied measurement evidence, then divide their total by their actual count. Do not erase a result merely to move the mean towards a preferred value.",
      };
    }
    case "spread": {
      const s = repeatStats(
          measurementSets[b.case as "narrow" | "wide"].values,
        ),
        correct =
          Number(b.minimum) === s.minimum &&
          Number(b.maximum) === s.maximum &&
          Number(b.width) === s.width &&
          Number(b.uncertainty) === s.halfRange;
      return {
        correct,
        feedback: correct
          ? `The observed range runs from ${s.minimum} to ${s.maximum} °C: width ${s.width} °C. The supplied half-range estimate is ±${s.halfRange} °C about mean ${s.mean} °C. It describes repeat scatter, not a guaranteed true value or future reading.`
          : "Keep the two endpoints, full width and ± half-width separate. Use maximum − minimum for width and divide that width by two for this supplied uncertainty convention.",
      };
    }
    case "bias": {
      const s = repeatStats(biasedReadings(Number(b.offset))),
        expected =
          b.reference === "hidden"
            ? "unknown"
            : Number(b.offset) === 0
              ? "aligned"
              : "biased",
        correct =
          Number(b.mean) === s.mean &&
          Number(b.width) === s.width &&
          b.accuracy === expected;
      return {
        correct,
        feedback: correct
          ? "Adding the same offset moves every reading and its mean equally; the repeat range stays 0.2 g. Close agreement establishes precision. Accuracy needs the supplied reference, and averaging more biased readings does not remove their common offset."
          : "Calculate the mean and max − min separately. A common offset moves the distribution without widening it. Do not claim accuracy from clustering alone or invent a reference that is not supplied.",
      };
    }
    case "reproduce": {
      const s = investigatorReadings(b.case as "agree" | "differ"),
        difference = clean(
          Math.abs(repeatStats(s.first).mean - repeatStats(s.second).mean),
        ),
        correct =
          Number(b.difference) === difference &&
          b.repeatable === "yes" &&
          b.reproducible ===
            (difference <= s.suppliedMeanTolerance ? "yes" : "no");
      return {
        correct,
        feedback: correct
          ? `Both investigators have a 0.2 g repeat range within their own set. Their means differ by ${difference} g. Use the explicitly supplied 0.2 g comparison tolerance for this example: repeatability within one set and reproducibility between investigators are different evidence.`
          : "Inspect the spread within each investigator's repeats, then compare their means using the supplied tolerance. Tight repeats in both laboratories do not guarantee that the laboratories agree.",
      };
    }
  }
}
