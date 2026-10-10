import type { LearningTask } from "../types";

const prefix = "haber-v1-source-recall-";
const sources =
  "Nitrogen is obtained from air (the atmosphere). Hydrogen is commonly obtained by processing natural gas/methane. Water or steam is also an accepted hydrogen source. This question asks for sources, so a processing explanation is not needed to earn these recall points.";
const products =
  "Nitric acid: calcium nitrate. Sulfuric acid: single superphosphate, a mixture containing calcium dihydrogenphosphate and calcium sulfate. Phosphoric acid: triple superphosphate, calcium dihydrogenphosphate without the calcium sulfate coproduct. Nitric-acid treatment also produces phosphoric acid, but that acid is not itself the salt requested.";
function written(
  stage: string,
  kind: "sources" | "products",
  title: string,
  prompt: string,
): LearningTask {
  const reference = kind === "sources" ? sources : products;
  return {
    id: `${prefix}${stage}-${kind}`,
    title,
    purpose: title,
    conciseHeading: true,
    ...(kind === "sources" ? { shortWritten: true } : {}),
    prompt,
    answer: reference,
    referenceResponse: reference,
    explanation: reference,
    rubric:
      kind === "sources"
        ? [
            "Give air or the atmosphere as the nitrogen source.",
            "Give natural gas/methane or water/steam as the hydrogen source. Do not require extra process details for this source recall question.",
          ]
        : [
            "Nitric acid: name calcium nitrate. Phosphoric acid is an additional product, but is not a salt.",
            "Sulfuric acid: name single superphosphate. A correct description naming its calcium dihydrogenphosphate and calcium sulfate components is also valid.",
            "Phosphoric acid: name triple superphosphate or calcium dihydrogenphosphate. Distinguish it from the sulfate-containing single superphosphate mixture.",
          ],
    hint:
      kind === "sources"
        ? "Recall where each raw material comes from; give one source for each gas."
        : "Recall the salt or fertiliser-product name for each acid route separately.",
  };
}
export const haberSourceRecallGuided = [
  written(
    "g",
    "sources",
    "Recall both gas sources",
    "Name one source of nitrogen and one source of hydrogen for the Haber process.",
  ),
  written(
    "g",
    "products",
    "Acid products",
    "Name the salt or fertiliser product from phosphate rock with: nitric acid; sulfuric acid; phosphoric acid.",
  ),
];
export const haberSourceRecallPractice = [
  written(
    "p",
    "sources",
    "Name the Haber feed sources",
    "Give a source for each Haber reactant: nitrogen and hydrogen.",
  ),
  written(
    "p",
    "products",
    "Name products",
    "State the salt or fertiliser product made when phosphate rock reacts with each acid: nitric, sulfuric and phosphoric.",
  ),
];
export const haberSourceRecallCheck = [
  written(
    "c",
    "sources",
    "Recall the raw-material sources",
    "Give one source of nitrogen and one source of hydrogen used to manufacture ammonia.",
  ),
  written(
    "c",
    "products",
    "Name products",
    "Name the salt or fertiliser product from phosphate rock treated with (a) nitric acid, (b) sulfuric acid, (c) phosphoric acid.",
  ),
];
export const haberSourceRecallReview = [
  written(
    "v",
    "sources",
    "Retrieve both feed sources",
    "From memory, state one source for each gas fed to the Haber process: nitrogen and hydrogen.",
  ),
  written(
    "v",
    "products",
    "Acid products",
    "Recall each salt or fertiliser product from phosphate rock with nitric, sulfuric and phosphoric acid.",
  ),
];
