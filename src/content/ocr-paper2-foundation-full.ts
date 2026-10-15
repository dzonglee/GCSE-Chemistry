import type { ExamPaper, ExamPart } from "./exam-paper-types";
import { boardPaperAuthor } from "./board-paper-authoring";
import { emptyFuelDrawing } from "../lib/fuel-drawing";
import { emptyOrganicDrawing } from "../lib/organic-drawing";
import { blankPolymerisationDrawing } from "../lib/polymerisation-board";

const author = boardPaperAuthor("chem-ocr-p2f-full-v1-", "foundation");
const mc = author("Section A · Multiple choice", "organic");
// Each distractor and demand was written individually for Gateway02.
const sectionA: ExamPart[] = [
  mc(
    "1",
    ["C4.1c"],
    "Compare metal families",
    "Which is a typical property of a transition metal compared with a Group 1 metal?",
    "Higher density",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Lower density",
          "Higher density",
          "Cannot conduct electricity",
          "Always forms colourless compounds",
        ],
      },
    },
  ),
  mc(
    "2",
    ["C4.2b"],
    "Recognise a positive test",
    "A solution containing iron(II) ions is tested with sodium hydroxide solution. Which observation is expected initially?",
    "A green precipitate",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "A blue solution becomes colourless",
          "A white precipitate",
          "A green precipitate",
          "A red flame",
        ],
      },
    },
  ),
  mc(
    "3",
    ["C6.2l"],
    "Apply a general formula",
    "An alkane molecule contains 9 carbon atoms. How many hydrogen atoms does it contain? Use CₙH₂ₙ₊₂.",
    "20",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["9", "18", "22", "20"] },
    },
  ),
  mc(
    "4",
    ["C6.2k"],
    "Choose a fraction's position",
    "A crude-oil fraction contains smaller molecules with lower boiling points than diesel. Where would it usually condense in a fractionating column?",
    "Higher up, where the column is cooler",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Higher up, where the column is cooler",
          "Lower down, where the column is cooler",
          "Lower down, where the column is hotter",
          "Only in the crude-oil heater",
        ],
      },
    },
  ),
  mc(
    "5",
    ["C5.2b"],
    "Compare equal endpoints",
    "Two experiments reach the same fixed cloudy endpoint in 24 s and 48 s. Rate is proportional to 1/time. How does the first rate compare with the second?",
    "Twice as great",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: {
        options: [
          "Half as great",
          "The same",
          "Twice as great",
          "Four times as great",
        ],
      },
    },
  ),
  mc(
    "6",
    ["C5.2i"],
    "Identify a biological catalyst",
    "What is an enzyme?",
    "A biological catalyst",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "A reactant that is always used up",
          "A biological catalyst",
          "A substance that stops every reaction",
          "A source of extra product atoms",
        ],
      },
    },
  ),
  mc(
    "7",
    ["C6.1i"],
    "Calculate a fertiliser fraction",
    "A 40 kg bag of fertiliser contains 15% potassium by mass. What mass of potassium does it contain?",
    "6 kg",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["0.6 kg", "15 kg", "25 kg", "6 kg"] },
    },
  ),
  mc(
    "8",
    ["C6.2h"],
    "Identify natural building blocks",
    "Which small molecules are the building blocks of proteins?",
    "Amino acids",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Amino acids",
          "Ethene molecules",
          "Sodium ions",
          "Crude-oil fractions",
        ],
      },
    },
  ),
  mc(
    "9",
    ["C6.2c"],
    "Interpret incomplete combustion",
    "A heater burns a hydrocarbon with too little oxygen. Which toxic gas may form?",
    "Carbon monoxide",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["Hydrogen", "Nitrogen", "Carbon monoxide", "Helium"],
      },
    },
  ),
  mc(
    "10",
    ["C6.2p", "C6.2q"],
    "Recognise a fuel-cell limitation",
    "A hydrogen fuel cell produces electricity while hydrogen and oxygen are supplied. Which is a practical difficulty for a hydrogen-powered vehicle?",
    "Hydrogen needs suitable storage and a supply network",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "The cell must produce carbon dioxide from hydrogen",
          "Hydrogen needs suitable storage and a supply network",
          "No reactants are needed after the first start",
          "Hydrogen can never burn",
        ],
      },
    },
  ),
  mc(
    "11",
    ["C4.1b"],
    "Explain an unreactive group",
    "Why do neon atoms usually take part in few chemical reactions?",
    "They already have a full outer electron shell",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "They contain no electrons",
          "Their nuclei contain no protons",
          "Their atoms are too large to move",
          "They already have a full outer electron shell",
        ],
      },
    },
  ),
  mc(
    "12",
    ["C6.1h"],
    "Compare industrial operation",
    "Which is a usual advantage of making a high-demand fertiliser in a continuous industrial process?",
    "Large amounts can be produced with few shutdowns",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Large amounts can be produced with few shutdowns",
          "No raw materials are needed",
          "Every reaction has 100% atom economy",
          "No energy is transferred",
        ],
      },
    },
  ),
  mc(
    "13",
    ["C4.2a"],
    "Interpret a gas test",
    "A collected gas relights a glowing splint. Which gas does this evidence identify?",
    "Oxygen",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["Hydrogen", "Carbon dioxide", "Oxygen", "Chlorine"],
      },
    },
  ),
  mc(
    "14",
    ["C6.2o"],
    "Apply atom conservation",
    "One molecule of C₁₁H₂₄ cracks to form one molecule of C₇H₁₆ and one other molecule. What is the other formula?",
    "C₄H₈",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: { options: ["C₄H₁₀", "C₄H₈", "C₁₈H₄₀", "C₇H₈"] },
    },
  ),
  mc(
    "15",
    ["C6.3c"],
    "Judge the strength of evidence",
    "A town's annual temperature rose in one year. Which conclusion is best supported by this evidence alone?",
    "That year's value rose; longer and wider evidence is needed for a global trend",
    1,
    [0, 0, 1],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Human activity cannot affect climate",
          "One town proves every region warmed equally",
          "That year's value rose; longer and wider evidence is needed for a global trend",
          "The greenhouse effect began in that year",
        ],
      },
    },
  ),
];

