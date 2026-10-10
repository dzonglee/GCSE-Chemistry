import type { LearningTask } from "../types";

const id = (suffix: string) => `materials-v1-composite-recall-${suffix}`;
const example =
  "Reinforced concrete and glass-fibre reinforced polymer are two examples. In reinforced concrete, the cement-based concrete matrix surrounds and binds steel reinforcement. In glass-fibre reinforced polymer, polymer resin is the matrix and glass fibres are the reinforcement. The components retain distinct roles; the matrix binds the reinforcement. Other scientifically valid examples, such as carbon-fibre reinforced polymer, can be reviewed manually. Brass is an alloy, not a matrix/reinforcement example.";
const rubric = [
  "Recall two actual composite materials, rather than two pure materials or alloys. Reinforced concrete and glass-fibre reinforced polymer are examples, not an exclusive list.",
  "For each example, correctly distinguish the surrounding matrix/binder from the embedded reinforcement.",
  "Explain that the matrix surrounds and binds the reinforcement. Scientifically valid alternative examples receive manual review.",
];
function written(suffix: string, title: string, prompt: string): LearningTask {
  return {
    id: id(suffix),
    title,
    purpose: title,
    conciseHeading: true,
    prompt,
    answer: example,
    referenceResponse: example,
    explanation: example,
    rubric,
    hint: "Recall a whole material with distinguishable matrix and reinforcement, then name the roles.",
  };
}
export const compositeRecallRecovery: LearningTask[] = [
  {
    id: id("r-example"),
    title: "Distinguish a composite from an alloy",
    purpose: "Use component roles to recover a composite example.",
    prompt:
      "Use the component model. Which material is a composite with a matrix and reinforcement?",
    answer: "Reinforced concrete",
    options: ["Brass", "Pure aluminium", "Reinforced concrete"],
    misconceptions: {
      Brass:
        "Brass is a copper/zinc alloy; it is not the matrix and embedded reinforcement shown here.",
      "Pure aluminium":
        "A pure metal does not supply these two component roles.",
    },
    explanation:
      "Reinforced concrete has a cement-based matrix surrounding steel reinforcement. Glass-fibre reinforced polymer is another example: resin matrix surrounds glass fibres. Recall the complete material name, then distinguish its two roles.",
    hint: "Find the surrounding binder and the embedded reinforcing component.",
    model: {
      kind: "materials-investigation",
      mode: "composite",
      record: "concrete",
    },
  },
];
export const compositeRecallGuided = [
  written(
    "g-examples",
    "Recall two composites",
    "Name two composite materials. For each, identify the matrix and reinforcement and explain the matrix’s role.",
  ),
];
export const compositeRecallPractice = [
  written(
    "p-examples",
    "Give your own examples",
    "Recall two examples of composites. Identify each matrix and reinforcement, and explain what the matrix does.",
  ),
];
export const compositeRecallCheck = [
  written(
    "c-examples",
    "Recall composite examples",
    "Name two composites and identify the matrix and reinforcement in each. Explain the matrix’s role.",
  ),
];
export const compositeRecallReview = [
  written(
    "v-examples",
    "Retrieve two examples",
    "Recall two composite materials. State their matrix and reinforcement and describe the matrix’s role.",
  ),
];
