import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { metalReactivityJourney as j } from "../src/content/journeys/metal-reactivity";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("Foundation shared metals keeps all original bank identities and strict canonical saved native history", () => {
  const l = lessons.find((l) => l.slug === "metal-reactivity")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("isotopes-and-ions");
  expect(l.questions).toHaveLength(4);
  expect(l.checks).toHaveLength(2);
  const original = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]),
    ...assessments.flatMap((a) => a.questions),
  ].map((q) => q.id);
  expect(original).toHaveLength(532);
  expect(new Set(original).size).toBe(532);
  const data = emptyProgress(),
    work = emptyWork();
  work.taskModels = {};
  for (const q of j.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    work.taskModels[q.id] = [b];
  }
  data.work[l.slug] = work;
  expect(decode(JSON.stringify(data))).toEqual(data);
  work.taskModels[j.guided[0].id] = [
    { ...initialBoard(j.guided[0].model!), record: "invalid" },
  ];
  expect(decode(JSON.stringify(data))).toBeNull();
});

test("series saves only adjacent swaps and atomic record resets, rejecting arbitrary two-field changes", () => {
  const m = j.guided[0].model!,
    first = initialBoard(m),
    moved = { ...first, order: "Mg,Cu,Zn" },
    alkali = { record: "alkali", order: "Li,K,Na" };
  expect(validHistory(m, [first, moved, alkali])).toBe(true);
  expect(validHistory(m, [first, { record: "alkali", order: "K,Na,Li" }])).toBe(
    false,
  );
  expect(validHistory(m, [first, { ...first, order: "Zn,Mg,Cu" }])).toBe(false);
});
