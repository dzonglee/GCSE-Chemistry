export type VoltageMode = "read" | "lead" | "infer" | "rank" | "evidence";
export const specMetals = [
  "chromium",
  "copper",
  "iron",
  "tin",
  "zinc",
] as const;
/** Actual supplied specimen observations, not universal standard potentials. */
export const specObservations: ReadonlyArray<{
  row: string;
  column: string;
  volts: number | "not-measured";
}> = [
  { row: "chromium", column: "chromium", volts: 0 },
  { row: "copper", column: "chromium", volts: 1.2 },
  { row: "copper", column: "copper", volts: 0 },
  { row: "iron", column: "chromium", volts: 0.5 },
  { row: "iron", column: "copper", volts: "not-measured" },
  { row: "iron", column: "iron", volts: 0 },
  { row: "tin", column: "chromium", volts: 0.8 },
  { row: "tin", column: "copper", volts: -0.4 },
  { row: "tin", column: "iron", volts: 0.3 },
  { row: "tin", column: "tin", volts: 0 },
  { row: "zinc", column: "chromium", volts: 0.2 },
  { row: "zinc", column: "copper", volts: -1 },
  { row: "zinc", column: "iron", volts: -0.3 },
  { row: "zinc", column: "tin", volts: -0.6 },
  { row: "zinc", column: "zinc", volts: 0 },
];
export function observedVoltage(row: string, column: string) {
  return specObservations.find((r) => r.row === row && r.column === column)
    ?.volts;
}
export const voltageRecords = {
  read: {
    initial: {
      label:
        "Use the specimen investigation table. Read metal1=copper (row), metal2=chromium (column). Positive means metal2 is more reactive in this supplied comparison.",
      row: "copper",
      column: "chromium",
      volts: 1.2,
      magnitude: 1.2,
      moreActive: "chromium",
    },
    negative: {
      label:
        "Read metal1=tin (row), metal2=copper (column) in the supplied investigation. Keep the recorded minus sign separate from voltage magnitude.",
      row: "tin",
      column: "copper",
      volts: -0.4,
      magnitude: 0.4,
      moreActive: "tin",
    },
    small: {
      label:
        "Read metal1=zinc (row), metal2=iron (column). Use the supplied sign convention rather than taking an absolute value as the reading.",
      row: "zinc",
      column: "iron",
      volts: -0.3,
      magnitude: 0.3,
      moreActive: "zinc",
    },
    identical: {
      label:
        "Read the zinc/zinc diagonal under the supplied identical-electrode comparison. There is no relative-reactivity difference between these matching plates.",
      row: "zinc",
      column: "zinc",
      volts: 0,
      magnitude: 0,
      moreActive: "equal",
    },
    positive: {
      label:
        "Read metal1=tin (row), metal2=iron (column). The positive observation identifies the more reactive of this stated pair.",
      row: "tin",
      column: "iron",
      volts: 0.3,
      magnitude: 0.3,
      moreActive: "iron",
    },
  },
  lead: {
    initial: {
      label:
        "The given discharging iron/copper cell reads −0.70 V with red on metal1=iron and black on metal2=copper. Reverse only the meter leads. The physical metals and the separate conducting load remain unchanged.",
      metal1: "iron",
      metal2: "copper",
      normalVolts: -0.7,
      red: "metal2",
      black: "metal1",
      volts: 0.7,
      magnitude: 0.7,
      moreActive: "metal1",
      electronFrom: "metal1",
      electronTo: "metal2",
    },
    positive: {
      label:
        "The given copper/iron cell reads +0.70 V with red on metal1=copper and black on metal2=iron. Reverse only the meter leads, retaining the same discharging cell and load.",
      metal1: "copper",
      metal2: "iron",
      normalVolts: 0.7,
      red: "metal2",
      black: "metal1",
      volts: -0.7,
      magnitude: 0.7,
      moreActive: "metal2",
      electronFrom: "metal2",
      electronTo: "metal1",
    },
    wide: {
      label:
        "The supplied copper/chromium cell reads +1.20 V with red on metal1=copper and black on metal2=chromium. Reverse only the meter leads; preserve the given chemical donor and acceptor.",
      metal1: "copper",
      metal2: "chromium",
      normalVolts: 1.2,
      red: "metal2",
      black: "metal1",
      volts: -1.2,
      magnitude: 1.2,
      moreActive: "metal2",
      electronFrom: "metal2",
      electronTo: "metal1",
    },
    normal: {
      label:
        "The supplied tin/copper cell reads −0.40 V with red on metal1=tin and black on metal2=copper. Keep this stated normal wiring and predict the discharge electron-transfer direction separately.",
      metal1: "tin",
      metal2: "copper",
      normalVolts: -0.4,
      red: "metal1",
      black: "metal2",
      volts: -0.4,
      magnitude: 0.4,
      moreActive: "metal1",
      electronFrom: "metal1",
      electronTo: "metal2",
    },
    samePlate: {
      label:
        "The given discharging iron/copper cell has normal reading −0.70 V. Connect both red and black meter leads to metal1=iron, while the separate conducting load remains between iron and copper. Predict this meter reading and the unchanged discharge direction.",
      metal1: "iron",
      metal2: "copper",
      normalVolts: -0.7,
      red: "metal1",
      black: "metal1",
      volts: 0,
      magnitude: 0,
      moreActive: "metal1",
      electronFrom: "metal1",
      electronTo: "metal2",
    },
    identical: {
      label:
        "The stated matching copper/copper comparison reads 0 V. Reverse the meter leads. In this ideal identical-electrode comparison there is no cell-driven net discharge electron-transfer direction.",
      metal1: "copper",
      metal2: "copper",
      normalVolts: 0,
      red: "metal2",
      black: "metal1",
      volts: 0,
      magnitude: 0,
      moreActive: "equal",
      electronFrom: "none",
      electronTo: "none",
    },
  },
  infer: {
    initial: {
      label:
        "Specimen transfer: V(iron,chromium)=+0.50 V and V(copper,chromium)=+1.20 V under the supplied convention. Predict V(iron,copper); both known cells have the same reference in the second role.",
      first: "iron",
      second: "copper",
      reference: "chromium",
      firstLevel: 0.5,
      secondLevel: 1.2,
      operation: "first-minus-second",
      volts: -0.7,
      magnitude: 0.7,
      moreActive: "first",
    },
    reversed: {
      label:
        "Use V(copper,chromium)=+1.20 V and V(iron,chromium)=+0.50 V to predict V(copper,iron). Preserve the changed target roles.",
      first: "copper",
      second: "iron",
      reference: "chromium",
      firstLevel: 1.2,
      secondLevel: 0.5,
      operation: "first-minus-second",
      volts: 0.7,
      magnitude: 0.7,
      moreActive: "second",
    },
    mixed: {
      label:
        "Exact constructed controlled comparison: V(A,R)=−0.30 V and V(B,R)=+0.80 V. Predict V(A,B). Both reference roles and conditions match; these are supplied data, not real-metal constants.",
      first: "A",
      second: "B",
      reference: "R",
      firstLevel: -0.3,
      secondLevel: 0.8,
      operation: "first-minus-second",
      volts: -1.1,
      magnitude: 1.1,
      moreActive: "first",
    },
    negatives: {
      label:
        "Exact constructed comparison: V(A,R)=−0.60 V and V(B,R)=−1.40 V with the same reference role and conditions. Predict V(A,B). Subtract the entire signed second reading.",
      first: "A",
      second: "B",
      reference: "R",
      firstLevel: -0.6,
      secondLevel: -1.4,
      operation: "first-minus-second",
      volts: 0.8,
      magnitude: 0.8,
      moreActive: "second",
    },
    alternate: {
      label:
        "Alternative specimen route: V(iron,tin)=−0.30 V and V(copper,tin)=+0.40 V, from reversing the corresponding supplied table pairs. Predict V(iron,copper) using this common tin reference.",
      first: "iron",
      second: "copper",
      reference: "tin",
      firstLevel: -0.3,
      secondLevel: 0.4,
      operation: "first-minus-second",
      volts: -0.7,
      magnitude: 0.7,
      moreActive: "first",
    },
    shifted: {
      label:
        "The unchanged A/B comparison is now made against a different common reference S: V(A,S)=+1.90 V and V(B,S)=+2.60 V. Predict V(A,B); using the same new reference for both still permits first-minus-second inference.",
      first: "A",
      second: "B",
      reference: "S",
      firstLevel: 1.9,
      secondLevel: 2.6,
      operation: "first-minus-second",
      volts: -0.7,
      magnitude: 0.7,
      moreActive: "first",
    },
    identical: {
      label:
        "Two matching copper plates both give +1.20 V against the same chromium reference in this supplied comparison. Predict the voltage between copper plate A and copper plate B.",
      first: "copper A",
      second: "copper B",
      reference: "chromium",
      firstLevel: 1.2,
      secondLevel: 1.2,
      operation: "first-minus-second",
      volts: 0,
      magnitude: 0,
      moreActive: "equal",
    },
  },
  rank: {
    initial: {
      label:
        "Use the supplied specimen comparison with chromium as metal2: chromium0, zinc+0.2, iron+0.5, tin+0.8, copper+1.2 V. Order these metals from most to least reactive for this stated investigation, not as universal standard potentials.",
      metals: ["chromium", "zinc", "iron", "tin", "copper"],
      readings: [0, 0.2, 0.5, 0.8, 1.2],
      referenceRole: "second",
      rank1: "chromium",
      rank2: "zinc",
      rank3: "iron",
      rank4: "tin",
      rank5: "copper",
    },
    letters: {
      label:
        "Exact constructed comparison, R is metal2: A+0.3, B+1.1, C−0.4, D+0.7, E0 V. Using the stated sign rule, order the labelled metals from most to least reactive.",
      metals: ["A", "B", "C", "D", "E"],
      readings: [0.3, 1.1, -0.4, 0.7, 0],
      referenceRole: "second",
      rank1: "C",
      rank2: "E",
      rank3: "A",
      rank4: "D",
      rank5: "B",
    },
    negative: {
      label:
        "Exact constructed comparison, R is metal2: A−0.7, B−0.2, C−1.4, D−1.0, E−0.5 V. Order the labelled metals from most to least reactive; signed order matters.",
      metals: ["A", "B", "C", "D", "E"],
      readings: [-0.7, -0.2, -1.4, -1, -0.5],
      referenceRole: "second",
      rank1: "C",
      rank2: "D",
      rank3: "A",
      rank4: "E",
      rank5: "B",
    },
    shifted: {
      label:
        "Exact constructed common-reference comparison, S is metal2: A+2.3, B+3.1, C+1.6, D+2.7, E+2.0 V. Order from most to least reactive. Using a different common reference can shift all five comparison readings equally without changing their relative order.",
      metals: ["A", "B", "C", "D", "E"],
      readings: [2.3, 3.1, 1.6, 2.7, 2],
      referenceRole: "second",
      rank1: "C",
      rank2: "E",
      rank3: "A",
      rank4: "D",
      rank5: "B",
    },
    opposite: {
      label:
        "Exact constructed comparison with reference R now as metal1: V(R,A)=−0.3, V(R,B)=−1.1, V(R,C)=+0.4, V(R,D)=−0.7, V(R,E)=0 V. Order the labelled metals from most to least reactive under this changed reference role.",
      metals: ["A", "B", "C", "D", "E"],
      readings: [-0.3, -1.1, 0.4, -0.7, 0],
      referenceRole: "first",
      rank1: "C",
      rank2: "E",
      rank3: "A",
      rank4: "D",
      rank5: "B",
    },
  },
  evidence: {
    initial: {
      label:
        "The same discharging cell changes from−0.70 V to+0.70 V when only the meter leads are reversed. Judge what changed.",
      claim: "reading-sign-changes-cell-chemistry-does-not",
      reason: "terminal-order-changes-measured-difference",
    },
    controls: {
      label:
        "One metal comparison used a different electrolyte and temperature from another. May their voltage difference be transferred as if they were one unchanged comparison?",
      claim: "do-not-assume-one-unchanged-comparison",
      reason: "electrode-electrolyte-and-temperature-affect-voltage",
    },
    missing: {
      label:
        "The specimen table labels the iron/copper observation not measured. Judge the meaning of that entry before any inference.",
      claim: "no-observed-reading-is-recorded",
      reason: "not-measured-is-not-a-zero-measurement",
    },
    reference: {
      label:
        "The display origin shifts every relative level, including the reference level, by the same+2 V offset. Judge the effect on the measured first-minus-second difference. The measured cell readings themselves are not altered.",
      claim: "pair-differences-are-unchanged",
      reason: "equal-offsets-cancel-in-subtraction",
    },
    inconsistent: {
      label:
        "Exact constructed claims under unchanged conditions: V(A,R)=+0.5 V, V(B,R)=+1.2 V and V(A,B)=−0.9 V. These are defined exact, not rounded measured estimates. Judge their consistency.",
      claim: "these-exact-comparisons-are-inconsistent",
      reason: "first-minus-second-requires-minus-zero-point-seven",
    },
    sign: {
      label:
        "Under the declared terminal convention, a discharging cell has a reading of−0.70 V. Judge the sign without changing its chemical donor and acceptor.",
      claim: "negative-reading-is-not-negative-reactivity-or-energy",
      reason: "the-minus-sign-describes-terminal-potential-order",
    },
    identical: {
      label:
        "The supplied ideal simple-cell comparison uses two matching copper plates and reports0 V. Judge the scope of that evidence.",
      claim: "no-difference-in-this-matching-electrode-comparison",
      reason: "it-does-not-prove-copper-cannot-react-in-other-contexts",
    },
  },
} as const;
const metals = [...specMetals, "A", "B", "C", "D", "E"];
export const voltageOptions: Record<
  VoltageMode,
  Record<string, readonly string[]>
