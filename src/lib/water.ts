export type WaterMode =
  | "quality"
  | "treatment"
  | "residue"
  | "distil"
  | "membrane"
  | "resources"
  | "repeat";
export type WaterBoard = Record<string, string>;
export type WaterGiven = {
  title: string;
  note: string;
  summary?: string;
  rows: readonly { label: string; text: string }[];
  apparatus?: boolean;
  balance?: { empty: number; cooled: number; volume: number };
  membrane?: { feed: number; product: number; salt: number };
  energy?: { a: number; b: number; volume: number };
  repeat?: { masses: readonly number[]; volume: number };
};
export type WaterRecord = WaterGiven & {
  mode: WaterMode;
  expected: WaterBoard;
  feedback: string;
};
export const waterFields: Record<WaterMode, readonly string[]> = {
  quality: ["potable", "pure", "evidence"],
  treatment: ["first", "second", "saltFate", "microbeFate"],
  residue: ["solidMass", "litres", "concentration"],
  distil: ["heating", "cooling", "receiver", "saltFate"],
  membrane: ["driving", "product", "brine", "brineSalt"],
  resources: ["aPer", "bPer", "difference", "decision"],
  repeat: ["mean", "scaled", "dry"],
};
export const waterNumeric = [
  "solidMass",
  "litres",
  "concentration",
  "product",
  "brine",
  "brineSalt",
  "aPer",
  "bPer",
  "difference",
  "mean",
  "scaled",
];
export const waterLabels: Record<string, string> = {
  potable: "Potable in this stated case?",
  pure: "Chemically pure?",
  evidence: "What does the evidence establish?",
  yes: "Yes",
  no: "No",
  unknown: "Not established",
  accepted: "Quality checks pass",
  limited: "Evidence is limited",
  onlyWater: "Only H₂O is present",
  first: "First treatment stage",
  second: "Next treatment stage",
  filter: "Filter suspended solids",
  chlorine: "Disinfect with chlorine",
  ozone: "Disinfect with ozone",
  uv: "Disinfect with UV light",
  distillation: "Desalinate by distillation",
  ro: "Desalinate by reverse osmosis",
  none: "No further stage in this supplied case",
  saltFate: "Dissolved nonvolatile salt",
  unchanged: "Remains dissolved",
  left: "Stays in the heated flask",
  brineKept: "Mostly retained in the brine",
  removed: "Removed by ordinary filter beds",
  microbeFate: "Harmful microorganisms after the proposed route",
  destroyed: "Destroyed",
  remain: "Still present",
  solidMass: "Dry residue mass / g",
  litres: "Sample volume / dm³",
  concentration: "Dissolved solids / g per dm³",
  heating: "Change in the heated flask",
  evaporate: "Liquid water becomes water vapour",
  decompose: "Water becomes hydrogen and oxygen",
  cooling: "Receiver cooling",
  cold: "Cold-water/ice bath",
  warm: "No effective receiver cooling",
  receiver: "Material collected in the receiver",
  water: "Condensed liquid water",
  salt: "Dry salt",
  steam: "Only escaping water vapour",
  driving: "What drives this membrane separation?",
  pressure: "Applied high pressure",
  gravity: "Gravity through filter beds",
  magnet: "Magnetic attraction",
  product: "Product water volume / litres",
  brine: "Remaining brine volume / litres",
  brineSalt: "Salt retained in brine / g",
  aPer: "Route A energy / kWh per m³",
  bPer: "Route B energy / kWh per m³",
  difference: "B minus A energy / kWh per m³",
  decision: "Conclusion for the stated equal service",
  aLower: "A uses less energy per m³ here",
  bLower: "B uses less energy per m³ here",
  same: "Equal energy per m³ here",
  universal: "This proves one route is always best everywhere",
  mean: "Mean residue mass / g",
  scaled: "Mean dissolved solids / g per dm³",
  dry: "Evidence that residue is dry",
  constant: "Reheat, cool and reweigh to constant mass",
  oneWeigh: "One reading while the dish is hot",
  filterAgain: "Filter the already dried residue",
};
export const waterChoices: Record<string, readonly string[]> = {
  potable: ["yes", "no", "unknown"],
  pure: ["yes", "no", "unknown"],
  evidence: ["accepted", "limited", "onlyWater"],
  first: ["filter", "chlorine", "ozone", "uv", "distillation", "ro"],
  second: ["filter", "chlorine", "ozone", "uv", "none"],
  saltFate: ["unchanged", "left", "brineKept", "removed"],
  microbeFate: ["destroyed", "remain"],
  heating: ["evaporate", "decompose"],
  cooling: ["cold", "warm"],
  receiver: ["water", "salt", "steam"],
  driving: ["pressure", "gravity", "magnet"],
  decision: ["aLower", "bLower", "same", "universal"],
  dry: ["constant", "oneWeigh", "filterAgain"],
};
const row = (label: string, text: string) => ({ label, text });
export const waterRecords: Record<string, WaterRecord> = {
  mineral: {
    mode: "quality",
    title: "Read the water evidence",
    note: "Use the stated case.",
    summary: "Dissolved minerals; stated drinking-water quality checks pass.",
    rows: [
      row("Sample", "Clear water with dissolved minerals."),
      row(
        "Quality",
        "Specified salt and microbiological quality checks meet the supplied drinking-water standard.",
      ),
    ],
    expected: { potable: "yes", pure: "no", evidence: "accepted" },
    feedback:
      "The stated checks establish potability; dissolved minerals mean this is not chemically pure H₂O.",
  },
  clear: {
    mode: "quality",
    title: "Appearance is partial evidence",
    note: "Only these observations are available.",
    rows: [
      row("Sample", "Clear; pH 7 at room temperature."),
      row(
        "Missing evidence",
        "No dissolved-solid or microbiological results are supplied.",
      ),
    ],
    expected: { potable: "unknown", pure: "unknown", evidence: "limited" },
    feedback:
      "Clarity and neutral pH alone establish neither potability nor chemical purity. Dissolved salts or microbes could remain.",
  },
  saline: {
    mode: "quality",
    title: "Neutral salty water",
    note: "Use the stated quality evidence.",
    rows: [
      row("Sample", "Clear; pH 7; high dissolved salt."),
      row(
        "Quality",
        "Salt concentration exceeds the supplied drinking-water limit.",
      ),
    ],
    expected: { potable: "no", pure: "no", evidence: "limited" },
    feedback:
      "Neutral pH does not remove salt. The stated salt failure rules out potability; dissolved salt rules out chemical purity.",
  },
  pure: {
    mode: "quality",
    title: "Separate composition and quality",
    note: "This is a stipulated composition, not a claim proved by appearance.",
    rows: [
      row("Composition", "Only H₂O is present in a clean receiver."),
      row("Quality", "All supplied quality requirements are met."),
    ],
    expected: { potable: "yes", pure: "yes", evidence: "onlyWater" },
    feedback:
      "In this explicitly ideal case both descriptions apply. In general potable water need not be chemically pure.",
  },
  fresh: {
    mode: "treatment",
    title: "Treat a fresh source",
    note: "Choose a route for this source.",
    rows: [
      row(
        "Incoming water",
        "Suspended grit and harmful microbes; dissolved salts already within the stated limit.",
      ),
      row(
        "Route requirement",
        "Use filter beds, then chlorine for this supplied plant.",
      ),
    ],
    expected: {
      first: "filter",
      second: "chlorine",
      saltFate: "unchanged",
      microbeFate: "destroyed",
    },
    feedback:
      "Filter beds remove undissolved grit. Chlorine then destroys harmful microbes; dissolved minerals remain within the stated limit.",
  },
  freshUV: {
    mode: "treatment",
    title: "A UV treatment plant",
    note: "Use this plant's supplied equipment.",
    rows: [
      row(
        "Incoming water",
        "Suspended sediment and harmful microbes; acceptable salt level.",
      ),
      row("Equipment", "Filter beds followed by UV treatment."),
    ],
    expected: {
      first: "filter",
      second: "uv",
      saltFate: "unchanged",
      microbeFate: "destroyed",
    },
    feedback:
      "UV is a light-based disinfection method, not a chemical substance. Neither stage desalinates the dissolved salts.",
  },
  freshOzone: {
    mode: "treatment",
    title: "An ozone treatment plant",
    note: "Use this plant's supplied equipment.",
    rows: [
      row(
        "Incoming water",
        "Suspended particles and harmful microbes; acceptable salt level.",
      ),
      row("Equipment", "Filter beds followed by ozone treatment."),
    ],
    expected: {
      first: "filter",
      second: "ozone",
      saltFate: "unchanged",
      microbeFate: "destroyed",
    },
    feedback:
      "Ozone targets harmful microorganisms after particle filtration. It does not remove every dissolved mineral.",
  },
  seawater: {
    mode: "treatment",
    title: "A clear seawater feed",
    note: "Ideal supplied nonvolatile salt; clean apparatus and collection.",
    rows: [
      row(
        "Incoming water",
        "High dissolved salt and harmful microbes; no suspended solids or volatile contaminants.",
      ),
      row(
        "Equipment",
        "Distillation; heating destroys the stated microbes and the clean distillate meets the stated standard.",
      ),
    ],
    expected: {
      first: "distillation",
      second: "none",
      saltFate: "left",
      microbeFate: "destroyed",
    },
    feedback:
      "Water evaporates then condenses; nonvolatile salt remains in the flask. In this ideal stated case heating also destroys microbes, so no additional sterilisation is required. This is not a universal claim about unknown feeds.",
  },
  saltyRO: {
    mode: "treatment",
    title: "Membrane desalination and disinfection",
    note: "Follow the supplied plant specification.",
    rows: [
      row("Incoming water", "High dissolved salt, no suspended solids."),
      row(
        "Equipment",
        "Reverse osmosis followed by chlorine; do not assume membrane passage alone certifies microbiological quality.",
      ),
    ],
    expected: {
      first: "ro",
      second: "chlorine",
      saltFate: "brineKept",
      microbeFate: "destroyed",
    },
    feedback:
      "High-pressure reverse osmosis retains most salt in brine. The specified chlorine stage addresses harmful microorganisms; this is different from ordinary filter beds.",
  },
  dish10: {
    mode: "residue",
    title: "Subtract the empty dish",
    note: "Known volume; dry, cooled residue. All residue is stable nonvolatile dissolved solid.",
    rows: [],
    balance: { empty: 32.46, cooled: 32.51, volume: 10 },
    expected: { solidMass: "0.05", litres: "0.01", concentration: "5" },
    feedback:
      "32.51−32.46=0.05 g. 10 cm³=0.010 dm³. 0.05÷0.010=5 g/dm³; dish mass is not dissolved solid.",
  },
  dish25: {
    mode: "residue",
    title: "Scale a measured sample",
    note: "Dry cooled dish; stable nonvolatile residue only.",
    rows: [],
    balance: { empty: 28.12, cooled: 28.22, volume: 25 },
    expected: { solidMass: "0.10", litres: "0.025", concentration: "4" },
    feedback:
      "0.10 g in 0.025 dm³ gives 4 g/dm³. Scale both mass and volume together.",
  },
  dish50: {
    mode: "residue",
    title: "A larger sample",
    note: "Dry cooled dish; stable nonvolatile residue only.",
    rows: [],
    balance: { empty: 41.2, cooled: 42.8, volume: 50 },
    expected: { solidMass: "1.60", litres: "0.05", concentration: "32" },
    feedback: "42.80−41.20=1.60 g; 50 cm³=0.050 dm³; concentration 32 g/dm³.",
  },
  dish100: {
    mode: "residue",
    title: "A dilute sample",
    note: "Dry cooled dish; stable nonvolatile residue only.",
    rows: [],
    balance: { empty: 35.08, cooled: 35.11, volume: 100 },
    expected: { solidMass: "0.03", litres: "0.10", concentration: "0.3" },
    feedback:
      "The tiny difference is 0.03 g, not 35.11 g. In 0.100 dm³ this is 0.30 g/dm³.",
  },
  cold: {
    mode: "distil",
    title: "Follow the separated water",
    note: "Use a cold receiver to collect water from a nonvolatile salt solution.",
    summary:
      "Water with nonvolatile salt; clean collection. Build the cooled route.",
    rows: [
      row(
        "Fixed apparatus",
        "Heated flask → connected delivery tube → open receiver in a cold bath.",
      ),
      row(
        "Feed",
        "Water and nonvolatile dissolved salt; no volatile contaminants.",
      ),
    ],
    apparatus: true,
    expected: {
      heating: "evaporate",
      cooling: "cold",
      receiver: "water",
      saltFate: "left",
    },
    feedback:
      "Heating forms water vapour without changing H₂O identity. Cooling condenses it into liquid in the receiver. Nonvolatile salt stays in the flask.",
  },
  uncooled: {
    mode: "distil",
    title: "Explain lost collection",
    note: "Change the proposal to efficient cooling and collection.",
    summary:
      "Equal feed and heating time: the uncooled setup collects less. Build the cooled route.",
    rows: [
      row(
        "Comparison",
        "Same starting water and heating time; an uncooled receiver collects less liquid.",
      ),
      row(
        "Constraint",
        "A cold-water/ice bath is available. Fix the proposed collection route.",
      ),
    ],
    apparatus: true,
    expected: {
      heating: "evaporate",
      cooling: "cold",
      receiver: "water",
      saltFate: "left",
    },
    feedback:
      "Cooling condenses more water vapour before it escapes; it does not create extra water or remove salt from the receiver. Equal heating/time makes this a meaningful comparison.",
  },
  identity: {
    mode: "distil",
    title: "Keep water's identity",
    note: "Separate phase change from chemical decomposition.",
    summary:
      "Water with nonvolatile salt; clean cold collection. Explain the phase change.",
    rows: [
      row("Feed", "Pure H₂O plus a nonvolatile dissolved salt."),
      row(
        "Collection",
        "Clean cold receiver with an outlet above the collected liquid.",
      ),
    ],
    apparatus: true,
    expected: {
      heating: "evaporate",
      cooling: "cold",
      receiver: "water",
      saltFate: "left",
    },
    feedback:
      "Liquid→vapour→liquid is physical separation. No H₂ or O₂ products are formed; salt remains at the heated end.",
  },
  mem100: {
    mode: "membrane",
    title: "Account for both membrane streams",
    note: "Ideal exercise: no volume loss; all stated salt is rejected. This is not an efficiency claim for real plants.",
    rows: [],
    membrane: { feed: 100, product: 40, salt: 3000 },
    expected: {
      driving: "pressure",
      product: "40",
      brine: "60",
      brineSalt: "3000",
    },
    feedback:
      "Pressure drives water through the selective membrane. 100−40=60 litres of brine retains 3000 g salt; salt is concentrated, not destroyed.",
  },
  mem80: {
    mode: "membrane",
    title: "A different recovery fraction",
    note: "Ideal exercise: no loss, complete stated salt rejection.",
    rows: [],
    membrane: { feed: 80, product: 24, salt: 2400 },
    expected: {
      driving: "pressure",
      product: "24",
      brine: "56",
      brineSalt: "2400",
    },
    feedback:
      "80−24=56 litres remain; all 2400 g salt stays in the brine in this explicitly ideal model.",
  },
  mem120: {
    mode: "membrane",
    title: "Conserve feed water",
    note: "Ideal exercise: no loss, complete stated salt rejection.",
    rows: [],
    membrane: { feed: 120, product: 54, salt: 3600 },
    expected: {
      driving: "pressure",
      product: "54",
      brine: "66",
      brineSalt: "3600",
    },
    feedback:
      "54+66=120 litres. Retained 3600 g salt becomes more concentrated in 66 litres; high-pressure pumping requires energy.",
  },
  coast: {
    mode: "resources",
    title: "Compare equal volumes",
    note: "Invented energy totals for the same treated volume and boundary; no real-plant cost or emissions claim.",
    rows: [
      row(
        "Routes",
        "A: reverse osmosis. B: distillation. Both products meet the supplied quality requirement.",
      ),
      row("Local context", "Little rainfall; a seawater source is available."),
    ],
    energy: { a: 8, b: 30, volume: 2 },
    expected: { aPer: "4", bPer: "15", difference: "11", decision: "aLower" },
    feedback:
      "8÷2=4 and 30÷2=15 kWh/m³; B−A=11. A uses less energy in this dataset, not in every possible plant. Both desalination routes require energy.",
  },
  lake: {
    mode: "resources",
    title: "Compare freshwater and seawater",
    note: "Original matched-service totals; the locality has a suitable freshwater source.",
    rows: [
      row(
        "Routes",
        "A: freshwater filtration/disinfection. B: seawater desalination. Both meet the supplied quality standard.",
      ),
    ],
    energy: { a: 1.5, b: 18, volume: 3 },
    expected: { aPer: "0.5", bPer: "6", difference: "5.5", decision: "aLower" },
    feedback:
      "Per-m³ energies are 0.5 and 6; B uses 5.5 kWh/m³ more here. Choose the suitable freshwater supply with the stated lower energy, considering local availability.",
  },
  heatReuse: {
    mode: "resources",
    title: "Avoid an absolute energy claim",
    note: "Original matched-service exercise including supplied reused heat; both products meet quality requirements.",
    rows: [
      row(
        "Routes",
        "A: membrane plant. B: thermal plant within the stated energy accounting boundary.",
      ),
    ],
    energy: { a: 20, b: 12, volume: 4 },
    expected: { aPer: "5", bPer: "3", difference: "-2", decision: "bLower" },
    feedback:
      "20÷4=5,12÷4=3; B−A=−2 kWh/m³. Supplied boundaries and heat availability matter; no universal ranking follows.",
  },
  equal: {
    mode: "resources",
    title: "Equal supplied energy",
    note: "Original matched-service totals; environmental impacts beyond this boundary are not supplied.",
    rows: [
      row("Routes", "Both routes produce the same stated quality and volume."),
    ],
    energy: { a: 12, b: 12, volume: 6 },
    expected: { aPer: "2", bPer: "2", difference: "0", decision: "same" },
    feedback:
      "Both use 2 kWh/m³ here. Equal energy alone does not prove equal total environmental effects.",
  },
  repeat50: {
    mode: "repeat",
    title: "Mean of repeat residues",
    note: "Separate equal-volume samples; cooled residue masses after subtracting empty dishes.",
    rows: [],
    repeat: { masses: [1.68, 1.72, 1.7, 1.74], volume: 50 },
    expected: { mean: "1.71", scaled: "34.2", dry: "constant" },
    feedback:
      "Mean=(1.68+1.72+1.70+1.74)÷4=1.71 g. 50 cm³=0.050 dm³, so 34.2 g/dm³. Reheat, cool, reweigh to constant mass.",
  },
  repeat25: {
    mode: "repeat",
    title: "Use all stated repeat values",
    note: "Separate equal-volume samples; dry cooled residue only.",
    rows: [],
    repeat: { masses: [0.11, 0.12, 0.13], volume: 25 },
    expected: { mean: "0.12", scaled: "4.8", dry: "constant" },
    feedback:
      "Mean 0.12 g in 0.025 dm³ gives 4.8 g/dm³. Similar repeat values show consistency; dry evidence still needs reheat, cool, reweigh.",
  },
  repeat10: {
    mode: "repeat",
    title: "A small-volume repeat set",
    note: "Separate equal-volume samples; stable nonvolatile dry residue.",
    rows: [],
    repeat: { masses: [0.02, 0.03, 0.04, 0.03], volume: 10 },
    expected: { mean: "0.03", scaled: "3", dry: "constant" },
    feedback:
      "Mean 0.03 g in 0.010 dm³ gives 3 g/dm³. Use the known sample volume, not the whole beaker volume.",
  },
};
export function waterRecord(mode: WaterMode, record: string) {
  const r = waterRecords[record];
  return r?.mode === mode ? r : undefined;
}
export function initialWater(mode: WaterMode, record: string): WaterBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(waterFields[mode].map((f) => [f, ""])),
  };
}
export function waterNumber(raw: string) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function validWater(
  mode: WaterMode,
  v: unknown,
  record?: string,
): v is WaterBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    return false;
  const b = v as WaterBoard,
    fs = waterFields[mode];
  return (
    !!fs &&
    b.version === "1" &&
    b.mode === mode &&
    !!waterRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fs.length + 3 &&
    fs.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (waterNumeric.includes(f)
            ? b[f].length <= 16
            : waterChoices[f]?.includes(b[f]))),
    )
  );
}
export function validWaterHistory(
  mode: WaterMode,
  record: string,
  h: unknown,
): h is WaterBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validWater(mode, b, record))
  )
    return false;
  const first = initialWater(mode, record);
  return (
    Object.keys(first).every((k) => h[0][k] === first[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        waterFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkWater(mode: WaterMode, b: WaterBoard) {
  if (!validWater(mode, b))
    return {
      correct: false,
      message:
        "This water proposal is unreadable; original entries are retained.",
    };
  const r = waterRecord(mode, b.record)!,
    fs = waterFields[mode];
  if (fs.some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const wrong = fs.filter((f) =>
    waterNumeric.includes(f)
      ? waterNumber(b[f]) === null ||
        Math.abs(waterNumber(b[f])! - Number(r.expected[f])) > 1e-6
      : b[f] !== r.expected[f],
  );
  return {
    correct: !wrong.length,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => waterLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
