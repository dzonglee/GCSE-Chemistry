import type { Question } from "./types";
import type { ExamPaper, ExamPart, PaperCriterion } from "./exam-paper-types";

const prefix = "chem-p1f-full-v1-";
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

// This single paper is individually authored. Its items are reserved from the
// lesson/mixed banks; concrete equivalents retain conservative exposure links.
const atoms: ExamPart[] = [
  part(
    "1(a)",
    "Neon and its isotopes",
    "atomic-structure",
    ["4.1.1.4"],
    question(
      "01a",
      "A neutral atom",
      "What is the overall electrical charge of a neutral neon atom?",
      "Zero",
      {
        options: ["Positive", "Zero", "Negative"],
        explanation:
          "Equal numbers of positive protons and negative electrons give zero overall charge.",
      },
    ),
    1,
    [1, 0, 0],
    1,
    [],
  ),
  part(
    "1(b)",
    "Neon and its isotopes",
    "atomic-structure",
    ["4.1.1.4", "4.1.1.5"],
    question(
      "01b",
      "Count the particles",
      "A neutral neon-22 atom has atomic number 10. Give its neutron count and electron count.",
      '{"neutrons":"12","electrons":"10"}',
      {
        parts: [
          { id: "neutrons", label: "Neutrons", answer: 12 },
          { id: "electrons", label: "Electrons", answer: 10 },
        ],
        explanation:
          "Neutrons = 22 − 10 = 12. A neutral atom has 10 electrons to balance 10 protons.",
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      ["12 neutrons from mass number minus atomic number.", 1],
      ["10 electrons because the atom is neutral.", 1],
    ],
  ),
  part(
    "1(c)",
    "Neon and its isotopes",
    "atomic-structure",
    ["4.1.1.7"],
    question(
      "01c",
      "Construct the shells",
      "Construct the electron arrangement and shell diagram of a neutral neon atom, atomic number 10.",
      "2,8",
      {
        arrangement: [2, 8],
        drawArrangement: true,
        readableShellDiagram: true,
        explanation:
          "Two electrons occupy the first shell and eight the second; the arrangement is 2,8.",
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      ["Two electrons in the first occupied shell.", 1],
      [
        "Eight electrons in the second shell; ten total, with no additional occupied shell.",
        1,
      ],
    ],
  ),
  part(
    "1(d)",
    "Neon and its isotopes",
    "atomic-structure",
    ["4.1.1.5"],
    written(
      "01d",
      "Define isotopes",
      "State what makes neon-20 and neon-22 isotopes of the same element.",
      "They have the same number of protons but different numbers of neutrons.",
      ["Both the same proton count and different neutron counts are required."],
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Same number of protons AND different numbers of neutrons. A different electron count alone does not define isotopes.",
        1,
      ],
    ],
  ),
  part(
    "1(e)",
    "Neon and its isotopes",
    "atomic-structure",
    ["4.1.1.6"],
    question(
      "01e",
      "Use the isotope data",
      "Calculate the relative atomic mass of the supplied neon sample. Show your working.",
      "20.4",
      {
        isotopeData: [
          { mass: 20, abundance: 80 },
          { mass: 22, abundance: 20 },
        ],
        explanation:
          "(20 × 80 + 22 × 20) ÷ 100 = 20.4. Relative atomic mass has no unit.",
      },
    ),
    3,
    [0, 3, 0],
    1,
    [
      [
        "Weight both isotope masses by their given abundances: 20×80 + 22×20, or 20×0.80 + 22×0.20.",
        1,
      ],
      [
        "Divide a percentage-weighted sum by 100 (or sum the fractional-weighted terms). Credit correct continuation of an earlier arithmetic error; a correct answer from contradictory working is not full credit.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "1(f)",
    "Neon and its isotopes",
    "atomic-structure",
    ["4.1.1.6"],
    written(
      "01f",
      "Interpret the mean",
      "A student says a non-integer relative atomic mass means each atom contains a fractional number of nucleons. Evaluate this claim.",
      "The claim is incorrect: relative atomic mass is a weighted mean of isotope masses. Individual atoms have whole-number proton and neutron counts.",
      [
        "Distinguish a weighted sample mean from the nucleon count of one atom.",
      ],
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Reject the claim because a weighted mean describes the isotope mixture, not a fractional nucleon count in each atom.",
        1,
      ],
    ],
  ),
];

const periodic: ExamPart[] = [
  part(
    "2(a)",
    "Patterns in the periodic table",
    "atomic-structure",
    ["4.1.2.2"],
    written(
      "02a",
      "Explain the gaps",
      "Give two related reasons why Mendeleev left gaps in his periodic table.",
      "He recognised that some elements had not yet been discovered. Gaps preserved groups of elements with similar properties and allowed predictions of missing elements' properties.",
      [
        "Allow for undiscovered elements.",
        "Preserve chemical patterns or predict the properties of missing elements.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Some elements were not yet discovered.", 1],
      [
        "Gaps preserved the recurring chemical-property groups or enabled predictions for the missing elements.",
        1,
      ],
    ],
  ),
  part(
    "2(b)",
    "Patterns in the periodic table",
    "atomic-structure",
    ["4.1.2.1", "4.1.2.6"],
    written(
      "02b",
      "Infer an unfamiliar ion",
      "Element X is supplied as a Group 7 element. Predict how many electrons one X atom gains to form its usual ion, and explain your prediction using its outer shell.",
      "It gains one electron because its seven outer electrons become a full outer shell of eight.",
      [
        "Gain one electron.",
        "Link seven original outer electrons to a completed shell of eight.",
      ],
    ),
    2,
    [0, 2, 0],
    0,
    [
      ["One electron is gained, rather than lost.", 1],
      ["Group 7 gives seven outer electrons; gaining one fills the shell.", 1],
    ],
  ),
  part(
    "2(c)",
    "Patterns in the periodic table",
    "atomic-structure",
    ["4.1.2.4"],
    written(
      "02c",
      "Read a boiling trend",
      "A supplied table gives helium −269°C, neon −246°C and argon −186°C. State the trend in boiling point as atomic number increases across these three Group 0 elements.",
      "Boiling point increases: it becomes less negative from helium to argon.",
      ["Increasing boiling point; less negative values are higher."],
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Boiling point increases with increasing atomic number across this supplied sequence; −186°C is higher than −269°C.",
        1,
      ],
    ],
  ),
  part(
    "2(d)",
    "Patterns in the periodic table",
    "atomic-structure",
    ["4.1.3.1"],
    written(
      "02d",
      "Compare metal properties",
      "State two typical physical differences between transition metals and Group 1 metals. Do not give chemical reactivity as a physical property.",
      "Transition metals typically have higher melting points and greater density. They are also generally harder and stronger; accept any two distinct valid comparisons.",
      [
        "One valid typical physical comparison.",
        "A second distinct physical comparison.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "One: typically higher melting point/density, greater hardness or greater strength for transition metals.",
        1,
      ],
      [
        "A second distinct comparison from those physical properties. Do not count chemical reactivity or the same comparison twice.",
        1,
      ],
    ],
  ),
  part(
    "2(e)",
    "Patterns in the periodic table",
    "atomic-structure",
    ["4.1.3.2"],
    written(
      "02e",
      "Name a catalyst example",
      "Name a transition metal or a transition-metal compound and a reaction in which it acts as a catalyst.",
      "For example, iron catalyses ammonia production in the Haber process; nickel catalyses alkene hydrogenation; manganese(IV) oxide catalyses hydrogen peroxide decomposition. Accept one correctly linked example.",
      ["A correct named catalyst linked to its reaction."],
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "One valid paired example, such as iron/Haber, nickel/alkene hydrogenation or manganese(IV) oxide/hydrogen peroxide decomposition. The name alone is insufficient.",
        1,
      ],
    ],
  ),
  part(
    "2(f)",
    "Patterns in the periodic table",
    "atomic-structure",
    ["4.1.2.6"],
    written(
      "02f",
      "Predict displacement products",
      "Chlorine is added to aqueous potassium bromide. Name both products of the displacement reaction.",
      "Potassium chloride and bromine.",
      ["Potassium chloride.", "Bromine."],
    ),
    2,
    [0, 2, 0],
    0,
    [
      ["Potassium chloride (allow KCl).", 1],
      [
        "Bromine (allow Br₂). Do not replace the potassium spectator with chlorine metal.",
        1,
      ],
    ],
  ),
];

