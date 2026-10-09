import type { Course, Question, Tier } from "./types";
import type { ExamPaper } from "./exam-paper-types";
export interface Assessment {
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  tier: Tier;
  course?: Course;
  structure?: "short" | "extended" | "full";
  examPaper?: ExamPaper;
  kind: "diagnostic" | "paper";
  minutes: number;
  questions: Question[];
  topics: string[];
}
const q = (
  id: string,
  prompt: string,
  answer: string,
  options: string[],
  explanation: string,
): Question => ({
  id,
  prompt,
  answer,
  options: options.includes(answer) ? options : undefined,
  explanation,
  hint: "This is an independent question. Choose or enter your best response.",
});
const diagnosticRows: [string, string, string[], string, string][] = [
  [
    "A neutral atom has 9 protons. How many electrons does it have?",
    "9",
    [],
    "Nine negative electrons balance nine positive protons.",
    "atomic-structure",
  ],
  [
    "An atom has mass number 27 and atomic number 13. How many neutrons?",
    "14",
    [],
    "27 − 13 = 14.",
    "atomic-structure",
  ],
  [
    "What carries electric current in molten magnesium chloride?",
    "Moving ions",
    ["Moving electrons only", "Moving ions", "Neutrons"],
    "Charged ions are mobile when the salt is molten.",
    "bonding",
  ],
  [
    "Why does solid copper conduct electricity?",
    "It has delocalised electrons",
    [
      "Its positive ions move through the solid",
      "It has delocalised electrons",
      "It contains water",
    ],
    "Electrons carry current through a metal.",
    "bonding",
  ],
  [
    "Calculate the relative formula mass of NH₃, using N = 14 and H = 1.",
    "17",
    [],
    "14 + 3 × 1 = 17.",
    "quantitative",
  ],
  [
    "A solution contains 9 g solute in 0.3 dm³. Give its concentration in g/dm³.",
    "30",
    [],
    "9 ÷ 0.3 = 30 g/dm³.",
    "quantitative",
  ],
  [
    "A metal carbonate reacts with an acid. Which gas forms?",
    "Carbon dioxide",
    ["Hydrogen", "Carbon dioxide", "Oxygen"],
    "Carbonate + acid forms salt, water and CO₂.",
    "chemical-changes",
  ],
  [
    "Molten magnesium chloride is electrolysed. Which substance forms at the cathode?",
    "Magnesium",
    ["Chlorine", "Magnesium", "Hydrogen"],
    "Mg²⁺ ions gain electrons to form magnesium.",
    "chemical-changes",
  ],
  [
    "Surroundings warm during a reaction. What type of reaction is this?",
    "Exothermic",
    ["Endothermic", "Exothermic", "A reaction with no energy transfer"],
    "Energy is transferred from the reacting system to the surroundings.",
    "energy",
  ],
  [
    "Reactants are at 15 kJ and a reaction-profile peak is at 65 kJ. Give activation energy in kJ.",
    "50",
    [],
    "65 − 15 = 50 kJ.",
    "energy",
  ],
  [
    "A reaction makes 35 cm³ of gas in 7 s. Give its mean rate in cm³/s.",
    "5",
    [],
    "35 ÷ 7 = 5 cm³/s.",
    "rates",
  ],
  [
    "Which explanation describes a catalyst?",
    "It provides a lower-activation-energy pathway",
    [
      "It changes the atomic numbers",
      "It provides a lower-activation-energy pathway",
      "It always doubles final product amount",
    ],
    "A catalyst increases rate without changing the overall stoichiometric yield.",
    "rates",
  ],
  [
    "How many hydrogen atoms are in the alkane C₄Hₓ?",
    "10",
    [],
    "Alkanes have formula CₙH₂ₙ₊₂, so x = 10.",
    "organic",
  ],
  [
    "Which compound decolourises bromine water by addition?",
    "Propene",
    ["Propane", "Propene", "Methane"],
    "Propene contains a carbon–carbon double bond.",
    "organic",
  ],
  [
    "A spot travels 2 cm and the solvent front 8 cm. Calculate Rf.",
    "0.25",
    [],
    "2 ÷ 8 = 0.25.",
    "analysis",
  ],
  [
    "A gas relights a glowing splint. Which gas is it?",
    "Oxygen",
    ["Carbon dioxide", "Oxygen", "Hydrogen"],
    "Oxygen supports combustion.",
    "analysis",
  ],
  [
    "Which gas makes up the largest fraction of today’s atmosphere?",
    "Nitrogen",
    ["Oxygen", "Nitrogen", "Carbon dioxide"],
    "Nitrogen is about 78% of the atmosphere.",
    "atmosphere",
  ],
  [
    "Greenhouse gases absorb part of Earth’s outgoing…",
    "Infrared radiation",
    ["Sound", "Infrared radiation", "Visible light only"],
    "The surface emits infrared radiation.",
    "atmosphere",
  ],
  [
    "Potable water must be…",
    "Safe to drink",
    [
      "Chemically pure H₂O only",
      "Safe to drink",
      "Free of all dissolved minerals",
    ],
    "Potable and chemically pure have different meanings.",
    "resources",
  ],
  [
    "Why can zinc protect scratched iron from rusting?",
    "Zinc is more reactive and oxidises preferentially",
    [
      "Zinc is less reactive than iron",
      "Zinc is more reactive and oxidises preferentially",
      "Zinc removes iron’s protons",
    ],
    "Sacrificial protection can continue even where a barrier is scratched.",
    "resources",
  ],
];
const higherRows: [string, string, string[], string, string][] = [
  [
    "An ion contains 16 protons and 18 electrons. Give its signed charge.",
    "-2",
    [],
    "16 − 18 = −2.",
    "atomic-structure",
  ],
  [
    "Why does Group 7 reactivity decrease down the group?",
    "Weaker attraction to an incoming electron",
    [
      "Larger nuclei make electrons disappear",
      "Weaker attraction to an incoming electron",
      "Outer shells become empty",
    ],
    "Distance and shielding reduce attraction to an incoming electron.",
    "atomic-structure",
  ],
  [
    "Which structure explains graphite’s conductivity?",
    "Three bonds per carbon and delocalised electrons",
    [
      "Four bonds per carbon with no free electrons",
      "Three bonds per carbon and delocalised electrons",
      "A lattice of Na⁺ and Cl⁻",
    ],
    "One electron per carbon is delocalised through the layers.",
    "bonding",
  ],
  [
    "Why do ionic compounds conduct in solution but not as solids?",
    "Their ions become mobile",
    [
      "Their atomic numbers change",
      "Their ions become mobile",
      "Water removes every charge",
    ],
    "Mobile ions carry current.",
    "bonding",
  ],
  [
    "How many moles are in 22 g CO₂? Use molar mass 44 g/mol.",
    "0.5",
    [],
    "22 ÷ 44 = 0.5 mol.",
    "quantitative",
  ],
  [
    "For N₂ + 3H₂ → 2NH₃, how many moles NH₃ form from 1.5 mol H₂ with excess N₂?",
    "1",
    [],
    "1.5 × 2/3 = 1 mol.",
    "quantitative",
  ],
  [
    "A change from pH 5 to pH 2 increases H⁺ concentration by what factor?",
    "1000",
    [],
    "Three pH steps give 10³ = 1000.",
    "chemical-changes",
  ],
  [
    "At a cathode, Cu²⁺ + 2e⁻ → Cu is which process?",
    "Reduction",
    ["Oxidation", "Reduction", "Thermal decomposition"],
    "The ion gains electrons.",
    "chemical-changes",
  ],
  [
    "Breaking bonds costs 720 kJ/mol and forming bonds releases 900 kJ/mol. Give reaction energy in kJ/mol.",
    "-180",
    [],
    "720 − 900 = −180 kJ/mol.",
    "energy",
  ],
  [
    "A catalyst changes which part of a reaction profile?",
    "The peak relative to reactants",
    [
      "The overall product–reactant energy difference",
      "The peak relative to reactants",
      "The number of atoms",
    ],
    "An alternative pathway lowers activation energy.",
    "energy",
  ],
  [
    "Increasing pressure for N₂ + 3H₂ ⇌ 2NH₃ favours…",
    "Ammonia",
    ["The reactants", "Ammonia", "Neither side under any conditions"],
    "The product side has fewer gas molecules.",
    "rates",
  ],
  [
    "At equilibrium, concentrations are…",
    "Constant but not necessarily equal",
    ["Always equal", "Constant but not necessarily equal", "Always zero"],
    "Equal forward and reverse rates give constant concentrations.",
    "rates",
  ],
  [
    "C₁₂H₂₆ → C₉H₂₀ + C₃Hₓ. Find x.",
    "6",
    [],
    "26 − 20 = 6, conserving hydrogen.",
    "organic",
  ],
  [
    "Why can an alkene undergo addition?",
    "Its carbon–carbon double bond can open",
    [
      "It has no carbon atoms",
      "Its carbon–carbon double bond can open",
      "It is always ionic",
    ],
    "The second bond allows new bonds to form without losing atoms.",
    "organic",
  ],
  [
    "A spot moves 5.4 cm and the solvent front 9 cm. Calculate Rf.",
    "0.6",
    [],
    "5.4 ÷ 9 = 0.6.",
    "analysis",
  ],
  [
    "Why must reference Rf values use the same solvent?",
    "Rf depends on experimental conditions",
    [
      "Rf never changes",
      "Rf depends on experimental conditions",
      "Solvent front distance is irrelevant",
    ],
    "Partitioning between solvent and stationary phase depends on conditions.",
    "analysis",
  ],
  [
    "Why can a cold winter coexist with long-term global warming?",
    "Short-term variability differs from long-term climate trends",
    [
      "Climate is measured by one day",
      "Short-term variability differs from long-term climate trends",
      "Warming means every day must be hotter",
    ],
    "Climate refers to long-term patterns and distributions.",
    "atmosphere",
  ],
  [
    "A life-cycle carbon footprint should include…",
    "A clearly defined boundary and assumptions",
    [
      "Only emissions at the shop",
      "A clearly defined boundary and assumptions",
      "A guarantee of zero uncertainty",
    ],
    "Different boundaries can change the comparison.",
    "atmosphere",
  ],
  [
    "Why is aluminium extracted by electrolysis rather than carbon reduction?",
    "It is more reactive than carbon",
    [
      "It is less reactive than copper",
      "It is more reactive than carbon",
      "It is not a metal",
    ],
    "Carbon cannot reduce its oxide under the usual extraction conditions.",
    "resources",
  ],
  [
    "A more reusable product is necessarily environmentally preferable…",
    "No; compare equal service across the complete life cycle",
    [
      "Yes regardless of use count",
      "No; compare equal service across the complete life cycle",
      "Only if it is heavier",
    ],
    "Production, transport, cleaning and disposal also contribute.",
    "resources",
  ],
];
export const diagnostics: Assessment[] = [diagnosticRows, higherRows].map(
  (rows, i) => ({
    slug: i ? "higher" : "foundation",
    title: i ? "Higher starting check" : "Foundation starting check",
    description:
      "Twenty low-stakes questions, two from each topic. Results suggest what to revisit; they do not predict a grade.",
    tier: i ? "higher" : "foundation",
    // The Foundation set includes separate-Chemistry sacrificial protection.
    course: i ? "combined" : "separate",
    kind: "diagnostic",
    minutes: 20,
    questions: rows.map((r, j) =>
      q(`diagnostic-${i}-${j}`, r[0], r[1], r[2], r[3]),
    ),
    topics: rows.map((r) => r[4]),
  }),
);
// Four original short papers. Numerical variants are deliberately specified here;
// these are skills practice, not full board-authentic mock examinations.
export const papers: Assessment[] = [0, 1, 2, 3].map((form) => {
  const offset = form + 1;
  const qs: Question[] = [];
  const strands: string[] = [];
  function numeric(
    topic: string,
    prompt: string,
    answer: number,
    explanation: string,
    unit = "",
  ) {
    const question = q(
      `paper-${form}-${qs.length}`,
      prompt,
      String(answer),
      [],
      explanation,
    );
    question.unit = unit;
    qs.push(question);
    strands.push(topic);
  }
  function choice(
    topic: string,
    prompt: string,
    answer: string,
    wrong: string[],
    explanation: string,
  ) {
    const all = [answer, ...wrong];
    const shift = (form + qs.length) % all.length;
    qs.push(
      q(
        `paper-${form}-${qs.length}`,
        prompt,
        answer,
        [...all.slice(shift), ...all.slice(0, shift)],
        explanation,
      ),
    );
    strands.push(topic);
  }
  numeric(
    "atomic-structure",
    `A neutral atom has ${10 + offset} protons and mass number ${24 + 2 * offset}. How many neutrons?`,
    14 + offset,
    `${24 + 2 * offset} − ${10 + offset} = ${14 + offset} neutrons.`,
    "neutrons",
  );
  choice(
    "atomic-structure",
    `Sample ${offset}: an atom loses two electrons. What charge does its ion have?`,
    "+2",
    ["−2", "0"],
    "Losing two negative charges leaves an overall charge of +2.",
  );
  choice(
    "bonding",
    `Material ${offset} consists of simple neutral molecules and has a low boiling point. Which explanation is appropriate?`,
    "Weak intermolecular forces",
    ["Weak covalent bonds within every molecule", "A giant ionic lattice"],
    "Boiling separates molecules without breaking the bonds within them.",
  );
  numeric(
    "quantitative",
    `A closed flask starts with ${18 + offset} g total reactants. All reactants completely form products and no material enters or leaves. What total product mass remains inside?`,
    18 + offset,
    "No matter leaves or enters; total mass is conserved.",
    "g",
  );
  numeric(
    "quantitative",
    `${4 * offset} g solute is dissolved to make 0.2 dm³ solution. Calculate concentration.`,
    20 * offset,
    `${4 * offset} ÷ 0.2 = ${20 * offset} g/dm³.`,
    "g/dm³",
  );
  choice(
    "chemical-changes",
    `Reaction ${offset}: dilute nitric acid reacts with sodium hydroxide. Which salt forms?`,
    "Sodium nitrate",
    ["Sodium chloride", "Sodium sulfate"],
    "Nitric acid supplies nitrate ions and sodium hydroxide supplies sodium ions.",
  );
  choice(
    "chemical-changes",
    `In electrolysis experiment ${offset}, a molten salt contains Ca²⁺ ions. Which electrode process forms calcium?`,
    "Gain of electrons at the cathode",
    ["Loss of electrons at the anode", "Gain of neutrons at either electrode"],
    "Positive ions move to the negative cathode and are reduced.",
  );
  numeric(
    "energy",
    `A reaction begins at ${18 + offset} °C and the surroundings reach ${27 + 2 * offset} °C. Calculate temperature rise.`,
    9 + offset,
    `Final minus initial = ${9 + offset} °C.`,
    "°C",
  );
  choice(
    "energy",
    `Reaction profile ${offset} has products at higher energy than reactants. It is…`,
    "Endothermic",
    ["Exothermic", "Always catalysed"],
    "Energy is taken into the reacting system.",
  );
  numeric(
    "rates",
    `A reaction produces ${36 * offset} cm³ gas in 12 s. Calculate mean rate.`,
    3 * offset,
    `${36 * offset} ÷ 12 = ${3 * offset} cm³/s.`,
    "cm³/s",
  );
  choice(
    "rates",
    `Investigation ${offset} compares equal masses of large chips and powder of the same solid. Why can powder react faster?`,
    "Greater exposed surface area",
    ["More mass was added", "Different chemical formula"],
    "More reactant particles are exposed at the surface.",
  );
  numeric(
    "organic",
    `An alkane has ${6 + form} carbon atoms. How many hydrogen atoms does its molecular formula contain?`,
    14 + 2 * form,
    `Use 2n + 2 = ${14 + 2 * form}.`,
    "atoms",
  );
  numeric(
    "analysis",
    `A chromatogram spot moves ${2 + form} cm and the solvent front moves 10 cm from the same baseline. Calculate Rf.`,
    (2 + form) / 10,
    `${2 + form}/10 = ${(2 + form) / 10}.`,
  );
  choice(
    "atmosphere",
    `Emission review ${offset}: which pollutant is linked with acid rain?`,
    "Sulfur dioxide",
    ["Argon", "Nitrogen itself"],
    "Sulfur dioxide can form acids in atmospheric water.",
  );
  choice(
    "resources",
    `Water sample ${offset} looks clear. Which conclusion is justified?`,
    "Further tests are needed to establish potability",
    ["It is definitely safe to drink", "It contains only H₂O"],
    "Invisible biological or chemical contaminants can remain.",
  );
  return {
    slug: `paper-${offset}`,
    title: `Foundation practice paper ${offset}`,
    description:
      "15 original short questions across all ten topics. A practice set, not a full official mock. One point per correct response.",
    tier: "foundation",
    course: "combined",
    kind: "paper",
    minutes: 15,
    questions: qs,
    topics: strands,
  };
});
export const assessments = [...diagnostics, ...papers];
export const higherPapers: Assessment[] = [0, 1, 2, 3].map((form) => {
  const factor = form + 1;
  const qs: Question[] = [];
  const strands: string[] = [];
  const numeric = (
    topic: string,
    prompt: string,
    answer: number,
    explanation: string,
    unit = "",
  ) => {
    const item = q(
      `higher-paper-${form}-${qs.length}`,
      prompt,
      String(answer),
      [],
      explanation,
    );
    item.unit = unit;
    qs.push(item);
    strands.push(topic);
  };
  const choice = (
    topic: string,
    prompt: string,
    answer: string,
    wrong: string[],
    explanation: string,
  ) => {
    const all = [answer, ...wrong];
    const offset = (form + qs.length) % all.length;
    qs.push(
      q(
        `higher-paper-${form}-${qs.length}`,
        prompt,
        answer,
        [...all.slice(offset), ...all.slice(0, offset)],
        explanation,
      ),
    );
    strands.push(topic);
  };
  numeric(
    "atomic-structure",
    `An ion has ${16 + form} protons and ${18 + form} electrons. Give its signed charge.`,
    -2,
    "Protons minus electrons = −2.",
  );
  choice(
    "bonding",
    `Structure comparison ${factor}: why does graphene conduct but diamond does not?`,
    "Graphene has delocalised electrons; diamond does not",
    ["Graphene has no covalent bonds", "Diamond has no electrons"],
    "Each carbon in graphene forms three bonds; diamond uses its outer electrons in four bonds.",
  );
  numeric(
    "quantitative",
    `${11 * factor} g CO₂ is collected. Calculate amount using molar mass 44 g/mol.`,
    factor / 4,
    `${11 * factor} ÷ 44 = ${factor / 4} mol.`,
    "mol",
  );
  numeric(
    "quantitative",
    `Using 24 dm³/mol at room temperature and pressure, calculate the volume of ${factor / 4} mol gas.`,
    6 * factor,
    `${factor / 4} × 24 = ${6 * factor} dm³.`,
    "dm³",
  );
  numeric(
    "quantitative",
    `For 2Mg + O₂ → 2MgO, calculate mass of MgO formed from ${Number((2.4 * factor).toFixed(1))} g magnesium with excess oxygen. Use Mg = 24 g/mol and MgO = 40 g/mol.`,
    4 * factor,
    `Amount of Mg = ${Number((2.4 * factor).toFixed(1))}/24 = ${Number((0.1 * factor).toFixed(1))} mol. The ratio is 1:1; multiply by 40.`,
    "g",
  );
  numeric(
    "chemical-changes",
    `For Al³⁺ + xe⁻ → Al, find x in charge-balanced half-equation ${factor}.`,
    3,
    "Three negative electrons balance the +3 ion charge.",
  );
  numeric(
    "chemical-changes",
    `An acid sample changes from pH ${5 + form} to pH ${3 + form}. By what factor does H⁺ concentration increase?`,
    100,
    "Two pH units correspond to a factor of 10² = 100.",
  );
  numeric(
    "energy",
    `Bond breaking requires ${500 + 100 * form} kJ/mol and bond formation releases ${700 + 100 * form} kJ/mol. Calculate reaction energy.`,
    -200,
    "Energy change = bonds broken − bonds formed = −200 kJ/mol.",
    "kJ/mol",
  );
  choice(
    "energy",
    `Profile ${factor} is exothermic. Which statement correctly links bonding and energy?`,
    "Formation releases more energy than breaking requires",
    [
      "Breaking bonds releases all the energy",
      "Products are necessarily higher in energy",
    ],
    "The net released energy comes from the difference between the two totals.",
  );
  choice(
    "rates",
    `For exothermic N₂ + 3H₂ ⇌ 2NH₃ in vessel ${factor}, what effect does higher temperature have on equilibrium ammonia yield?`,
    "It decreases yield",
    ["It increases yield", "A catalyst must make it unchanged"],
    "Higher temperature favours the reverse endothermic direction.",
  );
  choice(
    "rates",
    `For gas reaction H₂ + I₂ ⇌ 2HI in vessel ${factor}, increasing pressure alone…`,
    "Does not shift position because gaseous coefficients are equal",
    ["Always favours HI", "Always favours hydrogen"],
    "Two gas molecules are present on both sides of the balanced equation.",
  );
  numeric(
    "organic",
    `C${10 + form}H${22 + 2 * form} → C${7 + form}H${16 + 2 * form} + C₃Hₓ. Find x.`,
    6,
    "Hydrogen atoms are conserved: the difference is 6.",
  );
  numeric(
    "analysis",
    `A chromatography spot travels ${3 + form} cm while the solvent front travels ${6 + 2 * form} cm. Find Rf.`,
    0.5,
    "Both distances are from the same baseline; the spot travels half as far.",
  );
  choice(
    "atmosphere",
    `Climate dataset ${factor} includes natural year-to-year fluctuations alongside a rising long-term mean. Which conclusion is justified?`,
    "Variability and a long-term warming trend can coexist",
    [
      "A single cool year disproves the trend",
      "Every year must be warmer than the last",
    ],
    "Climate trends describe long-term distributions, not monotonic changes every year.",
  );
  choice(
    "resources",
    `Extraction comparison ${factor}: what makes recycling aluminium generally less energy-intensive than extracting it from ore?`,
    "Remelting avoids the energy-intensive reduction of aluminium oxide",
    [
      "Recycling creates new aluminium atoms",
      "Recycled metal contains no electrons",
    ],
    "Primary extraction requires electrolysis; recycling can remelt recovered metal.",
  );
  return {
    slug: `higher-paper-${factor}`,
    title: `Higher practice paper ${factor}`,
    description:
      "15 original short questions with mole ratios, electron transfer, bond energy and equilibrium. Not a full official mock.",
    tier: "higher",
    // AQA 4.3.5 gas-volume calculations are separate Chemistry content.
    course: "separate",
    kind: "paper",
    minutes: 20,
    questions: qs,
    topics: strands,
  };
});
papers.push(...higherPapers);
assessments.push(...higherPapers);
