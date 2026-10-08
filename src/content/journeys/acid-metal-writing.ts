import type { LearningTask, LessonJourney, Tier } from "../types";
import { choice, tasks } from "./helpers";
function pick(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  followUp: string,
  higher = false,
): LearningTask {
  return {
    ...choice(
      `am-write-v1-${id}`,
      prompt,
      answer,
      errors,
      explanation,
      "Distinguish metal reactions from oxide neutralisation; use the named acid.",
      title,
    ),
    title,
    conciseHeading: true,
    followUp,
    ...(higher ? { tier: "higher" as const } : {}),
  };
}
function written(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  followUp: string,
  higher = false,
): LearningTask {
  return {
    id: `am-write-v1-${id}`,
    title,
    conciseHeading: true,
    prompt,
    answer,
    rubric,
    followUp,
    explanation: `${answer} Compare your retained writing with the criteria; no automatic examiner mark is assigned.`,
    referenceResponse: answer,
    hint: "Use the named reactants, balance atoms and distinguish products from spectators.",
    purpose:
      "Construct named metal–acid equations or explain the electron transfers independently.",
    ...(higher ? { tier: "higher" as const } : {}),
  };
}
const products = pick(
  "r-products",
  "Metal–acid products",
  "What forms when Mg, Zn or Fe reacts with suitable dilute HCl or sulfuric acid?",
  "The named metal salt and hydrogen",
  {
    "The named salt and water only":
      "That is the oxide/hydroxide neutralisation pattern.",
    "A salt and carbon dioxide": "That confuses the metal with a carbonate.",
  },
  "HCl gives chlorides; sulfuric acid gives sulfates. These three metals form 2+ ions in the stated cases, including iron(II). Hydrogen forms; water is not an additional metal-reaction product.",
  "am-write-v1-r-products",
);
const plan = pick(
  "r-plan",
  "Plan a fair acid test",
  "Which plan can identify Mg, Fe and Cu using dilute HCl?",
  "Compare bubbling rates in matched acid and metal conditions",
  {
    "Compare final gas volumes without timing or controls":
      "Final yield alone does not establish the comparison.",
    "Use different temperatures and surface areas without controls":
      "These differences can change observed rates.",
  },
  "Use comparable metal amount and exposed area, equal dilute-HCl concentration/volume and the same initial temperature. Compare bubbling over the same interval: Cu gives no hydrogen; Mg bubbles faster than Fe in matched conditions. Alternatively compare measured temperature changes. Repeat and consider surface films. A supplied gas test identifies hydrogen; bubbles alone do not.",
  "am-write-v1-r-plan",
);
const redox = pick(
  "r-redox",
  "Higher: electron transfers",
  "Zn + 2H+ → Zn2+ + H2. Which species is reduced?",
  "H+ gains electrons to form H2",
  {
    "Zn loses electrons, so Zn is reduced":
      "Loss is oxidation; Zn is oxidised.",
    "Chloride loses electrons to make hydrogen":
      "Chloride is an unchanged spectator in the HCl example.",
  },
  "Zn → Zn2+ + 2e− is oxidation. 2H+ + 2e− → H2 is reduction. Both changes occur; hydrogen ions, not already-formed hydrogen gas, gain the electrons.",
  "am-write-v1-r-redox",
  true,
);
const guided = pick(
  "g-products",
  "Compare six reactions",
  "Fe reacts with dilute sulfuric acid. Which products fit the stated Fe2+ case?",
  "FeSO4 and H2",
  {
    "FeCl2 and H2": "Sulfuric acid supplies sulfate, not chloride.",
    "FeSO4 and H2O only":
      "Metal–acid reaction gives hydrogen, unlike oxide neutralisation.",
  },
  "Fe + H2SO4 → FeSO4 + H2. Explore all six combinations and compare with the HCl coefficient 2: Fe + 2HCl → FeCl2 + H2.",
  "am-write-v1-r-products",
);
guided.acidMetalReference = "products";
const guidedRedox = pick(
  "g-redox",
  "Higher: conserve electrons",
  "Mg + 2H+ → Mg2+ + H2. Which electron account fits?",
  "Mg loses two electrons; two H+ gain them",
  {
    "Mg gains electrons and H+ loses them": "These directions are reversed.",
    "Only Mg changes; hydrogen ions do not":
      "Reduction of hydrogen ions accompanies metal oxidation.",
  },
  "One Mg atom supplies two electrons; two hydrogen ions accept them to form one H2 molecule. Atoms and charge are conserved. The chloride or sulfate ions remain unchanged spectators.",
  "am-write-v1-r-redox",
  true,
);
guidedRedox.acidMetalReference = "electrons";
const hclAnswer =
  "Mg + 2HCl → MgCl2 + H2; Zn + 2HCl → ZnCl2 + H2; Fe + 2HCl → FeCl2 + H2. The salts are magnesium chloride, zinc chloride and iron(II) chloride. Each metal forms a 2+ ion; two chloride ions balance its charge. Hydrogen is the gas; no extra water product is required. Bubbling or shrinking metal supports reaction, and a supplied squeaky-pop test identifies hydrogen. These are suitable dilute-HCl cases, not a claim that every acid or metal behaves this way.";
