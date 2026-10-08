import type { LearningTask, LessonJourney } from "../types";
import { choice } from "./helpers";
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
): LearningTask {
  return {
    id: `mc-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation:
      "Compare your retained account with the criteria. No automatic examiner mark is awarded.",
    hint: "Track the same weighed collection and all element atoms. Forming a gas is different from losing it across the boundary.",
    purpose:
      "Construct a chemical mass-change explanation from the supplied equation and boundary.",
  };
}
function inventory(
  id: string,
  title: string,
  vessel: number,
  initial: number,
  unused: number,
  escaped: number,
): LearningTask {
  const contents = initial - escaped,
    products = contents - unused;
  const values = {
    products,
    contents,
    reading: vessel + contents,
    wider: vessel + initial,
  };
  return {
    id: `mc-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt: `A ${vessel} g vessel contains ${initial} g mixture. Only ${escaped} g CO₂ escapes; ${unused} g reactant remains unused. Complete the mass inventory.`,
    answer: JSON.stringify(
      Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, String(v)]),
      ),
    ),
    partLegend: "All masses in grams",
    parts: [
      {
        id: "products",
        label: "Retained products",
        answer: products,
        unit: "g",
      },
      { id: "contents", label: "Final contents", answer: contents, unit: "g" },
      {
        id: "reading",
        label: "Vessel + contents",
        answer: vessel + contents,
        unit: "g",
      },
      {
        id: "wider",
        label: "Total with escaped gas",
        answer: vessel + initial,
        unit: "g",
      },
    ],
    explanation: `Contents: ${initial} − ${escaped} = ${contents} g. New retained products: ${contents} − ${unused} = ${products} g. Reading: ${vessel} + ${contents} = ${vessel + contents} g. Including escaped gas: ${vessel + contents} + ${escaped} = ${vessel + initial} g, equal to the initial vessel and mixture. Unused reactant remains matter but is not new product.`,
    hint: "Subtract only escaped material for contents; separate unused reactant from products; include the unchanged vessel in its reading.",
    purpose:
      "Independently construct product, retained-content, apparatus and wider-boundary mass totals.",
    followUp: "mc-v1-r-leftover",
  };
}
const correction = written(
  "p-molecules",
  "Correct a molecule claim",
  "2H₂ + O₂ → 2H₂O. A learner says fewer product molecules means mass was lost. Correct the claim.",
  "The represented amounts contain four hydrogen atoms and two oxygen atoms on each side. Atoms are rearranged into different molecules, not lost or made. Three represented reactant molecules become two product molecules, but different molecules have different masses; molecule counts and coefficients are not gram ratios.",
  [
    "Retain four H and two O atoms on each side, without making or destroying atoms.",
    "Distinguish molecule count from conserved atom inventories and mass; coefficients are not gram ratios.",
  ],
  "mc-write-v1-r-atoms",
);
const atomRefresher: LearningTask = {
  ...choice(
    "mc-write-v1-r-atoms",
    "A balanced equation has different numbers of reactant and product molecules. What remains conserved?",
    "Each element’s atoms and the total mass",
    {
      "The number of molecules must stay the same":
        "Atoms regroup into differently composed molecules, so molecule counts can differ.",
      "Only the atoms still inside an open flask":
        "Escaped atoms remain in the surroundings and belong to the wider accounting.",
    },
    "Check the atoms of each element on both sides. Different molecules contain different numbers and kinds of atoms, so fewer molecules does not mean missing atoms or less total mass. Equation coefficients are not gram ratios.",
    "Count each element separately, rather than adding molecule counts.",
    "Revisit atoms, molecules and conserved mass.",
  ),
  title: "Revisit conserved atoms",
  conciseHeading: true,
  followUp: "mc-write-v1-r-atoms",
};
const loss = written(
  "ca-loss",
  "Explain gas escape",
  "CaCO₃ + 2HCl → CaCl₂ + CO₂ + H₂O. Why can an open flask lose measured mass while conserving atoms?",
  "Carbon dioxide is formed and escapes from the weighed flask into its surroundings. The carbon and oxygen atoms in that gas still exist; atoms in all retained products also remain. Including escaped gas with the same flask and retained contents accounts for the conserved total. Gas formation alone would not reduce a reading if all gas remained inside the weighed collection.",
  [
    "Identify formed CO₂ crossing out of the weighed flask as the cause of the decrease.",
    "Retain its atoms and mass in the surroundings and include them in the wider total; do not claim atoms vanish or gas is weightless.",
  ],
  "mc-v1-r-gas",
);
const gain = written(
  "ca-gain",
  "Explain oxygen gain",
  "2Mg + O₂ → 2MgO. Supplied 3.6 g Mg forms 6.0 g oxide without loss. Explain the gain and complete-system total.",
  "2.4 g oxygen from outside the original magnesium sample combines with the magnesium. The oxide contains both kinds of atom; heating did not create new matter. Counting that reacting oxygen with the magnesium from the start gives 6.0 g before and after. The apparent gain compares the original metal alone with a product that also contains oxygen.",
  [
    "Identify 2.4 g reacting oxygen, originally outside the metal-only weighed sample.",
    "Explain incorporation of oxygen atoms without creation of matter by heating.",
    "Use the same complete reacting inventory for 6.0 g before and after.",
  ],
  "mc-v1-r-oxygen",
);
const thermal = written(
  "ra-carbonate",
  "Explain thermal gas loss",
  "CuCO₃ → CuO + CO₂. The heated solid loses measured mass as CO₂ leaves. Explain why its atoms are still conserved.",
  "The solid’s measured mass falls because the carbon dioxide product leaves the weighed collection. Copper and some oxygen remain in copper oxide; carbon and oxygen in CO₂ remain in the surroundings. The equation retains one Cu, one C and three O atoms across the complete products. Include escaped gas with retained solid to conserve the total; heat did not destroy carbon atoms.",
  [
    "Explain CO₂ leaving the weighed collection as the cause of the solid’s mass decrease.",
    "Account for atoms in both retained CuO and escaped CO₂; conserve the wider total rather than destroy carbon or make gas weightless.",
  ],
  "mc-v1-r-gas",
);
const collector = written(
  "ra-collector",
  "Explain a collected gas",
  "A flask and included collector initially weigh 76.2 g. Only 1.8 g gas moves between them; nothing leaves the pair. Explain the final total.",
  "The combined total stays 76.2 g because gas moves within the collection weighed on both occasions. The gas still has mass and its atoms remain in the included collector. A flask-only reading could fall as gas leaves that narrower boundary, but this question includes the collector; do not subtract 1.8 g from the combined total.",
  [
    "Keep the combined reading at 76.2 g: no matter crosses out of the pair.",
    "Retain gas mass and atoms in the collector and distinguish the narrower flask-only boundary.",
  ],
  "mc-v1-r-boundary",
);
export const massWritingAdditions = {
  practice: [correction],
  check: [
    loss,
    gain,
    inventory("ca-inventory", "Construct all retained masses", 40, 18, 4, 2),
  ],
  review: [
    thermal,
    collector,
    inventory("ra-inventory", "Retrieve a full inventory", 25, 23, 5, 3),
  ],
};
export function extendMassWriting(journey: LessonJourney) {
  journey.refresher.push(atomRefresher);
  const guidedInstructions = [
    "Choose the weighed collection.",
    "Compare gas boundaries.",
    "Compare metal and whole system.",
    "Balance and weight each formula.",
  ];
  journey.guided.forEach((task, i) => {
    if (task.model?.kind === "mass-conservation")
      task.model.instruction = guidedInstructions[i];
  });
  journey.guided[2].title = "Account for oxygen";
  journey.guided[3].prompt =
    "2H₂ + O₂ → 2H₂O. Mᵣ: H₂=2, O₂=32, H₂O=18. Find each side’s weighted relative mass.";
  const ledger = journey.practice.find((task) => task.id === "mc-v1-p-ledger")!;
  ledger.title = "Account for gas";
  ledger.prompt =
    "A 36 g vessel holds 14 g mixture. Only 2.5 g CO₂ escapes; everything else stays inside. Complete the final contents, vessel-plus-contents and escaped gas masses.";
  journey.practice.push(...massWritingAdditions.practice);
  journey.checkForms.push(massWritingAdditions.check);
  journey.reviewForms.push(massWritingAdditions.review);
  const all = [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ];
  for (const q of all) q.conciseHeading = true;
  for (const ids of [
    [
      "mc-v1-g-gas",
      "mc-v1-r-gas",
      "mc-v1-p-explain",
      "mc-v1-p-cause",
      "mc-v1-ca-retained",
      "conservation-and-concentration-1",
      loss.id,
      thermal.id,
    ],
    [
      "mc-v1-r-oxygen",
      "mc-v1-g-oxidation",
      "mc-v1-p-heating",
      "mc-v1-p-evaluate",
      "mc-v1-cb-cause",
      gain.id,
    ],
    [
      "mc-v1-p-collected",
      "mc-v1-cb-reading",
      "mc-v1-r-boundary",
      "mc-v1-ra-boundary",
      collector.id,
    ],
    [
      "mc-v1-r-weight",
      "mc-v1-g-weighted",
      "mc-v1-p-molecule",
      "mc-v1-rb-weighted",
      correction.id,
      atomRefresher.id,
    ],
    [
      "mc-v1-r-leftover",
      "mc-v1-g-inventory",
      "mc-v1-p-ledger",
      "mc-v1-p-leftover-rule",
      massWritingAdditions.check[2].id,
      massWritingAdditions.review[2].id,
    ],
  ])
    for (const q of all.filter((q) => ids.includes(q.id)))
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...ids.filter((id) => id !== q.id),
        ]),
      ];
  journey.practiceGroups = [
    {
      label: "Construct mass inventories",
      taskIds: journey.practice.slice(0, 15).map((q) => q.id),
    },
    {
      label: "Explain boundaries and atoms",
      taskIds: journey.practice.slice(15).map((q) => q.id),
    },
  ];
  journey.practice[20].title = "Explain gas loss";
  journey.practice[21].title = "Explain oxygen gain";
  journey.guided[1].title = "Follow gas transfer";
  journey.guided[3].title = "Weight each formula";
  gain.hint =
    "Identify oxygen entering the original metal-only sample; compare the same complete reacting inventory.";
  correction.hint =
    "Count H and O atoms on each side; distinguish molecule counts from masses.";
}
