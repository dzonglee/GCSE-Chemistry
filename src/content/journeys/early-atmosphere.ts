import type { LearningTask, LessonJourney } from "../types";
import {
  atmosphereRecords,
  type AtmosphereGiven,
} from "../../lib/early-atmosphere";
const id = (s: string) => "early-atmosphere-v1-" + s;
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  given?: AtmosphereGiven,
): LearningTask {
  const options = [answer, ...Object.keys(errors)],
    n = [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % options.length;
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(n), ...options.slice(0, n)],
    misconceptions: errors,
    explanation,
    hint,
    ...(record
      ? {
          model: {
            kind: "atmosphere-investigation" as const,
            mode: atmosphereRecords[record].mode,
            record,
          },
        }
      : {}),
    ...(given ? { atmosphereGiven: given } : {}),
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
  given?: AtmosphereGiven,
  record?: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    inputMode: "decimal",
    tolerance: 0.000001,
    unit,
    explanation,
    hint,
    ...(given ? { atmosphereGiven: given } : {}),
    ...(record
      ? {
          model: {
            kind: "atmosphere-investigation" as const,
            mode: atmosphereRecords[record].mode,
            record,
          },
        }
      : {}),
  };
}
function written(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
  given?: AtmosphereGiven,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    rubric,
    hint,
    ...(given ? { atmosphereGiven: given } : {}),
  };
}
function bar(
  s: string,
  title: string,
  oxygen: number,
  dioxide: number,
  max: number,
): LearningTask {
  const step = max / 4,
    given = {
      title: "Original supplied estimate",
      note: `Oxygen ${oxygen}%; carbon dioxide ${dioxide}%. Complete an axis from 0 to ${max}% with four equal major intervals and plot oxygen. These are teaching values, not exact ancient measurements.`,
      bar: { max, oxygen, dioxide },
    };
  return {
    id: id(s),
    title,
    purpose: title,
    prompt: "Complete the three missing axis labels and your oxygen bar.",
    answer: JSON.stringify({
      scale1: String(step),
      scale2: String(2 * step),
      scale3: String(3 * step),
      height: String(oxygen),
    }),
    parts: [
      { id: "scale1", label: "First major tick / %", answer: step },
      { id: "scale2", label: "Second major tick / %", answer: 2 * step },
      { id: "scale3", label: "Third major tick / %", answer: 3 * step },
      { id: "height", label: "Your oxygen bar / %", answer: oxygen },
    ],
    partLegend: "Construct your scale and bar",
    explanation: `${max}÷4=${step} percentage points per interval. Labels ${step}, ${2 * step}, ${3 * step}; oxygen reaches ${oxygen}%. The supplied carbon dioxide bar stays at ${dioxide}%.`,
    hint: "Divide the endpoint by four equal intervals; use the supplied oxygen percentage for the bar.",
    atmosphereGiven: given,
  };
}
const modern = {
  title: "Supplied dry-air composition",
  note: "Use this table's precision; percentages make one 100% whole.",
  rows: [
    { label: "Oxygen", text: "20.9%" },
    { label: "Carbon dioxide", text: "0.04%" },
    { label: "Other gases except nitrogen", text: "0.96%" },
  ],
};
const graphA = {
  title: "Original reconstructed graph B",
  note: "Read the supplied model; these are illustrative reconstructed values, not direct ancient measurements.",
  graph: "coldA",
};
const graphB = {
  title: "Original reconstructed graph C",
  note: "Read the supplied model; these are illustrative reconstructed values, not direct ancient measurements.",
  graph: "coldB",
};
const warmup = [
  numeric(
    "w-whole",
    "Recall a percentage whole",
    "A gas mixture contains 75% gas A and 20% gas B. What percentage is left for all other gases?",
    5,
    "%",
    "100−75−20=5%.",
    "The whole mixture is 100%.",
  ),
  choice(
    "w-condense",
    "Recall condensation",
    "Water vapour becomes liquid water on cooling. What is this change?",
    "Condensation",
    {
      Evaporation: "Evaporation goes from liquid to gas.",
      "A new chemical element": "The substance stays water.",
    },
    "Condensation is a physical gas-to-liquid change.",
    "Compare the states before and after.",
  ),
  choice(
    "w-photosynth",
    "Recall photosynthesis",
    "Which gas does photosynthesis use as a reactant?",
    "Carbon dioxide",
    {
      Oxygen: "Oxygen is a product of photosynthesis.",
      Nitrogen: "Nitrogen is not a reactant in its word equation.",
    },
    "Photosynthesis uses carbon dioxide and water, with light energy.",
    "Recall the word equation.",
  ),
  numeric(
    "w-time",
    "Recall geological units",
    "How many million years are in 2.4 billion years?",
    2400,
    "million years",
    "2.4×1000=2400 million years.",
    "One billion is 1000 million.",
  ),
];
const refresher = [
  numeric(
    "r-composition",
    "Use a 100% whole",
    "Use the precise supplied table in the model. What is the nitrogen percentage?",
    78.09,
    "%",
    atmosphereRecords.precise.feedback,
    "Subtract both supplied non-nitrogen percentages.",
    undefined,
    "precise",
  ),
  choice(
    "r-ocean",
    "Cooling before condensation",
    "Which sequence forms oceans from water vapour?",
    "Cool → condense → liquid collects",
    {
      "Condense → heat → water vanishes":
        "Cooling allows liquid water to persist.",
      "Photosynthesis → oxygen becomes water":
        "Condensation needs a state change, not photosynthesis.",
    },
    atmosphereRecords.oceans.feedback,
    "Follow water's physical state.",
    "oceans",
  ),
  choice(
    "r-photo",
    "Use both sides of the equation",
    "Which complete word equation represents photosynthesis?",
    "Carbon dioxide + water → glucose + oxygen",
    {
      "Oxygen + glucose → carbon dioxide + water":
        "That is the overall respiration equation.",
      "Nitrogen + water → oxygen only":
        "This neither represents photosynthesis nor accounts for carbon.",
    },
    atmosphereRecords.plants.feedback,
    "Reactants are used; products are formed.",
    "plants",
  ),
  choice(
    "r-carbonate",
    "Store carbon in rock",
    "Which store can form from carbonate shells and skeletons?",
    "Limestone",
    {
      Coal: "Coal primarily comes from ancient plant remains.",
      "Atmospheric oxygen":
        "Carbonate carbon is not converted to oxygen atoms.",
    },
    atmosphereRecords.limestone.feedback,
    "Follow carbonate solids into sediment.",
    "limestone",
  ),
  choice(
    "r-coal",
    "Store plant carbon",
    "What can buried ancient land-plant material form over millions of years?",
    "Coal",
    {
      "Crude oil primarily from dinosaurs":
        "Oil is associated with ancient marine organisms, not a dinosaur origin.",
      "New nitrogen atoms":
        "These changes do not change carbon into another element.",
    },
    atmosphereRecords.coal.feedback,
    "Distinguish land-plant and marine origins.",
    "coal",
  ),
  choice(
    "r-oil",
    "Store marine carbon",
    "Which organisms are the main GCSE source associated with crude oil and natural gas?",
    "Ancient plankton and other marine organisms",
    {
      "Only land trees": "Land-plant remains are associated with coal.",
      "Modern volcanic oxygen":
        "Volcanic oxygen does not supply fossil biomass.",
    },
    atmosphereRecords.oil.feedback,
    "Consider buried marine biomass.",
    "oil",
  ),
  numeric(
    "r-graph",
    "Interpolate on an age axis",
    "On the model's straight oxygen segment, when is oxygen 14%?",
    1250,
    "million years ago",
    atmosphereRecords["graph-interpolate"].feedback,
    "Use halfway between the two supplied endpoints.",
    undefined,
    "graph-interpolate",
  ),
  choice(
    "r-evidence",
    "Distinguish inference and proof",
    "What does the CO₂-rich atmosphere of Mars/Venus do for an early-Earth theory?",
    "Provides indirect supporting comparison",
    {
      "Proves identical gas percentages":
        "Similar composition does not prove identical history.",
      "Replaces all geological evidence":
        "Independent geological evidence still matters.",
    },
    atmosphereRecords.planets.feedback,
    "Separate consistency with a theory from proof.",
    "planets",
  ),
];
const guided = [
  numeric(
    "g-composition",
    "Build modern air",
    "Build air: nitrogen percentage?",
    78,
    "%",
    atmosphereRecords.modern.feedback,
    "Keep the whole at 100%.",
    undefined,
    "modern",
  ),
  choice(
    "g-ocean",
    "Build an ocean sequence",
    "Which process converts water vapour to liquid during ocean formation?",
    "Condensation",
    {
      Photosynthesis:
        "Photosynthesis helps later oxygen accumulation, not this physical change.",
      Evaporation: "Evaporation produces gas rather than liquid.",
    },
    atmosphereRecords.oceans.feedback,
    "Arrange cooling, state change and collection.",
    "oceans",
  ),
  choice(
    "g-photo",
    "Build a chemical explanation",
    "What does photosynthesis do to atmospheric CO₂ and O₂?",
    "Uses CO₂ and releases O₂",
    {
      "Uses O₂ and releases CO₂":
        "That describes the overall direction of respiration.",
      "Destroys carbon atoms": "Atoms are conserved in chemical changes.",
    },
    atmosphereRecords.algae.feedback,
    "Construct the word equation with light.",
    "algae",
  ),
  choice(
    "g-store",
    "Build a long-term carbon route",
    "Which product is associated with buried marine biomass?",
    "Crude oil and natural gas",
    {
      "Coal from land plants": "That is a different biomass source.",
      "Limestone from carbonate shells": "That is a carbonate sediment route.",
    },
    atmosphereRecords.oil.feedback,
    "Match origin, formation and store.",
    "oil",
  ),
  numeric(
    "g-graph",
    "Read oxygen through time",
    "In reconstruction A, when does oxygen reach 12%?",
    1500,
    "million years ago",
    atmosphereRecords["graph-read"].feedback,
    "Locate 12 on the oxygen curve, then read the age axis.",
    undefined,
    "graph-read",
  ),
  numeric(
    "g-plateau",
    "Locate the first plateau",
    "In reconstruction A, when does nitrogen begin its constant-percentage section?",
    2500,
    "million years ago",
    atmosphereRecords["graph-plateau"].feedback,
    "Find where the dashed curve first becomes horizontal.",
    undefined,
    "graph-plateau",
  ),
  numeric(
    "g-bar",
    "Construct a percentage chart",
    "Complete the model's scale and bar. What percentage is the oxygen bar?",
    12,
    "%",
    atmosphereRecords["bar-twelve"].feedback,
    "Use equal scale gaps and the supplied percentage.",
    undefined,
    "bar-twelve",
  ),
  numeric(
    "g-bar-rescale",
    "Use a different scale",
    "Complete the second model’s scale. What percentage is its oxygen bar?",
    18,
    "%",
    atmosphereRecords["bar-eighteen"].feedback,
    "Keep equal intervals and preserve the supplied values.",
    undefined,
    "bar-eighteen",
  ),
  choice(
    "g-evidence",
    "Evaluate an ancient reconstruction",
    "How should a CO₂-rich model supported by ancient rocks be described?",
    "Evidence-supported but uncertain",
    {
      "An exact direct measurement":
        "No direct measurement covers Earth's ancient atmosphere.",
      "An unsupported guess with no evidence":
        "Rocks provide useful indirect evidence.",
    },
    atmosphereRecords.ancient.feedback,
    "State support and limitation together.",
    "ancient",
  ),
];
const practice = [
  numeric(
    "p-composition",
    "Calculate a missing percentage",
    "Use the supplied table. Calculate nitrogen's percentage.",
    78.1,
    "%",
    "100−20.9−0.04−0.96=78.10%.",
    "Subtract every supplied non-nitrogen component.",
    modern,
  ),
  choice(
    "p-approx",
    "Use appropriate rounding",
    "Modern proportions have been broadly similar for about 200 million years. Which pair is a useful approximation?",
    "About 80% nitrogen and 20% oxygen",
    {
      "About 80% oxygen and 20% nitrogen": "The gases have been reversed.",
      "About 80% carbon dioxide": "Modern CO₂ is a trace gas.",
    },
    "Four-fifths nitrogen and one-fifth oxygen is a coarse approximation; 78/21/1 is a more detailed rounded description.",
    "Identify the dominant gas.",
  ),
  numeric(
    "p-volume",
    "Use the same whole",
    "A 1000 cm³ dry-air sample is described as 21% oxygen. What is the oxygen volume?",
    210,
    "cm³",
    "0.21×1000=210 cm³ at the same conditions.",
    "Find 21% of the whole volume.",
  ),
  choice(
    "p-dry",
    "Separate water vapour from dry-air data",
    "Why is water vapour excluded from a dry-air composition table?",
    "Its variable content has been removed for that comparison",
    {
      "There is never water vapour in air":
        "Humidity varies; the word dry specifies the comparison.",
      "Water vapour is always 21%":
        "21% is the approximate oxygen fraction, not fixed humidity.",
    },
    "Dry-air tables exclude water vapour; ordinary atmospheric water vapour varies with conditions.",
    "Read what the denominator describes.",
  ),
  choice(
    "p-volcano",
    "Qualify the origin theory",
    "Which matches the required GCSE theory of Earth's early atmosphere?",
    "Intense volcanism supplied much CO₂ and water vapour, with little or no O₂",
    {
      "Photosynthesis produced the first CO₂-rich air":
        "Photosynthesis later removes CO₂ and releases O₂.",
      "Every ancient gas percentage was measured directly":
        "Ancient composition is reconstructed.",
    },
    "One theory describes intense volcanic activity in the first billion years, releasing mainly CO₂ and water vapour, nitrogen and possibly small methane/ammonia amounts. Exact proportions are uncertain.",
    "Distinguish a supported theory from precise measurement.",
  ),
  choice(
    "p-minor",
    "Recognise possible minor gases",
    "Which pair may have occurred in small amounts in an early-atmosphere model?",
    "Methane and ammonia",
    {
      "Only oxygen and ozone":
        "Little or no free oxygen is part of the proposed early model.",
      "Iron and sodium atoms as today's dominant gases":
        "These are not the required minor gas pair.",
    },
    "The GCSE model allows small amounts of methane and ammonia; it does not establish exact ancient percentages.",
    "Recall the possible minor volcanic gases.",
  ),
  written(
    "p-ocean",
    "Explain a physical sequence",
    "Explain how cooling could form oceans from early atmospheric water vapour.",
    "As Earth cooled, water vapour condensed into liquid water, which collected to form oceans. Condensation changes state without changing water's chemical identity.",
    [
      "Link Earth cooling to condensation of water vapour.",
      "Describe liquid water collecting as oceans; distinguish state change from chemical formation.",
    ],
    "Follow the state of the same substance.",
  ),
  choice(
    "p-dissolve",
    "Remove atmospheric CO₂ before forests",
    "Which process could lower atmospheric CO₂ after oceans formed, before widespread land plants?",
    "CO₂ dissolved in oceans and carbonates precipitated",
    {
      "Combustion of fossil fuels": "Combustion returns CO₂ to the atmosphere.",
      "All CO₂ atoms became nitrogen":
        "Chemical processes conserve element identity.",
    },
    "Dissolution transfers CO₂ from atmosphere to water; carbonate precipitation and sediment formation provide a longer-term carbon store.",
    "Consider ocean and rock processes without photosynthesis.",
  ),
  choice(
    "p-photo",
    "Connect biology and atmospheric change",
    "Why did algae and later plants help oxygen accumulate?",
    "They photosynthesised, using CO₂ and releasing O₂",
    {
      "They only respired, releasing O₂":
        "Respiration uses oxygen in its overall equation.",
      "Their roots converted nitrogen into oxygen":
        "Photosynthesis does not convert nitrogen atoms to oxygen.",
    },
    "Algae first produced oxygen about 2.7 billion years ago; subsequent photosynthesis and plant evolution raised atmospheric oxygen gradually, allowing animals to evolve.",
    "Use the photosynthesis equation.",
  ),
  written(
    "p-equation",
    "Write both products and the condition",
    "Write the photosynthesis word equation and a balanced symbol equation using glucose C₆H₁₂O₆. Identify the energy condition.",
    "Carbon dioxide + water → glucose + oxygen. Balanced: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂, with light supplying energy.",
    [
      "Include carbon dioxide and water as reactants.",
      "Include glucose and oxygen as products.",
      "Balance the symbol equation with 6CO₂, 6H₂O, one C₆H₁₂O₆ and 6O₂.",
      "State light as the energy condition, not a consumed chemical reactant.",
    ],
    "Separate substances from the energy condition.",
  ),
  numeric(
    "p-billion",
    "Read the same geological date",
    "Express 2700 million years ago in billion years ago.",
    2.7,
    "billion years ago",
    "2700÷1000=2.7 billion years ago.",
    "Divide millions by 1000.",
  ),
  choice(
    "p-nitrogen",
    "Explain nitrogen accumulation",
    "In the GCSE volcanic-origin model, why could the proportion of nitrogen increase?",
    "Nitrogen was released and built up as other gases were removed",
    {
      "Photosynthesis makes nitrogen its main gaseous product":
        "Its gaseous product is oxygen.",
      "CO₂ chemically becomes N₂":
        "Carbon does not change into nitrogen in these processes.",
    },
    "Volcanoes released nitrogen, which gradually accumulated; removal of CO₂ and water vapour also changed relative proportions.",
    "Consider gas supply and a changing total.",
  ),
  choice(
    "p-limestone",
    "Identify carbonate storage",
    "Which process stores carbon in limestone?",
    "Carbonate precipitation and accumulation of carbonate remains in sediment",
    {
      "Burning coal": "Burning releases CO₂.",
      "All marine material becomes crude oil":
        "Carbonate shells and organic biomass have different formation routes.",
    },
    atmosphereRecords.limestone.feedback,
    "Distinguish carbonates from organic remains.",
  ),
  choice(
    "p-coal",
    "Distinguish fossil origins",
    "Which origin is associated mainly with coal?",
    "Buried ancient plant material",
    {
      "Only plankton": "Marine biomass is associated with crude oil and gas.",
      "Modern atmospheric oxygen alone": "Coal contains carbon from biomass.",
    },
    atmosphereRecords.coal.feedback,
    "Use the source of carbon.",
  ),
  written(
    "p-fuels",
    "Explain oil and gas formation",
    "Describe the formation of crude oil and natural gas and explain how this stores carbon.",
    "Ancient plankton and other marine organisms died and were buried in sediment with limited oxygen, reducing complete decay. Over millions of years, heat and pressure changed the remains into crude oil and natural gas. Their carbon remains stored in these compounds rather than atmospheric CO₂; burning can return it.",
    [
      "Use ancient marine organisms/plankton and burial in sediment; limited oxygen reduces complete decay.",
      "Include heat, pressure and millions of years.",
      "Explain carbon storage without destroying carbon; combustion can return CO₂.",
    ],
    "Link source, conditions, time and carbon destination.",
  ),
  numeric(
    "p-graph",
    "Read a new oxygen curve",
    "In reconstruction B, when is oxygen 12%?",
    1200,
    "million years ago",
    "The solid oxygen curve is 12% at 1200 million years ago in reconstruction B.",
    "Read across from 12% to oxygen, then down to age.",
    graphA,
  ),
  numeric(
    "p-interpolate",
    "Interpolate on a descending age axis",
    "On reconstruction B's straight oxygen segment from 1800 to 1200 million years ago, when is oxygen 8%?",
    1500,
    "million years ago",
    "8% is halfway between 4% and 12%; age is halfway between 1800 and 1200: 1500 million years ago.",
    "Interpolate using the straight segment, not a modern percentage.",
    graphA,
  ),
  numeric(
    "p-plateau",
    "Identify first constant percentage",
    "In reconstruction B, when does nitrogen first reach its horizontal section?",
    1800,
    "million years ago",
    "The nitrogen curve becomes horizontal at 1800 million years ago.",
    "Find the start, not the end, of the plateau.",
    graphA,
  ),
  choice(
    "p-axis",
    "Read towards today",
    "Which direction represents later time on a ‘millions of years ago’ axis that runs 3600 on the left to 0 on the right?",
    "To the right, towards fewer years ago",
    {
      "To the left, towards more years ago":
        "More years ago means older, not later.",
      "Either direction has identical dates":
        "The labelled age values distinguish the dates.",
    },
    "The ages count down towards today. This reverses an ordinary ‘time since start’ axis.",
    "Interpret ‘ago’ before following a curve.",
  ),
  bar("p-bar", "Construct an original percentage chart", 18, 2, 24),
  numeric(
    "p-points",
    "Describe a percentage change",
    "Oxygen rises from 4% to 12% in a supplied model. What is the increase in percentage points?",
    8,
    "percentage points",
    "12−4=8 percentage points. The relative increase would be 200%; these are different quantities.",
    "Subtract percentages for percentage points.",
  ),
  choice(
    "p-plateau-limit",
    "Limit a constant-percentage claim",
    "A graph shows nitrogen's percentage constant. What can you conclude without the total amount of air?",
    "Its fraction is constant; absolute nitrogen amount is not established",
    {
      "The number of nitrogen molecules is certainly constant":
        "Percentage is relative to a whole whose amount is not supplied.",
      "No nitrogen can enter or leave":
        "Balanced changes could preserve the fraction.",
    },
    "A constant proportion alone cannot determine the total amount of nitrogen or whether gas flows occur.",
    "Separate a fraction from an absolute amount.",
  ),
  written(
    "p-evidence",
    "Evaluate an uncertain reconstruction",
    "A model estimates ancient gas percentages using old rocks and Mars/Venus comparisons. Explain why it can be useful without being exact.",
    "Rocks and planet comparisons provide indirect evidence consistent with a CO₂-rich early atmosphere. There are no direct gas measurements spanning 4.6 billion years; the record is incomplete and rocks can change. Evaluate the quality and agreement of evidence and revise models when new evidence appears, rather than claiming exact percentages or no evidence.",
    [
      "Identify geological/planet comparisons as indirect evidence.",
      "Give a specific limitation such as altered/incomplete ancient rocks or unavailable ancient gas measurements.",
      "Explain that evidence constrains a revisable theory without proving exact composition.",
    ],
    "State evidence, limitation and what follows.",
  ),
  written(
    "p-synthesis",
    "Explain both major changes",
    "Explain why CO₂ decreased and O₂ increased, including oceans, carbon stores and living organisms.",
    "Cooling formed oceans; CO₂ dissolved and carbonates formed sedimentary stores such as limestone. Algae and later plants used CO₂ in photosynthesis and released O₂ with light energy. Carbon also became stored in biomass and fossil fuels: coal from ancient plants; crude oil/natural gas from buried marine organisms under heat and pressure over millions of years. Oxygen accumulated gradually, enabling animals to evolve.",
    [
      "Use ocean dissolution and carbonate/sedimentary storage to lower CO₂.",
      "Link photosynthesis in algae/plants to both CO₂ use and O₂ release.",
      "Identify coal and oil/gas origins and long-term burial conditions.",
      "State gradual oxygen increase rather than immediate modern air.",
    ],
    "Connect physical, geological and biological routes.",
  ),
];
const checkForms = [
  [
    numeric(
      "cA-whole",
      "Use supplied percentages",
      "A supplied dry-air table gives oxygen 20.8%, carbon dioxide 0.05% and other non-nitrogen gases 0.95%. Calculate nitrogen.",
      78.2,
      "%",
      "100−20.8−0.05−0.95=78.2%.",
      "Use the complete 100% whole.",
    ),
    choice(
      "cA-origin",
      "Apply the early model",
      "Which claim is consistent with the required volcanic-origin theory?",
      "Mainly CO₂, water vapour and little/no oxygen",
      {
        "Today's air was present immediately":
          "Modern oxygen accumulated later.",
        "The theory gives exact measured ancient percentages":
          "The ancient composition is reconstructed.",
      },
      "A qualified CO₂-rich model is supported; exact proportions are uncertain.",
      "Distinguish early and modern air.",
    ),
    written(
      "cA-ocean",
      "Explain ocean formation",
      "Explain the physical stages from atmospheric water vapour to oceans.",
      "Earth cooled; water vapour condensed to liquid; liquid water collected as oceans.",
      [
        "Cooling causes water vapour to condense.",
        "Liquid water accumulates as oceans; water remains the same chemical substance.",
      ],
      "Follow cooling and state change.",
    ),
    choice(
      "cA-photo",
      "Apply photosynthesis",
      "Which pair of atmospheric changes follows photosynthesis?",
      "CO₂ used; O₂ released",
      {
        "O₂ used; CO₂ released": "That is the overall respiration direction.",
        "Carbon destroyed; nitrogen formed":
          "Chemical changes conserve elements.",
      },
      "Algae/plants use CO₂ and water to make glucose and O₂ with light.",
      "Use the word equation.",
    ),
    numeric(
      "cA-graph",
      "Read reconstruction B",
      "In reconstruction B, when is oxygen 19%?",
      600,
      "million years ago",
      "The supplied oxygen curve reaches 19% at 600 million years ago.",
      "Read the solid curve and decreasing age axis.",
      graphA,
    ),
    bar("cA-bar", "Complete scale and bar", 15, 3, 20),
    choice(
      "cA-store",
      "Identify a long-term store",
      "Which matches the source of crude oil and natural gas?",
      "Buried ancient marine organisms changed by heat and pressure",
      {
        "Carbonate shells forming only limestone":
          "Carbonate sediment and organic fuel formation are different routes.",
        "Modern atmospheric nitrogen condensing":
          "Nitrogen condensation is not fossil-fuel formation.",
      },
      "Marine biomass buried over millions of years can form oil and gas.",
      "Consider the biomass source and conditions.",
    ),
    written(
      "cA-evidence",
      "Evaluate evidence limits",
      "An ancient-rock study supports a CO₂-rich model. Why is exact composition still uncertain?",
      "Rocks provide indirect evidence; the old record can be incomplete or altered. Direct measurements of the atmosphere from billions of years ago are unavailable. Evidence supports and constrains a reconstruction, not exact certainty.",
      [
        "Recognise useful indirect geological evidence.",
        "Give a specific ancient-record limitation and explain why exact percentages are not established.",
      ],
      "State both support and limitation.",
    ),
  ],
  [
    numeric(
      "cB-whole",
      "Keep supplied precision",
      "Oxygen is 20.7% and all other non-nitrogen gases total 1.1% in a supplied table. Calculate nitrogen.",
      78.2,
      "%",
      "100−20.7−1.1=78.2%.",
      "Subtract non-nitrogen percentages.",
    ),
    choice(
      "cB-minor",
      "Recognise possible minor early gases",
      "Which pair may have been present in small amounts in an early model?",
      "Ammonia and methane",
      {
        "Oxygen and ozone as the dominant pair":
          "The proposed early air has little or no free oxygen.",
        "Only argon": "Other gases were present.",
      },
      "Methane and ammonia are possible minor gases; exact ancient amounts are uncertain.",
      "Recall the qualified model.",
    ),
    written(
      "cB-carbonate",
      "Explain a geological sink",
      "Explain how ocean and carbonate processes lowered atmospheric CO₂.",
      "CO₂ dissolved in oceans. Carbonates precipitated, and carbonate shells/skeletons accumulated to form sedimentary rock such as limestone, storing carbon outside the atmosphere.",
      [
        "State CO₂ dissolution in oceans.",
        "Link carbonate precipitation/accumulation to sedimentary storage such as limestone without destroying carbon.",
      ],
      "Follow carbon into water and solids.",
    ),
    choice(
      "cB-nitrogen",
      "Explain changing fractions",
      "Why can the nitrogen percentage rise when other atmospheric gases are removed?",
      "Nitrogen becomes a larger fraction of the remaining whole",
      {
        "Every removed CO₂ atom turns into nitrogen": "Elements are conserved.",
        "Photosynthesis releases nitrogen instead of oxygen":
          "Photosynthesis releases O₂.",
      },
      "A percentage is relative to the whole; nitrogen also accumulated from volcanic release.",
      "Distinguish proportion and element identity.",
    ),
    numeric(
      "cB-graph",
      "Read reconstruction C",
      "In reconstruction C, when does nitrogen first become constant?",
      2800,
      "million years ago",
      "The dashed nitrogen curve becomes horizontal at 2800 million years ago.",
      "Locate the first horizontal point.",
      graphB,
    ),
    bar("cB-bar", "Construct a different scale", 14, 4, 28),
    choice(
      "cB-coal",
      "Identify the biomass source",
      "Which material is associated mainly with coal formation?",
      "Buried ancient land-plant remains",
      {
        "Modern dissolved nitrogen": "Coal contains carbon from biomass.",
        "Only carbonate shells": "Carbonates are associated with limestone.",
      },
      "Buried plant material changes over long geological time under heat and pressure.",
      "Distinguish plant, marine organic and carbonate sources.",
    ),
    written(
      "cB-synthesis",
      "Connect CO₂ and O₂ changes",
      "Explain how algae and later plants changed CO₂ and O₂; explain why modern oxygen did not appear immediately.",
      "With light energy, algae and later plants photosynthesised: carbon dioxide + water → glucose + oxygen. They used CO₂ and released O₂. Algae first produced oxygen about 2.7 billion years ago; oxygen accumulated gradually and later supported animals.",
      [
        "Use CO₂ and water as reactants, glucose and O₂ as products, with light energy.",
        "Link CO₂ decrease and O₂ increase to algae/plants.",
        "Describe gradual accumulation, rather than instant modern composition.",
      ],
      "Connect the word equation to a geological timescale.",
    ),
  ],
];
const reviewForms = [
  [
    numeric(
      "vA-volume",
      "Retrieve the same-whole calculation",
      "A 2000 cm³ sample is 21% oxygen by volume. Calculate oxygen volume.",
      420,
      "cm³",
      "0.21×2000=420 cm³ at the same conditions.",
      "Take 21% of the whole.",
    ),
    choice(
      "vA-ocean",
      "Retrieve ocean formation",
      "Which process formed liquid water as early Earth cooled?",
      "Condensation",
      {
        Combustion:
          "Combustion is a chemical reaction, not the required state change.",
        Evaporation: "Evaporation produces vapour.",
      },
      "Water vapour condensed and liquid collected as oceans.",
      "Recall gas-to-liquid change.",
    ),
    numeric(
      "vA-graph",
      "Retrieve graph reading",
      "In reconstruction C, when is oxygen 13%?",
      1400,
      "million years ago",
      "Oxygen is 13% at 1400 million years ago in the supplied model.",
      "Use the solid curve and its age axis.",
      graphB,
    ),
    written(
      "vA-stores",
      "Retrieve distinct carbon stores",
      "Distinguish the origins of limestone, coal, and crude oil/natural gas.",
      "Limestone forms from carbonate precipitation and accumulated carbonate remains. Coal comes mainly from buried land plants. Crude oil and natural gas come mainly from buried ancient marine organisms changed under heat and pressure over millions of years.",
      [
        "Limestone: carbonate sediment/precipitation.",
        "Coal: buried ancient plants.",
        "Oil/gas: buried marine biomass with heat, pressure and geological time.",
      ],
      "Match each store to its source.",
    ),
  ],
  [
    numeric(
      "vB-time",
      "Retrieve geological units",
      "Express 1.8 billion years ago in million years ago.",
      1800,
      "million years ago",
      "1.8×1000=1800 million years ago.",
      "Use 1000 million per billion.",
    ),
    choice(
      "vB-photo",
      "Retrieve the equation",
      "Which gas is released in photosynthesis by algae and plants?",
      "Oxygen",
      {
        "Carbon dioxide": "CO₂ is used as a reactant.",
        Nitrogen: "Nitrogen is not its gaseous product.",
      },
      "Photosynthesis uses CO₂/water and light to form glucose and O₂.",
      "Recall reactants and products.",
    ),
    bar("vB-bar", "Retrieve bar construction", 9, 1, 12),
    written(
      "vB-evidence",
      "Retrieve evidence evaluation",
      "Explain why a useful early-atmosphere theory can change with new evidence.",
      "It is a reconstruction from indirect, incomplete evidence such as ancient rocks and comparisons. New evidence can strengthen or challenge explanations. Revision does not imply there was no evidence, and present support does not establish exact ancient percentages.",
      [
        "Use specific indirect/limited evidence.",
        "Explain evaluation and revision without claiming either exact certainty or no evidence.",
      ],
      "Distinguish support, limits and revision.",
    ),
  ],
];
const recovery = [
  "r-composition",
  "r-composition",
  "r-composition",
  "r-composition",
  "r-evidence",
  "r-evidence",
  "r-ocean",
  "r-carbonate",
  "r-photo",
  "r-photo",
  "r-graph",
  "r-composition",
  "r-carbonate",
  "r-coal",
  "r-oil",
  "r-graph",
  "r-graph",
  "r-graph",
  "r-graph",
  "r-graph",
  "r-composition",
  "r-composition",
  "r-evidence",
  "r-photo",
];
export const atmosphereRecoveryRoutes: Record<string, string> = {};
practice.forEach((q, i) => {
  q.followUp = id(recovery[i]);
  atmosphereRecoveryRoutes[q.id] = q.followUp;
});
export const allAtmosphereTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const atmosphereExposureFamilies = {
  modern: ["g-composition"],
  oceans: ["r-ocean", "g-ocean", "p-ocean", "cA-ocean", "vA-ocean"],
  photo: ["g-photo", "p-photo", "cA-photo", "vB-photo"],
  equation: ["r-photo", "p-equation"],
  coal: ["r-coal", "p-coal", "cB-coal"],
  oil: ["r-oil", "g-store", "p-fuels", "cA-store"],
  carbonates: ["r-carbonate", "p-limestone"],
  evidence: ["g-evidence", "p-evidence", "cA-evidence"],
};
for (const family of Object.values(atmosphereExposureFamilies))
  for (const s of family) {
    const q = allAtmosphereTasks.find((q) => q.id === id(s))!;
    q.exposureAliases = family.filter((o) => o !== s).map(id);
  }
