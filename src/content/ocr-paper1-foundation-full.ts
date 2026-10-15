import type { ExamPaper, ExamPart } from "./exam-paper-types";
import { boardPaperAuthor } from "./board-paper-authoring";

const author = boardPaperAuthor("chem-ocr-p1f-full-v1-", "foundation");
const mc = author("Section A · Multiple choice", "bonding");
const mcAtom = author("Section A · Multiple choice", "atomic-structure");
const mcQuant = author("Section A · Multiple choice", "quantitative");
const mcAnalysis = author("Section A · Multiple choice", "analysis");
const mcChange = author("Section A · Multiple choice", "chemical-changes");
// Individually written distractors: each question has exactly one defensible choice.
const sectionA: ExamPart[] = [
  mcAtom(
    "1",
    ["C1.2d"],
    "Identify the neutral particle",
    "Which subatomic particle has a relative charge of zero?",
    "Neutron",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["Proton", "Neutron", "Electron", "Nucleus of every atom"],
      },
    },
  ),
  mcAtom(
    "2",
    ["C1.2c"],
    "Choose the atomic scale",
    "Which length is closest to the typical radius of an atom?",
    "0.0000000001 m",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["0.0001 m", "0.0000001 m", "0.1 m", "0.0000000001 m"],
      },
    },
  ),
  mc(
    "3",
    ["C1.1a", "C1.1b"],
    "Interpret a particle change",
    "A sealed sample of liquid evaporates. Which statement describes its particles in the gas?",
    "They are farther apart, with the same chemical identity.",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "They are farther apart, with the same chemical identity.",
          "They become larger atoms.",
          "They turn into different elements.",
          "They stop moving.",
        ],
      },
    },
  ),
  mcQuant(
    "4",
    ["C2.1d"],
    "Reduce the atom ratio",
    "A model contains 6 carbon atoms for every 12 hydrogen atoms. What is its empirical formula?",
    "CH₂",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["C₆H₁₂", "C₂H", "CH₂", "CH₁₂"] },
    },
  ),
  mcQuant(
    "5",
    ["C3.1d"],
    "Balance the ionic formula",
    "Calcium ions are Ca²⁺ and nitrate ions are NO₃⁻. Which formula represents calcium nitrate?",
    "Ca(NO₃)₂",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: { options: ["CaNO₃", "Ca(NO₃)₂", "Ca₂NO₃", "Ca₂(NO₃)₃"] },
    },
  ),
  mcAtom(
    "6",
    ["C2.2c"],
    "Locate an electron arrangement",
    "A neutral atom has electron arrangement 2,8,6. Which group and period describe it?",
    "Group 6, Period 3",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Group 3, Period 6",
          "Group 8, Period 2",
          "Group 2, Period 6",
          "Group 6, Period 3",
        ],
      },
    },
  ),
  mcQuant(
    "7",
    ["C2.1c"],
    "Count the formula mass",
    "Calculate the relative formula mass of CO₂. Relative atomic masses: C=12, O=16.",
    "44",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["44", "28", "32", "40"] },
    },
  ),
  mcAnalysis(
    "8",
    ["C2.1a"],
    "Use scientific purity",
    "Which sample can be a chemically pure substance?",
    "A sample containing only sodium chloride",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Air containing several gases",
          "Water with dissolved sugar",
          "A sample containing only sodium chloride",
          "An alloy of copper and zinc",
        ],
      },
    },
  ),
  mcAnalysis(
    "9",
    ["C2.1f"],
    "Recover the solvent",
    "Which process can collect liquid water from a solution of a non-volatile salt in water?",
    "Simple distillation",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Filtration alone",
          "A magnet",
          "Decanting alone",
          "Simple distillation",
        ],
      },
    },
  ),
  mc(
    "10",
    ["C2.2d"],
    "Identify the metal charge carriers",
    "What moves through a solid metal to carry an electric current?",
    "Delocalised electrons",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Delocalised electrons",
          "Positive metal ions",
          "Neutral protons",
          "Whole metal atoms only",
        ],
      },
    },
  ),
  mc(
    "11",
    ["C2.2e"],
    "Describe a covalent bond",
    "What is a single covalent bond?",
    "A shared pair of electrons",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "A transferred pair of protons",
          "A shared pair of electrons",
          "A shared neutron",
          "A pair of positive ions",
        ],
      },
    },
  ),
  mc(
    "12",
    ["C2.3a"],
    "Recall carbon bonding",
    "How many covalent bonds does a carbon atom usually form?",
    "4",
    1,
    [1, 0, 0],
    [],
    "choice",
    { automaticMarks: 1, question: { options: ["1", "2", "4", "8"] } },
  ),
  mcChange(
    "13",
    ["C3.3a"],
    "Recognise reduction by oxygen",
    "Which change describes reduction in terms of oxygen?",
    "Removal of oxygen from a substance",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Addition of oxygen to a substance",
          "Melting without reaction",
          "Dissolving any salt",
          "Removal of oxygen from a substance",
        ],
      },
    },
  ),
  mcChange(
    "14",
    ["C3.3c"],
    "Identify alkali ions",
    "Which ions are characteristic of an aqueous alkaline solution?",
    "Hydroxide ions, OH⁻",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Hydrogen ions, H⁺",
          "Hydroxide ions, OH⁻",
          "Oxide ions, O²⁻, only",
          "Neutral chlorine atoms",
        ],
      },
    },
  ),
  mcChange(
    "15",
    ["C3.1f"],
    "Read an aqueous state symbol",
    "In a chemical equation, what does (aq) mean?",
    "Dissolved in water",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Dissolved in water",
          "Any pure liquid",
          "A gas",
          "An insoluble solid",
        ],
      },
    },
  ),
];

