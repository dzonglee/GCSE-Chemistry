import type { ExamPaper } from "./exam-paper-types";
import { boardPaperAuthor } from "./board-paper-authoring";

const author = boardPaperAuthor("chem-edx-p1f-full-v1-", "foundation");
const atomic = author("Boron particle evidence", "atomic-structure");
const bonding = author("Bonding and carbon structures", "bonding");
const separation = author("Separating an ink", "analysis");
const copper = author("Copper purification", "chemical-changes");

// This paper's parts, numbers, evidence, clauses and criteria are authored individually.
const particles = [
  atomic(
    "1(a)",
    ["1.3", "1.7", "1.10"],
    "Count the particles",
    "A neutral boron-11 atom has atomic number 5. Give its neutron count and electron count.",
    '{"neutrons":"6","electrons":"5"}',
    2,
    [0, 2, 0],
    [
      ["6 neutrons: 11−5.", 1],
      ["5 electrons, matching the five protons in the neutral atom.", 1],
    ],
    "native",
    {
      question: {
        parts: [
          { id: "neutrons", label: "Neutrons", answer: 6 },
          { id: "electrons", label: "Electrons", answer: 5 },
        ],
        explanation:
          "Mass number minus atomic number gives six neutrons; neutrality requires five electrons.",
      },
    },
  ),
  atomic(
    "1(b)",
    ["1.19"],
    "Construct boron's shells",
    "Construct the electronic configuration and shell diagram of a neutral boron atom, atomic number 5.",
    "2,3",
    2,
    [0, 2, 0],
    [
      ["Two electrons in the first shell.", 1],
      [
        "Three in the second shell, with five total and no other occupied shell.",
        1,
      ],
    ],
    "native",
    {
      question: {
        arrangement: [2, 3],
        exposureAliases: ["sh-v1-w-read", "sh-v1-p-explanation"],
        drawArrangement: true,
        readableShellDiagram: true,
        explanation:
          "Two electrons occupy the first shell and three the second: 2,3.",
      },
    },
  ),
  atomic(
    "1(c)",
    ["1.9"],
    "Define the isotope relationship",
    "Explain what makes boron-10 and boron-11 isotopes of the same element.",
    "Their atoms have the same number of protons but different numbers of neutrons.",
    2,
    [2, 0, 0],
    [
      ["Same number of protons.", 1],
      [
        "Different numbers of neutrons; different mass alone is not a complete explanation.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: ["chem-p1f-full-v1-01d", "iso-v1-g-carbon"],
      },
    },
  ),
  atomic(
    "1(d)",
    ["1.11"],
    "Explain the isotope average",
    "Sample: 20% boron-10, 80% boron-11. Explain why its relative atomic mass is non-whole and closer to 11 than 10. No calculation is required.",
    "The sample contains isotopes of both masses, so its relative atomic mass reflects an average between 10 and 11. Boron-11 is more abundant at 80%, so the average lies closer to 11.",
    2,
    [0, 2, 0],
    [
      [
        "Explains the non-whole relative atomic mass as an average across the two different isotope masses, rather than giving individual atoms fractional neutrons.",
        1,
      ],
      [
        "Links the average being closer to 11 to boron-11 being more abundant (80% versus 20%). No numerical weighted-mean calculation is required or separately rewarded.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: [
          "ram-v1-r-meaning",
          "ram-v1-r-weight",
          "ram-v1-g-heavy",
          "ram-v1-g-transfer",
        ],
      },
    },
  ),
];

