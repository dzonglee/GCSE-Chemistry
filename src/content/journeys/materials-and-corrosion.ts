import type { LearningTask, LessonJourney } from "../types";
import {
  rustDesignRecovery,
  rustDesignGuided,
  rustDesignPractice,
  rustDesignCheck,
  rustDesignReview,
} from "./rust-experiment-design";
import {
  alloyUseRecovery,
  alloyUseGuided,
  alloyUsePractice,
  alloyUseCheck,
  alloyUseReview,
} from "./alloy-use-recall";
import {
  materialsRecords as R,
  type MaterialsGiven,
} from "../../lib/materials";
const id = (s: string) => "materials-v1-" + s;
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  data?: MaterialsGiven,
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
            kind: "materials-investigation" as const,
            mode: R[record].mode,
            record,
          },
        }
      : {}),
    ...(data ? { materialsGiven: data } : {}),
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
  data?: MaterialsGiven,
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
    ...(data ? { materialsGiven: data } : {}),
  };
}
function build(
  s: string,
  title: string,
  prompt: string,
  refs: readonly (readonly [string, string, number])[],
  data: MaterialsGiven,
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
    partLegend: "Construct the material quantities",
    parts: refs.map(([f, label, answer]) => ({
      id: f,
      label,
      answer,
      inputMode: "decimal" as const,
      tolerance: 1e-6,
    })),
    materialsGiven: data,
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
  data?: MaterialsGiven,
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
      "Compare your saved explanation with the criteria. Written work is manually reviewed, not automatically awarded an exam mark.",
    hint,
    ...(data ? { materialsGiven: data } : {}),
  };
}
const warmup = [
  choice(
    "w-reactivity",
    "Read relative reactivity",
    "Given zinc > iron > silver in reactivity, which metal can protect exposed iron sacrificially?",
    "Zinc",
    {
      Silver: "Silver is less reactive than iron.",
      "Any metal":
        "Sacrificial protection requires a more reactive metal in contact.",
    },
    "Zinc reacts preferentially because it is more reactive than iron.",
    "Compare each metal with iron.",
  ),
  num(
    "w-percent",
    "Use the whole",
    "Find 25% of a 40 g material sample.",
    10,
    "g",
    "0.25 × 40 = 10 g. The percentage and mass have different units.",
    "Divide 40 by four.",
  ),
  choice(
    "w-bond",
    "Separate forces and bonds",
    "When an uncrosslinked polymer melts, what is overcome?",
    "Attractions between polymer chains",
    {
      "All backbone covalent bonds": "That would break molecules chemically.",
      "Nuclear forces": "Melting is not a nuclear reaction.",
    },
    "Chains separate/move while internal covalent bonds remain intact.",
    "Distinguish within-chain from between-chain interactions.",
  ),
  choice(
    "w-constraint",
    "Meet all requirements",
    "A material must be strong AND low density. One sample is strong but too dense. Does it meet the brief?",
    "No",
    {
      "Yes, strength is enough": "Both requirements must be met.",
      "Only its colour matters":
        "Colour does not establish strength or density.",
    },
    "Test each stated requirement rather than choosing one attractive property.",
    "AND requires both conditions.",
  ),
];
const refSpecs: readonly (readonly [
  string,
  string,
  string,
  string,
  Record<string, string>,
  string,
])[] = [
  [
    "wet",
    "Test rust conditions",
    "Predict rusting. Which gas is needed?",
    "Oxygen",
    {
      Nitrogen: "Nitrogen is not the necessary rust reactant.",
      Hydrogen: "Hydrogen is not supplied.",
    },
    "Both oxygen and water are necessary for typical iron rusting.",
  ],
  [
    "dry",
    "Remove one reactant",
    "Predict the dry-air control. Is oxygen alone sufficient for rusting?",
    "No",
    { Yes: "Water is also necessary." },
    "Dry air contains oxygen but lacks water; the controlled nail does not rust.",
  ],
  [
    "noOxygen",
    "Account for dissolved oxygen",
    "Predict the oxygen-excluded water control. Does water alone cause rust?",
    "No",
    { Yes: "Oxygen is also required." },
    "Water must have dissolved oxygen removed and oxygen excluded for this control.",
  ],
  [
    "paint",
    "Use an intact barrier",
    "Build the intact-paint prediction. What does continuous paint exclude?",
    "Water and oxygen",
    {
      "Only nitrogen": "Excluding nitrogen does not explain rust prevention.",
      "All iron atoms": "Paint does not remove the iron.",
    },
    "A barrier prevents water and oxygen reaching the iron surface.",
  ],
  [
    "scratchPaint",
    "Expose the iron",
    "Build the scratched-paint prediction. Does paint supply a sacrificial metal?",
    "No",
    { Yes: "Paint is a barrier, not a reactive metal coating." },
    "Exposed iron at a scratch can rust when both water and oxygen reach it.",
  ],
  [
    "zinc",
    "Use a reactive coating",
    "Build the scratched-zinc prediction. Which metal oxidises preferentially?",
    "Zinc",
    {
      Iron: "Zinc is more reactive and protects the iron.",
      Neither: "Zinc is consumed during sacrificial protection.",
    },
    "Zinc oxidises preferentially while it remains in contact in the corrosive environment.",
  ],
  [
    "silver",
    "Test a less-reactive coating",
    "Build the scratched-silver prediction. Can silver protect iron sacrificially?",
    "No",
    { Yes: "Silver is less reactive than iron." },
    "An intact less-reactive coating may be a barrier; a scratch exposes iron without reactive-metal protection.",
  ],
  [
    "spent",
    "Recognise finite protection",
    "Build the spent-zinc prediction. Is iron protected after all zinc has been consumed?",
    "No",
    { Yes: "No sacrificial metal remains." },
    "Sacrificial protection has finite material capacity.",
  ],
  [
    "gold18",
    "Translate carats into composition",
    "Construct the three quantities for this ring. What fraction of its mass is gold?",
    "Three quarters",
    {
      "18 grams": "Carat measures proportion, not mass.",
      "18%": "Divide 18 by 24, not by 100.",
    },
    "18/24 = 3/4 = 75%; 12 g contains 9 g gold.",
  ],
  [
    "gold12",
    "Use a different purity",
    "Construct the three pendant quantities. What fraction is gold?",
    "One half",
    {
      "One twelfth": "Divide purity parts by 24.",
      "All of it": "Only 24 carat is pure gold.",
    },
    "12/24 = 1/2; 20 g contains 10 g gold.",
  ],
  [
    "titanium",
    "Find the remainder",
    "Construct the alloy quantities. Which whole do the component percentages refer to?",
    "The complete alloy mass",
    {
      "Only aluminium mass":
        "Each percentage refers to the same complete alloy.",
      "The titanium atom count": "The supplied percentages are by mass.",
    },
    "100 − 6 − 4 = 90% titanium; 90% of 200 g is 180 g.",
  ],
  [
    "pure",
    "Explain shaping pure metal",
    "Predict layer motion and bonding for this pure sample. Does all metallic attraction disappear during shaping?",
    "No",
    { Yes: "Layers move while metallic attraction remains." },
    "Regular layers slide relatively easily and metallic bonding remains.",
  ],
  [
    "mixed",
    "Explain alloy hardness",
    "Predict the alloy structure. Why is sliding more difficult?",
    "Different-sized atoms distort layers",
    {
      "All atoms vanish": "Atoms remain in the alloy.",
      "Every bond becomes ionic": "The alloy retains metallic bonding.",
    },
    "Size differences disrupt regular layers, explaining increased hardness qualitatively.",
  ],
  [
    "soft",
    "Heat separate chains",
    "Predict behaviour from the shown chain structure. Is this thermosoftening?",
    "Yes",
    { No: "There are no covalent crosslinks preventing chain separation." },
    "Intermolecular attractions can be overcome; chain covalent bonds remain intact during melting.",
  ],
  [
    "set",
    "Heat a crosslinked structure",
    "Predict behaviour of the shown network. Does it melt like separate chains?",
    "No",
    { Yes: "Covalent crosslinks prevent chain separation." },
    "Thermosetting polymers do not melt; sufficiently strong heating can chemically degrade them.",
  ],
  [
    "ld",
    "Change branching and packing",
    "Compare branched and straighter poly(ethene). Do both originate from ethene?",
    "Yes",
    {
      No: "Manufacturing conditions can change structure with the same monomer.",
    },
    "Different production conditions make LD and HD poly(ethene); more branching reduces close packing and density.",
  ],
  [
    "hd",
    "Pack chains closely",
    "Compare the more-linear sample with the branched one. Is high density evidence of covalent crosslinks?",
    "No",
    { Yes: "Closer packing is not covalent crosslinking." },
    "Straighter chains pack more closely. HD poly(ethene) remains thermosoftening.",
  ],
  [
    "soda",
    "Build a glass recipe",
    "Construct the soda-lime ingredient/process recipe. Which ingredient accompanies sand and limestone?",
    "Sodium carbonate",
    {
      "Boron trioxide": "That belongs to the supplied borosilicate recipe.",
      Zinc: "Zinc galvanises iron.",
    },
    "Most everyday glass is soda-lime: sand, sodium carbonate and limestone are heated together.",
  ],
  [
    "boro",
    "Build a different glass recipe",
    "Construct the borosilicate recipe. Compared with soda-lime, its melting temperature is…",
    "Higher",
    {
      Lower: "The specification gives the opposite comparison.",
      "Always identical": "Glass composition changes properties.",
    },
    "Borosilicate uses sand and boron trioxide and melts at a higher temperature.",
  ],
  [
    "clay",
    "Order ceramic manufacture",
    "Construct the clay-ceramic process. Which stage comes first?",
    "Shape wet clay",
    {
      "Heat the finished dry powder only":
        "Shape wet clay before furnace heating.",
      "Galvanise the clay": "Galvanising concerns iron/zinc.",
    },
    "Pottery and bricks are made by shaping wet clay then heating in a furnace.",
  ],
  [
    "concrete",
    "Identify composite roles",
    "Construct the component roles. What surrounds and binds the steel?",
    "Cement-based matrix",
    {
      "Steel bars": "These are reinforcement.",
      "Gold atoms": "Not a supplied component.",
    },
    "The matrix surrounds/binds reinforcement; steel helps resist tension.",
  ],
  [
    "fibre",
    "Identify a fibre composite",
    "Construct the glass-fibre composite roles. What is the reinforcement?",
    "Glass fibres",
    {
      "Polymer resin": "Resin is the matrix.",
      "A single pure metal": "This is a two-component composite.",
    },
    "Glass fibres reinforce; polymer resin binds/surrounds them.",
  ],
  [
    "hot",
    "Prioritise heat suitability",
    "Choose a container for the stated 200 °C use. Can toughness alone establish suitability?",
    "No",
    { Yes: "Check the supplied temperature requirement too." },
    "A meets the heat condition; the two polymers begin melting below 200 °C.",
  ],
  [
    "cold",
    "Prioritise impact suitability",
    "Choose a tough container suitable at 20 °C. Is highest temperature limit automatically the best choice?",
    "No",
    { Yes: "The stated priority is impact resistance at 20 °C." },
    "B is tough and meets the temperature constraint; A shatters and C is unsuitable at 20 °C.",
  ],
  [
    "light",
    "Meet two quantitative constraints",
    "Choose a strong, light panel. Must density and strength both meet their limits?",
    "Yes",
    { No: "One favourable property is insufficient." },
    "C meets both constraints; A is too dense and B is too weak.",
  ],
];
const refresher = refSpecs.map(
  ([record, title, prompt, answer, errors, explanation]) =>
    choice(
      "r-" + record,
      title,
      prompt,
      answer,
      errors,
      explanation,
      "Use the supplied conditions or structure, then check every proposed part.",
      record,
    ),
);
const gainExample: MaterialsGiven = {
  title: "Work through a retained mass gain",
  note: "Original worked example. Mass gain = final − initial. Percentage mass gain = gain ÷ initial mass × 100. Oxygen/water incorporated in retained rust can increase the sample mass; atoms are conserved.",
  rows: [
    {
      label: "Measured masses",
      text: "Initial 5.00 g; final 5.20 g, including retained corrosion product.",
    },
  ],
};
refresher.push(
  num(
    "r-massGain",
    "Work out a mass increase",
    "Use the supplied initial and final masses to calculate the mass gain.",
    0.2,
    "g",
    "5.20 − 5.00 = 0.20 g. Final and initial masses must be in the same units.",
    "Subtract initial mass from final mass.",
    gainExample,
  ),
  num(
    "r-percentage",
    "Choose the percentage denominator",
    "Calculate the percentage mass increase for the supplied original sample.",
    4,
    "%",
    "Gain = 0.20 g; 0.20 ÷ 5.00 × 100 = 4%. The denominator is the initial mass, not the final mass. Subtract two percentage increases in percentage points; round only the final requested result.",
    "Divide the gain by the initial mass, then multiply by 100.",
    gainExample,
  ),
  num(
    "r-density",
    "Translate density and volume into mass",
    "Use mass = density × volume to calculate this sample mass.",
    6.3,
    "g",
    "1.5 g/cm³ × 4.2 cm³ = 6.3 g. Units combine to grams; equal volumes let masses be compared through density.",
    "Multiply the supplied density by the volume.",
    {
      title: "Work through a density calculation",
      note: "Original supplied values. Density = mass ÷ volume, so mass = density × volume. These are illustrative data, not a universal material constant.",
      rows: [
        { label: "Density", text: "1.5 g/cm³" },
        { label: "Sample volume", text: "4.2 cm³" },
      ],
    },
  ),
);
const guided = [
  refresher[0],
  refresher[5],
  refresher[8],
  refresher[12],
  refresher[14],
  refresher[18],
  refresher[21],
  refresher[24],
].map((q, i) => ({
  ...q,
  id: id(
    "g-" +
      [
        "rust",
        "protection",
        "composition",
        "alloy",
        "polymer",
        "manufacture",
        "composite",
        "selection",
      ][i],
  ),
}));
const rustEvidence: MaterialsGiven = {
  title: "Original controlled nail results",
  note: "Same temperature and six-day exposure; retained corrosion product is included in final mass. Identical preparation within each control comparison. Coating samples have different starting masses: use percentage increases, not raw mass ranking. These illustrative results do not prove indefinite protection.",
  table: {
    caption: "Measured mass / g",
    head: ["Nail / condition", "Initial", "Final"],
    rows: [
      ["A: wet air", "4.00", "4.24"],
      ["B: dry air", "4.00", "4.00"],
      ["C: oxygen excluded", "4.00", "4.00"],
      ["D: intact paint", "5.00", "5.00"],
      ["E: scratched paint", "5.00", "5.05"],
      ["F: scratched zinc", "5.00", "5.00"],
    ],
  },
};
const gold9: MaterialsGiven = {
  title: "A new gold-alloy calculation",
  note: "Original mass-based purity exercise. 24 carat means pure gold.",
  rows: [
    {
      label: "Alloy",
      text: "16 g total, 9 carat gold. Other metals make up the remainder.",
    },
  ],
};
const titaniumNew: MaterialsGiven = {
  title: "A new supplied alloy",
  note: "Only the three named components are present. Percentages are by mass.",
  rows: [
    {
      label: "Composition",
      text: "5% aluminium, 3% vanadium, remainder titanium.",
    },
    { label: "Total", text: "500 g alloy." },
  ],
};
const panel: MaterialsGiven = {
  title: "Original comparable panel samples",
  note: "Panel volume 10 cm³ each. Material A: steel; B: composite. These illustrative values are supplied, not universal constants.",
  table: {
    caption: "Compare material properties",
    head: ["Material", "Density / g/cm³", "Strength / MPa"],
    rows: [
      ["A", "8", "500"],
      ["B", "2", "400"],
    ],
  },
};
const practice = [
  write(
    "p-rust",
    "Evaluate controlled rust evidence",
    "Use all six results to explain which reactants are needed and compare intact paint, scratched paint and scratched zinc. Include one limit of the conclusion.",
    "A gains mass in wet air; B and C do not, supporting the need for both water and oxygen. Intact paint D acts as a barrier. Scratched paint E exposes iron and gains mass. Remaining zinc F is more reactive than iron and can protect sacrificially in contact. Six-day results do not prove indefinite protection; zinc is consumed and repeated controlled evidence would improve confidence.",
    [
      "Use A/B to show water is necessary and A/C to show oxygen is necessary.",
      "Relate D/E to barrier failure at a scratch.",
      "Explain F using more-reactive zinc oxidising preferentially in contact.",
      "State a time/repeat/remaining-zinc limitation rather than claiming proof forever.",
    ],
    "Compare one changed condition at a time.",
    rustEvidence,
  ),
  build(
    "p-rustPercent",
    "Compare percentage mass gains",
    "Calculate the percentage increase for A and E, then A minus E in percentage points. Use unrounded values here.",
    [
      ["a", "A increase / %", 6],
      ["e", "E increase / %", 1],
      ["gap", "Difference / percentage points", 5],
    ],
    rustEvidence,
    "A: (4.24 − 4)/4 × 100 = 6%. E: (5.05 − 5)/5 × 100 = 1%. Difference = 5 percentage points, not a 5% relative increase.",
    "Each gain must be divided by its own initial mass.",
  ),
  num(
    "p-threeSF",
    "Round only the final comparison",
    "Two comparable retained-rust samples gain mass: A from 3.30 g to 3.48 g, B from 4.80 g to 4.84 g. Find A minus B percentage mass increases, in percentage points, to three significant figures.",
    4.62,
    "percentage points",
    "A: 0.18/3.30 × 100 = 5.4545…%; B: 0.04/4.80 × 100 = 0.8333…%; difference = 4.6212… percentage points, rounding finally to 4.62.",
    "Use each initial mass as its own denominator; subtract before final rounding.",
  ),
  num(
    "p-resolution",
    "Read balance resolution",
    "The balance records masses in steps of 0.01 g. State its resolution.",
    0.01,
    "g",
    "Resolution is the smallest recorded change: 0.01 g = 1 × 10⁻² g.",
    "Use the stated step size.",
  ),
  num(
    "p-gain",
    "Explain gain rather than loss",
    "From the supplied nail results, calculate A’s mass increase.",
    0.24,
    "g",
    "4.24 − 4.00 = 0.24 g. Oxygen/water become incorporated in retained hydrated iron(III) oxide; mass gain does not create atoms.",
    "Subtract initial mass from final mass.",
    rustEvidence,
  ),
  write(
    "p-scratch",
    "Distinguish barrier and sacrificial protection",
    "A painted iron gate and a zinc-coated iron gate are both scratched in wet air. Explain why the remaining zinc can protect exposed iron whereas paint alone cannot.",
    "Paint is a barrier; the scratch lets oxygen and water reach iron. Zinc remaining in electrical contact in the same corrosive environment is more reactive than iron and oxidises preferentially, protecting the iron sacrificially. Protection eventually fails if zinc is consumed.",
    [
      "Water and oxygen reach scratched painted iron.",
      "Zinc is more reactive and oxidises preferentially.",
      "Require contact/remaining zinc; do not claim indefinite protection.",
    ],
    "Compare what happens at the exposed iron surface.",
  ),
  choice(
    "p-aluminium",
    "Explain oxide protection",
    "Why can aluminium resist further corrosion despite being reactive?",
    "A protective oxide layer covers it",
    {
      "It is less reactive than every metal":
        "Aluminium is reactive; its oxide protects the surface.",
      "It contains no electrons": "All aluminium atoms contain electrons.",
    },
    "Aluminium has an oxide coating protecting the underlying metal from further corrosion.",
    "Separate reactivity from surface protection.",
  ),
  choice(
    "p-salt",
    "Do not add an unnecessary reactant",
    "Which statement about typical iron rusting is justified?",
    "Water and oxygen are needed; salt can accelerate it",
    {
      "Salt is always essential": "Iron can rust without added salt.",
      "Dry nitrogen alone makes rust": "Both necessary reactants are missing.",
    },
    "Salt is not a necessary reactant in the basic rusting requirement.",
    "Use the controlled water/oxygen comparisons.",
  ),
  build(
    "p-gold",
    "Calculate a new carat composition",
    "Find the percentage gold, gold mass and other-metal mass.",
    [
      ["percent", "Gold / %", 37.5],
      ["gold", "Gold / g", 6],
      ["other", "Other metals / g", 10],
    ],
    gold9,
    "9/24 × 100 = 37.5%; 0.375 × 16 = 6 g gold, leaving 10 g other metals.",
    "Carats/24 gives the gold mass fraction.",
  ),
  num(
    "p-carats",
    "Find carats from measured composition",
    "A 12 g gold alloy contains 9 g gold. Find its purity in carats.",
    18,
    "carat",
    "9/12 × 24 = 18 carat. The whole alloy mass is the denominator.",
    "Gold fraction multiplied by 24.",
  ),
  build(
    "p-remainder",
    "Calculate an unfamiliar alloy",
    "Find the titanium percentage, titanium mass and total other-metal mass.",
    [
      ["percent", "Titanium / %", 92],
      ["base", "Titanium / g", 460],
      ["other", "Other metals / g", 40],
    ],
    titaniumNew,
    "100 − 5 − 3 = 92%; 92% of 500 = 460 g; 500 − 460 = 40 g others.",
    "Find the remainder of 100%, then apply it to 500 g.",
  ),
  choice(
    "p-bronze",
    "Recall bronze",
    "Bronze is an alloy of copper and…",
    "Tin",
    {
      Zinc: "Copper and zinc form brass.",
      "Carbon only": "Carbon is part of steels, not the named bronze recipe.",
    },
    "Bronze is copper and tin; it is used for statues and medals.",
    "Distinguish bronze from brass.",
  ),
  choice(
    "p-brass",
    "Recall brass and its use",
    "Which alloy is copper and zinc and is used for musical instruments or door fittings?",
    "Brass",
    {
      Bronze: "Bronze contains copper and tin.",
      "Stainless steel":
        "Stainless steel is an iron alloy with chromium/nickel.",
    },
    "Brass combines copper and zinc and is used for musical instruments and fittings.",
    "Match the composition before choosing a use.",
  ),
  write(
    "p-jewellery",
    "Justify gold alloys",
    "Why is gold jewellery usually an alloy rather than pure gold? Include its typical added metals and a property/use reason.",
    "Gold jewellery is commonly alloyed with silver, copper and zinc. Alloys are harder than pure gold and resist deformation/wear better; using less gold can also reduce material cost. The carat value states the gold mass proportion, with 24 carat pure and 18 carat 75%.",
    [
      "Name silver/copper/zinc as typical alloying metals.",
      "Link increased hardness to jewellery wear/shape.",
      "Distinguish purity proportion from item mass.",
    ],
    "Connect the property to wearing the object.",
  ),
  choice(
    "p-highSteel",
    "Choose a strong but brittle steel",
    "A product specification accepts brittleness and requires the listed strong steel. Which GCSE steel type matches?",
    "High carbon steel",
    {
      "Low carbon steel": "It is softer and more readily shaped.",
      "Pure iron with no carbon": "Steels contain specific carbon amounts.",
    },
    "High carbon steel is strong but brittle and is used for cutting tools. This trade-off matters in material selection.",
    "Match both supplied properties.",
  ),
  choice(
    "p-lowSteel",
    "Choose a steel that can be shaped",
    "Which steel is most suitable when easy shaping is the main requirement?",
    "Low carbon steel",
    {
      "High carbon steel": "High carbon steel is brittle.",
      "Any steel has exactly the same properties":
        "Composition affects properties.",
    },
    "Low carbon steel is softer and more easily shaped, for example into shaped car body panels.",
    "Relate carbon content to the stated shaping need.",
  ),
  choice(
    "p-stainless",
    "Specify stainless steel",
    "Which addition pair is used in hard, corrosion-resistant stainless steels?",
    "Chromium and nickel",
    {
      "Silver and gold": "Not the specified stainless-steel additions.",
      "Copper and tin": "That pair describes bronze, not stainless steel.",
    },
    "Stainless steels contain iron, carbon, chromium and nickel; hardness and corrosion resistance suit cutlery.",
    "Recall the specified steel composition.",
  ),
  choice(
    "p-aluminiumAlloy",
    "Link density to aircraft use",
    "Why are aluminium alloys useful for aircraft structures?",
    "Low density reduces mass for a given volume",
    {
      "High density is always better": "Aircraft often require lower mass.",
      "They contain no atoms": "Alloys contain atoms.",
    },
    "Aluminium alloys are low density; appropriate strength and other requirements must also be checked.",
    "Mass = density × volume.",
  ),
  write(
    "p-layer",
    "Explain alloy hardness",
    "Use the shown idealised structure to explain why the alloy is harder to shape than a pure metal.",
    "Different-sized atoms distort the regular metal layers. Layers cannot slide as easily, making the alloy harder. Metallic attraction to delocalised electrons remains; this is not conversion to ionic bonding.",
    [
      "Different atom sizes disrupt regular layers.",
      "Relate difficult sliding to increased hardness.",
      "Do not claim disappearance of metallic bonding.",
    ],
    "Explain the movement that shaping requires.",
    {
      title: "Alloy section",
      note: "Qualitative original atom-size comparison, not a measured crystal.",
      diagram: "alloy",
    },
  ),
  write(
    "p-thermal",
    "Explain heating using structure",
    "Compare thermosoftening and thermosetting polymers using chains, attractions and crosslinks.",
    "Thermosoftening polymers have separate chains with attractions between them. Heating can overcome these attractions so they melt; within-chain covalent bonds remain intact. Thermosetting polymers have covalent crosslinks between chains, so the chains cannot separate to melt. Strong heating may degrade them chemically.",
    [
      "Separate between-chain attractions from covalent backbone bonds.",
      "Link overcoming attractions to thermosoftening melting.",
      "Link covalent crosslinks to thermosetting not melting; avoid indestructibility.",
    ],
    "Distinguish physical melting from chemical decomposition.",
  ),
  write(
    "p-density",
    "Explain two ethene polymers",
    "Explain how both LD and HD poly(ethene) can come from ethene yet have different densities.",
    "Ethene undergoes addition polymerisation to make both. Different manufacturing conditions produce different chain structures. LD poly(ethene) has more branching and poorer packing; more-linear HD chains pack more closely and have higher density. Both are thermosoftening; higher density is not evidence of covalent crosslinks.",
    [
      "Same ethene monomer, different manufacturing conditions.",
      "Link branching to packing and lower density.",
      "Link more-linear chains to close packing/higher density.",
    ],
    "Changing conditions can change polymer structure without changing the monomer.",
  ),
  choice(
    "p-soda",
    "Recall everyday glass ingredients",
    "Which set is heated to make soda-lime glass?",
    "Sand, sodium carbonate and limestone",
    {
      "Sand and boron trioxide only":
        "This is the supplied borosilicate recipe.",
      "Wet clay and zinc":
        "Clay ceramics and galvanising are different processes.",
    },
    "Most everyday glass is soda-lime glass, made from these three raw materials.",
    "Match the whole recipe.",
  ),
  choice(
    "p-boro",
    "Recall borosilicate and property",
    "Compared with soda-lime glass, borosilicate made with sand and boron trioxide has…",
    "A higher melting temperature",
    {
      "A lower melting temperature": "The specification gives the opposite.",
      "The same composition by definition": "The recipes differ.",
    },
    "Composition changes glass properties. Use supplied thermal data for a specific application.",
    "Recall the direction of the comparison.",
  ),
  choice(
    "p-clay",
    "Manufacture pottery and bricks",
    "Which ordered pair makes a clay ceramic?",
    "Shape wet clay, then heat in a furnace",
    {
      "Galvanise, then electrolyse":
        "These processes do not make clay ceramics.",
      "Melt sand, then add zinc": "That is not the clay process.",
    },
    "Pottery and bricks are made by shaping wet clay followed by furnace heating.",
    "Shaping comes before firing.",
  ),
  write(
    "p-composite",
    "Explain matrix and reinforcement",
    "For glass-fibre reinforced polymer, name the matrix and reinforcement and describe the matrix’s role.",
    "Polymer resin is the matrix/binder. Glass fibres are reinforcement. The matrix surrounds and binds the fibres, giving a combined material whose properties depend on both components and their arrangement. It is not a homogeneous atomic alloy.",
    [
      "Identify polymer resin as matrix.",
      "Identify glass fibres as reinforcement.",
      "Matrix surrounds/binds reinforcement; distinguish composite from alloy.",
    ],
    "Identify what surrounds the fibres.",
    {
      title: "Fibre composite section",
      note: "Original schematic component arrangement.",
      diagram: "fibre",
    },
  ),
  choice(
    "p-concrete",
    "Use composite component strengths",
    "In reinforced concrete, steel bars mainly help the concrete resist…",
    "Tensile loading",
    {
      "No forces at all": "Reinforcement has a structural role.",
      "Every possible load indefinitely":
        "Performance depends on design and conditions.",
    },
    "Concrete resists compression well; steel reinforcement helps resist tension. The cement-based matrix binds/surrounds it.",
    "Distinguish compression from tension.",
  ),
  build(
    "p-panel",
    "Compare mass and density quantitatively",
    "For the supplied equal-volume panels, calculate A’s mass, B’s mass and A’s mass divided by B’s.",
    [
      ["a", "A mass / g", 80],
      ["b", "B mass / g", 20],
      ["ratio", "A divided by B mass", 4],
    ],
    panel,
    "Mass = density × volume: 8 × 10 = 80 g and 2 × 10 = 20 g; A is four times B’s mass. This does not make B stronger.",
    "Use the same 10 cm³ volume for both.",
  ),
  num(
    "p-strength",
    "Read a strength difference",
    "Using the supplied panel table, calculate A minus B strength.",
    100,
    "MPa",
    "500 − 400 = 100 MPa. Keep strength units distinct from density/mass.",
    "Subtract like units.",
    panel,
  ),
  write(
    "p-decision",
    "Evaluate a specific material choice",
    "A panel must have strength at least 350 MPa and density at most 3 g/cm³. Use the table to choose a material and explain why the other fails. State one extra property needed before a real design decision.",
    "B meets both limits: 400 MPa and 2 g/cm³. A has sufficient strength but density 8 g/cm³ exceeds the limit. Cost, stiffness, fatigue or temperature suitability would also need evidence for a real design. Lower mass alone does not guarantee suitability.",
    [
      "Compare both materials with both numerical limits.",
      "Choose B and explicitly identify A’s density failure.",
      "State an additional relevant property without inventing it.",
    ],
    "A good decision uses every stated constraint.",
    panel,
  ),
];
const checkGold: MaterialsGiven = {
  title: "Reserved gold composition",
  note: "24 carat is pure gold. Original alloy mass exercise.",
  rows: [{ label: "Sample", text: "24 g total alloy; 15 carat gold." }],
};
const checkAlloy: MaterialsGiven = {
  title: "Reserved alloy composition",
  note: "Only the specified components are present; percentages by mass.",
  rows: [
    {
      label: "Sample",
      text: "300 g total; 8% aluminium, 2% vanadium, remainder titanium.",
    },
  ],
};
const checkForms = [
  [
    choice(
      "cA-dry",
      "Interpret a rust control",
      "An uncoated nail is held in dry oxygen. Will typical rust form under these conditions?",
      "No, water is absent",
      {
        "Yes, oxygen alone suffices": "Water is also needed.",
        "Yes, nitrogen must be removed":
          "Removing nitrogen does not supply water.",
      },
      "Rusting needs both water and oxygen.",
      "Identify the missing reactant.",
    ),
    write(
      "cA-zinc",
      "Explain a scratched reactive coating",
      "Explain why remaining zinc touching a scratched iron surface can prevent iron rusting in wet air.",
      "Zinc is more reactive than iron and oxidises preferentially. While zinc remains in electrical contact in the same wet oxygenated environment, it protects exposed iron sacrificially; it is eventually consumed.",
      [
        "More reactive zinc.",
        "Preferential zinc oxidation.",
        "Remaining contact in corrosive environment and finite protection.",
      ],
      "Explain the relative reactivity.",
    ),
    build(
      "cA-gold",
      "Reserved carat calculation",
      "Construct the gold percentage, gold mass and other-metal mass.",
      [
        ["percent", "Gold / %", 62.5],
        ["gold", "Gold / g", 15],
        ["other", "Other metals / g", 9],
      ],
      checkGold,
      "15/24 = 62.5%; 62.5% of 24 g = 15 g, leaving 9 g.",
      "Use carats divided by 24.",
    ),
    choice(
      "cA-brass",
      "Reserved alloy recall",
      "Which alloy contains copper and zinc?",
      "Brass",
      {
        Bronze: "Bronze contains tin.",
        "Stainless steel": "This is an iron alloy.",
      },
      "Brass is copper/zinc; door fittings and instruments are examples of uses.",
      "Distinguish copper alloys.",
    ),
    write(
      "cA-polymer",
      "Reserved crosslink explanation",
      "A polymer has covalent crosslinks joining its chains. Predict its heating behaviour and explain it.",
      "It is thermosetting and does not melt because covalent crosslinks prevent chains separating. It may chemically decompose under stronger heating; its behaviour is not explained by weaker intermolecular forces alone.",
      [
        "Thermosetting / does not melt.",
        "Covalent crosslinks stop chain separation.",
        "Avoid indestructibility/backbone-breaking-as-melting claims.",
      ],
      "Link structure to behaviour.",
    ),
    choice(
      "cA-ceramic",
      "Reserved ceramic manufacture",
      "How are clay bricks manufactured?",
      "Shape wet clay then heat in a furnace",
      {
        "Heat sand with sodium carbonate only":
          "That concerns glass ingredients.",
        "Coat clay with zinc": "Galvanising concerns iron.",
      },
      "Clay ceramics require shaping then furnace heating.",
      "Recall both stages in order.",
    ),
    choice(
      "cA-matrix",
      "Reserved composite role",
      "In a glass-fibre/polymer-resin composite, which component is the matrix?",
      "Polymer resin",
      {
        "Glass fibres": "They are reinforcement.",
        "Copper atoms": "Not a component.",
      },
      "The resin surrounds and binds the glass-fibre reinforcement.",
      "Find the surrounding binder.",
    ),
    choice(
      "cA-select",
      "Reserved property constraints",
      "Require strength ≥ 250 MPa and density ≤ 4 g/cm³. X is 300 MPa/7 g/cm³; Y is 280 MPa/3 g/cm³; Z is 100 MPa/1 g/cm³. Choose.",
      "Y",
      { X: "X exceeds the density limit.", Z: "Z fails the strength limit." },
      "Y alone meets both limits.",
      "Check both constraints for every sample.",
    ),
  ],
  [
    choice(
      "cB-water",
      "Reserved oxygen control",
      "An iron nail is in water with dissolved oxygen removed and oxygen kept out. Will typical rust form?",
      "No, oxygen is absent",
      {
        "Yes, water alone suffices": "Both reactants are needed.",
        "Yes, salt is always present": "Salt is not given or necessary.",
      },
      "Oxygen must be absent from the water too, not only the headspace.",
      "Identify the missing reactant.",
    ),
    write(
      "cB-barrier",
      "Reserved scratched barrier explanation",
      "Explain why intact paint protects iron but a scratch exposing wet iron in air can allow rust.",
      "Intact paint excludes oxygen and water as a barrier. A scratch exposes iron to both reactants, so iron can rust. Paint has no more-reactive metal to provide sacrificial protection.",
      [
        "Intact barrier excludes oxygen/water.",
        "Scratch lets both reach iron.",
        "No sacrificial metal supplied by paint.",
      ],
      "Explain surface access.",
    ),
    build(
      "cB-alloy",
      "Reserved remainder calculation",
      "Calculate the titanium percentage, titanium mass and combined other-metal mass.",
      [
        ["percent", "Titanium / %", 90],
        ["base", "Titanium / g", 270],
        ["other", "Other metals / g", 30],
      ],
      checkAlloy,
      "100 − 8 − 2 = 90%; 0.9 × 300 = 270 g, leaving 30 g.",
      "Use the whole alloy.",
    ),
    choice(
      "cB-steel",
      "Reserved steel choice",
      "Which steel is softer and more easily shaped?",
      "Low carbon steel",
      {
        "High carbon steel": "It is strong but brittle.",
        "Stainless steel by definition":
          "Hardness/corrosion resistance do not make it the specified soft steel.",
      },
      "Low carbon steel is more easily shaped.",
      "Match the properties.",
    ),
    write(
      "cB-ldhd",
      "Reserved packing explanation",
      "Explain why differently manufactured LD and HD poly(ethene) have different densities although both come from ethene.",
      "Addition polymerisation of ethene under different manufacturing conditions changes chain branching. LD chains are more branched and pack less closely; HD chains are more linear and pack more closely, giving higher density. Both have the ethene monomer and are thermosoftening.",
      [
        "Same monomer / different manufacturing conditions.",
        "More branching → poorer packing → lower density.",
        "More-linear chains → closer packing → higher density.",
      ],
      "Follow structure → packing → density.",
    ),
    choice(
      "cB-glass",
      "Reserved glass recipe",
      "Which GCSE recipe makes borosilicate glass?",
      "Sand and boron trioxide",
      {
        "Sand, sodium carbonate and limestone": "That makes soda-lime glass.",
        "Wet clay alone": "That is a clay ceramic feedstock.",
      },
      "Borosilicate melts at a higher temperature than soda-lime glass.",
      "Distinguish the recipes.",
    ),
    choice(
      "cB-reinforce",
      "Reserved concrete roles",
      "In reinforced concrete, steel bars are the…",
      "Reinforcement",
      {
        Matrix: "The cement-based material is the matrix.",
        "Only binder": "Bars are not the surrounding binder.",
      },
      "Steel reinforces; the matrix surrounds and binds it.",
      "Name the embedded component.",
    ),
    choice(
      "cB-select",
      "Reserved heating choice",
      "A container must operate at 180 °C. Supplied safe operating maxima: A 120 °C, B 250 °C, C 90 °C. Choose.",
      "B",
      { A: "Its maximum is below 180 °C.", C: "Its maximum is below 180 °C." },
      "B meets the given temperature constraint. These are supplied operating maxima, not universal melting points.",
      "Compare each limit with 180 °C.",
    ),
  ],
];
const reviewForms = [
  [
    choice(
      "vA-oxide",
      "Retrieve oxide protection",
      "What protects aluminium from further corrosion?",
      "Its oxide coating",
      {
        "Its complete lack of reactivity": "Aluminium is reactive.",
        "A permanent absence of electrons": "Aluminium contains electrons.",
      },
      "The oxide coating protects the underlying metal.",
      "Think about the surface.",
    ),
    num(
      "vA-carats",
      "Retrieve a fresh carat fraction",
      "An alloy is 21 carat gold. What percentage of its mass is gold?",
      87.5,
      "%",
      "21/24 × 100 = 87.5%.",
      "Divide by 24.",
    ),
    choice(
      "vA-stainless",
      "Retrieve steel composition/use",
      "Which alloy is appropriate for hard, corrosion-resistant cutlery?",
      "Iron with carbon, chromium and nickel",
      {
        "Copper and zinc": "That is brass.",
        "Pure iron only": "Steels are alloys.",
      },
      "Stainless steels combine these components and properties.",
      "Match alloy composition to use.",
    ),
    write(
      "vA-thermal",
      "Retrieve a structural heating explanation",
      "Why can a thermosoftening polymer melt without breaking all its chain covalent bonds?",
      "Heating overcomes attractions between separate polymer chains so they can move past one another. Covalent bonds within the chains remain intact; covalent crosslinks would instead prevent chains separating to melt.",
      [
        "Between-chain attractions overcome.",
        "Within-chain covalent bonds remain intact.",
        "Distinguish covalent crosslinks.",
      ],
      "Separate inter- and intramolecular interactions.",
    ),
  ],
  [
    choice(
      "vB-reactive",
      "Retrieve contact and reactivity",
      "Remaining magnesium touches wet iron in air. Given magnesium is more reactive than iron, which oxidises preferentially?",
      "Magnesium",
      {
        Iron: "Magnesium is more reactive.",
        "Neither indefinitely": "Sacrificial metal is consumed.",
      },
      "A more-reactive metal in contact can protect iron sacrificially.",
      "Apply supplied relative reactivity.",
    ),
    num(
      "vB-mass",
      "Retrieve composition scaling",
      "A 32 g alloy is 75% copper by mass. Find the copper mass.",
      24,
      "g",
      "0.75 × 32 = 24 g.",
      "Use the mass of the whole alloy.",
    ),
    choice(
      "vB-bronze",
      "Retrieve a named alloy/use",
      "Which copper/tin alloy is used for statues or medals?",
      "Bronze",
      {
        Brass: "Brass is copper/zinc.",
        "Low carbon steel": "This is an iron/carbon alloy.",
      },
      "Bronze combines copper and tin.",
      "Recall the composition.",
    ),
    write(
      "vB-composite",
      "Retrieve composite roles",
      "Explain the two component roles in glass-fibre reinforced polymer.",
      "Polymer resin is the matrix/binder that surrounds and binds glass fibres. The fibres are reinforcement; together their complementary properties produce the composite. Composition and arrangement affect final properties.",
      [
        "Resin matrix surrounds/binds.",
        "Glass-fibre reinforcement.",
        "Combined properties without claiming a universal performance value.",
      ],
      "Name both components and their functions.",
    ),
  ],
];
export const allMaterialsTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
const routes = [
  "wet",
  "wet",
  "wet",
  "wet",
  "wet",
  "zinc",
  "paint",
  "wet",
  "gold18",
  "gold18",
  "titanium",
  "mixed",
  "mixed",
  "gold18",
  "mixed",
  "pure",
  "mixed",
  "light",
  "mixed",
  "set",
  "ld",
  "soda",
  "boro",
  "clay",
  "fibre",
  "concrete",
  "light",
  "light",
  "light",
];
export const materialsRecoveryRoutes = Object.fromEntries(
  practice.map((q, i) => [q.id, id("r-" + routes[i])]),
);
for (const s of ["p-rustPercent", "p-threeSF"])
  materialsRecoveryRoutes[id(s)] = id("r-percentage");
