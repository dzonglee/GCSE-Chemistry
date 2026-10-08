import { test, expect } from "@playwright/test";
import { bondEnergyJourney as j } from "../src/content/journeys/bond-energy";
import { lessons } from "../src/content/curriculum";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { initialBoard } from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("50 authored tasks retain Higher/shared scope, prerequisites and original IDs", () => {
  const l = lessons.find((l) => l.slug === "bond-energy")!;
  expect(l.tier).toBe("higher");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("reaction-profiles");
  expect(l.journey).toBe(j);
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "bond-energy-" + i),
  );
  expect(all).toHaveLength(50);
  expect(new Set(all.map((q) => q.id)).size).toBe(50);
  expect(j.practice).toHaveLength(21);
  expect(j.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  for (const q of all) {
    expect(q.purpose).toBeTruthy();
    if (q.followUp)
      expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
});
test("32 numeric responses match independently recomputed counts and signed forward/inverse references", () => {
  const expected: Record<string, number> = {
    "w-difference": -200,
    "r-unknown": 500,
    "g-count": 4,
    "g-ledger": -185,
    "g-inverse": 290,
    "g-cancel": -51,
    "p-water-count": 4,
    "p-ammonia-count": 6,
    "p-methane-oxygen": 2,
    "p-water-input": 1370,
    "p-water-release": 1856,
    "p-water-change": -486,
    "p-ammonia-input": 2253,
    "p-ammonia-change": -93,
    "p-methane-release": 3466,
    "p-methane-change": -818,
    "p-reverse": 185,
    "p-scale": -370,
    "p-per-product": 92.5,
    "p-unknown-twice": 432,
    "p-unknown-four": 464,
    "p-unknown-reactant": 436,
    "a-change": -180,
    "a-count": 2,
    "a-inverse": 440,
    "b-change": -1220,
    "b-count": 12,
    "b-inverse": 440,
    "d-a-change": -175,
    "d-a-inverse": 420,
    "d-b-change": -80,
    "d-b-inverse": 430,
  };
  const numeric = all.filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(32);
  for (const q of numeric) {
    expect(Number(q.answer), q.id).toBe(expected[q.id.replace("bond-v1-", "")]);
    expect(mark(q, q.answer).correct).toBe(true);
    expect(mark(q, String(Number(q.answer) + 1)).correct).toBe(false);
  }
  expect(all.find((q) => q.id === "bond-v1-p-per-product")!.unit).toBe(
    "kJ/mol HCl",
  );
});
test("seven written explanations remain self-reviewed rather than marked correct", () => {
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(7);
  for (const q of written) {
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, q.answer).selfReview).toBe(true);
  }
  expect(all.find((q) => q.id === "bond-v1-p-explain-exo")!.answer).toContain(
    "3466",
  );
});
test("structural stimuli occur in practice and both distinct reserved and delayed forms", () => {
  expect(
    j.practice.filter((q) => q.bondReaction).length,
  ).toBeGreaterThanOrEqual(12);
  expect(j.checkForms[0].some((q) => q.bondReaction)).toBe(true);
  expect(
    j.checkForms[1].find((q) => q.id === "bond-v1-b-change")!.bondReaction,
  ).toBe("ammoniaOxidation");
  expect(j.reviewForms[1].some((q) => q.bondReaction)).toBe(true);
  expect(new Set(j.checkForms.flat().map((q) => q.id)).size).toBe(10);
});
test("valid native count histories decode while impossible multi-unit steps do not", () => {
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  p.work["bond-energy"] = w;
  const q = j.guided[0],
    b = initialBoard(q.model!);
  w.taskModels[q.id] = [b, { ...b, "broken-HH": "1" }];
  expect(decode(JSON.stringify(p))).toEqual(p);
  const switched = initialBoard({
    kind: "bond-energy",
    mode: "count",
    record: "ammoniaOxidation",
    instruction: "",
  });
  w.taskModels[q.id] = [b, { ...b, "broken-HH": "1" }, switched];
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[q.id] = [b, { ...b, "broken-HH": "2" }];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("legacy, equivalent-quantity and repeated-reasoning exposure remains global", () => {
  expect(exposureIds(["bond-energy-0"])).toContain("bond-v1-a-direction");
  expect(exposureIds(["bond-v1-g-count"])).toContain("bond-v1-p-water-count");
  expect(exposureIds(["bond-v1-g-count"])).toContain("bond-v1-b-count");
  expect(exposureIds(["bond-v1-g-ledger"])).toContain(
    "bond-v1-p-unknown-twice",
  );
  expect(exposureIds(["bond-v1-p-scale"])).toContain("bond-v1-b-scale");
  expect(exposureIds(["bond-v1-g-count"])).toContain("bond-v1-b-count");
});
