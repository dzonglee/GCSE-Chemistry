import type { ExamPaper, ExamPart } from "./exam-paper-types";
import { boardPaperAuthor } from "./board-paper-authoring";
import { emptyFuelDrawing } from "../lib/fuel-drawing";
import { emptyOrganicDrawing } from "../lib/organic-drawing";
import { blankPolymerisationDrawing } from "../lib/polymerisation-board";

const author = boardPaperAuthor("chem-edx-p2f-full-v1-", "foundation");
const halogen = author("Halogen changes", "atomic-structure");
const group = author("Alkali and noble gases", "atomic-structure");
const rate = author("Original gas-rate observations", "rates");
const energy = author("Thermal changes", "energy");

// Individually authored for 1CH0/2F; this is not a relabelled AQA paper.
const halogens: ExamPart[] = [
  halogen(
    "1(a)",
    ["6.6"],
    "Recall bromine's appearance",
    "Give bromine's colour and physical state at room temperature.",
    "Red-brown (or orange-brown) liquid.",
    2,
    [2, 0, 0],
    [
      ["Red-brown/orange-brown colour.", 1],
      ["Liquid at room temperature; not a brown gas or solid.", 1],
    ],
    "written",
  ),
  halogen(
    "1(b)",
    ["6.11"],
    "Predict the displacement",
    "Bromine water is added to potassium chloride solution. Predict whether bromine displaces chloride, and explain using relative reactivity.",
    "No displacement: bromine is less reactive than chlorine, so cannot displace chloride from potassium chloride.",
    2,
    [0, 2, 0],
    [
      ["No displacement of chloride.", 1],
      [
        "Link this to bromine being less reactive than chlorine, rather than potassium being more reactive than bromine.",
        1,
      ],
    ],
    "written",
  ),
  halogen(
    "1(c)",
    ["6.9", "0.3"],
    "Write the metal-halogen equation",
    "Write a balanced symbol equation for lithium reacting with bromine to form lithium bromide, LiBr. State symbols are optional.",
    "2Li + Br2 → 2LiBr",
    2,
    [0, 2, 0],
    [
      [
        "Correct substances: Li, Br₂ and LiBr, without changing formula subscripts.",
        1,
      ],
      [
        "Balanced 2:1:2 coefficients, or consistent multiples. A correct complete equation supports both points.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true, writtenEquationKind: "symbol" } },
  ),
  halogen(
    "1(d)",
    ["6.8"],
    "Describe the chlorine test",
    "Describe the specified chemical test for chlorine gas, including the paper condition and positive observation.",
    "Damp litmus paper is bleached white. Damp blue litmus may turn red before being bleached; dry paper is not the specified test.",
    2,
    [2, 0, 0],
    [
      ["Uses damp/moist litmus paper.", 1],
      [
        "Paper is bleached white; turning red alone does not identify chlorine.",
        1,
      ],
    ],
    "written",
  ),
];

const groups: ExamPart[] = [
  group(
    "2(a)",
    ["6.1", "6.5"],
    "Explain the group position",
    "Potassium has electronic configuration 2,8,8,1. Explain why it is in Group 1.",
    "There is one electron in the outer occupied shell; the main-group number corresponds to that outer-electron count.",
    2,
    [0, 2, 0],
    [
      ["One electron in the outer occupied shell.", 1],
      [
        "Links the outer count to Group 1, rather than the number of occupied shells.",
        1,
      ],
    ],
    "written",
  ),
  group(
    "2(b)",
    ["6.4", "6.5"],
    "Explain the reactivity comparison",
    "Rubidium is below potassium in Group 1. Explain why rubidium reacts more readily, referring to shells, attraction and electron loss.",
    "Rubidium's outer electron occupies a shell farther from the nucleus, with more inner-shell shielding. The nuclear attraction to that electron is weaker, so it is lost more easily.",
    3,
    [0, 3, 0],
    [
      [
        "More occupied shells put the outer electron farther from the nucleus.",
        1,
      ],
      [
        "Greater shielding/weaker attraction to the outer electron; not fewer protons in rubidium.",
        1,
      ],
      [
        "Links weaker attraction to easier loss of the outer electron and greater reactivity.",
        1,
      ],
    ],
    "written",
  ),
  group(
    "2(c)",
    ["6.3", "6.4"],
    "Predict from the trend",
    "A teacher's recordings show increasingly vigorous water reactions from lithium to potassium. Predict how caesium would compare with potassium.",
    "Caesium would react more vigorously than potassium, potentially explosively. This is a prediction from the group trend, not an instruction to perform the reaction.",
    1,
    [0, 1, 0],
    [
      [
        "Predicts a more vigorous/violent reaction than potassium from the down-group trend.",
        1,
      ],
    ],
    "written",
    { question: { shortWritten: true } },
  ),
  group(
    "2(d)",
    ["6.14", "6.15"],
    "Explain helium's use",
    "Explain two reasons for choosing helium for a lifting balloon.",
    "Its density is lower than air, so a helium-filled balloon can provide lift. Its full outer electron shell makes helium inert; it is non-flammable and does not readily react.",
    2,
    [2, 0, 0],
    [
      ["Lower density than air allows lift, not merely 'helium is light'.", 1],
      [
        "Inert/non-flammable helium does not readily react or burn, linked to balloon use.",
        1,
      ],
    ],
    "written",
  ),
];

const gasDrawing = {
  data: {
    context: "measurement" as const,
    title: "Original marble-chip gas observations",
    xName: "Time",
    xUnit: "s",
    yName: "Gas volume",
    yUnit: "cm³",
    points: [
      [0, 0],
      [20, 32],
      [40, 50],
      [60, 61],
      [80, 66],
      [100, 66],
    ] as [number, number][],
    xMin: 0,
    xMax: 120,
    xTick: 20,
    yMin: 0,
    yMax: 80,
    yTick: 20,
    targetX: 100,
    estimateRange: [65, 67] as [number, number],
    trend: "Increasing volume with decreasing gradient, then a plateau.",
    limit: "suppliedPlateau",
    note: "Original illustrative measurements at matched temperature and pressure; volumes stay at 66 cm³ after 100 s. These are supplied observations, not an exact rate law.",
  },
  note: "Plot the observations and independently choose a smooth supported fit. No extrapolation or separate estimate is marked.",
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

const rates: ExamPart[] = [
  rate(
    "3(a)",
    ["7.1a", "7.2", "7.5"],
    "Construct the gas graph",
    "Plot all six observations and draw a separate smooth best-fit curve, including the plateau. No separate estimate is marked.",
    "Plot (0,0),(20,32),(40,50),(60,61),(80,66),(100,66). A smooth supported curve rises with decreasing gradient and levels near 66 cm³; other sensible balanced curves are valid.",
    3,
    [0, 3, 0],
    [
      [
        "All six supplied observations within half a small square: 2 marks; four or five correct: 1 mark. Score observations separately from fit anchors.",
        2,
      ],
      [
        "A separate smooth curve is supported by the plotted observations and their plateau. Allow an appropriate fit through the student's retained points after a plotting error; reject straight dot-to-dot joins or an unsupported changing endpoint.",
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
    "3(b)",
    ["7.2", "7.5"],
    "Calculate an interval rate",
    "In this investigation, gas volume is 50 cm³ at 40 s and 66 cm³ at 80 s. Calculate the mean rate over this interval, in cm³/s, to two decimal places. Show working.",
    "0.40",
    2,
    [0, 2, 0],
    [
      ["Uses change in volume divided by elapsed time: (66−50)/(80−40).", 1],
      [
        "Presents 0.40 cm³/s to two decimal places. Allow correct evaluation/rounding of an earlier consistent interval setup; volume divided by final time is not a valid interval method.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 2, question: { unit: "cm³/s" } },
  ),
  rate(
    "3(c)",
    ["7.3", "7.4"],
    "Explain slowing as reactants are used",
    "Explain why an acid–marble-chip reaction slows as the acid is used up, while temperature remains constant.",
    "Acid reactant concentration decreases, leaving fewer reacting particles per unit volume. Collisions with the marble surface become less frequent, so fewer successful collisions occur per second.",
    3,
    [3, 0, 0],
    [
      ["Acid reactant is used up and its concentration decreases.", 1],
      ["Fewer acid particles per unit volume reach the reacting surface.", 1],
      [
        "Less frequent successful collisions reduce the rate; do not claim particles lose energy solely because concentration falls.",
        1,
      ],
    ],
    "written",
  ),
  rate(
    "3(d)",
    ["7.1a", "7.4"],
    "Plan a fair chip comparison",
    "A class compares large and small marble chips. Explain what should stay the same so that the starting-rate comparison tests surface area fairly.",
    "Use the same marble mass, acid volume and concentration, and temperature, with the same gas-collection method. Change chip size, so any starting-rate difference can reasonably be attributed to available surface area rather than reactant amount or temperature.",
    2,
    [0, 0, 2],
    [
      [
        "Matches marble mass and acid volume/concentration; do not match chip count while changing total marble mass.",
        1,
      ],
      [
        "Matches temperature and collection/timing method, linked to isolating chip size/surface area rather than another cause.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  rate(
    "3(e)",
    ["7.4", "7.5"],
    "Evaluate the faster-means-more claim",
    "The repeated trial has the same acid amount and excess marble, but smaller chips. It reaches 66 cm³ sooner. A student says its graph must finish higher because it is faster. Evaluate.",
    "Smaller chips provide more exposed surface and a steeper initial curve, so 66 cm³ is reached sooner. The acid amount is unchanged and marble remains in excess, so the final product amount/volume is unchanged at matched conditions. Faster production does not itself increase the total product.",
    3,
    [0, 1, 2],
    [
      [
        "Relates smaller chips to more available surface/faster initial production.",
        1,
      ],
      [
        "Uses the unchanged acid amount with excess marble to justify the same 66 cm³ endpoint.",
        1,
      ],
      [
        "Rejects the higher-endpoint claim: compare time/gradient separately from final gas amount.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
];

const endothermicReference = JSON.stringify({
  reactant: "20",
  product: "65",
  peak: "130",
  activationArrow: "reactants-peak",
  overallArrow: "reactants-products",
});
const thermal: ExamPart[] = [
  energy(
    "4(a)",
    ["7.9a"],
    "Calculate the signed temperature change",
    "Water starts at 22.6°C. After a salt dissolves, the mixture reaches 17.4°C. Calculate final minus initial temperature, including the sign.",
    "-5.2",
    2,
    [0, 2, 0],
    [
      ["Calculates a temperature-change magnitude of 5.2°C.", 1],
      [
        "Uses a negative sign for cooling: −5.2°C. Judge sign separately from magnitude.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 2, question: { unit: "°C" } },
  ),
  energy(
    "4(b)",
    ["7.11"],
    "Explain the cooling",
    "Explain why an endothermic dissolving process can cool the surrounding water.",
    "Heat energy is taken into the dissolving system from the surrounding water. The surroundings lose heat and their measured temperature falls.",
    2,
    [2, 0, 0],
    [
      ["Endothermic process absorbs/takes in heat energy.", 1],
      [
        "Identifies the surrounding water as the energy source, explaining its cooling.",
        1,
      ],
    ],
    "written",
  ),
  energy(
    "4(c)",
    ["7.15", "7.16"],
    "Construct an endothermic profile",
    "Draw an endothermic reaction profile. Choose your own relative levels; show activation-energy and overall-change arrows.",
    endothermicReference,
    2,
    [0, 2, 0],
    [
      [
        "Products above reactants and a peak above both; any suitable independently chosen levels are valid.",
        1,
      ],
      [
        "Activation spans reactants→peak, and overall change spans reactants→higher products. Zero→peak alone is not activation energy.",
        1,
      ],
    ],
    "native",
    {
      question: {
        profileDrawing: true,
        compactProfileInstructions: true,
        explanation:
          "One possible profile has reactants20, products65 and peak130 kJ on a relative reference. Other levels are valid: products are above reactants, and the peak is above both. Activation runs from reactants to peak; the overall change runs from reactants to products.",
      },
      referenceConstruction: endothermicReference,
    },
  ),
  energy(
    "4(d)",
    ["7.9"],
    "Improve the thermal measurement",
    "A student measures a temperature change in a thin metal cup. Suggest a container improvement and explain its relevance.",
    "Use an insulating polystyrene cup, ideally with a fitted lid for the thermometer. Reduced heat exchange with the surroundings makes the measured change more representative of the process. Insulation does not create energy or guarantee zero heat loss.",
    2,
    [0, 0, 2],
    [
      [
        "A suitable insulating container, such as polystyrene; a lid alone does not change the metal side-wall conductivity.",
        1,
      ],
      [
        "Links insulation to reduced heat transfer between mixture and surroundings, not 'temperature cannot escape'.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  energy(
    "4(e)",
    ["7.12"],
    "Distinguish bond processes",
    "State which process takes in energy and which releases energy: breaking chemical bonds and forming chemical bonds.",
    "Breaking bonds takes in energy; forming bonds releases energy.",
    2,
    [2, 0, 0],
    [
      ["Bond breaking takes in energy/is endothermic.", 1],
      [
        "Bond formation releases energy/is exothermic; don't reverse these processes.",
        1,
      ],
    ],
    "written",
  ),
];

const fuel = author("Fuel fractions and combustion", "organic");
const atmosphere = author("Atmosphere evidence", "atmosphere");
const analysis = author("Unknown-ion analysis", "analysis");

const fuels: ExamPart[] = [
  fuel(
    "5(a)",
    ["8.2", "8.3", "8.5"],
    "Explain fractional distillation",
    "Explain how a fractionating column separates crude oil into useful mixtures. Refer to boiling points and the column temperature.",
    "Crude oil contains hydrocarbons with different boiling points. Vaporised hydrocarbons rise through a column that is cooler higher up and condense when they reach regions below their boiling points. Lower-boiling fractions are collected higher up; each fraction is still a mixture. This separates molecules without cracking their covalent bonds.",
    3,
    [3, 0, 0],
    [
      [
        "Hydrocarbons have different boiling points; fractions remain mixtures.",
        1,
      ],
      [
        "Column is hotter below and cooler above, allowing different condensation positions.",
        1,
      ],
      [
        "Lower-boiling fractions rise farther before condensing; separation is not breaking hydrocarbons into smaller molecules.",
        1,
      ],
    ],
    "written",
  ),
  fuel(
    "5(b)",
    ["8.6"],
    "Use the alkane pattern",
    "An alkane has seven carbon atoms. Use CₙH₂ₙ₊₂ to derive its molecular formula. Show how the hydrogen count is obtained.",
    "C7H16",
    2,
    [0, 2, 0],
    [
      ["Substitutes n=7 into2n+2, giving16 hydrogens.", 1],
      [
        "Correct molecular formula C₇H₁₆, do not halve the hydrogen count or use an alkene formula.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  fuel(
    "5(c)",
    ["8.7", "9.16C", "0.3"],
    "Write complete ethane combustion",
    "Write a complete balanced symbol equation for combustion of ethane, C₂H₆, in plentiful oxygen. Include every product; state symbols are optional.",
    "2C2H6 + 7O2 → 4CO2 + 6H2O",
    2,
    [0, 2, 0],
    [
      [
        "Correct reactants and complete-combustion products CO₂ and H₂O, without adding CO/soot.",
        1,
      ],
      [
        "Balanced2:7:4:6 coefficients, or a consistent multiple/fractional equivalent such as C₂H₆+3.5O₂→2CO₂+3H₂O.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true, writtenEquationKind: "symbol" } },
  ),
  fuel(
    "5(d)",
    ["8.9", "8.10"],
    "Explain carbon monoxide's danger",
    "Explain why breathing carbon monoxide can reduce the oxygen supplied to body tissues.",
    "Carbon monoxide binds to haemoglobin in red blood cells and prevents it transporting sufficient oxygen. Body tissues receive less oxygen for respiration; being colourless/odourless alone does not explain the chemical harm.",
    2,
    [2, 0, 0],
    [
      ["Carbon monoxide binds to haemoglobin/red blood cells.", 1],
      [
        "Links that binding to reduced oxygen transport to body tissues, not merely irritation or acid rain.",
        1,
      ],
    ],
    "written",
  ),
  fuel(
    "5(e)",
    ["8.8", "8.10", "8.11"],
    "Evaluate the exhaust explanation",
    "An engine's air filter becomes blocked. Its exhaust now contains soot and carbon monoxide. A tester says sulfur impurities alone explain both products. Evaluate the explanation.",
    "Reduced oxygen supply promotes incomplete combustion, which can produce carbon/soot and carbon monoxide. Burning sulfur impurities produces sulfur dioxide, not these carbon-containing products. The observed change is consistent with restricted air; the exhaust observations alone do not quantify the fuel's sulfur content.",
    3,
    [0, 0, 3],
    [
      ["Links the blocked filter to less oxygen and incomplete combustion.", 1],
      [
        "Connects incomplete combustion to both soot/carbon and CO; not complete combustion giving CO only.",
        1,
      ],
      [
        "Rejects sulfur as the direct source of those carbon products: sulfur gives SO₂, and these observations do not measure sulfur impurity.",
        1,
      ],
    ],
    "written",
  ),
];

const air: ExamPart[] = [
  atmosphere(
    "6(a)",
    ["8.26a"],
    "Recall the major atmospheric gas",
    "Name the most abundant gas in today's atmosphere.",
    "Nitrogen.",
    1,
    [1, 0, 0],
    [
      [
        "Nitrogen; oxygen and carbon dioxide are not the largest proportions.",
        1,
      ],
    ],
    "written",
    { question: { shortWritten: true } },
  ),
  atmosphere(
    "6(b)",
    ["8.20", "8.21"],
    "Explain ocean uptake",
    "Explain how the formation of oceans contributed to decreasing carbon dioxide in Earth's atmosphere.",
    "As Earth cooled, water vapour condensed to form liquid oceans. Carbon dioxide dissolved in that water, transferring some carbon dioxide out of the atmosphere.",
    2,
    [2, 0, 0],
    [
      ["Cooling and water-vapour condensation formed liquid oceans.", 1],
      [
        "Carbon dioxide dissolved in the ocean water, removing it from the atmosphere; CO₂ itself did not simply condense into those oceans.",
        1,
      ],
    ],
    "written",
  ),
  atmosphere(
    "6(c)",
    ["8.25a"],
    "Calculate the supplied ppm increase",
    "An illustrative data series gives CO₂ as 377.5 ppm in 2004 and 425.0 ppm in 2024. Calculate the increase in ppm to one decimal place. Show working.",
    "47.5",
    2,
    [0, 2, 0],
    [
      ["Subtracts377.5 from425.0 rather than using a percentage formula.", 1],
      [
        "Correctly presents47.5ppm to one decimal place; allow consistent subtraction after a copied-value error, without treating it as correct use of the supplied values.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "ppm" } },
  ),
  atmosphere(
    "6(d)",
    ["8.25"],
    "Evaluate two-station evidence",
    "Over 20 years, station A records CO₂ rising 38 ppm and warming 0.6°C; B records CO₂ rising 41 ppm and warming 0.8°C. A report says this proves the exact global temperature change was caused only by CO₂. Evaluate.",
    "Both records show rising CO₂ alongside warming, consistent with a positive association. Two stations do not establish the exact global average; location, calibration and historical accuracy matter. Association alone does not isolate CO₂ from every other influence, although the greenhouse mechanism and broader evidence support its role.",
    3,
    [0, 0, 3],
    [
      ["Identifies the common positive association in both records.", 1],
      [
        "Explains that two local stations need not represent the global average, with a relevant location/measurement limitation.",
        1,
      ],
      [
        "Rejects proof of an exclusive cause from correlation alone, without claiming these limits disprove the greenhouse effect or established wider evidence.",
        1,
      ],
    ],
    "written",
  ),
  atmosphere(
    "6(e)",
    ["8.24"],
    "Interpret greenhouse absorption",
    "Which radiation from Earth's surface is absorbed by greenhouse gases in the described mechanism?",
    "Outgoing infrared radiation",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Outgoing infrared radiation",
          "All incoming visible light",
          "Only ultraviolet radiation absorbed by ozone",
        ],
      },
    },
  ),
];

const ions: ExamPart[] = [
  analysis(
    "7(a)",
    ["9.3Cf", "9.4C", "9.5Cc", "9.6C"],
    "Plan the two-ion investigation",
    "Plan separate tests to identify ammonium and bromide ions in a soluble salt, in a supervised school lab. Give steps, reagents, positive observations and identifications.",
    "Dissolve separate fresh portions using distilled water and clean apparatus. Add NaOH to one portion and warm gently: test the evolved gas with damp red litmus held at the tube mouth, without dipping into the alkaline mixture. Ammonia turns it blue, supporting ammonium ions. Acidify a different portion with dilute nitric acid, then add silver nitrate: a cream precipitate supports bromide ions. Using fresh portions avoids carrying chloride or alkali into the second test; give an observation and interpretation for each branch.",
    6,
    [3, 0, 3],
    [],
    "written",
    {
      practical: 6,
      levels: [
        {
          min: 5,
          max: 6,
          text: "A coherent workable plan has separate clean dissolved portions, NaOH/warming and the ammonia/damp-red-litmus observation, plus nitric acid before silver nitrate and the cream bromide precipitate. Interpret both outcomes. Award6 for secure completeness;5 for a minor omission that does not invalidate either identification.",
        },
        {
          min: 3,
          max: 4,
          text: "A mostly relevant plan contains useful steps and interpretations, but one branch or its reagent/sequence/observation is incomplete. Decide3 or4 from whether the complete method would reliably establish both requested ions, rather than a keyword count.",
        },
        {
          min: 1,
          max: 2,
          text: "Limited relevant test steps or observations appear, but the method would not establish both ions. Award2 for more developed relevant content,1 for an isolated useful idea.",
        },
        { min: 0, max: 0, text: "No relevant identification method." },
      ],
    },
  ),
  analysis(
    "7(b)",
    ["9.9Ca"],
    "Use the photometer calibration",
    "A flame photometer gives intensity 4,24,44,64 for concentration 0,2,4,6 mg/dm³ respectively. An unknown gives intensity 34. Assume the shown calibration is linear. Determine its concentration and show your interpolation.",
    "3",
    3,
    [0, 3, 0],
    [
      [
        "Accounts for the blank/zero-concentration intensity4; an intensity-to-concentration proportion through zero is invalid.",
        1,
      ],
      [
        "Uses the10-intensity-units per mg/dm³ gradient, or halfway between the2 and4mg/dm³ calibration points.",
        1,
      ],
      [
        "Obtains3mg/dm³. Allow correct evaluation of a consistent preceding linear setup after an earlier error; simply34/10 without blank correction cannot earn full credit.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 3, question: { unit: "mg/dm³" } },
  ),
  analysis(
    "7(c)",
    ["9.3Ca", "9.3Cb"],
    "Distinguish white precipitates",
    "Aluminium and calcium ion solutions can both give a white precipitate with a few drops of NaOH. Describe how excess NaOH can distinguish them.",
    "Aluminium hydroxide dissolves in excess sodium hydroxide to give a colourless solution. Calcium hydroxide remains as a white precipitate under the specified test conditions.",
    2,
    [2, 0, 0],
    [
      [
        "Aluminium precipitate dissolves in excess NaOH, giving a colourless solution.",
        1,
      ],
      [
        "Calcium precipitate remains; initial white colour alone does not uniquely identify either ion.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
];

const alcohol = author("Alcohol structures and measurements", "organic");
const polymer = author("Addition polymers", "organic");
const nano = author("Nanoparticles and material choice", "bonding");

const propanol = {
  ...emptyOrganicDrawing(),
  n: "3",
  hydroxyl: "yes",
  oxygenH: "yes",
  h0: "yes",
  h1: "yes",
  h2: "yes",
  h4: "yes",
  h5: "yes",
  h8: "yes",
  h9: "yes",
};
const propanolReference = JSON.stringify(propanol);
const alcohols: ExamPart[] = [
  alcohol(
    "8(a)",
    ["9.26C"],
    "Construct propan-1-ol",
    "Construct the displayed structure of propan-1-ol. Show every C, H and O atom and all covalent bonds.",
    "CH₃–CH₂–CH₂–O–H, with each C–H bond explicitly displayed. There are three carbons, eight hydrogens and one oxygen; each carbon has bond order four and oxygen has two single bonds.",
    3,
    [3, 0, 0],
    [
      [
        "Three-carbon chain with single C–C bonds; not a two-carbon scaffold.",
        1,
      ],
      [
        "Terminal C–O–H alcohol group with both bonds, not C=O or a bare terminal oxygen.",
        1,
      ],
      [
        "All seven C-bound H attachments are correctly displayed (3,2,2 along the chain), with correct carbon valences. Score the O-bound H in the preceding functional-group point, so a single missing O–H bond is not penalised twice.",
        1,
      ],
    ],
    "native",
    {
      question: {
        organicDrawing: {
          maxCarbons: 4,
          note: "Build your structure from blank choices. Select each oxygen connection and hydrogen attachment; the preview preserves your proposal.",
        },
      },
      referenceConstruction: propanolReference,
    },
  ),
  alcohol(
    "8(b)",
    ["9.27C"],
    "Recall the alcohol functional group",
    "State the functional group of an alcohol.",
    "–OH (hydroxyl).",
    1,
    [1, 0, 0],
    [
      [
        "Hydroxyl/–OH with the O–H group; –COOH is the carboxylic-acid group.",
        1,
      ],
    ],
    "written",
    { question: { shortWritten: true } },
  ),
  alcohol(
    "8(c)",
    ["7.8", "9.33C"],
    "Explain yeast's role",
    "In carbohydrate fermentation, what does yeast supply and what chemical conversion occurs?",
    "Yeast supplies enzymes that act as biological catalysts. Carbohydrate/glucose in aqueous solution is converted into ethanol and carbon dioxide.",
    2,
    [2, 0, 0],
    [
      [
        "Yeast supplies enzymes/biological catalysts; not oxygen or an inorganic acid catalyst.",
        1,
      ],
      ["Carbohydrate/glucose is converted to ethanol and carbon dioxide.", 1],
    ],
    "written",
  ),
  alcohol(
    "8(d)",
    ["1.49", "9.33C"],
    "Calculate the glucose concentration",
    "54 g of glucose is dissolved to make 360 cm³ of solution. Calculate its concentration in g/dm³. Show the volume conversion and working.",
    "150",
    2,
    [0, 2, 0],
    [
      [
        "Converts360cm³ to0.360dm³ (or an equivalent factor-of1000 calculation).",
        1,
      ],
      [
        "Uses54/0.360 to obtain150g/dm³. Allow a correct mass/volume evaluation after a volume-conversion error; do not award correct-use credit for54/360 without conversion.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "g/dm³" } },
  ),
  alcohol(
    "8(e)",
    ["9.28C"],
    "Compare matched burner measurements",
    "Matched trials heat the same water mass by 20°C. Burner A falls from 171.32 g to 170.67 g; B from 161.50 g to 161.02 g. Calculate each fuel mass used and say which transfers more heat to this water per gram.",
    "A uses0.65g and B0.48g. B transfers the same measured heat to the water using less fuel mass, so more measured heat per gram in these matched trials. This is not automatically the true complete-combustion energy per gram.",
    2,
    [0, 2, 0],
    [
      [
        "Correct mass losses: A0.65g and B0.48g, using each before/after pair.",
        1,
      ],
      [
        "Chooses B from the lower mass for the same water mass/temperature rise, explicitly on a per-gram basis.",
        1,
      ],
    ],
    "written",
    { mathematics: true, practical: 2 },
  ),
  alcohol(
    "8(f)",
    ["9.28C"],
    "Evaluate the heat-loss limitation",
    "Explain why measured water heating in an open burner trial can underestimate the heat released by combustion.",
    "Some released heat warms the container and surrounding air instead of the measured water. The water's measured gain therefore omits part of the released energy; reducing losses improves the comparison but does not guarantee complete recovery.",
    2,
    [0, 0, 2],
    [
      [
        "Identifies transfer to surroundings/apparatus rather than all heat entering the water.",
        1,
      ],
      [
        "Links omitted heat to a smaller measured water-energy gain than total release; not conservation of energy failing.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
];

const repeatReference = JSON.stringify({
  ...blankPolymerisationDrawing(),
  s0: "H",
  s1: "H",
  s2: "F",
  s3: "Cl",
  bond: "1",
  left: "1",
  right: "1",
  brackets: "1",
  countMark: "n",
});
const polymers: ExamPart[] = [
  polymer(
    "9(a)",
    ["9.19C", "9.20C"],
    "Build the supplied alkene's repeat",
    "Construct one polymer repeat from this alkene. Retain all attachments; show continuation bonds, brackets and n.",
    "A single C–C backbone, with two H on one carbon and F plus Cl on the other. Both single continuation bonds pass through brackets, with lower-case n outside. Reversed/rotated equivalent diagrams are valid if the actual attachments are retained.",
    3,
    [0, 3, 0],
    [
      ["Changes the reacting C=C into a single backbone C–C bond.", 1],
      [
        "Preserves two H together on one backbone carbon and F/Cl together on the other; matching total formula alone is insufficient.",
        1,
      ],
      [
        "Both chain-continuation bonds are single, with the requested brackets and n outside; no extra terminal H is added to the repeat crop.",
        1,
      ],
    ],
    "native",
    {
      question: {
        polymerisationGiven: { groups: ["H", "H", "F", "Cl"], polymer: false },
        polymerisationDrawing: {
          kind: "repeat",
          note: "The supplied alkene is fixed. Construct your proposed repeat from blank bond, substituent and notation choices; it is retained without automatic correction.",
        },
      },
      referenceConstruction: repeatReference,
    },
  ),
  polymer(
    "9(b)",
    ["9.18C", "9.19C"],
    "Recall the addition by-product",
    "Does addition polymerisation of alkene monomers release a small molecule as a by-product?",
    "No small-molecule by-product.",
    1,
    [1, 0, 0],
    [
      [
        "No small molecule is eliminated in addition polymerisation; not water or hydrogen chloride.",
        1,
      ],
    ],
    "written",
    { question: { shortWritten: true } },
  ),
  polymer(
    "9(c)",
    ["9.21C"],
    "Explain an insulating coating",
    "PVC is used to coat electrical wiring. Give a useful property and explain why it suits this use.",
    "PVC is an electrical insulator, so it prevents current passing from the conductor to someone touching the coating. Suitable flexibility also lets coated wiring bend without exposing the metal.",
    2,
    [2, 0, 0],
    [
      [
        "A relevant PVC property: electrical insulation or suitable flexibility.",
        1,
      ],
      [
        "Links the property to wiring protection: reducing shock/current transfer, or keeping a continuous coating when a wire bends. 'Strong' without a use-related reason is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  polymer(
    "9(d)",
    ["9.23C", "9.24C"],
    "Evaluate sorting evidence",
    "Per 500 kg plastic input, sorting recovers 480 kg using 2.8 MJ per kg input; mixed processing recovers 320 kg using 1.6 MJ per kg input. A report says mixed processing must be best overall because its energy figure is lower. Evaluate.",
    "Sorting recovers160kg more plastic from the matched input, while its stated energy per input kilogram is higher. Lower energy is one benefit of mixed processing, but the lower material recovery is a competing disadvantage. Economic costs and wider impacts also need assessment before declaring an overall winner.",
    2,
    [0, 0, 2],
    [
      [
        "Compares both recovery and energy:480 versus320kg, and2.8 versus1.6MJ per input kg; don't add unlike units into a fabricated score.",
        1,
      ],
      [
        "Rejects an automatic overall winner from energy alone, explaining the material/energy trade-off or missing economic/wider-impact evidence.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  polymer(
    "9(e)",
    ["9.25Cc"],
    "Recall protein monomers",
    "What type of monomer makes up proteins?",
    "Amino acids.",
    1,
    [1, 0, 0],
    [["Amino acids; glucose and nucleotides are not protein monomers.", 1]],
    "written",
    { question: { shortWritten: true } },
  ),
  polymer(
    "9(f)",
    ["1.43a", "9.20C"],
    "Find the monomer's formula mass",
    "Calculate the relative formula mass of C₂H₂FCl. Use Ar(C)=12, H=1, F=19 and Cl=35.5.",
    "80.5",
    1,
    [0, 1, 0],
    [["2×12+2×1+19+35.5=80.5. Relative formula mass has no gram unit.", 1]],
    "scalar",
    { mathematics: true },
  ),
  polymer(
    "9(g)",
    ["9.17C", "9.18C"],
    "Explain the monomer's role",
    "Explain what a monomer is in alkene addition polymerisation.",
    "A monomer is a small molecule that can join with many other monomer molecules to form a polymer chain.",
    1,
    [1, 0, 0],
    [
      [
        "A small molecule that can join with others to make the polymer chain; not an unchanged catalyst or a complete long polymer chain.",
        1,
      ],
    ],
    "written",
    { question: { shortWritten: true } },
  ),
];

const nanoparticles: ExamPart[] = [
  nano(
    "10(a)",
    ["9.35C"],
    "Convert the particle size",
    "A particle is 75 nm wide. Express this length in metres. Scientific notation is accepted.",
    "7.5e-8",
    1,
    [0, 1, 0],
    [["75×10⁻⁹m=7.5×10⁻⁸m (0.000000075m). Do not confuse nano with micro.", 1]],
    "scalar",
    {
      mathematics: true,
      question: { unit: "m", inputMode: "text", tolerance: 1e-12 },
    },
  ),
  nano(
    "10(b)",
    ["9.36C"],
    "Calculate a cube's numerical ratio",
    "A cube has side 36 nm. Calculate its surface area in nm² and volume in nm³, then express their numerical SA:V ratio as 1:x. Show working.",
    "Surface area=6×36²=7776nm²; volume=36³=46656nm³. Their numerical ratio7776:46656 simplifies to1:6 in these stated units.",
    2,
    [0, 2, 0],
    [
      [
        "Uses all six faces and calculates7776nm² and46656nm³; don't use just one face.",
        1,
      ],
      [
        "Normalises surface-area:volume to1:6 (x=6). Allow correct simplification of preceding calculated values, with the requested order retained.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  nano(
    "10(c)",
    ["9.36C", "9.37C"],
    "Recall a benefit and a possible risk",
    "State one way a large surface-area-to-volume ratio can make a nanoparticle useful, and one possible health risk that needs investigation.",
    "A greater proportion of constituent atoms lies at the surface, which can increase catalytic/reactive contact per unit material. Small particles may be inhaled or enter tissues and could have harmful effects; the actual risk depends on material, dose and exposure and must be investigated.",
    2,
    [2, 0, 0],
    [
      [
        "Relevant large-surface benefit, such as more exposed catalytic/reactive sites per unit material.",
        1,
      ],
      [
        "A plausible health risk, such as inhalation/tissue entry or possible toxicity, stated as an investigated risk rather than every nanoparticle being inevitably toxic.",
        1,
      ],
    ],
    "written",
  ),
  nano(
    "10(d)",
    ["9.38C"],
    "Select from the measured property",
    "Bending before failure in matched tests: glass 0 mm, ceramic 0 mm, metal 5 mm. Which tested sample meets a requirement to bend 5 mm?",
    "Metal",
    1,
    [0, 0, 1],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["Glass", "Ceramic", "Metal"],
        explanation:
          "Only the supplied metal sample meets the5mm requirement in these matched tests. This does not establish every metal's performance or an overall best material.",
      },
    },
  ),
];

export const edexcelPaper2FoundationFull: ExamPaper = {
  id: "edexcel-paper-2-foundation-full",
  totalMarks: 100,
  minutes: 105,
  basis: {
    board: "Edexcel",
    qualification: "1CH0",
    component: "1CH0/2F",
    summary:
      "Pearson Paper 2: common key concepts, periodic groups, rates and energy, fuels/Earth science and Separate chemistry 2. Original evidence includes a gas-rate curve, signed cooling, photometer calibration, alcohol construction and an unfamiliar addition-polymer repeat.",
    specificationUrl:
      "https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-chemistry-spec.pdf",
    researchPath: "docs/board-mocks/edexcel-2f-basis.md",
  },
  parts: [
    ...halogens,
    ...groups,
    ...rates,
    ...thermal,
    ...fuels,
    ...air,
    ...ions,
    ...alcohols,
    ...polymers,
    ...nanoparticles,
  ],
};

// Actual earlier prompts/references were individually read; these disclose the
// same recalled response or construction. Different numerical data are not linked.
const reviewedDisclosures: Record<string, string[]> = {
  "1(a)": ["g7-v1-p-room"],
  "1(b)": ["g7-v1-p-none", "g7-write-v1-ra-none"],
  "1(d)": ["g7-v1-r-bleach", "gas-tests-v1-vA-chlorine"],
  "2(a)": ["g1-v1-r-family"],
  "2(b)": ["g1-write-v1-ca-trend"],
  "2(c)": ["g1-v1-p-predict"],
  "2(d)": ["g0-v1-ca-use"],
  "3(c)": ["ct-v1-p-depletion"],
  "4(b)": ["heat-v1-d-a-explain"],
  "4(c)": ["profile-v1-b-draw"],
  "4(e)": ["alk-v1-p-energy-written"],
  "5(a)": ["oil-v1-p-method-written"],
  "5(d)": ["alk-v1-r-co"],
  "6(a)": ["early-atmosphere-v1-p-approx"],
  "6(b)": ["early-atmosphere-v1-p-ocean", "early-atmosphere-v1-p-dissolve"],
  "6(e)": ["chem-p2f-full-v1-08a"],
  "7(c)": ["ion-tests-v1-r-excess", "ion-tests-v1-p-al"],
  "8(a)": ["alc-v1-p-propanol"],
  "8(b)": ["alc-v1-p-propanol"],
  "8(c)": ["alc-v1-p-ferment-plan"],
  "8(f)": ["alc-v1-p-practical"],
  "9(b)": ["pol-v1-r-groups"],
  "9(e)": ["natural-v1-r-protein"],
  "9(g)": ["pol-v1-r-monomer", "chem-p2f-full-v1-04b"],
};
for (const part of edexcelPaper2FoundationFull.parts) {
  const aliases = reviewedDisclosures[part.number];
  if (aliases) part.question.exposureAliases = aliases;
}
