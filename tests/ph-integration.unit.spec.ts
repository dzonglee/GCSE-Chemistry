import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("new Foundation pH route preserves Higher acid-strength route and all532 original identities", () => {
  const l = lessons.find((l) => l.slug === "ph-scale-and-indicators")!,
    higher = lessons.find((l) => l.slug === "ph-and-strong-acids")!;
  expect(lessons).toHaveLength(95);
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("acids-and-neutralisation");
  expect(l.questions).toHaveLength(0);
  expect(l.checks).toHaveLength(0);
  expect(higher.tier).toBe("higher");
  expect(higher.questions.length + higher.checks.length).toBe(6);
  const ids = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]),
    ...assessments.flatMap((a) => a.questions),
  ].map((q) => q.id);
  expect(ids).toHaveLength(532);
  expect(new Set(ids).size).toBe(532);
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
  w.taskModels[l.journey!.guided[1].id] = [
    { ...initialBoard(l.journey!.guided[1].model!), guess: "15" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("colour guess and observation histories move one step, retain mistakes and atomically reset every field", () => {
  const l = lessons.find((l) => l.slug === "ph-scale-and-indicators")!;
  for (const [index, field, record] of [
    [1, "guess", "purple"],
    [3, "point", "powder"],
  ] as const) {
    const m = l.journey!.guided[index].model!,
      b = initialBoard(m),
      one = { ...b, [field]: "1" };
    expect(validHistory(m, [b, one])).toBe(true);
    expect(validHistory(m, [b, { ...b, [field]: "2" }])).toBe(false);
    expect(validHistory(m, [b, one, { ...b, record }])).toBe(true);
    expect(validHistory(m, [b, one, { ...one, record }])).toBe(false);
    expect(validHistory(m, [b, one, b])).toBe(true);
  }
});