// Catalogue topics follow the actual demand of each Section A item.
const multipleChoiceTopics = [
  "atomic-structure",
  "analysis",
  "organic",
  "organic",
  "rates",
  "rates",
  "resources",
  "organic",
  "organic",
  "energy",
  "atomic-structure",
  "resources",
  "analysis",
  "organic",
  "atmosphere",
];
sectionA.forEach((part, index) => {
  part.topic = multipleChoiceTopics[index];
});

const group = author(
  "Section B · Reactivity and displacement",
  "atomic-structure",
);
const groups: ExamPart[] = [
  group(
    "16(a)",
    ["C4.1b"],
    "Explain the halogen trend",
    "Explain why chlorine gains an electron more readily than bromine. Refer to the electron shells and nuclear attraction.",
    "Chlorine has fewer occupied shells: an approaching electron is closer to the nucleus and experiences less shielding, so its attraction is stronger and it is gained more readily.",
    2,
    [2, 0, 0],
    [
      [
        "Fewer shells / less shielding and a smaller distance to the incoming electron.",
        1,
      ],
      [
        "Stronger attraction makes electron gain easier; not electron loss or fewer protons as the cause.",
        1,
      ],
    ],
    "written",
  ),
  group(
    "16(b)",
    ["C4.1f"],
    "Deduce an unfamiliar order",
    "A supervised test gives these results: metal T displaces Q from its salt; Q displaces R; R does not displace T. Put T, Q and R in decreasing reactivity and explain the displacement rule used.",
    "T > Q > R. A more reactive metal displaces a less reactive metal from its compound; T above Q and Q above R together determine the order.",
    3,
    [1, 0, 2],
    [
      ["Places T above Q from their result.", 1],
      [
        "Places Q above R, giving T > Q > R without reversing the requested order.",
        1,
      ],
      [
        "States the more-reactive-metal displacement rule; not that the more reactive metal is displaced.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  group(
    "16(c)",
    ["C4.1d"],
    "Represent a displacement",
    "Bromine reacts with potassium iodide solution to form potassium bromide and iodine. Write the balanced symbol equation. State symbols are optional.",
    "Br₂ + 2KI → 2KBr + I₂",
    2,
    [0, 2, 0],
    [
      ["Correct formulae Br₂, KI, KBr and I₂ on the appropriate sides.", 1],
      [
        "Balances these formulae in the ratio 1:2:2:1; consistent multiples or fractions accepted.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true, writtenEquationKind: "symbol" } },
  ),
  group(
    "16(d)",
    ["C4.2a"],
    "Describe a chlorine test",
    "Describe the test for chlorine gas, including the condition of the test material and its positive observation.",
    "Damp litmus paper is bleached white; damp blue litmus may turn red first. A red colour alone is insufficient.",
    2,
    [2, 0, 0],
    [
      ["Uses damp/moist litmus paper.", 1],
      ["States bleaching to white, not simply turning red.", 1],
    ],
    "written",
    { practical: 2 },
  ),
];
const quant = author("Section B · Extracting a metal", "quantitative");
const quantities: ExamPart[] = [
  quant(
    "17(a)",
    ["C6.1a", "C6.1b"],
    "Choose extraction methods",
    "Aluminium is above carbon in the reactivity series; iron is below carbon. State a suitable main extraction method for each metal from its oxide.",
    "Aluminium: electrolysis of a molten electrolyte containing its oxide. Iron: reduction of the oxide using carbon / carbon monoxide.",
    2,
    [2, 0, 0],
    [
      [
        "Electrolysis for aluminium; molten electrolyte, if a state is specified.",
        1,
      ],
      ["Carbon or carbon-monoxide reduction for iron.", 1],
    ],
    "written",
  ),
  quant(
    "17(b)",
    ["C5.1g"],
    "Scale a theoretical mass",
    "For a particular iron-oxide reduction, 160 g of pure oxide can theoretically produce 112 g of iron. Calculate the theoretical iron mass from 250 g of this oxide when the other reactant is in excess. Show working.",
    "175",
    2,
    [0, 2, 0],
    [
      ["Uses the mass ratio 112/160, or 250/160 scale factor.", 1],
      [
        "Obtains 175 g, with a consistent proportional calculation; allow correct arithmetic following a clearly retained ratio error for this point.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "g" } },
  ),
  quant(
    "17(c)",
    ["C5.1h"],
    "Calculate an isolated yield",
    "A separate run has a theoretical yield of 180 g of iron. Only 144 g of dry iron is collected. Calculate the percentage yield. Show working.",
    "80",
    2,
    [0, 2, 0],
    [
      ["Uses actual/theoretical ×100 =144/180×100, not the inverse.", 1],
      [
        "Obtains 80%; allow arithmetic following a clearly shown earlier setup error, without awarding a value above 100% as a physically valid yield.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "%" } },
  ),
  quant(
    "17(d)",
    ["C5.1i", "C5.1j"],
    "Count every product contribution",
    "Consider Fe₂O₃ +3CO →2Fe +3CO₂, with iron the desired product. Relative atomic masses: Fe=56,C=12,O=16. Calculate the atom economy to three significant figures. Show how the coefficients affect the masses.",
    "45.9",
    3,
    [1, 2, 0],
    [
      [
        "Uses desired-product mass / total-product mass ×100 (equivalent reactant denominator allowed).",
        1,
      ],
      [
        "Counts 2Fe=112 and 3CO₂=3×44=132, giving total 244; applies coefficients to the whole formula.",
        1,
      ],
      [
        "112/244×100 =45.9% to three significant figures; allow a consistent correctly rounded evaluation after a single mass error.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        unit: "%",
        explanation:
          "Desired iron contribution 2×56=112; carbon dioxide 3×(12+2×16)=132. Atom economy 112/(112+132)×100=45.9016…%=45.9%. Atom economy and experimental percentage yield describe different things.",
      },
    },
  ),
];

const titrate = author("Section B · Titration technique", "quantitative");
const titrations: ExamPart[] = [
  titrate(
    "18(a)",
    ["C5.1b"],
    "Choose suitable apparatus and indicator",
    "In a supervised strong-acid/strong-alkali titration, name the apparatus used to transfer exactly 25.0 cm³ of alkali and name one suitable endpoint indicator.",
    "A 25.0 cm³ volumetric pipette with a pipette filler; phenolphthalein or methyl orange.",
    2,
    [2, 0, 0],
    [
      [
        "Volumetric pipette (with filler); not a measuring cylinder or mouth pipetting.",
        1,
      ],
      ["Phenolphthalein or methyl orange; not universal indicator.", 1],
    ],
    "written",
    { practical: 2 },
  ),
  titrate(
    "18(b)",
    ["C5.1b"],
    "Read a non-zero burette",
    "The burette was initially at 2.30 cm³. Read the bottom of the final meniscus on the supplied scale, then calculate the titre to two decimal places. Show both readings and subtraction.",
    "20.30",
    2,
    [0, 0, 2],
    [
      [
        "Reads the final bottom meniscus as 22.60 cm³, allowing 22.6 as the reading.",
        1,
      ],
      [
        "Subtracts initial from final:22.60−2.30=20.30 cm³; consistent subtraction after a scale-reading error allowed.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 2,
      question: {
        unit: "cm³",
        buretteScale: {
          top: 22,
          reading: 22.6,
          boundaryDescription:
            "Bottom of the final meniscus; scale divisions 0.1 cm³. The initial reading is 2.30 cm³.",
        },
      },
    },
  ),
  titrate(
    "18(c)",
    ["C5.1b", "CM5.1iv"],
    "Use the suitable repeats",
    "A different titration gives a rough titre 23.60 cm³ and accurate titres 22.10,22.20,22.10 cm³. All three accurate titres are suitable for the mean. Exclude the rough titre and calculate their mean to two decimal places. Show working.",
    "22.13",
    2,
    [0, 2, 0],
    [
      ["Uses (22.10+22.20+22.10)/3, excluding the stated rough result.", 1],
      [
        "Obtains 22.13 cm³ to two decimal places; allow consistent evaluation from a clearly retained selection error, but not the selection mark.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 2, question: { unit: "cm³" } },
  ),
  titrate(
    "18(d)",
    ["C5.1b"],
    "Improve the described endpoint method",
    "A student already repeats a titration. During each run they add acid in 2 cm³ portions up to the colour change and never swirl the flask. Propose two specific improvements and explain their purposes. Do not just suggest repeating again.",
    "Add acid dropwise near the endpoint to reduce overshooting. Swirl to mix the solutions so each drop reacts throughout the flask before judging a persistent colour change. A white tile can aid seeing the change but does not replace these mixing/portion improvements.",
    2,
    [0, 0, 2],
    [
      [
        "Links dropwise/smaller additions near endpoint to reducing overshoot.",
        1,
      ],
      [
        "Links swirling/stirring to complete mixing/reaction before judging the endpoint.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
];

const gasDrawing = {
  data: {
    context: "measurement" as const,
    title: "Original magnesium and acid observations",
    xName: "Time",
    xUnit: "s",
    yName: "Hydrogen volume",
    yUnit: "cm³",
    points: [
      [0, 0],
      [15, 24],
      [30, 38],
      [45, 46],
      [60, 48],
      [75, 48],
    ] as [number, number][],
    xMin: 0,
    xMax: 90,
    xTick: 15,
    yMin: 0,
    yMax: 60,
    yTick: 10,
    targetX: 75,
    estimateRange: [47, 49] as [number, number],
    showEstimate: false,
    trend: "Volume increases, then reaches a plateau.",
    limit: "suppliedPlateau",
    note: "Illustrative school-laboratory observations: magnesium is limiting and hydrochloric acid is in excess. Volumes are compared at the same temperature and pressure.",
  },
  note: "Plot all observations, then choose a separate smooth fit. No additional estimate or extrapolation is requested.",
};
const gasReference = JSON.stringify({
  ...emptyFuelDrawing(gasDrawing.data),
  ...Object.fromEntries(
    gasDrawing.data.points.flatMap(([x, y], i) => [
      [`p${i}x`, String(x)],
      [`p${i}y`, String(y)],
      [`c${i}`, String(y)],
    ]),
  ),
});
const rate = author("Section B · Rate observations and explanations", "rates");
const rates: ExamPart[] = [
  rate(
    "19(a)",
    ["C5.2a", "C5.2b"],
    "Construct the hydrogen graph",
    "Plot all six observations and draw a separate smooth curve supported by them. Include the plateau. No extra estimate is marked.",
    "Plot (0,0),(15,24),(30,38),(45,46),(60,48),(75,48). A supported smooth curve rises with decreasing gradient and levels at about 48 cm³. Other sensible smooth fits are valid.",
    3,
    [0, 3, 0],
    [
      [
        "All six observations within half a small square: 2 marks; four or five correctly plotted: 1 mark. Judge points separately from the fit.",
        2,
      ],
      [
        "Separate smooth fit follows the trend and plateau, without dot-to-dot corners or unsupported overshoot. Allow a sensible fit through a student's retained mistaken point.",
        1,
      ],
    ],
    "native",
    {
      mathematics: true,
      practical: 3,
      question: { fuelDrawing: gasDrawing },
      referenceConstruction: gasReference,
    },
  ),
  rate(
    "19(b)",
    ["C5.2b"],
    "Calculate the first-interval rate",
    "In this experiment 24 cm³ of hydrogen is collected between 0 s and 15 s. Calculate the mean rate over this interval, and include units. Show working.",
    "Mean rate=24/15=1.6 cm³s⁻¹.",
    3,
    [1, 2, 0],
    [
      ["Uses volume change / time change =24/15.", 1],
      ["Evaluates 1.6, allowing correct equivalent units with conversion.", 1],
      [
        "Correct rate unit cm³/s or cm³s⁻¹; unit is independent of arithmetic.",
        1,
      ],
    ],
    "written",
    { mathematics: true, practical: 3 },
  ),
  rate(
    "19(c)",
    ["C5.2c", "C5.2e"],
    "Separate speed from final amount",
    "The same mass of magnesium is used in smaller pieces, with the same excess acid and temperature. Describe two changes or similarities in the gas-volume curve compared with the original.",
    "The initial curve is steeper and reaches its plateau sooner. The final volume remains 48 cm³ because the same amount of limiting magnesium reacts; smaller pieces do not supply extra reactant.",
    2,
    [0, 2, 0],
    [
      ["Steeper initial gradient / faster rise / earlier plateau.", 1],
      ["Same final volume 48 cm³; not a higher final plateau.", 1],
    ],
    "written",
  ),
  rate(
    "19(d)",
    ["C5.2d"],
    "Explain a concentration change",
    "Explain why increasing acid concentration at the same temperature increases the initial rate of its reaction with magnesium. Use collision theory.",
    "There are more reacting acid particles per unit volume, causing more frequent successful collisions with the magnesium surface. Temperature is unchanged, so increased particle energy is not the cause.",
    2,
    [2, 0, 0],
    [
      [
        "More reacting particles per unit volume, not simply more particles in a larger volume.",
        1,
      ],
      [
        "More frequent successful collisions per unit time; not faster motion caused by concentration.",
        1,
      ],
    ],
    "written",
  ),
  rate(
    "19(e)",
    ["C5.2f", "C5.2h"],
    "Explain a catalyst's action",
    "Explain how a catalyst increases a reaction's rate, referring to activation energy and what happens to the catalyst overall.",
    "It provides an alternative reaction pathway with lower activation energy and is not used up overall.",
    2,
    [2, 0, 0],
    [
      ["Alternative pathway with lower activation energy.", 1],
      [
        "Catalyst is not consumed / is chemically unchanged overall; it is not extra product-forming reactant.",
        1,
      ],
    ],
    "written",
  ),
];

const analysis = author(
  "Section B · Identifying unlabelled solutions",
  "analysis",
);
const analyses: ExamPart[] = [
  analysis(
    "20(a)",
    ["C4.2b", "C4.2d", "C7"],
    "Plan a complete identification",
    "Identify solutions P, Q and R: sodium sulfate, sodium chloride and potassium chloride, in an unknown order. Plan tests, observations and identification logic. Avoid contamination. Available: clean splints, supervised Bunsen flame, test tubes, dilute HCl, barium chloride solution and distilled water.",
    "Use separate labelled small samples and clean apparatus; retain original bottles. Flame-test a fresh portion of each using a clean moistened splint in the supervised flame: lilac identifies potassium chloride; yellow identifies the two sodium salts. On separate portions, acidify with dilute hydrochloric acid then add barium chloride solution. A white precipitate identifies sulfate and therefore sodium sulfate. The yellow-flame solution with no sulfate precipitate is sodium chloride, because the candidate list is exhaustive. Keep flame-test and acidified portions separate; contaminated flame samples could introduce sodium or potassium. Suitable independently reasoned orderings are equally valid.",
    6,
    [2, 0, 4],
    [],
    "written",
    {
      practical: 6,
      levels: [
        {
          min: 1,
          max: 2,
          text: "Limited relevant test or positive observation, with an attempted identification. Some relevant reasoning; little connected procedure.",
        },
        {
          min: 3,
          max: 4,
          text: "A usable partial plan with correct observations identifies at least one solution and makes progress distinguishing the others, or describes both relevant tests but leaves an important identification/contamination gap. Some structured reasoning.",
        },
        {
          min: 5,
          max: 6,
          text: "A coherent feasible sequence distinguishes all three using appropriate tests and observations. Explains how the results map to identities, including the remaining candidate, and uses separate portions/clean equipment to avoid contamination. Clear, relevant, substantiated reasoning; use the upper mark for a secure complete response.",
        },
      ],
    },
  ),
  analysis(
    "20(b)",
    ["C4.2f"],
    "Compare instrumental analysis",
    "Give two advantages that a suitable instrumental method can have over visual chemical tests.",
    "It can detect smaller amounts (greater sensitivity), give more accurate results, or analyse samples more quickly. Any two distinct supported advantages.",
    2,
    [2, 0, 0],
    [
      ["One valid advantage: sensitivity / accuracy / speed.", 1],
      [
        "A second distinct valid advantage. 'Easier', 'better' or 'safer' alone is insufficient; precision alone is not accuracy.",
        1,
      ],
    ],
    "written",
  ),
  analysis(
    "20(c)",
    ["C4.2g"],
    "Interpret supplied spectral evidence",
    "Reference emission lines: sodium 589 nm; potassium 404 nm and 766 nm. A sample has clear lines at 404 nm and 766 nm, with no detected 589 nm line. A student says it contains sodium only. Evaluate this claim using the supplied reference data.",
    "The claim is not supported: both detected lines match potassium, not sodium's 589 nm reference. No detected sodium line is not proof that absolutely no trace sodium is present below the instrument's detection limit.",
    1,
    [0, 0, 1],
    [
      [
        "Rejects sodium-only using the two potassium matches / missing sodium reference line; no unsupported claim of absolute purity required.",
        1,
      ],
    ],
    "written",
  ),
];

const acidReference = JSON.stringify({
  ...emptyOrganicDrawing(),
  n: "2",
  hydroxyl: "yes",
  carbonyl: "2",
  oxygenH: "yes",
  h0: "yes",
  h1: "yes",
  h2: "yes",
});
const repeatReference = JSON.stringify({
  ...blankPolymerisationDrawing(),
  s0: "H",
  s1: "CH3",
  s2: "H",
  s3: "CH3",
  bond: "1",
  left: "1",
  right: "1",
  brackets: "1",
  countMark: "n",
});
const organic = author(
  "Section B · Organic structures and reactions",
  "organic",
);
const organics: ExamPart[] = [
  organic(
    "21(a)",
    ["C6.2b", "C6.2c"],
    "Construct an oxidation product",
    "Ethanol is oxidised to ethanoic acid. Construct the fully displayed ethanoic acid molecule, including every hydrogen and both oxygen atoms.",
    "Ethanoic acid is CH₃–C(=O)–OH, with every atom and bond displayed. Its formula is C₂H₄O₂.",
    3,
    [0, 3, 0],
    [
      ["Two-carbon single-bonded chain, including the carboxyl carbon.", 1],
      [
        "Terminal C(=O)–O–H group with both oxygen connections and its O–H bond.",
        1,
      ],
      [
        "Three hydrogens bonded to the other carbon, none on the carboxyl carbon, with correct local valences. Do not penalise an O–H omission again here.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: acidReference,
      question: {
        organicDrawing: {
          maxCarbons: 4,
          note: "Choose a carbon scaffold, each hydrogen attachment and both oxygen connections. The preview retains your proposal.",
        },
        explanation:
          "Ethanoic acid is CH₃–C(=O)–OH, molecular formula C₂H₄O₂. The acid carbon is one of the two carbons.",
      },
    },
  ),
  organic(
    "21(b)",
    ["C6.2c"],
    "Describe an unsaturation test",
    "State the reagent used to distinguish an alkene from an alkane at room temperature without ultraviolet light, and the alkene's positive colour change.",
    "Bromine water changes from orange to colourless with the alkene.",
    2,
    [2, 0, 0],
    [
      ["Bromine water.", 1],
      [
        "Orange to colourless; 'clear' or a single colour alone is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  organic(
    "21(c)",
    ["C6.2d", "C6.2g"],
    "Construct a different repeat",
    "Construct an addition-polymer repeat of but-2-ene. Include all attachments, continuation bonds, brackets and n.",
    "A single C–C backbone with H and CH₃ attached to each backbone carbon, single continuation bonds through both brackets and lower-case n outside. Equivalent rotations or reversals are valid.",
    3,
    [0, 3, 0],
    [
      ["Converts the reacting double bond into a single backbone C–C bond.", 1],
      [
        "Retains H and CH₃ on each backbone carbon, without moving both methyl groups onto one carbon.",
        1,
      ],
      [
        "Single continuation bonds at both sides, brackets and n outside; no extra terminal hydrogen added.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: repeatReference,
      question: {
        polymerisationGiven: {
          groups: ["H", "CH3", "H", "CH3"],
          polymer: false,
        },
        polymerisationDrawing: {
          kind: "repeat",
          note: "Choose the bonds, attachments and polymer notation.",
        },
      },
    },
  ),
  organic(
    "21(d)",
    ["C6.2o"],
    "Balance a cracking equation",
    "Complete and balance C₁₀H₂₂ → C₆H₁₄ + ethene. Ethene has formula C₂H₄. Give the complete symbol equation.",
    "C₁₀H₂₂ → C₆H₁₄ +2C₂H₄",
    2,
    [0, 2, 0],
    [
      ["Uses C₂H₄ as ethene without changing its subscripts.", 1],
      [
        "Balances all atoms with two ethene molecules, ratio 1:1:2 or a consistent multiple.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true, writtenEquationKind: "symbol" } },
  ),
];
const resource = author("Section B · Materials and resources", "resources");
const resources: ExamPart[] = [
  resource(
    "22(a)",
    ["C6.1r", "C6.1s"],
    "Select using both requirements",
    "A panel must have tensile strength at least 250 MPa and density below 3.0 g/cm³. Material A:strength 180,density 2.7; B:strength 320,density 2.8; C:strength 400,density 7.8. Choose the suitable material and justify using both limits.",
    "B: 320 MPa meets the strength minimum and 2.8 g/cm³ is below the density limit. A fails strength and C fails density.",
    2,
    [0, 0, 2],
    [
      ["Selects B and compares 320≥250 MPa.", 1],
      [
        "Compares 2.8<3.0 g/cm³; stating 'strong/light' without using the supplied requirements is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  resource(
    "22(b)",
    ["C6.1q"],
    "Explain protection after a scratch",
    "A steel pipe is electrically connected to a block of magnesium, which is more reactive than iron. Explain why magnesium can protect exposed steel even where the paint is scratched.",
    "Magnesium oxidises/loses electrons in preference to iron, supplying sacrificial protection. This is effective despite the damaged paint barrier; magnesium is gradually consumed.",
    2,
    [2, 0, 0],
    [
      [
        "Magnesium is more reactive and oxidises/loses electrons preferentially.",
        1,
      ],
      [
        "Links sacrificial oxidation to preventing iron oxidation at the exposed patch, rather than claiming the scratch is sealed by magnesium.",
        1,
      ],
    ],
    "written",
  ),
  resource(
    "22(c)",
    ["C6.1k", "C6.1l"],
    "Compare the same service",
    "Equal-capacity single-use containers have these manufacturing data: X, 12 g and 50 MJ/kg; Y, 30 g and 30 MJ/kg. Calculate MJ per container. Evaluate 'Y needs less energy because 30 < 50'. Name another life-cycle stage needed to judge the overall environmental impact.",
    "X:0.012×50=0.60 MJ. Y:0.030×30=0.90 MJ. The claim is wrong per equal-capacity container: X uses less manufacturing energy despite a higher value per kilogram. Transport, use, raw-material extraction or disposal/recycling must also be considered for an overall judgement.",
    3,
    [0, 1, 2],
    [
      [
        "Uses masses in kg to calculate 0.60 MJ for X and 0.90 MJ for Y; both required for this calculation point.",
        1,
      ],
      [
        "Rejects the claim using a common per-container comparison; allow a justified judgement consistent with retained arithmetic.",
        1,
      ],
      [
        "Names another relevant life-cycle stage and recognises that manufacturing alone does not settle the overall impact.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  resource(
    "22(d)",
    ["C6.1m"],
    "Explain a benefit of recycling",
    "Give one resource-saving benefit of recycling aluminium into new products.",
    "It reduces the need to extract finite aluminium ore / reduces demand for newly extracted aluminium. Energy saving from avoiding primary extraction is another valid distinct benefit.",
    1,
    [1, 0, 0],
    [
      [
        "A valid explained resource or energy saving, not that recycling has no energy cost or makes all waste disappear.",
        1,
      ],
    ],
    "written",
  ),
  resource(
    "22(e)",
    ["C5.3b"],
    "Define dynamic equilibrium",
    "State the two conditions needed for a reversible reaction mixture to be at dynamic equilibrium. Do not assume reactant and product amounts are equal.",
    "The system is closed and the forward and reverse reactions continue at equal rates.",
    2,
    [2, 0, 0],
    [
      ["Closed system, with no reactants/products escaping.", 1],
      [
        "Equal continuing forward/reverse rates; neither stopped reactions nor equal concentrations.",
        1,
      ],
    ],
    "written",
  ),
];
const air = author("Section B · Atmosphere and water", "atmosphere");
const environment: ExamPart[] = [
  air(
    "23(a)",
    ["C6.3a"],
    "Explain the rise in atmospheric oxygen",
    "Explain how early photosynthetic organisms changed atmospheric carbon dioxide and oxygen.",
    "Photosynthesis used carbon dioxide and released oxygen, decreasing atmospheric carbon dioxide and allowing oxygen to accumulate over time.",
    2,
    [2, 0, 0],
    [
      ["Photosynthesis removes/uses carbon dioxide.", 1],
      [
        "Photosynthesis releases oxygen, linked to the atmosphere's increasing oxygen.",
        1,
      ],
    ],
    "written",
  ),
  air(
    "23(b)",
    ["C6.3b"],
    "Explain the greenhouse mechanism",
    "Explain how greenhouse gases reduce the rate at which Earth's surface loses energy to space. Refer to the type of radiation.",
    "The surface emits longer-wavelength infrared radiation. Greenhouse gases absorb and re-emit some of this infrared, including towards the surface, reducing net energy loss to space.",
    2,
    [2, 0, 0],
    [
      [
        "Absorption of outgoing long-wavelength infrared from the surface, not trapping ultraviolet by the ozone layer.",
        1,
      ],
      [
        "Re-emission in different directions including back towards the surface, reducing net energy loss.",
        1,
      ],
    ],
    "written",
  ),
  air(
    "23(c)",
    ["C6.3g"],
    "Treat a different water source",
    "A settlement has only seawater containing dissolved salts and possible microbes. A proposed treatment is filtration through sand followed by chlorination. Explain why this does not make the seawater potable and name a suitable additional process.",
    "Ordinary sand filtration removes suspended particles, and chlorination can kill microbes, but neither removes dissolved salts. Desalination by distillation or suitable reverse osmosis is needed; appropriate microbial treatment and quality checks are still required.",
    2,
    [0, 2, 0],
    [
      [
        "Identifies remaining dissolved salt, which ordinary filtration/chlorination does not remove.",
        1,
      ],
      [
        "Names distillation/desalination by reverse osmosis to remove dissolved salt; boiling without collecting condensed vapour is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  air(
    "23(d)",
    ["C6.3c"],
    "Evaluate an emissions claim",
    "A council reports a 20% fall in carbon dioxide from its own buses. It concludes 'All transport emissions in our city fell 20%, so global warming will stop.' Give two distinct limitations of this conclusion.",
    "Council buses are only one part of city transport, so their percentage change cannot establish the percentage change from all transport. One city's bus reductions also do not determine global net greenhouse-gas emissions or immediately stop warming; wider and longer-term evidence is needed.",
    2,
    [0, 0, 2],
    [
      [
        "Explains the unjustified extension from council buses to all city transport.",
        1,
      ],
      [
        "Explains why a local CO₂ change cannot establish that global warming stops, referring to wider emissions/other gases or accumulated long-term effects.",
        1,
      ],
    ],
    "written",
  ),
];

export const ocrPaper2FoundationFull: ExamPaper = {
  id: "ocr-paper-2-foundation-full",
  totalMarks: 90,
  minutes: 105,
  basis: {
    board: "OCR",
    qualification: "Gateway Science A J248",
    component: "J248/02",
    summary:
      "Gateway Foundation Paper 2: C4–C6 and practical skills C7, assuming prior C1–C3 knowledge. 15 multiple-choice marks and 75 structured marks include graph and organic constructions, titration readings, a six-mark identification plan and environmental evidence. Original practice, not an official OCR paper.",
    specificationUrl:
      "https://www.ocr.org.uk/Images/234598-specification-accredited-gcse-gateway-science-suite-chemistry-a-j248.pdf",
    researchPath: "docs/board-mocks/ocr-2f-basis.md",
  },
  parts: [
    ...sectionA,
    ...groups,
    ...quantities,
    ...titrations,
    ...rates,
    ...analyses,
    ...organics,
    ...resources,
    ...environment,
  ],
};

// Compared against the actual retained prompts and references, not topic tags.
const priorDisclosures: Record<string, string[]> = {
  "1": ["tm-chem-v1-ca-physical", "chem-p1f-full-v1-02d"],
  "2": ["ion-tests-v1-r-fe2"],
  "8": ["natural-v1-r-protein"],
  "9": ["air-pollutants-3"],
  "10": ["cf-v1-p-supply"],
  "12": ["haber-v1-g-preparation"],
  "13": ["gas-tests-v1-r-oxygen", "aqp-v1-p-test"],
  "16(a)": ["g7-write-v1-ca-trend"],
  "17(a)": ["me-v1-r-route"],
  "18(a)": ["tech-v1-a-method", "chem-edx-p1f-full-v1-8a"],
  "18(d)": ["chem-edx-p1f-full-v1-8a"],
  "19(d)": ["chem-p2h-full-v1-01c"],
  "20(b)": ["instrumental-analysis-v1-p-oneadv"],
  "22(b)": ["materials-v1-p-scratch"],
  "22(d)": ["lca-v1-cA-resources"],
  "23(c)": ["water-v1-cB-source", "water-v1-p-filtration"],
  "6": ["tc-v1-r-enzyme"],
  "11": ["g0-v1-p-neon", "g0-write-v1-ca-neon"],
  "16(d)": [
    "g7-v1-r-bleach",
    "g7-v1-ca-test",
    "gas-tests-v1-r-chlorine",
    "chem-edx-p2f-full-v1-1d",
  ],
  "19(e)": ["chem-p2f-full-v1-01d", "tc-v1-p-compare-mechanisms"],
  "21(a)": ["alc-v1-p-ethanoic", "alc-v1-b-draw"],
  "21(b)": ["crk-v1-r-bromine", "path-v1-r-bromine"],
  "22(e)": [
    "re-v1-a-written",
    "chem-p2h-full-v1-09f",
    "chem-edx-p1f-full-v1-10b",
    "chem-edx-p1h-full-v1-9a",
  ],
  "23(a)": ["chem-edx-p2h-full-v1-9a", "early-atmosphere-v1-g-photo"],
  "23(b)": ["greenhouse-v1-p-mechanism", "chem-edx-p2h-full-v1-9b"],
};
for (const part of ocrPaper2FoundationFull.parts)
  if (priorDisclosures[part.number])
    part.question.exposureAliases = priorDisclosures[part.number];
