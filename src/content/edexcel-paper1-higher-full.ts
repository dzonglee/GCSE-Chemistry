import type { ExamPaper, ExamPart } from "./exam-paper-types";
import { boardPaperAuthor } from "./board-paper-authoring";
import { emptyFuelDrawing } from "../lib/fuel-drawing";

const author = boardPaperAuthor("chem-edx-p1h-full-v1-", "higher");
const atomic = author("Sulfur ions and silicon isotopes", "atomic-structure");
const bonding = author("Oxygen and carbon structures", "bonding");
const separation = author("Formula, purity and separation", "analysis");

// Original demands and references are authored separately for this 1CH0/1H paper.
const particles: ExamPart[] = [
  atomic(
    "1(a)",
    ["1.7", "1.23"],
    "Count the charged ion's particles",
    "A sulfur-34 ion has atomic number 16 and charge 2−. Give its numbers of protons, neutrons and electrons.",
    '{"protons":"16","neutrons":"18","electrons":"18"}',
    3,
    [0, 3, 0],
    [
      ["16 protons, from the atomic number.", 1],
      ["18 neutrons: 34−16; making an ion does not change the nucleus.", 1],
      ["18 electrons: two more than the 16 protons, giving charge 2−.", 1],
    ],
    "native",
    {
      question: {
        explanation:
          "Sulfur-34 has 16 protons and 34−16=18 neutrons. Its 2− charge means two extra electrons: 16+2=18 electrons.",
        parts: [
          { id: "protons", label: "Protons", answer: 16 },
          { id: "neutrons", label: "Neutrons", answer: 18 },
          { id: "electrons", label: "Electrons", answer: 18 },
        ],
        exposureAliases: ["iso-v1-rb-neutrons"],
      },
      referenceConstruction:
        '{"protons":"16","neutrons":"18","electrons":"18"}',
    },
  ),
  atomic(
    "1(b)",
    ["1.12"],
    "Calculate the supplied isotope mean",
    "Supplied relative isotope masses/abundances:28(91%),29(5%),30(4%). Calculate this illustrative silicon sample's relative atomic mass to two decimal places. Show working.",
    "28.13",
    2,
    [0, 2, 0],
    [
      [
        "Weights all three masses: (28×91+29×5+30×4)/100, or equivalent fractions.",
        1,
      ],
      [
        "Evaluates 28.13 to two decimal places. Allow a correctly evaluated preceding weighted setup after an earlier error; a contradictory setup cannot earn both marks.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        rounding: { kind: "decimal-places", digits: 2 },
        explanation:
          "Use every supplied abundance: (28×91+29×5+30×4)/100=2813/100=28.13. An unweighted average would ignore the isotope proportions.",
      },
    },
  ),
  atomic(
    "1(c)",
    ["1.9", "1.19", "1.20"],
    "Explain the chemical similarity",
    "Explain why neutral silicon-28 and silicon-30 have similar chemical properties, referring to their electrons. Both have atomic number 14.",
    "Both neutral isotopes have 14 electrons with the same 2,8,4 arrangement. Their identical outer-electron arrangement gives similar chemical behaviour; different neutron counts do not change that arrangement.",
    2,
    [2, 0, 0],
    [
      [
        "Same electron arrangement in the neutral isotopes; both have 14 electrons.",
        1,
      ],
      [
        "Links the same outer-electron arrangement to similar chemical reactions; different neutron counts alone do not explain chemical similarity.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: ["iso-v1-ra-chemistry", "chem-p1h-full-v1-01e"],
      },
    },
  ),
];

const oxygenReference =
  '{"unsharedCentre":"4","centre0":"2","partner0":"2","unsharedPartner0":"4"}';
