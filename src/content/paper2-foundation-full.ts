import type { Question } from "./types";
import type { ExamPaper, ExamPart, PaperCriterion } from "./exam-paper-types";
import { emptyOrganicDrawing } from "../lib/organic-drawing";
import { blankPolymerisationDrawing } from "../lib/polymerisation-board";
import { emptyFuelDrawing } from "../lib/fuel-drawing";

const prefix = "chem-p2f-full-v1-";
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

// Individually authored Paper 2 with original givens and conservative recall links.
const rateInvestigation: ExamPart[] = [
  part(
    "1(a)",
    "Collecting carbon dioxide",
    "rates",
    ["4.6.1.1"],
    written(
      "01a",
      "Retain the gas",
      "A student adds marble chips to dilute hydrochloric acid, fits a stopper connected to a gas syringe and starts a timer. Explain why the stopper should be fitted promptly.",
      "Carbon dioxide is produced as soon as the reactants mix. Promptly fitting the stopper reduces gas escaping before it reaches the syringe.",
      ["Reduce loss of newly produced gas before collection begins."],
      { shortWritten: true },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Reduce escape of produced gas before it can be measured. 'Make it accurate' alone is insufficient.",
        1,
      ],
    ],
    { practical: 5 },
  ),
  part(
    "1(b)",
    "Collecting carbon dioxide",
    "rates",
    ["4.6.1.1"],
    question(
      "01b",
      "Calculate the collection time",
      "Repeat rates are 0.60, 0.62, 0.30 and 0.64 cm³/s. Exclude the anomalous result. Use the mean remaining rate to estimate the time for 31.0 cm³. Use rate = volume ÷ time; show your working.",
      "50",
      {
        unit: "s",
        inputMode: "decimal",
        tolerance: 0.1,
        explanation:
          "Exclude 0.30. Mean rate=(0.60+0.62+0.64)/3=0.62 cm³/s. Time=31.0/0.62=50.0 s. A correct final number does not automatically award method or anomaly credit.",
      },
    ),
    4,
    [0, 3, 1],
    1,
    [
      [
        "Exclude 0.30 cm³/s as inconsistent with the three clustered repeats.",
        1,
      ],
      [
        "Correct mean of the retained three rates:0.62 cm³/s. A correctly calculated mean including the anomaly can earn this calculation point, but not the exclusion point.",
        1,
      ],
      [
        "Use time = 31.0/mean rate. Allow a valid rearrangement using the student's previous mean, with consistent units.",
        1,
      ],
    ],
    { mathematics: true, practical: 5 },
  ),
  part(
    "1(c)",
    "Collecting carbon dioxide",
    "rates",
    ["4.6.1.3"],
    written(
      "01c",
      "Explain a temperature change",
      "Matched trials use the same acid concentration, acid volume, marble mass and chip size. Explain why raising the temperature increases the initial reaction rate, using collision theory.",
      "Particles have more kinetic energy and move faster. Collisions are more frequent, and a greater proportion have energy at least equal to the activation energy, increasing successful collisions per second.",
      [
        "Greater kinetic energy/faster particles.",
        "More frequent collisions.",
        "Greater proportion of collisions can overcome the activation energy.",
      ],
    ),
    3,
    [1, 2, 0],
    0,
    [
      ["Particles gain kinetic energy/move faster.", 1],
      ["Collision frequency increases, linked to the faster motion.", 1],
      [
        "A larger proportion of collisions reach activation energy, increasing successful collisions per unit time. More collisions alone does not earn this point.",
        1,
      ],
    ],
    { practical: 5 },
  ),
  part(
    "1(d)",
    "A different reaction",
    "rates",
    ["4.6.1.4"],
    written(
      "01d",
      "Describe a catalyst",
      "In a separate reaction, a catalyst increases the rate. State what it does to the activation energy and whether it is used up overall.",
      "It provides a different reaction pathway with lower activation energy and is not used up overall.",
      [
        "Lower activation energy through an alternative pathway.",
        "Not used up overall.",
      ],
      { shortWritten: true },
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Lower activation energy (an alternative pathway is a valid explanation).",
        1,
      ],
      [
        "Not used up overall; unchanged at the end. It may participate in intermediate steps.",
        1,
      ],
    ],
  ),
];

