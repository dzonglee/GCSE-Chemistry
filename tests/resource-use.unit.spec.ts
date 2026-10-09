import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import baseline from "./fixtures/resource-use-lca-baseline.json";
import {
  lcaJourney as j,
  allLcaTasks,
} from "../src/content/journeys/life-cycle-assessment";
import {
  allResourceTasks,
  resourceCheckForms,
  resourceReviewForms,
} from "../src/content/journeys/resource-use";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
  dueReview,
  REVIEW_DELAY,
} from "../src/lib/progress";
import { mark } from "../src/lib/marking";

test("all 67 original task definitions, positions and reserved forms are unchanged", () => {
  expect(Object.keys(baseline.tasks)).toHaveLength(67);
  for (const [id, hash] of Object.entries(baseline.tasks)) {
    const q = allLcaTasks.find((task) => task.id === id);
    expect(q, id).toBeDefined();
    expect(
      createHash("sha256").update(JSON.stringify(q)).digest("hex"),
      id,
    ).toBe(hash);
  }
  for (const stage of ["warmup", "refresher", "guided", "practice"] as const) {
    expect(
      j[stage].slice(0, baseline.stages[stage].length).map((q) => q.id),
    ).toEqual(baseline.stages[stage]);
  }
  expect(j.checkForms.slice(0, 2).map((form) => form.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(
    j.reviewForms.slice(0, 2).map((form) => form.map((q) => q.id)),
  ).toEqual(baseline.reviewForms);
  expect(j.version).toBe(1);
});

test("new independent/delayed forms each elicit present/future needs, product examples and supplied replenishment", () => {
  expect(allResourceTasks).toHaveLength(22);
  for (const form of [...resourceCheckForms, ...resourceReviewForms]) {
    expect(form.map((q) => q.id.split("-").at(-1))).toEqual([
      "needs",
      "products",
      "renewable",
    ]);
    expect(form[0].rubric).toHaveLength(2);
    expect(form[0].answer).toContain("future generations");
    expect(form[1].rubric).toHaveLength(1);
    expect(form[2].answer).toContain("renewable");
    expect(form[2].answer).toContain("finite");
    for (const q of form) {
      expect(q.model).toBeUndefined();
      expect(q.id).not.toBe(baseline.stages.guided[0]);
    }
  }
});

test("renewable overharvesting and natural finite stocks are never marked as sustainable/renewable", () => {
  for (const q of allResourceTasks.filter((q) => q.options)) {
    expect(mark(q, q.answer).correct, q.id).toBe(true);
    for (const wrong of q.options!.filter((value) => value !== q.answer)) {
      expect(mark(q, wrong).correct, `${q.id}: ${wrong}`).toBe(false);
    }
  }
  const overharvest = allResourceTasks.find((q) =>
    q.id.endsWith("g-renewable"),
  )!;
  expect(overharvest.answer).toContain(
    "renewable but this harvest is unsustainable",
  );
});

test("one-name recall and two-reason responses remain manual, including a wrong or malformed draft", () => {
  for (const q of allResourceTasks.filter((q) => q.rubric)) {
    for (const raw of [q.answer, "cotton is synthetic", "1..2"])
      expect(mark(q, raw)).toMatchObject({
        correct: false,
        empty: false,
        selfReview: true,
      });
  }
  const p = emptyProgress(),
    w = emptyWork();
  w.learning = { version: 1, stage: "practice", index: 23 };
  w.drafts["lca-v1-resource-p-products"] = "1..2";
  w.drafts["lca-v1-p-total"] = '{"aTotal":"1..2"}';
  w.hints = ["lca-v1-resource-p-products"];
  w.run = {
    kind: "check",
    ids: baseline.checkForms[0],
    index: 1,
    started: 10,
    responses: {
      [baseline.checkForms[0][0]]: {
        answer: "wrong",
        correct: false,
        fresh: false,
        helped: true,
        at: 12,
      },
    },
  };
  p.work["life-cycle-and-recycling"] = w;
  expect(decode(JSON.stringify(p))!.work["life-cycle-and-recycling"]).toEqual(
    w,
  );
});

test("equivalent fibre recall and repeated overharvest classification propagate exposure; new decisions do not", () => {
  const equivalent = [
    "r-products",
    "g-products",
    "p-products",
    "cC-products",
    "vC-products",
  ].map((s) => `lca-v1-resource-${s}`);
  for (const id of equivalent)
    expect(exposureIds([id])).toEqual(expect.arrayContaining(equivalent));
  expect(exposureIds(["lca-v1-resource-g-renewable"])).toContain(
    "lca-v1-resource-vC-renewable",
  );
  for (const form of [...resourceCheckForms, ...resourceReviewForms]) {
    expect(exposureIds([form[0].id])).not.toContain("lca-v1-resource-g-needs");
  }
});

test("resource review still requires seven days after the latest submission", () => {
  const w = emptyWork();
  w.history = [
    {
      kind: "check",
      ids: resourceCheckForms[0].map((q) => q.id),
      index: 2,
      responses: {},
      started: 1,
      submitted: 100,
    },
  ];
  expect(dueReview(w, 100 + REVIEW_DELAY - 1)).toBe(false);
  expect(dueReview(w, 100 + REVIEW_DELAY)).toBe(true);
});
