import { test, expect } from "@playwright/test";
import { periodicTableJourney as journey } from "../src/content/journeys/periodic-table";
import { periodicPositionWritingAdditions as added } from "../src/content/journeys/periodic-position-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("original periodic forms and stored multipart/practice positions remain compatible", () => {
  expect(journey.version).toBe(1);
  expect(journey.practice[7].id).toBe("pt-v1-p-explain");
  expect(journey.practice[9].id).toBe("pt-v1-p-ion-count");
  expect(journey.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    [
      ["position", "unfamiliar", "metal", "similar"].map(
        (id) => "pt-v1-ca-" + id,
      ),
      ["helium", "ion", "order", "exception"].map((id) => "pt-v1-cb-" + id),
    ],
  );
  expect(
    journey.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id)),
  ).toEqual([
    ["position", "group", "chemical"].map((id) => "pt-v1-ra-" + id),
    ["unfamiliar", "hydrogen", "similar"].map((id) => "pt-v1-rb-" + id),
  ]);
  const data = emptyProgress();
  data.work["periodic-patterns"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 7 },
    drafts: { [added.check[0].id]: "Group3 period6. 1..2" },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
  const ids = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(ids.length).toBe(13);
  expect(new Set(ids)).toEqual(new Set(journey.practice.map((q) => q.id)));
});
test("constructed explanations stay manual, while explicit group and period fields still check the actual numbers", () => {
  expect(tasks(journey)).toHaveLength(48);
  expect(tasks(journey).filter((q) => q.rubric)).toHaveLength(9);
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    for (const raw of [q.answer, "No electrons; remove a proton. 1..2"]) {
      expect(mark(q, raw).correct).toBe(false);
      expect(mark(q, raw).selfReview).toBe(true);
    }
    expect(q.model).toBeUndefined();
    expect(q.options).toBeUndefined();
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  const position = journey.checkForms[0][0];
  expect(mark(position, '{"group":"1","period":"4"}').correct).toBe(true);
  expect(mark(position, '{"group":"4","period":"1"}').correct).toBe(false);
});
test("equivalent helped reasoning stays exposed and boundary criteria allow a justified uncertain prediction", () => {
  const all = tasks(journey);
  for (const q of [...added.practice, ...added.check, ...added.review])
    for (const alias of q.exposureAliases ?? []) {
      expect(all.find((t) => t.id === alias)?.exposureAliases).toContain(q.id);
      expect(exposureIds([alias])).toContain(q.id);
    }
  expect(added.review[1].rubric!.join(" ")).toContain("differently justified");
  expect(added.review[1].rubric!.join(" ")).toContain(
    "both conductivity and brittleness",
  );
});
