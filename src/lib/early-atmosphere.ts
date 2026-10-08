export type AtmosphereMode =
  | "composition"
  | "sequence"
  | "photosynthesis"
  | "stores"
  | "graph"
  | "bar"
  | "evidence";
export type AtmosphereBoard = Record<string, string>;
export type AtmosphereGraph = {
  name: string;
  ages: readonly number[];
  nitrogen: readonly number[];
  oxygen: readonly number[];
  dioxide: readonly number[];
  other: readonly number[];
};
export const atmosphereGraphs: Record<string, AtmosphereGraph> = {
  guided: {
    name: "Teaching reconstruction A",
    ages: [4000, 3500, 3000, 2500, 2000, 1500, 1000, 500, 0],
    nitrogen: [10, 40, 70, 78, 78, 78, 78, 78, 78],
    oxygen: [0, 0, 0, 0, 4, 12, 16, 20, 21],
    dioxide: [90, 60, 30, 20, 16, 8, 4, 1, 0.04],
    other: [0, 0, 0, 2, 2, 2, 2, 1, 0.96],
  },
  coldA: {
    name: "Teaching reconstruction B",
    ages: [3600, 3000, 2400, 1800, 1200, 600, 0],
    nitrogen: [10, 45, 75, 78, 78, 78, 78],
    oxygen: [0, 0, 0, 4, 12, 19, 21],
    dioxide: [90, 55, 25, 16, 8, 2, 0.04],
    other: [0, 0, 0, 2, 2, 1, 0.96],
  },
  coldB: {
    name: "Teaching reconstruction C",
    ages: [4200, 3500, 2800, 2100, 1400, 700, 0],
    nitrogen: [15, 50, 78, 78, 78, 78, 78],
    oxygen: [0, 0, 0, 5, 13, 20, 21],
    dioxide: [85, 50, 20, 15, 7, 1, 0.04],
    other: [0, 0, 2, 2, 2, 1, 0.96],
  },
};
export type AtmosphereGiven = {
  title: string;
  note: string;
  rows?: readonly { label: string; text: string }[];
  graph?: string;
  bar?: { max: number; oxygen: number; dioxide: number };
};
export type AtmosphereRecord = AtmosphereGiven & {
  mode: AtmosphereMode;
  expected: AtmosphereBoard;
  feedback: string;
};
export const atmosphereFields: Record<AtmosphereMode, readonly string[]> = {
  composition: ["nitrogen", "oxygen", "other"],
  sequence: ["first", "second", "third"],
  photosynthesis: ["inputs", "outputs", "energy"],
  stores: ["origin", "process", "store"],
  graph: ["age", "meaning"],
  bar: ["scale1", "scale2", "scale3", "height"],
  evidence: ["claim", "basis"],
};
export const atmosphereNumeric = [
  "nitrogen",
  "oxygen",
  "other",
  "age",
  "scale1",
  "scale2",
  "scale3",
  "height",
];
const stages = [
  "cool",
  "condense",
  "ocean",
  "photosynth",
  "boil",
  "oxygenFirst",
];
export const atmosphereChoices: Record<string, readonly string[]> = {
  first: stages,
  second: stages,
  third: stages,
  inputs: ["coWater", "oGlucose", "nitrogenWater"],
  outputs: ["glucoseO", "coWater", "oxygenOnly"],
  energy: ["light", "darkOnly", "noEnergy"],
  origin: ["shells", "plants", "plankton", "volcano"],
  process: ["carbonate", "burialPlant", "burialMarine", "burn"],
  store: ["limestone", "coal", "oilGas", "air"],
  meaning: ["ago", "since", "exact"],
  claim: ["qualified", "certain", "noEvidence", "similarity"],
  basis: ["rocks", "measurement", "planet", "guess"],
};
export const atmosphereLabels: Record<string, string> = {
  nitrogen: "Nitrogen / %",
  oxygen: "Oxygen / %",
  other: "Other gases / %",
  first: "Stage 1",
  second: "Stage 2",
  third: "Stage 3",
  cool: "Earth cools",
  condense: "Water vapour condenses to liquid",
  ocean: "Liquid water collects as oceans",
  photosynth: "Algae photosynthesise",
  boil: "Liquid water boils away",
  oxygenFirst: "Oxygen alone turns into oceans",
  inputs: "Reactants",
  outputs: "Products",
  energy: "Energy condition",
  coWater: "Carbon dioxide + water",
  oGlucose: "Oxygen + glucose",
  nitrogenWater: "Nitrogen + water",
  glucoseO: "Glucose + oxygen",
  oxygenOnly: "Oxygen only",
  light: "Light supplies energy",
  darkOnly: "Only in darkness",
  noEnergy: "No energy transfer",
  origin: "Source of material",
  process: "Formation process",
  store: "Long-term carbon store",
  shells: "Carbonate shells and skeletons",
  plants: "Ancient plant material",
  plankton: "Ancient plankton and other marine organisms",
  volcano: "New volcanic oxygen",
  carbonate: "Carbonates accumulate, compact and form sedimentary rock",
  burialPlant:
    "Plant remains are buried with limited oxygen, then change under pressure and heat over millions of years",
  burialMarine:
    "Marine remains are buried with limited oxygen, then change under pressure and heat over millions of years",
  burn: "Complete combustion returns carbon dioxide to air",
  limestone: "Limestone",
  coal: "Coal",
  oilGas: "Crude oil and natural gas",
  air: "Atmospheric carbon dioxide",
  age: "Your marker / millions of years ago",
  meaning: "Meaning of this age axis",
  ago: "Time before today; moving right approaches today",
  since: "Time since formation; moving right means older",
  exact: "Exact directly measured historical dates",
  scale1: "First major tick / %",
  scale2: "Second major tick / %",
  scale3: "Third major tick / %",
  height: "Your oxygen bar / %",
  claim: "Supported claim",
  basis: "Evidence or limitation",
  qualified: "A reconstruction supported by evidence, with uncertainty",
  certain: "Every ancient percentage is known exactly",
  noEvidence: "There is no useful evidence about the past",
  similarity:
    "Planet comparison is consistent with a theory, but does not prove it",
  rocks:
    "Ancient rocks supply indirect evidence, which can be incomplete or altered",
  measurement: "Direct gas measurements from billions of years ago",
  planet: "Modern Mars/Venus comparisons are indirect evidence",
  guess: "Any guess is equally well supported",
};
export const atmosphereRecords: Record<string, AtmosphereRecord> = {
  modern: {
    mode: "composition",
    title: "Modern dry air",
    note: "Rounded percentages.",
    expected: { nitrogen: "78", oxygen: "21", other: "1" },
    feedback:
      "Rounded dry air is 78% nitrogen, 21% oxygen and about 1% other gases. The whole is 100%. Carbon dioxide is only a small part of the other gases; water vapour varies and is excluded from dry-air percentages.",
  },
  precise: {
    mode: "composition",
    title: "Use the supplied precision",
    note: "This supplied dry-air table gives oxygen 20.95% and other gases 0.96%. Find nitrogen; do not replace the supplied precision with rounded recall values.",
    rows: [
      { label: "Oxygen", text: "20.95%" },
      { label: "Other gases", text: "0.96%" },
    ],
    expected: { nitrogen: "78.09", oxygen: "20.95", other: "0.96" },
    feedback:
      "100−20.95−0.96=78.09% nitrogen. Percentages sum to 100%; recall rounding and supplied precision serve different questions.",
  },
  oceans: {
    mode: "sequence",
    title: "From vapour to oceans",
    note: "Arrange the physical stages.",
    expected: { first: "cool", second: "condense", third: "ocean" },
    feedback:
      "Earth cooled, water vapour condensed to liquid, and liquid water collected as oceans. Condensation changes state; it does not turn oxygen atoms into water or require photosynthesis.",
  },
  algae: {
    mode: "photosynthesis",
    title: "Build the photosynthesis equation",
    note: "Algae in daylight. Choose both reactants, both products and the energy condition.",
    expected: { inputs: "coWater", outputs: "glucoseO", energy: "light" },
    feedback:
      "Carbon dioxide + water → glucose + oxygen, with light supplying energy. Balanced representation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Photosynthesis uses CO₂ and releases O₂. Algae first produced oxygen about 2.7 billion years ago; atmospheric oxygen increased gradually, later with plants.",
  },
  plants: {
    mode: "photosynthesis",
    title: "A plant in daylight",
    note: "Use the same chemical word equation for a photosynthesising plant.",
    expected: { inputs: "coWater", outputs: "glucoseO", energy: "light" },
    feedback:
      "Plants and algae use carbon dioxide and water to make glucose and oxygen using light energy. Balanced representation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. This removes CO₂; respiration and combustion do not provide the same atmospheric change.",
  },
  limestone: {
    mode: "stores",
    title: "Follow carbonate carbon",
    note: "Marine organisms build carbonate shells and skeletons. Where can their carbon become stored?",
    expected: { origin: "shells", process: "carbonate", store: "limestone" },
    feedback:
      "Carbon dioxide dissolves in oceans. Carbonates can precipitate, and carbonate shells/skeletons accumulate and become limestone. Carbon stays in carbonate compounds; it is not destroyed. Dissolution and precipitation can remove CO₂ even before widespread life.",
  },
  coal: {
    mode: "stores",
    title: "Follow ancient land-plant carbon",
    note: "Plant remains accumulate and are buried. Select a plausible formation route.",
    expected: { origin: "plants", process: "burialPlant", store: "coal" },
    feedback:
      "Photosynthesis puts atmospheric carbon into plant biomass. Burial with limited oxygen reduces complete decay; plant material changes under pressure and heat over millions of years to form coal. Most remains decay instead; formation stores carbon rather than destroying it.",
  },
  oil: {
    mode: "stores",
    title: "Follow marine biomass carbon",
    note: "Marine remains become buried in sediment. Select a plausible formation route.",
    expected: { origin: "plankton", process: "burialMarine", store: "oilGas" },
    feedback:
      "Ancient plankton and other marine organisms become buried in sediment with limited oxygen, reducing complete decay; heat and pressure over millions of years form crude oil and natural gas. These carbon stores differ from coal's land-plant origin. Burning fuels returns CO₂.",
  },
  "graph-read": {
    mode: "graph",
    title: "Read the oxygen curve",
    note: "In reconstruction A, place a marker where oxygen is 12%.",
    graph: "guided",
    expected: { age: "1500", meaning: "ago" },
    feedback:
      "The solid oxygen curve reaches 12% at 1500 million years ago. The axis decreases towards today on the right. These are original teaching reconstruction values, not exact ancient measurements.",
  },
  "graph-plateau": {
    mode: "graph",
    title: "Read when nitrogen levels off",
    note: "In reconstruction A, mark the beginning of the constant nitrogen percentage.",
    graph: "guided",
    expected: { age: "2500", meaning: "ago" },
    feedback:
      "Nitrogen first reaches its 78% plateau at 2500 million years ago in this supplied teaching model. A constant percentage does not necessarily mean a constant number of nitrogen molecules.",
  },
  "graph-interpolate": {
    mode: "graph",
    title: "Read between time ticks",
    note: "Use the straight oxygen segment from 1500 to 1000 million years ago. Mark where oxygen is 14%.",
    graph: "guided",
    expected: { age: "1250", meaning: "ago" },
    feedback:
      "14% is halfway between 12% and 16%, so the straight segment places it halfway between 1500 and 1000: 1250 million years ago. This is interpolation within a supplied model, not a claim of historical precision.",
  },
  "bar-twelve": {
    mode: "bar",
    title: "Complete the scale and oxygen bar",
    note: "Supplied estimate: oxygen 12%, carbon dioxide 6%. Axis 0–20 with four equal major intervals. Enter its three missing labels and plot oxygen.",
    bar: { max: 20, oxygen: 12, dioxide: 6 },
    expected: { scale1: "5", scale2: "10", scale3: "15", height: "12" },
    feedback:
      "Four equal intervals from 0 to 20 give steps of 5 percentage points: 5, 10, 15. The oxygen bar reaches 12%, between 10 and 15. CO₂'s supplied 6% bar remains unchanged.",
  },
  "bar-eighteen": {
    mode: "bar",
    title: "Change the scale, preserve the data",
    note: "Another supplied estimate: oxygen 18%, CO₂ 2%. Axis 0–24 with four equal major intervals.",
    bar: { max: 24, oxygen: 18, dioxide: 2 },
    expected: { scale1: "6", scale2: "12", scale3: "18", height: "18" },
    feedback:
      "24÷4=6 percentage points per major interval: 6, 12, 18. Oxygen reaches 18%; changing a display scale does not change the supplied gas percentage.",
  },
  ancient: {
    mode: "evidence",
    title: "How certain can this reconstruction be?",
    note: "An ancient-rock study supports a CO₂-rich early atmosphere. Some rocks have changed since formation; no direct gas record spans 4.6 billion years.",
    expected: { claim: "qualified", basis: "rocks" },
    feedback:
      "Geological evidence can support and constrain a theory, but ancient evidence is incomplete and rocks can be altered. A qualified reconstruction is justified; neither absolute certainty nor ‘no evidence’ follows.",
  },
  planets: {
    mode: "evidence",
    title: "Use another planet carefully",
    note: "Modern Mars and Venus have atmospheres rich in carbon dioxide. Compare with a proposed CO₂-rich early Earth.",
    expected: { claim: "similarity", basis: "planet" },
    feedback:
      "The similarity is consistent with the proposed theory; it is not proof that Earth had identical percentages or history. Planet comparisons are indirect evidence, considered alongside geological evidence.",
  },
};
export function atmosphereRecord(mode: AtmosphereMode, record: string) {
  const r = atmosphereRecords[record];
  return r?.mode === mode ? r : null;
}
export function initialAtmosphere(
  mode: AtmosphereMode,
  record: string,
): AtmosphereBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(atmosphereFields[mode].map((f) => [f, ""])),
  };
}
export function atmosphereNumber(raw: string): number | null {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function validAtmosphere(
  mode: AtmosphereMode,
  value: unknown,
  record?: string,
): value is AtmosphereBoard {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return false;
  const b = value as AtmosphereBoard,
    fields = atmosphereFields[mode];
  return (
    !!fields &&
    b.version === "1" &&
    b.mode === mode &&
    !!atmosphereRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (atmosphereNumeric.includes(f)
            ? b[f].length <= 16
            : atmosphereChoices[f]?.includes(b[f]))),
    )
  );
}
export function validAtmosphereHistory(
  mode: AtmosphereMode,
  record: string,
  h: unknown,
): h is AtmosphereBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validAtmosphere(mode, b, record))
  )
    return false;
  const initial = initialAtmosphere(mode, record);
  return (
    Object.keys(initial).every((k) => h[0][k] === initial[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        atmosphereFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkAtmosphere(mode: AtmosphereMode, b: AtmosphereBoard) {
  if (!validAtmosphere(mode, b))
    return {
      correct: false,
      message:
        "This proposal is unreadable. Its original entries are retained.",
    };
  if (atmosphereFields[mode].some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const r = atmosphereRecord(mode, b.record)!,
    wrong = atmosphereFields[mode].filter((f) =>
      atmosphereNumeric.includes(f)
        ? atmosphereNumber(b[f]) === null ||
          Math.abs(atmosphereNumber(b[f])! - Number(r.expected[f])) > 0.000001
        : b[f] !== r.expected[f],
    );
  return {
    correct: wrong.length === 0,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => atmosphereLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
