export type StrengthMode =
  "descriptors" | "factors" | "dilution" | "comparison" | "evidence";
export const strengthRecords = {
  descriptors: {
    initial: {
      label:
        "HCl: complete ionisation; 0.010 mol/dm³ acid; reference 0.100 mol/dm³",
      strength: "strong",
      concentration: "lower",
    },
    strongHigher: {
      label:
        "HCl: complete ionisation; 0.200 mol/dm³ acid; reference 0.100 mol/dm³",
      strength: "strong",
      concentration: "higher",
    },
    weakHigher: {
      label:
        "Ethanoic acid: partial ionisation; 0.200 mol/dm³ acid; reference 0.100 mol/dm³",
      strength: "weak",
      concentration: "higher",
    },
    weakLower: {
      label:
        "Ethanoic acid: partial ionisation; 0.010 mol/dm³ acid; reference 0.100 mol/dm³",
      strength: "weak",
      concentration: "lower",
    },
    equal: {
      label:
        "HCl: complete ionisation; 0.100 mol/dm³ acid; reference 0.100 mol/dm³",
      strength: "strong",
      concentration: "equal",
    },
    unknown: {
      label:
        "Unnamed acid: 0.010 mol/dm³ acid; reference 0.100 mol/dm³; no ionisation evidence",
      strength: "not-established",
      concentration: "lower",
    },
  },
  factors: {
    initial: { label: "Compare pH 4 with target pH 2", start: 4, target: 2 },
    fallThree: { label: "Compare pH 6 with target pH 3", start: 6, target: 3 },
    riseThree: { label: "Compare pH 2 with target pH 5", start: 2, target: 5 },
    same: { label: "Compare pH 3 with target pH 3", start: 3, target: 3 },
    neutralToAcid: {
      label: "Compare pH 7 with target pH 5 at 25 °C",
      start: 7,
      target: 5,
    },
    towardNeutral: {
      label: "Compare pH 4 with target pH 7 at 25 °C",
      start: 4,
      target: 7,
    },
    fallOne: { label: "Compare pH 5 with target pH 4", start: 5, target: 4 },
  },
  dilution: {
    initial: {
      label:
        "Fully ionised monoprotic HCl, initial pH 2; target tenfold dilution",
      ph: 2,
      volume: 25,
      target: 1,
    },
    hundred: {
      label:
        "Fully ionised monoprotic HCl, initial pH 2; target hundredfold dilution",
      ph: 2,
      volume: 10,
      target: 2,
    },
    startingThree: {
      label:
        "Fully ionised monoprotic HCl, initial pH 3; target hundredfold dilution",
      ph: 3,
      volume: 20,
      target: 2,
    },
    startingOne: {
      label:
        "Fully ionised monoprotic HCl, initial pH 1; target hundredfold dilution",
      ph: 1,
      volume: 5,
      target: 2,
    },
    thousand: {
      label:
        "Fully ionised monoprotic HCl, initial pH 2; target thousandfold dilution",
      ph: 2,
      volume: 1,
      target: 3,
    },
  },
  comparison: {
    initial: {
      label:
        "Equal acid concentration and temperature: HCl completely ionises; ethanoic acid partly ionises",
      hydrogen: "HCl",
      ph: "ethanoic",
      reason: "equal-concentration",
    },
    weakConcentrated: {
      label:
        "Different acid concentrations: dilute HCl and concentrated ethanoic acid; numerical pH not supplied",
      hydrogen: "not-established",
      ph: "not-established",
      reason: "uncontrolled-concentration",
    },
    sameAcid: {
      label:
        "Same fully ionised monoprotic HCl at same temperature: A 0.010 mol/dm³, B 0.0010 mol/dm³",
      hydrogen: "A",
      ph: "B",
      reason: "same-acid-concentration",
    },
    samePH: {
      label:
        "Samples A and B have the same measured pH at the same temperature; acid amounts/identities not supplied",
      hydrogen: "equal",
      ph: "equal",
      reason: "equal-ph-not-strength",
    },
    unnamed: {
      label:
        "Two comparable monoprotic acids at equal total acid concentration: A pH 2, B pH 4; ionisation completeness not supplied",
      hydrogen: "A",
      ph: "B",
      reason: "equal-concentration-not-completeness",
    },
    diluteWeak: {
      label:
        "The same weak acid is diluted with water; total acid concentration decreases and pH rises; ionisation fraction not supplied",
      hydrogen: "before",
      ph: "after",
      reason: "fraction-can-change",
    },
  },
  evidence: {
    initial: {
      label:
        "An unidentified acid solution has pH 2; no acid concentration or ionisation data",
      claim: "strength-not-established",
      reason: "ph-depends-on-both",
    },
    strongDilute: {
      label:
        "HCl completely ionises in water and has a small amount of acid per unit solution volume",
      claim: "strong-and-dilute",
      reason: "two-independent-descriptors",
    },
    weakDilution: {
      label:
        "A weak acid is diluted tenfold; no final ionisation fraction or pH is supplied",
      claim: "exact-ph-change-not-established",
      reason: "fraction-can-change",
    },
    sulfuric: {
      label:
        "Sulfuric acid is listed as a strong acid by the GCSE specification; no statement about complete release of both protons is supplied",
      claim: "strong-not-two-c-guarantee",
      reason: "second-dissociation-distinct",
    },
    ions: {
      label:
        "A proposed explanation says H+ ions are ionised to make a strong acid",
      claim: "acid-ionises-not-hydrogen-ions",
      reason: "acid-forms-ions",
    },
    neutrality: {
      label: "A neutral sample at 25 °C contains hydrogen and hydroxide ions",
      claim: "equal-ions-not-absent",
      reason: "neutral-not-ion-free",
    },
    safety: {
      label:
        "Two acid solutions are described only as strong and weak; concentrations and other properties are unknown",
      claim: "hazard-not-established",
      reason: "strength-not-hazard-ranking",
    },
  },
} as const;
export const strengthChoices: Record<StrengthMode, Record<string, string[]>> = {
  descriptors: {
    record: Object.keys(strengthRecords.descriptors),
    strength: ["unset", "strong", "weak", "not-established"],
    concentration: ["unset", "lower", "equal", "higher", "not-established"],
  },
  factors: {
    record: Object.keys(strengthRecords.factors),
    ph: Array.from({ length: 15 }, (_, i) => String(i)),
    direction: ["unset", "increases", "decreases", "unchanged"],
    factor: [
      "unset",
      "1",
      "2",
      "10",
      "100",
      "1000",
      "10000",
      "100000",
      "1000000",
      "10000000",
      "100000000",
      "1000000000",
      "10000000000",
      "100000000000",
      "1000000000000",
      "10000000000000",
      "100000000000000",
    ],
  },
  dilution: {
    record: Object.keys(strengthRecords.dilution),
    steps: ["0", "1", "2", "3"],
    ph: ["unset", ...Array.from({ length: 8 }, (_, i) => String(i))],
    concentration: [
      "unset",
      "unchanged",
      "tenfold-lower",
      "hundredfold-lower",
      "thousandfold-lower",
      "higher",
    ],
    strength: ["unset", "still-strong", "now-weak"],
  },
  comparison: {
    record: Object.keys(strengthRecords.comparison),
    hydrogen: [
      "unset",
      "HCl",
      "ethanoic",
      "A",
      "B",
      "before",
      "after",
      "equal",
      "not-established",
    ],
    ph: [
      "unset",
      "HCl",
      "ethanoic",
      "A",
      "B",
      "before",
      "after",
      "equal",
      "not-established",
    ],
    reason: [
      "unset",
      "equal-concentration",
      "uncontrolled-concentration",
      "same-acid-concentration",
      "equal-ph-not-strength",
      "equal-concentration-not-completeness",
      "fraction-can-change",
      "lower-ph-always-stronger",
      "ph-is-linear",
    ],
  },
  evidence: {
    record: Object.keys(strengthRecords.evidence),
    claim: [
      "unset",
      ...new Set(Object.values(strengthRecords.evidence).map((r) => r.claim)),
      "ph-proves-strength",
      "weak-always-dilute",
      "weak-tenfold-always-plus-one",
      "neutral-means-no-ions",
    ],
    reason: [
      "unset",
      ...new Set(Object.values(strengthRecords.evidence).map((r) => r.reason)),
      "strength-equals-concentration",
      "ph-is-linear",
      "hydrogen-ions-ionise",
    ],
  },
};
export function initialStrengthBoard(
  mode: StrengthMode,
  record = "initial",
): Record<string, string> {
  const result = Object.fromEntries(
    Object.keys(strengthChoices[mode]).map((k) => [
      k,
      k === "record" ? record : k === "steps" ? "0" : "unset",
    ]),
  );
  if (mode === "factors")
    result.ph = String(
      strengthRecords.factors[record as keyof typeof strengthRecords.factors]
        .start,
    );
  return result;
}
export function validStrengthBoard(
  mode: StrengthMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  return (
    Object.keys(v).length === Object.keys(strengthChoices[mode]).length &&
    Object.entries(strengthChoices[mode]).every(
      ([k, choices]) =>
        typeof v[k] === "string" && choices.includes(v[k] as string),
    )
  );
}
export function strengthExpected(
  mode: StrengthMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "factors") {
    const r =
        strengthRecords.factors[key as keyof typeof strengthRecords.factors],
      difference = r.start - r.target;
    return {
      ph: String(r.target),
      direction:
        difference > 0
          ? "increases"
          : difference < 0
            ? "decreases"
            : "unchanged",
      factor: String(10 ** Math.abs(difference)),
    };
  }
  if (mode === "dilution") {
    const r =
        strengthRecords.dilution[key as keyof typeof strengthRecords.dilution],
      steps = r.target;
    return {
      steps: String(steps),
      ph: String(r.ph + steps),
      concentration: [
        "unchanged",
        "tenfold-lower",
        "hundredfold-lower",
        "thousandfold-lower",
      ][steps],
      strength: "still-strong",
    };
  }
  const r = (strengthRecords[mode] as Record<string, { label: string }>)[key];
  return Object.fromEntries(Object.entries(r).filter(([k]) => k !== "label"));
}
export function strengthPrediction(
  mode: StrengthMode,
  b: Record<string, string | number>,
) {
  const expected = strengthExpected(mode, b),
    complete = Object.keys(expected).every((k) => b[k] !== "unset");
  return {
    complete,
    correct:
      complete &&
      Object.entries(expected).every(([k, v]) => String(b[k]) === v),
  };
}