const reversibleChanges: ExamPart[] = [
  part(
    "2(a)",
    "Hydrated copper sulfate",
    "rates",
    ["4.6.2.1"],
    written(
      "02a",
      "Explain reversibility",
      "What makes a chemical reaction reversible?",
      "Its products can react to form the original reactants.",
      ["Products can form the original reactants."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Products react to form the original reactants. Merely saying it can happen twice is insufficient.",
        1,
      ],
    ],
  ),
  part(
    "2(b)",
    "Hydrated copper sulfate",
    "rates",
    ["4.6.2.1", "4.1.1.1"],
    written(
      "02b",
      "Write the reversible equation",
      "Heating hydrated copper sulfate produces anhydrous copper sulfate and water. Write the complete word equation, using a reversible arrow.",
      "hydrated copper sulfate ⇌ anhydrous copper sulfate + water",
      [
        "Correct named reactant and both products.",
        "Reversible arrow between reactants and products.",
      ],
      { writtenEquations: true },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Hydrated copper sulfate on the reactant side; anhydrous copper sulfate and water on the product side.",
        1,
      ],
      [
        "A two-way/reversible arrow. An explicitly described two-way arrow in text is acceptable in this input.",
        1,
      ],
    ],
  ),
  part(
    "2(c)",
    "Heating to constant mass",
    "rates",
    ["4.6.2.1"],
    written(
      "02c",
      "Judge completion",
      "A sample is heated, cooled and weighed repeatedly. After heating cycles 1–4, the sample masses are 1.70, 1.64, 1.60 and 1.60 g. Explain what supports stopping after cycle 4 and why cooling before weighing is part of the method.",
      "Cycles 3 and 4 give the same mass, supporting that no further water is being lost under these conditions. Cool before weighing so the hot sample does not give an unreliable balance reading; compare readings at the same temperature.",
      [
        "Repeated equal masses support no further water loss under the procedure.",
        "Cool for reliable comparable balance readings.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Two successive readings are both 1.60 g: constant mass supports completion under the given heating conditions, rather than a single low mass proving it.",
        1,
      ],
      [
        "Cooling prevents unreliable readings from a hot container/sample or permits comparable measurements at the same temperature. 'So it is safe' alone does not explain weighing reliability.",
        1,
      ],
    ],
  ),
  part(
    "2(d)",
    "Heating to constant mass",
    "rates",
    ["4.3.1.1", "4.6.2.1"],
    question(
      "02d",
      "Calculate the water lost",
      "The initial hydrated sample has mass 2.50 g. Its final constant mass is 1.60 g. Assume water is the only material lost. Calculate the mass of water lost. Show your working.",
      "0.90",
      {
        unit: "g",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Water lost=2.50−1.60=0.90 g. Both masses refer to the sample, excluding its container.",
      },
    ),
    2,
    [0, 2, 0],
    1,
    [
      [
        "Subtract final sample mass from initial sample mass:2.50−1.60. Correct final answer with no contradictory working can support this method point on manual review.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "2(e)",
    "Opposite energy transfers",
    "rates",
    ["4.6.2.2"],
    question(
      "02e",
      "Reverse the energy transfer",
      "For a specified amount of hydrated salt, the forward reaction absorbs 6.40 kJ. Exactly the same amount is formed in the reverse reaction. How much energy does the reverse reaction release?",
      "6.40",
      {
        unit: "kJ",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Opposite directions transfer equal amounts of energy with opposite signs, for the same amount of material.",
      },
    ),
    1,
    [0, 1, 0],
    1,
    [],
  ),
  part(
    "2(f)",
    "Opposite energy transfers",
    "rates",
    ["4.6.2.2"],
    written(
      "02f",
      "Describe an endothermic reaction",
      "State what 'endothermic' means. Predict the change in the temperature of the surroundings if heat is not supplied to replace the transferred energy.",
      "Energy is taken in from the surroundings. Their temperature decreases if that energy is not replaced.",
      [
        "Energy transferred from surroundings to reaction.",
        "Surroundings cool when that energy is not replaced.",
      ],
      { shortWritten: true },
    ),
    2,
    [1, 1, 0],
    0,
    [
      [
        "Energy is absorbed from the surroundings, with the direction identified.",
        1,
      ],
      [
        "The surroundings decrease in temperature under the stated condition. Do not describe atoms themselves as cooling or shrinking.",
        1,
      ],
    ],
  ),
];

const hydrocarbonFeedstocks: ExamPart[] = [
  part(
    "3(a)",
    "Separating and processing crude oil",
    "organic",
    ["4.7.1.2"],
    written(
      "03a",
      "Explain fractional distillation",
      "Describe how fractional distillation separates the hydrocarbons in crude oil into fractions. Refer to evaporation, the temperature of the column and condensation.",
      "Heating evaporates hydrocarbons. The column is hotter at the bottom and cooler at the top. Hydrocarbons condense at different heights because they have different boiling points, giving fractions with similar boiling ranges.",
      [
        "Heating evaporates hydrocarbons.",
        "Column has a temperature gradient, cooler at the top.",
        "Different boiling points give condensation at different heights.",
      ],
    ),
    3,
    [3, 0, 0],
    0,
    [
      [
        "Heating causes evaporation of hydrocarbons; this is a physical separation, not cracking.",
        1,
      ],
      ["The column is hotter below and cooler above.", 1],
      [
        "Hydrocarbons condense at different levels according to boiling point, with higher-boiling hydrocarbons condensing lower. Fractions need not be single pure compounds.",
        1,
      ],
    ],
  ),
  part(
    "3(b)",
    "Separating and processing crude oil",
    "organic",
    ["4.7.1.4", "4.1.1.1"],
    written(
      "03b",
      "Write the cracking equation",
      "Cracking an alkane with formula C₁₀H₂₂ produces ethene, C₂H₄, and one alkane. Write the complete balanced symbol equation for these two products.",
      "C10H22 → C8H18 + C2H4",
      [
        "Remaining alkane has formula C8H18.",
        "Complete equation conserves both atom types.",
      ],
      { writtenEquations: true },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Remaining alkane C8H18; count the atoms left after one C2H4 molecule.",
        1,
      ],
      [
        "Complete balanced equation C10H22→C8H18+C2H4, with either product order. A formula without a complete equation does not earn this point.",
        1,
      ],
    ],
  ),
  part(
    "3(c)",
    "Separating and processing crude oil",
    "organic",
    ["4.7.1.4"],
    written(
      "03c",
      "Test for an alkene",
      "Describe a test that distinguishes ethene from ethane. State the visible result for ethene.",
      "Shake the gas with bromine water. Ethene changes it from orange to colourless; ethane does not under these test conditions.",
      [
        "Use bromine water.",
        "Orange bromine water becomes colourless with ethene.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Add/shake with bromine water.", 1],
      [
        "Orange to colourless/decolourisation for ethene, linked to the correct reagent. A colour change for an unrelated test does not earn this point.",
        1,
      ],
    ],
  ),
  part(
    "3(d)",
    "Choosing a supplied fuel fraction",
    "organic",
    ["4.7.1.3"],
    written(
      "03d",
      "Use property evidence",
      "A fuel system needs a liquid that pumps easily and vaporises at relatively low temperature. Supplied fraction K has low viscosity and boiling range 50–80°C; fraction L has high viscosity and boiling range 250–300°C. Choose a fraction and justify it using both properties. Treat these as illustrative supplied measurements.",
      "Choose K: its lower viscosity makes it easier to pump and its lower boiling range permits vaporisation at lower temperature.",
      [
        "Low viscosity linked to easy pumping.",
        "Low boiling range linked to lower-temperature vaporisation.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Choose K and link its lower viscosity to easier pumping. Merely quoting 'low' is insufficient.",
        1,
      ],
      [
        "Choose K and link its lower boiling range to vaporisation at lower temperature. Both linked justifications concern the selected fraction.",
        1,
      ],
    ],
  ),
  part(
    "3(e)",
    "Hydrocarbon composition",
    "organic",
    ["4.7.1.1"],
    written(
      "03e",
      "Define a hydrocarbon",
      "What elements does a hydrocarbon contain?",
      "Carbon and hydrogen only.",
      ["Carbon and hydrogen only."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Carbon and hydrogen only; naming oxygen or another element contradicts the definition.",
        1,
      ],
    ],
  ),
];

