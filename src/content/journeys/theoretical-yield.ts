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
    `ty-v1-${id}`,
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
    `ty-v1-${id}`,
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
  model?: TaskModel,
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
    model,
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
    "Construct the product maximum and separate it from the amount obtained.",
  ),
  options: undefined,
  rubric,
});
export const theoreticalYieldJourney: LessonJourney = {
  version: 1,
  introduction:
    "Construct the product maximum from the equation before using collected yield.",
  scopeNote:
    "Higher separate Chemistry: AQA 4.3.3.1, with reacting-mass and limiting-supply reasoning from 4.3.2.2/4.3.2.4. Supplied theoretical amounts are taught in Percentage yield; this lesson constructs them. Use the stated active/pure reactant amount, matching gram units and supplied molar masses. The maximum assumes the stated reaction and complete conversion of the limiting supply. Other reactants must be sufficient. Fractional mol are not floored to whole molecular events. Real Haber conversion, product recovery and purity are not guaranteed by a theoretical maximum. Inverse reactant requirements assume the supplied yield remains applicable. All examples are calculations or inventories, not experimental procedures.",
  outcomes: [
    "Construct mol amounts, stoichiometric product amount and theoretical product grams.",
    "Use the constructed product denominator for percentage yield, including unit and purity transfer.",
    "Calculate actual collection or recover a required starting amount through inverse steps.",
    "Compare possible products from every limited supply and retain unused material.",
    "Keep calculation precision until the specified final rounding and justify assumptions.",
  ],
  warmup: [
    n(
      "w-moles",
      "Recall mass to amount",
      "Find the amount in 6 g Mg. M(Mg) = 24 g/mol.",
      0.25,
      "mol",
      "6/24 = 0.25 mol.",
      "Use grams divided by g/mol.",
    ),
    n(
      "w-factor",
      "Recall a yield factor",
      "Write 80% as a decimal factor.",
      0.8,
      "",
      "80/100 = 0.8.",
      "Divide the percent number by 100.",
    ),
  ],
  refresher: [
    c(
      "r-maximum",
      "State the maximum assumption",
      "What does the theoretical maximum assume for the stated reaction?",
      "Complete conversion of the limiting active reactant with other reactants sufficient",
      {
        "Every real reaction must reach 100% collection":
          "Theory is not a guarantee of conversion or recovery.",
        "Every gram of the reaction mixture becomes the desired product":
          "Other products and excess reactants may remain.",
      },
      "Use the active amount, equation and limiting supply to calculate the ideal product maximum.",
      "Separate an ideal maximum from an observation.",
    ),
    p(
      "r-ratio",
      "Recall the mol ratio",
      "N2 + 3H2 → 2NH3. From 0.4 mol N2 with sufficient H2, find NH3 mol. Then find N2 mol needed for 0.6 mol theoretical NH3.",
      [
        { id: "forward", label: "Forward NH3 / mol", answer: 0.8 },
        { id: "reverse", label: "Reverse N2 / mol", answer: 0.3 },
      ],
      "Forward: 0.4 × 2/1 = 0.8 mol NH3. Reverse: 0.6 × 1/2 = 0.3 mol N2. The ratio direction follows the given and requested substances.",
      "Multiply by requested coefficient divided by given coefficient.",
    ),
    n(
      "r-product-mass",
      "Recall product molar mass",
      "Find the mass of 0.2 mol dry MgCl2. M(MgCl2) = 95 g/mol.",
      19,
      "g",
      "0.2 × 95 = 19 g.",
      "Use the product molar mass.",
    ),
    c(
      "r-denominator",
      "Choose the constructed denominator",
      "Which mass belongs in the denominator of percentage yield?",
      "The maximum mass of the same desired product calculated from the limiting reactant",
      {
        "The starting reactant mass":
          "Different substances have different molar masses and coefficients.",
        "The total mass including excess and by-products":
          "That is a different inventory boundary.",
      },
      "Construct theoretical PRODUCT mass first; then compare actual product in the same units and on a comparable basis.",
      "Ask what 100% of the specified product means.",
    ),
    c(
      "r-inverse",
      "Reverse the collection step",
      "A positive collected mass is 80% of its theoretical product maximum. What is the first inverse operation?",
      "Divide collected product mass by 0.8",
      {
        "Multiply collected mass by 0.8":
          "That makes it smaller instead of recovering 100%.",
        "Divide collected mass directly by the reactant molar mass":
          "It is still product mass.",
      },
      "Recover theoretical product before converting product mol and reversing the equation ratio.",
      "Undo the last operation first.",
    ),
  ],
  guided: [
    n(
      "g-maximum",
      "Build the product maximum",
      "For the initial record, 14 g N2 and 4 g H2, find maximum ammonia mass.",
      17,
      "g",
      "14/28 = 0.5 mol N2; × 2 = 1 mol NH3; × 17 = 17 g.",
      "Convert reactant grams to mol, apply the ratio, then use product molar mass.",
      {
        kind: "theoretical-yield",
        mode: "maximum",
        instruction:
          "Choose a record; predict reactant grams, mol amounts and product maximum.",
      },
    ),
    p(
      "g-percentage",
      "Construct the yield denominator",
      "Fe2O3 + 3CO → 2Fe + 3CO2. Pure oxide 16 g; excess CO; dry iron collected 9.8 g. M(Fe2O3) = 160 and M(Fe) = 56 g/mol. Enter theoretical Fe grams and yield.",
      [
        { id: "theoretical", label: "Theoretical Fe / g", answer: 11.2 },
        { id: "percentage", label: "Yield / %", answer: 87.5 },
      ],
      "16/160 × 2 × 56 = 11.2 g theoretical Fe; 9.8/11.2 × 100 = 87.5%.",
      "Starting oxide mass is not the product maximum.",
      {
        kind: "theoretical-yield",
        mode: "percentage",
        instruction:
          "Construct the iron maximum before proposing a percentage.",
      },
    ),
    p(
      "g-collected",
      "Use maximum then yield",
      "CaCO3 → CaO + CO2. Pure carbonate 25 g; recorded dry CaO yield 80%. M(CaCO3) = 100 and M(CaO) = 56 g/mol. Enter theoretical and collected CaO grams.",
      [
        { id: "theoretical", label: "Theoretical CaO / g", answer: 14 },
        { id: "actual", label: "Collected CaO / g", answer: 11.2 },
      ],
      "25/100 × 56 = 14 g maximum CaO; 14 × 0.8 = 11.2 g collected.",
      "Apply yield to the product maximum.",
      {
        kind: "theoretical-yield",
        mode: "collected",
        instruction: "Build the maximum; apply the recorded yield factor.",
      },
    ),
    p(
      "g-required",
      "Recover the starting requirement",
      "Mg + 2HCl → MgCl2 + H2. Target collected dry MgCl2 19 g at 80% yield; HCl sufficient. M(Mg) = 24 and M(MgCl2) = 95 g/mol. Enter theoretical product and required starting Mg grams.",
      [
        { id: "theoretical", label: "Theoretical MgCl2 / g", answer: 23.75 },
        { id: "reactant", label: "Starting Mg / g", answer: 6 },
      ],
      "19/0.8 = 23.75 g maximum product; /95 = 0.25 mol MgCl2; 1:1 requires 0.25 mol Mg, or 6 g.",
      "Recover product maximum before reversing the equation.",
      {
        kind: "theoretical-yield",
        mode: "required",
        instruction: "Undo yield, then molar mass and the equation ratio.",
      },
    ),
    p(
      "g-limited",
      "Compare both supplies first",
      "2Al + Fe2O3 → 2Fe + Al2O3. Supplies: 270 g Al and 1000 g oxide. Dry Fe collected 420 g. M values: Al 27, Fe2O3 160, Fe 56 g/mol. Enter theoretical Fe grams and yield.",
      [
        { id: "theoretical", label: "Theoretical Fe / g", answer: 560 },
        { id: "percentage", label: "Yield / %", answer: 75 },
      ],
      "Al can give 10 mol Fe; oxide 12.5 mol Fe. Al limits: 10 × 56 = 560 g maximum. 420/560 × 100 = 75%.",
      "Use the smaller possible product, not the smaller gram mass.",
      {
        kind: "theoretical-yield",
        mode: "limited",
        instruction:
          "Predict product capacities, limiting supply, maximum and collected yield.",
      },
    ),
  ],
  practice: [
    p(
      "p-maximum",
      "Transfer to a different product",
      "2H2 + O2 → 2H2O. Starting O2 8 g; H2 sufficient. M(O2) = 32, M(H2O) = 18 g/mol. Enter O2 mol, theoretical water mol and water grams.",
      [
        { id: "reactant", label: "O2 amount / mol", answer: 0.25 },
        { id: "product", label: "H2O amount / mol", answer: 0.5 },
        { id: "mass", label: "Maximum H2O / g", answer: 9 },
      ],
      "8/32 = 0.25 mol O2; × 2 = 0.5 mol water; × 18 = 9 g.",
      "Coefficients apply to mol, not directly to grams.",
    ),
    c(
      "p-gram-ratio",
      "Repair direct coefficient scaling",
      "For 2H2 + O2 → 2H2O, a student doubles 8 g O2 to predict 16 g water. What is missing?",
      "Conversion through the different reactant and product molar masses",
      {
        "Only changing the word grams to mol":
          "A label cannot perform the conversion.",
        "An extra oxygen atom in each water": "The formula must stay H2O.",
      },
      "8/32 × 2 × 18 = 9 g water; the 1:2 ratio describes mol amounts.",
      "Use mass → mol → ratio → mass.",
    ),
    n(
      "p-percentage",
      "Transfer the product denominator",
      "CaCO3 → CaO + CO2. Pure carbonate 20 g gives 8.96 g dry CaO collected. M values 100 and 56 g/mol. Find percentage yield.",
      80,
      "%",
      "Maximum CaO = 20/100 × 56 = 11.2 g. Yield = 8.96/11.2 × 100 = 80%.",
      "Construct the same-product maximum first.",
    ),
    c(
      "p-wrong-denominator",
      "Repair the reactant denominator",
      "In the preceding carbonate record, why is 8.96/20 × 100 unsuitable as percentage yield?",
      "20 g is carbonate reactant, not theoretical CaO product",
      {
        "The measured dry CaO has no mass": "It is the actual product mass.",
        "The reaction creates oxygen atoms":
          "All atoms remain in the complete reaction products.",
      },
      "Theoretical CaO is 11.2 g; both terms of the yield fraction must refer to CaO.",
      "Keep substance identity with the units.",
    ),
    p(
      "p-kg",
      "Preserve kg-to-g transfer",
      "CaCO3 → CaO + CO2. Pure carbonate 0.050 kg; dry CaO collected 21 g. M values 100 and 56 g/mol. Enter reactant grams, theoretical CaO grams and yield.",
      [
        { id: "grams", label: "Carbonate / g", answer: 50 },
        { id: "theoretical", label: "Maximum CaO / g", answer: 28 },
        { id: "percentage", label: "Yield / %", answer: 75 },
      ],
      "0.050 kg = 50 g; maximum = 28 g; 21/28 × 100 = 75%.",
      "Convert the reactant mass before using g/mol.",
    ),
    p(
      "p-forward",
      "Transfer collected amount",
      "2H2 + O2 → 2H2O. O2 16 g; H2 sufficient; recorded water yield 75%. M values O2 32, water 18 g/mol. Enter maximum and collected water grams.",
      [
        { id: "theoretical", label: "Maximum H2O / g", answer: 18 },
        { id: "actual", label: "Collected H2O / g", answer: 13.5 },
      ],
      "16/32 × 2 × 18 = 18 g maximum; × 0.75 = 13.5 g collected.",
      "Apply the percent factor to theoretical water.",
    ),
    c(
      "p-starting-percent",
      "Reject applying yield to starting mass",
      "In that water record, why is 16 × 0.75 unsuitable as collected water mass?",
      "16 g is starting oxygen; yield must multiply the theoretical water mass",
      {
        "A yield percentage must always be added":
          "It represents a fraction of the maximum.",
        "All substances have equal molar masses": "O2 and H2O differ.",
      },
      "Construct 18 g water first, then 18 × 0.75 = 13.5 g.",
      "Choose the correct product base.",
    ),
    p(
      "p-reverse",
      "Reverse both steps",
      "N2 + 3H2 → 2NH3. Target collected NH3 20.4 g at 80% yield; H2 sufficient. M values N2 28, NH3 17 g/mol. Enter theoretical NH3 grams and starting N2 grams.",
      [
        { id: "theoretical", label: "Maximum NH3 / g", answer: 25.5 },
        { id: "reactant", label: "Starting N2 / g", answer: 21 },
      ],
      "20.4/0.8 = 25.5 g NH3; /17 = 1.5 mol NH3; /2 = 0.75 mol N2; ×28 = 21 g.",
      "Undo collection before the product/reactant ratio.",
    ),
    c(
      "p-inverse-ratio",
      "Repair an inverse coefficient error",
      "For N2 + 3H2 → 2NH3, 1.5 mol theoretical NH3 is needed. Which nitrogen amount is required?",
      "0.75 mol N2",
      {
        "3 mol N2":
          "That multiplies by two when the inverse requires dividing.",
        "1.5 mol N2": "The product/reactant ratio is 2:1.",
      },
      "1.5 × 1/2 = 0.75 mol nitrogen.",
      "Reverse the direction of the ratio.",
    ),
    p(
      "p-active",
      "Use the active amount",
      "A 20 g sample contains 80% CaCO3 by mass; the remainder is inert. CaCO3 → CaO + CO2. M values 100/56 g/mol. Dry CaO collected 8.064 g. Enter active carbonate grams, maximum CaO grams and yield.",
      [
        { id: "active", label: "Active carbonate / g", answer: 16 },
        { id: "theoretical", label: "Maximum CaO / g", answer: 8.96 },
        { id: "percentage", label: "Yield / %", answer: 90 },
      ],
      "Active mass 20 × 0.8 =16 g. Maximum 16/100 ×56 =8.96 g; 8.064/8.96 ×100=90%.",
      "Inert material does not supply reaction moles.",
    ),
    c(
      "p-assumption",
      "Check an unstated excess",
      "A student calculates product from one reactant mass, but a second necessary reactant has an unknown amount. What is needed before calling it the maximum?",
      "Evidence that the second reactant is sufficient, or its amount to identify the limit",
      {
        "Assume the reactant with larger grams is sufficient":
          "Stoichiometric requirements depend on molar masses and coefficients.",
        "Ignore the balanced equation": "The product ratio depends on it.",
      },
      "A one-reactant calculation is conditional on the other supply being sufficient.",
      "Do not invent an excess from missing data.",
    ),
    p(
      "p-limiting",
      "Construct a changed limiting maximum",
      "2Mg + O2 → 2MgO. Supplies 6 g Mg and 8 g O2; dry MgO collected 8 g. M values 24,32,40 g/mol. Enter maximum MgO grams and yield.",
      [
        { id: "theoretical", label: "Maximum MgO / g", answer: 10 },
        { id: "percentage", label: "Yield / %", answer: 80 },
      ],
      "Mg 0.25 mol could give 0.25 mol MgO; O2 0.25 mol could give 0.5 mol MgO. Mg limits: 10 g maximum; 8/10 ×100=80%.",
      "Compare possible product amounts from both supplies.",
    ),
    c(
      "p-larger-grams",
      "Reject gram-only limitation",
      "For 2Al + Fe2O3 → 2Fe + Al2O3, supplies 540 g Al and 800 g oxide (M values 27/160) can give 20 mol and 10 mol Fe respectively. Which supply limits?",
      "Fe2O3, despite having the larger gram mass",
      {
        "Al, because 540 is smaller than 800":
          "It could give 20 mol Fe, more than the oxide can.",
        "Both, because the gram amounts look comparable":
          "Their possible product amounts differ.",
      },
      "The oxide capacity 10 mol is smaller; grams are not directly comparable capacities.",
      "Compare the same possible product.",
    ),
    p(
      "p-inventory",
      "Retain theoretical excess",
      "2Al + Fe2O3 → 2Fe + Al2O3. Supplies 5.4 g Al and 32 g oxide; complete limiting conversion. M values 27/160/56/102 g/mol. Enter theoretical Fe, Al2O3, unused oxide and total final grams.",
      [
        { id: "iron", label: "Maximum Fe / g", answer: 11.2 },
        { id: "alumina", label: "Al2O3 / g", answer: 10.2 },
        { id: "unused", label: "Unused oxide / g", answer: 16 },
        { id: "total", label: "Total final / g", answer: 37.4 },
      ],
      "Al 0.2 mol gives an equation extent of 0.1 mol: Fe 11.2 g, alumina 10.2 g, unused oxide 16 g; total 37.4 = 5.4 + 32.",
      "Maximum desired product is not the entire final inventory.",
    ),
    n(
      "p-precision",
      "Round only the final percentage",
      "Mg + 2HCl → MgCl2 + H2. Pure Mg 0.750 g; HCl sufficient; dry MgCl2 collected 2.37 g. M values 24 and 95 g/mol. Find yield to three significant figures.",
      79.8,
      "%",
      "Maximum = 0.750/24 ×95 =2.96875 g. Yield =2.37/2.96875 ×100 =79.8315789…%, giving 79.8%. Rounding maximum to 3.0 g first gives the wrong 79.0%.",
      "Keep the full product maximum until final rounding.",
    ),
    n(
      "p-oxygen",
      "Use a three-to-two product ratio",
      "For the supplied complete-conversion equation 2Al2O3 →4Al +3O2, pure oxide 51 g, M(Al2O3)=102 and M(O2)=32 g/mol. Find theoretical O2 grams.",
      24,
      "g",
      "51/102 =0.5 mol oxide; ×3/2=0.75 mol O2; ×32=24 g.",
      "Apply 3/2 to mol amounts; this is the supplied overall theoretical equation.",
    ),
    c(
      "p-zero",
      "Interpret zero collected yield",
      "A positive theoretical product maximum is calculated, but 0 g is collected. What is percentage yield?",
      "0%",
      {
        "Undefined in every case": "The denominator here is positive.",
        "100%, because atoms are conserved":
          "Conservation does not guarantee collection.",
      },
      "0 / positive theoretical amount ×100 =0%; atoms remain elsewhere in the full inventory.",
      "Separate a zero numerator from a zero denominator.",
    ),
    c(
      "p-no-floor",
      "Preserve fractional mol",
      "A calculation predicts 0.25 mol desired product. Should this be rounded down to 0 because a small molecular drawing contains only whole molecules?",
      "No: a fraction of a mol contains many whole molecules",
      {
        "Yes: all macroscopic amounts must be whole mol":
          "Moles are amounts, not individual molecule counts.",
        "Change the product formula to make a whole number":
          "Formula identity does not change.",
      },
      "Do not floor mol amounts. An illustrative small inventory communicates ratios, not the population of a bulk sample.",
      "Recall what one mol counts.",
    ),
    p(
      "p-suspect",
      "Check a derived suspect maximum",
      "Fe2O3 +3CO →2Fe +3CO2. Pure oxide 16 g; CO sufficient. M oxide 160, Fe 56 g/mol. Wet collected sample 14.56 g; supplied dry Fe 10.08 g. Enter theoretical Fe grams, apparent wet percent and dry-product yield.",
      [
        { id: "theoretical", label: "Maximum Fe / g", answer: 11.2 },
        { id: "apparent", label: "Apparent wet / %", answer: 130 },
        { id: "dry", label: "Dry yield / %", answer: 90 },
      ],
      "Maximum 16/160 ×2 ×56=11.2 g. Wet 14.56/11.2 ×100=130% apparent; dry 10.08/11.2 ×100=90%. Extra wet mass is not extra desired dry iron.",
      "Use the constructed maximum and comparable sample basis.",
    ),
    w(
      "p-explain-maximum",
      "Explain an ideal maximum",
      "N2 +3H2 →2NH3 with 14 g N2 and 4 g H2 has theoretical 17 g NH3. Explain the limiting supply, unused material and why actual collected ammonia may be lower.",
      "Nitrogen 0.5 mol can form 1 mol NH3. It needs 1.5 mol H2, or 3 g, so hydrogen is sufficient and 1 g remains in the theoretical inventory. Maximum NH3 is 17 g, assuming complete nitrogen conversion. Real reversible conversion or recovery can give less collected product; the theoretical maximum does not guarantee 100% collection.",
      [
        "Show the nitrogen-to-ammonia mol ratio.",
        "Account for required 3 g and unused 1 g H2.",
        "Separate ideal conversion from observed yield.",
      ],
    ),
    w(
      "p-explain-requirement",
      "Explain an inverse requirement",
      "A target collected product mass is known along with a positive recorded yield below 100%. Explain why converting the actual product straight to reactant mol underestimates the starting requirement.",
      "Actual product is only a fraction of the theoretical product maximum. Divide actual mass by the yield factor first, then convert theoretical product mass to mol and apply the inverse equation ratio. Convert required reactant mol to starting grams. This assumes other reactants are sufficient and the same yield applies; actual yield alone does not prove how much reactant was consumed.",
      [
        "Recover the theoretical 100% product amount.",
        "Reverse the product/reactant mol ratio with the correct molar masses.",
        "State the applicable-yield and sufficient-supply assumptions.",
      ],
    ),
  ],
  checkForms: [
    [
      p(
        "ca-maximum",
        "Independent constructed maximum",
        "Mg +2HCl →MgCl2 +H2. Pure Mg 3 g; HCl sufficient. M(Mg)=24 and M(MgCl2)=95 g/mol. Enter theoretical salt mol and dry-salt grams.",
        [
          { id: "amount", label: "MgCl2 / mol", answer: 0.125 },
          { id: "mass", label: "Maximum MgCl2 / g", answer: 11.875 },
        ],
        "3/24 =0.125 mol Mg; salt 1:1=0.125 mol; ×95=11.875 g.",
        "Construct the maximum from the active metal.",
      ),
      n(
        "ca-percentage",
        "Independent different denominator",
        "CaCO3 →CaO +CO2. Pure carbonate 30 g, dry CaO collected 12.936 g. M values 100 and 56 g/mol. Find percentage yield.",
        77,
        "%",
        "Maximum 30/100 ×56=16.8 g; 12.936/16.8 ×100=77%.",
        "Use theoretical oxide, not starting carbonate.",
      ),
      n(
        "ca-collected",
        "Independent two-step forward transfer",
        "2H2 +O2 →2H2O. O2 40 g; H2 sufficient; recorded water yield 84%. M values 32 and 18 g/mol. Find collected water grams.",
        37.8,
        "g",
        "Maximum 40/32 ×2 ×18=45 g; ×0.84=37.8 g collected.",
        "Build the maximum before using the yield factor.",
      ),
      n(
        "ca-required",
        "Independent inverse reactant",
        "CuO +H2 →Cu +H2O. Target collected Cu 3.81 g at 60% yield; H2 sufficient. M(CuO)=79.5 and M(Cu)=63.5 g/mol. Find required starting CuO grams.",
        7.95,
        "g",
        "Maximum Cu 3.81/0.6=6.35 g; /63.5=0.1 mol Cu; 1:1 CuO 0.1 mol; ×79.5=7.95 g.",
        "Reverse yield before equation stoichiometry.",
      ),
      w(
        "ca-proof",
        "Independent limiting explanation",
        "2Al +Fe2O3 →2Fe +Al2O3. Supplies 27 g Al and 160 g oxide; M values 27/160/56 g/mol. Explain the theoretical Fe maximum and why conservation does not guarantee that all of it is collected.",
        "Al 1 mol can form 1 mol Fe; oxide 1 mol can form 2 mol Fe, so aluminium limits. Theoretical Fe is 1 mol ×56=56 g under complete limiting conversion. Unused oxide and other product retain atoms. Actual collected yield can be below this theoretical maximum without violating conservation.",
        [
          "Compare possible Fe from both supplies.",
          "Calculate 56 g from limiting Al.",
          "Locate other material and distinguish collection from conservation.",
        ],
      ),
    ],
    [
      p(
        "cb-maximum",
        "Independent new salt maximum",
        "Zn +2HCl →ZnCl2 +H2. Pure Zn 6.5 g; HCl sufficient. M(Zn)=65 and M(ZnCl2)=136 g/mol. Enter theoretical salt mol and dry-salt grams.",
        [
          { id: "amount", label: "ZnCl2 / mol", answer: 0.1 },
          { id: "mass", label: "Maximum ZnCl2 / g", answer: 13.6 },
        ],
        "6.5/65=0.1 mol Zn; 1:1 gives 0.1 mol salt or 13.6 g.",
        "Use the new product molar mass.",
      ),
      n(
        "cb-percentage",
        "Independent coefficient-weighted yield",
        "Fe2O3 +3CO →2Fe +3CO2. Pure oxide 10 g; CO sufficient; dry iron collected 5.6 g. M values 160 and 56 g/mol. Find percentage yield.",
        80,
        "%",
        "Maximum 10/160 ×2 ×56=7 g; 5.6/7 ×100=80%.",
        "Remember the coefficient two for iron.",
      ),
      n(
        "cb-collected",
        "Independent different forward sample",
        "Mg +2HCl →MgCl2 +H2. Pure Mg 2.4 g; HCl sufficient; dry salt yield 86%. M values 24 and 95 g/mol. Find collected dry-salt grams.",
        8.17,
        "g",
        "Maximum 2.4/24 ×95=9.5 g; ×0.86=8.17 g.",
        "Yield multiplies theoretical dry salt.",
      ),
      n(
        "cb-required",
        "Independent inverse ratio two",
        "2C2H6 +7O2 →4CO2 +6H2O. Target collected CO2 35.2 g at 80% yield; O2 sufficient. M(C2H6)=30 and M(CO2)=44 g/mol. Find required starting ethane grams.",
        15,
        "g",
        "Maximum CO2=35.2/0.8=44 g=1 mol. Ethane needed 1 ×2/4=0.5 mol; ×30=15 g.",
        "Use the inverse 2/4 ratio.",
      ),
      w(
        "cb-proof",
        "Independent comparable-product explanation",
        "Fe2O3 +3CO →2Fe +3CO2. Pure oxide 16 g; CO sufficient; M values 160 and 56 g/mol. The sample reported as dry iron weighs 13 g. Explain why its yield should be investigated rather than capped or interpreted as atoms created.",
        "Maximum Fe=16/160 ×2 ×56=11.2 g. The apparent 13/11.2 ×100≈116.1% exceeds the theoretical pure-product maximum. Check purity, dryness, measurement and the stated reaction/active amount assumptions. No atoms were created, and silently changing the percentage to 100 would hide the problem.",
        [
          "Construct 11.2 g Fe maximum.",
          "Identify the apparent value above 100%.",
          "Explain appropriate checks without claiming extra atoms or capping.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-maximum",
        "Retrieve a changed maximum",
        "N2 +3H2 →2NH3. Pure N2 7 g; H2 sufficient. M values 28 and 17 g/mol. Find theoretical ammonia grams.",
        8.5,
        "g",
        "7/28 ×2 ×17=8.5 g.",
        "Mass → mol → ratio → mass.",
      ),
      n(
        "ra-percentage",
        "Retrieve a constructed denominator",
        "CaCO3 →CaO +CO2. Pure carbonate 10 g; dry CaO collected 4.48 g. M values 100 and 56 g/mol. Find percentage yield.",
        80,
        "%",
        "Maximum 5.6 g; 4.48/5.6 ×100=80%.",
        "Construct theoretical product first.",
      ),
      n(
        "ra-collected",
        "Retrieve forward collection",
        "Mg +2HCl →MgCl2 +H2. Pure Mg 1.2 g; HCl sufficient; dry salt yield 80%. M values 24 and 95 g/mol. Find collected salt grams.",
        3.8,
        "g",
        "Maximum 1.2/24 ×95=4.75 g; ×0.8=3.8 g.",
        "Multiply the product maximum by the factor.",
      ),
    ],
    [
      n(
        "rb-maximum",
        "Retrieve coefficient transfer",
        "2Al2O3 →4Al +3O2. Pure oxide 68 g; complete ideal conversion. M values 102 and 32 g/mol. Find theoretical O2 grams.",
        32,
        "g",
        "68/102 ×3/2 ×32=32 g.",
        "Use 3/2 for product/reactant mol.",
      ),
      n(
        "rb-percentage",
        "Retrieve a new product comparison",
        "Fe2O3 +3CO →2Fe +3CO2. Pure oxide 4 g; CO sufficient; dry Fe collected 2.52 g. M values 160 and 56 g/mol. Find yield.",
        90,
        "%",
        "Maximum 4/160 ×2 ×56=2.8 g; 2.52/2.8 ×100=90%.",
        "Use the maximum iron denominator.",
      ),
      n(
        "rb-required",
        "Retrieve inverse requirement",
        "CaCO3 →CaO +CO2. Target collected CaO 22.4 g at 80% yield. M values 100 and 56 g/mol. Find required pure carbonate grams.",
        50,
        "g",
        "Maximum 22.4/0.8=28 g CaO=0.5 mol; carbonate 0.5 mol ×100=50 g.",
        "Undo yield and reverse the 1:1 ratio.",
      ),
    ],
  ],
};
theoreticalYieldJourney.guided[0].openingHint = true;
theoreticalYieldJourney.practice.find(
  (q) => q.id === "ty-v1-p-precision",
)!.rounding = { kind: "significant-figures", digits: 3 };
theoreticalYieldJourney.practice.find(
  (q) => q.id === "ty-v1-p-wrong-denominator",
)!.followUp = "ty-v1-r-denominator";
theoreticalYieldJourney.practice.find(
  (q) => q.id === "ty-v1-p-inverse-ratio",
)!.followUp = "ty-v1-r-ratio";
