import type { LearningTask, LessonJourney } from "../types";

function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  equations = false,
): LearningTask {
  return {
    id: `ph-v1-method-${id}`,
    title,
    prompt,
    answer,
    explanation: answer,
    purpose: title,
    hint: rubric[0],
    rubric,
    referenceResponse: answer,
    ...(equations ? { writtenEquations: true } : { conciseHeading: true }),
  };
}
const indicatorAnswer =
  "Use a clean separate sample and add a few drops of universal/wide-range indicator solution, or apply the sample to suitable wide-range indicator paper. Compare the resulting colour with that indicator's supplied pH chart and report the matching approximate pH or range. Litmus alone does not give a numerical pH; colour does not justify many decimal places.";
const indicatorCriteria = [
  "Apply universal/wide-range indicator solution or paper to a clean sample.",
  "Compare the resulting colour with the matching supplied pH chart.",
  "Report an approximate pH/range rather than an exact many-decimal measurement.",
];
const solutionCriteria = [
  "Add a few drops of universal indicator solution to a clean separate sample.",
  ...indicatorCriteria.slice(1),
];
const paperCriteria = [
  "Apply a clean sample to the supplied wide-range indicator paper.",
  ...indicatorCriteria.slice(1),
];
const equationAnswer =
  "H+(aq) + OH−(aq) → H2O(l). There are two hydrogen atoms and one oxygen atom on each side; total reactant charge +1 − 1 = 0 matches the neutral product. Na+(aq) and Cl−(aq) remain unchanged aqueous spectator ions and are omitted from the net equation.";
const equationCriteria = [
  "Construct H+(aq) + OH−(aq) → H2O(l), with the correct charges and states.",
  "Conserve two H atoms, one O atom and total charge zero.",
  "Keep sodium/chloride ions unchanged in solution and omit them from the net equation.",
];
export function addPhMethodWriting(j: LessonJourney): void {
  (j.outcomes ??= []).push(
    "Describe how a wide-range indicator and its matching chart give an approximate pH.",
    "Construct the acid–alkali net ionic equation, conserving atoms and charge and identifying spectators.",
  );
  j.refresher.push(
    written(
      "r-indicator",
      "Describe the measurement",
      "Describe how to measure an approximate pH using a wide-range indicator.",
      indicatorAnswer,
      indicatorCriteria,
    ),
    written(
      "r-equation",
      "Write the reacting ions",
      "Write the net ionic equation for aqueous HCl reacting with NaOH. Include states and explain the omitted ions.",
      equationAnswer,
      equationCriteria,
      true,
    ),
  );
  j.practice.push(
    {
      ...written(
        "p-indicator",
        "Measure an unknown sample",
        "In a supervised investigation, describe how to obtain the approximate pH of a clear unknown sample using universal indicator. State how you interpret the observation.",
        indicatorAnswer,
        indicatorCriteria,
      ),
      followUp: "ph-v1-method-r-indicator",
    },
    {
      ...written(
        "p-equation",
        "Construct neutralisation",
        "Write the complete net ionic equation for aqueous HCl and NaOH, including states. Explain how atoms and charge are conserved and what happens to sodium and chloride ions.",
        equationAnswer,
        equationCriteria,
        true,
      ),
      followUp: "ph-v1-method-r-equation",
    },
  );
  j.checkForms.push(
    [
      written(
        "ca-indicator",
        "Describe a pH method",
        "Describe how to measure the approximate pH of a clear sample using universal indicator solution.",
        "Add a few drops of universal indicator solution to a clean separate sample. Compare the resulting colour with the chart supplied for that indicator and report the matching approximate pH or range. The colour does not justify an exact many-decimal reading.",
        solutionCriteria,
      ),
      written(
        "ca-equation",
        "Write neutralisation",
        "Aqueous hydrochloric acid reacts with sodium hydroxide. Write the net ionic equation with states; account for atoms, charge and spectator ions.",
        equationAnswer,
        equationCriteria,
        true,
      ),
    ],
    [
      written(
        "cb-indicator",
        "Use wide-range paper",
        "Describe how to estimate the pH of a clear sample using wide-range indicator paper. Explain how to report the result.",
        "Apply a clean sample to suitable wide-range indicator paper. Compare its resulting colour with the chart supplied for that paper. Report the matching approximate pH or range; the colour does not establish an exact decimal reading.",
        paperCriteria,
      ),
      written(
        "cb-equation",
        "Account for reacting ions",
        "Sodium hydroxide solution is added to hydrochloric acid. Construct the net ionic equation with states and explain why Na+ and Cl− are omitted.",
        equationAnswer,
        equationCriteria,
        true,
      ),
    ],
  );
  j.reviewForms.push(
    [
      written(
        "ra-indicator",
        "Retrieve the pH method",
        "Describe a universal-indicator method for estimating an unknown sample's pH, including how the colour becomes a reported result.",
        indicatorAnswer,
        indicatorCriteria,
      ),
      written(
        "ra-equation",
        "Retrieve neutralisation",
        "Write the net ionic equation for aqueous HCl and NaOH with states. Check atoms and charge and account for the spectators.",
        equationAnswer,
        equationCriteria,
        true,
      ),
    ],
    [
      written(
        "rb-indicator",
        "Choose and describe",
        "A student has litmus and wide-range indicator paper. Describe how to obtain an approximate numerical pH and explain which paper is suitable.",
        "Use wide-range indicator paper with a clean sample and compare the resulting colour against that paper's supplied pH chart. Report an approximate pH or matching range. Litmus indicates acidity/alkalinity but cannot supply the requested numerical pH.",
        paperCriteria,
      ),
      written(
        "rb-equation",
        "Reconstruct the ion account",
        "For hydrochloric acid mixed with sodium hydroxide, construct the net ionic equation with states. Explain conservation and the fate of Na+ and Cl−.",
        equationAnswer,
        equationCriteria,
        true,
      ),
    ],
  );
  const families = [
    [
      "ph-v1-p-colour-explain",
      ...["r", "p", "ca", "cb", "ra", "rb"].map(
        (s) => `ph-v1-method-${s}-indicator`,
      ),
    ],
    [
      "ph-v1-r-ions",
      "ph-v1-p-neutral-ions",
      "ph-v1-a-explain",
      ...["r", "p", "ca", "cb", "ra", "rb"].map(
        (s) => `ph-v1-method-${s}-equation`,
      ),
    ],
  ];
  const all = [
    ...j.warmup,
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ];
  for (const family of families)
    for (const q of all)
      if (family.includes(q.id)) {
        q.exposureAliases = [
          ...new Set([
            ...(q.exposureAliases ?? []),
            ...family.filter(
              (id) => id !== q.id && all.some((t) => t.id === id),
            ),
          ]),
        ];
      }
  j.scopeNote +=
    " Additional reserved written forms describe wide-range-indicator measurement and construct the neutralisation ionic equation. Complete written responses remain manually compared; this does not certify apparatus competence.";
}
