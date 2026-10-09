import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import baseline from "./fixtures/early-atmosphere-minor-original.json";
import {
  atmosphereJourney as j,
  allAtmosphereTasks,
} from "../src/content/journeys/early-atmosphere";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";

test("all original atmosphere definitions, positions, v1 and legacy IDs remain exact", () => {
  expect(j.version).toBe(baseline.version);
  for (const row of baseline.tasks) {
    const stage = row.stage as
      | "warmup"
      | "refresher"
      | "guided"
      | "practice"
      | "checkForms"
      | "reviewForms";
    const forms =
      stage === "checkForms" || stage === "reviewForms" ? j[stage] : [j[stage]];
    const q = forms[row.form][row.index];
    expect(q.id).toBe(row.id);
    expect(
      createHash("sha256").update(JSON.stringify(q)).digest("hex"),
      row.id,
    ).toBe(row.sha256);
  }
  const l = lessons.find((l) => l.slug === "early-atmosphere")!;
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    baseline.legacy,
  );
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8, 1]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4, 1]);
});

test("minor composition distinguishes the stated whole from humid air and stays manual in independent recall", () => {
  const additions = allAtmosphereTasks.filter((q) => q.id.includes("-minor-"));
  expect(additions).toHaveLength(5);
  for (const q of additions) {
    expect(q.explanation).toContain("noble gases");
    expect(q.explanation).toContain("excluded from dry-air tables");
    expect(q.explanation).toContain(
      "not a claim that the whole remaining 1% is carbon dioxide",
    );
    expect(q.exposureAliases).toContain("early-atmosphere-v1-g-composition");
    if (q.rubric)
      expect(mark(q, "nitrogen oxygen only")).toMatchObject({
        correct: false,
        selfReview: true,
      });
    else {
      expect(mark(q, q.answer).correct).toBe(true);
      for (const wrong of Object.keys(q.misconceptions!))
        expect(mark(q, wrong).correct).toBe(false);
    }
  }
  expect(j.practice.at(-1)!.followUp).toBe(j.refresher.at(-1)!.id);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  expect(78 + 21 + 1).toBe(100);
});
