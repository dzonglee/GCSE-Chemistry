import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { test, expect } from "@playwright/test";
import {
  concentrationLedger,
  soluteMass,
  solutionVolume,
  initialConcentrationBoard,
  validConcentrationBoard,
  concentrationPrediction,
  type ConcentrationMode,
} from "../src/lib/solution-concentration";
import { solutionVolumeAsset } from "../src/lib/solution-volume-asset";
import { concentrationJourney as journey } from "../src/content/journeys/concentration";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import * as T from "three";
test("mass concentration uses final solution volume and all three rearrangements with exact cubic conversions", () => {
  expect(concentrationLedger(4, 200)).toEqual({
    soluteGrams: 4,
    solutionCm3: 200,
    dm3: 0.2,
    concentration: 20,
  });
  expect(soluteMass(4, 25)).toBe(0.1);
  expect(soluteMass(8, 720)).toBe(5.76);
  expect(solutionVolume(3, 24)).toEqual({ dm3: 0.125, cm3: 125 });
  expect(concentrationLedger(2.5, 200).concentration).toBe(12.5);
  expect(concentrationLedger(9, 500).concentration).toBe(18);
  expect(() => concentrationLedger(4, 0)).toThrow();
  expect(() => soluteMass(Infinity, 25)).toThrow();
  expect(() => solutionVolume(4, -1)).toThrow();
});
test("every supported native combination has a valid correct board while wrong identities and unit directions remain wrong", () => {
  for (const mode of [
    "unit-rate",
    "basis",
    "mass",
    "volume",
  ] as ConcentrationMode[]) {
    const b = initialConcentrationBoard(mode);
    expect(validConcentrationBoard(mode, b)).toBe(true);
    expect(concentrationPrediction(mode, b).correct).toBe(false);
    expect(validConcentrationBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  for (const mass of [4, 10, 20])
    for (const cm3 of [100, 200, 250, 500, 1000]) {
      const d = concentrationLedger(mass, cm3),
        b = {
          mass,
          cm3,
          dm3: String(d.dm3),
          concentration: String(d.concentration),
        };
      expect(validConcentrationBoard("unit-rate", b)).toBe(true);
      expect(concentrationPrediction("unit-rate", b).correct).toBe(true);
    }
  for (const concentration of [4, 20, 40])
    for (const cm3 of [25, 100, 250, 500]) {
      const b = {
        concentration,
        cm3,
        dm3: String(cm3 / 1000),
        mass: String(soluteMass(concentration, cm3)),
      };
      expect(validConcentrationBoard("mass", b)).toBe(true);
      expect(concentrationPrediction("mass", b).correct).toBe(true);
    }
  for (const mass of [4, 10, 20])
    for (const concentration of [20, 40, 80]) {
      const d = solutionVolume(mass, concentration),
        b = { mass, concentration, dm3: String(d.dm3), cm3: String(d.cm3) };
      expect(validConcentrationBoard("volume", b)).toBe(true);
      expect(concentrationPrediction("volume", b).correct).toBe(true);
    }
  expect(
    concentrationPrediction("basis", {
      numerator: "solute",
      denominator: "solution",
      concentration: "20",
    }).correct,
  ).toBe(true);
  expect(
    concentrationPrediction("basis", {
      numerator: "whole",
      denominator: "solution",
      concentration: "1040",
    }).correct,
  ).toBe(false);
  expect(
    concentrationPrediction("basis", {
      numerator: "solute",
      denominator: "solvent",
      concentration: "20",
    }).correct,
  ).toBe(false);
  expect(
    validConcentrationBoard("unit-rate", {
      ...initialConcentrationBoard("unit-rate"),
      cm3: "200",
    }),
  ).toBe(false);
});
test("actual cubic volume geometry preserves labelled solute identities and scales physical volume rather than side length linearly", () => {
  for (const mass of [4, 10, 20])
    for (const cm3 of [100, 200, 250, 500, 1000]) {
      const root = solutionVolumeAsset(mass, cm3),
        box = root.getObjectByName(
          "final-solution-volume",
        ) as T.Mesh<T.BoxGeometry>,
        p = box.geometry.parameters,
        side = 4 * Math.cbrt(cm3 / 1000),
        portions = root.children.filter((n) =>
          n.name.startsWith("dissolved-solute-portion-"),
        );
      expect((p.width * p.height * p.depth) / 64).toBeCloseTo(cm3 / 1000, 9);
      expect(box.position.y).toBeCloseTo(-2 + side / 2, 9);
      expect(portions).toHaveLength(mass);
      expect(
        new Set(portions.map((n) => n.position.z)).size,
      ).toBeGreaterThanOrEqual(Math.min(mass, 5));
      expect(portions.map((n) => n.userData.portionId)).toEqual(
        Array.from({ length: mass }, (_, i) => i),
      );
      expect(portions.reduce((sum, n) => sum + n.userData.grams, 0)).toBe(mass);
      for (const n of portions) {
        expect(Math.abs(n.position.x) + 0.07).toBeLessThan(side / 2);
        expect(Math.abs(n.position.z) + 0.07).toBeLessThan(side / 2);
        expect(n.position.y - 0.07).toBeGreaterThan(-2);
        expect(n.position.y + 0.07).toBeLessThan(-2 + side);
      }
      for (let i = 0; i < portions.length; i++)
        for (let j = i + 1; j < portions.length; j++)
          expect(
            portions[i].position.distanceTo(portions[j].position),
          ).toBeGreaterThan(0.14);
    }
  const small = solutionVolumeAsset(10, 250),
    large = solutionVolumeAsset(10, 500);
  expect(large.userData.sideDm / small.userData.sideDm).toBeCloseTo(
    Math.cbrt(2),
    9,
  );
  expect(large.userData.soluteGrams).toBe(small.userData.soluteGrams);
  expect(large.userData.concentration).toBe(20);
  expect(small.userData.concentration).toBe(40);
});
test("all forty-nine individual tasks retain correct quantities and multipart working while written explanations remain self-reviewed", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(49);
  expect(journey.practice).toHaveLength(22);
  expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    if (q.rubric) expect(mark(q, q.answer).selfReview).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  const working = journey.practice.find((q) => q.id === "sc-v1-p-working")!;
  expect(
    mark(
      working,
      JSON.stringify({ mass: "430", volume: "0.4", concentration: "1075" }),
    ).correct,
  ).toBe(false);
  expect(
    mark(working, JSON.stringify({ mass: "8", volume: "0.4" })).correct,
  ).toBe(false);
  expect(working.partLegend).not.toContain("particle");
});

test("refocused original route retains legacy banks and valid saved boards while aliasing repeated unit facts", () => {
  const l = lessons.find((l) => l.slug === "conservation-and-concentration")!;
  expect(l.questions).toHaveLength(4);
  expect(l.checks).toHaveLength(2);
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => `conservation-and-concentration-${i}`),
  );
  expect(l.prerequisite).toBe("formulae-and-mass");
  expect(l.course).toBe("combined");
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of journey.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels["sc-v1-g-unit"] = [
    { ...initialConcentrationBoard("unit-rate"), cm3: "200" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
  expect(exposureIds(["sc-v1-ca-basis"])).toContain("sc-v1-g-basis");
  expect(exposureIds(["sc-v1-g-unit"])).toContain(
    "conservation-and-concentration-4",
  );
  expect(exposureIds(["sc-v1-ca-c"])).toEqual(["sc-v1-ca-c"]);
});
