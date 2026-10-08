import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
import type { BondMode } from "../../lib/bond-energy";
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...choice(
    "bond-v1-" + id,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    title,
    model,
  ),
  title,
});
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...number(
    "bond-v1-" + id,
    prompt,
    answer,
    "kJ/mol reaction",
    explanation,
    hint,
    title,
    {},
    model,
  ),
  title,
});
const count = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  explanation: string,
  hint: string,
  reaction: string,
): LearningTask => ({
  ...n(id, title, prompt, answer, explanation, hint),
  unit: "bonds",
  bondReaction: reaction,
});
const inverse = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  explanation: string,
  hint: string,
  reaction?: string,
  model?: TaskModel,
): LearningTask => ({
  ...n(id, title, prompt, answer, explanation, hint, model),
  unit: "kJ/mol bonds",
  ...(reaction ? { bondReaction: reaction } : {}),
});
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): LearningTask => ({
  id: "bond-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  purpose: title,
  rubric,
});
const m = (
  mode: BondMode,
  instruction: string,
  record?: string,
): TaskModel => ({ kind: "bond-energy", mode, instruction, record });
const diagram = (q: LearningTask, reaction: string): LearningTask => ({
  ...q,
  bondReaction: reaction,
});
export const bondEnergyJourney: LessonJourney = {
  version: 1,
  introduction:
    "Use the displayed formulae to build both bond inventories. Multiply positive supplied bond values by their counts, then subtract formation release from breaking input. The result is an approximate change per mole of the reaction as written, not its activation energy.",
  outcomes: [
    "Count distinct bonds from displayed formulae and apply balanced-equation coefficients.",
    "Calculate positive breaking input and formation release, then the signed overall energy change.",
    "Explain exothermic/endothermic results without reversing the roles of breaking and forming.",
    "Solve a supplied unknown bond energy, including multiplicity and matched cancellation.",
    "Recognise mean-value, gas-phase, reaction-scaling and hypothetical-path limits.",
  ],
  warmup: [
    c(
      "w-breaking",
      "Recall bond breaking",
      "What energy transfer is required to separate covalently bonded atoms?",
      "Energy is supplied",
      {
        "Energy is released":
          "Bond breaking needs energy to overcome the attraction.",
        "No energy transfer occurs": "Separating bonded atoms requires energy.",
      },
      "Breaking covalent bonds requires energy input.",
      "Think about overcoming the bonded attraction.",
    ),
    n(
      "w-difference",
      "Subtract the release",
      "For one mole of a reaction, breaking input is 600 kJ and formation release is 800 kJ. Calculate the signed overall change.",
      -200,
      "600 − 800 = −200 kJ per mole of the reaction: overall exothermic.",
      "Input minus release.",
    ),
  ],
  refresher: [
    c(
      "r-direction",
      "Separate the two bond processes",
      "Which pair is correct?",
      "Breaking absorbs; forming releases",
      {
        "Breaking releases; forming absorbs": "Both roles have been reversed.",
        "Both always release":
          "Overall release does not make bond breaking exothermic.",
      },
      "Breaking needs input; formation releases energy. Overall change compares both.",
      "Treat the two steps separately.",
    ),
    diagram(
      c(
        "r-coefficient",
        "Apply the whole coefficient",
        "In 2 H₂O, how many O–H bond connections are counted in the product inventory?",
        "Four",
        {
          Two: "There are two in each water molecule, multiplied by two molecules.",
          Eight:
            "Each single connection is one bond; do not double it for its electron pair.",
        },
        "Each water molecule has two O–H bonds; 2 × 2 = 4.",
        "Count one molecule, then multiply by its coefficient.",
      ),
      "water",
    ),
    c(
      "r-sign",
      "Explain a signed result",
      "An estimate is −170 kJ/mol reaction. What does this sign mean?",
      "Energy is released overall",
      {
        "Energy is absorbed overall":
          "A positive overall change denotes net input.",
        "Every bond releases energy when broken":
          "The overall difference does not change the direction of bond breaking.",
      },
      "Negative input-minus-release means formation releases more than breaking requires.",
      "Compare positive input and positive release magnitudes.",
    ),
    c(
      "r-double",
      "Use the supplied multiple-bond entry",
      "O₂ contains O=O. How is its bond energy counted from a table with separate O–O and O=O entries?",
      "One O=O entry",
      {
        "Two O–O entries":
          "The double-bond energy is a distinct supplied value, not twice the single-bond value.",
        "Two O=O entries":
          "One oxygen molecule has one double-bond connection.",
      },
      "Use one double-bond entry for each O₂ molecule.",
      "Distinguish a connection from its bond order.",
    ),
    inverse(
      "r-unknown",
      "Rearrange the signed balance",
      "For one mole of reaction, breaking input is 700 kJ, formation releases 300 + X kJ and overall change is −100 kJ. One mole of the unknown bonds forms. Find its bond energy X.",
      500,
      "−100 = 700 − (300 + X), so 300 + X = 800 and X = 500.",
      "First find the whole release; then subtract its known part.",
    ),
    c(
      "r-mean",
      "Interpret a mean bond value",
      "Why does a mean bond-energy calculation estimate rather than guarantee the exact reaction change?",
      "Bond energy depends on chemical environment",
      {
        "Mass fails to be conserved": "Atoms remain conserved.",
        "All bond energies are zero":
          "The supplied positive values quantify bond-breaking input.",
      },
      "Mean tabulated values average chemical environments; actual reaction values may differ.",
      "Consider the word mean.",
    ),
  ],
  guided: [
    {
      ...count(
        "g-count",
        "Count water’s bonds",
        "For 2 H₂ + O₂ → 2 H₂O, how many O–H bonds form?",
        4,
        "Two water molecules each contain two O–H bonds: four in total.",
        "Count connections, then apply the coefficient.",
        "water",
      ),
      model: m(
        "count",
        "Enter every reactant and product bond count from the displayed formulae.",
        "water",
      ),
    },
    diagram(
      n(
        "g-ledger",
        "Build both totals",
        "For H₂ + Cl₂ → 2 HCl, supplied values H–H 436, Cl–Cl 243 and H–Cl 432 kJ/mol bonds. Calculate the signed overall change.",
        -185,
        "Input 436 + 243 = 679; release 2 × 432 = 864; 679 − 864 = −185 kJ/mol reaction.",
        "Multiply H–Cl by the coefficient before subtracting.",
        m(
          "ledger",
          "Enter both positive totals and the signed overall prediction.",
          "hydrogenChloride",
        ),
      ),
      "hydrogenChloride",
    ),
    inverse(
      "g-inverse",
      "Find the missing bond value",
      "Methane bromination has overall change −51 kJ/mol reaction. Use the supplied bond table to find C–Br.",
      290,
      "4 × 412 + 193 − (3 × 412 + X + 366) = −51. Therefore X = 290 kJ/mol bonds.",
      "Keep all counts or cancel matched unchanged C–H entries.",
      "bromination",
      m(
        "inverse",
        "Keep the unknown on its correct side and include its multiplicity.",
        "bromination",
      ),
    ),
    diagram(
      n(
        "g-cancel",
        "Cancel equal entries",
        "Cancel three C–H entries on each side. Calculate the overall estimate using the supplied table.",
        -51,
        "(412 + 193) − (290 + 366) = −51; equal cancellation removed 1236 from each total.",
        "Cancel only equal entries on both sides.",
        m(
          "cancel",
          "Try equal and unequal cancellation; retain your overall prediction.",
          "bromination",
        ),
      ),
      "bromination",
    ),
    c(
      "g-evidence",
      "Reject a mechanism claim",
      "A ledger first separates all atoms. Does this establish actual reaction steps?",
      "It does not establish the actual reaction steps",
      {
        "Every molecule must become free atoms first":
          "The ledger is a hypothetical energy-accounting route.",
        "The activation energy equals the total input":
          "Actual activation follows the reaction pathway, not this complete dissociation sum.",
      },
      "The accounting path estimates an overall difference, not a sequence of actual elementary steps.",
      "Separate an accounting method from a physical mechanism.",
      m(
        "evidence",
        "Choose a supported claim and the matching reason.",
        "mechanism",
      ),
    ),
  ],
  practice: [
    count(
      "p-water-count",
      "Multiply product bonds",
      "For the displayed water-vapour equation, how many O–H bonds occur across the product inventory?",
      4,
      "2 × 2 = 4 O–H bonds.",
      "Count per molecule before applying its coefficient.",
      "water",
    ),
    count(
      "p-ammonia-count",
      "Count ammonia’s N–H bonds",
      "For the displayed ammonia equation, how many N–H bonds form?",
      6,
      "Each NH₃ has three N–H bonds; two molecules give six.",
      "Multiply three by the product coefficient.",
      "ammonia",
    ),
    count(
      "p-methane-oxygen",
      "Count oxygen double bonds",
      "For the displayed methane-combustion equation, how many O=O connections are broken?",
      2,
      "Two O₂ molecules each have one O=O connection.",
      "One double-bond connection per oxygen molecule.",
      "methane",
    ),
    diagram(
      n(
        "p-water-input",
        "Calculate breaking input",
        "For 2 H₂ + O₂ → 2 H₂O(g), H–H 436 and O=O 498 kJ/mol bonds. Calculate breaking input.",
        1370,
        "2 × 436 + 498 = 1370 kJ/mol reaction.",
        "Include both hydrogen molecules.",
      ),
      "water",
    ),
    diagram(
      n(
        "p-water-release",
        "Calculate formation release",
        "For the same water-vapour equation, O–H 464 kJ/mol bonds. Calculate the positive formation release.",
        1856,
        "Four O–H bonds form: 4 × 464 = 1856.",
        "Multiply the actual bond count by the supplied value.",
      ),
      "water",
    ),
    diagram(
      n(
        "p-water-change",
        "Complete water accounting",
        "For 2 H₂ + O₂ → 2 H₂O(g), supplied H–H 436, O=O 498 and O–H 464 kJ/mol bonds. Calculate signed overall change.",
        -486,
        "1370 − 1856 = −486 kJ/mol reaction.",
        "Breaking input minus formation release.",
      ),
      "water",
    ),
    diagram(
      n(
        "p-ammonia-input",
        "Separate triple-bond energy",
        "For N₂ + 3 H₂ → 2 NH₃, N≡N 945 and H–H 436 kJ/mol bonds. Calculate breaking input.",
        2253,
        "945 + 3 × 436 = 2253. The N≡N entry is used once.",
        "Do not multiply the triple-bond table entry by three.",
      ),
      "ammonia",
    ),
    diagram(
      n(
        "p-ammonia-change",
        "Complete ammonia accounting",
        "For the displayed ammonia equation, N≡N 945, H–H 436 and N–H 391 kJ/mol bonds. Calculate signed overall change.",
        -93,
        "2253 − 6 × 391 = 2253 − 2346 = −93.",
        "Count all six product bonds.",
      ),
      "ammonia",
    ),
    diagram(
      n(
        "p-methane-release",
        "Count both product species",
        "For CH₄ + 2 O₂ → CO₂ + 2 H₂O(g), C=O 805 and O–H 464 kJ/mol bonds. Calculate positive formation release.",
        3466,
        "2 × 805 + 4 × 464 = 3466.",
        "CO₂ contributes two double connections; water contributes four single connections.",
      ),
      "methane",
    ),
    diagram(
      n(
        "p-methane-change",
        "Estimate gaseous combustion",
        "For the displayed methane equation, C–H 413, O=O 498, C=O 805 and O–H 464 kJ/mol bonds. Calculate signed overall change.",
        -818,
        "4 × 413 + 2 × 498 − (2 × 805 + 4 × 464) = 2648 − 3466 = −818.",
        "Build both complete positive totals first.",
      ),
      "methane",
    ),
    diagram(
      n(
        "p-reverse",
        "Reverse the same equation",
        "For 2 HCl → H₂ + Cl₂, H–Cl 432, H–H 436 and Cl–Cl 243 kJ/mol bonds. Calculate signed overall change.",
        185,
        "2 × 432 − (436 + 243) = +185. Reversing swaps input and release.",
        "Use the reactants shown now.",
      ),
      "splitHCl",
    ),
    diagram(
      n(
        "p-scale",
        "Double every coefficient",
        "For 2 H₂ + 2 Cl₂ → 4 HCl, H–H 436, Cl–Cl 243 and H–Cl 432 kJ/mol bonds. Calculate signed overall change per mole of this reaction as written.",
        -370,
        "2 × 436 + 2 × 243 − 4 × 432 = −370.",
        "Double the counts, not the bond values.",
      ),
      "doubleHCl",
    ),
    n(
      "p-per-product",
      "Change the stated basis",
      "H₂ + Cl₂ → 2 HCl releases an estimated 185 kJ per mole of reaction. What positive energy is released per mole of HCl formed?",
      92.5,
      "Two moles of HCl share 185 kJ; 185 ÷ 2 = 92.5 kJ per mole of HCl.",
      "Read the product coefficient.",
    ),
    inverse(
      "p-unknown-twice",
      "Handle unknown multiplicity",
      "For H₂ + Cl₂ → 2 HCl, H–H 436 and Cl–Cl 243 kJ/mol bonds; overall change −185 kJ/mol reaction. Find the H–Cl bond energy X.",
      432,
      "−185 = 679 − 2X; 2X = 864; X = 432.",
      "Divide the whole required release by two.",
      "unknownHCl",
    ),
    inverse(
      "p-unknown-four",
      "Rearrange four unknown bonds",
      "For 2 H₂ + O₂ → 2 H₂O(g), H–H 436 and O=O 498 kJ/mol bonds; overall change −486 kJ/mol reaction. Find O–H bond energy X.",
      464,
      "−486 = 1370 − 4X; 4X = 1856; X = 464.",
      "Account for four product bonds.",
      "unknownOH",
    ),
    inverse(
      "p-unknown-reactant",
      "Place the unknown in input",
      "For H₂ + Cl₂ → 2 HCl, Cl–Cl 243 and H–Cl 432 kJ/mol bonds; overall change −185 kJ/mol reaction. Find H–H bond energy X.",
      436,
      "−185 = X + 243 − 864; X = 436.",
      "The unknown belongs in the breaking total.",
      "unknownHH",
    ),
    c(
      "p-unequal-cancel",
      "Diagnose unequal cancellation",
      "A student removes three C–H entries from reactants and two from products. Is the remaining energy difference equivalent?",
      "No: unequal cancellation changes the difference",
      {
        "Yes: any repeated bond can be removed":
          "Equal entries must be removed on both sides.",
        "Yes: bond formation never enters the calculation":
          "Formation release must be included.",
      },
      "Removing unequal quantities changes input minus release.",
      "Compare what was removed from both totals.",
    ),
    w(
      "p-explain-exo",
      "Explain the overall release",
      "For the stated gaseous methane equation, breaking input is 2648 kJ and formation release is 3466 kJ per mole of reaction. Use these values to explain why energy is released overall even though breaking requires input.",
      "Formation releases 3466 kJ, exceeding the 2648 kJ input by 818 kJ per mole of reaction. This net energy transfers to surroundings; bond breaking still absorbs energy.",
      [
        "Breaking requires energy input.",
        "Formation releases energy.",
        "Compare both supplied numerical totals and state the net transfer.",
      ],
    ),
    w(
      "p-explain-mean",
      "Review the estimate",
      "Why should supplied mean bond energies not be presented as an exact measured value for every compound?",
      "The bond energy depends on its chemical environment; mean values average environments, so the calculated overall change is approximate.",
      [
        "Identify mean values as averages.",
        "Relate variation to chemical environment.",
        "State approximate, not guaranteed exact.",
      ],
    ),
    w(
      "p-explain-phase",
      "Respect product state",
      "Why must a gas-phase bond calculation for water vapour not be called the exact value for forming liquid water?",
      "The gas-phase accounting excludes the additional energy change when water vapour condenses; mean values are also approximate.",
      [
        "Read the specified gaseous state.",
        "Identify the excluded condensation change.",
        "Avoid claiming exact equality.",
      ],
    ),
    c(
      "p-activation",
      "Keep activation separate",
      "Can the summed energy to break all reactant bonds be labelled the activation energy?",
      "No: this accounting sum does not establish the actual barrier",
      {
        "Yes: every bond must break simultaneously":
          "The hypothetical accounting path is not a proven mechanism.",
        "Yes: exothermic reactions have no barrier":
          "An overall exothermic reaction can require activation.",
      },
      "Activation energy belongs to the actual reaction pathway. The ledger estimates an overall change.",
      "Distinguish the pathway peak from complete bond dissociation.",
    ),
  ],
  checkForms: [
    [
      diagram(
        n(
          "a-change",
          "Fresh forward estimate",
          "For H₂ + Cl₂ → 2 HCl, supplied H–H 440, Cl–Cl 240 and H–Cl 430 kJ/mol bonds. Calculate signed overall change.",
          -180,
          "440 + 240 − 2 × 430 = −180.",
          "Count both product bonds.",
        ),
        "hydrogenChloride",
      ),
      count(
        "a-count",
        "Fresh product inventory",
        "For the displayed methane equation, how many C=O double-bond connections form?",
        2,
        "One CO₂ has two C=O connections.",
        "Use the displayed products.",
        "methane",
      ),
      inverse(
        "a-inverse",
        "Fresh inverse estimate",
        "Breaking input is 760 kJ/mol reaction; product bonds release 2X. Overall change is −120 kJ/mol reaction. Find X.",
        440,
        "−120 = 760 − 2X, so X = 440.",
        "Find total release and divide by multiplicity.",
      ),
      c(
        "a-direction",
        "Fresh bond-process explanation",
        "Which statement correctly explains the sign of bond formation?",
        "Energy is released when bonded products form",
        {
          "Energy is released by separating bonded atoms":
            "Breaking requires input.",
          "Every positive table value is a formation cost":
            "The positive bond value gives dissociation energy; formation releases that magnitude.",
        },
        "Formation releases energy; positive supplied values describe breaking magnitudes.",
        "Separate the table convention from the process.",
      ),
      w(
        "a-explain",
        "Explain a fresh balance",
        "Breaking input is 1100 kJ; formation releases 1400 kJ for a specified amount. Explain the overall direction and transfer.",
        "Overall change is 1100 − 1400 = −300 kJ, exothermic; formation releases more than breaking requires, and 300 kJ transfers to surroundings.",
        [
          "Compare both positive totals.",
          "State exothermic and negative overall change.",
          "Identify transfer to surroundings.",
        ],
      ),
    ],
    [
      diagram(
        n(
          "b-change",
          "Fresh larger-coefficient estimate",
          "For 4 NH₃ + 3 O₂ → 2 N₂ + 6 H₂O(g), supplied N–H 390, O=O 500, N≡N 940 and O–H 460 kJ/mol bonds. Calculate signed overall change.",
          -1220,
          "12 × 390 + 3 × 500 − (2 × 940 + 12 × 460) = 6180 − 7400 = −1220.",
          "Count every molecule and use the distinct multiple-bond entries.",
        ),
        "ammoniaOxidation",
      ),
      count(
        "b-count",
        "Fresh reactant inventory",
        "For the displayed ammonia-oxidation equation, how many N–H bond connections are broken?",
        12,
        "Four NH₃ molecules each contribute three N–H connections: 12.",
        "Count one molecule then apply four.",
        "ammoniaOxidation",
      ),
      inverse(
        "b-inverse",
        "Fresh unknown in breaking",
        "Breaking input is X + 250; formation release is 900; overall change is −210 kJ/mol reaction. Find X.",
        440,
        "−210 = X + 250 − 900, so X = 440.",
        "Isolate the unknown on the input side.",
      ),
      c(
        "b-scale",
        "Fresh equation-basis reasoning",
        "Every coefficient in an equation is tripled. Supplied bond values stay identical. What happens to its calculated overall change?",
        "It triples",
        {
          "It stays unchanged": "All bond counts and both totals triple.",
          "Each bond energy triples":
            "An equation coefficient does not change the energy per mole of bonds.",
        },
        "The energy per mole of the reaction as written triples because every count triples.",
        "Distinguish bond value from bond quantity.",
      ),
      w(
        "b-explain",
        "Explain a fresh limitation",
        "Explain why a complete-dissociation energy ledger does not prove the actual reaction mechanism.",
        "It is a hypothetical accounting route for an overall difference. The actual pathway can involve other intermediate steps and does not require all free atoms at once.",
        [
          "Identify hypothetical accounting.",
          "Distinguish the actual reaction pathway.",
          "Do not equate total breaking input to activation energy.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "d-a-change",
        "Delayed signed estimate",
        "Breaking input is 1540 kJ and formation release is 1715 kJ per mole of the specified reaction. Calculate signed overall change.",
        -175,
        "1540 − 1715 = −175.",
        "Input minus release.",
      ),
      inverse(
        "d-a-inverse",
        "Delayed multiplicity",
        "Breaking input is 980; formation releases 2X + 300; overall is −160 kJ/mol reaction. Find X.",
        420,
        "−160 = 980 − (2X + 300), so 2X = 840 and X = 420.",
        "Preserve the grouped product total.",
      ),
      w(
        "d-a-explain",
        "Delayed direction explanation",
        "Explain why an exothermic overall reaction does not mean breaking its bonds releases energy.",
        "Breaking still requires energy; formation releases a greater total, giving net transfer to surroundings.",
        [
          "Breaking requires input.",
          "Formation releases more overall.",
          "Explain the net transfer.",
        ],
      ),
    ],
    [
      diagram(
        n(
          "d-b-change",
          "Delayed ammonia estimate",
          "For N₂ + 3 H₂ → 2 NH₃, supplied N≡N 940, H–H 440 and N–H 390 kJ/mol bonds. Calculate signed overall change.",
          -80,
          "940 + 3 × 440 − 6 × 390 = 2260 − 2340 = −80.",
          "Use the triple-bond entry once.",
        ),
        "ammonia",
      ),
      inverse(
        "d-b-inverse",
        "Delayed unknown product bond",
        "Breaking input is 1200; formation release is 3X; overall change is −90 kJ/mol reaction. Find X.",
        430,
        "−90 = 1200 − 3X; 3X = 1290; X = 430.",
        "Find the whole formation release.",
      ),
      w(
        "d-b-explain",
        "Delayed cancellation reasoning",
        "Why can equal unchanged bond entries be cancelled from both totals without changing the estimated overall result?",
        "The same positive energy is subtracted from breaking input and formation release; their difference remains unchanged. Cancellation is an accounting simplification, not proof of a mechanism.",
        [
          "Equal entries on both sides.",
          "Equal subtraction preserves the difference.",
          "Do not infer a literal reaction mechanism.",
        ],
      ),
    ],
  ],
};
const all = [
  ...bondEnergyJourney.warmup,
  ...bondEnergyJourney.refresher,
  ...bondEnergyJourney.guided,
  ...bondEnergyJourney.practice,
  ...bondEnergyJourney.checkForms.flat(),
  ...bondEnergyJourney.reviewForms.flat(),
];
for (const q of bondEnergyJourney.practice)
  q.followUp = q.id.includes("unknown")
    ? "bond-v1-r-unknown"
    : q.id.includes("count") || q.id.includes("oxygen")
      ? "bond-v1-r-coefficient"
      : q.id.includes("mean") || q.id.includes("phase")
        ? "bond-v1-r-mean"
        : "bond-v1-r-direction";
const aliases = [
  ["w-breaking", "r-direction", "a-direction", "p-explain-exo", "d-a-explain"],
  ["r-mean", "p-explain-mean"],
  ["p-activation", "g-evidence", "b-explain"],
  ["p-scale", "b-scale"],
  ["g-cancel", "p-unequal-cancel", "d-b-explain"],
  ["g-count", "p-water-count"],
  ["g-ledger", "p-unknown-twice", "p-unknown-reactant"],
];
for (const ids of aliases) {
  const full = ids.map((id) => "bond-v1-" + id);
  for (const id of full) {
    const q = all.find((q) => q.id === id);
    if (q) q.exposureAliases = full;
  }
}
const legacy = [
  ["w-breaking", "r-direction", "a-direction"],
  ["w-difference"],
  ["r-sign", "p-explain-exo", "d-a-explain"],
  [],
  [],
  ["r-mean", "p-explain-mean"],
];
legacy.forEach((ids, i) =>
  ids.forEach((id) => {
    const q = all.find((q) => q.id === "bond-v1-" + id);
    if (q)
      q.exposureAliases = [
        ...new Set([...(q.exposureAliases ?? []), "bond-energy-" + i]),
      ];
  }),
);

const perProduct = all.find((q) => q.id === "bond-v1-p-per-product")!;
perProduct.unit = "kJ/mol HCl";

for (const q of bondEnergyJourney.practice) {
  if (
    !q.options &&
    !q.rubric &&
    !q.id.includes("unknown") &&
    !q.id.includes("count") &&
    !q.id.includes("oxygen")
  )
    q.followUp = "bond-v1-r-sign";
}

// These exact structural inventories can already be explored in the guided count model.
const modelCountFamily = [
  "g-count",
  "p-water-count",
  "p-ammonia-count",
  "p-methane-oxygen",
  "a-count",
  "b-count",
].map((id) => "bond-v1-" + id);
for (const id of modelCountFamily) {
  const q = all.find((q) => q.id === id)!;
  q.exposureAliases = [
    ...new Set([...(q.exposureAliases ?? []), ...modelCountFamily]),
  ];
}
for (const id of ["p-methane-oxygen", "p-ammonia-input"]) {
  all.find((q) => q.id === "bond-v1-" + id)!.followUp = "bond-v1-r-double";
}
all.find((q) => q.id === "bond-v1-p-per-product")!.followUp =
  "bond-v1-r-coefficient";
