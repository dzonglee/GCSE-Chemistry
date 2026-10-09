import { test, expect } from "@playwright/test";
import baseline from "./fixtures/natural-higher-baseline.json";
import { lessons } from "../src/content/curriculum";
import { naturalJourney as j } from "../src/content/journeys/natural-journey";
import {
  naturalForTier,
  naturalHigherChecks,
  naturalHigherReviews,
} from "../src/content/journeys/natural-higher-assessments";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  emptyProgress,
  emptyWork,
  decode,
} from "../src/lib/progress";
import { expectedNaturalBoard, readNaturalDrawing } from "../src/lib/natural";
const all = tasks(lessons.find((l) => l.slug === "natural-polymers")!.journey!);
const additions = [
  ...naturalHigherChecks.flat(),
  ...naturalHigherReviews.flat(),
];
test("all102 original definitions, positions and forms survive Higher additions", () => {
  expect(j.version).toBe(1);
  for (const [stage, ids] of Object.entries(baseline.stageIds))
    expect(j[stage as "practice"].map((q) => q.id)).toEqual(ids);
  expect(j.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(j.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.reviewForms,
  );
  for (const old of baseline.tasks) {
    const now = all.find((q) => q.id === old.id)!;
    const { exposureAliases: beforeAliases, ...before } = old;
    const { exposureAliases: afterAliases, ...after } = JSON.parse(
      JSON.stringify(now),
    );
    expect(after, old.id).toEqual(before);
    for (const id of beforeAliases ?? []) expect(afterAliases).toContain(id);
    for (const id of afterAliases ?? [])
      if (!beforeAliases?.includes(id))
        expect(
          id.startsWith("natural-v1-h-") ||
            baseline.tasks.some((q) => q.id === id),
        ).toBe(true);
  }
});
test("Higher forms require blank construction and manual comparison; Foundation retains nonempty common forms", () => {
  expect(additions).toHaveLength(10);
  expect(
    naturalForTier(j, "foundation").checkForms.map((f) => f.map((q) => q.id)),
  ).toEqual(baseline.checkForms);
  expect(
    naturalForTier(j, "foundation").reviewForms.map((f) => f.map((q) => q.id)),
  ).toEqual(baseline.reviewForms);
  expect(naturalForTier(j, "higher")).toBe(j);
  for (const q of additions) {
    expect(q.tier).toBe("higher");
    expect(q.model).toBeUndefined();
    expect(q.options).toBeUndefined();
    expect(q.rubric!.length).toBeGreaterThanOrEqual(3);
    if (q.naturalDrawing) {
      expect(q.naturalGiven).toEqual(q.naturalDrawing);
      expect(readNaturalDrawing("", q.naturalDrawing)?.nitrogen ?? "").toBe("");
      const reference = JSON.stringify(
        expectedNaturalBoard(q.naturalDrawing.mode, q.naturalDrawing.record),
      );
      expect(readNaturalDrawing(reference, q.naturalDrawing)).not.toBeNull();
      expect(mark(q, reference)).toMatchObject({
        correct: false,
        selfReview: true,
      });
      expect(readNaturalDrawing('{"broken":', q.naturalDrawing)).toBeNull();
    } else
      expect(mark(q, q.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
  }
});
test("equivalent taught constructions cannot become fresh through changed monomers or chain length", () => {
  for (const id of ["natural-v1-p-amino-repeat-draw", "natural-v1-h-ca-repeat"])
    for (const q of additions.filter(
      (q) => q.naturalDrawing?.mode === "peptideUnit",
    ))
      expect(exposureIds([id])).toContain(q.id);
  for (const id of ["natural-v1-p-peptide-draw", "natural-v1-p-peptide-three"])
    for (const q of additions.filter(
      (q) => q.naturalDrawing?.mode === "peptide",
    ))
      expect(exposureIds([id])).toContain(q.id);
});
test("malformed Higher raw drafts and common-form history remain decodable", () => {
  const p = emptyProgress(),
    w = emptyWork();
  p.work["natural-polymers"] = w;
  for (const q of additions)
    w.drafts[q.id] = '{"record":"alanine",broken\n1..2';
  expect(decode(JSON.stringify(p))?.work["natural-polymers"].drafts).toEqual(
    w.drafts,
  );
});
