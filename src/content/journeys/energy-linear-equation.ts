import type { LearningTask } from "../types";

// A bounded MS4b bridge to the existing gradient/intercept work, not another graph editor.
function interpret(suffix: "guided" | "recovery"): LearningTask {
  return {
    id: `ep-v1-equation-${suffix}`,
    title: "Read y=mx+c",
    purpose: "Connect a straight fitted graph with its linear equation.",
    conciseHeading: true,
    prompt:
      "Fit y=1.5x+21.2: x is mass/g, y temperature/°C. In y=mx+c, identify m and c.",
    options: ["m=21.2; c=1.5", "m=1.5; c=21.2", "m=−1.5; c=21.2"],
    answer: "m=1.5; c=21.2",
    misconceptions: {
      "m=21.2; c=1.5":
        "m multiplies x: it is the gradient. c is the value of y when x=0.",
      "m=−1.5; c=21.2":
        "The positive coefficient means the fitted temperature rises as mass increases.",
    },
    explanation:
      "y=mx+c represents a straight line with constant gradient m and y-intercept c. This is the existing fitted line through (1 g,22.7 °C) and (5 g,28.7 °C): m=1.5 °C/g, so each extra gram increases its predicted temperature by 1.5 °C. c=21.2 °C is its estimated temperature at zero mass. Here x is mass; m means gradient, not mass. The fit does not create a measured zero-mass trial or imply every temperature response is linear at all masses.",
    hint: "m multiplies x; setting x=0 leaves c. Compare with your gradient and extrapolated intercept.",
    exposureAliases: [
      `ep-v1-equation-${suffix === "guided" ? "recovery" : "guided"}`,
    ],
  };
}

export const energyEquationGuided = interpret("guided");
export const energyEquationRecovery = interpret("recovery");
export const energyEquationPractice: LearningTask = {
  id: "ep-v1-equation-practice",
  title: "Read m and c",
  conciseHeading: true,
  purpose:
    "Read the signed gradient and intercept from a different supplied linear fit.",
  prompt: "Fitted y=−0.4x+23.8; x: mass/g, y: temperature/°C. Give m and c.",
  partLegend: "Fitted-line values",
  parts: [
    { id: "m", label: "m / °C/g", answer: -0.4, inputMode: "decimal" },
    { id: "c", label: "c / °C", answer: 23.8, inputMode: "decimal" },
  ],
  answer: JSON.stringify({ m: "-0.4", c: "23.8" }),
  explanation:
    "In y=mx+c, m=−0.4 °C/g is the constant gradient: the fitted temperature falls by 0.4 °C for each extra gram. c=23.8 °C is the predicted temperature when x=0, where the line crosses the temperature axis. Here x is mass/g and y is temperature/°C. An extrapolated intercept is an estimate, not an extra measurement; the supplied straight fit is not a claim about every mass or reaction.",
  hint: "Keep the sign of the coefficient of x. At x=0 the mx term is zero.",
  followUp: energyEquationRecovery.id,
};

// Original short fits, not extra measurements or a law covering every reaction.
// Appended forms keep the original practical assessments and active runs intact.
export const energyEquationCases = [
  { suffix: "cA", m: 1.2, c: 20.6, x: 2, y: 23 },
  { suffix: "cB", m: -0.5, c: 24.2, x: 3, y: 22.7 },
  { suffix: "vA", m: 1.8, c: 19.7, x: 4, y: 26.9 },
  { suffix: "vB", m: -0.3, c: 22.5, x: 2, y: 21.9 },
] as const;

function equationForm(
  data: (typeof energyEquationCases)[number],
): LearningTask[] {
  const equation = `y=${String(data.m).replace("-", "−")}x+${data.c}`;
  const prefix = `ep-v1-equation-${data.suffix}`;
  return [
    {
      id: `${prefix}-coefficients`,
      title: "Read the fitted equation",
      purpose:
        "Independently read a signed gradient and extrapolated intercept.",
      conciseHeading: true,
      prompt: `Fit ${equation}; x: mass/g, y: temperature/°C. Give m and c.`,
      partLegend: "Fitted values",
      parts: [
        { id: "m", label: "m / °C/g", answer: data.m, inputMode: "decimal" },
        { id: "c", label: "c / °C", answer: data.c, inputMode: "decimal" },
      ],
      answer: JSON.stringify({ m: String(data.m), c: String(data.c) }),
      explanation: `In y=mx+c, m=${data.m} °C/g is the constant gradient; c=${data.c} °C is the fitted estimate at x=0. The sign of m determines whether predicted temperature rises or falls with mass. Here m means gradient, not mass. The intercept is not a new zero-mass measurement.`,
      hint: "Identify the coefficient multiplying x and the value remaining at x=0.",
    },
    {
      id: `${prefix}-prediction`,
      title: "Use the fitted relationship",
      purpose:
        "Use a linear fit to predict temperature within its supplied range.",
      conciseHeading: true,
      prompt: `Temperature fit ${equation}, for masses 1–5 g. Predict y at x=${data.x} g.`,
      answer: String(data.y),
      unit: "°C",
      explanation: `${data.m}×${data.x}+${data.c}=${data.y} °C. Substitute the mass into the supplied straight fit. This prediction is within the stated 1–5 g range; it is an estimate, not an extra observation or permission to assume the same fit holds at every mass.`,
      hint: "Multiply the signed gradient by mass, then add the intercept.",
    },
  ];
}
export const energyEquationCheckForms = energyEquationCases
  .slice(0, 2)
  .map(equationForm);
export const energyEquationReviewForms = energyEquationCases
  .slice(2)
  .map(equationForm);
