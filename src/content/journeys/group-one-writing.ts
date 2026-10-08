import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";
const prefix = "g1-write-v1-";
function symbol(
  id: string,
  title: string,
  name: string,
  answer: string,
  wrong: Record<string, string>,
): LearningTask {
  return {
    ...choice(
      prefix + id,
      `Use the supplied reference. Which symbol represents ${name.toLowerCase()}?`,
      answer,
      wrong,
      `${name} has symbol ${answer}. Preserve the uppercase first letter and lowercase second letter; use the supplied periodic reference rather than guess from the name.`,
      "Open the names-and-symbols reference and match the complete element name.",
      "Use a supplied periodic reference to match an alkali-metal name with its exact chemical symbol.",
    ),
    title,
    alkaliReference: true,
    followUp: prefix + "r-symbol",
  };
}
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
  equations = false,
): LearningTask {
  return {
    id: prefix + id,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    writtenEquations: equations || undefined,
    explanation:
      "Compare your own response with the criteria. Writing is retained for manual self-review, without an automatic examiner mark.",
    hint: "Separate what can be observed, the products formed and the electron explanation. Keep element symbols and substance formulae fixed when balancing.",
    purpose:
      "Construct a chemical description, equation or causal explanation without selecting a supplied full account.",
  };
}
const recovery = symbol("r-symbol", "Read the exact symbol", "Rubidium", "Rb", {
  RB: "The second letter must be lowercase.",
  Br: "Br represents bromine; the order of letters matters.",
});
delete recovery.followUp;
const guided = symbol("g-rubidium", "Use the wider group", "Rubidium", "Rb", {
  Ru: "Ru represents ruthenium, not rubidium.",
  Br: "Br represents bromine, a halogen.",
});
const caesium = symbol("p-caesium", "Find caesium’s symbol", "Caesium", "Cs", {
  Ca: "Ca represents calcium, a different element.",
  CS: "The second letter of Cs must be lowercase.",
});
const francium = symbol(
  "p-francium",
  "Find francium’s symbol",
  "Francium",
  "Fr",
  {
    F: "F represents fluorine, a halogen.",
    FR: "The second letter of Fr must be lowercase.",
  },
);
const compound = choice(
  prefix + "p-rubidium-hydroxide",
  "Use the reference to name the Group 1 compound RbOH.",
  "Rubidium hydroxide",
  {
    "Rubidium oxide": "The OH group is hydroxide, not oxide.",
    "Bromine hydroxide": "Rb is rubidium; Br is bromine.",
  },
  "Rb represents rubidium and OH is the hydroxide group, so RbOH is rubidium hydroxide. This is formula interpretation, not a heavier-metal reaction demonstration.",
  "Match Rb with its element name, then identify OH.",
  "Use an alkali-metal symbol in naming a compound, beyond first-three examples.",
);
compound.title = "Name a wider-group compound";
compound.alkaliReference = true;
compound.followUp = "g1-v1-r-products";
const oxygen = written(
  "p-oxygen",
  "Describe oxygen reactions",
  "Describe lithium, sodium and potassium reacting with oxygen. Include typical observations and the GCSE product type.",
  "Fresh exposed surfaces tarnish as the metals react with oxygen. Heating gives more vigorous reactions and solid oxygen-containing products, described as metal oxides at GCSE level. Reactivity generally increases from lithium to sodium to potassium under comparable conditions. This is not the water reaction, so hydroxide and hydrogen are not its products; exact oxygen compounds depend on conditions.",
  [
    "Describe tarnishing of fresh surfaces or more vigorous reaction/combustion when heated with oxygen.",
    "Identify solid oxygen-containing metal compounds, described as oxides at GCSE level, and distinguish these from water-reaction products.",
    "Use lithium → sodium → potassium for the relative reactivity under comparable conditions; do not assert one universal simple-oxide formula.",
  ],
  "g1-v1-r-oxygen",
);
const water = written(
  "ca-water",
  "Describe the water reaction",
  "Describe two observations for potassium reacting with water. Name both products and explain why the solution is alkaline.",
  "Potassium floats and moves rapidly while fizzing; it melts and disappears as it reacts. Ignition may occur depending on conditions, but is not needed for these two observations. The products are potassium hydroxide and hydrogen. Dissolved potassium hydroxide makes the solution alkaline; bubbling alone does not identify the gas.",
  [
    "Give two distinct visible observations, such as floating, movement, melting, bubbling or disappearance; electron loss and heat are not visible observations.",
    "Name potassium hydroxide and hydrogen as the products, separating gas identity from the observation of bubbles.",
    "Connect the alkaline solution to dissolved potassium hydroxide. A flame is not required for the stated two observations.",
  ],
  "g1-v1-r-observe",
);
const chlorine = written(
  "ca-chlorine",
  "Write the chlorine equations",
  "Write a word equation and a balanced symbol equation for sodium reacting with chlorine to form sodium chloride.",
  "sodium + chlorine → sodium chloride\n2 Na + Cl2 → 2 NaCl",
  [
    "Write sodium + chlorine → sodium chloride as the word equation.",
    "Use Na, diatomic Cl₂ and NaCl with unchanged symbols/formulae.",
    "Balance both elements: 2 Na + Cl₂ → 2 NaCl (equivalent balanced multiples are chemically valid). NaCl is an ionic formula unit, not a molecule.",
  ],
  "g1-v1-r-balance",
  true,
);
const trend = written(
  "ca-trend",
  "Explain the down-group trend",
  "Rubidium lies below potassium. Explain why it loses its outer electron more easily despite having more protons.",
  "Both have one outer electron. Rubidium has more occupied shells, so that electron is farther from the nucleus and more shielded by inner electrons. These effects weaken the attraction to the outer electron overall despite the greater nuclear charge. Less energy is needed to lose that electron, so rubidium is more reactive.",
  [
    "Keep the one outer electron in both neutral Group 1 atoms.",
    "Connect more occupied shells with increased outer-electron distance and inner-electron shielding.",
    "Explain weaker overall attraction despite greater nuclear charge, leading to easier electron loss and increased reactivity.",
  ],
  "g1-v1-r-trend",
);
const checkSymbol = symbol(
  "ca-francium",
  "Use a supplied table",
  "Francium",
  "Fr",
  {
    Fe: "Fe is iron, not francium.",
    FR: "The second letter of Fr is lowercase.",
  },
);
checkSymbol.prompt =
  "A periodic reference lists francium below caesium. Select francium’s exact chemical symbol.";
