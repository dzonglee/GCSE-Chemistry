import type { ExamPaper, ExamPart } from "./exam-paper-types";
import { boardPaperAuthor } from "./board-paper-authoring";
import { blankPolymerisationDrawing } from "../lib/polymerisation-board";
import { blankPolyesterDrawing } from "../lib/polyester";

const author = boardPaperAuthor("chem-ocr-p4h-full-v1-", "higher");
const mc = author("Section A · Multiple choice", "global-challenges");
const sectionA: ExamPart[] = [
  mc(
    "1",
    ["C6.3b"],
    "Account for atmospheric oxygen",
    "Which process best explains the large increase in atmospheric oxygen over Earth's early history?",
    "Photosynthesis by algae and later plants",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Photosynthesis by algae and later plants",
          "All oxygen came directly from volcanoes",
          "Oxygen formed because nitrogen disappeared",
          "Only recent car engines produced oxygen",
        ],
      },
    },
  ),
  mc(
    "2",
    ["C4.1b"],
    "Explain a Group 1 trend",
    "Why do Group 1 metals generally react more readily down the group?",
    "Their outer electron is more shielded and farther from the nucleus, so is lost more easily",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Their outer electron is more shielded and farther from the nucleus, so is lost more easily",
          "Their nuclei have fewer protons",
          "They must gain seven electrons",
          "Their outer electron is always closer to the nucleus",
        ],
      },
    },
  ),
  mc(
    "3",
    ["C4.1c"],
    "Recognise typical transition behaviour",
    "Which pair is typical of transition metals and their compounds?",
    "Coloured ions and catalytic activity",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Only colourless ions and no catalysts",
          "Very low densities and only 1+ ions",
          "Coloured ions and catalytic activity",
          "Unreactive gases and no electrical conduction",
        ],
      },
    },
  ),
  mc(
    "4",
    ["C4.1a", "C4.1b"],
    "Explain low reactivity",
    "Why are Group 0 elements generally unreactive?",
    "Their atoms have a full outer electron shell",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Their atoms contain no electrons",
          "Their atoms have a full outer electron shell",
          "Every atom has exactly eight electrons in total",
          "They have no attraction between nucleus and electrons",
        ],
      },
    },
  ),
  mc(
    "5",
    ["C4.1f"],
    "Respect the limits of displacement tests",
    "Metal R displaces both S and T from their salts. No S-versus-T test was done. Which conclusion is justified?",
    "R is above both S and T; their order relative to each other is not established",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "R is above both S and T; their order relative to each other is not established",
          "R > S > T is established",
          "S > T > R is established",
          "S and T must be the same element",
        ],
      },
    },
  ),
  mc(
    "6",
    ["C5.1h"],
    "Use actual and theoretical masses",
    "A reaction has a theoretical yield of 72 g and produces 54 g of pure product. What is its percentage yield?",
    "75%",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["25%", "75%", "133%", "18%"] },
    },
  ),
  mc(
    "7",
    ["C5.1f"],
    "Recall mass concentration",
    "Which relationship gives concentration in g/dm³ when mass is in grams and solution volume in dm³?",
    "Concentration = mass ÷ volume",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Concentration = mass × volume",
          "Concentration = volume ÷ mass",
          "Concentration = mass + volume",
          "Concentration = mass ÷ volume",
        ],
      },
    },
  ),
  mc(
    "8",
    ["C6.2o"],
    "Choose catalytic cracking conditions",
    "Which conditions are suitable for catalytic cracking of long-chain hydrocarbons?",
    "High temperature and a suitable solid catalyst",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Room temperature and water only",
          "High temperature and a suitable solid catalyst",
          "Freezing and filtration",
          "Dilute acid at room temperature only",
        ],
      },
    },
  ),
  mc(
    "9",
    ["C5.1d", "C5.1e"],
    "Apply a gas-volume ratio",
    "2CO(g)+O₂(g)→2CO₂(g). Exactly 150 cm³ of CO reacts completely with excess oxygen. What CO₂ volume forms at the same temperature and pressure?",
    "150 cm³",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["75 cm³", "150 cm³", "225 cm³", "300 cm³"] },
    },
  ),
  mc(
    "10",
    ["C6.2d"],
    "Identify the reacting bond",
    "Which bond in an alkene monomer reacts during ordinary addition polymerisation?",
    "The carbon–carbon double bond",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Every carbon–hydrogen bond",
          "The carbon–carbon double bond",
          "An ionic bond between monomers",
          "A bond inside each carbon nucleus",
        ],
      },
    },
  ),
  mc(
    "11",
    ["C6.2j", "C6.2k"],
    "Distinguish separation from cracking",
    "What happens during fractional distillation of crude oil?",
    "Molecules separate by boiling range without breaking their carbon–carbon bonds",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Every hydrocarbon becomes a single pure element",
          "Carbon–carbon bonds must break in every fraction",
          "Molecules separate by boiling range without breaking their carbon–carbon bonds",
          "All fractions condense at the same temperature",
        ],
      },
    },
  ),
  mc(
    "12",
    ["C4.2a"],
    "Select a positive oxygen test",
    "Which observation is a positive test for oxygen?",
    "A glowing splint relights",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Limewater turns milky",
          "A lighted splint gives a squeaky pop",
          "Damp litmus is bleached",
          "A glowing splint relights",
        ],
      },
    },
  ),
  mc(
    "13",
    ["C5.3b"],
    "Read stability rather than equality",
    "Closed A⇌B at fixed conditions: concentration pairs at 0,20,40,60 s are (0.60,0.10),(0.35,0.35),(0.25,0.45),(0.25,0.45). Which first listed time is consistent with equilibrium?",
    "40 s",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["0 s", "20 s", "40 s", "60 s"] },
    },
  ),
  mc(
    "14",
    ["C6.1p", "C3.1j"],
    "Keep the measured boundary clear",
    "An iron object initially has mass 5.00 g. It rusts in moist air; all rust remains attached and nothing flakes off. Which later object-plus-rust mass is plausible?",
    "5.20 g",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: { options: ["0.00 g", "4.80 g", "5.00 g", "5.20 g"] },
    },
  ),
  mc(
    "15",
    ["C4.1e", "C3.3b"],
    "Apply electron-transfer reasoning",
    "Co+Pb²⁺→Co²⁺+Pb. Which species is oxidised in this reaction?",
    "Co",
    1,
    [0, 1, 0],
    [],
    "choice",
    { automaticMarks: 1, question: { options: ["Pb²⁺", "Co²⁺", "Pb", "Co"] } },
  ),
];
const tangentReference = JSON.stringify({
  tx0: "5",
  ty0: "12",
  tx1: "35",
  ty1: "36",
});
const rate = author("Section B · Rates and retained constructions", "rates");
const rates: ExamPart[] = [
  rate(
    "16(a)",
    ["C5.2b", "CM5.2iii"],
    "Construct a tangent at 20 seconds",
    "Draw a tangent at 20 s using two well-separated endpoints on the supplied model curve. The model applies only over 0–40 s; its equation is not needed.",
    "One suitable tangent joins (5 s,12 cm³) and (35 s,36 cm³). It meets the curve at (20 s,24 cm³) and has gradient 0.8 cm³/s. Other suitable endpoint pairs are valid.",
    3,
    [0, 3, 0],
    [
      [
        "A straight line passes through the curve near (20 s,24 cm³), rather than merely drawing the origin-to-end chord. Judge contact position separately from direction.",
        1,
      ],
      [
        "Direction follows the local curve: approximately 0.8 cm³/s, with a sensible graphical tolerance around 0.7–0.9 when contact is appropriate.",
        1,
      ],
      [
        "Uses a useful endpoint span of at least 20 s, with both endpoints visible on the original axes. The reference endpoints are not compulsory; do not withhold this span mark solely for an already penalised angle error.",
        1,
      ],
    ],
    "native",
    {
      mathematics: true,
      practical: 3,
      referenceConstruction: tangentReference,
      question: {
        tangentDrawing: {
          label: "Original constructed gas-volume curve",
          curve: {
            start: 0,
            end: 40,
            max: 40,
            unit: "cm³",
            quantity: "Gas volume",
            origin: 0,
            a: -0.02,
            b: 1.6,
            c: 0,
            at: 20,
            label:
              "Constructed assessment curve over 0–40 s; not an experimental fit.",
          },
        },
      },
    },
  ),
  rate(
    "16(b)",
    ["C5.2b", "CM5.2iii"],
    "Calculate from your own tangent",
    "Use the two endpoints on your retained tangent from 16(a) to calculate the instantaneous rate at 20 s. Show the gradient calculation and units.",
    "0.8",
    2,
    [0, 2, 0],
    [
      [
        "Uses change in volume divided by change in time from the student's retained tangent endpoints, not volume divided by time from the origin.",
        1,
      ],
      [
        "Correctly evaluates that retained slope with cm³/s units: 0.8 cm³/s for the reference. Allow consistent calculation from a mistaken retained tangent without penalising its angle again.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 2,
      question: {
        unit: "cm³/s",
        explanation:
          "For the reference, (36−12)/(35−5)=24/30=0.8 cm³/s. A consistently evaluated slope from the student's own earlier tangent can earn both calculation marks, even when that drawing's direction lost credit.",
      },
    },
  ),
  rate(
    "16(c)",
    ["C5.2c", "C5.2d"],
    "Explain a concentration change",
    "Explain why a more concentrated acid can make a metal–acid reaction faster when temperature and the available metal surface are unchanged.",
    "There are more reacting acid particles per unit volume, so collisions with the metal surface occur more frequently. The unchanged temperature does not imply greater particle energy or a lower activation energy.",
    2,
    [2, 0, 0],
    [
      [
        "More reacting particles per unit volume, not simply more particles in an unspecified total volume.",
        1,
      ],
      [
        "Greater collision frequency at the metal surface. Do not replace this with faster-moving particles or lower activation energy at unchanged temperature.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  rate(
    "16(d)",
    ["C5.2a", "C7"],
    "Evaluate a delayed collection method",
    "A student adds acid to metal, waits several seconds, then fits the bung connected to a gas syringe and starts timing. Explain the measurement problem and give one specific improvement.",
    "Some gas escapes before the closed collection system and timer are in place, so early cumulative volumes and the apparent initial rate are unreliable. Use sealed apparatus with reactants initially separated, then start the timer as they are mixed, for example by tilting the flask. Suitable equivalent closed-start arrangements can also work.",
    2,
    [0, 0, 2],
    [
      [
        "Links the delayed seal/timing to gas lost or an invalid early time/volume origin, rather than claiming it changes the true reaction chemistry.",
        1,
      ],
      [
        "A specific feasible way to initiate mixing and timing with the collection system sealed; merely repeating the same biased method is insufficient.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
];

const titrate = author(
  "Section B · Titration evidence and carried error",
  "quantitative",
);
const titrations: ExamPart[] = [
  titrate(
    "17(a)",
    ["C5.1b"],
    "Choose precise transfer and endpoint tools",
    "Name the apparatus that accurately transfers a fixed 20.0 cm³ of alkali to a flask, and name a suitable indicator for a strong-acid/strong-alkali titration.",
    "A 20.0 cm³ volumetric pipette transfers the fixed volume. Methyl orange or phenolphthalein is suitable for detecting the endpoint; a broad universal-indicator colour scale is not the requested sharp endpoint indicator.",
    2,
    [2, 0, 0],
    [
      [
        "A suitable volumetric pipette for the fixed 20.0 cm³, not a beaker, measuring cylinder or dropping pipette.",
        1,
      ],
      [
        "Methyl orange or phenolphthalein; accept recognisable spelling. Do not require the spelling of one particular named valid indicator.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  titrate(
    "17(b)",
    ["C5.1b", "C7"],
    "Read the scale and subtract the start",
    "The burette started at 2.10 cm³. Use the supplied final meniscus to calculate the volume delivered in this run. Read the bottom of the meniscus and give two decimal places.",
    "16.35",
    2,
    [0, 2, 0],
    [
      [
        "Reads the final meniscus as 18.45 cm³ on the increasing-downwards scale.",
        1,
      ],
      [
        "Subtracts the initial 2.10 cm³ to obtain 16.35 cm³ to two decimal places. Allow consistent subtraction from a retained scale-reading error without awarding the reading point.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 2,
      question: {
        unit: "cm³",
        rounding: { kind: "decimal-places", digits: 2 },
        buretteScale: {
          top: 18,
          reading: 18.45,
          boundaryDescription:
            "Final reading; use the bottom of the meniscus. The scale increases downwards.",
        },
        explanation:
          "The final reading is 18.45 cm³, so the volume delivered is 18.45−2.10=16.35 cm³. The final reading alone is not the delivered volume.",
      },
    },
  ),
  titrate(
    "17(c)",
    ["C5.1b"],
    "Use the concordant repeats",
    "A separate dataset has rough titre 15.00 cm³ and repeat titres 14.15,14.20,14.25 cm³. State which values you use, calculate their mean to two decimal places and show working.",
    "14.20",
    2,
    [0, 2, 0],
    [
      [
        "Uses all three repeat values, which span 0.10 cm³, and excludes the explicitly labelled rough titre 15.00 cm³.",
        1,
      ],
      [
        "(14.15+14.20+14.25)/3=14.20 cm³ to two decimal places. Allow a consistently calculated mean from a retained selection error, without the selection point.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 2,
      question: {
        unit: "cm³",
        rounding: { kind: "decimal-places", digits: 2 },
        explanation:
          "The repeat values span 14.15–14.25 cm³ and average 42.60/3=14.20 cm³. The rough 15.00 cm³ is excluded.",
      },
    },
  ),
  titrate(
    "17(d)",
    ["C5.1a", "C5.1c"],
    "Retain the two-to-one mole ratio",
    "H₂SO₄+2KOH→K₂SO₄+2H₂O. Exactly 20.0 cm³ of 0.150 mol/dm³ KOH reacts with the mean acid volume from 17(c). Calculate the acid concentration to three significant figures, using your retained mean and showing working.",
    "0.106",
    4,
    [1, 3, 0],
    [
      [
        "Converts 20.0 cm³ to 0.0200 dm³ and obtains 0.150×0.0200=0.00300 mol KOH.",
        1,
      ],
      [
        "Uses the 1:2 acid:alkali ratio, so acid amount is 0.00150 mol. Allow consistent use of the correct ratio after an earlier amount error.",
        1,
      ],
      [
        "Divides acid amount by the retained mean acid volume in dm³:0.00150/0.01420=0.1056338…mol/dm³ for the reference. Accept consistent use of the student's earlier mean; do not penalise it twice.",
        1,
      ],
      [
        "Correctly rounds the retained concentration to three significant figures:0.106 mol/dm³ for the reference. Rounding credit may follow a clearly retained earlier error.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 4,
      question: {
        unit: "mol/dm³",
        rounding: { kind: "significant-figures", digits: 3 },
        explanation:
          "KOH amount=0.150×20.0/1000=0.00300 mol. Acid amount=0.00300/2=0.00150 mol. For the reference mean, concentration=0.00150/(14.20/1000)=0.1056338…→0.106 mol/dm³. Use the student's retained mean consistently and judge each requested method step.",
      },
    },
  ),
];

const industry = author(
  "Section B · Equilibrium and industrial decisions",
  "global-challenges",
);
const industrial: ExamPart[] = [
  industry(
    "18(a)",
    ["C5.3c", "C6.1d", "C6.1f"],
    "Recommend a factory setting",
    "Use the supplied comparison to recommend a set with rate index at least 3 and cost index at most 3. For exothermic N₂(g)+3H₂(g)⇌2NH₃(g), explain the rate, equilibrium and cost trade-offs.",
    "Set B meets both limits: rate 4 and cost 2. A has a higher equilibrium ammonia fraction but its rate 1 is too low. Its lower temperature favours ammonia in the exothermic reaction but gives fewer sufficiently energetic collisions and slower production. C raises pressure relative to B: four gas molecules become two in the forward equation, so higher pressure favours ammonia and can increase rate. However, C's cost 5 exceeds the stated limit; compression and pressure-resistant equipment have costs. B is the justified compromise within this hypothetical comparison, rather than the setting with maximum equilibrium fraction. The figures are illustrative and do not establish a universal optimum for real plants.",
    6,
    [2, 0, 4],
    [],
    "written",
    {
      levels: [
        {
          min: 1,
          max: 2,
          text: "Some relevant knowledge of temperature, pressure, rate, yield or cost. A choice may be named, but links to the supplied constraints and mechanisms are limited or confused.",
        },
        {
          min: 3,
          max: 4,
          text: "A reasoned comparison uses relevant supplied data and explains some temperature/pressure trade-offs. Important reasoning or a stated constraint is incomplete; the response has a recognisable structure.",
        },
        {
          min: 5,
          max: 6,
          text: "A coherent recommendation selects B using both constraints, explains the lower-temperature rate/yield conflict and the higher-pressure gas-number/cost trade-off, and substantiates comparisons with A and C. The upper mark needs a secure, clear and complete line of reasoning.",
        },
      ],
      question: {
        haberGiven: {
          title: "Original hypothetical factory comparison",
          note: "NH₃ is equilibrium mole percent, rounded. Rate and cost are unitless indices on a common basis; these are not published plant measurements.",
          rows: [
            {
              label: "Temperature",
              text: "A uses a lower temperature. B and C use the same higher temperature.",
            },
            { label: "Pressure", text: "A and B: 150 atm. C: 300 atm." },
          ],
          table: {
            caption: "Same 1:3 nitrogen/hydrogen feed and catalyst",
            head: ["Set", "NH₃ / %", "Rate", "Cost"],
            rows: [
              ["A", "42", "1", "2"],
              ["B", "26", "4", "2"],
              ["C", "37", "5", "5"],
            ],
          },
        },
      },
    },
  ),
  industry(
    "18(b)",
    ["C5.2h", "C5.3b", "C6.1d"],
    "Separate catalyst rate from equilibrium",
    "Name the Haber-process catalyst and explain why using it does not change the equilibrium ammonia fraction at fixed temperature and pressure.",
    "Iron is the catalyst. It provides an alternative lower-activation-energy pathway for both forward and reverse reactions, allowing equilibrium to be reached faster without changing its composition at fixed conditions.",
    2,
    [2, 0, 0],
    [
      ["Iron.", 1],
      [
        "Explains that forward and reverse reactions are both accelerated, changing the time to equilibrium rather than the equilibrium fraction. Merely saying that it makes more ammonia is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  industry(
    "18(c)",
    ["C6.1g", "C6.1i"],
    "Connect fertiliser to plant growth",
    "Why can ammonium salts be useful ingredients in fertilisers? Give one specific nutrient-related reason.",
    "They supply nitrogen, an essential nutrient for plant growth. Nitrogen use in amino acids/proteins is a valid example, but that extra biochemical detail is not required.",
    1,
    [1, 0, 0],
    [
      [
        "Supplies nitrogen needed for plant growth; a valid amino-acid/protein example is acceptable but not compulsory. 'Contains chemicals' alone is insufficient.",
        1,
      ],
    ],
    "written",
  ),
];

const repeatReference = JSON.stringify({
  ...blankPolymerisationDrawing(),
  s0: "H",
  s1: "Cl",
  s2: "F",
  s3: "CH3",
  bond: "1",
  left: "1",
  right: "1",
  brackets: "1",
  countMark: "n",
});
const polyesterReference = JSON.stringify({
  ...blankPolyesterDrawing(),
  diolC: "4",
  acidSpacerC: "4",
  leftO: "1",
  middleO: "1",
  carbonyl1: "2",
  carbonyl2: "2",
  left: "1",
  right: "1",
  brackets: "1",
  countMark: "n",
});
const organic = author(
  "Section B · Functional groups and polymer construction",
  "organic",
);
const organics: ExamPart[] = [
  organic(
    "19(a)",
    ["C6.2a", "C6.2e"],
    "Name the reacting functional groups",
    "Name the reacting functional groups in HOOC–(CH₂)₄–COOH and HO–(CH₂)₄–OH. Give names, not just the displayed formula fragments.",
    "The first has carboxyl/carboxylic acid groups; the second has hydroxyl/alcohol groups. Hydroxide is an ion name and is not the alcohol functional-group name.",
    2,
    [2, 0, 0],
    [
      [
        "Carboxyl or carboxylic acid group for the diacid; merely repeating COOH does not answer a request for its name.",
        1,
      ],
      [
        "Hydroxyl or alcohol group for the diol, not hydroxide; merely repeating OH does not give the requested name.",
        1,
      ],
    ],
    "written",
  ),
  organic(
    "19(b)",
    ["C6.2d", "C6.2g"],
    "Build the polymer repeat",
    "Build a repeat from the monomer, keeping side groups on their carbons. Add continuation bonds and brackets; n is optional.",
    "One valid repeat is [–CH(Cl)–C(F)(CH₃)–]ₙ. The C=C becomes a single backbone bond, and H/Cl remain on one original carbon while F/CH₃ remain on the other. Equivalent reflection, rotation or a shifted repeat boundary is acceptable; no small molecule is released.",
    3,
    [0, 3, 0],
    [
      ["A single carbon–carbon backbone bond replaces the monomer C=C.", 1],
      [
        "Retains H/Cl on one original reacting carbon and F/CH₃ on the other, allowing equivalent reversal/rotation. Replacing Cl by F or moving a group to a different carbon changes the compound.",
        1,
      ],
      [
        "Both continuation bonds cross appropriate polymer brackets. n may be present or omitted here; do not withhold this mark just because the optional n is absent.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: repeatReference,
      question: {
        polymerisationGiven: {
          groups: ["H", "Cl", "F", "CH3"],
          polymer: false,
        },
        polymerisationDrawing: {
          kind: "repeat",
          note: "Construct your own repeat from the original monomer.",
        },
      },
    },
  ),
  organic(
    "19(c)",
    ["C6.2e"],
    "Retain both polyester spacers",
    "Build the repeat from HO–(CH₂)₄–OH and HOOC–(CH₂)₄–COOH. Show ester connections, continuation bonds and brackets. CH₂ notation is allowed; n is optional.",
    "One valid repeat is [–O–(CH₂)₄–O–C(=O)–(CH₂)₄–C(=O)–]ₙ. Both original carboxyl carbons and their double-bonded oxygens remain; there are four diol CH₂ groups and four acid-spacer CH₂ groups. This repeat contributes C₁₀H₁₆O₄; the ends of a finite chain are separate from this repeat contribution. Equivalent reversed or shifted boundaries are valid.",
    3,
    [0, 3, 0],
    [
      [
        "Retains the four-carbon diol spacer and four-carbon acid spacer, plus the two separate carboxyl carbons. Do not count the carboxyl carbons as part of the four CH₂ groups.",
        1,
      ],
      [
        "Both ester connections have correct single C–O bonds and retained C=O carbonyls, without extra OH caps at joined repeat boundaries.",
        1,
      ],
      [
        "Continuation bonds cross brackets to represent the repeating chain. n is optional in this task, and equivalent reversed/shifted repeat boundaries are creditworthy.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: polyesterReference,
      question: {
        polyesterDrawing: {
          diolC: 4,
          acidSpacerC: 4,
          note: "Retain both supplied spacers and both carbonyls.",
        },
      },
    },
  ),
  organic(
    "19(d)",
    ["C6.2e"],
    "Count actual links in a finite chain",
    "Exactly two molecules of each monomer in 19(c) join into one unbranched open chain, with no ring. Name the small molecule released and calculate how many molecules are released. Explain your count.",
    "Water is released. Four monomer molecules connected as one open linear chain form three joins, so three water molecules are released. Do not use an automatic 2n count from an end-omitted repeat representation for this finite chain.",
    2,
    [1, 1, 0],
    [
      [
        "Water, from the specified carboxylic acid/diol condensation. Do not generalise this to every possible condensation reaction.",
        1,
      ],
      [
        "Three molecules: four monomers make three joins in the stated open chain. Retains both chain ends rather than treating it as a closed ring.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  organic(
    "19(e)",
    ["C6.2f", "C7"],
    "Improve collection of a nylon strand",
    "Two immiscible solutions form a nylon film only where their layers meet; a strand can be drawn from the film. A student shakes them together then plans filtration. Give two method changes to obtain a continuous strand.",
    "Carefully layer the solutions without shaking to preserve a stable interface. Grip the film with suitable forceps/tweezers and draw or wind it continuously onto a rod as new film forms, rather than filtering a dispersed mixture.",
    2,
    [0, 0, 2],
    [
      ["Careful layering/no shaking maintains the film-forming boundary.", 1],
      [
        "A suitable controlled way to grip and draw/wind the film into a continuous strand, rather than filtration. Accept equivalent suitable collection tools; one exact rod material is not compulsory.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
];

const identify = author(
  "Section B · Chemical tests and instrumental evidence",
  "analysis",
);
const identification: ExamPart[] = [
  identify(
    "20(a)",
    ["C4.2b"],
    "Distinguish three halide ions",
    "Describe how to test separate aqueous samples for chloride, bromide and iodide ions. Give the reagent sequence and all three positive precipitate colours.",
    "Acidify each fresh sample with dilute nitric acid, then add silver nitrate solution. Chloride gives a white precipitate, bromide a cream precipitate and iodide a yellow precipitate. Do not acidify the halide test with hydrochloric acid, which introduces chloride ions.",
    4,
    [4, 0, 0],
    [
      [
        "Dilute nitric acid followed by silver nitrate solution on suitable fresh samples; both reagents and the acid identity are needed for this method point.",
        1,
      ],
      ["Chloride: white precipitate.", 1],
      ["Bromide: cream precipitate.", 1],
      [
        "Iodide: yellow precipitate. The positive observations are precipitates, not just unsupported solution colours.",
        1,
      ],
    ],
    "written",
    { practical: 4 },
  ),
  identify(
    "20(b)",
    ["C4.2b", "C4.2d"],
    "Use a supplied zinc reference",
    "Only Zn²⁺ or Ca²⁺ is possible: both give white NaOH precipitates; only Zn²⁺ dissolves in excess. Unknown does dissolve; a fresh portion gives white precipitate with acidified BaCl₂. Identify its cation and anion.",
    "The cation is Zn²⁺, matching the supplied excess-NaOH reference. The anion is sulfate, SO₄²⁻, from the white barium sulfate precipitate with acidified soluble barium chloride.",
    2,
    [0, 1, 1],
    [
      [
        "Zn²⁺/zinc ion from the supplied comparison. The stated two-cation possibilities are important: the result is not asserted to identify zinc among every possible metal ion.",
        1,
      ],
      [
        "Sulfate/SO₄²⁻ from the acidified barium test. Identifying both ions as zinc sulfate is acceptable; a separate long explanation is not required for these two identification marks.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  identify(
    "20(c)",
    ["C4.2g"],
    "Compare a full instrumental pattern",
    "Selected mass-spectrum m/z peaks: R=16,28,44; S=14,28; T=18. An unknown gives 16,28,44 under matched conditions. Give the best reference match and explain why peak 28 alone is insufficient.",
    "R is the best match within the supplied references because all three selected peaks match. Peak 28 occurs in both R and S, so that peak alone is not a unique identification. Matching these selected peaks is supporting evidence, not proof of absolute purity.",
    2,
    [0, 0, 2],
    [
      [
        "Selects R using the supplied multi-peak pattern; no unprovided fragmentation theory or compound naming is required.",
        1,
      ],
      [
        "Explains that 28 is shared with S, so a single peak cannot distinguish those references.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  identify(
    "20(d)",
    ["C4.2f"],
    "State a concrete instrumental advantage",
    "State one advantage of instrumental analysis over visual chemical tests.",
    "A suitable instrument can detect smaller amounts or concentrations (greater sensitivity), process samples faster, or improve accuracy when appropriately calibrated. This does not mean instruments can never suffer human, calibration or sampling errors.",
    1,
    [1, 0, 0],
    [
      [
        "One specific valid advantage such as sensitivity, speed or improved accuracy under appropriate calibration. Accept a clearly explained equivalent, not just 'better' or 'no errors'.",
        1,
      ],
    ],
    "written",
    { practical: 1 },
  ),
];

const extract = author(
  "Section B · Extraction and product recovery",
  "global-challenges",
);
const extraction: ExamPart[] = [
  extract(
    "21(a)",
    ["C6.1a", "C6.1b"],
    "Choose a suitable extraction principle",
    "Explain why aluminium cannot be extracted from aluminium oxide by heating it with carbon, and state an appropriate alternative principle.",
    "Aluminium is more reactive than carbon, so carbon does not reduce its stable oxide in the usual extraction process. Electrolysis of a suitable molten aluminium-containing electrolyte is used instead; an aqueous solution would not simply deposit aluminium metal.",
    2,
    [2, 0, 0],
    [
      [
        "Aluminium is above/more reactive than carbon, linked to why carbon reduction of the oxide is unsuitable.",
        1,
      ],
      [
        "Electrolysis of a suitable molten compound/electrolyte rather than carbon reduction; not a claim that aluminium is deposited from an ordinary aqueous salt solution.",
        1,
      ],
    ],
    "written",
  ),
  extract(
    "21(b)",
    ["C6.1c"],
    "Evaluate a biological route",
    "Evaluate phytoextraction instead of opening a new quarry for a low-grade copper site. Balance a benefit against a limitation and give a judgement linked to the stated site.",
    "Growing plants on the low-grade site can reduce new excavation, habitat damage and the amount of bulk material sent for high-temperature processing. However, plants take time to grow and contain copper compounds, not ready-made copper wire: harvesting, treatment of biomass/ash and further recovery are still needed. It can be suitable where avoiding new quarrying matters and slow, lower-throughput recovery is acceptable, but is less suitable for urgent large output. Plant growth does not by itself establish zero whole-life emissions.",
    3,
    [0, 0, 3],
    [
      [
        "A specific comparative benefit linked to the site, such as reduced new excavation/habitat damage or processing less bulk low-grade material; not just 'better'.",
        1,
      ],
      [
        "A relevant limitation, such as slow growth, limited throughput or the continued need for biomass/ash processing and metal recovery.",
        1,
      ],
      [
        "A supported conditional judgement weighs the benefit and limitation for this low-grade site. Do not award an unsupported universal 'carbon neutral' or 'always best' claim.",
        1,
      ],
    ],
    "written",
  ),
  extract(
    "21(c)",
    ["C5.1h"],
    "State and apply percentage yield",
    "State the percentage-yield relationship, then use it for 15.3 g of pure actual product from a theoretical maximum of 18.0 g. Show working.",
    "85",
    2,
    [1, 1, 0],
    [
      [
        "Percentage yield = actual pure product mass ÷ theoretical product mass ×100; the relationship must be stated or clearly shown in working.",
        1,
      ],
      [
        "15.3/18.0×100=85%. Does not invert the masses or confuse this percentage with atom economy.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        unit: "%",
        explanation:
          "Percentage yield compares actual pure product with the theoretical maximum:15.3/18.0×100=85%. The relationship is a separate requested recall point; a bare number does not show it.",
      },
    },
  ),
  extract(
    "21(d)",
    ["C3.3b", "C6.1a"],
    "Recall the electron definition",
    "Define reduction in terms of electron transfer.",
    "Reduction is gain of electrons.",
    1,
    [1, 0, 0],
    [
      [
        "Gain of electrons, not loss; the question specifically asks for the electron definition.",
        1,
      ],
    ],
    "written",
  ),
];

const lifecycle = author(
  "Section B · Compare the same useful service",
  "global-challenges",
);
const lifeCycles: ExamPart[] = [
  lifecycle(
    "22(a)",
    ["C6.1k"],
    "Identify distinct life-cycle stages",
    "Raw-material extraction is already included. State two other distinct stages or activities that a life-cycle assessment should account for.",
    "Examples include manufacture, transport/distribution, use and end-of-life treatment/disposal. Transport can occur at several stages and should not be double counted. Recycling can be discussed as part of end-of-life treatment, rather than assumed to replace every other stage.",
    2,
    [2, 0, 0],
    [
      ["One valid stage/activity other than raw-material extraction.", 1],
      [
        "A second distinct valid stage/activity. Do not count two names for the same activity twice.",
        1,
      ],
    ],
    "written",
  ),
  lifecycle(
    "22(b)",
    ["C6.1k", "C6.1l"],
    "Compare 100 equal services",
    "Using the supplied equal-service model, calculate both total energies in MJ for 100 drinks and identify the lower-energy option. Show working; count washing for every use, including the first.",
    "Reusable:3600+100×30=6600 kJ=6.6 MJ. Single-use:100×100=10000 kJ=10.0 MJ. Reusable has lower supplied energy for the same 100 equal-capacity services, by 3.4 MJ. This conclusion concerns only the stated energy model.",
    3,
    [0, 2, 1],
    [
      [
        "Reusable total includes fixed 3600 kJ once and all 100 washing/return charges:6600 kJ=6.6 MJ.",
        1,
      ],
      [
        "Single-use total is 100×100=10000 kJ=10.0 MJ, on the same 100-service basis.",
        1,
      ],
      [
        "Identifies reusable as lower in this supplied energy comparison. Allow a consistent comparison after a retained arithmetic error; a per-item/per 100 mismatch does not establish the conclusion.",
        1,
      ],
    ],
    "written",
    {
      mathematics: true,
      question: {
        lcaGiven: {
          title: "Original 100-drink comparison",
          note: "Both options provide the same capacity and quality. The fixed and per-service figures include their allocated transport/end-of-life energy. Washing/return applies to every use, including the first; no breakage is assumed. Teaching data, energy only.",
          service: { fixed: 3600, wash: 30, single: 100, uses: 100 },
        },
      },
    },
  ),
  lifecycle(
    "22(c)",
    ["C6.1l"],
    "Limit the environmental conclusion",
    "Does lower supplied energy prove that the chosen option is environmentally best in every respect? Give one specific reason why that conclusion is too strong.",
    "No. Water use, pollution, waste, the energy source's carbon intensity, real breakage or different reuse/washing behaviour can change the wider comparison. A lower value in this energy-only model is not proof of superiority across every environmental impact.",
    1,
    [0, 0, 1],
    [
      [
        "A specific omitted impact or changed assumption explains the limit of the universal claim; simply saying 'more data' without what matters is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  lifecycle(
    "22(d)",
    ["C6.1m", "C6.1n"],
    "Explain recycling decisions",
    "State two distinct factors that can determine whether collecting and recycling a material is worthwhile. Link each factor to its effect.",
    "Collection, sorting and reprocessing costs/energy must be considered against making new material and the value of recovered material. Contamination, degradation and the required product quality affect usable recovery and possible applications. Demand for the recovered material and available sorting infrastructure can also matter.",
    2,
    [2, 0, 0],
    [
      [
        "One concrete factor with a relevant effect, such as recovery cost/energy versus virgin production or recovered-material value.",
        1,
      ],
      [
        "A second distinct factor and effect, such as contamination/quality, recovery yield, demand or suitable infrastructure. Do not count two restatements of cost as separate ideas.",
        1,
      ],
    ],
    "written",
  ),
];

const earth = author(
  "Section B · Atmosphere, water and energy boundaries",
  "global-challenges",
);
const earthSystems: ExamPart[] = [
  earth(
    "23(a)",
    ["C6.3c"],
    "Explain the radiation interaction",
    "Describe the greenhouse effect using the type of radiation emitted by Earth's surface and its interaction with carbon dioxide in the atmosphere.",
    "The warmed surface emits infrared radiation. Carbon dioxide absorbs some outgoing infrared and emits infrared in different directions, including towards the surface. At a given surface temperature this reduces net energy escaping to space; warming can then change the balance. It is not an ozone-hole mechanism or simple reflection by a solid atmospheric mirror.",
    2,
    [2, 0, 0],
    [
      [
        "Identifies outgoing infrared/thermal infrared radiation from the surface, not just incoming ultraviolet.",
        1,
      ],
      [
        "CO₂ absorbs and re-emits infrared, including downwards, reducing net escape at a given temperature. Do not credit the ozone hole or an unsupported claim that no energy can ever escape.",
        1,
      ],
    ],
    "written",
  ),
  earth(
    "23(b)",
    ["C6.3d"],
    "Connect activity to a sustained change",
    "Give one way a growing human population could contribute to a sustained increase in atmospheric carbon dioxide. Link an activity to its carbon effect.",
    "Greater demand for transport, electricity or manufactured goods can increase fossil-fuel combustion and transfer stored fossil carbon to the atmosphere. Clearing forests for settlement/agriculture can also release stored carbon and reduce uptake. More respiration alone does not establish a sustained net addition from fossil carbon.",
    1,
    [1, 0, 0],
    [
      [
        "A linked activity/carbon explanation, such as increased fossil-fuel demand and burning or deforestation and carbon release/reduced uptake; 'people breathe more' alone is insufficient.",
        1,
      ],
    ],
    "written",
  ),
  earth(
    "23(c)",
    ["C5.1d", "C5.1e"],
    "Convert carbon dioxide mass to volume",
    "Calculate the volume in dm³ of 2.64 kg CO₂ at room temperature and pressure. Ar:C=12,O=16. Recall the molar gas volume and show the mass conversion and working.",
    "1440",
    3,
    [1, 2, 0],
    [
      ["Recalls 24 dm³ per mole at room temperature and pressure.", 1],
      [
        "Converts 2.64 kg to 2640 g and calculates CO₂ amount 2640/44=60 mol. Do not award this amount point for treating kilograms as grams; judge later carried-error evaluation separately.",
        1,
      ],
      [
        "Volume=60×24=1440 dm³, with consistent carried-error evaluation if an earlier amount was mistaken.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        unit: "dm³",
        explanation:
          "At room conditions use 24 dm³/mol. CO₂ formula mass=12+2×16=44. Mass 2.64 kg=2640 g, so amount=2640/44=60 mol and volume=60×24=1440 dm³. The molar volume is a volume per mole, not a mass.",
      },
    },
  ),
  earth(
    "23(d)",
    ["C6.3g", "C7"],
    "Evaluate an open-pan water process",
    "A kit boils seawater in an open pan, then chlorinates the liquid remaining in that pan. It claims to make drinking water. Evaluate the salt-removal step and state a needed separation change.",
    "The dissolved salts remain in the pan and can become more concentrated as water escapes; chlorination does not remove them. Collect and condense the water vapour in a suitable distillation system, or use another validated desalination method such as reverse osmosis. Appropriate water-quality checks/treatment are still needed rather than assuming one operation proves potability.",
    2,
    [0, 0, 2],
    [
      [
        "Explains that the liquid left in the open pan still contains dissolved salts; boiling away water/chlorination does not desalinate that remaining liquid.",
        1,
      ],
      [
        "A valid separation change, such as collecting and condensing vapour by distillation or suitable reverse osmosis, rather than ordinary filtration or more chlorine.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  earth(
    "23(e)",
    ["C6.2q", "C6.3d"],
    "Separate cell output from fuel production",
    "Hydrogen for a H₂/O₂ cell comes from a methane process that releases CO₂. State the cell's electrochemical product and evaluate 'the whole fuel route emits no CO₂'.",
    "Water is the electrochemical product at the cell. The whole-route claim is false for the stated case: hydrogen production releases CO₂ upstream, even though the cell itself has no carbon-containing fuel or CO₂ product. The accounting boundary must include fuel production.",
    2,
    [1, 0, 1],
    [
      ["Water/H₂O as the cell's electrochemical product.", 1],
      [
        "Rejects the whole-route zero-emission claim by including the explicitly stated upstream CO₂; does not confuse local cell output with the entire fuel-production boundary.",
        1,
      ],
    ],
    "written",
  ),
];

export const ocrPaper4HigherFull: ExamPaper = {
  id: "ocr-paper-4-higher-full",
  totalMarks: 90,
  minutes: 105,
  basis: {
    board: "OCR",
    qualification: "Gateway Science A J248",
    component: "J248/04",
    summary:
      "Gateway Higher Paper 4 covers C4–C6 and practical skills C7, assuming C1–C3 knowledge. Its 15 multiple-choice and 75 structured marks include an independent tangent and carried slope, titration evidence, a six-mark industrial decision, distinct addition/polyester constructions, finite-chain condensation and matched-service/whole-route evaluations. Original practice, not an official OCR paper.",
    specificationUrl:
      "https://www.ocr.org.uk/Images/234598-specification-accredited-gcse-gateway-science-suite-chemistry-a-j248.pdf",
    researchPath: "docs/board-mocks/ocr-4h-basis.md",
  },
  parts: [
    ...sectionA,
    ...rates,
    ...titrations,
    ...industrial,
    ...organics,
    ...identification,
    ...extraction,
    ...lifeCycles,
    ...earthSystems,
  ],
};

// Prior prompts, complete references and relevant native givens were compared.
const priorDisclosures: Record<string, string[]> = {
  "1": ["early-atmosphere-v1-g-photo"],
  "2": ["g1-v1-r-trend"],
  "3": ["tm-v1-r-compound", "tm-chem-v1-p-nickel"],
  "4": ["g0-v1-p-explain"],
  "5": ["mr-v1-r-evidence"],
  "7": ["sc-v1-g-basis"],
  "8": ["crk-v1-r-heat"],
  "10": ["chem-p2h-full-v1-08a"],
  "11": ["oil-v1-r-physical"],
  "12": ["gas-tests-v1-p-explain-oxygen"],
  "14": ["mc-v1-p-evaluate"],
  "16(c)": ["chem-p2h-full-v1-01c"],
  "16(d)": ["rp-v1-p-late-start", "chem-p2h-full-v1-01a"],
  "17(a)": ["chem-ocr-p2f-full-v1-18a"],
  "18(b)": ["haber-v1-p-catalyst"],
  "18(c)": ["haber-v1-p-npk"],
  "19(a)": ["pol-cond-v1-g-groups"],
  "19(d)": ["natural-v1-r-links", "pol-cond-v1-ca-water"],
  "20(a)": [
    "ion-tests-v1-r-halide",
    "ion-tests-v1-g-halide",
    "ion-tests-v1-r-br",
    "ion-tests-v1-r-i",
  ],
  "20(b)": ["ion-tests-v1-r-sulfate"],
  "20(d)": ["instrumental-analysis-v1-r-sensitive"],
  "21(a)": ["chem-edx-p1f-full-v1-6b"],
  "21(b)": ["bio-v1-vA-constraint", "bio-v1-p-adoption"],
  "21(d)": ["chem-p1h-full-v1-08a"],
  "22(a)": ["lca-v1-p-boundary"],
  "22(c)": ["lca-v1-vB-full", "lca-v1-resource-p-lca"],
  "22(d)": ["lca-v1-p-separation", "bio-v1-p-recycle"],
  "23(a)": ["greenhouse-v1-p-mechanism"],
  "23(b)": ["cycle-v1-cB-fossil"],
  "23(d)": ["water-v1-cB-source", "chem-ocr-p2f-full-v1-23c"],
  "23(e)": ["cf-v1-p-environment"],
};
for (const part of ocrPaper4HigherFull.parts)
  if (priorDisclosures[part.number])
    part.question.exposureAliases = priorDisclosures[part.number];
