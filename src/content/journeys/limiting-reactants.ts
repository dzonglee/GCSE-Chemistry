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
    `lr-v1-${id}`,
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
): LearningTask => ({
  ...number(`lr-v1-${id}`, prompt, answer, unit, explanation, hint, title),
  title,
});
const p = (
  id: string,
  title: string,
  prompt: string,
  fields: { id: string; label: string; answer: number }[],
  explanation: string,
  hint: string,
): LearningTask => ({
  ...c(
    id,
    title,
    prompt,
    JSON.stringify(
      Object.fromEntries(fields.map((f) => [f.id, String(f.answer)])),
    ),
    {},
    explanation,
    hint,
  ),
  options: undefined,
  parts: fields,
  partLegend: title,
});
const written = (
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
    "Compare both supplies using the balanced equation.",
  ),
  options: undefined,
  rubric,
});
export const limitingReactantsJourney: LessonJourney = {
  version: 1,
  introduction:
    "Compare what each reactant can supply, predict a theoretical maximum and account for everything left over.",
  scopeNote:
    "Higher AQA 4.3.2.4 and combined equivalent; Pearson 1.52. All numerical tasks assume the stated complete reaction with no loss of material. These are theoretical maxima, not a guarantee of actual yield or equilibrium conversion. Supplies are mol quantities: fractional amounts are never rounded to whole molecule events. Optional 3D shows one small illustrative inventory, not mol populations or a reaction mechanism. Practical prompts interpret supplied observations, with no instructions for unsupervised experiments.",
  outcomes: [
    "Compare amount divided by its balanced-equation coefficient for every reactant.",
    "Convert gram or kilogram supplies to mol before comparing capacities.",
    "Predict products and intact excess reactants, including exactly matched supplies.",
    "Explain why extra excess alone cannot raise the theoretical maximum and identify a capacity plateau.",
  ],
  warmup: [
    n(
      "w-oxygen",
      "Recall the ratio",
      "CH₄ + 2O₂ → CO₂ + 2H₂O. How many mol O₂ react with 1 mol CH₄?",
      2,
      "mol",
      "The coefficients give 1:2.",
      "Read both reactant coefficients.",
    ),
    n(
      "w-amount",
      "Recall mass to mol",
      "Find mol Mg in 12 g. M(Mg)=24 g/mol.",
      0.5,
      "mol",
      "12/24=.5 mol.",
      "Divide mass by molar mass.",
    ),
  ],
  refresher: [
    c(
      "r-definition",
      "Identify what stops product formation",
      "In the stated complete reaction, what defines a limiting reactant?",
      "It is completely consumed and prevents further product formation",
      {
        "It always has the smallest gram mass":
          "Different molar masses and coefficients matter.",
        "It remains unused after the other reacts":
          "That describes an excess reactant.",
      },
      "Once a necessary reactant is exhausted, further conversion requires more of that reactant.",
      "Distinguish exhausted supply from remaining supply.",
    ),
    c(
      "r-capacity",
      "Use both coefficients",
      "For A + 2B → product, which capacities should be compared?",
      "n(A)/1 and n(B)/2",
      {
        "n(A) and n(B) without coefficients":
          "Two mol B are required per mol A.",
        "Masses of A and B directly": "Convert using each molar mass first.",
      },
      "Each normalized capacity is the amount of equation extent the supply can support.",
      "Divide by the coefficient of that reactant.",
    ),
    c(
      "r-excess",
      "Keep the leftover",
      "What happens to unused excess reactant in the inventory?",
      "It remains reactant and contributes to total mass",
      {
        "It becomes extra product automatically":
          "Product formation needs all required reactants.",
        "It disappears from mass conservation":
          "Remaining matter still has mass.",
      },
      "Only the consumed portion becomes products; residual reactant stays in the total.",
      "Separate reacted and remaining amounts.",
    ),
    c(
      "r-exact",
      "Handle exact proportions",
      "Both coefficient-normalized capacities are equal. What follows for complete conversion?",
      "Both reactants are consumed with no excess",
      {
        "The smaller raw mol amount must remain":
          "Coefficients, not raw mol, determine the match.",
        "An arbitrary reactant must be declared excess":
          "Equal capacities leave neither in excess.",
      },
      "Exactly matched supplies exhaust both together.",
      "Compare normalized amounts.",
    ),
    c(
      "r-maximum",
      "Bound the prediction",
      "Why is the calculated product amount called a theoretical maximum?",
      "Real conversion or collection may be incomplete",
      {
        "Every real reaction must reach it":
          "Equilibrium, incomplete reaction or collection losses can reduce actual yield.",
        "It ignores the balanced equation":
          "The theoretical maximum uses the equation and available supply.",
      },
      "This lesson assumes complete conversion; actual yield is considered separately.",
      "Distinguish possible amount from measured collection.",
    ),
  ],
  guided: [
    c(
      "g-capacities",
      "Compare both supplies",
      "Start with 3 mol CH₄ and 4 mol O₂. Which limits, and what remains?",
      "Oxygen limits",
      {
        "Methane limits": "Raw 3<4 is not enough: compare 3/1 and 4/2.",
        "Both exactly consumed": "The capacities 3 and 2 differ.",
      },
      "Capacities 3 and 2 give 2 mol CO₂,4 mol H₂O and 1 mol unused CH₄.",
      "Divide each supply by its own coefficient.",
      {
        kind: "limiting-reactants",
        mode: "capacities",
        instruction:
          "Predict capacities, maximum product and remaining reactants.",
      },
    ),
    c(
      "g-masses",
      "Compare masses through mol",
      "Mg + 2HCl → MgCl₂ + H₂. Supplies 12 g Mg and 14.6 g HCl. M:24,36.5 g/mol. Which limits?",
      "HCl limits",
      {
        "Mg limits because 12<14.6":
          "Mg=.5 mol; HCl=.4 mol, only .2 mol of equation extent.",
        "Neither; both gram masses are sufficient":
          "Sufficiency must be checked against the reaction ratio.",
      },
      "Capacities .5 and .2 give .2 mol H₂=.4 g, with 7.2 g Mg remaining.",
      "Convert each mass then compare n/coefficient.",
      {
        kind: "limiting-reactants",
        mode: "masses",
        instruction:
          "Predict both mol amounts, limiting reactant, H₂ mass and remaining Mg.",
      },
    ),
    c(
      "g-change",
      "Change one supply",
      "For initial 3 mol CH₄ and 4 mol O₂, compare adding 2 mol CH₄ or 4 mol O₂ before complete reaction.",
      "Extra oxygen can increase maximum CO₂",
      {
        "Extra methane must increase maximum CO₂":
          "Oxygen still supports only 2 mol CO₂.",
        "Extra oxygen can never change the limiting reactant":
          "With 8 mol O₂, methane now limits at 3 mol CO₂.",
      },
      "Additional excess methane leaves maximum 2 mol. Enough added oxygen raises it to 3 mol and changes the limiting reactant.",
      "Compare both capacities again after each change.",
      {
        kind: "limiting-reactants",
        mode: "change",
        instruction:
          "Choose a fresh starting supply and predict products and leftovers.",
      },
    ),
    c(
      "g-plateau",
      "Explain a product plateau",
      "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂. Keep HCl fixed at .02 mol and increase carbonate. What limits beyond .01 mol carbonate?",
      "HCl limits",
      {
        "Carbonate always limits":
          "Beyond .01 mol carbonate, acid capacity is smaller.",
        "CO₂ amount rises indefinitely":
          "Fixed acid supports only .01 mol CO₂.",
      },
      "Below .01 mol carbonate it limits; at .01 both are matched; above this acid limits and carbonate remains.",
      "Compare carbonate/1 with acid/2.",
      {
        kind: "limiting-reactants",
        mode: "plateau",
        instruction:
          "Predict maximum CO₂ and residual carbonate on the amount graph.",
      },
    ),
  ],
  practice: [
    p(
      "p-capacities",
      "Construct both capacities",
      "CH₄ + 2O₂ → CO₂ + 2H₂O. Supplies 4 mol CH₄ and 6 mol O₂. Enter each amount divided by its coefficient.",
      [
        { id: "methane", label: "CH₄ capacity / mol", answer: 4 },
        { id: "oxygen", label: "O₂ capacity / mol", answer: 3 },
      ],
      "4/1=4;6/2=3; oxygen limits.",
      "Use the respective coefficients.",
    ),
    c(
      "p-raw-mol",
      "Reject raw mol comparison",
      "N₂ + 3H₂ → 2NH₃. Supplies 2 mol N₂ and 3 mol H₂. Which limits the theoretical conversion?",
      "Hydrogen",
      {
        "Nitrogen because 2<3": "Capacities 2 and 1 make hydrogen limiting.",
        Both: "The supplies are not 1:3.",
      },
      "H₂ supports 1 mol extent, less than N₂ capacity 2. Real Haber equilibrium can give lower actual conversion.",
      "Use n divided by coefficient.",
    ),
    p(
      "p-product",
      "Predict both products",
      "CH₄ + 2O₂ → CO₂ + 2H₂O. Supplies 4 mol CH₄ and 6 mol O₂. Find maximum mol of each product.",
      [
        { id: "carbon", label: "CO₂ / mol", answer: 3 },
        { id: "water", label: "H₂O / mol", answer: 6 },
      ],
      "O₂ capacity 3 sets extent 3; products 3 and 6 mol.",
      "Multiply the smaller capacity by each product coefficient.",
    ),
    p(
      "p-leftovers",
      "Account for unused supply",
      "For 4 mol CH₄ and 6 mol O₂ reacting completely, enter remaining mol CH₄ and O₂.",
      [
        { id: "methane", label: "CH₄ remaining / mol", answer: 1 },
        { id: "oxygen", label: "O₂ remaining / mol", answer: 0 },
      ],
      "Consumed CH₄3, O₂6; remaining 1 and 0.",
      "Subtract consumed amounts from initial supply.",
    ),
    p(
      "p-fractional",
      "Keep fractional mol",
      "CH₄ + 2O₂ → CO₂ + 2H₂O. Supplies .3 mol CH₄ and .4 mol O₂. Enter maximum CO₂ and remaining CH₄ mol.",
      [
        { id: "carbon", label: "CO₂ / mol", answer: 0.2 },
        { id: "left", label: "CH₄ remaining / mol", answer: 0.1 },
      ],
      "Extent .2 mol, not zero whole events; remaining methane .1 mol.",
      "Mol quantities are continuous.",
    ),
    c(
      "p-exact",
      "Recognize matched supplies",
      "CH₄ + 2O₂ → CO₂ + 2H₂O. Supplies .7 mol CH₄ and 1.4 mol O₂. Which remains?",
      "Neither reactant",
      {
        Methane: "Both capacities are .7.",
        Oxygen: "The full 1.4 mol O₂ is required for .7 mol CH₄.",
      },
      "Exactly 1:2 supplies consume both in the stated complete reaction.",
      "Compare normalized capacities.",
    ),
    p(
      "p-mass-mol",
      "Convert different masses",
      "Mg + 2HCl → MgCl₂ + H₂. Supplies 7.2 g Mg and 14.6 g HCl. M:24,36.5 g/mol. Enter initial mol amounts.",
      [
        { id: "metal", label: "Mg / mol", answer: 0.3 },
        { id: "acid", label: "HCl / mol", answer: 0.4 },
      ],
      "7.2/24=.3;14.6/36.5=.4.",
      "Use each substance’s own molar mass.",
    ),
    p(
      "p-mass-capacity",
      "Normalize converted amounts",
      "For .3 mol Mg and .4 mol HCl, Mg + 2HCl → MgCl₂ + H₂, enter the two capacities.",
      [
        { id: "metal", label: "Mg capacity / mol", answer: 0.3 },
        { id: "acid", label: "HCl capacity / mol", answer: 0.2 },
      ],
      "Mg .3/1=.3; HCl .4/2=.2; acid limits.",
      "Amounts alone are not sufficient.",
    ),
    n(
      "p-hydrogen-mass",
      "Convert limiting product to grams",
      "Mg + 2HCl → MgCl₂ + H₂. Supplies 7.2 g Mg and 14.6 g HCl. M:24,36.5,95,2 g/mol. Find maximum H₂ mass.",
      0.4,
      "g",
      "Acid capacity .2; H₂ .2×2=.4 g.",
      "Find the smaller capacity before product mass.",
    ),
    n(
      "p-metal-left",
      "Find the remaining metal mass",
      "For 7.2 g Mg and 14.6 g HCl in Mg + 2HCl → MgCl₂ + H₂, M:24,36.5 g/mol. Find remaining Mg mass.",
      2.4,
      "g",
      "Acid permits .2 mol Mg to react=4.8 g;7.2−4.8=2.4 g.",
      "Consumed Mg is determined by the limiting acid.",
    ),
    p(
      "p-reverse-limit",
      "Switch to metal-limited supply",
      "Mg + 2HCl → MgCl₂ + H₂. Supplies 2.4 g Mg and 14.6 g HCl. M:24,36.5,2 g/mol. Enter maximum H₂ mass and remaining HCl mol.",
      [
        { id: "product", label: "H₂ / g", answer: 0.2 },
        { id: "acid", label: "HCl remaining / mol", answer: 0.2 },
      ],
      "Mg=.1 mol limits; H₂=.2 g; HCl consumed .2 of .4 mol.",
      "Check which capacity is smaller in this new dataset.",
    ),
    n(
      "p-total-mass",
      "Retain products and excess",
      "Closed inventory initially contains 7.2 g Mg and 14.6 g HCl. Complete reaction produces 19 g MgCl₂ and .4 g H₂;2.4 g Mg remains. Find final total contents mass.",
      21.8,
      "g",
      "19+.4+2.4=21.8 g=7.2+14.6.",
      "Unused reactant still has mass.",
    ),
    p(
      "p-titanium",
      "Transfer to coefficient four",
      "TiCl₄ + 4Na → Ti + 4NaCl. Supplies 38 g TiCl₄ and 23 g Na. M:190,23 g/mol. Enter each capacity in mol.",
      [
        { id: "titanium", label: "TiCl₄ capacity / mol", answer: 0.2 },
        { id: "sodium", label: "Na capacity / mol", answer: 0.25 },
      ],
      "TiCl₄38/190=.2; Na 23/23=1 mol then/4=.25; TiCl₄ limits despite its greater mass.",
      "Use the coefficient 4 after converting sodium to mol.",
    ),
    p(
      "p-kilograms",
      "Preserve kg units",
      "TiCl₄ + 4Na → Ti + 4NaCl. Supplies 19 kg TiCl₄ and 18.4 kg Na. M:190,23,48 g/mol for TiCl₄,Na,Ti. Enter maximum Ti mass and remaining Na mass in kg.",
      [
        { id: "product", label: "Ti / kg", answer: 4.8 },
        { id: "left", label: "Na remaining / kg", answer: 9.2 },
      ],
      "19000/190=100 mol TiCl₄;18400/23=800 mol Na. Extent 100;Ti 4800 g=4.8 kg;Na consumes 400 mol=9.2 kg, leaving 9.2 kg.",
      "Convert kg to g before mol; convert final requested masses back.",
    ),
    c(
      "p-add-excess",
      "Test adding only excess",
      "CH₄ + 2O₂ → CO₂ + 2H₂O. Supplies 5 mol CH₄ and 4 mol O₂ after adding methane to a mixture. Maximum CO₂?",
      "2 mol",
      {
        "4 mol": "O₂ coefficient 2 makes its capacity 2.",
        "5 mol": "Methane alone cannot react without sufficient oxygen.",
      },
      "Capacities 5 and 2; maximum 2 mol CO₂.",
      "Recompare both capacities.",
    ),
    c(
      "p-add-limiting",
      "Identify a changed limiting supply",
      "CH₄ + 2O₂ → CO₂ + 2H₂O. Supplies 3 mol CH₄ and 8 mol O₂. Which now limits?",
      "Methane",
      {
        Oxygen: "O₂ capacity 4 exceeds methane capacity 3.",
        Neither: "The supplies are not matched.",
      },
      "Methane limits at 3 mol CO₂;2 mol O₂ remains.",
      "The limiting reactant can change when supplies change.",
    ),
    p(
      "p-plateau",
      "Read theoretical acid capacity",
      "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂. Supplies .025 mol carbonate and .03 mol HCl. Enter maximum CO₂ and remaining carbonate mol.",
      [
        { id: "product", label: "CO₂ / mol", answer: 0.015 },
        { id: "left", label: "Carbonate remaining / mol", answer: 0.01 },
      ],
      "Acid capacity .03/2=.015; carbonate remainder .025−.015=.01.",
      "Use the fixed acid amount in this new dataset.",
    ),
    c(
      "p-observation",
      "Interpret supplied excess evidence",
      "A supplied school observation states: after reaction with HCl has stopped, added insoluble ZnO no longer disappears. What supports ZnO being in excess?",
      "Some ZnO remains unreacted",
      {
        "The solution is colourless":
          "Colour alone does not establish remaining reactant.",
        "A solid must always be limiting":
          "A remaining necessary reactant can be excess.",
      },
      "Undissolved oxide remaining after the stated completed reaction supports excess.",
      "Link the observation to material left over.",
    ),
    c(
      "p-separate",
      "Choose a removable excess",
      "Why use excess insoluble ZnO rather than excess hydrochloric acid when preparing a zinc chloride solution?",
      "Unused ZnO can be filtered off",
      {
        "Only because all acid is used up":
          "That does not explain why one kind of excess can be removed more readily.",
        "Dissolved acid is removed by ordinary filtration":
          "Dissolved substances pass through an ordinary filter.",
      },
      "An insoluble solid excess is separable by filtration; dissolved excess acid is not. This supplied practical interpretation gives no procedure.",
      "Compare separation of a solid and a dissolved reagent.",
    ),
    written(
      "p-explain",
      "Explain a larger-mass limiting reactant",
      "TiCl₄ + 4Na → Ti + 4NaCl. Supplies 38 g TiCl₄ and 23 g Na; M:190 and 23 g/mol. Explain with calculations why TiCl₄ limits.",
      "TiCl₄ amount 38/190=.2 mol. Na amount 23/23=1 mol. .2 mol TiCl₄ needs .8 mol Na, less than the 1 mol available, so Na is excess and TiCl₄ limits. Alternatively compare capacities .2 and 1/4=.25 mol.",
      [
        "Convert both masses with the supplied molar masses.",
        "Apply the factor 4 or show an equivalent required-mass comparison.",
        "Use the numerical comparison to justify TiCl₄ limiting and sodium excess.",
      ],
    ),
    written(
      "p-graph-explain",
      "Explain the plateau without confusing rate",
      "For fixed .02 mol HCl and increasing Na₂CO₃, a theoretical CO₂ amount graph stops rising beyond .01 mol carbonate. Explain this plateau and what remains.",
      "The equation needs 2 mol HCl per 1 mol carbonate. .02 mol HCl permits .01 mol carbonate to react and forms at most .01 mol CO₂. Beyond this, HCl is fully consumed and extra carbonate remains unused. This product-amount graph does not measure reaction rate.",
      [
        "Apply the 1:2 reactant ratio.",
        "Link the plateau to exhausted acid and a fixed theoretical product maximum.",
        "Identify unused carbonate and distinguish amount from rate.",
      ],
    ),
  ],
  checkForms: [
    [
      p(
        "ca-capacity",
        "Independent capacity comparison",
        "CH₄ + 2O₂ → CO₂ + 2H₂O. Supplies .9 mol CH₄ and 1.2 mol O₂. Enter both capacities and maximum CO₂ mol.",
        [
          { id: "methane", label: "CH₄ capacity / mol", answer: 0.9 },
          { id: "oxygen", label: "O₂ capacity / mol", answer: 0.6 },
          { id: "product", label: "CO₂ / mol", answer: 0.6 },
        ],
        "Capacities .9 and .6, extent .6.",
        "Apply both coefficients.",
      ),
      p(
        "ca-mass",
        "Independent mass and leftover",
        "Mg + 2HCl → MgCl₂ + H₂. Supplies 9.6 g Mg and 21.9 g HCl. M:24,36.5,2 g/mol. Enter H₂ g and Mg remaining g.",
        [
          { id: "product", label: "H₂ / g", answer: 0.6 },
          { id: "left", label: "Mg remaining / g", answer: 2.4 },
        ],
        "Capacities .4 and .3; H₂.3×2=.6 g; Mg(.4−.3)×24=2.4 g.",
        "Convert mass then compare capacities.",
      ),
      n(
        "ca-change",
        "Independent changed supply",
        "CH₄ + 2O₂ → CO₂ + 2H₂O. A fresh mixture has .9 mol CH₄ and 2.4 mol O₂. Maximum CO₂ mol?",
        0.9,
        "mol",
        "Capacities .9 and 1.2; methane limits.",
        "Recompare the changed supply.",
      ),
      p(
        "ca-plateau",
        "Independent carbonate inventory",
        "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂. Supplies .018 mol carbonate and .024 mol HCl. Find maximum CO₂ and remaining carbonate mol.",
        [
          { id: "product", label: "CO₂ / mol", answer: 0.012 },
          { id: "left", label: "Carbonate remaining / mol", answer: 0.006 },
        ],
        "Acid capacity .012; carbonate leftover .006.",
        "Compare carbonate with acid/2.",
      ),
      written(
        "ca-proof",
        "Independent numerical explanation",
        "TiCl₄ + 4Na → Ti + 4NaCl. Supplies 57 g TiCl₄ and 23 g Na, M190 and 23 g/mol. Explain which limits with numbers.",
        "TiCl₄=.3 mol; Na=1 mol. .3 mol TiCl₄ requires 1.2 mol Na, more than 1 mol available; sodium limits. Equivalently capacities .3 and .25 show sodium smaller.",
        [
          "Show both mol amounts or an equivalent required-mass comparison.",
          "Use coefficient 4.",
          "Conclude sodium limits using the calculated comparison.",
        ],
      ),
    ],
    [
      p(
        "cb-capacity",
        "Independent different capacities",
        "CH₄ + 2O₂ → CO₂ + 2H₂O. Supplies .8 mol CH₄ and 2 mol O₂. Enter both capacities and maximum CO₂ mol.",
        [
          { id: "methane", label: "CH₄ capacity / mol", answer: 0.8 },
          { id: "oxygen", label: "O₂ capacity / mol", answer: 1 },
          { id: "product", label: "CO₂ / mol", answer: 0.8 },
        ],
        "Capacities .8 and 1; methane limits.",
        "Apply the equation ratio.",
      ),
      p(
        "cb-mass",
        "Independent acid remainder",
        "Mg + 2HCl → MgCl₂ + H₂. Supplies 3.6 g Mg and 21.9 g HCl. M24,36.5,2 g/mol. Find H₂ mass g and remaining HCl mol.",
        [
          { id: "product", label: "H₂ / g", answer: 0.3 },
          { id: "left", label: "HCl remaining / mol", answer: 0.3 },
        ],
        "Mg=.15 mol;HCl=.6 mol. Mg limits;H₂.3 g;HCl consumes .3 mol leaving .3 mol.",
        "Subtract the reacted acid amount.",
      ),
      n(
        "cb-change",
        "Independent extra excess",
        "CH₄ + 2O₂ → CO₂ + 2H₂O. A fresh mixture has 1.6 mol CH₄ and 1 mol O₂. Maximum CO₂ mol?",
        0.5,
        "mol",
        "Oxygen capacity .5 remains the limit.",
        "Extra methane does not create extra oxygen.",
      ),
      p(
        "cb-plateau",
        "Independent changed acid amount",
        "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂. Supplies .014 mol carbonate and .018 mol HCl. Find maximum CO₂ and carbonate remaining mol.",
        [
          { id: "product", label: "CO₂ / mol", answer: 0.009 },
          { id: "left", label: "Carbonate remaining / mol", answer: 0.005 },
        ],
        "Acid capacity .009; remaining carbonate .005.",
        "Use this dataset’s acid supply.",
      ),
      written(
        "cb-proof",
        "Independent equal-supply reasoning",
        "TiCl₄ + 4Na → Ti + 4NaCl. Supplies 47.5 g TiCl₄ and 23 g Na, M190 and 23 g/mol. Explain whether either is excess.",
        "TiCl₄=.25 mol andNa=1 mol. Capacities .25 and 1/4=.25 are equal. The supplied complete reaction consumes both; neither is excess.",
        [
          "Calculate both amounts or equivalent required masses.",
          "Apply factor 4.",
          "Explain equal capacities and no excess.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-product",
        "Retrieve capacity-controlled product",
        "N₂ + 3H₂ → 2NH₃. Supplies .4 mol N₂ and .9 mol H₂. Maximum NH₃ mol assuming complete conversion?",
        0.6,
        "mol",
        "Capacities .4 and .3;NH₃2×.3=.6.",
        "Use the smaller capacity.",
      ),
      n(
        "ra-left",
        "Retrieve excess amount",
        "For .4 mol N₂ and .9 mol H₂ in N₂+3H₂→2NH₃, find N₂ remaining mol under complete conversion.",
        0.1,
        "mol",
        "H₂ permits .3 mol N₂; .4−.3=.1.",
        "Subtract consumed from supplied.",
      ),
      n(
        "ra-plateau",
        "Retrieve fixed acid maximum",
        "Na₂CO₃+2HCl→2NaCl+H₂O+CO₂. Supplies .04 mol carbonate and .05 mol HCl. Maximum CO₂ mol?",
        0.025,
        "mol",
        "Acid capacity .025 limits.",
        "Compare both capacities.",
      ),
    ],
    [
      n(
        "rb-product",
        "Retrieve reverse limiting direction",
        "N₂+3H₂→2NH₃. Supplies .2 mol N₂ and .9 mol H₂. Maximum NH₃ mol under complete conversion?",
        0.4,
        "mol",
        "Nitrogen capacity .2 smaller than .3;NH₃=.4.",
        "Do not assume hydrogen always limits.",
      ),
      n(
        "rb-left",
        "Retrieve remaining hydrogen",
        "For .2 mol N₂ and .9 mol H₂ in N₂+3H₂→2NH₃, find H₂ remaining mol under complete conversion.",
        0.3,
        "mol",
        "ConsumedH₂3×.2=.6;left.3.",
        "Use the hydrogen coefficient.",
      ),
      n(
        "rb-plateau",
        "Retrieve carbonate-limited product",
        "Na₂CO₃+2HCl→2NaCl+H₂O+CO₂. Supplies .012 mol carbonate and .04 mol HCl. Maximum CO₂ mol?",
        0.012,
        "mol",
        "Carbonate capacity .012 smaller thanacid .02.",
        "The plateau threshold depends on fixed acid amount.",
      ),
    ],
  ],
};
limitingReactantsJourney.guided[0].openingHint = true;
limitingReactantsJourney.practice.find(
  (q) => q.id === "lr-v1-p-raw-mol",
)!.followUp = "lr-v1-r-capacity";
limitingReactantsJourney.practice.find(
  (q) => q.id === "lr-v1-p-add-excess",
)!.followUp = "lr-v1-r-excess";
