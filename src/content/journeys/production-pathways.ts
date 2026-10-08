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
    `pp-v1-${id}`,
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
    `pp-v1-${id}`,
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
      Object.fromEntries(parts.map((v) => [v.id, String(v.answer)])),
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
    "State the purpose, use comparable data and link your reasons to that purpose.",
  ),
  options: undefined,
  rubric,
});
export const productionPathwaysJourney: LessonJourney = {
  version: 1,
  introduction:
    "Choose a production route by comparing the quantities that matter for a stated purpose.",
  scopeNote:
    "Higher separate Chemistry: AQA 4.3.3.2. Compare appropriate supplied atom economy, actual yield, production rate, equilibrium position and useful by-products. This lesson uses original process records, not real factory instructions. Atom economy uses a specified desired product and the balanced equation; a saleable other product does not redefine that desired product. Yield refers to actual/theoretical amounts of the same product. Production rates use supplied complete batch times; assume repeat batches without extra downtime where stated. Equilibrium percentages and process output rates are distinct. Detailed collision theory, equilibrium shifts and the Haber process are taught separately; use the given evidence here. A catalyst does not shift equilibrium. Financial examples include only their explicitly named costs and credits. No universal cheapest or sustainable route can be certified from partial information. Written route justifications are self-reviewed, never machine evidence.",
  outcomes: [
    "Compare collected product on a matching input or theoretical-product basis.",
    "Calculate comparable output per time and included net cost per product amount.",
    "Evaluate saleable by-products, limited demand and remaining disposal.",
    "Distinguish rate, equilibrium yield and catalyst effects using supplied data.",
    "Apply constraints before a stated objective and justify choices with linked evidence.",
  ],
  warmup: [
    n(
      "w-yield",
      "Recall collected fraction",
      "A maximum of 50 kg desired product has 80% collected yield. How many kilograms are collected?",
      40,
      "kg",
      "50 × 0.8 = 40 kg of the same product.",
      "Multiply the maximum by the collected fraction.",
    ),
    n(
      "w-rate",
      "Recall a comparable rate",
      "A complete batch supplies 36 kg dry product in 3 hours. Find output in kg/h.",
      12,
      "kg/h",
      "36 ÷ 3 = 12 kg/h.",
      "Divide collected product by complete batch time.",
    ),
  ],
  refresher: [
    c(
      "r-economy",
      "Separate equation economy from collection",
      "Route A has 90% atom economy. Does this alone establish that 90% of its theoretical product is collected?",
      "No: actual yield is a separate actual/theoretical product fraction",
      {
        "Yes: every percentage measures the same thing":
          "The denominators and meanings differ.",
        "Yes: conservation guarantees full recovery":
          "Material can remain uncollected or the reaction incomplete.",
      },
      "Equation allocation and collected yield answer different questions.",
      "Name the numerator and denominator of each percentage.",
    ),
    n(
      "r-fraction",
      "Apply a supplied yield",
      "Theoretical product 80 kg; collected yield 50%. Find collected kilograms.",
      40,
      "kg",
      "80 × 0.50 = 40 kg.",
      "Apply yield to the theoretical desired product.",
    ),
    n(
      "r-rate",
      "Normalize to one hour",
      "A batch supplies 90 kg in 3 hours, including separation. Find collected kg/h.",
      30,
      "kg/h",
      "90/3 = 30 kg/h, including the stated full batch time.",
      "Use a common time unit.",
    ),
    n(
      "r-cost",
      "Count sale and disposal once",
      "Base costs £100; 12 kg co-product, 5 kg sold at £4/kg and the remainder disposed at £2/kg. Find included net cost.",
      94,
      "£",
      "Unsold 7 kg costs £14; sales credit £20. Net 100 + 14 − 20 = £94.",
      "Do not dispose of kilograms already sold.",
    ),
    c(
      "r-catalyst",
      "Separate faster approach from equilibrium",
      "At fixed temperature and pressure, what does a catalyst change?",
      "The rate of reaching equilibrium, not its position",
      {
        "It moves equilibrium towards the desired product":
          "Both directions are accelerated; the equilibrium position is unchanged.",
        "It changes the balanced equation and atom economy":
          "The catalyst changes the reaction pathway, not the overall stoichiometry.",
      },
      "A catalyst can improve production timing without changing the fixed-condition equilibrium composition.",
      "Keep rate and equilibrium distinct.",
    ),
  ],
  guided: [
    p(
      "g-output",
      "Compare actual output",
      "A: maximum 80 kg, yield 50%. B: maximum 60 kg, yield 90%. Equal 100 kg reactant feeds. Predict collected product.",
      [
        { id: "a", label: "A collected / kg", answer: 40 },
        { id: "b", label: "B collected / kg", answer: 54 },
      ],
      "A gives 40 kg; B gives 54 kg. B supplies more collected product here, despite lower atom economy.",
      "Calculate each actual product before selecting a route.",
      {
        kind: "production-pathways",
        mode: "output",
        instruction:
          "Predict collected product for each supplied route; use equal reactant-feed records and the stated actual/theoretical fractions.",
      },
    ),
    p(
      "g-throughput",
      "Compare output per hour",
      "Complete batch records: A gives 90 kg in 3 h; B gives 64 kg in 1 h. Separation is included; repeated batches have no added downtime. Enter collected output per hour.",
      [
        { id: "a", label: "A output / kg/h", answer: 30 },
        { id: "b", label: "B output / kg/h", answer: 64 },
      ],
      "A 30 kg/h; B 64 kg/h. A larger batch does not necessarily mean greater throughput.",
      "Normalize both complete batch records to one hour.",
      {
        kind: "production-pathways",
        mode: "throughput",
        instruction:
          "Predict kg/h and compare the entire stated batch time, including separation.",
      },
    ),
    p(
      "g-byproducts",
      "Value the other product",
      "Each route makes 100 kg desired product. A: £120 base costs, 10 kg other product all disposed at £2/kg. B: £130 base costs, 25 kg other product all sold at £3/kg. Enter net included costs.",
      [
        { id: "a", label: "A net cost / £", answer: 140 },
        { id: "b", label: "B net cost / £", answer: 55 },
      ],
      "A 120 + 20 = £140. B 130 − 75 = £55. By-product sale can matter without changing desired-product atom economy.",
      "Subtract a genuine sales credit and add only unsold disposal.",
      {
        kind: "production-pathways",
        mode: "byproducts",
        instruction:
          "Change the buyer record, retain unsold by-product and compare net cost for the same desired-product amount.",
      },
    ),
    p(
      "g-conditions",
      "Keep equilibrium and rate distinct",
      "Supplied warmer-process record: equilibrium yield 45%; 45 kg collected in a complete 1-hour batch; energy 20 kWh/kg. The energy limit is 25 kWh/kg. Enter equilibrium percentage and collected kg/h.",
      [
        { id: "equilibrium", label: "Equilibrium yield / %", answer: 45 },
        { id: "rate", label: "Collected output / kg/h", answer: 45 },
      ],
      "Equilibrium 45%; production 45 kg/h. Equal numbers here have different units and meanings; the supplied energy satisfies the limit.",
      "Use the supplied equilibrium evidence separately from mass/time.",
      {
        kind: "production-pathways",
        mode: "conditions",
        instruction:
          "Compare given cooler, warmer, hotter and catalysed records without confusing equilibrium composition with production rate.",
      },
    ),
    c(
      "g-decision",
      "Apply constraints before preference",
      "Require at least 30 kg/h and at most 9 kWh/kg. A: 20 kg/h, 12 kWh/kg, atom economy 90%. B: 40 kg/h, 8 kWh/kg, economy 70%. C: 30 kg/h, 10 kWh/kg, economy 85%. Which route qualifies?",
      "B",
      {
        A: "It fails both the rate and energy constraints despite high economy.",
        C: "It meets rate but exceeds the 9 kWh/kg energy limit.",
      },
      "Only B meets both required limits. Apply eligibility before ranking an objective.",
      "Check both inequalities for every route.",
      {
        kind: "production-pathways",
        mode: "decision",
        instruction:
          "Apply the stated minimum rate and maximum energy, then compare only eligible routes for the selected objective.",
      },
    ),
  ],
  practice: [
    p(
      "p-output",
      "Transfer matching feed comparison",
      "Original equal feed records: A maximum 70 kg with 80% yield; B maximum 90 kg with 60% yield. Enter collected kilograms.",
      [
        { id: "a", label: "A collected / kg", answer: 56 },
        { id: "b", label: "B collected / kg", answer: 54 },
      ],
      "70×0.8=56; 90×0.6=54. A collects more on this equal feed basis.",
      "Compute each actual product independently.",
    ),
    c(
      "p-largest",
      "Repair a highest-percentage rule",
      "For A maximum 70 kg/yield 80% and B maximum 90 kg/yield 60%, which argument correctly compares actual collection?",
      "A collects 56 kg versus B 54 kg on the matching feed basis",
      {
        "B wins because its theoretical product is larger":
          "Actual collection also depends on the stated yield.",
        "A always wins every future comparison because 80% is larger":
          "Different maxima, times, costs or constraints can change the decision.",
      },
      "Use calculated comparable actual quantities and restrict the conclusion to the given records.",
      "A percentage alone is not a product amount.",
    ),
    c(
      "p-mismatch",
      "Reject unequal input comparisons",
      "Route A collects 40 kg from a 100 kg reactant feed. Route B collects 54 kg from a 200 kg reactant feed. What is needed before claiming B uses the feed more efficiently?",
      "Compare collected product on the same input basis",
      {
        "Compare only the 54 kg and 40 kg": "The supplied feed amounts differ.",
        "Average the two input masses":
          "An average does not normalize either process.",
      },
      "A gives 40 kg per 100 kg reactant feed; B gives 27 kg per 100 kg reactant feed. This is a supplied process comparison, not a universal atom-economy formula.",
      "Keep the comparison denominator equal.",
    ),
    n(
      "p-scaled",
      "Normalize a changed feed",
      "A record collects 54 kg desired product from a 200 kg reactant feed. On the same proportional record, how many kg are collected per 100 kg reactant feed?",
      27,
      "kg",
      "54/2 = 27 kg per 100 kg feed.",
      "Halve both input and collected amount.",
    ),
    c(
      "p-waste-inference",
      "Do not invent an actual inventory",
      "A recorded collected yield is 50%, but the cause is unknown. Can the remaining material all be labelled unwanted by-product?",
      "No: it could include retained desired product or unused reactant",
      {
        "Yes: every uncollected kilogram is a new by-product":
          "Collection loss and incomplete conversion are different possibilities.",
        "Yes: the missing atoms were destroyed":
          "All material retains atoms; collection is not total inventory.",
      },
      "Actual/theoretical yield alone does not locate every substance. Additional conversion, separation and inventory evidence is needed.",
      "Separate theoretical allocation from actual process records.",
    ),
    p(
      "p-rates",
      "Transfer full-batch normalization",
      "A supplies 84 kg in 2 h; B supplies 120 kg in 4 h, both including separation. Enter output per hour.",
      [
        { id: "a", label: "A output / kg/h", answer: 42 },
        { id: "b", label: "B output / kg/h", answer: 30 },
      ],
      "A 42 kg/h; B 30 kg/h. The larger B batch takes longer.",
      "Divide each collected mass by its own full batch time.",
    ),
    c(
      "p-reaction-only",
      "Include the bottleneck",
      "A reaction finishes in 15 minutes, but its product needs 45 minutes of separation before the next complete batch starts. What full batch time belongs in this stated throughput calculation?",
      "1 hour",
      {
        "15 minutes": "This excludes the stated separation bottleneck.",
        "45 minutes": "Both successive stages must be included.",
      },
      "15+45=60 minutes=1 hour for the described non-overlapping complete batch.",
      "Follow the supplied process timing; do not assume simultaneous batches.",
    ),
    n(
      "p-minute-rate",
      "Convert minutes before comparison",
      "A complete 45-minute batch gives 27 kg product and repeats without added downtime. Find collected kg/h.",
      36,
      "kg/h",
      "45 min =0.75 h; 27/0.75 =36 kg/h.",
      "Use hours in the denominator.",
    ),
    c(
      "p-equilibrium",
      "Reject faster-means-more equilibrium",
      "At fixed temperature and pressure, a catalyst reduces the time to equilibrium. Which claim follows?",
      "Equilibrium is reached sooner; its composition is unchanged",
      {
        "The equilibrium percentage must rise":
          "A catalyst does not shift equilibrium.",
        "The atom economy must rise":
          "The overall balanced equation is unchanged.",
      },
      "Rate of approach differs from position of equilibrium.",
      "Hold temperature and pressure fixed.",
    ),
    p(
      "p-supply-conditions",
      "Compare supplied condition records",
      "Cool record: equilibrium 65%, collected 30 kg per 3 h. Warm record: equilibrium 45%, collected 42 kg per 1 h. Enter collected kg/h for each.",
      [
        { id: "cool", label: "Cool output / kg/h", answer: 10 },
        { id: "warm", label: "Warm output / kg/h", answer: 42 },
      ],
      "Cool gives 10 kg/h; warm gives 42 kg/h. Higher supplied equilibrium yield did not give greater supplied hourly collection.",
      "Use the provided process evidence, not a temperature slogan.",
    ),
    c(
      "p-energy-limit",
      "Apply a numerical constraint",
      "A route produces 70 kg/h but uses 32 kWh/kg. A second produces 45 kg/h using 20 kWh/kg. The maximum is 25 kWh/kg. Which route meets the energy requirement?",
      "The 45 kg/h route",
      {
        "The 70 kg/h route because it is faster":
          "It exceeds the required energy limit.",
        "Both because their outputs are positive":
          "Eligibility depends on the specified inequality.",
      },
      "20≤25, whereas 32>25. The constraint must be satisfied before a faster output is preferred.",
      "Check the stated maximum first.",
    ),
    p(
      "p-sale",
      "Count genuine credit and unsold material",
      "A process makes 100 kg desired product and 20 kg co-product. Base costs £160. Sell 8 kg co-product at £4/kg; dispose the rest at £2/kg. Enter unsold kg and total net £.",
      [
        { id: "waste", label: "Unsold / kg", answer: 12 },
        { id: "cost", label: "Net included cost / £", answer: 152 },
      ],
      "12 kg unsold costs £24; credit £32; net 160+24−32=£152.",
      "Separate sold and unsold portions.",
    ),
    n(
      "p-unit-cost",
      "Normalize to desired product",
      "Using the previous included net cost of £152 for 100 kg desired product, find £/kg.",
      1.52,
      "£/kg",
      "152/100 =1.52 per kg of specified desired product.",
      "Divide net cost by the actual desired-product amount.",
    ),
    c(
      "p-demand",
      "Do not assume unlimited demand",
      "A route produces 25 kg saleable co-product, but the buyer takes only 10 kg. Which quantity earns the stated sales credit?",
      "10 kg",
      {
        "25 kg": "Producing it does not guarantee a buyer for all of it.",
        "15 kg": "That is the remaining unsold amount.",
      },
      "Only 10 kg is sold; disposal or another evidenced use is needed for the remaining 15 kg.",
      "Use the stated buyer capacity.",
    ),
    c(
      "p-sale-economy",
      "Keep the specified desired product",
      "Another product becomes saleable, but the balanced equation and specified desired product stay fixed. What happens to its atom economy?",
      "It remains unchanged",
      {
        "It automatically becomes 100%":
          "That would redefine the specified desired output.",
        "It equals collected percentage yield":
          "Yield is a different comparison.",
      },
      "Economic usefulness can improve without changing the equation-based economy of the specified desired product.",
      "Keep the numerator definition fixed.",
    ),
    c(
      "p-overall-green",
      "Identify missing environmental evidence",
      "One route has higher atom economy. Is that alone enough to label it the most sustainable overall?",
      "No: energy, hazardous inputs, emissions and recovery also need evidence",
      {
        "Yes: the highest percentage settles every environmental question":
          "Atom economy does not measure every environmental impact.",
        "Yes: a shorter equation means no waste":
          "Equation length is not an impact measure.",
      },
      "Use the relevant provided evidence and name what remains unknown.",
      "Avoid a universal verdict from one metric.",
    ),
    c(
      "p-goal",
      "Respect the requested objective",
      "Among eligible routes, B gives 40 kg/h at 70% economy; C gives 30 kg/h at 85% economy. The stated objective is greatest collected output per hour. Choose a route.",
      "B",
      {
        "C because 85% is larger": "That optimizes a different objective.",
        "Average 40 and 85 to make a score":
          "The values have unlike meanings and units.",
      },
      "B satisfies the chosen hourly-output objective. C can be preferred for a separately stated economy objective.",
      "Rank the relevant quantity only.",
    ),
    c(
      "p-equality",
      "Include a boundary value",
      "A route gives exactly 30 kg/h and uses exactly 10 kWh/kg. Requirements are at least 30 kg/h and at most 10 kWh/kg. Does it qualify?",
      "Yes: equality satisfies both limits",
      {
        "No: it must be strictly faster": "At least includes equality.",
        "No: it must use strictly less energy": "At most includes equality.",
      },
      "30≥30 and 10≤10.",
      "Translate the words into inclusive inequalities.",
    ),
    w(
      "p-justify",
      "Link a constrained decision",
      "A meets 90% atom economy but gives 20 kg/h at 12 kWh/kg. B has 70% economy, gives 40 kg/h at 8 kWh/kg. Minimum 30 kg/h; maximum 9 kWh/kg. Justify choosing B and state the limited scope of the conclusion.",
      "B meets both required limits:40≥30 and 8≤9. A fails both, despite higher atom economy. This justifies B for the stated requirements; it does not prove B is universally cheapest or most sustainable without cost, hazard and other evidence.",
      [
        "State the required minimum and maximum.",
        "Use both numerical comparisons for B and identify A’s failure.",
        "Limit the conclusion to the supplied purpose and evidence.",
      ],
    ),
    w(
      "p-tradeoff",
      "Explain a rate-equilibrium trade-off",
      "Supplied cool process: equilibrium 60%, output 10 kg/h. Warm: equilibrium 45%, output 45 kg/h. Both meet the stated energy limit. Explain why either could be chosen for a different stated purpose.",
      "The cool process has the higher supplied equilibrium fraction, while the warm process supplies more collected product per hour. A priority for equilibrium composition favours cool; the stated hourly-output priority favours warm. Rate and equilibrium differ, and costs/recovery evidence would be needed for an overall industrial recommendation.",
      [
        "Compare the equilibrium percentages with units.",
        "Compare the output rates with units.",
        "Link a possible choice to a stated purpose and acknowledge missing evidence.",
      ],
    ),
    w(
      "p-byproduct-argument",
      "Explain usefulness without changing chemistry",
      "B makes more co-product than A, but a buyer pays for all of B’s co-product. Explain how this can alter route choice without altering atom economy for the specified desired product.",
      "Sales credit can reduce B’s included net cost and reduce disposal of sold material. The benefit depends on actual demand and required purification. The balanced equation and specified desired product have not changed, so their atom economy remains fixed. No overall environmental conclusion follows from income alone.",
      [
        "Link sale to a genuine net-cost or disposal benefit.",
        "State demand/purification assumptions.",
        "Keep specified desired-product atom economy unchanged.",
      ],
    ),
  ],
  checkForms: [
    [
      p(
        "ca-output",
        "Independent output comparison",
        "Equal feed records: A maximum 75 kg with 64% collected yield; B maximum 90 kg with 50% yield. Enter collected kg for each.",
        [
          { id: "a", label: "A collected / kg", answer: 48 },
          { id: "b", label: "B collected / kg", answer: 45 },
        ],
        "75×.64=48;90×.5=45.",
        "Calculate each actual product.",
      ),
      n(
        "ca-throughput",
        "Independent minutes transfer",
        "A complete 40-minute batch gives 32 kg desired product and repeats without added downtime. Find kg/h.",
        48,
        "kg/h",
        "40/60=2/3 h;32/(2/3)=48 kg/h.",
        "Convert time before division.",
      ),
      n(
        "ca-cost",
        "Independent by-product net cost",
        "Base cost £172 for 100 kg desired product; 24 kg co-product, 6 kg sold at £5/kg, remainder disposed at £3/kg. Find included net cost per kg desired product.",
        1.96,
        "£/kg",
        "Net 172 + 18×3 − 6×5 = 196; 196/100 = 1.96.",
        "Use actual desired-product amount as denominator.",
      ),
      c(
        "ca-constraint",
        "Independent inclusive limits",
        "Minimum output 35 kg/h, maximum energy 12 kWh/kg. A:34 kg/h,8 kWh/kg. B:35 kg/h,12 kWh/kg. C:45 kg/h,13 kWh/kg. Which qualifies?",
        "B",
        { A: "It fails minimum output.", C: "It exceeds maximum energy." },
        "B satisfies both including equality.",
        "Apply both constraints.",
      ),
      w(
        "ca-proof",
        "Independent linked recommendation",
        "A higher-economy process has slow hourly output. A lower-economy route meets the stated production deadline but uses a saleable co-product. Explain how to justify a decision and identify missing evidence.",
        "Check the deadline using comparable output per time, then compare atom economy and any supported co-product credit or disposal. Link the chosen route to the actual priority. Demand, purification, included costs, energy and hazards may still be missing. Higher economy alone does not settle the choice.",
        [
          "Use a matching production-time comparison.",
          "Link at least two relevant pieces of evidence to the purpose.",
          "Name missing evidence and avoid a universal score.",
        ],
      ),
    ],
    [
      p(
        "cb-output",
        "Independent changed collection",
        "Equal feed records: A maximum 120 kg with 55% collected yield; B maximum 100 kg with 72% yield. Enter collected kg for each.",
        [
          { id: "a", label: "A collected / kg", answer: 66 },
          { id: "b", label: "B collected / kg", answer: 72 },
        ],
        "120×.55=66;100×.72=72.",
        "Actual collection requires its own maximum.",
      ),
      n(
        "cb-throughput",
        "Independent complete-batch output",
        "A complete 1.5-hour batch gives 81 kg dry product and repeats without added downtime. Find kg/h.",
        54,
        "kg/h",
        "81/1.5=54 kg/h.",
        "Use the full supplied batch duration.",
      ),
      n(
        "cb-cost",
        "Independent limited buyer",
        "Base cost £210 for 120 kg desired product.30 kg co-product; sell 12 kg at £5/kg and dispose remaining material at £3/kg. Find net included cost.",
        204,
        "£",
        "Unsold 18 costs 54;credit 60;210+54−60=204.",
        "Sold kilograms do not also incur the stated disposal cost.",
      ),
      c(
        "cb-catalyst",
        "Independent equilibrium distinction",
        "At unchanged temperature and pressure, a catalyst changes time to equilibrium from 4 h to 1 h. What conclusion is justified?",
        "Equilibrium is reached sooner with the same equilibrium composition",
        {
          "Equilibrium yield increases fourfold":
            "A time ratio does not change equilibrium position.",
          "Desired-product atom economy increases fourfold":
            "The overall balanced equation is unchanged.",
        },
        "The supplied change is in approach time, not equilibrium position or stoichiometry.",
        "Keep the measured quantity and units with the claim.",
      ),
      w(
        "cb-proof",
        "Independent choice under evidence",
        "Two routes meet a throughput requirement. A has 90% atom economy and energy 14 kWh/kg; B has 75% economy and energy 9 kWh/kg. Explain why a preference requires a stated purpose and why averaging these numbers is unsuitable.",
        "A has higher equation economy while B uses less supplied energy per kg. An economy priority can favour A; an energy limit below 14 can exclude it and favour B. Averaging a percentage with kWh/kg has no defined chemical or decision meaning. Cost, hazard, collection and co-product evidence may still be needed.",
        [
          "Compare the two distinct quantities.",
          "Link a choice to a stated objective or constraint.",
          "Reject an undefined average and acknowledge missing evidence.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-output",
        "Retrieve collected output",
        "Maximum desired product 70 kg; collected yield 60%. Find actual kg.",
        42,
        "kg",
        "70×.6=42 kg.",
        "Use the actual/theoretical product fraction.",
      ),
      n(
        "ra-rate",
        "Retrieve normalization",
        "Complete batch 72 kg in 2.25 h; repeats without added downtime. Find kg/h.",
        32,
        "kg/h",
        "72/2.25=32.",
        "Divide by the complete time.",
      ),
      n(
        "ra-cost",
        "Retrieve disposal and sale",
        "Base cost £90,16 kg co-product,4 kg sold at £3/kg, rest disposed at £1/kg. Find net included cost.",
        90,
        "£",
        "12 disposal−12 credit cancel;net 90.",
        "Retain both amounts, even when they cancel.",
      ),
    ],
    [
      n(
        "rb-output",
        "Retrieve changed fraction",
        "Maximum desired product 85 kg; collected yield 80%. Find actual kg.",
        68,
        "kg",
        "85×.8=68.",
        "Apply yield to product maximum.",
      ),
      n(
        "rb-rate",
        "Retrieve minutes transfer",
        "Complete 25-minute batch gives 20 kg and repeats without added downtime. Find kg/h.",
        48,
        "kg/h",
        "20/(25/60)=48.",
        "Convert minutes to hours.",
      ),
      c(
        "rb-constraint",
        "Retrieve a qualified choice",
        "Maximum energy 8 kWh/kg and minimum 30 kg/h. A:31 kg/h,9 kWh/kg. B:30 kg/h,8 kWh/kg. Choose the qualifying route.",
        "B",
        {
          A: "Its energy exceeds the maximum.",
          "Neither because equality fails":
            "The specified limits include equality.",
        },
        "B meets both inclusive constraints.",
        "Eligibility comes before preference.",
      ),
    ],
  ],
};
productionPathwaysJourney.guided[0].openingHint = true;
productionPathwaysJourney.practice.find(
  (q) => q.id === "pp-v1-p-largest",
)!.followUp = "pp-v1-r-fraction";
productionPathwaysJourney.practice.find(
  (q) => q.id === "pp-v1-p-reaction-only",
)!.followUp = "pp-v1-r-rate";
productionPathwaysJourney.practice.find(
  (q) => q.id === "pp-v1-p-equilibrium",
)!.followUp = "pp-v1-r-catalyst";
