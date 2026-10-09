import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { solubleSaltsJourney as j } from "../src/content/journeys/making-soluble-salts";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("existing Foundation shared lesson retains532 legacy identities and canonical native saves", () => {
  const l = lessons.find((l) => l.slug === "making-soluble-salts")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("acids-and-neutralisation");
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
  const native = j.guided.filter((q) => q.model);
  expect(native).toHaveLength(5);
  for (const q of native) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    work.taskModels[q.id] = [b];
  }
  p.work[l.slug] = work;
  expect(decode(JSON.stringify(p))).toEqual(p);
  work.taskModels[j.guided[1].id] = [
    { ...initialBoard(j.guided[1].model!), stage: "5" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("practical stage advance requires its correct next prediction and never skips or reverses", () => {
  const model = j.guided[1].model!,
    b = initialBoard(model),
    pred = { ...b, next: "filter-excess" },
    one = { ...pred, stage: "1" };
  expect(validHistory(model, [b, pred, one])).toBe(true);
  expect(validHistory(model, [b, { ...b, stage: "1" }])).toBe(false);
  expect(validHistory(model, [b, pred, { ...pred, stage: "2" }])).toBe(false);
  expect(validHistory(model, [b, pred, one, pred])).toBe(false);
  const wrong = { ...b, next: "boil-dry" };
  expect(validHistory(model, [b, wrong, { ...wrong, stage: "1" }])).toBe(false);
});
