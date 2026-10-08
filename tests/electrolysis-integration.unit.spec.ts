import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { electrolysisJourney as j } from "../src/content/journeys/electrolysis";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("one old Foundation/shared route preserves all532 identities and canonical native save decoding", () => {
  const l = lessons.find((l) => l.slug === "electrolysis")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("ionic-structures");
  expect(l.questions).toHaveLength(4);
  expect(l.checks).toHaveLength(2);
  const ids = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]),
    ...assessments.flatMap((a) => a.questions),
  ].map((q) => q.id);
  expect(ids).toHaveLength(532);
  expect(new Set(ids).size).toBe(532);
  const p = emptyProgress(),
    work = emptyWork();
  work.taskModels = {};
  for (const q of j.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    work.taskModels[q.id] = [b];
  }
  p.work[l.slug] = work;
  expect(decode(JSON.stringify(p))).toEqual(p);
  work.taskModels[j.guided[0].id] = [
    { ...initialBoard(j.guided[0].model!), position: "4" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("one schematic step and atomic record/position reset are allowed; jumps and stale layouts rejected", () => {
  const model = j.guided[0].model!,
    b = initialBoard(model),
    one = { ...b, position: "-1" },
    two = { ...b, position: "-2" };
  expect(validHistory(model, [b, one, two])).toBe(true);
  expect(validHistory(model, [b, two])).toBe(false);
  expect(validHistory(model, [b, one, b])).toBe(true);
  expect(
    validHistory(model, [
      b,
      one,
      { ...one, record: "reversed", position: "0" },
    ]),
  ).toBe(true);
  expect(
    validHistory(model, [
      b,
      one,
      { ...one, record: "reversed", position: "-1" },
    ]),
  ).toBe(false);
});