const ionic: ExamPart[] = [
  part(
    "3(a)",
    "Ions in a solid",
    "bonding",
    ["4.2.1.2"],
    question(
      "03a",
      "Construct the chloride ion",
      "Construct the outer-electron dot-and-cross diagram for chloride after one sodium atom transfers an electron to chlorine. Use dots for chlorine's original electrons and crosses for transferred electrons. Include brackets and charge.",
      '{"dots":"7","crosses":"1","charge":"-1","brackets":"1"}',
      {
        drawDotCross: { symbol: "Cl" },
        parts: [
          {
            id: "dots",
            label: "Original chlorine electrons (dots)",
            answer: 7,
          },
          {
            id: "crosses",
            label: "Transferred electrons (crosses)",
            answer: 1,
          },
          { id: "charge", label: "Ion charge", answer: -1 },
          { id: "brackets", label: "Draw square brackets", answer: 1 },
        ],
        exposureAliases: ["ib-v1-p-draw-chloride"],
        explanation:
          "Seven chlorine electrons and one transferred electron give eight outer electrons. Square brackets enclose the ion; its charge is 1−. Origin markers do not represent different electron species.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      [
        "Seven original chlorine outer electrons shown with the stated origin convention.",
        1,
      ],
      [
        "One transferred electron shown, giving eight outer electrons in total.",
        1,
      ],
      [
        "Square brackets AND charge 1−. A neutral chlorine atom or a positive ion does not receive this point.",
        1,
      ],
    ],
  ),
  part(
    "3(b)",
    "Ions in a solid",
    "bonding",
    ["4.2.1.3"],
    written(
      "03b",
      "Describe ionic bonding",
      "Describe the forces holding the ions together in a giant sodium chloride lattice.",
      "Strong electrostatic attractions act between oppositely charged positive sodium and negative chloride ions, in all directions through the lattice.",
      [
        "Oppositely charged ions attract.",
        "Strong electrostatic forces act throughout the lattice.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Attraction between oppositely charged ions, not between neutral molecules.",
        1,
      ],
      [
        "Strong electrostatic forces throughout the giant lattice/in all directions.",
        1,
      ],
    ],
  ),
  part(
    "3(c)",
    "Ions in a solid",
    "bonding",
    ["4.2.2.3"],
    written(
      "03c",
      "Explain conduction",
      "Explain why sodium chloride conducts electricity when molten but not when solid.",
      "Solid ions are held in fixed positions and cannot carry charge through the solid. In the melt, ions can move and carry electric charge. The carriers are ions, not delocalised electrons.",
      [
        "Solid ions cannot move through the lattice.",
        "Molten ions move and carry charge.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Charged ions are fixed in the solid and cannot move through it.", 1],
      [
        "Ions are mobile in the melt and carry charge; do not substitute electrons as the molten-salt carriers.",
        1,
      ],
    ],
  ),
  part(
    "3(d)",
    "Ions in a solid",
    "bonding",
    ["4.2.1.3"],
    written(
      "03d",
      "Find the empirical formula",
      "A supplied representative lattice sample contains 3 magnesium ions and 6 chloride ions. Give the simplest magnesium:chloride ratio and the compound's formula.",
      "The ratio is 1:2 and the empirical formula is MgCl₂.",
      ["Simplest ion ratio 1:2.", "Formula MgCl₂."],
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Magnesium:chloride = 1:2, obtained by dividing both counts by three.",
        1,
      ],
      ["MgCl₂; ion charges are not written as formula subscripts.", 1],
    ],
    { mathematics: true },
  ),
  part(
    "3(e)",
    "Ions in a solid",
    "bonding",
    ["4.2.1.3"],
    question(
      "03e",
      "Evaluate a lattice picture",
      "Give one limitation.",
      "It shows a finite crop rather than the continuing three-dimensional lattice; depth is omitted. Other valid picture-specific limitations include illustrative particle sizes or nonliteral connecting lines.",
      {
        ionicSlice: true,
        compactIonicSlice: true,
        shortWritten: true,
        rubric: [
          "One justified limitation of the supplied finite two-dimensional representation.",
        ],
      },
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "A justified visible-model limitation: omitted depth/continuing giant extent, illustrative relative sizes or nonliteral lines. 'It is a diagram' alone is insufficient.",
        1,
      ],
    ],
  ),
];