const structures = [
  bonding(
    "2(a)",
    ["1.21", "1.24"],
    "Construct the oxide ion",
    "Construct the outer-electron dot-and-cross diagram of O²⁻ formed when magnesium transfers two electrons to oxygen. Show electron origins, brackets and charge.",
    '{"dots":"6","crosses":"2","charge":"-2","brackets":"1"}',
    2,
    [0, 2, 0],
    [
      [
        "Six original oxygen electrons and two transferred electrons, using consistent dot/cross origins.",
        1,
      ],
      [
        "Square brackets and charge 2−. A neutral oxygen atom or 2+ charge is not correct.",
        1,
      ],
    ],
    "native",
    {
      question: {
        drawDotCross: { symbol: "O" },
        parts: [
          {
            id: "dots",
            label: "Original non-metal electrons (dots)",
            answer: 6,
          },
          {
            id: "crosses",
            label: "Transferred metal electrons (crosses)",
            answer: 2,
          },
          { id: "charge", label: "Ion charge", answer: -2 },
          { id: "brackets", label: "Draw square brackets", answer: 1 },
        ],
        exposureAliases: ["ib-v1-p-draw-oxide"],
        explanation:
          "The ion has six oxygen-origin outer electrons and two from magnesium, inside brackets with charge 2−.",
      },
      referenceConstruction:
        '{"dots":"6","crosses":"2","charge":"-2","brackets":"1"}',
    },
  ),
  bonding(
    "2(b)",
    ["1.21", "1.27", "1.28"],
    "Compare the bonding",
    "Describe how an ionic bond differs from a covalent bond. Refer to electron behaviour and what holds the particles together.",
    "Ionic formation transfers electrons to form oppositely charged ions, held by electrostatic attraction. A covalent bond is a shared pair of electrons between atoms.",
    3,
    [3, 0, 0],
    [
      [
        "Electron transfer forms ions; do not describe the ionic bond itself as a shared electron pair.",
        1,
      ],
      [
        "Ionic bonding is electrostatic attraction between oppositely charged ions.",
        1,
      ],
      [
        "Covalent bonding is a shared pair of electrons between atoms, not transfer between ions.",
        1,
      ],
    ],
    "written",
  ),
  bonding(
    "2(c)",
    ["1.36", "1.37"],
    "Explain the graphite contact",
    "A sliding electrical contact is made from graphite. Explain why graphite can carry current while its layers slide over one another.",
    "Each carbon forms three covalent bonds in a layer, leaving delocalised electrons that move and carry current. Weak forces between layers allow them to slide; the strong covalent bonds within each layer remain.",
    3,
    [0, 3, 0],
    [
      ["Delocalised electrons move and carry electrical charge.", 1],
      [
        "Carbon atoms form strongly covalently bonded layers (three bonds per carbon).",
        1,
      ],
      [
        "Weak forces between layers allow sliding; not the breaking of all bonds within a layer.",
        1,
      ],
    ],
    "written",
    {
      question: {
        graphiteDiagram: true,
        exposureAliases: ["chem-p1f-full-v1-04b", "chem-p1f-full-v1-04c"],
      },
    },
  ),
  bonding(
    "2(d)",
    ["1.27"],
    "Criticise the lattice picture",
    "Give two limitations.",
    "The real lattice extends in three dimensions, while this slice is flat. A crystal contains vastly more repeating ions than the finite pictured crop; its drawn circles and gaps are schematic, not an accurate scale model.",
    2,
    [0, 0, 2],
    [
      ["A flat slice omits the three-dimensional arrangement.", 1],
      [
        "A second distinct limitation: finite crop versus extended repeating lattice, or schematic circle/spacing scale. Do not claim the real solid consists of separate molecules.",
        1,
      ],
    ],
    "written",
    {
      question: {
        ionicSlice: true,
        compactIonicSlice: true,
        shortWritten: true,
        exposureAliases: ["chem-p1f-full-v1-03e"],
      },
    },
  ),
  bonding(
    "2(e)",
    ["1.43a"],
    "Find the formula mass",
    "Calculate the relative formula mass of CO₂. Relative atomic masses: C=12, O=16. Show your working.",
    "44",
    2,
    [0, 2, 0],
    [
      ["Use 12+2×16, including both oxygen atoms.", 1],
      [
        "Evaluate 44, or correctly evaluate a preceding setup using the supplied masses; relative formula mass has no gram unit.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        exposureAliases: ["fm-v1-p-co2", "fm-v1-cb-quantity", "pc-v1-w-mass"],
      },
    },
  ),
];

