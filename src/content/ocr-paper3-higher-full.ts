import type { ExamPaper, ExamPart } from "./exam-paper-types";
import { boardPaperAuthor } from "./board-paper-authoring";
import { emptyFuelDrawing } from "../lib/fuel-drawing";

const author = boardPaperAuthor("chem-ocr-p3h-full-v1-", "higher");
const mc = author("Section A · Multiple choice", "atomic-structure");
const sectionA: ExamPart[] = [
  mc(
    "1",
    ["C1.2d"],
    "Compare particle masses",
    "Which value is closest to an electron's relative mass?",
    "About 1/1836",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: { options: ["Exactly zero", "1", "About 1/1836", "1836"] },
    },
  ),
  mc(
    "2",
    ["C1.2a"],
    "Connect evidence to a model",
    "Which observation in alpha-particle scattering most strongly challenged the plum-pudding model?",
    "A small number of particles were deflected through very large angles",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Every particle stopped in the foil",
          "A small number of particles were deflected through very large angles",
          "All particles travelled in perfect circles",
          "The foil turned into a gas",
        ],
      },
    },
  ),
  mc(
    "3",
    ["C2.2d"],
    "Identify chain bonding",
    "Which bonding holds the atoms together within an ordinary polymer chain?",
    "Covalent",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Metallic",
          "Only intermolecular forces",
          "Ionic in every polymer",
          "Covalent",
        ],
      },
    },
  ),
  mc(
    "4",
    ["C3.1d"],
    "Combine the supplied ions",
    "Barium ions are Ba²⁺ and nitrate ions are NO₃⁻. Which formula gives a neutral compound?",
    "Ba(NO₃)₂",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: { options: ["Ba(NO₃)₂", "Ba₂NO₃", "BaNO₃", "Ba₂(NO₃)₂"] },
    },
  ),
  mc(
    "5",
    ["C2.1d"],
    "Reduce a different atom ratio",
    "A compound has molecular formula C₆H₁₄. What is its empirical formula?",
    "C₃H₇",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["CH₂", "C₆H₁₄", "C₃H₇", "C₇H₃"] },
    },
  ),
  mc(
    "6",
    ["C2.1c"],
    "Include every bracketed atom",
    "Calculate the relative formula mass of Fe₂(SO₄)₃. Relative atomic masses: Fe=56, S=32, O=16.",
    "400",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["208", "400", "304", "176"] },
    },
  ),
  mc(
    "7",
    ["C2.2c"],
    "Locate an electron arrangement",
    "An atom has electron arrangement 2,8,3. Which group and period describe its position?",
    "Group 3, Period 3",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Group 2, Period 8",
          "Group 8, Period 3",
          "Group 3, Period 2",
          "Group 3, Period 3",
        ],
      },
    },
  ),
  mc(
    "8",
    ["C3.3e"],
    "Recognise aqueous neutralisation",
    "Which ionic equation represents neutralisation of an aqueous acid by an alkali?",
    "H⁺ + OH⁻ → H₂O",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "H⁺ + OH⁻ → H₂O",
          "H⁻ + OH⁺ → H₂O",
          "H₂ + O → HO₂",
          "H⁺ + H⁺ → H₂O",
        ],
      },
    },
  ),
  mc(
    "9",
    ["C3.3a"],
    "Recall oxygen reduction",
    "In terms of oxygen, what does reduction mean?",
    "Loss of oxygen",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Gain of oxygen",
          "Gain of heat",
          "Loss of oxygen",
          "Loss of all atoms",
        ],
      },
    },
  ),
  mc(
    "10",
    ["C3.4b"],
    "Recall a molten product",
    "Molten sodium chloride is electrolysed using inert electrodes. What forms at the cathode?",
    "Sodium",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: { options: ["Hydrogen", "Sodium", "Chlorine", "Oxygen"] },
    },
  ),
  mc(
    "11",
    ["C2.3c", "C2.3d"],
    "Identify the relevant attraction",
    "Why does melting graphite require a large energy transfer?",
    "Many strong covalent bonds must be overcome",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "Only weak intermolecular forces must be overcome",
          "Carbon atoms become larger",
          "All its electrons leave their nuclei",
          "Many strong covalent bonds must be overcome",
        ],
      },
    },
  ),
  mc(
    "12",
    ["C3.1i", "C3.1j"],
    "Keep the boundary closed",
    "A reaction releases gas inside a sealed, rigid flask. No matter enters or leaves. How does the total mass of flask and contents change?",
    "It stays the same",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "It stays the same",
          "It decreases because a gas forms",
          "It increases because particles move",
          "It becomes zero when the reaction stops",
        ],
      },
    },
  ),
  mc(
    "13",
    ["C3.3i"],
    "Read the neutral point",
    "Use the supplied pH measurements at 25°C. Which measured volume of added alkali gives a neutral mixture?",
    "20 cm³",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: ["0 cm³", "10 cm³", "20 cm³", "30 cm³"],
        phMeasurements: {
          quantity: "Added alkali volume",
          unit: "cm³",
          points: [
            { amount: 0, ph: 2 },
            { amount: 5, ph: 2.2 },
            { amount: 10, ph: 2.5 },
            { amount: 19, ph: 3.6 },
            { amount: 20, ph: 7 },
            { amount: 21, ph: 10.4 },
            { amount: 30, ph: 11.3 },
            { amount: 40, ph: 11.5 },
          ],
        },
      },
    },
  ),
  mc(
    "14",
    ["C3.2d"],
    "Keep the subtraction direction",
    "For a reaction, breaking bonds requires 1450 kJ and forming bonds releases 1590 kJ. What is the overall energy change for these amounts?",
    "−140 kJ",
    1,
    [0, 1, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      mathematics: true,
      question: { options: ["+140 kJ", "−140 kJ", "+3040 kJ", "−3040 kJ"] },
    },
  ),
  mc(
    "15",
    ["C3.2a"],
    "Follow endothermic transfer",
    "In an endothermic reaction, what is the net direction of energy transfer?",
    "From the surroundings into the reacting system",
    1,
    [1, 0, 0],
    [],
    "choice",
    {
      automaticMarks: 1,
      question: {
        options: [
          "From the system into the surroundings",
          "From atoms into nothing",
          "Always from cold to hot without any other change",
          "From the surroundings into the reacting system",
        ],
      },
    },
  ),
];
const mcTopics = [
  "atomic-structure",
  "atomic-structure",
  "bonding",
  "chemical-changes",
  "quantitative",
  "quantitative",
  "atomic-structure",
  "chemical-changes",
  "chemical-changes",
  "chemical-changes",
  "bonding",
  "quantitative",
  "chemical-changes",
  "energy",
  "energy",
];
sectionA.forEach((part, index) => {
  part.topic = mcTopics[index];
});

