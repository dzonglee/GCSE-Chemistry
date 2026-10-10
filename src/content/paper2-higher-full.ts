import type { Question } from "./types";
import type { ExamPaper, ExamPart, PaperCriterion } from "./exam-paper-types";
import { emptyFuelDrawing } from "../lib/fuel-drawing";
import { blankPolymerisationDrawing } from "../lib/polymerisation-board";

const prefix = "chem-p2h-full-v1-";
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

// Original groups authored individually after reading the complete actual
// 2023 Higher Paper 2, final mark scheme and relevant specification clauses.
// Native references remain separate from the student's independently saved work.
export const higherPaper2RateInvestigation: ExamPart[] = [
  part(
    "1(a)",
    "Measuring reaction rate",
    "rates",
    ["4.6.1.1"],
    written(
      "01a",
      "Evaluate the delayed stopper",
      "A student mixes magnesium with excess dilute hydrochloric acid in a flask connected to a gas syringe. The timer starts on mixing, but the stopper is fitted several seconds later. Explain how this affects the volume recorded at a fixed time.",
      "Hydrogen produced before the stopper is fitted can escape rather than entering the syringe. The recorded volume is therefore lower than the volume actually produced in that time.",
      [
        "Connect escaping hydrogen before sealing with a volume lower than actually produced.",
      ],
      { shortWritten: true },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Links hydrogen escaping before the stopper is fitted with an underestimate of the volume produced. 'Less accurate' alone is insufficient.",
        1,
      ],
    ],
    { practical: 5 },
  ),
  part(
    "1(b)",
    "Measuring reaction rate",
    "rates",
    ["4.6.1.1"],
    question(
      "01b",
      "Estimate a rate in mol per second",
      "Four matched repeats take 36.0, 37.2, 36.8 and 56.0 seconds to collect 60.0 cm³ of hydrogen. This volume represents 0.00250 mol in every repeat. Exclude the anomalous time. Use the mean remaining collection time to estimate the mean rate in mol/s, to 3 significant figures. Show your working.",
      "6.82e-5",
      {
        inputMode: "text",
        unit: "mol/s",
        explanation:
          "Exclude 56.0 s. Mean time = (36.0 + 37.2 + 36.8) / 3 = 36.666… s. Amount / mean collection time = 0.00250 / 36.666… = 0.0000681818… mol/s, giving 6.82 × 10⁻⁵ mol/s to 3 significant figures. This is the requested estimate using the mean time, rather than an arithmetic mean of the individual rates.",
      },
    ),
    5,
    [0, 4, 1],
    0,
    [
      ["Excludes 56.0 s as inconsistent with the three clustered repeats.", 1],
      [
        "Correctly calculates the mean of the retained times: 36.666… s (36.7 s is an appropriate intermediate display). Allow a correctly calculated mean including the anomaly for this calculation point, but not the exclusion point.",
        1,
      ],
      [
        "Uses rate = 0.00250 / mean collection time, in mol/s. Allow the student's preceding mean, with consistent units.",
        1,
      ],
      [
        "Correctly evaluates the quotient before final rounding. Allow valid error carried forward from the preceding mean; avoid premature intermediate rounding that changes the requested final value.",
        1,
      ],
      [
        "Presents the quotient to exactly 3 significant figures, using the retained raw answer/working. 6.82e-5, 6.82 × 10⁻⁵ and 0.0000682 are valid. Numerical equivalence alone does not prove presentation: 6.820e-5 has 4 significant figures. Allow correct rounding of an earlier incorrect quotient.",
        1,
      ],
    ],
    { mathematics: true, practical: 5 },
  ),
  part(
    "1(c)",
    "Measuring reaction rate",
    "rates",
    ["4.6.1.2", "4.6.1.3"],
    written(
      "01c",
      "Explain the concentration effect",
      "Matched trials use the same magnesium mass and surface area, acid volume and temperature. Hydrochloric acid is in excess in both. Explain why increasing its concentration from 0.50 to 1.00 mol/dm³ reduces the time to collect a fixed hydrogen volume. Use collision theory.",
      "There are more reacting acid particles per unit volume. Collisions with the magnesium surface are more frequent, so more successful collisions occur each second. A fixed amount of hydrogen is produced sooner. The temperature is unchanged, so the explanation does not require increased particle kinetic energy.",
      [
        "More reacting particles per unit volume.",
        "More frequent successful collisions at the magnesium surface.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Higher concentration means more reacting particles per unit volume, rather than larger particles or increased kinetic energy.",
        1,
      ],
      [
        "Collisions at the magnesium surface are more frequent, increasing successful collisions per second and producing the fixed amount sooner. 'More collisions' alone, without frequency/time, is insufficient.",
        1,
      ],
    ],
    { practical: 5 },
  ),
  part(
    "1(d)",
    "Measuring reaction rate",
    "rates",
    ["4.6.1.2"],
    written(
      "01d",
      "Develop a second practical hypothesis",
      "Sulfur from sodium thiosulfate reacting with acid makes a mixture cloudy and hides a cross beneath the flask. In a supervised comparison, form a testable hypothesis linking thiosulfate concentration to cross-disappearance time. Identify one variable to control for a fair test.",
      "Increasing sodium thiosulfate concentration decreases the time for the cross to disappear. Keep, for example, the total mixture volume/depth, temperature, or acid concentration and volume constant. Use the same cross and viewing conditions. One valid control is sufficient.",
      [
        "Directional, testable concentration–disappearance-time hypothesis.",
        "One relevant controlled variable.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Predicts that increasing sodium thiosulfate concentration decreases the measured disappearance time (or the equivalent inverse comparison). 'It reacts faster' alone does not identify this measured endpoint.",
        1,
      ],
      [
        "Identifies one valid control: total mixture volume/depth, temperature, acid concentration/volume, or consistent cross/viewing conditions. Do not require every control for one mark or accept controlling the independent thiosulfate concentration.",
        1,
      ],
    ],
    { practical: 5 },
  ),
];