const ink = [
  separation(
    "3(a)",
    ["2.7", "2.9", "2.11"],
    "Investigate the ink",
    "Ink contains water and two soluble, non-volatile dyes. Describe a supervised school method to collect its water by simple distillation and investigate its dyes by chromatography. Include apparatus, steps and interpretation.",
    "Use separate portions. Heat one in a distillation flask with a thermometer at the condenser entrance and a water-cooled condenser leading to a receiver. Water vaporises then condenses and is collected; the non-volatile dyes remain. For chromatography, draw a pencil baseline on paper, add a small ink spot and stand the paper in water with the spot above the solvent surface and the paper touching water. Allow the solvent to rise, remove the paper before the front reaches the top, mark the front immediately and let it dry. Two resolved dye spots support two components under those conditions. Follow the school's controls for heated apparatus.",
    6,
    [6, 0, 0],
    [],
    "written",
    {
      practical: 6,
      levels: [
        {
          min: 5,
          max: 6,
          text: "Both separations are chemically valid and coherently described: collect condensed water while retaining non-volatile dye; run a properly positioned chromatogram and interpret resolved spots. Suitable apparatus and key procedural links are developed. Indicative details are not a compulsory keyword list; select within the band by completeness and clarity.",
        },
        {
          min: 3,
          max: 4,
          text: "Mostly relevant chemical understanding and a reasonably clear structure, but one route or key procedural link is incomplete. Use the overall account to select the band mark.",
        },
        {
          min: 1,
          max: 2,
          text: "Some relevant operations or apparatus, with substantial omissions or unclear links; not a developed account of both separations.",
        },
        { min: 0, max: 0, text: "No relevant, creditworthy content." },
      ],
    },
  ),
  separation(
    "3(b)",
    ["2.10c"],
    "Calculate the dye's Rf",
    "The sample origin is 12 mm above the paper bottom. A dye centre is at 48 mm and the solvent front at 102 mm. Calculate Rf to two decimal places. Show distances from the origin and your division.",
    "0.40",
    3,
    [0, 3, 0],
    [
      ["Find both distances from the origin: 36 mm and 90 mm.", 1],
      [
        "Divide dye travel by solvent travel: 36/90. Allow correct division of earlier incorrectly determined distances.",
        1,
      ],
      [
        "Evaluate and present 0.40 to two decimal places. Numeric equivalence to 0.4 alone does not establish this presentation; allow correct rounding of a preceding valid ratio calculation.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 3 },
  ),
  separation(
    "3(c)",
    ["2.9", "2.11"],
    "Repair the starting arrangement",
    "A student draws the baseline in water-soluble ink and immerses the sample spot in the solvent reservoir. Explain a correction for each mistake.",
    "Use pencil so the baseline does not dissolve and interfere with the separated dyes. Put the solvent surface below the sample spot while it still touches the paper, so the sample travels up the paper rather than dissolving into the reservoir.",
    2,
    [0, 0, 2],
    [
      [
        "Pencil replaces soluble ink, linked to avoiding a moving/contaminating baseline.",
        1,
      ],
      [
        "Solvent surface below the spot but contacting paper, linked to avoiding loss into the reservoir.",
        1,
      ],
    ],
    "written",
    { practical: 2, question: { exposureAliases: ["chem-p2f-full-v1-06a"] } },
  ),
  separation(
    "3(d)",
    ["2.12c"],
    "Choose analysis water",
    "Why should water used to prepare samples for chemical analysis contain no dissolved salts?",
    "Dissolved salts could introduce extra ions, contaminate the sample and interfere with the tests or measurements.",
    1,
    [1, 0, 0],
    [
      [
        "Avoid added ions/contamination that interferes with the analysis; drinking-water safety alone is not the reason.",
        1,
      ],
    ],
    "written",
  ),
];

const depositionData = {
  context: "measurement" as const,
  fitKind: "straight" as const,
  title: "Original copper-cathode measurements",
  xName: "Electrolysis time",
  xUnit: "min",
  yName: "Copper mass gained",
  yUnit: "g",
  points: [
    [2, 0.036],
    [4, 0.073],
    [6, 0.108],
    [8, 0.145],
    [10, 0.179],
    [12, 0.216],
  ] as [number, number][],
  xMin: 0,
  xMax: 14,
  xTick: 2,
  yMin: 0,
  yMax: 0.24,
  yTick: 0.04,
  targetX: 0,
  estimateRange: [0, 0.002] as [number, number],
  trend:
    "Cathode mass gain increases approximately linearly over these trials.",
  limit:
    "This supplied range does not establish a universal deposition rate or current efficiency.",
  note: "One suitable balanced fit is mass gain = 0.018×time. Other supported straight fits are valid.",
};

const purification = [
  copper(
    "4(a)",
    ["3.24", "3.30"],
    "Identify both electrode changes",
    "Copper purification uses an impure copper anode and a pure copper cathode in copper sulfate solution. Silver impurities remain unreacted. Name the cathode deposit and explain why it is purer than the anode.",
    "Copper is deposited at the negative cathode. Copper from the positive anode dissolves into the solution and is deposited again, while the stated unreactive silver impurities remain behind or fall as anode sludge. They are not included in the pure copper deposit.",
    2,
    [2, 0, 0],
    [
      ["Copper metal is deposited at the negative electrode.", 1],
      [
        "Copper from the impure anode dissolves and is transferred, while the stated unreactive silver impurities stay behind; link this separation to the purer deposit. Do not claim all impurities necessarily dissolve and plate with copper.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  copper(
    "4(b)",
    ["1.33", "3.22"],
    "Explain the electrolyte's current",
    "Explain why copper sulfate solution conducts electricity but solid copper sulfate does not. Identify the charge carriers in the electrolyte.",
    "The solution contains mobile ions that carry charge. In the solid lattice ions are fixed and cannot move through it; electrons are not the charge carriers travelling through this electrolyte.",
    2,
    [2, 0, 0],
    [
      ["Mobile ions carry charge through the solution.", 1],
      [
        "Ions are fixed in the solid lattice, preventing ionic conduction; not electrons fixed in copper sulfate.",
        1,
      ],
    ],
    "written",
  ),
  copper(
    "4(c)",
    ["3.31"],
    "Plot the cathode observations",
    "Plot all six supplied mass gains and draw a balanced straight best-fit line. The optional intercept estimate carries no mark.",
    "Plot (2,0.036),(4,0.073),(6,0.108),(8,0.145),(10,0.179),(12,0.216). One suitable balanced fit is mass gain=0.018×time; retain separate observation points and fit. Other balanced lines are possible.",
    3,
    [0, 2, 1],
    [
      [
        "All six points accurately plotted within half a small square:2marks; four or five correct:1mark. Judge observations, not line-anchor values substituted as data.",
        2,
      ],
      [
        "A supported straight best-fit line balances the observations; not a successive dot-to-dot join. Other balanced fits are creditable.",
        1,
      ],
    ],
    "written",
    {
      mathematics: true,
      practical: 3,
      question: {
        fuelDrawing: {
          data: depositionData,
          referenceLine: [0.036, 0.216],
          note: "Original illustrative data from matched current, solution, electrodes and elapsed-time procedures. Cathodes are washed and dried before weighing; gain is final minus initial mass.",
        },
      },
    },
  ),
  copper(
    "4(d)",
    ["3.31"],
    "Find the dry mass gain",
    "A washed, dry cathode has mass 18.642 g before electrolysis and 18.858 g afterwards. Calculate its mass gain. Show your working.",
    "0.216",
    2,
    [0, 2, 0],
    [
      ["Subtract initial dry mass from final dry mass:18.858−18.642.", 1],
      [
        "Correctly evaluate0.216g; allow correct evaluation of a preceding consistent subtraction of the stated readings.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 2, question: { unit: "g" } },
  ),
  copper(
    "4(e)",
    ["3.30", "3.31"],
    "Evaluate the colour claim",
    "A separate laboratory model uses two pure copper electrodes. The blue solution stays approximately constant in colour. A student says this proves no copper transfer. Evaluate using both electrode changes and suggest another measurement.",
    "The cathode removes copper ions as deposited copper while the anode replenishes copper ions. Approximately constant concentration/colour can coexist with transfer of copper. Measure the washed, dry electrode masses before and after; cathode gain and anode loss provide direct evidence. Colour alone does not establish exact equality or perfect efficiency.",
    3,
    [0, 0, 3],
    [
      ["Cathode deposition removes copper ions from solution.", 1],
      [
        "Copper-anode dissolution replenishes ions, so constant colour does not prove no transfer.",
        1,
      ],
      [
        "Compare washed, dry electrode masses before/after as evidence, or another valid quantitative measurement; colour alone is not proof of exact mass balance.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
];

const salt = author("Salt and acid changes", "chemical-changes");
const extraction = author("Reactivity and extraction", "chemical-changes");
const empirical = author("Magnesium oxide evidence", "quantitative");
const titration = author("Titration and recovery", "quantitative");
const materials = author("Alloy and corrosion evidence", "resources");
const haber = author("Supplying ammonia and electricity", "resources");
const cells = author("Supplying ammonia and electricity", "energy");

const saltChanges = [
  salt(
    "5(a)",
    ["3.11b"],
    "Generate the reaction products",
    "Dilute nitric acid reacts with copper(II) oxide. Name both reaction products.",
    "Copper(II) nitrate and water.",
    2,
    [2, 0, 0],
    [
      ["Copper(II) nitrate, not copper chloride or nitrite.", 1],
      ["Water; hydrogen gas is not a product of this acid–oxide reaction.", 1],
    ],
    "written",
  ),
  salt(
    "5(b)",
    ["3.11d", "0.3"],
    "Write the complete equation",
    "Write a balanced symbol equation for calcium carbonate, CaCO₃, reacting with hydrochloric acid, HCl. The salt is calcium chloride, CaCl₂. Include every product; state symbols are optional.",
    "CaCO3 + 2HCl → CaCl2 + CO2 + H2O",
    2,
    [0, 2, 0],
    [
      ["Correct reactants and all three products: CaCl2, CO2 and H2O.", 1],
      [
        "Correct balance1:2:1:1:1, or consistent proportional coefficients. Do not change formula subscripts.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true, writtenEquationKind: "symbol" } },
  ),
  salt(
    "5(c)",
    ["3.20", "3.21"],
    "Recover the insoluble salt",
    "A simulated reaction mixture contains insoluble calcium carbonate in sodium nitrate solution. Plan how to recover pure, dry calcium carbonate, explaining how dissolved nitrate is removed.",
    "Filter the mixture, retaining the calcium carbonate residue. Wash the residue with distilled water to remove the soluble nitrate solution, then leave it to dry or pat it with filter paper. Do not evaporate the filtrate to obtain this insoluble product.",
    3,
    [1, 0, 2],
    [
      ["Filter and retain the insoluble residue, not the filtrate.", 1],
      [
        "Wash the residue with distilled water before drying, linked to removing dissolved nitrate.",
        1,
      ],
      [
        "A stated valid drying method such as leaving to dry, filter-paper drying or suitable gentle drying; crystallising the filtrate would recover the wrong material.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
  salt(
    "5(d)",
    ["3.11d", "3.12b"],
    "Identify the carbonate gas",
    "A carbonate reacts with dilute acid. Identify the gas and give its positive limewater-test observation.",
    "Carbon dioxide is produced; bubbling it through limewater makes the limewater milky/cloudy, with a white precipitate.",
    2,
    [1, 1, 0],
    [
      ["Carbon dioxide as the acid–carbonate gas.", 1],
      [
        "Limewater turns milky/cloudy or forms a white precipitate when the gas is bubbled through it; not a hydrogen pop.",
        1,
      ],
    ],
    "written",
  ),
  salt(
    "5(e)",
    ["3.3"],
    "Interpret the indicator",
    "A sample turns initially red litmus paper blue. Classify the sample.",
    "Alkaline",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["Acidic", "Neutral", "Alkaline"],
        exposureAliases: [
          "an-v1-r-indicator",
          "an-v1-p-litmus",
          "an-v1-v-b-litmus",
        ],
      },
    },
  ),
];

const metals = [
  extraction(
    "6(a)",
    ["4.1"],
    "Infer a reactivity order",
    "P displaces Q from its salt solution. Q displaces R. R does not displace either P or Q. Give the order from most to least reactive and explain how the positive results support it.",
    "P > Q > R. P displacing Q shows P is more reactive than Q; Q displacing R shows Q is more reactive than R. The negative R results are consistent with this order.",
    3,
    [0, 0, 3],
    [
      ["P>Q>R, with direction clear.", 1],
      ["Link P displacing Q to P being more reactive than Q.", 1],
      [
        "Link Q displacing R to Q being more reactive than R. No electron half equation is required at Foundation.",
        1,
      ],
    ],
    "written",
    { question: { exposureAliases: ["chem-p1f-full-v1-08b"] } },
  ),
  extraction(
    "6(b)",
    ["4.5", "4.6", "4.7"],
    "Choose extraction methods",
    "Explain suitable extraction routes for aluminium and copper from their oxides, using their positions relative to carbon. State what reduction means here and give one cost or energy reason to use carbon reduction when it works.",
    "Aluminium oxide needs electrolysis because carbon cannot reduce the oxide of a metal more reactive than itself. Copper oxide can be heated with carbon because copper is less reactive. Reduction here is loss of oxygen from the metal oxide. Carbon reduction can avoid the large electricity/energy costs of electrolysis; cost and practical suitability still matter.",
    4,
    [4, 0, 0],
    [
      [
        "Aluminium oxide: electrolysis, linked to aluminium being above carbon.",
        1,
      ],
      [
        "Copper oxide: heat with carbon, linked to copper being below carbon.",
        1,
      ],
      ["Reduction of these oxides means removal/loss of oxygen.", 1],
      [
        "A relevant cost/energy reason for carbon reduction rather than electrolysis, not a claim that carbon extraction has no environmental cost.",
        1,
      ],
    ],
    "written",
  ),
  extraction(
    "6(c)",
    ["1.43", "1.48"],
    "Calculate copper recovery",
    "15.0 kg of an ore is 80.0% CuO by mass. All its CuO is reduced to copper. Calculate the copper mass in grams. Use Ar(Cu)=64, Ar(O)=16; show each stage.",
    "9600",
    4,
    [0, 4, 0],
    [
      ["CuO mass=15.0×0.800=12.0kg.", 1],
      [
        "Use copper mass fraction64/(64+16)=64/80. Do not use atom counts as a mass fraction.",
        1,
      ],
      [
        "Copper mass=12.0×64/80=9.60kg. Allow a consistent calculation after a preceding ore/fraction error.",
        1,
      ],
      [
        "Convert kilograms to grams:9600g; allow correct conversion of the preceding mass. A correct final number with contradictory working does not establish all stages.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "g" } },
  ),
];

const oxide = [
  empirical(
    "7(a)",
    ["0.3"],
    "Balance oxide formation",
    "Write the complete balanced symbol equation for magnesium reacting with oxygen to form magnesium oxide. State symbols are optional.",
    "2Mg + O2 → 2MgO",
    2,
    [0, 2, 0],
    [
      ["Correct species Mg, O2 and MgO, with a reaction arrow.", 1],
      [
        "Coefficients2:1:2, or equivalent proportional coefficients. Formula subscripts must remain correct.",
        1,
      ],
    ],
    "written",
    {
      mathematics: true,
      question: {
        writtenEquations: true,
        writtenEquationKind: "symbol",
        exposureAliases: ["chem-p1f-full-v1-05d"],
      },
    },
  ),
  empirical(
    "7(b)",
    ["1.44", "1.46"],
    "Derive the empirical formula",
    "A dry oxide contains 1.80 g magnesium and 1.20 g oxygen. Calculate its empirical formula using Ar(Mg)=24 and Ar(O)=16. Show the divisions and simplest ratio; a formula alone is insufficient.",
    "1.80/24=0.075 and1.20/16=0.075. Their simplest Mg:O ratio is1:1, giving MgO.",
    3,
    [0, 3, 0],
    [
      [
        "Divide each reacting mass by its relative atomic mass: both0.075. Evidence of these divisions is required; a matching final formula alone earns no credit.",
        1,
      ],
      [
        "Derive the simplest ratio1:1 from the preceding results. Allow a correctly simplified ratio after a calculation error.",
        1,
      ],
      [
        "Derive MgO from that ratio. Allow a chemically formatted formula following the student's derived ratio; no credit for an unsupported memorised formula.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  empirical(
    "7(c)",
    ["1.46"],
    "Establish the final mass",
    "In the supervised magnesium-oxide investigation, explain why the crucible lid is lifted briefly during heating, replaced afterwards, and why heating/cooling/weighing is repeated.",
    "Brief lifting admits oxygen to react with the magnesium. Replacing the lid reduces loss of solid material. Repeated heating, cooling and weighing to constant mass supports completion under the stated conditions; cool before each weighing for comparable reliable readings.",
    3,
    [3, 0, 0],
    [
      ["Briefly lift the lid to admit oxygen.", 1],
      ["Replace it to reduce escape/loss of solid product.", 1],
      [
        "Repeat heat/cool/weigh until successive masses agree: constant mass supports completion; one measurement is insufficient. Credit equivalent scientifically sound completion reasoning.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
];

const measurements = [
  titration(
    "8(a)",
    ["3.18", "5.9C"],
    "Locate the endpoint accurately",
    "A pipette measures sodium hydroxide into a flask; hydrochloric acid is in a burette. Describe three linked actions that help locate the endpoint accurately with a suitable indicator.",
    "Use a few drops of a suitable indicator such as phenolphthalein. Swirl the flask to mix throughout. Add acid dropwise near the endpoint, stopping at the first permanent endpoint colour change. A white tile helps see it; read the burette at eye level.",
    3,
    [3, 0, 0],
    [
      [
        "Suitable indicator, with a few drops; universal indicator is not a precise endpoint indicator.",
        1,
      ],
      ["Swirl/mix throughout so added acid reacts with the alkali.", 1],
      [
        "Add acid dropwise near the endpoint and stop at the first permanent appropriate change; an uncontrolled large addition is unsuitable. Accept other specifically justified accurate-endpoint actions.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
  titration(
    "8(b)",
    ["5.9C"],
    "Select and summarise titres",
    "Titres: rough 24.80 cm³, then 23.60, 23.70 and 23.60 cm³. The protocol accepts titres within 0.10 cm³. Exclude the rough run and calculate the mean accepted titre to two decimal places. Show selection and working.",
    "23.63",
    3,
    [0, 3, 0],
    [
      [
        "Exclude the rough run and retain the three concordant careful titres.",
        1,
      ],
      [
        "Mean=(23.60+23.70+23.60)/3=23.6333…cm³. Allow correct averaging of a preceding selected set, but not the selection point if the rough titre was retained.",
        1,
      ],
      [
        "Present23.63cm³ to two decimal places, or correctly round a preceding mean. Numeric equivalence does not prove requested precision.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 3, question: { unit: "cm³" } },
  ),
  titration(
    "8(c)",
    ["5.11C"],
    "Calculate the recovered yield",
    "A preparation's theoretical yield is 7.50 g. It produces 6.15 g of pure, dry product. Calculate percentage yield and show your working.",
    "82",
    2,
    [0, 2, 0],
    [
      ["Use actual/theoretical×100:6.15/7.50×100.", 1],
      [
        "Correctly evaluate82%. A reversed ratio cannot earn the final point; a correct final answer without contradictory working can support the calculation.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "%" } },
  ),
  titration(
    "8(d)",
    ["5.9C"],
    "Evaluate the scale reading",
    "A burette reading is taken while the eye is above the meniscus. Explain one relevant improvement.",
    "Read the meniscus with the eye at the same level to reduce parallax error.",
    1,
    [0, 0, 1],
    [
      [
        "Eye at the meniscus level, linked to reducing parallax; merely taking more repeats does not correct this reading geometry.",
        1,
      ],
    ],
    "written",
    {
      practical: 1,
      question: { exposureAliases: ["tech-v1-p-meniscus", "tech-v1-a-method"] },
    },
  ),
];

const materialEvidence = [
  materials(
    "9(a)",
    ["5.5C"],
    "Apply the alloy model",
    "The supplied alloy model contains atoms of different sizes. Explain why this can make the alloy harder to bend than the pure metal.",
    "Different-sized atoms disrupt the regular arrangement of layers. The layers cannot slide over one another as easily, so bending is harder. This does not mean every alloy is always stronger in every application.",
    3,
    [1, 2, 0],
    [
      ["Different-sized atoms are present in the alloy.", 1],
      ["They disrupt the regular layer arrangement.", 1],
      [
        "Link disrupted layers to less easy sliding and greater resistance to bending; not simply 'there are more bonds'.",
        1,
      ],
    ],
    "written",
    {
      question: {
        metallicDiagram: { alloy: true },
        exposureAliases: ["mb-v1-p-alloy-explain"],
      },
    },
  ),
  materials(
    "9(b)",
    ["5.3C"],
    "Explain a protective coating",
    "Explain how an intact paint coating reduces rusting of an iron railing.",
    "The intact coating prevents water and oxygen reaching the iron surface, removing the conditions needed for rusting. Scratches can break this barrier.",
    2,
    [2, 0, 0],
    [
      ["Paint forms an intact physical barrier on the iron.", 1],
      [
        "Link the barrier to excluding water/oxygen from the iron, not paint reacting sacrificially.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: ["materials-v1-r-paint", "materials-v1-cB-barrier"],
      },
    },
  ),
  materials(
    "9(c)",
    ["4.11", "4.12"],
    "Evaluate the environmental comparison",
    "For 20 years of equal railing service, A uses 40 MJ and 12 L water; B uses 55 MJ and 4 L. Disposal is omitted. An advert says A is best environmentally because it uses less energy. Evaluate the claim.",
    "A has lower assessed energy, but B uses less water for the same service. The measures compete and cannot be added directly in unlike units. Missing disposal impacts and the need to justify environmental priorities mean the data do not establish an overall winner.",
    3,
    [0, 0, 3],
    [
      [
        "Compare40 versus55MJ on the same20-year service basis: A has lower energy.",
        1,
      ],
      [
        "B has lower water use,4 versus12L; acknowledge the trade-off rather than judging solely by energy.",
        1,
      ],
      [
        "Missing disposal impacts or justified weighting/priorities prevent an overall claim. Do not add MJ and litres into a fabricated score.",
        1,
      ],
    ],
    "written",
    { question: { exposureAliases: ["chem-p2f-full-v1-09d"] } },
  ),
];

const supplies = [
  haber(
    "10(a)",
    ["4.16"],
    "Recall the Haber conditions",
    "State the specified Haber-process temperature, pressure and catalyst.",
    "450°C, 200 atmospheres and an iron catalyst.",
    3,
    [3, 0, 0],
    [
      ["450°C as the specified operating temperature.", 1],
      [
        "200atmospheres as the specified pressure; a correctly equivalent pressure with units is acceptable.",
        1,
      ],
      ["Iron catalyst.", 1],
    ],
    "written",
    {
      question: {
        exposureAliases: ["haber-v1-p-conditions", "haber-v1-p-compromise"],
      },
    },
  ),
  haber(
    "10(b)",
    ["4.14", "4.15"],
    "Explain dynamic equilibrium",
    "In a closed ammonia-reaction system at dynamic equilibrium, explain what the forward and reverse reactions are doing and why the concentrations remain constant.",
    "Both reactions continue at equal rates, so each substance is formed and consumed at equal rates and there is no net concentration change. Constant concentrations need not be equal to one another.",
    2,
    [2, 0, 0],
    [
      ["Forward and reverse reactions continue at equal rates.", 1],
      [
        "Equal production/consumption gives no net concentration change; not equal concentrations or stopped reactions.",
        1,
      ],
    ],
    "written",
    { question: { exposureAliases: ["chem-p2h-full-v1-09f"] } },
  ),
  cells(
    "10(c)",
    ["5.25C"],
    "Explain the exhausted cell",
    "A non-rechargeable chemical cell stops producing its usual voltage after extended use. State the specified chemical reason.",
    "One of its reactants has been used up, so the cell reaction can no longer continue as before.",
    1,
    [1, 0, 0],
    [
      [
        "A reactant has been used up; electricity itself is not a stored reactant.",
        1,
      ],
    ],
    "written",
    { question: { exposureAliases: ["cf-v1-R-primary"] } },
  ),
  cells(
    "10(d)",
    ["5.26C", "5.27C"],
    "Evaluate a delivery vehicle",
    "A fleet needs 280 km nonstop. Ranges: battery 210 km; fuel cell 360 km. Energy-supply estimates per 280 km: battery 12 kg CO₂; fuel cell 20 kg CO₂. A supplier claims zero impact for the fuel cell because its exhaust is water. Evaluate suitability and the claim. Manufacture/disposal are unassessed.",
    "The fuel cell meets the no-stop range requirement, while the battery does not under the supplied conditions. Water-only exhaust does not include emissions from producing its hydrogen. The matched energy-supply data actually give more CO₂ for the fuel cell,20 versus12kg per journey. Range suitability and environmental superiority are separate judgements; manufacture/disposal evidence is also missing, so zero whole-life impact is unsupported.",
    4,
    [0, 0, 4],
    [
      [
        "Compare both ranges with280km and support the fuel-cell choice for the stated no-stop requirement.",
        1,
      ],
      [
        "Water-only exhaust excludes hydrogen/energy-supply production impacts and cannot establish zero-impact operation overall.",
        1,
      ],
      [
        "Use the matched20 versus12kgCO₂ evidence: the fuel-cell energy supply has higher stated emissions.",
        1,
      ],
      [
        "Qualify the whole-life claim using missing manufacture/disposal evidence or a developed trade-off between required range and environmental impacts. A different recommendation must address the no-stop constraint honestly.",
        1,
      ],
    ],
    "written",
    { question: { exposureAliases: ["chem-p1h-full-v1-09d"] } },
  ),
];

export const edexcelPaper1FoundationFull: ExamPaper = {
  id: "edexcel-paper-1-foundation-full",
  totalMarks: 100,
  minutes: 105,
  basis: {
    board: "Edexcel",
    qualification: "1CH0",
    component: "1CH0/1F",
    summary:
      "Pearson Paper 1: key concepts, states/separation, chemical changes, extracting metals/equilibria and Separate chemistry 1. Original contexts include copper purification, empirical formulae from reacting masses, and ink separation.",
    specificationUrl:
      "https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-chemistry-spec.pdf",
    researchPath: "docs/board-mocks/edexcel-1f-basis.md",
  },
  parts: [
    ...particles,
    ...structures,
    ...ink,
    ...purification,
    ...saltChanges,
    ...metals,
    ...oxide,
    ...measurements,
    ...materialEvidence,
    ...supplies,
  ],
};