const atom = author("Section B · Particles and magnesium", "atomic-structure");
const particles: ExamPart[] = [
  atom(
    "16(a)",
    ["C1.2e"],
    "Count magnesium-26 particles",
    "A neutral magnesium-26 atom has atomic number 12. State its number of protons and its number of neutrons. Show how you obtain the neutron number.",
    "12 protons; 26−12=14 neutrons.",
    2,
    [0, 2, 0],
    [
      ["12 protons, from the atomic number.", 1],
      [
        "14 neutrons, using mass number minus atomic number; allow a consistent subtraction after a stated atomic-number error.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  atom(
    "16(b)",
    ["C1.2e"],
    "Explain the isotope relationship",
    "Explain why magnesium-24 and magnesium-26 are isotopes of the same element.",
    "Both have 12 protons and are therefore the same element. They have different neutron numbers: 12 and 14 respectively.",
    2,
    [2, 0, 0],
    [
      ["Same proton number / atomic number, explaining the same element.", 1],
      [
        "Different neutron numbers; merely different masses is insufficient for this explanation.",
        1,
      ],
    ],
    "written",
  ),
  atom(
    "16(c)",
    ["C1.2e", "C2.2c"],
    "Find the magnesium ion arrangement",
    "A magnesium atom has electron arrangement 2,8,2. It forms Mg²⁺. State how its electrons change and give the ion's electron arrangement.",
    "The atom loses two electrons, leaving arrangement 2,8 (10 electrons). The proton number stays 12.",
    2,
    [1, 1, 0],
    [
      ["Loses two electrons, rather than gaining protons.", 1],
      [
        "Ion arrangement 2,8, consistent with 10 electrons; do not retain an occupied third shell.",
        1,
      ],
    ],
    "written",
  ),
  atom(
    "16(d)",
    ["C1.1a", "C1.1b"],
    "Describe melting with particles",
    "Describe the arrangement and movement of particles as a solid melts to form a liquid. The particles do not change chemical identity.",
    "The regular fixed arrangement becomes irregular while particles remain close together. They can move past each other instead of only vibrating about fixed positions.",
    2,
    [2, 0, 0],
    [
      [
        "Regular solid arrangement becomes irregular but close-packed in the liquid, not widely separated like a gas.",
        1,
      ],
      [
        "Particles move past one another instead of remaining at fixed positions; the particles themselves do not melt or enlarge.",
        1,
      ],
    ],
    "written",
  ),
];

const bond = author("Section B · Electrons, bonds and models", "bonding");
const ammoniaReference =
  '{"unsharedCentre":"2","centre0":"1","partner0":"1","unsharedPartner0":"0","centre1":"1","partner1":"1","unsharedPartner1":"0","centre2":"1","partner2":"1","unsharedPartner2":"0"}';
const oxideReference =
  '{"dots":"6","crosses":"2","charge":"-2","brackets":"1"}';
const bonds: ExamPart[] = [
  bond(
    "17(a)",
    ["C2.2f"],
    "Construct ammonia's outer electrons",
    "Construct NH₃ using dots for nitrogen's original outer electrons and crosses for hydrogen electrons. Include every shared and unshared outer electron.",
    ammoniaReference,
    3,
    [0, 3, 0],
    [
      [
        "Three single N–H shared pairs, each containing one nitrogen dot and one hydrogen cross; no extra bonding electrons.",
        1,
      ],
      ["Nitrogen has one unshared pair (two dots).", 1],
      [
        "Each H has two shared electrons and no unshared electrons, with no extra atoms or other electron marks. A consistent dot/cross reversal is acceptable when origins are clear. Nitrogen's missing lone pair is assessed by the separate lone-pair point.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: ammoniaReference,
      question: {
        drawCovalent: { molecule: "NH3" },
        parts: [
          { id: "unsharedCentre", label: "Unshared N dots", answer: 2 },
          { id: "centre0", label: "Bond 1: N dots", answer: 1 },
          { id: "partner0", label: "Bond 1: H crosses", answer: 1 },
          { id: "unsharedPartner0", label: "H 1: unshared crosses", answer: 0 },
          { id: "centre1", label: "Bond 2: N dots", answer: 1 },
          { id: "partner1", label: "Bond 2: H crosses", answer: 1 },
          { id: "unsharedPartner1", label: "H 2: unshared crosses", answer: 0 },
          { id: "centre2", label: "Bond 3: N dots", answer: 1 },
          { id: "partner2", label: "Bond 3: H crosses", answer: 1 },
          { id: "unsharedPartner2", label: "H 3: unshared crosses", answer: 0 },
        ],
        explanation:
          "Nitrogen contributes one electron to each of three shared pairs and retains two unshared electrons. Each hydrogen contributes its single electron; no unshared hydrogen electrons remain.",
      },
    },
  ),
  bond(
    "17(b)",
    ["C1.2e", "C2.2e", "C2.2f"],
    "Construct the oxide ion",
    "Potassium (atomic number 19) forms K₂O. Draw the oxide ion using dots for original oxygen electrons and crosses for transferred electrons; include charge and brackets. In Working, give the potassium ion's charge and electron arrangement.",
    oxideReference,
    3,
    [0, 3, 0],
    [
      [
        "Eight outer electrons shown as six oxygen dots and two transferred crosses. Credit a clearly keyed equivalent convention.",
        1,
      ],
      [
        "Square brackets and correct 2− charge outside the oxide ion; no charge inside a nucleus. Both are needed for this presentation point.",
        1,
      ],
      [
        "In Working, states potassium ion charge 1+ and electron arrangement 2,8,8 (18 electrons). Each potassium atom loses one electron; two K⁺ balance one O²⁻. Do not award this point for an oxide diagram alone.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: oxideReference,
      question: {
        drawDotCross: { symbol: "O" },
        parts: [
          { id: "dots", label: "Original O dots", answer: 6 },
          { id: "crosses", label: "Transferred K crosses", answer: 2 },
          { id: "charge", label: "Oxide ion charge", answer: -2 },
          { id: "brackets", label: "Square brackets", answer: 1 },
        ],
        explanation:
          "The oxide ion contains six original oxygen outer electrons and two gained electrons, enclosed in square brackets with charge 2−. Each of two potassium atoms loses one electron. A potassium ion has charge 1+ and electron arrangement 2,8,8 (18 electrons), written in Working; 2×(+1)+(−2)=0 for K₂O.",
      },
    },
  ),
  bond(
    "17(c)",
    ["C2.3c"],
    "Explain graphite conduction",
    "Explain why solid graphite conducts electricity. Refer to carbon bonding and charge carriers.",
    "Each carbon forms three covalent bonds in a layer, leaving an electron delocalised. These electrons move through the structure and carry charge.",
    2,
    [2, 0, 0],
    [
      ["Each carbon forms three bonds, leaving delocalised electrons.", 1],
      [
        "Mobile delocalised electrons carry current; do not attribute current to sliding neutral layers.",
        1,
      ],
    ],
    "written",
  ),
  bond(
    "17(d)",
    ["C2.1e", "C2.3f"],
    "Explain alloy hardness",
    "An alloy contains atoms of two different sizes. Explain why it can be harder than the pure metal.",
    "The differently sized atoms disrupt the regular metal layers. This makes it harder for the layers to slide past one another.",
    2,
    [2, 0, 0],
    [
      ["Different atomic sizes disrupt the regular arrangement of layers.", 1],
      [
        "This hinders layer sliding; 'stronger atoms' does not explain hardness.",
        1,
      ],
    ],
    "written",
  ),
  bond(
    "17(e)",
    ["C2.2g"],
    "Evaluate a ball-and-stick claim",
    "A student says: 'Real molecules contain coloured solid balls joined by long rigid sticks, exactly as in a model.' Give two reasons why this literal interpretation is unreliable.",
    "Model colours identify elements but are not the actual colours of individual atoms. Sticks represent bonds rather than literal rigid rods; their length/thickness and gaps are not necessarily to scale. Accept other specifically justified limitations of this representation.",
    2,
    [0, 0, 2],
    [
      [
        "One justified model-specific limitation, such as artificial atom colours or nonliteral sticks.",
        1,
      ],
      [
        "A second distinct justified limitation, such as inaccurate relative atom/bond sizes or rigid geometry omitting molecular motion. Do not award the same limitation twice.",
        1,
      ],
    ],
    "written",
  ),
];

const separation = author(
  "Section B · Purity and a measured chromatogram",
  "analysis",
);
const separations: ExamPart[] = [
  separation(
    "18(a)",
    ["C2.1a"],
    "Define chemical purity",
    "What does chemically pure mean for a sample of a compound?",
    "It contains only that one compound, without other substances mixed into it.",
    1,
    [1, 0, 0],
    [
      [
        "Only one compound present; 'safe', 'natural' or 'nothing harmful added' alone is not chemical purity.",
        1,
      ],
    ],
    "written",
  ),
  separation(
    "18(b)",
    ["C2.1b"],
    "Judge melting evidence",
    "Pure reference R melts at 82.0°C. Sample X melts over 76–80°C; sample Y melts sharply at 82.0°C. Which sample is better supported as pure R? Explain using both sets of evidence.",
    "Y is better supported: it melts sharply at the reference temperature. X has a depressed melting range, consistent with impurities. Matching melting behaviour supports Y but does not conclusively establish identity.",
    2,
    [0, 0, 2],
    [
      [
        "Selects Y and links its sharp 82.0°C melting point to the pure reference.",
        1,
      ],
      [
        "Contrasts X's lower, spread-out melting range as evidence of impurity. Do not claim melting data alone prove molecular identity.",
        1,
      ],
    ],
    "written",
  ),
  separation(
    "18(c)",
    ["C2.1i"],
    "Calculate Rf from the origin",
    "Use the supplied coordinates to calculate Rf for U. Show both distances from the origin. Give your answer to two decimal places.",
    "0.60",
    3,
    [0, 3, 0],
    [
      [
        "Subtracts the 12mm origin from both coordinates: spot travel 42mm, solvent travel 70mm.",
        1,
      ],
      [
        "Uses 42/70, or consistently evaluates that orientation after an earlier subtraction error; 54/82 uses the wrong reference point.",
        1,
      ],
      [
        "Gives 0.60 to two decimal places, with no unit; allow correct final rounding of a consistently carried value.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 3,
      question: {
        chromatographyGiven: { record: "ocr1fOrigin" },
        rounding: { kind: "decimal-places", digits: 2 },
      },
    },
  ),
  separation(
    "18(d)",
    ["C2.1g", "C2.1j"],
    "Repair the starting arrangement",
    "A chromatography setup has a soluble ink baseline and the sample spots submerged in the solvent. Suggest two changes that address these specific problems.",
    "Draw the baseline in pencil, which does not dissolve in the solvent. Start with the solvent surface below the sample spots, so they are carried up the paper rather than dissolving into the reservoir.",
    2,
    [0, 0, 2],
    [
      [
        "Replace the soluble ink baseline with pencil; replacing it with another soluble ink is insufficient.",
        1,
      ],
      [
        "Keep the initial solvent below the baseline/sample spots. A lid alone does not fix submerged samples.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  separation(
    "18(e)",
    ["C2.1i", "C2.1k"],
    "Assess a claimed dye identity",
    "In a separate experiment, V, P and Q each give one spot with Rf=0.45 under identical conditions. A student concludes 'V must be pure P and cannot be Q.' Evaluate this conclusion and suggest a useful further test.",
    "The result is consistent with P but also Q: distinct substances can have the same Rf in one solvent. A single spot does not prove purity because components may overlap. Repeat using a different suitable solvent, running V alongside P and Q, to seek different separation behaviour.",
    3,
    [0, 0, 3],
    [
      [
        "Matching Rf is consistent with both P and Q; it cannot uniquely identify P.",
        1,
      ],
      [
        "One spot does not prove purity because unresolved substances can co-migrate.",
        1,
      ],
      [
        "Proposes another suitable solvent with side-by-side known standards, or another justified discriminating method. Merely repeating identical conditions does not necessarily discriminate P from Q.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
  separation(
    "18(f)",
    ["C2.1j", "CM2.1i"],
    "Scale a recovered component",
    "An identical-composition powder mixture gives 3.6g of component T from a 12.0g sample by complete separation. What mass of T could be collected from 25.0g? Assume complete recovery. Show your proportion.",
    "7.5",
    3,
    [0, 3, 0],
    [
      [
        "Uses the component fraction 3.6/12.0=0.30 (or scales by 25.0/12.0).",
        1,
      ],
      [
        "Applies the fraction to the new total: 0.30×25.0, or an equivalent proportion.",
        1,
      ],
      [
        "Obtains 7.5g; allow consistent arithmetic after a preceding fraction error. Adding the change in total mass to 3.6g is not proportional scaling.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "g" } },
  ),
];

const salt = author("Section B · Preparing a soluble salt", "chemical-changes");
const salts: ExamPart[] = [
  salt(
    "19(a)",
    ["C3.3d", "C2.1f", "C7"],
    "Plan pure dry magnesium sulfate",
    "Plan a supervised preparation of pure dry magnesium sulfate crystals from dilute sulfuric acid and insoluble magnesium oxide. The salt is soluble. Explain how your method removes unused reactants and separates and dries the crystals.",
    "Warm the dilute acid gently with suitable school apparatus. Add magnesium oxide in small portions with stirring until some remains unreacted, ensuring the acid has been used up. Filter to remove excess solid oxide, collecting the magnesium sulfate solution. Gently evaporate some water until the solution is near saturation, then allow it to cool and crystallise. Filter the crystals, rinse with a little cold distilled water and dry between filter papers or in a suitable warm place. Do not evaporate to complete dryness or assume filtration alone removes dissolved acid.",
    6,
    [1, 1, 4],
    [],
    "written",
    {
      practical: 6,
      levels: [
        {
          min: 1,
          max: 2,
          text: "Some relevant preparation or separation steps, but the account does not yet provide a workable route to pure dry crystals. There is an attempt at a logical sequence; select within the band by relevance and clarity.",
        },
        {
          min: 3,
          max: 4,
          text: "A substantially workable route includes reaction and separation, with some explanation of excess oxide, filtration or crystallisation. A missing or weakly connected stage limits the purity/dryness account. Reasoning has some coherent structure.",
        },
        {
          min: 5,
          max: 6,
          text: "A chemically sound, logically linked route explains how excess oxide consumes acid and is filtered off, then obtains and dries crystals from the solution. Reasoning links separation steps to purity and the final product. Accept valid alternatives and equivalent apparatus; indicative details are not a compulsory keyword checklist. Use clarity and completeness to choose within the band.",
        },
      ],
    },
  ),
  salt(
    "19(b)",
    ["C2.1c"],
    "Calculate a bracketed formula mass",
    "Calculate the relative formula mass of Mg(NO₃)₂. Relative atomic masses: Mg=24, N=14, O=16. Show how the brackets affect the atom counts.",
    "148",
    3,
    [0, 3, 0],
    [
      ["Recognises two N atoms and six O atoms, with one Mg atom.", 1],
      ["Uses 24+2×14+6×16 (or 24+2×(14+3×16)).", 1],
      [
        "Evaluates 148; allow consistent evaluation of an explicitly shown preceding count error, without awarding correct atom-count credit for it.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true },
  ),
  salt(
    "19(c)",
    ["C3.3c"],
    "Name the acid ion",
    "Name or give the formula of the ions characteristic of an aqueous acid.",
    "Hydrogen ions, H⁺.",
    1,
    [1, 0, 0],
    [
      [
        "Hydrogen ions / H⁺; accept hydronium H₃O⁺. Neutral hydrogen atoms or H₂ gas are not equivalent.",
        1,
      ],
    ],
    "written",
  ),
];

const energy = author(
  "Section B · Cooling reaction and an energy profile",
  "energy",
);
const profileReference =
  '{"reactant":"40","product":"65","peak":"90","activationArrow":"reactants-peak","overallArrow":"reactants-products"}';
const energies: ExamPart[] = [
  energy(
    "20(a)",
    ["C3.2a", "C7"],
    "Calculate the temperature fall",
    "A supervised reaction starts at 23.4°C and reaches a minimum of 16.8°C. Calculate the magnitude of the temperature fall. Show your subtraction.",
    "6.6",
    2,
    [0, 2, 0],
    [
      [
        "Subtracts minimum from initial temperature: 23.4−16.8; equivalent signed subtraction is acceptable if the requested magnitude is made clear.",
        1,
      ],
      [
        "Gives a fall of 6.6°C; allow evaluation of a consistent preceding difference. Adding the temperatures is not the method.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 2, question: { unit: "°C" } },
  ),
  energy(
    "20(b)",
    ["C3.2a"],
    "Explain the cooling direction",
    "A reacting mixture becomes colder than its surroundings. Name the type of energy change and explain the direction of energy transfer.",
    "It is endothermic: energy transfers from the surroundings into the reacting system.",
    2,
    [2, 0, 0],
    [
      ["Identifies the change as endothermic.", 1],
      [
        "Energy transfers from surroundings to the reacting system; cold flowing out is not an energy-transfer explanation.",
        1,
      ],
    ],
    "written",
  ),
  energy(
    "20(c)",
    ["C3.2b"],
    "Construct an endothermic profile",
    "Draw a profile with reactants at 40kJ, products 25kJ higher, and forward activation energy 50kJ. Add the activation and overall-energy arrows. The horizontal axis is reaction progress.",
    profileReference,
    4,
    [2, 2, 0],
    [
      [
        "Reactant level 40kJ and product level 65kJ, correctly above the reactants.",
        1,
      ],
      [
        "Peak level 90kJ, 50kJ above the reactants; activation energy is a difference, not the absolute peak.",
        1,
      ],
      ["Activation arrow runs from the reactant level to the peak.", 1],
      [
        "Overall change arrow runs from the reactant level up to the product level. No bond-energy calculation is required.",
        1,
      ],
    ],
    "native",
    {
      mathematics: true,
      referenceConstruction: profileReference,
      question: {
        profileDrawing: true,
        compactProfileInstructions: true,
        explanation:
          "Products are at 40+25=65kJ; the peak is at 40+50=90kJ. Activation is measured from reactants to peak and the overall energy increase from reactants to products. These are relative energy levels for the represented reaction.",
      },
    },
  ),
  energy(
    "20(d)",
    ["C3.2a", "C7"],
    "Improve the cooling measurement",
    "A student measures the cooling reaction in an open, uninsulated glass beaker. Suggest one apparatus improvement and explain how it helps measure the full temperature fall.",
    "Use an insulated cup or add suitable insulation and a lid with a thermometer opening. This reduces energy entering from the warmer surroundings, so the measured minimum is less pulled back towards room temperature. Accept a linked valid alternative.",
    2,
    [0, 1, 1],
    [
      [
        "A suitable insulation/lid improvement that reduces heat exchange, not merely a larger beaker.",
        1,
      ],
      [
        "Links it to less energy entering the colder reacting mixture and a minimum closer to the reaction's temperature fall. A claim that an endothermic reaction loses heat to a warmer room has the transfer direction reversed.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  energy(
    "20(e)",
    ["C3.2c"],
    "Define activation energy",
    "Define activation energy.",
    "The minimum energy that reacting particles need for a reaction to occur.",
    2,
    [2, 0, 0],
    [
      ["Minimum energy, rather than maximum or all energy released.", 1],
      [
        "Needed by reacting particles for a reaction to occur / start; not energy to end the reaction.",
        1,
      ],
    ],
    "written",
  ),
];

const cell = author(
  "Section B · Electrolysis and material boundaries",
  "chemical-changes",
);
const electrolysis: ExamPart[] = [
  cell(
    "21(a)",
    ["C3.4a", "C3.4b"],
    "Predict molten bromide products",
    "Molten magnesium bromide, MgBr₂, is electrolysed using inert electrodes. Name the product at the negative cathode and the product at the positive anode.",
    "Magnesium at the negative cathode; bromine at the positive anode.",
    2,
    [0, 2, 0],
    [
      [
        "Magnesium at the cathode; do not substitute hydrogen from water in a molten salt.",
        1,
      ],
      [
        "Bromine at the anode; bromide is the reacting ion, not the product name.",
        1,
      ],
    ],
    "written",
  ),
  cell(
    "21(b)",
    ["C3.4c"],
    "Recall aqueous copper sulfate products",
    "Aqueous copper sulfate is electrolysed using inert electrodes. Name the product at each electrode.",
    "Copper at the negative cathode; oxygen at the positive anode.",
    2,
    [2, 0, 0],
    [
      ["Copper at the negative cathode.", 1],
      [
        "Oxygen at the positive anode; do not predict sulfur or sulfate as the gas.",
        1,
      ],
    ],
    "written",
  ),
  cell(
    "21(c)",
    ["C3.4d", "C2.3f"],
    "Explain the conducting liquid",
    "Explain why an ionic compound conducts when molten but not when solid.",
    "Ions are held in fixed lattice positions in the solid. On melting the charged ions become mobile and carry current; the charge carriers are ions rather than free electrons in the liquid.",
    2,
    [2, 0, 0],
    [
      [
        "Charged ions are fixed in the solid lattice, so cannot carry current through it.",
        1,
      ],
      [
        "Molten ions move and carry charge; saying only 'the particles move' is insufficient without identifying ions/charge.",
        1,
      ],
    ],
    "written",
  ),
  cell(
    "21(d)",
    ["C3.4e", "C7"],
    "Challenge the unchanged-anode claim",
    "A class replaces the inert anode in copper sulfate solution with copper. A student predicts the anode will stay unchanged because 'electrodes never react'. Evaluate the prediction and state the expected change.",
    "The claim is false: a non-inert copper anode reacts and dissolves to form copper ions. Its mass decreases, unlike an ideal inert electrode. A half equation is not required.",
    2,
    [1, 0, 1],
    [
      [
        "Rejects the universal inert-electrode claim and identifies copper entering solution as copper ions.",
        1,
      ],
      [
        "Predicts a decrease in copper anode mass, linked to its consumption. Do not say neutral copper simply evaporates.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  cell(
    "21(e)",
    ["C3.1i", "C3.1j"],
    "Account for an open-system gas loss",
    "A different reaction vessel and all its contents initially have mass 84.65g. Only oxygen gas leaves; nothing else crosses the boundary. The final mass is 83.37g. Calculate the oxygen mass that left and explain whether total mass was conserved.",
    "84.65−83.37=1.28g of oxygen left. Total mass is conserved when the escaped oxygen is included; the measured vessel is an open system.",
    2,
    [0, 2, 0],
    [
      [
        "Calculates 1.28g of escaped oxygen from the difference; no reacting-mass mole calculation is involved.",
        1,
      ],
      [
        "Explains conservation by including the escaped gas beyond the measured vessel boundary; mass has not been destroyed.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
];

const nano = author("Section B · Nanoparticles and evidence", "bonding");
const nanoparticles: ExamPart[] = [
  nano(
    "22(a)",
    ["C2.3g"],
    "Classify measured particle sizes",
    "Four particles have diameters W=0.4nm, X=18nm, Y=76nm and Z=240nm. Identify both nanoparticles and state the size range used.",
    "X and Y; nanoparticles have dimensions about 1–100nm.",
    2,
    [1, 0, 1],
    [
      ["Selects both X and Y (18 and 76nm), without including W or Z.", 1],
      [
        "States the approximately 1–100nm range, rather than merely 'very small'.",
        1,
      ],
    ],
    "written",
  ),
  nano(
    "22(b)",
    ["C2.3h"],
    "Calculate a cube's area-to-volume ratio",
    "A cube-shaped particle has side length 20nm. Calculate surface area divided by volume in nm⁻¹. Use area=6l² and volume=l³. Show both values and give the quotient, not its inverse.",
    "0.30",
    3,
    [0, 3, 0],
    [
      ["Surface area=6×20²=2400nm².", 1],
      ["Volume=20³=8000nm³.", 1],
      [
        "Area/volume=2400/8000=0.30nm⁻¹. Allow equivalent fractions or consistent carried evaluation after an earlier arithmetic error; 3.33 is the inverse.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "nm⁻¹" } },
  ),
  nano(
    "22(c)",
    ["C2.3i", "C2.3j"],
    "Link one use and one possible risk",
    "Give one useful property of nanoparticles for a named application and one possible human-health risk. Keep the benefit and risk distinct.",
    "For example, some nanoparticles absorb/block ultraviolet radiation in sunscreen. A possible risk is that nanoparticles entering the body may have toxic effects or catalyse harmful reactions. Accept other valid paired uses/properties and scientifically plausible risks; risk depends on material, exposure and dose.",
    2,
    [2, 0, 0],
    [
      [
        "A named application linked to a relevant useful property, e.g. UV screening, antibacterial silver, or high exposed area in catalysts.",
        1,
      ],
      [
        "One plausible health risk, such as toxicity or harmful reactions after exposure. 'They are small' alone does not state harm.",
        1,
      ],
    ],
    "written",
  ),
  nano(
    "22(d)",
    ["C2.3j", "WS1.1h"],
    "Evaluate a safety conclusion",
    "An illustrative test finds no visible damage in five skin-cell cultures after one hour with a particular nanoparticle coating. A student concludes 'Every nanoparticle is safe in every use.' Explain two limitations of this conclusion.",
    "A small, short test may miss delayed or less visible effects; no visible damage is not a complete safety assessment. Testing one coating on skin cells does not represent other nanoparticle materials, doses, exposure routes or uses. Further relevant evidence is needed before extending the conclusion.",
    2,
    [0, 0, 2],
    [
      [
        "Links a limitation of the observed endpoint, small sample or short duration to what this test cannot establish.",
        1,
      ],
      [
        "Explains why one tested material/exposure cannot establish safety for all nanoparticles or uses; repeating 'more research' without a specific reason is insufficient.",
        1,
      ],
    ],
    "written",
  ),
];

export const ocrPaper1FoundationFull: ExamPaper = {
  id: "ocr-paper-1-foundation-full",
  totalMarks: 90,
  minutes: 105,
  basis: {
    board: "OCR",
    qualification: "Gateway Science A J248",
    component: "J248/01",
    summary:
      "Gateway Foundation Paper 1: C1–C3 and practical skills C7. Section A has 15 multiple-choice marks; Section B has 75 structured marks, including a six-mark whole-response practical plan, native electron/profile constructions, offset chromatography and critical evidence evaluation. Original practice, not an official OCR paper.",
    specificationUrl:
      "https://www.ocr.org.uk/Images/234598-specification-accredited-gcse-gateway-science-suite-chemistry-a-j248.pdf",
    researchPath: "docs/board-mocks/ocr-1f-basis.md",
  },
  parts: [
    ...sectionA,
    ...particles,
    ...bonds,
    ...separations,
    ...salts,
    ...energies,
    ...electrolysis,
    ...nanoparticles,
  ],
};

// Compared with actual earlier prompts/references, not inferred from topic tags.
// New numeric data remain distinct; already disclosed answers cannot be fresh.
const priorDisclosures: Record<string, string[]> = {
  "1": ["atom-v2-r-particles"],
  "2": ["as-v1-g-nano"],
  "6": ["pt-v1-r-position", "pt-write-v1-ca-position"],
  "7": ["chem-edx-p1f-full-v1-2e", "pc-v1-p-working", "pc-v1-p-rounded-oxygen"],
  "8": ["purity-v1-r-definition"],
  "9": [
    "purity-and-separation-2",
    "purity-v1-g-solvent",
    "separation-practical-v1-r-target",
  ],
  "11": ["covalent-bonding-0", "cb-v1-rb-bond"],
  "12": ["alk-v1-r-carbon", "pol-v1-w-carbon"],
  "15": ["gas-tests-v1-w-aqueous"],
  "16(d)": ["st-v1-p-explain"],
  "17(a)": ["cb-v1-p-ammonia"],
  "17(b)": ["ib-v1-p-draw-oxide", "chem-edx-p1f-full-v1-2a"],
  "17(c)": [
    "chem-p1f-full-v1-04b",
    "gr-write-v1-ca-conduction",
    "gr-v1-p-explain",
  ],
  "17(d)": [
    "mb-write-v1-ca-hardness",
    "chem-edx-p1f-full-v1-9a",
    "mb-v1-p-alloy-explain",
  ],
  "18(a)": ["purity-v1-r-definition"],
  "19(a)": ["ss-v1-p-method-write", "ss-v1-heating-ca-magnesium"],
  "19(b)": ["chem-p1f-full-v1-05b", "fm-v1-p-nitrate-count"],
  "19(c)": ["an-v1-g-identity"],
  "20(b)": ["exothermic-and-endothermic-1"],
  "20(e)": [
    "profile-v1-p-definition",
    "profile-v1-b-definition",
    "chem-edx-p2h-full-v1-3c",
  ],
  "21(b)": ["aqp-v1-method-p-copper"],
  "21(c)": ["is-write-v1-ca-conduction", "is-v1-p-explain"],
  "21(d)": ["aqp-v1-b-electrodes", "chem-edx-p1h-full-v1-6d"],
};
for (const part of ocrPaper1FoundationFull.parts)
  if (priorDisclosures[part.number])
    part.question.exposureAliases = priorDisclosures[part.number];
