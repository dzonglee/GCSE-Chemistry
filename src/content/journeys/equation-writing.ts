import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";

const prefix = "be-write-v1-";
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): LearningTask {
  return {
    id: prefix + id,
    title,
    prompt,
    answer,
    referenceResponse: answer,
    writtenEquations: true,
    rubric,
    explanation:
      "Compare your complete equations with the criteria. Your writing is retained for self-review; it does not receive automatic exam marks.",
    hint,
    purpose:
      "Construct the complete reaction representation without a supplied equation skeleton; distinguish substance names, formulas and balanced amounts.",
    followUp: prefix + "r-words",
  };
}
const words = choice(
  prefix + "r-words",
  "Magnesium burns. Choose its word equation.",
  "magnesium + oxygen → magnesium oxide",
  {
    "2Mg + O₂ → 2MgO":
      "This is a balanced symbol equation, not a word equation.",
    "magnesium oxide → magnesium + oxygen":
      "That reverses the stated reaction: burning forms magnesium oxide.",
  },
  "A word equation puts reactant substance names before the arrow and product names after it. A symbol equation uses formulas, then coefficients to conserve every element.",
  "Names for a word equation; formulas for a symbol equation.",
  "Distinguish word and symbol representations and reaction direction.",
);
words.title = "Words or symbols?";
const oxygen = choice(
  prefix + "r-formula",
  "Oxygen gas is diatomic. Choose its formula.",
  "O₂",
  {
    O: "O is the element symbol; the specified gas has diatomic O₂ molecules.",
    "2O": "A coefficient multiplies whole particles; 2O does not describe one O₂ molecule.",
  },
  "Use O₂ for the supplied oxygen gas. Balance by changing coefficients, not the fixed O₂ or product formula.",
  "Keep the supplied molecular identity fixed.",
  "Separate a diatomic formula from a coefficient.",
);
oxygen.title = "Keep O₂ intact";

const guided = written(
  "g-potassium",
  "Write both equations",
  "Potassium + water: write word and balanced symbol equations.",
  "potassium + water → potassium hydroxide + hydrogen\n2K + 2H₂O → 2KOH + H₂",
  [
    "Word equation: potassium and water are reactants; potassium hydroxide and hydrogen are products.",
    "Symbol equation retains K, H₂O, KOH and H₂ in that direction.",
    "Smallest coefficients 2, 2, 2, 1 conserve two K, two O and four H atoms on each side. A common multiple also conserves atoms.",
    "Write the complete equation, rather than a list of coefficients or a mixture of names and formulas.",
  ],
  "Use the model to choose product formulas and coefficients; then write both complete equations.",
);
guided.model = {
  kind: "equation-balancing",
  mode: "words",
  instruction: "Select formulas and balance.",
};
guided.exposureAliases = ["be-v1-g-words", "be-v1-p-potassium"];

const practice = [
  written(
    "p-water-words",
    "Write with substance names",
    "Hydrogen reacts with oxygen to form water. Write the word equation only.",
    "hydrogen + oxygen → water",
    [
      "Hydrogen and oxygen are both on the reactant side; water is on the product side.",
      "Use substance names, a plus sign between reactants and an arrow in the stated direction.",
      "H₂ + O₂ → H₂O uses formulas, so it is not the requested word equation; water contains hydrogen and oxygen chemically combined.",
    ],
    "Use names, without needing atom-count coefficients in this word equation.",
  ),
  written(
    "p-magnesium",
    "Write the equation",
    "Write magnesium burning in oxygen as a balanced equation (Mg, O₂, MgO).",
    "2Mg + O₂ → 2MgO",
    [
      "Mg and O₂ are reactants; MgO is the product, with the supplied formulas unchanged.",
      "Smallest coefficients 2, 1, 2 give two Mg and two O on each side; coefficient 1 may be omitted. Balanced common multiples are also valid.",
      "Write the complete symbol equation, not just 2:1:2 or an altered product such as MgO₂.",
    ],
    "Place the correct formulas first, then count oxygen and magnesium.",
  ),
  written(
    "p-sodium",
    "Write both equations",
    "Sodium + chlorine forms sodium chloride. Write both equations (Na, Cl₂, NaCl).",
    "sodium + chlorine → sodium chloride\n2Na + Cl₂ → 2NaCl",
    [
      "Word equation uses sodium and chlorine as reactants and sodium chloride as product.",
      "Symbol equation retains Na, Cl₂ and NaCl, with smallest coefficients 2, 1, 2 or a balanced common multiple.",
      "Both Na and Cl totals match. Do not change NaCl to NaCl₂ to balance chlorine.",
      "Names and formulas belong in their respective complete equations.",
    ],
    "Cl₂ supplies two chlorine atoms; retain NaCl and adjust its amount.",
  ),
];
practice[1].followUp = oxygen.id;
practice[1].exposureAliases = ["be-v1-p-magnesium"];
practice[2].exposureAliases = ["be-v1-cb-sodium"];