const structures: ExamPart[] = [
  bonding(
    "2(a)",
    ["1.28", "1.31e"],
    "Construct oxygen's outer electrons",
    "Draw the outer-electron dot-and-cross diagram of O₂, including unshared electrons. Each oxygen starts with six outer electrons; use dots for the left atom and crosses for the right.",
    oxygenReference,
    3,
    [3, 0, 0],
    [
      [
        "Two shared pairs between the atoms: two electrons from each oxygen. Consistent equivalent dot/cross notation is acceptable.",
        1,
      ],
      ["Four unshared electrons (two lone pairs) on the left oxygen.", 1],
      [
        "Four unshared electrons (two lone pairs) on the right oxygen; not extra ionic charges or transferred electrons.",
        1,
      ],
    ],
    "native",
    {
      question: {
        drawCovalent: { molecule: "O2" },
        parts: [
          {
            id: "unsharedCentre",
            label: "Unshared left-oxygen electrons",
            answer: 4,
          },
          {
            id: "centre0",
            label: "Left-oxygen electrons in the bond",
            answer: 2,
          },
          {
            id: "partner0",
            label: "Right-oxygen electrons in the bond",
            answer: 2,
          },
          {
            id: "unsharedPartner0",
            label: "Unshared right-oxygen electrons",
            answer: 4,
          },
        ],
        explanation:
          "O₂ has two shared pairs and two lone pairs on each oxygen. The diagram shows electron origins; all electrons are the same type of particle.",
        exposureAliases: ["cb-v1-p-o2", "cb-v1-ra-oxygen"],
      },
      referenceConstruction: oxygenReference,
    },
  ),
  bonding(
    "2(b)",
    ["1.35", "1.36", "1.37", "1.38"],
    "Compare the two carbon materials",
    "Compare diamond and graphene for a cutting tip and a thin conducting sheet. Explain how their bonding and structures support the contrasting properties and uses.",
    "Both are giant covalent forms of carbon with strong covalent bonds. In diamond each carbon has four covalent neighbours in a rigid three-dimensional network. This makes it hard, supporting a cutting tip; its bonding electrons are localised, so pure diamond does not conduct electricity. Graphene is one atom thick: each interior carbon has three covalent neighbours in a hexagonal sheet, leaving one electron per carbon delocalised. These mobile electrons allow electrical conduction, while strong bonds give the thin sheet high strength. Graphene therefore suits a thin conducting sheet; the diamond hardness explanation is not a description of stacked sliding layers.",
    6,
    [6, 0, 0],
    [],
    "written",
    {
      question: {
        exposureAliases: ["ge-v1-p-compare", "ge-write-v1-ra-contrast"],
      },
      levels: [
        {
          min: 5,
          max: 6,
          text: "A coherent comparison accurately links both structures/bonding accounts to the required uses, including diamond's rigid network/hardness and lack of mobile electrons, and graphene's thin strong sheet/mobile delocalised electrons. Select 5 for a minor omission;6 for a developed accurate comparison. Equivalent relevant explanations are accepted; this is not a compulsory keyword checklist.",
        },
        {
          min: 3,
          max: 4,
          text: "Mostly relevant understanding with useful structure-to-property links, but one material/use or the electrical comparison lacks development or has an important omission. Judge the complete explanation to choose 3 or 4.",
        },
        {
          min: 1,
          max: 2,
          text: "Isolated relevant material properties or structural ideas appear, with limited links to uses. Choose 2 for more developed relevant content,1 for an isolated useful idea.",
        },
        { min: 0, max: 0, text: "No relevant carbon-material comparison." },
      ],
    },
  ),
  bonding(
    "2(c)",
    ["1.32", "1.33"],
    "Infer the likely bonding",
    "Unknown L melts at 800°C and conducts electricity when molten but not when solid. Deduce its likely bonding type and explain the change in conductivity using the GCSE structure models.",
    "The evidence fits an ionic compound. Its charged ions are fixed in the solid lattice but can move and carry charge when molten.",
    2,
    [0, 2, 0],
    [
      [
        "Infers ionic bonding/an ionic lattice from the supplied properties.",
        1,
      ],
      [
        "Explains fixed solid ions versus mobile charge-carrying molten ions; not electrons released by melting.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: ["is-v1-p-evidence", "chem-p1h-full-v1-02d"],
      },
    },
  ),
];

