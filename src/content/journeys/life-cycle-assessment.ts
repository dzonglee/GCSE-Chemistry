import type { LearningTask, LessonJourney } from "../types";
import { lcaRecords as R, type LcaGiven } from "../../lib/life-cycle";
import {
  magnitudeRefresher,
  magnitudeGuided,
  magnitudePractice,
  magnitudeCheckForms,
  magnitudeReviewForms,
} from "./resource-magnitude";
import {
  resourceRefresher,
  resourceGuided,
  resourcePractice,
  resourceCheckForms,
  resourceReviewForms,
} from "./resource-use";
const id = (s: string) => "lca-v1-" + s;
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  data?: LcaGiven,
): LearningTask {
  const opts = [answer, ...Object.keys(errors)],
    n = [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % opts.length;
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    options: [...opts.slice(n), ...opts.slice(0, n)],
    misconceptions: errors,
    explanation,
    hint,
    ...(record
      ? {
          model: {
            kind: "life-cycle-investigation" as const,
            mode: R[record].mode,
            record,
          },
        }
      : {}),
    ...(data ? { lcaGiven: data } : {}),
  };
}
function num(
  s: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  record?: string,
  data?: LcaGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    unit,
    inputMode: "decimal",
    tolerance: 1e-6,
    explanation,
    hint,
    ...(record
      ? {
          model: {
            kind: "life-cycle-investigation" as const,
            mode: R[record].mode,
            record,
          },
        }
      : {}),
    ...(data ? { lcaGiven: data } : {}),
  };
}
function build(
  s: string,
  title: string,
  prompt: string,
  refs: readonly (readonly [string, string, number])[],
  data: LcaGiven,
  explanation: string,
  hint: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: JSON.stringify(
      Object.fromEntries(refs.map(([f, , v]) => [f, String(v)])),
    ),
    partLegend: data.recycling
      ? "Construct the material balance"
      : data.service
        ? "Construct the equivalent-service comparison"
        : "Construct the lifecycle quantities",
    parts: refs.map(([f, label, answer]) => ({
      id: f,
      label,
      answer,
      inputMode: "decimal" as const,
      tolerance: 1e-6,
    })),
    lcaGiven: data,
    explanation,
    hint,
  };
}
function write(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  data?: LcaGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    rubric,
    referenceResponse: answer,
    explanation:
      "Use the criteria to review your reasons and improve the saved response. This is manual review, not an automatic exam mark.",
    hint,
    ...(data ? { lcaGiven: data } : {}),
  };
}
const warmup = [
  num(
    "w-divide",
    "Equal service",
    "A total of 300 kJ supplies six equivalent services. What is the energy per service?",
    50,
    "kJ/service",
    "300÷6=50 kJ/service. The denominator is the number of equivalent services.",
    "Divide by the service count.",
  ),
  choice(
    "w-finite",
    "Finite feedstock",
    "Which supplied raw material is finite on human timescales?",
    "Crude oil",
    {
      "Newly grown wood": "Wood can regrow under suitable management.",
      Sunlight: "Sunlight is not a finite material stock in this comparison.",
    },
    "Crude oil is a finite resource; recycling can reduce new demand without creating more oil.",
    "Distinguish a stock from replenishment.",
  ),
  num(
    "w-percent",
    "A recovery fraction",
    "What is 75% of 80 kg?",
    60,
    "kg",
    "80×75/100=60 kg; the percentage applies to the given 80 kg.",
    "Keep the stated whole.",
  ),
  choice(
    "w-units",
    "Compatible totals",
    "Which pair can be added directly to make an energy total?",
    "40 kJ and 60 kJ",
    {
      "40 L and 60 kJ": "Volume and energy have different units.",
      "40 kg and 60 L": "Mass and volume are different quantities.",
    },
    "Add like energy units. Water, waste and energy cannot simply be combined into a physical total.",
    "Check the quantity and units.",
  ),
];
const refresher = [
  choice(
    "r-shopping",
    "Bag stages",
    "Place each bag event. Which stage supplies the crude-oil feedstock?",
    "Raw materials",
    {
      Use: "Carrying shopping is use.",
      "End of life": "Disposal happens after useful service.",
    },
    R.shopping.feedback,
    "Start before manufacture.",
    "shopping",
  ),
  choice(
    "r-bottle",
    "Bottle stages",
    "Construct the bottle sequence. Where does washing a returned bottle belong?",
    "Use and operation",
    {
      "Raw materials": "Washing is not quarrying new feedstock.",
      "End of life": "This bottle is returning for use, not remelting.",
    },
    R.bottle.feedback,
    "Distinguish reuse from recycling.",
    "bottle",
  ),
  choice(
    "r-building",
    "Building-product stages",
    "Classify the four events. Where does recovery after demolition belong?",
    "End of useful life",
    {
      Manufacture:
        "A new product may later be manufactured from recovered material.",
      "Raw materials only":
        "This recovery is at the existing product's end of life.",
    },
    R.building.feedback,
    "Follow the existing product.",
    "building",
  ),
  num(
    "r-full",
    "Full lifecycle boundary",
    "Include matching stages for both products. What is full product A energy?",
    400,
    "kJ",
    R.full.feedback,
    "Include all four rows once.",
    "full",
  ),
  num(
    "r-reversed",
    "Selective boundary",
    "Repair the advert's boundary. What is full product A energy?",
    300,
    "kJ",
    R.reversed.feedback,
    "Production is only part of the life.",
    "reversed",
  ),
  num(
    "r-totals",
    "Matched energy inventories",
    "Construct both totals and their signed difference. What is product B total?",
    350,
    "kJ",
    R.totals.feedback,
    "Add four B values.",
    "totals",
  ),
  num(
    "r-signed",
    "Signed difference",
    "Construct A−B. What is the signed energy difference?",
    -60,
    "kJ",
    R.signed.feedback,
    "Keep the order A minus B.",
    "signed",
  ),
  num(
    "r-short",
    "Short reuse lifetime",
    "Compare 10 completed services. What is reusable energy per service?",
    108,
    "kJ/service",
    R.short.feedback,
    "Fixed plus washing, then divide.",
    "short",
  ),
  num(
    "r-tie",
    "Energy equality",
    "Compare 20 completed services. What is reusable energy per service?",
    60,
    "kJ/service",
    R.tie.feedback,
    "An equal result is not strictly lower.",
    "tie",
  ),
  num(
    "r-long",
    "Longer reuse lifetime",
    "Compare 30 completed services. What is reusable energy per service?",
    44,
    "kJ/service",
    R.long.feedback,
    "Spread fixed energy over the stated lifetime.",
    "long",
  ),
  choice(
    "r-bags",
    "Bag trade-offs",
    "Compare energy, water and waste separately. Which overall conclusion is justified?",
    "The ranking depends on effects and priorities",
    {
      "Plastic wins every measure": "Paper has lower stated residual waste.",
      "Paper wins every measure": "Plastic has lower given energy and water.",
    },
    R.bags.feedback,
    "A measured quantity is not a complete impact score.",
    "bags",
  ),
  choice(
    "r-waterPriority",
    "Different priorities",
    "Compare the three measures. Why may a water-priority decision differ from an energy-priority decision?",
    "Different measures favour different products",
    {
      "All measurements are false":
        "The supplied quantities can still be measured.",
      "Litres can be added to MJ": "Different physical units cannot be added.",
    },
    R.waterPriority.feedback,
    "State the priority and missing impact evidence.",
    "waterPriority",
  ),
  num(
    "r-glass",
    "Glass material inventory",
    "Construct usable, rejected and new-input masses. What usable glass is recovered?",
    72,
    "kg",
    R.glass.feedback,
    "Apply recovery to the sorted stream.",
    "glass",
  ),
  num(
    "r-polymer",
    "Polymer quality inventory",
    "Construct the supplied material balance. What new suitable input is needed?",
    30,
    "kg",
    R.polymer.feedback,
    "Demand minus usable recovery.",
    "polymer",
  ),
  num(
    "r-steel",
    "Suitable scrap inventory",
    "Construct the supplied material balance. What usable material is recovered?",
    144,
    "kg",
    R.steel.feedback,
    "Use the suitable sorted 180 kg.",
    "steel",
  ),
];
refresher.push(
  num(
    "r-scale",
    "Scale energy by product mass",
    "Original data: one product has mass 5 g and needs 320 kJ to produce. How much energy produces 1 kg of these identical products?",
    64000,
    "kJ",
    "1 kg=1000 g;1000/5=200 products.200×320=64000 kJ=6.4×10⁴ kJ. This is supplied production energy only, not a whole-life verdict.",
    "Use matching mass units, find item count, then scale energy.",
    undefined,
    {
      title: "Original production-energy source",
      note: "Identical 5 g products require 320 kJ each to produce. Required mass 1 kg. No losses or other stage data are supplied.",
      rows: [
        { label: "One product mass", text: "5 g" },
        { label: "Production energy per product", text: "320 kJ" },
        { label: "Required total product mass", text: "1 kg" },
      ],
    },
  ),
);

