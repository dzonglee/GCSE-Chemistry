import { test, expect } from "@playwright/test";
import * as T from "three";
import {
  ratesPracticalJourney as journey,
  ratesPracticalAllTasks as tasks,
  ratesPracticalExposureFamilies as families,
} from "../src/content/journeys/rates-practical";
import {
  practicalRecords,
  practicalDilutions,
  practicalEndpoints,
  practicalPlots,
  practicalRepeats,
  practicalApparatus,
  dilutionWater,
  premixConcentration,
  combinedConcentration,
  repeatMean,
  repeatRange,
  sampledEndpoint,
  type PracticalMode,
} from "../src/lib/rates-practical";
import {
  initialPracticalBoard,
  expectedPracticalBoard,
  validPracticalBoard,
  practicalHistoryStep,
  practicalFields,
  practicalChoices,
} from "../src/lib/rates-practical-board";
import { practicalFitPoints } from "../src/lib/practical-fit";
import { practicalApparatusAsset } from "../src/lib/practical-apparatus-asset";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import type { TaskModel } from "../src/content/types";
const modes = Object.keys(practicalRecords) as PracticalMode[];
for (const mode of modes)
  test(`${mode}: all six individual comparisons preserve correct and wrong constructed evidence through native strict histories`, () => {
    expect(Object.keys(practicalRecords[mode])).toHaveLength(6);
    for (const record of Object.keys(practicalRecords[mode])) {
      const model: TaskModel = {
          kind: "rates-practical",
          mode,
          record,
          instruction: "Construct and explain this comparison.",
        },
        first = initialPracticalBoard(mode, record),
        answer = expectedPracticalBoard(mode, record),
        history = [first];
      expect(initialBoard(model)).toEqual(first);
      expect(checkBoard(model, first).correct).toBe(false);
      for (const [key, v] of Object.entries(answer))
        if (history.at(-1)![key] !== v)
          history.push({ ...history.at(-1)!, [key]: v });
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, answer).correct).toBe(true);
      for (const key of practicalFields[mode].filter(
        (k) => !["record", "selected"].includes(k),
      )) {
        const wrong = {
          ...answer,
          [key]: practicalChoices[mode]?.[key]
            ? practicalChoices[mode]![key].find((x) => x !== answer[key])!
            : String(Number(answer[key]) + 1),
        };
        expect(validPracticalBoard(mode, wrong)).toBe(true);
        expect(checkBoard(model, wrong).correct).toBe(false);
      }
    }
  });
