export type LcaMode =
  "stages" | "boundary" | "inventory" | "reuse" | "tradeoff" | "recycle";
export type LcaBoard = Record<string, string>;
export type LcaGiven = {
  title: string;
  note: string;
  summary?: string;
  rows?: readonly { label: string; text: string }[];
  events?: readonly string[];
  energy?: readonly { stage: string; a: number; b: number }[];
  service?: { fixed: number; wash: number; single: number; uses: number };
  impacts?: readonly { name: string; unit: string; a: number; b: number }[];
  recycling?: {
    collected: number;
    sorted: number;
    yield: number;
    demand: number;
  };
};
export type LcaRecord = LcaGiven & {
  mode: LcaMode;
  expected: LcaBoard;
  feedback: string;
};
export const lcaFields: Record<LcaMode, readonly string[]> = {
  stages: ["event1", "event2", "event3", "event4"],
  boundary: ["raw", "make", "use", "end", "transport"],
  inventory: ["aTotal", "bTotal", "difference"],
  reuse: ["rTotal", "rPer", "sTotal", "choice"],
  tradeoff: ["energyChoice", "waterChoice", "wasteChoice", "judgement"],
  recycle: ["recovered", "rejected", "virgin"],
};
export const lcaNumeric = [
  "aTotal",
  "bTotal",
  "difference",
  "rTotal",
  "rPer",
  "sTotal",
  "recovered",
  "rejected",
  "virgin",
];
export const lcaLabels: Record<string, string> = {
  event1: "Event 1 stage",
  event2: "Event 2 stage",
  event3: "Event 3 stage",
  event4: "Event 4 stage",
  raw: "Raw materials",
  make: "Manufacture and packaging",
  use: "Use and operation",
  end: "End of useful life",
  transport: "Transport accounting",
  include: "Include",
  exclude: "Omit",
  within: "Already in each stage",
  double: "Add the same transport again",
  none: "Ignore all transport",
  aTotal: "Product A total energy / kJ",
  bTotal: "Product B total energy / kJ",
  difference: "A minus B energy / kJ",
  rTotal: "Reusable total energy / kJ",
  rPer: "Reusable energy per service / kJ",
  sTotal: "Single-use total energy / kJ",
  choice: "Lower energy for this service",
  a: "Product A",
  b: "Product B",
  reusable: "Reusable",
  single: "Single-use",
  equal: "Equal",
  energyChoice: "Lower energy",
  waterChoice: "Lower water use",
  wasteChoice: "Lower residual waste",
  judgement: "Overall environmental conclusion",
  conditional: "Depends on impacts and priorities",
  universalA: "A wins every environmental measure",
  universalB: "B wins every environmental measure",
  recovered: "Recovered usable material / kg",
  rejected: "Collected material not recovered / kg",
  virgin: "New material needed / kg",
};
export const lcaChoices: Record<string, readonly string[]> = {
  ...Object.fromEntries(
    ["event1", "event2", "event3", "event4"].map((f) => [
      f,
      ["raw", "make", "use", "end"],
    ]),
  ),
  ...Object.fromEntries(
    ["raw", "make", "use", "end"].map((f) => [f, ["include", "exclude"]]),
  ),
  transport: ["within", "double", "none"],
  choice: ["reusable", "single", "equal"],
  energyChoice: ["a", "b", "equal"],
  waterChoice: ["a", "b", "equal"],
  wasteChoice: ["a", "b", "equal"],
  judgement: ["conditional", "universalA", "universalB"],
};
export const stageEnergy = [
  { stage: "Raw materials", a: 240, b: 150 },
  { stage: "Make and pack", a: 100, b: 90 },
  { stage: "Use", a: 20, b: 80 },
  { stage: "End of life", a: 40, b: 30 },
];
export const paperPlastic = [
  { name: "Energy", unit: "MJ", a: 180, b: 300 },
  { name: "Water", unit: "L", a: 25, b: 70 },
  { name: "Residual waste", unit: "kg", a: 10, b: 4 },
];
const stageNote =
  "Classify the supplied events. Transport and distribution occur throughout the life cycle.";
