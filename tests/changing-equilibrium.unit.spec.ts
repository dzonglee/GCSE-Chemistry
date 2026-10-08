import { test, expect } from "@playwright/test";
import * as T from "three";
import {
  equilibriumShiftJourney as journey,
  equilibriumShiftAllTasks as tasks,
  equilibriumShiftExposureFamilies,
} from "../src/content/journeys/changing-equilibrium";
import {
  compressionRecords,
  compressionSnapshot,
  gasTotal,
  atomTotals,
  concentrationRecords,
  pressureRecords,
  pressureShift,
  temperatureRecords,
  temperatureShift,
  combinedRecords,
  combinedShifts,
  type ShiftMode,
} from "../src/lib/equilibrium-shifts";
import {
  initialShiftBoard,
  expectedShiftBoard,
  validShiftBoard,
  shiftHistoryStep,
  shiftRecords,
  shiftFields,
} from "../src/lib/equilibrium-shift-board";
import { equilibriumAsset } from "../src/lib/equilibrium-asset";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import type { TaskModel } from "../src/content/types";
const modes = Object.keys(shiftRecords) as ShiftMode[];
for (const mode of modes)
  test(`${mode}: complete scientific predictions and strict native saved histories for six records`, () => {
    expect(Object.keys(shiftRecords[mode])).toHaveLength(6);
    for (const record of Object.keys(shiftRecords[mode])) {
      const model: TaskModel = {
          kind: "equilibrium-shift",
          mode,
          record,
          instruction: "Predict this comparison.",
        },
        first = initialShiftBoard(mode, record),
        answer = expectedShiftBoard(mode, record),
        history = [first];
      expect(initialBoard(model)).toEqual(first);
      expect(checkBoard(model, first).correct).toBe(false);
      if (mode === "compression")
        for (const step of ["1", "2"])
          history.push({ ...history.at(-1)!, step });
      for (const [key, value] of Object.entries(answer))
        if (history.at(-1)![key] !== value)
          history.push({ ...history.at(-1)!, [key]: value });
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, answer).correct).toBe(true);
      const wrong = { ...answer };
      if (mode === "compression" || mode === "concentration")
        wrong.response = "complete";
      else if (mode === "pressure") wrong.reason = "heavierGas";
      else if (mode === "temperature") wrong.rate = "unchanged";
      else if (mode === "combined")
        wrong.overall = answer.overall === "forward" ? "reverse" : "forward";
      else wrong.controlTime = "99";
      expect(validShiftBoard(mode, wrong)).toBe(true);
      expect(checkBoard(model, wrong).correct).toBe(false);
    }
  });