const carbon: ExamPart[] = [
  part(
    "4(a)",
    "Molecules and carbon structures",
    "bonding",
    ["4.2.1.4"],
    question(
      "04a",
      "Construct a water molecule",
      "Construct a complete outer-electron dot-and-cross diagram for H₂O. Use dots for oxygen's original electrons and crosses for each hydrogen's electron. Include unshared electrons.",
      '{"unsharedCentre":"4","centre0":"1","partner0":"1","unsharedPartner0":"0","centre1":"1","partner1":"1","unsharedPartner1":"0"}',
      {
        drawCovalent: { molecule: "H2O" },
        parts: [
          { id: "unsharedCentre", label: "Unshared O dots", answer: 4 },
          { id: "centre0", label: "Bond 1: O dots", answer: 1 },
          { id: "partner0", label: "Bond 1: H crosses", answer: 1 },
          { id: "unsharedPartner0", label: "H 1: unshared crosses", answer: 0 },
          { id: "centre1", label: "Bond 2: O dots", answer: 1 },
          { id: "partner1", label: "Bond 2: H crosses", answer: 1 },
          { id: "unsharedPartner1", label: "H 2: unshared crosses", answer: 0 },
        ],
        exposureAliases: ["cb-v1-p-water"],
        explanation:
          "Each O–H bond shares one oxygen electron and one hydrogen electron. Oxygen retains four unshared electrons as two lone pairs. Each H has a full first shell of two electrons; oxygen has eight around it.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      ["Two O–H shared pairs, one for each hydrogen.", 1],
      [
        "Each shared pair contains one electron from each bonded atom using the given origin convention.",
        1,
      ],
      [
        "Four unshared oxygen electrons (two lone pairs), with no extra hydrogen electrons; correct whole inventory.",
        1,
      ],
    ],
  ),
  part(
    "4(b)",
    "Molecules and carbon structures",
    "bonding",
    ["4.2.3.2"],
    written(
      "04b",
      "Explain graphite conduction",
      "Explain how graphite's bonding allows it to conduct electricity.",
      "Each carbon forms three covalent bonds. Its remaining outer electron is delocalised and can move through the structure to carry charge.",
      [
        "A remaining electron is delocalised because each carbon forms three covalent bonds.",
        "Mobile electrons carry charge.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Each carbon forms three covalent bonds, leaving an electron delocalised.",
        1,
      ],
      ["The delocalised electrons move and carry electric charge.", 1],
    ],
  ),
  part(
    "4(c)",
    "Molecules and carbon structures",
    "bonding",
    ["4.2.3.2"],
    written(
      "04c",
      "Explain graphite softness",
      "Why can graphite's layers slide over one another without breaking the covalent carbon framework within a layer?",
      "There are no covalent bonds between the layers, so the layers can slide while their internal covalent bonds remain.",
      [
        "No covalent bonds join adjacent layers; sliding preserves the internal covalent framework.",
      ],
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "No covalent bonds between layers, allowing layer sliding without breaking covalent bonds within them. Do not call all carbon–carbon bonds weak.",
        1,
      ],
    ],
  ),
  part(
    "4(d)",
    "Molecules and carbon structures",
    "bonding",
    ["4.2.2.4"],
    written(
      "04d",
      "Explain a low boiling point",
      "Explain why a substance made of small molecules can have a low boiling point even though its covalent bonds are strong.",
      "Boiling separates molecules by overcoming relatively weak intermolecular forces, requiring comparatively little energy. The strong covalent bonds within each molecule are not broken.",
      [
        "Weak intermolecular forces require little energy to overcome.",
        "Intramolecular covalent bonds remain intact during boiling.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "Relatively weak forces between molecules require comparatively little energy to overcome.",
        1,
      ],
      [
        "Strong covalent bonds within molecules are not broken during boiling.",
        1,
      ],
    ],
  ),
  part(
    "4(e)",
    "Molecules and carbon structures",
    "bonding",
    ["4.2.4.2"],
    written(
      "04e",
      "Evaluate nanoparticle evidence",
      "In matched tests, 0.20 g of a nanoparticle coating and 1.00 g of a conventional coating give the same protective performance. The tests report no exposure or health measurements. Give one supported advantage and one limitation on a safety conclusion.",
      "The nanoparticle coating achieves the tested performance with a smaller material mass. The performance comparison alone cannot establish human or environmental safety because relevant exposure and health evidence is missing.",
      [
        "Less material for the supplied equal performance.",
        "Missing exposure/health evidence prevents a safety conclusion.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Smaller mass achieves the same reported performance under the matched test conditions.",
        1,
      ],
      [
        "Safety is not established: the test lacks relevant exposure/health evidence. Do not infer either universal safety or universal harm.",
        1,
      ],
    ],
  ),
];

