import { expect, test } from "@playwright/test";
import { diagnostics, papers } from "../src/content/assessments";
import { lessons } from "../src/content/curriculum";
import { extendedPapers } from "../src/content/extended-assessments";
import { fullPapers } from "../src/content/full-assessments";
import { modelWorkedExamples } from "../src/content/model-worked-examples";
import { exposureIds } from "../src/lib/progress";

test("worked model cases have complete formative steps and no reserved assessment exposure links", () => {
  const journeys = lessons.flatMap(({ journey }) => (journey ? [journey] : []));
  const guided = new Map(
    journeys.flatMap(({ guided }) => guided.map((task) => [task.id, task])),
  );
  const reserved = new Set([
    ...lessons.flatMap(({ checks }) => checks.map(({ id }) => id)),
    ...journeys.flatMap(({ checkForms, reviewForms }) =>
      [...checkForms.flat(), ...reviewForms.flat()].map(({ id }) => id),
    ),
    ...[...diagnostics, ...papers, ...extendedPapers, ...fullPapers].flatMap(
      ({ questions }) => questions.map(({ id }) => id),
    ),
  ]);

  for (const [id, steps] of Object.entries(modelWorkedExamples)) {
    const task = guided.get(id);
    expect(task?.model, id).toBeDefined();
    expect(task?.rubric, id).toBeUndefined();
    expect(
      steps?.every((step) => step.trim().length > 0),
      id,
    ).toBe(true);
    expect(task?.explanation.trim(), id).toBeTruthy();
    expect(
      exposureIds([id]).filter((alias) => reserved.has(alias)),
      id,
    ).toEqual([]);
  }
});
