import { test, expect } from "@playwright/test";
import { phJourney as j } from "../src/content/journeys/ph";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("61 Foundation tasks retain original forms and add manually reviewed method construction", () => {
  const all = tasks(j);
  expect(all).toHaveLength(61);
  expect(new Set(all.map((q) => q.id)).size).toBe(61);
  expect(j.practice).toHaveLength(22);
  expect(j.guided).toHaveLength(5);
  expect(j.refresher).toHaveLength(8);
  expect(j.guided[0].openingHint).toBe(true);
  expect(j.guided.slice(1).some((q) => q.openingHint)).toBe(false);
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(18);
  for (const q of written)
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
  for (const q of all.filter((q) => !q.rubric))
    expect(mark(q, q.answer).correct, q.id).toBe(true);
  for (const q of j.practice)
    expect(
      j.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
  for (const f of j.checkForms.slice(0, 2)) {
    expect(f).toHaveLength(5);
    for (const q of f) expect(q.model).toBeUndefined();
  }
  for (const f of j.reviewForms.slice(0, 2)) expect(f).toHaveLength(3);
  const a = j.checkForms[0].find((q) => q.phMeasurements)!,
    b = j.checkForms[1].find((q) => q.phMeasurements)!;
  expect(a.phMeasurements!.unit).toBe("cm³");
  expect(b.phMeasurements!.unit).toBe("g");
  expect(a.answer).not.toBe(b.answer);
  expect(
    all.find((q) => q.id === "ph-v1-g-indicator")!.exposureAliases,
  ).toContain("ph-v1-r-named");
});
test("eleven numeric demands independently read supplied neutral rows, endpoints and approximate intervals", () => {
  const qs = tasks(j).filter((q) => !q.options && !q.rubric);
  expect(qs).toHaveLength(11);
  const values: Record<string, number> = {
    "w-neutral": 7,
    "g-colour": 3,
    "g-neutralisation": 5 * 5,
    "p-orange": (3 + 4) / 2,
    "p-yellow": 6,
    "p-excess-volume": 6 * 5,
  };
  for (const q of qs) {
    const expected = q.phMeasurements
      ? ((q.id === "ph-v1-p-excess-volume"
          ? undefined
          : q.phMeasurements.points.find((p) => p.ph === 7)?.amount) ??
        q.phMeasurements.points.find((p) => p.ph > 7)!.amount)
      : values[q.id.replace("ph-v1-", "")];
    expect(Number(q.answer), q.id).toBe(expected);
  }
  for (const q of qs.filter((q) => q.acceptedRange)) {
    const r = q.acceptedRange!;
    expect(mark(q, String(r.min)).correct).toBe(true);
    expect(mark(q, String(r.max)).correct).toBe(true);
    expect(mark(q, String(r.min - 0.01)).correct).toBe(false);
    expect(mark(q, String(r.max + 0.01)).correct).toBe(false);
  }
});
test("static reserved and delayed curves remain chemically plausible and graph quantities do not swap units", () => {
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()].filter(
    (q) => q.phMeasurements,
  )) {
    const d = q.phMeasurements!,
      neutral = d.points.find((p) => p.ph === 7)!.amount;
    for (const p of d.points) {
      const mass = d.unit === "g",
        hydrogen = mass ? (2 * neutral) / 74 : (0.01 * (neutral * 5)) / 1000,
        hydroxide = mass ? (2 * p.amount) / 74 : (0.05 * p.amount) / 1000,
        volume = mass ? 0.2 : (neutral * 5 + p.amount) / 1000;
      const ph =
        Math.abs(hydrogen - hydroxide) < 1e-12
          ? 7
          : hydrogen > hydroxide
            ? -Math.log10((hydrogen - hydroxide) / volume)
            : 14 + Math.log10((hydroxide - hydrogen) / volume);
      expect(p.ph, q.id + String(p.amount)).toBe(Number(ph.toFixed(1)));
    }
  }
  expect(j.scopeNote).toContain("dimensionless");
  expect(j.scopeNote).toContain("separate Higher");
  expect(j.scopeNote).toMatch(
    /colourless phenolphthalein does not prove neutrality/i,
  );
});