const purity: ExamPart[] = [
  separation(
    "3(a)",
    ["1.43", "1.45b"],
    "Deduce the molecular formula",
    "A compound has empirical formula C₂H₄O and relative molecular mass 88. Deduce its molecular formula, showing the multiplying factor. Relative atomic masses: C=12, H=1, O=16.",
    "Empirical formula mass=2×12+4×1+16=44. The factor is 88/44=2, so double every empirical subscript: C₄H₈O₂.",
    2,
    [0, 2, 0],
    [
      [
        "Calculates empirical mass 44 and factor 88/44=2, or equivalent clear reasoning.",
        1,
      ],
      [
        "Deduces C₄H₈O₂ by multiplying every subscript. A correct formula alone earns this result point, not the required factor point.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  separation(
    "3(b)",
    ["2.10c", "2.11"],
    "Calculate the offset Rf",
    "Coordinates from the paper's bottom: baseline 1.2cm, spot centre 3.9cm, solvent front 6.6cm. Calculate Rf to two decimal places. Show how you measure from the baseline.",
    "0.50",
    3,
    [0, 3, 0],
    [
      [
        "Measures both travels from the baseline: spot2.7cm and front 5.4cm.",
        1,
      ],
      [
        "Divides spot travel by front travel:2.7/5.4=0.5, or consistently evaluates a preceding ratio after an earlier measurement error.",
        1,
      ],
      [
        "Presents the result to two decimal places:0.50 for the correct data. A raw 0.5 does not earn this presentation point; Rf has no unit.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 3,
      question: {
        rounding: { kind: "decimal-places", digits: 2 },
        explanation:
          "Spot travel=3.9−1.2=2.7 cm; solvent travel=6.6−1.2=5.4 cm. Rf=2.7/5.4=0.50 to two decimal places, with no unit.",
      },
    },
  ),
  separation(
    "3(c)",
    ["2.5", "2.6"],
    "Interpret the melting evidence",
    "Pure compound X melts sharply at 117°C. Batch P melts at 117°C; batch Q melts over 111–114°C. Classify each batch's purity and justify from the supplied melting evidence.",
    "P is consistent with pure X because it has the same sharp melting point. Q is impure under the GCSE model: it melts over a range below the pure sample's melting point.",
    2,
    [0, 0, 2],
    [
      [
        "P is consistent with pure X, justified by its matching sharp117°C melting point.",
        1,
      ],
      [
        "Q is impure, justified by the lower melting range; being a mixture does not require two separate fixed melting points.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  separation(
    "3(d)",
    ["2.7a", "2.8", "2.12b", "2.12c"],
    "Recover water for analysis",
    "Describe a supervised school method to recover water with no dissolved salts from saltwater for analysis. Explain why filtration alone is unsuitable.",
    "Use simple distillation: heat the saltwater in a distillation flask, pass the water vapour through a cooled condenser and collect the condensed liquid. The non-volatile dissolved salts remain in the original flask. Filtration alone cannot remove dissolved ions, which pass through the filter with the water.",
    3,
    [3, 0, 0],
    [
      [
        "Chooses distillation to separate the water from non-volatile dissolved salts.",
        1,
      ],
      [
        "Describes vaporising the water and cooling/condensing its vapour into a receiver; evaporation without collecting vapour is incomplete.",
        1,
      ],
      [
        "Explains that dissolved ions pass through filtration, so a filter alone cannot supply the required salt-free analysis water.",
        1,
      ],
    ],
    "written",
    {
      practical: 3,
      question: {
        exposureAliases: [
          "chem-edx-p1f-full-v1-3a",
          "purity-v1-p-distil-draw",
          "purity-v1-cB-structure",
          "purity-v1-rB-structure",
          "water-v1-cA-method",
          "water-v1-r-seawater",
        ],
      },
    },
  ),
];

const acid = author("Acid definitions and core practical", "chemical-changes");
const titration = author("Sodium sulfate titration", "calculations");
const electrolysis = author(
  "Current and deposited-copper evidence",
  "chemical-changes",
);

const acids: ExamPart[] = [
  acid(
    "4(a)",
    ["3.4", "3.5"],
    "Compare the hydrogen-ion concentrations",
    "Two acidic solutions have pH 3.4 and pH 1.4. How many times greater is the hydrogen-ion concentration in the pH 1.4 solution? Show your reasoning.",
    "100",
    2,
    [0, 2, 0],
    [
      ["The difference is 2pH units, with a factor 10 for each unit.", 1],
      [
        "10²=100 times greater, not twice or a factor 2. Allow a consistently evaluated power of 10 following a preceding pH-difference error.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        explanation:
          "The pH gap is 3.4−1.4=2. Each unit represents a factor of 10, so the pH 1.4 solution has 10²=100 times the hydrogen-ion concentration.",
        exposureAliases: ["acid-v1-g-factor"],
      },
    },
  ),
  acid(
    "4(b)",
    ["3.8"],
    "Identify the meaning of strong",
    "Which statement defines a strong acid in aqueous solution?",
    "Its acid molecules are essentially completely ionised",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        exposureAliases: ["acid-v1-p-still-strong"],
        options: [
          "It always has a high total acid concentration",
          "Its acid molecules are essentially completely ionised",
          "It contains no water",
          "It must have pH 0 at every concentration",
        ],
      },
    },
  ),
  acid(
    "4(c)",
    ["3.7", "3.8"],
    "Distinguish weak from dilute",
    "Explain why a weak acid can be concentrated. Use the separate meanings of acid strength and concentration.",
    "Weak describes partial ionisation in water. Concentration describes the total amount of acid per unit solution volume, so a partially ionised acid can still have a high total acid concentration.",
    2,
    [2, 0, 0],
    [
      ["Weak means partial ionisation/dissociation in water.", 1],
      [
        "Concentration is total acid amount per unit volume; high concentration can coexist with partial ionisation. It is not the fraction ionised.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: [
          "acid-v1-p-weak-higher",
          "acid-v1-rb-two",
          "chem-p1h-full-v1-05e",
        ],
      },
    },
  ),
  acid(
    "4(d)",
    ["3.6"],
    "Plan reliable pH readings",
    "For a supervised investigation, measured calcium-oxide portions are added to a fixed volume of dilute HCl. Describe how to obtain reliable pH readings as the added mass increases.",
    "Measure the fixed starting acid volume, use a calibrated pH probe and record the starting pH. Add small known weighed calcium-oxide portions, stir and allow the reading/reaction to settle before recording each pH. Record cumulative added mass, use smaller additions near the rapid pH change and repeat under matched starting conditions. Use the school's eye/skin protection and controls for oxide powder and acid.",
    3,
    [1, 0, 2],
    [
      [
        "Uses a suitable calibrated pH probe/meter and records pH against known cumulative added mass.",
        1,
      ],
      [
        "Stirs and allows each reaction/reading to stabilise before taking the next measurement, rather than reading an unmixed region immediately.",
        1,
      ],
      [
        "Develops one effective reliability/resolution control: smaller weighed increments around the steep change, or repeat matched runs and compare/average appropriate readings. Generic 'be accurate' alone is insufficient.",
        1,
      ],
    ],
    "written",
    { practical: 3 },
  ),
  acid(
    "4(e)",
    ["3.18", "5.9C"],
    "Explain the wet conical flask",
    "A correctly measured acid aliquot is in a conical flask; distilled water rinses its walls. A student claims this dilution requires a larger alkali titre. Evaluate the claim, assuming suitable endpoint behaviour.",
    "The titre is unchanged. Adding distilled water changes the acid concentration but not the number of moles of acid in the measured aliquot, so the same amount of alkali is required.",
    2,
    [0, 0, 2],
    [
      [
        "Rejects the larger-titre claim: no change in the required alkali titre under the stated endpoint assumption.",
        1,
      ],
      [
        "The measured acid amount/moles stay unchanged despite dilution; do not confuse this with rinsing a pipette or burette with water.",
        1,
      ],
    ],
    "written",
    {
      practical: 2,
      question: {
        exposureAliases: ["tech-v1-r-errors", "tech-v1-p-flask-water"],
      },
    },
  ),
];

const titrations: ExamPart[] = [
  titration(
    "5(a)",
    ["3.18", "5.9C"],
    "Read and calculate the titre",
    "Initial reading: 3.15 cm³. Read the shown final meniscus and calculate final−initial to two decimal places. Show both readings and subtraction.",
    "20.60",
    2,
    [0, 0, 2],
    [
      [
        "Reads the final bottom meniscus as23.75 cm³ and uses the supplied initial3.15 cm³.",
        1,
      ],
      [
        "Correct subtraction, presented to two decimal places:23.75−3.15=20.60 cm³. Allow correctly evaluated subtraction of the student's stated readings, with the requested two decimal places; raw 20.6 alone does not earn this point.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 2,
      question: {
        unit: "cm³",
        explanation:
          "The final meniscus is halfway between 23.7 and 23.8, giving 23.75 cm³. Titre=23.75−3.15=20.60 cm³, including the two requested decimal places.",
        rounding: { kind: "decimal-places", digits: 2 },
        buretteScale: {
          top: 23,
          reading: 23.75,
          boundaryDescription:
            "Values increase downwards. The bottom of the meniscus lies halfway between the 23.7 and 23.8 cm³ small marks.",
        },
      },
    },
  ),
  titration(
    "5(b)",
    ["3.16", "3.18", "5.9C"],
    "Plan the pure-salt preparation",
    "Plan a supervised method to prepare pure sodium sulfate crystals from NaOH solution and dilute sulfuric acid. Include reliable quantities, contamination control and recovery with dry crystal surfaces.",
    "Use a pipette/filler to transfer a measured NaOH aliquot to a clean conical flask. Rinse the pipette with NaOH and the burette with the acid; fill the burette jet, remove the filling funnel and take an initial bottom-meniscus reading at eye level. Add a few drops of a suitable acid–alkali indicator. Titrate with acid while swirling, adding dropwise near the endpoint; take the final reading and subtract the initial one. Do a rough titration, then accurate repeats to obtain concordant titres and an appropriate mean. Repeat the matched acid/alkali volumes in clean apparatus without indicator to avoid contamination. Gently concentrate the neutral salt solution with a water bath, then cool to crystallise, filter and dry the crystal surfaces between filter papers. Do not boil the entire solution to dryness or add an unmeasured excess of either soluble reactant.",
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
          text: "A coherent workable route obtains reliable acid/alkali quantities by accurate titration, uses the matched proportions again without indicator, and recovers crystals with dry surfaces by controlled concentration/cooling/separation. Appropriate measurement/endpoint/repeat controls are linked to reliability and purity. Choose 5 for a minor omission,6 for secure completeness; equivalent workable apparatus/steps are accepted.",
        },
        {
          min: 3,
          max: 4,
          text: "Mostly relevant preparation with a clear titration or crystallisation route, but reliable proportions, indicator-free purity or recovery is incompletely developed. Select 3 or 4 from whether the account would reliably produce the requested pure crystals.",
        },
        {
          min: 1,
          max: 2,
          text: "Limited relevant apparatus or steps appear, without a coherent pure-salt route. Award 2 for a developed relevant section,1 for an isolated useful step; merely naming apparatus is not a high-level plan.",
        },
        { min: 0, max: 0, text: "No relevant preparation method." },
      ],
      question: {
        exposureAliases: [
          "tech-v1-p-comparison",
          "tech-v1-p-salt",
          "ss-v1-rb-indicator",
        ],
      },
    },
  ),
  titration(
    "5(c)",
    ["5.8C", "5.10C"],
    "Find the unknown molar concentration",
    "A separate titration uses 20.40 cm³ of 0.120 mol/dm³ H₂SO₄ to neutralise 25.0 cm³ NaOH. H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O. Calculate NaOH concentration to three significant figures. Show working.",
    "0.196",
    3,
    [0, 3, 0],
    [
      [
        "Converts acid volume to 0.02040 dm³ and finds0.120×0.02040=0.002448 mol acid.",
        1,
      ],
      ["Uses the 2:1 ratio: NaOH amount 0.004896 mol, not0.002448 mol.", 1],
      [
        "Divides by 0.0250 dm³:0.19584 mol/dm³, presented as0.196. Allow a consistently evaluated preceding setup after an earlier ratio/conversion error; unsupported final numbers or contradictory working cannot earn full method credit.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 3,
      question: {
        unit: "mol/dm³",
        explanation:
          "Acid amount=0.120×0.02040=0.002448 mol. The 2:1 NaOH:acid ratio gives 0.004896 mol NaOH. Its volume is 0.0250 dm³, so concentration=0.004896/0.0250=0.19584 mol/dm³, or 0.196 to three significant figures.",
        rounding: { kind: "significant-figures", digits: 3 },
      },
    },
  ),
  titration(
    "5(d)",
    ["5.9C"],
    "Calculate the percentage uncertainty",
    "For another titre of 18.70 cm³, each burette reading has uncertainty ±0.05 cm³. Add the two absolute uncertainties, then calculate percentage uncertainty to two significant figures. Show working.",
    "0.53",
    2,
    [0, 2, 0],
    [
      ["Combines both readings' absolute uncertainties:0.05+0.05=0.10 cm³.", 1],
      [
        "Uses0.10/18.70×100=0.534759…%, reported 0.53%. Allow consistent calculation/rounding from the student's preceding absolute uncertainty, with no contradictory denominator.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 2,
      question: {
        unit: "%",
        explanation:
          "Both readings contribute uncertainty: 0.05+0.05=0.10 cm³. Percentage uncertainty=0.10/18.70×100=0.534759…%, reported as 0.53% to two significant figures.",
        rounding: { kind: "significant-figures", digits: 2 },
      },
    },
  ),
  titration(
    "5(e)",
    ["5.9C"],
    "Select the concordant pair",
    "New results/cm³: rough 19.30; accurate 18.05, 18.65, 18.15. Which accurate pair is concordant if the difference must be no greater than 0.10 cm³?",
    "18.05 and 18.15",
    1,
    [0, 0, 1],
    [],
    "choice",
    {
      mathematics: true,
      practical: 1,
      automaticMarks: 1,
      question: {
        options: [
          "18.05 and 18.65",
          "18.05 and 18.15",
          "18.65 and 18.15",
          "19.30 and 18.15",
        ],
        explanation:
          "Use 18.05 and 18.15: their difference is exactly 0.10 cm³ and neither is the rough trial. The 18.65 result is not concordant with either.",
      },
    },
  ),
];

const copperGraph = {
  data: {
    context: "measurement" as const,
    fitKind: "straight" as const,
    showEstimate: false,
    title: "Original fixed-duration current/deposit observations",
    xName: "Current",
    xUnit: "A",
    yName: "Dry copper mass gain",
    yUnit: "g",
    points: [
      [0, 0],
      [0.25, 0.027],
      [0.5, 0.055],
      [0.75, 0.081],
      [1.0, 0.109],
      [1.25, 0.136],
    ] as [number, number][],
    xMin: 0,
    xMax: 1.5,
    xTick: 0.25,
    yMin: 0,
    yMax: 0.16,
    yTick: 0.04,
    targetX: 1.25,
    estimateRange: [0.13, 0.14] as [number, number],
    trend:
      "Approximately proportional dry mass gain as current increases during electrolysis lasting 330 seconds under matched conditions.",
    limit: "suppliedCurrentRange",
    note: "Original illustrative measurements with a 330 s duration and matched solution, electrodes and temperature. No prediction beyond the measured range is required.",
  },
  referenceLine: [0, 0.136] as [number, number],
  note: "Plot the supplied observations and independently position a straight best-fit line. Observations and fit are separate; no estimate is marked.",
};
const copperProposal = emptyFuelDrawing(copperGraph.data);
for (const [i, [x, y]] of copperGraph.data.points.entries()) {
  copperProposal[`p${i}x`] = String(x);
  copperProposal[`p${i}y`] = String(y);
}
copperProposal.c0 = "0";
copperProposal.c5 = "0.136";
const copperReference = JSON.stringify(copperProposal);

const copper: ExamPart[] = [
  electrolysis(
    "6(a)",
    ["3.31"],
    "Construct the current-mass graph",
    "Plot all six supplied current/mass observations. Independently draw a straight best-fit line supported by their scatter. No separate estimate is marked.",
    "Plot(0,0),(0.25,0.027),(0.50,0.055),(0.75,0.081),(1.00,0.109),(1.25,0.136). A balanced fit is mass=0.1088×current; other sensible balanced straight fits are valid. The example balances positive and negative residuals without changing the observations.",
    3,
    [0, 3, 0],
    [
      [
        "All six observations correctly plotted to within half a small square:2 marks; four or five correct:1mark. Judge observation points separately from line anchors.",
        2,
      ],
      [
        "Independent straight fit is supported by the scatter, approximately through the origin and balancing nearby observations. Allow a sensible fit through the student's retained points after a plotting error; reject dot-to-dot joins or unsupported slope/endpoints.",
        1,
      ],
    ],
    "native",
    {
      mathematics: true,
      practical: 3,
      question: { fuelDrawing: copperGraph },
      referenceConstruction: copperReference,
    },
  ),
  electrolysis(
    "6(b)",
    ["3.27", "3.28", "3.29"],
    "Write the cathode half equation",
    "Cu²⁺ ions form copper atoms at the cathode. Independently write the electron half equation. State symbols are optional.",
    "Cu2+ +2e−→Cu",
    2,
    [0, 2, 0],
    [
      [
        "Cu²⁺ is converted to Cu with atoms conserved; no change to formula subscripts.",
        1,
      ],
      [
        "Two electrons are gained on the left, conserving total charge. Accept consistent multiples and equivalent clear charge/arrow notation.",
        1,
      ],
    ],
    "written",
    {
      question: {
        writtenEquations: true,
        writtenEquationKind: "half",
        exposureAliases: ["he-v1-g-cation", "he-v1-p-minimum"],
      },
    },
  ),
  electrolysis(
    "6(c)",
    ["1.50", "1.51c"],
    "Calculate the number of copper atoms",
    "A separate dry copper deposit has mass 95.25 mg. Calculate its number of atoms. Aᵣ(Cu)=63.5; Avogadro constant=6.02×10²³ mol⁻¹. Show the unit conversion and mole calculation.",
    "9.03e20",
    3,
    [0, 3, 0],
    [
      ["Converts 95.25 mg to 0.09525 g.", 1],
      [
        "Finds 0.09525/63.5=0.0015 mol copper, or a consistent preceding mass-to-moles calculation.",
        1,
      ],
      [
        "Multiplies the mole amount by 6.02×10²³ to give9.03×10²⁰atoms. Allow consistent carry-forward after an earlier conversion/division error; a memorised final value with contradictory working is insufficient for full method credit.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        unit: "atoms",
        explanation:
          "95.25 mg=0.09525 g. Copper amount=0.09525/63.5=0.0015 mol. Multiply by the Avogadro constant: 0.0015×6.02×10²³=9.03×10²⁰ atoms.",
      },
    },
  ),
  electrolysis(
    "6(d)",
    ["3.25", "3.30", "3.31"],
    "Compare the two anodes",
    "Compare the anode processes for aqueous copper sulfate with inert electrodes and with copper electrodes. Name what is formed or released from each anode.",
    "With inert electrodes, oxygen gas forms at the positive anode from water/hydroxide ions. With a copper anode, copper atoms lose electrons and enter solution as Cu²⁺ ions, so the anode loses mass.",
    2,
    [0, 2, 0],
    [
      [
        "Inert anode produces oxygen gas in aqueous copper sulfate, not sulfate metal or copper deposition.",
        1,
      ],
      [
        "Copper anode releases Cu²⁺ ions by oxidation/dissolving and loses mass, rather than producing the inert-anode gas.",
        1,
      ],
    ],
    "written",
    { practical: 2, question: { exposureAliases: ["aqp-v1-b-electrodes"] } },
  ),
  electrolysis(
    "6(e)",
    ["3.31"],
    "Measure the deposited mass",
    "After supervised electrolysis, a student weighs a wet cathode and reports its total final mass as the copper deposit. Evaluate this plan, giving the two measurement corrections needed.",
    "The wet cathode retains liquid that wrongly increases its measured mass. Rinse off solution carefully and dry it without losing the copper coating. The total cathode mass includes the original electrode, so subtract its recorded initial dry mass from its final dry mass to isolate the copper gain. Scraping copper off is not an equivalent accurate route.",
    2,
    [0, 0, 2],
    [
      [
        "Identifies retained liquid as an extra mass and corrects the wet-cathode measurement by rinsing/drying without losing the deposit. Scraping off copper is unsuitable.",
        1,
      ],
      [
        "Recognises that final mass includes the original cathode and uses final dry mass minus initial dry mass to isolate the copper gain.",
        1,
      ],
    ],
    "written",
    {
      practical: 2,
      question: { exposureAliases: ["chem-edx-p1f-full-v1-4d"] },
    },
  ),
  electrolysis(
    "6(f)",
    ["1.33", "3.22", "3.24"],
    "Explain ionic conduction",
    "Explain why an ionic electrolyte can carry current when molten but its solid form cannot.",
    "Molten ions can move and carry electrical charge. In a solid ionic lattice the ions are fixed in position, so they cannot carry current through the solid.",
    2,
    [2, 0, 0],
    [
      ["Molten charged ions are mobile and carry current.", 1],
      [
        "Solid lattice ions are fixed; do not attribute ionic conduction to released electrons.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: [
          "is-write-v1-ca-conduction",
          "el-v1-a-write",
          "chem-p1f-full-v1-03c",
        ],
      },
    },
  ),
];

const extraction = author(
  "Iron, redox and extraction decisions",
  "chemical-changes",
);
const quantitative = author(
  "Reactant limits and product efficiency",
  "calculations",
);
const equilibrium = author("Ammonia process decisions", "rates");
const cell = author("Cell and fuel-supply evidence", "energy");

const metals: ExamPart[] = [
  extraction(
    "7(a)",
    ["4.2", "3.27", "3.28"],
    "Write iron's electron change",
    "Iron displaces copper from CuSO₄ solution; the supplied iron product is Fe²⁺. Independently write iron's oxidation half equation. State symbols are optional.",
    "Fe→Fe2+ +2e−",
    2,
    [0, 2, 0],
    [
      ["Fe atoms form Fe²⁺ ions, with the correct species and direction.", 1],
      [
        "Two electrons are lost on the right, conserving total charge. Equivalent clear charge/arrow notation and consistent multiples are accepted.",
        1,
      ],
    ],
    "written",
    {
      question: {
        writtenEquations: true,
        writtenEquationKind: "half",
        exposureAliases: ["he-v1-b-iron-metal"],
      },
    },
  ),
  extraction(
    "7(b)",
    ["4.3", "4.7"],
    "Explain aluminium's extraction route",
    "Explain why carbon reduction is unsuitable for extracting aluminium from aluminium oxide, and name the required extraction method.",
    "Aluminium is more reactive than carbon, so carbon cannot remove its oxygen by the usual reduction route. Aluminium is extracted by electrolysis of a suitable molten electrolyte containing its compound.",
    2,
    [2, 0, 0],
    [
      [
        "Aluminium is above/more reactive than carbon, so carbon cannot reduce its oxide by the usual route.",
        1,
      ],
      [
        "Uses electrolysis of a suitable molten aluminium-containing electrolyte; aqueous electrolysis or merely heating the oxide is unsuitable.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: [
          "chem-edx-p1f-full-v1-6b",
          "me-v1-p-al",
          "me-v1-p-explain-al",
        ],
      },
    },
  ),
  extraction(
    "7(c)",
    ["4.8"],
    "Outline the phytomining feed",
    "Copper-containing plants have grown on low-grade copper land. Describe two stages that produce an aqueous copper-compound solution from those plants for later metal recovery.",
    "Harvest and burn the plants to obtain ash containing copper compounds. Dissolve suitable copper compounds from the ash in acid to produce a copper-ion solution; the ash and solution are not already pure copper metal.",
    2,
    [2, 0, 0],
    [
      [
        "Harvests/burns the plants to obtain ash containing copper compounds, rather than already pure copper metal.",
        1,
      ],
      [
        "Leaches/dissolves suitable compounds from the ash in acid to form an aqueous copper-compound solution for recovery.",
        1,
      ],
    ],
    "written",
    { question: { exposureAliases: ["bio-v1-p-phyto", "bio-v1-cA-phyto"] } },
  ),
  extraction(
    "7(d)",
    ["4.8"],
    "Evaluate the biological routes",
    "A site needs recovered copper within 30 days. Supplied matched estimates per kg recovered copper: phytomining 180 days/6 MJ; bioleaching 25 days/14 MJ. Evaluate a claim that phytomining is always the better choice because it uses less energy.",
    "Bioleaching meets the 30-day deadline whereas the stated phytomining route does not. Phytomining has lower energy demand per kg recovered copper,6 versus14 MJ, but that benefit does not overcome the stated deadline; the data do not justify an always-better claim.",
    2,
    [0, 0, 2],
    [
      [
        "Uses the deadline:25 days meets30 days, while180 days does not, supporting bioleaching for the stated delivery need.",
        1,
      ],
      [
        "Acknowledges phytomining's lower matched energy demand while explaining why energy alone cannot justify the universal claim under the given deadline.",
        1,
      ],
    ],
    "written",
  ),
  extraction(
    "7(e)",
    ["4.1", "4.3"],
    "Deduce the metal order",
    "Distinct metal reactivities: P displaces Q; Q does not displace R; R does not displace P. A student uses only the first result to conclude P>Q>R. Evaluate that conclusion and give the order supported by all results.",
    "Reject P>Q>R: the first test alone does not locate R. All results support P>R>Q. R cannot displace P, so P is more reactive than R; Q cannot displace R, so R is more reactive than Q. P displacing Q is consistent with that order.",
    2,
    [0, 0, 2],
    [
      ["Rejects P>Q>R and gives the supported decreasing order P>R>Q.", 1],
      [
        "Uses two outcome-to-reactivity links that locate R between P and Q; merely repeating that P displaces Q is insufficient to locate R.",
        1,
      ],
    ],
    "written",
  ),
];

