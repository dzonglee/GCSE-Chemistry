import { test, expect } from "@playwright/test";
import {
  nanoSizePosition,
  readNanoSizeRanges,
} from "../src/lib/nano-size-ranges";
import { nanoSizeAdditions as added } from "../src/content/journeys/nano-size-ranges";
import { nanoparticlesJourney as journey } from "../src/content/journeys/nanoparticles";
import { tasks } from "../src/content/journeys/helpers";
import { questionById } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";

test("diameter intervals use equal decade spacing rather than a linear or physical particle scale", () => {
  expect([1, 10, 100, 1000, 10000].map(nanoSizePosition)).toEqual([
    35, 133.75, 232.5, 331.25, 430,
  ]);
  expect(nanoSizePosition(2500)).toBeCloseTo(35 + Math.log10(2500) * 98.75, 12);
  for (const value of [0, -1, 0.1, 10001, Infinity, NaN])
    expect(nanoSizePosition(value)).toBeNull();
});
test("wrong ranges draw the entered limits and malformed, reversed or off-scale entries never become corrected references", () => {
  expect(readNanoSizeRanges("").every((entry) => !entry.plotted)).toBe(true);
  expect(readNanoSizeRanges("[1,100]").every((entry) => !entry.plotted)).toBe(
    true,
  );
  const wrong = readNanoSizeRanges(
    JSON.stringify({ nanoLower: "10", nanoUpper: "100" }),
  )[0];
  expect(wrong).toMatchObject({
    plotted: true,
    x1: 133.75,
    x2: 232.5,
    lowerRaw: "10",
  });
  for (const [lower, upper] of [
    ["1..2", "100"],
    ["100", "1"],
    ["0", "100"],
    ["1", "100000"],
    ["1", ""],
  ]) {
    const entry = readNanoSizeRanges(
      JSON.stringify({ nanoLower: lower, nanoUpper: upper }),
    )[0];
    expect(entry).toMatchObject({
      lowerRaw: lower,
      upperRaw: upper,
      plotted: false,
    });
  }
});
test("complete range construction requires all six independently specified limits, with shared endpoints preserved", () => {
  const expected = {
    nanoLower: "1",
    nanoUpper: "100",
    fineLower: "100",
    fineUpper: "2500",
    coarseLower: "2500",
    coarseUpper: "10000",
  };
  for (const q of [
    added.guided,
    added.practice[0],
    added.check[0],
    added.review[0],
  ]) {
    expect(JSON.parse(q.answer)).toEqual(expected);
    expect(mark(q, JSON.stringify(expected)).correct).toBe(true);
    expect(
      mark(q, JSON.stringify({ ...expected, coarseLower: "1000" })).correct,
    ).toBe(false);
    const incomplete = { ...expected };
    delete (incomplete as Partial<typeof expected>).fineUpper;
    expect(mark(q, JSON.stringify(incomplete))).toMatchObject({
      correct: false,
      invalid: true,
    });
    expect(q.parts!.every((part) => part.unit === "nm")).toBe(true);
  }
});
test("original transfer quantities convert to internal coarse values and compare lengths, with honest manual marking", () => {
  for (const [q, metres, fine, ratio] of [
    [added.practice[1], 6e-6, 300, 20],
    [added.check[1], 4e-6, 160, 25],
    [added.review[1], 7e-6, 350, 20],
  ] as const) {
    const nm = metres / 1e-9;
    expect(nm).toBeGreaterThan(2500);
    expect(nm).toBeLessThan(10000);
    expect(nm / fine).toBeCloseTo(ratio, 12);
    expect(q.rubric).toHaveLength(3);
    expect(q.answer).toContain("coarse dust");
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
});
test("appended forms preserve prior positions and every new response remains reachable through the course registry", () => {
  expect(tasks(journey)).toHaveLength(71);
  expect(journey.practice[19].id).toBe("np-v1-p-explain");
  expect(journey.practice[20].id).toBe("np-v1-p-evaluate");
  expect(journey.practiceGroups!.at(-1)!.taskIds).toEqual(
    added.practice.map((q) => q.id),
  );
  expect(journey.checkForms.at(-1)).toEqual(added.check);
  expect(journey.reviewForms.at(-1)).toEqual(added.review);
  for (const q of [
    added.refresher,
    added.guided,
    ...added.practice,
    ...added.check,
    ...added.review,
  ])
    expect(questionById(q.id)).toEqual(q);
});
test("only teaching and practice have a range graphic; independent and delayed checks expose no size reference", () => {
  expect(added.guided.nanoSizeRanges).toBe("learn");
  expect(added.practice[0].nanoSizeRanges).toBe("construct");
  for (const q of [...added.check, ...added.review]) {
    expect(q.nanoSizeRanges).toBeUndefined();
    expect(q.model).toBeUndefined();
  }
});
test("raw invalid range drafts survive decoding and existing size help cannot become fresh range evidence", () => {
  const progress = emptyProgress(),
    work = emptyWork();
  work.learning = {
    version: 1,
    stage: "practice",
    index: journey.practice.length - 2,
  };
  work.drafts[added.practice[0].id] = '{"nanoLower":"1..2","nanoUpper":"100"}';
  progress.work["particles-and-nanoparticles"] = work;
  expect(decode(JSON.stringify(progress))).toEqual(progress);
  expect(exposureIds([added.check[0].id])).toContain(added.guided.id);
  expect(exposureIds([added.check[0].id])).toContain("np-v1-p-fine");
  for (const q of [
    added.refresher,
    added.guided,
    ...added.practice,
    ...added.check,
    ...added.review,
  ])
    for (const alias of q.exposureAliases ?? []) {
      expect(exposureIds([q.id])).toContain(alias);
      expect(exposureIds([alias])).toContain(q.id);
    }
});
