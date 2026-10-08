import type { LearningTask, LessonJourney } from "../types";
const prefix = "is-write-v1-";
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
      "Compare your retained explanation with these criteria. Full writing receives manual self-review, without an automatic examiner mark.",
    hint: "Connect the structure to the force and energy, or connect charged ions to their ability to move. Treat a picture as a representation.",
    purpose:
      "Construct a structure–property explanation and evaluate the limits of the representation.",
  };
}
const model = written(
  "p-model",
  "Evaluate the drawing",
  "Describe two limits of this ion drawing and one thing it can show.",
  "It shows alternating positive sodium and negative chloride ions with equal numbers, supporting the simplest 1:1 ratio NaCl. A flat finite drawing omits depth and the rest of the giant crystal. Colours and drawn sphere sizes are representation choices; the picture does not show all electrostatic forces or prove isolated NaCl molecules.",
  [
    "Use the displayed opposite ion types and equal numbers as a useful feature (for example, the 1:1 ratio).",
    "Describe missing depth and/or omitted continuation beyond the finite edge.",
    "Give a second distinct limitation, such as illustrative sizes/colours or invisible forces; do not infer isolated NaCl molecules.",
  ],
  "is-v1-r-limits",
);
model.ionicSlice = true;
const force = written(
  "ca-force",
  "Explain the melting point",
  "Explain sodium chloride’s high melting point using its structure and bonding.",
  "Sodium chloride is a giant ionic lattice. Strong electrostatic attractions act in all directions between oppositely charged ions. Much energy is needed to overcome many of these attractions on melting, giving a high melting point. This is not weak attraction between separate NaCl molecules.",
  [
    "Identify a giant ionic lattice, rather than separate molecules.",
    "Name strong electrostatic attraction between oppositely charged ions throughout the lattice.",
    "Link the large energy needed to overcome these attractions to the high melting point.",
  ],
  "is-v1-r-force",
);
const conduction = written(
  "ca-conduction",
  "Explain the change in conduction",
  "Explain why solid NaCl does not conduct but molten NaCl does. Refer to particles and charge.",
  "Both states contain charged sodium and chloride ions. In the solid the ions are fixed in lattice positions, so they cannot move freely to carry charge. When molten the ions can move through the liquid and carry charge. The carriers are ions, not delocalised electrons.",
  [
    "Retain charged ions in the solid; do not say they become uncharged.",
    "Explain that fixed solid ions cannot move freely to carry charge.",
    "Explain that molten ions can move and carry charge; do not substitute moving electrons.",
  ],
  "is-v1-r-solid",
);
const diagram = written(
  "ca-diagram",
  "Interpret an ion diagram",
  "Identify the structure, deduce its formula and explain one limit of this drawing.",
  "The regular arrangement of opposite Na+ and Cl− ions represents a giant ionic lattice. Eight of each give the simplest 1:1 ratio, NaCl; the formula is not a separate molecule. A flat finite drawing omits depth and the continuing crystal, and its colours and sphere sizes are illustrative.",
  [
    "Identify a giant ionic lattice from the regular opposite ions.",
    "Use eight of each (or equal numbers) to deduce the simplest 1:1 ratio and NaCl formula.",
    "State a valid representational limit, such as missing depth/extent or illustrative sizes/colours; do not infer an isolated molecule.",
  ],
  "is-v1-r-giant",
);
diagram.ionicSlice = true;
const boiling = written(
  "ra-boiling",
  "Retrieve force and energy",
  "Explain why a giant ionic substance usually has a high boiling point.",
  "Many strong electrostatic attractions between oppositely charged ions hold the giant structure together. A large energy transfer is needed to overcome these attractions as the substance boils, so its boiling point is high. Do not replace ions with separate covalent NaCl molecules or explain the energy by electrons flowing.",
  [
    "Describe a giant structure with opposite ion charges.",
    "Identify strong electrostatic attractions between ions.",
    "Connect the large energy needed to overcome the attractions to the high boiling point.",
  ],
  "is-v1-r-force",
);
const solution = written(
  "ra-solution",
  "Explain dissolved salt",
  "NaCl has dissolved in water. Explain conduction and why this does not prove every ionic compound is soluble.",
  "Dissolved sodium and chloride ions are charged and can move through the solution, carrying charge. The carriers are ions, not delocalised electrons or unchanged NaCl molecules. The observation applies to this dissolved sample; it cannot show that every other ionic compound dissolves in water.",
  [
    "Identify mobile charged sodium/chloride ions as the charge carriers.",
    "Explain movement through the solution; do not use delocalised electrons or neutral molecules.",
    "Keep the solubility conclusion conditional: this sample dissolving does not establish universal ionic solubility.",
  ],
  "is-v1-r-mobile",
);
const pairs = written(
  "ra-model",
  "Correct the lattice claim",
  "Lee calls each neighbouring Na⁺/Cl⁻ pair a molecule and the sticks literal rods. Correct both claims.",
  "The NaCl formula describes the simplest 1:1 ion ratio in an extended lattice, not isolated pairs. Each ion attracts surrounding opposite ions in all directions. Sticks in a ball-and-stick representation help show relationships or positions; the crystal does not contain literal rods. A finite model also omits the rest of the crystal and may use illustrative sizes.",
  [
    "Explain that NaCl gives a simplest ion ratio, not a separate molecule.",
    "State that electrostatic attraction acts between surrounding opposite ions in all directions.",
    "Explain that sticks are representational, not literal rods; distinguish the model from the real extended structure.",
  ],
  "is-v1-r-limits",
);
export const ionicStructureWritingAdditions = {
  practice: [model],
  check: [force, conduction, diagram],
  review: [boiling, solution, pairs],
};
export function extendIonicStructureWriting(journey: LessonJourney) {
  journey.practice.push(...ionicStructureWritingAdditions.practice);
  journey.checkForms.push(ionicStructureWritingAdditions.check);
  journey.reviewForms.push(ionicStructureWritingAdditions.review);
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
      "is-v1-p-melting",
      "is-v1-p-explain",
      "is-v1-ca-force",
      "is-v1-cb-boiling",
      "is-v1-ra-mp",
      force.id,
      boiling.id,
    ],
    [
      "is-v1-g-solid",
      "is-v1-g-molten",
      "is-v1-p-solid-error",
      "is-v1-p-molten-error",
      "is-v1-ca-solid",
      "is-v1-ca-liquid",
      "is-v1-ra-solid",
      conduction.id,
    ],
    [
      "is-v1-g-solution",
      "is-v1-p-solution-limit",
      "is-v1-cb-water",
      "is-v1-rb-liquid",
      solution.id,
    ],
    ["is-v1-p-slice", "is-v1-p-size", "is-v1-ca-model", model.id, diagram.id],
    [
      "is-v1-g-lattice",
      "is-v1-p-all-directions",
      "is-v1-cb-ratio",
      "is-v1-rb-lattice",
      pairs.id,
    ],
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
  for (const q of all) if (q.ionicSlice) q.compactIonicSlice = true;
  const titles = [
    "Recall opposite charges",
    "Balance the ion ratio",
    "Describe a giant lattice",
    "Connect force and energy",
    "Keep the solid ions charged",
    "Identify mobile carriers",
    "Evaluate a flat diagram",
  ];
  [...journey.warmup, ...journey.refresher].forEach(
    (q, i) => (q.title = titles[i]),
  );
  journey.practice[0].title = "Deduce the formula";
  journey.practice[10].title = "Connect structure and properties";
  journey.practice[10].prompt =
    "Explain NaCl’s high melting point and its solid, molten and solution conductivity.";
  journey.guided[0].title = "Inspect the lattice";
  journey.guided[0].prompt =
    "Inspect an interior NaCl ion. How many nearest opposite ions surround it?";
  journey.guided[1].title = "Test solid conduction";
  journey.guided[2].title = "Test molten conduction";
  journey.guided[3].title = "Test dissolved conduction";
  const prompts = [
    "Does solid NaCl conduct? Explain the ions.",
    "Name the charge carriers in molten NaCl.",
    "Why can NaCl dissolved in water conduct?",
  ];
  journey.guided.slice(1).forEach((q, i) => {
    q.prompt = prompts[i];
    if (q.model?.kind === "ionic-conduction")
      q.model.instruction = "Predict conduction and carriers.";
  });
  journey.practiceGroups = [
    {
      label: "Structure and representations",
      taskIds: [0, 1, 2, 8, 9, 11].map((i) => journey.practice[i].id),
    },
    {
      label: "Energy and conduction",
      taskIds: [3, 4, 5, 6, 7, 10].map((i) => journey.practice[i].id),
    },
  ];
}