const polymersAndMaterials: ExamPart[] = [
  part(
    "4(a)",
    "An addition polymer",
    "organic",
    ["4.7.3.1"],
    written(
      "04a",
      "Construct a repeating unit",
      "Draw this alkene’s polymer repeating unit. Include continuation bonds, brackets and n.",
      "A two-carbon backbone with a single C–C bond; three H and one C2H5 substituent on their original carbons. Single continuation bonds cross both brackets; lower-case n is outside at lower right. Rotated or reversed equivalent diagrams are valid.",
      [
        "Correct two-carbon backbone and retained side-group attachments.",
        "Both continuation bonds, brackets and lower-case n outside.",
      ],
      {
        polymerisationGiven: {
          groups: ["H", "H", "H", "C2H5"],
          polymer: false,
        },
        polymerisationDrawing: {
          kind: "repeat",
          note: "Keep the supplied monomer fixed; C₂H₅ denotes a side group. Construct your repeat from blank choices. The crop does not display the complete chain or end groups.",
        },
        exposureAliases: ["pol-v1-p-but1"],
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Two singly joined backbone carbons with the original 3H and C2H5 attachments retained. Each backbone carbon has total bond order 4; reversed/rotated equivalent units are valid.",
        1,
      ],
      [
        "Single continuation bonds through both brackets and lower-case n outside. A complete small molecule without repeat notation does not earn this point.",
        1,
      ],
    ],
  ),
  part(
    "4(b)",
    "An addition polymer",
    "organic",
    ["4.7.3.1"],
    written(
      "04b",
      "Name the small molecules",
      "What term describes the small molecules that join together to form a polymer?",
      "Monomers.",
      ["Monomers."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [["Monomers, not repeating units or catalysts.", 1]],
  ),
  part(
    "4(c)",
    "Borosilicate glass",
    "resources",
    ["4.10.3.3"],
    written(
      "04c",
      "Recall the glass raw materials",
      "Name the two raw materials used to make borosilicate glass.",
      "Sand and boron trioxide.",
      ["Sand.", "Boron trioxide."],
      { shortWritten: true },
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Sand/silica/silicon dioxide, appropriate to this raw-material context.",
        1,
      ],
      [
        "Boron trioxide/boron oxide B2O3. Sodium carbonate and limestone belong to the soda-lime recipe.",
        1,
      ],
    ],
  ),
  part(
    "4(d)",
    "Selecting a heating vessel",
    "resources",
    ["4.10.3.3"],
    written(
      "04d",
      "Justify the material choice",
      "Supplied test information: a borosilicate-glass vessel does not burn and starts melting at 850°C; a poly(propene) vessel burns and starts melting at 160°C. A process needs direct-flame heating with the vessel reaching 200°C. Select the suitable material using both relevant properties.",
      "Borosilicate glass: its supplied melting temperature is above 200°C and it does not burn. Poly(propene) starts melting below the required temperature and is flammable.",
      [
        "Select glass using its melting temperature relative to 200°C.",
        "Select glass using non-flammability.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Select borosilicate glass and compare 850°C with the required 200°C (or reject polymer because 160°C is below 200°C).",
        1,
      ],
      [
        "Link the glass choice to not burning (or reject polymer because it burns under a flame). Both reasons must support the actual selection.",
        1,
      ],
    ],
  ),
  part(
    "4(e)",
    "Composite materials",
    "resources",
    ["4.10.3.3"],
    written(
      "04e",
      "Recall a composite and its structure",
      "Give one example of a composite material and identify its matrix or binder and its reinforcement.",
      "Fibreglass: polymer resin is the matrix, surrounding and binding the glass-fibre reinforcement. Other valid composite examples can be reviewed.",
      [
        "A valid named composite.",
        "Correct matrix/binder and reinforcement roles for that example.",
      ],
      { exposureAliases: ["materials-v1-composite-recall-p-examples"] },
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "A valid composite such as fibreglass, carbon-fibre-reinforced polymer or reinforced concrete. A single constituent or homogeneous alloy alone is insufficient.",
        1,
      ],
      [
        "For that composite, correctly identify both the matrix/binder and reinforcement: e.g. resin/glass fibres or concrete/steel bars. Accept scientifically valid alternative composites and constituents.",
        1,
      ],
    ],
  ),
  part(
    "4(f)",
    "Polymer structure",
    "resources",
    ["4.10.3.3"],
    written(
      "04f",
      "Identify the polymer class",
      "A polymer has covalent cross-links between its chains and does not melt when heated. What class of polymer is it?",
      "Thermosetting polymer.",
      ["Thermosetting."],
      { shortWritten: true },
    ),
    1,
    [0, 1, 0],
    0,
    [
      [
        "Thermosetting polymer, inferred from the cross-links and heating behaviour.",
        1,
      ],
    ],
  ),
];

