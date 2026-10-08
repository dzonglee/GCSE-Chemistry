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
    id: `nt-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained explanation with the criteria. No automatic examiner mark is awarded.",
    hint: "Link the relevant structure or supplied measurement to the requested property; separate mechanical and electrical reasoning.",
    purpose: "Construct and review nanotube reasoning independently.",
  };
}
const use = written(
  "p-uses",
  "Explain two applications",
  "Explain nanotube reinforcement and conduction in a supplied conducting tube. Give a separate mechanism for each.",
  "Strong covalent carbon–carbon bonds in the joined wall support reinforcement. In the supplied conducting tube, delocalised electrons can move through the structure and carry charge. A hollow shape alone does not establish whole-composite strength or identical conductivity for every nanotube.",
  [
    "Link strong covalent bonds in the wall to reinforcement.",
    "Identify delocalised electrons moving through the structure and carrying charge for electronics.",
    "Keep the mechanisms separate and avoid an unsupported guarantee for every finished material or nanotube.",
  ],
  "nt-v1-r-strength",
);
const current = written(
  "ca-current",
  "Explain electrical conduction",
  "A supplied nanotube conducts electricity. Explain how its structure allows charge to travel through it.",
  "The nanotube contains delocalised electrons that can move through the structure, carrying charge. Carbon nuclei stay in the joined covalent wall; weak layer sliding is not the current mechanism.",
  [
    "Identify delocalised or free electrons.",
    "Explain that they move through the structure and carry charge, rather than moving carbon nuclei.",
  ],
  "nt-v1-r-carriers",
);
const reinforce = written(
  "ca-reinforce",
  "Explain reinforcement",
  "Explain why a joined nanotube wall can reinforce a material. Why does hollow shape alone not prove a lightweight finished frame?",
  "Strong covalent carbon–carbon bonds in the connected wall resist deformation or separation and support reinforcement. A finished frame’s mass depends on its density and volume, including the other components; a hollow atomic model alone supplies neither finished density nor a mass comparison.",
  [
    "Identify strong covalent carbon–carbon bonds in a connected wall.",
    "Link the strong bonding to reinforcement, rather than weak layer sliding.",
    "Require finished density and volume/composition evidence for a low-mass frame claim.",
  ],
  "nt-v1-r-strength",
);
const decision = written(
  "ca-decision",
  "Evaluate frame materials",
  "Use the supplied results to recommend a frame material. Link density, strength and stiffness to the design limits and identify one missing test.",
  "E meets every limit: density 1.5 ≤ 1.7 g/cm³, strength 38 ≥ 35, stiffness 32 ≥ 30. D is less dense but too weak and insufficiently stiff. F is strong and stiff but exceeds the density limit. At equal volume, lower density means lower mass; strength reduces breakage and stiffness reduces bending. Cost or durability tests could change a practical choice and are not supplied.",
  [
    "Check all three limits: E meets them, D fails both mechanical limits and F fails density.",
    "Link density at equal volume to mass, strength to resisting breakage and stiffness to resisting bending.",
    "Give a justified E choice and a relevant missing test without inventing its result.",
  ],
  "nt-v1-r-evidence",
);
decision.nanotubeMaterialData = {
  maxDensity: 1.7,
  minStrength: 35,
  minStiffness: 30,
  materials: [
    {
      id: "D",
      material: "Polymer frame",
      density: 1.0,
      strength: 20,
      stiffness: 15,
    },
    {
      id: "E",
      material: "Nanotube composite",
      density: 1.5,
      strength: 38,
      stiffness: 32,
    },
    {
      id: "F",
      material: "Metal alloy",
      density: 2.4,
      strength: 45,
      stiffness: 40,
    },
  ],
};
const model = written(
  "ra-model",
  "Interpret a tube crop",
  "The drawing contains 72 carbon atoms. Explain why this is not a universal C₇₂ nanotube formula and what the drawn cut ends mean.",
  "This is a finite single-wall fragment of a joined cylindrical network;72 is the drawing inventory, not a fixed atom count for every nanotube. The cut ends bound the crop and do not imply that every real tube has identical open ends or length. The interior wall has joined hexagonal rings and three bonded neighbours at an interior carbon.",
  [
    "Distinguish a finite 72-atom drawing from a universal nanotube formula.",
    "Explain the cropped ends and avoid a universal end/length claim.",
    "Describe the joined hollow wall and interior three-neighbour structure.",
  ],
  "nt-v1-r-shape",
);
model.nanotubeDiagram = true;
const ratio = written(
  "ra-ratio",
  "Compare length and diameter",
  "X: length 1200 nm, diameter 3 nm. Y: length 2400 nm, diameter 6 nm. Explain their aspect ratios. Do these numbers establish conductivity?",
  "X has 1200 ÷ 3 = 400 and Y has 2400 ÷ 6 = 400. Matching units cancel, so both ratios are dimensionless. Doubling both dimensions leaves the ratio unchanged. Both are long compared with diameter, but neither a ratio nor a hollow shape identifies mobile charge carriers or proves measured conductivity.",
  [
    "Calculate both ratios as 400 using length divided by diameter in matching units.",
    "Explain dimensionless units and invariance when both dimensions double.",
    "Separate geometric aspect ratio from electrical carrier or conductivity evidence.",
  ],
  "nt-v1-r-ratio",
);
const limit = written(
  "ra-limit",
  "Evaluate an incomplete choice",
  "Use the supplied results: does either frame meet every limit? Explain the trade-off and why a choice cannot be justified just by saying nanotubes are strong.",
  "Neither meets all limits. G has density 1.3 ≤ 1.6 g/cm³ but strength 28 < 35 and stiffness 25 < 30. H meets strength 42 ≥ 35 and stiffness 36 ≥ 30 but density 1.9 > 1.6 g/cm³. Strong nanotube wall bonding does not replace finished-material results or remove the conflicting requirements; the design or material needs further work.",
  [
    "State neither meets all three limits.",
    "Use G’s strength/stiffness failures and H’s density failure as explicit evidence.",
    "Distinguish nanotube wall bonding from guaranteed finished-composite performance and acknowledge the trade-off.",
  ],
  "nt-v1-r-evidence",
);
limit.nanotubeMaterialData = {
  maxDensity: 1.6,
  minStrength: 35,
  minStiffness: 30,
  materials: [
    {
      id: "G",
      material: "Nanotube composite G",
      density: 1.3,
      strength: 28,
      stiffness: 25,
    },
    {
      id: "H",
      material: "Nanotube composite H",
      density: 1.9,
      strength: 42,
      stiffness: 36,
    },
  ],
};
export const nanotubeWritingAdditions = {
  practice: [use],
  check: [current, reinforce, decision],
  review: [model, ratio, limit],
};
export function extendNanotubeWriting(journey: LessonJourney) {
  journey.practice.push(...nanotubeWritingAdditions.practice);
  journey.checkForms.push(nanotubeWritingAdditions.check);
  journey.reviewForms.push(nanotubeWritingAdditions.review);
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
      "r-shape",
      "g-tube",
      "p-recognise",
      "p-neighbours",
      "p-wall",
      "ca-shape",
      "cb-recognise",
      "cb-boundary",
      "ra-shape",
      "nt-write-v1-ra-model",
    ],
    [
      "r-ratio",
      "g-ratio",
      "p-ratio",
      "p-unit",
      "p-length",
      "p-diameter",
      "p-scale",
      "ca-ratio",
      "ca-units",
      "cb-unit",
      "cb-diameter",
      "ra-ratio",
      "rb-scale",
      "nt-write-v1-ra-ratio",
    ],
    [
      "r-carriers",
      "g-electronics",
      "p-conduction",
      "p-universal",
      "p-explain",
      "ca-carrier",
      "ra-use",
      "nt-write-v1-ca-current",
      "nt-write-v1-p-uses",
    ],
    [
      "r-strength",
      "r-evidence",
      "g-reinforce",
      "p-material",
      "p-mass",
      "p-stiffness",
      "p-explain",
      "p-evaluate",
      "ca-strength",
      "cb-data",
      "rb-strength",
      "rb-evidence",
      "nt-write-v1-ca-reinforce",
      "nt-write-v1-ca-decision",
      "nt-write-v1-ra-limit",
      "nt-write-v1-p-uses",
    ],
  ]) {
    const ids = raw
      .map((id) => (id.startsWith("nt-write-") ? id : `nt-v1-${id}`))
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
      "Recognise a tube",
      "Calculate a ratio",
      "Identify charge carriers",
      "Explain wall strength",
      "Use matching units",
    ],
    [
      "Recognise a structure",
      "Convert common units",
      "Recover a diameter",
      "Evaluate frame data",
      "Interpret cut ends",
    ],
  ];
  journey.checkForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = checks[i][j])));
  const reviews = [
    ["Retrieve tube shape", "Retrieve aspect ratio", "Retrieve conduction"],
    [
      "Retrieve wall bonding",
      "Retrieve equal scaling",
      "Retrieve design limits",
    ],
  ];
  journey.reviewForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = reviews[i][j])));
  journey.practice[13].title = "Explain two applications";
  journey.practice[13].prompt =
    "Explain nanotube reinforcement and electrical conduction separately. For a lightweight composite or electrical component, state an evidence limit.";
  journey.practice[14].title = "Evaluate frame data";
  journey.practiceGroups = [
    {
      label: "Tube structure and dimensions",
      taskIds: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => journey.practice[i].id),
    },
    {
      label: "Properties and applications",
      taskIds: [8, 9, 10, 11, 12, 13, 14, 15].map(
        (i) => journey.practice[i].id,
      ),
    },
  ];
}
