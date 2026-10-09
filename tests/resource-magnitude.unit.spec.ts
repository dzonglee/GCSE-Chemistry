import { test, expect } from "@playwright/test";
import baseline from "./fixtures/resource-magnitude-baseline.json";
import { lessons } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { allMagnitudeTasks } from "../src/content/journeys/resource-magnitude";
const j = lessons.find((l) => l.slug === "life-cycle-and-recycling")!.journey!;
test("all89 original resource records, stage positions and four assessment forms survive unchanged", () => {
  expect(j.version).toBe(1);
  const all = tasks(j);
  for (const old of baseline.tasks)
    expect(
      JSON.parse(JSON.stringify(all.find((q) => q.id === old.id))),
    ).toEqual(old);
  for (const [stage, ids] of Object.entries(baseline.stageIds))
    expect(
      j[stage as "practice"].slice(0, ids.length).map((q) => q.id),
    ).toEqual(ids);
  for (const kind of ["checkForms", "reviewForms"] as const)
    expect(j[kind].slice(0, 4).map((f) => f.map((q) => q.id))).toEqual(
      baseline[kind],
    );
});
test("independently rounded source quantities yield factors of ten, rather than differences in units", () => {
  const sources = [
    [4_800_000, 5200],
    [6_100_000, 5800],
    [8_200_000, 79_000],
    [7_200_000, 6800],
    [2_900_000_000, 3100],
    [3_900_000, 420],
    [9_300_000, 87_000],
  ];
  const round = (n: number) => {
    const place = 10 ** Math.floor(Math.log10(n));
    return Math.round(n / place) * place;
  };
  const numeric = allMagnitudeTasks.filter((q) => q.parts);
  expect(numeric).toHaveLength(sources.length);
  numeric.forEach((q, i) => {
    const [large, small] = sources[i].map(round),
      ratio = large / small;
    expect(q.parts!.map((p) => p.answer)).toEqual([
      large,
      small,
      ratio,
      Math.log10(ratio),
    ]);
    expect(mark(q, q.answer).correct).toBe(true);
    expect(
      mark(
        q,
        JSON.stringify({ ...JSON.parse(q.answer), foreign: "retained bytes" }),
      ),
    ).toMatchObject({ correct: false, invalid: true });
    const wrong = JSON.parse(q.answer);
    wrong.orders = String(ratio);
    expect(mark(q, JSON.stringify(wrong)).correct).toBe(false);
    for (const raw of ["{", "[]", '{"larger":5000000}', '{"larger":"1..2"}'])
      expect(mark(q, raw)).toMatchObject({ correct: false, invalid: true });
  });
});
test("resource judgements stay manual and all helped equivalent estimates are exposed conservatively", () => {
  expect(allMagnitudeTasks).toHaveLength(13);
  for (const q of allMagnitudeTasks) {
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(q.exposureAliases!.length).toBeGreaterThanOrEqual(5);
    if (q.rubric) {
      expect(q.referenceResponse).toBe(q.answer);
      expect(mark(q, q.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
      expect(q.answer).toMatch(/stage|lifecycle/);
    }
  }
});
