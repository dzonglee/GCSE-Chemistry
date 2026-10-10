import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import baseline from "./fixtures/energy-equation-baseline.json";
import editorialAmendments from "./fixtures/energy-editorial-amendments.json";
import { practicalJourney as j } from "../src/content/journeys/energy-practical";
import {
  energyEquationGuided as g,
  energyEquationRecovery as r,
  energyEquationPractice as p,
  energyEquationCases,
  energyEquationCheckForms,
  energyEquationReviewForms,
} from "../src/content/journeys/energy-linear-equation";
import { practicalRecords } from "../src/lib/energy-practical";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";

test("all 59 original energy tasks retain archived hashes apart from explicit editorial amendments", () => {
  const all = [
    ...j.warmup,
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ];
  expect(Object.keys(baseline.tasks)).toHaveLength(59);
  // Keep the archived hashes intact. Permit only the independently verified
  // field amendments from the individual editorial review, then compare every
  // other field against the original SHA256.
  const amendments: Record<
    string,
    Record<string, { before: unknown; after: unknown }>
  > = editorialAmendments;
  for (const [id, hash] of Object.entries(baseline.tasks)) {
    const q: Record<string, unknown> = JSON.parse(
      JSON.stringify(all.find((q) => q.id === id)),
    );
    for (const [field, change] of Object.entries(amendments[id] ?? {})) {
      expect(q[field], `${id}/${field}`).toEqual(change.after);
      if (change.before === null) delete q[field];
      else q[field] = change.before;
    }
    expect(
      createHash("sha256").update(JSON.stringify(q)).digest("hex"),
      id,
    ).toBe(hash);
  }
  for (const stage of ["warmup", "refresher", "guided", "practice"] as const)
    expect(
      j[stage].slice(0, baseline.stages[stage].length).map((q) => q.id),
    ).toEqual(baseline.stages[stage]);
  expect(j.checkForms.slice(0, 2).map((form) => form.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(
    j.reviewForms.slice(0, 2).map((form) => form.map((q) => q.id)),
  ).toEqual(baseline.reviewForms);
  expect(j.version).toBe(1);
});

test("the equation bridge agrees with every supplied point of the existing decimal fit", () => {
  const record = practicalRecords.graph.decimal;
  expect(record.slope).toBe(1.5);
  expect(record.intercept).toBe(21.2);
  for (const [x, y] of record.points) expect(1.5 * x + 21.2).toBeCloseTo(y, 10);
  expect(g.explanation).toContain("constant gradient");
  expect(g.explanation).toContain("m means gradient, not mass");
  expect(mark(g, g.answer).correct).toBe(true);
  for (const wrong of g.options!.filter((value) => value !== g.answer))
    expect(mark(g, wrong).correct).toBe(false);
});

test("negative linear coefficients require both values and retain malformed numeric strings", () => {
  expect(p.parts!.map((part) => part.answer)).toEqual([-0.4, 23.8]);
  expect(mark(p, p.answer).correct).toBe(true);
  for (const raw of [
    '{"m":"0.4","c":"23.8"}',
    '{"m":"1..2","c":"23.8"}',
    '{"m":"-0.4","c":""}',
  ])
    expect(mark(p, raw).correct).toBe(false);
  const data = emptyProgress(),
    w = emptyWork();
  w.drafts[p.id] = '{"m":"1..2","c":"23.8"}';
  w.learning = { version: 1, stage: "practice", index: 24 };
  data.work["energy-practical"] = w;
  expect(decode(JSON.stringify(data))!.work["energy-practical"]).toEqual(w);
  expect(23.8 + -0.4 * 5).toBe(21.8);
});

test("helped equivalent teaching shares exposure without exposing the new coefficient values", () => {
  expect(exposureIds([g.id])).toContain(r.id);
  expect(exposureIds([r.id])).toContain(g.id);
  expect(exposureIds([g.id])).not.toContain(p.id);
  expect(p.followUp).toBe(r.id);
  expect(p.model).toBeUndefined();
  expect(p.rubric).toBeUndefined(); // Only the short numeric coefficient response is checked; graph/written work stays manual.
});

test("new reserved equations preserve signed coefficients and predictions within a stated fitted range", () => {
  const forms = [...energyEquationCheckForms, ...energyEquationReviewForms];
  expect(forms.map((form) => form.length)).toEqual([2, 2, 2, 2]);
  for (const [index, data] of energyEquationCases.entries()) {
    const [coefficients, prediction] = forms[index];
    expect(coefficients.parts!.map((part) => part.answer)).toEqual([
      data.m,
      data.c,
    ]);
    expect(data.m * data.x + data.c).toBeCloseTo(data.y, 10);
    expect(Number(prediction.answer)).toBe([23, 22.7, 26.9, 21.9][index]);
    expect(data.x).toBeGreaterThanOrEqual(1);
    expect(data.x).toBeLessThanOrEqual(5);
    expect(prediction.prompt).toContain("1–5 g");
    for (const q of [coefficients, prediction]) {
      expect(q.model).toBeUndefined();
      expect(q.openingHint).not.toBe(true);
      expect(mark(q, q.answer).correct).toBe(true);
    }
    expect(
      mark(
        coefficients,
        JSON.stringify({ m: String(data.c), c: String(data.m) }),
      ).correct,
    ).toBe(false);
    expect(mark(prediction, String(data.c)).correct).toBe(false);
    expect(mark(prediction, String(data.y + 1)).correct).toBe(false);
  }
  expect(j.checkForms.slice(2)).toEqual(energyEquationCheckForms);
  expect(j.reviewForms.slice(2)).toEqual(energyEquationReviewForms);
});

test("helped tutorial values cannot become fresh copies while changed reserved fits retain distinct data", () => {
  const reserved = [
    ...energyEquationCheckForms,
    ...energyEquationReviewForms,
  ].flat();
  expect(new Set(reserved.map((q) => q.id)).size).toBe(8);
  for (const q of reserved) {
    expect(exposureIds([g.id])).not.toContain(q.id);
    expect(exposureIds([p.id])).not.toContain(q.id);
  }
  expect(
    new Set(energyEquationCases.map((data) => `${data.m}:${data.c}`)).size,
  ).toBe(4);
  for (const data of energyEquationCases) {
    expect(data.m).not.toBe(-0.4);
    expect(data.m).not.toBe(1.5);
  }
});
