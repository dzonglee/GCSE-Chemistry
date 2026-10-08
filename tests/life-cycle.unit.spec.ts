import { test, expect } from "@playwright/test";
import {
  allLcaTasks as all,
  lcaJourney as j,
  lcaRecoveryRoutes,
} from "../src/content/journeys/life-cycle-assessment";
import {
  lcaRecords as R,
  lcaFields,
  lcaNumeric,
  lcaChoices,
  lcaNumber,
  initialLca,
  validLca,
  validLcaHistory,
  checkLca,
  boundarySubtotal,
} from "../src/lib/life-cycle";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
test("one67-task shared lifecycle lesson has six deliberate activities and15 sources with faded independent support", () => {
  const l = lessons.find((l) => l.slug === "life-cycle-and-recycling")!;
  expect(l.journey).toBe(j);
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(all).toHaveLength(67);
  expect(new Set(all.map((q) => q.id)).size).toBe(67);
  expect(j.refresher).toHaveLength(16);
  expect(j.guided).toHaveLength(6);
  expect(j.practice).toHaveLength(23);
  expect(j.checkForms.map((f) => f.length)).toEqual([6, 6]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  expect(Object.keys(R)).toHaveLength(15);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(lcaRecoveryRoutes[q.id]);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ])
    expect(q.model).toBeUndefined();
  for (const record of Object.keys(R))
    expect(
      j.refresher.some(
        (q) =>
          q.model?.kind === "life-cycle-investigation" &&
          q.model.record === record,
      ),
    ).toBe(true);
});
test("wrong lifecycle proposals preserve original sources and strictly one-field histories", () => {
  const sources = JSON.stringify(R);
  for (const [record, r] of Object.entries(R)) {
    const m = {
        kind: "life-cycle-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialLca(r.mode, record)];
    expect(initialBoard(m)).toEqual(h[0]);
    expect(checkBoard(m, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(m, h)).toBe(true);
    expect(checkBoard(m, h.at(-1)!).correct, record).toBe(true);
    for (const f of lcaFields[r.mode]) {
      const v = lcaNumeric.includes(f)
          ? "999"
          : lcaChoices[f].find((v) => v !== r.expected[f])!,
        b = { ...h.at(-1)!, [f]: v };
      expect(validBoard(m, b)).toBe(true);
      expect(checkBoard(m, b).correct).toBe(false);
      expect(checkBoard(m, b).feedback).toContain("remains as entered");
      expect(b[f]).toBe(v);
    }
  }
  expect(JSON.stringify(R)).toBe(sources);
});
test("invalid numeric strings stay raw while foreign sources and forged histories are rejected", () => {
  const b = initialLca("inventory", "totals");
  for (const v of [
    { ...b, record: "signed" },
    { ...b, aTotal: 400 },
    { ...b, extra: "" },
    [b],
    { ...b, record: "__proto__" },
  ])
    expect(validLca("inventory", v, "totals")).toBe(false);
  const wrong = { ...b, aTotal: "1..2" };
  expect(validLca("inventory", wrong, "totals")).toBe(true);
  expect(lcaNumber(wrong.aTotal)).toBeNull();
  expect(checkLca("inventory", wrong).correct).toBe(false);
  expect(wrong.aTotal).toBe("1..2");
  expect(validLcaHistory("inventory", "totals", [b, wrong])).toBe(true);
  expect(validLcaHistory("inventory", "totals", [wrong])).toBe(false);
  expect(
    validLcaHistory("inventory", "totals", [
      b,
      { ...b, aTotal: "400", bTotal: "350" },
    ]),
  ).toBe(false);
  expect(validLcaHistory("inventory", "totals", [b, b])).toBe(false);
  expect(validLcaHistory("inventory", "totals", [])).toBe(false);
  for (const v of ["", " ", "1e3", "1/2", "NaN", "Infinity", "1..2"])
    expect(lcaNumber(v)).toBeNull();
  expect(lcaNumber("-60")).toBe(-60);
});
test("boundary selections can reverse an advert but unknown entries never silently become zero", () => {
  const b = initialLca("boundary", "reversed");
  expect(boundarySubtotal(R.reversed, b)).toBeNull();
  const partial = {
    ...b,
    raw: "include",
    make: "include",
    use: "exclude",
    end: "exclude",
    transport: "within",
  };
  expect(boundarySubtotal(R.reversed, partial)).toEqual({ a: 120, b: 200 });
  expect(checkLca("boundary", partial).correct).toBe(false);
  expect(
    boundarySubtotal(R.reversed, {
      ...partial,
      use: "include",
      end: "include",
    }),
  ).toEqual({ a: 300, b: 240 });
  expect(boundarySubtotal(R.reversed, partial)).toEqual({ a: 120, b: 200 });
  expect(R.reversed.energy!.reduce((n, r) => n + r.a, 0)).toBe(300);
});
test("24 native numeric references derive from stage sums, equal service and conditional sorted recoveries", () => {
  const refs: Record<string, number[]> = {
    totals: [400, 350, 50],
    signed: [200, 260, -60],
    short: [1080, 108, 600],
    tie: [1200, 60, 1200],
    long: [1320, 44, 1800],
    glass: [72, 28, 28],
    polymer: [60, 60, 30],
    steel: [144, 56, 56],
  };
  let count = 0;
  for (const [record, r] of Object.entries(R)) {
    const nums = lcaFields[r.mode]
      .filter((f) => lcaNumeric.includes(f))
      .map((f) => Number(r.expected[f]));
    count += nums.length;
    if (!nums.length) continue;
    expect(nums).toEqual(refs[record]);
    if (r.energy) {
      const a = r.energy.reduce((n, x) => n + x.a, 0),
        b = r.energy.reduce((n, x) => n + x.b, 0);
      expect(nums).toEqual([a, b, a - b]);
    }
    if (r.service) {
      const d = r.service,
        total = d.fixed + d.wash * d.uses;
      expect(nums).toEqual([total, total / d.uses, d.single * d.uses]);
    }
    if (r.recycling) {
      const d = r.recycling,
        usable = (d.sorted * d.yield) / 100;
      expect(nums).toEqual([usable, d.collected - usable, d.demand - usable]);
    }
  }
  expect(count).toBe(24);
  expect(R.short.expected.choice).toBe("single");
  expect(R.tie.expected.choice).toBe("equal");
  expect(R.long.expected.choice).toBe("reusable");
  expect(960 + 20 * 12).toBe(20 * 60);
  expect(960 + 21 * 12).toBeLessThan(21 * 60);
});
test("26 scalar answers and eight independent24-field constructions match separately audited references", () => {
  const refs: Record<string, number> = {
    "w-divide": 50,
    "w-percent": 60,
    "r-full": 400,
    "r-reversed": 300,
    "r-totals": 350,
    "r-signed": -60,
    "r-short": 108,
    "r-tie": 60,
    "r-long": 44,
    "r-glass": 72,
    "r-polymer": 30,
    "r-steel": 144,
    "g-boundary": 400,
    "g-inventory": 50,
    "g-reuse": 44,
    "g-recycle": 28,
    "p-graph": 80,
    "p-percent": 10,
    "p-crossover": 22,
    "p-yield": 60,
    "cA-percent": 16,
    "cB-percent": 72,
    "vA-service": 42,
    "vB-newInput": 40,
    "r-scale": 64000,
    "p-energyMass": 60000,
  };
  const qs = all.filter((q) => !q.options && !q.parts && !q.rubric);
  expect(qs).toHaveLength(26);
  for (const q of qs) {
    const n = refs[q.id.replace("lca-v1-", "")];
    expect(Number(q.answer), q.id).toBe(n);
    expect(mark(q, String(n)).correct).toBe(true);
    expect(mark(q, String(n + 1)).correct).toBe(false);
  }
  const builds: Record<string, number[]> = {
    "p-total": [200, 180, 20],
    "p-reuse": [1140, 38, 1500, 360],
    "p-tradeNumbers": [60, 3],
    "p-glass": [96, 64, 54],
    "cA-energy": [500, 420, 80],
    "cA-reuse": [990, 33, 1350],
    "cB-energy": [300, 340, -40],
    "cB-recovery": [180, 70, 40],
  };
  const cs = all.filter((q) => q.parts);
  expect(cs).toHaveLength(8);
  expect(cs.flatMap((q) => q.parts!)).toHaveLength(24);
  for (const q of cs) {
    expect(q.parts!.map((p) => p.answer)).toEqual(
      builds[q.id.replace("lca-v1-", "")],
    );
    expect(mark(q, q.answer).correct).toBe(true);
    const bad = JSON.parse(q.answer);
    bad[q.parts![0].id] = "999";
    expect(mark(q, JSON.stringify(bad)).correct).toBe(false);
  }
  expect((1000 / 5) * 320).toBe(64000);
  expect((2000 / 8) * 240).toBe(60000);
  expect(
    mark(
      all.find((q) => q.id === "lca-v1-p-energyMass")!,
      "6e4",
    ).correct,
  ).toBe(true);
  expect(840 + 21 * 10).toBe(21 * 50);
  expect(840 + 22 * 10).toBeLessThan(22 * 50);
  expect(((200 - 180) / 200) * 100).toBe(10);
  expect((96 / 160) * 100).toBe(60);
  expect((180 / 250) * 100).toBe(72);
  expect((540 + 15 * 6) / 15).toBe(42);
  expect(160 - 150 * 0.8).toBe(40);
});
test("paper/plastic trade-offs and thirteen extended responses preserve honest manually reviewed judgement", () => {
  expect(R.bags.expected).toEqual({
    energyChoice: "a",
    waterChoice: "a",
    wasteChoice: "b",
    judgement: "conditional",
  });
  expect(R.waterPriority.expected).toEqual({
    energyChoice: "a",
    waterChoice: "b",
    wasteChoice: "equal",
    judgement: "conditional",
  });
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(13);
  for (const q of written) {
    expect(q.referenceResponse).toBe(q.answer);
    expect(mark(q, q.answer).selfReview).toBe(true);
    expect(mark(q, q.answer).correct).toBe(false);
  }
  for (const q of all)
    if (q.lcaGiven) {
      expect(Object.keys(q.lcaGiven)).not.toContain("expected");
      expect(Object.keys(q.lcaGiven)).not.toContain("feedback");
      expect(Object.keys(q.lcaGiven)).not.toContain("mode");
    }
  expect(j.outcomes!.join(" ")).toMatch(/paper\/plastic/);
  expect(j.outcomes!.join(" ")).toMatch(/graph/);
  expect(j.scopeNote).toMatch(/manually/);
});
test("six old facts and repeated theory are reciprocally exposed but fresh reserved numerical data stay distinct", () => {
  const l = lessons.find((l) => l.slug === "life-cycle-and-recycling")!,
    legacy = [...l.questions, ...l.checks],
    candidates = lessons.flatMap((l) => [
      ...l.questions,
      ...l.checks,
      ...(l.journey
        ? [
            ...l.journey.warmup,
            ...l.journey.refresher,
            ...l.journey.guided,
            ...l.journey.practice,
            ...l.journey.checkForms.flat(),
            ...l.journey.reviewForms.flat(),
          ]
        : []),
    ]);
  for (let i = 0; i < 6; i++) {
    const q = legacy.find((q) => q.id === "life-cycle-and-recycling-" + i)!;
    expect(q).toBeTruthy();
    expect(q.exposureAliases!.some((a) => a.startsWith("lca-v1-"))).toBe(true);
    for (const a of q.exposureAliases!) {
      const match = candidates.find((q) => q.id === a)!;
      expect(match).toBeTruthy();
      expect(match.exposureAliases).toContain(q.id);
    }
  }
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()].filter(
    (q) => q.parts || (!q.options && !q.rubric),
  ))
    expect(q.exposureAliases ?? []).toEqual([]);
  expect(
    all.find((q) => q.id === "lca-v1-g-stages")!.exposureAliases,
  ).toContain("lca-v1-p-stage");
});
