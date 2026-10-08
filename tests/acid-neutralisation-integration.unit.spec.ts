import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { acidNeutralisationJourney as j } from "../src/content/journeys/acids-and-neutralisation";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("one existing Foundation/shared lesson retains all original identities and canonical saved states", () => {
  const l = lessons.find((l) => l.slug === "acids-and-neutralisation")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("ionic-formulae");
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
  for (const q of j.guided.filter((q) => q.model)) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    work.taskModels[q.id] = [b];
  }
  p.work[l.slug] = work;
  expect(decode(JSON.stringify(p))).toEqual(p);
  work.taskModels[j.guided[0].id] = [
    { ...initialBoard(j.guided[0].model!), steps: "5" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("native pair history admits exactly one consumption and atomic record/pair reset, never arbitrary jumps", () => {
  const model = j.guided[0].model!,
    b = initialBoard(model),
    one = { ...b, steps: "1" },
    two = { ...b, steps: "2" };
  expect(validHistory(model, [b, one, two])).toBe(true);
  expect(validHistory(model, [b, two])).toBe(false);
  expect(validHistory(model, [b, one, b])).toBe(false);
  expect(
    validHistory(model, [
      b,
      one,
      { ...one, record: "alkaliExcess", steps: "0" },
    ]),
  ).toBe(true);
  expect(
    validHistory(model, [
      b,
      one,
      { ...one, record: "alkaliExcess", steps: "2" },
    ]),
  ).toBe(false);
});
