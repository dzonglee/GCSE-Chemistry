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
    id: `ps-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare the retained explanation with the criteria. No automatic examiner mark is awarded.",
    hint: "Distinguish covalent bonds within a molecule from forces between molecules; use the relevant representation or supplied evidence.",
    purpose:
      "Construct a polymer structure, physical-change or representation explanation independently.",
  };
}
const correction = written(
  "p-correction",
  "Correct a force explanation",
  "A learner says poly(ethene) is solid because methane’s weak covalent bonds break at room temperature. Correct the explanation.",
  "Methane has much smaller molecules than poly(ethene). Its intermolecular forces are weaker and need less energy to overcome, giving a lower state-change temperature. Strong covalent bonds within both kinds of molecule stay intact in the physical change; methane does not become carbon and hydrogen atoms.",
  [
    "Compare smaller methane with much larger polymer molecules.",
    "Link intermolecular-force strength to energy and state-change temperature.",
    "Reject breaking weak covalent bonds as the state explanation; keep molecules intact.",
  ],
  "ps-v1-r-phase",
);
const state = written(
  "ca-state",
  "Explain different states",
  "Methane is a gas and poly(ethene) a solid at room temperature. Explain the difference using molecular size, forces and energy.",
  "Poly(ethene) has much larger molecules. The intermolecular forces between its molecules are stronger, so more energy is needed to overcome them. This gives a higher state-change temperature and accounts for the supplied solid at room temperature. Strong covalent bonds within molecules remain intact during the physical change.",
  [
    "State poly(ethene) has much larger molecules, or methane much smaller molecules.",
    "Compare stronger intermolecular forces for the polymer, or weaker forces for methane.",
    "Link the force comparison to more energy for the polymer, or less for methane.",
    "Link to higher/lower state-change temperature and the supplied solid/gas; do not use weak or broken covalent bonds.",
  ],
  "ps-v1-r-phase",
);
const separate = written(
  "ca-separate",
  "Explain intact separation",
  "Two poly(ethene) molecules move apart without reacting. Explain which interactions are overcome and which bonds remain intact.",
  "Forces between the polymer molecules are overcome. Strong covalent carbon–carbon and carbon–hydrogen bonds within each molecule remain intact; separation does not break the chains into monomers or free atoms.",
  [
    "Identify intermolecular forces between distinct molecules as the interactions overcome.",
    "Retain strong internal covalent bonds and the intact chain molecules; do not describe a chemical breakdown.",
  ],
  "ps-v1-r-forces",
);
const repeat = written(
  "ca-repeat",
  "Interpret repeat notation",
  "Explain what the bracket crossings and lower-case n mean in this poly(ethene) repeat drawing. Why is it not an ethene molecule?",
  "Single bonds cross both bracket sides to show that this repeat unit joins more units in one chain. Lower-case n represents a large number of repeat units; it is not a nitrogen atom. The shown repeat has two singly bonded carbons with two hydrogens each, while ethene is a separate C₂H₄ molecule with a carbon–carbon double bond.",
  [
    "Explain single-bond continuation through both bracket sides into the chain.",
    "Explain lower-case n as a large repeat count, rather than nitrogen.",
    "Distinguish the polymer’s single backbone bond from ethene’s double bond and separate-molecule structure.",
  ],
  "ps-v1-r-repeat",
);
repeat.polymerRepeatDiagram = true;
const model = written(
  "ra-model",
  "Interpret a chain crop",
  "The drawing shows eight C and sixteen H atoms with omitted continuation. Explain its structure and why C₈H₁₆ is not a complete formula for every poly(ethene) molecule.",
  "The drawing shows a short part of one very large covalently joined chain molecule, with continuation beyond the crop. Eight carbons and sixteen hydrogens are the displayed inventory; omitted chain length and end groups prevent a complete molecular-formula claim. A repeat unit is not a separate molecule and poly(ethene) is not a diamond-like giant network.",
  [
    "Describe a covalently joined section of a very large chain molecule.",
    "Explain continuation and omitted ends: the displayed inventory is not every polymer molecule’s formula.",
    "Distinguish repeat units from separate molecules and chains from a giant diamond network.",
  ],
  "ps-v1-r-chain",
);
model.polymerChainDiagram = 4;
const contrast = written(
  "ra-contrast",
  "Compare chain and network",
  "Poly(ethene) and diamond both contain strong covalent bonds. Explain why their structures and usual high-temperature explanations differ.",
  "Poly(ethene) consists of distinct very large chain molecules. Their physical separation involves overcoming forces between molecules while internal covalent bonds remain intact. Diamond is an extended three-dimensional covalent network, rather than separate chain molecules; its high melting-point explanation involves overcoming many strong covalent bonds with much energy. Shared bond type does not make the two structural extents identical.",
  [
    "Distinguish very large separate polymer molecules from an extended diamond network.",
    "Use intermolecular forces for intact physical polymer separation and retain internal bonds.",
    "Use many strong covalent network bonds and much energy for diamond’s high melting-point explanation.",
  ],
  "ps-v1-r-chain",
);
const evidence = written(
  "ra-evidence",
  "Interpret softening",
  "Samples A and B soften at 110°C and 45°C. Both have strong internal covalent bonds. Explain the physical comparison and why it does not establish which has stronger covalent bonds.",
  "The 110°C sample remains unsoftened to a higher temperature under the supplied conditions. Softening involves movement of large molecules and forces between them; both retain their internal covalent chains in this physical comparison. The temperatures do not directly measure or prove that one sample has stronger carbon–carbon covalent bonds. Between-chain interactions and arrangement can differ, so the conclusion is limited to the supplied samples and conditions.",
  [
    "Use the higher supplied softening temperature for the bounded physical comparison.",
    "Distinguish between-chain interactions from internal covalent bonds in physical softening.",
    "Reject direct covalent-bond-strength or every-polymer inference from the two temperatures alone.",
  ],
  "ps-v1-r-forces",
);
export const polymerWritingAdditions = {
  practice: [correction],
  check: [state, separate, repeat],
  review: [model, contrast, evidence],
};
export function extendPolymerWriting(journey: LessonJourney) {
  journey.practice.push(...polymerWritingAdditions.practice);
  journey.checkForms.push(polymerWritingAdditions.check);
  journey.reviewForms.push(polymerWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const raw of [
    [
      "g-chain",
      "r-chain",
      "p-recognise",
      "p-bond",
      "p-limits",
      "p-compound",
      "p-compare",
      "ca-type",
      "cb-recognise",
      "cb-limit",
      "ra-type",
      "rb-network",
      "ps-write-v1-ra-model",
      "ps-write-v1-ra-contrast",
    ],
    [
      "g-repeat",
      "r-repeat",
      "r-count",
      "p-carbon",
      "p-hydrogen",
      "p-n",
      "p-crossing",
      "p-draw",
      "p-total-carbon",
      "p-total-hydrogen",
      "ca-count",
      "ca-n",
      "cb-draw",
      "cb-hydrogen",
      "ra-n",
      "rb-carbon",
      "ps-write-v1-ca-repeat",
    ],
    [
      "g-phase",
      "r-phase",
      "p-state",
      "p-explain",
      "p-compare",
      "ca-state",
      "ra-state",
      "ps-write-v1-p-correction",
      "ps-write-v1-ca-state",
      "ps-write-v1-ra-contrast",
      "ps-write-v1-ra-evidence",
    ],
    [
      "g-separation",
      "r-forces",
      "p-separation",
      "p-physical",
      "ca-force",
      "cb-change",
      "rb-separation",
      "ps-write-v1-ca-separate",
      "ps-write-v1-ra-evidence",
      "ps-write-v1-ra-contrast",
    ],
  ]) {
    const ids = raw
      .map((id) => (id.startsWith("ps-write-") ? id : `ps-v1-${id}`))
      .filter((id) => all.some((q) => q.id === id));
    for (const q of all.filter((q) => ids.includes(q.id)))
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((id) => id !== q.id),
        ]),
      ];
  }
  for (const q of all) q.conciseHeading = true;
  const checks = [
    [
      "Classify a polymer",
      "Count repeat carbon",
      "Interpret n",
      "Locate relevant forces",
      "Explain a physical state",
    ],
    [
      "Construct a repeat",
      "Recognise a chain",
      "Count hydrogen",
      "Keep chains intact",
      "Interpret a crop",
    ],
  ];
  journey.checkForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = checks[i][j])));
  const reviews = [
    [
      "Retrieve chain extent",
      "Retrieve repeat notation",
      "Retrieve state explanation",
    ],
    [
      "Retrieve repeat count",
      "Retrieve intact separation",
      "Retrieve structural extent",
    ],
  ];
  journey.reviewForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = reviews[i][j])));
  journey.practice[14].title = "Explain physical states";
  journey.practice[15].title = "Compare covalent structures";
  journey.guided[1].title = "Build a repeat";
  journey.guided[2].title = "Separate intact chains";
  journey.guided[3].title = "Compare states";
  journey.guided[3].prompt =
    "Methane is a gas; poly(ethene) is solid at room temperature. Which explanation follows?";
  if (journey.guided[2].model?.kind === "polymer-properties")
    journey.guided[2].model.instruction = "Predict forces and internal bonds.";
  journey.practice[14].prompt =
    "Explain methane gas versus poly(ethene) solid at room temperature using size, forces and energy. Do internal bonds break?";
  journey.practice[15].prompt =
    "Compare methane, poly(ethene) and diamond. Why do shared strong covalent bonds not give identical state-change explanations?";
  journey.practiceGroups = [
    {
      label: "Chain and repeat representations",
      taskIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 13].map(
        (i) => journey.practice[i].id,
      ),
    },
    {
      label: "Forces and physical behaviour",
      taskIds: [9, 10, 11, 14, 15, 16].map((i) => journey.practice[i].id),
    },
  ];
}
