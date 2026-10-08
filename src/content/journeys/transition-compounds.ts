import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";
const prefix = "tm-chem-v1-";
function pick(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  recovery = "r-compound",
) {
  const task = choice(
    prefix + id,
    prompt,
    answer,
    errors,
    explanation,
    "Distinguish the named substance, observation and supported conclusion.",
    "Interpret named chemical examples without converting a general property into a universal rule.",
  );
  task.title = title;
  task.followUp = "tm-v1-" + recovery;
  return task;
}
function write(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): LearningTask {
  return {
    id: prefix + id,
    title,
    prompt,
    answer,
    rubric,
    conciseHeading: true,
    explanation:
      "Compare the named substances and the limits of the supplied evidence with the criteria. Your explanation is saved for self-review; it receives no automatic examiner mark.",
    hint: "Name the substance and property; say what the observation cannot establish.",
    purpose:
      "Construct an evidence-based chemical explanation, including the limits of generalisation.",
    followUp: "tm-v1-r-compound",
  };
}
const refresher = pick(
  "r-catalyst",
  "Element or compound?",
  "MnO₂ catalyses peroxide decomposition. Is it an element, compound or product?",
  "A manganese–oxygen compound",
  {
    "Pure manganese metal": "MnO₂ contains oxygen as well as manganese.",
    "The oxygen product itself":
      "The catalyst is distinct from the oxygen produced.",
  },
  "Manganese dioxide is a compound catalyst; hydrogen peroxide forms water and oxygen. A catalyst need not be the pure transition-metal element.",
  "r-catalyst",
);
const manganese = pick(
  "g-manganese",
  "A compound catalyst",
  "Which conclusion fits these hypothetical MnO₂ runs?",
  "Faster early oxygen production; equal final volumes",
  {
    "More oxygen at completion because the catalyst adds oxygen":
      "Identical limiting-reactant quantities give the same final volume in these completed runs.",
    "No early difference because final volumes match":
      "Rate and completed amount are different comparisons.",
  },
  "Manganese dioxide (MnO₂) catalyses hydrogen peroxide decomposition. The supplied hypothetical figures show 22 versus 14 cm³ at 20 s and 24 cm³ in both completed runs. These are teaching values, not measurements from the RSC experiment.",
  "r-catalyst",
);
refresher.hint =
  "Read both element symbols in MnO₂. A compound contains chemically combined elements.";
