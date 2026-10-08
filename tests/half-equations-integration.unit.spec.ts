import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("Higher route preserves 532 original question IDs and canonical model decoding", () => {
  const l = lessons.find((l) => l.slug === "aqueous-electrolysis")!;
  expect(l.title).toBe("Half equations and redox");
  expect(l.tier).toBe("higher");
  expect(l.prerequisite).toBe("aqueous-electrolysis-products");
  const ids = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]),
    ...assessments.flatMap((a) => a.questions),
  ].map((q) => q.id);
  expect(ids).toHaveLength(532);
  expect(new Set(ids).size).toBe(532);
  expect(l.questions.length + l.checks.length).toBe(6);
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of l.journey!.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[l.journey!.guided[0].id] = [
    { record: "initial", delta: "-2", redox: "reduction" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("charge/coefficient history permits single steps and atomically resets every field on record change", () => {
  const l = lessons.find((l) => l.slug === "aqueous-electrolysis")!;
  for (const index of [0, 1, 2]) {
    const m = l.journey!.guided[index].model!,
      b = initialBoard(m),
      field = index === 0 ? "delta" : "a",
      one = { ...b, [field]: index === 0 ? "-1" : "1" };
    expect(validHistory(m, [b, one])).toBe(true);
    expect(validHistory(m, [b, { ...b, [field]: "2" }])).toBe(false);
    const record = index === 0 ? "iron" : index === 1 ? "aluminium" : "oxide",
      reset = { ...b, record };
    expect(validHistory(m, [b, one, reset])).toBe(true);
    expect(validHistory(m, [b, one, { ...one, record }])).toBe(false);
  }
});
