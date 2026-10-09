import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { aqueousProductsJourney as j } from "../src/content/journeys/aqueous-products";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("new Foundation route preserves the existing Higher route, all532 original IDs and canonical save decoding", () => {
  const l = lessons.find((l) => l.slug === "aqueous-electrolysis-products")!,
    higher = lessons.find((l) => l.slug === "aqueous-electrolysis")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("electrolysis");
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
  work.taskModels[j.guided[3].id] = [
    { ...initialBoard(j.guided[3].model!), volume: "11" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("gas marker moves one unit at a time and record changes atomically reset its reading", () => {
  const model = j.guided[3].model!,
    b = initialBoard(model),
    one = { ...b, volume: "1" },
    two = { ...b, volume: "2" };
  expect(validHistory(model, [b, one, two])).toBe(true);
  expect(validHistory(model, [b, two])).toBe(false);
  expect(validHistory(model, [b, one, b])).toBe(true);
  expect(
    validHistory(model, [b, one, { ...one, record: "later", volume: "0" }]),
  ).toBe(true);
  expect(
    validHistory(model, [b, one, { ...one, record: "later", volume: "1" }]),
  ).toBe(false);
  expect(
    validHistory(model, [b, { ...b, record: "offset", volume: "6" }]),
  ).toBe(false);
});

test("inverted reading retains one-division steps and resets atomically for changed observations", () => {
  const model = j.guided[5].model!,
    b = initialBoard(model),
    one = { ...b, ticks: "1" };
  expect(validHistory(model, [b, one])).toBe(true);
  expect(validHistory(model, [b, { ...b, ticks: "2" }])).toBe(false);
  expect(
    validHistory(model, [b, one, { ...one, record: "low", ticks: "0" }]),
  ).toBe(true);
  expect(
    validHistory(model, [b, one, { ...one, record: "low", ticks: "1" }]),
  ).toBe(false);
});
