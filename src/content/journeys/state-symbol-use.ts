import type { LearningTask, LessonJourney } from "../types";

const prefix = "st-symbol-use-v1-";
const recovery: LearningTask = {
  id: prefix + "r-vapour",
  title: "Place a state symbol",
  conciseHeading: true,
  prompt:
    "Water vapour is gaseous H2O. Which formula includes its correct state symbol?",
  options: ["H2O(s)", "H2O(l)", "H2O(g)", "H2O(aq)"],
  answer: "H2O(g)",
  explanation:
    "Put the state symbol after the whole formula: H2O(g). (s), (l) and (g) describe solid, liquid and gas. (aq) means a substance dissolved in water; it does not mean every liquid. The formula H2O alone does not tell you whether this sample is ice, liquid water or water vapour.",
  hint: "Use the stated physical condition, not just the chemical formula. Vapour is a gas.",
  purpose:
    "Distinguish physical state from chemical identity and put the state symbol after the entire formula.",
  misconceptions: {
    "H2O(s)":
      "That describes solid water (ice), whereas this sample is water vapour.",
    "H2O(l)":
      "Water can be liquid, but the question states water vapour: use (g).",
    "H2O(aq)": "Aqueous means dissolved in water, not gaseous water itself.",
  },
};
function annotation(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): LearningTask {
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    writtenEquations: true,
    stateSymbolUse: true,
    explanation:
      "Compare every retained state symbol with the stated physical conditions and the criteria. This is manual self-review; no automatic examiner mark is awarded.",
    hint: "Put (s), (l), (g) or (aq) after each complete formula. A substance dissolved in water is aqueous; water vapour is gas. Keep every supplied formula and coefficient.",
    purpose:
      "Include appropriate state symbols in a supplied balanced equation, using the actual physical conditions.",
    followUp: recovery.id,
  };
}
const guided = annotation(
  "g-carbonate",
  "Add every state symbol",
  "Add state symbols to CaCO3 + 2HCl → CaCl2 + CO2 + H2O. CaCO3 is solid; HCl and CaCl2 are dissolved in water; CO2 is gas; water is liquid. Keep the formulas and coefficients.",
  "CaCO3(s) + 2HCl(aq) → CaCl2(aq) + CO2(g) + H2O(l)",
  [
    "Use CaCO3(s) for the solid carbonate.",
    "Use HCl(aq) and CaCl2(aq) for the two substances dissolved in water.",
    "Use CO2(g) and H2O(l) for the stated gas and liquid.",
    "Place symbols after each complete formula; keep the supplied formulas and coefficients. → and ->, or ordinary digits and chemical subscripts, are acceptable.",
  ],
);
const practice = annotation(
  "p-carbonate",
  "Write the equation with states",
  "Add state symbols to Na2CO3 + 2HNO3 → 2NaNO3 + CO2 + H2O. Na2CO3 is solid; HNO3 and NaNO3 are dissolved in water; CO2 is gas; water is liquid. Keep the formulas and coefficients.",
  "Na2CO3(s) + 2HNO3(aq) → 2NaNO3(aq) + CO2(g) + H2O(l)",
  [
    "Use Na2CO3(s) for the solid reactant.",
    "Use HNO3(aq) and NaNO3(aq) for the substances dissolved in water.",
    "Use CO2(g) and H2O(l) for the stated gas and liquid.",
    "Retain 2HNO3 and 2NaNO3 and all other supplied formulas; place the state symbol after each formula. Equivalent arrow/subscript typography is acceptable.",
  ],
);
const check = annotation(
  "c-zinc",
  "Use the given physical states",
  "Add state symbols to Zn + H2SO4 → ZnSO4 + H2. Zinc is solid; the dilute sulfuric acid and zinc sulfate are in aqueous solution; hydrogen is gas. Keep the formulas and coefficients.",
  "Zn(s) + H2SO4(aq) → ZnSO4(aq) + H2(g)",
  [
    "Use Zn(s) for solid zinc.",
    "Use H2SO4(aq) and ZnSO4(aq) for the stated aqueous solutions.",
    "Use H2(g) for hydrogen gas.",
    "Keep the supplied balanced formulas and coefficients, with each symbol after its whole formula. Equivalent arrow/subscript typography is acceptable.",
  ],
);
const review = annotation(
  "d-vapour",
  "Use states in a new reaction",
  "Add state symbols to 2NaHCO3 → Na2CO3 + CO2 + H2O. Here NaHCO3 and Na2CO3 are solids; CO2 is gas and the water leaves as vapour. Keep the formulas and coefficients.",
  "2NaHCO3(s) → Na2CO3(s) + CO2(g) + H2O(g)",
  [
    "Use NaHCO3(s) and Na2CO3(s) for the two stated solids.",
    "Use CO2(g) for carbon dioxide gas.",
    "Use H2O(g), because the given condition is water vapour; do not assume water must be liquid.",
    "Keep 2NaHCO3 and all the supplied formulas; place symbols after each whole formula. This supplied unfamiliar reaction is a state-symbol transfer task, not a reaction-recall requirement. Equivalent arrow/subscript typography is acceptable.",
  ],
);
export const stateSymbolUseAdditions = {
  recovery,
  guided,
  practice,
  check,
  review,
};
/** Append after the existing extension so every original record retains its metadata and order. */
export function extendStateSymbolUse(journey: LessonJourney) {
  journey.refresher.push(recovery);
  journey.guided.push(guided);
  journey.practice.push(practice);
  journey.checkForms.push([check]);
  journey.reviewForms.push([review]);
  journey.practiceGroups!.push({
    label: "Use state symbols in equations",
    taskIds: [practice.id],
  });
}
