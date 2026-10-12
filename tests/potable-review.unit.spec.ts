import { test, expect } from "@playwright/test";
import baseline from "./fixtures/potable-original-v1.json";
import { lessons } from "../src/content/curriculum";
import { waterJourney as j } from "../src/content/journeys/potable-water";
import {
  potableSourceChecks,
  potableSourceReviews,
  potableSourceGuided,
  potableSourcePractice,
  potableSourceRefresher,
  sourceSets,
} from "../src/content/journeys/potable-sources";
import { mark } from "../src/lib/marking";

test("all 88 original normalised tasks, task positions, reserved forms and v1 metadata remain exactly unchanged", () => {
  expect(lessons.find((l) => l.slug === "potable-water")!.journey).toBe(j);
  const original = {
    ...j,
    refresher: j.refresher.slice(0, 26),
    guided: j.guided.slice(0, 7),
    practice: j.practice.slice(0, 27),
    checkForms: j.checkForms.slice(0, 2),
    reviewForms: j.reviewForms.slice(0, 2),
    practiceGroups: j.practiceGroups!.slice(0, 4),
  };
  expect(JSON.parse(JSON.stringify(original))).toEqual(baseline);
});
test("literal comparison answers normalise each original sample volume and distinguish pH from residue mass", () => {
  const references = [
    ...potableSourceGuided,
    ...potableSourcePractice.filter((q) => q.parts),
    ...potableSourceChecks.map((f) => f[1]),
    ...potableSourceReviews.map((f) => f[1]),
  ];
  const answers = [
    [1, 2, 35],
    [3, 2],
    [2, 3],
    [2, 3],
    [2, 1],
    [3, 5],
  ];
  for (let i = 0; i < references.length; i++) {
    const q = references[i];
    expect(q.parts!.map((p) => p.answer)).toEqual(answers[i]);
    expect(mark(q, q.answer).correct).toBe(true);
    for (const p of q.parts!) {
      const wrong = { ...JSON.parse(q.answer), [p.id]: "1..2" };
      expect(mark(q, JSON.stringify(wrong)).correct).toBe(false);
    }
  }
  // Larger raw mass in Stream Q is less concentrated: 0.05/0.025 < 0.03/0.010.
  expect(sourceSets.practice).toEqual([
    ["Pond P", 5.5, 0.03, 10],
    ["Stream Q", 8, 0.05, 25],
  ]);
  expect(potableSourcePractice[0].answer).toBe("Pond P");
  expect(potableSourceGuided[0].waterGiven!.rows[2].text).toContain("pH 7.0");
  expect(potableSourceGuided[0].explanation).toContain(
    "microbiological safety",
  );
});
test("new comparison families conservatively expose equivalents across guidance, independent forms and delayed review", () => {
  const all = [
    ...potableSourceRefresher,
    ...potableSourceGuided,
    ...potableSourcePractice,
    ...potableSourceChecks.flat(),
    ...potableSourceReviews.flat(),
  ];
  expect(all).toHaveLength(13);
  expect(new Set(all.map((q) => q.id)).size).toBe(13);
  for (const q of all) {
    const families = [
      ["r-ph", "p-ph", "cC-ph", "cD-ph", "vC-ph", "vD-ph"],
      [
        "r-solids",
        "g-solids",
        "p-solids",
        "cC-solids",
        "cD-solids",
        "vC-solids",
        "vD-solids",
      ],
    ].map((fs) => fs.map((s) => "water-v1-sources-" + s));
    const expected = families
      .find((fs) => fs.includes(q.id))!
      .filter((id) => id !== q.id);
    const prior =
      q.parts || q.id.endsWith("r-solids")
        ? [
            "r-dish10",
            "g-residue",
            "r-dish25",
            "r-dish50",
            "r-dish100",
            "r-repeat50",
            "g-repeat",
            "r-repeat25",
            "r-repeat10",
            "p-residue",
            "p-dilute",
            "p-repeat",
            "cA-residue",
            "cB-residue",
            "vA-residue",
          ].map((suffix) => `water-v1-${suffix}`)
        : [];
    const originals = [
      ...j.refresher.slice(0, 26),
      ...j.guided.slice(0, 7),
      ...j.practice.slice(0, 27),
      ...j.checkForms.slice(0, 2).flat(),
      ...j.reviewForms.slice(0, 2).flat(),
    ];
    for (const id of prior)
      expect(originals.some((o) => o.id === id)).toBe(true);
    expect(q.exposureAliases).toEqual([...expected, ...prior]);
    expect(q.model).toBeUndefined();
  }
  for (const q of potableSourcePractice)
    expect([...j.refresher].some((r) => r.id === q.followUp)).toBe(true);
  expect(j.checkForms.slice(2)).toEqual(potableSourceChecks);
  expect(j.reviewForms.slice(2)).toEqual(potableSourceReviews);
});
