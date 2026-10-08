import { test, expect } from "@playwright/test";
import {
  atomEconomy,
  economyEquations,
  economyChoices,
  initialEconomyBoard,
  validEconomyBoard,
  economyPrediction,
  type EconomyMode,
} from "../src/lib/atom-economy";
import { atomEconomyJourney as j } from "../src/content/journeys/atom-economy";
import { mark } from "../src/lib/marking";
test("independent coefficient-weighted mass references preserve full reactant and desired totals", () => {
  const e = economyEquations.copper,
    r = atomEconomy(e.reactants, e.products, ["Cu"]);
  expect(r.total).toBe(171);
  expect(r.useful).toBe(127);
  expect(r.other).toBe(44);
  expect(r.percentage).toBeCloseTo(74.26900584795322, 12);
  const nickel = atomEconomy(
    [
      { formula: "NiO", coefficient: 1, relativeMass: 75 },
      { formula: "C", coefficient: 1, relativeMass: 12 },
    ],
    [
      { formula: "Ni", coefficient: 1, relativeMass: 59 },
      { formula: "CO", coefficient: 1, relativeMass: 28 },
    ],
    ["Ni"],
  );
  expect(nickel.total).toBe(87);
  expect(nickel.percentage).toBeCloseTo(67.81609195402299, 12);
  const tungsten = atomEconomy(
    [
      { formula: "WO3", coefficient: 1, relativeMass: 232 },
      { formula: "H2", coefficient: 3, relativeMass: 2 },
    ],
    [
      { formula: "W", coefficient: 1, relativeMass: 184 },
      { formula: "H2O", coefficient: 3, relativeMass: 18 },
    ],
    ["W"],
  );
  expect(tungsten.total).toBe(238);
  expect(tungsten.percentage).toBeCloseTo(77.3109243697479, 12);
});
test("desired product changes numerator while whole equation scaling preserves fractions", () => {
  const e = economyEquations.carbonate;
  for (const scale of [1, 2, 5])
    for (const [desired, contribution, percent] of [
      ["CaO", 56, 56],
      ["CO2", 44, 44],
    ] as const) {
      const r = atomEconomy(
        e.reactants.map((t) => ({ ...t, coefficient: t.coefficient * scale })),
        e.products.map((t) => ({ ...t, coefficient: t.coefficient * scale })),
        [desired],
      );
      expect(r.total).toBe(100 * scale);
      expect(r.useful).toBe(contribution * scale);
      expect(r.percentage).toBeCloseTo(percent, 12);
    }
  expect(atomEconomy(e.reactants, e.products, ["CaO", "CO2"]).percentage).toBe(
    100,
  );
});
test("relative mass allocation is not atom counting or actual collected yield", () => {
  const e = economyEquations.methane;
  expect(atomEconomy(e.reactants, e.products, ["CO2"]).percentage).toBeCloseTo(
    55,
    12,
  );
  expect(atomEconomy(e.reactants, e.products, ["H2O"]).percentage).toBe(45);
  expect(
    atomEconomy(e.reactants, e.products, ["CO2"]).percentage,
  ).not.toBeCloseTo((3 / 9) * 100, 1);
  for (const actual of [0, 18, 30]) {
    const b = {
      ...initialEconomyBoard("contrast"),
      actual,
      economy: "100",
      yield: String((actual / 30) * 100),
    };
    expect(economyPrediction("contrast", b).correct).toBe(true);
    expect(
      economyPrediction("contrast", { ...b, economy: b.yield }).correct,
    ).toBe(actual === 30);
  }
});
test("reject malformed terms, mismatched equation masses and unnamed desired products", () => {
  const e = economyEquations.carbonate;
  for (const value of [0, -1, NaN, Infinity, 1.5])
    expect(() =>
      atomEconomy(
        [{ formula: "CaCO3", coefficient: value, relativeMass: 100 }],
        e.products,
        ["CaO"],
      ),
    ).toThrow();
  expect(() => atomEconomy(e.reactants, e.products, ["CaO", "CaO"])).toThrow();
  expect(() => atomEconomy(e.reactants, e.products, ["C"])).toThrow();
  expect(() =>
    atomEconomy(
      e.reactants,
      [{ formula: "CaO", coefficient: 1, relativeMass: 56 }],
      ["CaO"],
    ),
  ).toThrow();
});
test("native prediction boards require complete quantities and preserve misconception choices", () => {
  for (const mode of [
    "weighted",
    "desired",
    "contrast",
    "partition",
  ] as EconomyMode[]) {
    const initial = initialEconomyBoard(mode);
    expect(validEconomyBoard(mode, initial)).toBe(true);
    expect(economyPrediction(mode, initial).correct).toBe(false);
    expect(validEconomyBoard(mode, { ...initial, extra: "x" })).toBe(false);
    const key = Object.keys(initial)[0];
    expect(validEconomyBoard(mode, { ...initial, [key]: null })).toBe(false);
  }
  expect(
    validEconomyBoard("desired", {
      ...initialEconomyBoard("desired"),
      scale: "2",
    }),
  ).toBe(false);
  expect(
    economyPrediction("weighted", {
      numerator: "127",
      denominator: "171",
      percentage: "74.3",
    }).correct,
  ).toBe(true);
  expect(
    economyPrediction("weighted", {
      numerator: "127",
      denominator: "91.5",
      percentage: "74.3",
    }).correct,
  ).toBe(false);
  for (const scale of economyChoices.desired.scale)
    for (const desired of ["CaO", "CO2", "both"]) {
      const useful = desired === "CaO" ? 56 : desired === "CO2" ? 44 : 100;
      expect(
        economyPrediction("desired", {
          desired,
          scale,
          numerator: String(useful * scale),
          denominator: String(100 * scale),
          percentage: String(useful),
        }).correct,
      ).toBe(true);
    }
  expect(
    economyPrediction("partition", {
      desired: "CO2",
      useful: "44",
      other: "36",
      denominator: "80",
      percentage: "55",
      fate: "byproduct",
    }).correct,
  ).toBe(true);
  expect(
    economyPrediction("partition", {
      desired: "CO2",
      useful: "44",
      other: "36",
      denominator: "80",
      percentage: "55",
      fate: "destroyed",
    }).correct,
  ).toBe(false);
});
test("individually authored task demands reserve changed checks, verify calculations and enforce final precision", () => {
  expect([
    j.warmup.length,
    j.refresher.length,
    j.guided.length,
    j.practice.length,
    j.checkForms.flat().length,
    j.reviewForms.flat().length,
  ]).toEqual([2, 6, 8, 23, 10, 6]);
  const all = [
    ...j.warmup,
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ];
  expect(new Set(all.map((q) => q.id)).size).toBe(55);
  const refs: Record<string, string> = {
    "p-nickel": "67.8",
    "p-tungsten": "77.3",
    "ca-percentage": "85.2",
    "cb-percentage": "52.9",
    "cb-product": "47.1",
    "ra-weight": "80",
    "rb-weight": "204",
    "rb-other": "54",
  };
  for (const [id, expected] of Object.entries(refs)) {
    const q = all.find((q) => q.id === `ae-v1-${id}`)!;
    expect(q.answer).toBe(expected);
    expect(mark(q, expected).correct).toBe(true);
  }
  expect(
    mark(
      all.find((q) => q.id === "ae-v1-p-nickel")!,
      "67.816091954",
    ).correct,
  ).toBe(false);
  expect(
    mark(
      all.find((q) => q.id === "ae-v1-p-tungsten")!,
      "77.31092437",
    ).correct,
  ).toBe(false);
  const copper = all.find((q) => q.id === "ae-v1-ca-copper")!;
  expect(JSON.parse(copper.answer)).toEqual({ useful: "254", total: "298" });
  expect(copper.prompt).toContain("2Cu2O");
  expect(all.filter((q) => q.rubric)).toHaveLength(4);
  for (const q of all.filter((q) => q.rubric))
    expect(mark(q, q.answer).correct).toBe(false);
});