const calculations: ExamPart[] = [
  quantitative(
    "8(a)",
    ["1.51a", "1.52", "5.16C", "5.17C"],
    "Find the maximum hydrogen volume",
    "Mg + 2HCl → MgCl₂ + H₂. Supplies: 3.72 g Mg and 0.260 mol HCl. Molar mass of Mg=24 g/mol; gas volume=24 dm³/mol at stated room conditions. Find maximum H₂ volume in cm³, identifying the limiting reactant. Show working.",
    "3120",
    4,
    [0, 4, 0],
    [
      ["Finds Mg amount 3.72/24=0.155 mol.", 1],
      [
        "Identifies HCl as limiting:0.155 mol Mg would require0.310 mol HCl, exceeding0.260 mol. Equivalent possible-H₂ amounts0.155 versus0.130 mol are valid.",
        1,
      ],
      [
        "Uses the limiting amount and 2:1 ratio:0.260/2=0.130 mol H₂. Allow a consistently derived gas amount from a preceding chosen limiting reactant after an earlier error.",
        1,
      ],
      [
        "Uses0.130×24=3.12 dm³=3120 cm³. Appropriate rounding, for example3.1×10³cm³, is accepted with correct working. Allow consistent carry-forward after an earlier limiting/ratio error; contradictory working cannot earn full method credit.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        unit: "cm³",
        explanation:
          "Mg amount=3.72/24=0.155 mol, needing 0.310 mol HCl. Only 0.260 mol HCl is supplied, so HCl limits the reaction. Hydrogen amount=0.260/2=0.130 mol. Volume=0.130×24=3.12 dm³=3120 cm³.",
      },
    },
  ),
  quantitative(
    "8(b)",
    ["5.11C"],
    "Calculate the supplied percentage yield",
    "A separate reaction has theoretical CO₂ volume 3000 cm³ and actually collected volume 2520 cm³ at the same temperature and pressure. Calculate percentage yield and show working.",
    "84",
    2,
    [0, 2, 0],
    [
      ["Uses actual/theoretical×100=2520/3000×100.", 1],
      [
        "Evaluates84%, or consistently evaluates a preceding correctly directed yield fraction after a numerical error; reversing the fraction does not earn the method point.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        unit: "%",
        explanation:
          "Percentage yield=actual/theoretical×100=2520/3000×100=84%. Both gas volumes are compared at the same temperature and pressure.",
      },
    },
  ),
  quantitative(
    "8(c)",
    ["5.13C", "5.14C"],
    "Calculate sodium carbonate's atom economy",
    "For 2NaHCO₃ → Na₂CO₃ + H₂O + CO₂, the desired product is Na₂CO₃. Mᵣ values: NaHCO₃=84, Na₂CO₃=106. Calculate atom economy to three significant figures. Show the coefficient-weighted denominator.",
    "63.1",
    2,
    [0, 2, 0],
    [
      [
        "Uses desired mass 106 over total reactant mass 2×84=168, multiplied by 100.",
        1,
      ],
      [
        "Evaluates106/168×100=63.095…%, presented63.1%. Allow consistent evaluation/rounding after an earlier denominator error; using84 alone cannot earn full credit.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        unit: "%",
        explanation:
          "Coefficient-weighted reactant mass=2×84=168. Desired sodium-carbonate mass=106, so atom economy=106/168×100=63.095…%, or 63.1% to three significant figures.",
        rounding: { kind: "significant-figures", digits: 3 },
      },
    },
  ),
  quantitative(
    "8(d)",
    ["5.12C"],
    "Recall two yield-loss causes",
    "State two distinct chemical or practical reasons why actual product yield can be below theoretical yield.",
    "Any two relevant causes: incomplete reaction; product/reactant lost during separation or transfer; competing unwanted side reactions. Vague 'human error' alone is not a developed cause.",
    2,
    [2, 0, 0],
    [
      [
        "One relevant distinct cause: incomplete reaction, practical material loss or unwanted competing reaction.",
        1,
      ],
      [
        "A second genuinely different relevant cause, not a rewording of the first. Valid concrete examples are accepted.",
        1,
      ],
    ],
    "written",
    { question: { exposureAliases: ["chem-p1f-full-v1-06d"] } },
  ),
];

