import { gasWarmup } from "./gas-tests-warmup";
import { gasRecovery } from "./gas-tests-recovery";
import { gasGuided } from "./gas-tests-guided";
import { gasPractice } from "./gas-tests-practice";
import { gasCheckForms, gasReviewForms } from "./gas-tests-assessments";
const id = (suffix: string) => "gas-tests-v1-" + suffix;
for (const [question, target] of [
  ["w-observation", "r-observe"],
  ["w-glowing", "r-glow"],
  ["w-aqueous", "r-aqueous"],
  ["w-mixture", "r-presence"],
]) {
  const task = gasWarmup.find((task) => task.id === id(question));
  if (!task || !gasRecovery.some((task) => task.id === id(target)))
    throw Error("Missing gas-test prerequisite recovery.");
  task.followUp = id(target);
}
const routes: [string, string[]][] = [
  ["p-hydrogen-state", ["r-hydrogen", "r-glow"]],
  ["p-oxygen-state", ["r-cold", "r-oxygen"]],
  ["p-relights", ["r-observe", "r-oxygen"]],
  ["p-cloudy", ["r-co2"]],
  ["p-shaken", ["r-co2"]],
  ["p-identify-h", ["r-hydrogen"]],
  ["p-identify-o", ["r-oxygen"]],
  ["p-identify-c", ["r-co2"]],
  ["p-identify-cl", ["r-chlorine"]],
  ["p-mixture", ["r-presence"]],
  ["p-electrolysis", ["r-hydrogen"]],
  ["p-damp", ["r-dry"]],
  ["p-reagent", ["r-reagent", "r-limewater"]],
  ["p-outlet", ["r-contact"]],
  ["p-methods", ["r-co2"]],
  ["p-word-glow", ["r-oxygen", "r-glow"]],
  ["p-word-red", ["r-red", "r-chlorine"]],
  ["p-word-h", ["r-hydrogen"]],
  ["p-distinguish", ["r-co2", "r-oxygen"]],
  ["p-no-other-gas", ["r-dry", "r-presence"]],
  ["p-explain-liquid", ["r-limewater", "r-observe"]],
  ["p-explain-lost", ["r-lost"]],
  ["p-explain-oxygen", ["r-support"]],
  ["p-draw-oxygen", ["r-oxygen", "r-glow"]],
  ["p-draw-co2", ["r-reagent", "r-contact", "r-co2"]],
  ["p-supervision", ["r-supervision"]],
];
export const gasRecoveryRoutes: Record<string, string[]> = {};
for (const [question, targets] of routes) {
  const task = gasPractice.find((task) => task.id === id(question));
  if (
    !task ||
    targets.some(
      (target) => !gasRecovery.some((task) => task.id === id(target)),
    )
  )
    throw Error("Missing individually reviewed gas-test recovery.");
  gasRecoveryRoutes[task.id] = targets.map(id);
  task.followUp = id(targets[0]);
}
// Direct repeated facts/source conclusions only. No transitive expansion.
export const gasExposureFamilies = {
  hydrogenCore: [
    "g-hydrogen",
    "r-hydrogen",
    "p-hydrogen-state",
    "p-identify-h",
    "p-electrolysis",
    "p-word-h",
    "cA-h-method",
    "vB-method",
  ],
  oxygenCore: [
    "g-oxygen",
    "r-oxygen",
    "p-oxygen-state",
    "p-relights",
    "p-identify-o",
    "p-word-glow",
    "cB-o-method",
  ],
  co2Result: [
    "r-co2",
    "p-cloudy",
    "p-identify-c",
    "g-wording",
    "p-explain-liquid",
    "cB-reagent-result",
  ],
  chlorineCore: [
    "g-chlorine",
    "g-bleaching",
    "r-chlorine",
    "p-identify-cl",
    "p-word-red",
    "vA-chlorine",
  ],
  // These explanations/references or their required limewater selection explicitly
  // supply the solute identity. A later bare-definition item is repeated evidence.
  limewaterIdentity: [
    "r-limewater",
    "cA-reagent",
    "r-co2",
    "r-reagent",
    "p-reagent",
    "p-explain-liquid",
    "p-draw-co2",
    "g-co2",
    "g-mixture",
    "p-identify-c",
    "p-mixture",
  ],
  dryPaperLimit: ["r-dry", "p-damp", "p-no-other-gas", "cA-dry"],
  liquidContact: ["g-co2", "r-contact", "p-outlet", "cB-contact"],
  waterReagentLimit: ["r-reagent", "vB-negative"],
  shakingMethod: ["p-shaken", "p-methods", "cB-shaking"],
  incompleteLitmus: ["r-red", "cA-incomplete", "vB-litmus-limit"],
  lostSample: ["r-lost", "p-explain-lost"],
  co2Mixture: ["g-mixture", "p-mixture", "vA-record-limit"],
  oxygenRole: ["r-support", "p-explain-oxygen", "g-full-answer"],
  glowingPrerequisite: ["w-glowing", "r-glow"],
  aqueousPrerequisite: ["w-aqueous", "r-aqueous"],
  mixturePrerequisite: ["w-mixture", "r-presence"],
  schoolSupervision: ["r-supervision", "p-supervision"],
};
export const allGasTasks = [
  ...gasWarmup,
  ...gasRecovery,
  ...gasGuided,
  ...gasPractice,
  ...gasCheckForms.flat(),
  ...gasReviewForms.flat(),
];
for (const family of Object.values(gasExposureFamilies)) {
  const ids = family.map(id);
  for (const current of ids) {
    const task = allGasTasks.find((task) => task.id === current);
    if (!task) throw Error("Unknown gas-test exposure alias " + current);
    task.exposureAliases = [
      ...new Set([
        ...(task.exposureAliases ?? []),
        ...ids.filter((other) => other !== current),
      ]),
    ];
  }
}
const group = (label: string, suffixes: string[]) => ({
  label,
  taskIds: suffixes.map(id),
});
export const gasTestsJourney = {
  version: 1 as const,
  introduction:
    "Choose a precise test, read its observation and justify the gas identification. Distinguish a valid result from a failed method.",
  scopeNote:
    "AQA Chemistry and Trilogy, both tiers: the four common gas tests. Limited Pearson specification comparison. Original school records and practice, not an official examination paper or a certificate of exam readiness.",
  outcomes: [
    "Specify starting condition, reagent and contact for hydrogen, oxygen, carbon dioxide and chlorine.",
    "Describe a pop, relighting, cloudy limewater and bleaching as observations, separately from gas identities.",
    "Interpret complete and incomplete records; reject unsupported conclusions from invalid tests.",
    "Compare controlled procedure changes and distinguish oxygen supporting burning from being the fuel.",
    "Write precise test/result answers and construct labelled diagrams with honest self-review.",
  ],
  warmup: gasWarmup,
  refresher: gasRecovery,
  guided: gasGuided,
  practice: gasPractice,
  checkForms: gasCheckForms,
  reviewForms: gasReviewForms,
  practiceGroups: [
    group("Starting state and recorded observations", [
      "p-hydrogen-state",
      "p-oxygen-state",
      "p-relights",
      "p-cloudy",
      "p-shaken",
    ]),
    group("Identify within stated evidence limits", [
      "p-identify-h",
      "p-identify-o",
      "p-identify-c",
      "p-identify-cl",
      "p-mixture",
      "p-electrolysis",
    ]),
    group("Compare valid and failed methods", [
      "p-damp",
      "p-reagent",
      "p-outlet",
      "p-methods",
      "p-no-other-gas",
    ]),
    group("Precise exam wording and explanations", [
      "p-word-glow",
      "p-word-red",
      "p-word-h",
      "p-distinguish",
      "p-explain-liquid",
      "p-explain-lost",
      "p-explain-oxygen",
    ]),
    group("Construct and interpret school-test records", [
      "p-draw-oxygen",
      "p-draw-co2",
      "p-supervision",
    ]),
  ],
};
