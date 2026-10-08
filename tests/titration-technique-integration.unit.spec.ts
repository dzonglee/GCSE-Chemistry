import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
import { initialTechniqueBoard } from "../src/lib/titration-technique";
const l = lessons.find((l) => l.slug === "titration-practical")!;
test("Foundation separate technique preserves six legacy IDs and serialises valid native records", () => {
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("separate");
  expect(l.prerequisite).toBe("ph-scale-and-indicators");
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "titration-practical-" + i),
  );
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of l.journey!.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[l.journey!.guided[1].id] = [
    { ...initialBoard(l.journey!.guided[1].model!), selected: "missing" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("repeat histories permit one checkbox toggle and atomic record reset while rejecting multiple invented changes", () => {
  const m = l.journey!.guided[1].model!,
    b = initialBoard(m),
    one = { ...b, selected: "a" };
  expect(validHistory(m, [b, one])).toBe(true);
  expect(validHistory(m, [b, { ...b, selected: "a,b" }])).toBe(false);
  expect(validHistory(m, [b, one, { ...one, decision: "no" }])).toBe(true);
  expect(
    validHistory(m, [b, one, initialTechniqueBoard("repeats", "chain")]),
  ).toBe(true);
  expect(validHistory(m, [b, one, { ...one, record: "chain" }])).toBe(false);
});
test("method histories permit adjacent swaps only and record-specific canonical restart", () => {
  const m = l.journey!.guided[4].model!,
    b = initialBoard(m),
    one = { ...b, order: "0,1,2,4,3,5" };
  expect(validHistory(m, [b, one])).toBe(true);
  expect(validHistory(m, [b, { ...b, order: "1,0,2,3,4,5" }])).toBe(true);
  expect(validHistory(m, [b, { ...b, order: "5,0,2,4,3,1" }])).toBe(false);
  expect(
    validHistory(m, [b, one, initialTechniqueBoard("sequence", "compare")]),
  ).toBe(true);
  expect(
    validHistory(m, [
      b,
      one,
      { ...one, record: "compare", order: "0,1,2,3,4" },
    ]),
  ).toBe(false);
});