const ammonia: ExamPart[] = [
  equilibrium(
    "9(a)",
    ["4.14", "4.15"],
    "Explain the continuing equilibrium",
    "For a closed N₂/H₂/NH₃ system at dynamic equilibrium, explain why the concentrations stay constant even though reactions continue.",
    "Forward and reverse reactions continue at equal rates. Each substance is formed and consumed at equal rates, so there is no net concentration change; the different substances need not have equal concentrations.",
    2,
    [2, 0, 0],
    [
      ["Continuing forward/reverse reactions have equal rates.", 1],
      [
        "Equal formation/consumption gives constant concentrations; not stopped reactions or equal concentrations of all substances.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: ["chem-edx-p1f-full-v1-10b", "chem-p2h-full-v1-09f"],
      },
    },
  ),
  equilibrium(
    "9(b)",
    ["4.17b", "5.19C"],
    "Explain the pressure shift",
    "At unchanged temperature, a closed N₂/H₂/NH₃ mixture is compressed. For N₂(g)+3H₂(g)⇌2NH₃(g), predict and explain the equilibrium composition change.",
    "The equilibrium shifts towards ammonia. The product side has fewer gaseous molecules/moles,2 compared with4, so the higher pressure favours that side.",
    2,
    [0, 2, 0],
    [
      [
        "Predicts a shift towards ammonia/increased equilibrium ammonia proportion.",
        1,
      ],
      [
        "Links higher pressure to the fewer-gas-moles side:2 on the right versus4 on the left; not simply 'more collisions' as a position explanation.",
        1,
      ],
    ],
    "written",
    {
      question: { exposureAliases: ["es-v1-p-ammonia", "haber-v1-p-pressure"] },
    },
  ),
  equilibrium(
    "9(c)",
    ["5.20Cd", "5.21Cb"],
    "Separate catalyst rate from yield",
    "Explain what an iron catalyst changes about reaching ammonia equilibrium and what it does not change at fixed temperature and pressure.",
    "The catalyst provides a lower-activation-energy pathway for both directions, so equilibrium is reached sooner. It does not change the equilibrium composition or final ammonia yield at those conditions.",
    2,
    [2, 0, 0],
    [
      [
        "Speeds attainment by accelerating both forward and reverse reactions through lower-activation-energy pathways.",
        1,
      ],
      [
        "Leaves the equilibrium position/final yield unchanged at fixed conditions; faster formation alone does not imply more equilibrium ammonia.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: [
          "re-v1-rb-written",
          "es-v1-rb-catalyst",
          "haber-v1-r-catalyst",
          "chem-p2h-full-v1-09e",
        ],
      },
    },
  ),
  equilibrium(
    "9(d)",
    ["5.21C"],
    "Choose from capacity and yield data",
    "Supplied same-reactor capacity estimates:380°C gives 42% equilibrium yield and 0.8 kg/h output;450°C gives 27% and 2.1 kg/h. Delivery needs at least 2.0 kg/h. Evaluate the temperature choice from these data.",
    "Choose 450°C for the stated capacity requirement:2.1 kg/h meets2.0 kg/h, while0.8 does not. It has the lower equilibrium yield,27% versus42%, but supplies the required output rate; maximum yield alone would not satisfy the delivery constraint.",
    2,
    [0, 0, 2],
    [
      [
        "Uses both output rates and the 2.0 kg/h constraint to support450°C.",
        1,
      ],
      [
        "Recognises the lower equilibrium yield at 450°C and explains the supported rate/yield compromise rather than choosing solely the highest percentage.",
        1,
      ],
    ],
    "written",
  ),
];

