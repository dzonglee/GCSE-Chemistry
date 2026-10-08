import { test, expect } from "@playwright/test";
import { groupOneJourney as journey } from "../src/content/journeys/group-one";
import { groupOneWriting as added } from "../src/content/journeys/group-one-writing";
import { alkaliReference } from "../src/components/AlkaliReference";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";

test("original Group 1 forms and saved learning positions remain compatible", () => {
  expect(journey.version).toBe(1);
  expect(journey.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    [
      ["products", "structure", "observation"].map((id) => "g1-v1-ca-" + id),
      ["chloride", "explain", "melting"].map((id) => "g1-v1-cb-" + id),
    ],
  );
  expect(journey.practice[10].id).toBe("g1-v1-p-explain");
  const data = emptyProgress();
  data.work["group-reactions"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 10 },
    drafts: { [added.check[1].id]: "Na + Cl → NaCl2. 1..2" },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
});
test("the supplied reference covers all six alkali metals and exact symbol case matters", () => {
  expect(alkaliReference).toEqual([
    ["Lithium", "Li", 3],
    ["Sodium", "Na", 11],
    ["Potassium", "K", 19],
    ["Rubidium", "Rb", 37],
    ["Caesium", "Cs", 55],
    ["Francium", "Fr", 87],
  ]);
  for (const q of tasks(journey).filter((q) => q.alkaliReference)) {
    expect(mark(q, q.answer).correct).toBe(true);
    for (const wrong of q.options!.filter((o) => o !== q.answer))
      expect(mark(q, wrong).correct).toBe(false);
  }
});
test("complete chemical writing is manual and equivalent helped demands are exposed", () => {
  const all = tasks(journey);
  for (const q of [...added.practice, ...added.check, ...added.review].filter(
    (q) => q.rubric,
  )) {
    for (const raw of [
      q.answer,
      "More protons cause weaker attraction. Na + Cl → NaCl2. 1..2",
      "",
    ]) {
      expect(mark(q, raw).correct).toBe(false);
      if (raw) expect(mark(q, raw).selfReview).toBe(true);
    }
    expect(q.model).toBeUndefined();
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
    for (const alias of q.exposureAliases ?? []) {
      expect(all.find((t) => t.id === alias)?.exposureAliases).toContain(q.id);
      expect(exposureIds([alias])).toContain(q.id);
    }
  }
  const grouped = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(grouped).toHaveLength(15);
  expect(new Set(grouped)).toEqual(new Set(journey.practice.map((q) => q.id)));
});
