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
    id: `mb-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare the retained response with each causal criterion. Full writing is manually reviewed; no automatic examiner mark is awarded.",
    hint: "Name the particles, charges and movement or force. Link the structural change to the stated property.",
    purpose:
      "Construct an independent metallic structure–property explanation.",
  };
}
const force = written(
  "p-force",
  "Explain metallic strength",
  "Explain why most metals have high melting points. Name the attracting particles and link force strength to energy.",
  "A metal has a giant structure of positive cores and negative delocalised electrons. Strong electrostatic attractions between them require much energy to overcome, explaining the relatively high melting points of most metals. Melting points vary and exceptions such as mercury exist; the cores include nuclei and inner electrons, not bare nuclei.",
  [
    "Identify positive cores and negative delocalised electrons in a giant structure.",
    "Link strong electrostatic attraction to much energy needed to overcome it and high melting point.",
    "Qualify the trend as most metals; do not describe small molecules or bare nuclei.",
  ],
  "mb-v1-r-energy",
);
const bonding = written(
  "ca-bonding",
  "Explain the high melting point",
  "A metal has a high melting point. Explain this using metallic structure, charges, forces and energy.",
  "The giant metallic structure contains positive metal cores and negative delocalised electrons. Strong electrostatic attraction between these opposite charges holds it together. Much energy is needed to overcome these attractions, explaining the high melting point of the stated metal.",
  [
    "Name a giant structure, positive metal cores and negative delocalised electrons.",
    "Identify strong electrostatic attraction between the opposite charges.",
    "Connect much energy to overcome the attractions with the stated high melting point.",
  ],
  "mb-v1-r-energy",
);
const carriers = written(
  "ca-carriers",
  "Explain charge and heat",
  "Explain how delocalised electrons help solid copper conduct electricity and thermal energy. Distinguish the quantities transferred.",
  "Delocalised electrons move through the solid metal and carry electrical charge. They also transfer thermal energy through the metal from hotter to cooler regions. Positive cores do not flow through the solid to carry current. Electrical charge and thermal energy are different quantities; this does not claim electrons are the only contribution to thermal conduction.",
  [
    "Identify mobile delocalised electrons carrying electrical charge through the solid structure.",
    "Explain electron transfer of thermal energy from hotter to cooler regions.",
    "Distinguish charge from energy and reject positive-core flow as the solid current mechanism.",
  ],
  "mb-v1-r-electrons",
);
const hardness = written(
  "ca-hardness",
  "Explain alloy hardness",
  "An alloy contains different-sized atoms and is harder than its pure-metal comparison. Explain the structural cause and its effect on sliding.",
  "Different-sized atoms distort the regular layers of the pure metal. The distorted layers slide less easily, explaining the alloy's greater hardness. Metallic attraction and delocalised electrons remain; this does not mean the alloy is immovable or that all charge carriers disappear.",
  [
    "Use different atom sizes, not different colours or invented atom shapes.",
    "Link different sizes to distortion of regular layers.",
    "Link more difficult layer sliding to hardness without removing metallic bonding or all electrons.",
  ],
  "mb-v1-r-alloy",
);
const shaping = written(
  "ra-shaping",
  "Explain bending",
  "A pure metal bends while remaining held together. Explain what moves and why bonding can remain.",
  "Layers of positive metal cores can slide past one another during shaping. Attraction between the positive cores and negative delocalised electrons remains as the layers change position. The maintained metallic bonding allows bending without the whole structure breaking apart; the metal does not turn into separate molecules.",
  [
    "Identify layer movement during bending.",
    "Name maintained attraction between positive cores and negative delocalised electrons.",
    "Connect movement with retained bonding; do not claim every attraction disappears or molecules form.",
  ],
  "mb-v1-r-layers",
);
const comparison = written(
  "ra-carriers",
  "Compare conductors",
  "Solid copper and molten sodium chloride both conduct electricity. Explain their different carriers and why solid sodium chloride does not conduct.",
  "Solid copper has delocalised electrons which carry electrical charge as they move through its structure. In molten sodium chloride, positive and negative ions can move and carry charge. In solid sodium chloride the ions are held in fixed lattice positions and cannot move through it to carry current. The metal's positive cores are not flowing current carriers.",
  [
    "Explain solid copper using charged delocalised electrons moving through its structure.",
    "Explain molten sodium chloride using mobile positive and negative ions.",
    "Explain solid sodium chloride using fixed ions, not absence of charged particles.",
  ],
  "mb-v1-r-electrons",
);
const conductivity = written(
  "ra-alloy",
  "Explain the alloy result",
  "Alloy Y conducts less well than the pure metal, but still conducts. Explain both results using atom sizes and electron movement.",
  "Different-sized atoms distort the layers or structure. This can restrict the movement of delocalised electrons, explaining the supplied lower conductivity. Delocalised electrons remain mobile charge carriers, so the alloy still conducts. The comparison is supplied evidence, not a universal numerical rule for every alloy.",
  [
    "Connect different atom sizes to distortion of layers or structure.",
    "Link that distortion to restricted delocalised-electron movement and the supplied lower conductivity.",
    "Explain continued conduction with retained mobile charged electrons; do not claim every alloy is an insulator.",
  ],
  "mb-v1-r-alloy",
);
export const metallicWritingAdditions = {
  practice: [force],
  check: [bonding, carriers, hardness],
  review: [shaping, comparison, conductivity],
};
export function extendMetallicWriting(journey: LessonJourney) {
  journey.practice.push(...metallicWritingAdditions.practice);
  journey.checkForms.push(metallicWritingAdditions.check);
  journey.reviewForms.push(metallicWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  const groups = [
    [
      "r-core",
      "r-energy",
      "g-attraction",
      "p-bond",
      "p-exception",
      "ca-bond",
      "cb-high-melting",
      "rb-bond",
      "rb-energy",
    ]
      .map((id) => `mb-v1-${id}`)
      .concat(force.id, bonding.id),
    [
      "r-electrons",
      "r-charge",
      "g-conduction",
      "p-carrier",
      "p-thermal",
      "p-explain",
      "ca-carrier",
      "ca-heat",
      "cb-neutral",
      "ra-current",
    ]
      .map((id) => `mb-v1-${id}`)
      .concat(carriers.id, comparison.id),
    ["r-layers", "g-layers", "p-pure", "cb-slide", "rb-slide"]
      .map((id) => `mb-v1-${id}`)
      .concat(shaping.id),
    [
      "r-alloy",
      "g-alloy",
      "p-size",
      "p-conductivity",
      "p-alloy-explain",
      "ca-hardness",
      "cb-alloy-conduction",
      "ra-alloy",
    ]
      .map((id) => `mb-v1-${id}`)
      .concat(hardness.id, conductivity.id),
  ];
  for (const ids of groups)
    for (const id of ids) {
      const q = all.find((t) => t.id === id)!;
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  for (const q of all) q.conciseHeading = true;
  const titles = [
    "Recall opposite charges",
    "Recall mobile carriers",
    "Recall giant structure",
    "Identify positive cores",
    "Explain delocalisation",
    "Distinguish bulk and carrier charge",
    "Recall retained attraction",
    "Recall atom-size distortion",
    "Connect force and energy",
  ];
  [...journey.warmup, ...journey.refresher].forEach(
    (q, i) => (q.title = titles[i]),
  );
  journey.guided[1].title = "Trace electron conduction";
  journey.guided[2].title = "Slide a metal layer";
  journey.guided[3].title = "Compare an alloy";
  journey.guided[2].prompt =
    "Bend a pure metal: what happens to its metallic bonding?";
  const layerModel = journey.guided[2].model;
  if (layerModel?.kind === "metallic-properties")
    layerModel.instruction =
      "Move a layer; predict whether attraction remains.";
  const checks = [
    [
      "Identify metal carriers",
      "Identify metallic attraction",
      "Explain alloy sliding",
      "Calculate the atom fraction",
      "Identify energy transfer",
    ],
    [
      "Distinguish neutrality and carriers",
      "Retain bonding during sliding",
      "Interpret alloy conduction",
      "Calculate the atom fraction",
      "Explain melting energy",
    ],
  ];
  journey.checkForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = checks[i][j])));
  const reviews = [
    [
      "Retrieve charge transport",
      "Retrieve alloy hardness",
      "Retrieve core composition",
    ],
    [
      "Retrieve metallic attraction",
      "Retrieve layer sliding",
      "Retrieve melting energy",
    ],
  ];
  journey.reviewForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = reviews[i][j])));
  journey.practiceGroups = [
    {
      label: "Bonding and carriers",
      taskIds: [0, 1, 4, 8, 9, 13, 15].map((i) => journey.practice[i].id),
    },
    {
      label: "Layers and alloy evidence",
      taskIds: [2, 3, 10, 11, 12, 14].map((i) => journey.practice[i].id),
    },
    {
      label: "Composition",
      taskIds: [5, 6, 7].map((i) => journey.practice[i].id),
    },
  ];
}
