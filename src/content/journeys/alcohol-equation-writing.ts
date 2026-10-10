import type { LearningTask, LessonJourney } from "../types";

function equation(
  id: string,
  name: string,
  fuel: string,
  answer: string,
  counts: string,
): LearningTask {
  return {
    id: "alc-write-v1-" + id,
    title: `${name} combustion`,
    conciseHeading: true,
    purpose:
      "Construct a whole combustion equation, accounting for oxygen already in the alcohol.",
    prompt: `Write a balanced symbol equation for the complete combustion of ${fuel}.`,
    answer,
    referenceResponse: answer,
    shortWritten: true,
    writtenEquations: true,
    writtenEquationKind: "symbol",
    rubric: [
      "Write the supplied alcohol and O₂ as reactants, with CO₂ and H₂O as products; include the arrow and every formula.",
      "Keep formula subscripts unchanged. Each fuel molecule already supplies one oxygen atom; count oxygen in both products.",
      counts,
      "Equivalent condensed or molecular fuel formulas and balanced proportional coefficients are valid. Fractional oxygen is valid unless the question explicitly asks for whole numbers.",
    ],
    hint: "Balance carbon, then hydrogen. Subtract the oxygen supplied by the fuel before finding the O₂ coefficient.",
    followUp: "alc-v1-r-combustion",
    explanation:
      "Compare the whole equation and atom totals with the separate reference. Your original response is retained for self-review; no automatic examiner mark is assigned.",
  };
}
const guided = equation(
  "g-methanol",
  "Methanol",
  "CH₃OH",
  "2CH₃OH + 3O₂ → 2CO₂ + 4H₂O",
  "This reference has 2 C, 8 H and 8 O on each side. Two oxygen atoms come from the fuel, and six from O₂.",
);
guided.model = {
  kind: "alcohol",
  mode: "combustion",
  record: "initial",
  instruction:
    "Balance the atom ledger, including fuel oxygen, then write the entire equation.",
};
const practice = [
  equation(
    "p-ethanol",
    "Ethanol",
    "C₂H₅OH",
    "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O",
    "Each side has 2 C, 6 H and 7 O atoms; one of the seven oxygen atoms comes from ethanol.",
  ),
  equation(
    "p-propanol",
    "Propanol",
    "C₃H₇OH",
    "2C₃H₇OH + 9O₂ → 6CO₂ + 8H₂O",
    "Each side has 6 C, 16 H and 20 O atoms. C₃H₇OH + 4.5O₂ → 3CO₂ + 4H₂O is also balanced.",
  ),
  equation(
    "p-butanol",
    "Butanol",
    "C₄H₉OH",
    "C₄H₉OH + 6O₂ → 4CO₂ + 5H₂O",
    "Each side has 4 C, 10 H and 13 O atoms; one oxygen atom comes from butanol.",
  ),
];
const check = [
  equation(
    "ca-methanol",
    "Methanol",
    "CH₄O",
    "2CH₄O + 3O₂ → 2CO₂ + 4H₂O",
    "Each side has 2 C, 8 H and 8 O atoms. CH₃OH is the equivalent condensed fuel formula.",
  ),
  equation(
    "cb-butanol",
    "Butanol",
    "C₄H₁₀O",
    "C₄H₁₀O + 6O₂ → 4CO₂ + 5H₂O",
    "Each side has 4 C, 10 H and 13 O atoms. C₄H₉OH is the equivalent condensed fuel formula.",
  ),
];
const review = [
  equation(
    "ra-ethanol",
    "Ethanol",
    "C₂H₆O",
    "C₂H₆O + 3O₂ → 2CO₂ + 3H₂O",
    "Each side has 2 C, 6 H and 7 O atoms. C₂H₅OH is the equivalent condensed fuel formula.",
  ),
  equation(
    "rb-propanol",
    "Propanol",
    "C₃H₈O",
    "2C₃H₈O + 9O₂ → 6CO₂ + 8H₂O",
    "Each side has 6 C, 16 H and 20 O atoms. C₃H₈O + 4.5O₂ → 3CO₂ + 4H₂O is also balanced; C₃H₇OH denotes the same supplied alcohol.",
  ),
];
export const alcoholEquationWriting = {
  guided: [guided],
  practice,
  check,
  review,
};
export function extendAlcoholEquationWriting(
  journey: LessonJourney,
  recovery: Record<string, string[]>,
) {
  const additions = [guided, ...practice, ...check, ...review];
  const aliases = [
    ...additions.map((t) => t.id),
    "alc-v1-g-combustion",
    "alc-v1-p-ethanol-o",
    "alc-v1-p-propanol-o",
    "alc-v1-p-butanol-water",
    "alc-v1-p-multiple",
    "alc-v1-a-o",
    "alc-v1-b-o",
    "chem-p2h-full-v1-02c",
  ];
  for (const task of additions)
    task.exposureAliases = aliases.filter((id) => id !== task.id);
  journey.guided.push(guided);
  journey.practice.push(...practice);
  for (const task of practice) recovery[task.id] = [task.followUp!];
  journey.checkForms.push(check);
  journey.reviewForms.push(review);
  journey.practiceGroups?.push({
    label: "Whole combustion equations",
    taskIds: practice.map((t) => t.id),
  });
}