const alcoholsAndAcids: ExamPart[] = [
  part(
    "5(a)",
    "Alcohol structures and reactions",
    "organic",
    ["4.7.2.3"],
    written(
      "05a",
      "Construct the alcohol",
      "Construct the displayed structure of the alcohol with molecular formula C₂H₆O. Show every hydrogen and the complete alcohol functional group.",
      "CH3–CH2–O–H, with all six H atoms displayed. Each carbon has four bonds and oxygen has two; the O–H hydrogen is not bonded directly to carbon.",
      [
        "Two correctly joined carbon atoms with appropriate carbon hydrogens.",
        "Terminal C–O–H and correct full atom inventory/valences.",
      ],
      {
        organicDrawing: {
          maxCarbons: 4,
          note: "Construct the displayed alcohol using carbon, hydrogen and oxygen choices. The molecular formula alone does not specify all the bonds.",
        },
        exposureAliases: ["alc-v1-p-ethanol"],
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Two singly bonded carbons, with 3H on the first and 2H on the alcohol-bearing carbon.",
        1,
      ],
      [
        "Terminal single C–O–H, including the sixth hydrogen on oxygen; no carbonyl. Equivalent reversed orientations are valid.",
        1,
      ],
    ],
  ),
  part(
    "5(b)",
    "Alcohol structures and reactions",
    "organic",
    ["4.7.2.3"],
    written(
      "05b",
      "Name the reagent type",
      "What type of reagent reacts with ethanol to produce ethanoic acid?",
      "An oxidising agent.",
      ["An oxidising agent."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "An oxidising agent; a valid specified oxidising reagent can also be reviewed. A reducing agent contradicts the change.",
        1,
      ],
    ],
  ),
  part(
    "5(c)",
    "An acid–carbonate reaction",
    "organic",
    ["4.7.2.4", "4.1.1.1"],
    written(
      "05c",
      "Balance the complete equation",
      "Ethanoic acid (CH₃COOH) reacts with sodium carbonate (Na₂CO₃), forming sodium ethanoate (CH₃COONa), water and carbon dioxide. Write the complete balanced symbol equation.",
      "2CH3COOH + Na2CO3 → 2CH3COONa + H2O + CO2",
      [
        "All correct reactant and product formulae on appropriate sides.",
        "Coefficients conserve each atom type.",
      ],
      { writtenEquations: true },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Complete equation with CH3COOH and Na2CO3 forming CH3COONa, H2O and CO2. Do not substitute hydrogen gas for carbon dioxide.",
        1,
      ],
      [
        "Correct balance 2:1:2:1:1, or an equivalent proportional set, without altering formula subscripts. Either product order is valid.",
        1,
      ],
    ],
  ),
  part(
    "5(d)",
    "Comparing alcohol fuel masses",
    "organic",
    ["4.7.2.3"],
    question(
      "05d",
      "Compare equal energy releases",
      "Illustrative fuel data: ethanol releases 29.2 kJ/g and propanol 33.8 kJ/g. Calculate the ethanol mass releasing the same energy as 1.20 g of propanol. Give 2 decimal places and show your working.",
      "1.39",
      {
        unit: "g",
        inputMode: "decimal",
        tolerance: 0.005,
        rounding: { kind: "decimal-places", digits: 2 },
        explanation:
          "Propanol energy=1.20×33.8=40.56 kJ. Ethanol mass=40.56/29.2=1.389041…g, rounded to 1.39 g.",
      },
    ),
    2,
    [0, 2, 0],
    1,
    [
      [
        "Use 1.20×33.8/29.2, or an equivalent energy-then-mass method. A correct final answer can support the method point only where the retained working does not contradict it.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "5(e)",
    "Original illustrative fuel observations",
    "organic",
    ["4.7.2.3"],
    written(
      "05e",
      "Plot the alcohol observations",
      "Plot all six supplied observations and draw a smooth best-fit curve. Keep the observation points and fit distinct. The optional next-alcohol estimate has no allocated mark.",
      "Plot (2,29.2),(3,33.8),(4,36.0),(5,37.6),(6,38.7),(7,39.5). A suitable smooth fit increases with decreasing steepness, following the observations without treating every point as an exact theoretical prediction.",
      [
        "Plot the actual six coordinate pairs accurately.",
        "Draw a smooth fit that follows the observations.",
      ],
      {
        fuelDrawing: {
          data: {
            title: "Original full-paper alcohol fuel observations",
            xName: "Carbon count",
            xUnit: "",
            yName: "Energy per gram",
            yUnit: "kJ/g",
            points: [
              [2, 29.2],
              [3, 33.8],
              [4, 36.0],
              [5, 37.6],
              [6, 38.7],
              [7, 39.5],
            ],
            xMin: 1,
            xMax: 8,
            xTick: 1,
            yMin: 28,
            yMax: 42,
            yTick: 2,
            targetX: 8,
            estimateRange: [39.8, 40.6],
            trend:
              "Energy per gram increases, with decreasing increments in this supplied series.",
            limit:
              "The next-alcohol estimate is outside the measured carbon counts and is not a measured observation.",
            note: "Original illustrative observations for this paper, not published experimental measurements. Several suitable smooth fits are possible.",
          },
          note: "Supplied illustrative observations: carbon count 2 → 29.2; 3 → 33.8; 4 → 36.0; 5 → 37.6; 6 → 38.7; 7 → 39.5 kJ/g. The graph uses a truncated vertical scale. The optional estimate is unmarked.",
        },
      },
    ),
    3,
    [0, 2, 1],
    0,
    [
      [
        "All 6 points within half a small grid square: 2 marks; 4–5 accurate points: 1 mark. Judge the raw observations rather than their closeness to the fitted curve.",
        2,
      ],
      [
        "A smooth best-fit curve following the observation trend. A jagged point-to-point join or an unrelated straight line does not fulfil this criterion; allow other scientifically suitable smooth fits.",
        1,
      ],
    ],
    { mathematics: true },
  ),
];

const chromatography: ExamPart[] = [
  part(
    "6(a)",
    "Paper chromatography",
    "analysis",
    ["4.8.1.3"],
    written(
      "06a",
      "Prepare the baseline and solvent",
      "State what should be used to draw the sample baseline. Describe where the initial solvent surface should be relative to the sample spots.",
      "Use pencil for the baseline. The solvent must contact the paper but its surface must be below the sample spots/baseline.",
      ["Pencil baseline.", "Solvent touches the paper below the sample spots."],
      { shortWritten: true },
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Pencil/graphite, rather than soluble ink.", 1],
      [
        "Solvent surface below the baseline/sample spots while touching the paper. A solvent reservoir that never contacts the paper is not a valid arrangement.",
        1,
      ],
    ],
    { practical: 6 },
  ),
  part(
    "6(b)",
    "A calibrated original chromatogram",
    "analysis",
    ["4.8.1.3"],
    question(
      "06b",
      "Calculate the Rf value",
      "Calculate Rf for B. Show both distances and your division. Coordinates are above the paper bottom.",
      "0.45",
      {
        inputMode: "decimal",
        tolerance: 0.001,
        chromatographyGiven: { record: "paper2Foundation" },
        explanation:
          "Spot distance=51−15=36 mm. Solvent distance=95−15=80 mm. Rf=36/80=0.45, with no unit.",
      },
    ),
    3,
    [0, 3, 0],
    1,
    [
      [
        "Determine both distances from the origin: 36 mm and 80 mm. Merely using the absolute 51/95 coordinates does not earn this point.",
        1,
      ],
      [
        "Use spot distance/solvent distance, 36/80. Allow a valid ratio using previously determined distances; review contradictions in the retained working.",
        1,
      ],
    ],
    { mathematics: true, practical: 6 },
  ),
  part(
    "6(c)",
    "A calibrated original chromatogram",
    "analysis",
    ["4.8.1.1", "4.8.1.3"],
    written(
      "06c",
      "Interpret the spot evidence",
      "Explain A’s mixture evidence and whether B’s single spot proves purity.",
      "A produces two resolved spots, showing at least two components under these conditions. B's single spot is consistent with purity but does not prove it: different components may be unresolved at the same position in this solvent.",
      [
        "Two resolved spots give evidence of a mixture.",
        "A single spot is consistent with purity but co-elution can hide components.",
      ],
      { chromatographyGiven: { record: "paper2Foundation" } },
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "A has two separated spots, supporting more than one component rather than one pure compound.",
        1,
      ],
      [
        "B's single spot alone is not conclusive: components might co-elute/not be resolved in these conditions. Further solvents or independent evidence can strengthen the conclusion.",
        1,
      ],
    ],
    { practical: 6 },
  ),
  part(
    "6(d)",
    "Separation between two phases",
    "analysis",
    ["4.8.1.3"],
    written(
      "06d",
      "Explain different travel distances",
      "Explain why two dissolved components can travel different distances during paper chromatography. Refer to the mobile and stationary phases.",
      "The components distribute differently between the solvent mobile phase and paper stationary phase. A component that spends a greater proportion of time in the moving solvent travels further; stronger retention by the paper reduces its travel.",
      [
        "Different distribution/affinity between the two phases.",
        "Link time in moving solvent versus retention to distance.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Different relative attraction/solubility/distribution between solvent (mobile) and paper (stationary), rather than universally attributing the separation to molecular mass.",
        1,
      ],
      [
        "A greater proportion in the moving solvent gives greater travel, or greater stationary-phase retention gives less travel, linked to the stated phases.",
        1,
      ],
    ],
    { practical: 6 },
  ),
  part(
    "6(e)",
    "An incomplete second investigation",
    "analysis",
    ["4.8.1.3"],
    written(
      "06e",
      "Judge an unmarked solvent front",
      "A different student removes their paper but does not mark the solvent front before the solvent evaporates. Why can they no longer calculate reliable Rf values from that paper?",
      "The distance travelled by the solvent from the origin is no longer known reliably, so the denominator of the Rf ratio is missing.",
      ["No reliable solvent distance remains for the ratio."],
      { shortWritten: true },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "The solvent distance/front cannot be recovered reliably after evaporation, so the required denominator is unknown. Do not substitute the paper top for an unmeasured front.",
        1,
      ],
    ],
    { practical: 6 },
  ),
];

