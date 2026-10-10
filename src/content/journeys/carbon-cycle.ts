import type { LearningTask, LessonJourney } from "../types";
import {
  cycleRecords as R,
  type CycleGiven,
  type CycleLedger,
} from "../../lib/cycle";
const id = (s: string) => "cycle-v1-" + s;
function model(record?: string) {
  return record
    ? {
        model: {
          kind: "carbon-cycle-investigation" as const,
          mode: R[record].mode,
          record,
        },
      }
    : {};
}
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  given?: CycleGiven,
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
    ...model(record),
    ...(given ? { cycleGiven: given } : {}),
  };
}
function numeric(
  s: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  record?: string,
  given?: CycleGiven,
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
    ...model(record),
    ...(given ? { cycleGiven: given } : {}),
  };
}
function written(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  given?: CycleGiven,
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
    ...(given ? { cycleGiven: given } : {}),
  };
}
function construct(
  s: string,
  title: string,
  prompt: string,
  refs: readonly (readonly [string, string, number])[],
  given: CycleGiven,
  explanation: string,
  hint: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: JSON.stringify(
      Object.fromEntries(refs.map(([f, , n]) => [f, String(n)])),
    ),
    parts: refs.map(([f, label, n]) => ({
      id: f,
      label,
      answer: n,
      inputMode: "decimal",
    })),
    partLegend: "Construct your carbon values",
    cycleGiven: given,
    explanation,
    hint,
  };
}
const inventory = (
  store: string,
  start: number,
  ins: readonly (readonly [string, number])[],
  outs: readonly (readonly [string, number])[],
): CycleLedger => ({
  store,
  start,
  unit: "g of carbon",
  interval: "one stated interval",
  inflows: ins.map(([label, amount]) => ({ label, amount })),
  outflows: outs.map(([label, amount]) => ({ label, amount })),
});
const ledgerGiven = (title: string, d: CycleLedger): CycleGiven => ({
  title,
  note: "Original small-system exercise. Every mass is carbon alone, not whole CO₂. All listed transfers occur over the same stated interval.",
  ledger: d,
});
const originalSeries: CycleGiven = {
  title: "Original concentration series",
  note: "Invented teaching data in arbitrary units; not measured global CO₂ or a forecast.",
  series: {
    unit: "arbitrary units",
    min: 190,
    max: 218,
    points: [
      { label: "Y1 summer", value: 200 },
      { label: "Y1 winter", value: 212 },
      { label: "Y2 summer", value: 202 },
      { label: "Y2 winter", value: 214 },
      { label: "Y3 summer", value: 204 },
      { label: "Y3 winter", value: 216 },
    ],
  },
};
const warmup = [
  choice(
    "w-carbon",
    "Identify carbon compounds",
    "Which molecule contains carbon?",
    "CO₂",
    {
      "O₂": "O₂ contains oxygen only.",
      "H₂O": "Water contains hydrogen and oxygen.",
    },
    "CO₂ contains one carbon atom and two oxygen atoms.",
    "Read every element symbol.",
  ),
  numeric(
    "w-net",
    "Calculate a signed difference",
    "A store receives 8 g of carbon and loses 11 g in one interval. What is its signed change?",
    -3,
    "g of carbon",
    "8−11=−3 g of carbon; a negative net means the store loses carbon.",
    "Entering minus leaving.",
  ),
  choice(
    "w-plant",
    "Recall living plant cells",
    "Which process can occur in a plant in darkness?",
    "Respiration",
    {
      "Photosynthesis without any light":
        "Photosynthesis requires light energy.",
      "Neither process ever occurs":
        "Living plant cells need energy in darkness too.",
    },
    "Plant respiration continues in light and darkness.",
    "Separate the processes.",
  ),
  numeric(
    "w-atoms",
    "Count glucose carbon",
    "How many carbon atoms occur in one C₆H₁₂O₆ molecule?",
    6,
    "carbon atoms",
    "The carbon subscript is 6.",
    "Use the subscript after C.",
  ),
];
const refresher = [
  choice(
    "r-photo",
    "Carbon enters a plant",
    "Which transfer follows photosynthesis?",
    "Atmospheric CO₂ → plant organic carbon",
    {
      "Plant carbon → atmospheric oxygen": "O₂ contains no carbon.",
      "Soil mineral ions → all glucose carbon":
        "Plants obtain glucose carbon from CO₂.",
    },
    R.photosynthesis.feedback,
    "Locate the carbon source.",
    "photosynthesis",
  ),
  choice(
    "r-feed",
    "Carbon moves through food",
    "Which process transfers food carbon from plants to a herbivore?",
    "Feeding",
    {
      "Photosynthesis by the animal":
        "Animals do not make food by photosynthesis.",
      "Carbon destruction": "Carbon atoms are transferred, not destroyed.",
    },
    R.feeding.feedback,
    "Follow the eaten organic molecules.",
    "feeding",
  ),
  choice(
    "r-plantResp",
    "Plants return some carbon",
    "A plant uses oxygen to release energy from organic compounds. Which gas carries some carbon away?",
    "CO₂",
    {
      "O₂": "O₂ contains no carbon.",
      "H₂O only": "Water cannot carry carbon atoms.",
    },
    R.plantResp.feedback,
    "Identify aerobic respiration products.",
    "plantResp",
  ),
  choice(
    "r-animalResp",
    "Animals return some carbon",
    "Which supplied process returns animal food carbon to atmospheric CO₂?",
    "Aerobic respiration",
    {
      "Anaerobic muscle respiration makes identical CO₂ products":
        "Muscle anaerobic respiration produces lactic acid.",
      Photosynthesis: "Animals do not photosynthesise.",
    },
    R.animalResp.feedback,
    "Use the stated oxygen condition.",
    "animalResp",
  ),
  choice(
    "r-decay",
    "Microorganisms link the stores",
    "Why can aerobic decay return carbon to the air?",
    "Microorganisms respire digested organic compounds",
    {
      "All carbon becomes mineral ions taken up by roots":
        "CO₂ is a separate carbon source for photosynthesis.",
      "Dead material releases oxygen containing carbon":
        "Oxygen gas contains no carbon.",
    },
    R.decay.feedback,
    "Link digestion, respiration and CO₂.",
    "decay",
  ),
  choice(
    "r-burial",
    "Preserve ancient organic carbon",
    "Which statement fits fossil-fuel formation?",
    "Some organic matter is preserved and altered over geological time",
    {
      "Every dead organism instantly becomes fuel":
        "Most material decomposes; fuel formation is not instant.",
      "New carbon elements are created underground":
        "Existing carbon is stored in altered compounds.",
    },
    R.burial.feedback,
    "Consider decay conditions and timescale.",
    "burial",
  ),
  choice(
    "r-burn",
    "Release fossil carbon quickly",
    "What does complete fossil-fuel combustion do to carbon?",
    "Transfers stored carbon into CO₂",
    {
      "Creates new carbon atoms": "Element identities are conserved.",
      "Returns all fuel carbon underground":
        "The supplied complete burn releases gaseous CO₂.",
    },
    R.burning.feedback,
    "Compare the start and destination stores.",
    "burning",
  ),
  choice(
    "r-ocean",
    "Ocean exchange has two directions",
    "Does CO₂ dissolution prove every carbon atom remains in the ocean permanently?",
    "No; outward exchange can also occur",
    {
      "Yes; dissolution destroys carbon": "Carbon remains in dissolved forms.",
      "No carbon enters water": "CO₂ can dissolve and react in ocean water.",
    },
    R.dissolution.feedback,
    "Distinguish a transfer from permanent storage.",
    "dissolution",
  ),
  choice(
    "r-carbonate",
    "Store carbon in sediments",
    "Which store can gain carbon when marine carbonates accumulate?",
    "Carbonate sediment and rock",
    {
      "Only atmospheric oxygen": "O₂ has no carbon.",
      "No store because carbon disappears":
        "Carbon remains in carbonate material.",
    },
    R.precipitation.feedback,
    "Locate carbonate carbon.",
    "precipitation",
  ),
  numeric(
    "r-atmosphere",
    "Inventory one atmosphere",
    "Find the final carbon store in the supplied model.",
    107,
    "g of carbon",
    R.atmosphere.feedback,
    "Add entering, subtract leaving.",
    "atmosphere",
  ),
  numeric(
    "r-day",
    "Compare simultaneous plant flows",
    "Find the signed plant-carbon change in the supplied daylight interval.",
    2,
    "g of carbon",
    R.day.feedback,
    "Include every listed loss, not respiration alone.",
    "day",
  ),
  numeric(
    "r-night",
    "Keep night respiration active",
    "Find the final carbon store in the supplied dark interval.",
    44,
    "g of carbon",
    R.night.feedback,
    "Start at 50 g and include the supplied loss.",
    "night",
  ),
  numeric(
    "r-sink",
    "Read a two-way net sink",
    "What is the signed change in this supplied ocean store?",
    3,
    "g of carbon",
    R.oceanSink.feedback,
    "Both directions count.",
    "oceanSink",
  ),
  numeric(
    "r-source",
    "Read a two-way net source",
    "What is the signed change in this different supplied ocean store?",
    -3,
    "g of carbon",
    R.oceanSource.feedback,
    "Entering minus leaving.",
    "oceanSource",
  ),
  numeric(
    "r-balanced",
    "Recognise dynamic balance",
    "What is the final carbon store when the supplied totals balance?",
    120,
    "g of carbon",
    R.balanced.feedback,
    "Equal total flows give zero net change.",
    "balanced",
  ),
  choice(
    "r-bioAtom",
    "Follow a conserved carbon atom",
    "A carbon atom enters glucose then returns in CO₂. What is conserved?",
    "Its carbon identity",
    {
      "Its original molecule never changes":
        "Chemical reactions change molecular partners.",
      "It becomes oxygen gas":
        "A carbon atom does not become oxygen in these reactions.",
    },
    R.biologicalAtom.feedback,
    "Separate atom identity from compound identity.",
    "biologicalAtom",
  ),
  choice(
    "r-rockAtom",
    "Follow carbonate carbon",
    "What gas contains the carbon after the specified carbonate–acid reaction?",
    "CO₂",
    {
      "O₂": "O₂ contains no carbon.",
      "H₂O only": "Water cannot contain the traced carbon.",
    },
    R.carbonateAtom.feedback,
    "Use the supplied acid reaction, not every natural weathering process.",
    "carbonateAtom",
  ),
  choice(
    "r-fuelAtom",
    "Follow methane carbon",
    "What carbon-containing gas forms when the supplied methane is completely burned?",
    "CO₂",
    {
      "O₂": "O₂ is a reactant and contains no carbon.",
      "Carbon-free water contains the carbon": "Water contains no carbon.",
    },
    R.fuelAtom.feedback,
    "Follow C through changing compounds.",
    "fuelAtom",
  ),
  choice(
    "r-coal",
    "Explain a coal timescale",
    "What chiefly supplied the original organic carbon in coal?",
    "Ancient plant material",
    {
      "Oxygen gas only": "O₂ supplies no carbon.",
      "Every present leaf instantly":
        "Coal formation requires geological processes and time.",
    },
    R.coal.feedback,
    "Distinguish ancient source and modern combustion.",
    "coal",
  ),
  choice(
    "r-oil",
    "Explain oil and gas origins",
    "What chiefly supplied much oil/gas organic material?",
    "Ancient marine microorganisms",
    {
      "Only oxygen gas": "O₂ contains no carbon.",
      "Modern leaves instantly become oil": "Geological formation is slow.",
    },
    R.oilGas.feedback,
    "Consider organisms buried in marine sediments.",
    "oilGas",
  ),
  choice(
    "r-limestone",
    "Explain carbonate storage",
    "Which statement is justified for limestone?",
    "It stores carbonate carbon; a supplied acid reaction can release CO₂",
    {
      "Its carbon can never react":
        "Long storage does not mean no chemical reaction is possible.",
      "It is all modern glucose": "Limestone is chiefly carbonate rock.",
    },
    R.limestone.feedback,
    "Read the stated chemical pathway.",
    "limestone",
  ),
  numeric(
    "r-forest",
    "Account for two forest effects",
    "Find the signed atmospheric gain after the supplied forest change.",
    24,
    "g of carbon",
    R.deforestation.feedback,
    "Combine returns and uptake in the after budget.",
    "deforestation",
  ),
  numeric(
    "r-fossilChange",
    "Add a geological carbon input",
    "Find the signed atmospheric gain after the additional fossil burn.",
    9,
    "g of carbon",
    R.fossilChange.feedback,
    "Compare before and after net flows.",
    "fossilChange",
  ),
  numeric(
    "r-regrowth",
    "Do not assume a complete offset",
    "Find the atmospheric gain after the greater supplied tree uptake.",
    4,
    "g of carbon",
    R.regrowth.feedback,
    "A smaller gain can still be positive.",
    "regrowth",
  ),
  numeric(
    "r-season",
    "Read endpoints and seasons",
    "Find the signed endpoint concentration change.",
    10,
    "arbitrary units",
    R.seasonal.feedback,
    "Last point minus first point.",
    "seasonal",
  ),
  numeric(
    "r-seasonDown",
    "Separate pattern and direction",
    "Find the signed endpoint change in the different supplied series.",
    -2,
    "arbitrary units",
    R.seasonalDown.feedback,
    "A winter peak can coexist with a longer decrease.",
    "seasonalDown",
  ),
];
const guided = [
  choice(
    "g-route",
    "Follow leaf carbon",
    "Where does CO₂ carbon go?",
    "From atmospheric CO₂ into plant organic molecules",
    {
      "From oxygen into carbon": "Oxygen does not turn into carbon.",
      "From plants into atmospheric CO₂": "This is the opposite direction.",
    },
    R.photosynthesis.feedback,
    "Choose start, process and destination.",
    "photosynthesis",
  ),
  numeric(
    "g-ledger",
    "Inventory a moving store",
    "Find the signed atmospheric carbon change.",
    7,
    "g of carbon",
    R.atmosphere.feedback,
    "Total entering minus total leaving.",
    "atmosphere",
  ),
  choice(
    "g-atom",
    "Trace a carbon atom",
    "Which gas can carry the traced carbon after aerobic respiration?",
    "CO₂",
    {
      "O₂": "Oxygen gas contains no carbon.",
      Water: "Water contains no carbon.",
    },
    R.biologicalAtom.feedback,
    "Keep the atom carbon while changing its partners.",
    "biologicalAtom",
  ),
  choice(
    "g-stores",
    "Compare formation and release",
    "Which comparison fits the coal store?",
    "Slow geological formation; much faster combustion release",
    {
      "Instant formation and permanent storage":
        "Neither follows from coal formation.",
      "Combustion creates new carbon": "Existing atoms are transferred.",
    },
    R.coal.feedback,
    "Compare the timescales.",
    "coal",
  ),
  numeric(
    "g-change",
    "Compare a changed forest budget",
    "Find the signed atmospheric change after the supplied forest change.",
    24,
    "g of carbon",
    R.deforestation.feedback,
    "Add the listed burn and subtract the smaller uptake.",
    "deforestation",
  ),
  numeric(
    "g-pattern",
    "Separate seasons and endpoints",
    "Find the signed endpoint change in the supplied concentration series.",
    10,
    "arbitrary units",
    R.seasonal.feedback,
    "Read the first and last plotted values.",
    "seasonal",
  ),
];
guided[0].openingHint = true;
const pBudget = ledgerGiven(
  "A separate atmospheric inventory",
  inventory(
    "Atmosphere",
    180,
    [
      ["Respiration/decay", 16],
      ["Fuel burn", 9],
    ],
    [
      ["Photosynthesis", 21],
      ["Ocean uptake", 2],
    ],
  ),
);
const pNight = ledgerGiven(
  "A separate night inventory",
  inventory("Plant biomass", 70, [], [["Respiration", 8]]),
);
const pOcean = ledgerGiven(
  "A separate ocean inventory",
  inventory(
    "Dissolved ocean carbon",
    90,
    [["Air to ocean", 14]],
    [["Ocean to air", 11]],
  ),
);
const forestGiven: CycleGiven = {
  title: "Original matched forest budgets",
  note: "Every value is g of carbon over one equal interval; other returns are fixed. This is invented small-system data.",
  comparison: {
    before: inventory(
      "Atmosphere",
      150,
      [["Other returns", 22]],
      [["Tree uptake", 27]],
    ),
    after: inventory(
      "Atmosphere",
      150,
      [
        ["Other returns", 22],
        ["Cleared biomass burn", 7],
      ],
      [["Tree uptake", 10]],
    ),
  },
};
const practice = [
  choice(
    "p-photo",
    "Locate the glucose carbon",
    "A seedling gains organic carbon while growing. Which source supplies glucose carbon in photosynthesis?",
    "CO₂ entering leaves",
    {
      "Mineral ions supply all glucose carbon":
        "Roots absorb mineral ions but glucose carbon comes from CO₂.",
      "O₂ becomes carbon": "Chemical reactions do not change element identity.",
    },
    "CO₂ supplies carbon for organic molecules; water and light are also needed.",
    "Locate a carbon-containing reactant.",
  ),
  choice(
    "p-food",
    "Follow carbon through feeding",
    "Which arrow labels a herbivore incorporating carbon from grass?",
    "Plant biomass → feeding → animal biomass",
    {
      "Air → animal photosynthesis → animal biomass":
        "Animals do not photosynthesise.",
      "Animal biomass → feeding → limestone":
        "This is not the supplied food transfer.",
    },
    "Eating and incorporation can move plant food carbon into animal biomass; other fractions are respired or excreted.",
    "Trace the food, not just the gas.",
    undefined,
    {
      title: "Supplied food-transfer diagram",
      note: "The orange arrow is a fixed supplied transfer: a herbivore eats and incorporates some grass carbon. Identify its process.",
      route: { from: "plants", to: "animals", label: "Unknown process" },
    },
  ),
  written(
    "p-plantNight",
    "Explain day and night exchange",
    "Explain why a living plant can take up CO₂ overall in bright light but release it overall in darkness.",
    "For glucose, aerobic respiration is glucose + oxygen → carbon dioxide + water. Plants respire continuously, including in light and darkness, releasing CO₂ in aerobic respiration. Photosynthesis is carbon dioxide + water → glucose + oxygen, using light. It uses CO₂; in bright light its uptake can exceed respiratory release. In darkness photosynthesis stops while respiration continues, so the stated plant can release CO₂ overall.",
    [
      "State plant respiration in both conditions.",
      "Explain light-dependent photosynthesis uses CO₂.",
      "Compare the rates for net exchange, rather than claiming all plants always have the same daytime net.",
    ],
    "Compare two simultaneous processes.",
  ),
  choice(
    "p-anaerobic",
    "Limit a respiration claim",
    "Why is “every respiration pathway releases CO₂” too broad?",
    "Anaerobic muscle respiration produces lactic acid",
    {
      "Muscle anaerobic respiration is photosynthesis":
        "These are different processes.",
      "Aerobic respiration never produces CO₂":
        "Aerobic respiration releases CO₂.",
    },
    "Aerobic respiration releases CO₂; anaerobic products depend on the organism/pathway. Human muscle produces lactic acid, while yeast can produce ethanol and CO₂.",
    "Use the stated organism and oxygen condition.",
  ),
  written(
    "p-compost",
    "Link microorganisms and plants",
    "An oxygenated compost heap contains dead leaves. Explain how microorganisms recycle carbon and how plants reuse it. Also distinguish the role of released mineral ions.",
    "Microorganisms, including bacteria and fungi, use enzymes to digest large organic molecules into smaller molecules. They use some compounds in aerobic respiration, releasing CO₂; some carbon also enters microbial biomass. CO₂ can enter plant leaves and be used with water and light in photosynthesis to make glucose, which can form starch, cellulose and other organic molecules. Decay also releases mineral ions into soil; roots absorb these, for example nitrate ions used to make amino acids/proteins. Those mineral ions are not the source of all glucose carbon.",
    [
      "Link microbial digestion of organic material to smaller molecules.",
      "Link microbial aerobic respiration to CO₂ rather than carbon-containing oxygen.",
      "Link plant leaf CO₂ uptake and photosynthesis to glucose/organic material.",
      "Distinguish soil mineral-ion uptake and use from the CO₂ carbon source.",
      "Write a connected account involving both microorganisms and plants; do not claim all carbon is immediately respired.",
    ],
    "Connect dead material → microorganisms → CO₂ → leaves, then explain the separate mineral-ion route.",
  ),
  choice(
    "p-fossilAll",
    "Qualify fossil formation",
    "Which qualification belongs in an account of fossil formation?",
    "Only some organic matter is preserved and altered over very long times",
    {
      "Every fallen leaf instantly becomes coal":
        "Most organic material decomposes; formation is slow.",
      "Carbon atoms appear from nothing":
        "Atoms already existed in organic matter.",
    },
    "Limited decay and suitable burial can preserve organic material; geological processes are not universal or instant.",
    "Consider the fate of most dead material.",
  ),
  written(
    "p-burnConserved",
    "Reconcile combustion with conservation",
    "Explain how burning fossil fuels can increase atmospheric CO₂ without creating carbon atoms.",
    "The carbon already existed in a geological fossil-fuel store. Complete combustion transfers it into CO₂, so the atmospheric carbon store can increase while carbon atoms are conserved across all stores. The release can be much faster than geological replacement; conservation does not require each individual store to stay constant.",
    [
      "Locate pre-existing fossil carbon.",
      "Link complete combustion to CO₂ entering the atmosphere.",
      "Separate total atom conservation from distribution and formation/release timescales.",
    ],
    "Track the start and end stores.",
  ),
  written(
    "p-oceanTwo",
    "Explain a net ocean sink",
    "An ocean region receives 14 g of carbon from air and returns 11 g in one interval. Explain why it is a net sink but not a one-way permanent trap.",
    "Both inward and outward exchange occur. Net uptake is 14−11=3 g of carbon, so this region gains carbon over the stated interval. Some carbon still leaves, and later conditions and transfers can change its fate; this does not show every atom remains permanently or describe every ocean region.",
    [
      "Use both directions and the positive net 3 g.",
      "Reject zero outward exchange and permanent trapping.",
      "Limit the claim to the supplied region and interval.",
    ],
    "Net is entering minus leaving.",
  ),
  choice(
    "p-carbonate",
    "Locate ocean removal pathways",
    "Which pair can move atmospheric carbon into longer-lived stores?",
    "Ocean dissolution followed by carbonate sediment formation",
    {
      "Complete fossil combustion and respiration":
        "These stated processes return CO₂.",
      "Carbon turning into oxygen atoms":
        "These reactions conserve element identity.",
    },
    "CO₂ can dissolve, and dissolved carbon can enter carbonate shells/sediments. Long-term formation and storage do not destroy carbon.",
    "Follow transfers away from air.",
  ),
  construct(
    "p-budget",
    "Construct an atmospheric inventory",
    "Calculate total entering, total leaving, signed change and final carbon store.",
    [
      ["incoming", "Total entering / g of carbon", 25],
      ["outgoing", "Total leaving / g of carbon", 23],
      ["net", "Signed change / g of carbon", 2],
      ["final", "Final store / g of carbon", 182],
    ],
    pBudget,
    "16+9=25 entering;21+2=23 leaving; net+2;180+2=182 g of carbon.",
    "Add each direction separately before finding the net.",
  ),
  construct(
    "p-night",
    "Construct a dark plant inventory",
    "Calculate the signed change and final store.",
    [
      ["net", "Signed change / g of carbon", -8],
      ["final", "Final store / g of carbon", 62],
    ],
    pNight,
    "0−8=−8 g of carbon;70−8=62 g remain. Plants respire in darkness.",
    "A blank answer is unknown, not zero.",
  ),
  construct(
    "p-ocean",
    "Construct two-way ocean exchange",
    "Find total entering, total leaving, signed change and final store.",
    [
      ["incoming", "Total entering / g of carbon", 14],
      ["outgoing", "Total leaving / g of carbon", 11],
      ["net", "Signed change / g of carbon", 3],
      ["final", "Final store / g of carbon", 93],
    ],
    pOcean,
    "14−11=+3 g;90+3=93 g. An outward flow can coexist with a net sink.",
    "Do not omit the outward transfer.",
  ),
  numeric(
    "p-balanced",
    "Constant is not inactive",
    "A carbon store starts at 64 g, receives 12 g and loses 12 g in one interval. What is its final carbon mass?",
    64,
    "g of carbon",
    "64+12−12=64 g. Equal flows do not mean no carbon moved.",
    "Apply both transfers.",
  ),
  numeric(
    "p-glucose",
    "Account for six-carbon glucose",
    "How many CO₂ molecules supply the carbon atoms in one glucose molecule, C₆H₁₂O₆?",
    6,
    "CO₂ molecules",
    "Each CO₂ molecule supplies one carbon; glucose has six carbon atoms, so six CO₂ molecules supply them.",
    "Count carbon atoms, not total atoms.",
  ),
  choice(
    "p-oxygenAtom",
    "Reject an impossible carbon trace",
    "A student traces a carbon atom into oxygen gas released by photosynthesis. Why is that wrong?",
    "O₂ contains no carbon atoms",
    {
      "Carbon is always destroyed in leaves":
        "Photosynthesis conserves carbon.",
      "O₂ is another name for CO₂": "These are distinct formulae.",
    },
    "Carbon can enter organic compounds such as glucose; oxygen gas contains only oxygen.",
    "Inspect the product formula.",
  ),
  numeric(
    "p-carbonateAtoms",
    "Count carbonate carbon",
    "How many carbon atoms are represented by 3 CaCO₃ formula units?",
    3,
    "carbon atoms",
    "Each formula unit has one carbon atom;3×1=3. This does not describe discrete limestone molecules.",
    "Read the C subscript, implied 1.",
  ),
  choice(
    "p-methaneAtom",
    "Trace complete fuel combustion",
    "One carbon atom is in CH₄. After complete combustion, which supplied product can contain it?",
    "CO₂",
    { Water: "H₂O has no carbon.", "O₂": "O₂ has no carbon." },
    "Methane carbon forms CO₂ during complete combustion; atom identity remains carbon.",
    "Locate carbon in the product formula.",
  ),
  written(
    "p-coalTime",
    "Explain fossil timescales",
    "Explain why rapid coal burning cannot be balanced by assuming rapid new coal formation.",
    "Coal chiefly formed from ancient plant material preserved and altered over geological time. Burning can release that stored carbon as CO₂ much faster than geological formation replaces the store. Modern photosynthesis can take up CO₂ into biomass, but that is not instant replenishment of coal.",
    [
      "State ancient plant origin and long formation.",
      "Contrast rapid combustion release with slow replenishment.",
      "Distinguish biomass uptake from instant new coal.",
    ],
    "Compare the formation and release stores.",
  ),
  choice(
    "p-oilOrigin",
    "Avoid one fossil-fuel origin",
    "Which source is associated with much oil and natural gas?",
    "Ancient marine organic material, including microorganisms",
    {
      "Only oxygen gas": "O₂ has no carbon.",
      "Every oil deposit is coal from modern trees":
        "Sources and geological processes differ.",
    },
    "Oil and gas often formed from ancient marine organic matter buried and changed over geological time.",
    "Distinguish coal and marine organic sources.",
  ),
  written(
    "p-rockRelease",
    "Qualify carbonate release",
    "Explain why “limestone stores carbon for a long time” does not mean “limestone carbon can never be released”. Use a supplied carbonate–acid reaction.",
    "Limestone contains carbonate carbon that can remain stored over geological timescales. In a supplied carbonate–acid reaction, carbon can be released as CO₂. Long storage describes a timescale, not immunity to reactions; this specified reaction should not be generalised into a claim that every natural weathering process releases CO₂.",
    [
      "Identify carbonate carbon storage.",
      "Identify CO₂ in the supplied acid reaction.",
      "Separate long-term storage from permanence and limit the pathway claim.",
    ],
    "Use the specific reaction conditions.",
  ),
  construct(
    "p-forest",
    "Compare original forest budgets",
    "Calculate signed atmospheric changes before and after the stated forest change.",
    [
      ["beforeNet", "Signed change before / g of carbon", -5],
      ["afterNet", "Signed change after / g of carbon", 19],
    ],
    forestGiven,
    "Before 22−27=−5 g;after 22+7−10=+19 g. Reduced uptake and added burn both change the budget.",
    "Use entering minus leaving in each matched interval.",
  ),
  written(
    "p-forestMechanism",
    "Separate stock and uptake effects",
    "Explain two ways clearing and burning a forest can raise atmospheric CO₂.",
    "Burning cleared biomass releases some pre-existing tree carbon as CO₂. Fewer living trees can also reduce ongoing photosynthetic CO₂ uptake. These are different effects: releasing a carbon stock and changing a transfer rate. Timber fate, regrowth and other transfers affect actual outcomes; every cleared tree need not release all carbon instantly.",
    [
      "Explain carbon release from the stated burn.",
      "Explain reduced photosynthetic uptake.",
      "Distinguish stock from rate and avoid universal instant release.",
    ],
    "One effect concerns stored biomass; the other concerns future uptake.",
  ),
  numeric(
    "p-extraFossil",
    "Find an added fossil input",
    "An atmosphere receives 31 g of carbon and loses 31 g over an interval. A separate fossil burn adds another 6 g; all other flows stay fixed. What is the new signed atmospheric change?",
    6,
    "g of carbon",
    "31+6−31=+6 g; existing fossil carbon enters the atmosphere.",
    "Add the extra input without inventing other changes.",
  ),
  numeric(
    "p-regrowth",
    "Quantify improved uptake",
    "Matched budgets have 40 g of returns. Uptake rises from 28 g to 35 g of carbon per interval. By how much does the positive atmospheric gain decrease?",
    7,
    "g of carbon",
    "Before 40−28=12 g;after 40−35=5 g;decrease 12−5=7 g. The new gain is still positive.",
    "Find both gains, then their difference.",
  ),
  written(
    "p-offset",
    "Evaluate a tree-offset claim",
    "A proposal says planting trees instantly and permanently cancels every fossil emission. Evaluate the claim.",
    "Growing trees can remove CO₂ by photosynthesis and store carbon in biomass, but growth takes time and uptake has limits. Trees also respire, and stored carbon can later return through death, decay or burning. An offset claim needs matched quantities, time periods and evidence about future carbon storage; planting alone does not prove instant permanent cancellation.",
    [
      "Link photosynthesis to uptake and biomass.",
      "Explain time, capacity and possible later release.",
      "Require matched quantities/periods and storage evidence.",
    ],
    "Consider uptake rate and later carbon fates.",
  ),
  construct(
    "p-endpoints",
    "Read an original concentration series",
    "Read the first and last concentration, then calculate the signed endpoint change.",
    [
      ["start", "First concentration / arbitrary units", 200],
      ["end", "Last concentration / arbitrary units", 216],
      ["change", "Signed endpoint change / arbitrary units", 16],
    ],
    originalSeries,
    "216−200=+16 arbitrary units. These endpoints use different seasons; compare like seasons for a separate longer-term comparison.",
    "Keep units and time labels.",
  ),
  numeric(
    "p-sameSeason",
    "Compare like seasons",
    "Using the supplied original series, what is the summer-to-summer increase from Y1 to Y3?",
    4,
    "arbitrary units",
    "204−200=+4 arbitrary units. The endpoint increase 16 includes a summer-to-winter difference, so it answers a different question.",
    "Choose Y1 summer and Y3 summer.",
    undefined,
    originalSeries,
  ),
  choice(
    "p-seasonTrend",
    "Read seasonal and longer change",
    "Which statement fits the supplied series?",
    "Winter is higher each year; both same-season series rise",
    {
      "Summer dips prove no longer rise": "Summer values rise 200→202→204.",
      "One curve proves every cause":
        "A trend alone cannot identify every causal contribution.",
    },
    "Winter peaks and summer troughs can coexist with a longer rise. In this invented series both season-specific values rise 4 units from Y1 to Y3.",
    "Compare within each year and then like seasons.",
    undefined,
    originalSeries,
  ),
  written(
    "p-causal",
    "Limit a graph conclusion",
    "Explain why an increasing CO₂ curve with seasonal dips does not prove every cause or predict an exact future climate.",
    "The curve describes an observed or supplied pattern: seasonal variation and longer change can coexist. Explaining causes requires evidence about sources, uptake, boundaries and other relevant factors; one curve alone does not isolate each contribution. Future concentrations and climate depend on future emissions, uptake and physical processes, so an exact unrestricted forecast is not justified.",
    [
      "Describe the pattern separately from cause.",
      "Require source/uptake or other evidence for causal contributions.",
      "State assumptions/limits for future outcomes.",
    ],
    "Separate observation, explanation and prediction.",
  ),
  written(
    "p-energy",
    "Distinguish carbon and energy",
    "Explain why “carbon cycles” does not mean “energy cycles in exactly the same way”.",
    "Carbon atoms can be transferred repeatedly between atmospheric, biological and geological stores, while changing compounds. Light energy enters ecosystems; energy is transferred and dissipated to surroundings, including during respiration. Energy flow and dissipation are not a repeated material store-to-store carbon cycle.",
    [
      "Describe recycling of conserved carbon atoms.",
      "Describe energy input, transfer and dissipation.",
      "Reject identical cycling of atoms and energy.",
    ],
    "Track matter and energy separately.",
  ),
];
const checkForms = [
  [
    choice(
      "cA-photo",
      "Identify a carbon uptake route",
      "Which process directly moves atmospheric CO₂ carbon into organic plant material?",
      "Photosynthesis",
      {
        "Feeding by a herbivore":
          "This transfers food carbon between organisms.",
        "Complete combustion": "This returns carbon as CO₂.",
      },
      "Photosynthesis uses CO₂ and water with light to make glucose; its carbon can enter biomass.",
      "Locate the source and destination.",
    ),
    construct(
      "cA-budget",
      "Inventory a reserved atmosphere",
      "Find total entering, total leaving, signed change and final store.",
      [
        ["incoming", "Total entering / g of carbon", 36],
        ["outgoing", "Total leaving / g of carbon", 29],
        ["net", "Signed change / g of carbon", 7],
        ["final", "Final store / g of carbon", 207],
      ],
      ledgerGiven(
        "New atmospheric inventory",
        inventory(
          "Atmosphere",
          200,
          [
            ["Respiration/decay", 24],
            ["Burning", 12],
          ],
          [
            ["Plant uptake", 25],
            ["Ocean uptake", 4],
          ],
        ),
      ),
      "24+12=36;25+4=29;net+7;final 207 g of carbon.",
      "Sum transfers by direction.",
    ),
    written(
      "cA-decay",
      "Link decay and plant reuse",
      "Explain how aerobic microorganisms and plants can recycle carbon from dead leaves. Distinguish mineral ions.",
      "Microorganisms digest dead organic compounds and use some in aerobic respiration, releasing CO₂. CO₂ can enter leaves and be used in photosynthesis with water and light to make glucose and other organic material. Some carbon can enter microorganisms. Decay also releases mineral ions, absorbed by roots for functions such as making proteins; mineral ions are not the source of all glucose carbon.",
      [
        "Link microbial digestion and aerobic respiration to CO₂.",
        "Link plant uptake of CO₂ to photosynthesis and glucose.",
        "Distinguish mineral-ion uptake/use and avoid claiming every carbon atom is immediately respired.",
      ],
      "Connect both organisms and the separate soil pathway.",
    ),
    numeric(
      "cA-glucose",
      "Conserve photosynthesis carbon",
      "How many CO₂ molecules supply the carbon in 2 glucose molecules, C₆H₁₂O₆?",
      12,
      "CO₂ molecules",
      "2×6=12 carbon atoms; each CO₂ supplies one.",
      "Count carbon, not oxygen.",
    ),
    choice(
      "cA-geology",
      "Compare two geological stores",
      "Which pairing is justified?",
      "Coal: ancient plants; limestone: carbonate sediment",
      {
        "Coal: oxygen gas; limestone: glucose only":
          "O₂ has no carbon; limestone stores carbonate.",
        "Both form instantly in every modern leaf":
          "Geological storage forms over very long times.",
      },
      "Coal contains ancient plant-derived carbon; limestone contains carbonate carbon. Both can store carbon over geological time.",
      "Read material origin as well as time.",
    ),
    construct(
      "cA-forest",
      "Compare a reserved land-use budget",
      "Calculate the signed atmospheric change before and after.",
      [
        ["beforeNet", "Signed change before / g of carbon", -4],
        ["afterNet", "Signed change after / g of carbon", 15],
      ],
      {
        title: "New matched clearing budgets",
        note: "Invented g-of-carbon data over equal intervals. Other returns remain fixed.",
        comparison: {
          before: inventory(
            "Atmosphere",
            100,
            [["Other returns", 20]],
            [["Tree uptake", 24]],
          ),
          after: inventory(
            "Atmosphere",
            100,
            [
              ["Other returns", 20],
              ["Cleared biomass burn", 5],
            ],
            [["Tree uptake", 10]],
          ),
        },
      },
      "Before 20−24=−4 g;after 20+5−10=+15 g.",
      "Separate the burn release and uptake change.",
    ),
    numeric(
      "cA-season",
      "Compare reserved summer values",
      "An original concentration table gives summer values 300, 303 and 306 arbitrary units in Y1, Y2 and Y3. What is the increase from Y1 summer to Y3 summer?",
      6,
      "arbitrary units",
      "306−300=+6 arbitrary units; use like seasons.",
      "Last summer minus first summer.",
    ),
    written(
      "cA-conserve",
      "Explain atmosphere and conservation",
      "Explain why a growing atmospheric carbon store does not contradict conservation of carbon atoms.",
      "An individual store can gain carbon when transfers into it exceed transfers out. Carbon can come from other stores such as fossil fuel or biomass. Chemical reactions change compounds but conserve carbon atoms across the whole system; they do not require each store or atmospheric concentration to stay constant.",
      [
        "Compare inflow and outflow.",
        "Locate pre-existing carbon in other stores.",
        "Separate total atom conservation from each store/concentration.",
      ],
      "Consider the system boundary.",
    ),
  ],
  [
    choice(
      "cB-night",
      "Explain a plant in darkness",
      "In darkness, which supplied plant process can return organic carbon as CO₂?",
      "Aerobic respiration",
      {
        "Photosynthesis without light": "Photosynthesis needs light.",
        "All carbon becomes oxygen gas": "O₂ contains no carbon.",
      },
      "Plant respiration continues in darkness, while photosynthesis needs light.",
      "Name the oxygen-using process.",
    ),
    construct(
      "cB-ocean",
      "Inventory a reserved ocean region",
      "Find entering, leaving, signed change and final carbon.",
      [
        ["incoming", "Total entering / g of carbon", 9],
        ["outgoing", "Total leaving / g of carbon", 13],
        ["net", "Signed change / g of carbon", -4],
        ["final", "Final store / g of carbon", 76],
      ],
      ledgerGiven(
        "New local ocean inventory",
        inventory(
          "Dissolved ocean carbon",
          80,
          [["Air to ocean", 9]],
          [["Ocean to air", 13]],
        ),
      ),
      "9−13=−4 g;80−4=76 g. This supplied region is a net source over the interval.",
      "Account for both directions.",
    ),
    written(
      "cB-fossil",
      "Explain fossil redistribution",
      "Explain why faster fossil-fuel burning can increase atmospheric CO₂ when geological replenishment is slow.",
      "Fuel contains carbon from ancient organic material preserved and changed over geological time. Complete combustion releases existing fuel carbon as CO₂ much faster than geological processes replace the store. If input to air exceeds removal, atmospheric carbon grows; no carbon atoms are created.",
      [
        "Identify ancient stored carbon.",
        "Contrast combustion and geological replacement timescales.",
        "Explain net atmospheric gain with conserved atoms.",
      ],
      "Compare store, rate and time.",
    ),
    numeric(
      "cB-carbonate",
      "Count formula-unit carbon",
      "How many carbon atoms are represented by 7 CaCO₃ formula units?",
      7,
      "carbon atoms",
      "One carbon per formula unit;7×1=7.",
      "Use implied C subscript1.",
    ),
    choice(
      "cB-acid",
      "Use a stated carbonate reaction",
      "A supplied acid reacts with CaCO₃ and releases a carbon-containing gas. Which gas is justified?",
      "CO₂",
      {
        "O₂": "O₂ contains no carbon.",
        "H₂O only": "Water contains no carbon.",
      },
      "The carbonate–acid reaction releases CO₂; this specific pathway does not describe all weathering.",
      "Use the stated reaction.",
    ),
    construct(
      "cB-regrowth",
      "Compare reserved regrowth budgets",
      "Calculate signed atmospheric changes before and after.",
      [
        ["beforeNet", "Signed change before / g of carbon", 8],
        ["afterNet", "Signed change after / g of carbon", 3],
      ],
      {
        title: "New matched uptake budgets",
        note: "Invented g-of-carbon data over equal intervals; listed returns are fixed.",
        comparison: {
          before: inventory(
            "Atmosphere",
            160,
            [["Returns", 34]],
            [["Photosynthesis", 26]],
          ),
          after: inventory(
            "Atmosphere",
            160,
            [["Returns", 34]],
            [["Photosynthesis", 31]],
          ),
        },
      },
      "34−26=8 g;34−31=3 g. Uptake improves but gain remains positive.",
      "Calculate both nets.",
    ),
    numeric(
      "cB-endpoints",
      "Read a reserved endpoint change",
      "An original local series starts at 150 and ends at 146 arbitrary concentration units. What is its signed endpoint change?",
      -4,
      "arbitrary units",
      "146−150=−4 arbitrary units. A local invented series is not a worldwide claim.",
      "Final minus initial, with sign.",
    ),
    written(
      "cB-graphLimit",
      "Explain graph interpretation limits",
      "A concentration curve has repeated seasonal peaks while both same-season series rise. Explain the pattern and one limit on conclusions.",
      "The curve shows repeated seasonal differences as well as a longer rise in like-season values; a seasonal dip does not cancel that rise. A curve alone does not isolate every source or uptake cause, and an exact future concentration/climate needs assumptions and additional evidence.",
      [
        "State seasonal repetition and the like-season rise.",
        "Reject cancellation of the longer rise by individual dips.",
        "State a causal or forecast limitation.",
      ],
      "Compare like seasons before discussing causes.",
    ),
  ],
];
const reviewForms = [
  [
    choice(
      "vA-photo",
      "Recall the carbon source",
      "What supplies carbon atoms for photosynthetic glucose?",
      "CO₂",
      {
        "O₂": "O₂ contains no carbon.",
        "Mineral ions supply all glucose carbon": "CO₂ is the carbon source.",
      },
      "Carbon enters from CO₂; mineral ions have separate roles.",
      "Inspect reactant elements.",
    ),
    construct(
      "vA-budget",
      "Revisit a store inventory",
      "Calculate signed change and final carbon store.",
      [
        ["net", "Signed change / g of carbon", -3],
        ["final", "Final store / g of carbon", 87],
      ],
      ledgerGiven(
        "Delayed new plant inventory",
        inventory(
          "Plant biomass",
          90,
          [["Photosynthesis", 15]],
          [
            ["Respiration", 12],
            ["Food/waste", 6],
          ],
        ),
      ),
      "15−18=−3 g;90−3=87 g.",
      "Include every loss.",
    ),
    numeric(
      "vA-carbon",
      "Revisit carbon counts",
      "How many carbon atoms are in 3 glucose molecules, C₆H₁₂O₆?",
      18,
      "carbon atoms",
      "3×6=18 carbon atoms.",
      "Multiply molecule count and C subscript.",
    ),
    written(
      "vA-decay",
      "Revisit a microbial link",
      "Explain how carbon from dead material can enter a newly growing plant through aerobic microorganisms.",
      "Microorganisms digest the organic matter and use some carbon compounds in aerobic respiration, releasing CO₂. CO₂ can enter plant leaves and be used with water and light in photosynthesis to make glucose/biomass. Some carbon remains in other stores; mineral ions released into soil have a separate uptake/use route.",
      [
        "Link microbial digestion/respiration to CO₂.",
        "Link leaf CO₂ uptake/photosynthesis to organic carbon.",
        "Distinguish minerals and avoid all-carbon-immediate claims.",
      ],
      "Write connected transfers.",
    ),
  ],
  [
    choice(
      "vB-fossil",
      "Revisit conservation in burning",
      "Complete fossil-fuel combustion raises atmospheric carbon because…",
      "Existing stored carbon is transferred into CO₂",
      {
        "New carbon atoms are created": "Atoms are conserved.",
        "Atmospheric carbon can never change":
          "One store can gain at another’s expense.",
      },
      "Burning redistributes carbon from a geological store.",
      "Track source and destination.",
    ),
    construct(
      "vB-ocean",
      "Revisit two-way exchange",
      "Calculate signed change and final store.",
      [
        ["net", "Signed change / g of carbon", 5],
        ["final", "Final store / g of carbon", 115],
      ],
      ledgerGiven(
        "Delayed new ocean inventory",
        inventory(
          "Dissolved ocean carbon",
          110,
          [["Inward exchange", 17]],
          [["Outward exchange", 12]],
        ),
      ),
      "17−12=+5 g;110+5=115 g. Net uptake does not erase outward exchange.",
      "Both directions count.",
    ),
    numeric(
      "vB-season",
      "Revisit matched seasons",
      "An original series has Y1 summer 420 and Y3 summer 428 arbitrary units. What is the increase?",
      8,
      "arbitrary units",
      "428−420=+8 arbitrary units.",
      "Use like seasons.",
    ),
    written(
      "vB-offset",
      "Revisit a planting claim",
      "Explain two limits on claiming planted trees permanently cancel fossil emissions.",
      "Trees take time to grow and their uptake must be compared with emissions over matched quantities and intervals. Biomass carbon can later return through respiration, death, decay or burning, so permanent storage needs evidence. Planting alone does not establish instant, unlimited or permanent cancellation.",
      [
        "Explain timescale and matched quantity/rate comparison.",
        "Explain at least one later carbon-release pathway.",
        "Limit the instant/permanent offset claim.",
      ],
      "Consider growth now and carbon fate later.",
    ),
  ],
];
const recoveries = [
  "r-photo",
  "r-feed",
  "r-plantResp",
  "r-animalResp",
  "r-decay",
  "r-burial",
  "r-burn",
  "r-ocean",
  "r-carbonate",
  "r-atmosphere",
  "r-night",
  "r-sink",
  "r-balanced",
  "r-bioAtom",
  "r-bioAtom",
  "r-rockAtom",
  "r-fuelAtom",
  "r-coal",
  "r-oil",
  "r-limestone",
  "r-forest",
  "r-forest",
  "r-fossilChange",
  "r-regrowth",
  "r-regrowth",
  "r-season",
  "r-season",
  "r-season",
  "r-season",
  "r-bioAtom",
];
export const cycleRecoveryRoutes: Record<string, string> = {};
for (const [i, q] of practice.entries()) {
  q.followUp = id(recoveries[i]);
  cycleRecoveryRoutes[q.id] = q.followUp;
}
export const allCycleTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
// Link repeated reasoning; reserve numerically different inventories as fresh tasks.
export const cycleExposureFamilies = {
  glucose: ["w-atoms", "p-glucose"],
  photo: ["r-photo", "g-route", "p-photo", "cA-photo", "vA-photo"],
  feed: ["r-feed", "p-food"],
  plantResp: ["w-plant", "r-plantResp", "p-plantNight", "cB-night"],
  animalResp: ["r-animalResp", "p-anaerobic"],
  decay: ["r-decay", "p-compost", "cA-decay", "vA-decay"],
  fossil: [
    "r-burial",
    "r-burn",
    "p-fossilAll",
    "p-burnConserved",
    "cA-conserve",
    "cB-fossil",
    "vB-fossil",
  ],
  ocean: ["r-ocean", "p-oceanTwo", "r-carbonate", "p-carbonate"],
  atom: ["w-carbon", "r-bioAtom", "g-atom", "p-oxygenAtom", "p-energy"],
  fuelAtom: ["r-fuelAtom", "p-methaneAtom"],
  carbonate: ["r-rockAtom", "r-limestone", "p-rockRelease", "cB-acid"],
  coal: ["r-coal", "g-stores", "p-coalTime", "cA-geology"],
  oil: ["r-oil", "p-oilOrigin"],
  forest: ["r-forest", "g-change", "p-forestMechanism"],
  regrowth: ["r-regrowth", "p-offset", "vB-offset"],
  seasons: [
    "r-season",
    "g-pattern",
    "p-endpoints",
    "p-sameSeason",
    "p-seasonTrend",
    "p-causal",
    "cB-graphLimit",
  ],
  atmosphere: ["r-atmosphere", "g-ledger"],
};
const groups = Object.values(cycleExposureFamilies).map((v) => new Set(v));
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
    const q = allCycleTasks.find((q) => q.id === id(s))!;
    q.exposureAliases = [...group].filter((o) => o !== s).map(id);
  }
