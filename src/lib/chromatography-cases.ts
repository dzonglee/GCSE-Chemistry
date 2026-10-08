/** Original lesson-80 source records. These are supplied observations, not simulated measurements. */
export type SetupSource = {
  id: string;
  title: string;
  paperBottom: number;
  paperTop: number;
  origin: number;
  suppliedLevel: number;
  suppliedLine: "pencil" | "ink";
  note: string;
};
export type PhaseSource = {
  id: string;
  title: string;
  support: string;
  stationary: string;
  mobile: string;
  note: string;
};
export type MeasurementSource = {
  id: string;
  title: string;
  origin: number;
  spot: number;
  front: number | null;
  radius: number;
  spotDistance: number;
  frontDistance: number | null;
  note: string;
};
export type RatioSource = {
  id: string;
  title: string;
  kind: "forward" | "inverse" | "front" | "mixed" | "invalid";
  spot: number | null;
  front: number | null;
  rf: number | null;
  spotUnit: "mm" | "cm";
  frontUnit: "mm" | "cm";
  answer: string;
  conclusion: "consistent" | "inconsistent";
  rounding?: { kind: "significant-figures"; digits: number };
  note: string;
};
export type AffinitySource = {
  id: string;
  title: string;
  a: number;
  b: number;
  conditions: string;
  moreStationaryRetention: "A" | "B" | "insufficient";
  greaterRelativeTravel: "A" | "B";
  note: string;
};
export type InterpretationSource = {
  id: string;
  title: string;
  origin: number;
  front: number;
  lanes: readonly {
    label: string;
    positions: readonly number[];
    colour: string;
  }[];
  composition: "pure" | "mixture" | "insufficient";
  matches: string;
  minimumComponents: number | null;
  givenNote: string;
  note: string;
};
export type ConditionsSource = {
  id: string;
  title: string;
  observations: string;
  choice: string;
  conclusion: string;
  newRf?: string;
  note: string;
};

