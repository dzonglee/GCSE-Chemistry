import { test, expect } from "@playwright/test";
import { groupSevenJourney as journey } from "../src/content/journeys/group-seven";
import { groupSevenWriting as added } from "../src/content/journeys/group-seven-writing";
import { halogenReference } from "../src/components/HalogenReference";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("original halogen forms and saved positions remain readable", () => {
  expect(journey.version).toBe(1);
  expect(journey.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    [
      ["mass", "state", "displace", "test", "infer"].map(
        (id) => "g7-v1-ca-" + id,
      ),
      ["unknown", "none", "compound", "structure", "infer"].map(
        (id) => "g7-v1-cb-" + id,
      ),
    ],
  );
  expect(
    journey.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id)),
  ).toEqual([
    ["molecule", "ion", "none"].map((id) => "g7-v1-ra-" + id),
    ["state", "gain", "trends"].map((id) => "g7-v1-rb-" + id),
  ]);
  expect(journey.practice[13].id).toBe("g7-v1-p-explain");
  const data = emptyProgress();
  data.work["group-seven"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 13 },
    drafts: { [added.check[1].id]: "Br + NaI → NaBr2. 1..2" },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
});
test("supplied Group 7 entries preserve exact symbols without implying measured chemistry", () => {
  expect(halogenReference).toEqual([
    ["Fluorine", "F", 9],
    ["Chlorine", "Cl", 17],
    ["Bromine", "Br", 35],
    ["Iodine", "I", 53],
    ["Astatine", "At", 85],
    ["Tennessine", "Ts", 117],
  ]);
  for (const q of tasks(journey).filter((q) => q.halogenReference)) {
    expect(q.model).toBeUndefined();
    expect(mark(q, q.answer).correct).toBe(true);
    for (const wrong of q.options!.filter((o) => o !== q.answer))
      expect(mark(q, wrong).correct).toBe(false);
  }
});
test("full chemical and observation reasoning is manual and equivalent assisted responses stay exposed", () => {
  const all = tasks(journey);
  for (const q of [...added.practice, ...added.check, ...added.review].filter(
    (q) => q.rubric,
  )) {
    for (const raw of [
      q.answer,
      "Halogens lose protons. Purple aqueous iodine forms sodium metal. Br + NaI → NaBr2. 1..2",
      "",
    ]) {
      expect(mark(q, raw).correct, q.id).toBe(false);
      if (raw) expect(mark(q, raw).selfReview).toBe(true);
    }
    expect(q.model).toBeUndefined();
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
    for (const alias of q.exposureAliases ?? []) {
      expect(all.find((t) => t.id === alias)?.exposureAliases).toContain(q.id);
      expect(exposureIds([alias])).toContain(q.id);
    }
  }
  expect(added.review[2].halogenResults).toEqual([
    { added: "X₂", halide: "Z⁻", reaction: true },
    { added: "Z₂", halide: "Y⁻", reaction: true },
  ]);
  const grouped = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(grouped).toHaveLength(18);
  expect(new Set(grouped)).toEqual(new Set(journey.practice.map((q) => q.id)));
});
