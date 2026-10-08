import { test, expect } from "@playwright/test";
import { profileJourney as j } from "../src/content/journeys/reaction-profiles";
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
test("50 individual tasks retain shared Foundation scope and all six original IDs", () => {
  const l = lessons.find((l) => l.slug === "reaction-profiles")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("exothermic-and-endothermic");
  expect(l.journey).toBe(j);
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "reaction-profiles-" + i),
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
test("15 numeric answers independently match labelled energy gaps and construction references", () => {
  const expected: Record<string, number> = {
    "w-subtract": 50,
    "r-barrier": 50,
    "g-read": 50,
    "p-activation": 65,
    "p-signed": -40,
    "p-release": 40,
    "p-endo": 45,
    "p-build-peak": 95,
    "p-build-products": 45,
    "p-offset": 50,
    "p-graph": 35,
    "a-graph": 75,
    "b-signed": -45,
    "d-a-peak": 120,
    "d-b-release": 55,
  };
  const numeric = all.filter(
    (q) => !q.options && !q.rubric && !q.profileDrawing,
  );
  expect(numeric).toHaveLength(15);
  for (const q of numeric) {
    expect(Number(q.answer), q.id).toBe(
      expected[q.id.replace("profile-v1-", "")],
    );
    expect(mark(q, q.answer).correct).toBe(true);
  }
});
test("four independent drawing answers jointly mark levels, curved maximum and both arrows without autograding seven explanations", () => {
  const drawings = all.filter((q) => q.profileDrawing);
  expect(drawings).toHaveLength(4);
  for (const q of drawings) {
    expect(mark(q, q.answer).correct).toBe(true);
    const b = JSON.parse(q.answer);
    expect(mark(q, JSON.stringify({ ...b, peak: "0" })).correct).toBe(false);
    expect(
      mark(q, JSON.stringify({ ...b, activationArrow: "products-peak" }))
        .correct,
    ).toBe(false);
    expect(mark(q, JSON.stringify({ ...b, peak: "" })).invalid).toBe(true);
  }
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(7);
  for (const q of written) {
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, q.answer).selfReview).toBe(true);
  }
});
test("five supplied diagram stimuli independently imply the correct signed, magnitude or activation quantity", () => {
  const diagrams = all.filter((q) => q.reactionProfile);
  expect(diagrams).toHaveLength(5);
  for (const q of diagrams) {
    const d = q.reactionProfile!;
    expect(d.peak).toBeGreaterThan(Math.max(d.reactant, d.product));
    const expected = q.prompt.includes("activation")
      ? d.peak - d.reactant
      : q.prompt.includes("POSITIVE SIZE")
        ? d.reactant - d.product
        : d.product - d.reactant;
    expect(Number(q.answer), q.id).toBe(expected);
  }
});
test("task-matched histories survive decoding and invented two-step counter jumps do not", () => {
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of j.guided) w.taskModels[q.id] = [initialBoard(q.model!)];
  p.work["reaction-profiles"] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  const q = j.guided[0],
    b = initialBoard(q.model!);
  w.taskModels[q.id] = [b, { ...b, reactant: "10" }];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("legacy definitions, equivalent release calculations and repeated explanations share global exposure", () => {
  expect(exposureIds(["reaction-profiles-3"])).toContain(
    "profile-v1-b-definition",
  );
  expect(exposureIds(["profile-v1-p-signed"])).toContain(
    "profile-v1-p-release",
  );
  expect(exposureIds(["profile-v1-r-catalyst"])).toContain(
    "profile-v1-b-explain",
  );
  expect(exposureIds(["profile-v1-r-axis"])).toContain("profile-v1-a-axis");
});