test("canonical saved boards reject coercion, extra fields, unknown records and incomplete numerical entries", () => {
  for (const mode of modes) {
    const b = expectedPracticalBoard(mode);
    expect(validPracticalBoard(mode, { ...b, extra: "0" })).toBe(false);
    const missing = { ...b };
    delete missing.record;
    expect(validPracticalBoard(mode, missing)).toBe(false);
    for (const record of ["constructor", "unknown", "__proto__"])
      expect(validPracticalBoard(mode, { ...b, record })).toBe(false);
    expect(
      validPracticalBoard(mode, { ...b, [practicalFields[mode][1]]: 0 }),
    ).toBe(false);
  }
  for (const v of ["", "1/2", "1e2", "01", "Infinity", "-1", "100001"])
    expect(
      validPracticalBoard("dilution", {
        ...expectedPracticalBoard("dilution"),
        stock: v,
      }),
    ).toBe(false);
});
test("history permits one coordinate construction or a pristine record reset, rejects unrelated simultaneous edits", () => {
  const a = initialPracticalBoard("plot"),
    coordinate = { ...a, x0: "10", y0: "12", placed0: "yes" };
  expect(practicalHistoryStep("plot", a, coordinate)).toBe(true);
  expect(practicalHistoryStep("plot", a, { ...coordinate, x1: "20" })).toBe(
    false,
  );
  expect(
    practicalHistoryStep("plot", a, { ...coordinate, selected: "1" }),
  ).toBe(false);
  expect(practicalHistoryStep("plot", a, a)).toBe(false);
  for (const mode of modes) {
    const original = expectedPracticalBoard(mode),
      id = Object.keys(practicalRecords[mode])[1],
      reset = initialPracticalBoard(mode, id);
    expect(practicalHistoryStep(mode, original, reset)).toBe(true);
    const key = practicalFields[mode].find(
      (k) => k !== "record" && original[k] !== reset[k],
    )!;
    expect(
      practicalHistoryStep(mode, original, { ...reset, [key]: original[key] }),
    ).toBe(false);
  }
});
test("all dilution totals, endpoint bounds and repeats are scientifically distinct and conserve declared quantities", () => {
  for (const r of Object.values(practicalDilutions)) {
    expect(r.stockVolume + dilutionWater(r)).toBe(r.total);
    expect(premixConcentration(r)).toBe(r.target);
    expect(combinedConcentration(r)).toBeLessThan(r.target);
  }
  for (const r of Object.values(practicalEndpoints)) {
    expect(r.start).toBeLessThanOrEqual(r.stop);
    expect(r.stop).toBeLessThanOrEqual(sampledEndpoint(r));
    if (r.issue === "interval") expect(r.start).toBeLessThan(r.stop);
  }
  expect(repeatMean(practicalRepeats.initial)).toBe(41);
  expect(repeatMean(practicalRepeats.suspect)).toBe(34);
  expect(repeatMean(practicalRepeats.identified)).toBe(31.5);
  expect(practicalRepeats.identified.decision).toBe("excludeIdentified");
  expect(repeatRange(practicalRepeats.groups)).toBe(2);
  expect(repeatMean(practicalRepeats.splash)).toBeCloseTo(0.81, 12);
  expect(practicalRepeats.leak.decision).toBe("systematicFault");
  expect(practicalRepeats.groups.improvement).toBe("reproducibility");
});
test("fit previews preserve original points, constrain interpolation within each interval and refuse duplicate coordinates", () => {
  for (const [id, r] of Object.entries(practicalPlots)) {
    const board = expectedPracticalBoard("plot", id),
      before = JSON.stringify(board),
      preview = practicalFitPoints(r, board)!;
    expect(preview.length).toBeGreaterThan(6);
    expect(JSON.stringify(board)).toBe(before);
    const raw = r.times
      .map((x, i) => ({ x, y: r.readings[i], i }))
      .filter(
        (p) => !(r.anomalous === p.i && board.fit === "investigateSmooth"),
      );
    for (const p of preview) {
      const upper = raw.findIndex((x) => x.x >= p.x),
        a = raw[Math.max(0, upper - 1)],
        b = raw[upper];
      expect(p.y).toBeGreaterThanOrEqual(Math.min(a.y, b.y) - 1e-9);
      expect(p.y).toBeLessThanOrEqual(Math.max(a.y, b.y) + 1e-9);
    }
    expect(practicalFitPoints(r, { ...board, x1: board.x0 })).toBeNull();
    expect(practicalFitPoints(r, { ...board, placed0: "" })).toBeNull();
    expect(practicalFitPoints(r, { ...board, fitView: "" })).toBeNull();
  }
  const r = practicalPlots.anomaly,
    b = expectedPracticalBoard("plot", "anomaly"),
    curve = practicalFitPoints(r, b)!;
  expect(curve.find((p) => p.x === 30)!.y).toBeGreaterThan(20);
  expect(b.y3).toBe("15");
  const joined = practicalFitPoints(r, { ...b, fit: "joinEveryPoint" })!;
  expect(joined.find((p) => p.x === 30)!.y).toBe(15);
});
test("real apparatus assets connect a flask tubing and syringe with a supplied piston reading and correct solid identity", () => {
  for (const r of Object.values(practicalApparatus).filter(
    (r) => r.method === "syringe",
  )) {
    const root = practicalApparatusAsset(r);
    root.updateMatrixWorld(true);
    expect(root.userData.schematic).toBe(true);
    expect(root.userData.notToScale).toBe(true);
    for (const name of [
      "Conical flask",
      "Reaction mixture",
      "Gas-tight bung",
      "Delivery tubing",
      "Syringe nozzle",
      "Syringe barrel",
      "Piston face",
      "Piston rod",
      "Piston thumb plate",
    ])
      expect(root.getObjectByName(name)).toBeTruthy();
    expect(root.getObjectByName("Piston face")!.position.x).toBeCloseTo(
      -0.07 + (r.gasReading / 60) * 1.2,
      12,
    );
    expect(
      root.children.filter((x) => x.name.startsWith("Schematic graduation")),
    ).toHaveLength(7);
    if (r.reaction.startsWith("Mg"))
      expect(root.getObjectByName("Magnesium ribbon schematic")).toBeTruthy();
    else {
      expect(root.getObjectByName("Magnesium ribbon schematic")).toBeFalsy();
      expect(
        root.children.filter((x) => x.name.startsWith("Marble chip")),
      ).toHaveLength(3);
    }
    const box = new T.Box3().setFromObject(root);
    expect(box.min.x).toBeGreaterThan(-1.56);
    expect(box.max.x).toBeLessThan(2.31);
    expect(box.min.y).toBeGreaterThan(-0.81);
    expect(box.max.y).toBeLessThan(1.16);
  }
});
test("all71 tasks use audited references, honest writing, direct recovery and distinct reserved stems", () => {
  expect(tasks).toHaveLength(71);
  expect(new Set(tasks.map((t) => t.id)).size).toBe(71);
  const refs: Record<string, number> = {
    "w-mean": 30,
    "r-scale": 2,
    "r-stock": 25,
    "r-after-acid": 6,
    "r-dilution": 30,
    "r-proxy": 0.02,
    "r-interval": 2,
    "g-apparatus": 24,
    "g-dilution": 40,
    "g-endpoint": 40,
    "g-plot": 0.7,
    "g-repeats": 41,
    "p-mass-loss": 0.4,
    "p-water-scale": 32,
    "p-stock-sixteen": 20,
    "p-stock-different": 20,
    "p-combined-volume": 60,
    "p-after-acid": 4,
    "p-endpoint-ratio": 2,
    "p-endpoint-proxy": 0.025,
    "p-sensor-threshold": 30,
    "p-mass-interval": 0.0125,
    "p-remaining-mass": 0.025,
    "p-unequal-times": 0.88,
    "p-suspect-mean": 34,
    "p-repeat-range": 2,
    "p-identified-mean": 43,
    "a-dilution": 24,
    "a-endpoint": 0.05,
    "a-plot": 0.8,
    "b-dilution": 36,
    "b-plot": 0.02,
    "b-repeats": 37,
    "ra-dilution": 14,
    "rb-interval": 1.5,
  };
  expect(tasks.filter((t) => t.rubric)).toHaveLength(10);
  expect(tasks.filter((t) => !t.options && !t.rubric)).toHaveLength(35);
  for (const t of tasks) {
    const q = { ...t, skill: "rates-practical" },
      m = mark(q, t.answer);
    if (t.rubric) {
      expect(m.selfReview).toBe(true);
      expect(m.correct).toBe(false);
    } else {
      expect(m.correct).toBe(true);
      if (t.options)
        for (const v of t.options.filter((x) => x !== t.answer))
          expect(mark(q, v).correct).toBe(false);
      else expect(Number(t.answer)).toBe(refs[t.id.slice(6)]);
    }
    expect(Object.values(families).some((x) => x.includes(t.id.slice(6)))).toBe(
      true,
    );
  }
  for (const t of journey.practice)
    expect(journey.refresher.some((r) => r.id === t.followUp)).toBe(true);
  expect(journey.checkForms.map((x) => x.length)).toEqual([6, 6]);
  expect(journey.reviewForms.map((x) => x.length)).toEqual([3, 3]);
  for (const t of [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ]) {
    expect(t.model).toBeFalsy();
    expect(journey.guided.some((g) => g.prompt === t.prompt)).toBe(false);
  }
});
test("existing six legacy questions remain and exposure is explicit direct topic-relevant families", () => {
  const lesson = lessons.find((x) => x.slug === "rates-practical")!;
  expect(lesson.journey).toBe(journey);
  expect(lesson.tier).toBe("foundation");
  for (let i = 0; i < 6; i++)
    expect(
      [...lesson.questions, ...lesson.checks].some(
        (q) => q.id === "rates-practical-" + i,
      ),
    ).toBe(true);
  const guided = journey.guided[0],
    a = journey.checkForms[0];
  expect(guided.exposureAliases).toContain(a[0].id);
  expect(guided.exposureAliases).not.toContain(a[1].id);
  expect(guided.exposureAliases).toContain("rates-practical-0");
  expect(journey.guided[2].exposureAliases).not.toContain(a[0].id);
});
