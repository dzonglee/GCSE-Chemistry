import type { LearningTask, LessonJourney } from "../types";
import { number } from "./helpers";

const id = (suffix: string) => `py-v1-reversible-${suffix}`;
const reversibleAnswer =
  "The forward reaction forms product, but the reverse reaction converts product back into reactants. Complete conversion need not occur, so some atoms remain in reactants and the desired-product amount is below its complete-conversion maximum. No atoms disappear. This is different from product that formed but was lost during separation.";
const reversibleCriteria = [
  "Explain that the reverse reaction converts product back into reactants.",
  "Connect incomplete conversion and remaining reactants to a lower product yield.",
  "Conserve atoms and distinguish this from loss of already formed product.",
];
function written(
  suffix: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): LearningTask {
  return {
    id: id(suffix),
    title,
    prompt,
    answer,
    explanation: answer,
    purpose: title,
    hint: rubric[0],
    rubric,
    referenceResponse: answer,
    conciseHeading: true,
  };
}
const causesAnswer =
  "In the reversible reaction, product can react back into reactants, preventing complete conversion. Product retained in a filter has already formed but is absent from the collected sample. An unwanted reaction directs some reactant atoms into a different product. All three can reduce the amount of desired product obtained without destroying atoms; the supplied evidence distinguishes the causes.";
const causesCriteria = [
  "Connect reversibility to product reacting back and incomplete conversion.",
  "Distinguish formed product lost during separation from product not formed.",
  "Explain that unwanted reactions divert reactants to other products, conserving atoms.",
];
export function addYieldReversibleWriting(j: LessonJourney): void {
  j.outcomes?.push(
    "Explain why a reversible reaction can lower yield, distinguishing separation losses and unwanted reactions.",
  );
  j.scopeNote +=
    " Additional common-tier work explicitly connects reversible incomplete conversion to yield. The guided closed 1:1 A ⇌ B token inventory is a constructed equal-unit comparison, not a measured reaction, universal mechanism or real mass calculation. Independent written explanations remain manually compared.";
  j.refresher.push(
    written(
      "r-causes",
      "Account for a lower yield",
      "Explain how reversibility, product separation and unwanted reactions can each reduce the desired-product yield without destroying atoms.",
      causesAnswer,
      causesCriteria,
    ),
  );
  j.guided.push({
    ...number(
      id("g-inventory"),
      "Constructed closed 1:1 A ⇌ B: 14 A and 6 B. Complete conversion would give 20 B. What percentage of this maximum is B?",
      30,
      "%",
      "6/20 × 100 = 30%. Both directions can continue at equal rates while 14 A and 6 B remain. Product reacts back into A; this is incomplete conversion, not loss during collection.",
      "Use the amount of B over its complete-conversion maximum, not over the amount of A.",
      "Compare product with its maximum",
      {},
      {
        kind: "reversible-equilibrium",
        mode: "turnover",
        yieldComparison: true,
        record: "initial",
        instruction:
          "Advance an interval: track both directions and compare the unchanged B count with 20 B at complete conversion.",
      },
    ),
    title: "Compare product with its maximum",
    conciseHeading: true,
  });
  j.practice.push(
    {
      ...written(
        "p-reverse",
        "Explain reversible yield",
        "A reversible reaction leaves reactants in the mixture. No product is lost during separation. Explain why its yield can be below 100% without atoms disappearing.",
        reversibleAnswer,
        reversibleCriteria,
      ),
      followUp: id("r-causes"),
    },
    {
      ...written(
        "p-causes",
        "Distinguish three losses",
        "Compare three records: product reacts back; formed product remains in a filter; an unwanted product forms. Explain each lower desired-product yield, conserving atoms.",
        causesAnswer,
        causesCriteria,
      ),
      followUp: id("r-causes"),
    },
  );
  j.checkForms.push(
    [
      number(
        id("ca-yield"),
        "The complete-conversion maximum is 40 g of product. A reversible reaction gives 26 g of pure dry product. Calculate percentage yield.",
        65,
        "%",
        "26/40 × 100 = 65%. Both masses refer to the same pure dry product.",
        "Use actual product over its theoretical maximum.",
        "Calculate the product yield",
      ),
      written(
        "ca-reverse",
        "Explain the incomplete yield",
        "A reversible reaction gives less product than complete conversion would. All formed product is recovered. Explain the lower yield and where the atoms remain.",
        reversibleAnswer,
        reversibleCriteria,
      ),
    ],
    [
      number(
        id("cb-yield"),
        "Maximum pure dry product: 50 g. Actual pure dry product from a reversible reaction: 32 g. Calculate percentage yield.",
        64,
        "%",
        "32/50 × 100 = 64%; do not divide by reactant mass.",
        "Compare quantities of the same product.",
        "Calculate the changed product yield",
      ),
      written(
        "cb-reverse",
        "Account for unconverted material",
        "Product can react back into reactants. No unwanted product or separation loss is recorded. Explain why actual yield can be below its complete-conversion maximum.",
        reversibleAnswer,
        reversibleCriteria,
      ),
    ],
  );
  j.reviewForms.push(
    [
      number(
        id("ra-yield"),
        "Pure dry product obtained: 18 g. Complete-conversion maximum: 30 g. Calculate percentage yield.",
        60,
        "%",
        "18/30 × 100 = 60%.",
        "Use actual over theoretical product.",
        "Retrieve the product fraction",
      ),
      written(
        "ra-causes",
        "Retrieve the three causes",
        "Explain three reasons for a yield below 100%: a reversible reaction, loss during product separation and an unwanted reaction. Account for atoms in each.",
        causesAnswer,
        causesCriteria,
      ),
    ],
    [
      number(
        id("rb-yield"),
        "A reversible reaction gives 21 g of pure dry product against a complete-conversion maximum of 35 g. Calculate percentage yield.",
        60,
        "%",
        "21/35 × 100 = 60%.",
        "Choose the complete-conversion product denominator.",
        "Retrieve a changed product fraction",
      ),
      written(
        "rb-causes",
        "Reconstruct the evidence",
        "Three records show product reacting back, product retained in apparatus and a different product forming. Explain how these reduce desired-product yield without destroying atoms.",
        causesAnswer,
        causesCriteria,
      ),
    ],
  );
  const all = [
    ...j.warmup,
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ];
  const family = all
    .filter((q) => q.id.startsWith("py-v1-reversible-"))
    .map((q) => q.id);
  for (const q of all)
    if (family.includes(q.id))
      q.exposureAliases = family.filter((other) => other !== q.id);
}
