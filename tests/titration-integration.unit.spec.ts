import { test, expect } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { titrationCalculationsJourney as j } from "../src/content/journeys/titration-calculations";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("Higher separate titration keeps all original bank identities and strict canonical saved native history", () => {
  const l = lessons.find((l) => l.slug === "titration-calculations")!;
  expect(l.tier).toBe("higher");
  expect(l.course).toBe("separate");
  expect(l.prerequisite).toBe("molar-concentration");
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
    { ...initialBoard(j.guided[0].model!), titre: 20 },
  ];
  expect(decode(JSON.stringify(data))).toBeNull();
});
