import { test, expect } from "@playwright/test";
import {
  climateJourney as j,
  allClimateTasks as all,
  climateRecoveryRoutes,
} from "../src/content/journeys/climate-evidence";
import {
  climateRecords as records,
  climateFields as fields,
  climateChoices as choices,
  climateNumeric as numeric,
  initialClimate,
  validClimate,
  validClimateHistory,
  climateNumber,
  checkClimate,
} from "../src/lib/climate";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
const lesson = lessons.find((l) => l.slug === "climate-evidence")!;
test("one individually authored lesson: seven activities,17 fixed sources,77 tasks and specific recovery", () => {
  expect(lesson.journey).toBe(j);
  expect(lesson.course).toBe("combined");
  expect(all).toHaveLength(77);
  expect(new Set(all.map((q) => q.id)).size).toBe(77);
  expect(j.practice).toHaveLength(27);
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(climateRecoveryRoutes[q.id]);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  expect(all.find((q) => q.id === "climate-v1-p-effects")!.followUp).toBe(
    "climate-v1-r-effects",
  );
  expect(all.find((q) => q.id === "climate-v1-p-efficiency")!.followUp).toBe(
    "climate-v1-r-efficiency",
  );
  for (const q of [
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ])
    expect(q.model).toBeUndefined();
  expect(Object.keys(records)).toHaveLength(17);
  expect(new Set(Object.values(records).map((r) => r.mode)).size).toBe(7);
  for (const record of Object.keys(records))
    expect(
      all.some(
        (q) =>
          q.model?.kind === "climate-investigation" &&
          q.model.record === record,
      ),
      record,
    ).toBe(true);
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "climate-evidence-" + i),
  );
});
test("scientific construction accepts all records; every wrong field stays wrong and source data stay fixed", () => {
  const original = JSON.stringify(records);
  for (const [record, r] of Object.entries(records)) {
    const m = { kind: "climate-investigation" as const, mode: r.mode, record },
      h = [initialClimate(r.mode, record)];
    expect(initialBoard(m)).toEqual(h[0]);
    expect(checkClimate(r.mode, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected))
      h.push({ ...h.at(-1)!, [f]: v });
    expect(validHistory(m, h)).toBe(true);
    expect(checkBoard(m, h.at(-1)!).correct).toBe(true);
    for (const f of fields[r.mode]) {
      const wrong = numeric.includes(f)
          ? "999"
          : choices[f].find((v) => v !== r.expected[f])!,
        b = { ...h.at(-1)!, [f]: wrong };
      expect(validBoard(m, b)).toBe(true);
      expect(checkBoard(m, b).correct).toBe(false);
      expect(checkBoard(m, b).feedback).toContain("remains as entered");
      expect(b[f]).toBe(wrong);
    }
  }
  expect(JSON.stringify(records)).toBe(original);
});
test("record/schema/history binding rejects substituted sources and preserves malformed decimal entries", () => {
  const a = initialClimate("trend", "trend"),
    m = {
      kind: "climate-investigation" as const,
      mode: "trend" as const,
      record: "trend",
    };
  expect(validBoard(m, { ...a, record: "fluctuations" })).toBe(false);
  expect(checkBoard(m, { ...a, record: "fluctuations" }).correct).toBe(false);
  expect(validClimate("trend", { ...a, newPoint: "0" })).toBe(false);
  expect(
    validClimate("trend", Object.assign(Object.create({ foo: 1 }), a)),
  ).toBe(false);
  expect(validHistory(m, [{ ...a, start: "-0.2" }])).toBe(false);
  expect(validHistory(m, [a, { ...a, start: "-0.2", end: "0.6" }])).toBe(false);
  expect(validHistory(m, [a, a])).toBe(false);
  expect(validHistory(m, [a, { ...a, start: "1..2" }])).toBe(true);
  expect(validHistory(m, [a, { ...a, start: "+" }])).toBe(true);
  for (const raw of ["1e3", "5 mol", "NaN"]) {
    expect(validHistory(m, [a, { ...a, start: raw }])).toBe(true);
    expect(checkBoard(m, { ...a, start: raw }).correct).toBe(false);
  }
  expect(validHistory(m, [a, { ...a, start: "1".repeat(17) }])).toBe(false);
  expect(validHistory(m, [a, { ...a, start: "-999" }])).toBe(true);
  expect(validHistory(m, [a, { ...a, start: "Infinity" }])).toBe(true);
  expect(checkBoard(m, { ...a, start: "Infinity" }).correct).toBe(false);
  expect(
    validClimateHistory(
      "trend",
      "trend",
      Array.from({ length: 501 }, (_, i) => ({ ...a, start: String(i % 2) })),
    ),
  ).toBe(false);
  for (const raw of ["", "+", "1..2", "NaN", "1e3", "1/2"])
    expect(climateNumber(raw)).toBeNull();
  for (const [raw, n] of [
    ["-.3", -0.3],
    ["+0.8", 0.8],
    [".06", 0.06],
    ["0.0", 0],
  ] as const)
    expect(climateNumber(raw)).toBe(n);
});
test("23 scalar answers independently recomputed with signed values, consistent masses and original denominator", () => {
  const refs: Record<string, number> = {
    "w-mass": 0.5,
    "w-change": 0.4,
    "r-fluctuations": 0.8,
    "r-cooling": -0.3,
    "r-history": 0.2,
    "r-inventory": 115,
    "r-gas": 19,
    "r-service": 50,
    "r-efficiency": 10,
    "g-trend": 0.8,
    "g-range": 0.8,
    "g-boundary": 80,
    "g-equivalents": 64,
    "g-comparison": 70,
    "p-range": 0.9,
    "p-boundary": 84,
    "p-units": 1206,
    "p-percent": 60,
    "p-efficiency": 9,
    "cA-gases": 39,
    "cB-width": 1.1,
    "vB-percent": 60,
    "vB-range": 0.5,
  };
  expect(all.filter((q) => !q.options && !q.parts && !q.rubric)).toHaveLength(
    23,
  );
  for (const [s, n] of Object.entries(refs)) {
    const q = all.find((q) => q.id === "climate-v1-" + s)!;
    expect(Number(q.answer), s).toBe(n);
    expect(mark(q, String(n)).correct, s).toBe(true);
    expect(mark(q, String(n + 1)).correct, s).toBe(false);
  }
});
test("seven independent constructions,18 numeric fields: fraction/scientific readings and wrong values", () => {
  const refs: Record<string, number[]> = {
    "p-graph": [-0.3, 0.5, 0.8],
    "p-gases": [10, 20],
    "p-service": [0.2, 0.1, 50],
    "cA-graph": [-0.3, 0.8, 1.1],
    "cB-service": [0.2, 0.06, 70],
    "cB-gases": [6, 36],
    "vA-gases": [6, 24],
  };
  expect(all.filter((q) => q.parts)).toHaveLength(7);
  expect(all.flatMap((q) => q.parts ?? [])).toHaveLength(18);
  for (const [s, ns] of Object.entries(refs)) {
    const q = all.find((q) => q.id === "climate-v1-" + s)!;
    expect(
      q.parts!.map((p) => p.answer),
      s,
    ).toEqual(ns);
    const values = Object.fromEntries(
        q.parts!.map((p, i) => [p.id, String(ns[i])]),
      ),
      alternative = Object.fromEntries(
        q.parts!.map((p, i) => [p.id, i % 2 ? `${ns[i]}e0` : `${ns[i] * 2}/2`]),
      );
    expect(mark(q, JSON.stringify(values)).correct).toBe(true);
    expect(mark(q, JSON.stringify(alternative)).correct).toBe(true);
    values[q.parts![0].id] = "999";
    expect(mark(q, JSON.stringify(values)).correct).toBe(false);
  }
});
test("fixed original graph, range, gas and achieved-service arithmetic agree with independent science checks", () => {
  for (const r of Object.values(records)) {
    if (r.graph) {
      const a = r.graph.points[0].anomaly,
        b = r.graph.points.at(-1)!.anomaly;
      expect(Number(r.expected.start)).toBe(a);
      expect(Number(r.expected.end)).toBe(b);
      expect(Number(r.expected.change)).toBeCloseTo(b - a, 8);
      expect(r.expected.direction).toBe(b > a ? "up" : b < a ? "down" : "flat");
      expect(r.note).toContain("teaching");
    }
    if (r.range) {
      expect(Number(r.expected.width)).toBeCloseTo(
        r.range.high - r.range.low,
        8,
      );
      expect(r.expected.meaning).toBe("supportedRange");
    }
    if (r.gases) {
      expect(r.gases.horizon).toContain("100-year");
      expect(Number(r.expected.methaneEquivalent)).toBeCloseTo(
        r.gases.methane * r.gases.factor,
        8,
      );
      expect(Number(r.expected.totalEquivalent)).toBeCloseTo(
        r.gases.co2 + r.gases.methane * r.gases.factor,
        8,
      );
    }
    if (r.comparison) {
      const { a, b } = r.comparison,
        pa = a.total / a.uses,
        pb = b.total / b.uses;
      expect(Number(r.expected.perA)).toBeCloseTo(pa, 8);
      expect(Number(r.expected.perB)).toBeCloseTo(pb, 8);
      expect(Number(r.expected.reductionPercent)).toBeCloseTo(
        ((pa - pb) / pa) * 100,
        8,
      );
    }
  }
  expect(records.advertisement.stages!.reduce((n, r) => n + r.amount, 0)).toBe(
    80,
  );
  expect(records.advertisement.expected.omitted).toBe("useStage");
  expect(records.kettle.expected.omitted).toBe("none");
  expect(records.advertisement.expected.scope).toBe("allGHG");
});
test("report quality distinguishes uncertainty, causation, scrutiny and funding without false balance", () => {
  expect(records.weather.expected.inference).toBe("tooNarrow");
  expect(records.transparent.expected.inference).toBe("supportedTrend");
  expect(records.correlation.expected.inference).toBe("notCauseAlone");
  expect(records.funding.expected.inference).toBe("scrutinise");
  expect(records.correlation.feedback).toContain(
    "does not make every explanation equally supported",
  );
  expect(records.transparent.feedback).toContain("not a guarantee");
  expect(records.projection.feedback).toContain(
    "equal likelihood cannot be inferred",
  );
  expect(records.historical.feedback).toContain("uneven locations");
  expect(records.solar.expected).toEqual({
    action: "solarAction",
    gas: "co2",
    process: "lessCombustion",
    limit: "variableSupply",
  });
  expect(records.landfill.expected).toEqual({
    action: "captureAction",
    gas: "ch4",
    process: "captureMethane",
    limit: "leaks",
  });
  expect(records.landfill.feedback).toContain("makes CO₂ and water");
});
test("16 honest written responses include four distinct effects; all choice errors have specific explanations", () => {
  expect(all.filter((q) => q.rubric)).toHaveLength(16);
  for (const q of all) {
    if (q.options) {
      expect(q.options).toContain(q.answer);
      for (const o of q.options.filter((o) => o !== q.answer))
        expect(q.misconceptions?.[o]?.length, o).toBeGreaterThan(20);
    }
    if (q.rubric) {
      expect(mark(q, q.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
      expect(q.rubric.length).toBeGreaterThanOrEqual(3);
      expect(q.referenceResponse).toBe(q.answer);
    }
  }
  for (const s of ["p-effects", "cA-effects", "cB-effects", "vB-effects"]) {
    const q = all.find((q) => q.id === "climate-v1-" + s)!;
    expect(q.rubric).toHaveLength(5);
    expect(q.answer).toContain("land ice");
    expect(q.answer).toContain("rainfall");
    expect(q.answer).toContain("extreme weather");
    expect(q.answer).toContain("Habitats");
  }
});
test("legacy and overlapping semantic families have reciprocal transitive exposure while new figures remain separate", () => {
  const q = all.find((q) => q.id === "climate-v1-cA-weather")!;
  expect(q.exposureAliases).toContain("climate-evidence-0");
  expect(q.exposureAliases).toContain("climate-evidence-3");
  expect(q.exposureAliases).toContain("climate-v1-p-climate");
  for (const q of all)
    for (const id of q.exposureAliases ?? []) {
      const other = [...all, ...lesson.questions, ...lesson.checks].find(
        (o) => o.id === id,
      );
      if (other) expect(other.exposureAliases, q.id + "↔" + id).toContain(q.id);
    }
  expect(
    all.find((q) => q.id === "climate-v1-p-equivalence")!.exposureAliases,
  ).toContain("climate-evidence-2");
  expect(
    all.find((q) => q.id === "climate-v1-cA-graph")!.exposureAliases ?? [],
  ).not.toContain("climate-v1-p-graph");
});
