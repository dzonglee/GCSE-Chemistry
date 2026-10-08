import type { LearningTask, LessonJourney } from "../types";
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
): LearningTask {
  return {
    id: `mp-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained response with the causal criteria. Full writing is manually reviewed; no automatic examiner mark is awarded.",
    hint: "Distinguish forces within and between molecules. Link force strength to energy and the property; consider charge carriers separately.",
    purpose:
      "Construct a molecular-property explanation with a justified scope.",
  };
}
const trend = written(
  "p-trend",
  "Explain the family",
  "Propane boils at −42 °C; larger butane at −1 °C. Explain this similar-family trend using forces and energy.",
  "Butane has larger molecules and the higher supplied boiling point. In this similar family its intermolecular attractions are stronger, requiring more energy to overcome. Strong covalent bonds within the molecules remain intact during boiling. Size alone is not a universal predictor across unrelated substances.",
  [
    "Identify butane as larger and −1 °C as higher than −42 °C.",
    "Connect stronger intermolecular attractions to more energy and higher boiling point.",
    "Keep within-molecule covalent bonds intact and qualify the similar-family comparison.",
  ],
  "mp-v1-r-size",
);
const boiling = written(
  "ca-boiling",
  "Explain low boiling",
  "Explain why a small-molecule liquid can boil at a low temperature despite strong covalent bonds.",
  "Strong covalent bonds hold atoms together within each molecule. Relatively weak intermolecular attractions need relatively little energy to overcome, giving a low boiling point. Boiling separates intact molecules; it does not break their covalent bonds.",
  [
    "Locate strong covalent bonds within molecules and relatively weak attractions between them.",
    "Link relatively little energy to overcome intermolecular attractions with low boiling point.",
    "State that the molecules and their covalent bonds remain intact.",
  ],
  "mp-v1-r-force",
);
const conduction = written(
  "ca-conduction",
  "Explain neutral motion",
  "A liquid contains moving neutral molecules, no ions and no delocalised electrons. Explain why it does not conduct electricity.",
  "Electrical conduction requires mobile charged carriers. These moving molecules have zero overall charge, so their motion does not carry net charge. Electrons within their covalent bonds are not a freely moving carrier population; the stated liquid has neither mobile ions nor delocalised electrons.",
  [
    "State that conduction requires carriers with both charge and mobility.",
    "Use the zero overall charge of the moving molecules; do not claim they cannot move or contain no electrons.",
    "Use the absence of mobile ions and delocalised electrons.",
  ],
  "mp-v1-r-neutral",
);
const data = written(
  "ca-trend",
  "Explain the data",
  "Similar molecular substances A and B boil at −25 °C and +15 °C. B has larger molecules. Explain which boils higher and why.",
  "B boils higher: +15 °C exceeds −25 °C. In this similar comparison the larger B molecules have stronger intermolecular attractions. More energy is needed to overcome those attractions, explaining the higher boiling point. Internal covalent bonds remain intact.",
  [
    "Use the signed data to identify B as higher.",
    "Connect the supplied larger size to stronger intermolecular attractions in the stated similar comparison.",
    "Connect greater energy demand to higher boiling point without breaking covalent bonds.",
  ],
  "mp-v1-r-size",
);
const melting = written(
  "ra-melting",
  "Explain molecular melting",
  "A small-molecule solid melts without reacting. Explain its relatively low melting point and what happens to its covalent bonds.",
  "Relatively weak intermolecular attractions need relatively little energy to overcome sufficiently for molecules to leave their fixed arrangement and move past one another. This explains the relatively low melting point. Strong covalent bonds within the molecules remain intact, and attractions still act in the liquid.",
  [
    "Distinguish weak intermolecular attractions from strong within-molecule covalent bonds.",
    "Link relatively little energy to the low melting point and changed molecular arrangement/mobility.",
    "Retain intact molecules and covalent bonds; do not claim all liquid attractions disappear.",
  ],
  "mp-v1-r-force",
);
const solution = written(
  "ra-solution",
  "Compare carriers",
  "A neutral molecular liquid does not conduct. A molecular acid forms mobile ions in water. Explain why the same prediction cannot be applied to both.",
  "The neutral liquid has moving molecules with zero overall charge and no mobile charged carriers. The acid solution contains mobile charged ions, so it can carry current. Conductivity depends on the particles actually present; ion formation in water is not delocalised-electron metallic conduction, and the prediction is not that every molecular solution conducts.",
  [
    "Explain neutral molecular motion versus mobile charged carriers.",
    "Use the explicitly supplied mobile ions to explain conduction of this solution.",
    "Distinguish the solution from the original neutral liquid without generalising to every molecular solution or claiming metallic electrons.",
  ],
  "mp-v1-r-neutral",
);
const evidence = written(
  "ra-evidence",
  "Use all the evidence",
  "X has low melting and boiling points and does not conduct as a liquid. Explain why simple molecular structure fits these observations. Does one property alone prove the structure?",
  "Relatively weak intermolecular attractions require little energy to overcome, explaining low melting and boiling points while internal covalent bonds remain strong. Neutral molecules lack mobile charged carriers, explaining the given liquid's poor conduction. This combined evidence is consistent with simple molecular structure; one observation alone does not uniquely establish every structure, and not all covalent substances consist of small molecules.",
  [
    "Explain low melting/boiling with intermolecular force strength and energy while retaining internal bonds.",
    "Explain liquid non-conduction using neutral particles/no mobile charged carriers.",
    "Treat the combined observations as supporting evidence; one property alone is not conclusive and covalent does not always mean small molecular.",
  ],
  "mp-v1-r-force",
);
export const molecularWritingAdditions = {
  practice: [trend],
  check: [boiling, conduction, data],
  review: [melting, solution, evidence],
};
export function extendMolecularWriting(journey: LessonJourney) {
  journey.practice.push(...molecularWritingAdditions.practice);
  journey.checkForms.push(molecularWritingAdditions.check);
  journey.reviewForms.push(molecularWritingAdditions.review);
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
      "mp-v1-r-force",
      "mp-v1-g-boiling",
      "mp-v1-p-explain",
      "mp-v1-ca-force",
      "mp-v1-ra-force",
      boiling.id,
      melting.id,
      evidence.id,
    ],
    [
      "mp-v1-r-neutral",
      "mp-v1-p-explain",
      "mp-v1-g-conduction",
      "mp-v1-p-conduct",
      "mp-v1-p-acid",
      "mp-v1-ca-carrier",
      "mp-v1-cb-movement",
      conduction.id,
      solution.id,
    ],
    [
      "mp-v1-r-size",
      "mp-v1-g-family",
      "mp-v1-p-energy",
      "mp-v1-ca-trend",
      "mp-v1-cb-data",
      "mp-v1-rb-energy",
      trend.id,
      data.id,
    ],
  ])
    for (const id of ids) {
      const task = all.find((q) => q.id === id)!;
      task.exposureAliases = [
        ...new Set([
          ...(task.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  for (const task of all) task.conciseHeading = true;
  const titles = [
    "Recall a covalent bond",
    "Recall charge carriers",
    "Locate molecular forces",
    "Compare energy demands",
    "Keep oxygen molecules intact",
    "Distinguish charge and motion",
    "Explain a similar-family trend",
  ];
  [...journey.warmup, ...journey.refresher].forEach(
    (q, i) => (q.title = titles[i]),
  );
  const practiceTitles = [
    "Explain molecular melting",
    "Locate the changed force",
    "Conserve the atom inventory",
    "Correct the weak-bond claim",
    "Predict neutral conduction",
    "Combine the evidence",
    "Order signed temperatures",
    "Calculate the difference",
    "Connect force and energy",
    "Qualify the size trend",
    "Use solution particles",
    "Distinguish giant structures",
    "Explain both properties",
  ];
  journey.practice
    .slice(0, 13)
    .forEach((q, i) => (q.title = practiceTitles[i]));
  const checkTitles = [
    [
      "Identify boiling forces",
      "Conserve bromine atoms",
      "Identify charge carriers",
      "Explain the size trend",
    ],
    [
      "Keep nitrogen bonds intact",
      "Conserve nitrogen atoms",
      "Distinguish neutral motion",
      "Interpret signed evidence",
    ],
  ];
  journey.checkForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = checkTitles[i][j])));
  const reviewTitles = [
    ["Retrieve the force distinction", "Retrieve charge carriers"],
    ["Retrieve energy demand", "Distinguish covalent structures"],
  ];
  journey.reviewForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = reviewTitles[i][j])));
  journey.practice[12].prompt =
    "Explain a neutral small-molecule liquid’s low boiling point and poor electrical conduction despite strong covalent bonds.";
  journey.guided[1].prompt =
    "Do moving neutral Cl₂ molecules make this liquid conduct?";
  journey.guided[2].title = "Compare the family";
  journey.guided[2].prompt =
    "Similar hydrocarbons: ethane −89 °C, propane −42 °C, butane −1 °C. Why do boiling points rise?";
  for (const task of journey.guided)
    if (task.model?.kind === "molecular-properties")
      task.model.instruction =
        task.model.mode === "boiling"
          ? "Predict the force overcome; compare liquid and gas."
          : task.model.mode === "conduction"
            ? "Predict conduction and charge carriers."
            : "Predict attraction strength and energy demand.";
  journey.practiceGroups = [
    {
      label: "Forces and physical changes",
      taskIds: [0, 1, 2, 3, 8, 12].map((i) => journey.practice[i].id),
    },
    {
      label: "Conduction and structure",
      taskIds: [4, 5, 10, 11].map((i) => journey.practice[i].id),
    },
    {
      label: "Supplied trends",
      taskIds: [6, 7, 9, 13].map((i) => journey.practice[i].id),
    },
  ];
}
