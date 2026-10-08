import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { oxygenRedoxJourney as j } from "../src/content/journeys/oxygen-redox";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("Foundation oxygen redox keeps all original bank identities and strict canonical saved native history", () => {
  const l = lessons.find((l) => l.slug === "oxidation-and-reduction")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("balancing-equations");
  expect(l.questions).toHaveLength(0);
  expect(l.checks).toHaveLength(0);
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

test("oxygen counter saves only one-atom operations while record changes retain predictions", () => {
  const m = j.guided[0].model!,
    first = initialBoard(m),
    one = { ...first, oxygen: "1" },
    two = { ...first, oxygen: "2" };
  expect(validHistory(m, [first, one, two])).toBe(true);
  expect(validHistory(m, [first, two])).toBe(false);
  expect(validHistory(m, [first, one, { ...one, record: "aluminium" }])).toBe(
    true,
  );
});