export const cycleJourney: LessonJourney = {
  version: 1,
  introduction:
    "Trace carbon between stores and compare entering and leaving flows.",
  scopeNote:
    "Chemistry atmospheric carbon removal and storage, with explicitly labelled cross-science Biology carbon cycling (AQA Chemistry8462 4.9.1.2–4; Biology8461/Trilogy4.7.2.2). Both tiers. Original budgets and graphs are teaching data, not real global measurements. Written explanations are self-reviewed; this lesson does not establish whole-course exam readiness.",
  outcomes: [
    "Interpret transfers by photosynthesis, feeding, aerobic respiration, decomposition, combustion and ocean/carbonate pathways.",
    "Explain microbial carbon recycling and distinguish leaf CO₂ uptake from root mineral-ion uptake.",
    "Track conserved carbon atoms through changed compounds; distinguish carbon cycling from energy flow.",
    "Explain fossil and carbonate storage, formation timescales and stated release pathways.",
    "Calculate inflow, outflow, signed net and final store; evaluate deforestation, fossil inputs and regrowth without instant-offset claims.",
    "Separate seasonal patterns, like-season change, concentration units and limits on causes/forecasts.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Trace transfers and explain recycling",
      taskIds: practice.slice(0, 9).map((q) => q.id),
    },
    {
      label: "Inventory stores and conserve atoms",
      taskIds: practice.slice(9, 20).map((q) => q.id),
    },
    {
      label: "Compare changing budgets and graphs",
      taskIds: practice.slice(20).map((q) => q.id),
    },
  ],
};
