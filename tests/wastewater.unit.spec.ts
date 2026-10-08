import { test, expect } from "@playwright/test";
import {
  wasteJourney as j,
  allWasteTasks as all,
  wasteRecoveryRoutes,
} from "../src/content/journeys/wastewater";
import {
  wasteRecords as R,
  wasteFields,
  wasteNumeric,
  wasteChoices,
  initialWaste,
  validWaste,
  validWasteHistory,
  checkWaste,
  wasteNumber,
} from "../src/lib/wastewater";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
test("one individually researched64-task wastewater journey has six activities and15 source cases", () => {
  expect(
    lessons.find((l) => l.slug === "wastewater-and-treatment")!.journey,
  ).toBe(j);
  expect(all).toHaveLength(64);
  expect(new Set(all.map((q) => q.id)).size).toBe(64);
  expect(Object.keys(R)).toHaveLength(15);
  expect(j.refresher).toHaveLength(15);
  expect(j.guided).toHaveLength(6);
  expect(j.practice).toHaveLength(21);
  expect(j.checkForms.map((f) => f.length)).toEqual([6, 6]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(wasteRecoveryRoutes[q.id]);
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
          q.model?.kind === "wastewater-investigation" &&
          q.model.record === record,
      ),
    ).toBe(true);
});
test("each native proposal preserves wrong work, immutable givens and source-bound single-field history", () => {
  const original = JSON.stringify(R);
  for (const [record, r] of Object.entries(R)) {
    const m = {
        kind: "wastewater-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialWaste(r.mode, record)];
    expect(initialBoard(m)).toEqual(h[0]);
    expect(checkBoard(m, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(m, h)).toBe(true);
    expect(checkBoard(m, h.at(-1)!).correct, record).toBe(true);
    for (const f of wasteFields[r.mode]) {
      const v = wasteNumeric.includes(f)
          ? "999"
          : wasteChoices[f].find((v) => v !== r.expected[f])!,
        b = { ...h.at(-1)!, [f]: v };
      expect(validBoard(m, b)).toBe(true);
      expect(checkBoard(m, b).correct).toBe(false);
      expect(checkBoard(m, b).feedback).toContain("remains as entered");
      expect(b[f]).toBe(v);
    }
  }
  expect(JSON.stringify(R)).toBe(original);
});
test("malformed numbers remain raw but foreign data, forged history and multi-field repairs are rejected", () => {
  const b = initialWaste("solids", "solidsA");
  for (const v of [
    { ...b, record: "solidsB" },
    { ...b, after: 100 },
    { ...b, extra: "" },
    [b],
  ])
    expect(validWaste("solids", v, "solidsA")).toBe(false);
  expect(
    validWasteHistory("solids", "solidsA", [
      b,
      { ...b, after: "100", remaining: "10" },
    ]),
  ).toBe(false);
  expect(validWasteHistory("solids", "solidsA", [{ ...b, after: "100" }])).toBe(
    false,
  );
  const raw = { ...b, ...R.solidsA.expected, after: "1..2" };
  expect(validWaste("solids", raw)).toBe(true);
  expect(checkWaste("solids", raw).correct).toBe(false);
  expect(raw.after).toBe("1..2");
  for (const v of ["", "1..2", "1e3", "1/2", "Infinity"])
    expect(wasteNumber(v)).toBeNull();
});
test("twelve native numeric references independently close physical and disposal inventories", () => {
  const refs: Record<string, number[]> = {
    solidsA: [100, 10],
    solidsB: [70, 14],
    solidsC: [35, 7],
    disposeA: [900, 0.2, 20],
    disposeB: [1300, 0.15, 15],
  };
  for (const [k, nums] of Object.entries(refs)) {
    const r = R[k];
    expect(
      wasteFields[r.mode]
        .filter((f) => wasteNumeric.includes(f))
        .map((f) => Number(r.expected[f])),
    ).toEqual(nums);
    if (r.solids) {
      const { feed, screen, grit, sludge } = r.solids;
      expect(feed - screen - grit).toBeCloseTo(nums[0]);
      expect(feed - screen - grit - sludge).toBeCloseTo(nums[1]);
    }
    if (r.disposal) {
      const total = Object.values(r.disposal).reduce((a, b) => a + b, 0);
      expect(total).toBe(nums[0]);
      expect(r.disposal.burn / total).toBeCloseTo(nums[1]);
      expect((r.disposal.burn / total) * 100).toBeCloseTo(nums[2]);
    }
  }
  expect(Object.values(refs).flat()).toHaveLength(12);
});
test("all scalar and independent construction answers match separately audited literal arithmetic", () => {
  const refs: Record<string, number> = {
    "w-part": 30,
    "w-balance": 8,
    "r-solidsA": 10,
    "r-solidsB": 14,
    "r-solidsC": 7,
    "r-disposeA": 20,
    "r-disposeB": 15,
    "g-solids": 10,
    "g-disposal": 20,
    "p-round": 15.4,
    "p-wrongWhole": 12,
    "p-relative": 37.5,
    "p-reduction": 87.5,
    "cA-percent": 15,
    "cA-points": 12,
    "cB-round": 15.2,
    "cB-relative": 25,
    "vA-share": 20,
    "vB-solids": 7,
  };
  const scalars = all.filter((q) => !q.options && !q.parts && !q.rubric);
  expect(scalars).toHaveLength(19);
  for (const q of scalars) {
    const n = refs[q.id.replace("waste-v1-", "")];
    expect(Number(q.answer)).toBe(n);
    expect(mark(q, String(n)).correct).toBe(true);
    expect(mark(q, String(n + 1)).correct).toBe(false);
  }
  const constructions: Record<string, number[]> = {
    "p-solids": [120, 24],
    "p-disposal": [1200, 0.18, 18],
    "p-trend": [40, 55, 15],
    "cA-solids": [150, 30],
    "cB-solids": [60, 9],
  };
  const qs = all.filter((q) => q.parts);
  expect(qs).toHaveLength(5);
  for (const q of qs) {
    expect(q.parts!.map((p) => p.answer)).toEqual(
      constructions[q.id.replace("waste-v1-", "")],
    );
    expect(mark(q, q.answer).correct).toBe(true);
    const wrong = JSON.parse(q.answer);
    wrong[q.parts![0].id] = "999";
    expect(mark(q, JSON.stringify(wrong)).correct).toBe(false);
  }
  expect((173 / 1120) * 100).toBeCloseTo(15.44642857);
  expect((187 / 1230) * 100).toBeCloseTo(15.20325203);
  expect(((55 - 40) / 40) * 100).toBe(37.5);
  expect(((48 - 6) / 48) * 100).toBe(87.5);
});
test("written answers are manual and source data contain no hidden expected fields", () => {
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(11);
  for (const q of written) {
    expect(q.referenceResponse).toBe(q.answer);
    expect(mark(q, q.answer).selfReview).toBe(true);
    expect(mark(q, q.answer).correct).toBe(false);
  }
  for (const q of all)
    if (q.wasteGiven) {
      expect(Object.keys(q.wasteGiven)).not.toContain("expected");
      expect(Object.keys(q.wasteGiven)).not.toContain("feedback");
    }
  expect(j.scopeNote).toContain("cross-science");
  expect(j.scopeNote).toContain("not a required practical");
  expect(R.raw.expected).toEqual({
    first: "screen",
    next: "sediment",
    sludge: "anaerobic",
    effluent: "aerobic",
  });
  expect(R.discharge.expected.drink).toBe("no");
  expect(R.industrial.expected.drink).toBe("no");
  expect(R.factory.feedback).toContain("alone does not remove");
});
test("repeated theory and legacy exposures close symmetrically while reserved new numbers remain separate", () => {
  const l = lessons.find((l) => l.slug === "wastewater-and-treatment")!;
  for (const q of [...all, ...l.questions, ...l.checks])
    for (const a of q.exposureAliases ?? []) {
      const other = [...all, ...l.questions, ...l.checks].find(
        (o) => o.id === a,
      );
      expect(other, a).toBeDefined();
      expect(other!.exposureAliases).toContain(q.id);
    }
  const g = all.find((q) => q.id === "waste-v1-g-route")!,
    c = all.find((q) => q.id === "waste-v1-cA-pair")!;
  expect(c.exposureAliases).toContain(g.id);
  for (const s of [
    "cA-solids",
    "cA-percent",
    "cB-solids",
    "cB-round",
    "vA-share",
    "vB-solids",
  ])
    expect(
      all.find((q) => q.id === "waste-v1-" + s)!.exposureAliases,
    ).toBeUndefined();
});
