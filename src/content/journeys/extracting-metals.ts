import type { LearningTask, LessonJourney } from "../types";
import { bioRecords as R, type BioGiven } from "../../lib/bio-extraction";
const id = (s: string) => "bio-v1-" + s;
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  data?: BioGiven,
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
            kind: "bio-extraction-investigation" as const,
            mode: R[record].mode,
            record,
          },
        }
      : {}),
    ...(data ? { bioGiven: data } : {}),
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
  data?: BioGiven,
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
            kind: "bio-extraction-investigation" as const,
            mode: R[record].mode,
            record,
          },
        }
      : {}),
    ...(data ? { bioGiven: data } : {}),
  };
}
function build(
  s: string,
  title: string,
  prompt: string,
  refs: readonly (readonly [string, string, number])[],
  data: BioGiven,
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
    parts: refs.map(([f, label, answer]) => ({
      id: f,
      label,
      answer,
      inputMode: "decimal",
    })),
    partLegend: "Construct your copper-extraction values",
    bioGiven: data,
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
  data?: BioGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    referenceResponse: answer,
    explanation: answer,
    rubric,
    hint,
    ...(data ? { bioGiven: data } : {}),
  };
}
const warmup = [
  choice(
    "w-source",
    "Recall an ore's chemical form",
    "A copper ore contains copper oxide and unwanted rock. Is the copper oxide already pure copper metal?",
    "No; copper is in a compound",
    {
      "Yes because copper is in its name":
        "A compound is not the elemental metal.",
      "No copper atoms are present":
        "CuO contains copper atoms combined with oxygen.",
    },
    "Extraction must change the copper compound into metal; separating rock alone does not do that.",
    "Separate element identity from chemical form.",
  ),
  choice(
    "w-reactivity",
    "Recall displacement",
    "Given Fe>Cu>Ag in reactivity, which supplied metal can displace copper from its compound solution?",
    "Iron",
    {
      Silver: "Silver is less reactive than copper.",
      "Copper itself": "Copper does not displace itself in this comparison.",
    },
    "More reactive iron can displace copper.",
    "Compare positions in the supplied order.",
  ),
  num(
    "w-percent",
    "Recall percentage of a mass",
    "Find 0.5% of 400 kg.",
    2,
    "kg",
    "400×0.5/100=2 kg.",
    "Divide the percentage by 100 first.",
  ),
  num(
    "w-formula",
    "Recall complete formula mass",
    "CuO has Ar(Cu)=64 and Ar(O)=16. What is Mr(CuO)?",
    80,
    "",
    "64+16=80.",
    "Include both elements.",
  ),
];
const refresher = [
  choice(
    "r-plants",
    "Follow phytomining",
    "What remains after the plants are harvested and burned?",
    "Ash containing copper compounds",
    {
      "Pure copper metal": "A final metal-recovery stage is still required.",
      "New copper atoms created by the plants":
        "Plants take up existing copper compounds.",
    },
    R.plants.feedback,
    "Track chemical form through each stage.",
    "plants",
  ),
  choice(
    "r-bacteria",
    "Follow bioleaching",
    "What does bacterial bioleaching produce?",
    "A leachate solution containing copper compounds",
    {
      "A guaranteed pure copper block":
        "Metal recovery still needs another stage.",
      "Copper created from no copper source":
        "The original source supplies the copper.",
    },
    R.bacteria.feedback,
    "Leachate is a solution.",
    "bacteria",
  ),
  choice(
    "r-readyAsh",
    "Continue after burning",
    "What remains between the prepared ash and metal recovery?",
    "Dissolve suitable copper compounds from the ash in acid",
    {
      "Call the ash pure metal": "It still contains copper compounds.",
      "Repeat plant growth":
        "Growth, harvest and burning are already complete.",
    },
    R.readyAsh.feedback,
    "Use completed-stage information.",
    "readyAsh",
  ),
  num(
    "r-oreA",
    "Use grade and recovery",
    "What mass of copper metal reaches the product?",
    4.2,
    "kg",
    R.oreA.feedback,
    "Find contained copper, then its recovery fraction.",
    "oreA",
  ),
  num(
    "r-oreB",
    "Transfer a recovery calculation",
    "Find the mass of final copper metal.",
    2.4,
    "kg",
    R.oreB.feedback,
    "Apply recovery to contained copper, not to all ore.",
    "oreB",
  ),
  num(
    "r-oxide",
    "Distinguish compound and ore grade",
    "Find the final copper metal from this CuO feed.",
    1.2,
    "kg",
    R.oxide.feedback,
    "Use the complete CuO formula mass.",
    "oxide",
  ),
  num(
    "r-ashA",
    "Concentrate existing copper",
    "What is the percentage copper content of this ash?",
    10,
    "%",
    R.ashA.feedback,
    "Copper content divided by total ash mass.",
    "ashA",
  ),
  num(
    "r-ashB",
    "Use a retention result",
    "What is the percentage copper content of this ash?",
    7.2,
    "%",
    R.ashB.feedback,
    "Apply 90% retention before calculating ash content.",
    "ashB",
  ),
  num(
    "r-ashC",
    "Account for copper outside ash",
    "What is the percentage copper content of the supplied ash?",
    7.6,
    "%",
    R.ashC.feedback,
    "Retained copper divided by ash mass.",
    "ashC",
  ),
  choice(
    "r-iron",
    "Recover copper from solution",
    "What happens to copper(II) ions when the supplied scrap iron is added?",
    "They gain electrons and become copper metal",
    {
      "They lose electrons to become metal":
        "Copper-ion reduction is electron gain.",
      "They all vanish": "Copper atoms are conserved.",
    },
    R.iron.feedback,
    "Use iron's greater reactivity.",
    "iron",
  ),
  choice(
    "r-silver",
    "Check feasibility",
    "Does the supplied silver addition produce copper metal by displacement?",
    "No; copper ions remain dissolved",
    {
      "Yes because any metal addition works": "Relative reactivity matters.",
      "Yes because silver creates new copper": "No copper atoms are created.",
    },
    R.silver.feedback,
    "Use Fe>Cu>Ag.",
    "silver",
  ),
  choice(
    "r-cell",
    "Recover electrically",
    "Where does the supplied cell form copper metal?",
    "At the negative electrode by electron gain",
    {
      "At the negative electrode by electron loss":
        "The copper ion gains electrons.",
      "By ordinary filtration alone":
        "Filtration does not reduce dissolved copper ions.",
    },
    R.cell.feedback,
    "Cu²⁺+2e⁻→Cu.",
    "cell",
  ),
  choice(
    "r-filter",
    "Separate grit from ions",
    "Does ordinary filtration of this leachate complete copper-metal recovery?",
    "No; dissolved copper compounds pass through",
    {
      "Yes; all dissolved ions become metal":
        "No reduction mechanism is provided.",
      "Yes; only copper atoms are removed by a screen":
        "Ordinary filtering does not select dissolved copper ions this way.",
    },
    R.filter.feedback,
    "Separate physical retention from reduction.",
    "filter",
  ),
  num(
    "r-matched",
    "Use equal copper output",
    "Find route A's energy per kilogram of recovered copper.",
    15,
    "kWh/kg Cu",
    R.matched.feedback,
    "Divide by recovered copper output.",
    "matched",
  ),
  num(
    "r-reversed",
    "Avoid a total-energy trap",
    "Find route A's energy per kilogram of recovered copper.",
    30,
    "kWh/kg Cu",
    R.reversed.feedback,
    "A lower total can also have a smaller output.",
    "reversed",
  ),
  num(
    "r-deadline",
    "Include supplied constraints",
    "Find route B's energy per kilogram of copper, then explain its deadline advantage using the model.",
    20,
    "kWh/kg Cu",
    R.deadline.feedback,
    "Energy is not the only supplied requirement.",
    "deadline",
  ),
];
const guided = [
  choice(
    "g-pathway",
    "Phytomining",
    "Burn the plants. What remains?",
    "Ash containing copper compounds",
    {
      "Pure copper metal":
        "Ash still needs acid dissolution and final recovery.",
      "No copper atoms":
        "The supplied plants contain existing copper compounds.",
    },
    R.plants.feedback,
    "Follow chemical form, not just copper's name.",
    "plants",
  ),
  num(
    "g-grade",
    "Grade and recovery",
    "Construct the original copper inventory and product. How much copper metal is recovered?",
    4.2,
    "kg",
    R.oreA.feedback,
    "750×0.008, then×0.7.",
    "oreA",
  ),
  num(
    "g-ash",
    "Copper in the ash",
    "Construct the retained copper and ash content. What percentage of this ash's mass is copper content?",
    10,
    "%",
    R.ashA.feedback,
    "Use ash mass as the whole.",
    "ashA",
  ),
  choice(
    "g-recovery",
    "Recover copper metal",
    "Construct the supplied scrap-iron recovery. Which copper-ion change occurs?",
    "Electron gain: reduction to copper metal",
    {
      "Electron loss: oxidation to copper metal":
        "Reduction of a positive copper ion requires electron gain.",
      "Physical filtering makes ions into metal":
        "That does not provide the reduction.",
    },
    R.iron.feedback,
    "Follow Cu²⁺ to Cu; inspect the optional supplied 3D event.",
    "iron",
  ),
  num(
    "g-compare",
    "Compare the same service",
    "Construct both energy rates. What is route A's energy per kilogram of recovered copper?",
    15,
    "kWh/kg Cu",
    R.matched.feedback,
    "Use recovered metal output, not ore mass.",
    "matched",
  ),
];
const gradePractice: BioGiven = {
  title: "Independent low-grade source",
  note: "Original ideal copper-content balance; no extra copper input. The unrecovered copper stays in other streams.",
  rows: [],
  grade: { mass: 900, percent: 0.6, recovery: 75 },
};
const oxidePractice: BioGiven = {
  title: "Independent pure compound",
  note: "Cu₂O only; Ar(Cu)=64, Ar(O)=16. Stated copper recovery 80%; no added copper. Copper outside product remains in other streams.",
  rows: [
    {
      label: "Feed",
      text: "3.6 kg pure Cu₂O. Each formula unit contains two Cu and one O.",
    },
  ],
};
const ashPractice: BioGiven = {
  title: "Independent plant/ash inventory",
  note: "Original data: copper content means Cu atoms in compounds;90% remains in ash. Other copper is captured outside the ash.",
  rows: [],
  ash: { biomass: 600, copper: 1.8, ash: 20, retained: 90 },
};
const comparisonPractice: BioGiven = {
  title: "Independent matched-quality routes",
  note: "Original totals for the same stated boundary, including final recovery. Compare energy per kg of equal-quality copper.",
  rows: [],
  comparison: {
    aEnergy: 144,
    aCopper: 8,
    bEnergy: 240,
    bCopper: 10,
    requirement: "Lower energy per kg recovered copper.",
  },
};
const practice = [
  write(
    "p-phyto",
    "Explain the complete plant route",
    "Describe phytomining from copper-containing land to recovered copper metal. Name the chemical form before the final recovery step.",
    "Plants grow on copper-containing land and absorb copper compounds. Harvest and burn the plants to produce ash containing copper compounds. Dissolve suitable compounds from the ash in acid to make a copper-compound solution, then recover copper by electrolysis or displacement using scrap iron. The ash and solution are not already pure copper metal.",
    [
      "Plant growth and uptake of copper compounds.",
      "Harvest/burn produces compound-containing ash.",
      "Acid dissolution produces a copper-compound solution.",
      "Electrolysis or scrap-iron displacement recovers copper metal.",
    ],
    "Include the solution stage, not just burning.",
  ),
  write(
    "p-bio",
    "Explain bacterial leaching",
    "Describe bioleaching and explain why collecting the leachate is not the final copper-metal recovery.",
    "Bacteria produce a leachate solution containing copper compounds from the low-grade source. Copper remains in dissolved compounds; an appropriate displacement using scrap iron or electrolysis stage is required to recover copper metal.",
    [
      "Use bacteria.",
      "Produce a leachate solution of copper compounds.",
      "Separate leachate production from final copper-metal recovery.",
    ],
    "Track dissolved compounds versus metal.",
  ),
  choice(
    "p-ashForm",
    "Classify plant ash",
    "Harvested plants have been burned in a phytomining route. Which description is justified?",
    "Ash containing copper compounds",
    {
      "Pure copper metal because it contains copper":
        "The element is present in compounds.",
      "No copper because all atoms burned away":
        "Burning does not destroy copper atoms.",
    },
    "Burning prepares ash containing compounds; further processing recovers copper metal.",
    "Track chemical form.",
  ),
  choice(
    "p-acid",
    "Explain acid dissolution",
    "Why dissolve suitable copper compounds from the ash in acid?",
    "Produce a solution containing copper compounds for final metal recovery",
    {
      "Make every copper compound physically disappear":
        "Copper atoms remain in new chemical forms.",
      "Guarantee pure metal without another stage":
        "A copper-compound solution is not pure metal.",
    },
    "The solution is an intermediate for displacement or electrolysis.",
    "Distinguish dissolving from reduction.",
  ),
  choice(
    "p-ionRecovery",
    "Choose a recovery route",
    "A leachate contains dissolved copper compounds. Which supplied process can recover copper metal?",
    "Scrap-iron displacement or suitable electrolysis",
    {
      "Ordinary filtering or evaporating alone":
        "Neither by itself reduces copper ions to metal.",
      "Growing plants with no copper source":
        "Plants cannot create copper atoms.",
    },
    "An appropriate chemical/electrochemical reduction is needed to obtain metal from the solution.",
    "Ask how copper ions gain electrons.",
  ),
  build(
    "p-grade",
    "Construct an independent source balance",
    "Calculate copper content before recovery, final metal and copper outside the metal product.",
    [
      ["available", "Original copper content / kg", 5.4],
      ["recovered", "Final copper metal / kg", 4.05],
      ["other", "Copper outside metal product / kg", 1.35],
    ],
    gradePractice,
    "900×0.006=5.4 kg;5.4×0.75=4.05 kg metal;5.4−4.05=1.35 kg elsewhere.",
    "Apply recovery to copper content, not all 900 kg ore.",
  ),
  num(
    "p-oreNeeded",
    "Work backwards from output",
    "An original ideal route recovers 80% of copper in ore with 0.5% copper content. How much ore is needed to obtain 6 kg copper metal?",
    1500,
    "kg ore",
    "Recovered metal=ore mass×0.005×0.8.6÷0.004=1500 kg ore.",
    "Combine grade and recovery before dividing.",
  ),
  {
    ...num(
      "p-compoundPercent",
      "Calculate copper in a compound",
      "Cu₂O has Ar(Cu)=64, Ar(O)=16. Find its percentage copper by mass to 3 significant figures.",
      88.9,
      "%",
      "Copper contribution 128;Mr 144.128/144×100=88.888…%, to 3 significant figures 88.9%.",
      "Two Cu atoms contribute to the numerator and complete formula mass to the denominator.",
    ),
    rounding: { kind: "significant-figures" as const, digits: 3 },
  },
  build(
    "p-compoundYield",
    "Transfer compound content to product",
    "Calculate original copper content, recovered copper metal and copper remaining in other streams.",
    [
      ["available", "Copper content in the compound / kg", 3.2],
      ["recovered", "Recovered copper metal / kg", 2.56],
      ["other", "Copper outside metal product / kg", 0.64],
    ],
    oxidePractice,
    "Cu₂O copper fraction 128/144=8/9.3.6×8/9=3.2 kg copper content;80%=2.56 kg metal;0.64 kg elsewhere.",
    "Use the unrounded fraction before applying recovery.",
  ),
  build(
    "p-ashInventory",
    "Construct an independent ash inventory",
    "Calculate copper retained in ash, copper outside this ash and ash copper content by mass.",
    [
      ["retained", "Copper retained in ash / kg", 1.62],
      ["outside", "Copper outside this ash / kg", 0.18],
      ["percent", "Ash copper content / %", 8.1],
    ],
    ashPractice,
    "1.8×0.9=1.62 kg in ash;0.18 kg elsewhere;1.62/20×100=8.1%.",
    "Use retention first, then ash mass as the percentage whole.",
  ),
  write(
    "p-noCreation",
    "Explain concentration without atom creation",
    "Dry biomass of 300 kg contains 0.6 kg copper content; its 12 kg ash retains all 0.6 kg copper content. Explain the higher ash copper percentage without claiming that plants created copper or all other atoms vanished.",
    "Copper content is unchanged at 0.6 kg. The biomass had 0.6/300×100=0.2% copper content; ash has 0.6/12×100=5%. The smaller total mass concentrates the copper compounds. Burning changes other material into products and involves oxygen; atoms do not vanish and ash is not pure copper metal.",
    [
      "Copper content remains 0.6 kg.",
      "Smaller whole raises content from 0.2% to 5%.",
      "Copper is in compounds; burning changes matter rather than destroying atoms.",
    ],
    "Compare the same copper mass with different wholes.",
  ),
  num(
    "p-enrichment",
    "Distinguish amount and concentration",
    "Copper content rises from 0.2% in biomass to 5% in ash with the same copper mass. By what factor has the percentage content increased?",
    25,
    "",
    "5/0.2=25. This is a concentration factor, not 25 times as many copper atoms.",
    "Divide final content percentage by original content percentage.",
  ),
  write(
    "p-iron",
    "Explain scrap-iron recovery",
    "Given Fe>Cu>Ag, explain how scrap iron recovers copper from copper(II) sulfate solution. Identify electron changes and the sulfate spectator.",
    "Iron is more reactive than copper and displaces it: Fe(s)+Cu²⁺(aq)→Fe²⁺(aq)+Cu(s). Copper ions gain two electrons and are reduced to copper metal; iron loses two electrons and is oxidised. Sulfate ions remain dissolved as spectators, rather than becoming copper metal.",
    [
      "Use iron's greater reactivity.",
      "Cu²⁺ gains electrons to form Cu metal.",
      "Iron loses electrons to form Fe²⁺.",
      "Sulfate remains a spectator ion.",
    ],
    "Match element identity, phase and charge before and after.",
  ),
  choice(
    "p-silver",
    "Reject an infeasible displacement",
    "Given Fe>Cu>Ag, silver is added to copper(II) sulfate solution without current. What happens to the dissolved copper?",
    "Copper ions remain; silver cannot displace copper",
    {
      "Copper metal forms because all metals work": "Silver is less reactive.",
      "Copper atoms disappear": "No such atom destruction occurs.",
    },
    "Relative reactivity controls this supplied displacement.",
    "Compare silver with copper.",
  ),
  choice(
    "p-cathode",
    "Explain electrode recovery",
    "In the supplied aqueous copper-ion electrolysis with inert electrodes, how does the negative electrode recover copper?",
    "Cu²⁺ gains electrons to become Cu metal",
    {
      "Cu²⁺ loses electrons to become Cu metal":
        "The positive ion needs electron gain.",
      "The filter screen creates copper atoms":
        "No filtering process creates atoms.",
    },
    "Cu²⁺+2e⁻→Cu is reduction at the negative electrode.",
    "Electrons are supplied to the cation.",
  ),
  choice(
    "p-filter",
    "Distinguish separation and reduction",
    "Ordinary filtration removes grit from copper-compound leachate. Does that alone form copper metal?",
    "No; dissolved copper compounds still require recovery",
    {
      "Yes because all clear liquid is pure copper":
        "Clarity does not change ions into metal.",
      "Yes because grit and copper ions are the same":
        "Dissolved ions differ from suspended grit.",
    },
    "Filtration is physical solid/liquid separation; final metal recovery needs reduction.",
    "Ask whether electrons were transferred.",
  ),
  build(
    "p-compare",
    "Construct an equal-output comparison",
    "Calculate each route's energy per kg recovered copper, then B−A in the same units.",
    [
      ["a", "A energy / kWh per kg Cu", 18],
      ["b", "B energy / kWh per kg Cu", 24],
      ["difference", "B minus A / kWh per kg Cu", 6],
    ],
    comparisonPractice,
    "144/8=18;240/10=24;B−A=6 kWh/kg Cu. A is lower within this supplied boundary only.",
    "Use actual recovered copper for each denominator.",
  ),
  write(
    "p-evaluate",
    "Evaluate a constrained choice",
    "Original supplied routes give equal-quality copper. A needs 4 hectares and 20 kWh/kg; B needs 1 hectare and 25 kWh/kg. Only 2 hectares are available. Recommend a route, then explain why this is not a universal biological-method verdict.",
    "B meets the land constraint because 1≤2 hectares; A needs 4>2. A's lower 20 kWh/kg cannot overcome its failure of a required constraint. Other boundaries, source grade, recovery, time, available land and pollution evidence may change a comparison. Biological methods avoid some traditional rock movement, but still have impacts and final recovery needs.",
    [
      "Recommend B using the supplied land constraint.",
      "Explain why lower energy alone does not settle this case.",
      "Limit the conclusion to the supplied service/data; identify further relevant evidence.",
    ],
    "Meet required constraints before ranking a secondary metric.",
  ),
  choice(
    "p-adoption",
    "Explain limited adoption",
    "Which pair can plausibly limit phytomining under supplied local conditions?",
    "Insufficient suitable land and a long production time",
    {
      "Copper atoms can never be in compounds":
        "They are already in the source compounds.",
      "Plants guarantee unlimited instant copper":
        "Growth and finite copper availability impose limits.",
    },
    "Land, time, existing high-grade sources and technology can affect adoption; use appropriate case information.",
    "Biological does not mean instantly available.",
  ),
  write(
    "p-recycle",
    "Explain a recycling alternative",
    "Describe recovering copper from insulated scrap wire into a new copper object, then give two resource/environment reasons it can be preferable to extracting new copper from ore.",
    "Remove the insulation to avoid contaminating the copper and because it needs different processing. Melt and reform/cast the copper into the new object. This conserves finite copper ores and can require less energy than primary extraction; it can also reduce mining impacts and waste. Collection and processing still have impacts, so recycling is not zero-energy.",
    [
      "Separate insulation to avoid contamination/different processing.",
      "Melt and reform the existing copper.",
      "Explain two distinct finite-resource/energy/mining/waste benefits.",
      "Avoid claiming zero energy or unlimited material.",
    ],
    "Existing copper is remelted rather than newly reduced from ore.",
  ),
  num(
    "p-scrap",
    "Separate scrap contents and recovery",
    "Original data:80 kg insulated scrap contains 20 kg insulation and 60 kg copper metal. After insulation removal,90% of the copper enters the new metal product; other copper remains in non-product streams. Find product copper mass.",
    54,
    "kg",
    "The recoverable copper input is 60 kg, not 80 kg scrap;0.9×60=54 kg product copper.",
    "Apply recovery to the copper portion.",
  ),
  choice(
    "p-zero",
    "Reject a zero-impact claim",
    "Which evaluation is supported by avoiding some traditional digging and movement of large amounts of rock?",
    "Some mining impacts may be reduced; other impacts need evidence",
    {
      "All land, energy and pollution needs disappear":
        "Those claims require evidence and generally do not follow.",
      "Finite copper ores become unlimited":
        "Copper atoms are not created by these methods.",
    },
    "Evaluate supplied energy, land, rate, recovery and pollution evidence, including final processing.",
    "A benefit is not proof that every impact is zero.",
  ),
];
const checkForms = [
  [
    choice(
      "cA-bio",
      "Describe bacterial output",
      "What is the direct output described by copper bioleaching?",
      "Leachate solution containing copper compounds",
      {
        "Guaranteed pure copper metal": "Final recovery is still needed.",
        "Copper created without a source": "The source supplies copper.",
      },
      "Bacteria produce a solution containing compounds; subsequent recovery produces metal.",
      "Distinguish intermediate and product.",
    ),
    build(
      "cA-grade",
      "Close a reserved source balance",
      "Construct original copper content, recovered metal and copper outside product.",
      [
        ["available", "Original copper content / kg", 10],
        ["metal", "Recovered copper metal / kg", 6],
        ["other", "Copper outside product / kg", 4],
      ],
      {
        title: "Reserved ore data",
        note: "Original ideal source balance; no copper input from elsewhere; other copper retained in non-product streams.",
        rows: [],
        grade: { mass: 2000, percent: 0.5, recovery: 60 },
      },
      "2000×0.005=10;60% gives 6 kg metal,4 kg elsewhere.",
      "Apply two different percentages in order.",
    ),
    build(
      "cA-ash",
      "Close a reserved ash balance",
      "Calculate retained copper, copper outside ash and ash content percentage.",
      [
        ["retained", "Copper retained in ash / kg", 1.5],
        ["other", "Copper outside this ash / kg", 0],
        ["percent", "Ash copper content / %", 6],
      ],
      {
        title: "Reserved biomass/ash",
        note: "Complete copper retention in this stated case; copper remains in compounds.",
        rows: [],
        ash: { biomass: 700, copper: 1.5, ash: 25, retained: 100 },
      },
      "Retained 1.5 kg; none outside;1.5/25×100=6%.",
      "Use ash mass as the percentage whole.",
    ),
    num(
      "cA-rate",
      "Compare equal output",
      "An original matched-boundary route uses 168 kWh and recovers 12 kg copper. Find energy per kg copper.",
      14,
      "kWh/kg Cu",
      "168/12=14 kWh/kg Cu.",
      "Divide by recovered output.",
    ),
    write(
      "cA-phyto",
      "Describe plant extraction",
      "Describe a complete phytomining route to copper metal, including the solution-producing step and final recovery.",
      "Plants absorb copper compounds from copper-containing land. Harvest and burn the plants to give ash with copper compounds. Dissolve suitable compounds from the ash in acid, then use scrap-iron displacement or electrolysis of the copper-compound solution to recover copper metal.",
      [
        "Plant uptake of copper compounds.",
        "Harvest/burn to compound-containing ash.",
        "Acid dissolution into a copper-compound solution.",
        "Scrap-iron displacement or electrolysis to metal.",
      ],
      "Do not stop at ash.",
    ),
    choice(
      "cA-finite",
      "Use finite resources",
      "Why can recovering existing scrap copper conserve resources?",
      "It reduces demand for new extraction from finite copper ores",
      {
        "It creates new copper atoms": "Atoms are reused, not created.",
        "It guarantees no energy input":
          "Melting and other processing still need energy.",
      },
      "Recycling can reduce primary extraction demand while still having processing impacts.",
      "Track reuse versus creation.",
    ),
  ],
  [
    choice(
      "cB-reduction",
      "Explain electrical recovery",
      "Copper(II) ions form copper at the negative electrode. What occurs?",
      "Copper ions gain electrons and are reduced",
      {
        "They lose electrons and are reduced": "Reduction is electron gain.",
        "They are simply filtered as grit":
          "Dissolved ions require the electrochemical step.",
      },
      "Cu²⁺+2e⁻→Cu.",
      "Match charge and electrons.",
    ),
    build(
      "cB-grade",
      "Close another reserved source balance",
      "Construct initial copper content, metal product and non-product copper.",
      [
        ["available", "Original copper content / kg", 4.5],
        ["metal", "Recovered copper metal / kg", 3.6],
        ["other", "Copper outside product / kg", 0.9],
      ],
      {
        title: "Second reserved ore balance",
        note: "No added copper; non-product copper remains in other streams.",
        rows: [],
        grade: { mass: 600, percent: 0.75, recovery: 80 },
      },
      "600×0.0075=4.5;80% gives 3.6 kg metal;0.9 kg elsewhere.",
      "Keep grade separate from recovery.",
    ),
    build(
      "cB-ash",
      "Use reserved retention data",
      "Construct copper retained, copper outside ash and ash percentage.",
      [
        ["retained", "Copper retained in ash / kg", 2.4],
        ["other", "Copper outside this ash / kg", 0.6],
        ["percent", "Ash copper content / %", 8],
      ],
      {
        title: "Second reserved ash record",
        note: "80% copper retention; other copper collected outside this ash. Ash contains compounds.",
        rows: [],
        ash: { biomass: 900, copper: 3, ash: 30, retained: 80 },
      },
      "80% of 3=2.4 kg;0.6 kg elsewhere;2.4/30×100=8%.",
      "Do not assume 100% retention.",
    ),
    num(
      "cB-rate",
      "Use a second recovered output",
      "An original supplied route uses 162 kWh for 9 kg recovered copper. Find energy per kg.",
      18,
      "kWh/kg Cu",
      "162/9=18 kWh/kg Cu.",
      "Use recovered metal, not feed ore.",
    ),
    write(
      "cB-bio",
      "Explain bacterial recovery",
      "Explain bioleaching and how copper can subsequently be recovered from the collected leachate. Include why ordinary filtering alone is insufficient.",
      "Bacteria produce a leachate solution containing copper compounds. Recover copper metal by suitable electrolysis or displacement with a more reactive metal such as scrap iron. Ordinary filtering removes undissolved solids; dissolved copper compounds pass through and are not reduced to metal by filtration.",
      [
        "Bacteria produce a solution of copper compounds.",
        "Appropriate displacement/electrolysis produces metal.",
        "Distinguish ordinary filtration from reduction of dissolved copper ions.",
      ],
      "Track the chemical form in the liquid.",
    ),
    choice(
      "cB-limit",
      "Evaluate a biological route",
      "A supplied biological route needs less rock movement. Which conclusion follows?",
      "Some mining impacts can be avoided; time, land and final processing still matter",
      {
        "No environmental impacts of any kind":
          "That does not follow from one benefit.",
        "Every copper source becomes unlimited": "Copper ores remain finite.",
      },
      "Use supplied information and relevant constraints rather than a universal green verdict.",
      "Ask which impacts have actually been compared.",
    ),
  ],
];
const reviewForms = [
  [
    choice(
      "vA-ash",
      "Retrieve chemical form",
      "Plant ash in phytomining contains…",
      "Copper compounds requiring further processing",
      {
        "Automatically pure copper metal": "Final recovery is still required.",
        "Newly created copper atoms": "Existing copper has been taken up.",
      },
      "Ash concentrates compounds; acid dissolution and final recovery follow.",
      "Track form, not just copper's presence.",
    ),
    num(
      "vA-grade",
      "Retrieve grade and recovery",
      "An original ideal route processes 400 kg ore with 0.9% copper content and recovers 75% of that copper as metal. Find metal mass.",
      2.7,
      "kg",
      "400×0.009=3.6 kg contained copper;75%=2.7 kg metal.",
      "Use grade, then recovery.",
    ),
    write(
      "vA-constraint",
      "Retrieve conditional evaluation",
      "Explain why a phytomining route with lower supplied energy per kg may still be unsuitable for a particular site.",
      "It may need more suitable land than is available or take longer than the required delivery time. Available high-grade sources, recovery, final-processing impacts and technology may also matter. Lower energy within one boundary does not prove the route is universally best or has zero impacts.",
      [
        "Use a meaningful land/time constraint.",
        "Include a relevant further source/process consideration.",
        "Limit the conclusion to supplied criteria/evidence.",
      ],
      "Required constraints can outweigh one lower impact.",
    ),
  ],
  [
    choice(
      "vB-recovery",
      "Retrieve scrap-iron reduction",
      "Given Fe>Cu, what happens to copper ions when scrap iron displaces copper?",
      "Copper ions gain electrons to become copper metal",
      {
        "Copper ions lose electrons": "Reduction requires gain.",
        "Copper atoms vanish": "Atoms are conserved.",
      },
      "Iron loses electrons; copper ions gain them. Copper changes form.",
      "Track the positive ion's charge.",
    ),
    num(
      "vB-ash",
      "Retrieve a fresh ash proportion",
      "Original data:2 kg copper content;85% stays in 25 kg ash. Find copper percentage in the ash.",
      6.8,
      "%",
      "2×0.85=1.7 kg;1.7/25×100=6.8%.",
      "Use retained copper, not original copper, in the ash percentage.",
    ),
    write(
      "vB-complete",
      "Retrieve the plant-to-metal route",
      "A response says 'grow plants and burn them to make copper'. Explain the missing stages and chemical-form error.",
      "Plants absorb copper compounds; burning harvested plants produces ash containing compounds, not automatically copper metal. Suitable acid dissolution gives a copper-compound solution. Electrolysis or displacement using scrap iron then recovers copper metal.",
      [
        "Ash contains compounds.",
        "Acid dissolution produces a compound solution.",
        "Appropriate displacement/electrolysis recovers metal.",
      ],
      "Do not equate a copper-containing intermediate with elemental metal.",
    ),
  ],
];
const recovery = [
  "r-plants",
  "r-bacteria",
  "r-plants",
  "r-readyAsh",
  "r-iron",
  "r-oreA",
  "r-oreB",
  "r-oxide",
  "r-oxide",
  "r-ashB",
  "r-ashA",
  "r-ashA",
  "r-iron",
  "r-silver",
  "r-cell",
  "r-filter",
  "r-matched",
  "r-deadline",
  "r-deadline",
  "r-reversed",
  "r-oreB",
  "r-matched",
];
export const bioRecoveryRoutes: Record<string, string> = {};
practice.forEach((q, i) => {
  q.followUp = id(recovery[i]);
  bioRecoveryRoutes[q.id] = q.followUp;
});
export const allBioTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const bioExposureFamilies = {
  plants: [
    "r-plants",
    "g-pathway",
    "p-phyto",
    "p-ashForm",
    "cA-phyto",
    "vA-ash",
    "vB-complete",
  ],
  acid: ["r-readyAsh", "p-acid", "p-phyto"],
  bacteria: ["r-bacteria", "p-bio", "cA-bio", "cB-bio"],
  grade: ["r-oreA", "g-grade", "r-oreB", "r-oxide"],
  ash: ["r-ashA", "g-ash", "r-ashB", "r-ashC", "p-noCreation", "p-enrichment"],
  recovery: [
    "r-cell",
    "p-cathode",
    "cB-reduction",
    "r-silver",
    "p-silver",
    "w-reactivity",
    "r-iron",
    "g-recovery",
    "p-ionRecovery",
    "p-iron",
    "vB-recovery",
  ],
  silver: ["r-silver", "p-silver"],
  cell: ["r-cell", "p-cathode", "cB-reduction"],
  filter: ["r-filter", "p-filter", "cB-bio"],
  comparison: [
    "r-matched",
    "g-compare",
    "r-reversed",
    "r-deadline",
    "p-adoption",
    "p-zero",
    "cB-limit",
    "vA-constraint",
  ],
  recycle: ["p-recycle", "cA-finite"],
};
const groups = Object.values(bioExposureFamilies).map((fs) => new Set(fs));
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
for (const group of groups)
  for (const s of group) {
    const q = allBioTasks.find((q) => q.id === id(s));
    if (!q) throw Error("Unknown bio-extraction exposure task " + s);
    q.exposureAliases = [...group].filter((o) => o !== s).map(id);
  }