manganese.model = {
  kind: "transition-catalyst",
  initial: ["same", "greater"],
  instruction: "Predict the oxygen volumes.",
};
const cobalt = pick(
  "g-cobalt",
  "Predict the paper colour",
  "What does the cobalt paper illustrate?",
  "A coloured compound whose colour depends on conditions",
  {
    "Cobalt metal changes from blue to pink":
      "The observation concerns cobalt chloride on paper, not pure cobalt metal.",
    "Every cobalt compound must be pink":
      "Different compounds and conditions can have different colours.",
  },
  "Dried cobalt chloride indicator paper is blue; after contact with water it becomes pink. This paper-specific observation exemplifies coloured compounds. It does not establish one colour for all hydrated solids or every cobalt compound.",
);
cobalt.model = {
  kind: "transition-colour",
  instruction: "Predict the wet paper colour.",
};
const chromium = pick(
  "p-chromium",
  "Use supplied chromium evidence",
  "Supplied solutions: chromate(VI) yellow; dichromate(VI) orange. What follows?",
  "Different chromium compounds can have different colours",
  {
    "Chromium metal must be yellow":
      "A compound observation does not describe the pure metal.",
    "Yellow and orange prove two different chromium ion charges":
      "Both supplied names contain VI. Colour alone does not establish different charges.",
  },
  "The supplied chromate/dichromate observations exemplify coloured chromium compounds. Both contain chromium in oxidation state VI; the details of complex ions and their equilibrium are beyond this lesson. Use supplied evidence rather than infer an ion charge from colour.",
);
const nickel = pick(
  "p-nickel",
  "Compare two catalysts",
  "Nickel metal catalyses hydrogenation; MnO₂ catalyses peroxide decomposition. Which conclusion fits?",
  "A transition-metal element or compound can be a catalyst",
  {
    "Every transition metal catalyses every reaction":
      "Different reactions require appropriate catalysts.",
    "MnO₂ is pure manganese because it is a catalyst":
      "Catalytic role does not erase the compound's oxygen atoms.",
  },
  "Nickel is an element catalyst; manganese dioxide is a compound catalyst. A chemical role and a substance classification answer different questions. Appropriate catalysts depend on the reaction.",
  "r-catalyst",
);
const compare = write(
  "p-explain",
  "Explain the evidence",
  "CoCl₂ paper is blue dry and pink wet. Explain why this describes a coloured compound, rather than cobalt metal.",
  "Cobalt chloride is a compound containing cobalt and chlorine, whereas cobalt metal is an element. The supplied paper colours depend on the compound's conditions. They exemplify coloured compounds but cannot assign one colour to the metal or all cobalt compounds.",
  [
    "Cobalt chloride is a compound; pure cobalt metal is a different substance.",
    "Use blue dry/pink with water as the supplied paper-specific evidence.",
    "Limit the conclusion: neither cobalt metal's appearance nor one universal compound colour follows.",
  ],
);
const checkElement = pick(
  "ca-catalysts",
  "Classify named catalysts",
  "Iron catalyses ammonia formation; MnO₂ catalyses peroxide decomposition. Which is the compound?",
  "MnO₂",
  {
    "Iron metal": "Iron metal contains one element; MnO₂ contains two.",
    "Both must be compounds because they catalyse reactions":
      "Catalytic role does not determine element/compound classification.",
  },
  "Iron metal is an element catalyst; manganese dioxide is a compound catalyst. Their roles depend on the named reactions.",
  "r-catalyst",
);
const checkExplain = write(
  "ca-colour",
  "Explain coloured compounds",
  "Chromium-containing solutions X and Y are yellow and orange. Explain what this supports, and why colour alone cannot identify the compounds or their ion charges.",
  "The supplied colours exemplify coloured compounds containing chromium. Different compounds/conditions can give different colours. Colour alone cannot uniquely identify a substance or establish an ion charge; additional composition or chemical evidence is needed.",
  [
    "Use the supplied coloured solutions as examples of compounds containing chromium, rather than chromium metal.",
    "Different colours do not contradict the general coloured-compound property.",
    "Colour alone is insufficient for unique compound identity or ion charge.",
  ],
);
const reviewNickel = pick(
  "ra-nickel",
  "Retrieve the catalyst distinction",
  "Nickel catalyses a named hydrogenation reaction. Does that establish every nickel compound catalyses all reactions?",
  "No; the named substance and reaction matter",
  {
    "Yes; catalyst is a universal element label":
      "The supplied example concerns nickel metal in a particular reaction.",
    "No; nickel cannot be a catalyst":
      "That rejects the supplied valid example.",
  },
  "A named nickel catalyst example does not establish universal behaviour for its compounds or other reactions.",
  "r-catalyst",
);
nickel.followUp = refresher.id;
checkElement.followUp = refresher.id;
const reviewCobalt = write(
  "ra-cobalt",
  "Explain the claim",
  "‘Every cobalt compound is pink because wet cobalt chloride paper is pink.’ Explain the error.",
  "The observation concerns cobalt chloride indicator paper after contact with water. It supports one coloured compound under those conditions, not every cobalt compound. The same paper is blue when dried, so conditions also matter.",
  [
    "Name cobalt chloride indicator paper and contact with water.",
    "Limit the observation to this compound/condition, rather than all cobalt compounds.",
    "Use the dried-blue observation to explain why conditions matter.",
  ],
);
const checkPhysical = write(
  "ca-physical",
  "Two physical differences",
  "Give two distinct physical differences between transition metals and Group 1. State each comparison's direction.",
  "Transition metals generally have higher melting points and higher densities than Group 1 metals. Greater hardness or strength are also suitable distinct physical comparisons.",
  [
    "Give two distinct physical comparisons, such as melting point (or boiling point), density, hardness or strength.",
    "Correct direction: selected transition metals generally have higher melting/boiling points and densities, or are harder/stronger than Group 1.",
    "Compound colours and ion charges do not answer this physical-property request; avoid universal claims about every metal.",
  ],
);
checkPhysical.followUp = "tm-v1-r-physical";
const reviewPhysical = write(
  "ra-physical",
  "Physical comparisons",
  "Give two physical properties of Group 1 compared with transition metals. State each direction.",
  "Group 1 metals generally have lower melting points and densities than the selected transition metals. Being softer or less strong are also suitable distinct comparisons.",
  [
    "Two distinct physical properties are given, rather than repeating the same property.",
    "Use the Group 1 comparison direction: generally lower melting/boiling points and densities, softer or less strong.",
    "Do not replace physical comparisons with compound colour or ion-charge statements.",
  ],
);
reviewPhysical.followUp = "tm-v1-r-physical";
export const transitionCompounds = {
  refresher: [refresher],
  guided: [manganese, cobalt],
  practice: [chromium, nickel, compare],
  check: [checkElement, checkExplain, checkPhysical],
  review: [reviewNickel, reviewCobalt, reviewPhysical],
};
export function extendTransitionCompounds(journey: LessonJourney) {
  journey.refresher.push(...transitionCompounds.refresher);
  journey.guided.push(...transitionCompounds.guided);
  journey.practice.push(...transitionCompounds.practice);
  journey.practiceGroups = [
    {
      label: "Compare properties",
      taskIds: [
        "tm-v1-p-data",
        "tm-v1-p-hard",
        "tm-v1-p-react",
        "tm-v1-p-explain",
      ],
    },
    {
      label: "Charges and classification",
      taskIds: ["tm-v1-p-location", "tm-v1-p-electrons", "tm-v1-p-formula"],
    },
    {
      label: "Interpret coloured compounds",
      taskIds: ["tm-v1-p-colour", chromium.id, compare.id],
    },
    {
      label: "Interpret catalysts",
      taskIds: ["tm-v1-p-haber", "tm-v1-p-table", nickel.id],
    },
  ];
  journey.checkForms.push(transitionCompounds.check);
  journey.reviewForms.push(transitionCompounds.review);
  const all = [
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const ids of [
    [refresher.id, checkElement.id],
    ["tm-v1-g-catalyst", manganese.id],
    [cobalt.id, compare.id, reviewCobalt.id],
    [chromium.id, checkExplain.id],
    [nickel.id, reviewNickel.id],
    ["tm-v1-p-explain", checkPhysical.id, reviewPhysical.id],
  ]) {
    for (const id of ids) {
      const task = all.find((t) => t.id === id)!;
      task.exposureAliases = [
        ...new Set([
          ...(task.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  }
  journey.outcomes?.push(
    "Interpret named chromium/cobalt coloured compounds and manganese/nickel catalysts, with explicit substance and evidence limits.",
  );
}
