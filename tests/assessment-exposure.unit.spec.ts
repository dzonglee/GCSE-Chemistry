import { test, expect } from "@playwright/test";
import { diagnostics, papers } from "../src/content/assessments";
import { lessons, questionById } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { assessmentExposureGroups } from "../src/content/assessment-exposure";
import { exposureIds, decode, emptyProgress } from "../src/lib/progress";

test("reviewed short-set theory repeats and exact sources link directly in both directions without replacing identities", () => {
  const short = [...diagnostics, ...papers].flatMap((a) => a.questions);
  const native = lessons.flatMap((l) => [
    ...l.questions,
    ...l.checks,
    ...tasks(l.journey!),
  ]);
  const known = new Set(
    [...short, ...native].flatMap((q) => [q.id, ...(q.exposureAliases ?? [])]),
  );
  expect(assessmentExposureGroups).toHaveLength(18);
  for (const group of assessmentExposureGroups) {
    for (const id of group) {
      expect(known.has(id), id).toBe(true);
      for (const other of group)
        expect(exposureIds([id]), `${id} → ${other}`).toContain(other);
    }
  }
  expect(questionById("mp-v1-p-bonds")!.prompt).toContain(
    "methane boils easily",
  );
  expect(papers[0].questions[2].id).toBe("paper-0-2");
  expect(papers[0].questions[2].answer).toBe("Weak intermolecular forces");
});
test("changed numerical givens stay distinct even when four forms share the same final answer", () => {
  const slots = {
    paper: [0, 3, 4, 7, 9, 11, 12],
    "higher-paper": [0, 2, 3, 4, 6, 7, 11, 12],
  };
  for (const [prefix, indexes] of Object.entries(slots))
    for (const slot of indexes)
      for (let a = 0; a < 4; a++)
        for (let b = 0; b < 4; b++)
          if (a !== b) {
            expect(exposureIds([`${prefix}-${a}-${slot}`])).not.toContain(
              `${prefix}-${b}-${slot}`,
            );
          }
  expect(exposureIds(["diagnostic-1-0"])).toContain("higher-paper-0-0");
  expect(exposureIds(["diagnostic-1-0"])).not.toContain("higher-paper-1-0");
  expect(exposureIds(["diagnostic-1-4"])).toContain("higher-paper-1-2");
  expect(exposureIds(["diagnostic-1-4"])).not.toContain("higher-paper-0-2");
});
test("old original seen records are understood without a storage migration or rewritten history", () => {
  const p = emptyProgress();
  p.seen["paper-0-2"] = 1700000000000;
  const raw = JSON.stringify(p);
  expect(decode(raw)).toEqual(p);
  expect(
    exposureIds(["paper-3-2"]).some((id) => p.seen[id] !== undefined),
  ).toBe(true);
  expect(
    exposureIds(["paper-3-0"]).some((id) => p.seen[id] !== undefined),
  ).toBe(false);
  expect(JSON.stringify(p)).toBe(raw);
});
test("short-set scope identifies actual separate-Chemistry questions", () => {
  expect(diagnostics.map((a) => a.course)).toEqual(["separate", "combined"]);
  expect(diagnostics[0].questions[19].prompt).toContain("zinc");
  expect(
    papers
      .filter((p) => p.tier === "foundation")
      .every((p) => p.course === "combined"),
  ).toBe(true);
  expect(
    papers
      .filter((p) => p.tier === "higher")
      .every((p) => p.course === "separate"),
  ).toBe(true);
  for (const p of papers.filter((p) => p.tier === "higher"))
    expect(p.questions[3].prompt).toContain("24 dm³/mol");
});
