import type { LearningTask, LessonJourney } from "../types";
import {
  pollutionRecords,
  methaneCO,
  methaneSoot,
  sulfurEquation,
  nitrogenEquation,
  type PollutionGiven,
  type PollutionEquation,
} from "../../lib/pollution";
const id = (s: string) => "pollution-v1-" + s;
function model(record?: string) {
  return record
    ? {
        model: {
          kind: "pollution-investigation" as const,
          mode: pollutionRecords[record].mode,
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
  given?: PollutionGiven,
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
    ...(given ? { pollutionGiven: given } : {}),
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
  given?: PollutionGiven,
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
    ...(given ? { pollutionGiven: given } : {}),
  };
}
function written(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  given?: PollutionGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    referenceResponse: answer,
    rubric,
    hint,
    ...(given ? { pollutionGiven: given } : {}),
  };
}
function construct(
  s: string,
  title: string,
  prompt: string,
  refs: readonly (readonly [string, string, number])[],
  given: PollutionGiven,
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
    partLegend: "Construct your values",
    pollutionGiven: given,
    explanation,
    hint,
  };
}
function balance(
  s: string,
  title: string,
  equation: PollutionEquation,
  numbers: number[],
): LearningTask {
  return construct(
    s,
    title,
    "Balance this pathway with the smallest positive whole-number coefficients. Enter every coefficient, including 1; keep formulae unchanged.",
    [...equation.left, ...equation.right].map(
      (p, i) => [p.field, p.formula + " coefficient", numbers[i]] as const,
    ),
    {
      title: "Supplied combustion pathway",
      note: "This equation represents one specified pathway, not the proportions of every real exhaust mixture.",
      equation,
    },
    "The smallest coefficients are " +
      numbers.join(", ") +
      ". Each element has the same atom total on both sides; changing subscripts would change the substances.",
    "Count each element separately and change coefficients only.",
  );
}
const warmup = [
  choice(
    "w-formula",
    "Read two different gases",
    "Which statement correctly distinguishes CO and CO₂?",
    "They are different substances with different properties",
    {
      "They are interchangeable names":
        "The oxygen subscript changes the substance.",
      "CO contains no oxygen": "CO contains one oxygen atom per molecule.",
    },
    "CO and CO₂ each contain carbon, but have different compositions and effects.",
    "Read the subscript, not just the first element.",
  ),
  choice(
    "w-oxygen",
    "Recall combustion",
    "Incomplete combustion occurs when…",
    "Oxygen is insufficient for complete combustion",
    {
      "There is no fuel": "There must be fuel for combustion.",
      "The fuel is always sulfur-free":
        "Sulfur content does not define incomplete combustion.",
    },
    "Insufficient oxygen can leave carbon as CO or soot instead of all becoming CO₂.",
    "Which reactant supply is limited?",
  ),
  numeric(
    "w-percent",
    "Use a supplied percentage",
    "A 1 kg fuel sample contains 1% sulfur by mass. How many grams of sulfur are present?",
    10,
    "g",
    "1 kg=1000 g;1/100×1000=10 g.",
    "Convert kilograms to grams first.",
  ),
  numeric(
    "w-change",
    "Compare before and after",
    "A rate falls from 20 to 5 mg/min. What is the decrease?",
    15,
    "mg/min",
    "20−5=15 mg/min.",
    "Subtract the new value from the original.",
  ),
];
const refresher = [
  choice(
    "r-complete",
    "Complete methane",
    "After predicting the specified complete methane burn, which two substances are combustion products?",
    "CO₂ and water",
    {
      "CO and soot only": "These indicate incomplete oxidation.",
      "SO₂ and NOₓ":
        "The specified burn supplies no sulfur and excludes appreciable hot-air nitrogen reaction.",
    },
    pollutionRecords.complete.feedback,
    "Track carbon and hydrogen separately.",
    "complete",
  ),
  choice(
    "r-incomplete",
    "A mixture is possible",
    "Does limited oxygen require every carbon atom to become CO?",
    "No; CO₂, CO and carbon soot can coexist",
    {
      "Yes; CO is always the only carbon product":
        "Oxygen shortage does not specify a universal product ratio.",
      "No carbon-containing products form": "Fuel carbon remains in products.",
    },
    pollutionRecords.incomplete.feedback,
    "Predict possibilities rather than one exact mixture.",
    "incomplete",
  ),
  choice(
    "r-hydrogen",
    "Carbon-free does not mean pollutant-free",
    "Which listed pollutant can form in the specified hot-air hydrogen burn?",
    "Oxides of nitrogen",
    {
      "Carbon soot from hydrogen": "Hydrogen contains no carbon.",
      "Sulfur dioxide from hydrogen": "No sulfur is supplied.",
    },
    pollutionRecords.hydrogen.feedback,
    "Track the intake air as well as fuel.",
    "hydrogen",
  ),
  choice(
    "r-carbon",
    "Track missing elements",
    "Can the specified carbon-and-sulfur burn produce water from its supplied reactants?",
    "No; no hydrogen is supplied",
    {
      "Yes; oxygen alone makes water": "Water needs hydrogen atoms.",
      "Yes; sulfur becomes hydrogen":
        "Chemical reactions do not turn sulfur into hydrogen.",
    },
    pollutionRecords.carbon.feedback,
    "Look for a source of hydrogen.",
    "carbon",
  ),
  choice(
    "r-sulfur",
    "Sulfur has a source",
    "Where do the sulfur atoms in the supplied SO₂ come from?",
    "Sulfur impurity in the fuel",
    {
      "Atmospheric nitrogen": "Nitrogen cannot supply sulfur atoms.",
      "Carbon dioxide": "CO₂ contains no sulfur.",
    },
    pollutionRecords.sulfur.feedback,
    "Elements are conserved.",
    "sulfur",
  ),
  choice(
    "r-nitrogen",
    "Air is a reactant source",
    "Why can a nitrogen-free fuel still produce NOₓ in a hot engine?",
    "Nitrogen and oxygen in intake air can react",
    {
      "Fuel carbon changes into nitrogen":
        "Element identities do not change in combustion.",
      "Only sulfur impurity can make NOₓ":
        "Sulfur oxidation explains SO₂ instead.",
    },
    pollutionRecords.nitrogen.feedback,
    "Follow both intake-air elements.",
    "nitrogen",
  ),
  choice(
    "r-shortage",
    "Incomplete carbon oxidation",
    "Which condition explains the specified CO formation?",
    "Insufficient oxygen for complete combustion",
    {
      "Sulfur impurity alone": "Sulfur is not needed to make CO.",
      "Cold nitrogen alone": "CO requires carbon and oxygen.",
    },
    pollutionRecords.shortage.feedback,
    "Contrast CO with complete carbon oxidation.",
    "shortage",
  ),
  numeric(
    "r-balanceCO",
    "Conserve oxygen",
    "In 2CH₄ +3O₂ →2CO +4H₂O, how many oxygen atoms are on the product side?",
    6,
    "atoms",
    "2CO has 2O atoms and 4H₂O has 4; total 6, matching 3O₂.",
    "Include oxygen in water.",
    "balanceCO",
  ),
  numeric(
    "r-balanceSoot",
    "Conserve hydrogen",
    "In CH₄ +O₂ →C +2H₂O, how many hydrogen atoms are on each side?",
    4,
    "atoms",
    "CH₄ contains 4H;2H₂O contains 2×2=4H.",
    "A coefficient multiplies the whole formula.",
    "balanceSoot",
  ),
  numeric(
    "r-balanceSulfur",
    "Keep sulfur atoms",
    "In S +O₂ →SO₂, how many sulfur atoms are on each side?",
    1,
    "atom",
    "There is one S atom on each side.",
    "Count sulfur separately from oxygen.",
    "balanceSulfur",
  ),
  numeric(
    "r-balanceNitrogen",
    "A nitrogen oxide",
    "For N₂ +O₂ →2NO, how many nitrogen atoms are on each side?",
    2,
    "atoms",
    "N₂ has 2N;2NO has 2×1N.",
    "NOₓ names a family; this reaction specifies NO.",
    "balanceNitrogen",
  ),
  choice(
    "r-coEffect",
    "An invisible toxic gas",
    "Why can sight and smell fail to detect CO?",
    "CO is colourless and odourless",
    {
      "It is harmless when invisible": "CO can be toxic without visible smoke.",
      "CO must smell like sulfur": "CO has no characteristic smell.",
    },
    pollutionRecords.coEffect.feedback,
    "Absence of visible smoke is not absence of CO.",
    "coEffect",
  ),
  choice(
    "r-sulfurEffect",
    "Acid-rain pathway",
    "Which effect is linked to SO₂?",
    "Acid rain and respiratory problems",
    {
      "Only a hole in the ozone layer":
        "Ozone depletion is a different mechanism.",
      "Purifying all rainwater":
        "SO₂ can contribute to acids in atmospheric water.",
    },
    pollutionRecords.sulfurEffect.feedback,
    "Follow the sulfur oxide into moist air.",
    "sulfurEffect",
  ),
  choice(
    "r-nitrogenEffect",
    "Shared effect, different source",
    "Which effect can NOₓ share with SO₂?",
    "Acid rain",
    {
      "Turning carbon into sulfur": "Chemical reactions conserve elements.",
      "Making every respiratory risk disappear":
        "Nitrogen oxides can harm respiration.",
    },
    pollutionRecords.nitrogenEffect.feedback,
    "Different pollutants can form acidic substances.",
    "nitrogenEffect",
  ),
  choice(
    "r-particleEffect",
    "Global dimming",
    "What does global dimming mean here?",
    "Less solar radiation reaches the surface",
    {
      "The Sun stops emitting energy":
        "The particle effect occurs between source and surface.",
      "The greenhouse effect becomes an ozone hole":
        "These are different mechanisms.",
    },
    pollutionRecords.particleEffect.feedback,
    "Follow incoming sunlight.",
    "particleEffect",
  ),
  numeric(
    "r-equal",
    "Sulfur in equal masses",
    "Using the original fuel table, what sulfur mass is burned in FuelA?",
    20,
    "g",
    pollutionRecords.equal.feedback,
    "2% of 1000 g.",
    "equal",
  ),
  numeric(
    "r-unequal",
    "Sulfur in unequal masses",
    "Using the original fuel table, what sulfur mass is burned in FuelB?",
    30,
    "g",
    pollutionRecords.unequal.feedback,
    "0.6% of 5000 g.",
    "unequal",
  ),
  numeric(
    "r-filter",
    "Reduction has a denominator",
    "What percentage of the original supplied particle rate is removed?",
    75,
    "%",
    pollutionRecords.filter.feedback,
    "Divide the decrease by the original rate.",
    "filter",
  ),
  numeric(
    "r-desulfur",
    "Target sulfur",
    "What percentage of the original supplied SO₂ rate is removed?",
    75,
    "%",
    pollutionRecords.desulfur.feedback,
    "Use 80 g/hour as the denominator.",
    "desulfur",
  ),
  numeric(
    "r-oxygenControl",
    "More complete burning",
    "What percentage of the original supplied CO rate is removed?",
    75,
    "%",
    pollutionRecords.oxygenControl.feedback,
    "Use 12 g/hour as the denominator.",
    "oxygenControl",
  ),
];
const guided = [
  choice(
    "g-products",
    "Predict products",
    "Which two combustion products form?",
    "CO₂ and water",
    {
      "CO and soot only": "These indicate incomplete combustion.",
      "SO₂ and NOₓ": "Check the stated sulfur and temperature conditions.",
    },
    pollutionRecords.complete.feedback,
    "Use the supplied elements and conditions.",
    "complete",
  ),
  choice(
    "g-source",
    "Trace pollutant formation",
    "Construct the source→partner→condition route for engine NOₓ. Where is the nitrogen supplied?",
    "Intake air",
    {
      "Only fuel carbon": "Carbon cannot supply nitrogen atoms.",
      "Only water": "Water contains no nitrogen.",
    },
    pollutionRecords.nitrogen.feedback,
    "Include intake air in your atom sources.",
    "nitrogen",
  ),
  numeric(
    "g-balance",
    "Balance without changing formulae",
    "Construct a balanced methane-to-CO reaction. In its smallest whole-number balance, how many O₂ molecules react with 2CH₄ molecules?",
    3,
    "molecules",
    pollutionRecords.balanceCO.feedback,
    "Count oxygen in both CO and water.",
    "balanceCO",
  ),
  choice(
    "g-effects",
    "Build a cause and effect",
    "Construct the particle mechanism→effect chain. Which radiation quantity is reduced at the surface?",
    "Incoming sunlight",
    {
      "All infrared emission forever":
        "Particles do not permanently stop all radiation.",
      "The Sun’s own energy output":
        "Atmospheric particles affect transmission, not the Sun itself.",
    },
    pollutionRecords.particleEffect.feedback,
    "Distinguish solar transmission from greenhouse infrared absorption.",
    "particleEffect",
  ),
  numeric(
    "g-fuels",
    "Use fuel composition",
    "Compare the equal 1 kg samples. What sulfur mass is in the fuel predicted to make most SO₂?",
    20,
    "g",
    pollutionRecords.equal.feedback,
    "Find greatest sulfur content and keep masses equal.",
    "equal",
  ),
  numeric(
    "g-control",
    "Audit an emission control",
    "Use the filter measurements to calculate the percentage reduction and identify what is unresolved.",
    75,
    "%",
    pollutionRecords.filter.feedback,
    "Use decrease/original×100, then ask which pollutant was measured.",
    "filter",
  ),
];
const fuelPractice: PollutionGiven = {
  title: "Three original fuel samples",
  note: "1 kg of each is burned under comparable conditions; every sulfur atom forms SO₂. Particle ranking is supplied, not deduced from sulfur content.",
  fuels: [
    { name: "A", mass: 1, sulfur: 3, particles: "Medium" },
    { name: "B", mass: 1, sulfur: 0.2, particles: "High" },
    { name: "C", mass: 1, sulfur: 0.01, particles: "Low" },
  ],
};
const fuelUnequal: PollutionGiven = {
  title: "Check total sulfur burned",
  note: "Different fuel masses are burned. Every sulfur atom forms SO₂; particle ranking is for each listed burn.",
  fuels: [
    { name: "A", mass: 1, sulfur: 2, particles: "Medium" },
    { name: "B", mass: 4, sulfur: 0.8, particles: "High" },
    { name: "C", mass: 2, sulfur: 0.1, particles: "Low" },
  ],
};
const monitoring = (
  title: string,
  pollutant: string,
  before: number,
  after: number,
  unit: string,
  other: string,
): PollutionGiven => ({
  title,
  note: "Original exercise measurements at matched operating conditions and equal fuel input. These rates do not supply a health threshold or legal limit.",
  monitor: { pollutant, before, after, unit, other },
});
const practice = [
  choice(
    "p-complete",
    "Complete combustion prediction",
    "Pure propane burns completely in oxygen. There is no sulfur or nitrogen in the supplied reactants. Which pair forms?",
    "CO₂ and water",
    {
      "SO₂ and NOₓ": "No sulfur or nitrogen was supplied.",
      "CO and soot only":
        "The supplied complete-combustion condition excludes incomplete oxidation.",
    },
    "Propane supplies carbon and hydrogen; complete combustion forms CO₂ and water.",
    "Track each fuel element.",
  ),
  written(
    "p-mixture",
    "Avoid a fixed-mixture claim",
    "A student claims that insufficient oxygen makes all methane carbon become CO. Explain why this is too definite.",
    "Insufficient oxygen can cause incomplete combustion. Products can include CO and carbon soot alongside CO₂ and water. The oxygen shortage alone does not specify their proportions or require all carbon to become CO.",
    [
      "State insufficient oxygen/incomplete combustion.",
      "Explain that carbon products can include CO, soot and CO₂ together.",
      "Reject a universal single product or fixed ratio from oxygen shortage alone.",
    ],
    "Distinguish possible products from fixed proportions.",
  ),
  written(
    "p-hydrogen",
    "Consider intake air",
    "Explain why pure hydrogen combustion in very hot air need not have a pollutant-free exhaust.",
    "Hydrogen contains no carbon or sulfur, so it does not supply those elements for CO₂,CO, soot or SO₂. It forms water, but at very high temperature nitrogen and oxygen in intake air can react to form NOₓ. This is different from hydrogen use in a fuel cell.",
    [
      "Track absence of fuel carbon/sulfur.",
      "Include intake-air nitrogen and oxygen.",
      "Link very high temperature to NOₓ formation; do not claim every hydrogen use has the same products.",
    ],
    "Include both fuel and intake air.",
  ),
  choice(
    "p-carbon",
    "No supplied hydrogen",
    "Pure carbon burns completely in oxygen. Which product is predicted?",
    "CO₂",
    {
      "Water only": "No hydrogen is supplied.",
      "SO₂": "No sulfur is supplied.",
    },
    "C +O₂ →CO₂; a fuel without hydrogen cannot produce water from those stated reactants.",
    "Conserve the supplied elements.",
  ),
  choice(
    "p-sulfurCondition",
    "Use the fuel impurity",
    "A sulfur-containing hydrocarbon burns completely. Why can SO₂ be produced even with sufficient oxygen?",
    "Sulfur impurity reacts with oxygen",
    {
      "SO₂ requires incomplete combustion":
        "Sulfur oxidation can occur during complete fuel burning.",
      "Fuel hydrogen changes into sulfur": "Element identities are conserved.",
    },
    "Complete carbon oxidation does not prevent sulfur impurities from forming SO₂.",
    "Complete/incomplete describes oxidation conditions, not purity.",
  ),
  written(
    "p-nitrogen",
    "Explain hot-engine NOₓ",
    "Explain how NOₓ can form when a nitrogen-free hydrocarbon burns in a hot air-fed engine.",
    "Nitrogen and oxygen enter from the air. At very high engine temperatures they can react to form oxides of nitrogen. The nitrogen does not need to be in the fuel.",
    [
      "Name nitrogen from intake air.",
      "Name oxygen as reacting partner.",
      "Explain high temperature permits their reaction; fuel need not contain nitrogen.",
    ],
    "Identify both air gases and the condition.",
  ),
  written(
    "p-sulfur",
    "Explain sulfur dioxide formation",
    "Explain why fuels with sulfur impurities can emit SO₂ when burned.",
    "Sulfur impurities in the fuel react with oxygen during combustion to form sulfur dioxide. Reducing sulfur content can reduce this pollutant pathway.",
    [
      "Locate sulfur atoms in fuel impurities.",
      "Identify reaction with oxygen.",
      "Name sulfur dioxide, preserving sulfur atoms.",
    ],
    "Track the sulfur atoms.",
  ),
  choice(
    "p-noxError",
    "Diagnose the wrong cause",
    "Which explanation of engine NOₓ is scientifically supported?",
    "Intake nitrogen and oxygen react at high temperature",
    {
      "A shortage of oxygen turns carbon into nitrogen":
        "CO formation and NOₓ formation have different explanations; elements do not change identities.",
      "Sulfur in fuel becomes nitrogen":
        "Sulfur atoms cannot become nitrogen in combustion.",
    },
    "High temperature promotes reaction between nitrogen and oxygen from the air.",
    "Separate nitrogen-source reasoning from incomplete carbon combustion.",
  ),
  balance(
    "p-balanceCO",
    "Construct methane-to-CO coefficients",
    methaneCO,
    [2, 3, 2, 4],
  ),
  balance(
    "p-balanceSoot",
    "Construct soot-pathway coefficients",
    methaneSoot,
    [1, 1, 1, 2],
  ),
  balance(
    "p-balanceSulfur",
    "Construct sulfur-oxide coefficients",
    sulfurEquation,
    [1, 1, 1],
  ),
  balance(
    "p-balanceNO",
    "Construct nitrogen-oxide coefficients",
    nitrogenEquation,
    [1, 1, 2],
  ),
  choice(
    "p-invisible",
    "Describe CO detection",
    "Which pair of properties explains why CO is hard to notice using human senses?",
    "Colourless and odourless",
    {
      "Dark and strongly scented": "Those properties do not describe CO.",
      "A visible solid and harmless": "CO is a toxic gas.",
    },
    "CO can be present without visible colour or smell.",
    "Do not use visible soot as a CO test.",
  ),
  written(
    "p-toxic",
    "Explain CO toxicity",
    "Explain how CO can harm a person, rather than just calling it a pollutant.",
    "CO is toxic because it binds haemoglobin, reducing blood’s ability to deliver oxygen to body tissues. It is colourless and odourless, so sight and smell cannot establish that it is absent.",
    [
      "Link CO to haemoglobin and reduced oxygen delivery.",
      "Describe colourless/odourless properties and the detection limitation.",
      "Keep CO distinct from CO₂.",
    ],
    "Connect the gas to oxygen transport.",
  ),
  written(
    "p-smoke",
    "Evaluate a detection claim",
    "Someone claims no smoke and no smell prove an enclosed space has no CO. Evaluate the scientific reasoning.",
    "The conclusion is unsupported. CO is colourless and odourless, so neither clear-looking air nor no smell proves its absence. Soot is a different product; visible particles are not a CO measurement. Appropriate detection is needed, not a sensory test.",
    [
      "Reject proof from sight/smell.",
      "State CO is colourless and odourless.",
      "Distinguish soot from CO and identify the need for appropriate measurement.",
    ],
    "Ask which substance each observation detects.",
  ),
  written(
    "p-acid",
    "Explain acid-rain damage",
    "Explain a route from burning sulfur-containing fuel to damage of a limestone building.",
    "Sulfur impurity burns in oxygen to form SO₂. Atmospheric reactions and water can form acids, contributing to acid rain. Acids react with the calcium carbonate in limestone, causing erosion. SO₂ can also cause respiratory problems.",
    [
      "Explain sulfur impurity→SO₂.",
      "Link atmospheric reactions/water to acidic rain.",
      "Explain acid reacting with carbonate stone and erosion, rather than greenhouse heating.",
    ],
    "Build a chemical cause→effect chain.",
  ),
  choice(
    "p-sharedAcid",
    "Two acid-rain contributors",
    "Which pair can contribute to both acid rain and respiratory problems?",
    "SO₂ and oxides of nitrogen",
    {
      "CO and water only":
        "CO has a different main hazard; water alone is not the stated acid-rain pollutant pair.",
      "Only CO₂ and oxygen":
        "This omits the sulfur/nitrogen oxides required here.",
    },
    "SO₂ and NOₓ can form acidic substances in atmospheric water and harm respiration.",
    "Match pollutant-specific effects.",
  ),
  written(
    "p-dimming",
    "Explain particulate global dimming",
    "Explain how particulates can cause global dimming and why this does not make them harmless.",
    "Suspended particles scatter and absorb some incoming sunlight, so less solar radiation reaches Earth’s surface. That reduction is global dimming. Particles also cause health/respiratory problems; their presence is not a harmless solution to greenhouse warming.",
    [
      "Describe suspended particles scattering/absorbing solar radiation.",
      "Link to less sunlight reaching the surface.",
      "State health/respiratory harm and distinguish greenhouse infrared/ozone mechanisms.",
    ],
    "Follow incoming sunlight and consider human health separately.",
  ),
  choice(
    "p-health",
    "Particles can harm health",
    "Which statement about combustion particulates is correct?",
    "They can cause respiratory and other health problems",
    {
      "They are harmless because they are solid":
        "Small particles can remain airborne and be inhaled.",
      "They only contain beneficial oxygen":
        "Soot can contain carbon and other particulates vary.",
    },
    "Solid particles can be suspended and inhaled; solid state does not make them harmless.",
    "Consider particle size and exposure.",
  ),
  choice(
    "p-mechanisms",
    "Separate environmental mechanisms",
    "Which description identifies enhanced greenhouse warming rather than particulate dimming?",
    "Increased absorption and emission of outgoing infrared by greenhouse gases",
    {
      "Less incoming sunlight reaches the surface due to particles":
        "That describes global dimming.",
      "Acids react with limestone": "That describes acid damage.",
    },
    "Greenhouse gases affect infrared energy exchange; particulates can reduce incoming sunlight. Distinguish these mechanisms.",
    "Identify the radiation direction and type.",
  ),
  written(
    "p-fuelReason",
    "Justify a fuel-table prediction",
    "Using the supplied table, identify which fuel would produce most SO₂ and explain why under the stated assumptions.",
    "FuelA: equal 1 kg masses are burned andA has the highest sulfur percentage,3%, hence greatest sulfur mass,30 g. With every sulfur atom forming SO₂, it produces most SO₂. This does not rank every other emission.",
    [
      "IdentifyA.",
      "Use equal masses and the largest sulfur percentage/mass as the reason.",
      "Link sulfur burning in oxygen to SO₂, with the supplied conversion condition.",
    ],
    "Give a fuel and a table-based reason.",
    fuelPractice,
  ),
  numeric(
    "p-unequal",
    "Compute sulfur from unequal burns",
    "Using the table, calculate sulfur mass burned in FuelB.",
    32,
    "g",
    "4 kg=4000 g;0.8/100×4000=32 g. FuelA burns 20 g, so a lower percentage can still give more total sulfur.",
    "Use mass×fraction, not percentage alone.",
    undefined,
    fuelUnequal,
  ),
  choice(
    "p-particleRank",
    "Read supplied particle evidence",
    "Using the table, which fuel produces the fewest particles in the listed burn?",
    "FuelC",
    {
      FuelA: "A has medium supplied particle emission.",
      FuelB: "B has high supplied particle emission.",
    },
    "C is listed as low. Use the particle data; sulfur content alone is not a complete particle-emission predictor.",
    "Read the column that measures the requested pollutant.",
    undefined,
    fuelPractice,
  ),
  written(
    "p-energyBasis",
    "Know what a fuel table cannot decide",
    "Can a table of emissions per kilogram alone establish the cleanest fuel for providing the same useful electrical energy? Explain.",
    "No. Different fuels and generators can provide different useful energy per kilogram. Compare emissions for the same useful energy and relevant pollutants, using energy output and efficiency data. A sulfur or particle ranking alone is not an overall environmental verdict.",
    [
      "Reject an overall equal-energy verdict from per-kilogram data alone.",
      "Identify useful energy output/efficiency and equal service basis.",
      "Consider several pollutants rather than one ranking.",
    ],
    "Check whether the service being compared is equal.",
  ),
  numeric(
    "p-filter",
    "Calculate a particle reduction",
    "Use the supplied measurements to calculate the percentage reduction from the original particle rate.",
    80,
    "%",
    "100−20=80 mg/min;80/100×100=80%.20 mg/min remains.",
    "Use the original rate as denominator.",
    undefined,
    monitoring(
      "Filter test",
      "Particulates",
      100,
      20,
      "mg/min",
      "Only particles are measured; gaseous pollutants are unmeasured.",
    ),
  ),
  written(
    "p-desulfur",
    "Explain a targeted control",
    "Explain how removing sulfur impurity before burning affects SO₂ emissions and why it is not a complete pollution solution.",
    "Removing sulfur reduces the sulfur atoms available to react with oxygen, so SO₂ emissions can fall. It does not remove fuel carbon or eliminate high-temperature nitrogen–oxygen reactions;CO,CO₂,NOₓ and particles need separate consideration.",
    [
      "Link reduced sulfur to less SO₂ formation.",
      "State a remaining carbon/air-origin pollutant path.",
      "Avoid claiming every pollutant or all lifetime emissions are zero.",
    ],
    "Which elemental source does the treatment change?",
  ),
  written(
    "p-oxygenControl",
    "Explain more complete burning",
    "Explain why sufficient oxygen can reduce CO and soot yet leave other environmental concerns.",
    "More complete combustion oxidises fuel carbon towards CO₂ rather than CO or soot, reducing those incomplete-combustion products. CO₂ is still a greenhouse gas; at high temperatures nitrogen and oxygen from air can still form NOₓ. Changing oxygen supply is not proof that every pollutant disappears.",
    [
      "Explain more complete carbon oxidation and reduced CO/soot.",
      "Identify continued CO₂ production/climate concern.",
      "Identify hot-air NOₓ or other unaffected pathway and reject universal zero emissions.",
    ],
    "Separate incomplete carbon oxidation from other formation mechanisms.",
  ),
  written(
    "p-allSafe",
    "Evaluate a treatment claim",
    "A particle filter cuts the supplied rate by 90%. Does that prove the exhaust is now safe and climate-neutral? Explain.",
    "No.10% of the original particle rate remains and a particle measurement does not establish exposure or a safe threshold. A filter does not remove every gas;CO,NOₓ,SO₂ or CO₂ need separate measurement/control. A particle reduction alone is not climate neutrality.",
    [
      "Identify nonzero remaining particles.",
      "Reject a safety verdict without exposure/threshold evidence.",
      "Explain unmeasured gaseous pollutants and separate CO₂ climate effects.",
    ],
    "Ask what was measured and what was not.",
  ),
  construct(
    "p-monitor",
    "Construct a measured reduction",
    "Calculate the decrease and percentage reduction relative to the original CO rate.",
    [
      ["removed", "Decrease / g/hour", 18],
      ["reduction", "Percentage reduction / %", 75],
    ],
    monitoring(
      "CO treatment test",
      "CO",
      24,
      6,
      "g/hour",
      "No CO₂,NOₓ or particle result is supplied.",
    ),
    "24−6=18 g/hour;18/24×100=75%. The remaining 6 g/hour is not zero.",
    "Find the absolute change first, then divide by the original.",
  ),
];
practice.push(
  choice(
    "p-particulateRange",
    "Particles are more than soot",
    "Which statement about combustion particulates is accurate?",
    "Solid particles and unburned hydrocarbons can contribute to atmospheric particulates",
    {
      "Every particulate is necessarily pure carbon":
        "Soot is carbon particles, but the wider particulate category is not limited to pure carbon.",
      "All particulates are harmless gases":
        "Particles can harm health and affect incoming solar radiation.",
    },
    "Soot is carbon particles. Fuel combustion can also release other solid particles and unburned hydrocarbons that contribute to particulates; composition and size can vary.",
    "Distinguish carbon soot from the broader particulate category.",
  ),
);
const ethaneCO: PollutionEquation = {
  left: [
    { formula: "C₂H₆", atoms: { C: 2, H: 6 }, field: "a" },
    { formula: "O₂", atoms: { O: 2 }, field: "b" },
  ],
  right: methaneCO.right,
};
const propaneCO: PollutionEquation = {
  left: [
    { formula: "C₃H₈", atoms: { C: 3, H: 8 }, field: "a" },
    { formula: "O₂", atoms: { O: 2 }, field: "b" },
  ],
  right: methaneCO.right,
};
const checkForms = [
  [
    written(
      "cA-predict",
      "Predict unfamiliar fuel products",
      "A pure fuel contains carbon and hydrogen, no sulfur. It burns with insufficient oxygen in air at very high temperature. Predict possible products and explain their sources.",
      "Carbon can form CO₂,CO and soot under incomplete-combustion conditions; hydrogen forms water. Very hot intake nitrogen and oxygen can form NOₓ. No fuel sulfur is supplied for SO₂. Product ratios are not fixed by oxygen shortage alone.",
      [
        "Link limited oxygen to possible CO/soot alongside CO₂.",
        "Include water from hydrogen.",
        "Include high-temperature air-origin NOₓ.",
        "Exclude SO₂ from the stated sulfur-free reactants; avoid a fixed ratio.",
      ],
      "Track every element source and condition.",
    ),
    balance(
      "cA-balance",
      "Balance an ethane-to-CO pathway",
      ethaneCO,
      [2, 5, 4, 6],
    ),
    written(
      "cA-CO",
      "Explain an invisible CO hazard",
      "Explain why CO can harm someone without visible smoke or an obvious smell.",
      "CO is colourless and odourless, so senses cannot establish its absence. It binds haemoglobin, reducing oxygen delivery to tissues. Soot is a different product and is not a CO measurement.",
      [
        "State colourless and odourless.",
        "Link haemoglobin binding to reduced oxygen transport.",
        "Reject smoke/smell as proof of CO absence.",
      ],
      "Separate detection from toxic mechanism.",
    ),
    written(
      "cA-acid",
      "Explain a chemical environmental pathway",
      "Explain how hot-engine emissions can contribute to acid rain and one consequence.",
      "Nitrogen and oxygen from intake air react at very high temperature to form NOₓ. Atmospheric reactions and water can produce acids. Acid rain can harm aquatic ecosystems or react with carbonate stone, causing erosion.",
      [
        "Name intake nitrogen and oxygen, and high temperature.",
        "Link NOₓ to acid formation in atmospheric water.",
        "Explain a specific ecosystem/carbonate-stone consequence.",
      ],
      "Give source, formation and consequence.",
    ),
    numeric(
      "cA-sulfur",
      "Calculate a sulfur inventory",
      "A 2 kg fuel sample contains 0.4% sulfur by mass. How many grams of sulfur are burned?",
      8,
      "g",
      "2 kg=2000 g;0.004×2000=8 g.",
      "Convert mass units and use the percentage as a fraction.",
    ),
    construct(
      "cA-control",
      "Audit particle measurements",
      "Calculate the decrease and percentage reduction relative to the original particle rate.",
      [
        ["removed", "Decrease / mg/min", 45],
        ["reduction", "Percentage reduction / %", 75],
      ],
      monitoring(
        "A separate filter test",
        "Particulates",
        60,
        15,
        "mg/min",
        "This test does not measure gaseous pollutants.",
      ),
      "60−15=45 mg/min;45/60×100=75%.",
      "Use the original rate, not the new rate.",
    ),
    choice(
      "cA-dimming",
      "Interpret particle radiation effects",
      "Which statement describes global dimming?",
      "Less sunlight reaches the surface due to atmospheric particles",
      {
        "All greenhouse gases are permanently removed":
          "Dimming does not remove greenhouse gases.",
        "The ozone layer becomes thicker automatically":
          "Ozone is a separate issue.",
      },
      "Particles scatter/absorb incoming sunlight and can reduce surface solar radiation.",
      "Identify the radiation path.",
    ),
    written(
      "cA-limit",
      "Evaluate a filter conclusion",
      "Explain why a measured particle reduction does not prove all exhaust pollutants are removed.",
      "A particle filter targets particles, not every gas.CO,NOₓ,SO₂ and CO₂ can require separate measurement and controls. Nonzero remaining emissions, operating conditions and exposure matter; a single reduction does not establish safe or climate-neutral exhaust.",
      [
        "Identify the particle-specific measurement/treatment.",
        "Name at least one unmeasured gaseous pollutant and separate pathway.",
        "Reject a universal safety/zero-emission conclusion.",
      ],
      "Identify the limits of the measurement.",
    ),
  ],
  [
    written(
      "cB-predict",
      "Compare oxygen conditions",
      "Describe how products from a pure hydrocarbon in oxygen can change when oxygen becomes insufficient. No sulfur or nitrogen is supplied.",
      "With sufficient oxygen and complete combustion, carbon forms CO₂ and hydrogen forms water. Insufficient oxygen can allow CO and carbon soot, sometimes alongside CO₂ and water. No sulfur or nitrogen was supplied for SO₂ or NOₓ; no exact mixture ratio follows.",
      [
        "Describe complete CO₂/water products.",
        "Describe possible CO/soot with limited oxygen.",
        "Conserve absent sulfur/nitrogen and avoid universal proportions.",
      ],
      "Compare complete and incomplete carbon oxidation.",
    ),
    balance(
      "cB-balance",
      "Balance a propane-to-CO pathway",
      propaneCO,
      [2, 7, 6, 8],
    ),
    choice(
      "cB-source",
      "Locate nitrogen atoms",
      "A nitrogen-free fuel forms NOₓ in a hot air-fed engine. What supplies the nitrogen atoms?",
      "Intake air",
      {
        "The fuel carbon becomes nitrogen":
          "Combustion conserves element identities.",
        "SO₂ contains nitrogen": "SO₂ contains sulfur and oxygen.",
      },
      "Nitrogen from air reacts with oxygen at high temperature.",
      "Consider reactants beyond the fuel.",
    ),
    written(
      "cB-dimming",
      "Explain two particulate problems",
      "Explain a radiation effect and a health effect of combustion particulates.",
      "Particles suspended in air can scatter/absorb sunlight, reducing solar radiation at the surface and causing global dimming. They can be inhaled and cause respiratory/other health problems. This is distinct from greenhouse infrared absorption.",
      [
        "Explain scattering/absorption of incoming solar radiation.",
        "Connect to less sunlight at the surface/global dimming.",
        "State respiratory/health harm without claiming a harmless climate solution.",
      ],
      "Separate radiation and inhalation pathways.",
    ),
    numeric(
      "cB-sulfur",
      "Calculate another sulfur inventory",
      "A 3 kg fuel sample contains 0.7% sulfur by mass. How many grams of sulfur are present?",
      21,
      "g",
      "3 kg=3000 g;0.007×3000=21 g.",
      "Convert to grams and calculate a fraction of the total.",
    ),
    construct(
      "cB-control",
      "Audit another emission treatment",
      "Calculate the decrease and percentage reduction relative to the original SO₂ rate.",
      [
        ["removed", "Decrease / g/hour", 72],
        ["reduction", "Percentage reduction / %", 80],
      ],
      monitoring(
        "Sulfur treatment test",
        "SO₂",
        90,
        18,
        "g/hour",
        "No information about the other pollutants is supplied.",
      ),
      "90−18=72 g/hour;72/90×100=80%.",
      "Use the original SO₂ rate as denominator.",
    ),
    choice(
      "cB-CO",
      "Keep CO distinct",
      "Which statement correctly describes CO?",
      "A colourless, odourless toxic gas",
      {
        "A visible carbon solid": "Soot is a solid;CO is a gas.",
        "An interchangeable name for CO₂":
          "The substances differ in composition and properties.",
      },
      "CO is hard to detect by senses and can reduce oxygen delivery.",
      "Read the formula and distinguish detection from visibility.",
    ),
    written(
      "cB-controlLimit",
      "Evaluate more complete combustion",
      "Explain why making hydrocarbon combustion more complete can reduce some pollutants without making emissions zero.",
      "More complete carbon oxidation can reduce CO and soot while forming CO₂. CO₂ remains a greenhouse gas. High-temperature nitrogen and oxygen in air can still form NOₓ, and fuel sulfur may still form SO₂. Those pathways require separate consideration.",
      [
        "Link more complete oxidation to reduced CO/soot.",
        "Explain remaining CO₂.",
        "Explain another unaffected source/pathway and reject zero-emission claims.",
      ],
      "Match each pollutant to its formation pathway.",
    ),
  ],
];
const reviewForms = [
  [
    choice(
      "vA-source",
      "Retrieve sulfur origin",
      "What is the source of sulfur in SO₂ from a sulfur-containing fuel?",
      "Sulfur impurity in the fuel",
      {
        "Intake nitrogen": "Nitrogen cannot supply sulfur atoms.",
        "Water alone": "Water contains no sulfur.",
      },
      "Fuel sulfur burns in oxygen to form SO₂.",
      "Conserve element identities.",
    ),
    numeric(
      "vA-sulfur",
      "Retrieve percent mass",
      "A 0.5 kg fuel sample contains 0.8% sulfur. What sulfur mass is present?",
      4,
      "g",
      "0.5 kg=500 g;0.008×500=4 g.",
      "Convert to grams first.",
    ),
    written(
      "vA-CO",
      "Retrieve CO reasoning",
      "Explain why clear-looking, odourless air does not establish that CO is absent, and state its toxic mechanism.",
      "CO is colourless and odourless, so senses cannot establish its absence. It binds haemoglobin and reduces oxygen delivery to tissues. Appropriate detection is required.",
      [
        "State colourless and odourless.",
        "Reject the sensory proof.",
        "Explain reduced oxygen transport through haemoglobin.",
      ],
      "Separate detection and toxicity.",
    ),
    numeric(
      "vA-filter",
      "Retrieve a reduction",
      "A matched particle rate falls from 50 to 20 mg/min. What is its percentage reduction?",
      60,
      "%",
      "Decrease 30 mg/min;30/50×100=60%.",
      "Divide the decrease by the original.",
    ),
  ],
  [
    choice(
      "vB-nitrogen",
      "Retrieve engine conditions",
      "Which condition helps intake nitrogen react with oxygen to form NOₓ?",
      "Very high engine temperature",
      {
        "Sulfur automatically becoming nitrogen":
          "Element identities do not change.",
        "A room-temperature nitrogen bottle alone":
          "The stated formation needs the reacting partner and hot conditions.",
      },
      "Hot-air nitrogen and oxygen can react.",
      "Recall both reactants and temperature.",
    ),
    numeric(
      "vB-sulfur",
      "Retrieve a new sulfur inventory",
      "A 4 kg fuel sample contains 0.3% sulfur. What sulfur mass is present?",
      12,
      "g",
      "4 kg=4000 g;0.003×4000=12 g.",
      "Use consistent units.",
    ),
    written(
      "vB-effects",
      "Retrieve distinct pathways",
      "Contrast particulate global dimming with acid-rain damage from SO₂.",
      "Particulates scatter/absorb incoming sunlight, reducing sunlight at the surface: global dimming. SO₂ can form acids through atmospheric reactions and water; acidic rain can damage carbonate stone or ecosystems. These are different physical/chemical pathways.",
      [
        "Explain reduced surface solar radiation from particles.",
        "Explain SO₂→acid formation in moist air.",
        "Give acid damage and keep the pathways distinct.",
      ],
      "Identify the pollutant and mechanism for each.",
    ),
    numeric(
      "vB-control",
      "Retrieve another reduction",
      "A matched CO rate falls from 30 to 12 g/hour. What is the percentage reduction?",
      60,
      "%",
      "Decrease 18 g/hour;18/30×100=60%.",
      "Use the original rate as denominator.",
    ),
  ],
];
const recoveries = [
  "r-complete",
  "r-incomplete",
  "r-hydrogen",
  "r-carbon",
  "r-sulfur",
  "r-nitrogen",
  "r-sulfur",
  "r-nitrogen",
  "r-balanceCO",
  "r-balanceSoot",
  "r-balanceSulfur",
  "r-balanceNitrogen",
  "r-coEffect",
  "r-coEffect",
  "r-shortage",
  "r-sulfurEffect",
  "r-nitrogenEffect",
  "r-particleEffect",
  "r-particleEffect",
  "r-particleEffect",
  "r-equal",
  "r-unequal",
  "r-equal",
  "r-unequal",
  "r-filter",
  "r-desulfur",
  "r-oxygenControl",
  "r-filter",
  "r-oxygenControl",
  "r-particleEffect",
];
export const pollutionRecoveryRoutes: Record<string, string> = {};
practice.forEach((q, i) => {
  q.followUp = id(recoveries[i]);
  pollutionRecoveryRoutes[q.id] = q.followUp;
});
export const allPollutionTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const pollutionExposureFamilies = {
  complete: ["r-complete", "g-products", "p-complete"],
  mixture: [
    "w-oxygen",
    "r-incomplete",
    "p-mixture",
    "cA-predict",
    "cB-predict",
  ],
  hydrogen: ["r-hydrogen", "p-hydrogen"],
  carbon: ["r-carbon", "p-carbon"],
  sulfur: ["r-sulfur", "p-sulfur", "p-sulfurCondition", "vA-source"],
  nitrogen: [
    "r-nitrogen",
    "g-source",
    "p-nitrogen",
    "p-noxError",
    "cB-source",
    "vB-nitrogen",
  ],
  coSource: ["r-shortage", "w-oxygen"],
  balanceCO: ["r-balanceCO", "g-balance", "p-balanceCO"],
  balanceSoot: ["r-balanceSoot", "p-balanceSoot"],
  balanceSulfur: ["r-balanceSulfur", "p-balanceSulfur"],
  balanceNO: ["r-balanceNitrogen", "p-balanceNO"],
  co: [
    "w-formula",
    "r-coEffect",
    "p-invisible",
    "p-toxic",
    "p-smoke",
    "cA-CO",
    "cB-CO",
    "vA-CO",
  ],
  acid: [
    "r-sulfurEffect",
    "r-nitrogenEffect",
    "p-acid",
    "p-sharedAcid",
    "cA-acid",
    "vB-effects",
  ],
  particles: [
    "r-particleEffect",
    "g-effects",
    "p-dimming",
    "p-health",
    "p-particulateRange",
    "p-mechanisms",
    "cA-dimming",
    "cB-dimming",
    "vB-effects",
  ],
  fuelBasis: ["p-energyBasis"],
  desulfur: ["r-desulfur", "p-desulfur"],
  oxygen: ["r-oxygenControl", "p-oxygenControl", "cB-controlLimit"],
  filter: ["r-filter", "g-control", "p-allSafe", "cA-limit"],
};
const groups = Object.values(pollutionExposureFamilies).map((v) => new Set(v));
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
    const q = allPollutionTasks.find((q) => q.id === id(s))!;
    q.exposureAliases = [...group].filter((o) => o !== s).map(id);
  }
