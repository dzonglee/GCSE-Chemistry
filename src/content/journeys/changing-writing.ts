import type { LearningTask, LessonJourney } from "../types";
import { choice, tasks } from "./helpers";
function pick(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
): LearningTask {
  return {
    ...choice(
      `cc-write-v1-${id}`,
      prompt,
      answer,
      errors,
      explanation,
      "Distinguish the relationship from an approximate numerical value; state what stays fixed.",
      "Interpret concentration relationships and comparison symbols.",
    ),
    title,
    conciseHeading: true,
    followUp: "cc-write-v1-r-symbols",
  };
}
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
): LearningTask {
  return {
    id: `cc-write-v1-${id}`,
    title,
    prompt,
    answer,
    rubric,
    followUp,
    conciseHeading: true,
    explanation:
      "Compare your retained response with the criteria; no automatic examiner mark is awarded.",
    hint: "Use dissolved-solute mass divided by final solution volume in dm³. Account for both quantities and state the comparison.",
    purpose:
      "Independently explain how mass, final solution volume and homogeneous sampling affect concentration.",
  };
}
const symbols = pick(
  "r-symbols",
  "Read concentration symbols",
  "Which statement describes proportionality?",
  "C ∝ m when final solution volume is fixed",
  {
    "C ~ m means concentration is proportional to mass":
      "~ means approximately equal, not proportional; concentration and mass also have different units.",
    "C ∝ V when solute mass is fixed":
      "At fixed dissolved mass, concentration is proportional to 1/V: increasing volume reduces concentration.",
  },
  "C = m/V. At fixed V, C ∝ m. At fixed m, C ∝ 1/V. = is equal, < less, > greater; << and >> mean much less/greater without a universal numerical cutoff. AQA uses ~ for approximately equal (≈ is another common notation). Compare numerical concentrations in matching units.",
);
const guided = pick(
  "g-symbols",
  "Explore the symbols",
  "At fixed dissolved mass, which relationship describes concentration C and final solution volume V?",
  "C ∝ 1/V",
  {
    "C ∝ V": "Doubling V halves C at fixed m; their product is fixed.",
    "C ~ V":
      "Approximate equality is not inverse proportionality, and the quantities have different units.",
  },
  "C × V = m. Keeping m fixed makes C inversely proportional to V. Changing both quantities requires the mass factor divided by the volume factor.",
);
guided.concentrationSymbols = true;
export const changingWritingAdditions = {
  guided: [guided],
  practice: [
    pick(
      "p-direct",
      "State the fixed quantity",
      "For the same fully dissolved solute at fixed final volume, which relationship holds?",
      "C ∝ m",
      {
        "C ∝ V": "Volume is fixed; C changes with dissolved mass.",
        "C ~ m": "Approximate equality is not proportionality.",
      },
      "C = m/V; at fixed V, doubling m doubles C.",
    ),
    pick(
      "p-round",
      "Distinguish an approximation",
      "A calculated concentration is 31.96 g/dm³. Which comparison correctly describes its rounded value 32.0 g/dm³ (1 decimal place)?",
      "31.96 ~ 32.0",
      {
        "31.96 = 32.0":
          "Rounding changes this numerical value: these are approximately, not exactly, equal.",
        "31.96 ∝ 32.0":
          "Proportionality describes a relationship between varying quantities, not a rounded value.",
        "31.96 << 32.0":
          "Their small rounding difference does not mean much less.",
      },
      "31.96 rounds to 32.0 at one decimal place; ~ denotes approximately equal in the AQA symbol list.",
    ),
  ],
  check: [
    written(
      "ca-compete",
      "Explain competing changes",
      "Same fully dissolved solute: A 6 g in 200 cm³; B 18 g in 1200 cm³. Compare concentrations using <, = or >. Explain both changes.",
      "A: 6/0.200 = 30 g/dm³. B: 18/1.200 = 15 g/dm³, so C_B < C_A. Mass increases by factor 3 but final volume by factor 6; concentration changes by 3/6 = 1/2. A greater mass alone does not imply a greater concentration; direct proportionality to mass requires fixed final volume.",
      [
        "Convert both final volumes to dm³ and calculate 30 and 15 g/dm³.",
        "State C_B < C_A using matching concentration units.",
        "Explain the competing factors 3 and 6, concentration factor 1/2 and the fixed-volume condition for C ∝ m.",
      ],
      "cc-v1-r-fixed",
    ),
    written(
      "ca-sample",
      "Sampling and dilution",
      "Homogeneous solution: 18 g in 600 cm³. Compare retaining 200 cm³ with diluting all to 1200 cm³. Explain solute inventories and concentrations.",
      "Sampling retains one third: 6 g in 200 cm³, with 12 g in the removed 400 cm³; both concentrations are 30 g/dm³, equal to the original 18/0.600. Dilution retains all 18 g in final 1200 cm³, giving 15 g/dm³. Sampling removes dissolved solute and solvent together in the same ratio, whereas dilution increases final volume without losing solute. No added-solvent volume follows without a volume-additivity assumption.",
      [
        "Account for retained 6 g/200 cm³ and removed 12 g/400 cm³ in the homogeneous sample.",
        "Explain why proportional removal leaves 30 g/dm³ unchanged.",
        "Retain all 18 g during dilution and calculate 15 g/dm³ using the final solution volume.",
        "Distinguish sampling from dilution without assuming additive volumes.",
      ],
      "cc-v1-r-homogeneous",
    ),
    pick(
      "ca-less",
      "Interpret a comparison",
      "Concentrations use matching units. What does C_A << C_B mean?",
      "A has a much smaller concentration than B",
      {
        "A has exactly half the concentration of B":
          "<< gives no exact fraction.",
        "A and B have approximately equal concentrations":
          "Approximately equal uses ~, not <<.",
      },
      "<< means much less than. No universal numerical ratio follows from this symbol.",
    ),
  ],
  review: [
    written(
      "ra-scale",
      "Retrieve both factors",
      "Same fully dissolved solute: A 9 g in 300 cm³; B 27 g in 600 cm³. Compare using <, = or > and explain both factors.",
      "A: 9/0.300 = 30 g/dm³. B: 27/0.600 = 45 g/dm³, so C_B > C_A. Mass triples while final volume doubles; concentration changes by 3/2 = 1.5, not by 3. Proportionality to mass alone requires fixed final volume.",
      [
        "Calculate 30 and 45 g/dm³ from final volumes in dm³.",
        "State C_B > C_A.",
        "Explain the mass factor 3 divided by volume factor 2, giving 1.5; name the fixed-volume condition.",
      ],
      "cc-v1-r-fixed",
    ),
    written(
      "ra-removal",
      "Explain two removals",
      "Homogeneous solution: 8 g in 400 cm³. Compare retaining 100 cm³ with reducing to 100 cm³ by removing only solvent. All nonvolatile solute stays dissolved. Explain both inventories.",
      "Sampling retains 2 g in 100 cm³ and removes 6 g in 300 cm³; concentration remains 20 g/dm³ in each portion. Removing only solvent retains all 8 g in final 100 cm³, so concentration becomes 80 g/dm³, four times the original. This assumes the stated nonvolatile solute remains fully dissolved: no solute loss, reaction or precipitation. The equal final volumes do not imply equal solute masses or concentrations.",
      [
        "Account for the homogeneous retained 2 g and removed 6 g with their 100 and 300 cm³ volumes.",
        "Explain unchanged sampled concentration 20 g/dm³.",
        "Retain all 8 g in the solvent-only case and calculate 80 g/dm³, factor 4.",
        "Respect the supplied nonvolatile, fully dissolved assumption; distinguish selective solvent removal from sampling.",
      ],
      "cc-v1-r-homogeneous",
    ),
    pick(
      "ra-greater",
      "Retrieve a comparison",
      "Concentrations use matching units. What does C_A >> C_B mean?",
      "A has a much greater concentration than B",
      {
        "A has exactly twice the concentration of B":
          ">> supplies no exact multiplier.",
        "A and B are approximately equal": "~ describes approximate equality.",
      },
      ">> means much greater than; it does not set a universal ratio.",
    ),
  ],
};
export function extendChangingWriting(journey: LessonJourney) {
  journey.refresher.push(symbols);
  journey.guided.push(...changingWritingAdditions.guided);
  journey.practice.push(...changingWritingAdditions.practice);
  journey.checkForms.push(changingWritingAdditions.check);
  journey.reviewForms.push(changingWritingAdditions.review);
  journey.guided[0].followUp = "cc-v1-r-fixed";
  journey.guided[1].title = "Keep solute on dilution";
  journey.guided[1].prompt =
    "All 10 g solute in 250 cm³ stays dissolved. Pure solvent increases final volume to 500 cm³. What concentration?";
  journey.guided[2].title = "Sample a solution";
  journey.guided[2].prompt =
    "Homogeneous solution: 10 g in 500 cm³. Retain 250 cm³. What concentration remains?";
  journey.guided[3].title = "Final or added volume";
  journey.guided[3].prompt =
    "Dilute all 10 g in 250 cm³ to 20 g/dm³. Assume additive volumes. How much pure solvent is added?";
  journey.practice[16].prompt =
    "Homogeneous solution: 12 g in 600 cm³. Retain 150 cm³; remove the rest. Enter retained and removed solute masses and retained concentration.";
  journey.practice[16].partLegend = "Your solute inventory";
  journey.checkForms[1][3].title = "Final and added volumes";
  journey.checkForms[1][3].prompt =
    "All 8 g in 100 cm³ is diluted to 16 g/dm³. Assume additive volumes. Enter final solution and added solvent volumes / cm³.";
  journey.checkForms[1][3].partLegend = "Your volume calculations";
  const all = tasks(journey);
  for (const q of all) q.conciseHeading = true;
  const families = [
    [
      symbols.id,
      guided.id,
      ...changingWritingAdditions.practice.map((q) => q.id),
      changingWritingAdditions.check[2].id,
      changingWritingAdditions.review[2].id,
    ],
    [
      "cc-v1-r-fixed",
      "cc-v1-g-factors",
      "cc-v1-p-compete",
      "cc-v1-p-justify",
      changingWritingAdditions.check[0].id,
      changingWritingAdditions.review[0].id,
    ],
    [
      "cc-v1-r-homogeneous",
      "cc-v1-g-portion",
      "cc-v1-p-explain",
      "cc-v1-p-inventory",
      "cc-v1-p-evaporate",
      "cc-v1-g-dilute",
      changingWritingAdditions.check[1].id,
      changingWritingAdditions.review[1].id,
    ],
  ];
  for (const ids of families)
    for (const q of all)
      if (ids.includes(q.id))
        q.exposureAliases = [
          ...new Set([
            ...(q.exposureAliases ?? []),
            ...ids.filter((id) => id !== q.id),
          ]),
        ];
  journey.practiceGroups = [
    {
      label: "Factors and inventories",
      taskIds: journey.practice.slice(0, 20).map((q) => q.id),
    },
    {
      label: "Read concentration symbols",
      taskIds: journey.practice.slice(20).map((q) => q.id),
    },
  ];
  const instructions = [
    "Change both factors; predict concentration.",
    "Change final volume; retain all solute.",
    "Retain a homogeneous portion; predict both inventories.",
    "Choose final volume; retain all solute.",
  ];
  journey.guided.slice(0, 4).forEach((q, i) => {
    if (q.model?.kind === "changing-concentration")
      q.model.instruction = instructions[i];
  });
}