> = {
  read: {
    record: Object.keys(voltageRecords.read),
    row: ["unset", ...specMetals],
    column: ["unset", ...specMetals],
    moreActive: ["unset", ...specMetals, "equal"],
  },
  lead: {
    record: Object.keys(voltageRecords.lead),
    red: ["unset", "metal1", "metal2"],
    black: ["unset", "metal1", "metal2"],
    moreActive: ["unset", "metal1", "metal2", "equal"],
    electronFrom: ["unset", "metal1", "metal2", "none"],
    electronTo: ["unset", "metal1", "metal2", "none"],
  },
  infer: {
    record: Object.keys(voltageRecords.infer),
    operation: [
      "unset",
      "first-minus-second",
      "second-minus-first",
      "add-both",
    ],
    moreActive: ["unset", "first", "second", "equal"],
  },
  rank: {
    record: Object.keys(voltageRecords.rank),
    rank1: ["unset", ...metals],
    rank2: ["unset", ...metals],
    rank3: ["unset", ...metals],
    rank4: ["unset", ...metals],
    rank5: ["unset", ...metals],
  },
  evidence: {
    record: Object.keys(voltageRecords.evidence),
    claim: [
      "unset",
      ...Object.values(voltageRecords.evidence).map((r) => r.claim),
      "negative-means-no-chemical-reaction",
      "not-measured-means-zero",
    ],
    reason: [
      "unset",
      ...Object.values(voltageRecords.evidence).map((r) => r.reason),
      "voltage-depends-only-on-metal-name",
      "discard-an-observation-until-it-fits",
    ],
  },
};
const numbers: Record<VoltageMode, readonly string[]> = {
  read: ["volts", "magnitude"],
  lead: ["volts", "magnitude"],
  infer: ["firstLevel", "secondLevel", "volts", "magnitude"],
  rank: [],
  evidence: [],
};
export function initialVoltageBoard(
  mode: VoltageMode,
  record = "initial",
): Record<string, string> {
  if (!voltageOptions[mode].record.includes(record))
    throw Error("Unknown voltage record");
  return Object.fromEntries([
    ...Object.keys(voltageOptions[mode]).map((k) => [
      k,
      k === "record" ? record : "unset",
    ]),
    ...numbers[mode].map((k) => [k, "0"]),
  ]);
}
export function validVoltageNumber(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^-?(?:0|[1-9]\d*)(?:\.\d{1,3})?$/.test(v) &&
    v !== "-0" &&
    Math.abs(Number(v)) <= 10000
  );
}
export function validVoltageBoard(
  mode: VoltageMode,
  b: unknown,
): b is Record<string, string> {
  if (!b || typeof b !== "object" || Array.isArray(b)) return false;
  const v = b as Record<string, unknown>;
  return (
    Object.keys(v).length === Object.keys(initialVoltageBoard(mode)).length &&
    Object.entries(voltageOptions[mode]).every(
      ([k, opts]) => typeof v[k] === "string" && opts.includes(v[k] as string),
    ) &&
    numbers[mode].every((k) => validVoltageNumber(v[k]))
  );
}
export function leadReading(
  normalVolts: number,
  red: string,
  black: string,
): number | undefined {
  if (red === "unset" || black === "unset") return undefined;
  if (red === black) return 0;
  const value = red === "metal1" ? normalVolts : -normalVolts;
  return value === 0 ? 0 : value;
}
export function voltagePrediction(
  mode: VoltageMode,
  b: Record<string, string | number>,
) {
  if (!validVoltageBoard(mode, b))
    return {
      correct: false,
      explanation:
        "Complete your predictions under the supplied sign convention and comparison conditions.",
    };
  const r = (voltageRecords[mode] as Record<string, Record<string, unknown>>)[
    b.record
  ];
  const eq = (k: string) =>
    typeof r[k] === "number"
      ? Math.abs(Number(b[k]) - Number(r[k])) < 1e-7
      : b[k] === r[k];
  if (mode === "read")
    return {
      correct: ["row", "column", "volts", "magnitude", "moreActive"].every(eq),
      explanation: `For row ${r.row} (metal1), column ${r.column} (metal2), the supplied reading is ${r.volts}V and its magnitude is ${r.magnitude}V. ${r.moreActive === "equal" ? "These matching plates have no relative-reactivity difference in this comparison." : `The supplied sign rule identifies ${r.moreActive} as the more reactive of this stated pair.`} Keep the table roles and sign; the table is not a universal voltage constant.`,
    };
  if (mode === "lead")
    return {
      correct: [
        "red",
        "black",
        "volts",
        "magnitude",
        "moreActive",
        "electronFrom",
        "electronTo",
      ].every(eq),
      explanation: `The requested connections are red on ${r.red}, black on ${r.black}; their given-cell reading is ${r.volts}V, with magnitude ${r.magnitude}V. ${r.moreActive === "equal" ? "There is no cell-driven net discharge direction in this matching-electrode comparison." : `The physical cell is unchanged: ${r.moreActive} remains more reactive and discharge electron transfer goes from ${r.electronFrom} to ${r.electronTo} through the separate load circuit.`} ${b.record === "samePlate" ? "Both meter probes are on the same conducting plate, so they measure zero potential difference even while the separate load is across the unchanged discharging cell." : "Reversing only meter leads changes the sign, not the donor/acceptor or energy source."} Connecting both meter leads to one plate measures between the same point, not across the cell.`,
    };
  if (mode === "infer")
    return {
      correct: [
        "firstLevel",
        "secondLevel",
        "operation",
        "volts",
        "magnitude",
        "moreActive",
      ].every(eq),
      explanation: `Under the shared reference role and unchanged comparison conditions, ${r.firstLevel} − (${r.secondLevel}) = ${r.volts}V for the requested first/second order; the unsigned magnitude is ${r.magnitude}V. Subtract the complete signed second reading. Reference offsets cancel. ${r.moreActive === "equal" ? "These matching plates have equal supplied levels." : `The ${r.moreActive} target electrode is more reactive under the stated sign rule.`} These comparison levels are not absolute isolated-electrode measurements.`,
    };
  if (mode === "rank")
    return {
      correct: ["rank1", "rank2", "rank3", "rank4", "rank5"].every(eq),
      explanation: `For the supplied reference-as-${r.referenceRole} convention, the requested most-to-least order is ${r.rank1}, ${r.rank2}, ${r.rank3}, ${r.rank4}, ${r.rank5}. ${r.referenceRole === "first" ? "Reverse the common-reference reading sign before comparing relative levels." : "With the reference in the second role, lower relative levels correspond to more reactive metals in this declared comparison."} A common level shift does not change the order; use each metal once. Do not memorise these supplied voltages or an experiment-specific ranking as universal constants.`,
    };
  const reasons: Record<string, string> = {
    initial:
      "Swapping only the red/black meter connections reverses the measured difference while leaving the physical metals, chemical donor/acceptor and separate load unchanged.",
    controls:
      "Electrode and electrolyte identity, solution concentration and temperature affect voltage. Do not combine unmatched experiments as one unchanged comparison.",
    missing:
      "Not measured records an absent observation. It is not 0 V; a later inferred value must be labelled as a prediction, not an observed reading.",
    reference:
      "Adding the same offset to both relative levels cancels when they are subtracted. A chosen reference zero is not an absolute isolated-electrode voltage.",
    inconsistent:
      "The two exact common-reference readings require 0.5−1.2=−0.7 V, not −0.9 V. The three exact statements cannot all fit this unchanged comparison. Retain the records and examine conditions; do not silently delete a result. Real measurement comparisons need their stated rounding and uncertainty.",
    sign: "The negative sign describes which meter terminal is at the higher potential under the declared order. It is not negative reactivity, proof of no reaction or proof that the discharging cell absorbs electrical energy.",
    identical:
      "Matching copper electrodes have no electrode-reactivity difference in this ideal comparison. That limited evidence does not establish that copper is unreactive in all other chemical situations.",
  };
  return {
    correct: ["claim", "reason"].every(eq),
    explanation: reasons[b.record],
  };
}
export function voltageHistoryStep(mode: VoltageMode, a: unknown, b: unknown) {
  if (!validVoltageBoard(mode, a) || !validVoltageBoard(mode, b)) return false;
  if (a.record !== b.record) {
    const reset = initialVoltageBoard(mode, b.record);
    return Object.keys(reset).every((k) => b[k] === reset[k]);
  }
  return Object.keys(a).filter((k) => a[k] !== b[k]).length === 1;
}
