export type IonMode =
  "flame" | "hydroxide" | "anion" | "fault" | "equation" | "compound";
export type IonBoard = Record<string, string>;
export type IonRecord = {
  mode: IonMode;
  title: string;
  given: string;
  observations?: { label: string; text: string }[];
  expected: Record<string, string>;
  feedback: string;
  metal?: { symbol: string; charge: number };
};
export const ionFields: Record<IonMode, readonly string[]> = {
  flame: ["observation", "cation", "claim"],
  hydroxide: ["observation", "excess", "cation"],
  anion: ["portion", "acid", "reagent", "observation", "anion"],
  fault: ["problem", "correction", "claim"],
  equation: ["metal", "hydroxide", "product"],
  compound: ["cation", "anion", "formula"],
};
export const ionLabels: Record<string, string> = {
  lithium: "Lithium ions, Li⁺",
  sodium: "Sodium ions, Na⁺",
  potassium: "Potassium ions, K⁺",
  calcium: "Calcium ions, Ca²⁺",
  copper: "Copper(II) ions, Cu²⁺",
  magnesium: "Magnesium ions, Mg²⁺",
  aluminium: "Aluminium ions, Al³⁺",
  ironII: "Iron(II) ions, Fe²⁺",
  ironIII: "Iron(III) ions, Fe³⁺",
  whiteGroup: "Aluminium, calcium or magnesium — not yet distinguished",
  calciumMagnesium: "Calcium or magnesium — not yet distinguished",
  unresolved: "Cannot identify from this record",
  crimson: "Crimson flame",
  yellowFlame: "Yellow flame",
  lilac: "Lilac flame",
  orangeRed: "Orange-red flame",
  greenFlame: "Green flame",
  blueSolid: "Blue precipitate",
  greenSolid: "Green precipitate",
  brownSolid: "Brown precipitate",
  whiteSolid: "White precipitate",
  creamSolid: "Cream precipitate",
  yellowSolid: "Yellow precipitate",
  bubbles: "Effervescence only",
  cloudyGas: "Effervescence; the gas makes limewater cloudy",
  noChange: "No visible change",
  dissolves: "The precipitate dissolves in excess sodium hydroxide",
  remains: "The precipitate remains in excess sodium hydroxide",
  notRecorded: "Excess-reagent result is not recorded",
  present:
    "The identified ion is present; this alone does not establish purity",
  single: "Identify the cation within the supplied single-cation set",
  pure: "The whole sample must contain only this ion",
  noAbsence: "The masked colour cannot establish absence",
  invalid: "The original test cannot support that identification",
  fresh: "A fresh separate portion of the original sample",
  reused: "The portion already treated with another test reagent",
  nitric: "Dilute nitric acid",
  hydrochloric: "Dilute hydrochloric acid",
  sulfuric: "Dilute sulfuric acid",
  noAcid: "No acidification",
  silver: "Silver nitrate solution after acidification",
  barium: "Barium chloride solution after acidification",
  limewater: "Test the gas with fresh limewater",
  water: "Test the gas with pure water",
  hydroxideSolution: "Sodium hydroxide solution",
  chloride: "Chloride ions, Cl⁻",
  bromide: "Bromide ions, Br⁻",
  iodide: "Iodide ions, I⁻",
  sulfate: "Sulfate ions, SO₄²⁻",
  carbonate: "Carbonate ions, CO₃²⁻",
  anionUnknown: "The anion is not identified",
  dirtyWire: "Sodium contamination may mask another flame colour",
  chlorideAdded: "The acid introduces chloride ions",
  sulfateAdded: "The acid introduces sulfate ions",
  missingExcess: "A white precipitate is shared by several cations",
  missingGasTest: "Bubbles alone do not identify carbon dioxide",
  sharedPortion: "Previous reagents can contaminate the later test",
  colourOnly: "Colour naming without the correct reagent is insufficient",
  cleanCompare:
    "Repeat the school test with a clean wire and compare known references",
  useNitric: "Use dilute nitric acid on a fresh portion before silver nitrate",
  useHCl:
    "Use dilute hydrochloric acid on a fresh portion before barium chloride",
  testExcess: "Obtain the excess-sodium-hydroxide result",
  confirmGas: "Obtain the gas result with limewater",
  separate: "Use separate fresh portions for the different tests",
  guess: "Assign an ion from the colour without correcting the method",
  KBr: "Potassium bromide, KBr",
  NaCl: "Sodium chloride, NaCl",
  CaCl2: "Calcium chloride, CaCl₂",
  CuSO4: "Copper(II) sulfate, CuSO₄",
  K2SO4: "Potassium sulfate, K₂SO₄",
  Na2CO3: "Sodium carbonate, Na₂CO₃",
  KSO4: "KSO₄ — proposed formula",
  CaCl: "CaCl — proposed formula",
  unknownFormula: "Not enough evidence to name one compound",
};
const cations = [
  "lithium",
  "sodium",
  "potassium",
  "calcium",
  "copper",
  "magnesium",
  "aluminium",
  "ironII",
  "ironIII",
  "whiteGroup",
  "calciumMagnesium",
  "unresolved",
];
const observations = [
  "crimson",
  "yellowFlame",
  "lilac",
  "orangeRed",
  "greenFlame",
  "blueSolid",
  "greenSolid",
  "brownSolid",
  "whiteSolid",
  "creamSolid",
  "yellowSolid",
  "bubbles",
  "cloudyGas",
  "noChange",
];
export const ionChoices: Record<string, readonly string[]> = {
  observation: observations,
  cation: cations,
  claim: ["single", "present", "pure", "noAbsence", "invalid"],
  excess: ["dissolves", "remains", "notRecorded"],
  portion: ["fresh", "reused"],
  acid: ["nitric", "hydrochloric", "sulfuric", "noAcid"],
  reagent: ["silver", "barium", "limewater", "water", "hydroxideSolution"],
  anion: [
    "chloride",
    "bromide",
    "iodide",
    "sulfate",
    "carbonate",
    "anionUnknown",
  ],
  problem: [
    "dirtyWire",
    "chlorideAdded",
    "sulfateAdded",
    "missingExcess",
    "missingGasTest",
    "sharedPortion",
    "colourOnly",
  ],
  correction: [
    "cleanCompare",
    "useNitric",
    "useHCl",
    "testExcess",
    "confirmGas",
    "separate",
    "guess",
  ],
  formula: [
    "KBr",
    "NaCl",
    "CaCl2",
    "CuSO4",
    "K2SO4",
    "Na2CO3",
    "KSO4",
    "CaCl",
    "unknownFormula",
  ],
  metal: ["0", "1", "2", "3", "4", "6"],
  hydroxide: ["0", "1", "2", "3", "4", "6"],
  product: ["0", "1", "2", "3", "4", "6"],
};
// Each source is authored separately. Original observations are never calculated
// from a student's choice or replaced by an expected answer.
export const ionRecords: Record<string, IonRecord> = {
  "flame-k": {
    mode: "flame",
    title: "A lilac flame",
    given: "Single-cation clean-wire test: Li⁺, Na⁺, K⁺, Ca²⁺ or Cu²⁺.",
    observations: [{ label: "Recorded flame", text: "Lilac" }],
    expected: { observation: "lilac", cation: "potassium", claim: "single" },
    feedback:
      "A lilac flame identifies potassium within this single-cation set. The sample itself is not described as a lilac solution.",
  },
  "flame-li": {
    mode: "flame",
    title: "A crimson flame",
    given:
      "Clean-wire test; one cation from the five specified flame-test cations.",
    observations: [{ label: "Recorded flame", text: "Crimson" }],
    expected: { observation: "crimson", cation: "lithium", claim: "single" },
    feedback:
      "Lithium gives crimson; calcium gives orange-red. Compare the named observations, not an unlabelled screen colour.",
  },
  "flame-na": {
    mode: "flame",
    title: "A yellow flame",
    given: "Clean-wire test of a supplied single-cation sample.",
    observations: [{ label: "Recorded flame", text: "Yellow" }],
    expected: { observation: "yellowFlame", cation: "sodium", claim: "single" },
    feedback:
      "A yellow flame supports sodium in this controlled single-cation record. In a mixture, sodium may mask another flame colour.",
  },
  "flame-ca": {
    mode: "flame",
    title: "An orange-red flame",
    given: "Clean-wire test of a supplied single-cation sample.",
    observations: [{ label: "Recorded flame", text: "Orange-red" }],
    expected: { observation: "orangeRed", cation: "calcium", claim: "single" },
    feedback:
      "AQA names the calcium flame orange-red, distinct from lithium crimson.",
  },
  "flame-cu": {
    mode: "flame",
    title: "A green flame",
    given: "Clean-wire test of a supplied single-cation sample.",
    observations: [{ label: "Recorded flame", text: "Green" }],
    expected: { observation: "greenFlame", cation: "copper", claim: "single" },
    feedback:
      "Copper compounds give a green flame. A blue copper(II) hydroxide precipitate is a different test observation.",
  },
  "flame-mixture": {
    mode: "flame",
    title: "A mixture's yellow flame",
    given:
      "A clean wire carries a mixture. Only a strong yellow flame is recorded.",
    observations: [
      { label: "Recorded flame", text: "Yellow; no other colour resolved" },
    ],
    expected: {
      observation: "yellowFlame",
      cation: "sodium",
      claim: "present",
    },
    feedback:
      "Sodium is present. Its intense flame can mask other ions, so the result establishes neither purity nor absence of potassium.",
  },
  "oh-al": {
    mode: "hydroxide",
    title: "A precipitate that dissolves",
    given:
      "One cation from Al³⁺, Ca²⁺, Mg²⁺, Cu²⁺, Fe²⁺ or Fe³⁺; sodium hydroxide added.",
    observations: [
      { label: "A few drops", text: "White precipitate" },
      { label: "Excess sodium hydroxide", text: "Precipitate dissolves" },
    ],
    expected: {
      observation: "whiteSolid",
      excess: "dissolves",
      cation: "aluminium",
    },
    feedback:
      "Among these cations, only aluminium's white hydroxide precipitate dissolves in excess sodium hydroxide. The solid dissolving is not the gas test or a disappearance of all matter.",
  },
  "oh-white": {
    mode: "hydroxide",
    title: "An incomplete white result",
    given: "One cation from Al³⁺, Ca²⁺ or Mg²⁺; sodium hydroxide added.",
    observations: [
      { label: "A few drops", text: "White precipitate" },
      { label: "Excess sodium hydroxide", text: "Not tested" },
    ],
    expected: {
      observation: "whiteSolid",
      excess: "notRecorded",
      cation: "whiteGroup",
    },
    feedback:
      "White alone leaves aluminium, calcium and magnesium possible. Do not invent an excess-reagent result.",
  },
  "oh-camg": {
    mode: "hydroxide",
    title: "Two candidates remain",
    given: "One cation from Al³⁺, Ca²⁺ or Mg²⁺; sodium hydroxide added.",
    observations: [
      { label: "A few drops", text: "White precipitate" },
      { label: "Excess sodium hydroxide", text: "Precipitate remains" },
    ],
    expected: {
      observation: "whiteSolid",
      excess: "remains",
      cation: "calciumMagnesium",
    },
    feedback:
      "This rules out aluminium within the stated set, but does not distinguish calcium from magnesium. Further evidence is needed.",
  },
  "oh-cu": {
    mode: "hydroxide",
    title: "Copper's solid",
    given: "One of the six specified hydroxide-test cations.",
    observations: [
      { label: "A few drops of sodium hydroxide", text: "Blue precipitate" },
      { label: "Excess sodium hydroxide", text: "Precipitate remains" },
    ],
    expected: { observation: "blueSolid", excess: "remains", cation: "copper" },
    feedback:
      "Copper(II) hydroxide is a blue insoluble solid. Name the precipitate, not a blue gas or flame.",
  },
  "oh-fe2": {
    mode: "hydroxide",
    title: "Iron(II)'s solid",
    given:
      "Freshly recorded immediate result; one of the six specified cations.",
    observations: [
      { label: "A few drops of sodium hydroxide", text: "Green precipitate" },
      { label: "Excess sodium hydroxide", text: "Precipitate remains" },
    ],
    expected: {
      observation: "greenSolid",
      excess: "remains",
      cation: "ironII",
    },
    feedback:
      "The immediate green hydroxide precipitate supports iron(II). A brown precipitate is the specified iron(III) result.",
  },
  "oh-fe3": {
    mode: "hydroxide",
    title: "Iron(III)'s solid",
    given: "One of the six specified hydroxide-test cations.",
    observations: [
      { label: "A few drops of sodium hydroxide", text: "Brown precipitate" },
      { label: "Excess sodium hydroxide", text: "Precipitate remains" },
    ],
    expected: {
      observation: "brownSolid",
      excess: "remains",
      cation: "ironIII",
    },
    feedback:
      "Iron(III) gives a brown hydroxide precipitate; distinguish its 3+ charge from iron(II)'s 2+.",
  },
  "anion-cl": {
    mode: "anion",
    title: "Plan the chloride test",
    given:
      "School technician's proposed chloride test on an aqueous sample. Choose a separate portion, ordered reagents and positive result.",
    expected: {
      portion: "fresh",
      acid: "nitric",
      reagent: "silver",
      observation: "whiteSolid",
      anion: "chloride",
    },
    feedback:
      "Use a fresh portion: dilute nitric acid, then silver nitrate solution. White silver chloride is the positive precipitate. Hydrochloric acid would introduce chloride.",
  },
  "anion-br": {
    mode: "anion",
    title: "Plan the bromide test",
    given:
      "School technician's proposed bromide test on an aqueous sample. Choose a separate portion and the ordered test chain.",
    expected: {
      portion: "fresh",
      acid: "nitric",
      reagent: "silver",
      observation: "creamSolid",
      anion: "bromide",
    },
    feedback:
      "Dilute nitric acid precedes silver nitrate; a cream silver bromide precipitate supports bromide. Compare the three slight colour differences side by side.",
  },
  "anion-i": {
    mode: "anion",
    title: "Plan the iodide test",
    given: "School technician's proposed iodide test on an aqueous sample.",
    expected: {
      portion: "fresh",
      acid: "nitric",
      reagent: "silver",
      observation: "yellowSolid",
      anion: "iodide",
    },
    feedback:
      "Dilute nitric acid then silver nitrate produces a yellow silver iodide precipitate. Yellow sodium flame is a different observation.",
  },
  "anion-so4": {
    mode: "anion",
    title: "Plan the sulfate test",
    given: "School technician's proposed sulfate test on an aqueous sample.",
    expected: {
      portion: "fresh",
      acid: "hydrochloric",
      reagent: "barium",
      observation: "whiteSolid",
      anion: "sulfate",
    },
    feedback:
      "Use dilute hydrochloric acid, then barium chloride on a fresh portion. White barium sulfate supports sulfate. Sulfuric acid would introduce the ion being tested.",
  },
  "anion-co3": {
    mode: "anion",
    title: "Confirm carbonate",
    given:
      "The school technician's proposed carbonate test uses dilute hydrochloric acid. Include the identifying test on the evolved gas.",
    expected: {
      portion: "fresh",
      acid: "hydrochloric",
      reagent: "limewater",
      observation: "cloudyGas",
      anion: "carbonate",
    },
    feedback:
      "Dilute acid causes effervescence; the evolved carbon dioxide makes limewater cloudy. Bubbles alone do not identify the gas. This school plan uses dilute hydrochloric acid; other suitable dilute acids can react with carbonates.",
  },
  "fault-wire": {
    mode: "fault",
    title: "A contaminated wire",
    given:
      "A wire was not cleaned after a sodium sample. The next nominal potassium sample gives a strong yellow flame.",
    expected: {
      problem: "dirtyWire",
      correction: "cleanCompare",
      claim: "invalid",
    },
    feedback:
      "The earlier sodium may contaminate or mask the next result. Correct the method and compare known references; do not conclude the next sample is pure sodium or lacks potassium.",
  },
  "fault-hcl": {
    mode: "fault",
    title: "An acid introduces chloride",
    given:
      "An unknown was acidified with hydrochloric acid before silver nitrate. A white precipitate appeared.",
    expected: {
      problem: "chlorideAdded",
      correction: "useNitric",
      claim: "invalid",
    },
    feedback:
      "The acid itself supplies chloride. This white precipitate cannot establish original sample chloride. A fresh portion with dilute nitric acid avoids introducing chloride.",
  },
  "fault-h2so4": {
    mode: "fault",
    title: "An acid introduces sulfate",
    given:
      "An unknown was acidified with sulfuric acid before barium chloride. A white precipitate appeared.",
    expected: {
      problem: "sulfateAdded",
      correction: "useHCl",
      claim: "invalid",
    },
    feedback:
      "Sulfuric acid supplies sulfate; the result cannot establish sulfate originally in the sample. Use a fresh portion and the specified hydrochloric acid/barium chloride chain.",
  },
  "fault-white": {
    mode: "fault",
    title: "An overconfident white result",
    given:
      "After sodium hydroxide, a white precipitate formed. No excess-reagent result was recorded. A student names aluminium.",
    expected: {
      problem: "missingExcess",
      correction: "testExcess",
      claim: "invalid",
    },
    feedback:
      "Several cations produce white precipitates. Obtain the excess result; dissolution supports aluminium within this six-cation GCSE set.",
  },
  "fault-bubbles": {
    mode: "fault",
    title: "Bubbles without gas identification",
    given:
      "An unknown effervesced with dilute acid. The gas was not tested. A student writes 'carbonate confirmed'.",
    expected: {
      problem: "missingGasTest",
      correction: "confirmGas",
      claim: "invalid",
    },
    feedback:
      "Effervescence is an observation, but the gas still needs identifying. Cloudy limewater confirms the carbon dioxide supporting carbonate in this context.",
  },
  "fault-portion": {
    mode: "fault",
    title: "A reused test portion",
    given:
      "A hydrochloric-acid/barium-chloride portion was reused for the silver-nitrate test. A white precipitate appeared.",
    expected: {
      problem: "sharedPortion",
      correction: "separate",
      claim: "invalid",
    },
    feedback:
      "The earlier reagents contain chloride and contaminate the later halide test. Use independent fresh portions of the original sample.",
  },
  "eq-cu": {
    mode: "equation",
    title: "Copper hydroxide equation",
    given:
      "Balance the ionic equation in its smallest positive whole-number ratio. Keep the species and state symbols fixed.",
    metal: { symbol: "Cu", charge: 2 },
    expected: { metal: "1", hydroxide: "2", product: "1" },
    feedback:
      "Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s): one copper, two oxygen, two hydrogen and zero net charge on both sides.",
  },
  "eq-fe2": {
    mode: "equation",
    title: "Iron(II) hydroxide equation",
    given:
      "Balance the fixed ionic species in the smallest positive whole-number ratio.",
    metal: { symbol: "Fe", charge: 2 },
    expected: { metal: "1", hydroxide: "2", product: "1" },
    feedback:
      "Fe²⁺(aq) + 2OH⁻(aq) → Fe(OH)₂(s). The iron ion is 2+, requiring two hydroxide ions.",
  },
  "eq-fe3": {
    mode: "equation",
    title: "Iron(III) hydroxide equation",
    given:
      "Balance the fixed ionic species in the smallest positive whole-number ratio.",
    metal: { symbol: "Fe", charge: 3 },
    expected: { metal: "1", hydroxide: "3", product: "1" },
    feedback:
      "Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s). Two hydroxide ions would leave both atoms and charge unbalanced.",
  },
  "eq-al": {
    mode: "equation",
    title: "Aluminium hydroxide formation",
    given:
      "Balance initial precipitate formation, not its later dissolution in excess sodium hydroxide.",
    metal: { symbol: "Al", charge: 3 },
    expected: { metal: "1", hydroxide: "3", product: "1" },
    feedback:
      "Al³⁺(aq) + 3OH⁻(aq) → Al(OH)₃(s). An equation for sodium aluminate formation is not required by these AQA points.",
  },
  "eq-mg": {
    mode: "equation",
    title: "Magnesium hydroxide equation",
    given:
      "Balance the fixed ionic species in the smallest positive whole-number ratio.",
    metal: { symbol: "Mg", charge: 2 },
    expected: { metal: "1", hydroxide: "2", product: "1" },
    feedback:
      "Mg²⁺(aq) + 2OH⁻(aq) → Mg(OH)₂(s). The precipitate is solid; the original ions are aqueous.",
  },
  "eq-ca": {
    mode: "equation",
    title: "Calcium hydroxide equation",
    given:
      "Balance the specified precipitate formation equation using smallest positive whole-number coefficients.",
    metal: { symbol: "Ca", charge: 2 },
    expected: { metal: "1", hydroxide: "2", product: "1" },
    feedback:
      "Ca²⁺(aq) + 2OH⁻(aq) → Ca(OH)₂(s). This models the supplied precipitation conditions, not unlimited insolubility at every concentration.",
  },
  "salt-kbr": {
    mode: "compound",
    title: "Two independent portions",
    given:
      "A supplied single ionic compound. Independent fresh portions gave the records below.",
    observations: [
      { label: "Clean-wire flame", text: "Lilac" },
      {
        label: "Dilute nitric acid, then silver nitrate",
        text: "Cream precipitate",
      },
    ],
    expected: { cation: "potassium", anion: "bromide", formula: "KBr" },
    feedback:
      "The flame supports K⁺; the specified precipitate supports Br⁻. Their charges give KBr. One test alone does not identify both ions.",
  },
  "salt-cacl2": {
    mode: "compound",
    title: "Calcium chloride evidence",
    given: "A supplied single ionic compound; independent fresh portions.",
    observations: [
      { label: "Clean-wire flame", text: "Orange-red" },
      {
        label: "Dilute nitric acid, then silver nitrate",
        text: "White precipitate",
      },
    ],
    expected: { cation: "calcium", anion: "chloride", formula: "CaCl2" },
    feedback:
      "Ca²⁺ and Cl⁻ require two chloride ions per calcium ion: CaCl₂. Sodium hydroxide's white precipitate alone would not have separated calcium from magnesium.",
  },
  "salt-cuso4": {
    mode: "compound",
    title: "Copper sulfate evidence",
    given: "A supplied single ionic compound; independent fresh portions.",
    observations: [
      { label: "Sodium hydroxide", text: "Blue precipitate" },
      {
        label: "Dilute hydrochloric acid, then barium chloride",
        text: "White precipitate",
      },
    ],
    expected: { cation: "copper", anion: "sulfate", formula: "CuSO4" },
    feedback:
      "The blue hydroxide supports Cu²⁺; barium sulfate supports SO₄²⁻. Equal opposite charges give CuSO₄.",
  },
  "salt-k2so4": {
    mode: "compound",
    title: "Potassium sulfate evidence",
    given: "A supplied single ionic compound; independent fresh portions.",
    observations: [
      { label: "Clean-wire flame", text: "Lilac" },
      {
        label: "Dilute hydrochloric acid, then barium chloride",
        text: "White precipitate",
      },
    ],
    expected: { cation: "potassium", anion: "sulfate", formula: "K2SO4" },
    feedback:
      "K⁺ and SO₄²⁻ require K₂SO₄, not KSO₄. Both recorded methods and results support this single-salt inference.",
  },
  "salt-na2co3": {
    mode: "compound",
    title: "Sodium carbonate evidence",
    given: "A supplied single ionic compound; independent fresh portions.",
    observations: [
      { label: "Clean-wire flame", text: "Yellow" },
      {
        label: "Dilute acid and evolved-gas test",
        text: "Effervescence; gas makes limewater cloudy",
      },
    ],
    expected: { cation: "sodium", anion: "carbonate", formula: "Na2CO3" },
    feedback:
      "Na⁺ plus CO₃²⁻ gives Na₂CO₃. Carbon dioxide was confirmed, rather than inferred from bubbles alone.",
  },
  "salt-incomplete": {
    mode: "compound",
    title: "The anion is still unknown",
    given:
      "A supplied single ionic compound. Only a clean-wire orange-red flame result is available; no anion test was recorded.",
    observations: [{ label: "Clean-wire flame", text: "Orange-red" }],
    expected: {
      cation: "calcium",
      anion: "anionUnknown",
      formula: "unknownFormula",
    },
    feedback:
      "The flame identifies the calcium cation in this context. It supplies no chloride, sulfate or carbonate evidence, so the compound remains unnamed.",
  },
};
function freeze(value: unknown) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
}
freeze(ionRecords);
freeze(ionFields);
freeze(ionChoices);
freeze(ionLabels);
export function ionRecord(mode: IonMode, record: string) {
  const r = ionRecords[record];
  return r?.mode === mode ? r : undefined;
}
export function initialIon(mode: IonMode, record: string): IonBoard {
  if (!ionRecord(mode, record)) throw Error("Unknown ion-test record");
  return {
    version: "1",
    mode,
    record,
    ...Object.fromEntries(ionFields[mode].map((f) => [f, ""])),
  };
}
export function validIon(
  mode: IonMode,
  value: unknown,
  record?: string,
): value is IonBoard {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return false;
  const b = value as IonBoard,
    fields = ionFields[mode];
  return (
    !!fields &&
    b.version === "1" &&
    b.mode === mode &&
    !!ionRecord(mode, b.record) &&
    (record === undefined || record === b.record) &&
    Object.keys(b).length === fields.length + 3 &&
    fields.every(
      (f) =>
        typeof b[f] === "string" &&
        (b[f] === "" || ionChoices[f].includes(b[f])),
    )
  );
}
export function validIonHistory(
  mode: IonMode,
  record: string,
  history: unknown,
): history is IonBoard[] {
  if (
    !Array.isArray(history) ||
    history.length < 1 ||
    history.length > 500 ||
    !history.every((b) => validIon(mode, b, record))
  )
    return false;
  const start = initialIon(mode, record);
  return (
    Object.keys(start).every((k) => history[0][k] === start[k]) &&
    history.every(
      (b, i) =>
        i === 0 ||
        ionFields[mode].filter((f) => b[f] !== history[i - 1][f]).length === 1,
    )
  );
}
export function checkIon(mode: IonMode, b: IonBoard) {
  if (!validIon(mode, b))
    return {
      correct: false,
      message:
        "This retained proposal is unreadable; its values have not been repaired.",
    };
  const r = ionRecord(mode, b.record)!;
  if (ionFields[mode].some((f) => !b[f]))
    return {
      correct: false,
      message:
        "Complete each part of your proposal before checking. Unchosen fields remain unknown.",
    };
  const wrong = ionFields[mode].filter((f) => b[f] !== r.expected[f]);
  return {
    correct: wrong.length === 0,
    message: wrong.length
      ? `Reconsider ${wrong.map((f) => ionFieldLabels[f]).join("; ")}. Your choices and the original record are retained. ${r.feedback}`
      : r.feedback,
  };
}
export const ionFieldLabels: Record<string, string> = {
  observation: "Observation",
  cation: "Cation supported",
  claim: "Limit of the conclusion",
  excess: "Excess sodium hydroxide",
  portion: "Sample portion",
  acid: "First: acid",
  reagent: "Then: test reagent or gas test",
  anion: "Anion supported",
  problem: "Problem with the original test",
  correction: "Method correction",
  formula: "Compound identity",
  metal: "Coefficient of metal ion",
  hydroxide: "Coefficient of hydroxide ion",
  product: "Coefficient of solid product",
};
export function ionLedger(b: IonBoard) {
  const r = ionRecord("equation", b.record);
  if (!r?.metal) throw Error("No equation record");
  const m = b.metal === "" ? null : Number(b.metal),
    h = b.hydroxide === "" ? null : Number(b.hydroxide),
    p = b.product === "" ? null : Number(b.product),
    z = r.metal.charge;
  return {
    metalLeft: m,
    metalRight: p,
    oxygenLeft: h,
    oxygenRight: p === null ? null : p * z,
    hydrogenLeft: h,
    hydrogenRight: p === null ? null : p * z,
    chargeLeft: m === null || h === null ? null : m * z - h,
    chargeRight: p === null ? null : 0,
  };
}
