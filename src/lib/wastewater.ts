export type WasteMode =
  "targets" | "route" | "solids" | "biology" | "disposal" | "quality";
export type WasteBoard = Record<string, string>;
export type WasteGiven = {
  title: string;
  note: string;
  rows: readonly { label: string; text: string }[];
  summary?: string;
  solids?: { feed: number; screen: number; grit: number; sludge: number };
  disposal?: {
    fertiliser: number;
    landfill: number;
    burn: number;
    other: number;
  };
  route?: boolean;
};
export type WasteRecord = WasteGiven & {
  mode: WasteMode;
  expected: WasteBoard;
  feedback: string;
};
export const wasteFields: Record<WasteMode, readonly string[]> = {
  targets: ["target", "reason"],
  route: ["first", "next", "sludge", "effluent"],
  solids: ["after", "remaining", "basis"],
  biology: ["oxygen", "process", "limit"],
  disposal: ["total", "fraction", "percent"],
  quality: ["discharge", "drink", "inference"],
};
export const wasteNumeric = [
  "after",
  "remaining",
  "total",
  "fraction",
  "percent",
];
export const wasteLabels: Record<string, string> = {
  target: "Treatment targets",
  organicMicrobes: "Organic matter + microbes",
  organicChemicals: "Organic matter + chemicals",
  saltOnly: "Dissolved salts only",
  reason: "Reason to treat before release",
  harm: "Reduce pollution and harm",
  clarity: "Clarity guarantees safety",
  sterile: "Permanently sterile rivers",
  first: "Next physical stage",
  next: "Following physical stage",
  screen: "Screening + grit removal",
  sediment: "Sedimentation",
  complete: "Physical stages complete",
  filterSalt: "Ordinary salt filtration",
  sludge: "Sludge treatment",
  effluent: "Effluent treatment",
  anaerobic: "Anaerobic digestion",
  aerobic: "Aerobic biological treatment",
  none: "No biological treatment",
  after: "Dry solids after screening/grit removal / kg",
  remaining: "Dry suspended solids in effluent / kg",
  basis: "What is conserved here?",
  dry: "Dry suspended solids",
  wet: "Whole wet sludge mass",
  water: "Only the water volume",
  oxygen: "Oxygen condition",
  present: "Oxygen supplied",
  absent: "Without oxygen",
  process: "Biological process",
  respire: "Aerobic breakdown",
  digest: "Anaerobic digestion",
  disappear: "Destruction of every atom",
  limit: "What remains unproved?",
  qualityUnknown: "Final quality and safety",
  methaneOnly: "Whether any atoms remain",
  nothing: "All quality guaranteed",
  total: "Total dry sludge processed / tonnes",
  fraction: "Burned fraction of this total",
  percent: "Percentage burned / %",
  discharge: "Meets supplied discharge limit?",
  drink: "Meets supplied drinking requirement?",
  yes: "Yes",
  no: "No",
  unknown: "Not established",
  inference: "Supported conclusion",
  different: "Different quality requirements",
  safeClear: "Clarity proves safety",
  pure: "Only H₂O is present",
  targeted: "Chemical treatment needed",
};
export const wasteChoices: Record<string, readonly string[]> = {
  target: ["organicMicrobes", "organicChemicals", "saltOnly"],
  reason: ["harm", "clarity", "sterile"],
  first: ["screen", "sediment", "complete", "filterSalt"],
  next: ["screen", "sediment", "complete", "filterSalt"],
  sludge: ["anaerobic", "aerobic", "none"],
  effluent: ["aerobic", "anaerobic", "none"],
  basis: ["dry", "wet", "water"],
  oxygen: ["present", "absent"],
  process: ["respire", "digest", "disappear"],
  limit: ["qualityUnknown", "methaneOnly", "nothing"],
  discharge: ["yes", "no", "unknown"],
  drink: ["yes", "no", "unknown"],
  inference: ["different", "safeClear", "pure", "targeted"],
};
const row = (label: string, text: string) => ({ label, text });
export const wasteRecords: Record<string, WasteRecord> = {
  domestic: {
    mode: "targets",
    title: "Sewage before release",
    summary: "Domestic sewage: organic matter and harmful microbes.",
    note: "Use the stated contaminants.",
    rows: [
      row(
        "Source",
        "Domestic sewage contains organic matter and harmful microorganisms.",
      ),
    ],
    expected: { target: "organicMicrobes", reason: "harm" },
    feedback:
      "Organic matter and harmful microbes both require removal. Untreated sewage can harm ecosystems and spread disease; clear appearance alone is not a safety test.",
  },
  farm: {
    mode: "targets",
    title: "Agricultural wastewater",
    note: "Only the stated pollutants are supplied.",
    rows: [
      row(
        "Source",
        "Agricultural wastewater containing manure-derived organic matter and harmful microbes.",
      ),
    ],
    expected: { target: "organicMicrobes", reason: "harm" },
    feedback:
      "This agricultural wastewater needs organic matter and harmful-microbe removal. This case does not claim every agricultural pollutant is identical.",
  },
  factory: {
    mode: "targets",
    title: "Industrial contaminants",
    note: "A pollutant survey is available.",
    rows: [
      row(
        "Source",
        "Factory wastewater has organic material and a harmful dissolved metal compound.",
      ),
      row(
        "Evidence",
        "The supplied biological stage does not remove the metal compound.",
      ),
    ],
    expected: { target: "organicChemicals", reason: "harm" },
    feedback:
      "Industrial water may require organic matter and harmful-chemical removal. Biological treatment alone does not remove the stated metal pollutant; use an appropriate specified chemical-removal stage.",
  },
  raw: {
    mode: "route",
    title: "Trace both sewage streams",
    summary:
      "Raw sewage: debris, grit and settleable solids; biological treatment follows separation.",
    note: "Choose the two physical stages and the distinct biological branches.",
    rows: [
      row(
        "Feed",
        "Unscreened sewage with large objects, grit and settleable suspended solids.",
      ),
    ],
    route: true,
    expected: {
      first: "screen",
      next: "sediment",
      sludge: "anaerobic",
      effluent: "aerobic",
    },
    feedback:
      "Screening/grit removal precedes sedimentation. Settled sludge undergoes anaerobic digestion; the liquid effluent undergoes aerobic biological treatment. Sludge contains water and effluent can retain pollutants.",
  },
  screened: {
    mode: "route",
    title: "Continue a partly treated feed",
    note: "Do not repeat a supplied completed stage.",
    rows: [
      row(
        "Completed",
        "Screening and grit removal are complete; suspended solids have not yet settled.",
      ),
    ],
    route: true,
    expected: {
      first: "sediment",
      next: "complete",
      sludge: "anaerobic",
      effluent: "aerobic",
    },
    feedback:
      "Sedimentation is the remaining physical stage here. Its sludge and liquid effluent require different biological conditions; absence of large debris does not establish drinking quality.",
  },
  settled: {
    mode: "route",
    title: "Choose the remaining branches",
    note: "Physical separation is already complete.",
    rows: [
      row(
        "Completed",
        "Screening, grit removal and sedimentation have produced separate sludge and effluent.",
      ),
    ],
    route: true,
    expected: {
      first: "complete",
      next: "complete",
      sludge: "anaerobic",
      effluent: "aerobic",
    },
    feedback:
      "No physical stage needs repeating in the stated case. Treat sludge anaerobically and effluent aerobically. The branches are not interchangeable.",
  },
  solidsA: {
    mode: "solids",
    title: "Account for dry suspended solids",
    note: "Original ideal physical-stage inventory: no reaction, no loss; all listed masses are dry suspended solids, not wet sludge.",
    rows: [],
    solids: { feed: 120, screen: 8, grit: 12, sludge: 90 },
    expected: { after: "100", remaining: "10", basis: "dry" },
    feedback:
      "120−8−12=100 kg after screening/grit removal. 100−90=10 kg remains suspended in effluent. 8+12+90+10=120 kg. Wet sludge also contains water; no dissolved-contaminant or safety conclusion follows.",
  },
  solidsB: {
    mode: "solids",
    title: "Close another physical inventory",
    note: "Ideal dry suspended-solid balance only; no reaction or losses.",
    rows: [],
    solids: { feed: 85, screen: 5, grit: 10, sludge: 56 },
    expected: { after: "70", remaining: "14", basis: "dry" },
    feedback:
      "85−5−10=70 kg and 70−56=14 kg. This conserves the supplied dry solids across separation, not whole wet sludge mass or biological products.",
  },
  solidsC: {
    mode: "solids",
    title: "A fractional-mass inventory",
    note: "Ideal dry suspended-solid inventory; biological breakdown has not begun.",
    rows: [],
    solids: { feed: 42.5, screen: 2.5, grit: 5, sludge: 28 },
    expected: { after: "35", remaining: "7", basis: "dry" },
    feedback:
      "42.5−2.5−5=35 kg; 35−28=7 kg. Separated material has changed location, not disappeared.",
  },
  liquid: {
    mode: "biology",
    title: "Treat liquid effluent",
    summary:
      "Liquid effluent still contains organic matter; the plant supplies oxygen to its microorganisms.",
    note: "Choose conditions and the limit of this evidence.",
    rows: [
      row("Stream", "Liquid effluent with remaining organic matter."),
      row(
        "Plant",
        "Air supplies oxygen for microorganisms. No final microbiological or chemical quality results are given.",
      ),
    ],
    expected: {
      oxygen: "present",
      process: "respire",
      limit: "qualityUnknown",
    },
    feedback:
      "Aerobic microorganisms use supplied oxygen to break down organic matter. This does not prove all harmful microbes or industrial chemicals are removed, nor drinking safety.",
  },
  sludge: {
    mode: "biology",
    title: "Digest the sludge",
    note: "Cross-science explanatory context: Biology decay clause describes methane-containing biogas; no methane-yield calculation is required here.",
    rows: [
      row("Stream", "Settled sludge in a digester without supplied oxygen."),
      row(
        "Context",
        "Anaerobic microbial decay can produce methane-containing biogas, which can be used as fuel. Other products/material remain.",
      ),
    ],
    expected: { oxygen: "absent", process: "digest", limit: "qualityUnknown" },
    feedback:
      "Anaerobic digestion works without oxygen. Methane-containing biogas is explanatory context, not pure methane or disappearing atoms. Final pollutant removal and potability are not established by naming this process.",
  },
  disposeA: {
    mode: "disposal",
    title: "Keep the whole in the denominator",
    note: "Original invented dry-sludge disposal table; categories are exclusive and complete for this year. Burned fraction as a decimal.",
    rows: [],
    disposal: { fertiliser: 540, landfill: 36, burn: 180, other: 144 },
    expected: { total: "900", fraction: "0.2", percent: "20" },
    feedback:
      "Total=540+36+180+144=900 tonnes. Burned fraction=180/900=0.2; ×100 gives 20%. The denominator is all processed sludge in this year, not the fertiliser portion or an earlier-year total.",
  },
  disposeB: {
    mode: "disposal",
    title: "A different disposal whole",
    note: "Original complete dry-sludge table; burned fraction as a decimal. Suitability for fertiliser has been separately established for the listed treated material.",
    rows: [],
    disposal: { fertiliser: 650, landfill: 26, burn: 195, other: 429 },
    expected: { total: "1300", fraction: "0.15", percent: "15" },
    feedback:
      "Total 1300 tonnes;195/1300=0.15=15%. Treated material may be a resource where suitability is established; these masses alone do not prove untreated sludge is safe fertiliser or explain a historical trend.",
  },
  discharge: {
    mode: "quality",
    title: "Different end uses",
    note: "Invented limits illustrate reasoning; they are not real legal water standards.",
    rows: [
      row("Sample", "Clear effluent has 12 pollutant units/litre."),
      row(
        "Criteria",
        "Discharge limit≤20 units/litre; drinking requirement≤2 units/litre. Other supplied discharge checks pass; no drinking microbiological result.",
      ),
    ],
    expected: { discharge: "yes", drink: "no", inference: "different" },
    feedback:
      "12≤20 passes the supplied discharge criterion, but 12>2 fails the drinking requirement. Clear treated effluent is not automatically potable; chemical purity is not demonstrated.",
  },
  industrial: {
    mode: "quality",
    title: "Use chemical-removal evidence",
    note: "Invented pollutant test and limits, not real regulatory values.",
    rows: [
      row(
        "Before treatment",
        "Harmful compound:40 units/litre. Discharge limit≤5, drinking requirement≤1.",
      ),
      row(
        "Options",
        "Biological treatment alone leaves 40. Specified chemical treatment reduces it to 4. Other discharge checks pass; drinking microbial checks are unavailable.",
      ),
      row(
        "Proposal",
        "Evaluate the product after the specified chemical treatment.",
      ),
    ],
    expected: { discharge: "yes", drink: "no", inference: "targeted" },
    feedback:
      "The specified chemical treatment gives 4≤5, meeting the supplied discharge condition, but 4>1 fails the drinking requirement. The biological stage alone would fail even discharge; treatment must target the actual harmful chemical.",
  },
};
export function wasteRecord(mode: WasteMode, record: string) {
  const r = wasteRecords[record];
  return r?.mode === mode ? r : undefined;
}
export function initialWaste(mode: WasteMode, record: string): WasteBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(wasteFields[mode].map((f) => [f, ""])),
  };
}
export function wasteNumber(raw: string) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function validWaste(
  mode: WasteMode,
  v: unknown,
  record?: string,
): v is WasteBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    return false;
  const b = v as WasteBoard,
    fs = wasteFields[mode];
  return (
    !!fs &&
    b.version === "1" &&
    b.mode === mode &&
    !!wasteRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fs.length + 3 &&
    fs.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (wasteNumeric.includes(f)
            ? b[f].length <= 16
            : wasteChoices[f]?.includes(b[f]))),
    )
  );
}
export function validWasteHistory(
  mode: WasteMode,
  record: string,
  h: unknown,
): h is WasteBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validWaste(mode, b, record))
  )
    return false;
  const first = initialWaste(mode, record);
  return (
    Object.keys(first).every((k) => h[0][k] === first[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        wasteFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkWaste(mode: WasteMode, b: WasteBoard) {
  if (!validWaste(mode, b))
    return {
      correct: false,
      message: "Saved wastewater proposal is unreadable; entries are retained.",
    };
  const r = wasteRecord(mode, b.record)!,
    fs = wasteFields[mode];
  if (fs.some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const wrong = fs.filter((f) =>
    wasteNumeric.includes(f)
      ? wasteNumber(b[f]) === null ||
        Math.abs(wasteNumber(b[f])! - Number(r.expected[f])) > 1e-6
      : b[f] !== r.expected[f],
  );
  return {
    correct: !wrong.length,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => wasteLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
