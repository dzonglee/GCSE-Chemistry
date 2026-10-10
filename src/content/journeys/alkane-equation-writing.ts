import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";

const prefix = "alk-write-v1-";
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  counts: string,
): LearningTask {
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    purpose:
      "Write the entire combustion equation from the supplied fuel formula, choosing products and balancing every element.",
    prompt,
    answer,
    referenceResponse: answer,
    shortWritten: true,
    writtenEquations: true,
    writtenEquationKind: "symbol",
    rubric: [
      "Use the supplied hydrocarbon and O₂ as reactants; complete combustion produces CO₂ and H₂O.",
      "Write the whole equation, including its arrow and every formula. Change coefficients, never formula subscripts.",
      counts,
      "A common balanced multiple is valid. Fractional oxygen coefficients are also valid unless whole numbers are explicitly requested. State symbols are not required.",
    ],
    explanation:
      "Compare your complete equation with the reference and count each element on both sides. Your equation is retained for self-review; it receives no automatic examiner marks.",
    hint: "Choose the complete-combustion products. Balance carbon, then hydrogen, then oxygen; scale every coefficient together if needed.",
    followUp: prefix + "r-products",
  };
}
const refresher = choice(
  prefix + "r-products",
  "A hydrocarbon burns completely in oxygen. Which product formulas belong after the arrow?",
  "CO₂ and H₂O",
  {
    "CO and H₂O":
      "CO is an incomplete-combustion product; complete carbon oxidation gives CO₂.",
    "C and H₂":
      "Complete combustion uses oxygen and forms carbon dioxide and water, rather than carbon and hydrogen.",
  },
  "A hydrocarbon supplies carbon and hydrogen. Complete combustion forms CO₂ and H₂O; write O₂ on the reactant side. Count every element, including oxygen in both products.",
  "Keep the supplied fuel formula and use complete-combustion products.",
  "Retrieve products before writing and balancing the entire equation.",
);
refresher.title = "Choose combustion products";
refresher.conciseHeading = true;
const guided = written(
  "g-ethane",
  "Write the whole equation",
  "Ethane, C₂H₆, burns completely in oxygen. Write a balanced symbol equation using the smallest positive whole-number coefficients. State symbols are not required.",
  "2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O",
  "The requested smallest whole-number coefficients are 2:7:4:6. Each side has 4 C, 12 H and 14 O atoms; 1:3.5:2:3 is balanced but does not meet this question’s whole-number instruction.",
);
guided.rubric![3] =
  "Use the explicitly requested smallest positive whole-number coefficients; a fractional or larger proportional set does not meet this particular instruction.";
guided.model = {
  kind: "alkanes",
  mode: "equation",
  record: "ethane",
  instruction:
    "Choose product identities and balance the atom inventory, then write your complete equation.",
};
const practice = [
  written(
    "p-propane",
    "Write the equation",
    "Propane, C₃H₈, burns completely in oxygen. Write a balanced symbol equation. State symbols are not required.",
    "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O",
    "This reference has 3 C, 8 H and 10 O atoms on each side. Oxygen in both CO₂ and H₂O must be counted.",
  ),
  written(
    "p-butane",
    "Balance butane",
    "Butane, C₄H₁₀, burns completely in oxygen. Write a balanced symbol equation. State symbols are not required.",
    "2C₄H₁₀ + 13O₂ → 8CO₂ + 10H₂O",
    "This reference has 8 C, 20 H and 26 O atoms on each side. C₄H₁₀ + 6.5O₂ → 4CO₂ + 5H₂O is also balanced.",
  ),
];
const check = [
  written(
    "ca-six",
    "Write from a supplied formula",
    "A hydrocarbon with formula C₆H₁₄ burns completely in oxygen. Write a balanced symbol equation. State symbols are not required.",
    "2C₆H₁₄ + 19O₂ → 12CO₂ + 14H₂O",
    "This reference has 12 C, 28 H and 38 O atoms on each side. C₆H₁₄ + 9.5O₂ → 6CO₂ + 7H₂O is also balanced.",
  ),
  written(
    "cb-seven",
    "Construct a changed equation",
    "A hydrocarbon with formula C₇H₁₆ burns completely in oxygen. Write a balanced symbol equation. State symbols are not required.",
    "C₇H₁₆ + 11O₂ → 7CO₂ + 8H₂O",
    "This reference has 7 C, 16 H and 22 O atoms on each side; oxygen is present in both products.",
  ),
];
const review = [
  written(
    "ra-five",
    "Retrieve a complete equation",
    "Write a balanced symbol equation for complete combustion of the supplied hydrocarbon C₅H₁₂. State symbols are not required.",
    "C₅H₁₂ + 8O₂ → 5CO₂ + 6H₂O",
    "This reference has 5 C, 12 H and 16 O atoms on each side.",
  ),
  written(
    "rb-eight",
    "Retrieve with a new formula",
    "Write a balanced symbol equation for complete combustion of the supplied hydrocarbon C₈H₁₈. State symbols are not required.",
    "2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O",
    "This reference has 16 C, 36 H and 50 O atoms on each side. C₈H₁₈ + 12.5O₂ → 8CO₂ + 9H₂O is also balanced.",
  ),
];
export const alkaneEquationWriting = {
  refresher: [refresher],
  guided: [guided],
  practice,
  check,
  review,
};
export function extendAlkaneEquationWriting(journey: LessonJourney) {
  const additions = [refresher, guided, ...practice, ...check, ...review];
  const aliases = [
    ...additions.map((q) => q.id),
    "alk-v1-g-equation",
    "alk-v1-p-ethane-oxygen",
    "alk-v1-p-propane-water",
    "alk-v1-p-butane-oxygen",
    "alk-v1-a-balance",
    "alk-v1-b-balance",
    "alk-v1-ra-balance",
  ];
  for (const task of additions)
    task.exposureAliases = aliases.filter((id) => id !== task.id);
  journey.refresher.push(refresher);
  journey.guided.push(guided);
  journey.practice.push(...practice);
  journey.checkForms.push(check);
  journey.reviewForms.push(review);
}
