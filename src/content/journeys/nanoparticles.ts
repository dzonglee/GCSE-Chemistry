import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice, number } from "./helpers";
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask {
  return {
    ...choice(
      `np-v1-${id}`,
      prompt,
      answer,
      errors,
      explanation,
      hint,
      title,
      model,
    ),
    title,
  };
}
function n(
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
): LearningTask {
  return {
    ...number(`np-v1-${id}`, prompt, answer, unit, explanation, hint, title),
    title,
  };
}
const guided = [
  c(
    "g-subdivide",
    "Expose more surface",
    "Which statement applies when an ideal cube is cut into smaller cubes and separated, without losing material?",
    "Total exposed area increases; total material volume stays unchanged",
    {
      "Both area and material volume increase":
        "Viewing gaps contain no material.",
      "Exposed area always stays unchanged":
        "Separated cut faces become exposed.",
    },
    "Cut faces that were internal become exposed on separation. The amount of material is conserved.",
    "Compare all exposed faces and keep material quantity fixed.",
    {
      kind: "nano-properties",
      mode: "subdivide",
      instruction:
        "Predict total exposed area and material volume relative to the starting cube.",
    },
  ),
  c(
    "g-cube",
    "Calculate a cube",
    "For the initial 4 nm ideal cube, what are its six-face area, volume and numerical area ÷ volume?",
    "96 nm², 64 nm³, 1.5 nm⁻¹",
    {
      "16 nm², 64 nm³, 0.25 nm⁻¹": "Six faces contribute, not one.",
      "96 nm², 16 nm³, 6 nm⁻¹": "Volume uses three lengths, not two.",
    },
    "6 × 4² = 96; 4³ = 64; 96/64 = 1.5. The quotient has inverse-length units.",
    "Square for a face; multiply by six; cube for volume.",
    {
      kind: "nano-properties",
      mode: "cube",
      instruction:
        "Calculate the area, volume and quotient, then test another supplied side.",
    },
  ),
  c(
    "g-scale",
    "Compare nano dimensions",
    "For the initial 40 nm diameter and supplied 0.2 nm atom diameter, which comparison is valid?",
    "4 × 10⁻⁸ m; diameter is 200 times the atom diameter",
    {
      "4 × 10⁻⁷ m; 200 atoms fill the particle":
        "The conversion and atom-count inference are wrong.",
      "4 × 10⁻⁸ m; exactly 200 atoms fill the particle":
        "A diameter ratio is not the total number of atoms.",
    },
    "40 × 10⁻⁹ m = 4 × 10⁻⁸ m; 40/0.2 = 200 compares lengths only.",
    "Use 1 nm = 10⁻⁹ m and divide matching units.",
    {
      kind: "nano-properties",
      mode: "scale",
      instruction:
        "Convert the supplied diameter and compare it with a 0.2 nm atom.",
    },
  ),
  c(
    "g-evidence",
    "Evaluate an application",
    "What does the supplied performance test support, and what remains untested?",
    "Less material for the tested effect; release and exposure still need investigation",
    {
      "The test proves every nanoparticle harmless":
        "Cleaning or reaction performance does not measure safety.",
      "Nanoscale size proves every use harmful":
        "Risk depends on substance, route and extent of exposure.",
    },
    "Performance benefits and safety evidence answer different questions. Use the supplied comparison and identify missing exposure data.",
    "Separate the measured effect from what was not measured.",
    {
      kind: "nano-properties",
      mode: "evidence",
      instruction:
        "Use the supplied application evidence to predict benefit and needed investigation.",
    },
  ),
];
guided[0].openingHint = true;
export const nanoparticlesJourney: LessonJourney = {
  version: 1,
  introduction:
    "Compare nano dimensions, expose conserved material surfaces, calculate ideal cubes and evaluate supplied applications.",
  outcomes: [
    "Convert and compare matching-unit nano lengths.",
    "Calculate six-face area, volume and inverse-length quotient.",
    "Explain increased exposed area at fixed material quantity.",
    "Separate measured benefits from missing exposure evidence.",
  ],
  scopeNote:
    "Separate chemistry: AQA 4.2.4 and Pearson 9.35C–9.37C. Ideal cube calculations, matching-unit sizes and supplied-benefit/risk evaluation. No universal toxicity, atomic structure or commercial-product safety claims.",
  warmup: [
    c(
      "w-square",
      "Recall a square",
      "What is the area of a square with side a?",
      "a²",
      { "a³": "That is a cube volume.", "4a": "That is a square perimeter." },
      "Area multiplies two lengths.",
      "Think length × width.",
    ),
    c(
      "w-units",
      "Recall length units",
      "Which is the smaller length?",
      "1 nm",
      {
        "1 mm": "A millimetre is a million nanometres.",
        "1 cm": "A centimetre is ten million nanometres.",
      },
      "A nanometre is 10⁻⁹ m.",
      "Compare powers of ten.",
    ),
  ],
  refresher: [
    c(
      "r-faces",
      "Count all faces",
      "How many square faces contribute to the surface area of a separate ideal cube?",
      "Six",
      {
        Three: "Three may be visible, but hidden faces count.",
        One: "One square is only one face.",
      },
      "A cube has six faces, including hidden faces.",
      "Count top/bottom and four sides.",
    ),
    c(
      "r-volume",
      "Keep material quantity",
      "Separating cut pieces introduces viewing gaps. What happens to the material volume?",
      "It stays unchanged",
      {
        "It increases by the gaps": "Gaps are empty space, not material.",
        "It becomes zero": "The same material remains.",
      },
      "Material volume is the sum of piece volumes, excluding gaps.",
      "Add material, not container space.",
    ),
    c(
      "r-ratio",
      "Use the quotient",
      "For side a, an ideal cube has area 6a² and volume a³. What is area ÷ volume?",
      "6/a",
      {
        "6a": "Cancel two powers of a, leaving one below.",
        "a/6": "That is the inverse quotient.",
      },
      "6a²/a³ = 6/a; smaller a gives a larger quotient.",
      "Write the division before simplifying.",
    ),
    c(
      "r-scale",
      "Convert nanometres",
      "Which converts nanometres to metres?",
      "Multiply by 10⁻⁹",
      {
        "Multiply by 10⁹": "That converts metres to nanometres.",
        "Multiply by 10⁻³": "That converts millimetres, not nanometres.",
      },
      "The prefix nano means one billionth.",
      "1 nm is much smaller than 1 m.",
    ),
    c(
      "r-evidence",
      "Distinguish benefit and risk",
      "Which evidence directly investigates inhalation exposure?",
      "Measurements of airborne release and inhaled dose",
      {
        "A good cleaning result": "That measures performance.",
        "The word nano alone": "Size alone does not measure exposure or harm.",
      },
      "Exposure evidence concerns how material reaches people and at what amount.",
      "Ask what the test actually measures.",
    ),
  ],
  guided,
  practice: [
    c(
      "p-range",
      "Recognise nano size",
      "Which supplied diameter is within the usual 1–100 nm nanoparticle range?",
      "25 nm",
      {
        "250 nm": "That is above the supplied nano range.",
        "25 mm": "Check the length unit.",
      },
      "25 is between 1 and 100 and the unit is nm.",
      "Check value and unit.",
    ),
    n(
      "p-convert",
      "Convert a nano length",
      "Convert 60 nm to metres.",
      6e-8,
      "m",
      "60 × 10⁻⁹ = 6 × 10⁻⁸ m.",
      "Multiply by 10⁻⁹.",
    ),
    n(
      "p-atom",
      "Compare lengths",
      "A particle diameter is 30 nm and a supplied atom diameter is 0.15 nm. How many times larger is the particle diameter?",
      200,
      "times",
      "30/0.15 = 200 compares diameters. It does not count atoms.",
      "Divide in matching units.",
    ),
    c(
      "p-count",
      "Avoid a false atom count",
      "A particle diameter is 100 atom diameters. What follows?",
      "Its diameter is 100 times larger; total atom count needs more information",
      {
        "It contains exactly 100 atoms":
          "A one-dimensional ratio is not a three-dimensional atom count.",
        "Its atoms are each 100 times larger":
          "The comparison changes particle size, not atom size.",
      },
      "Packing and three-dimensional geometry affect atom count.",
      "Separate length from number.",
    ),
    n(
      "p-face",
      "Calculate one face",
      "An ideal cubic particle has side 5 nm. What is one face’s area?",
      25,
      "nm²",
      "5 × 5 = 25 nm².",
      "Square the side.",
    ),
    n(
      "p-area",
      "Include hidden faces",
      "An ideal cubic particle has side 5 nm. What is its total six-face area?",
      150,
      "nm²",
      "6 × 25 = 150 nm².",
      "Hidden faces also count.",
    ),
    n(
      "p-volume",
      "Use three dimensions",
      "An ideal cubic particle has side 5 nm. What is its volume?",
      125,
      "nm³",
      "5³ = 125 nm³.",
      "Multiply three lengths.",
    ),
    n(
      "p-quotient",
      "Divide area by volume",
      "Using area 150 nm² and volume 125 nm³, calculate the numerical area ÷ volume.",
      1.2,
      "nm⁻¹",
      "150/125 = 1.2 nm⁻¹.",
      "Divide in the stated order.",
    ),
    {
      id: "np-v1-p-ratio-units",
      title: "Construct the simplest ratio",
      prompt:
        "Using nm as the length unit, simplify the numerical surface-area:volume values 150:125 to the smallest whole-number pair.",
      answer: JSON.stringify({ area: "6", volume: "5" }),
      partLegend: "Surface area : volume — simplified numerical values",
      parts: [
        {
          id: "area",
          label: "Surface-area number",
          answer: 6,
          inputMode: "numeric",
        },
        {
          id: "volume",
          label: "Volume number",
          answer: 5,
          inputMode: "numeric",
        },
      ],
      explanation:
        "Divide both numbers by 25: 150:125 = 6:5. The physical quotient is still 1.2 nm⁻¹ because area and volume have different dimensions.",
      hint: "Find the greatest whole-number factor dividing both numbers.",
      purpose:
        "Independently constructs the simplest numerical ratio required in cube questions.",
    },
    n(
      "p-tenfold",
      "Change particle size",
      "An ideal cube side decreases from 40 nm to 4 nm. By what factor does area ÷ volume increase?",
      10,
      "times",
      "6/4 is ten times 6/40.",
      "The quotient varies inversely with side.",
    ),
    c(
      "p-single",
      "Separate area from quotient",
      "One cube becomes smaller. What happens to its own area and its area-to-volume quotient?",
      "Its area decreases; its area-to-volume quotient increases",
      {
        "Both always increase":
          "One smaller particle has less area but still less volume.",
        "Both always decrease": "The quotient is 6/a.",
      },
      "Do not confuse area per particle with area per amount of material.",
      "Compare a² with 1/a.",
    ),
    n(
      "p-pieces",
      "Subdivide exactly",
      "A cube is split into two pieces along each of three perpendicular dimensions. How many smaller cubes result?",
      8,
      "cubes",
      "2³ = 8 pieces.",
      "Count two choices in each of three dimensions.",
    ),
    n(
      "p-conserve",
      "Add piece volumes",
      "Eight separated cubes each have volume 27 units³. What is their total material volume?",
      216,
      "units³",
      "8 × 27 = 216; viewing gaps are excluded.",
      "Add only material volumes.",
    ),
    n(
      "p-total-area",
      "Add exposed faces",
      "Eight separated cubes each have side 3 units. What is their total exposed area?",
      432,
      "units²",
      "8 × 6 × 3² = 432 units².",
      "Count six faces for every separated piece.",
    ),
    c(
      "p-touching",
      "Distinguish internal faces",
      "Pieces are cut but remain touching face-to-face in the original cube shape. Which faces remain unexposed?",
      "Touching internal cut faces",
      {
        "All original outer faces": "The outside remains exposed.",
        "No faces":
          "Touching internal faces are not exposed to the surroundings.",
      },
      "Separation is needed to expose the cut faces.",
      "Distinguish internal contact from outer surface.",
    ),
    c(
      "p-fine",
      "Compare size categories",
      "Using supplied fine-particle diameters 100–2500 nm, which lies clearly within that range?",
      "500 nm",
      {
        "50 nm": "Below the supplied fine range.",
        "5000 nm": "Above the supplied fine range.",
      },
      "500 lies inside both endpoints; boundary conventions need not be guessed.",
      "Compare in nm.",
    ),
    c(
      "p-benefit",
      "Use a supplied coating test",
      "Original data: equal-area coatings need 3 mg nano material or 12 mg larger particles for the same cleaning result. What is supported?",
      "Less nano material achieves this tested effect",
      {
        "Every nano material has no risk": "No safety result is supplied.",
        "Every nano coating must be transparent":
          "The test does not measure transparency.",
      },
      "The measured mass comparison supports a specific performance benefit.",
      "Use only the stated test.",
    ),
    c(
      "p-risk",
      "Choose further evidence",
      "A nanoparticulate spray performs well, but airborne release was not measured. What is the most relevant next investigation?",
      "Measure released airborne particles and potential inhalation exposure",
      {
        "Only repeat the colour test":
          "Colour does not measure release or exposure.",
        "Assume no exposure because the particles are small":
          "Small size does not prove zero exposure.",
      },
      "Application and exposure route matter when evaluating possible risk.",
      "Identify the unmeasured pathway.",
    ),
    c(
      "p-amount",
      "Explain possible effectiveness",
      "Why may a smaller mass of a nanoparticulate catalyst achieve the same supplied effect?",
      "More exposed surface per amount can provide more accessible sites",
      {
        "The atoms become much bigger": "Atom growth is not the explanation.",
        "Every nanoparticle creates extra material": "Material is not created.",
      },
      "Higher surface per amount can make more sites accessible; actual effectiveness still depends on the material and conditions.",
      "Connect exposed surface to use.",
    ),
    {
      ...c(
        "p-explain",
        "Explain subdivision",
        "Explain why separating smaller pieces can increase exposed area without increasing material volume.",
        "The same material is split into smaller pieces. Separation exposes previously internal faces, while the sum of material volumes stays fixed and gaps contain no material.",
        {},
        "Compare outer/internal faces and the sum of piece volumes.",
        "Follow the same original material.",
      ),
      options: undefined,
      rubric: [
        "The amount and total material volume stay unchanged.",
        "Previously internal cut faces become exposed after separation.",
        "Smaller pieces give more exposed area per amount; gaps are not material.",
      ],
    },
    {
      ...c(
        "p-evaluate",
        "Evaluate supplied evidence",
        "Original test: a nano catalyst needs 2 g and a larger-particle catalyst needs 8 g for the same conversion. Long-term release and exposure were not tested. Evaluate the evidence.",
        "The test supports a lower required mass for the same conversion, 2 g rather than 8 g. It does not measure release or exposure, so those need separate investigation before a safety conclusion.",
        {},
        "The comparison supports a performance benefit but not a universal safety conclusion.",
        "Give a measured benefit, missing evidence and a justified next step.",
      ),
      options: undefined,
      rubric: [
        "Uses the 2 g versus 8 g comparison for the same tested effect.",
        "Distinguishes performance from unmeasured release/exposure.",
        "Proposes relevant exposure investigation without claiming every nanoparticle safe or harmful.",
      ],
    },
  ],
  checkForms: [
    [
      n(
        "ca-area",
        "Calculate independently",
        "A supplied ideal cube has side 7 nm. Calculate its total surface area.",
        294,
        "nm²",
        "6 × 7² = 294 nm².",
        "Count six faces.",
      ),
      n(
        "ca-volume",
        "Calculate volume independently",
        "A supplied ideal cube has side 7 nm. Calculate its volume.",
        343,
        "nm³",
        "7³ = 343 nm³.",
        "Use three dimensions.",
      ),
      n(
        "ca-convert",
        "Convert new data",
        "Convert 90 nm to metres.",
        9e-8,
        "m",
        "90 × 10⁻⁹ = 9 × 10⁻⁸.",
        "Use nano.",
      ),
      c(
        "ca-conserve",
        "Interpret separation",
        "Twenty-seven equal pieces are separated without material loss. What changes?",
        "Exposed area increases; total material volume is unchanged",
        {
          "Total material volume increases with gaps":
            "Gaps contain no material.",
          "The atoms grow larger": "Piece subdivision does not enlarge atoms.",
        },
        "The same material gains exposed cut faces.",
        "Distinguish surface from quantity.",
      ),
      c(
        "ca-risk",
        "Evaluate a new context",
        "An original nano deodorant test measures odour reduction only. Which conclusion is justified?",
        "Odour performance is measured; exposure and long-term effects need separate evidence",
        {
          "All uses are proved safe": "No exposure measurement is supplied.",
          "Every nano substance is proved harmful":
            "The test establishes neither universal claim.",
        },
        "Use the stated outcome and missing evidence.",
        "Separate performance from risk.",
      ),
    ],
    [
      n(
        "cb-area",
        "Use another cube",
        "A supplied ideal cube has side 8 nm. Calculate its surface area.",
        384,
        "nm²",
        "6 × 8² = 384.",
        "Six squares.",
      ),
      n(
        "cb-ratio",
        "Calculate new quotient",
        "A supplied ideal cube has side 8 nm. Calculate the numerical area ÷ volume.",
        0.75,
        "nm⁻¹",
        "6/8 = 0.75 nm⁻¹.",
        "Use 6/a.",
      ),
      n(
        "cb-length",
        "Compare matching units",
        "A supplied particle diameter is 48 nm and supplied atom diameter is 0.16 nm. How many times larger is the particle diameter?",
        300,
        "times",
        "48/0.16 = 300.",
        "Compare lengths only.",
      ),
      c(
        "cb-touching",
        "Check a contact condition",
        "A cube is cut but all pieces remain touching in the original shape. What happens to its outer exposed area?",
        "It stays unchanged until cut faces become exposed",
        {
          "Every internal face is automatically exposed":
            "Contact faces remain internal.",
          "No outer surface remains": "The outside stays exposed.",
        },
        "Cutting and separating are different conditions.",
        "Inspect contact.",
      ),
      c(
        "cb-benefit",
        "Interpret new supplied data",
        "Original data: 5 mg nano coating and 20 mg larger particles give the same specified effect. What is supported?",
        "A lower mass of nano material achieves this tested effect",
        {
          "All nanoparticle products are safe":
            "Performance does not establish safety.",
          "Every coating has identical optical properties":
            "Optical data are not supplied.",
        },
        "Use the specific mass/effect comparison.",
        "Bound the conclusion to the test.",
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-area",
        "Retrieve six faces",
        "An ideal cube side is 9 nm. What is its total area?",
        486,
        "nm²",
        "6 × 81 = 486.",
        "Six squares.",
      ),
      n(
        "ra-convert",
        "Retrieve the prefix",
        "Convert 12 nm to metres.",
        1.2e-8,
        "m",
        "12 × 10⁻⁹ = 1.2 × 10⁻⁸.",
        "Nano means 10⁻⁹.",
      ),
      c(
        "ra-risk",
        "Retrieve evidence limits",
        "Why does a good cleaning test not prove a nanoparticle coating safe in every use?",
        "Exposure and health/environmental effects were not necessarily measured",
        {
          "Cleaning tests measure every risk":
            "Different outcomes need different evidence.",
          "Size alone supplies all missing evidence":
            "Size is not a complete risk assessment.",
        },
        "Performance and exposure evidence answer different questions.",
        "Identify what remains untested.",
      ),
    ],
    [
      n(
        "rb-volume",
        "Retrieve cube volume",
        "An ideal cube side is 9 nm. What is its volume?",
        729,
        "nm³",
        "9³ = 729.",
        "Three dimensions.",
      ),
      n(
        "rb-factor",
        "Retrieve inverse scaling",
        "A cube side decreases from 60 nm to 6 nm. By what factor does its area-to-volume quotient increase?",
        10,
        "times",
        "6/a increases tenfold when a decreases tenfold.",
        "Use inverse dependence.",
      ),
      c(
        "rb-conserve",
        "Retrieve conservation",
        "Separated small cubes occupy more space including gaps. What happens to their material volume?",
        "It remains the sum of the same material pieces",
        {
          "It includes all empty gaps": "Gaps are not material.",
          "It becomes infinite": "The original finite material remains.",
        },
        "Distinguish envelope volume from material volume.",
        "Exclude empty space.",
      ),
    ],
  ],
};
for (const task of [
  ...nanoparticlesJourney.warmup,
  ...nanoparticlesJourney.refresher,
  ...guided,
  ...nanoparticlesJourney.practice,
]) {
  task.followUp =
    task.id.includes("risk") ||
    task.id.includes("benefit") ||
    task.id.includes("evidence") ||
    task.id.includes("evaluate")
      ? "np-v1-r-evidence"
      : task.id.includes("scale") ||
          task.id.includes("convert") ||
          task.id.includes("atom") ||
          task.id.includes("count") ||
          task.id.includes("range") ||
          task.id.includes("fine")
        ? "np-v1-r-scale"
        : task.id.includes("volume") ||
            task.id.includes("conserve") ||
            task.id.includes("touching")
          ? "np-v1-r-volume"
          : task.id.includes("ratio") ||
              task.id.includes("quotient") ||
              task.id.includes("tenfold") ||
              task.id.includes("single")
            ? "np-v1-r-ratio"
            : "np-v1-r-faces";
}

import { extendNanoWriting } from "./nano-writing";
extendNanoWriting(nanoparticlesJourney);

import { extendNanoSizeRanges } from "./nano-size-ranges";
extendNanoSizeRanges(nanoparticlesJourney);
