export type PhMode =
  "classification" | "colour" | "indicator" | "neutralisation" | "measurement";
export const phClass = (ph: number) =>
  ph < 7 ? "acidic" : ph > 7 ? "alkaline" : "neutral";
export const phRecords = {
  classification: {
    initial: { label: "Calibrated probe, pH 4.2 at 25°C", ph: 4.2, ions: "H+" },
    neutral: {
      label: "Calibrated probe, pH 7.0 at 25°C",
      ph: 7,
      ions: "balanced",
    },
    alkaline: {
      label: "Calibrated probe, pH 11.6 at 25°C",
      ph: 11.6,
      ions: "OH−",
    },
    justAcid: {
      label: "Calibrated probe, pH 6.8 at 25°C",
      ph: 6.8,
      ions: "H+",
    },
    justAlkali: {
      label: "Calibrated probe, pH 7.2 at 25°C",
      ph: 7.2,
      ions: "OH−",
    },
    zero: { label: "Supplied usual-scale endpoint, pH 0.0", ph: 0, ions: "H+" },
    fourteen: {
      label: "Supplied usual-scale endpoint, pH 14.0",
      ph: 14,
      ions: "OH−",
    },
  },
  colour: {
    initial: {
      label: "Orange universal indicator with the supplied chart",
      colour: "orange",
      min: 3,
      max: 4,
      classification: "acidic",
    },
    yellow: {
      label: "Yellow universal indicator with the supplied chart",
      colour: "yellow",
      min: 5,
      max: 6,
      classification: "acidic",
    },
    green: {
      label: "Green universal indicator with the supplied chart",
      colour: "green",
      min: 7,
      max: 7,
      classification: "neutral",
    },
    blue: {
      label: "Blue universal indicator with the supplied chart",
      colour: "blue",
      min: 9,
      max: 10,
      classification: "alkaline",
    },
    purple: {
      label: "Purple universal indicator with the supplied chart",
      colour: "purple",
      min: 11,
      max: 14,
      classification: "alkaline",
    },
    red: {
      label: "Red universal indicator with the supplied chart",
      colour: "red",
      min: 0,
      max: 2,
      classification: "acidic",
    },
  },
  indicator: {
    initial: {
      label: "Phenolphthalein, supplied pH 2",
      ph: 2,
      indicator: "phenolphthalein",
      colour: "colourless",
      neutrality: "no",
    },
    phenolNeutral: {
      label: "Phenolphthalein, supplied pH 7",
      ph: 7,
      indicator: "phenolphthalein",
      colour: "colourless",
      neutrality: "yes",
    },
    phenolAlkali: {
      label: "Phenolphthalein, supplied pH 12",
      ph: 12,
      indicator: "phenolphthalein",
      colour: "pink",
      neutrality: "no",
    },
    methylAcid: {
      label: "Methyl orange, supplied pH 2",
      ph: 2,
      indicator: "methyl-orange",
      colour: "red",
      neutrality: "no",
    },
    methylNeutral: {
      label: "Methyl orange, supplied pH 7",
      ph: 7,
      indicator: "methyl-orange",
      colour: "yellow",
      neutrality: "yes",
    },
    methylMildAcid: {
      label: "Methyl orange, supplied pH 5",
      ph: 5,
      indicator: "methyl-orange",
      colour: "yellow",
      neutrality: "no",
    },
    methylAlkali: {
      label: "Methyl orange, supplied pH 12",
      ph: 12,
      indicator: "methyl-orange",
      colour: "yellow",
      neutrality: "no",
    },
    litmusAcid: {
      label: "Litmus, supplied pH 2",
      ph: 2,
      indicator: "litmus",
      colour: "red",
      neutrality: "no",
    },
    litmusNeutral: {
      label: "Litmus solution, supplied pH 7",
      ph: 7,
      indicator: "litmus",
      colour: "purple",
      neutrality: "yes",
    },
    litmusAlkali: {
      label: "Litmus, supplied pH 12",
      ph: 12,
      indicator: "litmus",
      colour: "blue",
      neutrality: "no",
    },
    unknown: {
      label:
        "Unknown sample: phenolphthalein remains colourless; no probe pH supplied",
      ph: null,
      indicator: "phenolphthalein",
      colour: "colourless",
      neutrality: "not-established",
    },
  },
  neutralisation: {
    initial: {
      label:
        "Original supplied acid/alkali data; 25 cm³ HCl initially, NaOH solution added",
      unit: "cm³",
      quantity: "Alkali solution volume",
      amounts: [0, 5, 10, 15, 20, 25, 30],
      ph: [1, 1.2, 1.4, 1.6, 2, 7, 12],
    },
    powder: {
      label:
        "Original supplied calcium-hydroxide powder data; fixed acid volume",
      unit: "g",
      quantity: "Calcium hydroxide mass",
      amounts: [0, 0.025, 0.05, 0.075, 0.1, 0.125, 0.15],
      ph: [1.9, 2, 2.2, 2.5, 7, 11.5, 11.8],
    },
  },
  measurement: {
    initial: {
      label:
        "Calibrated pH probe displays 5.2; check buffers agree with their labels",
      decision: "reported-reading",
      reason: "checked-reference",
    },
    colour: {
      label:
        "Universal indicator is orange, matching the supplied pH 3–4 chart",
      decision: "approx-range",
      reason: "chart-range",
    },
    digits: {
      label: "Probe displays 5.200, but buffer labelled pH 7.0 reads 7.5",
      decision: "accuracy-unchecked",
      reason: "failed-reference",
    },
    repeat: {
      label:
        "Probe readings 5.2, 5.2, 5.3; no reference-buffer check is supplied",
      decision: "accuracy-unchecked",
      reason: "repeat-not-accuracy",
    },
    litmus: {
      label: "Litmus turns red; no numerical pH measurement is supplied",
      decision: "acidic-only",
      reason: "limited-indicator",
    },
  },
} as const;
export const universalChart = [
  { colour: "red", min: 0, max: 2, hex: "#c25759" },
  { colour: "orange", min: 3, max: 4, hex: "#dc904e" },
  { colour: "yellow", min: 5, max: 6, hex: "#e4cd59" },
  { colour: "green", min: 7, max: 7, hex: "#4d9b73" },
  { colour: "blue-green", min: 8, max: 8, hex: "#408f9b" },
  { colour: "blue", min: 9, max: 10, hex: "#456ac4" },
  { colour: "purple", min: 11, max: 14, hex: "#865caa" },
] as const;
export const phChoices: Record<PhMode, Record<string, string[]>> = {
  classification: {
    record: Object.keys(phRecords.classification),
    classification: ["unset", "acidic", "neutral", "alkaline"],
    ions: ["unset", "H+", "OH−", "balanced", "none"],
  },
  colour: {
    record: Object.keys(phRecords.colour),
    guess: Array.from({ length: 15 }, (_, i) => String(i)),
    classification: ["unset", "acidic", "neutral", "alkaline"],
    certainty: ["unset", "approximate", "exact-every-time"],
  },
  indicator: {
    record: Object.keys(phRecords.indicator),
    colour: [
      "unset",
      "red",
      "yellow",
      "pink",
      "blue",
      "purple",
      "colourless",
      "green",
    ],
    neutrality: ["unset", "yes", "no", "not-established"],
  },
  neutralisation: {
    record: Object.keys(phRecords.neutralisation),
    point: Array.from({ length: 7 }, (_, i) => String(i)),
    classification: ["unset", "acidic", "neutral", "alkaline"],
    excess: ["unset", "H+", "OH−", "matched", "no-ions"],
  },
  measurement: {
    record: Object.keys(phRecords.measurement),
    decision: [
      "unset",
      "reported-reading",
      "approx-range",
      "acidic-only",
      "accuracy-unchecked",
      "exact-from-colour",
    ],
    reason: [
      "unset",
      "checked-reference",
      "chart-range",
      "failed-reference",
      "repeat-not-accuracy",
      "limited-indicator",
      "digits-prove-accuracy",
    ],
  },
};
export function initialPhBoard(mode: PhMode): Record<string, string> {
  return Object.fromEntries(
    Object.keys(phChoices[mode]).map((k) => [
      k,
      k === "record"
        ? "initial"
        : k === "guess" || k === "point"
          ? "0"
          : "unset",
    ]),
  );
}
export function validPhBoard(
  mode: PhMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  return (
    Object.keys(v).length === Object.keys(phChoices[mode]).length &&
    Object.entries(phChoices[mode]).every(
      ([k, vs]) => typeof v[k] === "string" && vs.includes(v[k] as string),
    )
  );
}
export function phExpected(
  mode: PhMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const k = String(b.record);
  if (mode === "classification") {
    const r =
      phRecords.classification[k as keyof typeof phRecords.classification];
    return { classification: phClass(r.ph), ions: r.ions };
  }
  if (mode === "colour") {
    const r = phRecords.colour[k as keyof typeof phRecords.colour];
    return { classification: r.classification, certainty: "approximate" };
  }
  if (mode === "indicator") {
    const r = phRecords.indicator[k as keyof typeof phRecords.indicator];
    return { colour: r.colour, neutrality: r.neutrality };
  }
  if (mode === "neutralisation") {
    const r =
        phRecords.neutralisation[k as keyof typeof phRecords.neutralisation],
      ph = r.ph[Number(b.point)];
    return {
      classification: phClass(ph),
      excess: ph < 7 ? "H+" : ph > 7 ? "OH−" : "matched",
    };
  }
  const r = phRecords.measurement[k as keyof typeof phRecords.measurement];
  return { decision: r.decision, reason: r.reason };
}
export function phPrediction(mode: PhMode, b: Record<string, string | number>) {
  if (!validPhBoard(mode, b)) return { complete: false, correct: false };
  const expected = phExpected(mode, b),
    complete = Object.keys(expected).every((k) => b[k] !== "unset"),
    range =
      mode === "colour"
        ? phRecords.colour[String(b.record) as keyof typeof phRecords.colour]
        : null;
  return {
    complete,
    correct:
      complete &&
      Object.entries(expected).every(([k, v]) => b[k] === v) &&
      (!range ||
        (Number(b.guess) >= range.min && Number(b.guess) <= range.max)),
  };
}
