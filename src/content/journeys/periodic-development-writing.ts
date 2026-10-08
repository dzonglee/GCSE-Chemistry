import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";

const prefix = "pd-write-v1-";
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
      "Compare the links in your explanation with the criteria. Your writing is saved for manual self-review, without an automatic examiner mark.",
    hint: "Distinguish the evidence available at the time from later knowledge. Connect the observation, problem or prediction to your conclusion.",
    purpose:
      "Construct a historical classification or evidence explanation rather than select a supplied account.",
  };
}
const recovery = choice(
  prefix + "r-time",
  "Did Mendeleev use known electron shells to justify gaps in his first table?",
  "No: he used observed chemical properties",
  {
    "Yes: he had measured all electron shells":
      "Electron structures were not known when he developed his first table.",
    "No: chemical properties were ignored":
      "Similar chemical properties were central to his classification.",
  },
  "Keep the historical evidence separate from later explanations: chemical properties informed gaps and order changes; isotope knowledge came later.",
  "Ask what scientists could measure at that time.",
  "Repair the projection of modern atomic knowledge into historical classification.",
);
recovery.title = "Use the knowledge of the time";
const guided = choice(
  prefix + "g-test",
  "Candidate Y conflicts with a gap’s predicted properties. What should scientists do?",
  "Investigate the mismatch before placing Y",
  {
    "Call the mismatch supporting evidence":
      "A disagreement between prediction and observations is not supporting evidence.",
    "Rewrite Y’s properties to fit the gap":
      "Observations must be investigated, not rewritten to force agreement.",
  },
  "Matching measured properties support a prediction; reliable conflicting properties require investigation and reconsideration. Neither outcome permanently proves the whole table.",
  "Compare the predicted properties with the measured record.",
  "Manipulate evidence records and judge whether they support or challenge a prediction.",
);
guided.title = "Test a predicted discovery";
guided.model = {
  kind: "historical-test",
  instruction: "Compare the prediction with each discovery record.",
};
guided.followUp = "pd-v1-r-test";
const evidence = written(
  "p-evidence",
  "Explain the discovery",
  "Mendeleev predicted a missing element’s properties. A later discovery matched them. Explain why this supported his table.",
  "The prediction was made before the element was discovered, using patterns in the known chemical family. The later measured properties matched it and the element could fill the gap, supporting the classification. This agreement increased confidence without permanently proving every claim; conflicting future evidence could require revision.",
  [
    "Identify a prediction made before discovery from a chemical-property pattern.",
    "Connect independently observed matching properties and filling the gap to support for the table.",
    "Distinguish supporting evidence from permanent proof; conflicting evidence can prompt revision.",
  ],
  "pd-v1-r-test",
);
const isotopes = written(
  "p-isotopes",
  "Explain mass order",
  "Argon: atomic number 18, relative atomic mass 40. Potassium: 19 and 39. Explain modern order and the mass exception.",
  "Argon comes before potassium because modern order follows increasing atomic number, which is proton count: 18 before 19. Relative atomic masses are isotope-abundance-weighted averages. Isotope masses and abundances need not increase in proton-number order, so the averages can reverse. These are rounded average masses, not fractional particle counts or the mass numbers of every atom.",
  [
    "Put argon before potassium by proton number, not the supplied average mass.",
    "Explain that relative atomic mass is an abundance-weighted average of isotope masses.",
    "Connect different isotope masses and abundances to an average-mass order that need not match atomic-number order; do not invent fractional neutrons.",
  ],
  "pd-v1-r-isotopes",
);
const history = written(
  "ca-history",
  "Describe the development",
  "Describe how Mendeleev improved incomplete, weight-ordered tables using chemical properties, gaps and later discoveries.",
  "Early tables arranged known elements by atomic weight, but some elements were undiscovered and strict weight order could put unlike elements together. Mendeleev left gaps for undiscovered elements and sometimes changed the weight order to keep similar chemical properties in the same groups. He predicted missing elements’ properties. Later discoveries matched those predictions and filled gaps, supporting the table. These choices used chemical evidence, not known electron structures.",
  [
    "Describe incomplete early atomic-weight tables and inappropriate groups under strict weight ordering.",
    "Explain gaps for undiscovered elements and departures from strict weight order to preserve chemical families.",
    "Connect predicted properties with matching later discoveries that filled gaps and supported the classification.",
    "Keep historical chemical evidence separate from later proton/electron knowledge.",
  ],
  recovery.id,
);
const test = written(
  "ca-test",
  "Judge conflicting evidence",
  "A gap predicts a metal. A candidate is a non-metal despite a similar weight. Explain why placing it there needs reconsideration.",
  "The observed non-metal behaviour conflicts with the predicted metal behaviour, even if the weight is close. Similar weight alone does not establish the right chemical family. Scientists should check the observations and reconsider the proposed placement or prediction if the mismatch is reliable, rather than change or hide the measurements.",
  [
    "Identify the mismatch between predicted metal and measured non-metal properties.",
    "Explain why a nearby atomic weight alone does not justify chemical grouping.",
    "Recommend investigating evidence and reconsidering placement or prediction rather than rewriting observations.",
  ],
  "pd-v1-r-test",
);
const mass = written(
  "ca-isotopes",
  "Explain the later insight",
  "Explain how later knowledge of isotopes helped explain exceptions to atomic-weight order.",
  "Isotopes of an element have the same proton number but different neutron numbers and masses. Relative atomic mass is an average weighted by their abundances. Different isotope compositions can give a greater-proton-number element a lower average mass than its neighbour, so mass order need not match modern proton-number order. Mendeleev did not know this later explanation when developing his table.",
  [
    "Define isotopes as the same proton number with different neutron numbers/masses.",
    "Explain an abundance-weighted average, rather than fractional particles in an atom.",
    "Connect different isotope compositions to mass-order exceptions and distinguish later knowledge from Mendeleev’s original reasoning.",
  ],
  "pd-v1-r-isotopes",
);
const review = written(
  "ra-history",
  "Retrieve the historical reasoning",
  "Explain why gaps and changes to strict weight order helped Mendeleev classify elements. Include a later test of his predictions.",
  "Some elements were not yet discovered, and strict atomic-weight ordering could place chemically unlike elements in one group. Leaving gaps and changing the order kept chemically similar elements together. The gaps predicted undiscovered elements and their properties; later discoveries matching those properties filled gaps and supported his classification. He used chemical properties, not known electron shells.",
  [
    "Link missing discoveries and incorrect grouping under strict weight order to the problem.",
    "Explain gaps and order changes as ways to preserve chemical families.",
    "Connect predictions of unknown elements with matching later measurements supporting the table, without projecting electron-shell knowledge backwards.",
  ],
  recovery.id,
);
const revision = written(
  "ra-test",
  "Correct the evidence claim",
  "Sam says a matching discovery permanently proves the whole table, and mismatches can be ignored. Correct both claims.",
  "Matching properties provide supporting evidence for a prediction, not permanent proof of every claim in the table. Reliable conflicting observations must be investigated and can require revising the prediction or proposed placement. Ignoring a mismatch would prevent a proper test of the idea.",
  [
    "Explain that matching predicted and observed properties support a prediction, without proving every future claim.",
    "Explain why conflicting observations must be investigated and can prompt revision rather than being ignored.",
  ],
  "pd-v1-r-test",
);

