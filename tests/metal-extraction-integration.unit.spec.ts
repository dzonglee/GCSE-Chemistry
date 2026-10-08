import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { metalExtractionJourney as j } from "../src/content/journeys/metal-extraction";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("one Foundation extraction route preserves original banks and canonical native saved state", () => {
  const l = lessons.find((l) => l.slug === "metal-extraction")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.topic).toBe("chemical-changes");
  expect(l.prerequisite).toBe("oxidation-and-reduction");
  expect(l.questions).toHaveLength(0);
  expect(l.checks).toHaveLength(0);
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
    { ...initialBoard(j.guided[0].model!), record: "invented" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("saved selections allow one field at a time, retaining predictions across record changes", () => {
  const model = j.guided[0].model!,
    b = initialBoard(model),
    next = { ...b, route: "carbon-reduction" };
  expect(validHistory(model, [b, next])).toBe(true);
  expect(
    validHistory(model, [b, { ...next, reason: "carbon-more-reactive" }]),
  ).toBe(false);
  expect(validHistory(model, [b, next, { ...next, record: "aluminium" }])).toBe(
    true,
  );
});
