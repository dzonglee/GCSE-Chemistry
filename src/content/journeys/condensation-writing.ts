import type { LearningTask, LessonJourney, Tier } from "../types";
import type { PolyesterDrawingData } from "../../lib/polyester";

const prefix = "pol-cond-v1-";
function groups(
  id: string,
  title: string,
  diolC: number,
  acidSpacerC: number,
): LearningTask {
  return {
    id: prefix + id,
    title,
    purpose: "Construct the two reactive ends of each supplied monomer",
    tier: "higher",
    prompt: `Diol: ${diolC} CH₂. Diacid: ${acidSpacerC} CH₂ + two carboxyl C. Construct both monomers’ functional groups.`,
    answer: `HO–(CH₂)${diolC}–OH and HO–C(=O)–(CH₂)${acidSpacerC}–C(=O)–OH. Each monomer has two reactive groups.`,
    explanation:
      "Each alcohol end has C–O–H. Each acid end has C=O and C–O–H on the same carboxyl carbon. Two ends allow continued chain growth.",
    hint: "An alcohol group is –OH; an acid group is –C(=O)–OH. Check the bonds at both ends, not just one.",
    rubric: [
      "Both diol ends have single C–O and O–H bonds.",
      "Both diacid ends retain their carboxyl C, a separate double C=O and single C–O–H.",
      "Each supplied monomer has two complete reactive functional groups; no repeat notation on separate monomers.",
    ],
    polyesterDrawing: {
      construction: "groups",
      diolC,
      acidSpacerC,
      note: "Construct both functional groups; the supplied carbon spacers stay fixed.",
    },
  };
}
function repeat(
  id: string,
  title: string,
  diolC: number,
  acidSpacerC: number,
): LearningTask {
  const given = (n: number) => Array.from({ length: n }, () => "CH₂").join("–");
  return {
    id: prefix + id,
    title,
    purpose: "Deduce ester connectivity independently",
    tier: "higher",
    prompt: `Diol: HO–${given(diolC)}–OH. Diacid: HOOC–${given(acidSpacerC)}–COOH. Construct one end-omitted polyester repeat from these monomers.`,
    answer: `[–O–${given(diolC)}–O–C(=O)–${given(acidSpacerC)}–C(=O)–]ₙ, or an equivalent reversed/cyclically shifted repeat.`,
    explanation:
      "Both monomer spacers and both carboxyl carbons remain. Carbonyl O and alcohol O are retained; acid OH and alcohol H form water at each ester link. End-omitted repeat notation shows chain continuation, not terminal OH groups.",
    hint: "Trace each supplied carbon and oxygen through an ester junction. Place boundaries so consecutive repeats join into the same alternating chain.",
    rubric: [
      "Retain the supplied diol and acid spacers, with both additional carboxyl carbons.",
      "Retain two C=O groups and two alcohol-derived linking O atoms; correct ester connectivity, not just matching atom totals.",
      "No terminal OH/H caps inside an endless repeat. Join adjacent repeats by single continuation bonds through both brackets.",
      "Show lower-case n outside lower right. Reversed and cyclically shifted equivalents are valid; check the connection across the boundaries.",
    ],
    polyesterDrawing: {
      construction: "sequence",
      diolC,
      acidSpacerC,
      note: "Assemble your own backbone and oxygen attachments from blank.",
    },
  };
}
function water(id: string, diolC: number, acidSpacerC: number): LearningTask {
  return {
    id: prefix + id,
    title: "Higher: name the small molecule",
    purpose:
      "Give the short by-product response required for the stated reagents",
    tier: "higher",
    prompt: `A diol with ${diolC} spacer carbons reacts with a diacid with ${acidSpacerC} spacer carbons. Give the formula of the small molecule formed at each ester link.`,
    answer: "H2O",
    chemicalFormula: true,
    inputMode: "text",
    explanation:
      "For the specified alcohol/carboxylic-acid groups, acid OH and alcohol H form H₂O. Other supplied condensation reagents can have different by-products.",
    hint: "Account for the fragments lost from these particular functional groups.",
  };
}
export const condensationAdditions = {
  guided: [groups("g-groups", "Higher: build both groups", 2, 2)],
  practice: [
    groups("p-groups", "Higher: build monomers", 3, 2),
    repeat("p-repeat", "Higher: assemble the repeat backbone", 4, 1),
  ],
  checkForms: [
    [
      groups("ca-groups", "Higher: independent functional groups", 2, 3),
      repeat("ca-repeat", "Higher: independent repeat construction", 3, 3),
      water("ca-water", 3, 3),
    ],
    [
      groups("cb-groups", "Higher: independent reactive ends", 4, 2),
      repeat("cb-repeat", "Higher: independent polyester connectivity", 4, 3),
      water("cb-water", 4, 3),
    ],
  ],
  reviewForms: [
    [
      groups(
        "ra-groups",
        "Higher: delayed functional-group construction",
        3,
        1,
      ),
      repeat("ra-repeat", "Higher: delayed repeat construction", 3, 2),
    ],
    [
      groups("rb-groups", "Higher: delayed reactive ends", 2, 4),
      repeat("rb-repeat", "Higher: delayed ester connectivity", 2, 1),
    ],
  ],
};
condensationAdditions.guided[0].polyesterDrawing!.note =
  "An alcohol end has single C–O–H bonds. An acid end has C=O and C–O–H on the same carbon. Build both ends of each monomer so the chain can continue.";
