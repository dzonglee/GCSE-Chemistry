import { test, expect } from "@playwright/test";
import type { Question } from "../src/content/types";
import baseline from "./fixtures/aqueous-method-baseline.json";
import { lessons } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { aqueousProductsJourney as j } from "../src/content/journeys/aqueous-products";
import {
  aqueousMethodGuided,
  aqueousMethodPractice,
  aqueousMethodChecks,
  aqueousMethodReviews,
} from "../src/content/journeys/aqueous-method-writing";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
const additions = [
  aqueousMethodGuided,
  aqueousMethodPractice,
  ...aqueousMethodChecks.flat(),
  ...aqueousMethodReviews.flat(),
];
test("all original51 aqueous records, stage positions and forms survive", () => {
  expect(j.version).toBe(1);
  for (const [stage, ids] of Object.entries(baseline.stageIds))
    expect(
      j[stage as "practice"].slice(0, ids.length).map((q) => q.id),
    ).toEqual(ids);
  expect(j.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(j.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.reviewForms,
  );
  const all = tasks(
    lessons.find((l) => l.slug === "aqueous-electrolysis-products")!.journey!,
  );
  for (const old of baseline.tasks) {
    const now = JSON.parse(JSON.stringify(all.find((q) => q.id === old.id)));
    const { exposureAliases: previous, ...before } = old as Question;
    const { exposureAliases: current, ...after } = now;
    expect(after, old.id).toEqual(before);
    expect(
      current?.filter((id: string) => previous?.includes(id)) ?? [],
    ).toEqual(previous ?? []);
    if (
      ![
        "aqp-v1-g-hypothesis",
        "aqp-v1-a-evidence",
        "aqp-v1-rb-products",
        "aqp-v1-p-inert",
      ].includes(old.id)
    )
      expect(current).toEqual(previous);
  }
});
test("each independently written reference retains correct electrode products and diagnostic evidence", () => {
  for (const q of additions) {
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(q.rubric).toHaveLength(5);
    expect(q.answer).toContain("negative cathode");
    expect(q.answer).toContain("positive anode");
    expect(q.answer).toContain("separated carbon electrodes");
    expect(q.answer).toContain("low-voltage DC");
    expect(q.answer).toContain("glowing splint");
    expect(q.answer).toMatch(/repeat/i);
    if (q === aqueousMethodPractice || q === aqueousMethodChecks[1][0]) {
      expect(q.answer).toContain("red-brown solid");
      expect(q.answer).not.toContain("squeaky pop");
    } else {
      expect(q.answer).toContain("squeaky pop");
      expect(q.answer).toContain("above hydrogen");
    }
    expect(
      mark(q, "Copper at both electrodes; bubbles prove oxygen."),
    ).toMatchObject({ correct: false, selfReview: true });
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
});
test("wrong raw practical writing and old saved positions decode without automatic scoring", () => {
  const p = emptyProgress(),
    w = emptyWork();
  p.work["aqueous-electrolysis-products"] = w;
  w.drafts[aqueousMethodPractice.id] =
    "1..2 — copper forms at positive electrode\n{unfinished";
  expect(
    decode(JSON.stringify(p))?.work["aqueous-electrolysis-products"].drafts,
  ).toEqual(w.drafts);
});
test("changed electrolyte names cannot make taught or equivalent hypotheses fresh", () => {
  for (const id of [
    "aqp-v1-g-hypothesis",
    "aqp-v1-a-evidence",
    "aqp-v1-rb-products",
    aqueousMethodGuided.id,
  ])
    for (const q of [...aqueousMethodChecks[0], ...aqueousMethodReviews.flat()])
      expect(exposureIds([id])).toContain(q.id);
  expect(exposureIds([aqueousMethodPractice.id])).toContain(
    aqueousMethodChecks[1][0].id,
  );
  expect(exposureIds(["aqp-v1-p-inert"])).toContain(
    aqueousMethodChecks[1][0].id,
  );
});