export const higherPaper2Alcohols: ExamPart[] = [
  part(
    "2(a)",
    "Alcohol fuels and reactions",
    "organic",
    ["4.7.2.3"],
    question(
      "02a",
      "Compare fuel masses",
      "Supplied experimental energy releases are 26.0 kJ/g for ethanol and 32.8 kJ/g for butanol. What mass of ethanol releases the same energy as burning 2.40 g of butanol? Give your answer to 3 significant figures and show your working.",
      "3.03",
      {
        inputMode: "decimal",
        unit: "g",
        explanation:
          "Energy = 2.40 × 32.8 = 78.72 kJ. Ethanol mass = 78.72 / 26.0 = 3.027692… g, giving 3.03 g to 3 significant figures. These supplied experimental values are not universal heats of combustion.",
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Uses 2.40 × 32.8 / 26.0, or an equivalent energy-then-mass calculation. Do not reverse the energy-per-gram ratio.",
        1,
      ],
      [
        "Correctly evaluates the mass and rounds to 3.03 g. Allow correct evaluation and rounding using an earlier incorrect energy when the ethanol mass is still energy / 26.0; do not award for contradictory retained working.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "2(b)",
    "Alcohol fuels and reactions",
    "organic",
    ["4.7.2.3"],
    written(
      "02b",
      "Build the fuel graph",
      "Plot all six observations. Draw a separate smooth best-fit curve and extend it to estimate energy per gram at carbon count 8.",
      "Plot (2,26.0), (3,30.2), (4,32.8), (5,34.4), (6,35.5), (7,36.3). A smooth supported curve increases with decreasing steepness. One reasonable extrapolated estimate at carbon count 8 is about 37.0 kJ/g; another estimate consistent with a valid student curve is acceptable. It is an estimate beyond the supplied observations, not a measured value.",
      [
        "Six accurately placed observations (partial credit for four or five).",
        "Separate supported smooth curve.",
        "An extrapolated estimate consistent with the curve.",
      ],
      {
        fuelDrawing: {
          data: {
            title: "Original supplied alcohol fuel observations",
            xName: "Carbon count",
            xUnit: "",
            yName: "Energy per gram",
            yUnit: "kJ/g",
            points: [
              [2, 26.0],
              [3, 30.2],
              [4, 32.8],
              [5, 34.4],
              [6, 35.5],
              [7, 36.3],
            ],
            xMin: 1,
            xMax: 8,
            xTick: 1,
            yMin: 24,
            yMax: 40,
            yTick: 2,
            targetX: 8,
            estimateRange: [36.7, 37.2],
            trend:
              "Increasing energy per gram, with smaller increases between successive observations.",
            limit: "extrapolatedEstimate",
            note: "Original supplied experimental illustration, not a universal alcohol table. The graph's energy scale begins at 24 kJ/g. Carbon counts above four are supplied data; their alcohol names are not required recall.",
          },
          note: "Construct original observations, a separate smooth fit and the estimated extension to carbon count 8. Review all three demands after whole-paper submission.",
        },
      },
    ),
    4,
    [0, 4, 0],
    0,
    [
      [
        "All six actual coordinate pairs accurately plotted within half a smallest grid subdivision: 2 marks; four or five accurately plotted: 1 mark; fewer than four: 0. Award for the observations, not for fit anchors substituted as raw data.",
        2,
      ],
      [
        "A separate smooth supported best-fit curve follows the increasing, flattening trend. Do not require passing exactly through every observation or accept an unsupported straight line across this curved series.",
        1,
      ],
      [
        "Extends the curve's trend beyond the last observation to carbon count 8 and gives a consistent estimate. Around 36.7–37.2 kJ/g is a reasonable reference range; allow another reading consistent with a valid retained student curve rather than requiring exactly 37.0.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "2(c)",
    "Alcohol fuels and reactions",
    "organic",
    ["4.7.2.3"],
    written(
      "02c",
      "Write the combustion equation",
      "Write a balanced symbol equation for complete combustion of propanol, C₃H₇OH, in oxygen. State symbols are not required.",
      "2C3H7OH + 9O2 → 6CO2 + 8H2O. The equivalent equation C3H7OH + 4.5O2 → 3CO2 + 4H2O is also balanced.",
      ["Correct complete-combustion products.", "Balanced equation."],
      { shortWritten: true, writtenEquationKind: "symbol" },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Uses the supplied alcohol and oxygen as reactants and carbon dioxide and water as the only complete-combustion products. C3H8O is an equivalent alcohol formula here.",
        1,
      ],
      [
        "Balances all atoms: coefficients 2:9:6:8, 1:4.5:3:4, or another equivalent proportional set. Accept fractional oxygen coefficients; do not change molecular formulas to balance atoms.",
        1,
      ],
    ],
  ),
  part(
    "2(d)",
    "Alcohol fuels and reactions",
    "organic",
    ["4.7.2.3", "4.7.2.4"],
    written(
      "02d",
      "Name the oxidation product",
      "Ethanol is oxidised to the corresponding carboxylic acid. Name that acid.",
      "Ethanoic acid.",
      ["Ethanoic acid."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Ethanoic acid; accept the unambiguous alternative name acetic acid.",
        1,
      ],
    ],
  ),
  part(
    "2(e)",
    "Alcohol fuels and reactions",
    "organic",
    ["4.7.2.4"],
    written(
      "02e",
      "Name the ester",
      "Name the ester formed when ethanol reacts with ethanoic acid in the presence of an acid catalyst.",
      "Ethyl ethanoate.",
      ["Ethyl ethanoate."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Ethyl ethanoate; accept ethyl acetate. Do not require names of additional esters outside the specified recall demand.",
        1,
      ],
    ],
  ),
];

const fuelPart = higherPaper2Alcohols.find((p) => p.number === "2(b)")!;
const fuelData = fuelPart.question.fuelDrawing!.data;
fuelPart.referenceConstruction = JSON.stringify({
  ...emptyFuelDrawing(fuelData),
  ...Object.fromEntries(
    fuelData.points.flatMap(([x, y], i) => [
      [`p${i}x`, String(x)],
      [`p${i}y`, String(y)],
      [`c${i}`, String(y)],
    ]),
  ),
  estimate: "37.0",
});

export const higherPaper2IonAnalysis: ExamPart[] = [
  part(
    "3(a)",
    "Identifying a soluble salt",
    "analysis",
    ["4.8.3.1", "4.8.3.5"],
    written(
      "03a",
      "Plan a complete two-ion method",
      "Plan tests for potassium and sulfate ions in a water-soluble salt. In a supervised laboratory, you have a Bunsen burner, clean wire, test tubes, pipettes, distilled water, dilute hydrochloric acid and barium chloride solution. Give the steps, expected observations and what they identify.",
      "For potassium, put a little sample on a clean wire and place it in a blue/non-luminous flame: a lilac flame indicates potassium ions. Dissolve a separate fresh portion of the salt in distilled water in a test tube. Add dilute hydrochloric acid, then barium chloride solution: a white precipitate indicates sulfate ions. Use separate portions and clean apparatus to avoid contamination.",
      [
        "Valid flame-test method and potassium observation.",
        "Valid separate dissolved-sample, hydrochloric-acid and barium-chloride method and sulfate observation.",
        "Assess logical sequence and whether both identifications would work.",
      ],
    ),
    6,
    [6, 0, 0],
    0,
    [],
    {
      practical: 7,
      levels: [
        {
          min: 5,
          max: 6,
          text: "A logically sequenced method would identify both ions: appropriate clean-wire flame procedure with lilac potassium observation, and a fresh dissolved portion acidified with hydrochloric acid before barium chloride with a white sulfate precipitate. Both interpretations are clear. Award 6 for secure completeness, 5 for a minor omission that does not invalidate identification.",
        },
        {
          min: 3,
          max: 4,
          text: "Most relevant steps are described, but an incomplete branch, sequence, observation or interpretation means the whole method would not necessarily establish both ions. Choose 3 or 4 by the quality of the complete response, not by counting keywords.",
        },
        {
          min: 1,
          max: 2,
          text: "Some relevant steps or observations appear, but the plan would not establish the requested two-ion result. Award 2 for more developed relevant content and 1 for limited content.",
        },
        { min: 0, max: 0, text: "No relevant content." },
      ],
    },
  ),
  part(
    "3(b)",
    "Instrumental metal-ion analysis",
    "analysis",
    ["4.8.3.7"],
    written(
      "03b",
      "Name the instrumental technique",
      "Name the specified instrumental technique that analyses light emitted when a sample is introduced into a flame to identify metal ions and determine their concentrations.",
      "Flame emission spectroscopy.",
      ["Flame emission spectroscopy."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Flame emission spectroscopy or spectrometry. A visual flame test alone is not this instrumental measurement.",
        1,
      ],
    ],
  ),
  part(
    "3(c)",
    "Instrumental metal-ion analysis",
    "analysis",
    ["4.8.3.6"],
    written(
      "03c",
      "State an instrumental advantage",
      "State one advantage of an instrumental method over the specified chemical tests.",
      "Instrumental methods can be more sensitive, accurate or rapid. One valid advantage is sufficient.",
      ["One valid instrumental advantage."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "One of greater sensitivity/detecting smaller amounts, greater accuracy, faster results, or a smaller required sample. Do not require all advantages; 'better' alone is insufficient.",
        1,
      ],
    ],
  ),
  part(
    "3(d)",
    "Instrumental metal-ion analysis",
    "analysis",
    ["4.8.3.7"],
    written(
      "03d",
      "Interpret the supplied spectrum",
      "Supplied diagnostic wavelengths: sodium, 589 nm; potassium, 766 and 770 nm; lithium, 671 nm. An unknown mixture shows 589, 766 and 770 nm, but not 671 nm. Identify the two metal ions and link each to its matching reference line or lines.",
      "Sodium ions are supported by the 589 nm line. Potassium ions are supported by the 766 and 770 nm lines. The supplied spectrum does not support lithium; these simplified reference data are provided, not required wavelength recall.",
      [
        "Sodium identified from its reference line.",
        "Potassium identified from its reference lines.",
      ],
    ),
    2,
    [0, 2, 0],
    0,
    [
      ["Identifies sodium/Na+ and links it to the 589 nm reference line.", 1],
      [
        "Identifies potassium/K+ and links it to the matching 766/770 nm lines. Do not demand recalled wavelengths beyond the supplied table.",
        1,
      ],
    ],
  ),
];

export const higherPaper2Climate: ExamPart[] = [
  part(
    "4(a)",
    "Evaluating climate evidence",
    "atmosphere",
    ["4.9.2.1"],
    written(
      "04a",
      "Explain the greenhouse effect",
      "Explain how greenhouse gases help maintain Earth's surface temperature. Refer to the radiation arriving from the Sun and leaving Earth's surface.",
      "Short-wavelength solar radiation passes through the atmosphere and warms Earth's surface. The warmed surface emits longer-wavelength infrared radiation. Greenhouse gases absorb outgoing infrared and emit infrared in all directions, including back towards the surface, reducing net energy loss to space.",
      [
        "Short-wavelength incoming radiation warms the surface, which emits longer-wavelength infrared.",
        "Greenhouse gases absorb and re-emit outgoing infrared, reducing net energy loss.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Distinguishes incoming short-wavelength solar radiation from the longer-wavelength infrared emitted by the warmed surface.",
        1,
      ],
      [
        "Greenhouse gases absorb outgoing infrared and emit it, including towards the surface, reducing net energy loss. Do not substitute an ozone-layer explanation or claim greenhouse gases simply reflect all sunlight.",
        1,
      ],
    ],
  ),
  part(
    "4(b)",
    "Evaluating climate evidence",
    "atmosphere",
    ["4.9.2.2", "4.9.2.4"],
    question(
      "04b",
      "Calculate the emissions change",
      "A town's population grows from 100000 to 120000. Its annual electricity-related emissions per resident fall from 0.75 to 0.42 tonnes of CO₂ after its electricity mix changes. Calculate the decrease in the town's total annual electricity-related CO₂ emissions. Show your working.",
      "24600",
      {
        inputMode: "decimal",
        unit: "tonnes CO₂/year",
        explanation:
          "Initial total = 100000 × 0.75 = 75000 tonnes/year. Later total = 120000 × 0.42 = 50400 tonnes/year. Decrease = 75000 − 50400 = 24600 tonnes/year. These are electricity-related emissions, not the town's full carbon footprint.",
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Uses population × the corresponding per-resident emissions for both totals: 75000 and 50400 tonnes/year. Both supplied populations matter; comparing only per-resident values is insufficient.",
        1,
      ],
      [
        "Calculates the decrease as initial total − later total = 24600 tonnes/year. Allow correct subtraction of preceding incorrect totals when both came from the intended population × per-resident method.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "4(c)",
    "Evaluating climate evidence",
    "atmosphere",
    ["4.9.2.2"],
    written(
      "04c",
      "Evaluate the report's conclusion",
      "A report uses only the town data in 4(b) to claim: 'Population growth always increases a town's total electricity-related CO₂ emissions, regardless of its electricity mix.' Evaluate the claim and explain one limitation of drawing a universal conclusion from this dataset.",
      "The supplied example contradicts 'always': population increased but total electricity-related emissions decreased because the per-resident value fell enough. One town over two observations cannot establish a universal causal relationship; other factors such as the electricity mix and demand also affect emissions. Wider evidence and scrutiny of the method are needed.",
      [
        "Evaluate the universal claim using both population and total emissions.",
        "Recognise a limitation of the single-town evidence.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Rejects 'always' because the larger population accompanies a lower calculated total; allow an internally consistent interpretation of the student's preceding totals, without rewarding unsupported claims.",
        1,
      ],
      [
        "Explains a relevant limitation: only one town/two observations, confounding electricity mix or demand, or insufficient evidence to establish a universal causal relationship. Merely saying 'scientists disagree' is insufficient.",
        1,
      ],
    ],
  ),
  part(
    "4(d)",
    "Evaluating climate evidence",
    "atmosphere",
    ["4.9.2.3"],
    written(
      "04d",
      "Describe two climate effects",
      "Describe two different potential effects of global climate change.",
      "For example, rising sea levels can increase coastal flooding, and changes in temperature or rainfall can alter habitats and species distributions. Other valid effects include increased frequency/severity of some extreme weather events or changes to food production.",
      [
        "One valid potential effect.",
        "A second different valid potential effect.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Two distinct valid effects, one mark each. Linked sea-level rise and coastal flooding count as one developed effect rather than two independent examples. Acid rain, ozone depletion and global dimming are not climate-change effects for this question.",
        2,
      ],
    ],
  ),
];

export const higherPaper2CopperResources: ExamPart[] = [
  part(
    "5(a)",
    "Recovering copper",
    "resources",
    ["4.10.1.4", "4.1.1.1"],
    written(
      "05a",
      "Write the recovery equation",
      "A leachate contains copper(II) sulfate solution. Scrap iron is added to recover copper. Write the balanced symbol equation. State symbols are not required.",
      "Fe + CuSO4 → FeSO4 + Cu.",
      [
        "Correct iron sulfate and copper products.",
        "Balanced complete equation.",
      ],
      { shortWritten: true, writtenEquationKind: "symbol" },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Correct products FeSO4 and Cu from Fe and CuSO4, or Fe²⁺ and Cu in the equivalent ionic representation. Do not change sulfate to sulfide or claim iron(III) products.",
        1,
      ],
      [
        "Balanced symbol equation Fe + CuSO4 → FeSO4 + Cu, or equivalent proportional coefficients. A correctly balanced ionic equation Fe + Cu²⁺ → Fe²⁺ + Cu is a valid equivalent representation.",
        1,
      ],
    ],
  ),
  part(
    "5(b)",
    "Recovering copper",
    "resources",
    ["4.3.1.2", "4.3.1.3"],
    question(
      "05b",
      "Calculate the mineral's copper percentage",
      "A copper mineral has formula Cu₂CO₃(OH)₂. Calculate its percentage by mass of copper to 3 significant figures. Relative atomic masses: Cu = 63.5, C = 12, O = 16, H = 1. Show your working.",
      "57.5",
      {
        inputMode: "decimal",
        unit: "%",
        explanation:
          "Mr = 2 × 63.5 + 12 + 3 × 16 + 2 × (16 + 1) = 221. Copper contributes 127. Percentage = 127 / 221 × 100 = 57.466…%, giving 57.5%. The percentage is for this pure mineral compound, not for an entire low-grade ore.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      ["Calculates Mr = 221, including both OH groups and both Cu atoms.", 1],
      [
        "Uses the copper mass contribution 2 × 63.5 = 127 divided by the whole formula mass, multiplied by 100. Allow the preceding incorrect formula mass, but not a single-Cu numerator without correction.",
        1,
      ],
      [
        "Correctly evaluates and rounds to 57.5%. Allow correct evaluation/rounding of the preceding valid mass-fraction setup with an earlier incorrect denominator.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "5(c)",
    "Recovering copper",
    "analysis",
    ["4.8.3.1", "4.8.3.2"],
    written(
      "05c",
      "Test the copper-containing solution",
      "Describe a chemical test for copper(II) ions in a fresh sample of the solution and state the expected positive observation.",
      "Add sodium hydroxide solution: a blue precipitate forms. A valid flame test giving a green/blue-green flame is another accepted chemical identification.",
      ["A valid chemical test.", "The matching copper observation."],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Adds sodium hydroxide solution, or describes a valid clean-wire flame test.",
        1,
      ],
      [
        "Blue precipitate for sodium hydroxide, or green/blue-green flame for the flame test. The observation must match the proposed valid test; 'turns blue' alone does not identify a precipitate.",
        1,
      ],
    ],
    { practical: 7 },
  ),
  part(
    "5(d)",
    "Recovering copper",
    "resources",
    ["4.10.1.4"],
    written(
      "05d",
      "Describe phytomining",
      "Describe how phytomining produces material containing metal compounds from soil containing a small concentration of those compounds.",
      "Plants absorb metal compounds from the soil. The plants are harvested and burned, producing ash containing the metal compounds. Further processing is needed to obtain the metal itself.",
      [
        "Plants absorb metal compounds.",
        "Harvest and burn plants to obtain metal-compound-containing ash.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Plants absorb metal compounds from the soil; do not require or credit a claim that they directly absorb pieces of metal.",
        1,
      ],
      [
        "Harvests and burns the plants, leaving ash containing metal compounds. The ash is not claimed to be pure copper metal.",
        1,
      ],
    ],
  ),
  part(
    "5(e)",
    "Recovering copper",
    "resources",
    ["4.10.1.4"],
    written(
      "05e",
      "Evaluate the supplied bioleaching evidence",
      "For a low-grade deposit, conventional extraction moves much rock and uses high-temperature processing. Bioleaching moves less rock and needs no high-temperature stage, but takes several months. State one supported environmental advantage of bioleaching here.",
      "It can reduce energy use from high-temperature processing, or reduce damage/waste associated with moving large amounts of rock. The supplied evidence does not prove that all stages have zero emissions or no environmental impact.",
      ["One environmental advantage linked to the supplied comparison."],
      { shortWritten: true },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Links the supplied lower-temperature processing to reduced energy demand, or reduced rock movement to less landscape damage/rock waste. Unsupported claims of zero pollution or universally faster extraction are insufficient.",
        1,
      ],
    ],
  ),
];

export const higherPaper2Chromatography: ExamPart[] = [
  part(
    "6(a)",
    "Comparing chromatography conditions",
    "analysis",
    ["4.8.1.3"],
    written(
      "06a",
      "Identify two setup corrections",
      "A paper strip reaches down to 5 mm above the beaker base. Samples are placed on a baseline at 25 mm, drawn in water-soluble ink. Water initially reaches 30 mm above the base. Identify two changes needed before running the chromatogram.",
      "Draw the baseline in pencil rather than soluble ink. Lower the water level so that it reaches the paper but remains below the 25 mm sample origin; for example, 15 mm is suitable. The sample must not be immersed in the reservoir.",
      [
        "Use a pencil baseline.",
        "Water reaches the paper but remains below the sample origin.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Replace soluble ink with pencil so the baseline does not dissolve and travel with the solvent.",
        1,
      ],
      [
        "Lower the solvent level below 25 mm while it still reaches the paper at 5 mm. Any valid level in that interval is acceptable; the reference 15 mm is not uniquely required.",
        1,
      ],
    ],
    { practical: 6 },
  ),
  part(
    "6(b)",
    "Comparing chromatography conditions",
    "analysis",
    ["4.8.1.3"],
    question(
      "06b",
      "Predict the spot distance",
      "Under stated conditions, a dye has Rf = 0.625. The solvent front travels 120 mm from the sample origin. Calculate the distance from the origin to the centre of the dye spot. Show the formula and working.",
      "75",
      {
        inputMode: "decimal",
        unit: "mm",
        explanation:
          "Rf = spot distance / solvent-front distance. Rearranging gives spot distance = Rf × solvent-front distance = 0.625 × 120 = 75.0 mm. This is distance from the sample origin, not from the paper bottom.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      [
        "Uses Rf = spot distance / solvent-front distance, both measured from the origin.",
        1,
      ],
      [
        "Rearranges to spot distance = 0.625 × 120, rather than dividing 120 by Rf. The valid numerical setup can imply the formula when no contradictory formula is present.",
        1,
      ],
      [
        "Correctly evaluates 75 mm. Allow correct evaluation using an earlier mistaken numerical Rf or solvent distance when the rearranged multiplication method remains valid.",
        1,
      ],
    ],
    { mathematics: true, practical: 6 },
  ),
  part(
    "6(c)",
    "Comparing chromatography conditions",
    "analysis",
    ["4.8.1.3"],
    written(
      "06c",
      "Compare the stationary phases",
      "The same pure dye, solvent, temperature and solvent-front distance give Rf 0.35 on paper A and 0.50 on B. Which paper gives less dye travel? Explain using attraction to the stationary phase and time in the mobile phase.",
      "The dye travels less far on paper A. Its stronger attraction to paper A retains it more, so it spends a smaller proportion of the time in the moving solvent and travels less far with that mobile phase.",
      [
        "Less travel on paper A.",
        "Stronger stationary-phase attraction on A.",
        "Less relative time in the moving solvent.",
      ],
    ),
    3,
    [0, 1, 2],
    0,
    [
      [
        "Paper A: lower Rf with the same solvent-front distance means a smaller spot distance.",
        1,
      ],
      [
        "Explains stronger attraction/retention by the paper A stationary phase, rather than a difference in the dye's molecular mass.",
        1,
      ],
      [
        "Links the stronger stationary-phase retention to a smaller proportion of time in the moving solvent, hence less travel. A vague 'less soluble' claim without the stated phase relationship is insufficient.",
        1,
      ],
    ],
    { practical: 6 },
  ),
  part(
    "6(d)",
    "Comparing chromatography conditions",
    "analysis",
    ["4.8.1.3"],
    written(
      "06d",
      "Change another condition",
      "Apart from changing the stationary-phase paper, state one change that can alter a dye's Rf value.",
      "Use a different mobile-phase solvent or solvent mixture.",
      ["Change the mobile-phase solvent."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Change the solvent/mobile-phase composition. An appropriately explained temperature change is also scientifically valid. Merely running the front further under otherwise identical conditions does not change the ideal distance ratio.",
        1,
      ],
    ],
    { practical: 6 },
  ),
];

export const higherPaper2MassLossRates: ExamPart[] = [
  part(
    "7(a)",
    "Hydrogen peroxide mass loss",
    "rates",
    ["4.6.1.4"],
    written(
      "07a",
      "Explain the catalyst's action",
      "Explain why adding a catalyst increases the rate of hydrogen peroxide decomposition. Refer to the reaction pathway and activation energy.",
      "The catalyst provides an alternative reaction pathway with a lower activation energy. At the same temperature, a greater proportion of collisions can overcome this lower barrier.",
      ["Alternative reaction pathway.", "Lower activation energy."],
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Provides an alternative reaction pathway.", 1],
      [
        "That pathway has lower activation energy. Do not credit a claim that the catalyst raises the particles' temperature/energy or changes the overall reaction energy change.",
        1,
      ],
    ],
  ),
  part(
    "7(b)",
    "Hydrogen peroxide mass loss",
    "rates",
    ["4.6.1.1", "4.1.1.1"],
    written(
      "07b",
      "Explain the balance reading",
      "Hydrogen peroxide decomposes in an open flask: 2H₂O₂(aq) → 2H₂O(l) + O₂(g). The flask is on a balance. Explain why its measured mass decreases even though atoms are conserved.",
      "Oxygen gas is produced and escapes from the open flask. The balance measures only the flask and its remaining contents; atoms in escaped oxygen are no longer on the balance, so the recorded mass decreases without atoms being destroyed.",
      [
        "Oxygen gas leaves the flask.",
        "Connect escape with the balance's measured system.",
      ],
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Identifies the escaping substance as oxygen gas from the supplied equation.",
        1,
      ],
      [
        "Explains that escaped gas is no longer included in the balance reading, while total mass including it would be conserved. Do not credit destruction of atoms.",
        1,
      ],
    ],
  ),
  part(
    "7(c)",
    "Hydrogen peroxide mass loss",
    "rates",
    ["4.6.1.1"],
    question(
      "07c",
      "Calculate the instantaneous rate",
      "The graph shows an original constructed mass-loss curve and its supplied tangent at 50 s. Use two suitable points on the tangent to calculate the mass-loss rate at 50 s in g/s, to 2 significant figures. Show both changes and your working; do not calculate the whole-reaction mean rate.",
      "0.016",
      {
        inputMode: "decimal",
        unit: "g/s",
        tangentGraph: {
          curve: {
            start: 0,
            end: 100,
            max: 2,
            unit: "g",
            quantity: "Mass lost",
            origin: 0,
            a: -0.00016,
            b: 0.032,
            c: 0,
            at: 50,
            label:
              "Original exact constructed curve over 0–100 s; it reaches 1.60 g with zero slope at 100 s. This illustrative geometry is not a reported experimental dataset.",
          },
          line: [
            { t: 25, q: 0.8 },
            { t: 75, q: 1.6 },
          ],
          label:
            "Supplied tangent at 50 s. Read a gradient triangle on this tangent, rather than joining two points from the curved trace.",
        },
        explanation:
          "For example, tangent points (25 s, 0.80 g) and (75 s, 1.60 g) give Δmass = 0.80 g and Δtime = 50 s. Gradient = Δmass / Δtime = 0.80 / 50 = 0.016 g/s, already 2 significant figures. Other well-separated points on the same tangent give the same gradient within reading precision.",
      },
    ),
    4,
    [0, 4, 0],
    0,
    [
      [
        "Determines both changes between two suitable points on the supplied tangent, e.g. 0.80 g and 50 s. Allow other accurate tangent pairs; do not require these endpoint coordinates or use a chord between two points on the curved trace.",
        1,
      ],
      [
        "Uses tangent gradient = change in mass / change in time, with consistent g and s units. Allow correctly applying this method to earlier inaccurate tangent readings.",
        1,
      ],
      [
        "Correctly evaluates the positive mass-loss rate: about 0.016 g/s for this supplied tangent. Allow valid arithmetic after earlier incorrect changes when the tangent-gradient method is retained.",
        1,
      ],
      [
        "Expresses the evaluated rate to exactly 2 significant figures. Review raw answer/working: 0.016 and 1.6e-2 are valid; 0.0160 has 3 significant figures. Allow correctly formatting an earlier incorrect quotient.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "7(d)",
    "Hydrogen peroxide mass loss",
    "rates",
    ["4.6.1.1", "4.6.1.2"],
    written(
      "07d",
      "Predict the changed trace",
      "The original experiment eventually loses 1.60 g. A matched experiment uses the same volume but half the hydrogen peroxide concentration, with the same temperature and catalyst amount. Peroxide is the only reactant that determines the oxygen yield. State how the new mass-loss trace differs in initial steepness and final plateau.",
      "The new trace initially rises less steeply because the lower peroxide concentration gives a lower initial rate. Its final mass-loss plateau is 0.80 g because half as much peroxide produces half as much escaping oxygen. Both traces start at zero mass lost.",
      ["A less steep initial trace.", "A final plateau at 0.80 g."],
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "New trace has a smaller positive initial slope/lower initial mass-loss rate, rather than a steeper or negative trace.",
        1,
      ],
      [
        "Final plateau is 0.80 g because the initial amount of peroxide is halved. Do not require the new mass loss to be exactly half at every intermediate time.",
        1,
      ],
    ],
  ),
];

export const higherPaper2Polymers: ExamPart[] = [
  part(
    "8(a)",
    "Synthetic and natural polymers",
    "organic",
    ["4.7.3.1"],
    written(
      "08a",
      "Identify the reacting bond",
      "Which bond in an alkene monomer reacts during addition polymerisation?",
      "The carbon–carbon double bond, C=C.",
      ["C=C."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "The carbon–carbon double bond/C=C; a carbon–hydrogen single bond is not the reactive bond here.",
        1,
      ],
    ],
  ),
  part(
    "8(b)",
    "Synthetic and natural polymers",
    "organic",
    ["4.7.3.1"],
    written(
      "08b",
      "Build the repeat",
      "Draw the polymer repeat with all original attachments, both continuation bonds, brackets and n.",
      "A two-carbon backbone joined by C–C. One backbone carbon carries H and F; the other carries H and CH3. Both single continuation bonds pass through brackets, with lower-case n outside at the lower right. Equivalent reversed or rotated orientations are valid, provided the attachment pattern is preserved.",
      [
        "Single C–C backbone.",
        "Correct retained substituent pattern.",
        "Complete continuation, bracket and n notation.",
      ],
      {
        polymerisationGiven: { groups: ["H", "F", "H", "CH3"], polymer: false },
        polymerisationDrawing: {
          kind: "repeat",
          note: "The supplied alkene contains fluorine and a CH₃ side group. Construct a monomer-derived two-carbon repeat from blank choices; the displayed crop does not specify whole-chain end groups.",
        },
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      ["Changes the reacting double bond into a single C–C backbone bond.", 1],
      [
        "Retains H and F together on one backbone carbon and H and CH3 together on the other. Accept equivalent reversed/rotated drawings; matching the total formula without correct attachment is insufficient.",
        1,
      ],
      [
        "Shows a single chain continuation through each bracket and lower-case n outside at lower right. Total bond order at each backbone carbon is four; do not add terminal H to this repeat crop.",
        1,
      ],
    ],
  ),
  part(
    "8(c)",
    "Synthetic and natural polymers",
    "resources",
    ["4.10.3.3"],
    written(
      "08c",
      "Classify the combined material",
      "Glass fibres are embedded in a polymer-resin matrix. What general class of material is this?",
      "A composite.",
      ["Composite."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Composite/composite material, rather than an alloy or a single pure polymer.",
        1,
      ],
    ],
  ),
  part(
    "8(d)",
    "Synthetic and natural polymers",
    "organic",
    ["4.7.3.2", "4.7.3.3"],
    written(
      "08d",
      "Identify the condensation by-product",
      "An amino group reacts with a carboxylic acid group when amino acids join by condensation polymerisation. Name the small molecule eliminated when each link forms.",
      "Water.",
      ["Water/H2O."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Water/H2O. Do not claim that every kind of condensation necessarily releases water; this question specifies amino and carboxylic acid groups.",
        1,
      ],
    ],
  ),
  part(
    "8(e)",
    "Synthetic and natural polymers",
    "organic",
    ["4.7.3.3", "4.3.1.2"],
    question(
      "08e",
      "Calculate the amino-acid spacer contribution",
      "An amino acid has the supplied formula H₂N–R–COOH and relative molecular mass 89. R is an intervening group whose formula is not supplied. Calculate R's relative-mass contribution. Relative atomic masses: H = 1, C = 12, N = 14, O = 16. Show your working.",
      "28",
      {
        inputMode: "decimal",
        explanation:
          "The shown NH2 and COOH groups contribute (14 + 2) + (12 + 2 × 16 + 1) = 61. R contributes 89 − 61 = 28. This calculation does not uniquely identify R's structure.",
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Correctly calculates the combined NH2 and COOH contribution as 61, counting all shown atoms.",
        1,
      ],
      [
        "Subtracts that contribution from 89 to obtain 28. Allow correct subtraction of a preceding incorrect group total; do not require an invented unique structural formula for R.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "8(f)",
    "Synthetic and natural polymers",
    "organic",
    ["4.7.3.3"],
    written(
      "08f",
      "Name the amino-acid polymer class",
      "What term describes the polymers formed when amino acids join by condensation?",
      "Polypeptides.",
      ["Polypeptides."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Polypeptides; accept proteins as the relevant natural polymer class, or correctly explained polyamides. Do not require students to describe protein folding for this mark.",
        1,
      ],
    ],
  ),
  part(
    "8(g)",
    "Synthetic and natural polymers",
    "organic",
    ["4.7.3.4"],
    written(
      "08g",
      "Recall a glucose-based polymer",
      "Name one naturally occurring polymer made from glucose-derived units.",
      "Starch or cellulose. Glycogen is another scientifically valid example.",
      ["One valid glucose-derived natural polymer."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "One of starch, cellulose or glycogen, or another scientifically valid glucose-derived natural polymer. Do not imply that a generic glucose-unit description uniquely identifies starch.",
        1,
      ],
    ],
  ),
  part(
    "8(h)",
    "Synthetic and natural polymers",
    "organic",
    ["4.7.3.4"],
    written(
      "08h",
      "Describe DNA's units and shape",
      "Name the type of small repeating units in DNA and describe the shape of its two polymer chains.",
      "DNA consists of nucleotide units. Its two chains form a double helix.",
      ["Nucleotides.", "Double helix."],
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Nucleotide units (DNA uses four types).", 1],
      [
        "The two chains form a double helix; 'DNA' alone is not a shape description.",
        1,
      ],
    ],
  ),
];
higherPaper2Polymers.find((p) => p.number === "8(b)")!.referenceConstruction =
  JSON.stringify({
    ...blankPolymerisationDrawing(),
    s0: "H",
    s1: "F",
    s2: "H",
    s3: "CH3",
    bond: "1",
    left: "1",
    right: "1",
    brackets: "1",
    countMark: "n",
  });

export const higherPaper2Equilibrium: ExamPart[] = [
  part(
    "9(a)",
    "Reversible changes and equilibrium",
    "rates",
    ["4.6.2.1", "4.3.1.3"],
    question(
      "09a",
      "Scale the dehydration result",
      "Heating 5.00 g of a hydrated salt to constant mass leaves 3.20 g of anhydrous salt. Only water is lost. Calculate the mass of water lost when 9.00 g of the same hydrated salt is completely dehydrated. Show your working.",
      "3.24",
      {
        inputMode: "decimal",
        unit: "g",
        explanation:
          "Water lost from 5.00 g = 5.00 − 3.20 = 1.80 g. Scale factor = 9.00 / 5.00 = 1.80. Water lost from 9.00 g = 1.80 × 1.80 = 3.24 g. Equivalently, scale the anhydrous mass to 5.76 g and subtract from 9.00 g.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      [
        "Finds original water loss as 1.80 g, or correctly sets up the original anhydrous fraction 3.20/5.00 for the alternative method.",
        1,
      ],
      [
        "Scales the relevant mass fraction to 9.00 g, e.g. 1.80 × 9.00/5.00 or scaled anhydrous mass 3.20 × 9.00/5.00. Allow valid scaling of an earlier incorrect water loss.",
        1,
      ],
      [
        "Obtains 3.24 g water lost, including subtracting scaled anhydrous mass from 9.00 g where that method is used. Allow valid later arithmetic after an earlier error; do not report anhydrous mass as water loss.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "9(b)",
    "Reversible changes and equilibrium",
    "rates",
    ["4.6.2.2"],
    question(
      "09b",
      "Calculate the reverse energy transfer",
      "Dehydrating the 5.00 g sample in 9(a) absorbs 2.20 kJ. Calculate the energy released when 8.00 g of its anhydrous salt reacts with sufficient water to reform the same hydrate. Assume the stated transfer scales with amount and there is no heat loss. Show your working.",
      "5.50",
      {
        inputMode: "decimal",
        unit: "kJ",
        explanation:
          "The reverse of dehydrating 5.00 g hydrate starts with 3.20 g anhydrous salt and releases 2.20 kJ. For 8.00 g anhydrous salt, released energy = 2.20 × 8.00 / 3.20 = 5.50 kJ. Use the anhydrous mass basis, not the original 5.00 g hydrate basis.",
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Uses 2.20 kJ per 3.20 g anhydrous salt and scales by 8.00/3.20. Reversing the reaction transfers the same magnitude for equivalent chemical amounts; do not use 5.00 g as the anhydrous denominator.",
        1,
      ],
      [
        "Correctly evaluates 5.50 kJ released. Allow correct evaluation of a preceding incorrect mass basis, but not a claim that hydration absorbs this energy. A negative reaction-energy value clearly labelled as 5.50 kJ released is equivalent.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "9(c)",
    "Reversible changes and equilibrium",
    "rates",
    ["4.6.2.4", "4.6.2.5"],
    written(
      "09c",
      "Explain the temperature effect",
      "For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), the forward reaction is exothermic. State what happens to the equilibrium proportion of ammonia when temperature increases, and explain why.",
      "The equilibrium proportion of ammonia decreases. Increasing temperature favours the endothermic reverse reaction, opposing the temperature increase and shifting equilibrium towards nitrogen and hydrogen.",
      [
        "Equilibrium ammonia proportion decreases.",
        "Endothermic reverse direction is favoured.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Equilibrium shifts towards reactants/the equilibrium proportion of ammonia decreases.",
        1,
      ],
      [
        "Higher temperature favours the endothermic reverse reaction. A rate increase alone does not explain the equilibrium composition.",
        1,
      ],
    ],
  ),
  part(
    "9(d)",
    "Reversible changes and equilibrium",
    "rates",
    ["4.6.2.4", "4.6.2.7"],
    written(
      "09d",
      "Evaluate the pressure prediction",
      "For H₂(g) + I₂(g) ⇌ 2HI(g), a student claims: 'Increasing pressure shifts equilibrium towards hydrogen iodide because its molecules are smaller.' Evaluate this prediction using the equation. Temperature remains constant.",
      "The predicted shift is incorrect. Both sides have two moles of gas in the equation, so increasing pressure does not favour either side or change the equilibrium proportions. Molecular size is not the deciding comparison.",
      [
        "Rejects the proposed equilibrium shift.",
        "Equal gas-mole counts explain no pressure preference.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Rejects the claim of an equilibrium shift towards HI; the equilibrium proportions do not change at fixed temperature.",
        1,
      ],
      [
        "Supports that judgment with equal gas-mole counts: 1 + 1 on the left and 2 on the right. A claim about molecular size does not establish a pressure preference.",
        1,
      ],
    ],
  ),
  part(
    "9(e)",
    "Reversible changes and equilibrium",
    "rates",
    ["4.6.1.4", "4.6.2.3"],
    written(
      "09e",
      "Evaluate the catalyst claim",
      "For the ammonia equilibrium in 9(c), a student claims: 'A catalyst increases the final equilibrium proportion of ammonia because it speeds up ammonia formation.' Evaluate the claim and give the relevant reason.",
      "The claim is incorrect: a catalyst does not change the equilibrium proportions. It speeds up both forward and reverse reactions, so the same equilibrium composition is reached sooner.",
      [
        "Rejects a changed equilibrium proportion.",
        "Both directions speed up, so equilibrium is reached sooner.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Rejects the claimed increase in final equilibrium ammonia proportion: the catalyst does not shift equilibrium.",
        1,
      ],
      [
        "Explains that both forward and reverse reactions speed up, so the same equilibrium is reached sooner. Speeding only the forward reaction is insufficient.",
        1,
      ],
    ],
  ),
  part(
    "9(f)",
    "Reversible changes and equilibrium",
    "rates",
    ["4.6.2.3"],
    written(
      "09f",
      "Explain constant equilibrium concentrations",
      "Explain why reactant and product concentrations remain constant at dynamic equilibrium. Do their concentrations have to be equal?",
      "Forward and reverse reactions continue at equal rates, so each substance is formed and used at equal rates and its concentration remains constant. Reactant and product concentrations do not have to be equal to one another.",
      [
        "Continuing forward and reverse reactions have equal rates.",
        "No net concentration change; equal concentrations are not required.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Forward and reverse reactions continue at the same rate; they have not stopped.",
        1,
      ],
      [
        "This gives no net concentration change, without requiring equal reactant and product concentrations. 'It is a closed system' alone does not explain this rate balance.",
        1,
      ],
    ],
  ),
];

export const higherPaper2Fertilisers: ExamPart[] = [
  part(
    "10(a)",
    "Selecting fertiliser formulations",
    "resources",
    ["4.10.4.2", "4.8.1.2"],
    written(
      "10a",
      "Evaluate a fertiliser blend",
      "The soil lacks nitrogen and potassium but has enough phosphorus. Use the supplied nutrient percentages and costs to recommend and evaluate a fertiliser blend. Exact blend masses are not required.",
      "A blend of A and B is well supported: A supplies the deficient potassium, while B supplies the deficient nitrogen without adding phosphorus that the soil does not need. B also costs less per kg than C while supplying a higher nitrogen percentage, so it costs less for a given nitrogen amount. Neither A nor B alone supplies both deficient nutrients. A and C can supply both deficient nutrients, but C adds unnecessary phosphorus and has a higher cost for a given nitrogen amount. Judge the whole recommendation and its supported reasoning, not a count of isolated table facts.",
      [
        "A supported blend recommendation meeting both deficient nutrients.",
        "Relevant nutrient and economic comparisons.",
        "A whole-response judgment that recognises limitations/trade-offs.",
      ],
      {
        haberGiven: {
          title: "Fertiliser options",
          note: "A: potassium sulfate. B: ammonium sulfate. C: ammonium dihydrogen phosphate. Percentages are rounded elemental mass percentages; costs are per kg of salt.",
          table: {
            caption: "Supplied nutrient content and cost",
            head: ["Salt", "N / %", "P / %", "K / %", "£ / kg"],
            rows: [
              ["A", "0", "0", "45", "0.60"],
              ["B", "21", "0", "0", "0.35"],
              ["C", "12", "27", "0", "0.70"],
            ],
          },
        },
      },
    ),
    4,
    [0, 0, 4],
    0,
    [],
    {
      levels: [
        {
          min: 3,
          max: 4,
          text: "A supported judgment uses sufficient linked reasons from nutrient requirements and cost. A + B is strongly supported because it supplies deficient N and K without unnecessary P, and B's lower cost/higher N fraction improves cost per nitrogen amount compared with C. Award 4 for a secure developed evaluation and 3 for a supported judgment with a minor omission. A different recommendation must be evaluated honestly against the supplied requirements and trade-offs, not awarded merely for naming two salts.",
        },
        {
          min: 1,
          max: 2,
          text: "Some relevant nutrient/cost links support a simple or partly developed judgment, but the evaluation is incomplete, misses a deficient nutrient, or does not adequately support its recommendation. Award 2 for more developed relevant reasoning and 1 for limited relevant reasoning.",
        },
        { min: 0, max: 0, text: "No relevant content." },
      ],
    },
  ),
  part(
    "10(b)",
    "Selecting fertiliser formulations",
    "resources",
    ["4.10.4.2"],
    written(
      "10b",
      "Recall another potassium source",
      "Name a potassium salt other than potassium sulfate that can be used in fertiliser production.",
      "Potassium chloride or potassium nitrate.",
      ["A valid alternative potassium salt."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "A valid potassium salt such as potassium chloride or potassium nitrate. Potassium sulfate is explicitly excluded; elemental potassium is not a salt.",
        1,
      ],
    ],
  ),
  part(
    "10(c)",
    "Selecting fertiliser formulations",
    "resources",
    ["4.10.4.2"],
    written(
      "10c",
      "Recall the nitric-acid feedstock",
      "Which nitrogen-containing substance is used industrially to manufacture nitric acid for fertiliser production?",
      "Ammonia.",
      ["Ammonia/NH3."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Ammonia/NH3. The question asks for the nitrogen-containing manufacturing feedstock, not a nitric-acid reaction product.",
        1,
      ],
    ],
  ),
  part(
    "10(d)",
    "Selecting fertiliser formulations",
    "resources",
    ["4.10.4.2"],
    written(
      "10d",
      "Explain why phosphate rock is treated",
      "Why cannot insoluble phosphate rock be used directly to supply phosphorus effectively as a fertiliser?",
      "Its phosphorus-containing compounds are insoluble, so the needed phosphate is not available in solution for uptake by plant roots. Treatment produces more soluble usable compounds.",
      ["Insolubility prevents effective dissolved nutrient uptake."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Links insolubility with phosphate not being available in solution for effective root uptake. 'It is impure' or 'it is a rock' alone is insufficient.",
        1,
      ],
    ],
  ),
  part(
    "10(e)",
    "Selecting fertiliser formulations",
    "resources",
    ["4.10.4.2"],
    written(
      "10e",
      "Recall the sulfuric-acid products",
      "Name the two calcium salts in the fertiliser product made by treating phosphate rock with sulfuric acid.",
      "Calcium sulfate and calcium phosphate (more precisely, calcium dihydrogen phosphate/monocalcium phosphate in single superphosphate).",
      ["Calcium sulfate and calcium phosphate."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Both calcium sulfate and calcium phosphate; accept the more precise calcium dihydrogen phosphate/monocalcium phosphate. Single superphosphate alone names the mixture but does not supply the two requested salt names.",
        1,
      ],
    ],
  ),
];

export const paper2HigherFull: ExamPaper = {
  id: "paper-2-higher-full",
  totalMarks: 100,
  minutes: 105,
  parts: [
    ...higherPaper2RateInvestigation,
    ...higherPaper2Alcohols,
    ...higherPaper2IonAnalysis,
    ...higherPaper2Climate,
    ...higherPaper2CopperResources,
    ...higherPaper2Chromatography,
    ...higherPaper2MassLossRates,
    ...higherPaper2Polymers,
    ...higherPaper2Equilibrium,
    ...higherPaper2Fertilisers,
  ],
};

// Direct recall equivalents individually checked against their actual prompts
// and responses. The existing exposure lookup supplies the reverse direction;
// no original lesson or earlier paper record is rewritten here.
const reviewedRecallLinks: Record<string, string[]> = {
  "01a": ["rp-v1-p-late-start", "chem-p2f-full-v1-01a"],
  "01c": ["ct-v1-p-frequency-explain"],
  "02d": ["alc-v1-p-oxidise", "chem-p2f-full-v1-05b"],
  "02e": ["alc-v1-r-ester", "alc-v1-p-ester"],
  "03a": ["ion-tests-v1-p-k2so4"],
  "03b": ["instrumental-analysis-v1-p-method", "chem-p2f-full-v1-07b"],
  "03c": [
    "instrumental-analysis-v1-p-sensitive",
    "instrumental-analysis-v1-r-rapid",
  ],
  "04a": ["greenhouse-v1-p-mechanism", "chem-p2f-full-v1-08a"],
  "05d": ["bio-v1-p-phyto"],
  "06a": [
    "chromatography-v1-p-pencil",
    "chromatography-v1-p-immersed",
    "chem-p2f-full-v1-06a",
  ],
  "06c": ["chromatography-v1-p-explain", "chem-p2f-full-v1-06d"],
  "07a": ["tc-v1-p-catalyst-written", "chem-p2f-full-v1-01d"],
  "08a": ["pol-v1-r-double"],
  "08d": ["natural-v1-p-water-origin"],
  "08f": ["natural-v1-p-protein"],
  "08g": ["natural-v1-p-starch", "natural-v1-p-cellulose"],
  "08h": ["natural-v1-p-dna-unit", "natural-v1-p-dna-shape"],
  "09d": ["es-v1-p-equal"],
  "09e": ["es-v1-p-catalyst-written"],
  "09f": ["re-v1-p-dynamic-written"],
  "10d": ["haber-v1-p-rock"],
  "10e": ["haber-v1-source-recall-p-products"],
};
for (const [suffix, aliases] of Object.entries(reviewedRecallLinks)) {
  paper2HigherFull.parts.find(
    (p) => p.question.id === prefix + suffix,
  )!.question.exposureAliases = aliases;
}
