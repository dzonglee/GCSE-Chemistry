import type { LearningTask } from "../types";

const id = (s: string) => `lca-v1-magnitude-${s}`;
function estimate(
  suffix: string,
  title: string,
  data: string,
  larger: number,
  smaller: number,
  orders: number,
): LearningTask {
  const ratio = larger / smaller;
  const parts = [
    {
      id: "larger",
      label: "Rounded larger quantity",
      answer: larger,
    },
    {
      id: "smaller",
      label: "Rounded smaller quantity",
      answer: smaller,
    },
    { id: "ratio", label: "Approximate larger ÷ smaller", answer: ratio },
    {
      id: "orders",
      label: "Orders of magnitude",
      answer: orders,
    },
  ];
  return {
    id: id(suffix),
    title,
    purpose: title,
    conciseHeading: true,
    prompt: `${data} Round each to 1 significant figure. Estimate larger ÷ smaller and count factors of ten. Use ordinary numbers.`,
    answer: JSON.stringify(
      Object.fromEntries(parts.map((p) => [p.id, String(p.answer)])),
    ),
    parts: parts.map((part) => ({ ...part, inputMode: "numeric" as const })),
    partLegend: "Construct your estimate",
    hint: "Use the same units and service first; round each quantity to one significant figure before dividing.",
    explanation: `${larger} ÷ ${smaller} = ${ratio} = 10^${orders}, so this approximate comparison spans ${orders} orders of magnitude. Each order is a factor of ten, not ten units. The ratio is approximate: rounding is not a claim that the source measurements are exact powers of ten.`,
  };
}
function judge(
  suffix: string,
  title: string,
  prompt: string,
  answer: string,
): LearningTask {
  return {
    id: id(suffix),
    title,
    purpose: title,
    conciseHeading: true,
    prompt,
    answer,
    referenceResponse: answer,
    explanation:
      "Compare your saved reasoning with the reference after submitting the whole check. Written judgement is manually reviewed; there is no automatic examiner mark.",
    rubric: [
      "Estimate a ratio using quantities in the same units and for the stated service or period.",
      "Explain the saving as a fraction of the total, using the powers-of-ten scale.",
      "State what the comparison supports and a relevant limit; a small fraction is not zero impact or a complete lifecycle verdict.",
    ],
    hint: "Compare the saving with the total, then distinguish that numerical comparison from an overall environmental verdict.",
  };
}
export const magnitudeRefresher = [
  estimate(
    "r-scale",
    "Count factors of ten",
    "Annual use: 4,800,000 kg; saving: 5,200 kg, for equal service.",
    5_000_000,
    5_000,
    3,
  ),
  judge(
    "r-significance",
    "What does the scale mean?",
    "For the same annual service, total use is about 5,000,000 kg and a saving is about 5,000 kg. Explain the saving's significance and one limit of this comparison.",
    "The total is about 1000 times the saving: three orders of magnitude. The saving is about 1/1000, or 0.1%, of total use. It is a small fraction of annual use, although 5000 kg can still matter. This compares one resource quantity for the same period/service; pollutant effects, other lifecycle stages and priorities are needed for a wider environmental judgement.",
  ),
];
export const magnitudeGuided = [
  estimate(
    "g-scale",
    "Build an approximate comparison",
    "Annual use: 6,100,000 kg; avoided use: 5,800 kg, for equal service.",
    6_000_000,
    6_000,
    3,
  ),
];
export const magnitudePractice = [
  {
    ...estimate(
      "p-scale",
      "Estimate before trusting a claim",
      "Annual freshwater use: 8,200,000 litres; saving: 79,000 litres, for equal service.",
      8_000_000,
      80_000,
      2,
    ),
    followUp: id("r-scale"),
  },
  {
    ...judge(
      "p-significance",
      "Evaluate a resource claim",
      "For equal annual service, a factory uses 8,200,000 litres of freshwater and saves 79,000 litres. A poster calls this saving 'most of our water use'. Use an order-of-magnitude estimate to evaluate the claim and state a limit.",
      "Round to 8,000,000 and 80,000 litres. Total use is about 100 times the saving, a two-order difference; the saving is about 1%, not most of the total. It reduces water demand, but its environmental importance also depends on local water scarcity, other stages and the alternative. This dataset alone cannot establish an overall environmental winner.",
    ),
    followUp: id("r-significance"),
  },
];
export const magnitudeCheckForms = [
  [
    estimate(
      "ca-scale",
      "Construct the resource estimate",
      "Annual copper use: 7,200,000 kg; avoided use: 6,800 kg, for equal service.",
      7_000_000,
      7_000,
      3,
    ),
    judge(
      "ca-significance",
      "Judge the copper saving",
      "For equal annual service, total copper use is 7,200,000 kg and avoided new copper use is 6,800 kg. Estimate their scale difference and explain what that says about the saving, including one limit.",
      "About 7,000,000 ÷ 7,000 = 1000: three orders of magnitude. Avoided new use is about 0.1% of total use, a small fraction, though thousands of kilograms of finite copper can still matter. The data supports reduced new extraction for the same service; it does not alone compare processing energy, pollution and all lifecycle stages.",
    ),
  ],
  [
    estimate(
      "cb-scale",
      "Compare the water quantities",
      "Annual water use: 2,900,000,000 litres; saving: 3,100 litres, for equal service.",
      3_000_000_000,
      3_000,
      6,
    ),
    judge(
      "cb-significance",
      "Is the fraction negligible?",
      "For equal annual service, total water use is 2,900,000,000 litres and a saving is 3,100 litres. Estimate their scale difference. Evaluate the claim 'the saving is zero because it is tiny'.",
      "About 3,000,000,000 ÷ 3000 = 1,000,000: six orders of magnitude. The saving is about one millionth of total use (about 0.0001%), a very small fraction but not zero. Thousands of litres are still conserved; significance also depends on scarcity, cost and alternatives. This single quantity does not settle an overall lifecycle comparison.",
    ),
  ],
];
export const magnitudeReviewForms = [
  [
    estimate(
      "ra-scale",
      "Retrieve a scale comparison",
      "Annual timber use: 3,900,000 kg; avoided use: 420 kg, for equal service.",
      4_000_000,
      400,
      4,
    ),
    judge(
      "ra-significance",
      "Explain the timber saving",
      "For equal annual service, total timber use is 3,900,000 kg and avoided use is 420 kg. Estimate the ratio and interpret the saving, including one limitation.",
      "About 4,000,000 ÷ 400 = 10,000: four orders of magnitude. The saving is about one ten-thousandth of total use (0.01%), a small fraction but 420 kg is not zero. Effects also depend on replenishment, other stages and demand; renewable timber is not automatically sustainably harvested.",
    ),
  ],
  [
    estimate(
      "rb-scale",
      "Reconstruct a mass comparison",
      "Annual material use: 9,300,000 kg; avoided use: 87,000 kg, for equal service.",
      9_000_000,
      90_000,
      2,
    ),
    judge(
      "rb-significance",
      "Assess a saving claim",
      "For equal annual service, total material use is 9,300,000 kg and avoided use is 87,000 kg. Evaluate the claim 'avoided use is about the same size as total use', using an estimate and a relevant limitation.",
      "About 9,000,000 ÷ 90,000 = 100: two orders of magnitude. Avoided use is about 1% of total, not about the same size. It can reduce extraction, but this quantity alone does not include recovery losses, processing impacts and other lifecycle stages. Compare the same service and state those limits.",
    ),
  ],
];
export const allMagnitudeTasks = [
  ...magnitudeRefresher,
  ...magnitudeGuided,
  ...magnitudePractice,
  ...magnitudeCheckForms.flat(),
  ...magnitudeReviewForms.flat(),
];
for (const family of [
  allMagnitudeTasks.filter((q) => q.parts),
  allMagnitudeTasks.filter((q) => q.rubric),
])
  for (const q of family)
    q.exposureAliases = family
      .filter((other) => other !== q)
      .map((other) => other.id);