const sulfateAnswer =
  "Mg + H2SO4 → MgSO4 + H2; Zn + H2SO4 → ZnSO4 + H2; Fe + H2SO4 → FeSO4 + H2. The salts are magnesium sulfate, zinc sulfate and iron(II) sulfate. One sulfate ion balances one 2+ metal ion; sulfate remains intact. The gas is hydrogen, not carbon dioxide, and water is not an additional metal-reaction product. These statements concern the supplied dilute-sulfuric-acid cases.";
const hclCriteria = [
  "Construct all three balanced equations, including coefficient 2 before HCl and H2 as product.",
  "Name magnesium chloride, zinc chloride and iron(II) chloride; use FeCl2 rather than FeCl3.",
  "Explain chloride charge balance without adding water or carbon dioxide.",
  "Distinguish reaction evidence from a supplied hydrogen-identification test; keep the claim within the stated cases.",
];
const sulfateCriteria = [
  "Construct all three balanced sulfate equations with H2 as product.",
  "Name the three sulfates, including iron(II) sulfate FeSO4.",
  "Keep sulfate intact and balance a 2+ metal ion with one sulfate ion.",
  "Do not substitute chloride, water-only neutralisation or a universal all-acid prediction.",
];
export const acidMetalWritingAdditions = {
  guided: [guided, guidedRedox],
  practice: [
    written(
      "p-salts",
      "Write two metal reactions",
      "Write balanced equations for Zn with dilute HCl and Fe with dilute sulfuric acid. Name each salt and distinguish these products from oxide neutralisation.",
      "Zn + 2HCl → ZnCl2 + H2; Fe + H2SO4 → FeSO4 + H2. Zinc chloride and iron(II) sulfate form. These metal reactions give hydrogen; oxide neutralisation gives salt and water.",
      [
        "Balance both named equations and keep sulfate intact.",
        "Name the correct chloride/sulfate and Fe(II) product.",
        "Distinguish hydrogen from oxide-neutralisation water.",
      ],
      "am-write-v1-r-products",
    ),
    written(
      "p-oxide",
      "Compare metal and oxide",
      "Write balanced equations for Mg and MgO separately with dilute sulfuric acid. Explain the difference in products.",
      "Mg + H2SO4 → MgSO4 + H2; MgO + H2SO4 → MgSO4 + H2O. The metal gives hydrogen; oxide neutralisation gives water. Both salts are magnesium sulfate; acid identity does not make the two reactant families equivalent.",
      [
        "Construct both balanced equations with MgSO4.",
        "Give H2 for Mg and H2O for MgO.",
        "Explain the distinction using metal versus oxide, not just acid identity.",
      ],
      "am-write-v1-r-products",
    ),
    written(
      "p-redox",
      "Higher: explain both changes",
      "Fe + 2HCl → FeCl2 + H2. Explain oxidation and reduction using electron transfers, and identify the spectator ion.",
      "Fe → Fe2+ + 2e−: iron atoms lose electrons and are oxidised. 2H+ + 2e− → H2: hydrogen ions gain electrons and are reduced. Chloride ions are unchanged spectators; the electron counts cancel, conserving total charge and atoms.",
      [
        "Identify Fe atoms as oxidised by loss of two electrons.",
        "Identify hydrogen ions as reduced by gaining those electrons.",
        "Retain chloride as spectator and conserve atoms/charge.",
      ],
      "am-write-v1-r-redox",
      true,
    ),
  ],
  check: [
    written(
      "ca-hcl",
      "Chloride equations",
      "Write balanced Mg, Zn and Fe reactions with dilute HCl. Name the salts, explain their formulas and distinguish reaction evidence from gas identification.",
      hclAnswer,
      hclCriteria,
      "am-write-v1-r-products",
    ),
    written(
      "ca-sulfate",
      "Sulfate equations",
      "Write balanced Mg, Zn and Fe reactions with dilute sulfuric acid. Name the salts and explain their formulas; distinguish the gas from neutralisation products.",
      sulfateAnswer,
      sulfateCriteria,
      "am-write-v1-r-products",
    ),
    written(
      "ca-plan",
      "Identify three metals",
      "Unknown samples are Mg, Fe and Cu. Plan a valid dilute-HCl comparison to identify them; give observations, interpretation and relevant controls.",
      "In a supervised suitable comparison, add comparable metal samples separately to equal volumes and concentrations of dilute HCl at the same initial temperature. Keep exposed area/state of division and metal amount comparable. Compare bubbling rate over the same observation interval or measure initial-to-maximum temperature change using the same method. Cu produces no hydrogen in these conditions; Mg bubbles faster than Fe under the matched comparison. Repeat comparable trials and account for surface films. Bubbles alone do not identify the gas; use supplied suitable gas-test evidence. Do not identify by different starting temperatures or unrecorded final gas yields.",
      [
        "Give a logically sequenced dilute-HCl comparison for all three samples.",
        "Measure a relevant comparable response such as bubbling rate over the same interval or temperature change.",
        "Interpret Cu non-reaction and Mg versus Fe under matched conditions.",
        "Name relevant acid, metal and temperature controls; account for surface effects and gas-identification limits.",
      ],
      "am-write-v1-r-plan",
    ),
    written(
      "ca-redox",
      "Higher: acid redox",
      "For Mg + 2HCl → MgCl2 + H2, construct the electron account and net ionic equation. Identify oxidised/reduced species and spectators.",
      "Mg → Mg2+ + 2e− is oxidation of magnesium atoms. 2H+ + 2e− → H2 is reduction of hydrogen ions. Combining gives Mg + 2H+ → Mg2+ + H2; chloride ions remain unchanged spectators. Two electrons cancel; atoms and charge balance (+2 each side).",
      [
        "Construct correct electron loss from Mg and gain by H+.",
        "Identify Mg atoms as oxidised and hydrogen ions as reduced.",
        "Construct Mg + 2H+ → Mg2+ + H2 with balanced atoms and charge.",
        "Keep chloride as unchanged spectator; do not describe hydrogen gas as the species gaining electrons.",
      ],
      "am-write-v1-r-redox",
      true,
    ),
  ],
  review: [
    written(
      "ra-sulfate",
      "Retrieve sulfate products",
      "Without a reference, write Fe, Zn and Mg reactions with dilute sulfuric acid. Name and justify the salts and gas; keep the claim within these cases.",
      sulfateAnswer,
      sulfateCriteria,
      "am-write-v1-r-products",
    ),
    written(
      "ra-hcl",
      "Retrieve chloride products",
      "Without a reference, write Fe, Mg and Zn reactions with dilute HCl. Name and justify the salts, gas and suitable identification evidence.",
      hclAnswer,
      hclCriteria,
      "am-write-v1-r-products",
    ),
    written(
      "ra-plan",
      "Retrieve an acid test",
      "Unknown samples are Zn, Fe and Cu. Plan a valid dilute-HCl comparison to identify them. Give observations, interpretation and relevant controls.",
      "Use separate comparable samples with the same dilute-HCl volume/concentration and initial temperature, controlling metal amount and exposed area/state of division. Compare bubbling rate over the same observation interval with repeats and attention to oxide films. Under comparable conditions Zn gives hydrogen faster than Fe; Cu gives no hydrogen. Identify the samples using those contrasts; bubbles alone do not identify hydrogen, so use supplied suitable gas-test evidence. Different final gas yields without matched amounts or timing cannot establish the ranking.",
      [
        "Construct a suitable matched dilute-HCl comparison for all three unknowns.",
        "Observe a comparable response over the same interval, with relevant acid/metal/temperature controls.",
        "Interpret Zn versus Fe and Cu non-displacement under those conditions.",
        "Distinguish gas production from gas identification and consider repeatability/surface effects.",
      ],
      "am-write-v1-r-plan",
    ),
    written(
      "ra-redox",
      "Higher: retrieve redox",
      "Fe + H2SO4 → FeSO4 + H2, using dilute acid. Construct both electron changes and the net ionic equation; identify oxidation, reduction and spectators.",
      "Fe → Fe2+ + 2e−: iron atoms are oxidised by electron loss. 2H+ + 2e− → H2: hydrogen ions are reduced by electron gain. Fe + 2H+ → Fe2+ + H2 conserves atoms and charge. Sulfate ions remain unchanged spectators; FeSO4 is iron(II) sulfate, not a Fe3+ salt. The matching electrons cancel; oxygen transfer is not needed for this electron account.",
      [
        "Construct Fe electron loss and H+ electron gain, with matching electron counts.",
        "Identify iron atoms as oxidised and hydrogen ions as reduced.",
        "Construct the balanced net ionic equation without sulfate or uncancelled electrons.",
        "Retain sulfate as spectator and Fe2+ product identity.",
      ],
      "am-write-v1-r-redox",
      true,
    ),
  ],
};
export function extendAcidMetalWriting(journey: LessonJourney) {
  journey.refresher.push(products, redox, plan);
  journey.guided.push(...acidMetalWritingAdditions.guided);
  journey.practice.push(...acidMetalWritingAdditions.practice);
  journey.checkForms.push(acidMetalWritingAdditions.check);
  journey.reviewForms.push(acidMetalWritingAdditions.review);
  journey.guided[0].followUp = "an-v1-r-excess";
  const all = tasks(journey);
  for (const family of [
    [
      products.id,
      guided.id,
      ...acidMetalWritingAdditions.practice
        .filter((q) => q.tier !== "higher")
        .map((q) => q.id),
      ...acidMetalWritingAdditions.check
        .filter((q) => q.tier !== "higher" && q.id !== "am-write-v1-ca-plan")
        .map((q) => q.id),
      ...acidMetalWritingAdditions.review
        .filter((q) => q.tier !== "higher" && q.id !== "am-write-v1-ra-plan")
        .map((q) => q.id),
    ],
    [
      redox.id,
      guidedRedox.id,
      "am-write-v1-p-redox",
      "am-write-v1-ca-redox",
      "am-write-v1-ra-redox",
    ],
    [plan.id, "am-write-v1-ca-plan", "am-write-v1-ra-plan"],
  ])
    for (const id of family) {
      const q = all.find((q) => q.id === id)!;
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...family.filter((other) => other !== id),
        ]),
      ];
    }
  for (const q of all) q.conciseHeading = true;
  journey.practiceGroups = [
    {
      label: "Neutralisation, formulas and evidence",
      taskIds: journey.practice.slice(0, 20).map((q) => q.id),
    },
    {
      label: "Construct named metal reactions",
      taskIds: acidMetalWritingAdditions.practice
        .filter((q) => q.tier !== "higher")
        .map((q) => q.id),
    },
    { label: "Higher: electron transfers", taskIds: ["am-write-v1-p-redox"] },
  ];
  journey.scopeNote +=
    " The individual metal–acid extension constructs all six specified Mg/Zn/Fe dilute-HCl/H2SO4 equations and independent method planning. Higher electron-transfer tasks are filtered by study tier; started forms and raw responses retain their original identities.";
}
export function acidMetalForTier(
  journey: LessonJourney,
  tier: Tier,
): LessonJourney {
  if (tier === "higher") return journey;
  const keep = (qs: LearningTask[]) => qs.filter((q) => q.tier !== "higher");
  return {
    ...journey,
    practiceGroups: journey.practiceGroups
      ?.map((group) => ({
        ...group,
        taskIds: group.taskIds.filter((id) =>
          keep(journey.practice).some((q) => q.id === id),
        ),
      }))
      .filter((group) => group.taskIds.length > 0),
    warmup: keep(journey.warmup),
    refresher: keep(journey.refresher),
    guided: keep(journey.guided),
    practice: keep(journey.practice),
    checkForms: journey.checkForms.map(keep),
    reviewForms: journey.reviewForms.map(keep),
  };
}
