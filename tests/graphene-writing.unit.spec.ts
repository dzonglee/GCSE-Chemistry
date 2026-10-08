import { questionById } from "../src/content/curriculum";
import { test, expect } from "@playwright/test";
import { grapheneJourney as journey } from "../src/content/journeys/graphene";
import { grapheneWritingAdditions as added } from "../src/content/journeys/graphene-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
test("graphene corrections preserve original identities, forms and saved positions while reserving full causal writing", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(44);
  expect(journey.practice[10].id).toBe("ge-v1-p-explain");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(journey.checkForms[0][0].id).toBe("ge-v1-ca-layers");
  expect(journey.reviewForms[1][0].id).toBe("ge-v1-rb-network");
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["graphene"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 10 },
    drafts: { [added.check[0].id]: "Graphene has no electrons. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("graphene explanations separate thinness, carriers, strong bonds and bounded panel evidence", () => {
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    expect(q.rubric!.length).toBeGreaterThanOrEqual(3);
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, "All covalent substances insulate. 1..2").correct).toBe(
      false,
    );
  }
  expect(added.check[0].answer).toContain("Delocalised electrons");
  expect(added.check[1].answer).toContain("must be measured");
  expect(added.check[2].answer).toContain("14 g ≤ 16 g");
  expect(added.review[2].answer).toContain("Neither");
});
test("helped graphene mechanisms retain symmetric exposure", () => {
  expect(exposureIds(["ge-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["ge-v1-p-compare"])).toContain(added.review[1].id);
  expect(exposureIds([added.practice[0].id])).toContain(added.check[2].id);
  for (const q of tasks(journey))
    for (const id of q.exposureAliases ?? [])
      expect(questionById(id)?.exposureAliases).toContain(q.id);
});

test("reserved panel data retain independently supplied limits and quantities", () => {
  expect(added.check[2].graphenePanelData).toEqual({
    maxMass: 16,
    minLoad: 20,
    panels: [
      { id: "D", mass: 9, load: 11 },
      { id: "E", mass: 14, load: 23 },
      { id: "F", mass: 21, load: 31 },
    ],
  });
  expect(added.review[2].graphenePanelData).toEqual({
    maxMass: 15,
    minLoad: 22,
    panels: [
      { id: "G", mass: 13, load: 17 },
      { id: "H", mass: 18, load: 27 },
    ],
  });
});