const guided = [
  choice(
    "g-stages",
    "Place the events",
    "Place the first event in its stage.",
    "Raw materials",
    {
      Manufacture: "The crude oil is feedstock before bag manufacture.",
      Use: "Using a bag starts after it has been made.",
    },
    R.shopping.feedback,
    "Read each event.",
    "shopping",
  ),
  num(
    "g-boundary",
    "Choose the lifecycle boundary",
    "Include the matching lifecycle stages. What is the full A total?",
    400,
    "kJ",
    R.full.feedback,
    "Transport is already counted in the rows.",
    "full",
  ),
  num(
    "g-inventory",
    "Construct energy inventories",
    "Add like quantities for the same service. What is A−B?",
    50,
    "kJ",
    R.totals.feedback,
    "Use the signed order A minus B.",
    "totals",
  ),
  num(
    "g-reuse",
    "Compare repeated service",
    "Build the energy comparison for 30 completed services. What is reusable energy per service?",
    44,
    "kJ/service",
    R.long.feedback,
    "Count fixed energy once.",
    "long",
  ),
  choice(
    "g-tradeoff",
    "Interpret conflicting measures",
    "Construct the three comparisons. What can be concluded overall?",
    "A decision needs stated priorities and impact evidence",
    {
      "Lower energy proves every impact is lower":
        "The waste result favours B.",
      "Add all numbers into a universal score":
        "Their units differ and no impact weighting is supplied.",
    },
    R.bags.feedback,
    "Separate inventory from judgement.",
    "bags",
  ),
  num(
    "g-recycle",
    "Keep material streams separate",
    "Construct the glass recovery balance. How much new suitable input is needed?",
    28,
    "kg",
    R.glass.feedback,
    "Compare usable recovery with demand.",
    "glass",
  ),
];
const equalEnergy = (
  title: string,
  energy: NonNullable<LcaGiven["energy"]>,
): LcaGiven => ({
  title,
  note: "Original equal-service exercise. All four rows include their respective transport/distribution once. No other impact data are supplied.",
  energy,
});
const independentEnergy = equalEnergy("Independent stage-energy source", [
  { stage: "Raw materials", a: 60, b: 80 },
  { stage: "Make and pack", a: 120, b: 70 },
  { stage: "Use", a: 15, b: 20 },
  { stage: "End of life", a: 5, b: 10 },
]);
const graphEnergy = equalEnergy("Independent graph source", [
  { stage: "Raw materials", a: 120, b: 140 },
  { stage: "Make and pack", a: 180, b: 100 },
  { stage: "Use", a: 40, b: 60 },
  { stage: "End of life", a: 20, b: 30 },
]);
const independentReuse: LcaGiven = {
  title: "Independent repeated-service source",
  note: "Original equal-capacity packaging data. Count fixed production/end-of-life once. Wash/return energy applies to every completed service, including the first. Assume 30 services and no breakage; single-use figure covers its stated whole lifecycle.",
  service: { fixed: 840, wash: 10, single: 50, uses: 30 },
};
const independentImpacts: LcaGiven = {
  title: "Independent equal-service impact quantities",
  note: "Original complete-boundary quantities for the same service. Pollutant effects and local water scarcity are not quantified.",
  impacts: [
    { name: "Energy", unit: "MJ", a: 140, b: 200 },
    { name: "Water", unit: "L", a: 90, b: 30 },
    { name: "Residual waste", unit: "kg", a: 8, b: 8 },
  ],
};
const independentGlass: LcaGiven = {
  title: "Independent sorted material balance",
  note: "All 160 kg collected material is accounted for;120 kg is suitable sorted material.80% of the sorted stream is recovered as usable material. The specified new product needs 150 kg suitable material. No other recovered source is available.",
  recycling: { collected: 160, sorted: 120, yield: 80, demand: 150 },
};
const bagGiven: LcaGiven = {
  title: R.bags.title,
  note: R.bags.note,
  impacts: R.bags.impacts,
};
const practice = [
  choice(
    "p-stage",
    "Start before the shop",
    "Extraction and processing of raw materials belong in which assessment?",
    "The product lifecycle",
    {
      "Only shop price": "Price is not the complete environmental lifecycle.",
      "Only disposal": "Raw materials are an earlier stage.",
    },
    "Start with raw materials, then manufacture/packaging, use/operation and end of life; transport belongs throughout.",
    "Include the whole stated life.",
  ),
  write(
    "p-transport",
    "Transport throughout",
    "Explain why transport should not appear only as an afterthought at the product's disposal.",
    "Feedstock may be transported to manufacture, finished products distributed, reusable products returned and waste collected. Include relevant transport at each lifecycle stage for both alternatives, using a matching boundary without double-counting the same journey.",
    [
      "Transport can occur at more than one lifecycle stage.",
      "Give at least two concrete journeys linked to stages.",
      "Use a matching boundary and avoid double-counting.",
    ],
    "Follow materials and products between stages.",
  ),
  write(
    "p-boundary",
    "Explain an honest boundary",
    "Describe the four major lifecycle stages and explain why a manufacturing-only advert cannot claim the smallest whole-life environmental impact.",
    "Assess extraction/processing of raw materials, manufacture/packaging, use/operation and end-of-life disposal or recycling, with relevant transport/distribution throughout. A manufacturing-only result omits other stages, which may change a comparison. State the limited boundary and compare equal service; do not present the abbreviated result as a complete environmental verdict.",
    [
      "All four major stages.",
      "Transport/distribution throughout.",
      "Omitted stages can change the result.",
      "Matching service and explicit claim limits.",
    ],
    "Distinguish partial evidence from a whole-life claim.",
  ),
  build(
    "p-total",
    "Construct independent energy totals",
    "Calculate both matched totals and A−B.",
    [
      ["a", "A total / kJ", 200],
      ["b", "B total / kJ", 180],
      ["d", "A minus B / kJ", 20],
    ],
    independentEnergy,
    "A 60+120+15+5=200; B 80+70+20+10=180 kJ. A−B=20 kJ. Transport already belongs in each row.",
    "Add four like quantities for each product.",
  ),
  num(
    "p-graph",
    "Translate graph and table",
    "Open the graph and compare its manufacture bars. How much greater is A's manufacturing energy than B's?",
    80,
    "kJ",
    "180−100=80 kJ. The same common axis compares this stage; it is not the complete lifecycle difference.",
    "Read the manufacture pair.",
    undefined,
    graphEnergy,
  ),
  num(
    "p-percent",
    "Relative energy reduction",
    "Using the independent matched totals, what percentage reduction occurs from A's total to B's?",
    10,
    "%",
    "(200−180)/200×100=10%. The original A total is the reference, not B or a single stage.",
    "Divide the decrease by the original total.",
    undefined,
    independentEnergy,
  ),
  build(
    "p-reuse",
    "Construct an independent reuse comparison",
    "Calculate reusable total, reusable per service, total single-use energy and single-use minus reusable energy.",
    [
      ["total", "Reusable total / kJ", 1140],
      ["per", "Reusable per service / kJ", 38],
      ["single", "Single-use total / kJ", 1500],
      ["saving", "Single-use minus reusable / kJ", 360],
    ],
    independentReuse,
    "840+30×10=1140 kJ;1140/30=38 kJ/service.30×50=1500 kJ;1500−1140=360 kJ. Other impacts need separate data.",
    "Count fixed energy once and washing every stipulated service.",
  ),
  num(
    "p-crossover",
    "First strictly lower whole-use count",
    "Keep the given 840 kJ fixed,10 kJ washing per service and 50 kJ single-use. What is the smallest whole number of completed services for which reusable energy is strictly lower?",
    22,
    "services",
    "840+10 n<50 n requires n>21. At 21 the energies tie; the first whole count with strictly lower reusable energy is 22. This threshold belongs only to these assumptions.",
    "Compare totals and distinguish equality from lower.",
    undefined,
    independentReuse,
  ),
  choice(
    "p-washRule",
    "Use the stated wash convention",
    "The source explicitly charges washing/return for every completed service, including the first. At 30 services, which washing count applies?",
    "30",
    {
      "29": "The supplied rule is per completed service including the first.",
      "1": "The per-service process repeats, unlike fixed production.",
    },
    "Use the explicit 30-service rule; different real logistics need different data. Do not silently substitute n−1.",
    "Read the counting rule.",
    undefined,
    independentReuse,
  ),
  write(
    "p-evaluateReuse",
    "Evaluate the reusable option",
    "Recommend an option using the given 30-service energy comparison, and explain the limits of that recommendation.",
    "For 30 equivalent services I favour reusable packaging on the supplied energy criterion:1140 kJ or 38 kJ/service compared with 1500 kJ or 50 kJ/service, a 360 kJ saving. Production/end-of-life is counted once and washing/return every service. This assumes 30 completed uses, equal capacity and no breakage; fewer uses can alter the result. Water, pollution effects and actual return logistics are not supplied, so this is not a universal environmental ranking.",
    [
      "A judgement tied to equivalent service and the energy criterion.",
      "Correct numerical comparison and linked reason.",
      "Fixed and repeated use processes recognised.",
      "At least one assumption and missing environmental evidence.",
    ],
    "Make a supported judgement, then state its limits.",
    independentReuse,
  ),
  build(
    "p-tradeNumbers",
    "Compare each physical quantity",
    "Calculate B−A energy and the ratio of A water use to B water use.",
    [
      ["energy", "B minus A energy / MJ", 60],
      ["ratio", "A water divided by B water", 3],
    ],
    independentImpacts,
    "200−140=60 MJ;90/30=3. Energy and water comparisons are separate; litres cannot be added toMJ.",
    "Compare matching units separately.",
  ),
  write(
    "p-pollutants",
    "Inventory versus environmental effects",
    "Use the supplied quantities to explain why a whole environmental choice is not purely objective.",
    "A uses 60 MJ less energy; B uses less water (30 L versus 90 L), while waste masses tie. These physical quantities can be measured, but pollutant effects, water scarcity and relative importance need additional evidence and value judgements. An energy priority might favour A and a water priority B; the choice should disclose assumptions rather than add unlike units or claim every assessment is dishonest.",
    [
      "Correct conflicting physical comparisons.",
      "Measurable quantities distinguished from pollutant effects.",
      "Missing context and value judgements identified.",
      "Conditional, transparent judgement without adding unlike units.",
    ],
    "State what was measured and what is still a judgement.",
    independentImpacts,
  ),
  write(
    "p-advert",
    "Repair a selective advert",
    "An advert calls A 'the best lifecycle choice' because its raw-material energy is 60 kJ versus B's 80 kJ. Evaluate the claim using all the supplied data.",
    "The raw-material comparison favours A, but a full matched energy boundary gives A 200 kJ versus B 180 kJ, favouring B for total energy. The advert omits manufacture, use and end of life and overstates what a single row proves. State the complete service/boundary and show all stages. Even B's lower total energy does not establish the smallest overall environmental impact without water, resource, waste and pollutant-effect information.",
    [
      "Advert's limited evidence identified.",
      "Full totals compared with the changed result.",
      "Omitted stages and matching boundary explained.",
      "Energy result limited to energy, with further environmental evidence needed.",
    ],
    "A selected stage may reverse the full result.",
    independentEnergy,
  ),
  choice(
    "p-renewable",
    "Renewable does not mean impact-free",
    "Which conclusion about paper-bag feedstock is justified?",
    "Wood can regrow, while forestry and processing still have impacts",
    {
      "Renewable means no water or land use":
        "Forestry and processing use resources.",
      "Paper must always have less total impact":
        "A lifecycle comparison needs actual data.",
    },
    "Wood may be replenished by regrowth, but land use, biodiversity, processing energy/water and disposal still matter. Crude-oil polymer feedstock is finite.",
    "Distinguish replenishment from an environmental verdict.",
  ),
  write(
    "p-reduce",
    "Reduce before processing",
    "Explain how avoiding an unnecessary new product differs from reusing and recycling one already made.",
    "Reducing unnecessary demand avoids some new extraction, manufacture, packaging and resulting waste. Reuse supplies further service from the existing product but can need cleaning and return transport. Recycling processes suitable recovered material into products and can need separation, energy and new input. All can conserve limited resources; compare the actual required service and consequences rather than assuming zero impacts.",
    [
      "Reduction avoids unnecessary new-product demand.",
      "Reuse keeps a product in service with possible cleaning/transport.",
      "Recycling processes recovered material with separation/energy.",
      "Resource benefit distinguished from zero-impact claim.",
    ],
    "Follow the product and then the material.",
  ),
  choice(
    "p-reuseRecycle",
    "Distinguish glass routes",
    "Which action is recycling rather than simply reusing a glass bottle?",
    "Crush and melt glass to make another product",
    {
      "Wash and refill the same bottle": "The same product is reused.",
      "Leave the empty bottle unused": "This supplies no further service.",
    },
    "Reuse keeps the product; crushing/melting transforms suitable glass into material for a new product, with processing energy.",
    "Track whether the existing product is retained.",
  ),
  build(
    "p-glass",
    "Construct an independent material inventory",
    "Calculate usable recovery, other collected streams and new suitable input.",
    [
      ["usable", "Recovered usable material / kg", 96],
      ["other", "Collected material not recovered / kg", 64],
      ["new", "New suitable material needed / kg", 54],
    ],
    independentGlass,
    "120×.8=96 kg usable;160−96=64 kg in other streams;150−96=54 kg new input. Applying 80% to all collected material ignores sorting.",
    "Recovery applies to the sorted mass, then compare with demand.",
  ),
  num(
    "p-yield",
    "Overall collection-to-product yield",
    "What percentage of all collected material reaches the usable recovered product?",
    60,
    "%",
    "96/160×100=60%.80% is the sorted-stream recovery, not the collected-to-product fraction.",
    "Use all collected material as the denominator.",
    undefined,
    independentGlass,
  ),
  write(
    "p-separation",
    "Separation depends on use",
    "Explain why the amount of separation required for recycling depends on the material and the properties needed in the final product.",
    "Mixed polymers, coatings or contaminants can affect processing and final-product properties. A product needing a particular polymer, composition or quality can require more sorting than a use able to accept suitable mixed scrap. Collection does not guarantee usable recovery. Separation and processing themselves use resources; judge the supplied stream and required properties rather than claiming every material is fully recyclable.",
    [
      "Mixture/contamination linked to processing or product properties.",
      "Separation depends on final-use requirements.",
      "Collection distinguished from usable recovery.",
      "Processing costs or losses recognised.",
    ],
    "Ask what the next product must be like.",
  ),
  choice(
    "p-steel",
    "Suitable scrap steel",
    "Which specified use can reduce the amount of new iron extracted from ore?",
    "Add suitable scrap steel to primary iron from a blast furnace",
    {
      "Create new iron atoms by melting scrap":
        "Melting does not create atoms.",
      "All scrap must be chemically pure iron for every product":
        "Required separation depends on final-product properties.",
    },
    "Suitable scrap can supplement newly produced iron and reduce ore demand. The allowed composition depends on the specified final product.",
    "Use the material for a suitable purpose.",
  ),
  choice(
    "p-materials",
    "Limited raw materials",
    "Which statement fits the specified resource scope?",
    "Metals, glass, building materials, clay ceramics and most plastics use limited raw materials",
    {
      "Every raw material regrows each week":
        "Minerals and oil are finite stocks.",
      "Recycling eliminates all mining immediately":
        "Recovered quantities/quality may not meet demand.",
    },
    "Reduction, reuse and recycling can reduce extraction from finite resources. Much processing energy also comes from limited resources; mining/quarrying changes land and can damage habitats or cause pollution. The given quantities and local effects are needed for a comparison.",
    "Distinguish reduced demand from an unlimited stock.",
  ),
  write(
    "p-bagDecision",
    "Evaluate paper and plastic shopping bags",
    "Compare the supplied plastic(A) and paper(B) options and make a justified, conditional recommendation.",
    "For 1000 equal shopping services, plasticA uses 180 MJ and 25 L versus paperB 300 MJ and 70 L, so A has the lower measured energy and water demand. PaperB leaves 4 kg residual waste versus A 10 kg, favouring B on that criterion. Oil feedstock is finite; wood can regrow but forestry uses land and may affect biodiversity. I would choose A if energy/water are the declared priority, while B could be chosen for residual waste. Both require a matched full lifecycle including transport, and disposal/collection conditions and pollutant effects need evidence. No material wins universally.",
    [
      "Equal service and matched lifecycle recognised.",
      "Correct linked energy and water comparisons.",
      "Opposing residual-waste result acknowledged.",
      "Resource/processing/disposal context without universal material claims.",
      "A clear conditional judgement and evidence limitations.",
    ],
    "Compare advantages and disadvantages, then justify a priority.",
    bagGiven,
  ),
];
practice.push(
  num(
    "p-energyMass",
    "Scale a new production-energy source",
    "Using the supplied data, calculate the production energy for 2 kg of identical products. Scientific notation is accepted.",
    60000,
    "kJ",
    "2 kg=2000 g;2000/8=250 products;250×240=60000 kJ=6×10⁴ kJ. Keep production-energy scope separate from a whole environmental judgement.",
    "Match mass units, count the products, then multiply their energy.",
    undefined,
    {
      title: "Independent mass-to-energy source",
      note: "Original identical products and production-only energy. Assume no losses; other lifecycle stages are not supplied.",
      rows: [
        { label: "Mass of one product", text: "8 g" },
        { label: "Energy to produce one product", text: "240 kJ" },
        { label: "Required product mass", text: "2 kg" },
      ],
    },
  ),
);

