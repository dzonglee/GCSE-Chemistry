import { test, expect } from "@playwright/test";
import {
  allHaberTasks as all,
  haberJourney as j,
  haberForTier,
} from "../src/content/journeys/haber-and-fertilisers";
import {
  haberRecords as R,
  haberFields,
  haberChoices,
  haberNumeric,
  initialHaber,
  validHaber,
  validHaberHistory,
  checkHaber,
  haberNumber,
} from "../src/lib/haber";
import {
  emptyHaberDrawing,
  readHaberDrawing,
  haberDrawingPoints,
  smoothHaberPath,
} from "../src/lib/haber-drawing";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { mark, readNumber } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
test("one mixed-tier separate Chemistry journey covers each process and every recovery", () => {
  const l = lessons.find((l) => l.slug === "haber-and-fertilisers")!;
  expect(l.journey).toBe(j);
  expect(l.course).toBe("separate");
  expect(l.tier).toBe("foundation");
  expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
  expect(Object.keys(haberFields)).toHaveLength(8);
  expect(Object.keys(R)).toHaveLength(19);
  for (const q of j.practice)
    expect(
      j.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const [id, r] of Object.entries(R))
    expect(
      j.refresher.some(
        (q) =>
          q.model?.kind === "haber-investigation" &&
          q.model.mode === r.mode &&
          q.model.record === id,
      ),
      id,
    ).toBe(true);
  for (const q of [
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ])
    expect(q.model).toBeUndefined();
  const f = haberForTier("foundation");
  expect(
    [
      ...f.warmup,
      ...f.refresher,
      ...f.guided,
      ...f.practice,
      ...f.checkForms.flat(),
      ...f.reviewForms.flat(),
    ].some((q) => q.tier === "higher"),
  ).toBe(false);
  expect(f.checkForms.map((f) => f.length)).toEqual([7, 7]);
  expect(j.checkForms.map((f) => f.length)).toEqual([11, 11]);
  expect(f.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  expect(j.practice).toHaveLength(33);
});
test("immutable scientific sources and bounded one-field raw histories", () => {
  const original = JSON.stringify(R);
  for (const [record, r] of Object.entries(R)) {
    const model = {
        kind: "haber-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialHaber(r.mode, record)];
    expect(initialBoard(model)).toEqual(h[0]);
    expect(checkBoard(model, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(model, h)).toBe(true);
    expect(checkBoard(model, h.at(-1)!).correct, record).toBe(true);
    for (const f of haberFields[r.mode]) {
      const b = {
        ...h.at(-1)!,
        [f]: haberNumeric.includes(f)
          ? "999"
          : haberChoices[f].find((v) => v !== r.expected[f])!,
      };
      expect(validBoard(model, b)).toBe(true);
      expect(checkBoard(model, b).correct).toBe(false);
      expect(checkBoard(model, b).feedback).toContain(
        "entries remain as typed",
      );
    }
  }
  expect(JSON.stringify(R)).toBe(original);
});
test("malformed numeric entries remain raw; foreign, non-plain and forged states rejected", () => {
  const b = initialHaber("feed", "feed2");
  for (const raw of ["1..2", "1e3", "5 mol", "abc", " 6"]) {
    const v = { ...b, hydrogenAmount: raw };
    expect(validHaber("feed", v, "feed2")).toBe(true);
    expect(validHaberHistory("feed", "feed2", [b, v])).toBe(true);
    expect(haberNumber(raw)).toBeNull();
    expect(checkHaber("feed", v).correct).toBe(false);
    expect(v.hydrogenAmount).toBe(raw);
  }
  for (const v of [
    { ...b, record: "feed5" },
    { ...b, record: "__proto__" },
    { ...b, extra: "" },
    { ...b, hydrogenAmount: 6 },
    [b],
    Object.create(null),
  ])
    expect(validHaber("feed", v, "feed2")).toBe(false);
  for (const h of [
    [b, b],
    [{ ...b, hydrogenAmount: "6" }],
    [b, { ...b, hydrogenAmount: "6", ammoniaAmount: "4" }],
    [],
  ])
    expect(validHaberHistory("feed", "feed2", h)).toBe(false);
});
test("independently calculated scalar references and conservation accounts", () => {
  const scalars: Record<string, number> = {
    "w-percent": 3,
    "r-application": 0.03,
    "r-nitrogenPercent": 35,
    "r-nutrientRate": 3.6,
    "p-application": 0.03,
    "p-nutrientRate": 6,
    "p-nitrogenPercent": (28 / 132) * 100,
    "p-interpolate": 26,
    "p-total": 26,
    "cB-rate": 0.02,
    "vB-application": 0.02,
  };
  for (const [s, ref] of Object.entries(scalars)) {
    const q = all.find((q) => q.id === "haber-v1-" + s)!;
    expect(Number(q.answer)).toBeCloseTo(ref, 8);
    expect(mark(q, q.answer).correct).toBe(true);
    expect(mark(q, "999").correct).toBe(false);
  }
  const constructs: Record<string, number[]> = {
    "r-pass": [3, 9, 2],
    "r-bars": [10, 4, 12],
    "p-bars": [14, 6, 18],
    "cB-bars": [12, 7, 16],
    "r-plot": [10, 18, 24],
    "p-feed": [21, 14],
    "p-pass": [7, 21, 6],
    "p-masses": [5.4, 1.8, 3.6, 19.2],
    "p-plot": [8, 15, 21],
    "cA-pass": [6, 18, 4],
    "cA-mix": [4, 2, 6, 28],
    "cA-plot": [9, 17, 23],
    "cB-feed": [18, 12],
    "cB-plot": [11, 20, 27],
    "vA-mix": [5, 1, 2, 17],
  };
  for (const [s, refs] of Object.entries(constructs)) {
    const q = all.find((q) => q.id === "haber-v1-" + s)!;
    expect(q.parts!.map((p) => p.answer)).toEqual(refs);
    expect(mark(q, q.answer).correct).toBe(true);
    const b = JSON.parse(q.answer);
    b[q.parts![0].id] = "999";
    expect(mark(q, JSON.stringify(b)).correct).toBe(false);
  }
  expect((18 * 250) / 150000).toBe(0.03);
  expect(0.04 * 0.15 * 1000).toBe(6);
  expect((28 / 80) * 100).toBe(35);
  expect(
    mark(
      all.find((q) => q.id === "haber-v1-p-nitrogenPercent")!,
      "21.2",
    ).correct,
  ).toBe(true);
  expect(2 * 7 + 6).toBe(20);
  expect(2 * 21 + 3 * 6).toBe(60);
});
test("chemical rate, equilibrium and phosphate products are not conflated", () => {
  expect(R.hot.expected).toEqual({
    rate: "faster",
    yield: "lower",
    reason: "exo",
  });
  expect(R.cold.expected).toEqual({
    rate: "slower",
    yield: "higher",
    reason: "exo",
  });
  expect(R.pressure.expected).toEqual({
    rate: "faster",
    yield: "higher",
    reason: "fewer",
  });
  expect(R.catalyst.expected).toEqual({
    rate: "faster",
    yield: "same",
    reason: "activation",
  });
  expect(R.sulfuricRock.feedback).toContain("Ca(H₂PO₄)₂");
  expect(R.sulfuricRock.feedback).toContain("CaSO₄");
  expect(R.phosphoricRock.expected.product).toBe("triple");
  expect(R.nitricRock.feedback).toContain("phosphoric acid");
  expect(R.nitrateSalt.expected.formula).toBe("fNitrate");
  expect(R.sulfateSalt.expected.formula).toBe("fSulfate");
});
test("every assessment answer remains honest and theoretical exposures are reciprocal", () => {
  const candidates = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...(l.journey
      ? [
          ...l.journey.warmup,
          ...l.journey.refresher,
          ...l.journey.guided,
          ...l.journey.practice,
          ...l.journey.checkForms.flat(),
          ...l.journey.reviewForms.flat(),
        ]
      : []),
  ]);
  for (const q of all) {
    const result = mark(q, q.answer);
    expect(q.rubric ? result.selfReview : result.correct, q.id).toBe(true);
    if (q.rubric) expect(result.correct).toBe(false);
    for (const a of q.exposureAliases ?? []) {
      const other = candidates.find((c) => c.id === a);
      expect(other, q.id + " " + a).toBeTruthy();
      expect(other!.exposureAliases).toContain(q.id);
    }
  }
  for (const s of [
    "p-feed",
    "p-pass",
    "p-masses",
    "cA-pass",
    "cA-mix",
    "cB-feed",
    "vA-mix",
  ])
    expect(
      all.find((q) => q.id === "haber-v1-" + s)!.exposureAliases ?? [],
    ).toHaveLength(0);
});
test("manual graph supports raw work, selectable scales and a separate bounded smooth curve", () => {
  const q = all.find((q) => q.id === "haber-v1-p-freeGraph")!;
  expect(mark(q, q.answer)).toMatchObject({ correct: false, selfReview: true });
  expect(mark(q, JSON.stringify(emptyHaberDrawing())).empty).toBe(true);
  expect(mark(q, '{"unknown":"x"}').invalid).toBe(true);
  const b = JSON.parse(q.answer);
  b.p0y = "1..2";
  const raw = JSON.stringify(b);
  expect(readHaberDrawing(raw)!.p0y).toBe("1..2");
  expect(haberDrawingPoints(b, 500, 50)).toHaveLength(6);
  b.p0y = "7e0";
  expect(haberDrawingPoints(b, 500, 50)[0].y).toBe(7);
  expect(readNumber("7/2")).toBe(3.5);
  const path = smoothHaberPath([
    [60, 220],
    [120, 180],
    [180, 150],
    [240, 120],
    [300, 90],
    [360, 70],
    [400, 60],
  ]);
  expect(path).toContain("Q");
  expect(path).toContain("T400 60");
  expect(path).not.toMatch(/NaN|Infinity/);
});
