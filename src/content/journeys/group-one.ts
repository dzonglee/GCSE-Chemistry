import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice as c, number as n } from "./helpers";
import { extendGroupOneWriting } from "./group-one-writing";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask =>
  c(
    `g1-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Alkali-metal reasoning: ${id}.`,
  );
const reaction = (
  initial: [
    "lithium" | "sodium" | "potassium",
    "water" | "chlorine" | "oxygen",
  ],
  target: typeof initial,
  instruction: string,
): TaskModel => ({ kind: "alkali-reaction", initial, target, instruction });
const water = q(
  "g-water",
  "Which first-three alkali metal gives the most vigorous typical reaction with water?",
  "Potassium",
  {
    Lithium: "Lithium is the least reactive of these three.",
    Sodium:
      "Sodium is more reactive than lithium but less reactive than potassium.",
  },
  "Reactivity increases Li → Na → K. Compare vigorous bubbling, movement and disappearance under comparable conditions; flame is not guaranteed in every sample.",
  "Compare each metal's reported water observations.",
);
water.title = "Compare reaction evidence";
water.model = reaction(
  ["lithium", "water"],
  ["potassium", "water"],
  "Compare lithium, sodium and potassium with water.",
);
water.openingHint = true;
const chlorine = q(
  "g-chlorine",
  "Sodium reacts with chlorine. Name the compound formed.",
  "Sodium chloride",
  {
    "Sodium hydroxide":
      "Hydroxide forms with water, not as this chlorine product.",
    Hydrogen:
      "Hydrogen is produced in the water reaction, not the metal–chlorine reaction.",
  },
  "Sodium transfers its outer electron to chlorine. The compound contains Na⁺ and Cl⁻ ions and is sodium chloride.",
  "Change the reactant and compare the product, not just the bubbling.",
);
chlorine.title = "A different reactant, a different product";
chlorine.model = reaction(
  ["sodium", "water"],
  ["sodium", "chlorine"],
  "Compare sodium with water and chlorine.",
);
const equation: LearningTask = {
  id: "g1-v1-g-equation",
  title: "Conserve atoms",
  prompt:
    "Balance Na + H₂O → NaOH + H₂. Use the simplest whole-number coefficients.",
  answer: JSON.stringify({
    metal: "2",
    water: "2",
    hydroxide: "2",
    hydrogen: "1",
  }),
  partLegend: "Four coefficients",
  parts: [
    { id: "metal", label: "Na coefficient", answer: 2 },
    { id: "water", label: "H₂O coefficient", answer: 2 },
    { id: "hydroxide", label: "NaOH coefficient", answer: 2 },
    { id: "hydrogen", label: "H₂ coefficient", answer: 1 },
  ],
  explanation:
    "2 Na + 2 H₂O → 2 NaOH + H₂. Both sides contain two Na, two O and four H atoms. Coefficient 1 is normally omitted.",
  hint: "Count both the hydrogen in hydroxide and the hydrogen in H₂. Never change a formula's subscripts.",
  purpose:
    "Connects water products to atom conservation using a visible incorrect ledger.",
  model: {
    kind: "alkali-water-equation",
    symbol: "Na",
    instruction: "Use the atom counts.",
  },
};
const ion = q(
  "g-ion",
  "Lithium forms its usual ion by losing its one outer electron. What is its charge?",
  "1+",
  {
    "1−": "Losing a negative electron makes the charge positive.",
    "3+": "Only one electron is lost; proton count does not give the usual ion charge.",
  },
  "Lithium keeps three protons and loses one of three electrons, leaving two electrons and charge +1. Its nucleus is unchanged.",
  "Keep the nucleus fixed and remove only the outer electron.",
);
ion.title = "One outer electron, one positive charge";
ion.model = {
  kind: "atom-transform",
  operation: "ion",
  initial: [3, 4, 3],
  target: [3, 4, 2],
  instruction: "Make Li⁺ by removing one electron; preserve the nucleus.",
};
const explain = q(
  "p-explain",
  "Explain why potassium reacts more readily than lithium even though potassium has more protons.",
  "",
  {},
  "Potassium has more occupied shells. Its outer electron is farther from the nucleus and more shielded; the attraction is weaker overall, so that electron is more easily lost.",
  "Link structure → attraction → electron loss. Do not stop at 'more shells'.",
);
explain.answer =
  "Potassium has more occupied electron shells, so its outer electron is farther from the nucleus and more shielded by inner electrons. The attraction between the nucleus and that outer electron is weaker overall despite the larger proton count. Less energy is needed to lose the outer electron, so potassium is more reactive.";
