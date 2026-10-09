import type { LearningTask } from "../types";

const id = (s: string) => `materials-v1-alloy-use-${s}`;
const manual = (
  s: string,
  title: string,
  prompt: string,
  answer: string,
  hint: string,
  shortWritten = true,
): LearningTask => ({
  id: id(s),
  title,
  purpose: title,
  prompt,
  answer,
  hint,
  shortWritten,
  rubric: [
    answer,
    "One suitable application is enough; other scientifically valid uses can also be accepted in manual review.",
  ],
  referenceResponse: answer,
  explanation:
    "Compare your retained answer with the examples. A short phrase is enough for a use question; an alternative valid use can also be accepted. This response is reviewed manually, without an automatic examiner mark.",
});
const learn = (
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
): LearningTask => ({
  id: id(s),
  title,
  purpose: title,
  prompt,
  answer,
  options: (() => {
    const options = [answer, ...Object.keys(errors)];
    const start =
      [...s].reduce((sum, c) => sum + c.charCodeAt(0), 0) % options.length;
    return [...options.slice(start), ...options.slice(0, start)];
  })(),
  misconceptions: errors,
  hint: explanation,
  explanation,
});

export const alloyUseRecovery: LearningTask[] = [
  learn(
    "r-bronze",
    "Learn a bronze use",
    "Bronze contains copper and tin. Which is a possible use?",
    "A statue or medal",
    {
      "A paper bag": "Paper is not a copper/tin alloy.",
      "A glass window": "Glass is a different material.",
    },
    "Bronze is used for statues and medals. These are examples, not an exhaustive or exclusive list of applications.",
  ),
  learn(
    "r-brass",
    "Learn a brass use",
    "Brass contains copper and zinc. Which is a possible use?",
    "A door knob or musical instrument",
    {
      "A clay brick": "A clay ceramic is not brass.",
      "A polythene bag": "Poly(ethene) is not brass.",
    },
    "Brass is used for fittings such as knobs and hinges, and musical instruments. Other valid uses are possible.",
  ),
  learn(
    "r-gold",
    "Learn a gold-alloy use",
    "Gold can be alloyed with silver, copper and zinc. Which is a possible use?",
    "A jewellery ring",
    {
      "A disposable plastic film": "A plastic film is not a gold alloy.",
      "A soda-lime window": "Soda-lime glass is not a gold alloy.",
    },
    "Gold alloys are used for jewellery, for example rings. Alloying can increase hardness and reduce the gold content; carats state the gold mass proportion.",
  ),
  learn(
    "r-high",
    "Learn a high-carbon-steel use",
    "High-carbon steel is strong but brittle. Which is a possible use?",
    "A cutting tool",
    {
      "A paper envelope": "Paper is not steel.",
      "A container made only by blowing molten glass":
        "This describes a glass-making process, not a use of steel.",
    },
    "High-carbon steel is used for cutting tools, for example a chisel. Its hardness can suit a cutting edge, but brittleness limits applications that need substantial bending. Exact properties also depend on composition and treatment.",
  ),
  learn(
    "r-low",
    "Learn a low-carbon-steel use",
    "Low-carbon steel is softer and more easily shaped. Which is a possible use?",
    "A shaped car body panel",
    {
      "A ceramic tile": "A ceramic tile is not steel.",
      "A glass lens": "Glass is not steel.",
    },
    "Low-carbon steel can be shaped into car body panels or horseshoes. These uses make use of easy shaping; the alloy name alone does not establish every design requirement.",
  ),
  learn(
    "r-stainless",
    "Learn a stainless-steel use",
    "Stainless steel contains iron, carbon, chromium and nickel. Which is a possible use?",
    "Cutlery such as a spoon",
    {
      "A clay flowerpot": "Clay pottery is not stainless steel.",
      "A transparent glass window": "A glass window is not stainless steel.",
    },
    "Stainless steel is used for cutlery and kitchen utensils. Hardness and resistance to corrosion suit wear and washing; this does not make it immune to every environment.",
  ),
  learn(
    "r-aluminium",
    "Learn an aluminium-alloy use",
    "Aluminium alloys are low density. Which is a possible use?",
    "An aircraft structure",
    {
      "A clay brick": "A clay brick is not an aluminium alloy.",
      "A cotton fabric": "Cotton fabric is not an aluminium alloy.",
    },
    "Aluminium alloys are used in aircraft structures. Low density reduces mass for a given volume, while strength, fatigue, cost and other design requirements still need checking.",
  ),
];

