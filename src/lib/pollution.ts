export type PollutionMode =
  "products" | "source" | "balance" | "effects" | "fuels" | "control";
export type PollutionBoard = Record<string, string>;
export type PollutionEquation = {
  left: readonly {
    formula: string;
    atoms: Record<string, number>;
    field: string;
  }[];
  right: readonly {
    formula: string;
    atoms: Record<string, number>;
    field: string;
  }[];
};
export type PollutionGiven = {
  title: string;
  note: string;
  rows?: readonly { label: string; text: string }[];
  equation?: PollutionEquation;
  fuels?: readonly {
    name: string;
    mass: number;
    sulfur: number;
    particles: string;
  }[];
  monitor?: {
    pollutant: string;
    before: number;
    after: number;
    unit: string;
    other: string;
  };
};
export type PollutionRecord = PollutionGiven & {
  mode: PollutionMode;
  expected: PollutionBoard;
  feedback: string;
};
export const pollutionFields: Record<PollutionMode, readonly string[]> = {
  products: ["co2", "water", "co", "soot", "so2", "nox"],
  source: ["origin", "partner", "condition"],
  balance: ["a", "b", "c", "d"],
  effects: ["pollutant", "mechanism", "consequence"],
  fuels: ["mostSulfur", "leastParticles", "sulfurMass"],
  control: ["removed", "reduction", "remaining"],
};
export const pollutionNumeric = [
  "a",
  "b",
  "c",
  "d",
  "sulfurMass",
  "removed",
  "reduction",
];
export const pollutionLabels: Record<string, string> = {
  co2: "Carbon dioxide (CO₂)",
  water: "Water (H₂O)",
  co: "Carbon monoxide (CO)",
  soot: "Carbon soot (C)",
  so2: "Sulfur dioxide (SO₂)",
  nox: "Oxides of nitrogen (NOₓ)",
  possible: "Can be formed here",
  absent: "Not predicted here",
  origin: "Source of the relevant element",
  partner: "Reacting partner",
  condition: "Condition that explains formation",
  fuelSulfur: "Sulfur impurity in the fuel",
  fuelCarbon: "Carbon in the fuel",
  airNitrogen: "Nitrogen from intake air",
  waterSource: "Water alone",
  oxygen: "Oxygen",
  nitrogen: "Nitrogen",
  carbonDioxide: "Carbon dioxide",
  sulfurBurn: "Sulfur burns in oxygen",
  highTemperature: "Very high temperature",
  limitedOxygen: "Insufficient oxygen",
  coldAir: "Cold air alone",
  a: "First reactant coefficient",
  b: "Second reactant coefficient",
  c: "First product coefficient",
  d: "Second product coefficient",
  pollutant: "Pollutant in your explanation",
  mechanism: "Proposed mechanism",
  consequence: "Proposed consequence",
  bindsBlood: "Binds haemoglobin",
  acidWater: "Forms acids in moist air",
  scatterLight: "Scatters/absorbs sunlight",
  trapsAll: "Permanently traps all infrared",
  ozoneHole: "Removes stratospheric ozone",
  oxygenDelivery: "Reduced oxygen delivery",
  acidDamage: "Acid-rain damage",
  dimming: "Less surface sunlight (dimming)",
  beneficial: "Makes all air safe",
  mostSulfur: "Fuel with greatest sulfur mass burned",
  leastParticles: "Lowest supplied particle emission",
  sulfurMass: "Sulfur burned in the selected fuel / g",
  A: "Fuel A",
  B: "Fuel B",
  C: "Fuel C",
  removed: "Decrease in supplied emission rate",
  reduction: "Reduction relative to the original / %",
  remaining: "What the treatment leaves unresolved",
  gasesRemain: "Gaseous pollutants remain",
  otherPollutants: "Other pollutants remain",
  carbonRemains: "CO₂ and NOₓ can remain",
  allSafe: "Every pollutant is now zero",
};
export const pollutionChoices: Record<string, readonly string[]> = {
  co2: ["possible", "absent"],
  water: ["possible", "absent"],
  co: ["possible", "absent"],
  soot: ["possible", "absent"],
  so2: ["possible", "absent"],
  nox: ["possible", "absent"],
  origin: ["fuelSulfur", "fuelCarbon", "airNitrogen", "waterSource"],
  partner: ["oxygen", "nitrogen", "carbonDioxide"],
  condition: ["sulfurBurn", "highTemperature", "limitedOxygen", "coldAir"],
  pollutant: ["co", "so2", "nox", "soot", "co2"],
  mechanism: [
    "bindsBlood",
    "acidWater",
    "scatterLight",
    "trapsAll",
    "ozoneHole",
  ],
  consequence: ["oxygenDelivery", "acidDamage", "dimming", "beneficial"],
  mostSulfur: ["A", "B", "C"],
  leastParticles: ["A", "B", "C"],
  remaining: ["gasesRemain", "otherPollutants", "carbonRemains", "allSafe"],
};
export const methaneCO: PollutionEquation = {
  left: [
    { formula: "CH₄", atoms: { C: 1, H: 4 }, field: "a" },
    { formula: "O₂", atoms: { O: 2 }, field: "b" },
  ],
  right: [
    { formula: "CO", atoms: { C: 1, O: 1 }, field: "c" },
    { formula: "H₂O", atoms: { H: 2, O: 1 }, field: "d" },
  ],
};
export const methaneSoot: PollutionEquation = {
  ...methaneCO,
  right: [{ formula: "C", atoms: { C: 1 }, field: "c" }, methaneCO.right[1]],
};
export const sulfurEquation: PollutionEquation = {
  left: [
    { formula: "S", atoms: { S: 1 }, field: "a" },
    { formula: "O₂", atoms: { O: 2 }, field: "b" },
  ],
  right: [{ formula: "SO₂", atoms: { S: 1, O: 2 }, field: "c" }],
};
export const nitrogenEquation: PollutionEquation = {
  left: [
    { formula: "N₂", atoms: { N: 2 }, field: "a" },
    { formula: "O₂", atoms: { O: 2 }, field: "b" },
  ],
  right: [{ formula: "NO", atoms: { N: 1, O: 1 }, field: "c" }],
};
const product = (
  title: string,
  note: string,
  expected: PollutionBoard,
  feedback: string,
): PollutionRecord => ({ mode: "products", title, note, expected, feedback });
const effect = (
  title: string,
  note: string,
  pollutant: string,
  mechanism: string,
  consequence: string,
  feedback: string,
): PollutionRecord => ({
  mode: "effects",
  title,
  note,
  expected: { pollutant, mechanism, consequence },
  feedback,
});
export const pollutionRecords: Record<string, PollutionRecord> = {
  complete: product(
    "Predict the exhaust",
    "Complete methane combustion: enough oxygen, low temperature, no sulfur impurity.",
    {
      co2: "possible",
      water: "possible",
      co: "absent",
      soot: "absent",
      so2: "absent",
      nox: "absent",
    },
    "Complete methane combustion produces CO₂ and water. CO/soot result from incomplete carbon oxidation. No sulfur was supplied; the stated low-temperature condition excludes appreciable NOₓ formation.",
  ),
  incomplete: product(
    "Oxygen-limited methane",
    "Pure methane burns with insufficient oxygen. Carbon-containing products can be a mixture. Temperature is too low for appreciable nitrogen–oxygen reaction.",
    {
      co2: "possible",
      water: "possible",
      co: "possible",
      soot: "possible",
      so2: "absent",
      nox: "absent",
    },
    "Incomplete methane combustion can produce CO and carbon soot alongside CO₂ and water. Limited oxygen does not specify one universal mixture or ratio. Pure methane supplies no sulfur.",
  ),
  hydrogen: product(
    "Hydrogen in hot air",
    "Pure hydrogen burns in air at a very high combustion temperature; nitrogen–oxygen reaction is appreciable. No carbon or sulfur is supplied. This is combustion, not a fuel cell.",
    {
      co2: "absent",
      water: "possible",
      co: "absent",
      soot: "absent",
      so2: "absent",
      nox: "possible",
    },
    "Hydrogen combustion produces water. With no carbon or sulfur, fuel-derived CO₂, CO, carbon soot and SO₂ are not predicted. Hot intake nitrogen and oxygen can still form NOₓ; a carbon-free fuel does not mean all exhaust pollutants are absent.",
  ),
  carbon: product(
    "Carbon with sulfur impurity",
    "A carbon fuel containing sulfur burns completely in oxygen. There is no hydrogen and no nitrogen in the supplied reactants.",
    {
      co2: "possible",
      water: "absent",
      co: "absent",
      soot: "absent",
      so2: "possible",
      nox: "absent",
    },
    "Complete carbon combustion produces CO₂; the sulfur impurity can form SO₂. No supplied hydrogen means no water from this reaction, and no nitrogen means no NOₓ. These stated ideal conditions do not describe every real coal fire.",
  ),
  sulfur: {
    mode: "source",
    title: "Trace sulfur dioxide",
    note: "A fuel containing a sulfur impurity is burned in oxygen.",
    expected: {
      origin: "fuelSulfur",
      partner: "oxygen",
      condition: "sulfurBurn",
    },
    feedback:
      "Sulfur in the fuel reacts with oxygen to form SO₂. It is the sulfur content, not merely the fuel’s carbon content, that supplies sulfur atoms.",
  },
  nitrogen: {
    mode: "source",
    title: "Trace engine nitrogen oxides",
    note: "A sulfur-free hydrocarbon fuel is burned in intake air at very high temperature.",
    expected: {
      origin: "airNitrogen",
      partner: "oxygen",
      condition: "highTemperature",
    },
    feedback:
      "Nitrogen and oxygen from intake air can react at high engine temperature to form oxides of nitrogen. The fuel need not contain nitrogen; an oxygen shortage is not this explanation.",
  },
  shortage: {
    mode: "source",
    title: "Trace carbon monoxide",
    note: "A carbon-containing fuel burns with too little oxygen for complete combustion.",
    expected: {
      origin: "fuelCarbon",
      partner: "oxygen",
      condition: "limitedOxygen",
    },
    feedback:
      "Carbon in the fuel is incompletely oxidised by oxygen, so CO can form. Soot may form too; neither visible smoke nor its absence establishes whether CO is present.",
  },
  balanceCO: {
    mode: "balance",
    title: "Balance incomplete combustion",
    note: "Represent one possible incomplete methane combustion reaction forming CO and water. Keep every chemical formula unchanged.",
    equation: methaneCO,
    expected: { a: "2", b: "3", c: "2", d: "4" },
    feedback:
      "2CH₄ +3O₂ →2CO +4H₂O conserves C:2, H:8 and O:6 on each side. Positive whole-number multiples also balance; coefficients change particle numbers, never subscripts.",
  },
  balanceSoot: {
    mode: "balance",
    title: "Balance soot formation",
    note: "Represent one possible incomplete methane reaction forming carbon soot and water, with fixed formulae.",
    equation: methaneSoot,
    expected: { a: "1", b: "1", c: "1", d: "2" },
    feedback:
      "CH₄ +O₂ →C +2H₂O conserves C:1, H:4 and O:2 on each side. Real incomplete combustion can contain multiple products; this equation represents one pathway.",
  },
  balanceSulfur: {
    mode: "balance",
    title: "Balance sulfur oxidation",
    note: "Sulfur in a fuel burns to sulfur dioxide. This equation has one product.",
    equation: sulfurEquation,
    expected: { a: "1", b: "1", c: "1" },
    feedback:
      "S +O₂ →SO₂ conserves one sulfur and two oxygen atoms on each side. A blank coefficient is not automatically treated as 1; enter every coefficient.",
  },
  balanceNitrogen: {
    mode: "balance",
    title: "Balance nitrogen monoxide formation",
    note: "At high temperature N₂ and O₂ can form NO, one oxide of nitrogen. It can undergo further atmospheric oxidation.",
    equation: nitrogenEquation,
    expected: { a: "1", b: "1", c: "2" },
    feedback:
      "N₂ +O₂ →2NO conserves two nitrogen and two oxygen atoms. NO is one oxide; NOₓ denotes a family rather than one fixed molecule.",
  },
  coEffect: effect(
    "Explain the invisible hazard",
    "The gas is colourless and odourless. It forms during incomplete combustion of carbon-containing fuel.",
    "co",
    "bindsBlood",
    "oxygenDelivery",
    "CO binds haemoglobin and reduces blood’s ability to deliver oxygen to tissues. It is colourless and odourless; sight and smell cannot establish its absence. CO₂ has a different formula and role.",
  ),
  sulfurEffect: effect(
    "Connect sulfur dioxide to acid rain",
    "Sulfur-containing fuel has been burned; the sulfur oxide enters moist air.",
    "so2",
    "acidWater",
    "acidDamage",
    "SO₂ can undergo atmospheric reactions and form acids in water. Acid rain can damage carbonate stone and harm aquatic/plant ecosystems; SO₂ also irritates airways. This is different from enhanced greenhouse warming.",
  ),
  nitrogenEffect: effect(
    "Connect nitrogen oxides to acid rain",
    "Nitrogen–oxygen products from high-temperature engine combustion enter moist air.",
    "nox",
    "acidWater",
    "acidDamage",
    "Oxides of nitrogen can contribute to acid formation and acid rain, and cause respiratory problems. Different pollutants can share an effect; their elemental sources are still different.",
  ),
  particleEffect: effect(
    "Explain global dimming",
    "Fine solid particles are suspended in air after incomplete combustion.",
    "soot",
    "scatterLight",
    "dimming",
    "Particulates scatter and absorb incoming solar radiation, reducing sunlight reaching the surface: global dimming. They also cause health/respiratory problems. This is not an ozone hole or the greenhouse infrared mechanism; local conditions and particle type matter.",
  ),
  equal: {
    mode: "fuels",
    title: "Compare equal fuel masses",
    note: "Original exercise:1 kg of each fuel is burned under comparable conditions. Every sulfur atom forms SO₂; use only the supplied particle ranking.",
    fuels: [
      { name: "A", mass: 1, sulfur: 2, particles: "High" },
      { name: "B", mass: 1, sulfur: 0.5, particles: "Medium" },
      { name: "C", mass: 1, sulfur: 0.01, particles: "Low" },
    ],
    expected: { mostSulfur: "A", leastParticles: "C", sulfurMass: "20" },
    feedback:
      "With equal 1 kg masses, A has greatest sulfur mass:2% of 1000 g =20 g. Under the stated conversion assumption it therefore produces most SO₂. C has lowest supplied particle emission; sulfur content alone does not establish every other emission.",
  },
  unequal: {
    mode: "fuels",
    title: "Check the comparison basis",
    note: "Original exercise: different masses are burned. Every sulfur atom forms SO₂. Particle ranking describes total emissions from the listed burn, not emissions per kilogram.",
    fuels: [
      { name: "A", mass: 1, sulfur: 2, particles: "Medium" },
      { name: "B", mass: 5, sulfur: 0.6, particles: "High" },
      { name: "C", mass: 2, sulfur: 0.1, particles: "Low" },
    ],
    expected: { mostSulfur: "B", leastParticles: "C", sulfurMass: "30" },
    feedback:
      "A burns 20 g sulfur; B burns 0.6% of 5000 g =30 g; C burns 2 g. B therefore produces most SO₂ on the supplied conversion basis despite its lower sulfur percentage. Compare sulfur mass, not percentages alone.",
  },
  filter: {
    mode: "control",
    title: "Audit a particle filter",
    note: "Original before/after measurements at equal fuel input and matched operation. Do not infer safe exposure from these rates.",
    monitor: {
      pollutant: "Particulates",
      before: 40,
      after: 10,
      unit: "mg/min",
      other: "CO and NOₓ are not assessed by the particle measurement.",
    },
    expected: { removed: "30", reduction: "75", remaining: "gasesRemain" },
    feedback:
      "The particle rate falls 40−10=30 mg/min, a 30/40×100=75% reduction. 10 mg/min remains. A particle filter does not remove all gaseous pollutants or establish safe air.",
  },
  desulfur: {
    mode: "control",
    title: "Audit sulfur removal",
    note: "Original matched fuel-burning measurements before and after removal of some sulfur impurity.",
    monitor: {
      pollutant: "SO₂",
      before: 80,
      after: 20,
      unit: "g/hour",
      other: "No data about CO, NOₓ, CO₂ or particles are supplied.",
    },
    expected: { removed: "60", reduction: "75", remaining: "otherPollutants" },
    feedback:
      "SO₂ falls 80−20=60 g/hour;60/80×100=75%. Reducing fuel sulfur targets SO₂, while other pollutant pathways require separate control. These supplied rates are not legal limits or safety thresholds.",
  },
  oxygenControl: {
    mode: "control",
    title: "Audit more complete combustion",
    note: "Original matched measurements after improving oxygen supply. Both burns use a carbon-containing fuel in a hot-air engine.",
    monitor: {
      pollutant: "CO",
      before: 12,
      after: 3,
      unit: "g/hour",
      other: "CO₂ and NOₓ are not measured in this table.",
    },
    expected: { removed: "9", reduction: "75", remaining: "carbonRemains" },
    feedback:
      "CO falls 12−3=9 g/hour;9/12×100=75%. More complete burning can lower CO/soot, but carbon still forms CO₂ and hot nitrogen/oxygen can form NOₓ. A lower CO rate is not evidence that every pollutant disappeared.",
  },
};
export function pollutionRecord(mode: PollutionMode, record: string) {
  return pollutionRecords[record]?.mode === mode
    ? pollutionRecords[record]
    : null;
}
export function fieldsFor(mode: PollutionMode, record: string) {
  const r = pollutionRecord(mode, record);
  return mode === "balance" && r?.equation?.right.length === 1
    ? pollutionFields.balance.slice(0, 3)
    : pollutionFields[mode];
}
export function initialPollution(
  mode: PollutionMode,
  record: string,
): PollutionBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(fieldsFor(mode, record).map((f) => [f, ""])),
  };
}
export function pollutionNumber(raw: string): number | null {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function validPollution(
  mode: PollutionMode,
  v: unknown,
  record?: string,
): v is PollutionBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    return false;
  const b = v as PollutionBoard,
    r = pollutionRecord(mode, b.record),
    fields = fieldsFor(mode, b.record);
  return (
    !!r &&
    b.version === "1" &&
    b.mode === mode &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (pollutionNumeric.includes(f)
            ? b[f].length <= 16
            : pollutionChoices[f]?.includes(b[f]))),
    )
  );
}
export function validPollutionHistory(
  mode: PollutionMode,
  record: string,
  h: unknown,
): h is PollutionBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validPollution(mode, b, record))
  )
    return false;
  const initial = initialPollution(mode, record);
  return (
    Object.keys(initial).every((k) => h[0][k] === initial[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        fieldsFor(mode, record).filter((f) => b[f] !== h[i - 1][f]).length ===
          1,
    )
  );
}
export function atomTally(e: PollutionEquation, b: Record<string, string>) {
  return Object.fromEntries(
    [
      ...new Set([...e.left, ...e.right].flatMap((s) => Object.keys(s.atoms))),
    ].map((atom) => [
      atom,
      {
        left: e.left.reduce(
          (n, s) =>
            n + (pollutionNumber(b[s.field] ?? "") ?? 0) * (s.atoms[atom] ?? 0),
          0,
        ),
        right: e.right.reduce(
          (n, s) =>
            n + (pollutionNumber(b[s.field] ?? "") ?? 0) * (s.atoms[atom] ?? 0),
          0,
        ),
      },
    ]),
  );
}
export function checkPollution(mode: PollutionMode, b: PollutionBoard) {
  if (!validPollution(mode, b))
    return {
      correct: false,
      message:
        "This proposal is unreadable. Its original entries are retained.",
    };
  const r = pollutionRecord(mode, b.record)!,
    fields = fieldsFor(mode, b.record);
  if (fields.some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  if (mode === "balance") {
    const valid = fields.every((f) => {
      const n = pollutionNumber(b[f]);
      return n !== null && Number.isSafeInteger(n) && n > 0;
    });
    const equal =
      valid &&
      Object.values(atomTally(r.equation!, b)).every((t) => t.left === t.right);
    return {
      correct: equal,
      message:
        (equal
          ? ""
          : "Reconsider positive whole-number coefficients and each atom total. ") +
        r.feedback +
        (equal ? "" : " Your proposal remains as entered."),
    };
  }
  const wrong = fields.filter((f) =>
    pollutionNumeric.includes(f)
      ? pollutionNumber(b[f]) === null ||
        Math.abs(pollutionNumber(b[f])! - Number(r.expected[f])) > 1e-6
      : b[f] !== r.expected[f],
  );
  return {
    correct: wrong.length === 0,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => pollutionLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