const quantities: ExamPart[] = [
  part(
    "5(a)",
    "Mass and chemical formulae",
    "quantitative",
    ["4.3.1.2"],
    written(
      "05a",
      "Define relative formula mass",
      "State how relative formula mass is obtained from a chemical formula and relative atomic masses.",
      "Add the relative atomic masses of all atoms in the formula, including the correct number of each atom.",
      ["Sum relative atomic masses for all atoms represented in the formula."],
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Sum the relative atomic masses of all atoms in the formula, using the formula's atom counts.",
        1,
      ],
    ],
  ),
  part(
    "5(b)",
    "Mass and chemical formulae",
    "quantitative",
    ["4.3.1.2"],
    question(
      "05b",
      "Calculate a bracketed formula mass",
      "Calculate the relative formula mass of Mg(NO₃)₂. Use Mg = 24, N = 14 and O = 16. Show your working.",
      "148",
      {
        explanation:
          "24 + 2×14 + 6×16 = 148. The outside subscript multiplies the whole nitrate group; relative formula mass has no unit.",
      },
    ),
    2,
    [0, 2, 0],
    1,
    [
      [
        "Correct weighted atom sum: 24 + 2×14 + 6×16 (or 24 + 2×(14 + 3×16)). A correct final result from contradictory atom counts is not full credit.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "5(c)",
    "Mass and chemical formulae",
    "quantitative",
    ["4.3.1.1", "4.3.1.3"],
    written(
      "05c",
      "Explain the weighed boundary",
      "A reaction releases a gas. Explain why the balance reading can decrease when an open flask is weighed, while total mass is conserved if the flask and all released gas are included.",
      "Atoms are rearranged in the reaction, not destroyed. Gas leaves the open flask's weighed boundary, so its reading decreases. Counting the retained material and every released gas together conserves the total mass.",
      [
        "Atoms are rearranged rather than destroyed.",
        "Escaping gas leaves the weighed flask.",
        "The wider gas-included total retains all matter.",
      ],
    ),
    3,
    [3, 0, 0],
    0,
    [
      ["The reaction rearranges atoms without creating or destroying them.", 1],
      [
        "Gas leaves the open flask, crossing the weighed boundary and reducing that reading.",
        1,
      ],
      [
        "The retained material plus all released gas includes the original matter and conserves total mass.",
        1,
      ],
    ],
  ),
  part(
    "5(d)",
    "Mass and chemical formulae",
    "quantitative",
    ["4.1.1.1", "4.3.1.1"],
    question(
      "05d",
      "Write the complete equation",
      "Magnesium reacts completely with oxygen to form magnesium oxide. Write a balanced symbol equation. State symbols are not required for this question.",
      "2 Mg + O₂ → 2 MgO",
      {
        writtenEquations: true,
        rubric: [
          "Correct intact formulas on the correct sides.",
          "Balanced whole-number coefficients.",
        ],
        referenceResponse:
          "2 Mg + O₂ → 2 MgO. Accept any positive balanced whole-number multiple. Do not alter oxygen's subscript to balance.",
      },
    ),
    2,
    [0, 2, 0],
    0,
    [
      [
        "Mg and O₂ as reactants; MgO as the product. Do not substitute MgO₂ or atomic O.",
        1,
      ],
      [
        "Coefficients 2:1:2 or a positive balanced whole-number multiple. Award the balancing point only for the correct formula skeleton.",
        1,
      ],
    ],
  ),
  part(
    "5(e)",
    "Mass and chemical formulae",
    "quantitative",
    ["4.3.1.3"],
    written(
      "05e",
      "Infer the additional mass",
      "A supplied report states that a clean metal sample increases from 30.0 g to 35.0 g after reacting with oxygen. No material falls off and no other substance is added. Identify the source of the increased mass and use the readings to justify its amount.",
      "Oxygen from outside the original sample combines with the metal. Its incorporated mass is 35.0 − 30.0 = 5.0 g.",
      [
        "External oxygen becomes part of the weighed solid.",
        "The readings support 5.0 g incorporated oxygen under the stated conditions.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Oxygen from the surroundings is incorporated into the solid, rather than matter being created.",
        1,
      ],
      [
        "5.0 g from 35.0−30.0, explicitly linked to the stated absence of other material changes.",
        1,
      ],
    ],
    { mathematics: true },
  ),
];

const measurements: ExamPart[] = [
  part(
    "6(a)",
    "Measurements and product recovery",
    "quantitative",
    ["4.3.1.4", "4.4.2.5"],
    question(
      "06a",
      "Summarise the titres",
      "Three accepted careful titration volumes are 24.10, 24.20 and 24.30 cm³. Calculate their arithmetic mean and the half-range uncertainty requested by this protocol. Give both to two decimal places and show your working.",
      '{"mean":"24.20","halfRange":"0.10"}',
      {
        parts: [
          { id: "mean", label: "Mean titre", answer: 24.2, unit: "cm³" },
          { id: "halfRange", label: "Half-range", answer: 0.1, unit: "cm³" },
        ],
        explanation:
          "Mean = (24.10 + 24.20 + 24.30) ÷ 3 = 24.20 cm³. Half-range = (24.30 − 24.10) ÷ 2 = 0.10 cm³. Half-range is this protocol's stated convention, not a universal confidence interval.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      ["Sum all three accepted volumes and divide by three.", 1],
      [
        "Mean 24.20 cm³; a correct continuation of earlier arithmetic may receive this point, with the requested precision.",
        1,
      ],
      [
        "Half-range (24.30−24.10)/2 = 0.10 cm³, with the requested precision. Do not report the full range as half-range.",
        1,
      ],
    ],
    { mathematics: true, practical: 2 },
  ),
  part(
    "6(b)",
    "Measurements and product recovery",
    "quantitative",
    ["4.3.1.4"],
    written(
      "06b",
      "Evaluate agreement",
      "A measuring instrument repeatedly reads 9.50 g for a reference known to be 10.00 g. The repeated readings agree exactly. Explain why agreement does not establish accuracy and suggest one relevant improvement.",
      "The readings show a shared −0.50 g bias relative to the known reference. Repetition alone does not remove this systematic error. Check and correct the instrument's calibration or zero using suitable references.",
      [
        "Agreement can coexist with a shared systematic bias.",
        "Calibration/zero check against references addresses the bias.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Repeated agreement concerns precision; the consistent reference mismatch shows a shared bias/systematic error.",
        1,
      ],
      [
        "Check/calibrate/correct zero or replace the faulty instrument against a suitable known reference. Repeating the unchanged biased method alone is insufficient.",
        1,
      ],
    ],
  ),
  part(
    "6(c)",
    "Measurements and product recovery",
    "quantitative",
    ["4.3.3.1"],
    question(
      "06c",
      "Calculate the percentage yield",
      "The theoretical maximum mass of a dry product is 12.0 g. A preparation collects 9.60 g of the pure dry product. Calculate percentage yield. Show your working.",
      "80",
      {
        unit: "%",
        explanation:
          "9.60 ÷ 12.0 × 100 = 80.0%. The measured amount is pure and dry here, so contamination is not included in its product mass.",
      },
    ),
    3,
    [0, 3, 0],
    1,
    [
      [
        "Actual product mass 9.60 g divided by theoretical product mass 12.0 g, in that order.",
        1,
      ],
      [
        "Multiply the ratio by 100 to obtain a percentage. Correct continuation of an earlier arithmetic error can receive a method point; contradictory working prevents full credit.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "6(d)",
    "Measurements and product recovery",
    "quantitative",
    ["4.3.3.1"],
    written(
      "06d",
      "Explain yield losses",
      "Give two distinct chemical or collection reasons why a product yield can be below its theoretical maximum. Do not give wet or contaminated product as a reason for the lower dry product yield.",
      "Any two: a reversible reaction may not go to completion; product may be lost during separation/transfer; some reactants may form different products in competing reactions.",
      [
        "One valid distinct reaction/collection loss.",
        "A second distinct loss.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "One: reversible reaction not complete, product lost during separation/transfer, or competing reactions forming other products.",
        1,
      ],
      [
        "A second distinct valid cause. Two descriptions of the same transfer loss do not count twice; contamination alone does not explain less actual dry product.",
        1,
      ],
    ],
  ),
];

const salts: ExamPart[] = [
  part(
    "7(a)",
    "Preparing a soluble salt",
    "chemical-changes",
    ["4.4.2.2"],
    question(
      "07a",
      "Choose the acid",
      "Which dilute acid reacts with copper(II) oxide to prepare copper(II) chloride?",
      "Hydrochloric acid",
      {
        options: ["Sulfuric acid", "Nitric acid", "Hydrochloric acid"],
        explanation:
          "Hydrochloric acid supplies chloride; sulfuric and nitric acids give sulfate and nitrate salts respectively.",
      },
    ),
    1,
    [1, 0, 0],
    1,
    [],
    { practical: 1 },
  ),
  part(
    "7(b)",
    "Preparing a soluble salt",
    "chemical-changes",
    ["4.4.2.3"],
    written(
      "07b",
      "Plan pure, dry crystals",
      "Describe a logically ordered supervised school method to prepare pure, dry copper(II) chloride crystals using insoluble copper(II) oxide and a suitable dilute acid. Name the acid; include appropriate apparatus and heating stages.",
      "Gently warm dilute hydrochloric acid in a suitable beaker. Add copper(II) oxide in small portions and stir until excess solid remains, showing the acid has reacted. Allow the mixture to cool as appropriate, then filter through paper in a funnel to remove excess oxide, collecting the salt solution. Transfer the filtrate to an evaporating basin and concentrate it gently using a water bath or electric heater; do not heat it to complete dryness. Leave it to cool and crystallise. Separate the crystals from the remaining solution and pat them dry with filter paper. Follow the school's controls for hot apparatus and copper compounds.",
      [
        "Suitable acid/oxide reaction, controlled warming and portionwise stirring to excess.",
        "Filter excess insoluble oxide; retain the dissolved salt in the filtrate.",
        "Controlled evaporation using a water bath/electric heater, then cooling to crystallise.",
        "Recover crystals and dry them without treating hard evaporation to dryness as crystallisation.",
        "Judge the whole method's chemical validity and logical sequence; these points are indicative content, not six automatic marks.",
      ],
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
          text: "A workable, clearly ordered method would produce pure, dry crystals. Reaction to excess, separation of the excess solid, controlled concentration, crystallisation and final recovery/drying are connected correctly. Choose within the band using completeness and clarity.",
        },
        {
          min: 3,
          max: 4,
          text: "Most relevant stages are described, but an omission or sequencing error makes the stated outcome unreliable. Choose within the band using how coherently the method works.",
        },
        {
          min: 1,
          max: 2,
          text: "Some relevant operations are named, but the account does not form a workable route to pure, dry crystals.",
        },
        { min: 0, max: 0, text: "No relevant, creditworthy method content." },
      ],
    },
  ),
  part(
    "7(c)",
    "Preparing a soluble salt",
    "chemical-changes",
    ["4.4.2.3"],
    question(
      "07c",
      "Account for crystallised salt",
      "A warm solution contains 20.0 g of dissolved salt. After cooling, 12.0 g remains dissolved in the mother liquor. Assuming no other loss, calculate the mass of the original dissolved salt transferred into crystals. Show your working.",
      "8",
      {
        unit: "g",
        explanation:
          "20.0 − 12.0 = 8.0 g crystallises. The dissolved 12.0 g is still present in the mother liquor; it has not disappeared.",
      },
    ),
    2,
    [0, 2, 0],
    1,
    [
      [
        "Subtract the salt still dissolved from the original dissolved salt, 20.0−12.0. Retain the mother-liquor salt in the matter account.",
        1,
      ],
    ],
    { mathematics: true, practical: 1 },
  ),
  part(
    "7(d)",
    "Preparing a soluble salt",
    "chemical-changes",
    ["4.4.2.3"],
    written(
      "07d",
      "Evaluate the evaporation stage",
      "A student proposes heating the filtered salt solution until all water has gone, instead of concentrating it and leaving it to cool. Give one reason to reject this change when preparing crystals by this method.",
      "Heating to complete dryness removes the solution needed for controlled cooling/crystallisation. Gently concentrate the filtrate and then cool it to form recoverable crystals; hard drying may also cause spitting or overheating.",
      [
        "A valid crystallisation or controlled-heating reason, rather than a blanket ban on using a Bunsen burner earlier in the method.",
      ],
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "A justified problem with complete drying: it prevents the intended solution-cooling crystallisation route or risks spitting/overheating. State a chemical/method reason, not only 'it is wrong'.",
        1,
      ],
    ],
    { practical: 1 },
  ),
];

const reactions: ExamPart[] = [
  part(
    "8(a)",
    "Reactivity and electrolysis",
    "chemical-changes",
    ["4.1.2.5", "4.4.1.2"],
    written(
      "08a",
      "Recall visible observations",
      "Give two visible observations when sodium reacts with room-temperature water in a supervised demonstration. Do not give the names of unseen products as observations.",
      "Any two distinct observations: bubbles/effervescence; movement across the surface; floating; melting into a ball; the metal getting smaller/disappearing. A flame can occur but is not required in every demonstration.",
      ["One valid visible observation.", "A second distinct observation."],
    ),
    2,
    [2, 0, 0],
    0,
    [
      [
        "One visible observation: bubbles, movement, floating, melting into a ball or metal disappearing. Allow an observed flame; do not require one.",
        1,
      ],
      [
        "A second distinct visible observation. Naming hydrogen or sodium hydroxide alone is not a visible observation.",
        1,
      ],
    ],
  ),
  part(
    "8(b)",
    "Reactivity and electrolysis",
    "chemical-changes",
    ["4.4.1.2"],
    written(
      "08b",
      "Interpret displacement evidence",
      "Matched tests show that P displaces Q and R from their salt solutions; Q displaces R but not P; R displaces neither P nor Q. Give the most-to-least reactive order and explain it using the evidence.",
      "P > Q > R. A more reactive metal displaces a less reactive one: P displaces both, Q displaces only R, and R displaces neither.",
      ["Order P, Q, R.", "Link the displacement evidence to the rule."],
    ),
    2,
    [0, 0, 2],
    0,
    [
      ["Most to least: P, Q, R.", 1],
      [
        "The more reactive metal displaces the less reactive; explicitly connect this rule to the supplied reactions/non-reactions.",
        1,
      ],
    ],
  ),
  part(
    "8(c)",
    "Reactivity and electrolysis",
    "chemical-changes",
    ["4.4.1.3"],
    written(
      "08c",
      "Judge a carbon route",
      "The supplied reactivity order is magnesium > carbon > zinc. A student proposes extracting both magnesium and zinc from their oxides by carbon reduction. Identify the unsupported extraction and explain why.",
      "The proposed magnesium extraction is unsupported: magnesium is more reactive than carbon, so its oxide cannot be reduced by this carbon route. Zinc is below carbon in the supplied order.",
      ["Reject the magnesium route using magnesium's position above carbon."],
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Magnesium, because it is more reactive than carbon. Both the identification and the source-based reason are needed.",
        1,
      ],
    ],
  ),
  part(
    "8(d)",
    "Reactivity and electrolysis",
    "chemical-changes",
    ["4.4.3.4"],
    written(
      "08d",
      "Predict aqueous products",
      "An aqueous copper(II) chloride solution is electrolysed using inert electrodes. Use the GCSE product rules to name the product at the negative electrode and the product at the positive electrode.",
      "Copper at the negative cathode; chlorine at the positive anode.",
      [
        "Copper at the negative electrode.",
        "Chlorine at the positive electrode.",
      ],
    ),
    2,
    [0, 2, 0],
    0,
    [
      ["Copper at the negative electrode/cathode.", 1],
      [
        "Chlorine at the positive electrode/anode. Chloride ions are reactants, not the discharged chlorine product.",
        1,
      ],
    ],
    { practical: 3 },
  ),
  part(
    "8(e)",
    "Reactivity and electrolysis",
    "chemical-changes",
    ["4.4.3.3"],
    written(
      "08e",
      "Explain the aluminium cell",
      "Explain the heating-energy benefit of dissolving aluminium oxide in molten cryolite, and why carbon positive electrodes need repeated replacement.",
      "The mixture melts at a lower temperature than pure aluminium oxide, so less heating energy is needed to keep it molten; electrical energy is still needed. Oxygen produced at the positive electrode reacts with its carbon, forming carbon dioxide in the simplified cell. Carbon is consumed, so the electrode needs replacement.",
      [
        "Lower melting temperature linked to reduced heating energy.",
        "Oxygen reacts with carbon at the positive electrode.",
        "Carbon is consumed and therefore needs replacement.",
      ],
    ),
    3,
    [3, 0, 0],
    0,
    [
      [
        "Lower melting point/required temperature of the mixture linked to less heating energy. 'Cheaper' alone is not the explanation.",
        1,
      ],
      [
        "Produced oxygen reacts with the carbon electrode, forming carbon dioxide in the simplified account.",
        1,
      ],
      [
        "This chemical consumption uses up the carbon, so the electrode must be replaced. Physical wear alone is insufficient.",
        1,
      ],
    ],
  ),
];

