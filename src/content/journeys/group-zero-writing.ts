import type { LearningTask, LessonJourney } from "../types";
import { number } from "./helpers";
const prefix = "g0-write-v1-";
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
      "Compare your retained response with the criteria. Full explanations receive manual self-review, without an automatic examiner mark.",
    hint: "Connect the supplied evidence to your conclusion; write the chemical reason rather than a property name alone.",
    purpose:
      "Construct a chemical explanation independently rather than recognise a complete account.",
  };
}
function prediction(
  id: string,
  title: string,
  prompt: string,
  rows: { element: string; boiling: number }[],
  answer: number,
): LearningTask {
  const bounds = rows.map((r) => r.boiling).sort((a, b) => a - b);
  return {
    ...number(
      prefix + id,
      prompt,
      answer,
      "°C",
      `Any value strictly between ${bounds[0]} and ${bounds[1]} °C agrees with the increasing trend. The information does not determine an exact measurement.`,
      "Keep the signs: a less negative temperature is higher.",
      "Predict from supplied observations, not an exact memorised value.",
    ),
    title,
    conciseHeading: true,
    nobleBoilingPoints: rows,
    acceptedRange: { min: bounds[0], max: bounds[1], exclusive: true },
    followUp: "g0-v1-r-negative",
  };
}
const guided = prediction(
  "g-predict",
  "Predict krypton",
  "Krypton is between these elements. Predict its boiling point.",
  [
    { element: "Argon", boiling: -186 },
    { element: "Xenon", boiling: -108 },
  ],
  -153,
);
const helium = written(
  "p-shells",
  "Compare full shells",
  "Explain why both helium and neon are normally unreactive, although helium has only two electrons.",
  "Helium has a full first shell with two electrons; neon has arrangement 2,8, with eight in its full outer shell. Both arrangements are stable, so the atoms do not readily share or transfer electrons under ordinary conditions.",
  [
    "Explain that two electrons fill helium’s first shell; helium does not require eight.",
    "Identify neon’s full outer shell with eight electrons (2,8).",
    "Link the stable arrangements to not readily sharing or transferring electrons.",
  ],
  "g0-v1-r-transfer",
);
const trend = written(
  "p-trend",
  "Compare boiling",
  "Explain the trend; compare xenon with water (100 °C).",
  "The supplied boiling points rise from neon through argon to xenon as relative atomic mass increases down Group 0. Even the highest listed value, −108 °C, remains below 100 °C; higher within a group does not mean high compared with all substances.",
  [
    "State that boiling points increase down the listed group as relative atomic mass increases.",
    "Compare −108 °C with 100 °C, retaining the negative sign.",
    "Separate the trend within this group from a comparison with another substance.",
  ],
  "g0-v1-r-negative",
);
trend.nobleBoilingPoints = [
  { element: "Neon", boiling: -246 },
  { element: "Argon", boiling: -186 },
  { element: "Xenon", boiling: -108 },
];
const checkNeon = written(
  "ca-neon",
  "Explain inertness",
  "Neon has atomic number 10. Explain its ordinary low chemical reactivity in terms of electrons.",
  "A neutral neon atom has ten electrons arranged 2,8. Its outer shell is full and stable, so it does not readily share or transfer electrons.",
  [
    "Identify a full, stable outer shell (2,8 is a supporting arrangement).",
    "Link that stable arrangement to not readily transferring or sharing electrons.",
    "Do not explain inertness as no electrons, no nucleus or no particle motion.",
  ],
  "g0-v1-r-transfer",
);
const checkHelium = written(
  "ca-helium",
  "Explain the exception",
  "Sam says helium needs six more electrons to be stable. Explain the error and its effect on ordinary bonding.",
  "Helium’s first and only occupied shell is full with two electrons, not deficient by six. This is stable, so helium atoms do not readily share or transfer electrons to form molecules under ordinary conditions.",
  [
    "State that two electrons fill the first shell and correct the alleged shortage.",
    "Link the full stable arrangement to not readily sharing or transferring electrons.",
    "Use ordinary-condition unreactivity rather than a claim that chemistry is impossible at every condition.",
  ],
  "g0-v1-r-full",
);
const checkPredict = prediction(
  "ca-predict",
  "Predict argon’s value",
  "Argon is between these elements. Predict its boiling point.",
  [
    { element: "Neon", boiling: -246 },
    { element: "Krypton", boiling: -153 },
  ],
  -186,
);
const checkAtmosphere = written(
  "ca-atmosphere",
  "Protect a reactive metal",
  "A hot metal reacts with oxygen. Explain why replacing air with argon can protect it; “argon is dense” is insufficient.",
  "Argon is very unreactive under these conditions, so it does not react with the metal. Replacing air removes the surrounding oxygen that would react with and oxidise the metal. Density alone does not explain the chemical protection.",
  [
    "Identify argon’s ordinary chemical inertness and link it to not reacting with the metal.",
    "Explain that oxygen in air would react with the metal; replacing that atmosphere removes the reacting oxygen.",
    "Do not use density, absence of atoms or an absolute inability to react as the chemical explanation.",
  ],
  "g0-v1-r-properties",
);
const reviewArgon = written(
  "ra-argon",
  "Separate motion and reaction",
  "Argon atoms move in a gas. Explain why this does not contradict their ordinary chemical unreactivity.",
  "Movement is a physical property of gas particles, not evidence of compound formation. Neutral argon has arrangement 2,8,8 and a stable full outer shell; its atoms do not readily share or transfer electrons even while moving.",
  [
    "Distinguish particle motion from a chemical change or compound formation.",
    "Identify argon’s full stable outer shell (2,8,8).",
    "Link stability to not readily transferring or sharing electrons.",
  ],
  "g0-v1-r-transfer",
);
const reviewPredict = prediction(
  "ra-predict",
  "Predict neon’s value",
  "Neon is between these elements. Predict its boiling point.",
  [
    { element: "Helium", boiling: -269 },
    { element: "Argon", boiling: -186 },
  ],
  -246,
);
const reviewTrend = written(
  "ra-trend",
  "Correct Lee’s trend",
  "Lee claims a fall. Use the signs.",
  "−108 °C is higher than −186 °C. Xenon is below argon in Group 0, so these observations support increasing boiling point as relative atomic mass increases down the group. Both values being negative does not reverse their order.",
  [
    "Compare the signed numbers correctly: −108 °C is higher than −186 °C.",
    "Use argon then xenon’s down-group order to support increasing boiling point with relative atomic mass.",
    "Do not infer a chemical-reactivity trend from boiling-point observations.",
  ],
  "g0-v1-r-negative",
);
reviewTrend.nobleBoilingPoints = [
  { element: "Argon", boiling: -186 },
  { element: "Xenon", boiling: -108 },
];
const reviewBoiling = written(
  "ra-boiling",
  "Explain the particles",
  "Liquid neon boils. Explain why this does not involve breaking Ne₂ molecules or removing electrons.",
  "Ordinary neon consists of individual atoms, not bonded Ne2 molecules. Boiling separates atoms further by overcoming attractions between them. The atoms remain neon; it is a physical change, not electron transfer or formation of new substances.",
  [
    "Identify monatomic neon and reject the invented bonded Ne₂ molecules.",
    "Explain separation of atoms by overcoming attractions between atoms.",
    "Retain the atoms/electrons and distinguish a physical change from chemical reaction.",
  ],
  "g0-v1-r-single",
);
export const groupZeroWritingAdditions = {
  guided: [guided],
  practice: [helium, trend],
  check: [checkNeon, checkHelium, checkPredict, checkAtmosphere],
  review: [reviewArgon, reviewPredict, reviewTrend, reviewBoiling],
};
export function extendGroupZeroWriting(journey: LessonJourney) {
  journey.guided.push(...groupZeroWritingAdditions.guided);
  journey.practice.push(...groupZeroWritingAdditions.practice);
  journey.checkForms.push(groupZeroWritingAdditions.check);
  journey.reviewForms.push(groupZeroWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const ids of [
    ["g0-v1-g-ar", "g0-v1-p-explain", "g0-v1-cb-ar", reviewArgon.id],
    ["g0-v1-g-he", "g0-v1-ca-he", "g0-v1-ra-he", checkHelium.id],
    ["g0-v1-p-neon", checkNeon.id],
    ["g0-v1-p-predict", guided.id],
    ["g0-v1-g-filament", "g0-v1-cb-protect", checkAtmosphere.id],
    ["g0-v1-p-boiling", reviewBoiling.id],
    [
      "g0-v1-p-boil",
      "g0-v1-ca-trend",
      "g0-v1-rb-boil",
      trend.id,
      reviewTrend.id,
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
    "Explain neon’s inertness",
    "Correct the eight-electron claim",
    "Represent argon particles",
    "Count individual atoms",
    "Read the boiling trend",
    "Predict between neighbours",
    "Use the room temperature",
    "Explain boiling particles",
    "Match lift to density",
    "Separate light and reaction",
    "Correct the claim",
  ];
  journey.practice.slice(0, 11).forEach((q, i) => (q.title = titles[i]));
  journey.practiceGroups = [
    {
      label: "Shells and particles",
      taskIds: [0, 1, 2, 3, 10, 11].map((i) => journey.practice[i].id),
    },
    {
      label: "Physical evidence and uses",
      taskIds: [4, 5, 6, 7, 8, 9, 12].map((i) => journey.practice[i].id),
    },
  ];
  const shortTitles = [
    "Count neon’s electrons",
    "Arrange neon’s electrons",
    "Fill the first shell",
    "Explain stable shells",
    "Define monatomic",
    "Order temperatures",
    "Check both properties",
  ];
  [...journey.warmup, ...journey.refresher].forEach(
    (q, i) => (q.title = shortTitles[i]),
  );
  journey.guided[1].title = "Explain argon";
  journey.guided[1].prompt =
    "Argon has 18 electrons. Explain its low reactivity.";
  if (journey.guided[1].model?.kind === "shell-place")
    journey.guided[1].model.instruction =
      "Repair argon’s shells; explain stability.";
  journey.guided[2].title = "Meet both requirements";
  journey.guided[2].prompt =
    "Choose a lifting gas that does not burn. Explain both.";
  if (journey.guided[2].model?.kind === "noble-use")
    journey.guided[2].model.instruction =
      "Test lift and non-flammability separately.";
  if (journey.guided[3].model?.kind === "noble-use")
    journey.guided[3].model.instruction =
      "Use argon. Explain protection from oxidation.";
  journey.guided[3].title = "Protect the filament";
  journey.guided[3].prompt =
    "Explain why an argon atmosphere protects the hot filament from oxidation.";
  journey.outcomes?.push(
    "Construct independent electron-arrangement explanations and justify predictions from supplied physical trends.",
  );
}
