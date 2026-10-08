export type BioMode = "pathway" | "grade" | "ash" | "recovery" | "compare";
export type BioBoard = Record<string, string>;
export type BioGiven = {
  title: string;
  note: string;
  summary?: string;
  rows: readonly { label: string; text: string }[];
  grade?: {
    mass: number;
    percent?: number;
    recovery: number;
    compound?: boolean;
  };
  ash?: { biomass: number; copper: number; ash: number; retained: number };
  comparison?: {
    aEnergy: number;
    aCopper: number;
    bEnergy: number;
    bCopper: number;
    requirement: string;
  };
  ironScene?: boolean;
};
export type BioRecord = BioGiven & {
  mode: BioMode;
  expected: BioBoard;
  feedback: string;
};
export const bioFields: Record<BioMode, readonly string[]> = {
  pathway: ["agent", "stage", "intermediate", "next"],
  grade: ["available", "recovered", "unrecovered"],
  ash: ["retainedCu", "lostCu", "ashGrade", "identity"],
  recovery: ["method", "product", "change"],
  compare: ["aPer", "bPer", "decision", "limit"],
};
export const bioNumeric = [
  "available",
  "recovered",
  "unrecovered",
  "retainedCu",
  "lostCu",
  "ashGrade",
  "aPer",
  "bPer",
];
export const bioLabels: Record<string, string> = {
  agent: "Agent used in this case",
  plants: "Plants",
  bacteria: "Bacteria",
  acid: "Suitable acid",
  magnets: "Magnets",
  stage: "Process at this point",
  harvestBurn: "Harvest and burn plants",
  leach: "Produce leachate",
  dissolve: "Dissolve ash in acid",
  dry: "Evaporate solution only",
  intermediate: "Material after this stage",
  ashCompounds: "Compounds in ash",
  aqueousCompounds: "Dissolved copper compounds",
  pureCopper: "Pure copper metal",
  noCopper: "No copper atoms remain",
  next: "What still needs doing?",
  acidThenRecover: "Acid dissolve, then recover",
  recoverMetal: "Recover metal from solution",
  finished: "No recovery needed",
  available: "Copper content before recovery / kg",
  recovered: "Recovered copper metal / kg",
  unrecovered: "Copper outside the metal product / kg",
  retainedCu: "Copper retained in ash / kg",
  lostCu: "Copper outside this ash / kg",
  ashGrade: "Copper content of ash / %",
  identity: "Copper form in the ash",
  compounds: "Copper compounds",
  metal: "Pure copper metal",
  newAtoms: "New copper atoms from plants",
  method: "Recovery action or supplied addition",
  iron: "Add scrap iron",
  silver: "Add silver",
  electrolysis: "Electrolyse the solution",
  filter: "Ordinary filtration only",
  product: "Copper form after this action",
  solidCopper: "Copper metal deposited",
  ionsRemain: "Copper ions remain dissolved",
  change: "Copper-ion change",
  gain: "Gain electrons: reduction",
  lose: "Lose electrons: oxidation",
  unchanged: "No copper reduction",
  aPer: "Route A energy / kWh per kg Cu",
  bPer: "Route B energy / kWh per kg Cu",
  decision: "Decision using the stated requirement",
  aLower: "A: lower stated energy/kg",
  bLower: "B: lower stated energy/kg",
  bDeadline: "B: meets the deadline",
  limit: "Limit of the comparison",
  boundary: "Given boundary and criteria",
  universal: "One route always best",
  zero: "Biological methods have no impacts",
};
export const bioChoices: Record<string, readonly string[]> = {
  agent: ["plants", "bacteria", "acid", "magnets"],
  stage: ["harvestBurn", "leach", "dissolve", "dry"],
  intermediate: ["ashCompounds", "aqueousCompounds", "pureCopper", "noCopper"],
  next: ["acidThenRecover", "recoverMetal", "finished"],
  identity: ["compounds", "metal", "newAtoms"],
  method: ["iron", "silver", "electrolysis", "filter"],
  product: ["solidCopper", "ionsRemain"],
  change: ["gain", "lose", "unchanged"],
  decision: ["aLower", "bLower", "bDeadline"],
  limit: ["boundary", "universal", "zero"],
};
const row = (label: string, text: string) => ({ label, text });
export const bioRecords: Record<string, BioRecord> = {
  plants: {
    mode: "pathway",
    title: "Follow phytomining",
    summary: "Harvested plants contain copper compounds.",
    note: "Original simulated process; chemical treatments are described for exam reasoning.",
    rows: [
      row(
        "Source",
        "Plants grow on copper-containing land and absorb metal compounds.",
      ),
      row(
        "Given intermediate",
        "Harvested plant material contains copper compounds, not copper metal.",
      ),
    ],
    expected: {
      agent: "plants",
      stage: "harvestBurn",
      intermediate: "ashCompounds",
      next: "acidThenRecover",
    },
    feedback:
      "Grow plants to absorb copper compounds, harvest and burn them; the ash still contains copper compounds. Dissolve the ash in suitable acid to obtain a solution, then recover copper by scrap-iron displacement or electrolysis. Burning alone does not make pure copper.",
  },
  bacteria: {
    mode: "pathway",
    title: "Follow bioleaching",
    note: "Use bacterial treatment of the supplied low-grade copper ore.",
    rows: [
      row("Source", "A low-grade copper ore is treated using bacteria."),
      row(
        "Observation",
        "The collected leachate is a solution containing copper compounds.",
      ),
    ],
    expected: {
      agent: "bacteria",
      stage: "leach",
      intermediate: "aqueousCompounds",
      next: "recoverMetal",
    },
    feedback:
      "Bacteria produce leachate solutions containing copper compounds. This is not automatically copper metal; recover metal from the solution by an appropriate displacement or electrolysis stage.",
  },
  readyAsh: {
    mode: "pathway",
    title: "Continue from prepared ash",
    note: "Plant growth, harvest and burning are already complete.",
    rows: [
      row(
        "Feed",
        "Prepared ash contains copper compounds; copper metal has not been recovered.",
      ),
      row(
        "Supplied treatment",
        "Suitable acid dissolves the copper compounds in this ash.",
      ),
    ],
    expected: {
      agent: "acid",
      stage: "dissolve",
      intermediate: "aqueousCompounds",
      next: "recoverMetal",
    },
    feedback:
      "The remaining preparation step is acid dissolution, giving a solution containing copper compounds. Copper recovery from that solution is still needed. Do not repeat completed plant growth/burning or call the ash pure metal.",
  },
  oreA: {
    mode: "grade",
    title: "Grade is a fraction of the source",
    note: "Original ideal exercise: grade is elemental copper content in compounds; recovery is the stated percentage of that copper reaching the metal product. Other copper remains in non-product streams.",
    rows: [],
    grade: { mass: 750, percent: 0.8, recovery: 70 },
    expected: { available: "6", recovered: "4.2", unrecovered: "1.8" },
    feedback:
      "750×0.8/100=6 kg copper content, not 750 kg metal. 70% of 6=4.2 kg metal;6−4.2=1.8 kg copper remains outside the product. Extraction cannot create copper atoms.",
  },
  oreB: {
    mode: "grade",
    title: "Apply grade and recovery separately",
    note: "Original copper-content mass balance; no additional copper input. Copper not in the final metal is retained in other streams.",
    rows: [],
    grade: { mass: 1200, percent: 0.25, recovery: 80 },
    expected: { available: "3", recovered: "2.4", unrecovered: "0.6" },
    feedback:
      "1200×0.25/100=3 kg copper content;80% recovery gives 2.4 kg metal, leaving 0.6 kg copper in other streams. Ore mass, copper content and recovered metal are different quantities.",
  },
  oxide: {
    mode: "grade",
    title: "Copper in a pure compound",
    note: "Original compound calculation: CuO only. Supplied relative atomic masses Cu=64, O=16; stated copper recovery 60%. Other copper stays outside the metal product.",
    rows: [
      row(
        "Composition",
        "Each CuO formula unit contains one Cu and one O; this feed is a pure compound, not an ore-grade percentage.",
      ),
    ],
    grade: { mass: 2.5, recovery: 60, compound: true },
    expected: { available: "2", recovered: "1.2", unrecovered: "0.8" },
    feedback:
      "Mr(CuO)=64+16=80; copper is 64/80=80% by mass.2.5×0.8=2 kg copper content;60% gives 1.2 kg metal and 0.8 kg copper elsewhere. CuO is not already copper metal.",
  },
  ashA: {
    mode: "ash",
    title: "Concentrate copper without creating it",
    note: "Original dry biomass/ash data. Copper content is mass of Cu atoms in compounds. Assume complete copper retention in this stated burn; burning uses oxygen and produces other material, not vanished atoms.",
    rows: [],
    ash: { biomass: 500, copper: 1, ash: 10, retained: 100 },
    expected: {
      retainedCu: "1",
      lostCu: "0",
      ashGrade: "10",
      identity: "compounds",
    },
    feedback:
      "The ash retains 1 kg copper content; none is lost in this stipulated ideal case.1/10×100=10% copper content in ash, versus 1/500×100=0.2% in biomass. Concentration rises because the whole is smaller, not because copper atoms are created. Ash still contains compounds.",
  },
  ashB: {
    mode: "ash",
    title: "Use a supplied copper-retention result",
    note: "Original data:90% of starting copper stays in the ash. Other copper is collected outside this ash; no copper input. Ash contains compounds.",
    rows: [],
    ash: { biomass: 1000, copper: 4, ash: 50, retained: 90 },
    expected: {
      retainedCu: "3.6",
      lostCu: "0.4",
      ashGrade: "7.2",
      identity: "compounds",
    },
    feedback:
      "90% of 4=3.6 kg copper in ash;0.4 kg is outside this ash.3.6/50×100=7.2% copper content. Do not assume ideal retention when a measured loss is supplied; the missing copper has not vanished.",
  },
  ashC: {
    mode: "ash",
    title: "A different ash inventory",
    note: "Original dry biomass/ash data with 95% copper retention; no added copper. Other copper remains outside this ash.",
    rows: [],
    ash: { biomass: 800, copper: 2.4, ash: 30, retained: 95 },
    expected: {
      retainedCu: "2.28",
      lostCu: "0.12",
      ashGrade: "7.6",
      identity: "compounds",
    },
    feedback:
      "2.4×0.95=2.28 kg copper content in ash;0.12 kg outside.2.28/30×100=7.6%. Ash is concentrated copper compounds, not pure copper metal.",
  },
  iron: {
    mode: "recovery",
    title: "Recover copper using scrap iron",
    note: "Supplied aqueous copper(II) sulfate and scrap iron. Reactivity order Fe>Cu>Ag; suitable reaction conditions are given. Select the supplied addition.",
    rows: [
      row(
        "Input",
        "Copper(II) ions are dissolved with sulfate ions; scrap iron is added.",
      ),
      row(
        "Process",
        "Iron is more reactive than copper. The sulfate ions remain in solution.",
      ),
    ],
    ironScene: true,
    expected: { method: "iron", product: "solidCopper", change: "gain" },
    feedback:
      "Iron displaces copper: Fe(s)+Cu²⁺(aq)→Fe²⁺(aq)+Cu(s). Copper ions gain electrons and are reduced; iron loses electrons and is oxidised. Sulfate remains a separate spectator ion. Dissolved copper compounds have now yielded copper metal.",
  },
  silver: {
    mode: "recovery",
    title: "Test a less reactive addition",
    note: "Supplied addition is silver to aqueous copper(II) sulfate. Reactivity order Fe>Cu>Ag; no electrical current or other treatment.",
    rows: [
      row("Input", "Copper(II) ions in solution; silver metal is added."),
      row("Evidence", "Silver is less reactive than copper."),
    ],
    expected: { method: "silver", product: "ionsRemain", change: "unchanged" },
    feedback:
      "Silver cannot displace copper in this supplied reactivity comparison. Copper ions remain dissolved; no copper-ion reduction or copper metal deposit follows from adding silver.",
  },
  cell: {
    mode: "recovery",
    title: "Recover copper electrically",
    note: "The supplied cell electrolyses aqueous copper(II) sulfate using inert electrodes and an applied current. Focus on copper at the negative electrode.",
    rows: [
      row(
        "Input",
        "A copper-compound solution, inert electrodes and an applied current.",
      ),
      row(
        "Copper half-equation",
        "Cu²⁺(aq)+2e⁻→Cu(s) at the negative electrode.",
      ),
    ],
    expected: {
      method: "electrolysis",
      product: "solidCopper",
      change: "gain",
    },
    feedback:
      "Electrolysis deposits copper at the negative electrode as Cu²⁺ gains 2 electrons. This reduction requires the supplied electrical process; it is not ordinary filtration or simply evaporating leachate.",
  },
  filter: {
    mode: "recovery",
    title: "Filter a leachate",
    note: "Supplied ordinary filtration removes undissolved rock; no reactive metal or electrical current is provided.",
    rows: [
      row(
        "Input",
        "Leachate has dissolved copper compounds and some suspended grit.",
      ),
      row(
        "Action",
        "Ordinary filtration retains grit; dissolved copper compounds pass through.",
      ),
    ],
    expected: { method: "filter", product: "ionsRemain", change: "unchanged" },
    feedback:
      "Ordinary filtration separates undissolved solids, not dissolved copper ions from their compounds. No copper reduction occurs, so the filtrate still requires a metal-recovery stage.",
  },
  matched: {
    mode: "compare",
    title: "Compare per recovered copper",
    note: "Original energy totals with the same supplied accounting boundary; products have the same stated copper quality. This is not measured industry performance.",
    rows: [
      row(
        "Routes",
        "A: biological route plus final recovery. B: supplied conventional extraction route.",
      ),
      row(
        "Criterion",
        "Choose lower energy per kilogram of recovered copper for this comparison.",
      ),
    ],
    comparison: {
      aEnergy: 90,
      aCopper: 6,
      bEnergy: 180,
      bCopper: 9,
      requirement: "Lower energy per kg Cu only.",
    },
    expected: { aPer: "15", bPer: "20", decision: "aLower", limit: "boundary" },
    feedback:
      "A:90/6=15; B:180/9=20 kWh/kg Cu. A is lower for the stated boundary and criterion. This does not prove no pollution, no land requirement or that biology always wins.",
  },
  reversed: {
    mode: "compare",
    title: "Check the denominator before choosing",
    note: "Original matched-boundary totals; copper quality is equal. Final recovery is included in each energy total.",
    rows: [
      row(
        "Routes",
        "A: slow biological collection and final recovery. B: supplied conventional route.",
      ),
      row(
        "Criterion",
        "Choose lower energy per kg recovered copper, not lower total energy alone.",
      ),
    ],
    comparison: {
      aEnergy: 60,
      aCopper: 2,
      bEnergy: 90,
      bCopper: 6,
      requirement: "Lower energy per kg Cu only.",
    },
    expected: { aPer: "30", bPer: "15", decision: "bLower", limit: "boundary" },
    feedback:
      "A uses 60/2=30 kWh/kg; B uses 90/6=15. B is lower per equal copper output even though its total 90 exceeds 60. Biological routes are not universally lower energy under every boundary.",
  },
  deadline: {
    mode: "compare",
    title: "Include a real decision constraint",
    note: "Original matched-quality/equal-boundary data, not universal process speeds.",
    rows: [
      row(
        "Routes",
        "A phytomining:70 days to supply the required batch. B bioleaching:10 days for that same batch.",
      ),
      row(
        "Requirement",
        "The batch is required within 14 days; both routes otherwise meet stated requirements. Energy per kg is only a secondary criterion.",
      ),
    ],
    comparison: {
      aEnergy: 48,
      aCopper: 4,
      bEnergy: 80,
      bCopper: 4,
      requirement: "Deliver the required batch within 14 days.",
    },
    expected: {
      aPer: "12",
      bPer: "20",
      decision: "bDeadline",
      limit: "boundary",
    },
    feedback:
      "A:12 and B:20 kWh/kg. A is lower energy but misses the given 14-day deadline; B meets it. Supplied speed, land, available high-grade ore and technology can limit adoption. No universal process-time claim follows.",
  },
};
export function bioRecord(mode: BioMode, record: string) {
  const r = bioRecords[record];
  return r?.mode === mode ? r : undefined;
}
export function initialBio(mode: BioMode, record: string): BioBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(bioFields[mode].map((f) => [f, ""])),
  };
}
export function bioNumber(raw: string) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function validBio(
  mode: BioMode,
  v: unknown,
  record?: string,
): v is BioBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    return false;
  const b = v as BioBoard,
    fs = bioFields[mode];
  return (
    !!fs &&
    b.version === "1" &&
    b.mode === mode &&
    !!bioRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fs.length + 3 &&
    fs.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (bioNumeric.includes(f)
            ? b[f].length <= 16
            : bioChoices[f]?.includes(b[f]))),
    )
  );
}
export function validBioHistory(
  mode: BioMode,
  record: string,
  h: unknown,
): h is BioBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validBio(mode, b, record))
  )
    return false;
  const first = initialBio(mode, record);
  return (
    Object.keys(first).every((k) => h[0][k] === first[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        bioFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkBio(mode: BioMode, b: BioBoard) {
  if (!validBio(mode, b))
    return {
      correct: false,
      message:
        "Saved copper-extraction proposal is unreadable; entries are retained.",
    };
  const r = bioRecord(mode, b.record)!,
    fs = bioFields[mode];
  if (fs.some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const wrong = fs.filter((f) =>
    bioNumeric.includes(f)
      ? bioNumber(b[f]) === null ||
        Math.abs(bioNumber(b[f])! - Number(r.expected[f])) > 1e-6
      : b[f] !== r.expected[f],
  );
  return {
    correct: !wrong.length,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => bioLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