export function extendCondensationWriting(
  j: LessonJourney,
  families: Record<string, string[]>,
  recovery: Record<string, string[]>,
) {
  const oldHigher = [...j.refresher, ...j.guided, ...j.practice].filter((q) =>
    q.title?.startsWith("Higher:"),
  );
  for (const q of oldHigher) q.tier = "higher";
  j.guided.push(...condensationAdditions.guided);
  j.practice.push(...condensationAdditions.practice);
  j.checkForms.push(...condensationAdditions.checkForms);
  j.reviewForms.push(...condensationAdditions.reviewForms);
  j.practiceGroups!.push({
    label: "Higher: construct reactive ends and connectivity",
    taskIds: condensationAdditions.practice.map((q) => q.id),
  });
  const all = [
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ];
  const groupIds = all
    .filter((q) => q.polyesterDrawing?.construction === "groups")
    .map((q) => q.id);
  const repeatIds = all
    .filter((q) => q.polyesterDrawing?.construction === "sequence")
    .map((q) => q.id);
  const waterIds = all
    .filter((q) => q.id.startsWith(prefix) && !q.rubric)
    .map((q) => q.id);
  // Direct equivalence only. Do not turn overlapping families into transitive exposure.
  const aliases = [
    [...families.higherGroups.map((id) => "pol-v1-" + id), ...groupIds],
    [...families.higherRepeat.map((id) => "pol-v1-" + id), ...repeatIds],
    [...families.higherWater.map((id) => "pol-v1-" + id), ...waterIds],
  ];
  for (const family of aliases)
    for (const q of all.filter((q) => family.includes(q.id)))
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...family.filter((id) => id !== q.id),
        ]),
      ];
  for (const q of condensationAdditions.practice) {
    const refs =
      q.polyesterDrawing!.construction === "groups"
        ? [prefix + "g-groups", "pol-v1-r-functional"]
        : ["pol-v1-g-polyester", "pol-v1-r-water"];
    q.followUp = refs[0];
    recovery[q.id] = refs;
  }
  j.scopeNote = j.scopeNote?.replace(
    "Independent checks cover the shared/Foundation addition and structure-change demands; Higher construction/explanation tasks require independent self-review in practice.",
    "Original addition checks cover shared/Foundation structure-change demands. Higher practice uses independent self-review.",
  );
  j.scopeNote +=
    " Higher additions construct both monomers’ functional groups and independently assemble ester connectivity. Higher cold/delayed forms start with these constructions; the original addition forms remain available. Structural work is manually reviewed and never awarded automatic examiner marks.";
}
export function polymerisationForTier(
  journey: LessonJourney,
  tier: Tier,
): LessonJourney {
  if (tier === "higher")
    return {
      ...journey,
      checkForms: [
        ...journey.checkForms.slice(2),
        ...journey.checkForms.slice(0, 2),
      ],
      reviewForms: [
        ...journey.reviewForms.slice(2),
        ...journey.reviewForms.slice(0, 2),
      ],
    };
  const keep = (qs: LearningTask[]) => qs.filter((q) => q.tier !== "higher");
  return {
    ...journey,
    warmup: keep(journey.warmup),
    refresher: keep(journey.refresher),
    guided: keep(journey.guided),
    practice: keep(journey.practice),
    checkForms: journey.checkForms.map(keep).filter((form) => form.length),
    reviewForms: journey.reviewForms.map(keep).filter((form) => form.length),
    practiceGroups: journey.practiceGroups
      ?.map((g) => ({
        ...g,
        taskIds: g.taskIds.filter((id) =>
          keep(journey.practice).some((q) => q.id === id),
        ),
      }))
      .filter((g) => g.taskIds.length),
  };
}
/** Conventional reference, not a machine mark. Independent tests audit literal bonds/atoms. */
export function polyesterReferenceChain(d: PolyesterDrawingData) {
  return [
    { atom: "O" as const, oxygen: "0" as const, hydrogen: "0" as const },
    ...Array.from({ length: d.diolC }, () => ({
      atom: "CH2" as const,
      oxygen: "0" as const,
      hydrogen: "0" as const,
    })),
    { atom: "O" as const, oxygen: "0" as const, hydrogen: "0" as const },
    { atom: "C" as const, oxygen: "2" as const, hydrogen: "0" as const },
    ...Array.from({ length: d.acidSpacerC }, () => ({
      atom: "CH2" as const,
      oxygen: "0" as const,
      hydrogen: "0" as const,
    })),
    { atom: "C" as const, oxygen: "2" as const, hydrogen: "0" as const },
  ];
}