materialsRecoveryRoutes[id("p-gain")] = id("r-massGain");
materialsRecoveryRoutes[id("p-panel")] = id("r-density");
for (const q of practice) q.followUp = materialsRecoveryRoutes[q.id];
export const materialsExposureFamilies = {
  rust: [
    "r-wet",
    "g-rust",
    "r-dry",
    "r-noOxygen",
    "p-rust",
    "p-gain",
    "p-salt",
    "cA-dry",
    "cB-water",
  ],
  barrier: ["r-paint", "r-scratchPaint", "p-scratch", "cB-barrier"],
  sacrifice: [
    "w-reactivity",
    "r-zinc",
    "g-protection",
    "r-silver",
    "r-spent",
    "p-scratch",
    "cA-zinc",
    "vB-reactive",
  ],
  layers: ["r-pure", "r-mixed", "g-alloy", "p-layer"],
  composite: [
    "r-concrete",
    "r-fibre",
    "g-composite",
    "p-composite",
    "p-concrete",
    "cA-matrix",
    "cB-reinforce",
    "vB-composite",
  ],
  oxide: ["p-aluminium", "vA-oxide"],
  workedGain: ["r-massGain", "r-percentage"],
  gold: ["r-gold18", "r-gold12", "g-composition", "p-jewellery", "p-carats"],
  alloyNames: [
    "p-bronze",
    "p-brass",
    "p-highSteel",
    "p-lowSteel",
    "p-stainless",
    "p-aluminiumAlloy",
    "cA-brass",
    "cB-steel",
    "vA-stainless",
    "vB-bronze",
  ],
  thermal: [
    "w-bond",
    "r-soft",
    "r-set",
    "g-polymer",
    "p-thermal",
    "cA-polymer",
    "vA-thermal",
  ],
  packing: ["r-ld", "r-hd", "p-density", "cB-ldhd"],
  manufacture: [
    "r-soda",
    "r-boro",
    "r-clay",
    "g-manufacture",
    "p-soda",
    "p-boro",
    "p-clay",
    "cA-ceramic",
    "cB-glass",
  ],
  selection: [
    "w-constraint",
    "r-hot",
    "r-cold",
    "r-light",
    "g-selection",
    "p-decision",
  ],
};
const groups = Object.values(materialsExposureFamilies).map(
  (fs) => new Set(fs),
);
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
    const q = allMaterialsTasks.find((q) => q.id === id(s));
    if (!q) throw Error("Unknown materials exposure " + s);
    q.exposureAliases = [...g].filter((o) => o !== s).map(id);
  }