const setup: readonly SetupSource[] = [
  {
    id: "immersed",
    title: "A submerged starting sample",
    paperBottom: 2,
    paperTop: 110,
    origin: 18,
    suppliedLevel: 24,
    suppliedLine: "pencil",
    note: "The original sample is below the reservoir surface. Propose a level contacting the paper bottom while remaining strictly below the fixed origin.",
  },
  {
    id: "ink-line",
    title: "The baseline introduces another soluble ink",
    paperBottom: 2,
    paperTop: 120,
    origin: 20,
    suppliedLevel: 10,
    suppliedLine: "ink",
    note: "The supplied baseline ink is soluble in this solvent. Propose pencil without changing the original sample identity.",
  },
  {
    id: "dry-paper",
    title: "The paper does not reach the reservoir",
    paperBottom: 14,
    paperTop: 120,
    origin: 30,
    suppliedLevel: 8,
    suppliedLine: "pencil",
    note: "For this task keep the paper fixed and adjust only the solvent. Lowering the paper would be another possible practical correction, but is not the requested proposal.",
  },
  {
    id: "touching-origin",
    title: "Solvent reaches the sample origin",
    paperBottom: 2,
    paperTop: 100,
    origin: 16,
    suppliedLevel: 16,
    suppliedLine: "pencil",
    note: "A sample at the liquid level can dissolve into the reservoir. Equality does not leave the sample above the liquid.",
  },
  {
    id: "two-errors",
    title: "Both baseline and liquid level need attention",
    paperBottom: 3,
    paperTop: 120,
    origin: 25,
    suppliedLevel: 30,
    suppliedLine: "ink",
    note: "The supplied ink baseline is soluble and the sample is immersed. Keep the original paper and origin fixed while proposing both corrections.",
  },
  {
    id: "valid-gap",
    title: "A supplied arrangement with a valid gap",
    paperBottom: 3,
    paperTop: 100,
    origin: 15,
    suppliedLevel: 8,
    suppliedLine: "pencil",
    note: "The paper reaches the liquid and the sample is above it. More liquid is not automatically an improvement.",
  },
];
const phases: readonly PhaseSource[] = [
  {
    id: "paper-water",
    title: "Paper with water",
    support: "Chromatography paper",
    stationary: "paper",
    mobile: "water",
    note: "Use the GCSE paper/stationary-phase description. The sample is carried by the moving solvent; it is not itself the mobile phase.",
  },
  {
    id: "paper-ethanol",
    title: "Paper with ethanol",
    support: "Chromatography paper",
    stationary: "paper",
    mobile: "ethanol",
    note: "Changing the solvent does not make the paper move.",
  },
  {
    id: "paper-saline",
    title: "Paper with an aqueous salt solvent",
    support: "Chromatography paper",
    stationary: "paper",
    mobile: "saltSolution",
    note: "The liquid mobile phase can be a solution, rather than chemically pure water.",
  },
  {
    id: "silica-plate",
    title: "A supplied silica-coated plate",
    support: "Glass supporting a stationary silica coating",
    stationary: "silica",
    mobile: "ethanol",
    note: "This is a supplied transfer example, not an added mandatory named TLC technique. The coating is stationary; the glass is its support.",
  },
  {
    id: "alumina-plate",
    title: "A supplied alumina-coated plate",
    support: "Glass supporting a stationary alumina coating",
    stationary: "alumina",
    mobile: "ethylEthanoate",
    note: "The supplied ethyl ethanoate solvent moves across the stationary coating. Use the given solvent and separating-layer names.",
  },
];
const measurement: readonly MeasurementSource[] = [
  {
    id: "shifted-origin",
    title: "A ruler must start at the origin",
    origin: 10,
    spot: 58,
    front: 90,
    radius: 3,
    spotDistance: 48,
    frontDistance: 80,
    note: "All coordinates are millimetres above the paper bottom. The required distances start at 10 mm, not at the bottom edge.",
  },
  {
    id: "second-origin",
    title: "A different origin position",
    origin: 15,
    spot: 45,
    front: 75,
    radius: 2,
    spotDistance: 30,
    frontDistance: 60,
    note: "Move the ruler zero to the original 15 mm origin; subtracting the two endpoint readings is another valid measurement method.",
  },
  {
    id: "spot-centre",
    title: "A broad spot still has one measured centre",
    origin: 12,
    spot: 60,
    front: 92,
    radius: 4,
    spotDistance: 48,
    frontDistance: 80,
    note: "The spot extends from 56 to 64 mm. Use its supplied centre at 60 mm, not either edge.",
  },
  {
    id: "origin-zero",
    title: "Origin already at the coordinate zero",
    origin: 0,
    spot: 35,
    front: 70,
    radius: 2,
    spotDistance: 35,
    frontDistance: 70,
    note: "This record has its origin at the supplied scale zero. Do not add an offset that is not present.",
  },
  {
    id: "high-origin",
    title: "High coordinates are not travel distances",
    origin: 20,
    spot: 86,
    front: 100,
    radius: 3,
    spotDistance: 66,
    frontDistance: 80,
    note: "86 mm is the spot coordinate; its 66 mm travel is measured from the 20 mm origin.",
  },
  {
    id: "missing-front",
    title: "The solvent front was not recorded",
    origin: 10,
    spot: 46,
    front: null,
    radius: 3,
    spotDistance: 36,
    frontDistance: null,
    note: "The spot distance can still be measured. A solvent travel distance and Rf cannot be recovered by guessing the paper top.",
  },
];
const ratio: readonly RatioSource[] = [
  {
    id: "forward",
    title: "Two distances from the same origin",
    kind: "forward",
    spot: 28,
    front: 80,
    rf: null,
    spotUnit: "mm",
    frontUnit: "mm",
    answer: "0.35",
    conclusion: "consistent",
    note: "28 ÷ 80 = 0.35. Equal distance units cancel; Rf has no length unit.",
  },
  {
    id: "inverse",
    title: "Predict a centre from a supplied Rf",
    kind: "inverse",
    spot: null,
    front: 80,
    rf: 0.575,
    spotUnit: "mm",
    frontUnit: "mm",
    answer: "46",
    conclusion: "consistent",
    note: "0.575 × 80 = 46 mm. This is a requested positional proposal, not an observed experimental outcome.",
  },
  {
    id: "find-front",
    title: "Infer solvent travel from two given quantities",
    kind: "front",
    spot: 45,
    front: null,
    rf: 0.75,
    spotUnit: "mm",
    frontUnit: "mm",
    answer: "60",
    conclusion: "consistent",
    note: "45 ÷ 0.75 = 60 mm. Do not multiply 45 by 0.75 to find the denominator.",
  },
  {
    id: "mixed-units",
    title: "Millimetres and centimetres must agree",
    kind: "mixed",
    spot: 30,
    front: 6,
    rf: null,
    spotUnit: "mm",
    frontUnit: "cm",
    answer: "0.5",
    conclusion: "consistent",
    note: "6 cm = 60 mm; 30 ÷ 60 = 0.5. Dividing 30 by 6 without conversion gives a different quantity.",
  },
  {
    id: "two-sf",
    title: "A repeating ratio needs stated rounding",
    kind: "forward",
    spot: 3,
    front: 7,
    rf: null,
    spotUnit: "cm",
    frontUnit: "cm",
    answer: "0.43",
    conclusion: "consistent",
    rounding: { kind: "significant-figures", digits: 2 },
    note: "3 ÷ 7 = 0.428571…; to two significant figures the answer is 0.43. Required precision is part of the task.",
  },
  {
    id: "zero",
    title: "A source spot remains at its origin",
    kind: "forward",
    spot: 0,
    front: 75,
    rf: null,
    spotUnit: "mm",
    frontUnit: "mm",
    answer: "0",
    conclusion: "consistent",
    note: "0 ÷ 75 = 0. The record alone does not uniquely distinguish insolubility from strong stationary retention.",
  },
  {
    id: "at-front",
    title: "A supplied centre coincides with the front",
    kind: "forward",
    spot: 80,
    front: 80,
    rf: null,
    spotUnit: "mm",
    frontUnit: "mm",
    answer: "1",
    conclusion: "consistent",
    note: "80 ÷ 80 = 1. This supplied ideal endpoint is within the inclusive 0–1 range.",
  },
  {
    id: "past-front",
    title: "A written record contradicts a normal chromatogram",
    kind: "invalid",
    spot: 88,
    front: 80,
    rf: null,
    spotUnit: "mm",
    frontUnit: "mm",
    answer: "1.1",
    conclusion: "inconsistent",
    note: "The arithmetic ratio is 1.1, but the recorded centre is beyond its own solvent front. Diagnose the measurements or labels; do not silently clamp 88 to 80 or call 1.1 a valid normal Rf.",
  },
];
const affinity: readonly AffinitySource[] = [
  {
    id: "paper-a",
    title: "The same dye on two papers",
    a: 0.4,
    b: 0.45,
    conditions:
      "Same dye, dilute loading, solvent and temperature; only paper type changes.",
    moreStationaryRetention: "A",
    greaterRelativeTravel: "B",
    note: "The lower Rf on A supports greater attraction to A and more time distributed in that stationary phase, within the stated comparison.",
  },
  {
    id: "paper-b",
    title: "A different dye is retained more on paper B",
    a: 0.7,
    b: 0.3,
    conditions:
      "Same dye, dilute loading, solvent and temperature; only paper type changes.",
    moreStationaryRetention: "B",
    greaterRelativeTravel: "A",
    note: "B gives less travel relative to the same solvent front. The direction of the evidence, not the paper letter, determines the inference.",
  },
  {
    id: "two-solutes",
    title: "Two supplied solutes on the same paper",
    a: 0.2,
    b: 0.8,
    conditions:
      "Same stationary phase, solvent, temperature and dilute loading; the records show two solutes.",
    moreStationaryRetention: "A",
    greaterRelativeTravel: "B",
    note: "Use relative retention under these conditions. The record does not establish absolute interaction strengths independent of the mobile phase.",
  },
  {
    id: "confounded",
    title: "Both solvent and paper changed",
    a: 0.3,
    b: 0.7,
    conditions:
      "The same dye was run on paper A in water and on paper B in ethanol.",
    moreStationaryRetention: "insufficient",
    greaterRelativeTravel: "B",
    note: "The greater measured relative travel can be read, but its cause cannot be attributed to paper alone because the solvent changed too.",
  },
  {
    id: "time-comparison",
    title: "A supplied distribution-time comparison",
    a: 0.25,
    b: 0.75,
    conditions:
      "Same front distance and conditions; soluteA spends a greater proportion of time stationary than soluteB.",
    moreStationaryRetention: "A",
    greaterRelativeTravel: "B",
    note: "Greater stationary residence is consistent with smaller relative travel. These are supplied observations, not a numerical equilibrium simulation.",
  },
];
const interpretation: readonly InterpretationSource[] = [
  {
    id: "known-mixture",
    title: "Two resolved components with known candidates",
    origin: 10,
    front: 110,
    lanes: [
      { label: "Unknown", positions: [30, 70], colour: "purple" },
      { label: "P", positions: [30], colour: "purple" },
      { label: "Q", positions: [70], colour: "purple" },
      { label: "R", positions: [50], colour: "purple" },
    ],
    composition: "mixture",
    matches: "P+Q",
    minimumComponents: 2,
    givenNote:
      "All supplied candidates are detectable and resolved. The reference list supplies candidates; it is not a complete inventory of every possible chemical substance.",
    note: "Same paper, solvent and conditions. All supplied candidates are detectable and resolved. The unknown matches P and Q among these candidates; arbitrary unique identification is not established.",
  },
  {
    id: "known-pure",
    title: "A complete one-compound inventory",
    origin: 10,
    front: 110,
    lanes: [
      { label: "Sample Q", positions: [70], colour: "blue" },
      { label: "Q reference", positions: [70], colour: "blue" },
    ],
    composition: "pure",
    matches: "Q",
    minimumComponents: 1,
    givenNote:
      "The supplied sample inventory states that only compound Q is present, soluble and detectable.",
    note: "The source explicitly states that only compound Q is present and detectable. Its one spot is consistent with that complete inventory; it is not the sole proof.",
  },
  {
    id: "one-unresolved",
    title: "One spot with two co-eluting references",
    origin: 10,
    front: 110,
    lanes: [
      { label: "Unknown", positions: [60], colour: "blue" },
      { label: "A", positions: [60], colour: "blue" },
      { label: "B", positions: [60], colour: "blue" },
    ],
    composition: "insufficient",
    matches: "A-or-B-or-both",
    minimumComponents: 1,
    givenNote:
      "Both reference compounds are supplied as detectable and soluble. The unknown composition is not supplied.",
    note: "A and B have the same Rf here. One observed spot does not distinguish A, B or their unresolved mixture; another suitable solvent can help.",
  },
  {
    id: "three-resolved",
    title: "Three distinct spots from an uncontaminated sample",
    origin: 10,
    front: 110,
    lanes: [{ label: "Sample", positions: [20, 40, 90], colour: "purple" }],
    composition: "mixture",
    matches: "no-reference",
    minimumComponents: 3,
    givenNote:
      "The supplied sample is uncontaminated and the shown spots are resolved. No complete inventory of other overlapping or undetected components is supplied.",
    note: "Three resolved spots support at least three detected components under the supplied uncontaminated conditions. Co-elution can hide more; absent references cannot name them.",
  },
  {
    id: "no-travel",
    title: "A visible origin spot without further travel",
    origin: 10,
    front: 110,
    lanes: [{ label: "Unknown", positions: [10], colour: "blue" }],
    composition: "insufficient",
    matches: "no-reference",
    minimumComponents: 1,
    givenNote:
      "The visible sample remains at the supplied origin. Its composition and cause of this observation are not supplied.",
    note: "A substance is visible, but this result alone does not establish purity or a unique cause of zero travel. Insolubility or strong retention are possible.",
  },
  {
    id: "same-colour",
    title: "Matching colour with different Rf",
    origin: 10,
    front: 110,
    lanes: [
      { label: "Unknown pink", positions: [40], colour: "pink" },
      { label: "Reference pink", positions: [80], colour: "pink" },
    ],
    composition: "insufficient",
    matches: "not-this-reference",
    minimumComponents: 1,
    givenNote:
      "The unknown and reference have the same observed pink colour. Their supplied centre coordinates remain unchanged.",
    note: "Same paper, solvent and conditions, but 0.30 differs from 0.70. Colour alone does not support the proposed match or establish complete composition.",
  },
  {
    id: "unnamed-second",
    title: "A match and an unmatched component",
    origin: 10,
    front: 110,
    lanes: [
      { label: "Unknown", positions: [30, 80], colour: "purple" },
      { label: "P", positions: [30], colour: "purple" },
      { label: "Q", positions: [70], colour: "purple" },
    ],
    composition: "mixture",
    matches: "P+unidentified",
    minimumComponents: 2,
    givenNote:
      "The supplied sample is uncontaminated and the shown spots are resolved. P and Q are supplied reference candidates, rather than an exhaustive inventory of possible substances.",
    note: "The lower spot matches P under the same conditions; the other spot has no matching supplied reference. Do not force it to be Q.",
  },
];
const conditions: readonly ConditionsSource[] = [
  {
    id: "resolve-solvent",
    title: "Choose a supplied solvent that resolves two dyes",
    observations:
      "On the same paper: solvent S1 gives A = 0.40, B = 0.40; solvent S2 gives A = 0.20, B = 0.70.",
    choice: "S2",
    conclusion: "resolved",
    note: "The supplied S2 observations separate the two candidates. Separation is based on the observed different relative travel, not on solvent naming.",
  },
  {
    id: "different-solvents",
    title: "Equal Rf in different solvents",
    observations:
      "Unknown: 0.50 in water. Reference: 0.50 in ethanol. Paper and temperature are the same.",
    choice: "insufficient",
    conclusion: "not-comparable",
    note: "The solvent conditions differ. Equal numbers are not a valid same-condition identification comparison.",
  },
  {
    id: "different-papers",
    title: "Equal Rf on different stationary phases",
    observations:
      "Unknown: 0.50 on paper A. Reference: 0.50 on paper B. Solvent and temperature are the same.",
    choice: "insufficient",
    conclusion: "not-comparable",
    note: "Changing paper can change stationary attraction and Rf. The reference conditions must match.",
  },
  {
    id: "different-amounts",
    title: "Dye proportions change under otherwise identical conditions",
    observations:
      "The yellow dye initially has Rf = 0.60. The same dilute yellow and blue dyes change from 85:15 to 75:25 by mass. Paper, solvent and temperature stay the same; loading remains below overload.",
    choice: "unchanged",
    conclusion: "same-relative-travel",
    newRf: "0.60",
    note: "The yellow dye previously had Rf = 0.60. Its proportion does not change that value in this stated controlled dilute comparison; spot strength may differ.",
  },
  {
    id: "longer-run",
    title: "Distances increase in the same proportion",
    observations:
      "Same dye and conditions: first spot 30 mm/front 50 mm; second spot 60 mm/front 100 mm.",
    choice: "unchanged",
    conclusion: "same-relative-travel",
    newRf: "0.60",
    note: "Both ratios are 0.60. Larger absolute travel does not require a larger Rf.",
  },
  {
    id: "insoluble-water",
    title: "A supplied solvent change mobilises an ink",
    observations:
      "The source states that ink T is insoluble in water and stays at the origin. On the same paper in ethanol it is soluble and has Rf = 0.40.",
    choice: "ethanol",
    conclusion: "mobile-in-chosen-solvent",
    note: "These are supplied properties and measurements. Do not infer that all zero-travel samples are insoluble or that ethanol works for every ink.",
  },
];
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
export const chromatographyCases = freeze({
  setup,
  phases,
  measurement,
  ratio,
  affinity,
  interpretation,
  conditions,
});
export type ChromatographyMode = keyof typeof chromatographyCases;
export type ChromatographyCase =
  (typeof chromatographyCases)[ChromatographyMode][number];
