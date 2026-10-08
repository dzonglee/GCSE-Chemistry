import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";

const prefix = "am-write-v1-";
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
    explanation:
      "Link each observation to a model feature and compare your own explanation with the criteria. Writing is saved for manual self-review, without an automatic examiner mark.",
    hint: "Separate what was observed from what it supports. Explain the connection, rather than only naming a scientist or model.",
    purpose:
      "Construct a historical-model explanation from evidence without selecting a supplied account.",
    followUp,
  };
}
const recovery = choice(
  prefix + "r-repulsion",
  "A positive alpha particle turns back near a positive centre. Must it have struck a solid wall?",
  "No: strong repulsion can reverse its path",
  {
    "Yes: every backward path is a wall collision":
      "The nuclear explanation uses repulsion between positive charges, not a solid wall filling the atom.",
    "No: a negative centre repels it":
      "A negative centre attracts a positive alpha particle; like charges repel.",
  },
  "A close approach to concentrated positive charge can produce strong repulsion. A tiny centre makes these close approaches rare; most paths pass through mostly empty space.",
  "Use the signs of both charges and distinguish an electrical interaction from a wall collision.",
  "Repair a collision or charge-sign misconception before writing an observation-to-inference explanation.",
);
recovery.title = "Repulsion, not a wall";
const practice = written(
  "p-scattering",
  "Why the model changed",
  "Most alpha particles passed straight; a few turned back. Explain why this changed plum pudding.",
  "Mostly straight paths support an atom that is mostly empty space. Very rare large deflections require positive charge and most mass concentrated in a tiny nucleus. Positive alpha particles are repelled by this positive centre. Spread positive charge in plum pudding could not explain the rare large deflections, so reliable evidence supported replacing that model.",
  [
    "Connect mostly straight paths to most of the atom being empty space.",
    "Connect rare large deflections to a very small region containing concentrated positive charge and most mass.",
    "Explain repulsion between the positive alpha particles and positive nucleus; do not describe attraction to a negative centre or a solid-wall collision.",
    "Explain that diffuse positive charge in plum pudding could not account for the rare large deflections; reliable conflicting evidence supported changing the model.",
  ],
  recovery.id,
);
const model = written(
  "ca-models",
  "Compare the models",
  "Describe plum pudding. Contrast its positive charge and electrons with the nuclear model.",
  "Plum pudding has negative electrons embedded in a ball of spread positive charge, without a nucleus. The nuclear model concentrates positive charge in a tiny nucleus, with negative electrons outside and mostly empty space.",
  [
    "Describe negative electrons embedded in a ball or region of spread positive charge in plum pudding.",
    "Contrast this with positive charge concentrated in a tiny nucleus and electrons outside it in the nuclear model.",
    "Do not place a nucleus, neutrons or a ball of protons in plum pudding; these are not features of that historical model.",
  ],
  "am-v1-r-pudding",
);
const check = written(
  "ca-scattering",
  "Explain the paths",
  "Most positive alpha particles pass straight; very few turn back. Explain what this shows about the atom.",
  "Most paths passing straight supports mostly empty space. Very rare backward paths support a tiny region of concentrated mass and positive charge. Positive alpha particles are repelled strongly when they pass close to this positive nucleus; few paths pass that close.",
  [
    "Link the common nearly straight paths to mostly empty space.",
    "Link the rarity of large deflections to the nucleus occupying a very small part of the atom.",
    "Identify the nucleus as containing concentrated positive charge and most mass, consistent with the strong deflections.",
    "Explain positive-positive repulsion for particles passing close to the nucleus, without replacing it with attraction or wall collisions.",
  ],
  recovery.id,
);
const electron = written(
  "ra-electron",
  "Explain the earlier revision",
  "Explain why finding negative particles smaller than atoms changed the indivisible-sphere model.",
  "The particles were electrons, constituents smaller than atoms. Finding them showed that atoms have internal components and cannot be indivisible spheres. The later plum-pudding model included these negative electrons in spread positive charge; electron discovery alone did not establish a nucleus.",
  [
    "Identify the discovered negative subatomic particles as electrons.",
    "Explain that constituents smaller than an atom contradict the claim that atoms cannot be divided into smaller components.",
    "Distinguish this evidence from the later scattering evidence for a nucleus; electron discovery alone did not establish nuclear structure.",
  ],
  "am-v1-r-pudding",
);
const review = written(
  "ra-scattering",
  "Correct the centre",
  "Most alpha paths stay straight; very few turn back. Correct Sam’s claim of a large, negative centre.",
  "The common straight paths support mostly empty space, and the rare large deflections support a tiny, concentrated, massive centre rather than a large one. The nucleus is positive: it repels positive alpha particles. A negative centre would attract them, so it would not explain these backward paths by like-charge repulsion.",
  [
    "Use mostly straight paths and rare large deflections to explain a mostly empty atom with a tiny concentrated nucleus, not an atom-sized centre.",
    "State that most mass is concentrated in that nucleus, consistent with the strong deflections.",
    "Correct the negative-charge claim: positive alpha particles are repelled by a positive nucleus; opposite charges attract.",
  ],
  recovery.id,
);
export const atomicModelWriting = {
  refresher: [recovery],
  practice: [practice],
  check: [model, check],
  review: [electron, review],
};

export function extendAtomicModelWriting(journey: LessonJourney) {
  journey.refresher.push(recovery);
  journey.practice.push(practice);
  journey.practiceGroups = [
    {
      label: "Compare historical models",
      taskIds: [
        "am-v1-p-pudding",
        "am-v1-p-electron",
        "am-v1-p-contrast",
        "am-v1-p-revision",
        practice.id,
      ],
    },
    {
      label: "Interpret scattering evidence",
      taskIds: ["am-v1-p-data", "am-v1-p-inference"],
    },
    {
      label: "Trace later refinements",
      taskIds: [
        "am-v1-p-bohr",
        "am-v1-p-chadwick",
        "am-v1-p-proton",
        "am-v1-p-order",
      ],
    },
  ];
  journey.checkForms.push(atomicModelWriting.check);
  journey.reviewForms.push(atomicModelWriting.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  // Direct aliases preserve helped/repeated exposure across the same demand.
  for (const ids of [
    ["am-v1-p-contrast", model.id],
    ["am-v1-p-electron", "am-v1-ca-electron", electron.id],
    [
      "am-v1-g-surprise",
      "am-v1-g-empty",
      "am-v1-g-charge",
      "am-v1-p-inference",
      recovery.id,
      practice.id,
      check.id,
      review.id,
    ],
  ]) {
    for (const id of ids) {
      const q = all.find((t) => t.id === id)!;
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  }
  journey.outcomes?.push(
    "Construct independent and delayed written model comparisons and observation-to-inference explanations, with manual criteria rather than automatic writing marks.",
  );
}
