import { test, expect } from "@playwright/test";
import {
  cycleJourney as j,
  allCycleTasks as all,
  cycleRecoveryRoutes,
} from "../src/content/journeys/carbon-cycle";
import {
  cycleRecords as records,
  cycleFields,
  cycleChoices,
  cycleNumeric,
  initialCycle,
  validCycle,
  validCycleHistory,
  cycleNumber,
  checkCycle,
} from "../src/lib/cycle";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
const lesson = lessons.find((l) => l.slug === "carbon-cycle")!;
test("one90-task lesson has six modes,26 reachable cases, scoped cross-science outcomes and30 direct recoveries", () => {
  expect(lesson.journey).toBe(j);
  expect(all).toHaveLength(90);
  expect(new Set(all.map((q) => q.id)).size).toBe(90);
  expect(j.refresher).toHaveLength(26);
  expect(j.practice).toHaveLength(30);
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  expect(j.scopeNote).toContain("Biology");
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(cycleRecoveryRoutes[q.id]);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ])
    expect(q.model).toBeUndefined();
  expect(Object.keys(records)).toHaveLength(26);
  expect(new Set(Object.values(records).map((r) => r.mode)).size).toBe(6);
  for (const record of Object.keys(records))
    expect(
      j.refresher.some(
        (q) =>
          q.model?.kind === "carbon-cycle-investigation" &&
          q.model.record === record,
      ),
      record,
    ).toBe(true);
});
test("all native fields retain wrong work, fixed data and checkable one-field histories", () => {
  const original = JSON.stringify(records);
  for (const [record, r] of Object.entries(records)) {
    const m = {
        kind: "carbon-cycle-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialCycle(r.mode, record)];
    expect(initialBoard(m)).toEqual(h[0]);
    expect(checkCycle(r.mode, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(m, h)).toBe(true);
    expect(checkBoard(m, h.at(-1)!).correct, record).toBe(true);
    for (const f of cycleFields[r.mode]) {
      const wrong = cycleNumeric.includes(f)
          ? "999"
          : cycleChoices[f].find((v) => v !== r.expected[f])!,
        b = { ...h.at(-1)!, [f]: wrong };
      expect(validBoard(m, b)).toBe(true);
      expect(checkBoard(m, b).correct, record + "/" + f).toBe(false);
      expect(checkBoard(m, b).feedback).toContain("remains as entered");
      expect(b[f]).toBe(wrong);
    }
  }
  expect(JSON.stringify(records)).toBe(original);
});
test("schema rejects foreign sources, extra/nonstring fields and multi-field history repairs; malformed numeric work remains raw", () => {
  const b = initialCycle("ledger", "atmosphere");
  for (const bad of [
    { ...b, record: "day" },
    { ...b, incoming: true },
    { ...b, extra: "" },
    [b],
  ])
    expect(validCycle("ledger", bad, "atmosphere")).toBe(false);
  expect(
    validCycleHistory("ledger", "atmosphere", [
      b,
      { ...b, incoming: "30", outgoing: "23" },
    ]),
  ).toBe(false);
  expect(validCycleHistory("ledger", "atmosphere", [{ ...b, net: "7" }])).toBe(
    false,
  );
  const raw = { ...b, ...records.atmosphere.expected, net: "1..2" };
  expect(validCycle("ledger", raw)).toBe(true);
  expect(checkCycle("ledger", raw).correct).toBe(false);
  expect(raw.net).toBe("1..2");
  for (const v of ["", "1..2", "1e3", "1/2", "NaN", "Infinity"])
    expect(cycleNumber(v)).toBeNull();
  expect(cycleNumber("-3")).toBe(-3);
});
test("native inventories independently match literal carbon mass references and endpoint units", () => {
  const refs: Record<string, number[]> = {
    atmosphere: [30, 23, 7, 107],
    day: [11, 9, 2, 52],
    night: [0, 6, -6, 44],
    oceanSink: [12, 9, 3, 43],
    oceanSource: [6, 9, -3, 37],
    balanced: [30, 30, 0, 120],
  };
  for (const [name, nums] of Object.entries(refs)) {
    expect(
      cycleFields.ledger.map((f) => Number(records[name].expected[f])),
      name,
    ).toEqual(nums);
    expect(records[name].ledger!.unit).toBe("g of carbon");
  }
  expect([
    records.deforestation.expected.beforeNet,
    records.deforestation.expected.afterNet,
  ]).toEqual(["-2", "24"]);
  expect([
    records.fossilChange.expected.beforeNet,
    records.fossilChange.expected.afterNet,
  ]).toEqual(["0", "9"]);
  expect([
    records.regrowth.expected.beforeNet,
    records.regrowth.expected.afterNet,
  ]).toEqual(["10", "4"]);
  expect(records.seasonal.expected).toEqual({
    start: "100",
    end: "110",
    sameSeasonChange: "4",
    change: "10",
    trend: "up",
    season: "winterHigher",
  });
  expect(records.seasonalDown.expected.change).toBe("-2");
});
test("all scalar references and fresh constructed fields independently match literal audited answers", () => {
  const scalar: Record<string, number> = {
    "w-net": -3,
    "w-atoms": 6,
    "r-atmosphere": 107,
    "r-day": 2,
    "r-night": 44,
    "r-sink": 3,
    "r-source": -3,
    "r-balanced": 120,
    "r-forest": 24,
    "r-fossilChange": 9,
    "r-regrowth": 4,
    "r-season": 10,
    "r-seasonDown": -2,
    "g-ledger": 7,
    "g-change": 24,
    "g-pattern": 10,
    "p-balanced": 64,
    "p-glucose": 6,
    "p-carbonateAtoms": 3,
    "p-extraFossil": 6,
    "p-regrowth": 7,
    "p-sameSeason": 4,
    "cA-glucose": 12,
    "cA-season": 6,
    "cB-carbonate": 7,
    "cB-endpoints": -4,
    "vA-carbon": 18,
    "vB-season": 8,
  };
  const nums = all.filter((q) => !q.options && !q.parts && !q.rubric);
  expect(nums).toHaveLength(Object.keys(scalar).length);
  for (const [s, n] of Object.entries(scalar)) {
    const q = all.find((q) => q.id === "cycle-v1-" + s)!;
    expect(Number(q.answer), s).toBe(n);
    expect(mark(q, String(n)).correct).toBe(true);
    expect(mark(q, String(n + 1)).correct).toBe(false);
    expect(mark(q, "1..2").correct).toBe(false);
  }
  const constructions: Record<string, number[]> = {
    "p-budget": [25, 23, 2, 182],
    "p-night": [-8, 62],
    "p-ocean": [14, 11, 3, 93],
    "p-forest": [-5, 19],
    "p-endpoints": [200, 216, 16],
    "cA-budget": [36, 29, 7, 207],
    "cA-forest": [-4, 15],
    "cB-ocean": [9, 13, -4, 76],
    "cB-regrowth": [8, 3],
    "vA-budget": [-3, 87],
    "vB-ocean": [5, 115],
  };
  expect(all.filter((q) => q.parts)).toHaveLength(11);
  for (const [s, nums] of Object.entries(constructions)) {
    const q = all.find((q) => q.id === "cycle-v1-" + s)!;
    expect(
      q.parts!.map((p) => p.answer),
      s,
    ).toEqual(nums);
    expect(mark(q, q.answer).correct).toBe(true);
    for (const part of q.parts!) {
      const v = JSON.parse(q.answer);
      v[part.id] = String(part.answer + 1);
      expect(mark(q, JSON.stringify(v)).correct, s + "/" + part.id).toBe(false);
    }
    const formatted = Object.fromEntries(
      q.parts!.map((p) => [p.id, String(p.answer) + "e0"]),
    );
    expect(mark(q, JSON.stringify(formatted)).correct).toBe(true);
  }
});
test("scientific distinctions and written exemplars remain honest rather than automatic marks", () => {
  for (const q of all) {
    expect(mark(q, q.answer)[q.rubric ? "selfReview" : "correct"], q.id).toBe(
      true,
    );
    if (q.rubric) {
      expect(mark(q, q.answer).correct).toBe(false);
      expect(q.referenceResponse).toBe(q.answer);
      expect(q.rubric.length).toBeGreaterThanOrEqual(3);
    }
  }
  const compost = all.find((q) => q.id === "cycle-v1-p-compost")!;
  expect(compost.answer).toContain("enzymes");
  expect(compost.answer).toContain("fungi");
  expect(compost.answer).toContain("mineral ions");
  expect(compost.answer).toContain("CO₂");
  expect(records.carbonateAtom.atom!.forms[0]).toBe("dissolvedCarbon");
  expect(records.fuelAtom.atom!.forms[0]).toBe("organicCarbon");
  expect(records.animalResp.feedback).toContain("anaerobic");
  expect(records.photosynthesis.feedback).toContain(
    "carbon dioxide + water → glucose + oxygen",
  );
  expect(records.plantResp.feedback).toContain(
    "glucose + oxygen → carbon dioxide + water",
  );
  expect(records.balanced.feedback).toContain("does not imply stopped");
  for (const q of all) expect(q.explanation).not.toMatch(/H₂\s+O|C₆\s+H₁₂/);
});
test("semantic aliases include old exposure and remain reciprocal/transitive; numerical transfer tasks stay reserved", () => {
  const candidates = [...lesson.questions, ...lesson.checks, ...all];
  for (const q of candidates)
    for (const a of q.exposureAliases ?? []) {
      const other = candidates.find((o) => o.id === a)!;
      expect(other, q.id + "→" + a).toBeDefined();
      expect(other.exposureAliases).toContain(q.id);
      for (const third of other.exposureAliases ?? [])
        if (third !== q.id) expect(q.exposureAliases).toContain(third);
    }
  for (const s of [
    "cA-budget",
    "cA-forest",
    "cB-ocean",
    "cB-regrowth",
    "cA-season",
    "cB-endpoints",
  ])
    expect(
      all.find((q) => q.id === "cycle-v1-" + s)!.exposureAliases ?? [],
    ).toEqual([]);
  expect(
    all.find((q) => q.id === "cycle-v1-p-photo")!.exposureAliases,
  ).toContain("carbon-cycle-0");
});
