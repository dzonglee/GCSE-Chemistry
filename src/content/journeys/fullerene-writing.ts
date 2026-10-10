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
    id: `fu-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Review the retained response against the stated criterion or criteria. No automatic examiner mark is awarded.",
    hint: "Answer the specific command: a named use or one reason can be brief; a description should identify the whole structure.",
    purpose:
      "Construct the requested fullerene response without requiring an unnecessary essay.",
  };
}
const use = written(
  "p-use",
  "Name a possible use",
  "Give one possible use of hollow fullerene molecules in medicine. A short phrase is enough.",
  "Drug delivery: carrying or enclosing a suitable drug payload.",
  [
    "Name drug delivery, transport or carriage of a suitable drug payload; a long causal account is not required by this recall question.",
  ],
  "fu-v1-r-carrier",
);
const structure = written(
  "ca-structure",
  "Describe C₆₀",
  "Describe Buckminsterfullerene’s atoms, overall shape and connected ring structure.",
  "One C₆₀ molecule contains sixty carbon atoms in a closed roughly spherical hollow cage. Pentagonal and hexagonal rings join through covalent carbon–carbon bonds in the same molecule; a ring is not a separate C₆₀ molecule.",
  [
    "State sixty carbon atoms in one C₆₀ molecule.",
    "Describe a closed roughly spherical hollow cage.",
    "Describe joined pentagonal/hexagonal rings and covalent bonds within the molecule.",
  ],
  "fu-v1-r-type",
);
const reason = written(
  "ca-reason",
  "Suggest one reason",
  "Suggest one shape-based reason why a hollow carbon-cage molecule could be considered as a drug carrier. One reason is enough.",
  "Its hollow cage can enclose or trap a suitable drug payload.",
  [
    "Give the hollow/enclosing/trapping cage reason. One relevant shape-based reason is enough; do not require every possible material property.",
  ],
  "fu-v1-r-carrier",
);
const recall = written(
  "ra-use",
  "Retrieve a use",
  "After the delay, name a possible medical use of suitable fullerene molecules. A short phrase is enough.",
  "Drug delivery or transport of a suitable drug payload.",
  [
    "Name drug delivery or carriage/transport of a suitable drug payload. Do not require a full structure essay for this recall demand.",
  ],
  "fu-v1-r-carrier",
);
const contrast = written(
  "ra-contrast",
  "Compare cage and sheet",
  "Compare a complete C₆₀ molecule with a 32-carbon graphene drawing. Why is 32 not graphene’s molecular formula?",
  "C₆₀ is a complete closed sixty-carbon molecule with covalent bonds. Graphene is an extended single-sheet covalent network; 32 is only the drawing inventory and connections continue outside the crop. Both contain strong covalent bonds, but an extended sheet has no fixed molecular size like C₆₀.",
  [
    "Describe complete finite C₆₀ molecule versus extended graphene sheet.",
    "Explain cropped continuation and drawing count rather than inventing C₃₂ molecules; retain covalent bonding in both.",
  ],
  "fu-v1-r-type",
);
export const fullereneWritingAdditions = {
  practice: [use],
  check: [structure, reason],
  review: [recall, contrast],
};
export function extendFullereneWriting(journey: LessonJourney) {
  journey.practice.push(...fullereneWritingAdditions.practice);
  journey.checkForms.push(fullereneWritingAdditions.check);
  journey.reviewForms.push(fullereneWritingAdditions.review);
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
      "r-type",
      "r-rings",
      "g-cage",
      "p-type",
      "p-count",
      "p-pentagon",
      "p-hexagon",
      "p-family",
      "p-seven",
      "p-explain",
      "p-compare",
      "ca-count",
      "ca-shape",
      "ca-rings",
      "cb-unfamiliar",
      "cb-formula",
      "cb-ring",
      "cb-sheet",
      "ra-count",
      "rb-type",
      "fu-write-v1-ca-structure",
      "fu-write-v1-ra-contrast",
    ],
    [
      "r-carrier",
      "r-evidence",
      "g-carrier",
      "p-guarantee",
      "p-explain",
      "ca-use",
      "cb-evidence",
      "ra-use",
      "rb-evidence",
      "fu-write-v1-p-use",
      "fu-write-v1-ca-reason",
      "fu-write-v1-ra-use",
    ],
  ]) {
    const ids = raw
      .map((id) => (id.startsWith("fu-write-") ? id : `fu-v1-${id}`))
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
      "Count molecule atoms",
      "Describe the cage",
      "Connect rings",
      "Keep internal bonds",
      "Link shape and use",
    ],
    [
      "Recognise a family",
      "Read a formula",
      "Count a ring",
      "Limit a use claim",
      "Compare cage and sheet",
    ],
  ];
  journey.checkForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = checks[i][j])));
  const reviews = [
    ["Retrieve atom count", "Retrieve intact bonds", "Retrieve a use"],
    [
      "Retrieve fullerene family",
      "Retrieve ring limits",
      "Retrieve evidence limits",
    ],
  ];
  journey.reviewForms
    .slice(0, 2)
    .forEach((f, i) => f.forEach((q, j) => (q.title = reviews[i][j])));
  journey.practice[11].title = "Describe a possible carrier";
  journey.practice[12].title = "Compare cage and sheet";
  journey.guided[2].title = "Consider a carrier";
  if (journey.guided[2].model?.kind === "fullerene-properties")
    journey.guided[2].model.instruction = "Choose shape and inference.";
  journey.practiceGroups = [
    {
      label: "Cage and ring evidence",
      taskIds: [0, 1, 2, 3, 4, 5, 6, 10].map((i) => journey.practice[i].id),
    },
    {
      label: "Interactions and uses",
      taskIds: [7, 8, 9, 11, 12, 13].map((i) => journey.practice[i].id),
    },
  ];
}