const cells: ExamPart[] = [
  cell(
    "10(a)",
    ["5.25C"],
    "Explain primary-cell exhaustion",
    "A primary chemical cell no longer supplies its usual voltage after prolonged use. State the specified chemical cause.",
    "One of its reactants has been used up, so its reaction can no longer continue as designed.",
    1,
    [1, 0, 0],
    [
      [
        "A reactant is depleted/used up; electricity itself is not a stored chemical reactant.",
        1,
      ],
    ],
    "written",
    {
      question: {
        exposureAliases: ["cf-v1-R-primary", "chem-edx-p1f-full-v1-10c"],
      },
    },
  ),
  cell(
    "10(b)",
    ["5.26C"],
    "Identify the new fuel-cell product",
    "What is the only new chemical product of the overall hydrogen–oxygen fuel-cell reaction?",
    "Water",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["Water", "Carbon dioxide", "Nitrogen", "Hydrogen chloride"],
        exposureAliases: ["cf-v1-g-evidence"],
      },
    },
  ),
  cell(
    "10(c)",
    ["5.25C", "5.26C"],
    "Explain continuous fuel-cell operation",
    "Name both reactants that must be supplied to a hydrogen fuel cell, and explain how a continuous feed can keep it operating beyond its initial gas charge.",
    "Supply hydrogen and oxygen. Fresh reactants replace those consumed, so the chemical reaction can continue while both feeds and suitable operating conditions are maintained.",
    2,
    [2, 0, 0],
    [
      ["Names both hydrogen and oxygen, not hydrogen alone.", 1],
      [
        "Explains that fresh reactants replace those consumed and sustain the reaction; the cell does not manufacture its own hydrogen or store an unlimited initial charge.",
        1,
      ],
    ],
    "written",
    { question: { exposureAliases: ["cf-v1-r-feed", "chem-p1f-full-v1-10b"] } },
  ),
  cell(
    "10(d)",
    ["5.27C", "4.12"],
    "Evaluate the matched supply emissions",
    "For the same journey, fuel-supply CO₂ is 2.8 kg using hydrogen route G,18.4 kg using route F, and 3.5 kg using battery electricity. Manufacturing/disposal are unknown. Evaluate 'all hydrogen fuel-cell choices are zero-carbon' using these data.",
    "Neither supplied hydrogen route is zero-carbon on the stated fuel-supply basis: both values are positive. Route G has lower supplied emissions than battery electricity,2.8 versus3.5 kg, while route F is higher at 18.4 kg. A universal claim ignores the production route, and the missing manufacture/disposal data prevent a whole-life zero-carbon conclusion.",
    2,
    [0, 0, 2],
    [
      [
        "Rejects zero fuel-supply carbon using the positive matched hydrogen figures, with a valid comparison showing the production route matters.",
        1,
      ],
      [
        "Distinguishes the supplied journey/fuel basis from whole-life impact and identifies missing manufacture/disposal evidence; an unsupported overall ranking is insufficient.",
        1,
      ],
    ],
    "written",
  ),
];

export const edexcelPaper1HigherFull: ExamPaper = {
  id: "edexcel-paper-1-higher-full",
  totalMarks: 100,
  minutes: 105,
  basis: {
    board: "Edexcel",
    qualification: "1CH0",
    component: "1CH0/1H",
    summary:
      "Pearson Higher Paper 1: key concepts, separation, chemical changes, extraction/equilibria and Separate chemistry 1. Original evidence includes a three-isotope mean, two extended explanations, titration/uncertainty, deposited-copper observations, particles and gas-volume calculations, and industrial decisions.",
    specificationUrl:
      "https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-chemistry-spec.pdf",
    researchPath: "docs/board-mocks/edexcel-1h-basis.md",
  },
  parts: [
    ...particles,
    ...structures,
    ...purity,
    ...acids,
    ...titrations,
    ...copper,
    ...metals,
    ...calculations,
    ...ammonia,
    ...cells,
  ],
};