export const atmosphereJourney: LessonJourney = {
  version: 1,
  introduction:
    "Build modern composition, explain ancient changes and evaluate reconstructed atmospheric evidence.",
  scopeNote:
    "AQA Chemistry/Trilogy atmospheric evolution, both tiers. Original graphs are illustrative reconstructions; supplied percentages are not precise ancient measurements. Modern dry-air data exclude variable water vapour. Written explanations use honest self-review, without examiner marks. This lesson does not certify full-course coverage or exam readiness.",
  outcomes: [
    "Calculate and compare modern dry-air percentages using the stated whole and precision.",
    "Describe a qualified volcanic-origin theory, cooling and ocean formation.",
    "Use the photosynthesis equation to explain gradual oxygen increase and CO₂ decrease.",
    "Explain CO₂ dissolution, carbonate sediment, limestone and distinct fossil-fuel origins.",
    "Read descending geological age axes, plateaus and straight-line interpolations; construct equal percentage scales and bars.",
    "Evaluate ancient geological and planet evidence without claiming exact certainty or no evidence.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Composition and early formation",
      taskIds: practice.slice(0, 8).map((q) => q.id),
    },
    {
      label: "Biology and carbon stores",
      taskIds: practice.slice(8, 15).map((q) => q.id),
    },
    {
      label: "Graphs and percentages",
      taskIds: practice.slice(15, 22).map((q) => q.id),
    },
    {
      label: "Evaluate and connect explanations",
      taskIds: practice.slice(22).map((q) => q.id),
    },
  ],
};
