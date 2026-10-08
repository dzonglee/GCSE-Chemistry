import { test, expect } from "@playwright/test";
import {
  pollutionJourney as j,
  allPollutionTasks as all,
  pollutionRecoveryRoutes,
} from "../src/content/journeys/air-pollutants";
import {
  pollutionRecords as records,
  pollutionChoices,
  pollutionNumeric,
  pollutionLabels,
  fieldsFor,
  initialPollution,
  validPollution,
  validPollutionHistory,
  pollutionNumber,
  checkPollution,
  atomTally,
  methaneCO,
} from "../src/lib/pollution";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
const lesson = lessons.find((l) => l.slug === "air-pollutants")!;
test("one authored lesson has84 tasks, six modes,20 reachable records and targeted recovery", () => {
  expect(lesson.journey).toBe(j);
  expect(all).toHaveLength(84);
  expect(new Set(all.map((q) => q.id)).size).toBe(84);
  expect(j.practice).toHaveLength(30);
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(pollutionRecoveryRoutes[q.id]);
    expect(
      j.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
  }
  for (const q of [
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ])
    expect(q.model, q.id).toBeUndefined();
  expect(Object.keys(records)).toHaveLength(20);
  expect(new Set(Object.values(records).map((r) => r.mode)).size).toBe(6);
  for (const record of Object.keys(records))
    expect(
      all.some(
        (q) =>
          q.model?.kind === "pollution-investigation" &&
          q.model.record === record,
      ),
      record,
    ).toBe(true);
});
test("fixed record proposals are checkable; every altered field retains wrong work and immutable sources", () => {
  const original = JSON.stringify(records);
  for (const [record, r] of Object.entries(records)) {
    const m = {
        kind: "pollution-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialPollution(r.mode, record)];
    expect(initialBoard(m)).toEqual(h[0]);
    expect(checkPollution(r.mode, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(m, h)).toBe(true);
    expect(checkBoard(m, h.at(-1)!).correct, record).toBe(true);
    for (const f of fieldsFor(r.mode, record)) {
      const wrong = pollutionNumeric.includes(f)
          ? "999"
          : pollutionChoices[f].find((v) => v !== r.expected[f])!,
        b = { ...h.at(-1)!, [f]: wrong };
      expect(validBoard(m, b)).toBe(true);
      expect(checkBoard(m, b).correct, record + "/" + f).toBe(false);
      expect(b[f]).toBe(wrong);
      expect(checkBoard(m, b).feedback).toContain("remains as entered");
    }
  }
  expect(JSON.stringify(records)).toBe(original);
});
test("saved schema/history rejects foreign sources, extra keys, substituted fields and automatic repairs", () => {
  const b = initialPollution("products", "complete");
  expect(
    validPollution("products", { ...b, record: "incomplete" }, "complete"),
  ).toBe(false);
  expect(validPollution("products", { ...b, co2: true })).toBe(false);
  expect(validPollution("products", { ...b, extra: "" })).toBe(false);
  expect(validPollution("products", [b])).toBe(false);
  expect(
    validPollutionHistory("products", "complete", [
      b,
      { ...b, co2: "possible", water: "possible" },
    ]),
  ).toBe(false);
  const n = initialPollution("balance", "balanceCO");
  expect(validPollution("balance", { ...n, a: "1..2" })).toBe(true);
  expect(
    checkPollution("balance", {
      ...n,
      ...records.balanceCO.expected,
      a: "1..2",
    }).correct,
  ).toBe(false);
  expect(pollutionNumber("1..2")).toBeNull();
  expect(pollutionNumber("1e3")).toBeNull();
  expect(pollutionNumber("1/2")).toBeNull();
});
test("atom conservation uses fixed formulae, all positive integer multiples and meaningful independent smallest coefficients", () => {
  const refs = {
    balanceCO: [2, 3, 2, 4],
    balanceSoot: [1, 1, 1, 2],
    balanceSulfur: [1, 1, 1],
    balanceNitrogen: [1, 1, 2],
  };
  for (const [record, nums] of Object.entries(refs)) {
    const r = records[record],
      keys = fieldsFor("balance", record);
    expect(keys.map((f) => Number(r.expected[f]))).toEqual(nums);
    const b = {
      ...initialPollution("balance", record),
      ...Object.fromEntries(keys.map((f, i) => [f, String(nums[i] * 3)])),
    };
    expect(checkPollution("balance", b).correct).toBe(true);
    for (const t of Object.values(atomTally(r.equation!, b)))
      expect(t.left).toBe(t.right);
    for (const raw of ["0", "-1", "2.5", "1..2"])
      expect(checkPollution("balance", { ...b, a: raw }).correct).toBe(false);
  }
  expect(atomTally(methaneCO, { a: "2", b: "3", c: "2", d: "4" })).toEqual({
    C: { left: 2, right: 2 },
    H: { left: 8, right: 8 },
    O: { left: 6, right: 6 },
  });
  for (const suffix of [
    "p-balanceCO",
    "p-balanceSoot",
    "p-balanceSulfur",
    "p-balanceNO",
    "cA-balance",
    "cB-balance",
  ]) {
    const q = all.find((q) => q.id === "pollution-v1-" + suffix)!;
    expect(q.prompt).toContain("smallest positive whole-number");
    const vals = JSON.parse(q.answer);
    expect(mark(q, q.answer).correct).toBe(true);
    expect(
      mark(
        q,
        JSON.stringify(
          Object.fromEntries(
            Object.entries(vals).map(([k, v]) => [k, String(Number(v) * 2)]),
          ),
        ),
      ).correct,
    ).toBe(false);
    const tally = atomTally(q.pollutionGiven!.equation!, vals);
    for (const t of Object.values(tally)) expect(t.left, q.id).toBe(t.right);
  }
});
test("product possibilities distinguish complete, mixed incomplete, supplied elements and very hot air", () => {
  expect(records.complete.expected).toEqual({
    co2: "possible",
    water: "possible",
    co: "absent",
    soot: "absent",
    so2: "absent",
    nox: "absent",
  });
  expect(records.incomplete.expected).toEqual({
    co2: "possible",
    water: "possible",
    co: "possible",
    soot: "possible",
    so2: "absent",
    nox: "absent",
  });
  expect(records.hydrogen.expected).toEqual({
    co2: "absent",
    water: "possible",
    co: "absent",
    soot: "absent",
    so2: "absent",
    nox: "possible",
  });
  expect(records.carbon.expected).toEqual({
    co2: "possible",
    water: "absent",
    co: "absent",
    soot: "absent",
    so2: "possible",
    nox: "absent",
  });
  expect(records.nitrogen.expected).toEqual({
    origin: "airNitrogen",
    partner: "oxygen",
    condition: "highTemperature",
  });
  expect(records.sulfur.expected.origin).toBe("fuelSulfur");
  expect(records.shortage.expected.condition).toBe("limitedOxygen");
});
test("fuel and monitoring quantities are recomputed from immutable supplied values", () => {
  for (const record of ["equal", "unequal"]) {
    const r = records[record],
      masses = r
        .fuels!.map((f) => ({
          id: f.name,
          n: (f.mass * 1000 * f.sulfur) / 100,
        }))
        .sort((a, b) => b.n - a.n);
    expect(masses[0].id).toBe(r.expected.mostSulfur);
    expect(masses[0].n).toBe(Number(r.expected.sulfurMass));
  }
  for (const record of ["filter", "desulfur", "oxygenControl"]) {
    const r = records[record],
      m = r.monitor!;
    expect(m.before - m.after).toBe(Number(r.expected.removed));
    expect(((m.before - m.after) / m.before) * 100).toBe(
      Number(r.expected.reduction),
    );
    expect(m.after).toBeGreaterThan(0);
  }
  const scalar: Record<string, number> = {
    "w-percent": 10,
    "w-change": 15,
    "r-balanceCO": 6,
    "r-balanceSoot": 4,
    "r-balanceSulfur": 1,
    "r-balanceNitrogen": 2,
    "r-equal": 20,
    "r-unequal": 30,
    "r-filter": 75,
    "r-desulfur": 75,
    "r-oxygenControl": 75,
    "g-balance": 3,
    "g-fuels": 20,
    "g-control": 75,
    "p-unequal": 32,
    "p-filter": 80,
    "cA-sulfur": 8,
    "cB-sulfur": 21,
    "vA-sulfur": 4,
    "vA-filter": 60,
    "vB-sulfur": 12,
    "vB-control": 60,
  };
  expect(all.filter((q) => !q.options && !q.parts && !q.rubric)).toHaveLength(
    22,
  );
  for (const [s, n] of Object.entries(scalar)) {
    const q = all.find((q) => q.id === "pollution-v1-" + s)!;
    expect(q.answer).toBe(String(n));
    expect(mark(q, String(n)).correct).toBe(true);
    expect(mark(q, String(n + 1)).correct).toBe(false);
    expect(mark(q, String(n) + "e0").correct).toBe(true);
  }
  const constructions = all.filter((q) => q.parts);
  expect(constructions).toHaveLength(9);
  expect(constructions.flatMap((q) => q.parts!)).toHaveLength(28);
  for (const q of constructions) {
    expect(mark(q, q.answer).correct, q.id).toBe(true);
    const raw = JSON.parse(q.answer),
      first = q.parts![0].id;
    expect(
      mark(
        q,
        JSON.stringify({ ...raw, [first]: String(Number(raw[first]) + 1) }),
      ).correct,
    ).toBe(false);
    expect(
      mark(q, JSON.stringify({ ...raw, [first]: Number(raw[first]) })).invalid,
    ).toBe(true);
  }
});
test("explanations remain honest self-review and include explicit reference responses", () => {
  for (const q of all.filter((q) => q.rubric)) {
    expect(q.referenceResponse).toBe(q.answer);
    expect(q.rubric!.length).toBeGreaterThanOrEqual(3);
    const m = mark(q, q.answer);
    expect(m.selfReview).toBe(true);
    expect(m.correct).toBe(false);
    expect(mark(q, "Every pollutant is always harmless.").correct).toBe(false);
  }
  expect(
    all.find((q) => q.id === "pollution-v1-p-particulateRange")!.explanation,
  ).toContain("unburned hydrocarbons");
});
test("semantic exposure is reciprocal and transitive across legacy tasks without exposing fresh inventories", () => {
  const candidates = [...lesson.questions, ...lesson.checks, ...all];
  for (const q of candidates)
    for (const alias of q.exposureAliases ?? []) {
      const other = candidates.find((o) => o.id === alias)!;
      expect(other, q.id + "→" + alias).toBeDefined();
      expect(other.exposureAliases).toContain(q.id);
      for (const third of other.exposureAliases ?? [])
        if (third !== q.id) expect(q.exposureAliases).toContain(third);
    }
  for (const s of [
    "cA-sulfur",
    "cB-sulfur",
    "cA-control",
    "cB-control",
    "cA-balance",
    "cB-balance",
  ])
    expect(
      all.find((q) => q.id === "pollution-v1-" + s)!.exposureAliases ?? [],
    ).toEqual([]);
  expect(
    all.find((q) => q.id === "pollution-v1-p-nitrogen")!.exposureAliases,
  ).toContain("air-pollutants-1");
});

test("chemical formula labels preserve molecular grouping without inserted spaces", () => {
  expect(pollutionLabels.water).toBe("Water (H₂O)");
  for (const q of all)
    expect(q.explanation).not.toMatch(/H₂\s+O|C₂\s+H₆|C₃\s+H₈/);
});