export const alloyUseGuided: LearningTask[] = [
  {
    ...manual(
      "g-copper",
      "Build two alloy-use associations",
      "Name the metals in bronze and brass, and give one use of each.",
      "Bronze is copper and tin and can be used for statues or medals. Brass is copper and zinc and can be used for door fittings or musical instruments. Other valid examples are acceptable.",
      "Bronze: copper/tin, statues or medals. Brass: copper/zinc, fittings or musical instruments. Connect each name to its own composition and one example.",
      false,
    ),
    rubric: [
      "Bronze: copper and tin; a statue or medal is one example of a use.",
      "Brass: copper and zinc; door fittings or musical instruments are examples of uses.",
      "Accept alternative valid applications; uses are not exclusive to these alloys.",
    ],
  },
  {
    ...manual(
      "g-steels",
      "Connect steel properties to uses",
      "Give one use each for high-carbon, low-carbon and stainless steel. Link each use to a suitable property.",
      "High-carbon steel can be used for cutting tools; hardness suits a cutting edge, but it is brittle. Low-carbon steel can be shaped into car panels or horseshoes because it is softer and easily shaped. Stainless steel can be used for cutlery because it is hard and resists corrosion. Other justified valid examples are acceptable.",
      "Think of a cutting tool, a shaped car panel and a washable spoon. High-carbon is strong but brittle; low-carbon is softer and easily shaped; stainless is hard and corrosion-resistant.",
      false,
    ),
    rubric: [
      "High-carbon steel: for example, cutting tools; hardness suits a cutting edge, but brittleness limits bending applications.",
      "Low-carbon steel: for example, shaped car panels or horseshoes; it is softer and easily shaped.",
      "Stainless steel: for example, cutlery; it is hard and corrosion-resistant.",
      "Do not claim an alloy is the only possible material for the product.",
    ],
  },
];

export const alloyUsePractice: LearningTask[] = [
  manual(
    "p-bronze",
    "Recall a bronze use",
    "Give one use of bronze.",
    "A statue or medal is one example. Any other valid use of bronze can also be accepted.",
    "Bronze is copper and tin. Think of a cast decorative object or an award.",
  ),
  manual(
    "p-brass",
    "Recall a brass use",
    "Give one use of brass.",
    "Door knobs, hinges or musical instruments are examples. Any other valid use of brass can also be accepted.",
    "Brass is copper and zinc. Think of door fittings or an instrument.",
  ),
  manual(
    "p-gold",
    "Recall a gold-alloy use",
    "Give one use of a gold alloy.",
    "Jewellery, such as a ring, is one example. Any other valid use of a gold alloy can also be accepted.",
    "Think of jewellery rather than the mass of gold in an item.",
  ),
  manual(
    "p-high",
    "Recall a high-carbon-steel use",
    "Give one use of high-carbon steel.",
    "A cutting tool, such as a chisel, is one example. Any other suitable use of high-carbon steel can also be accepted.",
    "Think of a cutting edge. Do not confuse this with a requirement for easy shaping.",
  ),
  manual(
    "p-low",
    "Recall a low-carbon-steel use",
    "Give one use of low-carbon steel.",
    "Car body panels or shaped horseshoes are examples. Any other suitable use of low-carbon steel can also be accepted.",
    "Think of a product that needs to be easily shaped.",
  ),
  manual(
    "p-stainless",
    "Recall a stainless-steel use",
    "Give one use of stainless steel.",
    "Cutlery or kitchen utensils, such as a spoon, are examples. Any other suitable use of stainless steel can also be accepted.",
    "Think of a hard product that is frequently washed.",
  ),
  manual(
    "p-aluminium",
    "Recall an aluminium-alloy use",
    "Give one use of an aluminium alloy.",
    "An aircraft structure is one example. Any other suitable use of an aluminium alloy can also be accepted.",
    "Think of a structure where reducing mass is useful, while strength must also be checked.",
  ),
];