// Append after the original recovery/exposure wiring to preserve every v1
// definition, original position and started form. New learning is conservative
// about its equivalence to earlier named-alloy and jewellery work.
const alloyUseAdditions = [
  ...alloyUseRecovery,
  ...alloyUseGuided,
  ...alloyUsePractice,
  ...alloyUseCheck,
  ...alloyUseReview,
];
const alloyUseAliases = [
  ...alloyUseAdditions.map((q) => q.id),
  ...materialsExposureFamilies.alloyNames.map(id),
  ...materialsExposureFamilies.gold.map(id),
];
for (const q of alloyUseAdditions)
  q.exposureAliases = alloyUseAliases.filter((alias) => alias !== q.id);
for (const q of alloyUsePractice) {
  const recovery = q.id.replace("-p-", "-r-");
  q.followUp = recovery;
  materialsRecoveryRoutes[q.id] = recovery;
}
refresher.push(...alloyUseRecovery);
guided.push(...alloyUseGuided);
practice.push(...alloyUsePractice);
checkForms.push(alloyUseCheck);
reviewForms.push(alloyUseReview);
allMaterialsTasks.push(...alloyUseAdditions);

// Append only: original conditions, raw answers, indices and reserved forms stay valid.
const rustDesignAdditions = [
  ...rustDesignRecovery,
  ...rustDesignGuided,
  ...rustDesignPractice,
  ...rustDesignCheck,
  ...rustDesignReview,
];
const originalRustIds = materialsExposureFamilies.rust.map((suffix) =>
  id(suffix),
);
for (const task of rustDesignAdditions) {
  task.exposureAliases = [
    ...originalRustIds,
    ...rustDesignAdditions
      .filter((other) => other !== task)
      .map((other) => other.id),
  ];
}
for (const task of rustDesignPractice) {
  task.followUp = rustDesignRecovery[task.id.endsWith("p-flaw") ? 1 : 2].id;
  materialsRecoveryRoutes[task.id] = task.followUp;
}
refresher.push(...rustDesignRecovery);
guided.push(...rustDesignGuided);
practice.push(...rustDesignPractice);
checkForms.push(rustDesignCheck);
reviewForms.push(rustDesignReview);
allMaterialsTasks.push(...rustDesignAdditions);

