import { test, expect } from "@playwright/test";
import {
  allAtmosphereTasks,
  atmosphereJourney as j,
  atmosphereRecoveryRoutes,
} from "../src/content/journeys/early-atmosphere";
import {
  atmosphereRecords,
  atmosphereGraphs,
  atmosphereFields,
  atmosphereChoices,
  atmosphereNumeric,
  initialAtmosphere,
  validAtmosphere,
  validAtmosphereHistory,
  checkAtmosphere,
  atmosphereNumber,
} from "../src/lib/early-atmosphere";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
const lesson = lessons.find((l) => l.slug === "early-atmosphere")!;
test("individual atmosphere lesson reserves distinct forms, retains six legacy IDs and supplies exact recoveries", () => {
  expect(lesson.journey).toBe(j);
  expect(lesson.course).toBe("combined");
  expect(allAtmosphereTasks).toHaveLength(69);
  expect(new Set(allAtmosphereTasks.map((q) => q.id)).size).toBe(69);
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4]);
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "early-atmosphere-" + i),
  );
  for (const q of j.practice) {
    expect(q.followUp).toBe(atmosphereRecoveryRoutes[q.id]);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  for (const q of [...j.checkForms.flat(), ...j.reviewForms.flat()])
    expect(q.model).toBeUndefined();
  for (const record of Object.keys(atmosphereRecords))
    expect(
      allAtmosphereTasks.some(
        (q) =>
          q.model?.kind === "atmosphere-investigation" &&
          q.model.record === record,
      ),
      record,
    ).toBe(true);
});
test("all seven scientific proposal modes preserve immutable originals and accept only complete correct constructions", () => {
  const original = JSON.stringify(atmosphereRecords);
  for (const [record, r] of Object.entries(atmosphereRecords)) {
    const model = {
        kind: "atmosphere-investigation" as const,
        mode: r.mode,
        record,
      },
      h = [initialAtmosphere(r.mode, record)];
    expect(initialBoard(model)).toEqual(h[0]);
    expect(checkBoard(model, h[0]).correct).toBe(false);
    for (const [f, v] of Object.entries(r.expected)) {
      h.push({ ...h.at(-1)!, [f]: v });
      expect(validHistory(model, h)).toBe(true);
    }
    expect(checkBoard(model, h.at(-1)!).correct, record).toBe(true);
    const f = atmosphereFields[r.mode][0],
      wrong = {
        ...h.at(-1)!,
        [f]: atmosphereNumeric.includes(f)
          ? "999"
          : atmosphereChoices[f].find((v) => v !== r.expected[f])!,
      };
    expect(validBoard(model, wrong)).toBe(true);
    expect(checkAtmosphere(r.mode, wrong).correct).toBe(false);
    expect(checkAtmosphere(r.mode, wrong).message).toContain(
      "remains as entered",
    );
  }
  expect(JSON.stringify(atmosphereRecords)).toBe(original);
});
test("history binds task source, mode and schema and rejects unanchored or multiple edits", () => {
  const b = initialAtmosphere("composition", "modern");
  for (const changed of [
    { ...b, extra: "hidden" },
    { ...b, version: "2" },
    { ...b, mode: "graph" },
    { ...b, record: "precise" },
  ])
    expect(validAtmosphere("composition", changed, "modern")).toBe(false);
  expect(
    validAtmosphereHistory("composition", "modern", [{ ...b, nitrogen: "78" }]),
  ).toBe(false);
  expect(validAtmosphereHistory("composition", "modern", [b, b])).toBe(false);
  expect(
    validAtmosphereHistory("composition", "modern", [
      b,
      { ...b, nitrogen: "78", oxygen: "21" },
    ]),
  ).toBe(false);
  expect(
    validAtmosphereHistory("composition", "modern", [
      b,
      { ...b, nitrogen: "78" },
      { ...b, nitrogen: "78", oxygen: "21" },
    ]),
  ).toBe(true);
  expect(
    validAtmosphereHistory("composition", "modern", Array(501).fill(b)),
  ).toBe(false);
  const other = {
    ...initialAtmosphere("composition", "precise"),
    ...atmosphereRecords.precise.expected,
  };
  expect(
    checkBoard(
      {
        kind: "atmosphere-investigation",
        mode: "composition",
        record: "modern",
      },
      other,
    ).correct,
  ).toBe(false);
});
test("malformed, negative and outside-whole proposals survive without being falsely accepted", () => {
  const b = {
    ...initialAtmosphere("composition", "modern"),
    ...atmosphereRecords.modern.expected,
  };
  for (const raw of ["1..2", "+", "-1", "999", "1e3", "5 mol", "NaN"]) {
    const wrong = { ...b, nitrogen: raw };
    expect(validAtmosphere("composition", wrong)).toBe(true);
    expect(checkAtmosphere("composition", wrong).correct).toBe(false);
    expect(wrong.nitrogen).toBe(raw);
  }
  expect(atmosphereNumber("1..2")).toBeNull();
  expect(atmosphereNumber("-1")).toBe(-1);
  expect(
    validAtmosphere("composition", { ...b, nitrogen: "1".repeat(17) }),
  ).toBe(false);
  expect(
    checkAtmosphere("composition", {
      ...b,
      nitrogen: "80",
      oxygen: "20",
      other: "0",
    }).correct,
  ).toBe(false);
});
test("independent arithmetic audit covers composition, units, volume, time reading and percentage-point change", () => {
  const refs: Record<string, number> = {
    "w-whole": 100 - 75 - 20,
    "w-time": 2.4 * 1000,
    "r-composition": 100 - 20.95 - 0.96,
    "r-graph": (1500 + 1000) / 2,
    "g-composition": 78,
    "g-graph": 1500,
    "g-plateau": 2500,
    "g-bar": 12,
    "g-bar-rescale": 18,
    "p-composition": 100 - 20.9 - 0.04 - 0.96,
    "p-volume": 0.21 * 1000,
    "p-billion": 2700 / 1000,
    "p-graph": 1200,
    "p-interpolate": (1800 + 1200) / 2,
    "p-plateau": 1800,
    "p-points": 12 - 4,
    "cA-whole": 100 - 20.8 - 0.05 - 0.95,
    "cA-graph": 600,
    "cB-whole": 100 - 20.7 - 1.1,
    "cB-graph": 2800,
    "vA-volume": 0.21 * 2000,
    "vA-graph": 1400,
    "vB-time": 1.8 * 1000,
  };
  const numerical = allAtmosphereTasks.filter((q) => q.inputMode === "decimal");
  expect(numerical).toHaveLength(23);
  for (const q of numerical) {
    expect(Number(q.answer), q.id).toBeCloseTo(
      refs[q.id.replace("early-atmosphere-v1-", "")],
      8,
    );
    expect(mark(q, q.answer).correct).toBe(true);
    expect(mark(q, String(Number(q.answer) + 0.05)).correct).toBe(false);
  }
  const barCases = [
    ["p-bar", 24, 18],
    ["cA-bar", 20, 15],
    ["cB-bar", 28, 14],
    ["vB-bar", 12, 9],
  ] as const;
  for (const [s, max, height] of barCases) {
    const q = allAtmosphereTasks.find((q) => q.id.endsWith("-" + s))!;
    expect(q.parts!.map((p) => p.answer)).toEqual([
      max / 4,
      max / 2,
      (max * 3) / 4,
      height,
    ]);
    expect(mark(q, q.answer).correct).toBe(true);
    const raw = JSON.parse(q.answer);
    raw.scale2 = String(max / 4);
    expect(mark(q, JSON.stringify(raw)).correct).toBe(false);
    raw.scale2 = String(max / 2);
    raw.height = String(height * 2) + "/2";
    expect(mark(q, JSON.stringify(raw)).correct).toBe(true);
    raw.height = "1..2";
    expect(mark(q, JSON.stringify(raw)).invalid).toBe(true);
  }
});
test("original reconstructions have descending uniform age scales, equal proportions and qualified captions", () => {
  for (const g of Object.values(atmosphereGraphs)) {
    expect(g.ages.at(-1)).toBe(0);
    const step = g.ages[0] - g.ages[1];
    g.ages.forEach((age, i) => {
      if (i) expect(g.ages[i - 1] - age).toBe(step);
      expect(
        g.nitrogen[i] + g.oxygen[i] + g.dioxide[i] + g.other[i],
      ).toBeCloseTo(100, 8);
      expect(g.dioxide.at(-1)).toBe(0.04);
      expect(g.other.at(-1)).toBe(0.96);
    });
  }
  expect(atmosphereGraphs.guided.oxygen[5]).toBe(12);
  expect(atmosphereGraphs.guided.ages[5]).toBe(1500);
  expect(atmosphereGraphs.coldA.oxygen[5]).toBe(19);
  expect(atmosphereGraphs.coldA.ages[5]).toBe(600);
  expect(atmosphereGraphs.coldB.nitrogen.slice(2)).toEqual([
    78, 78, 78, 78, 78,
  ]);
  expect(j.scopeNote).toContain("not precise ancient measurements");
});
test("misconceptions give specific feedback, and written explanations stay honest self-review", () => {
  for (const q of allAtmosphereTasks) {
    if (q.rubric)
      expect(mark(q, q.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
    else {
      expect(mark(q, q.answer).correct, q.id).toBe(true);
      for (const [raw, feedback] of Object.entries(q.misconceptions ?? {}))
        expect(mark(q, raw).feedback).toContain(feedback);
    }
  }
  expect(allAtmosphereTasks.filter((q) => q.rubric)).toHaveLength(11);
  expect(atmosphereRecords.algae.feedback).toContain("glucose + oxygen");
  expect(atmosphereRecords.algae.feedback).toContain(
    "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
  );
  // Independent atom ledger for the supplied balanced photosynthesis equation.
  expect([6, 6 * 2, 6 * 2 + 6]).toEqual([6, 12, 6 + 6 * 2]);
  expect(atmosphereRecords.ancient.expected.claim).toBe("qualified");
  expect(atmosphereRecords.planets.expected.claim).toBe("similarity");
});
test("legacy and direct rephrased exposure are shared globally while new graph data remain distinct", () => {
  const tasks = [...lesson.questions, ...lesson.checks, ...allAtmosphereTasks],
    get = (s: string) => tasks.find((q) => q.id === s)!;
  for (const [a, b] of [
    ["early-atmosphere-1", "early-atmosphere-v1-cA-ocean"],
    ["early-atmosphere-2", "early-atmosphere-v1-cA-photo"],
    ["early-atmosphere-5", "early-atmosphere-v1-g-composition"],
  ]) {
    expect(get(a).exposureAliases).toContain(b);
    expect(get(b).exposureAliases).toContain(a);
  }
  expect(
    get("early-atmosphere-v1-cA-graph").exposureAliases ?? [],
  ).not.toContain("early-atmosphere-v1-g-graph");
});
