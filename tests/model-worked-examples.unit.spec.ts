import { expect, test } from "@playwright/test";
import { diagnostics, papers } from "../src/content/assessments";
import { lessons } from "../src/content/curriculum";
import { extendedPapers } from "../src/content/extended-assessments";
import { fullPapers } from "../src/content/full-assessments";
import { modelWorkedExamples } from "../src/content/model-worked-examples";
import { quantityExamples } from "../src/content/quantity-examples";
import { standaloneWorkedExamples } from "../src/content/standalone-worked-examples";
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

test("each lesson has one worked-example route and standalone scenarios have distinct prompts", () => {
  const normalize = (prompt: string) =>
    prompt
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[\p{P}\s]+/gu, "");
  const reservedPrompts = new Set(
    [
      ...lessons.flatMap(({ checks, journey }) => [
        ...checks,
        ...(journey?.checkForms.flat() ?? []),
        ...(journey?.reviewForms.flat() ?? []),
      ]),
      ...[...diagnostics, ...papers, ...extendedPapers, ...fullPapers].flatMap(
        ({ questions }) => questions,
      ),
    ].map(({ prompt }) => normalize(prompt)),
  );
  const lessonSlugs = new Set(lessons.map(({ slug }) => slug));
  for (const [slug, example] of Object.entries(standaloneWorkedExamples)) {
    expect(lessonSlugs.has(slug), slug).toBe(true);
    expect(
      example?.steps.every((step) => step.trim().length > 0),
      slug,
    ).toBe(true);
    expect(reservedPrompts.has(normalize(example!.prompt)), slug).toBe(false);
  }
  for (const { slug, journey } of lessons) {
    const owners = [
      slug === "inside-an-atom" || slug === "relative-atomic-mass",
      Boolean(quantityExamples[slug]),
      Boolean(standaloneWorkedExamples[slug]) && slug !== "polymers",
      ...(journey?.guided ?? []).map(({ id }) =>
        Boolean(modelWorkedExamples[id]),
      ),
    ];
    expect(owners.filter(Boolean), slug).toHaveLength(1);
  }
});

test("the Foundation polymer route has a worked example away from the Higher model", () => {
  const guided = lessons.find(({ slug }) => slug === "polymers")!.journey!
    .guided;
  expect(guided.find(({ id }) => modelWorkedExamples[id])?.tier).toBe("higher");
  expect(standaloneWorkedExamples.polymers?.steps).toHaveLength(3);
});