export const periodicDevelopmentWriting = {
  refresher: [recovery],
  guided: [guided],
  practice: [evidence, isotopes],
  check: [history, test, mass],
  review: [review, revision],
};
export function extendPeriodicDevelopmentWriting(journey: LessonJourney) {
  journey.refresher.push(recovery);
  journey.guided.push(guided);
  journey.practice.push(...periodicDevelopmentWriting.practice);
  journey.checkForms.push(periodicDevelopmentWriting.check);
  journey.reviewForms.push(periodicDevelopmentWriting.review);
  journey.practiceGroups = [
    {
      label: "Explain historical classification",
      taskIds: ["early", "swap", "scientist", "noble", "explain"].map(
        (id) => "pd-v1-p-" + id,
      ),
    },
    {
      label: "Test discoveries and predictions",
      taskIds: [
        "pd-v1-p-test",
        "pd-v1-p-conflict",
        "pd-v1-p-predict",
        evidence.id,
      ],
    },
    {
      label: "Explain isotope averages",
      taskIds: ["pd-v1-p-isotopes", isotopes.id],
    },
  ];
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
      "pd-v1-g-gap",
      "pd-v1-p-explain",
      "pd-v1-p-swap",
      recovery.id,
      history.id,
      review.id,
    ],
    [
      "pd-v1-g-predict",
      "pd-v1-p-test",
      "pd-v1-p-conflict",
      "pd-v1-r-test",
      guided.id,
      evidence.id,
      test.id,
      revision.id,
    ],
    [
      "pd-v1-g-order",
      "pd-v1-p-isotopes",
      "pd-v1-r-isotopes",
      "pd-v1-cb-isotope",
      "pd-v1-rb-isotope",
      isotopes.id,
      mass.id,
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
    "Explain incomplete tables",
    "Explain an order change",
    "Test a matching discovery",
    "Investigate a mismatch",
    "Predict a chemical family",
    "Explain isotope averages",
    "Identify Mendeleev’s contribution",
    "Explain the later group",
    "Explain why gaps helped",
  ];
  journey.practice.slice(0, 9).forEach((q, i) => (q.title = titles[i]));
  journey.outcomes?.push(
    "Construct independent and delayed historical explanations, and evaluate discoveries against predictions using manual comparison criteria.",
  );
}