const nano = author("Section B · Particle scale and nanomaterials", "bonding");
const nanoparticles: ExamPart[] = [
  nano(
    "16(a)",
    ["C2.3g"],
    "Use the size boundary",
    "Four particles have diameters 0.6 nm, 8 nm, 92 nm and 160 nm. Identify the two nanoparticles and state the size range used.",
    "8 nm and 92 nm; the nanoparticle range is about 1–100 nm.",
    2,
    [1, 0, 1],
    [
      ["Identifies both 8 nm and 92 nm, without including the other two.", 1],
      ["States the 1–100 nm range, not simply the two smallest particles.", 1],
    ],
    "written",
  ),
  nano(
    "16(b)",
    ["C2.3h", "CM2.3vi"],
    "Calculate the six-face ratio",
    "A cube has side length 15 nm. Calculate its surface-area-to-volume ratio as surface area divided by volume. Give a numerical value with units and show both intermediate quantities.",
    "0.40",
    3,
    [1, 2, 0],
    [
      ["Surface area =6×15²=1350 nm², including all six faces.", 1],
      ["Volume =15³=3375 nm³.", 1],
      [
        "1350/3375=0.40 nm⁻¹ (or a correctly stated equivalent); allow consistent evaluation after a preceding geometric error. Do not invert the requested ratio.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "nm⁻¹" } },
  ),
  nano(
    "16(c)",
    ["C2.3i", "C2.3j"],
    "Link a property and a risk",
    "Silver nanoparticles inhibit bacterial growth. Give one reason this can help a wound dressing and one possible risk to human cells that still needs investigation.",
    "Antibacterial action can help control bacteria in the dressing. Possible toxicity or catalysis of unwanted reactions in body cells needs investigation. A high surface-area-to-volume ratio alone is not the named antibacterial effect or proof of safety.",
    2,
    [1, 1, 0],
    [
      [
        "Links bacterial inhibition to reducing wound contamination/infection; merely repeating the supplied property without its benefit is insufficient.",
        1,
      ],
      [
        "A plausible cellular toxicity/harmful-reaction risk; does not claim every nanoparticle is necessarily harmful or safe.",
        1,
      ],
    ],
    "written",
  ),
];
const atom = author(
  "Section B · Atomic structure and scale",
  "atomic-structure",
);
const atoms: ExamPart[] = [
  atom(
    "17(a)",
    ["C1.2b"],
    "Describe the nuclear model",
    "Describe the nucleus, where most atomic mass is concentrated, and the space occupied by the electron region.",
    "The nucleus contains positive protons and neutral neutrons. Most atomic mass lies in this very small nucleus; negatively charged electrons occupy a much larger surrounding region, so most atomic volume is empty space in the nuclear model.",
    3,
    [3, 0, 0],
    [
      [
        "Identifies protons and neutrons in the nucleus, with their appropriate charges.",
        1,
      ],
      ["Most mass is concentrated in the very small nucleus.", 1],
      [
        "Electrons surround it over a much greater volume / most atomic volume is empty space, not a solid positively charged sphere.",
        1,
      ],
    ],
    "written",
  ),
  atom(
    "17(b)",
    ["C1.2e"],
    "Count an isotope ion",
    "A calcium-44 ion has atomic number 20 and charge 2+. Calculate its neutron number and electron number. Label each answer.",
    "24 neutrons and 18 electrons.",
    2,
    [0, 2, 0],
    [
      ["Neutrons =44−20=24.", 1],
      [
        "Electrons =20−2=18; a positive charge means electron loss, not proton gain.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  atom(
    "17(c)",
    ["C1.2c", "CM1.2ii"],
    "Distinguish radius from diameter",
    "Estimate how many typical atoms fit across a 9.6 cm metal strip. Recall a typical atomic radius with units, convert the strip width, and use the atomic diameter. Show working.",
    "A typical radius is about 1×10⁻¹⁰ m, so diameter is about 2×10⁻¹⁰ m. Width 9.6 cm=0.096 m. Number ≈0.096/(2×10⁻¹⁰)=4.8×10⁸ atoms.",
    3,
    [1, 2, 0],
    [
      [
        "Recalls a typical radius about 10⁻¹⁰ m (0.1 nm), with correct units.",
        1,
      ],
      [
        "Makes a correct conversion to common length units, such as 9.6 cm=0.096 m.",
        1,
      ],
      [
        "Divides the width by twice the radius, giving about 4.8×10⁸; allow consistent ECF from an earlier recalled radius or unit error, but not a radius used as a diameter.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
];

const sulfideReference = JSON.stringify({
  dots: "6",
  crosses: "2",
  charge: "-2",
  brackets: "1",
});
const bond = author("Section B · Explain rather than name a bond", "bonding");
const bonds: ExamPart[] = [
  bond(
    "18(a)",
    ["C2.2d", "C2.3d", "C2.3f"],
    "Evaluate three bonding claims",
    "Evaluate these claims using structure and bonding: 'Silica melts easily because it has weak intermolecular forces'; 'Molten MgCl₂ cannot conduct without free electrons'; 'Copper alloys are harder because their bonds are stronger'.",
    "All three explanations are incorrect. Silica has a giant covalent network, so melting requires much energy to overcome many strong covalent bonds; it is not a collection of simple molecules. Molten magnesium chloride contains mobile charged ions, which carry current; free electrons are not required for ionic conduction. In a copper alloy, differently sized atoms distort the regular arrangement and hinder layers sliding, increasing hardness. This is not established simply by saying metallic bonds become stronger. A coherent response identifies each error and links the corrected mechanism to its stated property.",
    6,
    [3, 0, 3],
    [],
    "written",
    {
      levels: [
        {
          min: 1,
          max: 2,
          text: "Some relevant structure/bonding knowledge or a partly corrected claim. An attempted line of reasoning, but explanations remain limited or confused.",
        },
        {
          min: 3,
          max: 4,
          text: "Clear relevant corrections to some claims, with linked structure/property reasoning. At least two mechanisms are substantially understood, but an important gap or error remains; reasoning has some structure.",
        },
        {
          min: 5,
          max: 6,
          text: "Coherently evaluates all three claims, explaining the giant covalent network, mobile ionic charge carriers and disrupted alloy layers. Corrections distinguish the actual mechanisms rather than naming bonds alone. Clear, relevant, substantiated reasoning; use the upper mark for a secure complete response.",
        },
      ],
    },
  ),
  bond(
    "18(b)",
    ["C1.2e", "C2.2e", "C2.2f"],
    "Construct the sulfide ion",
    "Magnesium and sulfur have atomic numbers 12 and 16. Draw the sulfur ion in magnesium sulfide, showing outer electrons, charge and brackets. In Working, give the magnesium ion's charge and full electron arrangement.",
    sulfideReference,
    3,
    [0, 3, 0],
    [
      [
        "Eight outer electrons on sulfur. The reference uses six original dots and two gained crosses; credit a correct all-dot/all-cross or consistently keyed equivalent convention, as permitted by the board's ionic-diagram guidance.",
        1,
      ],
      [
        "Correct 2− sulfur-ion charge outside square brackets; no charge placed inside a nucleus. Both presentation features are needed for this point.",
        1,
      ],
      [
        "Working gives Mg²⁺ with electron arrangement 2,8 (ten electrons). An anion drawing alone does not establish the counter-ion point.",
        1,
      ],
    ],
    "native",
    {
      referenceConstruction: sulfideReference,
      question: {
        drawDotCross: { symbol: "S" },
        parts: [
          { id: "dots", label: "Original S dots", answer: 6 },
          { id: "crosses", label: "Transferred Mg crosses", answer: 2 },
          { id: "charge", label: "Sulfide ion charge", answer: -2 },
          { id: "brackets", label: "Square brackets", answer: 1 },
        ],
        explanation:
          "Sulfur gains two electrons to have eight outer electrons and charge 2−. Magnesium loses two electrons to form Mg²⁺, with arrangement 2,8. The oppositely charged ions form an ionic lattice; they are not a shared-electron molecule.",
      },
    },
  ),
];

const separation = author(
  "Section B · Separation and the limits of evidence",
  "analysis",
);
const separations: ExamPart[] = [
  separation(
    "19(a)",
    ["C2.1i"],
    "Measure from the same origin",
    "Use the supplied calibrated chromatogram to calculate the Rf value of V. Measure from the origin to the spot centre and solvent front. Give three decimal places and show working.",
    "0.625",
    2,
    [1, 1, 0],
    [
      [
        "Uses (58−8)/(88−8)=50/80; distances start at the origin, not the paper bottom.",
        1,
      ],
      [
        "Obtains 0.625 with no unit; allow a consistent evaluation from retained distance-reading errors, without awarding the origin-method point for them.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      practical: 2,
      question: {
        chromatographyGiven: { record: "ocr3hOffset" },
        rounding: { kind: "decimal-places", digits: 3 },
      },
    },
  ),
  separation(
    "19(b)",
    ["C2.1h", "C2.1k"],
    "Judge a cross-solvent match",
    "In a separate investigation U has Rf 0.72 in solvent A. Reference Q has Rf 0.72 in solvent B. A student identifies U as Q from these values. Evaluate the identification and suggest a better comparison.",
    "The identification is not established because Rf depends on the solvent and other chromatographic conditions. Run U and Q together under the same stationary-phase/solvent/temperature conditions; matching positions would support, rather than prove, identity, and another suitable solvent can provide further evidence.",
    2,
    [0, 0, 2],
    [
      [
        "Explains why equal values from different solvents are not a valid identity comparison.",
        1,
      ],
      [
        "Proposes a comparison under matched conditions, preferably co-running unknown and reference; does not claim a single matching spot proves identity or purity.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  separation(
    "19(c)",
    ["C2.1f"],
    "Distinguish two apparatus functions",
    "In fractional distillation, state the separate functions of the fractionating column and the condenser.",
    "The column supports repeated vaporisation and condensation, enriching the more volatile component in vapour reaching the top and improving separation. The condenser cools that vapour into liquid for collection.",
    2,
    [2, 0, 0],
    [
      [
        "Column provides repeated vaporisation/condensation to improve separation; it does not merely store the collected liquid.",
        1,
      ],
      [
        "Condenser cools vapour to liquid for collection; it does not remove dissolved impurities by filtration.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  separation(
    "19(d)",
    ["C2.1a", "C2.1b"],
    "Interpret a melting-range claim",
    "A pure reference melts at 91.0°C. X melts at 90.8–91.2°C; Y melts at 85–89°C. A student says 'X is certainly pure, and Y must be a different pure compound.' Evaluate both claims.",
    "X's narrow range near the reference is consistent with purity but does not prove it. Y's depressed broad range is consistent with an impure sample of the same compound; it does not require a different pure compound.",
    2,
    [0, 0, 2],
    [
      [
        "Uses X's narrow near-reference range as supporting rather than conclusive purity evidence.",
        1,
      ],
      [
        "Uses Y's broad/depressed range to explain an impurity possibility, rejecting the claimed necessary different pure identity.",
        1,
      ],
    ],
    "written",
  ),
];

const coolingDrawing = {
  data: {
    context: "temperature" as const,
    fitKind: "straight" as const,
    independentExtrapolation: true,
    title: "Original post-reaction cooling measurements",
    xName: "Time after mixing",
    xUnit: "s",
    yName: "Temperature",
    yUnit: "°C",
    points: [
      [20, 31.8],
      [40, 31.4],
      [60, 31.0],
      [80, 30.6],
      [100, 30.2],
      [120, 29.8],
    ] as [number, number][],
    xMin: 0,
    xMax: 140,
    xTick: 20,
    yMin: 18,
    yMax: 36,
    yTick: 2,
    targetX: 0,
    estimateRange: [32.0, 32.4] as [number, number],
    trend: "The measured mixture cools over the supplied interval.",
    limit:
      "No temperature at mixing time 0 s is supplied; an extrapolation is model dependent.",
    note: "Original illustrative post-reaction readings begin 20 s after mixing. The straight-line model should be judged against these measurements, not treated as a direct initial reading.",
  },
  note: "The rapid reaction finished before the first supplied reading. Plot every point, choose a separate straight fit and extend it back to mixing time 0 s.",
};
const coolingReference = JSON.stringify({
  ...emptyFuelDrawing(coolingDrawing.data),
  ...Object.fromEntries(
    coolingDrawing.data.points.flatMap(([x, y], i) => [
      [`p${i}x`, String(x)],
      [`p${i}y`, String(y)],
      [`c${i}`, String(y)],
    ]),
  ),
  extensionX: "0",
  estimate: "32.2",
});
const profileReference = JSON.stringify({
  reactant: "80",
  product: "45",
  peak: "175",
  activationArrow: "reactants-peak",
  overallArrow: "reactants-products",
});
const energy = author(
  "Section B · Temperature evidence and energy models",
  "energy",
);
const energies: ExamPart[] = [
  energy(
    "20(a)",
    ["C3.2a", "C7"],
    "Plot and extrapolate the cooling record",
    "Plot all six measurements, draw a separate straight best fit and extend it to mixing time 0 s. Enter your temperature estimate at 0 s. The temperature axis is truncated.",
    "One suitable fit is T=32.2−0.020t over these readings, extrapolating to about 32.2°C at mixing. Other balanced straight fits and consistent intercept readings are valid; no zero-time measurement was supplied.",
    5,
    [1, 3, 1],
    [
      [
        "All six observations within half a small grid square:2 marks; four or five correct:1 mark. Judge observations separately from fit anchors.",
        2,
      ],
      [
        "A separate balanced straight fit represents the declining temperature data, not dot-to-dot joins or a curve forced through the origin.",
        1,
      ],
      [
        "Independently extends that line back to time 0 s; do not award for entering an estimate without constructing the extension.",
        1,
      ],
      [
        "Reads the intercept from the student's own line to the available precision, about 32.2°C for the reference. Allow a consistent reading from a retained mistaken fit.",
        1,
      ],
    ],
    "native",
    {
      mathematics: true,
      practical: 5,
      question: { fuelDrawing: coolingDrawing },
      referenceConstruction: coolingReference,
    },
  ),
  energy(
    "20(b)",
    ["C3.2a", "C7"],
    "Evaluate the intercept's status",
    "A student says 'My extrapolated temperature at mixing is exact because the later readings fit a straight line.' Give two reasons why the claim is too strong.",
    "The estimate is outside the measured interval and assumes the later cooling pattern continues back to mixing. Mixing, the rapid reaction, heat transfer or measurement uncertainty may alter that relationship; a good fit to later observations does not make an unmeasured intercept exact.",
    2,
    [0, 0, 2],
    [
      [
        "Identifies extrapolation outside the measured times and its model assumption.",
        1,
      ],
      [
        "Links a specific uncertainty or possible change near mixing to why the intercept is not an exact measured temperature.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  energy(
    "20(c)",
    ["C3.2a"],
    "Calculate the corrected temperature rise",
    "Before mixing, the solutions were at 20.4°C. Use your own estimated mixing temperature from 20(a) to calculate the temperature rise. Show working; do not substitute a later cooling reading.",
    "11.8",
    2,
    [0, 2, 0],
    [
      [
        "Subtracts 20.4°C from the retained extrapolated mixing temperature, not from a later observed value.",
        1,
      ],
      [
        "Obtains 11.8°C for the reference estimate, or correctly evaluates a consistent retained intercept from 20(a). Do not penalise that same intercept error again.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, practical: 2, question: { unit: "°C" } },
  ),
  energy(
    "20(d)",
    ["C3.2a", "C7"],
    "Improve two features of a method",
    "A student adds magnesium to copper sulfate before taking the starting temperature, uses an uninsulated beaker and waits five minutes for one final reading. Suggest two specific improvements, each linked to its purpose.",
    "Measure the starting solution temperature before adding magnesium to obtain a valid baseline. Use an insulated cup/lid to reduce heat loss, and monitor promptly with stirring to record the maximum rather than a late cooled value. Any two distinct improvements with their purposes are valid.",
    2,
    [0, 0, 2],
    [
      [
        "One valid specific improvement linked to baseline, reduced heat transfer or capturing the peak.",
        1,
      ],
      [
        "A second distinct improvement with its purpose; simply 'repeat' without addressing the stated problems is insufficient.",
        1,
      ],
    ],
    "written",
    { practical: 2 },
  ),
  energy(
    "20(e)",
    ["C3.2b", "C3.2c"],
    "Construct a different energy profile",
    "For a separate reaction, reactants are at 80 kJ, the overall change is−35 kJ and forward activation energy is 95 kJ. Construct the three levels and both arrows. The horizontal axis is reaction progress.",
    profileReference,
    3,
    [1, 2, 0],
    [
      [
        "Reactants 80 kJ and products 45 kJ, from 80−35; products lie below reactants.",
        1,
      ],
      [
        "Peak 175 kJ, from 80+95; activation energy is a difference, not the absolute peak.",
        1,
      ],
      [
        "Activation arrow from reactants to peak and overall arrow from reactants down to products. Both requested spans are correct.",
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
          "For this represented reaction amount, products 80−35=45 kJ and peak 80+95=175 kJ. The activation arrow measures the reactant-to-peak rise; the signed overall change is the reactant-to-product fall.",
      },
    },
  ),
  energy(
    "20(f)",
    ["C3.2d"],
    "Count bonds for the stated amounts",
    "For 2H₂(g)+O₂(g)→2H₂O(g), use mean bond energies H–H=436, O=O=498, O–H=464 kJ/mol. Calculate the total energy change in kJ for 2 mol H₂ reacting with 1 mol O₂. Show every bond count.",
    "-486",
    3,
    [1, 2, 0],
    [
      ["Breaking two H–H and one O=O requires 2×436+498=1370 kJ.", 1],
      ["Forming four O–H releases 4×464=1856 kJ.", 1],
      [
        "Uses breaking minus forming:1370−1856=−486 kJ for the stated equation/amounts. Allow consistent ECF from a single count error, without the corresponding count mark.",
        1,
      ],
    ],
    "scalar",
    { mathematics: true, question: { unit: "kJ" } },
  ),
];

const quant = author(
  "Section B · Equations, limiting amounts and entities",
  "quantitative",
);
const quantities: ExamPart[] = [
  quant(
    "21(a)",
    ["C3.1b", "C3.1f", "C3.3f"],
    "Write the full carbonate reaction",
    "Solid magnesium carbonate reacts with hydrochloric acid solution to form dissolved magnesium chloride, carbon dioxide and water. Write a balanced symbol equation with all state symbols.",
    "MgCO₃(s)+2HCl(aq)→MgCl₂(aq)+CO₂(g)+H₂O(l)",
    3,
    [1, 2, 0],
    [
      [
        "Correct formulae for all five substances, without altering subscripts to balance.",
        1,
      ],
      ["Balanced 1:2:1:1:1 coefficients, or a consistent multiple.", 1],
      [
        "Correct states s,aq,aq,g,l; dissolved magnesium chloride is not labelled liquid or solid.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true, writtenEquationKind: "symbol" } },
  ),
  quant(
    "21(b)",
    ["C3.1h", "C3.1k", "C3.1l"],
    "Test a limiting-reactant claim",
    "4Al+3O₂→2Al₂O₃. Reactants are 5.40 g Al and 3.20 g O₂. Ar:Al=27,O=16. A student claims all aluminium reacts to make 10.2 g Al₂O₃. Calculate the maximum oxide mass and evaluate the claim. Give three significant figures and show working.",
    "Al amount 5.40/27=0.200 mol; O₂ amount 3.20/32=0.100 mol. All aluminium would require 0.150 mol O₂, so oxygen is limiting. Al₂O₃ amount 0.100×2/3=0.066666…mol; formula mass 102, so maximum mass 6.80 g. The 10.2 g claim is false because there is insufficient oxygen for all the aluminium.",
    5,
    [0, 4, 1],
    [
      ["Al amount 0.200 mol.", 1],
      ["O₂ amount 0.100 mol, using molecular mass 32 rather than 16.", 1],
      [
        "Correct 4:3:2 ratio establishes oxygen as limiting and oxide amount 0.066666…mol; allow a consistent ratio method after an earlier amount error.",
        1,
      ],
      [
        "Uses formula mass 102 to obtain 6.80 g to three significant figures; allow consistent correctly rounded ECF with clearly retained earlier amounts.",
        1,
      ],
      [
        "Rejects the 10.2 g/all-aluminium claim using oxygen insufficiency; an unsupported 'wrong' is insufficient.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  quant(
    "21(c)",
    ["C3.1g"],
    "Find a single-atom mass",
    "Calculate the mass of one nickel atom in grams to three significant figures. Ar(Ni)=58.7; Avogadro constant=6.02×10²³mol⁻¹. Show working and use e notation for the final answer.",
    "9.75e-23",
    2,
    [0, 2, 0],
    [
      ["Divides 58.7 g by 6.02×10²³ atoms, not the inverse.", 1],
      [
        "Obtains 9.75×10⁻²³g to three significant figures; equivalent correctly converted units in working are valid. Preserve the exponent and do not round the mass to zero.",
        1,
      ],
    ],
    "scalar",
    {
      mathematics: true,
      question: {
        unit: "g",
        standardForm: "e",
        rounding: { kind: "significant-figures", digits: 3 },
      },
    },
  ),
];

const acid = author(
  "Section B · Acid descriptions and evidence",
  "chemical-changes",
);
const acids: ExamPart[] = [
  acid(
    "22(a)",
    ["C3.3g"],
    "Separate strength and concentration",
    "Explain the difference between a strong acid and a concentrated acid. Do not use the words as synonyms.",
    "Strong describes essentially complete ionisation in water. Concentrated describes a large amount of acid per unit solution volume. A strong acid may be dilute, and a weak acid may be concentrated.",
    2,
    [2, 0, 0],
    [
      [
        "Strong refers to degree of ionisation, not simply a low pH or a large amount.",
        1,
      ],
      [
        "Concentrated refers to amount per volume, independently of degree of ionisation.",
        1,
      ],
    ],
    "written",
  ),
  acid(
    "22(b)",
    ["C3.3i", "C3.3j"],
    "Use a logarithmic change",
    "A solution has pH 3. Its hydrogen-ion concentration is reduced by a factor of 1000 without changing temperature. Calculate the new pH and explain the direction of the change.",
    "The new pH is 6. A 1000-fold fall is three tenfold decreases, so pH increases by 3; reduced hydrogen-ion concentration makes the solution less acidic.",
    2,
    [0, 2, 0],
    [
      ["Recognises three tenfold concentration changes / a pH change of 3.", 1],
      [
        "Increases pH from 3 to6, not decreases it to0; links the direction to fewer hydrogen ions per volume.",
        1,
      ],
    ],
    "written",
    { mathematics: true },
  ),
  acid(
    "22(c)",
    ["C3.3k"],
    "Choose a more precise pH method",
    "Give one reason to use a calibrated pH probe rather than universal-indicator colour to distinguish two solutions with very similar pH.",
    "The probe gives a numerical reading with finer resolution than a subjective broad colour comparison, provided it is calibrated and used correctly.",
    1,
    [1, 0, 0],
    [
      [
        "A specific numerical-resolution / reduced colour-judgement advantage; 'better' or 'safer' alone is insufficient.",
        1,
      ],
    ],
    "written",
    { practical: 1 },
  ),
  acid(
    "22(d)",
    ["C3.3a", "C3.3d", "C3.3f"],
    "Judge two acid reactions",
    "Zn+2HCl→ZnCl₂+H₂; ZnO+2HCl→ZnCl₂+H₂O. A student calls both reactions neutralisation because both use acid. Evaluate this claim using the nature of each reactant and product.",
    "Zinc oxide is a base: its reaction with acid forms salt and water and is neutralisation. Zinc metal reacts with acid to form salt and hydrogen through redox; acid consumption alone does not make a metal a base or the reaction neutralisation.",
    2,
    [0, 0, 2],
    [
      [
        "Identifies the oxide/base reaction as neutralisation, linked to salt and water.",
        1,
      ],
      [
        "Rejects neutralisation for the metal reaction, explaining metal/redox and hydrogen rather than simply 'both contain acid'.",
        1,
      ],
    ],
    "written",
  ),
];

const electro = author(
  "Section B · Electrodes, carriers and a boundary",
  "chemical-changes",
);
const electrolysis: ExamPart[] = [
  electro(
    "23(a)",
    ["C3.1b", "C3.3b", "C3.4d"],
    "Represent cathode electron gain",
    "In an electroplating model, nickel ions Ni²⁺ form nickel metal at the cathode. Write the balanced half equation. State symbols are optional.",
    "Ni²⁺+2e⁻→Ni",
    2,
    [0, 2, 0],
    [
      [
        "Correct species Ni²⁺, electrons and Ni, with electrons on the reactant side.",
        1,
      ],
      [
        "Balances charge and atoms with two electrons per nickel ion; consistent multiples allowed.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true, writtenEquationKind: "half" } },
  ),
  electro(
    "23(b)",
    ["C3.1b", "C3.3b", "C3.4d"],
    "Represent anode electron loss",
    "At the nickel anode, nickel metal forms Ni²⁺ ions. Write the balanced half equation. State symbols are optional.",
    "Ni→Ni²⁺+2e⁻",
    2,
    [0, 2, 0],
    [
      [
        "Correct species Ni, Ni²⁺ and electrons, with electrons among the products.",
        1,
      ],
      [
        "Balances charge and atoms with two electrons released per nickel atom; consistent multiples allowed.",
        1,
      ],
    ],
    "written",
    { question: { writtenEquations: true, writtenEquationKind: "half" } },
  ),
  electro(
    "23(c)",
    ["C2.3f", "C3.4d"],
    "Explain current in the liquid",
    "Explain why an ionic compound can conduct when molten but usually not when solid. Identify the charge carriers in the compound.",
    "Molten ions are free to move and carry charge. In the solid lattice those ions are held at fixed positions, so they cannot provide a sustained current. Electrons moving through the liquid are not the ionic charge-carrier explanation.",
    2,
    [2, 0, 0],
    [
      ["Mobile charged ions in the melt carry current.", 1],
      [
        "Solid-lattice ions cannot move through the structure; not simply 'the solid has no charges'.",
        1,
      ],
    ],
    "written",
  ),
  electro(
    "23(d)",
    ["C3.4c", "C3.4e"],
    "Compare inert and copper anodes",
    "Aqueous copper sulfate is electrolysed. State what happens at an inert anode and at a copper anode.",
    "At an inert anode oxygen gas forms. A copper anode dissolves as copper atoms form Cu²⁺ ions, losing electrons; copper is not an inert conductor in this comparison.",
    2,
    [2, 0, 0],
    [
      ["Oxygen at the inert anode.", 1],
      ["Copper anode dissolves/loses mass as copper ions form.", 1],
    ],
    "written",
    { practical: 2 },
  ),
  electro(
    "23(e)",
    ["C3.1i", "C3.4e"],
    "Test a whole-cell mass conclusion",
    "In an ideal nickel-plating cell, exactly 0.44 g of nickel leaves the anode and the same mass reaches the cathode; no gas or liquid leaves. A student claims the whole cell must lose 0.44 g because the anode gets lighter. Evaluate the claim.",
    "The claim is false. Nickel is transferred within the measured cell boundary: the cathode gains the mass lost by the anode, so whole-cell mass stays unchanged.",
    1,
    [0, 0, 1],
    [
      [
        "Rejects the whole-cell loss by accounting for internal transfer/cathode gain within the stated closed boundary.",
        1,
      ],
    ],
    "written",
    { practical: 1 },
  ),
];

export const ocrPaper3HigherFull: ExamPaper = {
  id: "ocr-paper-3-higher-full",
  totalMarks: 90,
  minutes: 105,
  basis: {
    board: "OCR",
    qualification: "Gateway Science A J248",
    component: "J248/03",
    summary:
      "Gateway Higher Paper 3: C1–C3 and practical skills C7. 15 multiple-choice marks and 75 structured marks include a six-mark critique of bonding explanations, ionic and energy constructions, independent cooling-fit extrapolation, limiting amounts, single-atom mass, pH reasoning and electrode half equations. Original practice, not an official OCR paper.",
    specificationUrl:
      "https://www.ocr.org.uk/Images/234598-specification-accredited-gcse-gateway-science-suite-chemistry-a-j248.pdf",
    researchPath: "docs/board-mocks/ocr-3h-basis.md",
  },
  parts: [
    ...sectionA,
    ...nanoparticles,
    ...atoms,
    ...bonds,
    ...separations,
    ...energies,
    ...quantities,
    ...acids,
    ...electrolysis,
  ],
};

// Earlier prompts and complete references were directly compared before linking.
const priorDisclosures: Record<string, string[]> = {
  "1": ["atom-v2-p-explain"],
  "2": ["am-write-v1-p-scattering"],
  "3": ["ps-write-v1-ca-separate"],
  "8": ["an-v1-r-ions"],
  "9": ["chem-ocr-p1f-full-v1-13", "or-v1-r-loss"],
  "10": ["aqp-v1-p-sodium"],
  "11": ["gr-v1-ca-melting"],
  "12": ["mc-v1-p-closed"],
  "15": ["exothermic-and-endothermic-1"],
  "16(c)": ["chem-ocr-p1f-full-v1-22c"],
  "17(a)": ["atom-v2-p-explain", "atom-v2-w-location", "as-v1-p-explain"],
  "18(b)": ["iso-v1-p-sulfide"],
  "19(b)": ["chromatography-v1-r-reference-conditions"],
  "19(c)": ["purity-v1-p-fractional-method", "chem-edx-p2h-full-v1-5c"],
  "20(d)": ["ep-v1-p-plan", "ep-v1-p-bias"],
  "22(a)": [
    "acid-v1-p-complete",
    "acid-v1-p-weak-higher",
    "chem-edx-p1h-full-v1-4c",
  ],
  "22(d)": ["am-write-v1-p-oxide"],
  "23(c)": [
    "el-v1-a-write",
    "chem-edx-p1h-full-v1-6f",
    "chem-ocr-p1f-full-v1-21c",
  ],
  "23(d)": ["aqp-v1-b-electrodes", "chem-edx-p1h-full-v1-6d"],
};
for (const part of ocrPaper3HigherFull.parts)
  if (priorDisclosures[part.number])
    part.question.exposureAliases = priorDisclosures[part.number];