test("canonical fields reject extra missing coerced fractional gas and malformed decimal values", () => {
  for (const mode of modes) {
    const b = expectedShiftBoard(mode, "initial");
    expect(validShiftBoard(mode, { ...b, extra: "0" })).toBe(false);
    const missing = { ...b };
    delete missing.record;
    expect(validShiftBoard(mode, missing)).toBe(false);
    expect(validShiftBoard(mode, { ...b, record: "unknown" })).toBe(false);
    expect(validShiftBoard(mode, { ...b, [shiftFields[mode][1]]: 0 })).toBe(
      false,
    );
  }
  for (const value of ["", "1/2", "1e2", "01", "Infinity", "-1", "100001"])
    expect(
      validShiftBoard("concentration", {
        ...expectedShiftBoard("concentration", "initial"),
        later: value,
      }),
    ).toBe(false);
  expect(
    validShiftBoard("pressure", {
      ...expectedShiftBoard("pressure", "initial"),
      left: "2.5",
    }),
  ).toBe(false);
  expect(
    validShiftBoard("compression", {
      ...expectedShiftBoard("compression", "initial"),
      immediate: "24.5",
    }),
  ).toBe(false);
});
test("record switches are pristine atomic resets and compression cannot skip stages", () => {
  for (const mode of modes) {
    const a = expectedShiftBoard(mode, "initial"),
      record = Object.keys(shiftRecords[mode])[1],
      b = initialShiftBoard(mode, record);
    expect(shiftHistoryStep(mode, a, b)).toBe(true);
    expect(
      shiftHistoryStep(mode, a, {
        ...b,
        ...(mode === "compression"
          ? { immediate: "3" }
          : mode === "pressure"
            ? { left: "3" }
            : mode === "temperature"
              ? { rate: "faster" }
              : mode === "concentration"
                ? { later: "3" }
                : mode === "combined"
                  ? { overall: "forward" }
                  : { controlTime: "3" }),
      }),
    ).toBe(false);
  }
  const b = initialShiftBoard("compression");
  expect(shiftHistoryStep("compression", b, { ...b, step: "2" })).toBe(false);
  expect(
    shiftHistoryStep("compression", { ...b, step: "2" }, { ...b, step: "1" }),
  ).toBe(false);
});
test("all eighteen actual 3D inventories conserve atoms, stay contained and keep fixed molecular geometry", () => {
  for (const r of Object.values(compressionRecords)) {
    expect(atomTotals(r.initial)).toEqual(atomTotals(r.later));
    const invariant = (i: typeof r.initial) =>
      i.ammonia ** 2 / (i.nitrogen * i.hydrogen ** 3);
    expect(invariant(r.initial)).toBeCloseTo(
      invariant(r.later) * r.volume ** 2,
      12,
    );
    const before = gasTotal(r.initial),
      immediate = before / r.volume,
      later = gasTotal(r.later) / r.volume;
    expect(
      r.volume < 1
        ? before < later && later < immediate
        : immediate < later && later < before,
    ).toBe(true);
    for (const stage of [0, 1, 2] as const) {
      const s = compressionSnapshot(r, stage),
        root = equilibriumAsset(r, stage),
        half = 1.5 * Math.cbrt(s.volume),
        atoms = { nitrogen: 0, hydrogen: 0 },
        inventory = { nitrogen: 0, hydrogen: 0, ammonia: 0 };
      root.updateMatrixWorld(true);
      for (const group of root.children.filter((x) => x.userData.species)) {
        inventory[group.userData.species as keyof typeof inventory]++;
        group.traverse((x) => {
          if (x.userData.element) {
            atoms[x.userData.element as keyof typeof atoms]++;
            expect(x.userData.radius).toBe(
              x.userData.element === "nitrogen" ? 0.078 : 0.054,
            );
          }
          if (x instanceof T.Mesh) {
            const box = new T.Box3().setFromObject(x);
            for (const axis of ["x", "y", "z"] as const) {
              expect(box.min[axis]).toBeGreaterThanOrEqual(-half - 1e-8);
              expect(box.max[axis]).toBeLessThanOrEqual(half + 1e-8);
            }
          }
        });
        if (group.userData.species === "nitrogen")
          expect(
            group.children.filter((x) => x.name.startsWith("triple-bond")),
          ).toHaveLength(3);
        if (group.userData.species === "ammonia") {
          const hs = group.children
            .filter((x) => x.userData.element === "hydrogen")
            .map((x) => x.position.clone().normalize());
          for (let a = 0; a < 3; a++)
            for (let b = a + 1; b < 3; b++)
              expect(hs[a].dot(hs[b])).toBeCloseTo(-1 / 3, 12);
        }
      }
      expect(inventory).toEqual(s.inventory);
      expect(atoms).toEqual(atomTotals(s.inventory));
    }
  }
});
test("concentration states conserve edited amounts and retain partial counteraction at fixed conditions", () => {
  for (const r of Object.values(concentrationRecords)) {
    expect(r.initial[1] / r.initial[0]).toBeCloseTo(
      r.later[1] / r.later[0],
      12,
    );
    expect(r.immediate[0] + r.immediate[1]).toBeCloseTo(
      r.later[0] + r.later[1],
      12,
    );
    const index = r.edited === "reactant" ? 0 : 1;
    expect(r.later[index]).not.toBe(r.initial[index]);
    expect(r.later[index]).not.toBe(r.immediate[index]);
  }
});
test("phase counts, reversed energy directions and opposing changes never invent a net yield", () => {
  expect(Object.values(pressureRecords).map(pressureShift)).toEqual([
    "forward",
    "reverse",
    "unchanged",
    "reverse",
    "reverse",
    "reverse",
  ]);
  expect(Object.values(temperatureRecords).map(temperatureShift)).toEqual([
    "reverse",
    "forward",
    "forward",
    "reverse",
    "forward",
    "forward",
  ]);
  expect(
    Object.values(combinedRecords).map((r) => combinedShifts(r).overall),
  ).toEqual([
    "insufficient",
    "forward",
    "reverse",
    "insufficient",
    "forward",
    "forward",
  ]);
});
test("all sixty-seven individual tasks mark honestly with twenty audited numbers and topic-relevant recovery", () => {
  expect(tasks).toHaveLength(67);
  expect(new Set(tasks.map((t) => t.id)).size).toBe(67);
  expect(tasks.filter((t) => t.rubric)).toHaveLength(11);
  const references: Record<string, number> = {
    "w-gas": 4,
    "g-compression": 24,
    "g-pressure": 0,
    "g-concentration": 6,
    "g-evidence": 2,
    "r-coefficients": 3,
    "r-atoms": 9,
    "r-plateau": 6,
    "p-immediate": 18,
    "p-conserved": 16,
    "p-unfamiliar-count": 2,
    "p-add-account": 3,
    "p-removal-account": 1.8,
    "p-control-time": 9,
    "a-phase": 1,
    "a-add": 8,
    "b-coefficients": 5,
    "b-removal": 4,
    "ra-atoms": 13,
    "rb-time": 8,
  };
  const numeric = tasks.filter((t) => !t.rubric && !t.options);
  expect(numeric).toHaveLength(20);
  for (const t of numeric)
    expect(Number(t.answer)).toBe(references[t.id.slice(6)]);
  for (const t of tasks) {
    const q = { ...t, skill: "changing-equilibrium" },
      result = mark(q, t.answer);
    if (t.rubric) {
      expect(result.correct).toBe(false);
      expect(result.selfReview).toBe(true);
    } else {
      expect(result.correct, t.id).toBe(true);
      if (t.options)
        for (const v of t.options.filter((v) => v !== t.answer))
          expect(mark(q, v).correct, t.id + " distractor").toBe(false);
      else expect(mark(q, "99999").correct).toBe(false);
    }
  }
  for (const t of journey.practice)
    expect(
      journey.refresher.some((r) => r.id === t.followUp),
      t.id,
    ).toBe(true);
  for (const set of [...journey.checkForms, ...journey.reviewForms])
    for (const t of set) expect(t.model).toBeUndefined();
});
test("all direct exposure families and six legacy IDs are retained without transitive spreading", () => {
  const lesson = lessons.find((l) => l.slug === "changing-equilibrium")!,
    pool = lessons.flatMap((l) => [
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
  expect(lesson.tier).toBe("higher");
  expect(lesson.journey).toBe(journey);
  for (let i = 0; i < 6; i++)
    expect(
      [...lesson.questions, ...lesson.checks].some(
        (q) => q.id === "changing-equilibrium-" + i,
      ),
    ).toBe(true);
  for (const [family, members] of Object.entries(
    equilibriumShiftExposureFamilies,
  ))
    for (const id of members) {
      const q = pool.find((t) => t.id === "es-v1-" + id)!;
      expect(q, family + id).toBeDefined();
      for (const other of members.filter((x) => x !== id))
        expect(q.exposureAliases).toContain("es-v1-" + other);
    }
  expect(journey.guided[0].exposureAliases).toContain("es-v1-a-phase");
  expect(journey.guided[0].exposureAliases).not.toContain(
    "es-v1-b-temperature",
  );
  expect(journey.checkForms[0][4].exposureAliases).toContain(
    "re-v1-p-catalyst",
  );
});