export const pollutionJourney: LessonJourney = {
  version: 1,
  introduction:
    "Predict combustion products, trace pollutant sources and explain their distinct effects.",
  scopeNote:
    "AQA Chemistry/Trilogy atmospheric pollutants, both tiers. Includes original fuel and emission data; supplied conditions determine the predictions. Percentage calculations apply existing maths to stated inventories, not legal limits or safety thresholds. Written explanations are self-reviewed, not examiner marked.",
  outcomes: [
    "Predict possible combustion products using fuel composition, oxygen supply, intake air and temperature.",
    "Explain CO/soot, sulfur-oxide and hot-air nitrogen-oxide formation with conserved element sources.",
    "Balance fixed combustion pathways using coefficients and atom conservation.",
    "Explain colourless/odourless CO detection limits and reduced oxygen transport.",
    "Explain SO₂/NOₓ acid rain and respiratory harm; explain particulate global dimming and health effects.",
    "Use equal/unequal fuel tables and original-denominator reductions; state comparison and treatment limitations.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Predict products and trace their sources",
      taskIds: practice.slice(0, 8).map((q) => q.id),
    },
    {
      label: "Balance pathways and explain effects",
      taskIds: practice.slice(8, 20).map((q) => q.id),
    },
    {
      label: "Compare evidence and evaluate controls",
      taskIds: practice.slice(20).map((q) => q.id),
    },
  ],
};