const matched =
  "Original exercise: equal stated service and quality. Each stage includes its own transport/distribution; do not add it twice. Energy only, not a complete environmental verdict.";
const reuseNote =
  "Original equal-capacity packaging exercise. Fixed production/end-of-life energy is counted once. The stated wash/return energy applies to every completed service, including the first; single-use energy includes its entire supplied lifecycle. No breakage is assumed.";
export const lcaRecords: Record<string, LcaRecord> = {
  shopping: {
    mode: "stages",
    title: "Place the bag events",
    note: stageNote,
    summary: "Classify four bag events.",
    events: [
      "Extract crude oil",
      "Form the bag and its packaging",
      "Carry shopping during each use",
      "Sort the discarded bag for recycling",
    ],
    expected: { event1: "raw", event2: "make", event3: "use", event4: "end" },
    feedback:
      "Extraction supplies raw materials; forming/packaging is manufacture; carrying is use; end-of-life sorting is disposal/recycling. Transport must be considered at every relevant stage.",
  },
  bottle: {
    mode: "stages",
    title: "Follow the bottle",
    note: stageNote,
    events: [
      "Wash a returned bottle before its next use",
      "Collect a discarded bottle for remelting",
      "Quarry minerals for new glass",
      "Shape and package a new bottle",
    ],
    expected: { event1: "use", event2: "end", event3: "raw", event4: "make" },
    feedback:
      "Washing belongs to use/operation; collection for recycling is end of useful life; quarrying is raw-material supply; making/packaging a new bottle is manufacture. Reuse and remelting are different.",
  },
  building: {
    mode: "stages",
    title: "Follow a building product",
    note: stageNote,
    events: [
      "Make and package a ceramic building tile",
      "Recover material from demolished tiles",
      "Mine clay for the product",
      "Maintain the tile while in service",
    ],
    expected: { event1: "make", event2: "end", event3: "raw", event4: "use" },
    feedback:
      "Mine clay: raw materials. Make/package: manufacture. Maintenance: use. Recover after demolition: end of useful life. A short assessment omitting one of these cannot claim every stage.",
  },
  full: {
    mode: "boundary",
    title: "Construct a complete boundary",
    note: matched,
    energy: stageEnergy,
    expected: {
      raw: "include",
      make: "include",
      use: "include",
      end: "include",
      transport: "within",
    },
    feedback:
      "Include all four supplied stages for both equal services. Transport is already included in each row. Full totals are A 400 and B 350 kJ; excluding inconvenient stages can change the apparent result.",
  },
  reversed: {
    mode: "boundary",
    title: "Spot the selective advert",
    note: matched + " An advert compares only raw materials and manufacture.",
    energy: [
      { stage: "Raw materials", a: 80, b: 130 },
      { stage: "Make and pack", a: 40, b: 70 },
      { stage: "Use", a: 150, b: 20 },
      { stage: "End of life", a: 30, b: 20 },
    ],
    expected: {
      raw: "include",
      make: "include",
      use: "include",
      end: "include",
      transport: "within",
    },
    feedback:
      "A 120 versus B 200 kJ for production alone makes A look better. All supplied stages give A 300 versus B 240 kJ, reversing that energy result. A partial claim must disclose its boundary; full environmental effects still require more data.",
  },
  totals: {
    mode: "inventory",
    title: "Build comparable energy totals",
    note: matched,
    energy: stageEnergy,
    expected: { aTotal: "400", bTotal: "350", difference: "50" },
    feedback:
      "A 240+100+20+40=400 kJ; B 150+90+80+30=350 kJ. A−B=50 kJ. These totals compare equal service and matched stages; they do not add water or judge every pollutant.",
  },
  signed: {
    mode: "inventory",
    title: "Keep the signed difference",
    note: matched,
    energy: [
      { stage: "Raw materials", a: 90, b: 140 },
      { stage: "Make and pack", a: 60, b: 80 },
      { stage: "Use", a: 40, b: 20 },
      { stage: "End of life", a: 10, b: 20 },
    ],
    expected: { aTotal: "200", bTotal: "260", difference: "-60" },
    feedback:
      "A 200 and B 260 kJ: A−B=−60 kJ, so A uses 60 kJ less for this comparison. Preserve the sign and matched service; lower energy does not prove lower water use.",
  },
  short: {
    mode: "reuse",
    title: "Ten completed services",
    note: reuseNote,
    service: { fixed: 960, wash: 12, single: 60, uses: 10 },
    expected: { rTotal: "1080", rPer: "108", sTotal: "600", choice: "single" },
    feedback:
      "Reusable:960+10×12=1080 kJ,108 kJ/service. Single-use:10×60=600 kJ. At 10 services single-use uses less supplied energy; reusable is not automatically better.",
  },
  tie: {
    mode: "reuse",
    title: "Twenty completed services",
    note: reuseNote,
    service: { fixed: 960, wash: 12, single: 60, uses: 20 },
    expected: { rTotal: "1200", rPer: "60", sTotal: "1200", choice: "equal" },
    feedback:
      "960+20×12=1200 kJ and 1200/20=60 kJ/service. Twenty single uses also need 1200 kJ. This is equality, not strictly lower reusable energy; other impacts may still differ.",
  },
  long: {
    mode: "reuse",
    title: "Thirty completed services",
    note: reuseNote,
    service: { fixed: 960, wash: 12, single: 60, uses: 30 },
    expected: {
      rTotal: "1320",
      rPer: "44",
      sTotal: "1800",
      choice: "reusable",
    },
    feedback:
      "960+30×12=1320 kJ,44 kJ/service, versus 1800 kJ for 30 single uses. Reuse lowers energy at this count under the stated assumptions; washing and return still consume resources.",
  },
  bags: {
    mode: "tradeoff",
    title: "Compare plastic and paper bags",
    note: "Original data for 1000 equivalent shopping services: A plastic bags, B paper bags, equal capacity/strength and matched stages. Residual waste means the stated unrecovered mass; no pollutant-effect score is supplied.",
    impacts: paperPlastic,
    expected: {
      energyChoice: "a",
      waterChoice: "a",
      wasteChoice: "b",
      judgement: "conditional",
    },
    feedback:
      "A has lower given energy and water use; B has lower residual waste. MJ, L and kg cannot simply be added. Pollutant effects and relative importance require evidence and value judgements; one overall universal winner is unsupported.",
  },
  waterPriority: {
    mode: "tradeoff",
    title: "A different source changes the trade-off",
    note: "Original matched 1000-service comparison. Energy and water are measured quantities; toxicity and local scarcity impacts are not supplied.",
    impacts: [
      { name: "Energy", unit: "MJ", a: 120, b: 180 },
      { name: "Water", unit: "L", a: 90, b: 30 },
      { name: "Residual waste", unit: "kg", a: 5, b: 5 },
    ],
    expected: {
      energyChoice: "a",
      waterChoice: "b",
      wasteChoice: "equal",
      judgement: "conditional",
    },
    feedback:
      "A uses less energy; B uses less water; waste masses tie. A water-scarcity priority may favour B, while an energy priority favours A. Allocating impact importance is not purely objective; different declared choices do not mean every assessment is dishonest.",
  },
  glass: {
    mode: "recycle",
    title: "Account for sorted glass",
    note: "Original material balance. From 100 kg collected glass products,80 kg enters the specified suitable sorted-glass stream. Usable glass recovery is 90% of that sorted mass. The new product needs 100 kg of suitable material; all streams are accounted for. Processing uses energy.",
    recycling: { collected: 100, sorted: 80, yield: 90, demand: 100 },
    expected: { recovered: "72", rejected: "28", virgin: "28" },
    feedback:
      "80×90/100=72 kg recovered.100−72=28 kg collected material is outside the usable product;100−72=28 kg new suitable input is still needed. Other streams contain material, not vanished atoms; sorting and melting are not zero-energy.",
  },
  polymer: {
    mode: "recycle",
    title: "Quality limits polymer recycling",
    note: "Original mass balance: collected 120 kg, suitable sorted 80 kg, recovery 75%; new product needs 90 kg suitable material. Incompatible polymers/contamination go to other accounted streams; actual separation depends on final-product properties.",
    recycling: { collected: 120, sorted: 80, yield: 75, demand: 90 },
    expected: { recovered: "60", rejected: "60", virgin: "30" },
    feedback:
      "80×.75=60 kg recovered;120−60=60 kg of collected material is in other streams.90−60=30 kg new input is needed. Collection mass is not automatically usable product mass; separation needs depend on the required properties.",
  },
  steel: {
    mode: "recycle",
    title: "Use suitable scrap in a new product",
    note: "Original balance: collected 200 kg, suitable sorted 180 kg, usable recovery 80%; the specified product needs 200 kg suitable material. This balance is not a claim that all steel must be purified by the same process.",
    recycling: { collected: 200, sorted: 180, yield: 80, demand: 200 },
    expected: { recovered: "144", rejected: "56", virgin: "56" },
    feedback:
      "180×.8=144 kg usable material;200−144=56 kg collected material remains outside this product and 56 kg new material meets demand. Suitable scrap steel can supplement primary iron production; required separation depends on the final product.",
  },
};
export function lcaRecord(mode: LcaMode, record: string) {
  if (!Object.hasOwn(lcaRecords, record)) return;
  const r = lcaRecords[record];
  return r.mode === mode ? r : undefined;
}
export function initialLca(mode: LcaMode, record: string): LcaBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(lcaFields[mode].map((f) => [f, ""])),
  };
}
export function lcaNumber(s: string) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
export function validLca(
  mode: LcaMode,
  v: unknown,
  record?: string,
): v is LcaBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    return false;
  const b = v as LcaBoard,
    fs = lcaFields[mode];
  return (
    !!fs &&
    b.version === "1" &&
    b.mode === mode &&
    !!lcaRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fs.length + 3 &&
    fs.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (lcaNumeric.includes(f)
            ? b[f].length <= 16
            : lcaChoices[f]?.includes(b[f]))),
    )
  );
}
export function validLcaHistory(
  mode: LcaMode,
  record: string,
  h: unknown,
): h is LcaBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validLca(mode, b, record))
  )
    return false;
  const first = initialLca(mode, record);
  return (
    Object.keys(first).every((k) => h[0][k] === first[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        lcaFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkLca(mode: LcaMode, b: LcaBoard) {
  if (!validLca(mode, b))
    return {
      correct: false,
      message: "Saved lifecycle proposal is unreadable; entries retained.",
    };
  const r = lcaRecord(mode, b.record)!,
    fs = lcaFields[mode];
  if (fs.some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const wrong = fs.filter((f) =>
    lcaNumeric.includes(f)
      ? lcaNumber(b[f]) === null ||
        Math.abs(lcaNumber(b[f])! - Number(r.expected[f])) > 1e-6
      : b[f] !== r.expected[f],
  );
  return {
    correct: !wrong.length,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => lcaLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
export function boundarySubtotal(r: LcaGiven, b: LcaBoard) {
  if (!r.energy) return null;
  const fields = ["raw", "make", "use", "end"];
  if (fields.some((f) => !b[f])) return null;
  return r.energy.reduce(
    (sum, row, i) => ({
      a: sum.a + (b[fields[i]] === "include" ? row.a : 0),
      b: sum.b + (b[fields[i]] === "include" ? row.b : 0),
    }),
    { a: 0, b: 0 },
  );
}
