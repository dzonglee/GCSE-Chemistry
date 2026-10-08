import { choice as c, type GasTask } from "./gas-tests-tasks";
export const gasWarmup: GasTask[] = [
  c(
    "w-observation",
    "Separate observation from identification",
    "Which statement is an observation rather than an identification?",
    "The liquid becomes cloudy",
    {
      "The gas is carbon dioxide": "That names the gas inferred from evidence.",
      "The gas must be pure": "That is a composition claim, not what was seen.",
    },
    "An observation reports what was seen or heard; identification interprets it.",
    "Ask what the observer actually noticed.",
  ),
  c(
    "w-glowing",
    "Distinguish glowing from burning",
    "A splint has a hot glowing end but no visible flame. Its starting condition is…",
    "Glowing",
    {
      "Cold and unlit": "A glowing end remains hot.",
      "Burning with a visible flame":
        "The source explicitly says there is no flame.",
    },
    "A glowing splint and a burning splint are different starting conditions.",
    "Use the stated appearance.",
  ),
  c(
    "w-aqueous",
    "Read the reagent description",
    "What does aqueous mean in “aqueous calcium hydroxide”?",
    "Dissolved in water",
    {
      "A dry powder": "Aqueous describes a solution.",
      "A pure gas": "The reagent is a water-based solution.",
    },
    "An aqueous solution has water as its solvent.",
    "Recall the meaning of (aq).",
  ),
  c(
    "w-mixture",
    "Limit a positive result",
    "A gas sample is a mixture. One component gives a positive identification test. What is established about the other components?",
    "Their identities remain undetermined",
    {
      "They cannot exist": "A mixture can contain other gases.",
      "They must have the same identity":
        "A positive test does not turn different components into one substance.",
    },
    "Evidence for one component does not identify every component or establish purity.",
    "Separate presence from the complete composition.",
  ),
];
