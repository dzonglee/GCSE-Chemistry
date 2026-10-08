import type { LearningTask, LessonJourney } from "../types";
const prefix = "pt-write-v1-";
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
      "Compare your retained explanation with the criteria. Full written reasoning receives manual self-review, without an automatic examiner mark.",
    hint: "Connect the given electrons or observations to your conclusion. Distinguish outer-electron count, occupied shells and the unchanged nucleus.",
    purpose:
      "Construct the explanation linking periodic position, atomic structure and chemical or physical evidence.",
  };
}
const practicePosition = written(
  "p-position",
  "Explain a placement",
  "Aluminium has atomic number 13 and arrangement 2,8,3. Explain its GCSE group and period.",
  "A neutral aluminium atom has thirteen electrons to balance thirteen protons. Three outer electrons place it in GCSE Group 3; three occupied shells place it in period 3. Atomic number means proton count, not the isotope mass number.",
  [
    "Link three outer electrons to GCSE Group 3.",
    "Link three occupied shells to period 3; do not swap the two counts.",
    "Connect atomic number 13 to thirteen protons and, for a neutral atom, thirteen electrons.",
  ],
  "pt-v1-r-position",
);
const practiceClassification = written(
  "p-classify",
  "Use two kinds of evidence",
  "An element is malleable, conducts electricity and forms 2+ ions by electron loss. Explain its classification.",
  "These observations support a metal: malleability and conductivity are characteristic physical properties, and loss of two electrons produces positive ions. The nucleus stays unchanged. Conductivity alone would not prove metal classification because graphite also conducts.",
  [
    "Identify a metal and use the physical observations (malleability/conductivity).",
    "Use electron loss and formation of positive ions as chemical evidence.",
    "Do not remove protons or treat conductivity alone as conclusive for every substance.",
  ],
  "pt-v1-r-metal",
);
const checkPosition = written(
  "ca-position",
  "Explain group and period",
  "Sulfur has atomic number 16 and arrangement 2,8,6. Explain its group, period and proton count.",
  "Sulfur is in GCSE Group 6 because it has six outer electrons. It is in period 3 because three shells are occupied. Its atomic number 16 means sixteen protons; a neutral atom also has sixteen electrons.",
  [
    "Link six outer electrons to GCSE Group 6.",
    "Link three occupied shells to period 3.",
    "State that atomic number 16 identifies sixteen protons; retain neutrality if referring to electrons.",
  ],
  "pt-v1-r-position",
);
const checkSimilarity = written(
  "ca-similar",
  "Explain similar chemistry",
  "Fluorine is 2,7 and chlorine is 2,8,7. Explain their similar chemistry despite different numbers of shells.",
  "Both atoms have seven outer electrons and belong to GCSE Group 7. Chemical reactions involve outer electrons, so these similar outer arrangements support similar chemical behaviour. Their occupied-shell counts and masses need not match; similar chemistry does not mean identical reactivity.",
  [
    "Identify seven outer electrons in both atoms and their common group.",
    "Explain that outer electrons participate in reactions, linking similar arrangements to similar chemistry.",
    "Do not require equal masses or occupied-shell counts, or claim identical reactivity.",
  ],
  "pt-v1-r-similar",
);
const checkClassification = written(
  "ca-evidence",
  "Justify a classification",
  "A left-side element is malleable, conducts and forms positive ions by electron loss. Explain the evidence for a metal.",
  "The position supports a general metal prediction. Malleability and conductivity supply physical evidence, while electron loss to form positive ions supplies chemical evidence. Use these together rather than declare every left-side element metallic; hydrogen is an exception.",
  [
    "Use the general left-side metal pattern as supporting evidence, not an absolute rule.",
    "Identify a characteristic physical property from the supplied observations.",
    "Link electron loss to positive-ion formation as chemical evidence.",
  ],
  "pt-v1-r-metal",
);
const reviewPosition = written(
  "ra-position",
  "Correct swapped counts",
  "Silicon is 2,8,4. Jo assigns Group 3, period 4. Correct both and connect the arrangement to atomic number 14.",
  "The four outer electrons give GCSE Group 4, while the three occupied shells give period 3. The arrangement totals fourteen electrons; for a neutral silicon atom this balances fourteen protons, giving atomic number 14. Jo swapped the group and period rules.",
  [
    "Correct to GCSE Group 4 using four outer electrons.",
    "Correct to period 3 using three occupied shells.",
    "Total fourteen electrons and connect a neutral atom to fourteen protons/atomic number 14.",
  ],
  "pt-v1-r-position",
);
const reviewBoundary = written(
  "ra-boundary",
  "Qualify the prediction",
  "An element near the metal/non-metal boundary conducts but is brittle. Make a qualified classification prediction and explain its limits.",
  "A tentative non-metal/intermediate prediction can use brittleness and boundary position, or the evidence may be judged insufficient for a firm classification. Conductivity alone cannot establish a metal: graphite conducts. Obtain further chemical evidence such as the way ions form. A differently justified tentative prediction must still account for the conflicting observations and uncertainty.",
  [
    "Give a clearly tentative classification or explain why a firm classification cannot be made.",
    "Use the supplied boundary position and physical observations, addressing both conductivity and brittleness.",
    "Explain an evidence limit (conductivity has exceptions; boundary properties can be mixed) and identify useful additional chemical evidence.",
    "Accept a differently justified tentative prediction that accounts for the given observations; do not enforce a unique boundary label.",
  ],
  "pt-v1-r-boundary",
);
const reviewIons = written(
  "ra-ions",
  "Connect groups and ions",
  "Compare how Na (2,8,1) and Cl (2,8,7) form their usual ions. Link their groups to electron changes.",
  "Sodium in GCSE Group 1 normally loses its one outer electron to give Na+ with arrangement 2,8. Chlorine in Group 7 gains one electron to give Cl− with arrangement 2,8,8. Electron loss leaves positive charge and gain gives negative charge. Neither process changes the proton count or element identity.",
  [
    "Use sodium’s one outer electron/Group 1 to explain losing one electron and forming Na+.",
    "Use chlorine’s seven outer electrons/Group 7 to explain gaining one electron and forming Cl−.",
    "Connect loss/gain to positive/negative charge, keeping both nuclei unchanged.",
  ],
  "pt-v1-r-gain",
);
export const periodicPositionWritingAdditions = {
  practice: [practicePosition, practiceClassification],
  check: [checkPosition, checkSimilarity, checkClassification],
  review: [reviewPosition, reviewBoundary, reviewIons],
};
export function extendPeriodicPositionWriting(journey: LessonJourney) {
  journey.practice.push(...periodicPositionWritingAdditions.practice);
  journey.checkForms.push(periodicPositionWritingAdditions.check);
  journey.reviewForms.push(periodicPositionWritingAdditions.review);
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
      "pt-v1-g-sodium",
      "pt-v1-g-oxygen",
      "pt-v1-p-position",
      "pt-v1-r-position",
      "pt-v1-ca-position",
      "pt-v1-ra-position",
      practicePosition.id,
      checkPosition.id,
      reviewPosition.id,
    ],
    [
      "pt-v1-p-explain",
      "pt-v1-ca-similar",
      "pt-v1-rb-similar",
      checkSimilarity.id,
    ],
    [
      "pt-v1-p-physical",
      "pt-v1-ca-metal",
      practiceClassification.id,
      checkClassification.id,
    ],
    [
      "pt-v1-p-boundary",
      "pt-v1-r-boundary",
      "pt-v1-cb-exception",
      reviewBoundary.id,
    ],
    [
      "pt-v1-g-magnesium",
      "pt-v1-p-gain",
      "pt-v1-cb-ion",
      "pt-v1-ra-chemical",
      reviewIons.id,
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
  const titles = [
    "Order by proton number",
    "Read group and period",
    "Use an unfamiliar group",
    "Explain hydrogen’s exception",
    "Predict an ion charge",
    "Compare physical properties",
    "Test conductivity evidence",
    "Explain similar chemistry",
    "Qualify boundary evidence",
    "Count ion electrons",
    "Read the table regions",
  ];
  journey.practice.slice(0, 11).forEach((q, i) => (q.title = titles[i]));
  const recoveryTitles = [
    "Count occupied shells",
    "Count outer electrons",
    "Interpret electron loss",
    "Order modern elements",
    "Keep hydrogen’s exception",
    "Interpret electron gain",
    "Name rows and columns",
    "Connect arrangement and position",
    "Explain helium’s group",
    "Use chemical evidence",
    "Explain similar reactions",
    "Qualify boundary evidence",
  ];
  [...journey.warmup, ...journey.refresher].forEach(
    (q, i) => (q.title = recoveryTitles[i]),
  );
  journey.practice[1].compactShellDiagram = true;
  journey.practiceGroups = [
    {
      label: "Positions and chemical predictions",
      taskIds: [0, 1, 2, 7, 9, 11].map((i) => journey.practice[i].id),
    },
    {
      label: "Classification and evidence",
      taskIds: [3, 4, 5, 6, 8, 10, 12].map((i) => journey.practice[i].id),
    },
  ];
  journey.outcomes?.push(
    "Construct independent explanations of position, similar chemistry and qualified classification using physical and chemical evidence.",
  );
}