import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
test("new Foundation separate route preserves all original identities and strictly decodes canonical model histories", () => {
  const lesson = lessons.find((l) => l.slug === "atom-economy")!;
  expect(lesson.tier).toBe("foundation");
  expect(lesson.course).toBe("separate");
  expect(lesson.prerequisite).toBe("formulae-and-mass");
  expect(lesson.questions).toHaveLength(0);
  expect(lesson.checks).toHaveLength(0);
  const legacy = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]),
    ...assessments.flatMap((a) => a.questions),
  ].map((q) => q.id);
  expect(legacy).toHaveLength(532);
  expect(new Set(legacy).size).toBe(532);
  const progress = emptyProgress(),
    work = emptyWork();
  work.taskModels = {};
  for (const q of j.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    work.taskModels[q.id] = [b];
  }
  progress.work[lesson.slug] = work;
  expect(decode(JSON.stringify(progress))).toEqual(progress);
  work.taskModels["ae-v1-g-desired"] = [
    { ...initialEconomyBoard("desired"), scale: "2" },
  ];
  expect(decode(JSON.stringify(progress))).toBeNull();
  expect(exposureIds(["yield-and-atom-economy-3"])).toContain(
    "ae-v1-p-addition",
  );
  expect(exposureIds(["ae-v1-ca-copper"])).toContain("ae-v1-ca-percentage");
  expect(exposureIds(["ae-v1-ca-copper"])).not.toContain("ae-v1-cb-aluminium");
});

// The delayed reversed equation repeats the same weighted Al2O3 contribution.
test("delayed reverse-equation retrieval retains prior coefficient exposure", () => {
  expect(exposureIds(["ae-v1-cb-aluminium"])).toContain("ae-v1-rb-weight");
});
