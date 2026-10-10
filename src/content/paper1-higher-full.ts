import type { Question } from "./types";
import type { ExamPaper, ExamPart, PaperCriterion } from "./exam-paper-types";

const prefix = "chem-p1h-full-v1-";
const criteria = (rows: [string, number][]): PaperCriterion[] =>
  rows.map(([text, marks], i) => ({ id: `point-${i + 1}`, text, marks }));
function question(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  extra: Partial<Question> = {},
): Question {
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    prompt,
    answer,
    explanation: answer,
    hint: "Answer independently. Review the criteria after submitting the paper.",
    ...extra,
  };
}
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  points: string[],
  extra: Partial<Question> = {},
): Question {
  return question(id, title, prompt, answer, {
    rubric: points,
    referenceResponse: answer,
    ...extra,
  });
}
function part(
  number: string,
  context: string,
  topic: string,
  specification: string[],
  q: Question,
  marks: number,
  ao: [number, number, number],
  automaticMarks: number,
  review: [string, number][],
  extra: Partial<ExamPart> = {},
): ExamPart {
  return {
    number,
    context,
    topic,
    specification,
    question: q,
    marks,
    ao,
    automaticMarks,
    criteria: criteria(review),
    ...extra,
  };
}

// Individually authored original cumulative items, reserved from lesson banks.
// The actual 2023 Higher Paper 1 and paired final scheme were read completely;
// their demands inform this paper, but their questions/data are not copied.
const atoms: ExamPart[] = [
  part(
    "1(a)",
    "Atomic evidence and isotopes",
    "atomic-structure",
    ["4.1.1.3"],
    written(
      "01a",
      "Evaluate the scattering claim",
      "Most alpha particles passed through thin gold foil; a very small proportion turned through large angles. A student claims this means each atom is a solid ball. Use both observations to evaluate the claim.",
      "The claim is not supported. Most particles passed through, indicating that most of the atom is empty space. Rare large deflections indicate that its mass and positive charge are concentrated in a very small central nucleus, rather than spread throughout a solid ball.",
      [
        "Most of the atom is empty space.",
        "A very small concentrated nucleus explains the rare large deflections.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Rejects the solid-ball inference by connecting most particles passing through with most of the atom being empty space.",
        1,
      ],
      [
        "Connects rare large deflections with mass/positive charge concentrated in a very small nucleus, rather than throughout the atom.",
        1,
      ],
    ],
  ),
  part(
    "1(b)",
    "Atomic evidence and isotopes",
    "atomic-structure",
    ["4.1.1.6"],
    question(
      "01b",
      "Calculate the isotope average",
      "A copper sample contains 68.0% copper-63 and 32.0% copper-65. Calculate its relative atomic mass to 1 decimal place. Show your working.",
      "63.6",
      {
        inputMode: "decimal",
        tolerance: 0.005,
        explanation:
          "(63 × 68.0 + 65 × 32.0) ÷ 100 = 63.64, which rounds to 63.6 to one decimal place.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      [
        "Uses both abundances in a weighted mean, for example (63 × 68.0 + 65 × 32.0) ÷ 100. Equivalent fraction methods are valid.",
        1,
      ],
      [
        "Obtains the weighted value 63.64 before rounding. A correct later result may imply valid earlier calculation when no contradictory working is present; do not demand a mechanically copied sequence.",
        1,
      ],
      [
        "Shows the result rounded to exactly one decimal place. Review the retained answer/working: numerical equivalence alone does not prove the requested presentation. Allow correct rounding of a preceding incorrect weighted result using both supplied abundances.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "1(c)",
    "Atomic evidence and isotopes",
    "atomic-structure",
    ["4.1.1.3"],
    written(
      "01c",
      "Compare the two atomic models",
      "Describe two differences between the plum pudding model and the nuclear model of an atom. Refer to the positive charge and to the electrons.",
      "In the plum pudding model positive charge is spread through a ball with electrons embedded in it. In the nuclear model positive charge is concentrated in a small central nucleus, with electrons outside that nucleus.",
      [
        "Spread positive charge versus a concentrated positive nucleus.",
        "Embedded electrons versus electrons outside the nucleus.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Compares spread positive charge in the plum pudding model with concentrated positive charge in a small nucleus.",
        1,
      ],
      [
        "Compares electrons embedded in the positive ball with electrons outside the nucleus.",
        1,
      ],
    ],
  ),
  part(
    "1(d)",
    "Atomic evidence and isotopes",
    "atomic-structure",
    ["4.1.1.7", "4.1.2.4", "4.2.1.2"],
    written(
      "01d",
      "Identify the matching noble gas",
      "Calcium has atomic number 20. Name the noble gas whose neutral atoms have the same electronic structure as Ca²⁺ ions.",
      "Argon: Ca²⁺ has 18 electrons, arranged 2,8,8.",
      ["Argon or Ar."],
      { shortWritten: true },
    ),
    1,
    [0, 1, 0],
    0,
    [
      [
        "Argon or Ar. Calcium loses two electrons to form Ca²⁺, leaving the 18-electron arrangement 2,8,8.",
        1,
      ],
    ],
  ),
  part(
    "1(e)",
    "Atomic evidence and isotopes",
    "atomic-structure",
    ["4.1.1.5", "4.1.1.7"],
    written(
      "01e",
      "Explain the isotope similarity",
      "Copper-63 and copper-65 have similar chemical properties. State what makes them isotopes and explain their chemical similarity in terms of electrons.",
      "They have the same number of protons but different numbers of neutrons. Their neutral atoms have the same electronic structure, including the same outer-electron arrangement, so they behave similarly in chemical reactions.",
      [
        "Same proton count and different neutron count.",
        "Same electronic structure explains chemical similarity.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Both the same proton count and different neutron counts are stated. Different mass alone does not define isotopes.",
        1,
      ],
      [
        "Connects the same electronic/outer-electron arrangement with similar chemical reactions.",
        1,
      ],
    ],
  ),
];

const bonding: ExamPart[] = [
  part(
    "2(a)",
    "Bonding and charge transport",
    "bonding",
    ["4.2.1.4"],
    question(
      "02a",
      "Construct the outer-electron diagram",
      "Construct a dot-and-cross diagram for one hydrogen chloride molecule, HCl. Show all outer electrons, including the non-bonding electrons.",
      '{"unsharedCentre":"6","centre0":"1","partner0":"1","unsharedPartner0":"0"}',
      {
        drawCovalent: { molecule: "HCl" },
        parts: [
          {
            id: "unsharedCentre",
            label: "Non-bonding electrons on Cl",
            answer: 6,
          },
          {
            id: "centre0",
            label: "Cl electrons contributed to the shared region",
            answer: 1,
          },
          {
            id: "partner0",
            label: "H electrons contributed to the shared region",
            answer: 1,
          },
          {
            id: "unsharedPartner0",
            label: "Non-bonding electrons on H",
            answer: 0,
          },
        ],
        explanation:
          "One electron from H and one from Cl form the shared pair. Cl has six further outer electrons; H has no non-bonding electrons. Dots/crosses may be reversed consistently.",
      },
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "A shared pair in the overlap/bonding region, with one electron contributed by each atom. Consistent reversed dot/cross conventions are valid.",
        1,
      ],
      [
        "Six non-bonding outer electrons on Cl and none on H, with no extra atoms/electrons.",
        1,
      ],
    ],
  ),
  part(
    "2(b)",
    "Bonding and charge transport",
    "bonding",
    ["4.2.2.4", "4.2.2.5"],
    written(
      "02b",
      "Explain the different physical states",
      "Methane is a gas but poly(ethene) is a solid at room temperature. Explain this difference using the size of their molecules and the forces between them.",
      "Poly(ethene) has much larger molecules than methane. The forces between polymer molecules are stronger, so more energy is needed to overcome them. Poly(ethene) therefore remains solid at temperatures at which methane is a gas. Melting overcomes intermolecular forces; it does not break the covalent bonds within the polymer molecules.",
      [
        "Polymer molecules are much larger.",
        "Stronger intermolecular forces.",
        "More energy is required to overcome them.",
      ],
    ),
    3,
    [3, 0, 0],
    0,
    [
      ["Compares large polymer molecules with small methane molecules.", 1],
      [
        "Connects the size difference with stronger intermolecular forces in the polymer. Do not accept stronger covalent bonds as the reason.",
        1,
      ],
      [
        "Connects stronger intermolecular forces with more energy needed to overcome them and the higher temperature required for a change of state. Do not credit a claim that boiling breaks the intramolecular covalent framework.",
        1,
      ],
    ],
  ),
  part(
    "2(c)",
    "Bonding and charge transport",
    "bonding",
    ["4.2.2.8"],
    written(
      "02c",
      "Identify the mobile charge carriers",
      "Name the charged particles that move through solid copper when it conducts electricity.",
      "Delocalised electrons.",
      ["Delocalised/free electrons."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Delocalised/free electrons. Copper ions are not the moving charge carriers in the solid metal.",
        1,
      ],
    ],
  ),
  part(
    "2(d)",
    "Bonding and charge transport",
    "bonding",
    ["4.2.2.3", "4.2.2.4"],
    written(
      "02d",
      "Infer the two structures",
      "Substance A melts at −82°C and does not conduct when liquid. Substance B melts at 720°C, conducts when liquid and does not conduct when solid. Identify the most likely structure of each: small molecular or ionic.",
      "A is small molecular; B is ionic. A has a low melting point and no mobile charged particles. B has strong electrostatic attractions and ions that can move when molten but are fixed in its solid lattice.",
      ["A: small molecular.", "B: ionic."],
      { shortWritten: true },
    ),
    2,
    [0, 2, 0],
    0,
    [
      ["A: small molecular.", 1],
      ["B: ionic.", 1],
    ],
  ),
  part(
    "2(e)",
    "Bonding and charge transport",
    "bonding",
    ["4.2.4.1", "4.2.4.2"],
    written(
      "02e",
      "Evaluate the coating proposal",
      "A coating works by contact at the particle surface. A supplier proposes much smaller particles of the same material and claims that less material will always be sufficient and that it must be safe. Evaluate these claims.",
      "Smaller particles have a higher surface-area-to-volume ratio, so less material may give the same surface effect. That does not prove every application will work or that it is safe: nanoparticle behaviour and exposure can differ, so suitable effectiveness and safety evidence is needed.",
      [
        "Higher surface-area-to-volume ratio supports a possible saving.",
        "Size alone does not establish safety/effectiveness; appropriate evidence is required.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Connects smaller particles with greater surface-area-to-volume ratio and a possible reduction in the amount needed for the same surface effect; does not treat this as an unconditional guarantee.",
        1,
      ],
      [
        "Rejects the inference that smaller automatically means safe, explaining a relevant need for evidence about exposure/behaviour or safety for this use.",
        1,
      ],
    ],
  ),
];

const thermal: ExamPart[] = [
  part(
    "3(a)",
    "Fresh neutralisation temperature trials",
    "energy",
    ["4.5.1.1"],
    written(
      "03a",
      "Identify the measured variables",
      "A student changes the volume of sodium hydroxide solution used in fresh neutralisation trials and measures the highest temperature reached. Name the independent and dependent variables.",
      "Independent: volume of sodium hydroxide solution used. Dependent: highest temperature reached by the reaction mixture.",
      [
        "Independent: volume of sodium hydroxide solution.",
        "Dependent: highest temperature reached.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Volume of sodium hydroxide solution used, not simply the name of a reactant.",
        1,
      ],
      [
        "Highest temperature reached, or a clearly defined rise from the matched initial temperature.",
        1,
      ],
    ],
    { practical: 4 },
  ),
  part(
    "3(b)",
    "Fresh neutralisation temperature trials",
    "energy",
    ["4.5.1.1"],
    written(
      "03b",
      "Plot, fit and extrapolate",
      "Plot all six observations and construct a balanced straight best-fit line. Extend your line to volume zero and enter the corresponding initial-temperature estimate. Keep observations and fit distinct.",
      "One suitable line is T = 21.4 + 0.137V. Extrapolating it to V = 0 gives about 21.4°C. Other balanced fits can be valid; the intercept is an estimate outside the measured volumes, not a measured zero-volume trial.",
      [
        "All six original points plotted accurately.",
        "Balanced straight best-fit line.",
        "Extrapolation to zero volume and its temperature estimate.",
      ],
      {
        fuelDrawing: {
          data: {
            title: "Original neutralisation observations",
            context: "temperature",
            fitKind: "straight",
            independentExtrapolation: true,
            xName: "Volume of alkali",
            xUnit: "cm³",
            yName: "Highest temperature",
            yUnit: "°C",
            points: [
              [5, 22.1],
              [10, 22.8],
              [15, 23.5],
              [20, 24.1],
              [25, 24.8],
              [30, 25.5],
            ],
            xMin: 0,
            xMax: 35,
            xTick: 5,
            yMin: 20,
            yMax: 28,
            yTick: 1,
            targetX: 0,
            estimateRange: [21.2, 21.6],
            trend:
              "Highest temperature increases with alkali volume over these trials.",
            limit:
              "No zero-volume trial was measured; the intercept is an extrapolated estimate.",
            note: "One suitable reference is T = 21.4 + 0.137V; judge other balanced straight fits against the original observations.",
          },
          referenceLine: [22.085, 25.51],
          note: "Original illustrative fresh trials: each selected volume of 1.0 mol/dm³ NaOH is diluted with water to 50 cm³, then mixed with 50 cm³ of 1.0 mol/dm³ HCl. Acid remains in excess. Total liquid volume, initial temperature, insulated cup, stirring and peak-temperature procedure are matched. The printed temperature scale is truncated, not zero-based.",
        },
      },
    ),
    5,
    [0, 3, 2],
    0,
    [
      [
        "All six original observations within half a small grid square: 2 marks; four or five accurate points: 1 mark. Judge the supplied coordinates, not closeness to the student's line.",
        2,
      ],
      [
        "A balanced straight best-fit line through the scatter; an arbitrary point-to-point join is insufficient. Do not require the single suggested reference line.",
        1,
      ],
      [
        "The chosen best-fit line is extended to the y-axis at zero alkali volume, preserving its direction rather than bending it to a chosen temperature.",
        1,
      ],
      [
        "The entered initial-temperature estimate agrees with the intersection of the student's valid extrapolated line and the y-axis, within half a small temperature square. About 21.4°C is suitable for the suggested fit, but do not impose that number on every valid fit.",
        1,
      ],
    ],
    { mathematics: true, practical: 4 },
  ),
  part(
    "3(c)",
    "Fresh neutralisation temperature trials",
    "energy",
    ["4.3.1.4", "4.5.1.1"],
    question(
      "03c",
      "Calculate the repeat uncertainty",
      "Four fresh repeat trials give highest temperatures of 24.6, 24.8, 25.0 and 24.8°C. Give the mean and the uncertainty estimated as half the range.",
      '{"mean":"24.8","uncertainty":"0.2"}',
      {
        parts: [
          { id: "mean", label: "Mean temperature / °C", answer: 24.8 },
          {
            id: "uncertainty",
            label: "Half-range uncertainty / °C",
            answer: 0.2,
          },
        ],
        explanation:
          "Mean = (24.6 + 24.8 + 25.0 + 24.8) ÷ 4 = 24.8°C. Half the range = (25.0 − 24.6) ÷ 2 = 0.2°C, giving 24.8 ±0.2°C for this estimate of repeat spread.",
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      ["Mean 24.8°C from all four repeats.", 1],
      [
        "Half-range uncertainty 0.2°C. This estimates repeat spread and does not by itself include every possible systematic error.",
        1,
      ],
    ],
    { mathematics: true, practical: 4 },
  ),
  part(
    "3(d)",
    "Fresh neutralisation temperature trials",
    "energy",
    ["4.5.1.1"],
    written(
      "03d",
      "Keep the total volume matched",
      "A different student varies the alkali volume but adds no water to compensate, changing the total liquid volume. Suggest one change that keeps total volume matched while varying alkali volume.",
      "Add enough water to make the alkali-plus-water portion the same total volume for every trial, then add the same acid volume. For example, make the alkali portion up to 50 cm³ each time.",
      ["Compensate with water so each trial has the same total liquid volume."],
      { shortWritten: true },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Adjust the water volume to compensate for the changed alkali volume, making a fixed alkali-plus-water volume before adding the same acid volume. Do not merely claim that the alkali volume itself should be fixed.",
        1,
      ],
    ],
    { practical: 4 },
  ),
];

const salts: ExamPart[] = [
  part(
    "4(a)",
    "Preparing zinc sulfate crystals",
    "chemical-changes",
    ["4.4.2.2", "4.4.2.3"],
    written(
      "04a",
      "Plan the complete crystal preparation",
      "Plan a logically ordered supervised school method to make pure, dry zinc sulfate crystals from insoluble zinc carbonate and a suitable dilute acid. Name the acid and include apparatus, separation and heating stages.",
      "Use dilute sulfuric acid in a beaker, warmed gently as appropriate. Add zinc carbonate in small portions while stirring until no more reacts and excess solid remains. Filter through filter paper in a funnel, collecting the zinc sulfate solution as the filtrate. Concentrate the filtrate gently in an evaporating basin using a water bath or electric heater; do not boil it to complete dryness. Leave it to cool so crystals form, separate the crystals from the remaining solution and pat them dry with filter paper. Use the school's controls for acid and hot apparatus.",
      [
        "Sulfuric acid with zinc carbonate to excess.",
        "Filter off unreacted carbonate and retain the filtrate.",
        "Controlled concentration, cooling/crystallisation, recovery and drying.",
        "Judge the complete method and its sequence, not a keyword tally.",
      ],
      { exposureAliases: ["chem-p1f-full-v1-07b"] },
    ),
    6,
    [6, 0, 0],
    0,
    [],
    {
      practical: 1,
      levels: [
        {
          min: 5,
          max: 6,
          text: "A chemically valid, logically ordered method would produce pure, dry crystals. Appropriate acid, reaction to excess, filtration retaining the salt solution, controlled concentration, cooling/crystallisation and recovery/drying are linked. Use 6 for a secure complete method or 5 for a minor omission that does not invalidate its outcome.",
        },
        {
          min: 3,
          max: 4,
          text: "Most relevant stages are present, but a missing stage or sequencing/chemical error makes pure, dry crystals unreliable. Choose 3 or 4 by the overall coherence and effectiveness of the method.",
        },
        {
          min: 1,
          max: 2,
          text: "Some relevant operations are named, but they do not form a workable complete preparation. Use 2 for a more developed relevant account or 1 for limited relevant content.",
        },
        { min: 0, max: 0, text: "No relevant content." },
      ],
    },
  ),
  part(
    "4(b)",
    "Preparing zinc sulfate crystals",
    "chemical-changes",
    ["4.1.1.1", "4.4.2.2"],
    written(
      "04b",
      "Write the complete salt equation",
      "Write a balanced symbol equation for zinc carbonate reacting with sulfuric acid to make zinc sulfate. Include every product; state symbols are not required.",
      "ZnCO3 + H2SO4 → ZnSO4 + CO2 + H2O",
      ["All correct reactant/product formulae.", "Complete balanced equation."],
      { writtenEquations: true, writtenEquationKind: "symbol" },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Correct reactants ZnCO3/H2SO4 and products ZnSO4/CO2/H2O, with no substituted formulae or omitted product.",
        1,
      ],
      [
        "The complete equation conserves every element; the simplest coefficients are all 1. Accept consistent whole-number multiples. Do not balance by changing chemical subscripts.",
        1,
      ],
    ],
  ),
  part(
    "4(c)",
    "Preparing zinc sulfate crystals",
    "chemical-changes",
    ["4.4.2.3"],
    written(
      "04c",
      "Diagnose the filtration error",
      "After reacting to excess and filtering, a student discards the filtrate and keeps the solid on the filter paper to make zinc sulfate crystals. Explain the error and how to correct it.",
      "The residue is mainly excess insoluble zinc carbonate, not the dissolved zinc sulfate. Keep the filtrate containing zinc sulfate solution, then concentrate it and cool it to crystallise the salt.",
      [
        "The residue is the excess insoluble carbonate.",
        "Retain/concentrate/crystallise the dissolved salt in the filtrate.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Explains that the retained residue is the excess insoluble reactant, not the dissolved sulfate product.",
        1,
      ],
      [
        "Corrects the route by retaining the filtrate containing the salt solution for concentration/cooling to crystallise.",
        1,
      ],
    ],
    { practical: 1 },
  ),
];

