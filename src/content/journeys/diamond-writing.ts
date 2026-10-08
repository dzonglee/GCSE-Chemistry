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
    id: `dn-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare the retained response with each causal criterion. Full writing is manually reviewed; no automatic examiner mark is awarded.",
    hint: "Separate structure, bond strength and energy from charge-carrier mobility. Relate the specific property to the stated use.",
    purpose:
      "Construct a network-property explanation, not only recognise a prepared answer.",
  };
}
const tool = written(
  "p-tool",
  "Explain a cutting edge",
  "Explain why diamond is useful on a cutting edge. Does high hardness mean it cannot fracture?",
  "Each carbon forms four strong covalent bonds to other carbons throughout a rigid three-dimensional giant network. This resists scratching and cutting, giving high hardness useful on a cutting edge. Hardness is not resistance to every impact; diamond can still fracture.",
  [
    "Describe four strong covalent bonds per carbon in a rigid giant network.",
    "Link resistance to scratching/cutting and high hardness to the cutting-edge use.",
    "Distinguish hardness from unlimited resistance to fracture.",
  ],
  "dn-v1-r-hardness",
);
const energy = written(
  "ca-energy",
  "Explain melting",
  "Describe diamond’s structure and bonding, then explain its very high melting point using bond strength, extent and energy.",
  "Diamond has a giant covalent structure. Each carbon forms four covalent bonds to other carbon atoms in three dimensions. Many strong covalent bonds must be broken to disrupt this network, requiring much energy and explaining the very high melting point. Weak attractions between separate small molecules are not the relevant mechanism.",
  [
    "Describe a giant covalent network, not separate small molecules.",
    "State four covalent bonds per carbon to other carbons.",
    "Identify strong covalent bonds.",
    "State that many bonds must be broken/overcome to disrupt the network.",
    "Link much energy needed with very high melting point.",
  ],
  "dn-v1-r-energy",
);
const carriers = written(
  "ca-carriers",
  "Explain non-conduction",
  "Pure diamond contains electrons but does not conduct electricity. Explain why; is overall neutrality enough?",
  "Carbon's four outer electrons are involved in its four covalent bonds, rather than delocalised through the structure. Pure diamond has no delocalised electrons or mobile ions to carry electrical charge through it. Electrons still exist. Overall neutrality alone is insufficient: a neutral metal can conduct through mobile delocalised electrons.",
  [
    "Locate outer electrons in diamond's covalent bonding rather than claiming no electrons.",
    "Explain the absence of mobile charged carriers: no delocalised electrons or mobile ions.",
    "Reject neutrality alone using mobile charge carriers in an overall-neutral metal.",
  ],
  "dn-v1-r-carriers",
);
const hardness = written(
  "ca-hardness",
  "Explain diamond hardness",
  "Use diamond’s bonding and structure to explain why it resists scratching. Avoid an unsupported claim about every impact.",
  "Each carbon forms four strong covalent bonds to other carbon atoms in a rigid giant three-dimensional network. The strongly bonded network resists displacement/scratching, giving very high hardness. It can still fracture: hardness is not unlimited toughness or proof it can never break.",
  [
    "Describe four strong covalent bonds per carbon in a giant network.",
    "Connect the rigid strongly bonded structure to scratch resistance/high hardness.",
    "Distinguish scratch resistance from immunity to fracture.",
  ],
  "dn-v1-r-hardness",
);
const model = written(
  "ra-model",
  "Interpret the crop",
  "A drawing shows 64 linked carbons; an edge carbon has only two drawn links. Explain why this does not give C₆₄ molecules or two bonds per bulk carbon.",
  "The drawing is a finite cutout of a giant connected covalent network, not a complete discrete molecule. The neighbours continue into further neighbours; 64 is the model count, not a fixed molecular size. Some continuation bonds are outside the crop. Bulk diamond carbon forms four covalent bonds in three dimensions; this picture does not model actual surface termination chemistry.",
  [
    "Distinguish a connected giant network from a separate C₆₄ molecule.",
    "Explain omitted continuation at the finite boundary.",
    "Retain four bonds per bulk carbon; a crop does not establish actual surface chemistry.",
  ],
  "dn-v1-r-extent",
);
const silica = written(
  "ra-silica",
  "Explain silica",
  "Solid silica has continuing Si–O links and bulk formula SiO₂. Explain its high melting point and why a cropped Si₅O₄ motif is not its molecular formula.",
  "Silica is a giant covalent compound network, not separate small SiO₂ molecules. Many strong covalent bonds throughout the network need much energy to overcome, explaining its high melting point. The bulk formula gives a silicon:oxygen ratio of 1:2. The local Si₅O₄ crop omits continuation and is not a complete molecule or the bulk ratio.",
  [
    "Identify a giant covalent compound with continuing Si–O bonds.",
    "Connect many strong covalent bonds and much energy to high melting point.",
    "Distinguish bulk 1:2 composition from the incomplete local motif; do not invent separate Si₅O₄ molecules.",
  ],
  "dn-v1-r-extent",
);
const comparison = written(
  "ra-molecular",
  "Compare heating",
  "Methane boils without reacting; diamond’s giant structure is disrupted only with much energy. Explain the different interactions and what happens to bonds.",
  "Methane consists of separate small molecules. Boiling overcomes relatively weak intermolecular attractions while strong covalent bonds within each molecule remain intact. Diamond is a giant connected covalent network, so disrupting it requires many strong covalent bonds to be overcome and much energy. Having covalent bonds does not give every substance the same structure or thermal-change mechanism.",
  [
    "Describe methane as separate molecules and identify weak intermolecular attractions overcome on boiling.",
    "Retain strong covalent bonds within methane molecules.",
    "Describe diamond's giant network and many strong covalent bonds requiring much energy to overcome.",
  ],
  "dn-v1-r-energy",
);
export const diamondWritingAdditions = {
  practice: [tool],
  check: [energy, carriers, hardness],
  review: [model, silica, comparison],
};
export function extendDiamondWriting(journey: LessonJourney) {
  journey.practice.push(...diamondWritingAdditions.practice);
  journey.checkForms.push(diamondWritingAdditions.check);
  journey.reviewForms.push(diamondWritingAdditions.review);
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
      "r-four",
      "r-energy",
      "g-energy",
      "p-energy",
      "p-explain",
      "ca-structure",
      "ca-energy",
      "ra-energy",
    ]
      .map((id) => `dn-v1-${id}`)
      .concat(energy.id),
    [
      "w-boiling",
      "r-energy",
      "g-energy",
      "p-molecular",
      "p-compare",
      "cb-melting",
    ]
      .map((id) => `dn-v1-${id}`)
      .concat(comparison.id, energy.id),
    [
      "r-carriers",
      "g-carriers",
      "p-carriers",
      "p-neutral",
      "p-compare",
      "ca-conduct",
      "cb-neutral",
      "ra-carriers",
    ]
      .map((id) => `dn-v1-${id}`)
      .concat(carriers.id),
    ["r-hardness", "p-cutting", "p-fracture", "ca-tool", "cb-hard", "rb-use"]
      .map((id) => `dn-v1-${id}`)
      .concat(tool.id, hardness.id),
    [
      "r-extent",
      "g-network",
      "g-silica",
      "p-extent",
      "p-boundary",
      "p-silica",
      "cb-silica",
      "cb-crop",
      "rb-extent",
      "rb-crop",
    ]
      .map((id) => `dn-v1-${id}`)
      .concat(model.id, silica.id),
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
  for (const q of all) q.conciseHeading = true;
  const earlyTitles = [
    "Recall covalent sharing",
    "Keep molecules intact",
    "Distinguish a network",
    "Recall four neighbours",
    "Connect bonds and energy",
    "Distinguish mobile carriers",
    "Define hardness",
  ];
  [...journey.warmup, ...journey.refresher].forEach(
    (q, i) => (q.title = earlyTitles[i]),
  );
  const titles = [
    "Recognise connectivity",
    "Count direct neighbours",
    "Repair the energy claim",
    "Compare covalent structures",
    "Identify mobile carriers",
    "Use the metal comparison",
    "Explain a cutting tool",
    "Distinguish hardness",
    "Recognise silica",
    "Interpret cut edges",
    "Explain the network",
    "Compare structures",
  ];
  journey.practice.slice(0, 12).forEach((q, i) => (q.title = titles[i]));
  journey.practice[10].prompt =
    "Describe diamond’s structure and bonding, then explain its high melting point using bond strength, extent and energy.";
  journey.practice[11].prompt =
    "Compare methane boiling with disrupting diamond. Then explain why a neutral solid metal conducts but pure diamond does not.";
  journey.guided[1].title = "Explain melting";
  journey.guided[2].title = "Predict conduction";
  journey.guided[3].title = "Recognise silica";
  journey.guided[2].prompt =
    "Why does pure diamond not conduct, despite having electrons?";
  for (const q of journey.guided)
    if (q.model?.kind === "giant-covalent") {
      if (q.model.mode === "energy")
        q.model.instruction = "Choose bonds, extent and energy.";
      if (q.model.mode === "carriers")
        q.model.instruction = "Predict conduction and mobile carriers.";
    }
  journey.checkForms[1][2].prompt =
    "Which thermal explanation fits?";
  const checks = [
    [
      "Recall carbon neighbours",
      "Identify network extent",
      "Explain energy demand",
      "Identify charge carriers",
      "Link hardness and use",
    ],
    [
      "Recognise silica",
      "Interpret model extent",
      "Compare heating",
      "Compare neutral solids",
      "Qualify hardness",
    ],
  ];
  journey.checkForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = checks[i][j])));
  const reviews = [
    [
      "Retrieve carbon neighbours",
      "Retrieve melting energy",
      "Retrieve charge carriers",
    ],
    ["Retrieve connectivity", "Retrieve cutting use", "Retrieve crop limits"],
  ];
  journey.reviewForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = reviews[i][j])));
  journey.practiceGroups = [
    {
      label: "Networks and diagrams",
      taskIds: [0, 1, 8, 9].map((i) => journey.practice[i].id),
    },
    {
      label: "Bonding and uses",
      taskIds: [2, 6, 7, 10, 12].map((i) => journey.practice[i].id),
    },
    {
      label: "Comparisons and carriers",
      taskIds: [3, 4, 5, 11].map((i) => journey.practice[i].id),
    },
  ];
}
