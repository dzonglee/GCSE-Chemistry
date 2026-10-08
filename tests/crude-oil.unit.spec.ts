import { test, expect } from "@playwright/test";
import * as T from "three";
import {
  crudeOilJourney as journey,
  oilExposureFamilies as families,
} from "../src/content/journeys/crude-oil";
import {
  oilRecords,
  oilInventories,
  oilTraces,
  oilYields,
  fractionMass,
  yieldPreference,
  type OilMode,
} from "../src/lib/crude-oil";
import {
  initialOilBoard,
  expectedOilBoard,
  validOilBoard,
  oilHistoryStep,
  checkOilBoard,
  type OilBoard,
} from "../src/lib/crude-oil-board";
import {
  emptyOilBarDrawing,
  readOilBarDrawing,
  oilBarNumber,
} from "../src/lib/oil-bar-drawing";
import { buildOilColumn, traceDisplay } from "../src/lib/oil-column-asset";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark, displayResponse } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import type { TaskModel } from "../src/content/types";
const modes = Object.keys(oilRecords) as OilMode[];
const tasks = [
  ...journey.warmup,
  ...journey.refresher,
  ...journey.guided,
  ...journey.practice,
  ...journey.checkForms.flat(),
  ...journey.reviewForms.flat(),
];
function construct(mode: OilMode, id: string): OilBoard[] {
  const answer = expectedOilBoard(mode, id),
    history = [initialOilBoard(mode, id)];
  if (mode === "trends")
    for (let position = 0; position < 4; position++) {
      let current = history.at(-1)!,
        index = [
          current.order0,
          current.order1,
          current.order2,
          current.order3,
        ].indexOf(answer["order" + position]);
      while (index > position) {
        history.push({
          ...current,
          ["order" + index]: current["order" + (index - 1)],
          ["order" + (index - 1)]: current["order" + index],
        });
        current = history.at(-1)!;
        index--;
      }
    }
  for (const [key, value] of Object.entries(answer))
    if (
      !key.startsWith("order") &&
      !(mode === "yield" && /^(drawn|placed)/.test(key)) &&
      history.at(-1)![key] !== value
    )
      history.push({ ...history.at(-1)!, [key]: value });
  if (mode === "yield")
    for (const source of ["A", "B"])
      history.push({
        ...history.at(-1)!,
        ["drawn" + source]: history.at(-1)!["bar" + source],
        ["placed" + source]: "yes",
      });
  return history;
}
for (const mode of modes)
  test(`${mode}: all six comparisons support real construction, honest wrong work and native history validation`, () => {
    expect(Object.keys(oilRecords[mode])).toHaveLength(6);
    for (const record of Object.keys(oilRecords[mode])) {
      const model: TaskModel = {
          kind: "crude-oil",
          mode,
          record,
          instruction: "Construct the supplied comparison.",
        },
        initial = initialOilBoard(mode, record),
        history = construct(mode, record);
      expect(initialBoard(model)).toEqual(initial);
      expect(checkBoard(model, initial).correct).toBe(false);
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, history.at(-1)!).correct).toBe(true);
      const openingModel: TaskModel = { ...model, record: "initial" };
      const switchedHistory =
        record === "initial"
          ? history
          : [...construct(mode, "initial"), ...history];
      expect(
        validHistory(openingModel, switchedHistory),
        mode + ":" + record + " selected-record reload",
      ).toBe(true);
      expect(
        validHistory(openingModel, [
          ...switchedHistory,
          { ...history.at(-1)!, extra: "0" },
        ]),
      ).toBe(false);
      expect(
        oilHistoryStep(mode, initial, expectedOilBoard(mode, record)),
      ).toBe(false);
    }
  });
