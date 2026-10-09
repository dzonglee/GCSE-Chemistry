import type { LearningTask } from "../types";

const prefix = "aqp-v1-method-";
function plan(
  suffix: string,
  title: string,
  solution: string,
  metal: string,
  product: "hydrogen" | "copper",
): LearningTask {
  const gases = product === "hydrogen";
  const reference = gases
    ? `Hypothesis: aqueous ${solution} with inert electrodes produces hydrogen at the negative cathode and oxygen at the positive anode. ${metal} is above hydrogen; the solution has no halide. In a supervised school cell, connect two separated carbon electrodes to a low-voltage DC supply, with both immersed in the solution. Collect gases separately over each electrode, keeping the electrode labels. Test a separate cathode-gas sample with a lit splint: a squeaky pop supports hydrogen. Test anode gas with a glowing splint: relighting supports oxygen. Record observations and test results for each electrode and compare them with the prediction. Repeat with fresh comparable solution to check consistency; bubbles alone do not identify either gas.`
    : `Hypothesis: aqueous ${solution} with inert electrodes deposits copper at the negative cathode and produces oxygen at the positive anode. Copper is below hydrogen and the solution contains no halide. In a supervised school cell, connect two separated carbon electrodes to a low-voltage DC supply, with both immersed in the solution. Record the red-brown solid forming at the cathode and collect anode gas separately. Relighting a glowing splint supports oxygen. Compare the labelled observations and gas test with the prediction, then repeat with fresh comparable solution to check consistency. A deposit's colour alone does not uniquely identify every possible unknown solid; the copper conclusion also uses the known electrolyte and product rule. Copper electrodes would change the anode reaction.`;
  return {
    id: prefix + suffix,
    title,
    conciseHeading: true,
    prompt: `Aqueous ${solution}; inert electrodes; ${metal.toLowerCase()} ${gases ? "above" : "below"} hydrogen. Predict and explain both products. Plan a supervised method with apparatus, observations and tests.`,
    purpose:
      "Develop and test a practical hypothesis rather than evaluate a prediction supplied by someone else.",
    answer: reference,
    referenceResponse: reference,
    rubric: [
      `Predict ${product} at the negative cathode and oxygen at the positive anode, using relative reactivity and the absence of halide.`,
      "Describe an aqueous cell with two separated, immersed inert/carbon electrodes connected to a low-voltage DC supply; retain positive/negative labels.",
      gases
        ? "Collect the gases separately and match a lit-splint squeaky pop to cathode hydrogen and a glowing-splint relight to anode oxygen."
        : "Record the cathode deposit and test separately collected anode gas with a glowing splint; relighting supports oxygen.",
      "Record evidence for each labelled electrode, compare it with the hypothesis and repeat under comparable conditions; distinguish observation from identification.",
      "Describe supervised school work. No Higher half equations or fixed apparatus dimensions are required here. Alternative suitable school apparatus is acceptable.",
    ],
    hint: "First make your own prediction for each electrode. Then ask what separately labelled evidence could support or challenge each part.",
    explanation:
      "Compare your plan with the reference and criteria. Different clear, suitable school methods are acceptable. Your writing is retained for manual self-review; no automatic examiner mark is awarded.",
    followUp: "aqp-v1-r-test",
  };
}
export const aqueousMethodGuided = plan(
  "g-sodium",
  "Develop a hypothesis",
  "sodium sulfate",
  "Sodium",
  "hydrogen",
);
export const aqueousMethodPractice = plan(
  "p-copper",
  "Test a deposit and a gas",
  "copper sulfate",
  "Copper",
  "copper",
);
export const aqueousMethodChecks = [
  [
    plan(
      "c-potassium",
      "Predict, then test",
      "potassium sulfate",
      "Potassium",
      "hydrogen",
    ),
  ],
  [
    plan(
      "c-copper",
      "Build a practical plan",
      "copper nitrate",
      "Copper",
      "copper",
    ),
  ],
];
export const aqueousMethodReviews = [
  [
    plan(
      "r-sodium",
      "Retrieve the whole plan",
      "sodium nitrate",
      "Sodium",
      "hydrogen",
    ),
  ],
  [
    plan(
      "r-magnesium",
      "Plan in a changed context",
      "magnesium sulfate",
      "Magnesium",
      "hydrogen",
    ),
  ],
];
// The electrolyte names change; the underlying product/test reasoning does not.
// Treat all gas-to-gas plans as equivalent, and both copper plans as equivalent.
const gasPlans = [
  aqueousMethodGuided,
  ...aqueousMethodChecks[0],
  ...aqueousMethodReviews.flat(),
];
const copperPlans = [aqueousMethodPractice, ...aqueousMethodChecks[1]];
for (const group of [gasPlans, copperPlans])
  for (const q of group)
    q.exposureAliases = group
      .filter((other) => other.id !== q.id)
      .map((other) => other.id);
