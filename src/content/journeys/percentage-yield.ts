import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
import { addYieldReversibleWriting } from "./yield-reversible-writing";
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
    `py-v1-${id}`,
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
    `py-v1-${id}`,
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
    "Link the supplied evidence to the product actually obtained.",
  ),
  options: undefined,
  rubric,
});
export const percentageYieldJourney: LessonJourney = {
  version: 1,
  introduction:
    "Choose the theoretical product denominator, compare matching units and distinguish formation from collection.",
  scopeNote:
    "Separate Chemistry: AQA 4.3.3.1 and Pearson 5.11C/5.12C. The theoretical product amount is supplied in this Foundation lesson; deriving it from reactant quantities and an equation belongs to a separate Higher lesson. Actual and theoretical quantities refer to the same desired product, on the stated pure/dry basis. Collection models interpret supplied inventories and do not provide experiment procedures. An apparent percentage above 100 is a warning about assumptions, sample comparability or measurement, not proof that more atoms were created. Atom economy is taught separately.",
  outcomes: [
    "Select actual product over theoretical product, rather than reactant mass or shortfall.",
    "Match g/kg units and calculate yield, actual mass or the theoretical amount from a supplied percentage.",
    "Distinguish incomplete/side reactions from loss during collection without destroying matter.",
    "Interpret suspect wet/impure product records and separate yield from atom economy.",
  ],
  warmup: [
    n(
      "w-fraction",
      "Recall a percentage fraction",
      "What percentage is 3 out of 4?",
      75,
      "%",
      "3/4×100=75%.",
      "Make the fraction into hundredths.",
    ),
    n(
      "w-unit",
      "Recall kilogram conversion",
      "Convert 1.5 kg to grams.",
      1500,
      "g",
      "1.5×1000=1500 g.",
      "Use the same units for both product masses.",
    ),
  ],
  refresher: [
    c(
      "r-denominator",
      "Choose the denominator",
      "Which quantity is the denominator in percentage yield?",
      "The maximum theoretical amount of the same product",
      {
        "The mass of starting reactant":
          "Reactant and product masses can differ.",
        "The amount of product not collected":
          "That is a shortfall, not the 100% reference.",
      },
      "Actual/theoretical×100; both quantities describe the same product.",
      "Ask what represents 100% possible product.",
    ),
    c(
      "r-definition",
      "Separate actual and theoretical",
      "A supplied calculation predicts 20 g product but only 15 g dry product is obtained. Which is the actual yield?",
      "15 g",
      {
        "20 g": "That is the theoretical maximum in this record.",
        "5 g": "That is the difference, not actual product.",
      },
      "Actual means the measured product obtained; theoretical is the calculated maximum.",
      "Distinguish obtained from possible.",
    ),
    c(
      "r-units",
      "Choose comparable units",
      "Actual product is 600 g and theoretical product is 0.8 kg. What must happen before division?",
      "Convert both to the same mass unit",
      {
        "Use 600/0.8 without conversion":
          "That compares different unit scales.",
        "Convert only the percentage": "The mismatch is in the masses.",
      },
      "Use 600/800 or .6/.8; both give the same fraction.",
      "Either common unit is valid.",
    ),
    c(
      "r-loss",
      "Preserve atoms during collection loss",
      "Some formed product remains in a filter and is not collected. What happens to its atoms?",
      "They remain in the uncollected product",
      {
        "They are destroyed": "Collection loss does not destroy atoms.",
        "They become additional reactant atoms automatically":
          "The supplied scenario says formed product remains.",
      },
      "A collected sample can have less product while total material is still conserved.",
      "Distinguish outside the sample from outside existence.",
    ),
    c(
      "r-bound",
      "Check a suspicious measurement",
      "A recorded pure dry product mass is greater than the stated theoretical maximum. What should be checked?",
      "Purity, dryness, measurement and calculation assumptions",
      {
        "Round the percentage down to 100 silently":
          "That hides the inconsistent record.",
        "Conclude atoms were created":
          "The comparison assumptions or measurements require checking.",
      },
      "Calculate the apparent percentage honestly, then investigate the discrepancy.",
      "Do not change inconvenient data without justification.",
    ),
  ],
  guided: [
    n(
      "g-fraction",
      "Choose the product fraction",
      "15 g product is obtained; the theoretical maximum is 20 g. Find percentage yield.",
      75,
      "%",
      "15/20×100=75%, not the 25% shortfall.",
      "Use obtained product divided by possible product.",
      {
        kind: "percentage-yield",
        mode: "fraction",
        instruction: "Predict matching product masses and percentage yield.",
      },
    ),
    n(
      "g-actual",
      "Find product from a supplied yield",
      "The theoretical product mass is 20 g and yield 75%. Predict the actual product mass.",
      15,
      "g",
      "20×.75=15 g.",
      "Convert 75% to .75.",
      {
        kind: "percentage-yield",
        mode: "actual",
        instruction: "Predict the yield factor and actual mass.",
      },
    ),
    n(
      "g-reverse",
      "Recover the 100% reference",
      "18 g actual product represents 60% yield. Predict the theoretical product mass.",
      30,
      "g",
      "18/.6=30 g; multiplying 18 by .6 would reduce the actual amount again.",
      "Divide by the supplied yield factor.",
      {
        kind: "percentage-yield",
        mode: "reverse",
        instruction: "Predict the factor and theoretical 100% mass.",
      },
    ),
    n(
      "g-collection",
      "Explain product collection loss",
      "All 20 g theoretical product forms, but 16 g is collected and 4 g stays in apparatus. Find collected percentage yield.",
      80,
      "%",
      "16/20×100=80%; the missing collected 4 g still exists in apparatus.",
      "Count collected product, not total formed material.",
      {
        kind: "percentage-yield",
        mode: "collection",
        instruction:
          "Change recovery; predict collected mass, retained mass and yield.",
      },
    ),
  ],
  practice: [
    p(
      "p-select",
      "Select a product denominator",
      "A supplied report uses 12 g reactant. The theoretical desired product mass is 18 g and the actual dry product mass 13.5 g. Enter numerator and denominator in grams.",
      [
        { id: "actual", label: "Actual product / g", answer: 13.5 },
        { id: "theoretical", label: "Theoretical product / g", answer: 18 },
      ],
      "Use 13.5/18, not 13.5/12.",
      "Both entries must describe the product.",
    ),
    n(
      "p-yield",
      "Calculate a different yield",
      "Actual desired product 13.5 g; theoretical 18 g. Find percentage yield.",
      75,
      "%",
      "13.5/18×100=75%.",
      "Multiply the product fraction by 100.",
    ),
    c(
      "p-shortfall",
      "Distinguish yield and shortfall",
      "Actual 15 g and theoretical 20 g product give 5 g shortfall. Which quantity is 75%?",
      "The collected product yield",
      {
        "The percentage shortfall": "Shortfall5/20=25%.",
        "The mass of reactant used": "Reactant mass is not supplied or needed.",
      },
      "Yield 15/20=75%; shortfall 5/20=25%.",
      "Name the numerator in each comparison.",
    ),
    p(
      "p-mixed",
      "Match units before calculation",
      "Actual product 1.05 kg; theoretical 1500 g. Enter actual mass in grams and percentage yield.",
      [
        { id: "actual", label: "Actual product / g", answer: 1050 },
        { id: "percentage", label: "Yield / %", answer: 70 },
      ],
      "1.05kg=1050g; 1050/1500×100=70%.",
      "Convert the actual mass to the denominator’s unit.",
    ),
    n(
      "p-sigfig",
      "Respect significant figures",
      "Actual dry product13.7 g; theoretical18.4 g. Find percentage yield to3 significant figures.",
      74.5,
      "%",
      "13.7/18.4×100=74.4565…; round the final percentage to74.5% (3 significant figures).",
      "Keep full precision until the final answer.",
    ),
    n(
      "p-zero",
      "Interpret no collection",
      "Theoretical desired product 8 g; actual product collected 0 g. Find percentage yield.",
      0,
      "%",
      "0/8×100=0%.",
      "Zero actual can be divided by a positive maximum.",
    ),
    c(
      "p-undefined",
      "Reject a zero denominator",
      "Both supplied product amounts are 0 g. Can a percentage yield be determined from actual/theoretical?",
      "No; the ratio has a zero denominator",
      {
        "Yes; it must be 0%": "0/0 is undefined.",
        "Yes; it must be 100%":
          "Equal zero quantities do not define this ratio.",
      },
      "A positive theoretical reference is needed to calculate percentage yield.",
      "Check the denominator before dividing.",
    ),
    n(
      "p-complete",
      "Interpret full collection",
      "Actual pure dry product 24 g and theoretical 24 g. Find percentage yield.",
      100,
      "%",
      "24/24×100=100%.",
      "Equal positive quantities represent the whole.",
    ),
    p(
      "p-actual",
      "Construct a forward calculation",
      "Theoretical product 40 g, yield 65%. Enter the decimal yield factor and actual product mass.",
      [
        { id: "factor", label: "Yield factor", answer: 0.65 },
        { id: "actual", label: "Actual product / g", answer: 26 },
      ],
      "65/100=.65; 40×.65=26g.",
      "Use a fraction of the theoretical amount.",
    ),
    n(
      "p-actual-kg",
      "Return requested grams",
      "Theoretical product 2 kg, yield 85%. Find actual product mass in grams.",
      1700,
      "g",
      "2000×.85=1700g.",
      "Match the requested final unit.",
    ),
    p(
      "p-reverse",
      "Construct the theoretical reference",
      "Actual 21 g product at 70% yield. Enter decimal factor and theoretical product mass.",
      [
        { id: "factor", label: "Yield factor", answer: 0.7 },
        { id: "theoretical", label: "Theoretical product / g", answer: 30 },
      ],
      "21/.7=30g.",
      "The actual mass is 70% of the unknown 100% amount.",
    ),
    n(
      "p-reverse-kg",
      "Reverse with matching kg",
      "Actual 1.44 kg product at 80% yield. Find theoretical product mass in kg.",
      1.8,
      "kg",
      "1.44/.8=1.8kg.",
      "Divide by .8, not 1.8 or 80.",
    ),
    c(
      "p-wrong-base",
      "Reject adding the missing percentage",
      "Actual 18 g product represents 60% yield. Why does adding 40% of 18 g fail to find the theoretical mass?",
      "The 40% shortfall is based on theoretical mass, not actual mass",
      {
        "The percentage shortfall has no meaning":
          "It does have a reference, the theoretical mass.",
        "Theoretical mass is always smaller":
          "At 60% yield the theoretical mass is larger.",
      },
      "18 g is 60% of 30 g; 40% of 30 g is 12 g. Adding 40% of 18 g uses the wrong base.",
      "Identify what 100% refers to.",
    ),
    p(
      "p-collection",
      "Account for product outside sample",
      "All 30 g possible product forms .24 g is collected; 6 g remains in apparatus. Enter percentage collected yield and total formed product mass.",
      [
        { id: "percentage", label: "Collected yield / %", answer: 80 },
        { id: "total", label: "Total formed product / g", answer: 30 },
      ],
      "24/30=80%; 24+6=30 g formed product remains.",
      "Collection and total formation are different boundaries.",
    ),
    c(
      "p-incomplete",
      "Use evidence of incomplete reaction",
      "A supplied record states that unreacted necessary reactant remains because the reaction has not completed. Why is actual product below the theoretical complete-conversion amount?",
      "Some starting material has not converted to product",
      {
        "All missing product must be trapped in a filter":
          "No collection loss is specified.",
        "Atoms have been destroyed":
          "Reactant atoms remain in unconverted material.",
      },
      "The supplied evidence supports incomplete conversion; do not invent a different cause.",
      "Use the cause stated in the record.",
    ),
    c(
      "p-side",
      "Use evidence of a competing reaction",
      "Analysis finds a second product from an unwanted side reaction. Why can this lower the desired-product yield?",
      "Some starting material forms other products",
      {
        "Other products contain new atoms created from nothing":
          "They contain atoms from the reactants.",
        "Every side reaction increases desired product mass":
          "It can divert material away from the desired route.",
      },
      "Competition changes which products form, not conservation of atoms.",
      "Track where starting material goes.",
    ),
    p(
      "p-wet",
      "Interpret wet versus dry sample",
      "A theoretical pure dry product mass is 20 g. The collected wet sample weighs 22 g, and its supplied dry mass is 18 g. Enter apparent wet percentage and dry-product percentage.",
      [
        { id: "apparent", label: "Apparent wet value / %", answer: 110 },
        { id: "dry", label: "Dry-product yield / %", answer: 90 },
      ],
      "22/20=110% apparent; 18/20=90% comparable dry yield. Extra wet mass is not additional pure dry product.",
      "Compare the same product on the same basis.",
    ),
    c(
      "p-atom-economy",
      "Keep different efficiency measures separate",
      "A reaction has one stated desired product but only 70% of its theoretical product mass is obtained. Must its atom economy also be 70%?",
      "No; atom economy is an equation-based measure",
      {
        "Yes; both names mean the same calculation":
          "Yield compares actual recovery with theoretical amount.",
        "No; yield only counts catalysts":
          "Yield compares desired product quantities.",
      },
      "A reaction can have high atom economy and lower actual yield. Atom-economy calculations are the next lesson.",
      "Separate experimental recovery from equation-based allocation.",
    ),
    n(
      "p-rounding",
      "Round only the final percentage",
      "Actual product 7 g; theoretical 12 g. Find percentage yield to 1 decimal place.",
      58.3,
      "%",
      "7/12×100=58.333…; round the final to 58.3%.",
      "Do not round the fraction before multiplying.",
    ),
    w(
      "p-explain-loss",
      "Explain a loss without destroying atoms",
      "All 25 g theoretical product forms .20 g is collected and 5 g remains in transfer apparatus. Explain the 80% collected yield and what happened to the missing collected mass.",
      "Collected yield 20/25×100=80%. The 5 g remaining in apparatus still consists of product; it was not recovered in the measured sample. No atoms were destroyed, and incomplete reaction is not the specified cause.",
      [
        "Use actual collected mass over theoretical product mass.",
        "Locate the 5 g outside the sample but within the apparatus inventory.",
        "Distinguish collection loss from incomplete formation and atom destruction.",
      ],
    ),
    w(
      "p-explain-suspect",
      "Explain a suspect measurement",
      "A student reports 110% yield from 22 g wet sample and 20 g theoretical pure dry product. The dry sample is 18 g. Explain the comparison problem and the appropriate dry yield.",
      "22/20×100=110% is an apparent value from noncomparable wet and dry masses. Retained water adds measured mass but is not extra desired pure product. The dry-product yield is 18/20×100=90%. Measurements, purity and theoretical assumptions should be checked rather than capping a percentage silently.",
      [
        "Identify the wet/dry basis mismatch.",
        "Explain that water is not additional desired dry product.",
        "Calculate 90% from 18 g/20 g and avoid silently changing 110%.",
      ],
    ),
  ],
  checkForms: [
    [
      p(
        "ca-units",
        "Independent denominator and units",
        "A report starts with 10 g reactant. Theoretical product .025 kg; actual product 17 g. Enter theoretical mass in grams and percentage yield.",
        [
          { id: "theoretical", label: "Theoretical product / g", answer: 25 },
          { id: "percentage", label: "Yield / %", answer: 68 },
        ],
        "25 g reference; 17/25×100=68%.",
        "Use the product maximum, with matching units.",
      ),
      n(
        "ca-actual",
        "Independent forward amount",
        "Theoretical product 45 g, yield 72%. Find actual product mass.",
        32.4,
        "g",
        "45×.72=32.4g.",
        "Convert percentage to a factor.",
      ),
      n(
        "ca-reverse",
        "Independent 100% amount",
        "Actual product 27 g represents 60% yield. Find theoretical product mass.",
        45,
        "g",
        "27/.6=45g.",
        "Divide actual by yield factor.",
      ),
      p(
        "ca-recovery",
        "Independent recovery inventory",
        "All 36 g theoretical product forms; 31.5 g is collected and 4.5 g remains in apparatus. Enter collected percentage and total formed product g.",
        [
          { id: "percentage", label: "Collected yield / %", answer: 87.5 },
          { id: "total", label: "Total formed product / g", answer: 36 },
        ],
        "31.5/36×100=87.5%; total 36 g remains.",
        "Keep both boundaries.",
      ),
      w(
        "ca-proof",
        "Independent comparable-product explanation",
        "Theoretical pure dry product 25 g; wet sample 27.5 g; supplied dry mass 22.5 g. Explain apparent and comparable percentages.",
        "Wet comparison 27.5/25×100=110% is apparent because water contributes to sample mass. Comparable dry yield 22.5/25×100=90%. The extra wet mass does not show more desired dry product or new atoms.",
        [
          "Compute apparent 110% and dry 90%.",
          "Explain the wet/dry mismatch.",
          "Do not silently cap or claim atoms created.",
        ],
      ),
    ],
    [
      p(
        "cb-units",
        "Independent changed denominator",
        "A report starts with 16 g reactant. Theoretical product .04 kg; actual product 26 g. Enter theoretical grams and yield%.",
        [
          { id: "theoretical", label: "Theoretical product / g", answer: 40 },
          { id: "percentage", label: "Yield / %", answer: 65 },
        ],
        "40 g reference; 26/40×100=65%.",
        "Convert the theoretical product amount.",
      ),
      n(
        "cb-actual",
        "Independent forward kg transfer",
        "Theoretical product .75 kg, yield 84%. Find actual product grams.",
        630,
        "g",
        "750×.84=630g.",
        "Use requested grams.",
      ),
      n(
        "cb-reverse",
        "Independent reverse transfer",
        "Actual product 33 g represents 75% yield. Find theoretical product grams.",
        44,
        "g",
        "33/.75=44g.",
        "Divide by .75.",
      ),
      p(
        "cb-recovery",
        "Independent different recovery",
        "All 50 g theoretical product forms; 41 g collected and 9 g remains in apparatus. Enter collected yield% and total formed grams.",
        [
          { id: "percentage", label: "Collected yield / %", answer: 82 },
          { id: "total", label: "Total formed product / g", answer: 50 },
        ],
        "41/50×100=82%; total 50 g remains.",
        "Collected fraction and full inventory differ.",
      ),
      w(
        "cb-proof",
        "Independent competing-reaction explanation",
        "A supplied analysis says some reactants form an unwanted side product and desired-product actual yield is below theoretical. Explain why this does not violate conservation of atoms.",
        "Some reactant atoms enter the unwanted side product rather than the desired product. The desired-product yield is lower, while total atoms remain distributed among all products and any unused reactants. No atoms are destroyed.",
        [
          "Link lower desired yield to the supplied competing reaction.",
          "Locate atoms in other products or unused reactants.",
          "Do not invent collection loss as the established cause.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-yield",
        "Retrieve yield fraction",
        "Actual product 14 g; theoretical product 20 g. Find percentage yield.",
        70,
        "%",
        "14/20×100=70%.",
        "Use actual/theoretical.",
      ),
      n(
        "ra-actual",
        "Retrieve actual mass",
        "Theoretical product 60 g, yield 55%. Find actual grams.",
        33,
        "g",
        "60×.55=33g.",
        "Convert yield to a factor.",
      ),
      n(
        "ra-reverse",
        "Retrieve theoretical reference",
        "Actual product 24 g represents 80% yield. Find theoretical grams.",
        30,
        "g",
        "24/.8=30g.",
        "Divide by the yield factor.",
      ),
    ],
    [
      n(
        "rb-yield",
        "Retrieve changed fraction",
        "Actual product 18.2 g; theoretical 26 g. Find percentage yield.",
        70,
        "%",
        "18.2/26×100=70%.",
        "Keep the theoretical denominator.",
      ),
      n(
        "rb-actual",
        "Retrieve kg conversion",
        "Theoretical product 1.25 kg, yield 64%. Find actual grams.",
        800,
        "g",
        "1250×.64=800g.",
        "Match requested units.",
      ),
      n(
        "rb-reverse",
        "Retrieve different 100% amount",
        "Actual product 28 g represents 70% yield. Find theoretical grams.",
        40,
        "g",
        "28/.7=40g.",
        "Divide by .7.",
      ),
    ],
  ],
};
percentageYieldJourney.guided[0].openingHint = true;
percentageYieldJourney.practice.find(
  (q) => q.id === "py-v1-p-rounding",
)!.rounding = { kind: "decimal-places", digits: 1 };
percentageYieldJourney.practice.find(
  (q) => q.id === "py-v1-p-shortfall",
)!.followUp = "py-v1-r-denominator";
percentageYieldJourney.practice.find((q) => q.id === "py-v1-p-wet")!.followUp =
  "py-v1-r-bound";

percentageYieldJourney.practice.find(
  (q) => q.id === "py-v1-p-sigfig",
)!.rounding = { kind: "significant-figures", digits: 3 };
addYieldReversibleWriting(percentageYieldJourney);
