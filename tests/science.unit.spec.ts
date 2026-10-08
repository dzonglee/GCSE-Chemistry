import { test, expect } from "@playwright/test";
import { readNumber, mark } from "../src/lib/marking";
import {
  atomCounts,
  waterBalance,
  profile,
  organicHydrogen,
  shift,
  rf,
} from "../src/lib/science";
import { lessons, topics } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import {
  decode,
  emptyProgress,
  emptyWork,
  REVIEW_DELAY,
  dueReview,
} from "../src/lib/progress";
test("atom identity, isotope and charge stay distinct", () => {
  expect(atomCounts(8, 10, 8)).toEqual({
    atomicNumber: 8,
    massNumber: 18,
    charge: 0,
    shells: [2, 6],
  });
  expect(atomCounts(8, 8, 10).charge).toBe(-2);
  expect(atomCounts(20, 20, 20).shells).toEqual([2, 8, 8, 2]);
});
test("water balancing conserves both elements and enforces smallest ratio", () => {
  expect(waterBalance(2, 1, 2)).toMatchObject({
    balanced: true,
    minimal: true,
  });
  expect(waterBalance(4, 2, 4)).toMatchObject({
    balanced: true,
    minimal: false,
  });
  expect(waterBalance(1, 1, 1).balanced).toBe(false);
});
test("catalyst lowers valid barriers without changing thermodynamics", () => {
  const initial = profile(60, 30, 50, false),
    catalysed = profile(60, 30, 50, true);
  expect(initial.change).toBe(-30);
  expect(catalysed.change).toBe(-30);
  expect(catalysed.activation).toBeLessThan(initial.activation);
  for (const react of [10, 60, 90])
    for (const product of [10, 60, 90])
      for (const c of [false, true]) {
        const p = profile(react, product, 20, c);
        expect(p.peak).toBeGreaterThan(Math.max(react, product));
      }
});
test("organic representative formulae distinguish saturation and functional groups", () => {
  expect(organicHydrogen(2, "alkane")).toBe(6);
  expect(organicHydrogen(2, "alkene")).toBe(4);
  expect(organicHydrogen(2, "alcohol")).toBe(6);
  expect(organicHydrogen(2, "acid")).toBe(4);
});
test("Haber direction depends on condition, not an invented combined numerical law", () => {
  expect(shift("high", "same", "same")).toBe("products");
  expect(shift("same", "high", "same")).toBe("reactants");
  expect(shift("same", "same", "add")).toBe("products");
  expect(shift("high", "high", "same")).toBe("multiple");
});
test("Rf is dimensionless and bounded by the solvent front", () => {
  expect(rf(3, 6)).toBe(0.5);
  expect(rf(0, 6)).toBe(0);
  expect(rf(7, 6)).toBeNull();
  expect(rf(2, 0)).toBeNull();
});
test("numeric parsing accepts signed, fractional and scientific forms but not unsafe syntax", () => {
  for (const s of ["0.5", "1/2", "5e-1"]) expect(readNumber(s)).toBe(0.5);
  expect(readNumber("−2")).toBe(-2);
  for (const s of [
    "",
    "1/0",
    "Infinity",
    "NaN",
    "2 mol",
    "0.5abc",
    "1+2",
    "1;alert(1)",
    "1e999",
  ])
    expect(readNumber(s), s).toBeNull();
});
test("marking rejects missing, malformed and wrong answers with actionable feedback", () => {
  const q = lessons.find((l) => l.slug === "moles-and-reacting-masses")!
    .questions[1];
  expect(mark(q, "1/2").correct).toBe(true);
  expect(mark(q, "0.5mol").correct).toBe(false);
  expect(mark(q, "9").correct).toBe(false);
  expect(mark(q, "").empty).toBe(true);
});
test("authored numerical examples agree with independent chemistry calculations", () => {
  const answer = (slug: string, index: number) =>
    Number(lessons.find((l) => l.slug === slug)!.questions[index].answer);
  expect(answer("formulae-and-mass", 3)).toBe(24 + 2 * 35.5);
  expect(answer("conservation-and-concentration", 2)).toBe(10 / 0.5);
  expect(answer("titration-calculations", 0)).toBe((0.2 * 25) / 1000);
  expect(answer("bond-energy", 1)).toBe(600 - 800);
  expect(answer("titration-practical", 2)).toBeCloseTo(23.6 - 1.2);
});
test("curriculum routes, question ids and answer choices are complete and unique", () => {
  expect(lessons.length).toBe(95);
  expect(topics.length).toBe(10);
  const ids: string[] = [];
  for (const l of lessons) {
    expect(topics.some((t) => t.slug === l.topic)).toBe(true);
    if (
      [
        "atomic-models",
        "atomic-scale",
        "relative-atomic-mass",
        "periodic-development",
        "group-seven",
        "group-zero",
        "ionic-structures",
        "ionic-formulae",
        "small-molecules-properties",
        "graphite",
        "graphene",
        "fullerenes",
        "carbon-nanotubes",
        "polymer-structures",
        "states-of-matter",
        "percentage-composition",
        "conservation-of-mass",
        "measurement-uncertainty",
        "changing-concentration",
        "reacting-masses",
        "balancing-from-masses",
        "limiting-reactants",
        "atom-economy",
        "theoretical-yield",
        "production-pathways",
        "molar-concentration",
        "oxidation-and-reduction",
        "metal-extraction",
        "aqueous-electrolysis-products",
        "ph-scale-and-indicators",
        "fuel-cell-half-equations",
        "interpreting-cell-voltages",
        "rates-from-tangents",
      ].includes(l.slug)
    ) {
      expect(l.journey?.guided.length).toBeGreaterThan(0);
      expect(l.journey?.practice.length).toBeGreaterThan(0);
      expect(l.journey?.checkForms.length).toBeGreaterThan(0);
      expect(l.questions).toHaveLength(0);
      expect(l.checks).toHaveLength(0);
    } else {
      expect(l.questions).toHaveLength(4);
      expect(l.checks).toHaveLength(2);
    }
    for (const q of [...l.questions, ...l.checks]) {
      ids.push(q.id);
      expect(q.prompt.trim()).not.toBe("");
      expect(q.explanation.trim()).not.toBe("");
      if (q.options) {
        expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
        expect(new Set(q.options).size).toBe(q.options.length);
      } else expect(readNumber(q.answer)).not.toBeNull();
    }
  }
  for (const a of assessments) {
    expect(a.topics.length).toBe(a.questions.length);
    for (const q of a.questions) {
      ids.push(q.id);
      expect(mark(q, q.answer).correct).toBe(true);
    }
  }
  expect(new Set(ids).size).toBe(ids.length);
  expect(new Set(lessons.map((l) => l.slug)).size).toBe(lessons.length);
});
test("every topic has teaching and separate reserved diagnostic questions", () => {
  for (const topic of topics) {
    expect(
      lessons.filter((l) => l.topic === topic.slug).length,
    ).toBeGreaterThanOrEqual(5);
    for (const diagnostic of assessments.filter((a) => a.kind === "diagnostic"))
      expect(diagnostic.topics.filter((s) => s === topic.slug)).toHaveLength(2);
  }
});
test("progress decoder rejects corrupt envelopes, invalid responses and future versions", () => {
  expect(decode(null)).toEqual(emptyProgress());
  for (const raw of [
    "no JSON",
    '{"version":2}',
    JSON.stringify({ ...emptyProgress(), revision: -1 }),
    JSON.stringify({ ...emptyProgress(), seen: { bad: -1 } }),
    JSON.stringify({
      ...emptyProgress(),
      work: { bad: { ...emptyWork(), attempts: { q: [{ answer: 2 }] } } },
    }),
  ])
    expect(decode(raw)).toBeNull();
  expect(decode(JSON.stringify(emptyProgress()))).toEqual(emptyProgress());
});
test("review due date uses real elapsed time and remains due through an active review", () => {
  const w = {
    ...emptyWork(),
    history: [
      {
        kind: "check" as const,
        ids: ["q"],
        index: 0,
        responses: {},
        started: 100,
        submitted: 1000,
      },
    ],
  };
  expect(dueReview(w, 1000 + REVIEW_DELAY - 1)).toBe(false);
  expect(dueReview(w, 1000 + REVIEW_DELAY)).toBe(true);
  expect(
    dueReview(
      {
        ...w,
        run: {
          kind: "review",
          ids: ["q"],
          index: 0,
          responses: {},
          started: 1000 + REVIEW_DELAY,
        },
      },
      1000 + REVIEW_DELAY,
    ),
  ).toBe(true);
});
test("invalid saved model states and incomplete submitted runs are preserved as unreadable", () => {
  const base = emptyProgress();
  expect(
    decode(
      JSON.stringify({
        ...base,
        work: {
          electrolysis: {
            ...emptyWork(),
            model: { substance: "unknown-salt" },
          },
        },
      }),
    ),
  ).toBeNull();
  expect(
    decode(
      JSON.stringify({
        ...base,
        work: { "inside-an-atom": { ...emptyWork(), model: { p: -8 } } },
      }),
    ),
  ).toBeNull();
  expect(
    decode(
      JSON.stringify({
        ...base,
        work: {
          "inside-an-atom": {
            ...emptyWork(),
            history: [
              {
                kind: "check",
                ids: ["q"],
                index: 0,
                responses: {},
                started: 100,
                submitted: 200,
              },
            ],
          },
        },
      }),
    ),
  ).toBeNull();
});
test("overview uses diagnostic responses without implying grade or prerequisite mastery", async () => {
  const { nextStep } = await import("../src/lib/overview");
  const p = emptyProgress();
  const d = assessments.find((a) => a.slug === "foundation")!;
  p.work["assessment-foundation"] = {
    ...emptyWork(),
    run: {
      kind: "diagnostic",
      ids: d.questions.map((q) => q.id),
      index: 0,
      started: 1,
      submitted: 2,
      responses: Object.fromEntries(
        d.questions.map((q, i) => [
          q.id,
          {
            answer: i < 2 ? "0" : q.answer,
            correct: i >= 2,
            helped: false,
            fresh: true,
            at: 1,
          },
        ]),
      ),
    },
  };
  expect(nextStep(p, 2).href).toBe("/topics/atomic-structure");
  expect(nextStep(p, 2).reason).toContain("0 of 2");
  expect(nextStep(p, 2).reason).toContain("not a grade");
  p.work["inside-an-atom"] = { ...emptyWork(), updated: 3 };
  expect(nextStep(p, 3).href).toBe("/lessons/inside-an-atom");
});