export const materialsJourney: LessonJourney = {
  version: 1,
  introduction:
    "Predict corrosion, calculate alloy composition and choose materials from structure and supplied evidence.",
  scopeNote:
    "Separate GCSE Chemistry, Foundation/Higher: AQA8462 4.10.3.1–3. Original controlled investigations, diagrams and property datasets address actual paired examination demands. Shared bonding/polymer prerequisites remain relevant. Practical investigations here are simulations/data interpretation; written explanations require manual review and do not certify exam readiness.",
  outcomes: [
    "Describe controlled rust experiments and interpret quantitative mass changes; distinguish water/oxygen necessity from accelerated corrosion.",
    "Explain intact barriers, scratched coatings, remaining reactive-metal sacrificial protection and aluminium oxide protection.",
    "Recall bronze/brass/gold/steel/aluminium alloy composition, properties and uses; calculate carat fractions and unfamiliar mass compositions.",
    "Explain pure-metal shaping and alloy hardness through layer sliding and atom sizes.",
    "Relate thermosoftening/thermosetting heating to between-chain attractions/covalent crosslinks; explain LD/HD poly(ethene) from conditions, branching and packing.",
    "Recall soda-lime/borosilicate recipes and melting comparison; order clay-ceramic manufacture.",
    "Identify matrix/reinforcement in named composites and link component properties to uses.",
    "Compare material properties quantitatively, meet every stated constraint and justify choices with evidence and limitations.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Corrosion and controlled evidence",
      taskIds: practice.slice(0, 8).map((q) => q.id),
    },
    {
      label: "Alloy calculations and named uses",
      taskIds: practice.slice(8, 19).map((q) => q.id),
    },
    {
      label: "Polymers, glasses and ceramics",
      taskIds: practice.slice(19, 24).map((q) => q.id),
    },
    {
      label: "Composites and quantitative choices",
      taskIds: practice.slice(24, 29).map((q) => q.id),
    },
    {
      label: "Recall named alloy uses without choices",
      taskIds: alloyUsePractice.map((q) => q.id),
    },
    {
      label: "Describe and evaluate rust experiment designs",
      taskIds: rustDesignPractice.map((q) => q.id),
    },
  ],
};
