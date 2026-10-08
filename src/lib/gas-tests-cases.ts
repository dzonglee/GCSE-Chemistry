/** Individually authored original school records, recovered into persistent workspace. */
export type GasMode =
  | "procedure"
  | "observation"
  | "identification"
  | "comparison"
  | "faults"
  | "evidence"
  | "wording";
export type GasRecord = {
  id: string;
  title: string;
  given: string;
  expected: Record<string, string>;
  note: string;
  originalMaterial?: string;
  originalPlacement?: string;
  frames?: readonly { stage: string; text: string }[];
  pair?: readonly { label: string; method: string; result: string }[];
  suppliedAnswer?: string;
};
const procedure: readonly GasRecord[] = [
  {
    id: "hydrogen-mouth",
    title: "Choose a hydrogen test",
    given: "Collected sample; hydrogen test.",
    expected: { material: "burningSplint", placement: "mouth" },
    note: "Hold a burning splint at the open end of the test tube. A pop is the positive observation, not an apparatus choice.",
  },
  {
    id: "oxygen-insert",
    title: "Choose an oxygen test",
    given:
      "A school experiment has collected a sample for an oxygen test. Choose the splint’s starting state and position.",
    expected: { material: "glowingSplint", placement: "inside" },
    note: "Insert a glowing splint. Relighting is the positive observation. Starting with a visible flame does not demonstrate that a glowing splint relit.",
  },
  {
    id: "co2-delivery",
    title: "Make the gas contact the reagent",
    given:
      "The delivery tube ends above clear limewater. Propose a bubbling arrangement for a carbon dioxide test.",
    originalMaterial: "limewater",
    originalPlacement: "aboveLiquid",
    expected: { material: "limewater", placement: "belowLiquid" },
    note: "The outlet must be below the limewater surface so gas passes through the reagent. Shaking a collected sample with limewater is another valid method, but is not the bubbling arrangement asked for.",
  },
  {
    id: "chlorine-damp",
    title: "Prepare the litmus test",
    given:
      "Dry blue litmus is available. Propose the paper condition and contact needed to test a collected sample for chlorine.",
    originalMaterial: "dryBlueLitmus",
    originalPlacement: "gasContact",
    expected: { material: "dampBlueLitmus", placement: "gasContact" },
    note: "Use damp litmus in contact with the gas. Bleaching white is the identifying change in this GCSE test; red alone is insufficient.",
  },
  {
    id: "hydrogen-glowing-error",
    title: "Correct the splint state",
    given:
      "A proposed hydrogen test uses a glowing splint at the tube mouth. Retain the correct position and correct the starting state.",
    originalMaterial: "glowingSplint",
    originalPlacement: "mouth",
    expected: { material: "burningSplint", placement: "mouth" },
    note: "The hydrogen test needs a burning splint. A glowing splint is used for oxygen.",
  },
  {
    id: "oxygen-unlit-error",
    title: "An unlit splint is not a glowing one",
    given:
      "A proposed oxygen test inserts a cold unlit splint into the sample. Correct the proposal.",
    originalMaterial: "unlitSplint",
    originalPlacement: "inside",
    expected: { material: "glowingSplint", placement: "inside" },
    note: "A glowing splint retains a hot glowing end. Oxygen supports combustion; it does not ordinarily ignite cold wood by itself.",
  },
];
const observation: readonly GasRecord[] = [
  {
    id: "pop-record",
    title: "What did the observer hear?",
    given: "A burning splint was held at the open end of a collected sample.",
    frames: [
      { stage: "Before", text: "The splint has a small flame." },
      { stage: "During", text: "A short pop is heard at the tube opening." },
      { stage: "After", text: "The brief sound has ended." },
    ],
    expected: { observation: "pop", gas: "hydrogen" },
    note: "A pop is the observation. Hydrogen is the identification supported by the test and observation.",
  },
  {
    id: "relight-record",
    title: "What changed at the splint?",
    given: "A glowing splint was inserted into a collected sample.",
    frames: [
      { stage: "Before", text: "The end glows; there is no visible flame." },
      { stage: "During", text: "A visible flame appears on the splint." },
      { stage: "After", text: "The splint is burning." },
    ],
    expected: { observation: "relights", gas: "oxygen" },
    note: "The initially glowing splint relights. Oxygen supports burning; it is not the burning fuel.",
  },
  {
    id: "cloudy-record",
    title: "Where did the appearance change?",
    given: "The sample was bubbled through fresh limewater.",
    frames: [
      { stage: "Before", text: "The limewater is clear and colourless." },
      {
        stage: "During",
        text: "Bubbles pass through the liquid; white cloudiness develops.",
      },
      { stage: "After", text: "The limewater is milky." },
    ],
    expected: { observation: "limewaterCloudy", gas: "carbonDioxide" },
    note: "The limewater becomes milky/cloudy. Bubbles alone show gas delivery, not gas identity.",
  },
  {
    id: "bleach-record",
    title: "Read the complete litmus sequence",
    given: "Damp blue litmus was held in contact with the collected sample.",
    frames: [
      { stage: "Before", text: "The damp paper is blue." },
      { stage: "During", text: "The paper first becomes red." },
      {
        stage: "After",
        text: "The coloured region becomes white: the litmus is bleached.",
      },
    ],
    expected: { observation: "litmusBleached", gas: "chlorine" },
    note: "Bleaching is the identifying observation here. Stopping at red misses the decisive part of the record.",
  },
  {
    id: "shaken-limewater",
    title: "A second valid limewater method",
    given:
      "Fresh limewater was shaken with a collected sample in a school experiment.",
    frames: [
      { stage: "Before", text: "The limewater is clear." },
      {
        stage: "During",
        text: "The sample and limewater are shaken together.",
      },
      {
        stage: "After",
        text: "The limewater is cloudy, with a white precipitate.",
      },
    ],
    expected: { observation: "limewaterCloudy", gas: "carbonDioxide" },
    note: "AQA permits shaking or bubbling. The positive result belongs to the limewater, not a white gas.",
  },
];
const identification: readonly GasRecord[] = [
  {
    id: "unknown-pop",
    title: "Sample K",
    given:
      "K contains one of hydrogen, oxygen, carbon dioxide or chlorine. A burning splint at its tube mouth gives a pop.",
    expected: {
      material: "burningSplint",
      result: "pop",
      gas: "hydrogen",
      claim: "singleGas",
    },
    note: "Within the stated single-gas set, the burning-splint pop identifies hydrogen.",
  },
  {
    id: "unknown-relight",
    title: "Sample M",
    given:
      "M contains one of hydrogen, oxygen, carbon dioxide or chlorine. A glowing splint inserted into it relights.",
    expected: {
      material: "glowingSplint",
      result: "relights",
      gas: "oxygen",
      claim: "singleGas",
    },
    note: "Relighting of the initially glowing splint identifies oxygen in the stated set.",
  },
  {
    id: "unknown-limewater",
    title: "Sample R",
    given:
      "R contains one of hydrogen, oxygen, carbon dioxide or chlorine. Bubbling it through fresh limewater makes the limewater milky.",
    expected: {
      material: "limewater",
      result: "limewaterCloudy",
      gas: "carbonDioxide",
      claim: "singleGas",
    },
    note: "The reagent and change identify carbon dioxide in the stated four-gas problem.",
  },
  {
    id: "unknown-bleaching",
    title: "Sample T",
    given:
      "T contains one of hydrogen, oxygen, carbon dioxide or chlorine. It bleaches damp litmus white.",
    expected: {
      material: "dampBlueLitmus",
      result: "litmusBleached",
      gas: "chlorine",
      claim: "singleGas",
    },
    note: "Bleaching damp litmus identifies chlorine within the stated set.",
  },
  {
    id: "exhaust-mixture",
    title: "A gas mixture from combustion",
    given:
      "The sample is a mixture of gases. Fresh limewater becomes cloudy when the sample is bubbled through it. What does the positive test support?",
    expected: {
      material: "limewater",
      result: "limewaterCloudy",
      gas: "carbonDioxide",
      claim: "present",
    },
    note: "Carbon dioxide is present. The test does not show that the whole mixture is pure carbon dioxide.",
  },
  {
    id: "electrolysis-sample",
    title: "Identify from the record",
    given:
      "A collected school electrolysis sample U is tested. A burning splint at its open end gives a pop. Identify it from this record within the hydrogen/oxygen/chlorine candidate set.",
    expected: {
      material: "burningSplint",
      result: "pop",
      gas: "hydrogen",
      claim: "singleGas",
    },
    note: "Use the pop observation, not a guessed electrode or an unspecified solution.",
  },
];
const comparison: readonly GasRecord[] = [
  {
    id: "damp-versus-dry",
    title: "Two pieces of litmus",
    given:
      "The same known chlorine sample contacts otherwise comparable blue litmus strips. These are supplied school observations.",
    pair: [
      {
        label: "A",
        method: "Dry blue litmus contacts the gas.",
        result: "No visible change during the test.",
      },
      {
        label: "B",
        method: "Damp blue litmus contacts the gas.",
        result: "The paper becomes red, then is bleached white.",
      },
    ],
    expected: { difference: "dampness", usefulRecord: "B" },
    note: "The decisive method difference is dampness. The dry-paper result does not demonstrate that chlorine is absent.",
  },
  {
    id: "glowing-versus-cold",
    title: "Two splints in oxygen",
    given:
      "The same known oxygen sample is tested with two splints. Both are inserted into the sample.",
    pair: [
      {
        label: "A",
        method: "The splint initially has a glowing end.",
        result: "It relights.",
      },
      {
        label: "B",
        method: "The splint is initially cold and unlit.",
        result: "No flame appears.",
      },
    ],
    expected: { difference: "splintState", usefulRecord: "A" },
    note: "The oxygen test starts with a glowing splint. Cold wood need not ignite merely because oxygen is present.",
  },
  {
    id: "limewater-versus-water",
    title: "Two receiving liquids",
    given:
      "Equal portions of a known carbon dioxide sample are bubbled through two clear liquids with comparable delivery arrangements.",
    pair: [
      {
        label: "A",
        method: "The receiving liquid is pure water.",
        result: "Bubbles pass through; it stays clear.",
      },
      {
        label: "B",
        method: "The receiving liquid is fresh limewater.",
        result: "The limewater becomes cloudy.",
      },
    ],
    expected: { difference: "reagent", usefulRecord: "B" },
    note: "Bubbling through water does not perform the limewater identification test.",
  },
  {
    id: "outlet-position",
    title: "Does the gas reach the liquid?",
    given:
      "A known carbon dioxide sample is delivered to two tubes of fresh limewater. Only the outlet position differs.",
    pair: [
      {
        label: "A",
        method: "The outlet ends above the surface.",
        result:
          "No bubbles pass through; the liquid remains clear in the recorded interval.",
      },
      {
        label: "B",
        method: "The outlet ends below the surface.",
        result: "Bubbles pass through; the limewater becomes milky.",
      },
    ],
    expected: { difference: "contact", usefulRecord: "B" },
    note: "The above-liquid arrangement has not performed the requested bubbling test. Clear limewater there does not rule out CO2.",
  },
  {
    id: "shake-or-bubble",
    title: "Two valid contact methods",
    given:
      "Two portions of the same known carbon dioxide sample contact fresh limewater in these school records.",
    pair: [
      {
        label: "A",
        method: "Limewater is shaken with the collected gas.",
        result: "The limewater becomes cloudy.",
      },
      {
        label: "B",
        method: "The gas is bubbled through limewater.",
        result: "The limewater becomes milky.",
      },
    ],
    expected: { difference: "contactMethod", usefulRecord: "both" },
    note: "Both methods are included in AQA. Milky and cloudy describe the positive limewater observation here.",
  },
];
const faults: readonly GasRecord[] = [
  {
    id: "dry-litmus-negative",
    title: "An unchanged dry strip",
    given:
      "A chlorine test uses dry blue litmus in contact with the sample. The strip stays blue during the recorded interval.",
    expected: {
      limitation: "dryPaper",
      correction: "dampenPaper",
      ruledOut: "no",
    },
    note: "The specified test needs damp litmus. This invalid negative cannot rule out chlorine.",
  },
  {
    id: "above-limewater-negative",
    title: "Clear limewater without bubbling",
    given:
      "A CO2 test keeps the delivery outlet above fresh limewater. No bubbles pass through the liquid; it stays clear.",
    expected: {
      limitation: "noLiquidContact",
      correction: "submergeOutlet",
      ruledOut: "no",
    },
    note: "The sample has not been bubbled through limewater. Correct contact before interpreting a negative result.",
  },
  {
    id: "water-negative",
    title: "The wrong clear liquid",
    given:
      "A CO2 test bubbles the sample through pure water. The water remains clear.",
    expected: {
      limitation: "wrongReagent",
      correction: "useLimewater",
      ruledOut: "no",
    },
    note: "Water is not limewater. Use aqueous calcium hydroxide for the identification test.",
  },
  {
    id: "cold-splint-negative",
    title: "An unchanged cold splint",
    given: "An oxygen test inserts a cold unlit splint. It does not ignite.",
    expected: {
      limitation: "wrongSplintState",
      correction: "useGlowingSplint",
      ruledOut: "no",
    },
    note: "The oxygen test asks whether a glowing splint relights. A cold splint not igniting does not rule out oxygen.",
  },
  {
    id: "escaped-sample",
    title: "Was a sample still there?",
    given:
      "The collecting tube is left open until the sample has escaped. A burning splint is then brought to its mouth; no pop is recorded.",
    expected: {
      limitation: "lostSample",
      correction: "testFreshCollectedSample",
      ruledOut: "no",
    },
    note: "The record explicitly states that the collected sample was lost. The result cannot identify the original sample as lacking hydrogen.",
  },
  {
    id: "red-only-record",
    title: "A record stopped too early",
    given:
      "Damp blue litmus contacts the sample, but recording stops as soon as it becomes red. Later appearance is not recorded.",
    expected: {
      limitation: "missingBleachingObservation",
      correction: "recordCompleteLitmusChange",
      ruledOut: "no",
    },
    note: "Red shows an acidic response, not uniquely chlorine. With no later bleaching observation, this record cannot decide whether chlorine is absent.",
  },
];
const evidence: readonly GasRecord[] = [
  {
    id: "hydrogen-chain",
    title: "Build the hydrogen evidence",
    given:
      "A burning splint at the mouth of sample A gives a pop. A contains one of the four core gases.",
    expected: {
      material: "burningSplint",
      placement: "mouth",
      result: "pop",
      conclusion: "hydrogenSingleGas",
    },
    note: "Keep the burning-splint method, pop observation and hydrogen identification in the same chain.",
  },
  {
    id: "oxygen-chain",
    title: "Build the oxygen evidence",
    given:
      "A glowing splint inserted into sample B relights. B contains one of the four core gases.",
    expected: {
      material: "glowingSplint",
      placement: "inside",
      result: "relights",
      conclusion: "oxygenSingleGas",
    },
    note: "The initial glow and subsequent flame are essential. Oxygen supports the splint’s combustion.",
  },
  {
    id: "co2-chain",
    title: "Build the carbon dioxide evidence",
    given:
      "C is one of the four core gases. Bubbling it through fresh limewater makes the liquid cloudy.",
    expected: {
      material: "limewater",
      placement: "belowLiquid",
      result: "limewaterCloudy",
      conclusion: "carbonDioxideSingleGas",
    },
    note: "Limewater is the reagent, cloudiness is the observation, carbon dioxide is the identification.",
  },
  {
    id: "chlorine-chain",
    title: "Build the chlorine evidence",
    given:
      "D is one of the four core gases. Damp litmus in contact with D is bleached white.",
    expected: {
      material: "dampBlueLitmus",
      placement: "gasContact",
      result: "litmusBleached",
      conclusion: "chlorineSingleGas",
    },
    note: "Bleaching damp litmus, not red alone, completes the chlorine identification chain.",
  },
  {
    id: "mixture-chain",
    title: "A claim limited by the sample",
    given:
      "A mixed gas sample is bubbled through fresh limewater, which becomes milky. No tests of the other components are recorded.",
    expected: {
      material: "limewater",
      placement: "belowLiquid",
      result: "limewaterCloudy",
      conclusion: "carbonDioxidePresent",
    },
    note: "Carbon dioxide is present. The record does not support a pure-CO2 claim.",
  },
];
const wording: readonly GasRecord[] = [
  {
    id: "splint-unspecified",
    title: "State the starting condition",
    given: "Describe the test for oxygen and its positive result.",
    suppliedAnswer: "Put a splint in the gas. It burns.",
    expected: {
      focus: "splintStateAndChange",
      replacement: "Insert a glowing splint; it relights.",
    },
    note: "Both the initial glowing state and subsequent relighting should be explicit.",
  },
  {
    id: "white-gas",
    title: "Name what becomes cloudy",
    given:
      "Give the positive result when carbon dioxide is bubbled through limewater.",
    suppliedAnswer: "The gas turns white.",
    expected: {
      focus: "observedObject",
      replacement: "The limewater turns milky or cloudy.",
    },
    note: "The appearance change occurs in limewater. White precipitate is also accepted in the reviewed AQA questions.",
  },
  {
    id: "red-only",
    title: "Give the identifying change",
    given: "Describe the positive damp-litmus test for chlorine.",
    suppliedAnswer: "Blue litmus turns red.",
    expected: {
      focus: "bleaching",
      replacement:
        "Damp litmus is bleached white; damp blue litmus may first turn red.",
    },
    note: "Red alone is not the distinguishing chlorine observation.",
  },
  {
    id: "oxygen-burns",
    title: "Distinguish supporting from burning",
    given:
      "Explain the meaning of a glowing splint relighting in an oxygen test.",
    suppliedAnswer: "The oxygen burns as the fuel.",
    expected: {
      focus: "combustionRole",
      replacement: "Oxygen supports burning, so the glowing splint relights.",
    },
    note: "The splint is the burning material; oxygen is not the fuel in this test.",
  },
  {
    id: "limewater-identity",
    title: "Name the dissolved substance",
    given: "What is limewater?",
    suppliedAnswer: "Calcium carbonate dissolved in water.",
    expected: {
      focus: "reagentIdentity",
      replacement: "Limewater is an aqueous solution of calcium hydroxide.",
    },
    note: "Calcium carbonate is the white precipitate associated with a positive CO2 test, not the starting solute.",
  },
  {
    id: "hydrogen-method-result",
    title: "Include method and result",
    given: "Describe the test for hydrogen and its positive result.",
    suppliedAnswer: "It makes a pop.",
    expected: {
      focus: "methodAndResult",
      replacement:
        "Hold a burning splint at the open end of the test tube; hydrogen burns with a pop.",
    },
    note: "A pop gives the result, but the question also asks for the test procedure.",
  },
];
function freeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
export const gasTestCases = freeze({
  procedure,
  observation,
  identification,
  comparison,
  faults,
  evidence,
  wording,
});
