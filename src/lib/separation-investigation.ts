export type SeparationMode =
  "sequence" | "fractions" | "recovery" | "setup" | "comparison" | "purity";
export type SeparationBoard = Record<string, string>;
export type SeparationGiven = {
  title: string;
  note: string;
  rows?: readonly { label: string; text: string }[];
};
export type SeparationRecord = SeparationGiven & {
  mode: SeparationMode;
  expected: Record<string, string>;
  feedback: string;
};
export const separationFields: Record<SeparationMode, readonly string[]> = {
  sequence: ["first", "second", "third"],
  fractions: ["residue", "filtrate", "collect"],
  recovery: ["net", "percent", "claim"],
  setup: ["line", "level", "front"],
  comparison: ["change", "control", "conclusion"],
  purity: ["decision", "basis"],
};
const stages = [
  "dissolve",
  "filter",
  "crystallise",
  "drySand",
  "distil",
  "vaporise",
  "condense",
  "evaporate",
  "fractionate",
  "coolOnly",
];
export const separationChoices: Record<string, readonly string[]> = {
  first: stages,
  second: stages,
  third: stages,
  residue: ["sand", "salt", "solution", "water"],
  filtrate: ["sand", "salt", "solution", "water"],
  collect: ["residue", "crystals", "distillate", "filtrate"],
  claim: ["recovered", "apparent", "pure", "complete"],
  line: ["pencil", "ink"],
  level: ["above", "submerged"],
  front: ["immediate", "afterDrying"],
  change: ["paper", "solvent", "both"],
  control: ["solvent", "paper", "nothing"],
  conclusion: ["attraction", "intrinsic", "noChange"],
  decision: ["supported", "notEstablished", "repeatDrying", "investigateLoss"],
  basis: ["thermal", "oneSpot", "mass", "wetMass", "plateau"],
};
export const separationLabels: Record<string, string> = {
  first: "Stage 1",
  second: "Stage 2",
  third: "Stage 3",
  residue: "Solid on the filter",
  filtrate: "Liquid through the filter",
  collect: "Fraction to collect",
  net: "Net recovered mass / g",
  percent: "Recovery / %",
  claim: "What this result supports",
  line: "Origin-line material",
  level: "Origin relative to solvent",
  front: "When to mark the solvent front",
  change: "Variable changed",
  control: "Variable held constant",
  conclusion: "Explanation of the changed Rf",
  decision: "Supported conclusion",
  basis: "Evidence used",
  dissolve: "Add water and stir to dissolve the salt",
  filter: "Filter the mixture",
  crystallise: "Concentrate filtrate, then cool; collect and dry crystals",
  drySand: "Wash the sand residue, then dry it",
  distil: "Distil the filtrate; condense and collect vapour",
  vaporise: "Heat the filtrate so the water vaporises",
  condense: "Cool the vapour in a condenser; collect liquid water",
  evaporate: "Evaporate and let the vapour escape",
  fractionate: "Use fractional distillation",
  coolOnly: "Cool the original dry mixture only",
  sand: "Sand",
  salt: "Dry salt",
  solution: "Salt solution",
  water: "Water alone",
  crystals: "Crystals from the concentrated filtrate",
  distillate: "Condensed solvent",
  recovered: "Calculated recovery only; purity needs other evidence",
  apparent: "Apparent recovery; moisture or contamination may add mass",
  pure: "Mass alone proves purity",
  complete: "Nothing was lost and all material is pure",
  pencil: "Pencil",
  ink: "Soluble ink",
  above: "Above the solvent surface",
  submerged: "Below the solvent surface",
  immediate: "Immediately on removal, before the solvent evaporates",
  afterDrying: "Only after the paper has dried",
  paper: "Type of chromatography paper",
  solvent: "Solvent",
  both: "Both paper and solvent",
  nothing: "No control needed",
  attraction:
    "Different attraction to the stationary phase changes time spent in it",
  intrinsic: "Rf is a universal constant of the dye",
  noChange: "The results must be wrong because Rf cannot change",
  supported: "Evidence supports purity under these conditions",
  notEstablished: "Purity is not established by this evidence alone",
  repeatDrying: "Dry, cool and reweigh before calculating a dry-mass recovery",
  investigateLoss:
    "Investigate material left in solution or lost during transfer",
  thermal: "Sharp melting point matching the supplied reference",
  oneSpot: "One resolved spot in one solvent",
  mass: "Recovered mass alone",
  wetMass: "Mass still falls after further drying",
  plateau: "Two successive masses agree at the stated resolution",
};
export const separationRecords: Record<string, SeparationRecord> = {
  "sand-route": {
    mode: "sequence",
    title: "Recover the sand",
    note: "Dry sand and soluble salt are mixed. Target: dry sand.",
    expected: { first: "dissolve", second: "filter", third: "drySand" },
    feedback:
      "Water dissolves salt, not sand. Filtration retains sand. Washing removes adhering salt solution; drying removes water. This physical separation forms no new substance.",
  },
  "salt-route": {
    mode: "sequence",
    title: "Dry salt crystals",
    note: "Sand + soluble salt.",
    expected: { first: "dissolve", second: "filter", third: "crystallise" },
    feedback:
      "Dissolve salt in water, filter off sand, then concentrate the filtrate and allow crystallisation on cooling. Collect and dry crystals. Ordinary filter paper does not retain dissolved salt.",
  },
  "water-route": {
    mode: "sequence",
    title: "Recover the solvent",
    note: "Sand and salt solution are mixed. Target: collect the water. Water is the only volatile component.",
    expected: { first: "filter", second: "vaporise", third: "condense" },
    feedback:
      "Filter off sand, heat the filtrate so water vaporises, then cool the vapour in a condenser and collect liquid water. Evaporation with escaping vapour cannot recover the solvent.",
  },
  "salt-fractions": {
    mode: "fractions",
    title: "Follow the salt",
    note: "A stirred sand–salt–water mixture is filtered. Target: salt crystals.",
    expected: { residue: "sand", filtrate: "solution", collect: "crystals" },
    feedback:
      "Sand is the residue; dissolved salt remains in the filtrate. Collect crystals after concentrating and cooling the filtrate, not the sand on the filter.",
  },
  "sand-fractions": {
    mode: "fractions",
    title: "Follow the sand",
    note: "A stirred sand–salt–water mixture is filtered. Target: sand.",
    expected: { residue: "sand", filtrate: "solution", collect: "residue" },
    feedback:
      "Collect the sand residue. The filtrate is salt solution, not pure water. Wash and dry the residue to reduce soluble contamination and water.",
  },
  "water-fractions": {
    mode: "fractions",
    title: "Follow the water",
    note: "A stirred sand–salt–water mixture is filtered, then the filtrate is distilled. Target: water; salt is non-volatile.",
    expected: { residue: "sand", filtrate: "solution", collect: "distillate" },
    feedback:
      "Sand stays on the filter; salt solution passes through. The condenser converts solvent vapour to collected liquid. The salt remains in the distillation flask.",
  },
  "dry-recovery": {
    mode: "recovery",
    title: "Remove the vessel's mass",
    note: "Supplied dry-sample results. Recovery = net recovered mass ÷ initial target mass × 100.",
    rows: [
      { label: "Initial salt", text: "5.00 g" },
      { label: "Empty dish", text: "24.00 g" },
      { label: "Dish + dry crystals", text: "28.00 g" },
    ],
    expected: { net: "4", percent: "80", claim: "recovered" },
    feedback:
      "28.00 − 24.00 = 4.00 g of dry crystals. 4.00 ÷ 5.00 × 100 = 80%. Recovery measures collected mass relative to the supplied starting target mass; it does not itself establish purity.",
  },
  "wet-recovery": {
    mode: "recovery",
    title: "More than 100%?",
    note: "Crystals have not been dried. Calculate the apparent recovery without changing the measurements.",
    rows: [
      { label: "Initial salt", text: "4.00 g" },
      { label: "Empty dish", text: "20.00 g" },
      { label: "Dish + wet crystals", text: "24.60 g" },
    ],
    expected: { net: "4.6", percent: "115", claim: "apparent" },
    feedback:
      "24.60 − 20.00 = 4.60 g; 4.60 ÷ 4.00 × 100 = 115%. This apparent recovery includes retained water or other contamination; it does not create extra salt. Dry and reweigh before comparing dry-mass recovery.",
  },
  "sand-recovery": {
    mode: "recovery",
    title: "A second mass balance",
    note: "Supplied dry-sand results. Recovery = net mass ÷ initial sand mass × 100.",
    rows: [
      { label: "Initial sand", text: "8.00 g" },
      { label: "Empty vessel", text: "16.50 g" },
      { label: "Vessel + dry sand", text: "22.50 g" },
    ],
    expected: { net: "6", percent: "75", claim: "recovered" },
    feedback:
      "22.50 − 16.50 = 6.00 g; 6.00 ÷ 8.00 × 100 = 75%. Some sand may remain in apparatus or be lost in transfer. Mass alone cannot distinguish every cause of loss or establish purity.",
  },
  "setup-repair": {
    mode: "setup",
    title: "Repair the chromatogram setup",
    note: "Original proposal: soluble-ink origin below the solvent; front marked after drying. Repair all three decisions.",
    expected: { line: "pencil", level: "above", front: "immediate" },
    feedback:
      "Use pencil so the line does not dissolve and separate with the sample. Keep the origin above the solvent to prevent the sample washing into it. Mark the front immediately on removal, before evaporation removes its position.",
  },
  "setup-measure": {
    mode: "setup",
    title: "Preserve the measurement origin",
    note: "Plan a new paper chromatography run. Choose the line, initial level and front-marking time.",
    expected: { line: "pencil", level: "above", front: "immediate" },
    feedback:
      "Use a pencil origin above the solvent. Mark the front before evaporation; measure spot centres and solvent front from the same origin. The paper's bottom still dips into the solvent.",
  },
  "paper-comparison": {
    mode: "comparison",
    title: "Compare paper A and paper B",
    note: "Same dye and water solvent; only paper type changed. All distances measured from the origin.",
    rows: [
      { label: "Paper A", text: "Dye 3.0 cm; front 10.0 cm; Rf 0.30" },
      { label: "Paper B", text: "Dye 4.5 cm; front 10.0 cm; Rf 0.45" },
    ],
    expected: { change: "paper", control: "solvent", conclusion: "attraction" },
    feedback:
      "Paper type is changed while solvent is held constant. Lower Rf on A is consistent with greater attraction to A and a greater proportion of time in that stationary phase. Rf depends on paper and solvent conditions.",
  },
  "solvent-comparison": {
    mode: "comparison",
    title: "Compare two solvents",
    note: "Same dye and paper; only solvent changed. All distances measured from the origin.",
    rows: [
      { label: "Water", text: "Dye 2.0 cm; front 8.0 cm; Rf 0.25" },
      { label: "Solvent S", text: "Dye 4.0 cm; front 8.0 cm; Rf 0.50" },
    ],
    expected: { change: "solvent", control: "paper", conclusion: "attraction" },
    feedback:
      "Change solvent while holding paper constant. Changing solvent changes the dye's distribution between mobile and stationary phases, hence time spent in the stationary phase. Rf is not an intrinsic constant independent of conditions.",
  },
  "sharp-purity": {
    mode: "purity",
    title: "Use a reference, not appearance",
    note: "Original hypothetical solid P; temperatures are supplied teaching data, not real salt values.",
    rows: [
      {
        label: "Reference P",
        text: "Melting point 122 °C at the stated pressure",
      },
      {
        label: "Recovered sample",
        text: "Sharp melting at 122 °C with matching method and pressure",
      },
    ],
    expected: { decision: "supported", basis: "thermal" },
    feedback:
      "A sharp melting point matching the supplied pure reference supports purity under these conditions. This is evidence, not identification of every possible trace contaminant.",
  },
  "spot-limit": {
    mode: "purity",
    title: "One spot: how far can you conclude?",
    note: "Recovered dye gives one resolved spot in one solvent. Only visible colour spots were detected.",
    expected: { decision: "notEstablished", basis: "oneSpot" },
    feedback:
      "One spot is consistent with one resolved visible component. Co-migrating or undetected substances can remain. Test suitable further conditions or obtain independent physical evidence before stronger purity claims.",
  },
  "drying-check": {
    mode: "purity",
    title: "Is the mass ready to use?",
    note: "Same vessel and sample, cooled before weighing. Balance resolution 0.01 g.",
    rows: [
      { label: "First drying", text: "31.24 g" },
      { label: "Further drying", text: "30.88 g" },
      { label: "Further drying again", text: "30.72 g" },
    ],
    expected: { decision: "repeatDrying", basis: "wetMass" },
    feedback:
      "Mass is still falling, consistent with remaining water. Continue appropriate supervised drying, cool and reweigh. A constant mass at this resolution supports adequate drying, not absolute chemical purity.",
  },
};
export function separationRecord(mode: SeparationMode, record: string) {
  const r = separationRecords[record];
  return r?.mode === mode ? r : null;
}
export function initialSeparation(
  mode: SeparationMode,
  record: string,
): SeparationBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(separationFields[mode].map((f) => [f, ""])),
  };
}
export function validSeparation(
  mode: SeparationMode,
  value: unknown,
  record?: string,
): value is SeparationBoard {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return false;
  const b = value as SeparationBoard,
    fields = separationFields[mode];
  return (
    !!fields &&
    b.version === "1" &&
    b.mode === mode &&
    !!separationRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (["net", "percent"].includes(f)
            ? b[f].length <= 16
            : separationChoices[f]?.includes(b[f]))),
    )
  );
}
export function validSeparationHistory(
  mode: SeparationMode,
  record: string,
  h: unknown,
): h is SeparationBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validSeparation(mode, b, record))
  )
    return false;
  const initial = initialSeparation(mode, record);
  return (
    Object.keys(initial).every((k) => h[0][k] === initial[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        separationFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkSeparation(mode: SeparationMode, b: SeparationBoard) {
  if (!validSeparation(mode, b))
    return {
      correct: false,
      message:
        "This proposal is unreadable. Its original entries are retained.",
    };
  if (separationFields[mode].some((f) => !b[f]))
    return {
      correct: false,
      message:
        "Complete each part of your proposal. Blank entries remain unknown.",
    };
  const r = separationRecord(mode, b.record)!,
    wrong = separationFields[mode].filter((f) =>
      ["net", "percent"].includes(f)
        ? !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(b[f]) ||
          !Number.isFinite(Number(b[f])) ||
          Math.abs(Number(b[f]) - Number(r.expected[f])) > 0.000001
        : b[f] !== r.expected[f],
    );
  return {
    correct: wrong.length === 0,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => separationLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
