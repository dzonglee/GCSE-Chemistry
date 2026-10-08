import { test, expect } from "@playwright/test";
import { acidNeutralisationJourney as journey } from "../src/content/journeys/acids-and-neutralisation";
import { acidMetalForTier } from "../src/content/journeys/acid-metal-writing";
import { acidMetalEquation } from "../src/lib/acid-metal-reference";
import { tasks } from "../src/content/journeys/helpers";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
import { mark } from "../src/lib/marking";

test("original identities and raw drafts survive the common and Higher extension", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(66);
  expect(journey.practice).toHaveLength(23);
  expect(journey.practice[19].id).toBe("an-v1-p-evidence-explain");
  expect(journey.checkForms.slice(0, 2).map((f) => f.length)).toEqual([5, 5]);
  expect(journey.reviewForms.slice(0, 2).map((f) => f.length)).toEqual([3, 3]);
  const p = emptyProgress(),
    w = emptyWork();
  w.drafts["am-write-v1-ca-redox"] = "H2 loses electrons. 1..2";
  p.work["acids-and-neutralisation"] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("six dilute-acid equations preserve atomic inventory and sulfate identity", () => {
  const expected = [
    [
      "Mg(s) + 2HCl(aq) → MgCl2(aq) + H2(g)",
      "Mg(s) + H2SO4(aq) → MgSO4(aq) + H2(g)",
    ],
    [
      "Zn(s) + 2HCl(aq) → ZnCl2(aq) + H2(g)",
      "Zn(s) + H2SO4(aq) → ZnSO4(aq) + H2(g)",
    ],
    [
      "Fe(s) + 2HCl(aq) → FeCl2(aq) + H2(g)",
      "Fe(s) + H2SO4(aq) → FeSO4(aq) + H2(g)",
    ],
  ];
  for (let i = 0; i < 3; i++)
    expect([
      acidMetalEquation(i, "HCl"),
      acidMetalEquation(i, "H2SO4"),
    ]).toEqual(expected[i]);
  const reserved = journey.checkForms[2];
  expect(reserved[0].rubric?.join(" ")).toContain("coefficient 2");
  expect(reserved[1].rubric?.join(" ")).toContain("Keep sulfate intact");
  expect(reserved[3].answer).toContain("hydrogen ions");
  expect(reserved[3].answer).toContain("+2 each side");
});
test("tier filtering removes new Higher teaching and reserved demands without renumbering original content", () => {
  const f = acidMetalForTier(journey, "foundation"),
    h = acidMetalForTier(journey, "higher");
  expect(tasks(f)).toHaveLength(61);
  expect(tasks(f).some((q) => q.tier === "higher")).toBe(false);
  expect(f.guided.map((q) => q.id)).toEqual(
    journey.guided.slice(0, 6).map((q) => q.id),
  );
  expect(f.checkForms[2].map((q) => q.id)).toEqual(
    journey.checkForms[2].slice(0, 3).map((q) => q.id),
  );
  expect(f.reviewForms[2]).toHaveLength(3);
  expect(h).toBe(journey);
  for (const q of tasks(journey).filter(
    (q) => q.id.startsWith("am-write-v1-") && q.rubric,
  )) {
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, "Wrong but retained writing. 1..2").invalid).toBeFalsy();
    for (const id of q.exposureAliases ?? [])
      expect(
        tasks(journey).find((other) => other.id === id)?.exposureAliases,
      ).toContain(q.id);
  }
});
