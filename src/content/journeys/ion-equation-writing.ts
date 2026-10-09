import type { LearningTask } from "../types";
import { ionWritingPrefix as prefix } from "../../lib/ion-equation-writing";

function write(
  suffix: string,
  title: string,
  prompt: string,
  equation: string,
  spectators: string,
  rubric: string[],
): LearningTask {
  return {
    id: prefix + suffix,
    title,
    purpose:
      "Construct a complete hydroxide precipitation equation from named solutions, rather than filling fixed coefficients.",
    prompt,
    writtenEquations: true,
    answer: equation + "\nSpectators: " + spectators,
    referenceResponse: equation + "\nSpectators: " + spectators,
    rubric,
    explanation:
      "Compare formulas, coefficients, states and spectator ions with the reference. Your original writing stays saved. This is manual self-review, with no automatic examiner mark.",
    hint: "Form the neutral hydroxide from the metal charge. Keep the other anion in the soluble sodium salt; balance whole formulas, then include states.",
    followUp: prefix + "r-spectators",
  };
}

export const ionWritingRefresher: LearningTask = {
  id: prefix + "r-spectators",
  title: "What stays in solution?",
  purpose: "Connect a complete equation to the ions that form the precipitate.",
  prompt:
    "CuCl₂(aq) + 2NaOH(aq) → Cu(OH)₂(s) + 2NaCl(aq). Which ions stay dissolved unchanged?",
  options: ["Cu²⁺ and OH⁻", "Na⁺ and Cl⁻", "Cu(OH)₂"],
  answer: "Na⁺ and Cl⁻",
  misconceptions: {
    "Cu²⁺ and OH⁻": "These ions combine to form the solid hydroxide.",
    "Cu(OH)₂": "This is the precipitate, not unchanged dissolved ions.",
  },
  explanation:
    "Worked construction: Cu²⁺ needs two OH⁻, so the hydroxide formula is Cu(OH)₂. Preserve CuCl₂ and NaOH; coefficients 1,2,1,2 conserve every element. The reactants and sodium chloride are aqueous, while Cu(OH)₂ is solid. Na⁺ and Cl⁻ stay in solution: Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s) represents just the precipitate formation. ‘Molecular’ here means the complete formula equation; these ionic salts are not discrete molecules. Independent ionic-equation writing is a Higher requirement; this interpretation supports the complete equation at both tiers.",
  hint: "Compare the ions before mixing with the solid and the dissolved sodium salt afterwards.",
  exposureAliases: ["ion-tests-v1-p-molecular", prefix + "cD-copper"],
};

export const ionWritingGuided = write(
  "g-ironII",
  "Construct the whole equation",
  "Iron(II) chloride solution + sodium hydroxide solution: write the balanced hydroxide-formation equation with states. Name spectator ions.",
  "FeCl₂(aq) + 2NaOH(aq) → Fe(OH)₂(s) + 2NaCl(aq)",
  "Na⁺ and Cl⁻",
  [
    "Use FeCl₂, NaOH, Fe(OH)₂ and NaCl: iron(II) is Fe²⁺, not Fe³⁺.",
    "Coefficients 1,2,1,2 conserve Fe, Cl, Na, O and H; a common multiple is also balanced.",
    "Both reactants and NaCl are aqueous; the hydroxide precipitate is solid.",
    "Na⁺ and Cl⁻ remain aqueous. Fe²⁺ combines with two OH⁻; no redox or hydrogen production occurs.",
  ],
);
ionWritingGuided.explanation +=
  " Worked route: Fe²⁺ and two OH⁻ give neutral Fe(OH)₂. Chloride stays in aqueous NaCl. Two NaOH supply two hydroxides and two sodium ions, so put 2 before NaOH and NaCl. Fe²⁺(aq) + 2OH⁻(aq) → Fe(OH)₂(s) conserves both atoms and zero net charge. Iron(III) instead forms Fe(OH)₃; keep the stated oxidation state.";
ionWritingGuided.exposureAliases = [prefix + "vC-ironII"];