const reviewWater = written(
  "ra-water",
  "Retrieve products and equations",
  "Describe two visible lithium–water observations. Write its word equation and balanced symbol equation.",
  "Lithium floats and fizzes relatively gently, then gradually disappears; it usually does not melt into a ball.\nlithium + water → lithium hydroxide + hydrogen\n2 Li + 2 H2O → 2 LiOH + H2",
  [
    "State two visible lithium observations, such as floating, bubbling or gradual disappearance; do not require sodium-like melting or guaranteed ignition.",
    "Write lithium + water → lithium hydroxide + hydrogen.",
    "Construct the complete symbol equation with LiOH and H₂: 2 Li + 2 H₂O → 2 LiOH + H₂ (valid multiples are acceptable); retain substance formulae.",
  ],
  "g1-v1-r-products",
);
const reviewTrend = written(
  "ra-trend",
  "Correct the nuclear-charge claim",
  "Caesium lies below sodium. Sam says its extra protons make it less reactive. Explain the missing factors and correct Sam.",
  "Both neutral atoms have one outer electron. Caesium has more occupied shells, placing it farther from the nucleus and increasing inner-electron shielding. The attraction to the outer electron is weaker overall despite the greater proton count, so it is more easily lost. The Group 1 trend therefore predicts greater reactivity for caesium under comparable conditions, not less.",
  [
    "Keep the one outer electron and identify greater distance/more shells and shielding down the group.",
    "Explain weaker overall attraction and easier electron loss despite more protons.",
    "Correct the prediction to greater reactivity; do not invent an exact reaction rate or claim all heavier metals float.",
  ],
  "g1-v1-r-trend",
);
const reviewSymbol = symbol(
  "ra-caesium",
  "Retrieve reference use",
  "Caesium",
  "Cs",
  { C: "C is carbon, not caesium.", CS: "Preserve a lowercase second letter." },
);
reviewSymbol.prompt =
  "Use the supplied reference to identify the symbol for caesium, atomic number 55.";
export const groupOneWriting = {
  refresher: [recovery],
  guided: [guided],
  practice: [caesium, francium, compound, oxygen],
  check: [water, chlorine, trend, checkSymbol],
  review: [reviewWater, reviewTrend, reviewSymbol],
};

export function extendGroupOneWriting(journey: LessonJourney) {
  journey.refresher.push(recovery);
  journey.guided.push(guided);
  journey.practice.push(...groupOneWriting.practice);
  journey.checkForms.push(groupOneWriting.check);
  journey.reviewForms.push(groupOneWriting.review);
  journey.practiceGroups = [
    {
      label: "Describe reaction evidence",
      taskIds: ["water", "observe", "chlorine", "oxygen"]
        .map((id) => "g1-v1-p-" + id)
        .concat(oxygen.id),
    },
    {
      label: "Explain and predict properties",
      taskIds: ["predict", "physical", "melting", "nuclear", "explain"].map(
        (id) => "g1-v1-p-" + id,
      ),
    },
    {
      label: "Use names, symbols and equations",
      taskIds: [
        "g1-v1-p-equation",
        "g1-v1-p-electrons",
        caesium.id,
        francium.id,
        compound.id,
      ],
    },
  ];
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const ids of [
    ["g1-v1-g-water", "g1-v1-p-observe", water.id],
    ["g1-v1-g-chlorine", "g1-v1-g-equation", chlorine.id],
    [
      "g1-v1-p-explain",
      "g1-v1-p-nuclear",
      "g1-v1-cb-explain",
      trend.id,
      reviewTrend.id,
    ],
    ["g1-v1-p-water", "g1-v1-p-equation", reviewWater.id],
    ["g1-v1-p-oxygen", "g1-v1-r-oxygen", oxygen.id],
    [caesium.id, reviewSymbol.id],
    [francium.id, checkSymbol.id],
    [recovery.id, guided.id],
  ])
    for (const id of ids) {
      const q = all.find((t) => t.id === id)!;
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((other) => other !== id),
        ]),
      ];
    }
  const titles = [
    "Name water products",
    "Separate observation and inference",
    "Name the chloride",
    "Explain surface tarnishing",
    "Predict an unfamiliar member",
    "Compare physical properties",
    "Predict from the interval",
    "Correct the proton-only claim",
    "Balance a new metal",
    "Count the resulting ion",
    "Explain potassium’s reactivity",
  ];
  journey.practice.slice(0, 11).forEach((q, i) => (q.title = titles[i]));
  journey.outcomes?.push(
    "Use supplied symbols for all six alkali metals and construct written observations, equations and independent electron-loss explanations.",
  );
}