const acids: ExamPart[] = [
  part(
    "5(a)",
    "Acid strength and quantitative titration",
    "chemical-changes",
    ["4.4.2.6"],
    written(
      "05a",
      "Define a weak acid",
      "What does weak acid mean in terms of ionisation in water?",
      "A weak acid is only partially ionised in aqueous solution.",
      ["Only partially ionised in aqueous solution."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Only partially ionised in aqueous solution. Low concentration alone does not define a weak acid.",
        1,
      ],
    ],
  ),
  part(
    "5(b)",
    "Acid strength and quantitative titration",
    "chemical-changes",
    ["4.3.4", "4.4.2.5"],
    question(
      "05b",
      "Calculate the acid concentration",
      "25.0 cm³ of 0.160 mol/dm³ KOH is neutralised by 18.6 cm³ of H2SO4. The equation is H2SO4 + 2 KOH → K2SO4 + 2 H2O. Calculate the acid concentration in mol/dm³ to 3 significant figures. Show your working.",
      "0.108",
      {
        unit: "mol/dm³",
        inputMode: "decimal",
        tolerance: 0.0005,
        explanation:
          "Moles KOH =0.160 × 25.0/1000 =0.00400. Moles H2SO4 =0.00400/2 =0.00200. Concentration =0.00200/(18.6/1000) =0.1075268817 mol/dm³, giving 0.108 mol/dm³ to 3 significant figures. Numerical equivalence does not prove the requested rounding/presentation.",
      },
    ),
    5,
    [0, 5, 0],
    0,
    [
      [
        "Finds 0.00400 mol KOH using 25.0 cm³ = 0.0250 dm³ and the supplied concentration. An equivalent direct-ratio method can earn the corresponding method credit.",
        1,
      ],
      [
        "Uses the 2 KOH:1 H2SO4 mole ratio, obtaining 0.00200 mol acid. Allow valid use of an earlier incorrectly calculated amount.",
        1,
      ],
      [
        "Divides acid amount by 18.6/1000 dm³; allow correct use of an earlier incorrect acid amount. Equivalent proportional methods are valid.",
        1,
      ],
      [
        "Obtains the numerical concentration 0.1075268817… mol/dm³ before final rounding. A correct later value can imply valid earlier stages when working contains no contradiction.",
        1,
      ],
      [
        "Presents the concentration to exactly 3 significant figures, 0.108. Review the actual retained answer/working, not merely the parser's numerical value; 0.1080 has 4 significant figures. Allow correctly rounding a preceding incorrect result from a calculation using all supplied data.",
        1,
      ],
    ],
    { mathematics: true, practical: 2 },
  ),
  part(
    "5(c)",
    "Acid strength and quantitative titration",
    "chemical-changes",
    ["4.4.2.5"],
    written(
      "05c",
      "Specify the indicator change",
      "The acid is added from a burette to KOH in the flask. Name a suitable indicator and state its colour change at the end point.",
      "Phenolphthalein changes from pink to colourless. Alternatively, methyl orange changes from yellow to orange at its end point.",
      [
        "Suitable indicator.",
        "Correct alkaline-to-end-point colour change for that indicator.",
      ],
      { shortWritten: true },
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "A suitable named indicator, for example phenolphthalein or methyl orange; accept other scientifically suitable indicators. Alternatively allow this one point, but not the second, for universal indicator accompanied by a reasonable alkaline-to-neutral colour change; this partial-credit alternative does not make it a precise titration indicator.",
        1,
      ],
      [
        "Corresponding change: phenolphthalein pink→colourless, or methyl orange yellow→orange at its end point. Colour-change credit requires a matching suitable named indicator; do not accept universal indicator as a precise titration end-point choice.",
        1,
      ],
    ],
    { practical: 2 },
  ),
  part(
    "5(d)",
    "Acid strength and quantitative titration",
    "chemical-changes",
    ["4.4.2.6"],
    question(
      "05d",
      "Apply the pH concentration factor",
      "An acid solution at pH 4 has a hydrogen-ion concentration of 1.0 × 10⁻⁴ mol/dm³. Find the hydrogen-ion concentration at pH 2. Explain the factor you used in your working.",
      "0.01",
      {
        unit: "mol/dm³",
        inputMode: "decimal",
        tolerance: 0.000001,
        explanation:
          "A decrease of one pH unit multiplies hydrogen-ion concentration by 10. Decreasing pH by two units gives a factor of 100:1.0 × 10⁻⁴ × 100 =1.0 × 10⁻² mol/dm³ =0.01 mol/dm³.",
      },
    ),
    2,
    [1, 1, 0],
    1,
    [
      [
        "Explains that each one-unit pH decrease multiplies [H+] by 10, so a two-unit decrease gives a factor of 100. Do not treat the pH number itself as a concentration ratio.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "5(e)",
    "Acid strength and quantitative titration",
    "chemical-changes",
    ["4.4.2.6"],
    written(
      "05e",
      "Evaluate the dilution claim",
      "A student says adding water to hydrochloric acid turns it into a weak acid because the pH rises. Evaluate this claim using the meanings of concentration and acid strength.",
      "Adding water makes the acid more dilute: less acid is present per unit volume. Acid strength concerns the fraction ionised, not concentration. Hydrochloric acid remains a strong acid because it is essentially completely ionised in water; the higher pH does not show that it has become weak.",
      [
        "Dilution lowers amount per unit volume.",
        "Strength is degree of ionisation; diluted HCl remains strong.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Identifies the lower amount/concentration per unit volume after adding water.",
        1,
      ],
      [
        "Rejects the strength inference by distinguishing degree of ionisation from concentration and explaining that aqueous HCl remains essentially fully ionised.",
        1,
      ],
    ],
  ),
];

const electrolysis: ExamPart[] = [
  part(
    "6(a)",
    "Electrode reactions and collected gases",
    "chemical-changes",
    ["4.4.3.3", "4.4.3.5"],
    written(
      "06a",
      "Write and interpret the cathode equation",
      "In aluminium extraction, Al³⁺ ions form aluminium at the negative electrode. Write the complete balanced half equation and explain why this is reduction.",
      "Al³⁺ + 3 e⁻ → Al. The aluminium ion gains electrons, so it is reduced.",
      [
        "Aluminium-ion/metal half equation.",
        "Three electrons gained.",
        "Reduction is gain of electrons.",
      ],
      { writtenEquations: true, writtenEquationKind: "half" },
    ),
    3,
    [1, 2, 0],
    0,
    [
      [
        "Al³⁺ as reactant and Al as product, conserving aluminium with the correct species/charge.",
        1,
      ],
      [
        "Three electrons on the reactant side, giving Al³⁺ + 3e⁻→Al. Accept consistent multiples or equivalent subtraction notation conserving charge.",
        1,
      ],
      [
        "Explains reduction as gain of electrons by aluminium ions, not loss of oxygen in this electrode half reaction.",
        1,
      ],
    ],
  ),
  part(
    "6(b)",
    "Electrode reactions and collected gases",
    "chemical-changes",
    ["4.4.3.4", "4.4.3.5"],
    written(
      "06b",
      "Write the oxygen half equation",
      "Write a complete balanced half equation for oxygen formation from hydroxide ions at the positive electrode during aqueous electrolysis. Include electrons; state symbols are not required.",
      "4 OH⁻ → O2 + 2 H2O + 4 e⁻",
      [
        "Atom-balanced hydroxide/oxygen/water equation.",
        "Correct electron count and side; charge conserved.",
      ],
      { writtenEquations: true, writtenEquationKind: "half" },
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Correct species and atom balance: 4 OH⁻ produces O2 and 2 H2O. Accept consistent multiples; do not omit water or balance by changing subscripts.",
        1,
      ],
      [
        "Four electrons appear on the product side, balancing charge. Equivalent 4 OH⁻−4e⁻→O2 + 2H2O notation is valid. State symbols are optional and do not independently earn/lose these points.",
        1,
      ],
    ],
    { practical: 3 },
  ),
  part(
    "6(c)",
    "Electrode reactions and collected gases",
    "chemical-changes",
    ["4.4.3.4"],
    written(
      "06c",
      "Explain the hydroxide-ion movement",
      "An aqueous sulfate solution contains hydroxide ions as well as the salt ions. Explain where these hydroxide ions come from and why they move towards the positive electrode.",
      "Water produces hydrogen ions and hydroxide ions. Hydroxide ions have a negative charge, so they are attracted to the positive electrode.",
      [
        "Water is the source of hydroxide ions.",
        "Negative hydroxide ions are attracted to the positive electrode.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Identifies water molecules as the source of hydroxide ions, not sulfate changing into hydroxide.",
        1,
      ],
      [
        "Connects negative hydroxide-ion charge with attraction/movement towards the positive electrode.",
        1,
      ],
    ],
    { practical: 3 },
  ),
  part(
    "6(d)",
    "Electrode reactions and collected gases",
    "chemical-changes",
    ["4.4.3.4"],
    written(
      "06d",
      "Improve the volume comparison",
      "Hydrogen and oxygen are collected in separate inverted test tubes with no volume markings. Suggest a better collection arrangement for comparing their volumes and explain why it is better.",
      "Use suitably sized inverted graduated measuring cylinders, inverted burettes or gas syringes for both gases. Their calibrated scales allow gas volumes to be read and compared, unlike unmarked test tubes.",
      [
        "Suitable graduated collection apparatus for both gases.",
        "Calibrated scales allow volume readings/comparison.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Proposes suitable graduated measuring cylinders/burettes or gas syringes arranged to collect both gases. A measuring device that does not collect the gas is insufficient.",
        1,
      ],
      [
        "Connects the improvement to readable calibrated gas-volume scales, rather than simply saying it is more accurate without a reason.",
        1,
      ],
    ],
    { practical: 3 },
  ),
  part(
    "6(e)",
    "Electrode reactions and collected gases",
    "chemical-changes",
    ["4.3.5", "4.4.3.4"],
    question(
      "06e",
      "Apply the gas-volume ratio",
      "For 2 H2O(l) → 2 H2(g) + O2(g), 42.0 cm³ of hydrogen is collected. Calculate the corresponding oxygen volume, assuming both gases are compared at the same temperature and pressure and neither is lost.",
      "21",
      {
        unit: "cm³",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Equal gas amounts occupy equal volumes under the same conditions. The H2:O2 ratio is2:1, so oxygen volume =42.0/2 =21.0 cm³.",
      },
    ),
    1,
    [0, 1, 0],
    1,
    [],
    { mathematics: true, practical: 3 },
  ),
];

