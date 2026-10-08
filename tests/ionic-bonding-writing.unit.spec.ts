import { test, expect } from "@playwright/test";
import { ionicBondingJourney as journey } from "../src/content/journeys/ionic-bonding";
import { ionicBondingWritingAdditions as added } from "../src/content/journeys/ionic-bonding-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("old ionic drawings, practice positions and reserved forms remain compatible", () => {
  expect(journey.version).toBe(1);
  expect(journey.practice[5].id).toBe("ib-v1-p-draw-chloride");
  expect(journey.practice[13].id).toBe("ib-v1-p-explain");
  expect(journey.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    [
      ["transfer", "mg", "diagram", "force", "ratio", "draw"].map(
        (id) => "ib-v1-ca-" + id,
      ),
      ["transfer", "oxide", "diagram", "ratio", "identity", "draw"].map(
        (id) => "ib-v1-cb-" + id,
      ),
    ],
  );
  expect(
    journey.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id)),
  ).toEqual([
    ["bond", "marker", "ratio"].map((id) => "ib-v1-ra-" + id),
    ["direction", "origin", "lattice"].map((id) => "ib-v1-rb-" + id),
  ]);
  const p = emptyProgress();
  p.work["ionic-bonding"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 13 },
    drafts: { [added.check[0].id]: "Move two protons. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
  const ids = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(ids).toHaveLength(16);
  expect(new Set(ids)).toEqual(new Set(journey.practice.map((q) => q.id)));
});
test("written ion formation stays unmarked while independent drawings still require origins, brackets and charge", () => {
  expect(tasks(journey)).toHaveLength(52);
  expect(tasks(journey).filter((q) => q.rubric)).toHaveLength(9);
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    for (const raw of [q.answer, "Share two protons; nuclei move. 1..2"]) {
      expect(mark(q, raw).correct).toBe(false);
      expect(mark(q, raw).selfReview).toBe(true);
    }
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  const q = journey.checkForms[0][5];
  expect(
    mark(q, '{"dots":"7","crosses":"1","charge":"-1","brackets":"1"}').correct,
  ).toBe(true);
  expect(
    mark(q, '{"dots":"6","crosses":"2","charge":"-1","brackets":"1"}').correct,
  ).toBe(false);
  expect(
    mark(q, '{"dots":"7","crosses":"1","charge":"1","brackets":"0"}').correct,
  ).toBe(false);
});
test("helped equivalent explanations cannot become fresh independent evidence", () => {
  const all = tasks(journey);
  for (const q of [...added.practice, ...added.check, ...added.review])
    for (const alias of q.exposureAliases ?? []) {
      expect(all.find((t) => t.id === alias)?.exposureAliases).toContain(q.id);
      expect(exposureIds([alias])).toContain(q.id);
    }
  expect(exposureIds(["ib-v1-g-mgo"])).toContain(added.check[0].id);
  expect(added.check[1].rubric!.join(" ")).toContain(
    "Each of two fluorine atoms",
  );
  expect(added.review[1].rubric!.join(" ")).toContain(
    "consistent dot/cross convention",
  );
});