export const alloyUseCheck: LearningTask[] = [
  manual(
    "c-brass",
    "Independent brass recall",
    "Recall one use of brass.",
    "For example, a door knob, hinge or musical instrument. Accept any valid use of brass.",
    "Revisit the brass learning task.",
  ),
  manual(
    "c-high",
    "Independent high-carbon-steel recall",
    "Recall one use of high-carbon steel.",
    "For example, a cutting tool such as a chisel. Accept another suitable use of high-carbon steel.",
    "Revisit the high-carbon-steel learning task.",
  ),
  manual(
    "c-gold",
    "Independent gold-alloy recall",
    "Recall one use of a gold alloy.",
    "For example, a jewellery ring. Accept any valid use of a gold alloy.",
    "Revisit the gold-alloy learning task.",
  ),
  manual(
    "c-bronze",
    "Independent bronze recall",
    "Recall one use of bronze.",
    "For example, a statue or medal. Accept any valid use of bronze.",
    "Revisit the bronze learning task.",
  ),
  manual(
    "c-aluminium",
    "Independent aluminium-alloy recall",
    "Recall one use of an aluminium alloy.",
    "For example, an aircraft structure. Accept another suitable use of an aluminium alloy.",
    "Revisit the aluminium-alloy learning task.",
  ),
  manual(
    "c-low",
    "Independent low-carbon-steel recall",
    "Recall one use of low-carbon steel.",
    "For example, a car body panel or a shaped horseshoe. Accept another suitable use of low-carbon steel.",
    "Revisit the low-carbon-steel learning task.",
  ),
  manual(
    "c-stainless",
    "Independent stainless-steel recall",
    "Recall one use of stainless steel.",
    "For example, cutlery or a kitchen utensil such as a spoon. Accept another suitable use of stainless steel.",
    "Revisit the stainless-steel learning task.",
  ),
];

export const alloyUseReview: LearningTask[] = [
  manual(
    "v-stainless",
    "Retrieve a stainless-steel use",
    "From memory, give one application of stainless steel.",
    "For example, cutlery or kitchen utensils. Accept another suitable application of stainless steel.",
    "Return to learning if you need the examples.",
  ),
  manual(
    "v-bronze",
    "Retrieve a bronze use",
    "From memory, give one application of bronze.",
    "For example, statues or medals. Accept another valid application of bronze.",
    "Return to learning if you need the examples.",
  ),
  manual(
    "v-low",
    "Retrieve a low-carbon-steel use",
    "From memory, give one application of low-carbon steel.",
    "For example, car body panels or shaped horseshoes. Accept another suitable application of low-carbon steel.",
    "Return to learning if you need the examples.",
  ),
  manual(
    "v-gold",
    "Retrieve a gold-alloy use",
    "From memory, give one application of a gold alloy.",
    "For example, jewellery such as rings. Accept another valid application of a gold alloy.",
    "Return to learning if you need the examples.",
  ),
  manual(
    "v-aluminium",
    "Retrieve an aluminium-alloy use",
    "From memory, give one application of an aluminium alloy.",
    "For example, an aircraft structure. Accept another suitable application of an aluminium alloy.",
    "Return to learning if you need the examples.",
  ),
  manual(
    "v-brass",
    "Retrieve a brass use",
    "From memory, give one application of brass.",
    "For example, musical instruments or door fittings. Accept another valid application of brass.",
    "Return to learning if you need the examples.",
  ),
  manual(
    "v-high",
    "Retrieve a high-carbon-steel use",
    "From memory, give one application of high-carbon steel.",
    "For example, cutting tools such as chisels. Accept another suitable application of high-carbon steel.",
    "Return to learning if you need the examples.",
  ),
];
