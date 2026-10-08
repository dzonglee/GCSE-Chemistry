import { test, expect } from "@playwright/test";
import { atomicModelJourney as journey } from "../src/content/journeys/atomic-models";
import { atomicModelWriting as added } from "../src/content/journeys/atomic-model-writing";
import { tasks } from "../src/content/journeys/helpers";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
import { mark } from "../src/lib/marking";

test("historical writing retains old form identities, saved positions and raw wrong explanations", () => {
  expect(journey.version).toBe(1);
  expect(journey.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    [
      ["picture", "electron", "straight", "bohr"].map((id) => "am-v1-ca-" + id),
      ["picture", "rare", "chadwick", "order"].map((id) => "am-v1-cb-" + id),
    ],
  );
  expect(
    journey.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id)),
  ).toEqual([
    ["repel", "model", "evidence"].map((id) => "am-v1-ra-" + id),
    ["bohr", "neutrons", "earliest"].map((id) => "am-v1-rb-" + id),
  ]);
  expect(journey.practice.slice(0, 10).map((q) => q.id)).toEqual(
    [
      "pudding",
      "electron",
      "contrast",
      "bohr",
      "chadwick",
      "proton",
      "order",
      "revision",
      "data",
      "inference",
    ].map((id) => "am-v1-p-" + id),
  );
  const p = emptyProgress();
  p.work["atomic-models"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 9 },
    drafts: {
      [added.practice[0].id]:
        "All particles struck a large negative wall. 1..2",
    },
    run: {
      kind: "check",
      ids: journey.checkForms[0].map((q) => q.id),
      index: 0,
      started: 1,
      responses: {},
    },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});

test("helped scattering and model comparisons cannot become fresh by switching to written forms", () => {
  const all = tasks(journey);
  for (const q of Object.values(added).flat()) {
    expect(
      journey.refresher.some((r) => r.id === q.followUp || r.id === q.id),
      q.id,
    ).toBe(true);
    for (const alias of q.exposureAliases ?? []) {
      expect(all.find((t) => t.id === alias)?.exposureAliases, alias).toContain(
        q.id,
      );
      expect(exposureIds([alias])).toContain(q.id);
    }
  }
  expect(exposureIds(["am-v1-g-charge"])).toContain(added.check[1].id);
  expect(exposureIds(["am-v1-p-contrast"])).toContain(added.check[0].id);
  const grouped = journey.practiceGroups!.flatMap((group) => group.taskIds);
  expect(grouped).toHaveLength(11);
  expect(new Set(grouped)).toEqual(new Set(journey.practice.map((q) => q.id)));
});

test("constructed historical descriptions and evidence explanations never receive automatic marks", () => {
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    expect(q.model).toBeUndefined();
    for (const raw of [
      q.answer,
      "An atom-sized neutron nucleus attracts positive particles. 1..2",
      "",
    ]) {
      expect(mark(q, raw).correct, q.id).toBe(false);
      if (raw) expect(mark(q, raw).selfReview, q.id).toBe(true);
    }
  }
  const r = added.refresher[0];
  expect(mark(r, "No: strong repulsion can reverse its path").correct).toBe(
    true,
  );
  expect(mark(r, "Yes: every backward path is a wall collision").correct).toBe(
    false,
  );
  expect(mark(r, "No: a negative centre repels it").correct).toBe(false);
});
