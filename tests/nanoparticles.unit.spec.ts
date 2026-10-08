import { test, expect } from "@playwright/test";
import {
  nanoBlocks,
  subdivisionData,
  cubeData,
  initialNanoBoard,
  validNanoBoard,
  nanoPrediction,
} from "../src/lib/nanoparticles";
import { nanoparticlesJourney as journey } from "../src/content/journeys/nanoparticles";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { lessons } from "../src/content/curriculum";
import { exposureIds } from "../src/lib/progress";
test("real subdivision coordinates conserve material and exclude contacting internal faces from exposed area", () => {
  for (const divisions of [1, 2, 3])
    for (const separated of [false, true]) {
      const blocks = nanoBlocks(divisions, separated),
        data = subdivisionData(divisions, separated);
      expect(blocks).toHaveLength(divisions ** 3);
      expect(new Set(blocks.map((b) => b.position.join(","))).size).toBe(
        blocks.length,
      );
      expect(blocks.reduce((s, b) => s + b.side ** 3, 0)).toBe(216);
      expect(data.totalVolume).toBe(216);
      expect(data.exposedArea).toBe(separated ? 216 * divisions : 216);
      let geometricArea = 0;
      for (const b of blocks) {
        expect(b.side).toBe(6 / divisions);
        for (let axis = 0; axis < 3; axis++)
          for (const sign of [-1, 1]) {
            const neighbour = blocks.some(
              (q) =>
                q.id !== b.id &&
                Math.abs(q.position[axis] - b.position[axis] - sign * b.side) <
                  1e-8 &&
                q.position.every(
                  (v, k) => k === axis || Math.abs(v - b.position[k]) < 1e-8,
                ),
            );
            if (!neighbour) geometricArea += b.side ** 2;
          }
      }
      expect(geometricArea).toBeCloseTo(data.exposedArea, 8);
    }
  expect(() => nanoBlocks(4, true)).toThrow();
  expect(() => cubeData(0)).toThrow();
  expect(() => cubeData(Infinity)).toThrow();
  expect(cubeData(4)).toEqual({ side: 4, area: 96, volume: 64, quotient: 1.5 });
  expect(cubeData(40).quotient / cubeData(4).quotient).toBeCloseTo(0.1);
});
test("all model modes retain strict typed fields and reject partial causal predictions", () => {
  for (const mode of ["subdivide", "cube", "scale", "evidence"] as const) {
    const b = initialNanoBoard(mode);
    expect(validNanoBoard(mode, b)).toBe(true);
    expect(validNanoBoard(mode, { ...b, extra: 1 })).toBe(false);
    expect(nanoPrediction(mode, b).correct).toBe(false);
  }
  for (const divisions of [1, 2, 3])
    for (const separated of ["yes", "no"]) {
      const b = {
        divisions,
        separated,
        area: divisions > 1 && separated === "yes" ? "larger" : "same",
        volume: "same",
      };
      expect(nanoPrediction("subdivide", b).correct).toBe(true);
      expect(
        nanoPrediction("subdivide", { ...b, volume: "larger" }).correct,
      ).toBe(false);
    }
  for (const side of [2, 4, 6]) {
    const d = cubeData(side);
    expect(
      nanoPrediction("cube", {
        side,
        area: String(d.area),
        volume: String(d.volume),
        ratio: String(d.quotient),
      }).correct,
    ).toBe(true);
  }
  for (const diameter of [20, 40, 80])
    expect(
      nanoPrediction("scale", {
        diameter,
        metres: String(diameter * 1e-9),
        comparison: String(diameter / 0.2),
      }).correct,
    ).toBe(true);
  for (const application of ["coating", "catalyst"]) {
    expect(
      nanoPrediction("evidence", {
        application,
        benefit: "less",
        risk: "study",
      }).correct,
    ).toBe(true);
    expect(
      nanoPrediction("evidence", { application, benefit: "less", risk: "safe" })
        .correct,
    ).toBe(false);
  }
  expect(
    validNanoBoard("subdivide", {
      divisions: "2",
      separated: "yes",
      area: "larger",
      volume: "same",
    }),
  ).toBe(false);
  expect(
    validNanoBoard("cube", {
      side: 4,
      area: "96",
      volume: "64",
      ratio: "1.50",
    }),
  ).toBe(false);
});
test("forty-eight individually authored tasks retain original preliminary bank and separate-chemistry scope", () => {
  const all = tasks(journey).filter((q) => q.id.startsWith("np-v1-"));
  expect(all).toHaveLength(48);
  expect(new Set(all.map((q) => q.id)).size).toBe(48);
  expect(
    journey.practice.filter((q) => q.id.startsWith("np-v1-")),
  ).toHaveLength(21);
  expect(journey.checkForms.slice(0, 2).map((f) => f.length)).toEqual([5, 5]);
  expect(journey.reviewForms.slice(0, 2).map((f) => f.length)).toEqual([3, 3]);
  for (const q of all) {
    expect(mark(q, q.answer).correct).toBe(!q.rubric);
    if (q.rubric) expect(mark(q, q.answer).selfReview).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct).toBe(false);
  }
  for (const q of [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
  ])
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  const lesson = lessons.find((l) => l.slug === "particles-and-nanoparticles")!;
  expect(lesson.course).toBe("separate");
  expect(lesson.prerequisite).toBe("states-of-matter");
  expect(lesson.questions).toHaveLength(4);
  expect(lesson.checks).toHaveLength(2);
  expect(exposureIds([journey.checkForms[0][3].id])).toContain(
    "np-v1-g-subdivide",
  );
  for (const q of journey.guided.slice(0, 4)) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    expect(validHistory(q.model!, [b])).toBe(true);
  }
});

test("simplified numerical ratio rejects unsimplified equivalents and missing values", () => {
  const q = journey.practice.find((q) => q.parts)!;
  expect(mark(q, JSON.stringify({ area: "6", volume: "5" })).correct).toBe(
    true,
  );
  for (const values of [
    { area: "150", volume: "125" },
    { area: "12", volume: "10" },
    { area: "5", volume: "6" },
    { area: "6", volume: "" },
  ])
    expect(mark(q, JSON.stringify(values)).correct).toBe(false);
  expect(exposureIds(["particles-and-nanoparticles-4"])).toContain(
    "np-v1-ca-risk",
  );
});