export const ionWritingPractice = [
  write(
    "p-magnesium",
    "Magnesium chloride",
    "Magnesium chloride solution + sodium hydroxide solution: write the balanced precipitation equation with states. Name spectator ions.",
    "MgCl₂(aq) + 2NaOH(aq) → Mg(OH)₂(s) + 2NaCl(aq)",
    "Na⁺ and Cl⁻",
    [
      "Correct formulas MgCl₂, NaOH, Mg(OH)₂ and NaCl.",
      "Balanced coefficients 1,2,1,2 or a common multiple; never change subscripts to balance.",
      "Aqueous reactants/NaCl and solid Mg(OH)₂.",
      "Na⁺ and Cl⁻ are spectators; Mg²⁺ and two OH⁻ form the precipitate.",
    ],
  ),
  write(
    "p-aluminium",
    "Initial aluminium precipitate",
    "A few drops of sodium hydroxide solution form a precipitate in aluminium nitrate solution. Write the balanced equation with states; name spectator ions.",
    "Al(NO₃)₃(aq) + 3NaOH(aq) → Al(OH)₃(s) + 3NaNO₃(aq)",
    "Na⁺ and NO₃⁻",
    [
      "Al³⁺ gives Al(OH)₃; aluminium nitrate is Al(NO₃)₃.",
      "Coefficients 1,3,1,3 or a common multiple conserve Al, N, Na, O and H.",
      "Aqueous reactants/NaNO₃ and solid Al(OH)₃.",
      "Na⁺ and nitrate are spectators. This is initial precipitation, not dissolution in excess; no sodium-aluminate equation is required.",
    ],
  ),
  write(
    "p-calcium",
    "Calcium under supplied conditions",
    "Calcium nitrate solution + sodium hydroxide solution forms a white precipitate under these conditions. Write the balanced equation with states; name spectators.",
    "Ca(NO₃)₂(aq) + 2NaOH(aq) → Ca(OH)₂(s) + 2NaNO₃(aq)",
    "Na⁺ and NO₃⁻",
    [
      "Use Ca(NO₃)₂, NaOH, Ca(OH)₂ and NaNO₃.",
      "Coefficients 1,2,1,2 or a common multiple conserve every element.",
      "The supplied conditions produce solid Ca(OH)₂; all other substances are aqueous. Calcium hydroxide is slightly soluble, not universally insoluble at every concentration.",
      "Na⁺ and nitrate remain aqueous spectators.",
    ],
  ),
];
ionWritingPractice[1].exposureAliases = [prefix + "vD-aluminium"];

export const ionWritingChecks = [
  [
    write(
      "cC-ironIII",
      "Iron(III) chloride",
      "Iron(III) chloride solution + sodium hydroxide solution: write the balanced precipitation equation with states. Name spectator ions.",
      "FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s) + 3NaCl(aq)",
      "Na⁺ and Cl⁻",
      [
        "Use FeCl₃ and Fe(OH)₃ for iron(III), with NaOH and NaCl.",
        "Coefficients 1,3,1,3 or a common multiple conserve every element.",
        "Fe(OH)₃ is solid; reactants and NaCl are aqueous.",
        "Na⁺ and Cl⁻ are spectators; Fe³⁺ and three OH⁻ form the solid with zero net charge.",
      ],
    ),
  ],
  [
    write(
      "cD-copper",
      "Copper(II) nitrate",
      "Copper(II) nitrate solution + sodium hydroxide solution: write the balanced precipitation equation with states. Name spectator ions.",
      "Cu(NO₃)₂(aq) + 2NaOH(aq) → Cu(OH)₂(s) + 2NaNO₃(aq)",
      "Na⁺ and NO₃⁻",
      [
        "Correct formulas Cu(NO₃)₂, NaOH, Cu(OH)₂ and NaNO₃.",
        "Coefficients 1,2,1,2 or a common multiple conserve every element.",
        "Solid Cu(OH)₂; aqueous reactants and NaNO₃.",
        "Na⁺ and nitrate are spectators. Cu²⁺ and two OH⁻ form the precipitate.",
      ],
    ),
  ],
];
ionWritingChecks[1][0].exposureAliases = [
  ionWritingRefresher.id,
  "ion-tests-v1-p-molecular",
];

export const ionWritingReviews = [
  [
    write(
      "vC-ironII",
      "Iron(II) nitrate",
      "Iron(II) nitrate solution + sodium hydroxide solution: write the balanced precipitation equation with states. Name spectator ions.",
      "Fe(NO₃)₂(aq) + 2NaOH(aq) → Fe(OH)₂(s) + 2NaNO₃(aq)",
      "Na⁺ and NO₃⁻",
      [
        "Use Fe(NO₃)₂ and Fe(OH)₂ for iron(II), with NaOH and NaNO₃.",
        "Coefficients 1,2,1,2 or a common multiple conserve every element.",
        "Solid Fe(OH)₂; aqueous reactants and NaNO₃.",
        "Na⁺ and nitrate are spectators; Fe²⁺ needs two OH⁻, unlike Fe³⁺.",
      ],
    ),
  ],
  [
    write(
      "vD-aluminium",
      "Aluminium chloride",
      "Aluminium chloride and sodium hydroxide are solutions. A few drops give a precipitate. Write a balanced equation with states; name spectators.",
      "AlCl₃(aq) + 3NaOH(aq) → Al(OH)₃(s) + 3NaCl(aq)",
      "Na⁺ and Cl⁻",
      [
        "Correct formulas AlCl₃, NaOH, Al(OH)₃ and NaCl.",
        "Coefficients 1,3,1,3 or a common multiple conserve every element.",
        "Solid initial Al(OH)₃; aqueous reactants and NaCl.",
        "Na⁺ and Cl⁻ are spectators; no excess-reagent sodium-aluminate equation is required.",
      ],
    ),
  ],
];
ionWritingReviews[0][0].exposureAliases = [ionWritingGuided.id];
ionWritingReviews[1][0].exposureAliases = [ionWritingPractice[1].id];