const checkEnergyA = equalEnergy("Reserved energy source A", [
  { stage: "Raw materials", a: 280, b: 240 },
  { stage: "Make and pack", a: 140, b: 90 },
  { stage: "Use", a: 50, b: 60 },
  { stage: "End of life", a: 30, b: 30 },
]);
const checkEnergyB = equalEnergy("Reserved energy source B", [
  { stage: "Raw materials", a: 90, b: 180 },
  { stage: "Make and pack", a: 120, b: 100 },
  { stage: "Use", a: 70, b: 40 },
  { stage: "End of life", a: 20, b: 20 },
]);
const checkReuse: LcaGiven = {
  title: "Reserved repeated-service source",
  note: "Original equal-capacity data. Fixed energy once; wash/return every completed service including the first. No breakage,30 equivalent services.",
  service: { fixed: 720, wash: 9, single: 45, uses: 30 },
};
const checkImpact: LcaGiven = {
  title: "Reserved bag comparison",
  note: "Original data for 1000 equivalent shopping services and matching lifecycle boundaries; pollutant effects unspecified.",
  impacts: [
    { name: "Energy", unit: "MJ", a: 240, b: 180 },
    { name: "Water", unit: "L", a: 40, b: 80 },
    { name: "Residual waste", unit: "kg", a: 6, b: 12 },
  ],
};
const checkRecycle: LcaGiven = {
  title: "Reserved recycling source",
  note: "Collected 250 kg; suitable sorted 200 kg;90% usable recovery of that stream. New product requires 220 kg suitable material. Other collected material is accounted for outside the recovered product.",
  recycling: { collected: 250, sorted: 200, yield: 90, demand: 220 },
};
const checkForms = [
  [
    choice(
      "cA-end",
      "Locate a lifecycle effect",
      "A discarded product is collected for recycling. Which stage is this?",
      "End of useful life",
      {
        "Use and operation": "It is no longer serving its original use.",
        "Raw feedstock extraction":
          "Collection is from the existing discarded product.",
      },
      "Collection/disposal/recycling is at end of useful life; relevant transport is included there.",
      "Follow the existing product.",
    ),
    build(
      "cA-energy",
      "Build the reserved energy comparison",
      "Calculate both complete totals and A−B.",
      [
        ["a", "A total / kJ", 500],
        ["b", "B total / kJ", 420],
        ["d", "A minus B / kJ", 80],
      ],
      checkEnergyA,
      "A 500,B 420; A−B=80 kJ. Matching full stages include transport once.",
      "Keep both products' complete boundary.",
    ),
    build(
      "cA-reuse",
      "Compare the reserved repeated service",
      "Calculate reusable total, reusable per service and single-use total.",
      [
        ["total", "Reusable total / kJ", 990],
        ["per", "Reusable per service / kJ", 33],
        ["single", "Single-use total / kJ", 1350],
      ],
      checkReuse,
      "720+30×9=990 kJ;990/30=33;30×45=1350 kJ. Washing is repeated under the given rule.",
      "Count fixed and per-service energy separately.",
    ),
    write(
      "cA-judgement",
      "Make a supported bag judgement",
      "Evaluate the two reserved bag options and state a conditional recommendation.",
      "B needs 180 MJ versus A 240 MJ, favouring B for energy. A needs 40 L versus B 80 L and produces 6 kg versus 12 kg residual waste, favouring A for those measures. For a water/waste priority I choose A, acknowledging B's energy advantage; an energy priority could choose B. The quantities refer to equal service and matching boundaries, but pollutant effects, local scarcity and the importance assigned to each impact need evidence and value judgements. No overall universal winner follows.",
      [
        "Correct evidence from at least two conflicting measures.",
        "Reasons linked to a declared judgement.",
        "Equal service/boundary and missing impact context.",
        "Value judgement and conditional limit.",
      ],
      "Use data to support a conclusion rather than list it.",
      checkImpact,
    ),
    write(
      "cA-resources",
      "Explain resource savings",
      "Explain how reduction, reuse and recycling can reduce finite-resource demand, and give a limitation.",
      "Reducing unnecessary demand avoids some new production. Reusing keeps an existing product supplying further service, though cleaning/return may be needed. Recycling recovers suitable material, reducing new extraction and often primary-production energy and waste; collection, separation and processing still use resources and can lose usable material. The benefit depends on actual service, recovery and required properties.",
      [
        "Distinct reduction/reuse/recycling reasoning.",
        "Finite extraction, energy or waste benefit.",
        "A specific processing/recovery/service limitation.",
      ],
      "Identify what new input is avoided.",
    ),
    num(
      "cA-percent",
      "Calculate an energy reduction",
      "From the reserved A total to B, what is the percentage energy decrease?",
      16,
      "%",
      "(500−420)/500×100=16%. Use the original A total.",
      "Decrease divided by the reference total.",
      undefined,
      checkEnergyA,
    ),
  ],
  [
    choice(
      "cB-transport",
      "Transport at each stage",
      "Which transport treatment supports a fair lifecycle comparison?",
      "Include relevant journeys consistently at each stage",
      {
        "Only include transport for the less-liked option":
          "That gives inconsistent boundaries.",
        "Count the same journey twice": "Double-counting distorts totals.",
      },
      "Use matched service and boundary, with relevant transport once at each stage.",
      "Compare like functions with the same accounting rules.",
    ),
    build(
      "cB-energy",
      "Keep a reserved signed difference",
      "Calculate both totals and A−B.",
      [
        ["a", "A total / kJ", 300],
        ["b", "B total / kJ", 340],
        ["d", "A minus B / kJ", -40],
      ],
      checkEnergyB,
      "A 300,B 340;A−B=−40 kJ. A uses 40 kJ less within this energy boundary.",
      "Keep the stated subtraction order.",
    ),
    build(
      "cB-recovery",
      "Balance reserved recovered material",
      "Calculate usable recovery, other collected streams and required new input.",
      [
        ["recovered", "Recovered usable material / kg", 180],
        ["other", "Collected material not recovered / kg", 70],
        ["new", "New suitable material needed / kg", 40],
      ],
      checkRecycle,
      "200×.9=180 kg;250−180=70 kg other collected streams;220−180=40 kg new input.",
      "Apply recovery to sorted material first.",
    ),
    write(
      "cB-value",
      "Explain disagreement between assessments",
      "Two transparent assessments use the same measured energy and water data but favour different products. Explain how that can happen and how readers should evaluate it.",
      "Different priorities or impact value judgements can weight energy demand, local water scarcity and pollutant effects differently. Shared measurements do not by themselves fix a universal environmental score. Readers should check service, stages/transport, data quality and the declared assumptions/importance given to impacts. An abbreviated boundary can bias an advert, but disagreement alone does not prove dishonesty.",
      [
        "Measurements distinguished from impact priorities.",
        "Value judgements or context explain disagreement.",
        "Service/boundary/data checked.",
        "No claim that every disagreement proves dishonesty.",
      ],
      "Ask how each conclusion was reached.",
    ),
    choice(
      "cB-collection",
      "Recyclable versus recycled",
      "A material can be recycled in a suitable process. Which conclusion still needs evidence?",
      "How much is actually collected and recovered locally",
      {
        "All of it must already be recycled":
          "Technical possibility is not actual collection/recovery.",
        "It must be biodegradable":
          "Recyclability and biological decomposition are different.",
      },
      "Check actual collection, sorting, infrastructure, product properties and recovery; labels alone do not quantify environmental results.",
      "Distinguish possible treatment from actual outcome.",
    ),
    num(
      "cB-percent",
      "Overall reserved recovery",
      "What percentage of all collected material becomes the recovered usable product?",
      72,
      "%",
      "180/250×100=72%;90% applies only to the suitable sorted 200 kg.",
      "Use the full collected denominator.",
      undefined,
      checkRecycle,
    ),
  ],
];
const reviewReuse: LcaGiven = {
  title: "Delayed new service data",
  note: "Original matching capacity. Fixed 540 kJ once, washing 6 kJ every completed service, single-use 36 kJ per service.15 completed services, no breakage.",
  service: { fixed: 540, wash: 6, single: 36, uses: 15 },
};
const reviewRecycle: LcaGiven = {
  title: "Delayed new material data",
  note: "Collected 180 kg; suitable sorted 150 kg;80% usable recovery; new product demand 160 kg. All other streams retained.",
  recycling: { collected: 180, sorted: 150, yield: 80, demand: 160 },
};
const reviewForms = [
  [
    num(
      "vA-service",
      "New delayed service comparison",
      "What is reusable energy per completed service for the new source?",
      42,
      "kJ/service",
      "(540+15×6)/15=42 kJ/service, greater than the given 36. Reuse is conditional.",
      "Apply the new data.",
      undefined,
      reviewReuse,
    ),
    choice(
      "vA-boundary",
      "A partial advertising claim",
      "Which claim follows from a manufacturing-only comparison?",
      "A limited manufacturing result, with its boundary stated",
      {
        "The smallest total environmental impact is proved":
          "Other stages and impacts are omitted.",
        "No manufacturing data can ever be useful":
          "Limited evidence can be useful when correctly described.",
      },
      "Disclose the limited scope; compare a full matched life for a whole-life claim.",
      "Keep the claim within the evidence.",
    ),
    write(
      "vA-routes",
      "Retrieve reduction and reuse",
      "Explain the distinction between reducing demand, reusing a product and recycling material, with one non-zero processing impact.",
      "Reduce unnecessary new-product demand; reuse an existing product for more equivalent service; recycle suitable material into products. Reuse can need washing/return, and recycling needs collection, separation and processing energy. These can reduce finite extraction without eliminating every impact.",
      [
        "Three distinct routes.",
        "Finite-resource benefit.",
        "A specific cleaning/transport/processing impact.",
      ],
      "Track product service versus material processing.",
    ),
  ],
  [
    num(
      "vB-newInput",
      "New delayed recovery demand",
      "How much new suitable input is required for the supplied delayed product?",
      40,
      "kg",
      "150×.8=120 kg usable recovery;160−120=40 kg new input. Other collected streams contain 60 kg.",
      "Recover from the sorted stream, then meet demand.",
      undefined,
      reviewRecycle,
    ),
    choice(
      "vB-judgement",
      "Retrieve value judgements",
      "Why is an environmental lifecycle ranking not always purely objective?",
      "Pollutant effects and impact importance require judgements",
      {
        "Every measured quantity must be false":
          "Physical quantities can still be measured.",
        "MJ and litres are the same quantity":
          "They cannot be added as a physical total.",
      },
      "Quantified inventory informs decisions; pollutant effects, priorities and missing context can still require value judgements.",
      "Separate measured quantities from impact allocation.",
    ),
    write(
      "vB-full",
      "Retrieve a complete comparison",
      "Describe what a fair paper/plastic bag assessment should compare before making an overall recommendation.",
      "Use equal shopping service/capacity and consistent extraction/processing, manufacture/packaging, use/operation and end-of-life stages, including transport throughout. Compare supplied energy, water, resources and waste separately, consider actual reuse/collection/disposal and pollutant effects, and state priorities/data limitations. Renewable feedstock is not impact-free and recyclable is not automatically recycled; make a supported conditional judgement.",
      [
        "Equivalent service and all four stages.",
        "Relevant transport consistently included.",
        "Separate physical quantities and actual disposal/reuse conditions.",
        "Impact judgement and evidence limitations.",
      ],
      "Build the boundary before the verdict.",
    ),
  ],
];
const recovery = [
  "r-shopping",
  "r-bottle",
  "r-full",
  "r-totals",
  "r-totals",
  "r-totals",
  "r-long",
  "r-tie",
  "r-long",
  "r-short",
  "r-waterPriority",
  "r-waterPriority",
  "r-reversed",
  "r-bags",
  "r-steel",
  "r-bottle",
  "r-glass",
  "r-polymer",
  "r-polymer",
  "r-steel",
  "r-steel",
  "r-bags",
  "r-scale",
];
export const lcaRecoveryRoutes: Record<string, string> = {};
practice.forEach((q, i) => {
  q.followUp = id(recovery[i]);
  lcaRecoveryRoutes[q.id] = q.followUp;
});
// Append after the original recovery mapping: no saved practice index changes.
refresher.push(...resourceRefresher);
guided.push(...resourceGuided);
practice.push(...resourcePractice);
checkForms.push(...resourceCheckForms);
reviewForms.push(...resourceReviewForms);
for (const q of resourcePractice) lcaRecoveryRoutes[q.id] = q.followUp!;
refresher.push(...magnitudeRefresher);
guided.push(...magnitudeGuided);
practice.push(...magnitudePractice);
checkForms.push(...magnitudeCheckForms);
reviewForms.push(...magnitudeReviewForms);
for (const q of magnitudePractice) lcaRecoveryRoutes[q.id] = q.followUp!;
export const allLcaTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const lcaExposureFamilies = {
  stages: ["r-shopping", "g-stages", "p-stage", "cA-end"],
  transport: ["r-bottle", "r-building", "p-transport", "cB-transport"],
  boundary: [
    "r-full",
    "g-boundary",
    "r-reversed",
    "p-boundary",
    "p-advert",
    "vA-boundary",
    "vB-full",
  ],
  totals: ["r-totals", "g-inventory"],
  reuse: [
    "r-long",
    "g-reuse",
    "p-washRule",
    "p-evaluateReuse",
    "r-short",
    "r-tie",
  ],
  trade: [
    "r-bags",
    "g-tradeoff",
    "r-waterPriority",
    "p-bagDecision",
    "p-pollutants",
    "cB-value",
    "vB-judgement",
  ],
  resources: ["p-reduce", "cA-resources", "vA-routes"],
  recycling: [
    "r-glass",
    "g-recycle",
    "p-reuseRecycle",
    "p-separation",
    "p-steel",
    "p-materials",
    "cB-collection",
    "r-steel",
    "r-polymer",
  ],
};
const groups = Object.values(lcaExposureFamilies).map((fs) => new Set(fs));
let merged = true;
while (merged) {
  merged = false;
  outer: for (let a = 0; a < groups.length; a++)
    for (let b = a + 1; b < groups.length; b++)
      if ([...groups[a]].some((s) => groups[b].has(s))) {
        groups[a] = new Set([...groups[a], ...groups[b]]);
        groups.splice(b, 1);
        merged = true;
        break outer;
      }
}
for (const g of groups)
  for (const s of g) {
    const q = allLcaTasks.find((q) => q.id === id(s));
    if (!q) throw Error("Unknown lifecycle exposure " + s);
    q.exposureAliases = [...g].filter((o) => o !== s).map(id);
  }