const check = [
  written(
    "ca-zinc",
    "Write a word equation",
    "Zinc reacts with oxygen to form zinc oxide. Use substance names only.",
    "zinc + oxygen → zinc oxide",
    [
      "Zinc and oxygen are reactants; zinc oxide is the product.",
      "Use names, a plus sign and an arrow in the stated reaction direction; a formula equation alone does not answer the word-equation request.",
    ],
    "Put the named reactants before the arrow and the named product after it.",
  ),
  written(
    "ca-bromide",
    "Write a symbol equation",
    "Hydrogen + bromine forms hydrogen bromide. Formulas: H₂, Br₂, HBr. Balance your equation.",
    "H₂ + Br₂ → 2HBr",
    [
      "H₂ and Br₂ are reactants, with HBr as product; do not change the supplied formulas.",
      "Smallest coefficients 1, 1, 2 retain two H and two Br on each side; a balanced common multiple is also valid.",
      "Write the complete equation, including the correct arrow direction; a coefficient list alone is insufficient.",
    ],
    "Preserve the two diatomic reactants and count both elements.",
  ),
  written(
    "ca-carbonate",
    "Write both equations",
    "Calcium carbonate forms calcium oxide + carbon dioxide (CaCO₃, CaO, CO₂).",
    "calcium carbonate → calcium oxide + carbon dioxide\nCaCO₃ → CaO + CO₂",
    [
      "Word equation puts calcium carbonate before the arrow and calcium oxide plus carbon dioxide after it.",
      "Symbol equation retains CaCO₃ → CaO + CO₂. All smallest coefficients are 1 and may be omitted.",
      "Count oxygen in both products: one in CaO plus two in CO₂ equals three in CaCO₃; Ca and C also match.",
      "Both complete equations are required; do not add oxygen as an extra reactant to an already balanced decomposition.",
    ],
    "One reactant forms two products; check each element in the complete product side.",
  ),
];
check[2].exposureAliases = ["be-v1-p-decomposition"];

const review = [
  written(
    "ra-lithium",
    "Write both equations",
    "Lithium + chlorine forms lithium chloride. Formulas: Li, Cl₂, LiCl.",
    "lithium + chlorine → lithium chloride\n2Li + Cl₂ → 2LiCl",
    [
      "Word equation uses lithium + chlorine → lithium chloride, retaining the stated direction.",
      "Symbol equation uses 2Li + Cl₂ → 2LiCl, or a balanced common multiple, without changing LiCl.",
      "Both representations are complete; two Li and two Cl are retained in the smallest ratio.",
    ],
    "Keep the supplied formulas; count chlorine first.",
  ),
  written(
    "ra-hydroxide",
    "Write both equations",
    "Magnesium hydroxide forms magnesium oxide + water (Mg(OH)₂, MgO, H₂O).",
    "magnesium hydroxide → magnesium oxide + water\nMg(OH)₂ → MgO + H₂O",
    [
      "Word equation has magnesium hydroxide as reactant and magnesium oxide plus water as products.",
      "Symbol equation is Mg(OH)₂ → MgO + H₂O with coefficients all 1; common balanced multiples also conserve atoms.",
      "Parentheses give two O and two H in Mg(OH)₂. Products contain two O in total and two H, plus one Mg.",
      "Retain each formula and write both complete equations; do not apply the outside 2 to Mg.",
    ],
    "Expand the complete OH group when counting, but preserve the formula in your equation.",
  ),
];

export const equationWriting = {
  refresher: [words, oxygen],
  guided: [guided],
  practice,
  check,
  review,
};
export function extendEquationWriting(journey: LessonJourney) {
  journey.refresher.push(...equationWriting.refresher);
  journey.guided.push(...equationWriting.guided);
  journey.practice.push(...equationWriting.practice);
  journey.checkForms.push(check);
  journey.reviewForms.push(review);
  journey.practiceGroups = [
    {
      label: "Balance supplied formulas",
      taskIds: [
        "water",
        "magnesium",
        "aluminium",
        "ammonia",
        "methane",
        "ethane",
        "decomposition",
        "brackets",
        "potassium",
      ].map((id) => "be-v1-p-" + id),
    },
    {
      label: "Count, preserve and explain",
      taskIds: [
        "oxygen",
        "hydrogen",
        "multiple",
        "fraction",
        "identity",
        "molecules",
        "states",
        "formulas",
        "verify",
        "explain",
        "evaluate",
      ].map((id) => "be-v1-p-" + id),
    },
    {
      label: "Mass and system boundaries",
      taskIds: ["be-v1-p-open", "be-v1-p-total"],
    },
    {
      label: "Write complete equations",
      taskIds: practice.map((q) => q.id),
    },
  ];
  journey.outcomes?.push(
    "Write complete word and balanced symbol equations from reaction descriptions, with supplied formula references when needed.",
  );
  // All equivalent earlier tasks share exposure symmetrically. Do not migrate
  // original IDs, form positions, version or saved responses.
  const tasks = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const task of tasks)
    for (const alias of task.exposureAliases ?? []) {
      const peer = tasks.find((q) => q.id === alias);
      if (peer)
        peer.exposureAliases = [
          ...new Set([...(peer.exposureAliases ?? []), task.id]),
        ];
    }
}
