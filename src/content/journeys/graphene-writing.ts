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
    id: `ge-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained explanation with each criterion. Full writing is manually reviewed; no automatic examiner mark is awarded.",
    hint: "Connect the stated structure to the relevant property; support a decision with the supplied evidence and its limits.",
    purpose: "Construct graphene structure/property/use or evidence reasoning.",
  };
}
const panel = written(
  "p-panel",
  "Justify a panel",
  "Use the supplied panel results to justify the design choice and explain one limit of the evidence.",
  "B meets both requirements: 12 g is at most 15 g and 18 N is at least 15 N. A fails the load requirement at 8 N; C exceeds the mass limit at 20 g. Strong covalent bonding within graphene supports reinforcement. These results apply to the supplied finished panels, not every graphene composite. Equal area without thickness/volume does not establish density; other device performance needs testing.",
  [
    "Use B’s 12 g and 18 N against both limits.",
    "Reject A on load and C on mass.",
    "Locate strong covalent bonding within the sheet and qualify the evidence: these panels, not every composite or density without volume.",
  ],
  "ge-v1-r-evidence",
);
panel.graphenePanelData = true;
const conductor = written(
  "ca-conductor",
  "Explain a thin conductor",
  "Explain why graphene could suit an atomically thin conducting layer. Separate its thickness from the charge-carrier mechanism.",
  "Graphene is a single atom-thick extended hexagonal carbon sheet, with three covalent neighbours per interior carbon. Delocalised electrons can move through the sheet and carry charge. One-layer thickness supplies thinness; mobile electrons supply conduction. Fixed electrons alone and sliding between stacked layers do not explain its conduction. Actual device suitability requires further testing.",
  [
    "State a single atom-thick extended carbon sheet.",
    "Identify mobile delocalised electrons carrying charge through it.",
    "Link thinness and conduction separately to the proposed layer; avoid interlayer sliding or universal device guarantees.",
  ],
  "ge-v1-r-carriers",
);
const strength = written(
  "ca-strength",
  "Explain reinforcement",
  "Explain graphene’s possible reinforcing role in a lightweight composite. Does one atom-layer thickness prove the whole composite has low mass?",
  "Three strong covalent bonds per interior carbon extend in a connected hexagonal sheet, supporting high in-plane strength and reinforcement. The whole composite also contains another material, so its mass, volume and strength depend on composition and design and must be measured. One atom-thick graphene does not prove zero or universally low composite mass. Electrical carrier mobility is a different mechanism from strength.",
  [
    "Describe strong covalent bonds extending through the sheet, supporting strength.",
    "Connect that strength to possible reinforcement.",
    "Distinguish whole-composite mass/performance from one-layer thickness; do not use electron mobility as the strength explanation.",
  ],
  "ge-v1-r-strength",
);
const decision = written(
  "ca-decision",
  "Apply both limits",
  "Use the supplied panel data to justify a design choice and one testing limit.",
  "E meets both criteria: 14 g ≤ 16 g and 23 N ≥ 20 N. D fails load at 11 N; F exceeds mass at 21 g despite supporting the greatest load. These are supplied results for the particular finished panels; they do not establish all graphene composites’ properties. Further testing is needed for the actual application, such as fatigue, compatibility or other specified service conditions.",
  [
    "Compare E against both limits with numbers and units.",
    "Reject D for insufficient load and F for excessive mass.",
    "Make a bounded judgement for these panels and identify a relevant further test; material names alone do not override results.",
  ],
  "ge-v1-r-evidence",
);
const model = written(
  "ra-model",
  "Interpret the crop",
  "A drawing shows32 carbons in one plane. Explain why graphene is one layer but not a C₃₂ molecule, and what the drawing omits.",
  "Graphene is one atom-layer thick; each interior carbon has three bonded neighbours within its extended hexagonal sheet. Thirty-two is a finite model inventory, not a fixed molecule size. Connections continue beyond the cropped edge. Spheres/sticks are schematic sizes and links; the drawing does not show physical thickness, real bond lengths or the delocalised-electron distribution.",
  [
    "Distinguish one atom layer from three bonded neighbours.",
    "Describe extended sheet/omitted continuation, not a C₃₂ molecule.",
    "Identify a genuine omitted or schematic feature without claiming graphene has no electrons.",
  ],
  "ge-v1-r-sheet",
);
const contrast = written(
  "ra-contrast",
  "Compare carbon forms",
  "Compare graphene, graphite and diamond. Why does graphite’s layer-sliding explanation not apply to the other two structures?",
  "Graphene is one extended hexagonal sheet with three covalent neighbours per interior carbon. Graphite consists of stacked such sheets; weaker attractions between layers permit sliding while strong within-sheet covalent bonds remain intact. An isolated graphene sheet has no second layer to slide over. Diamond is a rigid three-dimensional network with four covalent neighbours per carbon, not stacked sheets. All are carbon forms with strong covalent bonds.",
  [
    "Describe graphene’s single extended sheet and graphite’s stacked sheets.",
    "Explain graphite sliding using weaker interlayer attractions, preserving in-layer bonds.",
    "Distinguish isolated graphene and diamond’s four-bond 3D network from the interlayer mechanism.",
  ],
  "ge-v1-r-sheet",
);
const limit = written(
  "ra-limit",
  "Review a performance claim",
  "Use the supplied panel data to evaluate the claim that graphene guarantees suitability.",
  "Neither supplied panel passes both limits. G meets mass but fails load; H meets load but exceeds mass. A graphene label does not override these results or guarantee every composite suits the design. Further development/testing is needed; these observations do not prove graphene is useless in every application or establish density without volume.",
  [
    "Identify G’s load failure and H’s mass failure with supplied quantities.",
    "Conclude neither meets both stated criteria.",
    "Reject the universal guarantee while keeping the judgement limited to these panels and requirements.",
  ],
  "ge-v1-r-evidence",
);
decision.graphenePanelData = {
  maxMass: 16,
  minLoad: 20,
  panels: [
    { id: "D", mass: 9, load: 11 },
    { id: "E", mass: 14, load: 23 },
    { id: "F", mass: 21, load: 31 },
  ],
};
limit.graphenePanelData = {
  maxMass: 15,
  minLoad: 22,
  panels: [
    { id: "G", mass: 13, load: 17 },
    { id: "H", mass: 18, load: 27 },
  ],
};
export const grapheneWritingAdditions = {
  practice: [panel],
  check: [conductor, strength, decision],
  review: [model, contrast, limit],
};
export function extendGrapheneWriting(journey: LessonJourney) {
  journey.practice.push(...grapheneWritingAdditions.practice);
  journey.checkForms.push(grapheneWritingAdditions.check);
  journey.reviewForms.push(grapheneWritingAdditions.review);
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
      "r-sheet",
      "g-sheet",
      "p-layer",
      "p-neighbours",
      "p-extent",
      "p-compare",
      "ca-layers",
      "ca-network",
      "cb-recognise",
      "cb-contrast",
      "ra-layers",
      "rb-network",
      "ge-write-v1-ra-model",
      "ge-write-v1-ra-contrast",
    ],
    [
      "r-carriers",
      "g-electronics",
      "p-electronics",
      "p-universal",
      "p-explain",
      "ca-conduction",
      "ca-use",
      "cb-contrast",
      "ra-carriers",
      "rb-property",
      "ge-write-v1-ca-conductor",
    ],
    [
      "r-strength",
      "g-composite",
      "p-strength",
      "p-explain",
      "ca-strength",
      "ra-strength",
      "ge-write-v1-ca-strength",
    ],
    [
      "r-evidence",
      "g-composite",
      "p-panel",
      "p-reduction",
      "p-criterion",
      "p-density",
      "p-explain",
      "cb-panel",
      "cb-drop",
      "cb-proof",
      "rb-criteria",
      "ge-write-v1-p-panel",
      "ge-write-v1-ca-decision",
      "ge-write-v1-ca-strength",
      "ge-write-v1-ra-limit",
    ],
  ];
  for (const raw of groups) {
    const ids = raw.map((id) =>
      id.startsWith("ge-write-") ? id : `ge-v1-${id}`,
    );
    for (const q of all.filter((q) => ids.includes(q.id)))
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((id) => id !== q.id),
        ]),
      ];
  }
  for (const q of all) q.conciseHeading = true;
  journey.guided[1].title = "Choose a conductor";
  if (journey.guided[1].model?.kind === "graphene-properties")
    journey.guided[1].model.instruction = "Choose the property and carrier.";
  journey.guided[2].title = "Choose a panel";
  journey.guided[2].prompt =
    "Choose mass ≤15 g and load ≥15 N. Explain graphene’s strength contribution.";
  const early = [
    "Recall covalent strength",
    "Recall charge carriers",
    "Distinguish one sheet",
    "Identify mobile electrons",
    "Explain sheet strength",
    "Use supplied evidence",
  ];
  [...journey.warmup, ...journey.refresher].forEach(
    (q, i) => (q.title = early[i]),
  );
  journey.practice[10].title = "Explain two uses";
  journey.practice[11].title = "Compare carbon forms";
  const checks = [
    [
      "Count atom layers",
      "Describe a sheet",
      "Explain conduction",
      "Explain strength",
      "Match a use",
    ],
    [
      "Recognise the sheet",
      "Choose a panel",
      "Calculate mass change",
      "Limit the claim",
      "Separate motion mechanisms",
    ],
  ];
  journey.checkForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = checks[i][j])));
  const reviews = [
    ["Retrieve atom layers", "Retrieve conduction", "Retrieve strength"],
    ["Interpret the crop", "Apply both criteria", "Explain a thin layer"],
  ];
  journey.reviewForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = reviews[i][j])));
  journey.practiceGroups = [
    {
      label: "Sheets and structures",
      taskIds: [0, 1, 2, 11].map((i) => journey.practice[i].id),
    },
    {
      label: "Properties and uses",
      taskIds: [3, 4, 5, 10].map((i) => journey.practice[i].id),
    },
    {
      label: "Supplied panel evidence",
      taskIds: [6, 7, 8, 9, 12].map((i) => journey.practice[i].id),
    },
  ];
}
