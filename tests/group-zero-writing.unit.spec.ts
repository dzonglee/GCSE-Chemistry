import { test, expect } from "@playwright/test";
import { groupZeroJourney as journey } from "../src/content/journeys/group-zero";
import { groupZeroWritingAdditions as added } from "../src/content/journeys/group-zero-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("old noble-gas forms, indices and malformed saved answers remain supported", () => {
  expect(journey.version).toBe(1);
  expect(journey.practice[10].id).toBe("g0-v1-p-explain");
  expect(journey.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    [
      ["he", "atom", "trend", "use"].map((id) => "g0-v1-ca-" + id),
      ["ar", "symbol", "compare", "protect"].map((id) => "g0-v1-cb-" + id),
    ],
  );
  expect(
    journey.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id)),
  ).toEqual([
    ["he", "density"].map((id) => "g0-v1-ra-" + id),
    ["pair", "boil"].map((id) => "g0-v1-rb-" + id),
  ]);
  const data = emptyProgress();
  data.work["group-zero"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 10 },
    drafts: { [added.check[0].id]: "No electrons. 1..2" },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
  const ids = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(ids.length).toBe(13);
  expect(new Set(ids)).toEqual(new Set(journey.practice.map((q) => q.id)));
});
test("physical predictions keep strict bounds and reject unsupported literal numbers without pretending an exact measurement", () => {
  for (const q of [...added.guided, ...added.check, ...added.review].filter(
    (q) => q.acceptedRange,
  )) {
    const { min, max } = q.acceptedRange!;
    expect(mark(q, String((min + max) / 2)).correct).toBe(true);
    for (const raw of [
      String(min),
      String(max),
      "1e3",
      "1..2",
      String(-min),
      "NaN",
    ])
      expect(mark(q, raw).correct).toBe(false);
    expect(q.nobleBoilingPoints?.length).toBe(2);
    expect(q.model).toBeUndefined();
  }
  expect(added.check[2].acceptedRange).toEqual({
    min: -246,
    max: -153,
    exclusive: true,
  });
  expect(added.review[1].acceptedRange).toEqual({
    min: -269,
    max: -186,
    exclusive: true,
  });
});
test("electron, use and physical-change explanations are constructed manually and symmetric aliases retain assisted exposure", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(45);
  for (const q of all.filter((q) => q.rubric && q.id.startsWith("g0-write"))) {
    for (const raw of [q.answer, "No electrons, no moving atoms. 1..2"]) {
      expect(mark(q, raw).correct).toBe(false);
      expect(mark(q, raw).selfReview).toBe(true);
    }
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
    for (const alias of q.exposureAliases ?? []) {
      expect(all.find((t) => t.id === alias)?.exposureAliases).toContain(q.id);
      expect(exposureIds([alias])).toContain(q.id);
    }
  }
  expect(all.filter((q) => q.rubric)).toHaveLength(9);
});