export const lcaJourney: LessonJourney = {
  version: 1,
  introduction:
    "Construct a fair lifecycle comparison, calculate equivalent-service data and justify conditional environmental decisions.",
  scopeNote:
    "Shared Foundation/Higher: AQA Chemistry 8462 4.10.1.1 resource use and 4.10.2.1–2 LCA/recycling; the existing LCA work also addresses Trilogy 8464 5.10.2.1–2. Original paper/plastic and other product exercises; actual exam demands include extended evidence-based evaluation. Numerical tasks apply prior arithmetic, ratios, percentages and graph interpretation. Written responses are manually reviewed; software checks do not certify exam readiness.",
  outcomes: [
    "Classify raw-material, manufacture/packaging, use/operation and end-of-life processes, including transport throughout.",
    "Construct consistent boundaries for equivalent service and identify selective claims.",
    "Translate common-axis stage graphs and tables into like-unit energy totals and signed/percentage comparisons; convert mass to item count before scaling production energy.",
    "Compare reusable fixed/repeated processes with single-use service, including ties and whole-use thresholds.",
    "Distinguish measurable quantities from pollutant-effect/value judgements and evaluate paper/plastic shopping bags with declared priorities.",
    "Evaluate reduction, reuse and recycling of limited materials; account for sorting, usable recovery, other streams and new-input demand.",
    "Explain how resource use meets current needs without compromising future generations; give agricultural/synthetic supplements and classify finite/renewable resources using replenishment information.",
    "Construct order-of-magnitude estimates in like units and use them to evaluate a saving's significance and the limits of a resource claim.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Stages, boundaries and energy evidence",
      taskIds: practice.slice(0, 6).map((q) => q.id),
    },
    {
      label: "Equivalent repeated service",
      taskIds: practice.slice(6, 10).map((q) => q.id),
    },
    {
      label: "Environmental claims and judgements",
      taskIds: practice.slice(10, 14).map((q) => q.id),
    },
    {
      label: "Resource reduction and recovered materials",
      taskIds: practice.slice(14, 22).map((q) => q.id),
    },
    {
      label: "Energy scaling by product mass",
      taskIds: practice.slice(22, 23).map((q) => q.id),
    },
    {
      label: "Resource use and sustainable development",
      taskIds: resourcePractice.map((q) => q.id),
    },
    {
      label: "Orders of magnitude and significance",
      taskIds: magnitudePractice.map((q) => q.id),
    },
  ],
};
