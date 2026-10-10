import type { PurityTask } from "./purity-tasks";

function response(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): PurityTask {
  return {
    id: `formulation-write-v1-${id}`,
    title,
    conciseHeading: true,
    purpose:
      "Identify a formulation from its supplied design and explain the ingredient roles.",
    prompt,
    answer,
    referenceResponse: answer,
    explanation: answer,
    rubric,
    hint: "Use the supplied purpose and measured composition. A useful material is not necessarily a mixture.",
    followUp: "purity-v1-r-formulation",
  };
}

const practice = response(
  "p-paint",
  "Explain the paint recipe",
  "A maker mixes measured amounts of pigment, binder and carrier. Pigment gives colour, binder forms a lasting film and carrier helps application. Identify the product as a formulation or a pure substance, and explain your choice.",
  "It is a formulation: a deliberately designed mixture for a useful product. The ingredients are mixed in measured amounts to obtain the required properties; pigment gives colour, binder forms the film and carrier helps application. It is not one pure substance.",
  [
    "Identify a formulation, which is a mixture rather than one pure substance.",
    "Link deliberate design and measured amounts to the required product properties.",
    "Use at least two supplied ingredient roles; proprietary chemical names are not required.",
  ],
);
const check = [
  response(
    "ca-cleaner",
    "Classify the cleaning product",
    "A manufacturer deliberately mixes a carrier, cleaning agent and fragrance in measured proportions to make a cleaning product. Identify the type of mixture and explain why the proportions matter.",
    "This is a formulation, a mixture designed as a useful product. Each component has a purpose, and carefully measured proportions give the required cleaning, carrying and odour properties. Measuring quantities is part of the deliberate design, not evidence that a new pure compound has formed.",
    [
      "Identify a formulation as a deliberately designed useful mixture.",
      "Explain that measured proportions obtain the required properties.",
      "Use the supplied component purposes; do not claim chemical combination into one pure compound.",
    ],
  ),
  response(
    "cb-spill",
    "Classify the accidental mixture",
    "Two dye solutions spill together. Their amounts are measured afterwards, but no useful product was designed. A student calls the mixture a formulation because the amounts are known. Evaluate the claim.",
    "The account supports a mixture, but does not establish a formulation. A formulation is deliberately designed as a useful product with components in carefully measured quantities for required properties. Measuring an accidental spill afterwards does not establish that design.",
    [
      "Recognise a mixture without evidence of deliberate useful-product design.",
      "Explain the design and required-properties criteria for a formulation.",
      "Explain why measured amounts alone do not establish a formulation.",
    ],
  ),
];
const review = [
  response(
    "ra-ink",
    "Explain the ink design",
    "An ink maker deliberately blends measured amounts of two dyes and a carrier to obtain a specified colour and suitable flow. Explain why the ink is a formulation rather than one pure compound.",
    "The ink is a formulation: several substances are deliberately mixed in carefully measured quantities to give the required colour and flow. The dyes and carrier have particular purposes. A single appearance does not turn the mixture into one pure compound.",
    [
      "Identify a deliberately designed useful mixture.",
      "Link measured quantities and component roles to colour and flow.",
      "Distinguish a mixture from one pure compound.",
    ],
  ),
  response(
    "rb-pure",
    "Does useful mean formulation?",
    "A supplied useful product contains only one pure compound. A student says every useful product is a formulation. Evaluate the claim using the stated composition.",
    "The claim is wrong. A formulation is a deliberately designed mixture; the supplied product contains only one pure compound. Being useful alone does not make a substance a mixture or establish formulation design.",
    [
      "Reject the claim using the supplied one-compound composition.",
      "State that a formulation is a deliberately designed mixture.",
      "Distinguish usefulness from the composition and design criteria.",
    ],
  ),
];

export function extendFormulationExplanation(
  journey: {
    refresher: PurityTask[];
    practice: PurityTask[];
    checkForms: PurityTask[][];
    reviewForms: PurityTask[][];
    practiceGroups: { label: string; taskIds: string[] }[];
  },
  recovery: Record<string, string[]>,
) {
  const additions = [practice, ...check, ...review];
  const existing = [...journey.refresher, ...journey.practice];
  const peers = existing.filter((q) =>
    ["purity-v1-r-formulation", "purity-v1-p-accidental"].includes(q.id),
  );
  for (const q of additions)
    q.exposureAliases = [...peers, ...additions]
      .filter((p) => p.id !== q.id)
      .map((p) => p.id);
  for (const q of peers)
    q.exposureAliases = [
      ...new Set([...(q.exposureAliases ?? []), ...additions.map((p) => p.id)]),
    ];
  journey.practice.push(practice);
  recovery[practice.id] = ["purity-v1-r-formulation"];
  journey.checkForms.push(check);
  journey.reviewForms.push(review);
  journey.practiceGroups.push({
    label: "Explain formulation design",
    taskIds: [practice.id],
  });
}
