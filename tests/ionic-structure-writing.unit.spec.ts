import { test, expect } from "@playwright/test";
import { ionicStructuresJourney as journey } from "../src/content/journeys/ionic-structures";
import { ionicStructureWritingAdditions as added } from "../src/content/journeys/ionic-structure-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("original structure forms and retained practice work remain compatible", () => {
  expect(journey.version).toBe(1);
  expect(journey.practice[0].id).toBe("is-v1-p-slice");
  expect(journey.practice[10].id).toBe("is-v1-p-explain");
  expect(journey.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    [
      ["force", "solid", "liquid", "model"].map((id) => "is-v1-ca-" + id),
      ["structure", "boiling", "water", "ratio"].map((id) => "is-v1-cb-" + id),
    ],
  );
  expect(
    journey.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id)),
  ).toEqual([
    ["solid", "mp"].map((id) => "is-v1-ra-" + id),
    ["liquid", "lattice"].map((id) => "is-v1-rb-" + id),
  ]);
  const p = emptyProgress();
  p.work["ionic-structures"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 10 },
    drafts: { [added.check[1].id]: "Solid ions are uncharged. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
  const ids = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(ids).toHaveLength(12);
  expect(new Set(ids)).toEqual(new Set(journey.practice.map((q) => q.id)));
});
test("extended written reasoning never receives automatic examiner marks", () => {
  expect(tasks(journey)).toHaveLength(41);
  expect(tasks(journey).filter((q) => q.rubric)).toHaveLength(8);
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    for (const raw of [q.answer, "No charge; electrons move in salt. 1..2"]) {
      expect(mark(q, raw).correct).toBe(false);
      expect(mark(q, raw).selfReview).toBe(true);
    }
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  expect(added.check[2].ionicSlice).toBe(true);
  expect(added.check[2].rubric!.join(" ")).toContain("1:1 ratio and NaCl");
  expect(added.review[1].rubric!.join(" ")).toContain(
    "universal ionic solubility",
  );
});
test("helped property and representation equivalents remain exposed", () => {
  const all = tasks(journey);
  for (const q of [...added.practice, ...added.check, ...added.review])
    for (const alias of q.exposureAliases ?? []) {
      expect(all.find((t) => t.id === alias)?.exposureAliases).toContain(q.id);
      expect(exposureIds([alias])).toContain(q.id);
    }
  expect(exposureIds(["is-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["is-v1-g-solid"])).toContain(added.check[1].id);
  expect(exposureIds(["is-v1-p-slice"])).toContain(added.check[2].id);
});