const chemicalAnalysis: ExamPart[] = [
  part(
    "7(a)",
    "Identifying a soluble salt",
    "analysis",
    ["4.8.3.1", "4.8.3.4"],
    written(
      "07a",
      "Plan both ion tests",
      "Plan tests to find whether a water-soluble salt contains lithium ions and iodide ions. Available: a Bunsen burner, a clean metal wire, test tubes, dropping pipettes, distilled water, dilute nitric acid and silver nitrate solution. Give the expected observations and what each identifies.",
      "For lithium, place a little sample on the clean wire and put it in a blue/non-luminous flame; a crimson flame indicates lithium. For iodide, dissolve a fresh portion in distilled water in a test tube, add dilute nitric acid, then silver nitrate solution; a yellow precipitate indicates iodide. Keep the portions separate and avoid contamination.",
      [
        "A valid flame-test sequence with crimson lithium observation.",
        "A valid dissolved-sample, nitric-acid, silver-nitrate sequence with yellow iodide precipitate.",
        "Judge the complete method for sequence and validity, not six keyword ticks.",
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
          text: "A logically sequenced method would identify both ions: appropriate flame procedure and lithium colour; dissolved fresh portion acidified with nitric acid before silver nitrate and the iodide observation. Key steps and both interpretations are correct. Use 6 for a secure complete method,5 for a minor omission that does not invalidate the outcome.",
        },
        {
          min: 3,
          max: 4,
          text: "Most relevant steps are identified, but the whole method would not necessarily validate both ions because a branch, sequence, observation or interpretation is incomplete. Decide 3 or 4 by the quality of the whole response, not a keyword count.",
        },
        {
          min: 1,
          max: 2,
          text: "Some relevant test steps or observations are present, but links are unclear and the plan would not establish the requested two-ion result. Use 2 for a more developed relevant response, 1 for limited relevant content.",
        },
        { min: 0, max: 0, text: "No relevant content." },
      ],
    },
  ),
  part(
    "7(b)",
    "Instrumental metal-ion analysis",
    "analysis",
    ["4.8.3.7"],
    written(
      "07b",
      "Recall the instrumental method",
      "Name the instrumental method in this specification that uses light emitted by a sample in a flame to identify metal ions and measure their concentrations.",
      "Flame emission spectroscopy.",
      ["Flame emission spectroscopy."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Flame emission spectroscopy/spectrometry. A visual flame test alone is not the instrumental measurement requested.",
        1,
      ],
    ],
  ),
  part(
    "7(c)",
    "Instrumental metal-ion analysis",
    "analysis",
    ["4.8.3.7"],
    question(
      "07c",
      "Calculate a mean concentration",
      "Three calibrated measurements of the same solution give lithium-ion concentrations 4.8, 5.0 and 4.9 mg/dm³. Calculate the mean concentration. Show your working.",
      "4.9",
      {
        unit: "mg/dm³",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Mean=(4.8+5.0+4.9)/3=4.9 mg/dm³. The units are mass concentration, not mol/dm³.",
      },
    ),
    2,
    [0, 2, 0],
    1,
    [
      [
        "Add the three supplied concentrations and divide by 3. Correct final answer may support this method point only without contradictory working.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "7(d)",
    "Limits of a positive ion result",
    "analysis",
    ["4.8.3.6", "4.8.3.7"],
    written(
      "07d",
      "Judge the purity claim",
      "The instrument detects lithium ions. A student claims this result alone proves that the original salt is pure lithium iodide. Explain why the claim is too strong.",
      "Detecting lithium does not establish the counter-ion or exclude other compounds. Other ions/impurities could be present, so this result alone does not prove pure lithium iodide.",
      [
        "A positive lithium result alone does not determine the whole compound or exclude impurities.",
      ],
      { shortWritten: true },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "A lithium detection does not establish iodide/the counter-ion or rule out other substances; link the limitation to the proposed pure-compound conclusion.",
        1,
      ],
    ],
  ),
];