test("saved schemas reject coercion, extra fields and malformed raw numbers without turning incorrect predictions into corruption", () => {
  for (const mode of modes) {
    const b = expectedOilBoard(mode);
    expect(validOilBoard(mode, { ...b, extra: "0" })).toBe(false);
    const missing = { ...b };
    delete missing.record;
    expect(validOilBoard(mode, missing)).toBe(false);
    for (const record of ["constructor", "__proto__", "missing"])
      expect(validOilBoard(mode, { ...b, record })).toBe(false);
    for (const key of Object.keys(b))
      expect(validOilBoard(mode, { ...b, [key]: 0 })).toBe(false);
  }
  for (const value of [
    "1/2",
    "1e2",
    "01",
    "-1",
    "NaN",
    "Infinity",
    "0.",
    "100001",
  ])
    expect(
      validOilBoard("yield", { ...expectedOilBoard("yield"), barA: value }),
    ).toBe(false);
  const wrong = { ...expectedOilBoard("yield"), massA: "999" };
  expect(validOilBoard("yield", wrong)).toBe(true);
  expect(checkOilBoard("yield", wrong).correct).toBe(false);
});
test("history permits adjacent swaps, explicit placement and pristine changed-record reset while rejecting unrelated simultaneous edits", () => {
  const first = initialOilBoard("trends"),
    swap = { ...first, order0: "1", order1: "0" };
  expect(oilHistoryStep("trends", first, swap)).toBe(true);
  expect(oilHistoryStep("trends", first, { ...swap, span: "16" })).toBe(false);
  expect(
    oilHistoryStep("trends", first, { ...first, order0: "3", order3: "0" }),
  ).toBe(false);
  const a = { ...initialOilBoard("yield"), barA: "18" },
    placed = { ...a, drawnA: "18", placedA: "yes" };
  expect(oilHistoryStep("yield", a, placed)).toBe(true);
  expect(oilHistoryStep("yield", a, { ...placed, massA: "180" })).toBe(false);
  expect(oilHistoryStep("yield", a, { ...a, drawnA: "18" })).toBe(false);
  expect(oilHistoryStep("yield", a, { ...a, selected: "B", barB: "12" })).toBe(
    true,
  );
  expect(
    oilHistoryStep(
      "inventory",
      initialOilBoard("inventory"),
      initialOilBoard("inventory", "pure"),
    ),
  ).toBe(true);
  expect(
    oilHistoryStep(
      "inventory",
      initialOilBoard("inventory"),
      expectedOilBoard("inventory", "pure"),
    ),
  ).toBe(false);
});
test("all27 original numerical references agree with independently calculated counts, differences, tray thresholds and mass percentages", () => {
  const refs: Record<string, number> = {
    "w-temperature": 270,
    "r-compounds": 1,
    "r-gradient": 300,
    "r-percentage": 90,
    "r-scale": 5,
    "r-hc-sum": 5,
    "r-trace": 3,
    "r-size": 9,
    "g-inventory": 6,
    "g-trace": 4,
    "g-trends": 16,
    "g-yield": 180,
    "p-count": 3,
    "p-hc-number": 7,
    "p-gradient": 360,
    "p-tray": 3,
    "p-size": 13,
    "p-percent": 144,
    "p-bar-scale": 10,
    "p-mass-difference": 40,
    "p-equal": 90,
    "a-inventory": 3,
    "a-trace": 4,
    "a-yield": 117,
    "b-trends": 15,
    "ra-inventory": 2,
    "ra-yield": 63,
  };
  const numerical = tasks.filter((q) => !q.rubric && !q.options);
  expect(numerical).toHaveLength(27);
  expect(Object.keys(refs)).toHaveLength(27);
  for (const q of numerical) {
    expect(Number(q.answer), q.id).toBe(refs[q.id.slice(7)]);
    expect(mark(q, q.answer).correct).toBe(true);
    expect(mark(q, "99999").correct).toBe(false);
  }
});
test("all named fractions have targeted practice and independent retrieval while all34 practice tasks have direct relevant recovery", () => {
  expect(tasks).toHaveLength(89);
  expect(new Set(tasks.map((q) => q.id)).size).toBe(89);
  expect(journey.practice).toHaveLength(34);
  for (const q of journey.practice)
    expect(
      journey.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
  expect(journey.checkForms.map((x) => x.length)).toEqual([8, 8]);
  expect(journey.reviewForms.map((x) => x.length)).toEqual([3, 3]);
  for (const id of [
    "p-kerosene",
    "p-diesel",
    "p-bitumen",
    "p-petroleum-gas",
    "p-fuel-oil",
  ])
    expect(journey.practice.some((q) => q.id === "oil-v1-" + id)).toBe(true);
  expect(tasks.filter((q) => q.rubric)).toHaveLength(14);
  for (const q of tasks.filter((q) => q.rubric)) {
    const result = mark(q, q.answer);
    expect(result.selfReview).toBe(true);
    expect(result.correct).toBe(false);
  }
  for (const form of [...journey.checkForms, ...journey.reviewForms])
    for (const q of form) {
      expect(q.model).toBeUndefined();
      expect(journey.guided.some((g) => g.prompt === q.prompt)).toBe(false);
    }
});
test("explicit one-hop families retain six legacy questions and avoid spreading a bridge into unrelated independent evidence", () => {
  const lesson = lessons.find((l) => l.slug === "crude-oil-and-fractions")!;
  expect(lesson.tier).toBe("foundation");
  expect(lesson.course).toBe("combined");
  expect(lesson.prerequisite).toBe("states-of-matter");
  expect(
    [...lesson.questions, ...lesson.checks].map((q) => q.id).sort(),
  ).toEqual(
    Array.from({ length: 6 }, (_, i) => "crude-oil-and-fractions-" + i),
  );
  for (const q of tasks)
    expect(Object.values(families).some((a) => a.includes(q.id.slice(7)))).toBe(
      true,
    );
  const inventory = tasks.find((q) => q.id === "oil-v1-a-inventory")!,
    trace = tasks.find((q) => q.id === "oil-v1-a-trace")!;
  expect(inventory.exposureAliases).toContain("crude-oil-and-fractions-0");
  expect(inventory.exposureAliases).not.toContain(trace.id);
  expect(trace.exposureAliases).not.toContain(inventory.id);
  expect(trace.exposureAliases).toContain("oil-v1-r-physical");
  expect(trace.exposureAliases).not.toContain("crude-oil-and-fractions-0");
});
test("chart drafts preserve invalid pending edits and malformed original responses without replacing explicitly placed values", () => {
  const initial = emptyOilBarDrawing(),
    placed = { ...initial, step: "10", pA: "34", vA: "34", placedA: "yes" };
  expect(readOilBarDrawing(JSON.stringify(placed))).toEqual(placed);
  const invalid = { ...placed, pA: "1/2" };
  expect(readOilBarDrawing(JSON.stringify(invalid))).toEqual(invalid);
  expect(oilBarNumber(invalid.pA)).toBeNull();
  expect(readOilBarDrawing(JSON.stringify(invalid))!.vA).toBe("34");
  const drawingQuestion = tasks.find((q) => q.id === "oil-v1-a-bars")!;
  expect(displayResponse(drawingQuestion, JSON.stringify(invalid))).toContain(
    "source A: 34% placed",
  );
  expect(
    displayResponse(drawingQuestion, JSON.stringify(invalid)),
  ).not.toContain("1/2");
  expect(displayResponse(drawingQuestion, "broken original")).toContain(
    "original response retained",
  );
  expect(readOilBarDrawing("broken original")).toBeNull();
  expect(
    readOilBarDrawing(JSON.stringify({ ...placed, extra: "0" })),
  ).toBeNull();
  expect(readOilBarDrawing(JSON.stringify({ ...placed, vA: 34 }))).toBeNull();
  expect(tasks.filter((q) => q.oilBarDrawing)).toHaveLength(4);
  for (const q of tasks.filter((q) => q.oilBarDrawing))
    expect(q.rubric).toBeDefined();
});
test("actual3D geometry and all42 stations preserve identity, held condensation and top-gas/residue exceptions within the frame", () => {
  for (const [record, r] of Object.entries(oilTraces))
    for (let step = 0; step <= 6; step++) {
      const group = buildOilColumn({ kind: "trace", record, step }),
        display = traceDisplay(record, step),
        tracer = group.getObjectByName(
          "Selected component tracer — not an atom",
        )!;
      expect(
        group.children.filter((o) => /^Tray\d$/.test(o.name)),
      ).toHaveLength(5);
      expect(tracer.userData.formula).toBe(r.formula);
      expect(group.userData.formula).toBe(r.formula);
      expect(display.formula).toBe(r.formula);
      const box = new T.Box3().setFromObject(group);
      expect(box.min.x).toBeGreaterThanOrEqual(-1.6);
      expect(box.max.x).toBeLessThanOrEqual(1.4);
      expect(box.min.y).toBeGreaterThanOrEqual(-2.3);
      expect(box.max.y).toBeLessThanOrEqual(2.3);
      if (record === "initial" && step >= 4) {
        expect(tracer.position.x).toBeCloseTo(0.96, 9);
        expect(tracer.position.y).toBeCloseTo(0.65, 9);
        expect(display.collectedTray).toBe(4);
      }
      if (record === "gas" && step === 6) expect(display.phase).toBe("gas");
      if (record === "residue") expect(display.phase).toBe("liquid");
    }
  const inputs = oilInventories.initial.components;
  expect(inputs[3].elements).toContain("O");
});
test("independent source-mass references expose unequal-feed and conditional-preference misconceptions", () => {
  const refs: Record<string, [number, number, string]> = {
    initial: [180, 70, "A"],
    unequal: [100, 120, "B"],
    heavy: [280, 420, "B"],
    scale: [184, 248, "B"],
    equal: [120, 120, "equal"],
    smaller: [36, 60, "A"],
  };
  for (const [id, r] of Object.entries(oilYields)) {
    expect([
      fractionMass(r.percentages[0], r.feedMasses[0]),
      fractionMass(r.percentages[1], r.feedMasses[1]),
      yieldPreference(r),
    ]).toEqual(refs[id]);
  }
  expect(oilYields.smaller.criterion).toBe("percentage");
  expect(oilYields.unequal.criterion).toBe("mass");
});
