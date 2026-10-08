import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";
const prefix = "g7-write-v1-";
function symbol(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
): LearningTask {
  return {
    ...choice(
      prefix + id,
      prompt,
      answer,
      errors,
      `Use the complete name in the supplied reference. ${answer} is the element symbol; a molecular subscript or ion charge would add different information.`,
      "Match the complete name and preserve the case of each letter.",
      "Use supplied Group 7 names and exact symbols, beyond first-three model examples.",
    ),
    title,
    halogenReference: true,
    followUp: prefix + "r-symbol",
  };
}
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
): LearningTask {
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained response with the criteria. Complete explanations and equations receive manual self-review, without an automatic examiner mark.",
    hint: "Identify the species and conditions first. Link each observation or structural feature to the conclusion it supports.",
    purpose:
      "Construct a chemical account from the stated context rather than select a supplied complete explanation.",
  };
}
const recovery = symbol(
  "r-symbol",
  "Separate symbol and formula",
  "Use the reference. Which symbol identifies astatine, without a molecule count or charge?",
  "At",
  {
    AT: "The second letter is lowercase.",
    "At₂":
      "That is a molecular formula prediction, not the element symbol alone.",
  },
);
delete recovery.followUp;
const guided = symbol(
  "g-astatine",
  "Use the wider-group reference",
  "Use the supplied reference to identify the symbol for astatine, atomic number 85.",
  "At",
  {
    Ac: "Ac represents actinium, not astatine.",
    "At⁻": "A charge describes an ion, not just an element symbol.",
  },
);
const practiceSymbol = symbol(
  "p-astatine",
  "Match astatine’s symbol",
  "A sample label names astatine. Which exact element symbol should accompany the name? Use the reference.",
  "At",
  { AT: "The second letter must be lowercase.", Ac: "Ac represents actinium." },
);
const practiceTs = symbol(
  "p-tennessine",
  "Read a supplied table entry",
  "Use the supplied reference. Which element symbol represents tennessine?",
  "Ts",
  {
    TS: "The second letter must be lowercase.",
    Tb: "Tb represents terbium, not tennessine.",
  },
);
const practiceDisplacement = written(
  "p-displace",
  "Write the displacement account",
  "Chlorine solution reacts with sodium bromide solution. Describe the colour outcome and write word and balanced symbol equations.",
  "Bromine forms, giving an orange aqueous solution. Chlorine is more reactive than bromine and displaces it from bromide.\nchlorine + sodium bromide → sodium chloride + bromine\nCl2 + 2 NaBr → 2 NaCl + Br2\nSodium ions remain spectators; bubbling or sodium metal formation is not required.",
  [
    "Identify bromine formation and its orange aqueous appearance; keep this separate from red-brown liquid bromine or an unspecified coloured solution.",
    "Write chlorine + sodium bromide → sodium chloride + bromine.",
    "Construct Cl₂ + 2 NaBr → 2 NaCl + Br₂ with fixed formulae; equivalent balanced multiples are valid. Sodium ions remain spectators.",
  ],
  "g7-v1-r-displace",
);
const practiceCompounds = written(
  "p-compounds",
  "Compare the compounds",
  "Compare NaCl and HCl before dissolution. Explain HCl’s room-temperature state and the solution it makes in water.",
  "Sodium chloride contains Na+ and Cl− ions in a giant ionic lattice. Hydrogen chloride consists of small covalent molecules. Its weak intermolecular forces need little energy to overcome, so HCl is a gas at room temperature; the covalent H–Cl bonds within molecules are not broken by boiling. In water it forms an acidic solution containing hydrogen and chloride ions, rather than remaining only neutral HCl molecules.",
  [
    "Describe NaCl as ionic, with positive sodium and negative chloride ions; describe HCl before dissolution as small covalent molecules.",
    "Connect weak forces between HCl molecules with little energy needed to overcome them and the gaseous room state. Do not break the covalent bonds inside each molecule during boiling.",
    "State that dissolving HCl in water gives an acidic solution with hydrogen and chloride ions; do not call it an alkaline hydroxide or insist it stays only molecular.",
  ],
  "g7-v1-r-compound",
);
const trend = written(
  "ca-trend",
  "Explain electron gain",
  "Explain why bromine is less reactive than chlorine despite having more protons. Refer to the outer shell and electron gain.",
  "Both neutral atoms have seven outer electrons. Bromine has more occupied shells, so an incoming electron is farther from the nucleus and more shielded by inner electrons. Attraction to that electron is weaker overall despite the greater nuclear charge. Bromine gains an electron less easily, so it is less reactive.",
  [
    "Keep seven outer electrons in both neutral atoms and connect more occupied shells in bromine with increased distance and/or shielding.",
    "Explain weaker overall nuclear attraction to an incoming electron despite more protons.",
    "Link weaker attraction to less easy electron gain and lower reactivity; do not use the Group 1 electron-loss mechanism.",
  ],
  "g7-v1-r-structure",
);
const displacement = written(
  "ca-displace",
  "Write the reaction",
  "Bromine solution reacts with sodium iodide solution. Describe the aqueous colour outcome and write word and balanced symbol equations.",
  "Iodine forms and the aqueous solution becomes brown. Bromine is more reactive than iodine.\nbromine + sodium iodide → sodium bromide + iodine\nBr2 + 2 NaI → 2 NaBr + I2\nThe sodium ions remain unchanged; iodine’s purple vapour or grey-black solid appearance does not describe this aqueous context.",
  [
    "Identify iodine formation and its brown aqueous appearance; attach the solvent/state context to the colour.",
    "Write bromine + sodium iodide → sodium bromide + iodine.",
    "Construct Br₂ + 2 NaI → 2 NaBr + I₂ (valid balanced multiples accepted), keeping formulae and spectator sodium ions unchanged.",
  ],
  "g7-v1-r-displace",
);
const compounds = written(
  "ca-compounds",
  "Describe compound types",
  "Compare sodium iodide and hydrogen iodide before dissolution. Describe the solution hydrogen iodide makes in water.",
  "Sodium iodide contains Na+ and I− ions in an ionic structure. Hydrogen iodide consists of covalent HI molecules before dissolution. In water it gives an acidic solution containing hydrogen and iodide ions. Neither compound is an elemental I2 molecule, and hydrogen iodide is not an alkali-metal hydroxide.",
  [
    "Describe the selected metal compound NaI as ionic, with positive sodium and negative iodide ions.",
    "Describe HI before dissolution as covalent molecules containing two different elements, rather than elemental I₂.",
    "Identify the acidic aqueous solution and hydrogen/iodide ions; distinguish this dissolved context from molecular HI before dissolution.",
  ],
  "g7-v1-r-compound",
);
const checkSymbol = symbol(
  "ca-astatine",
  "Use the supplied symbol",
  "Which element symbol belongs beside astatine in a results table? Use the supplied reference.",
  "At",
  {
    Ar: "Ar is argon, a different element.",
    AT: "The second letter is lowercase.",
  },
);
const state = written(
  "ca-state",
  "Explain the supplied state",
  "Bromine has melting point −7 °C and boiling point 59 °C at the stated pressure. Explain its state at 45 °C and what happens to Br₂ molecules.",
  "−7 < 45 < 59, so bromine is liquid using the supplied bounds. The Br2 molecules remain intact. Physical changes alter arrangement/movement and the effects of forces between molecules, rather than splitting the covalent pairs into separate bromine atoms.",
  [
    "Compare 45 °C with both −7 °C and 59 °C and conclude liquid.",
    "Keep intact Br₂ molecules, distinguishing physical state change from chemical electron gain or loss.",
    "Distinguish forces between molecules from covalent bonds within them; do not explain boiling by splitting Br₂ into isolated atoms.",
  ],
  "g7-v1-r-state",
);
const reviewTrend = written(
  "ra-trend",
  "Retrieve the gain explanation",
  "Explain why iodine gains an electron less easily than bromine. Correct the claim that lower reactivity means losing an electron is harder.",
  "Both neutral halogen atoms have seven outer electrons. Iodine has more occupied shells, increasing distance and shielding for an incoming electron. The overall attraction is weaker, so electron gain is harder and iodine is less reactive than bromine. Halogen ion formation is gain of an electron, not the Group 1 loss process.",
  [
    "Use seven outer electrons and more occupied shells, distance and/or shielding in iodine.",
    "Connect weaker attraction to harder electron gain and decreased reactivity.",
    "Explicitly correct the loss claim: a simple halide ion forms by gaining one electron, without changing the nucleus.",
  ],
  "g7-v1-r-structure",
);
const reviewNone = written(
  "ra-none",
  "Evaluate the colour claim",
  "Bromine solution is mixed with sodium chloride solution and stays orange. Sam claims this proves displacement. Explain whether Sam is right.",
  "Sam is wrong. Bromine is less reactive than chlorine, so it cannot displace chlorine from chloride solution. Added bromine solution is already orange and can retain its colour without a net displacement. The chloride and sodium ions remain; no sodium metal or new chlorine molecules are produced by displacement.",
  [
    "Compare bromine with chlorine and conclude no net displacement because bromine is less reactive.",
    "Explain that the added bromine is already coloured; unchanged orange alone does not prove a chemical reaction.",
    "Keep the original halide and spectator metal ions, rather than turning chloride into bromine by nuclear change or making sodium metal.",
  ],
  "g7-v1-r-displace",
);
const reviewData = written(
  "ra-data",
  "Order X, Y and Z",
  "Justify both reactivity steps.",
  "X > Z > Y. X2 displaces Z from Z−, so X is more reactive than Z. Z2 displaces Y from Y−, so Z is more reactive than Y. Combining both comparisons places X first, Z between and Y last. The letters label unknown samples rather than new elements.",
  [
    "State X > Z > Y from most to least reactive.",
    "Use the first positive displacement to justify X > Z and the second to justify Z > Y.",
    "Combine the two comparisons instead of ranking by alphabetical order, colour alone or a recalled named-halogen list.",
  ],
  "g7-v1-r-displace",
);
reviewData.halogenResults = [
  { added: "X₂", halide: "Z⁻", reaction: true },
  { added: "Z₂", halide: "Y⁻", reaction: true },
];
const reviewSymbol = symbol(
  "ra-tennessine",
  "Retrieve reference use",
  "Use the supplied reference. Which exact symbol identifies the element with atomic number 117?",
  "Ts",
  {
    T: "T is not the supplied symbol for element 117.",
    TS: "The second letter is lowercase.",
  },
);
export const groupSevenWriting = {
  refresher: [recovery],
  guided: [guided],
  practice: [
    practiceSymbol,
    practiceTs,
    practiceDisplacement,
    practiceCompounds,
  ],
  check: [trend, displacement, compounds, checkSymbol, state],
  review: [reviewTrend, reviewNone, reviewData, reviewSymbol],
};
export function extendGroupSevenWriting(journey: LessonJourney) {
  journey.refresher.push(recovery);
  journey.guided.push(guided);
  journey.practice.push(...groupSevenWriting.practice);
  journey.checkForms.push(groupSevenWriting.check);
  journey.reviewForms.push(groupSevenWriting.review);
  journey.practiceGroups = [
    {
      label: "Particles, states and physical trends",
      taskIds: ["mass", "room", "state", "negative", "trends", "unknown"].map(
        (id) => "g7-v1-p-" + id,
      ),
    },
    {
      label: "Displacement and electron-gain evidence",
      taskIds: ["iodide", "none", "salt", "infer", "explain"]
        .map((id) => "g7-v1-p-" + id)
        .concat(practiceDisplacement.id),
    },
    {
      label: "Names, compounds and tests",
      taskIds: ["bonding", "acid", "test"]
        .map((id) => "g7-v1-p-" + id)
        .concat(practiceSymbol.id, practiceTs.id, practiceCompounds.id),
    },
  ];
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const ids of [
    [
      "g7-v1-p-explain",
      "g7-v1-cb-structure",
      "g7-v1-r-structure",
      trend.id,
      reviewTrend.id,
    ],
    [
      "g7-v1-g-displace",
      "g7-v1-p-salt",
      practiceDisplacement.id,
      displacement.id,
    ],
    ["g7-v1-g-none", "g7-v1-p-none", "g7-v1-ra-none", reviewNone.id],
    [
      "g7-v1-p-bonding",
      "g7-v1-cb-compound",
      practiceCompounds.id,
      compounds.id,
    ],
    ["g7-v1-g-phase", "g7-v1-p-state", "g7-v1-p-negative", state.id],
    [recovery.id, guided.id, practiceSymbol.id, checkSymbol.id],
    [practiceTs.id, reviewSymbol.id],
  ])
    for (const id of ids) {
      const q = all.find((t) => t.id === id)!;
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  const titles = [
    "Count the molecular mass",
    "Match room appearances",
    "Use the boiling threshold",
    "Order negative temperatures",
    "Identify displaced iodine",
    "Predict no displacement",
    "Name displacement products",
    "Infer from reaction data",
    "Compare compound types",
    "Predict solution acidity",
    "Interpret the chlorine test",
    "Separate the two trends",
    "Predict astatine’s state",
    "Explain the opposite trend",
  ];
  journey.practice.slice(0, 14).forEach((q, i) => (q.title = titles[i]));
  const recoveryTitles: Record<string, string> = {
    "w-outer": "Read outer electrons",
    "w-charge": "Count the gained charge",
    "r-species": "Separate molecule and ion",
    "r-state": "Use both state thresholds",
    "r-displace": "Compare the halogen pair",
    "r-gain": "Form a halide ion",
    "r-structure": "Explain harder gain",
    "r-compound": "Distinguish compound types",
    "r-colour": "Attach colour to conditions",
    "r-bleach": "Interpret bleaching",
    "r-relative": "Count both atomic masses",
  };
  for (const q of [...journey.warmup, ...journey.refresher])
    if (recoveryTitles[q.id.replace("g7-v1-", "")])
      q.title = recoveryTitles[q.id.replace("g7-v1-", "")];
  journey.practice[7].title = "Use reaction data";
  journey.practice[7].prompt =
    "Use these results to identify the most reactive sample.";
  journey.outcomes?.push(
    "Use wider supplied Group 7 symbols and construct full displacement, compound, state and electron-gain explanations.",
  );
}