const atmosphereAndClimate: ExamPart[] = [
  part(
    "8(a)",
    "Radiation and the atmosphere",
    "atmosphere",
    ["4.9.2.1"],
    written(
      "08a",
      "Explain the greenhouse effect",
      "Explain how greenhouse gases reduce energy escaping from Earth's surface. Identify the radiation involved and what the gases do to it.",
      "The warmed surface emits long-wavelength infrared radiation. Greenhouse gases absorb some of this radiation and re-emit in all directions, including back towards the surface, reducing the net energy escaping.",
      [
        "Absorption of surface-emitted long-wavelength infrared radiation.",
        "Re-emission including towards the surface reduces net energy escape.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Greenhouse gases absorb outgoing long-wavelength infrared from the warmed surface, rather than simply blocking all incoming sunlight.",
        1,
      ],
      [
        "They re-emit in all directions, including towards the surface, reducing net escape. Do not describe an ozone hole or permanent storage of all absorbed radiation.",
        1,
      ],
    ],
  ),
  part(
    "8(b)",
    "Earth's changing atmosphere",
    "atmosphere",
    ["4.9.1.2", "4.9.1.4"],
    written(
      "08b",
      "Describe carbon dioxide removal",
      "Describe two distinct processes that reduced the carbon dioxide content of Earth's atmosphere during its history.",
      "Photosynthesis by algae and plants removes carbon dioxide into biomass. Carbon can be stored in carbonate sediments/limestone and in fossil fuels. Dissolution in the oceans is another relevant removal process.",
      [
        "One valid carbon dioxide removal process.",
        "A second distinct valid process.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "One valid process with its removal/storage role: photosynthesis, dissolution into oceans, carbonate sediment/limestone formation or carbon storage in fossil fuels.",
        1,
      ],
      [
        "A second distinct valid process. Two restatements of photosynthesis or naming carbon dioxide combustion as removal do not earn a second point.",
        1,
      ],
    ],
  ),
  part(
    "8(c)",
    "Evaluating climate evidence",
    "atmosphere",
    ["4.9.2.2"],
    written(
      "08c",
      "Compare the evidence quality",
      "Report A bases a claim about global climate on one year's weather in one town and supplies no method details. Report B analyses 50 years across many regions and publishes methods that other scientists check. Which is stronger evidence for a global climate trend? Give two reasons using the information.",
      "B is stronger: its long period and broad coverage better represent a global long-term trend than one local year's weather. Published methods and independent checking allow errors, assumptions and reproducibility to be examined. Peer review strengthens scrutiny but does not guarantee a conclusion is correct.",
      [
        "B has more appropriate time/geographical coverage.",
        "Transparent independently checked methods permit scientific scrutiny.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Choose B and link long-term/many-region coverage to the global-climate claim rather than local short-term weather.",
        1,
      ],
      [
        "Choose B and link publication/independent checking to finding errors, checking methods or reproducibility. Simply saying 'more scientists agree' or that peer review proves truth is insufficient.",
        1,
      ],
    ],
  ),
  part(
    "8(d)",
    "An illustrative atmospheric sample",
    "atmosphere",
    ["4.9.1.1", "4.9.2.1"],
    question(
      "08d",
      "Calculate the gas mass",
      "A supplied atmospheric sample has total mass 240 kg and contains 0.060% carbon dioxide by mass. Calculate the carbon dioxide mass in grams. Show your working. The supplied percentage is by mass, not by volume.",
      "144",
      {
        unit: "g",
        inputMode: "decimal",
        tolerance: 0.01,
        explanation:
          "CO2 mass=(0.060/100)×240=0.144 kg. Multiply by 1000 to give 144 g. This illustrative mass percentage is not the dry-air volume percentage.",
      },
    ),
    3,
    [0, 3, 0],
    1,
    [
      [
        "Calculate 0.060/100×240, or the corresponding fraction of a correctly converted sample mass.",
        1,
      ],
      [
        "Convert kilograms to grams by multiplying by 1000. Allow consistent conversion following the student's earlier calculated mass.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "8(e)",
    "Modern dry air",
    "atmosphere",
    ["4.9.1.1"],
    written(
      "08e",
      "Name the largest component",
      "Which gas makes up the greatest proportion of modern dry air?",
      "Nitrogen.",
      ["Nitrogen."],
      { shortWritten: true },
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Nitrogen/N2, about 78% by volume; a percentage is not required for this naming mark.",
        1,
      ],
    ],
  ),
];

const resourcesAndCorrosion: ExamPart[] = [
  part(
    "9(a)",
    "Conditions for rusting",
    "resources",
    ["4.10.3.1"],
    written(
      "09a",
      "Recall both rusting requirements",
      "Name the two substances or conditions that must both be present for iron to rust.",
      "Water and oxygen (from air).",
      ["Water.", "Oxygen/air."],
      { shortWritten: true },
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Water/moisture.", 1],
      ["Oxygen/air; air alone without water is insufficient.", 1],
    ],
  ),
  part(
    "9(b)",
    "Testing the requirements",
    "resources",
    ["4.10.3.1"],
    written(
      "09b",
      "Plan the three comparisons",
      "Plan three nail conditions that test whether water and oxygen are both required for rusting. Identify the positive control, explain how each comparison excludes one requirement, and state one variable to keep the same.",
      "Use matched iron nails for the same time at the same temperature. The positive control has air and water. A sealed tube with dry air and a drying agent excludes water. Freshly boiled water kept from regaining air, covered with an oil barrier, supplies water while excluding oxygen. Ordinary water plus oil is not an oxygen-free control because it can already contain dissolved oxygen.",
      [
        "One valid matched variable.",
        "Air/water positive control and genuinely water-free comparison.",
        "A genuinely oxygen-excluded water comparison.",
      ],
    ),
    3,
    [1, 0, 2],
    0,
    [
      [
        "One suitable controlled variable, e.g. nail composition/size/surface condition, exposure time or temperature, stated as kept equal across comparisons.",
        1,
      ],
      [
        "Positive control has both air and water; water-excluded comparison uses genuinely dry air/desiccant in a sealed arrangement, with its purpose explained.",
        1,
      ],
      [
        "Water-without-oxygen comparison uses freshly boiled water protected from air re-entry and an oil barrier, or an equivalent credible oxygen-exclusion method. Ordinary water plus oil does not establish oxygen removal.",
        1,
      ],
    ],
  ),
  part(
    "9(c)",
    "A bag-use energy boundary",
    "resources",
    ["4.10.2.1"],
    question(
      "09c",
      "Calculate energy per service",
      "For this supplied comparison, making one reusable bag uses 8.00 MJ and each wash uses 0.120 MJ. It delivers 20 equal carrying services, with one wash per service. Calculate its total energy per service within this stated boundary. Show your working.",
      "0.52",
      {
        unit: "MJ/service",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Total=8.00+20×0.120=10.40 MJ. Divide by 20 services:0.520 MJ/service. This boundary includes manufacture and washing, not an unprovided complete LCA.",
      },
    ),
    3,
    [0, 3, 0],
    1,
    [
      [
        "Add manufacturing and all 20 washing contributions: 8.00+20×0.120=10.40 MJ. Omitting manufacture does not earn this point.",
        1,
      ],
      [
        "Divide the total by 20 equal services, with consistent units. Allow a valid division following the student's calculated total, subject to retained working.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "9(d)",
    "An abbreviated environmental comparison",
    "resources",
    ["4.10.2.1"],
    written(
      "09d",
      "Evaluate the advertising claim",
      "In a separate comparison of equal carrying services, supplied measurements give bag A: 0.54 MJ and 0.92 L water per service; bag B: 0.82 MJ and 0.22 L per service. Pollutant effects and disposal impacts were not assessed. An advert says A is environmentally best because it uses less energy. Evaluate this conclusion.",
      "A has lower assessed energy, but B has lower water use. The advert selects one impact and omits pollutant and disposal evidence, so it cannot establish an overall environmental winner. Prioritising energy versus water or pollution requires a stated judgement; values in unlike units cannot simply be added.",
      [
        "Recognise the energy/water trade-off.",
        "Overall claim requires broader evidence and an explicit value judgement.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "A has lower energy while B has lower water use; compare the competing impacts on the same per-service basis.",
        1,
      ],
      [
        "Explain why the overall claim is unsupported by this selective boundary: missing impacts/stages or the need to justify relative priorities/value judgements. Do not add MJ and L as an objective overall score.",
        1,
      ],
    ],
  ),
];

const fertiliserProduction: ExamPart[] = [
  part(
    "10(a)",
    "Haber feedstocks",
    "resources",
    ["4.10.4.1"],
    written(
      "10a",
      "Recall both feed sources",
      "Give one source of the nitrogen feed and one source of the hydrogen feed used to make ammonia.",
      "Nitrogen is obtained from air/the atmosphere. Hydrogen can come from natural gas/methane, or water/steam in an appropriate production process.",
      [
        "Air/atmosphere for nitrogen.",
        "Natural gas/methane or water/steam for hydrogen.",
      ],
      {
        shortWritten: true,
        exposureAliases: [
          "haber-v1-source-recall-p-sources",
          "haber-v1-source-recall-g-sources",
          "haber-v1-source-recall-c-sources",
          "haber-v1-source-recall-v-sources",
          "haber-v1-p-compromise",
          "haber-v1-p-sources",
          "haber-v1-r-feed2",
          "haber-v1-r-feed5",
          "haber-v1-g-feed",
          "haber-v1-cA-source",
          "haber-v1-vB-sources",
        ],
      },
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Air/the atmosphere as the nitrogen source.", 1],
      [
        "Natural gas/methane or water/steam as a hydrogen source. The recall mark does not require an additional processing explanation.",
        1,
      ],
    ],
  ),
  part(
    "10(b)",
    "Treating phosphate rock",
    "resources",
    ["4.10.4.2"],
    written(
      "10b",
      "Name the phosphate-treatment products",
      "Name the calcium salt produced when phosphate rock is treated with nitric acid. Then name the fertiliser produced when the rock is treated with phosphoric acid.",
      "Nitric acid gives calcium nitrate. Phosphoric acid gives triple superphosphate/calcium dihydrogenphosphate.",
      [
        "Calcium nitrate for the nitric route.",
        "Triple superphosphate/calcium dihydrogenphosphate for the phosphoric route.",
      ],
      {
        shortWritten: true,
        exposureAliases: [
          "haber-v1-source-recall-p-products",
          "haber-v1-source-recall-g-products",
          "haber-v1-source-recall-c-products",
          "haber-v1-source-recall-v-products",
          "haber-v1-p-nitricRock",
          "haber-v1-r-nitricRock",
          "haber-v1-p-rock",
          "haber-v1-p-mining",
          "haber-v1-r-sulfuricRock",
          "haber-v1-r-phosphoricRock",
          "haber-v1-g-rock",
          "haber-v1-cA-rock",
          "haber-v1-cB-rock",
          "haber-v1-p-superphosphate",
          "haber-v1-vB-rock",
        ],
      },
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Calcium nitrate. Phosphoric acid is an acid coproduct, not the calcium salt requested.",
        1,
      ],
      [
        "Triple superphosphate or calcium dihydrogenphosphate. Single superphosphate denotes the different sulfuric-acid route mixture.",
        1,
      ],
    ],
  ),
  part(
    "10(c)",
    "Blending fertiliser formulations",
    "resources",
    ["4.10.4.2", "4.8.1.2"],
    question(
      "10c",
      "Calculate the blend composition",
      "Blend 12.0 kg of product A containing 15.0% nitrogen by mass with 8.0 kg of product B containing 5.0% nitrogen by mass. No material is lost. Calculate the nitrogen mass percentage of the blend. Show your working.",
      "11",
      {
        unit: "%",
        inputMode: "decimal",
        tolerance: 0.001,
        explanation:
          "Nitrogen mass=12.0×0.150+8.0×0.050=2.20 kg. Blend mass=20.0 kg. Percentage=2.20/20.0×100=11.0%. These are elemental nitrogen mass percentages.",
      },
    ),
    3,
    [0, 3, 0],
    1,
    [
      [
        "Calculate and add both nitrogen masses: 1.80+0.40=2.20 kg. Averaging the two percentages without considering their different masses is insufficient.",
        1,
      ],
      [
        "Use total blend mass 20.0 kg and nitrogen mass/total mass×100. Allow a valid conversion following the student's nitrogen-mass calculation.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "10(d)",
    "A simplified ammonia separation stage",
    "resources",
    ["4.10.4.1"],
    written(
      "10d",
      "Apply the boiling-point data",
      "A simplified 1-atmosphere separator cools gases to −40°C. Boiling points: ammonia −33°C, nitrogen −196°C, hydrogen −253°C; all melting points are below −40°C. Identify the liquid removed and explain why the other two gases can be recycled. This is the separator, not the high-pressure reactor.",
      "Ammonia becomes liquid because −40°C is below its boiling point and above its melting point. Nitrogen and hydrogen remain gases because −40°C is above their boiling points, so unreacted gases can be recycled to the reactor.",
      [
        "Ammonia liquefies using the supplied temperature comparison.",
        "Nitrogen/hydrogen remain gaseous and can be recycled.",
      ],
      { exposureAliases: ["haber-v1-p-cooling"] },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Ammonia is the liquid: −40°C<−33°C, with no freezing under the stated melting-point condition.",
        1,
      ],
      [
        "Nitrogen and hydrogen remain gaseous since −40°C is above both supplied boiling points; return these unreacted feeds to the reactor. Do not describe the iron catalyst as a recycled feed gas.",
        1,
      ],
    ],
  ),
  part(
    "10(e)",
    "Comparing ammonium-salt production",
    "resources",
    ["4.10.4.2"],
    written(
      "10e",
      "Judge the energy claim",
      "A laboratory makes ammonium sulfate in separate batches. An industrial process continuously supplies reactants and removes product. No energy measurements are supplied. A student says the industrial process must use less energy per kilogram solely because it is continuous. Is this conclusion supported? Explain.",
      "No. Continuous operation alone does not establish energy per kilogram; comparable energy use and product output within stated boundaries are needed.",
      [
        "Given process continuity does not establish relative energy per unit product.",
      ],
      { shortWritten: true },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "The conclusion is unsupported without comparable energy/output data or justified assumptions. Merely restating 'industrial is continuous' does not prove energy per kilogram is lower.",
        1,
      ],
    ],
  ),
];

// All ten question groups are individually authored; acceptance requires the
// content review, sealed whole-paper behaviour and final visual inspection.
export const paper2FoundationFull: ExamPaper = {
  id: "paper-2-foundation-full",
  totalMarks: 100,
  minutes: 105,
  parts: [
    ...rateInvestigation,
    ...reversibleChanges,
    ...hydrocarbonFeedstocks,
    ...polymersAndMaterials,
    ...alcoholsAndAcids,
    ...chromatography,
    ...chemicalAnalysis,
    ...atmosphereAndClimate,
    ...resourcesAndCorrosion,
    ...fertiliserProduction,
  ],
};

// Worked constructions are separate from the independently saved student response.
// These are available to the review component only after whole-paper submission.
paper2FoundationFull.parts.find(
  (p) => p.number === "4(a)",
)!.referenceConstruction = JSON.stringify({
  ...blankPolymerisationDrawing(),
  s0: "H",
  s1: "H",
  s2: "H",
  s3: "C2H5",
  bond: "1",
  left: "1",
  right: "1",
  brackets: "1",
  countMark: "n",
});
paper2FoundationFull.parts.find(
  (p) => p.number === "5(a)",
)!.referenceConstruction = JSON.stringify({
  ...emptyOrganicDrawing(),
  n: "2",
  hydroxyl: "yes",
  oxygenH: "yes",
  h0: "yes",
  h1: "yes",
  h2: "yes",
  h4: "yes",
  h5: "yes",
});
const graphPart = paper2FoundationFull.parts.find((p) => p.number === "5(e)")!;
const graphData = graphPart.question.fuelDrawing!.data;
graphPart.referenceConstruction = JSON.stringify({
  ...emptyFuelDrawing(graphData),
  ...Object.fromEntries(
    graphData.points.flatMap(([x, y], i) => [
      [`p${i}x`, String(x)],
      [`p${i}y`, String(y)],
      [`c${i}`, String(y)],
    ]),
  ),
});

// Individually reviewed recall equivalents: a changed heading, response format
// or surrounding story does not make an already exposed answer fresh.
const reviewedRecallLinks: Record<string, string[]> = {
  "01a": ["rp-v1-p-late-start"],
  "01c": ["tc-v1-p-heat-written"],
  "01d": ["tc-v1-p-catalyst-written"],
  "02a": ["re-v1-p-symbol"],
  "02b": ["re-v1-p-hydrate"],
  "02f": ["re-v1-p-energy-written"],
  "03a": ["oil-v1-p-method-written"],
  "03e": ["oil-v1-p-only"],
  "04b": ["pol-v1-r-monomer"],
  "04c": ["materials-v1-p-boro"],
  "05b": ["alc-v1-p-oxidise"],
  "06a": ["chromatography-v1-p-pencil", "chromatography-v1-p-immersed"],
  "06d": ["chromatography-v1-p-explain"],
  "08a": ["greenhouse-v1-p-mechanism"],
  "08b": ["early-atmosphere-v1-p-photo", "early-atmosphere-v1-p-limestone"],
  "08e": ["early-atmosphere-v1-p-approx"],
  "09a": ["materials-v1-p-rust"],
  "09b": ["materials-v1-rust-design-p-plan"],
};
for (const [suffix, aliases] of Object.entries(reviewedRecallLinks)) {
  const q = paper2FoundationFull.parts.find(
    (p) => p.question.id === prefix + suffix,
  )!.question;
  q.exposureAliases = [...new Set([...(q.exposureAliases ?? []), ...aliases])];
}

// Additional historic single-cue equivalents, reviewed against actual old prompts.
// Distinct numerical givens and chemically different constructions remain reserved.
const additionalReviewedCues: Record<string, string[]> = {
  "01c": ["tc-v1-p-compare-mechanisms", "tc-v1-b5", "tc-v1-ra3"],
  "01d": ["tc-v1-p-compare-mechanisms", "tc-v1-a5", "tc-v1-ra3"],
  "02a": ["reversible-reactions-2", "re-v1-w-arrow", "re-v1-r-arrow"],
  "03a": ["oil-v1-a-column"],
  "03e": ["oil-v1-r-hydrocarbon", "oil-v1-b-inventory"],
  "04b": ["polymers-2"],
  "04c": ["materials-v1-cB-glass"],
  "04e": [
    "materials-v1-p-composite",
    "materials-v1-vB-composite",
    "materials-v1-composite-recall-g-examples",
    "materials-v1-composite-recall-c-examples",
    "materials-v1-composite-recall-v-examples",
  ],
  "05a": ["alc-v1-a-draw", "path-v1-p-ethene-water"],
  "06a": ["chromatography-v1-r-pencil", "chromatography-0"],
  "06d": ["chromatography-v1-g-explain", "chromatography-v1-vA-mechanism"],
  "08a": [
    "greenhouse-v1-g-path",
    "greenhouse-v1-cA-mechanism",
    "greenhouse-v1-cB-mechanism",
    "greenhouse-v1-vA-explain",
    "greenhouse-effect-5",
  ],
  "08b": [
    "early-atmosphere-v1-g-photo",
    "early-atmosphere-v1-cA-photo",
    "early-atmosphere-v1-r-carbonate",
  ],
  "09a": [
    "materials-v1-r-wet",
    "materials-v1-g-rust",
    "materials-v1-r-dry",
    "materials-v1-r-noOxygen",
    "materials-v1-p-salt",
    "materials-v1-cA-dry",
    "materials-v1-cB-water",
    "materials-and-corrosion-0",
  ],
  "09b": [
    "materials-v1-rust-design-g-plan",
    "materials-v1-rust-design-p-flaw",
    "materials-v1-rust-design-c-plan",
    "materials-v1-rust-design-c-oil",
    "materials-v1-rust-design-v-plan",
    "materials-v1-rust-design-v-negative",
  ],
  "10d": ["haber-v1-r-loop", "haber-v1-cA-cool", "haber-v1-vA-cool"],
};
for (const [suffix, aliases] of Object.entries(additionalReviewedCues)) {
  const q = paper2FoundationFull.parts.find(
    (p) => p.question.id === prefix + suffix,
  )!.question;
  q.exposureAliases = [...new Set([...(q.exposureAliases ?? []), ...aliases])];
}
