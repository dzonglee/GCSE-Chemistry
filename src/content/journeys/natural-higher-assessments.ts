import { draw, w } from "./natural-tasks";
import type { LearningTask, LessonJourney, Tier } from "../types";

// New reserved forms supplement the original common-tier forms; they do not
// replace or renumber saved questions or existing learning positions.
export const naturalHigherChecks: LearningTask[][] = [
  [
    draw(
      "h-ca-repeat",
      "Higher: draw a repeat",
      "Draw one bracketed repeat with continuation bonds and n.",
      "peptideUnit",
      "alanine",
      "[–NH–CH(CH₃)–C(=O)–]ₙ",
      [
        "Retain CH(CH₃) and the carbonyl C=O.",
        "Show NH and omit the internal acid OH.",
        "Show both continuing bonds, brackets and n; the junction is C–N.",
      ],
    ),
    draw(
      "h-ca-peptide",
      "Higher: build a chain",
      "Form an open chain in the given order. Account for released water.",
      "peptide",
      "beta",
      "NH₂–CH₂–CH₂–C(=O)–NH–CH₂–CH₂–C(=O)–OH; one H₂O.",
      [
        "Retain both original CH₂–CH₂ sections and both C=O bonds.",
        "Form one carbonyl C–N junction, removing acid OH and one amino H as H₂O.",
        "Retain the outer NH₂ and COOH groups.",
      ],
    ),
    w(
      "h-ca-explain",
      "Higher: condensation",
      "Explain how glycine can form a polypeptide using only one monomer type.",
      "Each glycine molecule has an amino group and a carboxylic acid group. Groups on different molecules join by condensation, forming peptide C–N links and releasing water. Both reactive group types occur in each monomer, so a second monomer type is not required.",
      [
        "Identify amino and carboxylic acid groups in each monomer.",
        "Explain joining between different molecules, with peptide C–N links and water formation.",
        "Distinguish two different functional groups from two different monomer types.",
      ],
      "Inspect the two functional groups on each original molecule.",
    ),
  ],
  [
    draw(
      "h-cb-repeat",
      "Higher: draw a repeat",
      "Draw one bracketed repeat with continuation bonds and n.",
      "peptideUnit",
      "initial",
      "[–NH–CH₂–C(=O)–]ₙ",
      [
        "Retain CH₂ and C=O.",
        "Show NH, omit internal acid OH and join carbonyl C to N.",
        "Show both continuing bonds, brackets and n.",
      ],
    ),
    draw(
      "h-cb-peptide",
      "Higher: build a chain",
      "Form an open chain in the given order. Account for released water.",
      "peptide",
      "mixedThree",
      "NH₂–CH₂–C(=O)–NH–CH(CH₃)–C(=O)–NH–CH₂–C(=O)–OH; two H₂O.",
      [
        "Retain glycine–alanine–glycine order and each original carbon section.",
        "Retain three C=O groups and make two carbonyl C–N junctions.",
        "Retain the outer NH₂ and COOH; two actual junctions release two waters.",
      ],
    ),
    w(
      "h-cb-explain",
      "Higher: chain ends",
      "Five glycines, one open chain: explain its water loss and compare with repeat shorthand.",
      "Five original molecules form four actual joining junctions, releasing four H₂O molecules. The open chain retains NH₂ and COOH at its outer ends. The formal [–NH–CH₂–CO–]ₙ + nH₂O shorthand omits terminal groups; it must not replace junction counting for a finite chain with its ends shown.",
      [
        "Count four junctions and four waters.",
        "Retain NH₂ and COOH at the open ends.",
        "Distinguish the stated finite chain from formal end-omitted repeat shorthand.",
      ],
      "Count the actual junctions before interpreting n.",
    ),
  ],
];
export const naturalHigherReviews: LearningTask[][] = [
  [
    draw(
      "h-ra-repeat",
      "Higher: draw a repeat",
      "Draw one bracketed repeat with continuation bonds and n.",
      "peptideUnit",
      "beta",
      "[–NH–CH₂–CH₂–C(=O)–]ₙ",
      [
        "Retain both CH₂ groups and C=O.",
        "Show NH, omit acid OH and identify C–N joining.",
        "Show both continuing bonds, brackets and n.",
      ],
    ),
    draw(
      "h-ra-peptide",
      "Higher: build a chain",
      "Form an open chain in the given order. Account for released water.",
      "peptide",
      "four",
      "NH₂–CH₂–C(=O)–NH–CH₂–C(=O)–NH–CH₂–C(=O)–NH–CH₂–C(=O)–OH; three H₂O.",
      [
        "Retain all four CH₂ sections and C=O bonds.",
        "Make three peptide C–N junctions and release three waters.",
        "Retain outer NH₂ and COOH groups.",
      ],
    ),
  ],
  [
    draw(
      "h-rb-repeat",
      "Higher: draw a repeat",
      "Draw one bracketed repeat with continuation bonds and n.",
      "peptideUnit",
      "alanine",
      "[–NH–CH(CH₃)–C(=O)–]ₙ",
      [
        "Retain CH(CH₃) and C=O.",
        "Show NH, omit acid OH and identify C–N joining.",
        "Show both continuing bonds, brackets and n.",
      ],
    ),
    draw(
      "h-rb-peptide",
      "Higher: build a chain",
      "Form an open chain in the given order. Account for released water.",
      "peptide",
      "mixed",
      "NH₂–CH₂–C(=O)–NH–CH(CH₃)–C(=O)–OH; one H₂O.",
      [
        "Retain glycine then alanine and both carbonyl groups.",
        "Make one peptide C–N junction, releasing one water.",
        "Retain outer NH₂ and COOH groups.",
      ],
    ),
  ],
];
for (const q of [
  ...naturalHigherChecks.flat(),
  ...naturalHigherReviews.flat(),
]) {
  q.conciseHeading = true;
  q.followUp =
    q.naturalDrawing?.mode === "peptideUnit"
      ? "natural-v1-r-amino-repeat"
      : "natural-v1-r-peptide";
  if (!q.naturalDrawing) q.referenceResponse = q.answer;
}

/** Keep old learning positions and both original common forms; Foundation
 * never rotates into an empty Higher form. Started Higher runs stay readable
 * through savedForms in DetailedLesson when the study preference changes. */
export function naturalForTier(
  journey: LessonJourney,
  tier: Tier,
): LessonJourney {
  if (tier === "higher") return journey;
  const common = (forms: LearningTask[][]) =>
    forms.filter((f) => f.every((q) => q.tier !== "higher"));
  return {
    ...journey,
    checkForms: common(journey.checkForms),
    reviewForms: common(journey.reviewForms),
  };
}
