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
    id: `gr-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained explanation with each criterion. Full writing receives no automatic examiner mark.",
    hint: "Identify the relevant structure and interaction, then connect it to the stated property or use.",
    purpose:
      "Construct a graphite explanation using the specific causal mechanism.",
  };
}
const electrode = written(
  "p-electrode",
  "Explain an electrode",
  "Explain how graphite carries charge as an electrode. Does conduction alone prove it never reacts?",
  "Each carbon forms three covalent bonds in a sheet; one electron per carbon is delocalised. These electrons can move through the structure and carry charge. Conductivity provides an electrical pathway but does not prove chemical inertness in every system; carbon anodes can react and be consumed in aluminium extraction.",
  [
    "Connect three covalent bonds per carbon with one delocalised electron per carbon.",
    "Explain electron movement through graphite carrying charge.",
    "Distinguish electrical conduction from universal chemical inertness; carbon can be consumed at an anode.",
  ],
  "gr-v1-r-uses",
);
const conduction = written(
  "ca-conduction",
  "Explain conduction",
  "Use graphite’s bonding to explain electrical conduction. Identify the carrier and how charge passes through the solid.",
  "Each carbon forms three covalent bonds to other carbons in hexagonal layers. One electron per carbon is delocalised, so these electrons can move through the structure and carry charge. Carbon nuclei do not need to drift and the whole material need not have a net charge.",
  [
    "State three covalent bonds per carbon.",
    "State one delocalised electron per carbon.",
    "Explain electrons moving through the structure to carry charge, rather than moving nuclei or net charge.",
  ],
  "gr-v1-r-carriers",
);
const sliding = written(
  "ca-sliding",
  "Explain lubrication",
  "Explain why graphite can act as a lubricant. Identify which interactions are overcome and which bonds remain intact.",
  "Graphite has extended hexagonal sheets with strong covalent bonds within each layer. There are no covalent bonds between layers, and weaker attractions between layers can be overcome. Intact sheets slide over one another, reducing friction in suitable uses; the in-sheet carbon–carbon covalent bonds remain strong and intact.",
  [
    "Describe extended sheets with strong covalent bonds within layers.",
    "Locate weaker attractions between layers and no covalent interlayer bonds.",
    "Connect sliding of intact sheets with lubrication; retain strong in-layer bonds.",
  ],
  "gr-v1-r-sliding",
);
const melting = written(
  "ca-melting",
  "Explain melting",
  "Graphite is soft but has a very high melting temperature. Explain both properties using different interactions.",
  "Weak attractions between layers allow intact sheets to slide, making graphite soft. Disrupting its giant covalent structure requires many strong covalent bonds within sheets to be overcome. Much energy is needed, explaining the very high melting temperature. Easier sliding does not imply weak in-sheet bonds.",
  [
    "Explain softness using weak interlayer attractions and sliding of intact sheets.",
    "Identify many strong covalent bonds within the giant layered network.",
    "Link much energy to overcoming those bonds and high melting temperature; distinguish the changes.",
  ],
  "gr-v1-r-melting",
);
const allotropes = written(
  "ra-allotropes",
  "Compare carbon forms",
  "Compare pure diamond and graphite: explain their different hardness and electrical conduction using local bonding and arrangement.",
  "Both are giant covalent forms of carbon with strong bonds. Diamond has four covalent neighbours per carbon in a rigid three-dimensional network, giving hardness, and lacks mobile charged carriers in the pure GCSE model. Graphite has three covalent neighbours per carbon in sheets; weak interlayer attractions allow sliding, giving softness. One electron per carbon is delocalised and moves through the graphite to carry charge. Diamond also contains electrons; their presence alone is not conduction.",
  [
    "Keep both as strongly covalently bonded carbon allotropes.",
    "Connect diamond’s four-bond rigid three-dimensional network with hardness and lack of mobile carriers.",
    "Connect graphite’s three-bond layers and weak interlayer attractions with sliding; explain its delocalised mobile electrons carrying charge.",
  ],
  "gr-v1-r-coordination",
);
const crop = written(
  "ra-crop",
  "Interpret a sheet crop",
  "A model shows 96 carbons in three sheets with no sticks joining sheets. Explain why this does not mean C₉₆ molecules or no interlayer attractions.",
  "The 96 atoms are a finite crop of extended connected sheets, not a fixed molecular formula. Interior graphite carbon has three covalent neighbours in its sheet; omitted continuation at cut edges does not establish fewer neighbours in the bulk. Sticks represent strong covalent bonds, so no interlayer sticks means no covalent interlayer bonds, not no interactions. Weaker attractions between sheets still exist. Sizes and spacing are schematic.",
  [
    "Distinguish a finite crop from separate C₉₆ molecules and preserve three bulk covalent neighbours.",
    "Explain that absent interlayer sticks represent absence of covalent bonds, not all attractions.",
    "Identify weaker interlayer attractions and schematic/omitted continuation limits.",
  ],
  "gr-v1-r-coordination",
);
const pencil = written(
  "ra-pencil",
  "Explain a pencil mark",
  "Explain how graphite leaves a pencil mark while its sheets remain strongly bonded. Is electron motion the cause of the mark?",
  "Weaker attractions between graphite layers allow sheets to slide and detach onto paper while strong covalent bonds within each sheet remain intact. The deposited graphite makes the mark. Delocalised electron movement explains electrical conduction, not the mechanical transfer of layers; it does not require breaking all covalent bonds or making six-carbon molecules.",
  [
    "Locate weaker attractions between layers.",
    "Explain sliding/detachment and deposition on paper with strong in-sheet bonds retained.",
    "Distinguish mechanical layer transfer from electrical electron movement.",
  ],
  "gr-v1-r-sliding",
);
export const graphiteWritingAdditions = {
  practice: [electrode],
  check: [conduction, sliding, melting],
  review: [allotropes, crop, pencil],
};
export function extendGraphiteWriting(journey: LessonJourney) {
  journey.practice.push(...graphiteWritingAdditions.practice);
  journey.checkForms.push(graphiteWritingAdditions.check);
  journey.reviewForms.push(graphiteWritingAdditions.review);
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
      "r-carriers",
      "r-uses",
      "g-carriers",
      "p-pool",
      "p-conduction",
      "p-electrode",
      "p-neutral",
      "p-explain",
      "p-compare",
      "ca-carriers",
      "cb-electrode",
      "cb-pool",
      "ra-carriers",
      "gr-write-v1-p-electrode",
      "gr-write-v1-ca-conduction",
      "gr-write-v1-ra-allotropes",
    ],
    [
      "r-sliding",
      "g-sliding",
      "p-sliding",
      "p-pencil",
      "p-explain",
      "p-compare",
      "ca-sliding",
      "cb-lubricant",
      "ra-sliding",
      "rb-use",
      "gr-write-v1-ca-sliding",
      "gr-write-v1-ca-melting",
      "gr-write-v1-ra-pencil",
      "gr-write-v1-ra-allotropes",
    ],
    [
      "r-melting",
      "g-melting",
      "p-melting",
      "ca-melting",
      "rb-melting",
      "gr-write-v1-ca-melting",
    ],
    [
      "r-coordination",
      "g-coordination",
      "p-recognise",
      "p-neighbours",
      "p-boundary",
      "p-compare",
      "ca-neighbours",
      "ca-structure",
      "cb-diagram",
      "cb-compare",
      "ra-neighbours",
      "rb-crop",
      "gr-write-v1-ra-crop",
      "gr-write-v1-ra-allotropes",
    ],
  ];
  for (const raw of groups) {
    const ids = raw.map((id) =>
      id.startsWith("gr-write-") ? id : `gr-v1-${id}`,
    );
    for (const task of all.filter((q) => ids.includes(q.id)))
      task.exposureAliases = [
        ...new Set([
          ...(task.exposureAliases ?? []),
          ...ids.filter((id) => id !== task.id),
        ]),
      ];
  }
  const warm = ["Recall covalent bonding", "Recall charge carriers"];
  const refresh = [
    "Compare carbon neighbours",
    "Locate weaker attractions",
    "Recall mobile electrons",
    "Separate sliding and melting",
    "Connect conduction and use",
  ];
  journey.warmup.forEach((q, i) => {
    q.title = warm[i];
    q.conciseHeading = true;
  });
  journey.refresher.forEach((q, i) => {
    q.title = refresh[i];
    q.conciseHeading = true;
  });
  journey.guided.forEach((q) => {
    q.conciseHeading = true;
  });
  journey.practice.forEach((q) => {
    q.conciseHeading = true;
  });
  journey.practice[10].title = "Explain two properties";
  journey.practice[11].title = "Compare carbon forms";
  const checks = [
    [
      "Count carbon neighbours",
      "Recognise layers",
      "Explain sliding",
      "Identify carriers",
      "Explain melting",
    ],
    [
      "Interpret the sheets",
      "Explain lubrication",
      "Explain an electrode",
      "Count mobile contributions",
      "Compare carbon forms",
    ],
  ];
  journey.checkForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = checks[i][j])));
  const reviews = [
    ["Retrieve neighbours", "Retrieve intact bonds", "Compare conduction"],
    ["Retrieve melting", "Retrieve lubrication", "Interpret the crop"],
  ];
  journey.reviewForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = reviews[i][j])));
  journey.practiceGroups = [
    {
      label: "Layers and diagrams",
      taskIds: [0, 1, 9].map((i) => journey.practice[i].id),
    },
    {
      label: "Forces and uses",
      taskIds: [3, 4, 6, 7, 12].map((i) => journey.practice[i].id),
    },
    {
      label: "Carriers and comparisons",
      taskIds: [2, 5, 8, 10, 11].map((i) => journey.practice[i].id),
    },
  ];
}
