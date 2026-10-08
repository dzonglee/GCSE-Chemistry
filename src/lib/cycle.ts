export type CycleMode =
  "route" | "ledger" | "atom" | "stores" | "change" | "pattern";
export type CycleBoard = Record<string, string>;
export type CycleLedger = {
  store: string;
  start: number;
  inflows: readonly { label: string; amount: number }[];
  outflows: readonly { label: string; amount: number }[];
  unit: string;
  interval: string;
};
export type CycleSeries = {
  unit: string;
  points: readonly { label: string; value: number }[];
  min: number;
  max: number;
};
export type CycleGiven = {
  title: string;
  note: string;
  rows?: readonly { label: string; text: string }[];
  ledger?: CycleLedger;
  comparison?: { before: CycleLedger; after: CycleLedger };
  series?: CycleSeries;
  route?: { from: string; to: string; label: string };
  atom?: { stages: readonly string[]; forms: readonly string[] };
};
export type CycleRecord = CycleGiven & {
  mode: CycleMode;
  expected: CycleBoard;
  feedback: string;
};
export const cycleFields: Record<CycleMode, readonly string[]> = {
  route: ["from", "process", "to"],
  ledger: ["incoming", "outgoing", "net", "final"],
  atom: ["middleForm", "finalForm", "conserved"],
  stores: ["source", "timescale", "release"],
  change: ["beforeNet", "afterNet", "interpretation"],
  pattern: ["start", "end", "change", "sameSeasonChange", "trend", "season"],
};
export const cycleNumeric = [
  "incoming",
  "outgoing",
  "net",
  "final",
  "beforeNet",
  "afterNet",
  "start",
  "end",
  "change",
  "sameSeasonChange",
];
export const cycleLabels: Record<string, string> = {
  from: "Starting carbon store",
  process: "Transfer process",
  to: "Destination carbon store",
  air: "Atmospheric CO₂",
  plants: "Plant/algal biomass",
  animals: "Animal biomass",
  dead: "Dead material and waste",
  microbes: "Decomposer biomass",
  fossil: "Fossil fuels",
  ocean: "Dissolved ocean carbon",
  rock: "Carbonate sediments/rock",
  photo: "Photosynthesis",
  feed: "Feeding",
  resp: "Aerobic respiration",
  decay: "Decomposition and aerobic respiration",
  burial: "Burial and geological change",
  burn: "Complete combustion",
  dissolve: "Dissolution",
  carbonate: "Carbonate formation",
  incoming: "Total carbon entering",
  outgoing: "Total carbon leaving",
  net: "Signed change in stored carbon",
  final: "Final stored carbon",
  middleForm: "Carbon-containing form at the middle stage",
  finalForm: "Carbon-containing form at the final stage",
  conserved: "What happens to the traced carbon atom?",
  dissolvedCarbon: "Dissolved carbon forms",
  organicCarbon: "Ancient organic material",
  glucose: "Glucose (C₆H₁₂O₆)",
  carbonDioxide: "Carbon dioxide (CO₂)",
  methane: "Methane (CH₄)",
  calciumCarbonate: "Calcium carbonate (CaCO₃)",
  oxygen: "Oxygen (O₂)",
  water: "Water (H₂O)",
  sameCarbon: "It remains carbon in different compounds",
  newElement: "It becomes oxygen",
  created: "A new carbon atom appears",
  source: "Original material supplying stored carbon",
  timescale: "Formation timescale",
  release: "A supplied route returning carbon as CO₂",
  ancientPlants: "Ancient plant material",
  marineLife: "Ancient marine microorganisms",
  shellCarbonate: "Carbonate shells/sediments",
  oxygenGas: "Oxygen gas alone",
  geological: "Very long geological time",
  instant: "Instant formation in every leaf",
  permanent: "Permanently beyond every possible reaction",
  fuelBurn: "Complete fuel combustion",
  acidReaction: "Supplied carbonate–acid reaction",
  photosynthesisRelease: "Photosynthesis releases stored carbon",
  beforeNet: "Signed atmospheric change before",
  afterNet: "Signed atmospheric change after",
  interpretation: "Interpretation of the supplied change",
  bothForest: "Less uptake plus carbon release increases the gain",
  fossilAdded: "Extra fossil carbon increases the gain",
  regrowthSlow: "Greater uptake reduces gain; storage takes time",
  allInstant: "Every emission is instantly and permanently offset",
  newAtoms: "Combustion creates new carbon atoms",
  start: "First plotted concentration",
  end: "Last plotted concentration",
  sameSeasonChange: "Signed Y1-to-Y3 summer change",
  change: "Signed endpoint change",
  trend: "Overall endpoint trend",
  season: "Repeated seasonal pattern",
  up: "Increase overall",
  down: "Decrease overall",
  flat: "No endpoint change",
  winterHigher: "Higher winter values in this supplied series",
  summerHigher: "Higher summer values in this supplied series",
  none: "No repeated seasonal difference",
};
const stores = [
  "air",
  "plants",
  "animals",
  "dead",
  "microbes",
  "fossil",
  "ocean",
  "rock",
] as const;
export const cycleChoices: Record<string, readonly string[]> = {
  from: stores,
  to: stores,
  process: [
    "photo",
    "feed",
    "resp",
    "decay",
    "burial",
    "burn",
    "dissolve",
    "carbonate",
  ],
  middleForm: [
    "glucose",
    "carbonDioxide",
    "methane",
    "calciumCarbonate",
    "oxygen",
    "water",
  ],
  finalForm: [
    "glucose",
    "carbonDioxide",
    "methane",
    "calciumCarbonate",
    "oxygen",
    "water",
  ],
  conserved: ["sameCarbon", "newElement", "created"],
  source: ["ancientPlants", "marineLife", "shellCarbonate", "oxygenGas"],
  timescale: ["geological", "instant", "permanent"],
  release: ["fuelBurn", "acidReaction", "photosynthesisRelease"],
  interpretation: [
    "bothForest",
    "fossilAdded",
    "regrowthSlow",
    "allInstant",
    "newAtoms",
  ],
  trend: ["up", "down", "flat"],
  season: ["winterHigher", "summerHigher", "none"],
};
const route = (
  title: string,
  note: string,
  from: string,
  process: string,
  to: string,
  feedback: string,
): CycleRecord => ({
  mode: "route",
  title,
  note,
  expected: { from, process, to },
  feedback,
});
export function ledgerTotals(d: CycleLedger) {
  const incoming = d.inflows.reduce((n, r) => n + r.amount, 0),
    outgoing = d.outflows.reduce((n, r) => n + r.amount, 0);
  return {
    incoming,
    outgoing,
    net: incoming - outgoing,
    final: d.start + incoming - outgoing,
  };
}
const ledger = (
  title: string,
  note: string,
  d: CycleLedger,
  feedback: string,
): CycleRecord => ({
  mode: "ledger",
  title,
  note,
  ledger: d,
  expected: Object.fromEntries(
    Object.entries(ledgerTotals(d)).map(([k, v]) => [k, String(v)]),
  ),
  feedback,
});
const data = (
  store: string,
  start: number,
  ins: readonly (readonly [string, number])[],
  outs: readonly (readonly [string, number])[],
  interval: string,
): CycleLedger => ({
  store,
  start,
  inflows: ins.map(([label, amount]) => ({ label, amount })),
  outflows: outs.map(([label, amount]) => ({ label, amount })),
  unit: "g of carbon",
  interval,
});
const change = (
  title: string,
  note: string,
  before: CycleLedger,
  after: CycleLedger,
  interpretation: string,
  feedback: string,
): CycleRecord => ({
  mode: "change",
  title,
  note,
  comparison: { before, after },
  expected: {
    beforeNet: String(ledgerTotals(before).net),
    afterNet: String(ledgerTotals(after).net),
    interpretation,
  },
  feedback,
});
export const cycleRecords: Record<string, CycleRecord> = {
  photosynthesis: route(
    "Follow carbon into a leaf",
    "A leaf makes glucose from CO₂ and water using light.",
    "air",
    "photo",
    "plants",
    "Photosynthesis: carbon dioxide + water → glucose + oxygen (using light). It transfers carbon from CO₂ into plant/algal organic molecules. Oxygen released contains no carbon. Plants also respire; carbon uptake is not simply roots taking in mineral ions.",
  ),
  feeding: route(
    "Follow food carbon",
    "A herbivore eats some plant material and incorporates carbon into its body.",
    "plants",
    "feed",
    "animals",
    "Feeding transfers carbon-containing food from plant biomass into animal biomass. Some food carbon is later respired or lost as waste; it is not all retained forever.",
  ),
  plantResp: route(
    "A plant returns carbon",
    "A living plant uses oxygen to respire organic compounds in its cells.",
    "plants",
    "resp",
    "air",
    "For glucose, aerobic respiration is glucose + oxygen → carbon dioxide + water. Plants carry out aerobic respiration, releasing CO₂ from organic compounds. This continues in daylight and darkness; photosynthesis needs light, so net exchange depends on both rates.",
  ),
  animalResp: route(
    "An animal returns carbon",
    "An animal carries out aerobic respiration using food molecules and oxygen.",
    "animals",
    "resp",
    "air",
    "Aerobic respiration converts some food carbon to CO₂, returning it to the surroundings. Carbon atoms are conserved; not all forms of anaerobic respiration have identical products.",
  ),
  decay: route(
    "Microorganisms recycle carbon",
    "Dead plant material is digested by microorganisms in an oxygenated compost heap; their aerobic respiration returns carbon.",
    "dead",
    "decay",
    "air",
    "Microorganisms digest carbon compounds and use some in aerobic respiration, producing CO₂. Some carbon can enter microbial biomass. Mineral ions are released separately to soil; plants use CO₂ carbon in photosynthesis.",
  ),
  burial: route(
    "Preserve some ancient carbon",
    "Some ancient organic material is buried under oxygen-poor conditions and undergoes geological changes over very long times.",
    "dead",
    "burial",
    "fossil",
    "Burial with limited decay can preserve carbon in ancient organic matter. Geological processes over very long times can form fossil fuels. Most dead material does not instantly or inevitably become fuel.",
  ),
  burning: route(
    "Release a geological store",
    "A carbon-containing fossil fuel is completely burned in sufficient oxygen.",
    "fossil",
    "burn",
    "air",
    "Complete fossil-fuel combustion releases stored carbon as CO₂. It moves existing carbon atoms; it does not create carbon. Release can be much faster than geological replenishment.",
  ),
  dissolution: route(
    "Carbon enters ocean water",
    "CO₂ crosses from the atmosphere and dissolves in ocean water.",
    "air",
    "dissolve",
    "ocean",
    "Dissolution moves carbon into dissolved ocean forms. Ocean–air exchange can also run outward; net uptake does not make every carbon atom permanently trapped.",
  ),
  precipitation: route(
    "Carbon enters sediment",
    "Dissolved carbon is incorporated into carbonates; carbonate material forms marine sediment.",
    "ocean",
    "carbonate",
    "rock",
    "Carbonates can precipitate and marine organisms can make carbonate shells. Accumulated sediments can form limestone over geological time. This is a store of carbon, not carbon being destroyed.",
  ),
  atmosphere: ledger(
    "Inventory atmospheric carbon",
    "Original small-system exercise: all listed transfers use mass of carbon over one interval, not mass of whole CO₂.",
    data(
      "Atmosphere",
      100,
      [
        ["Respiration and decay", 18],
        ["Complete combustion", 12],
      ],
      [["Photosynthesis", 23]],
      "one supplied interval",
    ),
    "Incoming 30 − outgoing 23 = +7 g carbon; final 107 g. Atmospheric carbon increases because inflow exceeds outflow, while the carbon was transferred from other stores.",
  ),
  day: ledger(
    "A plant in daylight",
    "Original plant inventory: photosynthesis and respiration both occur. Feeding and dead material are additional listed losses.",
    data(
      "Plant biomass",
      50,
      [["Photosynthesis", 11]],
      [
        ["Aerobic respiration", 6],
        ["Feeding", 2],
        ["Death/waste", 1],
      ],
      "one daylight interval",
    ),
    "Incoming 11 − outgoing 9 = +2 g carbon; final 52 g. A positive net gain is compatible with simultaneous plant respiration and other carbon transfers.",
  ),
  night: ledger(
    "A plant in darkness",
    "Original plant inventory: no photosynthesis in the stated dark interval; aerobic respiration continues.",
    data(
      "Plant biomass",
      50,
      [],
      [["Aerobic respiration", 6]],
      "one dark interval",
    ),
    "Incoming 0 − outgoing 6 = −6 g carbon; final 44 g. Plants still respire in darkness. Zero photosynthesis is not zero carbon transfer.",
  ),
  oceanSink: ledger(
    "Two-way ocean exchange",
    "Original local ocean inventory: both inward and outward carbon exchange occur over the same interval.",
    data(
      "Dissolved ocean carbon",
      40,
      [["Atmosphere to ocean", 12]],
      [["Ocean to atmosphere", 9]],
      "one supplied interval",
    ),
    "Incoming 12 − outgoing 9 = +3 g carbon; final 43 g. This supplied ocean region is a net sink over the interval despite 9 g leaving; net does not mean one-way or permanent.",
  ),
  oceanSource: ledger(
    "Exchange can reverse net sign",
    "Original local ocean inventory; no claim about current worldwide ocean totals.",
    data(
      "Dissolved ocean carbon",
      40,
      [["Atmosphere to ocean", 6]],
      [["Ocean to atmosphere", 9]],
      "one supplied interval",
    ),
    "Incoming 6 − outgoing 9 = −3 g carbon; final 37 g. This supplied region is a net source over this interval. A store can exchange carbon in both directions; compare the rates.",
  ),
  balanced: ledger(
    "Constant store, active flows",
    "Original atmospheric inventory with equal total inward and outward transfers.",
    data(
      "Atmosphere",
      120,
      [
        ["Respiration and decay", 20],
        ["Complete combustion", 10],
      ],
      [
        ["Photosynthesis", 25],
        ["Ocean uptake", 5],
      ],
      "one supplied interval",
    ),
    "Incoming 30 equals outgoing 30; net 0 g and final 120 g. A constant store does not imply stopped photosynthesis or zero carbon movement.",
  ),
  biologicalAtom: {
    mode: "atom",
    title: "Trace one carbon atom",
    note: "Track one carbon atom from atmospheric CO₂ into newly made plant glucose, then back to the air by aerobic respiration.",
    atom: {
      stages: ["Atmosphere", "Plant glucose", "Returned gas"],
      forms: ["carbonDioxide", "glucose", "carbonDioxide"],
    },
    expected: {
      middleForm: "glucose",
      finalForm: "carbonDioxide",
      conserved: "sameCarbon",
    },
    feedback:
      "A traced carbon atom can enter glucose during photosynthesis and later return in CO₂ during aerobic respiration. It stays carbon while chemical partners change. O₂ and water contain no carbon.",
  },
  carbonateAtom: {
    mode: "atom",
    title: "Trace carbonate carbon",
    note: "Track carbon from dissolved ocean forms into calcium carbonate sediment, then into a gas during a supplied dilute-acid reaction.",
    atom: {
      stages: [
        "Dissolved carbon",
        "Carbonate sediment",
        "Gas from acid reaction",
      ],
      forms: ["dissolvedCarbon", "calciumCarbonate", "carbonDioxide"],
    },
    expected: {
      middleForm: "calciumCarbonate",
      finalForm: "carbonDioxide",
      conserved: "sameCarbon",
    },
    feedback:
      "CaCO₃ contains one carbon per formula unit. The specified carbonate–acid reaction can release it as CO₂. This is not a claim that every natural weathering process releases CO₂ in the same way.",
  },
  fuelAtom: {
    mode: "atom",
    title: "Trace fuel carbon",
    note: "Track one carbon atom from ancient organic matter into a supplied methane molecule, then into complete-combustion exhaust.",
    atom: {
      stages: [
        "Ancient organic carbon",
        "Methane fuel",
        "Complete-combustion gas",
      ],
      forms: ["organicCarbon", "methane", "carbonDioxide"],
    },
    expected: {
      middleForm: "methane",
      finalForm: "carbonDioxide",
      conserved: "sameCarbon",
    },
    feedback:
      "CH₄ supplies carbon; complete combustion returns that carbon in CO₂. Geological formation changes compounds and storage, not element identities. Hydrogen and oxygen do not become new carbon.",
  },
  coal: {
    mode: "stores",
    title: "Explain a coal store",
    note: "Coal contains carbon from ancient material preserved and changed during burial.",
    expected: {
      source: "ancientPlants",
      timescale: "geological",
      release: "fuelBurn",
    },
    feedback:
      "Coal chiefly formed from ancient plant material over geological time. Complete combustion can release stored carbon as CO₂ much faster than the store forms; it is finite on human timescales.",
  },
  oilGas: {
    mode: "stores",
    title: "Explain oil and gas stores",
    note: "Crude oil and natural gas contain carbon from ancient biological material buried in sediments.",
    expected: {
      source: "marineLife",
      timescale: "geological",
      release: "fuelBurn",
    },
    feedback:
      "Much oil and gas originated from ancient marine microorganisms and other organic material, altered during burial over geological time. Complete burning releases stored carbon as CO₂; every fossil fuel is not instantly made from modern leaves.",
  },
  limestone: {
    mode: "stores",
    title: "Explain limestone carbon",
    note: "Limestone contains carbonate accumulated in sediment. A supplied dilute acid reacts with the carbonate.",
    expected: {
      source: "shellCarbonate",
      timescale: "geological",
      release: "acidReaction",
    },
    feedback:
      "Carbonate shells and sediments can accumulate and form limestone. CaCO₃ stores carbon. A specified carbonate–acid reaction releases CO₂; storage is long-term, not chemical impossibility of release.",
  },
  deforestation: change(
    "Compare a forest change",
    "Original atmosphere budget. Other listed returns are held constant; fewer trees reduce uptake and the stated burn adds a release.",
    data(
      "Atmosphere",
      100,
      [["Other returns", 28]],
      [["Tree photosynthesis", 30]],
      "one equal interval",
    ),
    data(
      "Atmosphere",
      100,
      [
        ["Other returns", 28],
        ["Cleared biomass burn", 8],
      ],
      [["Tree photosynthesis", 12]],
      "one equal interval",
    ),
    "bothForest",
    "Before: 28 − 30 = −2 g carbon. After: 28 + 8 − 12 = +24 g. Carbon stock released by burning and reduced ongoing uptake are two distinct contributions. No carbon atoms are created; fates and other fluxes can vary in real forests.",
  ),
  fossilChange: change(
    "Add a fossil-carbon release",
    "Original matched atmospheric budgets. Natural return and uptake are unchanged; an extra fossil-fuel burn is supplied.",
    data(
      "Atmosphere",
      100,
      [["Natural returns", 25]],
      [["Photosynthesis", 25]],
      "one equal interval",
    ),
    data(
      "Atmosphere",
      100,
      [
        ["Natural returns", 25],
        ["Extra fossil burn", 9],
      ],
      [["Photosynthesis", 25]],
      "one equal interval",
    ),
    "fossilAdded",
    "Before: 25 − 25 = 0 g; after: 25 + 9 − 25 = +9 g. Extra carbon leaves a geological store and enters the atmosphere faster than geological replacement. Atom conservation does not guarantee a constant atmospheric store.",
  ),
  regrowth: change(
    "Compare regrowth uptake",
    "Original matched atmospheric budgets with greater tree uptake after growth. Listed returns are fixed; this is not an instantaneous or permanent offset claim.",
    data(
      "Atmosphere",
      100,
      [["Returns", 30]],
      [["Photosynthesis", 20]],
      "one equal interval",
    ),
    data(
      "Atmosphere",
      100,
      [["Returns", 30]],
      [["Photosynthesis", 26]],
      "one equal interval",
    ),
    "regrowthSlow",
    "Before: 30 − 20 = +10 g; after: 30 − 26 = +4 g. Greater uptake reduces the gain by 6 g but does not make it zero. Trees take time to grow, can respire, die or burn, and carbon permanence depends on future fates.",
  ),
  seasonal: {
    mode: "pattern",
    title: "Read a supplied carbon series",
    note: "Original teaching concentration series in arbitrary units, not measured global CO₂ or a forecast.",
    series: {
      unit: "arbitrary units",
      min: 98,
      max: 112,
      points: [
        { label: "Y1 summer", value: 100 },
        { label: "Y1 winter", value: 106 },
        { label: "Y2 summer", value: 102 },
        { label: "Y2 winter", value: 108 },
        { label: "Y3 summer", value: 104 },
        { label: "Y3 winter", value: 110 },
      ],
    },
    expected: {
      start: "100",
      end: "110",
      sameSeasonChange: "4",
      change: "10",
      trend: "up",
      season: "winterHigher",
    },
    feedback:
      "Endpoint change 110 − 100 = +10 arbitrary units; summer-to-summer change 104 − 100 = +4. Winter values are higher than summer in each supplied year; summer-to-summer values also rise 100 → 102 → 104. A recurring dip does not cancel the longer-term rise. A curve alone does not prove each cause or give an exact future outcome.",
  },
  seasonalDown: {
    mode: "pattern",
    title: "Test a different supplied trend",
    note: "Original regional teaching series in arbitrary units; not a claim about current worldwide CO₂.",
    series: {
      unit: "arbitrary units",
      min: 86,
      max: 104,
      points: [
        { label: "Y1 summer", value: 96 },
        { label: "Y1 winter", value: 102 },
        { label: "Y2 summer", value: 92 },
        { label: "Y2 winter", value: 98 },
        { label: "Y3 summer", value: 88 },
        { label: "Y3 winter", value: 94 },
      ],
    },
    expected: {
      start: "96",
      end: "94",
      sameSeasonChange: "-8",
      change: "-2",
      trend: "down",
      season: "winterHigher",
    },
    feedback:
      "Endpoint change 94 − 96 = −2 arbitrary units; summer-to-summer change 88 − 96 = −8; the supplied winter values remain higher than each year’s summer, but both same-season series decrease. Read direction and repeated pattern separately; a local original exercise is not global evidence.",
  },
};
export function cycleRecord(mode: CycleMode, record: string) {
  return cycleRecords[record]?.mode === mode ? cycleRecords[record] : null;
}
export function initialCycle(mode: CycleMode, record: string): CycleBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(cycleFields[mode].map((f) => [f, ""])),
  };
}
export function cycleNumber(raw: string): number | null {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function validCycle(
  mode: CycleMode,
  v: unknown,
  record?: string,
): v is CycleBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    return false;
  const b = v as CycleBoard,
    fields = cycleFields[mode];
  return (
    !!fields &&
    b.version === "1" &&
    b.mode === mode &&
    !!cycleRecord(mode, b.record) &&
    (record === undefined || record === b.record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (cycleNumeric.includes(f)
            ? b[f].length <= 16
            : cycleChoices[f]?.includes(b[f]))),
    )
  );
}
export function validCycleHistory(
  mode: CycleMode,
  record: string,
  h: unknown,
): h is CycleBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validCycle(mode, b, record))
  )
    return false;
  const initial = initialCycle(mode, record);
  return (
    Object.keys(initial).every((k) => h[0][k] === initial[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        cycleFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkCycle(mode: CycleMode, b: CycleBoard) {
  if (!validCycle(mode, b))
    return {
      correct: false,
      message:
        "This carbon proposal is unreadable. Its original entries are retained.",
    };
  const r = cycleRecord(mode, b.record)!,
    fields = cycleFields[mode];
  if (fields.some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const wrong = fields.filter((f) =>
    cycleNumeric.includes(f)
      ? cycleNumber(b[f]) === null ||
        Math.abs(cycleNumber(b[f])! - Number(r.expected[f])) > 1e-6
      : b[f] !== r.expected[f],
  );
  return {
    correct: wrong.length === 0,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => cycleLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