delete explain.options;
delete explain.misconceptions;
explain.rubric = [
  "More occupied shells put potassium's outer electron farther from the nucleus and provide more shielding.",
  "There is weaker attraction between the nucleus and outer electron overall, despite increased nuclear charge.",
  "The outer electron is more easily lost / requires less energy to remove, so potassium is more reactive.",
];
const lithiumBalance: LearningTask = {
  ...equation,
  id: "g1-v1-p-equation",
  title: "Balance a new metal",
  prompt:
    "Balance Li + H₂O → LiOH + H₂ using simplest whole-number coefficients.",
  model: undefined,
  parts: [
    { id: "metal", label: "Li coefficient", answer: 2 },
    { id: "water", label: "H₂O coefficient", answer: 2 },
    { id: "hydroxide", label: "LiOH coefficient", answer: 2 },
    { id: "hydrogen", label: "H₂ coefficient", answer: 1 },
  ],
  explanation:
    "2 Li + 2 H₂O → 2 LiOH + H₂: two Li, two O and four H atoms on each side.",
  purpose:
    "Independent transfer of products and conservation to a different alkali metal.",
};
export const groupOneJourney: LessonJourney = {
  version: 1,
  introduction:
    "Compare lithium, sodium and potassium: similar outer electrons explain related chemistry, while distance and shielding explain increasing reactivity. Separate observed bubbling from identified products, then conserve atoms in the water reaction.",
  outcomes: [
    "Describe typical first-three reactions with water, chlorine and oxygen; distinguish observations from products.",
    "Explain +1 ions and increasing reactivity using outer-electron distance, shielding and easier loss.",
    "Predict unfamiliar members from supplied trends, compare physical properties and balance a metal–water equation.",
  ],
  scopeNote:
    "AQA Chemistry 4.1.2.5 and Trilogy 5.1.2.5; Pearson 6.1–6.5 comparison. Observations vary with conditions. Oxygen reactions are described at GCSE level without claiming all products have the formula M₂O. Hydrogen is not an alkali metal; Groups 7 and 0 and transition-metal comparison have their own lessons. This is demonstration evidence and data interpretation, not an experiment procedure.",
  warmup: [
    q(
      "w-outer",
      "How many outer electrons does a neutral sodium atom with arrangement 2,8,1 have?",
      "One",
      {
        Three: "Three is its occupied-shell count.",
        Eleven: "Eleven is the total electron count.",
      },
      "The last occupied shell has one electron.",
      "Read the final entry.",
    ),
    q(
      "w-loss",
      "What happens to charge when a neutral atom loses one electron?",
      "It becomes 1+",
      {
        "It becomes 1−": "That would follow gaining an electron.",
        "It becomes a different element":
          "Electron loss does not change proton identity.",
      },
      "One fewer electron than protons gives +1.",
      "Use proton charge minus electron charge.",
    ),
  ],
  refresher: [
    q(
      "r-family",
      "Why are lithium, sodium and potassium chemically similar?",
      "Each has one outer electron and tends to lose it",
      {
        "Each has the same number of shells":
          "Shell count increases down the group.",
        "Each has the same mass": "Their atomic masses differ.",
      },
      "Outer-electron similarity explains their related reactions and +1 ions.",
      "Focus on the electrons involved in reactions.",
    ),
    q(
      "r-observe",
      "Which statement is directly observable in a demonstration?",
      "Bubbles appear and the metal moves",
      {
        "The outer electron is more easily lost":
          "This is a structural explanation inferred from evidence.",
        "The bubbles contain hydrogen":
          "Gas identity requires identification; bubbles alone do not name it.",
      },
      "Separate visible evidence from chemical interpretation. Bubbling supports gas production; identifying hydrogen is a further claim.",
      "Could you see it without naming particles or identifying the gas?",
    ),
    q(
      "r-products",
      "An alkali metal reacts with water to form which products?",
      "Metal hydroxide and hydrogen",
      {
        "Metal chloride and oxygen":
          "Chloride requires chlorine; this is not the water reaction.",
        "Metal oxide only": "Water reaction produces hydroxide and hydrogen.",
      },
      "The metal hydroxide dissolves to give an alkaline solution; hydrogen is released.",
      "Retrieve both products and the solution's behaviour.",
    ),
    q(
      "r-trend",
      "What makes the outer electron more easily lost down Group 1?",
      "Greater distance and shielding weaken its attraction to the nucleus",
      {
        "More protons alone make loss harder, so reactivity decreases":
          "This ignores increased distance and shielding.",
        "More outer electrons are available":
          "Each neutral atom still has one outer electron.",
      },
      "Increasing occupied shells increases distance and shielding. Overall attraction to the outer electron decreases, so removal is easier.",
      "Connect the structural change to the ease of losing the electron.",
    ),
    q(
      "r-oxygen",
      "How should the first-three reactions with oxygen be described at this GCSE level?",
      "They react to form oxygen-containing metal compounds, described as oxides",
      {
        "They always produce hydroxide and hydrogen without water":
          "Those are the water products.",
        "Every condition produces only pure M₂O":
          "Sodium/potassium can form other oxygen compounds; conditions matter.",
      },
      "Fresh surfaces tarnish; heating makes reaction with oxygen more vigorous. GCSE descriptions use metal oxide formation; precise products can include peroxides/superoxides, beyond this lesson's formula demand.",
      "Do not transfer the water products to oxygen.",
    ),
    q(
      "r-balance",
      "When balancing an equation, what may be changed?",
      "Coefficients in front of complete formulae",
      {
        "The subscript in H₂O to make a different substance":
          "Subscripts specify the substance and must remain fixed.",
        "The element symbols": "That would change the chemical species.",
      },
      "Coefficients change amounts while formulae retain substance identity.",
      "Conserve atoms without changing the products.",
    ),
  ],
  guided: [water, chlorine, equation, ion],
  practice: [
    q(
      "p-water",
      "Lithium reacts with water. Which pair names both products?",
      "Lithium hydroxide and hydrogen",
      {
        "Lithium chloride and hydrogen": "Water does not supply chlorine.",
        "Lithium oxide and oxygen": "These are not the water products.",
      },
      "Alkali metal + water → metal hydroxide + hydrogen. The dissolved hydroxide makes the solution alkaline.",
      "Name the metal-specific hydroxide and the gas.",
    ),
    q(
      "p-observe",
      "Which pair reports visible sodium–water evidence, rather than interpretations?",
      "Fizzing and movement across the surface",
      {
        "Hydrogen identity and electron loss":
          "These identify/explain the reaction rather than report two visible observations.",
        "A full outer shell and weaker attraction":
          "Those are particle explanations.",
      },
      "Bubbles and movement can be observed. Product names and electron mechanisms are different types of claim.",
      "Choose what is seen, then explain separately.",
    ),
    q(
      "p-chlorine",
      "Potassium reacts with chlorine. Which salt forms?",
      "Potassium chloride",
      {
        "Potassium hydroxide": "Hydroxide forms in the water reaction.",
        "Sodium chloride": "The reacting metal is potassium.",
      },
      "An alkali metal reacting with chlorine forms its metal chloride, with +1 metal ions and −1 chloride ions.",
      "Retain the identity of both reactants.",
    ),
    q(
      "p-oxygen",
      "A clean sodium surface becomes dull in air. What accounts for the change?",
      "Reaction with substances in air, including oxygen, forms a surface coating",
      {
        "The sodium has become a noble gas":
          "Its proton number does not change.",
        "The atomic number has decreased":
          "Surface reaction changes chemical compounds, not element identity.",
      },
      "Alkali metals react readily with air. Surface oxidation is distinct from melting or nuclear change.",
      "Think about a chemical coating on exposed metal.",
    ),
    q(
      "p-predict",
      "An unfamiliar alkali metal lies below potassium. Under comparable water-reaction conditions, what is predicted?",
      "A more vigorous reaction",
      {
        "A less vigorous reaction because it has fewer protons":
          "Down the group reactivity increases; proton count is larger, not smaller.",
        "No reaction because every lower shell is full":
          "It still has one outer electron.",
      },
      "The Group 1 trend predicts increased reactivity down the group; evidence such as quicker disappearance or more vigorous bubbling can test the prediction.",
      "Use the trend without claiming an exact numerical rate.",
    ),
    q(
      "p-physical",
      "Which properties are characteristic of the first-three alkali metals compared with many structural metals?",
      "Softness and relatively low melting points",
      {
        "Extreme hardness and unusually high melting points":
          "These do not describe the typical alkali-metal comparison.",
        "All are gases at room temperature":
          "Lithium, sodium and potassium are solids at room temperature.",
      },
      "Alkali metals are soft with relatively low melting points. Detailed transition-metal comparison is a later lesson.",
      "Use characteristic properties, not an absolute statement about every metal.",
    ),
    {
      ...n(
        "g1-v1-p-melting",
        "A supplied down-group melting-point sequence is 98 °C, 63 °C, an unknown value, then 29 °C. Give an estimate for the unknown that follows the strictly decreasing trend.",
        40,
        "°C",
        "Any estimate strictly between 29 and 63 °C fits the supplied neighbours. It is a prediction from a trend, not an exact measurement; 40 °C is only one example.",
        "Use both neighbouring values. Your prediction must be below 63 and above 29 °C.",
        "Independent numeric estimate accepts the justified interval rather than a single exact key.",
      ),
      title: "Predict from the interval",
      inputMode: "decimal",
      acceptedRange: { min: 29, max: 63, exclusive: true },
    },
    q(
      "p-nuclear",
      "Why is 'potassium has more protons, therefore it must hold the outer electron more tightly than lithium' incomplete?",
      "It ignores increased outer-electron distance and shielding",
      {
        "Potassium has no positively charged nucleus":
          "Its nucleus is positive.",
        "Lithium has more occupied shells":
          "Potassium has more occupied shells.",
      },
      "Greater nuclear charge does not alone determine outer-electron attraction: distance and inner-electron shielding matter.",
      "Include every relevant structural change.",
    ),
    lithiumBalance,
    {
      ...n(
        "g1-v1-p-electrons",
        "Sodium has atomic number 11. How many electrons remain in its usual 1+ ion?",
        10,
        "electrons",
        "Eleven minus one gives ten electrons; eleven protons remain.",
        "Lose one electron, not one proton.",
        "Independent link from alkali behaviour to particle counts.",
      ),
      title: "Count the resulting ion",
    },
    explain,
  ],
  checkForms: [
    [
      q(
        "ca-products",
        "Which products form when potassium reacts with water?",
        "Potassium hydroxide and hydrogen",
        {
          "Potassium chloride and oxygen":
            "Chlorine is absent from the water reaction.",
          "Potassium oxide alone":
            "The water reaction yields hydroxide and hydrogen.",
        },
        "The Group 1 water products are metal hydroxide and hydrogen.",
        "Retrieve both products.",
      ),
      q(
        "ca-structure",
        "What remains the same down the alkali-metal group?",
        "One electron in the outer shell",
        {
          "The number of occupied shells": "Occupied-shell count increases.",
          "The attraction to the outer electron":
            "Attraction becomes weaker overall.",
        },
        "Outer-electron count remains one despite increasing size and shielding.",
        "Separate invariant and changing features.",
      ),
      q(
        "ca-observation",
        "Which comparison would support greater reactivity in a lower alkali metal under similar conditions?",
        "More vigorous bubbling and faster disappearance",
        {
          "The same symbol is printed on both samples":
            "Labels are not reaction evidence.",
          "A claim that protons are lost": "The nuclear identity is retained.",
        },
        "Observable vigour and quicker reaction can support a relative-reactivity prediction.",
        "Use comparative visible evidence.",
      ),
    ],
    [
      q(
        "cb-chloride",
        "Lithium reacts with chlorine. Which compound forms?",
        "Lithium chloride",
        {
          "Lithium hydroxide": "Water produces the hydroxide.",
          "Potassium chloride": "The supplied metal is lithium.",
        },
        "The metal-specific chloride contains lithium and chloride ions.",
        "Retain each reactant's identity.",
      ),
      q(
        "cb-explain",
        "Why does an extra occupied shell tend to increase alkali-metal reactivity?",
        "It increases distance/shielding, weakening attraction so the outer electron is more easily lost",
        {
          "It adds another outer electron to the Group 1 atom":
            "Outer count stays one.",
          "It removes all positive charge from the nucleus":
            "The nucleus remains positive.",
        },
        "Structure affects attraction and removal of the outer electron.",
        "Use a complete causal chain.",
      ),
      {
        ...n(
          "g1-v1-cb-melting",
          "A supplied strictly decreasing sequence is 150 °C, unknown, then 70 °C. Give one estimate for the unknown.",
          100,
          "°C",
          "Any value strictly between 70 and 150 °C fits the supplied trend; 100 °C is one example, not a uniquely determined measurement.",
          "Use both bounding values.",
          "Reserved numeric trend prediction with a genuine interval.",
        ),
        inputMode: "decimal",
        acceptedRange: { min: 70, max: 150, exclusive: true },
      },
    ],
  ],
  reviewForms: [
    [
      q(
        "ra-water",
        "Why does the solution become alkaline after sodium reacts with water?",
        "Sodium hydroxide is formed and dissolves",
        {
          "Chlorine is released into the water": "No chlorine is supplied.",
          "Protons vanish from all atoms":
            "Chemical reactions preserve nuclear identity.",
        },
        "The hydroxide product makes an alkaline solution.",
        "Retrieve the dissolved product.",
      ),
      q(
        "ra-trend",
        "Down Group 1, is the single outer electron lost more or less easily?",
        "More easily because distance and shielding increase",
        {
          "Less easily because only proton count matters":
            "Distance/shielding cannot be ignored.",
          "Equally easily because every atom has the same radius":
            "Atomic size changes down the group.",
        },
        "Weaker overall attraction supports easier loss and greater reactivity.",
        "Connect trend to structure.",
      ),
    ],
    [
      q(
        "rb-oxygen",
        "A Group 1 metal reacts with oxygen. Which GCSE description is appropriate?",
        "Formation of oxygen-containing metal compounds, described as oxides",
        {
          "Formation of chloride without any chlorine":
            "A chloride requires chlorine.",
          "Formation of a different element with fewer protons":
            "Chemical reaction does not alter element identity.",
        },
        "Oxygen reaction is oxidation; exact product composition depends on metal and conditions.",
        "Retrieve the correct reaction partner.",
      ),
      q(
        "rb-ion",
        "An alkali metal forms its usual simple ion. Which change occurs?",
        "One electron is lost; the nucleus remains unchanged",
        {
          "One neutron is lost to make negative charge":
            "Neutrons are uncharged and remain nuclear.",
          "One proton is lost": "That would change element identity.",
        },
        "Loss of the single outer electron produces a +1 ion.",
        "Separate chemical ion formation from nuclear changes.",
      ),
    ],
  ],
};
for (const task of [...groupOneJourney.guided, ...groupOneJourney.practice])
  task.followUp = task.id.includes("oxygen")
    ? "g1-v1-r-oxygen"
    : task.id.includes("equation")
      ? "g1-v1-r-balance"
      : task.id.includes("observe")
        ? "g1-v1-r-observe"
        : task.id.includes("water") || task.id.includes("chlorine")
          ? "g1-v1-r-products"
          : task.id.includes("explain") ||
              task.id.includes("nuclear") ||
              task.id.includes("predict")
            ? "g1-v1-r-trend"
            : "g1-v1-r-family";
extendGroupOneWriting(groupOneJourney);
