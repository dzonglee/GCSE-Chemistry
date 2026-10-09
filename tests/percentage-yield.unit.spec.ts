import { test, expect } from "@playwright/test";
import {
  percentYield,
  actualFromYield,
  theoreticalFromYield,
  recoveredInventory,
  initialYieldBoard,
  validYieldBoard,
  yieldPrediction,
  type YieldMode,
} from "../src/lib/percentage-yield";
test("same-product same-unit fraction distinguishes yield from loss and retains suspect excess", () => {
  expect(percentYield(15, 20)).toEqual({
    percentage: 75,
    apparentExcess: false,
  });
  expect(percentYield(900, 1200).percentage).toBe(75);
  expect(percentYield(0, 20).percentage).toBe(0);
  expect(percentYield(20, 20).percentage).toBe(100);
  expect(percentYield(22, 20).percentage).toBeCloseTo(110, 10);
  expect(percentYield(22, 20).apparentExcess).toBe(true);
  expect(() => percentYield(1, 0)).toThrow();
  expect(() => percentYield(-1, 20)).toThrow();
});
test("forward and reverse yield use the theoretical denominator and preserve g/kg requests", () => {
  expect(actualFromYield(20, 75)).toBe(15);
  expect(actualFromYield(1500, 80)).toBe(1200);
  expect(actualFromYield(13.5, 92.3)).toBeCloseTo(12.4605, 10);
  expect(theoreticalFromYield(18, 60)).toBe(30);
  expect(theoreticalFromYield(12, 80)).toBe(15);
  expect(() => theoreticalFromYield(0, 0)).toThrow();
  expect(() => actualFromYield(20, 110)).toThrow();
});
test("all unrecovered formed product remains in total inventory and native fields require all predictions", () => {
  for (const recovered of [6, 8, 10]) {
    const r = recoveredInventory(recovered);
    expect(r.collected + r.unrecovered).toBe(20);
    expect(r.percentage).toBe(recovered * 10);
  }
  for (const mode of [
    "fraction",
    "actual",
    "reverse",
    "collection",
  ] as YieldMode[]) {
    const b = initialYieldBoard(mode);
    expect(validYieldBoard(mode, b)).toBe(true);
    expect(yieldPrediction(mode, b).correct).toBe(false);
    expect(validYieldBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  const b = {
    recovered: 8,
    collected: "16",
    unrecovered: "4",
    percentage: "80",
    interpretation: "remains",
  };
  expect(yieldPrediction("collection", b).correct).toBe(true);
  expect(
    yieldPrediction("collection", { ...b, interpretation: "destroyed" })
      .correct,
  ).toBe(false);
  expect(validYieldBoard("collection", { ...b, recovered: "8" })).toBe(false);
});

import { percentageYieldJourney as journey } from "../src/content/journeys/percentage-yield";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("48 original references and all stated misconceptions require correct product bases; explanations remain false", () => {
  expect(tasks(journey)).toHaveLength(60);
  expect(journey.practice).toHaveLength(23);
  for (const q of tasks(journey)) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
  }
  const selected = journey.practice.find((q) => q.id === "py-v1-p-select")!;
  expect(
    mark(selected, JSON.stringify({ actual: "13.5", theoretical: "12" }))
      .correct,
  ).toBe(false);
  const wet = journey.practice.find((q) => q.id === "py-v1-p-wet")!;
  expect(
    mark(wet, JSON.stringify({ apparent: "100", dry: "90" })).correct,
  ).toBe(false);
  const sig = journey.practice.find((q) => q.id === "py-v1-p-sigfig")!;
  expect(mark(sig, "74.4565").correct).toBe(false);
  expect(mark(sig, "74.46").correct).toBe(false);
  const rounding = journey.practice.find((q) => q.id === "py-v1-p-rounding")!;
  expect(mark(rounding, "58.333333").correct).toBe(false);
});

import {
  yieldSamples,
  actualYieldSamples,
  reverseYieldSamples,
} from "../src/lib/percentage-yield";
test("all supplied native variants retain exact units and require every intermediate prediction", () => {
  const fractions = [
    ["standard", "15", "20", "75"],
    ["mixedUnits", "900", "1200", "75"],
    ["none", "0", "20", "0"],
    ["complete", "20", "20", "100"],
  ];
  for (const [sample, actual, theoretical, percentage] of fractions) {
    const b = { sample, actual, theoretical, percentage };
    expect(validYieldBoard("fraction", b)).toBe(true);
    expect(yieldPrediction("fraction", b).correct).toBe(true);
    expect(
      yieldPrediction("fraction", { ...b, theoretical: "500" }).correct,
    ).toBe(false);
  }
  for (const [sample, factor, mass] of [
    ["first", "0.75", "15"],
    ["second", "0.6", "30"],
    ["kilograms", "0.8", "1200"],
  ]) {
    const b = { sample, factor, mass };
    expect(validYieldBoard("actual", b)).toBe(true);
    expect(yieldPrediction("actual", b).correct).toBe(true);
    expect(yieldPrediction("actual", { ...b, factor: "75" }).correct).toBe(
      false,
    );
  }
  for (const [sample, factor, theoretical] of [
    ["first", "0.6", "30"],
    ["second", "0.8", "15"],
  ]) {
    const b = { sample, factor, theoretical };
    expect(validYieldBoard("reverse", b)).toBe(true);
    expect(yieldPrediction("reverse", b).correct).toBe(true);
    expect(
      yieldPrediction("reverse", { ...b, theoretical: "10.8" }).correct,
    ).toBe(false);
  }
  for (const [recovered, collected, unrecovered, percentage] of [
    [6, "12", "8", "60"],
    [8, "16", "4", "80"],
    [10, "20", "0", "100"],
  ] as const) {
    const b = {
      recovered,
      collected,
      unrecovered,
      percentage,
      interpretation: "remains",
    };
    expect(validYieldBoard("collection", b)).toBe(true);
    expect(yieldPrediction("collection", b).correct).toBe(true);
  }
  expect(Object.keys(yieldSamples)).toHaveLength(4);
  expect(Object.keys(actualYieldSamples)).toHaveLength(3);
  expect(Object.keys(reverseYieldSamples)).toHaveLength(2);
});

test("reserved numerical references agree with independently calculated product inventories and supplied inputs", () => {
  const all = tasks(journey),
    find = (id: string) => all.find((q) => q.id === `py-v1-${id}`)!;
  const numeric: Record<string, number> = {
    "ca-actual": 45 * 0.72,
    "ca-reverse": 27 / 0.6,
    "cb-actual": 0.75 * 1000 * 0.84,
    "cb-reverse": 33 / 0.75,
    "p-yield": (13.5 / 18) * 100,
    "p-zero": (0 / 8) * 100,
    "p-complete": (24 / 24) * 100,
    "p-actual-kg": 2000 * 0.85,
    "p-reverse-kg": 1.44 / 0.8,
    "ra-yield": (14 / 20) * 100,
    "ra-actual": 60 * 0.55,
    "ra-reverse": 24 / 0.8,
    "rb-yield": (18.2 / 26) * 100,
    "rb-actual": 1250 * 0.64,
    "rb-reverse": 28 / 0.7,
  };
  for (const [id, value] of Object.entries(numeric))
    expect(Number(find(id).answer), id).toBeCloseTo(value, 10);
  const constructed: Record<string, Record<string, number>> = {
    "ca-units": { theoretical: 0.025 * 1000, percentage: (17 / 25) * 100 },
    "ca-recovery": { percentage: (31.5 / 36) * 100, total: 31.5 + 4.5 },
    "cb-units": { theoretical: 0.04 * 1000, percentage: (26 / 40) * 100 },
    "cb-recovery": { percentage: (41 / 50) * 100, total: 41 + 9 },
    "p-actual": { factor: 65 / 100, actual: 40 * 0.65 },
    "p-reverse": { factor: 0.7, theoretical: 21 / 0.7 },
    "p-collection": { percentage: (24 / 30) * 100, total: 24 + 6 },
    "p-wet": { apparent: (22 / 20) * 100, dry: (18 / 20) * 100 },
  };
  for (const [id, fields] of Object.entries(constructed)) {
    const answer = JSON.parse(find(id).answer);
    for (const [key, value] of Object.entries(fields))
      expect(Number(answer[key]), `${id}:${key}`).toBeCloseTo(value, 10);
  }
  expect(find("ca-recovery").prompt).toContain("31.5 g");
  expect(find("ca-recovery").prompt).toContain("4.5 g");
  expect(find("ca-recovery").explanation).toContain("87.5%");
  expect(Number(find("p-sigfig").answer)).toBe(
    Number(((13.7 / 18.4) * 100).toPrecision(3)),
  );
  expect(Number(find("p-rounding").answer)).toBe(
    Number(((7 / 12) * 100).toFixed(1)),
  );
});

import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
test("Foundation separate journey retains all six legacy identities, strict persisted recovery counts and conservative aliases", () => {
  const lesson = lessons.find((l) => l.slug === "yield-and-atom-economy")!;
  expect(lesson.title).toBe("Percentage yield");
  expect(lesson.tier).toBe("foundation");
  expect(lesson.course).toBe("separate");
  expect(lesson.prerequisite).toBe("percentage-composition");
  expect([...lesson.questions, ...lesson.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => `yield-and-atom-economy-${i}`),
  );
  const progress = emptyProgress(),
    work = emptyWork();
  work.taskModels = {};
  for (const q of journey.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    work.taskModels[q.id] = [b];
  }
  progress.work[lesson.slug] = work;
  expect(decode(JSON.stringify(progress))).toEqual(progress);
  work.taskModels["py-v1-g-collection"] = [
    { ...initialYieldBoard("collection"), recovered: "8" },
  ];
  expect(decode(JSON.stringify(progress))).toBeNull();
  expect(exposureIds(["yield-and-atom-economy-0"])).toContain(
    "py-v1-g-fraction",
  );
  expect(exposureIds(["py-v1-ca-proof"])).toContain("py-v1-p-wet");
  expect(exposureIds(["py-v1-ca-units"])).toEqual(["py-v1-ca-units"]);
});