const moles: ExamPart[] = [
  part(
    "7(a)",
    "Amounts and the limiting reactant",
    "quantitative",
    ["4.3.2.1"],
    written(
      "07a",
      "State the mole relationships",
      "State what one mole tells you about the number of particles. Also state how the mass of one mole in grams is related to relative formula mass.",
      "One mole contains the Avogadro number of stated particles, 6.02 × 10²³. The mass of one mole in grams is numerically equal to the relative formula mass.",
      [
        "Avogadro number of the specified particles.",
        "Mass in grams numerically equals relative formula mass.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "One mole contains 6.02 × 10²³ of the specified particles, or the Avogadro number; accept a more precise correct value.",
        1,
      ],
      [
        "One mole has a mass in grams numerically equal to the relative formula/atomic mass. Do not attach gram units to relative formula mass itself.",
        1,
      ],
    ],
  ),
  part(
    "7(b)",
    "Amounts and the limiting reactant",
    "quantitative",
    ["4.3.2.1"],
    question(
      "07b",
      "Calculate and present the particle count",
      "Calculate the number of CO2 molecules in 0.750 mol of CO2. Use 6.02 × 10²³ particles per mole. Give your answer in standard form to 3 significant figures and show your working. For the answer box, use e notation (for example, 1.23e20 means 1.23 × 10²⁰).",
      "4.52e23",
      {
        inputMode: "text",
        tolerance: 1e20,
        explanation:
          "Number = 0.750 × 6.02 × 10²³ = 4.515 × 10²³ molecules. To 3 significant figures in normalised standard form, this is 4.52 × 10²³. The raw answer must show the required presentation; an equivalent unrounded decimal integer alone does not establish it.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      [
        "Multiplies the amount in moles by the supplied Avogadro constant. An equivalent correct approach is valid.",
        1,
      ],
      [
        "Obtains the unrounded numerical count 4.515 × 10²³. A correct later value may imply valid earlier calculation if there is no contradictory working.",
        1,
      ],
      [
        "Presents 4.52 × 10²³ in normalised standard form with exactly 3 significant figures. Equivalent explicit power-of-ten notation such as 4.52e23 is valid. Review raw presentation: 45.2 × 10²² has the same value but is not normalised standard form; 4.520 × 10²³ has 4 significant figures. Allow correctly normalised standard form and correct 3-significant-figure rounding of an earlier incorrectly evaluated count using the supplied amount and Avogadro constant.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "7(c)",
    "Amounts and the limiting reactant",
    "quantitative",
    ["4.3.2.1", "4.3.2.2", "4.3.2.4", "4.3.5"],
    question(
      "07c",
      "Use the limiting amount",
      "2.40 g of Mg reacts with 0.150 mol HCl: Mg + 2 HCl → MgCl2 + H2. Ar(Mg) = 24. Find the hydrogen volume at room temperature and pressure, using 24 dm³/mol. Identify the limiting reactant in your working.",
      "1.8",
      {
        unit: "dm³",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Mg amount =2.40/24 =0.100 mol, which would need0.200 mol HCl. Only0.150 mol HCl is available, so HCl limits the reaction. H2 amount =0.150/2 =0.0750 mol; volume =0.0750 × 24 =1.80 dm³.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      [
        "Uses 0.100 mol Mg and the 2:1 acid:metal ratio to identify HCl as limiting: 0.200 mol would be needed but only 0.150 mol is available. Equivalent maximum-product comparisons are valid.",
        1,
      ],
      [
        "Uses the limiting acid amount and 2:1 acid:hydrogen ratio to obtain 0.0750 mol H2. A valid ratio step following an earlier numerical amount error can earn its method point; using the excess magnesium as limiting is not the correct limiting comparison.",
        1,
      ],
      [
        "Multiplies hydrogen amount by 24 dm³/mol, giving 1.80 dm³ for the correct amount. Allow a consistent correct volume step following an earlier amount error; do not use 24 cm³/mol.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "7(d)",
    "Amounts and the limiting reactant",
    "quantitative",
    ["4.3.2.4"],
    written(
      "07d",
      "Evaluate the remaining-metal claim",
      "Magnesium remains after the acid in that reaction has been completely used. A student says remaining magnesium proves the reaction failed. Explain why the evidence does not support this conclusion.",
      "Magnesium was in excess. The acid can be completely consumed and the reaction stop even though some magnesium remains; remaining excess reactant does not prove a failure.",
      ["Excess metal can remain when the limiting acid is exhausted."],
      { shortWritten: true },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Connects remaining magnesium with its excess and the exhausted limiting acid, rejecting the claim that this alone proves failure.",
        1,
      ],
    ],
  ),
  part(
    "7(e)",
    "Amounts and the limiting reactant",
    "quantitative",
    ["4.3.2.2"],
    written(
      "07e",
      "Interpret the equation coefficients",
      "For 2 Mg + O2 → 2 MgO, state what the coefficients 2:1:2 mean in terms of amounts in moles.",
      "Two moles of magnesium react with one mole of oxygen molecules to produce two moles of magnesium oxide. The coefficients are mole ratios, not equal gram-mass ratios.",
      ["2 mol Mg:1 mol O2:2 mol MgO."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Correctly identifies 2 mol Mg reacting with 1 mol O2 to form 2 mol MgO, or an equivalent scaled mole ratio; not a 2:1:2 gram ratio.",
        1,
      ],
    ],
  ),
];

const extraction: ExamPart[] = [
  part(
    "8(a)",
    "Redox and an industrial gas quantity",
    "chemical-changes",
    ["4.4.1.4"],
    written(
      "08a",
      "Define electron transfer",
      "State what oxidation and reduction each mean in terms of electrons.",
      "Oxidation is loss of electrons; reduction is gain of electrons.",
      ["Oxidation: electron loss.", "Reduction: electron gain."],
      { shortWritten: true },
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Oxidation is loss of electrons.", 1],
      [
        "Reduction is gain of electrons. Do not substitute oxygen-only definitions when electron definitions were requested.",
        1,
      ],
    ],
  ),
  part(
    "8(b)",
    "Redox and an industrial gas quantity",
    "quantitative",
    ["4.3.1.2", "4.3.2.1", "4.3.2.2", "4.3.5"],
    question(
      "08b",
      "Calculate the full gas quantity",
      "An extraction follows 2 Cu2O + C → 4 Cu + CO2. Calculate the CO2 volume at room temperature and pressure when 72.0 kg Cu2O reacts completely. Use Ar(Cu) = 64, Ar(O) = 16 and 24 dm³/mol. Show all working.",
      "6000",
      {
        unit: "dm³",
        inputMode: "decimal",
        tolerance: 0.01,
        explanation:
          "Mr(Cu2O) = 2 × 64 + 16 = 144. 72.0 kg = 72,000 g, so Cu2O amount = 72,000/144 = 500 mol. The 2:1 Cu2O:CO2 ratio gives 250 mol CO2. Volume = 250 × 24 = 6,000 dm³. Use the supplied relative masses; do not replace them with different table values.",
      },
    ),
    6,
    [0, 6, 0],
    0,
    [
      ["Finds Mr(Cu2O) = 144 using the supplied relative atomic masses.", 1],
      ["Converts 72.0 kg to 72,000 g.", 1],
      [
        "Calculates 500 mol Cu2O by mass/Mr. Allow a correct amount step following an earlier Mr/conversion error.",
        1,
      ],
      [
        "Uses the equation's 2:1 Cu2O:CO2 ratio to obtain 250 mol CO2. Allow a valid ratio step following an earlier amount error.",
        1,
      ],
      [
        "Uses gas volume=amount× 24 dm³/mol. Allow a correct volume method after an earlier numerical amount error.",
        1,
      ],
      [
        "Evaluates the final multiplication correctly, giving 6,000 dm³ for the correct route. Allow a correctly evaluated final volume from an earlier consistently carried amount error. A correct final result can imply valid omitted earlier stages unless the retained working contradicts them; do not demand a copied sequence.",
        1,
      ],
    ],
    { mathematics: true },
  ),
];

const energy: ExamPart[] = [
  part(
    "9(a)",
    "Bond energies and electrical energy sources",
    "energy",
    ["4.5.1.3"],
    question(
      "09a",
      "Calculate the signed bond-energy change",
      "For H2 + Cl2 → 2 HCl, use bond energies H–H 436, Cl–Cl 242 and H–Cl 432 kJ/mol. Calculate the signed energy change when 1 mol H2 reacts completely. Show bonds broken and formed.",
      "-186",
      {
        unit: "kJ",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Breaking1 mol H–H and1 mol Cl–Cl requires436 + 242 = 678 kJ. Forming2 mol H–Cl releases2 × 432 = 864 kJ. Overall change = 678−864 = −186 kJ for the stated1 mol H2 reaction amount; it is exothermic.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      [
        "Counts one H–H and one Cl–Cl bond per reaction amount; breaking requires 678 kJ.",
        1,
      ],
      [
        "Counts two H–Cl bonds formed, releasing 864 kJ. Do not use only one product bond.",
        1,
      ],
      [
        "Uses energy for breaking minus energy for forming, giving −186 kJ. A correct signed subtraction after an earlier bond-total error can earn this method point. Do not award a negative sign justified by saying bond breaking releases energy.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "9(b)",
    "Bond energies and electrical energy sources",
    "energy",
    ["4.5.1.2"],
    question(
      "09b",
      "Construct an exothermic profile",
      "Draw an exothermic profile. Choose reactant, product and peak levels, then add activation-energy and overall-change arrows.",
      JSON.stringify({
        reactant: "80",
        product: "40",
        peak: "140",
        activationArrow: "reactants-peak",
        overallArrow: "reactants-products",
      }),
      {
        profileDrawing: true,
        compactProfileInstructions: true,
        explanation:
          "One valid example has reactants 80, products 40 and peak 140 kJ on a relative energy reference. Products lie below reactants and the curve rises above both. Activation spans reactants→peak; overall change spans reactants→products. Other suitable relative levels are valid; these three numbers are not required.",
      },
    ),
    3,
    [3, 0, 0],
    0,
    [
      [
        "A curved profile has products below reactants and a peak above them. The independently chosen relative levels need not equal the example; the scale's zero is not required as a reactant level.",
        1,
      ],
      [
        "Activation-energy arrow spans the reactant energy to the peak, not zero→peak or products→peak.",
        1,
      ],
      [
        "Overall-change arrow spans the reactant level down to the product level, showing the exothermic decrease.",
        1,
      ],
    ],
  ),
  part(
    "9(c)",
    "Bond energies and electrical energy sources",
    "energy",
    ["4.5.2.2"],
    written(
      "09c",
      "Write the alkaline fuel-electrode equation",
      "In an alkaline hydrogen fuel cell, hydrogen reacts with hydroxide ions at the fuel electrode. Write the complete balanced half equation. Include electrons; state symbols are not required.",
      "H2 + 2 OH⁻ → 2 H2O + 2 e⁻",
      [
        "Correct atom-balanced hydrogen/hydroxide/water species.",
        "Electrons on product side and charge balanced.",
      ],
      { writtenEquations: true, writtenEquationKind: "half" },
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "H2 + 2OH⁻ produces 2 H2O, with correct formulae and atom balance. Accept consistent multiples.",
        1,
      ],
      [
        "Two electrons are released on the product side, balancing the −2 reactant charge. Equivalent electron-subtraction notation conserving charge is valid. The specified alkaline electrolyte requires hydroxide, rather than silently substituting a different acid-electrolyte half equation.",
        1,
      ],
    ],
  ),
  part(
    "9(d)",
    "Bond energies and electrical energy sources",
    "energy",
    ["4.5.2.2"],
    written(
      "09d",
      "Make the evidence-based vehicle decision",
      "A 300 km journey must have no energy stop en route. Supplied vehicle data: battery range 180 km; fuel-cell range 350 km; either starts fully supplied. Select the suitable vehicle and justify it. Does this range data prove a lower life-cycle environmental impact? Explain.",
      "The fuel-cell vehicle has enough supplied range for 300 km without an energy stop; the battery vehicle does not. Range alone does not establish lower life-cycle impact. Evidence about hydrogen/electricity production, vehicle manufacture and other life-cycle stages would be needed.",
      [
        "Fuel-cell range satisfies the stated journey constraint.",
        "Range does not establish whole-life environmental impact.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Selects the fuel-cell vehicle because 350 km exceeds 300 km, while 180 km does not satisfy the no-stop requirement.",
        1,
      ],
      [
        "Rejects the life-cycle inference and identifies a relevant missing source, such as energy/hydrogen production or vehicle manufacture. Water-only fuel-cell exhaust does not prove zero whole-life impact.",
        1,
      ],
    ],
  ),
];

const yieldEconomy: ExamPart[] = [
  part(
    "10(a)",
    "Yield and route selection",
    "quantitative",
    ["4.3.3.2"],
    written(
      "10a",
      "Define atom economy",
      "What does the atom economy of a reaction measure?",
      "The theoretical fraction or percentage of total reactant mass allocated to the desired useful product, accounting for the balanced reaction coefficients.",
      [
        "Theoretical reactant-mass fraction allocated to the desired useful product.",
      ],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "The theoretical fraction or percentage of reactant mass allocated to the desired useful product by the balanced equation. Accept a clear equivalent starting-material allocation description. Do not substitute actual recovered yield or use a simple fraction of atom counts.",
        1,
      ],
    ],
  ),
  part(
    "10(b)",
    "Yield and route selection",
    "quantitative",
    ["4.3.3.1"],
    written(
      "10b",
      "Explain a yield loss",
      "A reaction mixture forms the expected product, but the recovered pure, dry product has a yield below 100%. Give one possible reason.",
      "Some product is lost while being separated/transferred; alternatively, incomplete reversible reaction or side reactions can lower the recovered yield.",
      ["A chemically relevant yield-loss mechanism."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "A relevant reason such as product lost during separation/transfer, incomplete reversible reaction or side reaction. Dry pure product excludes treating water/contamination as extra useful product.",
        1,
      ],
    ],
  ),
  part(
    "10(c)",
    "Yield and route selection",
    "quantitative",
    ["4.3.3.2"],
    question(
      "10c",
      "Reverse the atom-economy calculation",
      "For X2O3 + 3 H2 → 2 X + 3 H2O, the reported atom economy for obtaining X is 67.5%. X is an unknown metal, not a chemical symbol to identify. Calculate Ar(X) to 3 significant figures. Use Ar(H) = 1 and Ar(O) = 16; show your working.",
      "56.1",
      {
        inputMode: "decimal",
        tolerance: 0.005,
        explanation:
          "The two X atoms contribute 2M; the unwanted 3H2O contributes 54, so 2M/(2M+ 54) × 100 = 67.5. Rearranging gives 200M = 135M+ 3645, then 65M = 3645. M = 56.076923…≈56.1 to 3 significant figures. The reported percentage is rounded, so this is an inferred approximate relative mass.",
      },
    ),
    4,
    [0, 4, 0],
    0,
    [
      [
        "Includes the equation coefficients: 2M/(2M+ 54) × 100 = 67.5, where 3Mr(H2O) = 54. Equivalent calculations using the unwanted 32.5% fraction are valid.",
        1,
      ],
      [
        "Correctly rearranges the relation, for example 200M = 135M+ 3645 and 65M = 3645. Allow valid algebra following an earlier calculated unwanted-mass error.",
        1,
      ],
      [
        "Obtains the unrounded relative mass 56.076923… for the correct route, or correctly evaluates a consistently carried preceding algebraic expression. A correct later value may imply valid earlier steps if working has no contradiction.",
        1,
      ],
      [
        "Gives 56.1 to exactly 3 significant figures; do not infer required presentation solely from an equivalent numerical parser result. Allow correct rounding of an earlier consistently calculated incorrect result.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "10(d)",
    "Yield and route selection",
    "quantitative",
    ["4.3.3.1"],
    question(
      "10d",
      "Calculate the recovered yield",
      "A preparation has a theoretical maximum of 10.5 g and recovers 8.40 g of pure, dry product. Calculate percentage yield.",
      "80",
      {
        unit: "%",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Percentage yield = 8.40/10.5 × 100 = 80%. Atom economy is a different measure.",
      },
    ),
    1,
    [0, 1, 0],
    1,
    [],
    { mathematics: true },
  ),
  part(
    "10(e)",
    "Yield and route selection",
    "quantitative",
    ["4.3.3.2"],
    written(
      "10e",
      "Evaluate the route recommendation",
      "Two routes make the same useful product. P: atom economy 90%, yield 40%, energy 8 MJ/kg useful product. Q: atom economy 60%, yield 95%, energy 3 MJ/kg useful product. A student recommends P solely because of atom economy. Evaluate the recommendation using all three measures.",
      "P has the better theoretical atom economy, so a greater fraction of its starting material can become useful product. Q has a much higher actual yield and lower stated energy use per kg of useful product. The single atom-economy figure is insufficient to establish the better route: the importance of losses, energy and other supplied/missing practical or economic evidence must be considered.",
      [
        "P has an atom-economy advantage.",
        "Q has the actual-yield advantage.",
        "Q uses less energy per useful-product mass; a single-metric recommendation is insufficient.",
      ],
    ),
    3,
    [0, 0, 3],
    0,
    [
      [
        "Recognises P's 90% versus Q's 60% atom-economy advantage and what that theoretical measure says about useful-product formation.",
        1,
      ],
      [
        "Recognises Q's 95% versus P's 40% actual-yield advantage; does not treat yield and atom economy as the same percentage.",
        1,
      ],
      [
        "Uses the equal useful-product energy basis, 3 versus 8 MJ/kg, to reject the claim that atom economy alone proves P is best. A qualified judgement is valid; do not add unlike percentage and energy units into an invented total score.",
        1,
      ],
    ],
  ),
];

// Complete individual draft; registration follows content/mark-allocation review.
export const paper1HigherFull: ExamPaper = {
  id: "paper-1-higher-full",
  totalMarks: 100,
  minutes: 105,
  parts: [
    ...atoms,
    ...bonding,
    ...thermal,
    ...salts,
    ...acids,
    ...electrolysis,
    ...moles,
    ...extraction,
    ...energy,
    ...yieldEconomy,
  ],
};

// Individually reviewed repeated answer demands, not broad chapter equivalence.
// New numerical datasets remain independent; these links cover recalled answers
// and constructions that prior lesson help has already disclosed.
const reviewedExposure: Record<string, string[]> = {
  "01a": [
    "am-v1-r-empty",
    "am-v1-g-empty",
    "am-v1-g-surprise",
    "am-write-v1-p-scattering",
    "am-write-v1-ca-scattering",
    "am-v1-ca-straight",
    "am-v1-cb-rare",
  ],
  "01c": ["am-v1-p-contrast", "am-write-v1-ca-models", "am-v1-cb-picture"],
  "01e": ["iso-v1-g-carbon", "iso-v1-p-chemistry", "chem-p1f-full-v1-01d"],
  "02a": [
    "cb-v1-g-hcl",
    "cb-v1-p-hcl",
    "cb-v1-ca-hcl",
    "cb-v1-ca-lone",
    "cb-write-v1-ca-force",
  ],
  "02b": [
    "ps-write-v1-p-correction",
    "ps-write-v1-ca-state",
    "ps-v1-r-phase",
    "ps-v1-ra-state",
  ],
  "02e": ["np-v1-p-amount", "np-v1-ra-risk", "np-write-v1-p-benefits"],
  "04a": ["ss-v1-p-method-write", "ss-v1-b-write"],
  "04c": ["ss-v1-p-filter-write", "ss-v1-ra-filter", "ss-v1-p-method-write"],
  "07e": ["rm-v1-ca-quantity"],
  "02c": [
    "mb-v1-p-carrier",
    "mb-write-v1-ca-carriers",
    "mb-write-v1-ra-carriers",
  ],
  "05a": [
    "ph-and-strong-acids-3",
    "acid-v1-a-descriptors",
    "acid-v1-b-weak",
    "alc-v1-p-higher-pH",
  ],
  "05c": ["tech-v1-p-reverse-colour"],
  "05e": ["cc-v1-p-not-strength", "acid-v1-r-descriptors"],
  "06a": [
    "he-v1-p-aluminium",
    "higher-paper-0-5",
    "higher-paper-1-5",
    "higher-paper-2-5",
    "higher-paper-3-5",
  ],
  "06b": [
    "he-v1-p-hydroxide",
    "he-v1-g-anode",
    "he-v1-p-water",
    "he-v1-r-water",
    "he-v1-rb-explain",
  ],
  "07a": ["mo-v1-r-unit", "mo-v1-p-explain", "mo-v1-p-justify"],
  "08a": [
    "am-write-v1-p-redox",
    "am-write-v1-ra-redox",
    "am-write-v1-ca-redox",
    "aqueous-electrolysis-3",
    "he-v1-a-explain",
    "he-v1-p-definition",
  ],
  "09b": [
    "reaction-profiles-0",
    "profile-v1-r-levels",
    "profile-v1-p-draw",
    "profile-v1-a-draw",
  ],
  "10a": [
    "ae-v1-r-definition",
    "yield-and-atom-economy-5",
    "ae-v1-p-100-not-perfect",
  ],
  "10b": [
    "yield-and-atom-economy-1",
    "py-v1-p-side",
    "py-v1-reversible-p-reverse",
    "py-v1-cb-proof",
    "py-v1-reversible-cb-reverse",
    "py-v1-reversible-ra-causes",
    "chem-p1f-full-v1-06d",
  ],
};
for (const part of paper1HigherFull.parts) {
  const ids = reviewedExposure[part.question.id.slice(prefix.length)];
  if (ids)
    part.question.exposureAliases = [
      ...new Set([...(part.question.exposureAliases ?? []), ...ids]),
    ];
}
