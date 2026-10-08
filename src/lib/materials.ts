export type MaterialsMode =
  | "rust"
  | "protection"
  | "composition"
  | "alloy"
  | "polymer"
  | "manufacture"
  | "composite"
  | "selection";
export type MaterialsBoard = Record<string, string>;
export type MaterialsGiven = {
  title: string;
  note: string;
  rows?: readonly { label: string; text: string }[];
  table?: {
    caption: string;
    head: readonly string[];
    rows: readonly (readonly string[])[];
  };
  diagram?:
    | "pure"
    | "alloy"
    | "soft"
    | "set"
    | "branched"
    | "linear"
    | "concrete"
    | "fibre";
  carats?: number;
};
export type MaterialsRecord = MaterialsGiven & {
  mode: MaterialsMode;
  expected: MaterialsBoard;
  feedback: string;
};
export const materialsFields: Record<MaterialsMode, readonly string[]> = {
  rust: ["oxygen", "water", "outcome"],
  protection: ["mechanism", "outcome", "oxidises"],
  composition: ["basePercent", "baseMass", "otherMass"],
  alloy: ["size", "sliding", "bonding"],
  polymer: ["structure", "behaviour", "reason"],
  manufacture: ["rawOne", "rawTwo", "rawThree", "process"],
  composite: ["matrix", "reinforcement", "role"],
  selection: ["material", "property"],
};
export const materialsNumeric = ["basePercent", "baseMass", "otherMass"];
export const materialsLabels: Record<string, string> = {
  oxygen: "Oxygen reaches iron",
  water: "Water reaches iron",
  outcome: "Predicted iron outcome",
  mechanism: "Protection mechanism",
  oxidises: "Which metal oxidises preferentially?",
  basePercent: "Named base metal / %",
  baseMass: "Named base metal / g",
  otherMass: "Other components together / g",
  size: "Atom sizes",
  sliding: "Layer sliding compared with pure metal",
  bonding: "Metallic bonding",
  structure: "Shown chain structure",
  behaviour: "Predicted behaviour",
  reason: "Structural reason",
  rawOne: "First raw material",
  rawTwo: "Second raw material",
  rawThree: "Third raw material",
  process: "Manufacturing process",
  matrix: "Matrix or binder",
  reinforcement: "Reinforcement",
  role: "Role of matrix",
  material: "Chosen material",
  property: "Decisive supplied property",
  yes: "Yes",
  no: "No",
  rust: "Rusting expected",
  protected: "No rust expected",
  barrier: "Intact barrier",
  sacrificial: "Sacrificial protection",
  failed: "No effective protection",
  zinc: "Zinc",
  iron: "Iron",
  neither: "Neither",
  same: "Same-sized atoms",
  different: "Different-sized atoms",
  easy: "Relatively easy sliding",
  harder: "More difficult sliding",
  remains: "Metallic bonds remain",
  lost: "Bonding disappears",
  crosslinked: "Covalent crosslinks",
  separate: "Separate chains",
  branched: "More branched chains",
  linear: "More linear chains",
  melts: "Melts on heating",
  noMelts: "Does not melt",
  lowerDensity: "Lower density",
  higherDensity: "Higher density",
  between: "Overcome chain forces",
  crosslinks: "Crosslinks hold chains",
  poorPacking: "Less close packing",
  closePacking: "Closer packing",
  backbone: "Break backbone bonds",
  sand: "Sand",
  sodium: "Sodium carbonate",
  limestone: "Limestone",
  boron: "Boron trioxide",
  clay: "Wet clay",
  none: "No added ingredient",
  heatMix: "Heat ingredient mix",
  shapeFire: "Shape clay, then heat",
  galvanise: "Coat iron with zinc",
  cement: "Cement-based matrix",
  steel: "Steel bars",
  resin: "Polymer resin",
  glass: "Glass fibres",
  bind: "Bind reinforcement",
  replace: "Replace reinforcement",
  a: "Material A",
  b: "Material B",
  c: "Material C",
  heat: "Temperature suitable",
  impact: "Impact resistant",
  lightStrong: "Strength + density fit",
  colour: "Its colour alone",
};
export const materialsChoices: Record<string, readonly string[]> = {
  oxygen: ["yes", "no"],
  water: ["yes", "no"],
  outcome: ["rust", "protected"],
  mechanism: ["barrier", "sacrificial", "failed"],
  oxidises: ["zinc", "iron", "neither"],
  size: ["same", "different"],
  sliding: ["easy", "harder"],
  bonding: ["remains", "lost"],
  structure: ["separate", "crosslinked", "branched", "linear"],
  behaviour: ["melts", "noMelts", "lowerDensity", "higherDensity"],
  reason: ["between", "crosslinks", "poorPacking", "closePacking", "backbone"],
  rawOne: ["sand", "clay", "zinc"],
  rawTwo: ["sodium", "boron", "none"],
  rawThree: ["limestone", "none"],
  process: ["heatMix", "shapeFire", "galvanise"],
  matrix: ["cement", "resin", "steel", "glass"],
  reinforcement: ["steel", "glass", "resin", "cement"],
  role: ["bind", "replace"],
  material: ["a", "b", "c"],
  property: ["heat", "impact", "lightStrong", "colour"],
};
const rustNote =
  "Original schematic investigation: identical clean iron nails, same temperature and time. Predict from the stated availability of oxygen and water. No hands-on practical instructions.";
