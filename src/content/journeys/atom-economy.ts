import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...choice(
    `ae-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    title,
    model,
  ),
  title,
});
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...number(
    `ae-v1-${id}`,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    title,
    {},
    model,
  ),
  title,
});
const p = (
  id: string,
  title: string,
  prompt: string,
  parts: { id: string; label: string; answer: number }[],
  explanation: string,
  hint: string,
): LearningTask => ({
  ...c(
    id,
    title,
    prompt,
    JSON.stringify(
      Object.fromEntries(parts.map((f) => [f.id, String(f.answer)])),
    ),
    {},
    explanation,
    hint,
  ),
  options: undefined,
  parts,
  partLegend: title,
});
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): LearningTask => ({
  ...c(
    id,
    title,
    prompt,
    answer,
    {},
    answer,
    "Link the balanced equation to the named desired product.",
  ),
  options: undefined,
  rubric,
});
export const atomEconomyJourney: LessonJourney = {
  version: 1,
  introduction:
    "Weight the balanced equation, choose its desired product and account for every mass contribution.",
  scopeNote:
    "Separate Chemistry: AQA 4.3.3.2 and Pearson 5.13C–5.14C calculations. Relative mass contributions use equation coefficients; they are not measured grams. Production-pathway choice using yield, rate, equilibrium and by-product data is an AQA Higher demand and is taught separately. Atom economy is theoretical allocation to the specified desired product, not actual collected percentage yield. The supplied methane reaction illustrates allocation and does not recommend an industrial process or experimental procedure.",
  outcomes: [
    "Construct coefficient-weighted desired and total relative mass contributions.",
    "Calculate economy, retaining full precision until requested final rounding.",
    "Change the desired product and scale the whole equation without losing the reference total.",
    "Distinguish atom economy, conservation and collected yield.",
    "Higher extension: infer an unknown relative atomic mass using weighted contributions and a supplied atom economy.",
  ],
  warmup: [
    n(
      "w-fraction",
      "Recall a fraction",
      "What percentage is 7 out of 10?",
      70,
      "%",
      "7/10 × 100 = 70%.",
      "Use the whole as the denominator.",
    ),
    n(
      "w-coefficient",
      "Recall whole formula coefficients",
      "What is the total number of oxygen atoms represented by 3H2O?",
      3,
      "",
      "Each water molecule has one O: 3 × 1 = 3.",
      "A coefficient multiplies the complete formula.",
    ),
  ],
  refresher: [
    c(
      "r-definition",
      "Choose the useful fraction",
      "What does atom economy describe?",
      "The theoretical mass fraction of reactants ending in the specified desired product",
      {
        "The percentage of product actually collected": "That describes yield.",
        "The fraction of atoms that survive the reaction":
          "All atoms are conserved, including those in other products.",
      },
      "The desired product is a mass contribution within all reactants.",
      "Separate useful allocation from actual collection.",
    ),
    n(
      "r-weight",
      "Weight the numerator",
      "In 2CuO + C → 2Cu + CO2, Ar(Cu) = 63.5. Find the desired copper relative mass contribution.",
      127,
      "",
      "2 × 63.5 = 127; use the coefficient of the desired product.",
      "Two copper contributions, not one.",
    ),
    n(
      "r-base",
      "Weight all reactants",
      "For 2CuO + C → 2Cu + CO2, Mr(CuO) = 79.5 and Ar(C) = 12. Find the full reactant relative mass contribution.",
      171,
      "",
      "2 × 79.5 + 12 = 171.",
      "Include every reactant coefficient.",
    ),
    c(
      "r-conserve",
      "Locate the other atoms",
      "A reaction has atom economy below 100%. What happens to atoms not in the desired product?",
      "They occur in other products",
      {
        "They are destroyed": "Conservation still holds.",
        "They have no mass": "By-products contain atoms and contribute mass.",
      },
      "Low economy means unwanted allocation, not destroyed material.",
      "Account for the complete equation.",
    ),
    c(
      "r-yield",
      "Separate economy from yield",
      "An addition reaction has only one equation product. Some product is not collected. Which statement can be true?",
      "Atom economy is 100% while percentage yield is below 100%",
      {
        "Both must be 100%": "Collection loss can reduce yield.",
        "Collection loss changes the equation atom economy":
          "It changes measured recovery, not theoretical allocation.",
      },
      "One equation product can receive all reactant mass despite collection loss.",
      "Keep the two denominators distinct.",
    ),
  ],
  guided: [
    n(
      "g-weighted",
      "Weight the equation",
      "Find copper atom economy to one decimal place.",
      74.3,
      "%",
      "127/171 × 100 = 74.3% to one decimal place.",
      "Weight both numerator and denominator.",
      {
        kind: "atom-economy",
        mode: "weighted",
        instruction: "Predict the useful fraction.",
      },
    ),
    n(
      "g-desired",
      "Switch the desired product",
      "For CaCO3 → CaO + CO2, the relative masses are 100, 56 and 44. Find atom economy when CaO is desired.",
      56,
      "%",
      "56/100 × 100 = 56%; the remaining 44 contributes to CO2.",
      "Fix which product is desired.",
      {
        kind: "atom-economy",
        mode: "desired",
        instruction:
          "Choose the desired product; scale the equation and predict the useful fraction.",
      },
    ),
    p(
      "g-contrast",
      "Compare economy and collected yield",
      "C2H4 + H2 → C2H6 is an addition reaction with one product. The theoretical ethane mass is 30 g and 18 g is collected. Enter atom economy and percentage yield.",
      [
        { id: "economy", label: "Atom economy / %", answer: 100 },
        { id: "yield", label: "Collected yield / %", answer: 60 },
      ],
      "All equation mass enters ethane: 100% economy. Collected yield = 18/30 × 100 = 60%.",
      "Equation allocation differs from collection.",
    ),
    n(
      "g-partition",
      "Account for the other product",
      "For CH4 + 2O2 → CO2 + 2H2O, relative contributions are 16 + 64 = 44 + 36. Find atom economy for desired CO2.",
      55,
      "%",
      "44/80 × 100 = 55%; the other 36 is water, not destroyed mass.",
      "Use mass, not the fraction of balls.",
      {
        kind: "atom-economy",
        mode: "partition",
        instruction:
          "Choose desired product; predict useful and other mass contributions.",
      },
    ),
  ],
  practice: [
    p(
      "p-coefficients",
      "Construct both weighted terms",
      "For 2CuO + C → 2Cu + CO2, Mr(CuO) = 79.5 and Ar(Cu) = 63.5, Ar(C) = 12. Enter desired copper and full reactant relative mass contributions.",
      [
        { id: "useful", label: "Desired contribution", answer: 127 },
        { id: "total", label: "All reactants", answer: 171 },
      ],
      "Copper: 2 × 63.5 = 127. Reactants: 2 × 79.5 + 12 = 171.",
      "Apply each whole coefficient.",
    ),
    c(
      "p-missing-coefficient",
      "Repair an incomplete denominator",
      "A student uses 127/(79.5 + 12) for copper in 2CuO + C → 2Cu + CO2. What must change?",
      "Multiply 79.5 by 2 in the denominator",
      {
        "Multiply the denominator by 100":
          "100 converts the final fraction to a percentage.",
        "Remove carbon from the denominator":
          "Every equation reactant contributes.",
      },
      "The complete equation contains two CuO contributions, giving 171.",
      "Look for the coefficient beside CuO.",
    ),
    c(
      "p-missing-numerator",
      "Repair an incomplete numerator",
      "A student uses 63.5/171 for copper in 2CuO + C → 2Cu + CO2. What must change?",
      "Multiply 63.5 by 2 in the numerator",
      {
        "Replace 171 with 63.5": "The full reactant total is still 171.",
        "Count only copper atoms as the denominator":
          "Economy is a mass fraction.",
      },
      "The desired product coefficient also matters: 127/171.",
      "Read the coefficient of copper.",
    ),
    n(
      "p-nickel",
      "Transfer to nickel",
      "For NiO + C → Ni + CO, Mr(NiO) = 75, Ar(C) = 12 and Ar(Ni) = 59. Find nickel atom economy to three significant figures.",
      67.8,
      "%",
      "59/(75 + 12) × 100 = 67.816…%, rounded only at the end to 67.8%.",
      "Use all reactants and keep calculator precision.",
    ),
    n(
      "p-tungsten",
      "Transfer to coefficient three",
      "For WO3 + 3H2 → W + 3H2O, Mr(WO3) = 232, Mr(H2) = 2 and Ar(W) = 184. Find tungsten atom economy to one decimal place.",
      77.3,
      "%",
      "184/(232 + 3 × 2) × 100 = 77.3109…%, giving 77.3%.",
      "Include all three hydrogen contributions.",
    ),
    n(
      "p-other-product",
      "Choose carbon dioxide instead",
      "CaCO3 → CaO + CO2 has relative masses 100, 56 and 44. Find atom economy when CO2 is the desired product.",
      44,
      "%",
      "44/100 × 100 = 44%; desired CaO would give a different numerator.",
      "Select the named product.",
    ),
    c(
      "p-all-products",
      "Reject an indiscriminate numerator",
      "A student uses (56 + 44)/100 × 100 for desired CaO in CaCO3 → CaO + CO2. Why is this unsuitable?",
      "It counts the undesired CO2 as desired product",
      {
        "The equation does not conserve mass":
          "56 + 44 = 100 confirms conservation.",
        "The denominator should be 44":
          "100 is the full reactant contribution.",
      },
      "All products total 100, but the specified desired CaO contribution is only 56.",
      "Conservation is not the same as useful-product allocation.",
    ),
    p(
      "p-scale",
      "Scale the entire equation",
      "Use 2CaCO3 → 2CaO + 2CO2, with relative masses 100, 56 and 44. For desired CaO, enter desired contribution, reactant total and atom economy.",
      [
        { id: "useful", label: "Desired contribution", answer: 112 },
        { id: "total", label: "All reactants", answer: 200 },
        { id: "percentage", label: "Atom economy / %", answer: 56 },
      ],
      "112/200 × 100 = 56%; uniform scaling changes both terms equally.",
      "Multiply both sides by the same factor.",
    ),
    c(
      "p-scale-invariant",
      "Explain an unchanged percentage",
      "Why does multiplying every balanced-equation coefficient by five leave atom economy unchanged?",
      "Both useful mass and total mass multiply by five",
      {
        "Only the useful mass increases":
          "All equation coefficients are scaled.",
        "New atoms have no mass": "The same relative masses still apply.",
      },
      "The common factor cancels from the fraction.",
      "Compare numerator and denominator factors.",
    ),
    n(
      "p-methane-water",
      "Select water in the supplied equation",
      "CH4 + 2O2 → CO2 + 2H2O has relative contributions 16 + 64 = 44 + 36. Find atom economy for desired water.",
      45,
      "%",
      "36/80 × 100 = 45%, using both waters.",
      "Weight the desired-product coefficient.",
    ),
    c(
      "p-atom-count",
      "Reject ball counting",
      "For desired CO2 in CH4 + 2O2 → CO2 + 2H2O, a student counts three atoms out of nine and reports 33.3%. What is wrong?",
      "Economy uses mass contributions, and different atoms have different relative masses",
      {
        "Atoms are not conserved": "C1 H4 O4 occurs on both sides.",
        "There is only one water molecule": "The coefficient gives two waters.",
      },
      "Desired CO2 contributes 44 of total 80, so economy is 55%.",
      "A ball count is not a mass scale.",
    ),
    p(
      "p-partition",
      "Keep the full product inventory",
      "For CH4 + 2O2 → CO2 + 2H2O with total relative contribution 80 and desired CO2 contribution 44, enter water contribution and the total after reaction.",
      [
        { id: "water", label: "Other-product contribution", answer: 36 },
        { id: "total", label: "All products", answer: 80 },
      ],
      "Other contribution = 80 − 44 = 36; total remains 80.",
      "No atoms disappear into an economy percentage.",
    ),
    n(
      "p-addition",
      "One equation product",
      "C2H4 + H2 → C2H6 has relative masses 28, 2 and 30. Find ethane atom economy.",
      100,
      "%",
      "30/(28 + 2) × 100 = 100%.",
      "All reactant contribution enters the only product.",
    ),
    p(
      "p-economy-yield",
      "Separate theoretical allocation and recovery",
      "An equation with one product has 100% atom economy. A supplied theoretical mass is 50 g, with 35 g collected. Enter atom economy and collected percentage yield.",
      [
        { id: "economy", label: "Atom economy / %", answer: 100 },
        { id: "yield", label: "Collected yield / %", answer: 70 },
      ],
      "Equation economy remains 100%; collected yield = 35/50 × 100 = 70%.",
      "Use a different reference for each measure.",
    ),
    c(
      "p-recovery",
      "Interpret collection improvement",
      "The same reaction and desired product are used, but more of its formed product is collected. Which quantity changes because of this improvement?",
      "Percentage yield, while equation atom economy remains unchanged",
      {
        "Atom economy must increase":
          "The equation and desired product have not changed.",
        "Neither quantity can change":
          "Recovered product changes actual yield.",
      },
      "Recovery changes actual product relative to theoretical product.",
      "Keep the balanced equation fixed.",
    ),
    n(
      "p-byproduct",
      "Recover a missing allocation",
      "A reaction has total relative reactant contribution 250 and desired contribution 175. Find the contribution to other equation products.",
      75,
      "",
      "250 − 175 = 75; matter is allocated, not destroyed.",
      "Use the conserved total.",
    ),
    c(
      "p-sustainable",
      "Explain the benefit of higher economy",
      "For the same desired-product amount and comparable conditions, why can higher atom economy reduce costs and waste?",
      "Less reactant mass is diverted into by-products, reducing wasted raw material and disposal demands",
      {
        "It guarantees no energy costs":
          "Atom economy does not measure energy requirements.",
        "Unwanted atoms are destroyed cheaply":
          "All atoms remain in products; disposal is not atom destruction.",
      },
      "Higher useful mass allocation can reduce raw material diverted into unwanted products and waste-disposal demands. This is a reason to value high atom economy, not proof of overall safety, sustainability or actual yield.",
      "Locate where the reactant mass goes.",
    ),
    c(
      "p-100-not-perfect",
      "Limit what 100% establishes",
      "What does 100% atom economy establish for the given equation and desired product?",
      "All reactant mass is theoretically allocated to the desired product",
      {
        "No energy is needed and no hazards exist":
          "Economy alone does not describe energy or hazards.",
        "Every real experiment collects all product":
          "Actual yield may be below 100%.",
      },
      "Equation mass efficiency alone does not establish overall safety or sustainability.",
      "Stay within what the measure describes.",
    ),
    n(
      "p-fraction-transfer",
      "Use a supplied balanced allocation",
      "A balanced equation gives desired contribution 63 and full reactant contribution 90. Find atom economy.",
      70,
      "%",
      "63/90 × 100 = 70%.",
      "Use the full reactant base.",
    ),
    w(
      "p-explain-allocation",
      "Explain conservation with low economy",
      "A supplied balanced equation gives 40% atom economy for one desired product. Explain why this does not violate conservation of atoms.",
      "40% of the equation mass is allocated to the desired product and 60% to other products. All atoms remain in the products; undesired does not mean destroyed. The percentage uses mass contributions, not a count of atoms.",
      [
        "Distinguish the desired product from all products.",
        "Account for the other 60% mass contribution.",
        "Explain conservation without claiming atoms have disappeared.",
      ],
    ),
    w(
      "p-explain-two-measures",
      "Explain economy and yield",
      "An addition equation has 100% atom economy but 65% collected yield. Explain how both values can be correct.",
      "The balanced equation allocates all reactant mass to the desired product, giving 100% atom economy. Only 65% of the theoretical desired product is collected, so measured yield is 65%. Incomplete conversion or recovery losses can lower actual yield without changing the equation atom economy.",
      [
        "Use equation allocation for economy.",
        "Use actual/theoretical product for yield.",
        "Avoid claiming that 100% economy guarantees complete collection.",
      ],
    ),
  ],
  checkForms: [
    [
      p(
        "ca-copper",
        "Independent weighted equation",
        "For 2Cu2O + C → 4Cu + CO2, Mr(Cu2O) = 143, Ar(C) = 12 and Ar(Cu) = 63.5. Enter desired copper contribution and full reactant contribution.",
        [
          { id: "useful", label: "Desired contribution", answer: 254 },
          { id: "total", label: "All reactants", answer: 298 },
        ],
        "4 × 63.5 = 254; 2 × 143 + 12 = 298.",
        "Weight both sides.",
      ),
      n(
        "ca-percentage",
        "Independent final rounding",
        "A balanced equation has desired contribution 254 and reactant total 298. Find atom economy to one decimal place.",
        85.2,
        "%",
        "254/298 × 100 = 85.2349…%, giving 85.2%.",
        "Round at the end.",
      ),
      n(
        "ca-product",
        "Independent desired-product change",
        "For 3CaCO3 → 3CaO + 3CO2 with relative masses 100, 56 and 44, find atom economy for desired CO2.",
        44,
        "%",
        "132/300 × 100 = 44%.",
        "Scale all terms.",
      ),
      p(
        "ca-measures",
        "Independent economy and yield",
        "An equation has only one product. Its theoretical mass is 80 g and 52 g is collected. Enter economy and collected yield.",
        [
          { id: "economy", label: "Atom economy / %", answer: 100 },
          { id: "yield", label: "Collected yield / %", answer: 65 },
        ],
        "100% equation economy; 52/80 × 100 = 65% yield.",
        "Distinguish the reference quantities.",
      ),
      w(
        "ca-proof",
        "Independent allocation explanation",
        "A desired product receives relative contribution 120 of a total 200. Explain economy and the fate of the other mass.",
        "Atom economy = 120/200 × 100 = 60%. The other 80, or 40%, enters other products in the balanced equation; atoms are not destroyed. This allocation is not a measurement of actual collected yield.",
        [
          "Calculate 60%.",
          "Locate the other 80 in other products.",
          "Keep conservation and collected yield distinct.",
        ],
      ),
    ],
    [
      p(
        "cb-aluminium",
        "Independent different coefficients",
        "For 2Al2O3 → 4Al + 3O2, Mr(Al2O3) = 102 and Ar(Al) = 27. Enter desired aluminium and total reactant relative contributions.",
        [
          { id: "useful", label: "Desired contribution", answer: 108 },
          { id: "total", label: "All reactants", answer: 204 },
        ],
        "4 × 27 = 108; 2 × 102 = 204.",
        "Read each coefficient.",
      ),
      n(
        "cb-percentage",
        "Independent changed fraction",
        "A balanced equation gives desired contribution 108 and reactant total 204. Find atom economy to three significant figures.",
        52.9,
        "%",
        "108/204 × 100 = 52.941…%, giving 52.9%.",
        "Retain precision until final rounding.",
      ),
      n(
        "cb-product",
        "Independent oxygen allocation",
        "For 2Al2O3 → 4Al + 3O2, Mr(Al2O3) = 102 and Mr(O2) = 32. Find atom economy for desired oxygen to one decimal place.",
        47.1,
        "%",
        "3 × 32 / (2 × 102) × 100 = 47.0588…%, giving 47.1%.",
        "The desired product is oxygen here.",
      ),
      p(
        "cb-measures",
        "Independent changed collected yield",
        "An equation has only one product. Its theoretical mass is 75 g and 63 g is collected. Enter economy and percentage yield.",
        [
          { id: "economy", label: "Atom economy / %", answer: 100 },
          { id: "yield", label: "Collected yield / %", answer: 84 },
        ],
        "100% equation allocation; 63/75 × 100 = 84% collected yield.",
        "Use actual/theoretical for yield only.",
      ),
      w(
        "cb-proof",
        "Independent limit of the measure",
        "A student says 100% atom economy proves that a reaction needs no energy, has no hazards and has 100% collected yield. Explain the error.",
        "100% atom economy states that all equation reactant mass is theoretically allocated to the desired product. It does not measure energy requirements, hazards or actual collected yield. Those require separate evidence.",
        [
          "State what the mass fraction means.",
          "Separate energy and hazards from this measure.",
          "Explain that actual yield requires actual/theoretical product data.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-weight",
        "Retrieve coefficient weighting",
        "For 2Mg + O2 → 2MgO, Ar(Mg) = 24 and Mr(O2) = 32. Find total relative reactant contribution.",
        80,
        "",
        "2 × 24 + 32 = 80.",
        "Include the coefficient two.",
      ),
      n(
        "ra-fraction",
        "Retrieve useful fraction",
        "A balanced equation gives desired contribution 42 and total reactant contribution 60. Find atom economy.",
        70,
        "%",
        "42/60 × 100 = 70%.",
        "Use the total base.",
      ),
      n(
        "ra-yield",
        "Retrieve the other percentage",
        "A supplied theoretical desired product mass is 40 g and 30 g is collected. Find percentage yield.",
        75,
        "%",
        "30/40 × 100 = 75%; equation economy requires separate equation data.",
        "Use actual/theoretical product.",
      ),
    ],
    [
      n(
        "rb-weight",
        "Retrieve desired coefficient",
        "In 4Al + 3O2 → 2Al2O3, Mr(Al2O3) = 102. Find the desired aluminium oxide contribution.",
        204,
        "",
        "2 × 102 = 204.",
        "Weight the desired product too.",
      ),
      n(
        "rb-fraction",
        "Retrieve changed allocation",
        "A balanced equation gives desired contribution 96 and total reactant contribution 160. Find atom economy.",
        60,
        "%",
        "96/160 × 100 = 60%.",
        "Use all reactants.",
      ),
      n(
        "rb-other",
        "Retrieve full conservation",
        "A balanced equation has total relative contribution 180 and desired contribution 126. Find the other-product contribution.",
        54,
        "",
        "180 − 126 = 54.",
        "Undesired mass still exists.",
      ),
    ],
  ],
};
// The contrast model asks for both measures; its ordinary answer panel remains independently multipart.
atomEconomyJourney.guided[2].model = {
  kind: "atom-economy",
  mode: "contrast",
  instruction: "Change collected mass; predict economy and yield separately.",
};
atomEconomyJourney.guided[0].openingHint = true;
// Append the individually reviewed Higher extension; preserve existing task/form IDs and indices.
const inverseEquation =
  "Supplied: M₂O₃ + 3CO → 2M + 3CO₂. Economy for M: 45.9%. Aᵣ(C) = 12; Aᵣ(O) = 16.";
atomEconomyJourney.guided.push(
  {
    ...n(
      "g-inverse-contribution",
      "Higher: weigh CO₂",
      "Find the other-product relative contribution.",
      132,
      "",
      "3Mr(CO2) = 3 × (12 + 2 × 16) = 132. This is a relative contribution, not a measured mass in grams.",
      "A coefficient multiplies every atom in the formula.",
      {
        kind: "inverse-atom-economy",
        mode: "allocation",
        instruction: "Count the complete other-product contribution.",
      },
    ),
    tier: "higher",
  },
  {
    ...c(
      "g-inverse-equation",
      "Higher: form the ratio",
      "Choose the metal’s mass fraction.",
      "2x ÷ (2x + 132) × 100 = 45.9",
      {
        "x ÷ (2x + 132) × 100 = 45.9":
          "The desired product is 2M, so its contribution is 2x.",
        "2x ÷ 132 × 100 = 45.9":
          "The total includes the metal as well as the other product.",
        "132 ÷ (2x + 132) × 100 = 45.9":
          "132 belongs to the other product, not the desired metal.",
      },
      "2M contributes 2x. All products together contribute 2x + 132, equal to the complete reactant contribution. The unknown occurs in both numerator and denominator.",
      "Weight the desired product and include it in the complete total.",
      {
        kind: "inverse-atom-economy",
        mode: "equation",
        instruction:
          "Construct the desired fraction from the supplied equation.",
      },
    ),
    tier: "higher",
  },
  {
    ...n(
      "g-inverse-complement",
      "Higher: find the rest",
      "Find the other-product percentage.",
      54.1,
      "%",
      "100 − 45.9 = 54.1%. The other contribution 132 is this fraction of the total, so complete total = 132 × 100 / 54.1.",
      "Desired and other contributions together make the whole.",
      {
        kind: "inverse-atom-economy",
        mode: "complement",
        instruction: "Connect the other product to its share of the total.",
      },
    ),
    tier: "higher",
  },
  {
    ...n(
      "g-inverse-solve",
      "Higher: solve for Ar",
      "Find Ar(M) to three significant figures.",
      56,
      "",
      "200x = 45.9(2x + 132), so 108.2x = 6058.8 and x = 55.996303… → 56.0. Alternatively, total = 132 × 100 / 54.1, then x = (total − 132) / 2. Retain full precision until the final rounding; the supplied percentage is rounded and does not uniquely identify a metal.",
      "Use either rearrangement or the other-product percentage. Divide the desired contribution by its coefficient.",
      {
        kind: "inverse-atom-economy",
        mode: "solve",
        instruction:
          "Change your proposed atomic mass and compare its allocation.",
      },
    ),
    tier: "higher",
    answer: "56.0",
    rounding: { kind: "significant-figures", digits: 3 },
  },
);
atomEconomyJourney.refresher.push({
  ...n(
    "r-inverse-rearrange",
    "Higher: try again",
    "Find Ar(M) using either route.",
    56,
    "",
    "200x = 45.9(2x + 132). Expand and collect: 108.2x = 6058.8, so x = 55.996303… → 56.0. Alternatively, total = 132 × 100 / 54.1 and x = (total − 132) / 2. Keep full precision until the final rounding.",
    "The unknown belongs in numerator and denominator; subtract matching x terms from both sides.",
    {
      kind: "inverse-atom-economy",
      mode: "solve",
      instruction:
        "Use the mass ledger and either solution route, then return to your retained answer.",
    },
  ),
  tier: "higher",
  answer: "56.0",
  rounding: { kind: "significant-figures", digits: 3 },
  exposureAliases: ["ae-v1-g-inverse-solve", "ae-v1-p-inverse-metal"],
});
atomEconomyJourney.practice.push(
  {
    ...n(
      "p-inverse-metal",
      "Higher: infer Ar",
      `${inverseEquation} Find Aᵣ(M).`,
      56,
      "",
      "Other-product contribution = 3 × 44 = 132. With Ar(M) = x, 200x = 45.9(2x + 132), so 108.2x = 6058.8. x = 55.996303… → 56.0. The complement method gives the same value. This rounded result does not uniquely identify a metal.",
      "Find the weighted other-product contribution. The unknown metal belongs in the desired contribution and the total.",
    ),
    tier: "higher",
    answer: "56.0",
    rounding: { kind: "significant-figures", digits: 3 },
    followUp: "ae-v1-r-inverse-rearrange",
    exposureAliases: ["ae-v1-g-inverse-solve"],
  },
  {
    ...n(
      "p-inverse-transfer",
      "Higher: new equation",
      "Supplied: MO₂ + 2CO → M + 2CO₂. Economy for M: 70.3%. Aᵣ(C) = 12; Aᵣ(O) = 16. Find Aᵣ(M).",
      208,
      "",
      "Other contribution = 2 × 44 = 88. With Ar(M) = x, 100x = 70.3(x + 88), so 29.7x = 6186.4 and x = 208.296296… → 208. Alternatively, 88 accounts for 29.7% of the total: x = 88 × 100 / 29.7 − 88. No product coefficient of 2 applies to M here.",
      "Start from this equation's coefficients rather than copying 2x from the earlier example.",
    ),
    tier: "higher",
    rounding: { kind: "significant-figures", digits: 3 },
    followUp: "ae-v1-r-inverse-rearrange",
  },
);
for (const id of ["p-tungsten", "ca-percentage", "cb-product"]) {
  const q = [
    ...atomEconomyJourney.practice,
    ...atomEconomyJourney.checkForms.flat(),
  ].find((q) => q.id === `ae-v1-${id}`)!;
  q.rounding = { kind: "decimal-places", digits: 1 };
}
for (const id of ["p-nickel", "cb-percentage"]) {
  const q = [
    ...atomEconomyJourney.practice,
    ...atomEconomyJourney.checkForms.flat(),
  ].find((q) => q.id === `ae-v1-${id}`)!;
  q.rounding = { kind: "significant-figures", digits: 3 };
}
atomEconomyJourney.practice.find(
  (q) => q.id === "ae-v1-p-missing-coefficient",
)!.followUp = "ae-v1-r-base";
atomEconomyJourney.practice.find(
  (q) => q.id === "ae-v1-p-economy-yield",
)!.followUp = "ae-v1-r-yield";

atomEconomyJourney.guided[0].rounding = { kind: "decimal-places", digits: 1 };