const energy: ExamPart[] = [
  part(
    "9(a)",
    "Energy changes and fresh-trial data",
    "energy-changes",
    ["4.5.1.1"],
    written(
      "09a",
      "Define exothermic",
      "State what happens to energy in an exothermic reaction.",
      "Energy is transferred from the reacting system to its surroundings.",
      ["Energy transferred to the surroundings."],
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Energy is transferred from the reacting system to the surroundings. A temperature rise alone does not define the direction of energy transfer.",
        1,
      ],
    ],
  ),
  part(
    "9(b)",
    "Energy changes and fresh-trial data",
    "energy-changes",
    ["4.5.1.2"],
    question(
      "09b",
      "Construct a reaction profile",
      "Draw a profile: reactants 75 kJ; energy released 30 kJ; forward activation 55 kJ. Add both energy arrows.",
      JSON.stringify({
        reactant: "75",
        product: "45",
        peak: "130",
        activationArrow: "reactants-peak",
        overallArrow: "reactants-products",
      }),
      {
        profileDrawing: true,
        compactProfileInstructions: true,
        explanation:
          "Products: 75−30=45. Peak: 75+55=130. Forward activation runs from the reactant level to the peak; the overall change runs from reactants down to products. These are relative energy units, not an enthalpy calculation in kJ/mol.",
      },
    ),
    3,
    [0, 3, 0],
    0,
    [
      [
        "Reactant level 75 and product level 45, with products lower because energy is released.",
        1,
      ],
      [
        "Peak level 130, 55 units above the reactants; do not use 55 as the absolute peak.",
        1,
      ],
      [
        "Both arrows: activation from reactants to peak; overall change from reactants to products.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "9(c)",
    "Energy changes and fresh-trial data",
    "energy-changes",
    ["4.5.1.2"],
    written(
      "09c",
      "Evaluate an energy claim",
      "For a separate profile with reactants at 60 and a peak at 105, a student says: 'The activation energy is 105 because that is the highest level.' Explain the error.",
      "Activation energy is the difference between the peak and the reactants, 105−60=45 units. The peak's position on a relative scale is not that difference.",
      ["Distinguish the height difference from the absolute peak level."],
    ),
    1,
    [0, 0, 1],
    0,
    [
      [
        "Explain that activation energy is peak minus reactant level, giving 45; 105 is the peak's relative level.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "9(d)",
    "Energy changes and fresh-trial data",
    "energy-changes",
    ["4.5.1.1"],
    written(
      "09d",
      "Identify practical variables",
      "A student investigates how the mass of an endothermically dissolving salt affects the lowest temperature reached. Each mass dissolves fully in a fresh, equal volume of water. Name the independent variable and the dependent variable.",
      "Independent: mass of salt added. Dependent: lowest temperature reached, measured in degrees Celsius.",
      [
        "Independent variable: salt mass.",
        "Dependent variable: lowest temperature.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["Independent: mass of salt added, not simply 'salt'.", 1],
      [
        "Dependent: lowest temperature reached (or a clearly defined temperature decrease from a matched start).",
        1,
      ],
    ],
    { practical: 4 },
  ),
  part(
    "9(e)",
    "Energy changes and fresh-trial data",
    "energy-changes",
    ["4.5.1.1"],
    written(
      "09e",
      "Plot and fit the observations",
      "Plot all six observations and draw a balanced straight best-fit line. The intercept estimate carries no extra mark.",
      "One suitable line is T = 25.0−0.50m. It balances the original observations rather than joining successive points. Its intercept is an extrapolated estimate, not a measured zero-mass trial; other balanced fits are possible.",
      [
        "Plot every observation accurately on the supplied scale.",
        "Construct a balanced straight best-fit line, keeping points and fit distinct.",
      ],
      {
        fuelDrawing: {
          data: {
            title: "Original full-paper temperature observations",
            context: "temperature",
            fitKind: "straight",
            xName: "Mass of salt",
            xUnit: "g",
            yName: "Lowest temperature",
            yUnit: "°C",
            points: [
              [2, 24.1],
              [4, 22.9],
              [6, 22.1],
              [8, 20.9],
              [10, 20.1],
              [12, 18.9],
            ],
            xMin: 0,
            xMax: 14,
            xTick: 2,
            yMin: 16,
            yMax: 28,
            yTick: 2,
            targetX: 0,
            estimateRange: [24.8, 25.2],
            trend: "Lowest temperature decreases as salt mass increases.",
            limit:
              "The intercept lies outside the measured masses and is an estimate, not a new observation.",
            note: "One suitable reference is T = 25.0−0.50m; other balanced straight fits are possible.",
          },
          referenceLine: [24, 19],
          note: "Original illustrative data: separate fresh trials, full dissolution, equal water volume, matched starting temperature, cup, stirring and measurement procedure. The printed temperature scale is truncated; its bottom is not zero.",
        },
      },
    ),
    3,
    [0, 2, 1],
    0,
    [
      [
        "All six points plotted to within half a small grid square: 2 marks; four or five accurate points: 1 mark. Review the original coordinates rather than whether they lie on the fitted line.",
        2,
      ],
      [
        "A balanced straight best-fit line through the scatter. Do not require the single reference line or a line through every observation.",
        1,
      ],
    ],
    { mathematics: true, practical: 4 },
  ),
];

const cells: ExamPart[] = [
  part(
    "10(a)",
    "Cells and practical decisions",
    "energy-changes",
    ["4.5.2.1"],
    written(
      "10a",
      "Explain recharging",
      "Explain how a rechargeable cell can be used again after it discharges.",
      "During discharge chemical reactions supply electrical energy. Passing an external electric current in the charging direction reverses the reactions, restoring the reactants for another discharge.",
      [
        "An external electric current is passed during charging.",
        "Charging reverses the chemical reactions/restores reactants.",
      ],
    ),
    2,
    [2, 0, 0],
    0,
    [
      ["An external electric current is used to recharge the cell.", 1],
      [
        "The reactions are reversed, regenerating reactants. Merely 'putting energy back' does not explain the chemistry.",
        1,
      ],
    ],
  ),
  part(
    "10(b)",
    "Cells and practical decisions",
    "energy-changes",
    ["4.5.2.2"],
    written(
      "10b",
      "Supply a fuel cell",
      "Name the two reactants that must be continuously supplied to a hydrogen fuel cell while it operates.",
      "Hydrogen and oxygen.",
      ["Both hydrogen and oxygen."],
    ),
    1,
    [1, 0, 0],
    0,
    [
      [
        "Both hydrogen and oxygen. Water is the reaction product, not a replacement fuel.",
        1,
      ],
    ],
  ),
  part(
    "10(c)",
    "Cells and practical decisions",
    "energy-changes",
    ["4.5.1.1"],
    written(
      "10c",
      "Improve a thermal comparison",
      "For three salt-mass trials, a student uses different water volumes, starts the water at different temperatures and reads the thermometer only once after five minutes. Give a specific improvement for each of these three problems.",
      "Use the same measured water volume in each fresh trial; start every trial at the same measured temperature; monitor temperature at short regular intervals with a consistent stirring method so the lowest temperature is captured rather than missed during warming back towards room temperature.",
      [
        "Match measured water volume.",
        "Match starting temperature.",
        "Monitor temperatures to capture the minimum.",
      ],
    ),
    3,
    [0, 0, 3],
    0,
    [
      ["Use the same measured water volume in each fresh trial.", 1],
      [
        "Bring each fresh water portion to the same measured starting temperature.",
        1,
      ],
      [
        "Take frequent/continuous temperature readings to capture the minimum rather than one arbitrary five-minute reading. 'Repeat it' alone does not repair this problem.",
        1,
      ],
    ],
    { practical: 4 },
  ),
  part(
    "10(d)",
    "Cells and practical decisions",
    "energy-changes",
    ["4.5.2.1"],
    question(
      "10d",
      "Combine supplied voltages",
      "Two cells supply 1.2 V and 1.4 V. In the stated aligned series arrangement their voltages add. Calculate the total voltage. Show your working.",
      "2.6",
      {
        unit: "V",
        explanation:
          "1.2+1.4=2.6 V for the supplied aligned series arrangement. Reversing a cell would be a different arrangement.",
      },
    ),
    2,
    [0, 2, 0],
    1,
    [
      [
        "Add the two supplied voltages, 1.2+1.4, using the stated arrangement.",
        1,
      ],
    ],
    { mathematics: true },
  ),
  part(
    "10(e)",
    "Cells and practical decisions",
    "energy-changes",
    ["4.5.2.1", "4.5.2.2"],
    written(
      "10e",
      "Evaluate a power choice",
      "An instrument must run seven days without a charging supply. The battery lasts one day. A fuel cell lasts seven days only with sufficient reactant supplies. Justify a choice and state one remaining requirement or limitation.",
      "Choose the fuel cell under the stated conditions: the battery runs out after one day and cannot be recharged at the site. Confirm that enough hydrogen and oxygen can actually be supplied for seven days (including suitable storage/handling). This conclusion uses the supplied runtime and site conditions; it is not a claim that fuel cells are always better.",
      [
        "A justified choice using runtime and charging conditions.",
        "A remaining fuel/reactant-supply requirement or valid contextual limitation.",
      ],
    ),
    2,
    [0, 0, 2],
    0,
    [
      [
        "Recommend the fuel cell using the seven-day demand and the battery's one-day life/no charging supply. A bare preference earns no point.",
        1,
      ],
      [
        "Identify the conditional need for enough supplied hydrogen and oxygen, suitable storage/handling, or another specific feasibility condition. Do not assume an unlimited free fuel supply.",
        1,
      ],
    ],
  ),
];

// All ten contexts were individually authored from reviewed scientific and
// marking demands; this is a single original full-length practice paper.
export const paper1FoundationFull: ExamPaper = {
  id: "paper-1-foundation-full",
  totalMarks: 100,
  minutes: 105,
  parts: [
    ...atoms,
    ...periodic,
    ...ionic,
    ...carbon,
    ...quantities,
    ...measurements,
    ...salts,
    ...reactions,
    ...energy,
    ...cells,
  ],
};

// Individually checked conceptual repeats: changing an element name, response
// format or heading does not make the same recalled reasoning fresh evidence.
const reviewedRecallLinks: Record<string, string[]> = {
  "01a": ["atom-v2-cb-neutral"],
  "01c": ["g0-v1-w-shell"],
  "01d": ["iso-v1-g-carbon"],
  "02a": [
    "pd-v1-p-explain",
    "pd-write-v1-ca-history",
    "pd-write-v1-ra-history",
  ],
  "02d": ["tm-v1-p-explain"],
  "04b": ["gr-write-v1-ca-conduction", "gr-write-v1-p-electrode"],
  "04c": ["gr-v1-p-explain", "gr-write-v1-ra-allotropes"],
  "04d": ["mp-v1-p-bonds", "mp-write-v1-ca-boiling", "mp-v1-ra-force"],
  "09a": ["heat-v1-p-exo", "heat-v1-r-transfer"],
  "10a": ["cf-v1-r-restore", "cf-v1-p-secondary"],
};
for (const [suffix, aliases] of Object.entries(reviewedRecallLinks)) {
  const q = paper1FoundationFull.parts.find(
    (p) => p.question.id === prefix + suffix,
  )!.question;
  q.exposureAliases = [...new Set([...(q.exposureAliases ?? []), ...aliases])];
}