export const bioJourney: LessonJourney = {
  version: 1,
  introduction:
    "Follow copper through low-grade biological extraction, chemical intermediates and final metal recovery; evaluate supplied routes.",
  scopeNote:
    "Higher tier: AQA Chemistry 8462 4.10.1.4 and Trilogy 8464 5.10.1.4. Core extraction/redox are prerequisites; original grade, retention, recovery and comparison data apply earlier quantitative skills. Written responses are manually reviewed. No required-practical or whole-course examination competence is established.",
  outcomes: [
    "Describe plant uptake, harvest/burn, acid dissolution and final copper recovery.",
    "Describe bacterial leachate production and distinguish dissolved compounds from copper metal.",
    "Calculate copper content, recovery and non-product copper from stated grades or compound formulas.",
    "Account for copper retained/lost from ash and explain concentration without creating atoms.",
    "Explain scrap-iron displacement, an infeasible silver addition and negative-electrode copper reduction using the supplied 3D/text reaction.",
    "Compare equal-quality recovered copper within supplied energy boundaries, land/time constraints and finite-resource/recycling evidence.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Biological routes and chemical intermediates",
      taskIds: practice.slice(0, 5).map((q) => q.id),
    },
    {
      label: "Copper grades and ash inventories",
      taskIds: practice.slice(5, 12).map((q) => q.id),
    },
    {
      label: "Final metal recovery",
      taskIds: practice.slice(12, 16).map((q) => q.id),
    },
    {
      label: "Route evidence and existing metal resources",
      taskIds: practice.slice(16).map((q) => q.id),
    },
  ],
};