const protectionNote =
  "Wet, oxygenated conditions. Any remaining metal coating is in electrical contact with iron in the same corrosive environment. A small scratch exposes iron; sacrificial protection depends on reactive metal remaining.";
const compositionNote =
  "Original alloy exercise. Percentages are by mass; supplied components sum to the complete alloy. Calculate the named base metal and the remaining components.";
const polymerNote =
  "Qualitative chain sections, not measured molecular structures. Lines represent chains; joining lines in the crosslinked sample are covalent crosslinks. Heating to melting is distinguished from chemical decomposition.";
const record = (
  mode: MaterialsMode,
  title: string,
  note: string,
  rows: MaterialsGiven["rows"],
  expected: MaterialsBoard,
  feedback: string,
  extra: Partial<MaterialsGiven> = {},
): MaterialsRecord => ({
  mode,
  title,
  note,
  rows,
  expected,
  feedback,
  ...extra,
});
export const materialsRecords: Record<string, MaterialsRecord> = {
  wet: record(
    "rust",
    "Air and water",
    rustNote,
    [
      {
        label: "Arrangement",
        text: "Uncoated iron nail in water exposed to air.",
      },
    ],
    { oxygen: "yes", water: "yes", outcome: "rust" },
    "Both oxygen and water reach iron, so rusting is expected. Rust is hydrated iron(III) oxide; nitrogen alone is not the necessary gas.",
  ),
  dry: record(
    "rust",
    "Dry air control",
    rustNote,
    [
      {
        label: "Arrangement",
        text: "Iron in dry air; effective drying removes water.",
      },
    ],
    { oxygen: "yes", water: "no", outcome: "protected" },
    "Oxygen is present but water is absent: this control does not rust under the stated dry conditions. Oxygen alone is insufficient.",
  ),
  noOxygen: record(
    "rust",
    "Water without oxygen",
    rustNote,
    [
      {
        label: "Arrangement",
        text: "Iron in water from which dissolved oxygen has been removed; a barrier prevents oxygen returning.",
      },
    ],
    { oxygen: "no", water: "yes", outcome: "protected" },
    "Water is present but oxygen is excluded, so no rusting is expected. Ordinary water contains dissolved oxygen; simply covering untreated water would not prove oxygen absent.",
  ),
  paint: record(
    "protection",
    "Intact paint",
    protectionNote,
    [{ label: "Surface", text: "Continuous, intact paint covers the iron." }],
    { mechanism: "barrier", outcome: "protected", oxidises: "neither" },
    "Intact paint is a barrier preventing water and oxygen reaching iron. Paint is not a sacrificial metal.",
  ),
  scratchPaint: record(
    "protection",
    "Scratched paint",
    protectionNote,
    [{ label: "Surface", text: "Paint is scratched; iron is exposed." }],
    { mechanism: "failed", outcome: "rust", oxidises: "iron" },
    "At the scratch water and oxygen reach iron. Paint provides no sacrificial metal, so exposed iron can oxidise and rust.",
  ),
  zinc: record(
    "protection",
    "Scratched galvanised iron",
    protectionNote,
    [
      {
        label: "Surface",
        text: "Zinc coating is scratched; zinc remains touching the iron.",
      },
      { label: "Given reactivity", text: "Zinc is more reactive than iron." },
    ],
    { mechanism: "sacrificial", outcome: "protected", oxidises: "zinc" },
    "Remaining zinc oxidises preferentially because it is more reactive than iron. This sacrificial protection can continue at a small scratch; intact zinc also provides a barrier.",
  ),
  silver: record(
    "protection",
    "A less-reactive coating",
    protectionNote,
    [
      {
        label: "Surface",
        text: "Silver coating is scratched; iron is exposed.",
      },
      { label: "Given reactivity", text: "Silver is less reactive than iron." },
    ],
    { mechanism: "failed", outcome: "rust", oxidises: "iron" },
    "Silver is less reactive than iron and cannot protect it sacrificially. An intact silver coating can form a barrier, but the exposed iron at a scratch is not protected by a more-reactive metal.",
  ),
  spent: record(
    "protection",
    "Zinc has been consumed",
    protectionNote,
    [
      {
        label: "Surface",
        text: "No metallic zinc remains; wet oxygenated iron is exposed.",
      },
    ],
    { mechanism: "failed", outcome: "rust", oxidises: "iron" },
    "Sacrificial protection is finite: when the zinc is consumed, exposed iron can rust. The name galvanised does not guarantee indefinite protection.",
  ),
  gold18: record(
    "composition",
    "An 18 carat ring",
    compositionNote,
    [
      { label: "Named base metal", text: "Gold; 24 carat means pure gold." },
      {
        label: "Total alloy mass",
        text: "12 g; 18 carat gold, with silver/copper/zinc making up the remainder.",
      },
    ],
    { basePercent: "75", baseMass: "9", otherMass: "3" },
    "18/24 = 0.75: 75% gold. Gold mass = 0.75 × 12 = 9 g; other components total 3 g. Carat is purity, not the ring mass.",
    { carats: 18 },
  ),
  gold12: record(
    "composition",
    "A 12 carat pendant",
    compositionNote,
    [
      { label: "Named base metal", text: "Gold; 24 carat means pure gold." },
      {
        label: "Total alloy mass",
        text: "20 g; 12 carat gold and other metals.",
      },
    ],
    { basePercent: "50", baseMass: "10", otherMass: "10" },
    "12/24 = 0.5: 50% gold. The 20 g alloy has 10 g gold and 10 g other metals.",
    { carats: 12 },
  ),
  titanium: record(
    "composition",
    "A supplied titanium alloy",
    compositionNote,
    [
      {
        label: "Named base metal",
        text: "Titanium; the alloy contains only titanium, aluminium and vanadium.",
      },
      {
        label: "Composition and total",
        text: "6% aluminium, 4% vanadium; total alloy mass 200 g.",
      },
    ],
    { basePercent: "90", baseMass: "180", otherMass: "20" },
    "Titanium is 100 − 6 − 4 = 90%. Its mass is 180 g; the other metals total 20 g. Use the whole alloy as the percentage denominator.",
  ),
  pure: record(
    "alloy",
    "Pure metal layers",
    "Idealised metallic sections. Shaping is layer movement, not melting; real alloys have varied structures and properties.",
    [
      {
        label: "Sample",
        text: "Pure metal: equal-sized atoms in regular layers.",
      },
    ],
    { size: "same", sliding: "easy", bonding: "remains" },
    "Regular layers can slide relatively easily. Metallic attraction to delocalised electrons remains as the pure metal changes shape.",
    { diagram: "pure" },
  ),
  mixed: record(
    "alloy",
    "An alloy disrupts the layers",
    "Idealised metallic sections. Added atoms have different sizes; this explains hardness qualitatively, not every alloy property.",
    [{ label: "Sample", text: "Alloy containing different-sized atoms." }],
    { size: "different", sliding: "harder", bonding: "remains" },
    "Different-sized atoms distort the regular layers, making sliding more difficult. Metallic bonding remains; the alloy is not automatically an electrical insulator.",
    { diagram: "alloy" },
  ),
  soft: record(
    "polymer",
    "Separate polymer chains",
    polymerNote,
    [
      {
        label: "Comparison",
        text: "Predict heating behaviour for the shown chains.",
      },
    ],
    { structure: "separate", behaviour: "melts", reason: "between" },
    "Thermosoftening polymers melt when attractions between separate chains are overcome. Strong covalent bonds within each chain remain intact in this physical change.",
    { diagram: "soft" },
  ),
  set: record(
    "polymer",
    "Covalently crosslinked chains",
    polymerNote,
    [
      {
        label: "Comparison",
        text: "Predict heating behaviour for the shown network.",
      },
    ],
    { structure: "crosslinked", behaviour: "noMelts", reason: "crosslinks" },
    "Thermosetting polymers have covalent crosslinks between chains, preventing separation to melt. Strong heating may decompose them; does not melt does not mean indestructible.",
    { diagram: "set" },
  ),
  ld: record(
    "polymer",
    "Branched poly(ethene)",
    polymerNote,
    [
      {
        label: "Comparison",
        text: "Both samples come from ethene under different manufacturing conditions. Compare this more-branched sample with a more-linear sample.",
      },
    ],
    { structure: "branched", behaviour: "lowerDensity", reason: "poorPacking" },
    "More branching prevents close packing and gives lower-density poly(ethene). Changing manufacturing conditions changes structure; both LD and HD poly(ethene) come from addition polymerisation of ethene and are thermosoftening.",
    { diagram: "branched" },
  ),
  hd: record(
    "polymer",
    "More-linear poly(ethene)",
    polymerNote,
    [
      {
        label: "Comparison",
        text: "Both samples come from ethene under different manufacturing conditions. Compare this more-linear sample with a more-branched sample.",
      },
    ],
    { structure: "linear", behaviour: "higherDensity", reason: "closePacking" },
    "More-linear chains pack more closely, giving higher-density poly(ethene). This is not covalent crosslinking or a change to a different monomer.",
    { diagram: "linear" },
  ),
  soda: record(
    "manufacture",
    "Make soda-lime glass",
    "Use the GCSE ingredient recipes; shaping/heating are industrial explanations, not an unsupervised experiment.",
    [
      {
        label: "Product",
        text: "Soda-lime glass, the most common everyday glass.",
      },
    ],
    {
      rawOne: "sand",
      rawTwo: "sodium",
      rawThree: "limestone",
      process: "heatMix",
    },
    "Heat sand, sodium carbonate and limestone together to make soda-lime glass. Clay shaping produces a different ceramic.",
  ),
  boro: record(
    "manufacture",
    "Make borosilicate glass",
    "Use the GCSE ingredient recipes. Compare recipes rather than inferring that every glass has the same composition.",
    [
      {
        label: "Product",
        text: "Borosilicate glass; higher melting temperature than soda-lime glass.",
      },
    ],
    { rawOne: "sand", rawTwo: "boron", rawThree: "none", process: "heatMix" },
    "The GCSE borosilicate recipe uses sand and boron trioxide. It melts at a higher temperature than soda-lime glass; do not replace boron trioxide with sodium carbonate/limestone.",
  ),
  clay: record(
    "manufacture",
    "Make a clay ceramic",
    "Manufacture pottery or a brick. The order of the physical shaping and heating stages matters.",
    [{ label: "Product", text: "A shaped clay ceramic." }],
    { rawOne: "clay", rawTwo: "none", rawThree: "none", process: "shapeFire" },
    "Shape wet clay first, then heat it in a furnace. Galvanising is coating iron with zinc, not making a ceramic.",
  ),
  concrete: record(
    "composite",
    "Reinforced concrete",
    "Composite schematic: components retain distinguishable roles. This is not an atomic alloy or a molecular formula.",
    [
      {
        label: "Components",
        text: "Steel bars surrounded by a cement-based concrete matrix.",
      },
    ],
    { matrix: "cement", reinforcement: "steel", role: "bind" },
    "The cement-based matrix surrounds/binds the steel reinforcement. Concrete performs well under compression; steel reinforcement helps resist tensile loading.",
    { diagram: "concrete" },
  ),
  fibre: record(
    "composite",
    "Glass-fibre reinforced polymer",
    "Composite schematic: a polymer resin binds glass fibres; properties depend on the components and their arrangement.",
    [{ label: "Components", text: "Glass fibres embedded in polymer resin." }],
    { matrix: "resin", reinforcement: "glass", role: "bind" },
    "Polymer resin is the matrix/binder surrounding glass-fibre reinforcement. The combined material can be strong and relatively light; glass fibres alone are not the binder.",
    { diagram: "fibre" },
  ),
  hot: record(
    "selection",
    "Choose a heated container",
    "Original simplified selection dataset; not universal certified material limits. Require a container suitable at 200 °C. Ignore colour.",
    undefined,
    { material: "a", property: "heat" },
    "Only A meets the supplied temperature requirement: B begins melting at 150 °C and C at 80 °C. Toughness alone does not make a polymer suitable for this heated use.",
    {
      table: {
        caption: "Supplied container data",
        head: ["Material", "Melting / °C", "Impact"],
        rows: [
          ["A: glass", "700", "Shatters"],
          ["B: polymer", "150", "Tough"],
          ["C: polymer", "80", "Tough"],
        ],
      },
    },
  ),
  cold: record(
    "selection",
    "Choose a cold impact-resistant container",
    "Original simplified selection dataset. Require a tough container at 20 °C; maximum operating temperatures are supplied. A higher heat limit is not the priority.",
    undefined,
    { material: "b", property: "impact" },
    "B is tough and suitable at 20 °C. A shatters; C is not suitable at 20 °C. A more expensive tough container may need fewer replacements.",
    {
      table: {
        caption: "Supplied container data",
        head: ["Material", "Maximum / °C", "Impact"],
        rows: [
          ["A: glass", "500", "Shatters"],
          ["B: polymer", "100", "Tough"],
          ["C: polymer", "10", "Tough"],
        ],
      },
    },
  ),
  light: record(
    "selection",
    "Choose a light structural panel",
    "Original simplified comparable samples. Require strength at least 300 MPa and density at most 3 g/cm³. Both constraints must be met. For mass comparisons, mass = density × volume; g/cm³ × cm³ gives g.",
    undefined,
    { material: "c", property: "lightStrong" },
    "C meets both constraints: 400 MPa and 2 g/cm³. A is strong but too dense; B is light but too weak. One favourable property is insufficient.",
    {
      table: {
        caption: "Supplied panel properties",
        head: ["Material", "Strength / MPa", "Density / g/cm³"],
        rows: [
          ["A: steel", "500", "8"],
          ["B: polymer", "50", "1"],
          ["C: composite", "400", "2"],
        ],
      },
    },
  ),
};
export function materialsRecord(mode: MaterialsMode, key: string) {
  return Object.hasOwn(materialsRecords, key) &&
    materialsRecords[key].mode === mode
    ? materialsRecords[key]
    : null;
}
export function initialMaterials(
  mode: MaterialsMode,
  record: string,
): MaterialsBoard {
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(materialsFields[mode].map((f) => [f, ""])),
  };
}
export function materialsNumber(s: string) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
export function validMaterials(
  mode: MaterialsMode,
  v: unknown,
  record?: string,
): v is MaterialsBoard {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.getPrototypeOf(v) !== Object.prototype
  )
    return false;
  const b = v as MaterialsBoard,
    fs = materialsFields[mode];
  return (
    !!fs &&
    b.version === "1" &&
    b.mode === mode &&
    !!materialsRecord(mode, b.record) &&
    (record === undefined || b.record === record) &&
    Object.keys(b).length === fs.length + 3 &&
    fs.every(
      (f) =>
        typeof b[f] === "string" &&
        (!b[f] ||
          (materialsNumeric.includes(f)
            ? b[f].length <= 16
            : materialsChoices[f]?.includes(b[f]))),
    )
  );
}
export function validMaterialsHistory(
  mode: MaterialsMode,
  record: string,
  h: unknown,
): h is MaterialsBoard[] {
  if (
    !Array.isArray(h) ||
    h.length < 1 ||
    h.length > 500 ||
    !h.every((b) => validMaterials(mode, b, record))
  )
    return false;
  const first = initialMaterials(mode, record);
  return (
    Object.keys(first).every((k) => h[0][k] === first[k]) &&
    h.every(
      (b, i) =>
        i === 0 ||
        materialsFields[mode].filter((f) => b[f] !== h[i - 1][f]).length === 1,
    )
  );
}
export function checkMaterials(mode: MaterialsMode, b: MaterialsBoard) {
  if (!validMaterials(mode, b))
    return {
      correct: false,
      message: "Saved materials proposal is unreadable; raw entries retained.",
    };
  const r = materialsRecord(mode, b.record)!,
    fs = materialsFields[mode];
  if (fs.some((f) => !b[f]))
    return {
      correct: false,
      message: "Complete each part. Blank entries remain unknown.",
    };
  const wrong = fs.filter((f) =>
    materialsNumeric.includes(f)
      ? materialsNumber(b[f]) === null ||
        Math.abs(materialsNumber(b[f])! - Number(r.expected[f])) > 1e-6
      : b[f] !== r.expected[f],
  );
  return {
    correct: !wrong.length,
    message:
      (wrong.length
        ? "Reconsider " +
          wrong.map((f) => materialsLabels[f].toLowerCase()).join(" and ") +
          ". "
        : "") +
      r.feedback +
      (wrong.length ? " Your proposal remains as entered." : ""),
  };
}
