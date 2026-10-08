import { test, expect } from "@playwright/test";
import { temperatureScatter } from "../src/lib/temperature-scatter";
import { emptyFuelDrawing, readFuelDrawing } from "../src/lib/fuel-drawing";
import { practicalJourney as j } from "../src/content/journeys/energy-practical";
import { mark, displayResponse } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";

test("original temperature data support balanced straight fits and extrapolated initial estimates, with correct printed divisions", () => {
  for (const [name, d] of Object.entries(temperatureScatter)) {
    const [a, b] = name === "guided" ? [24, -0.7] : [22, -0.6];
    expect(d.data.points).toHaveLength(6);
    const residuals = d.data.points.map(([x, y]) => y - (a + b * x));
    expect(residuals.filter((r) => r > 0.001).length).toBeGreaterThanOrEqual(2);
    expect(residuals.filter((r) => r < -0.001).length).toBeGreaterThanOrEqual(
      2,
    );
    expect(Math.abs(residuals.reduce((s, r) => s + r, 0))).toBeLessThan(0.31);
    const xs = d.data.points.map((p) => p[0]),
      ys = d.data.points.map((p) => p[1]);
    const meanX = xs.reduce((s, x) => s + x, 0) / 6,
      meanY = ys.reduce((s, y) => s + y, 0) / 6;
    const slope =
      xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0) /
      xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
    expect(meanY - slope * meanX).toBeCloseTo(a, 0);
    expect(d.referenceLine![0]).toBeCloseTo(a + b * xs[0], 10);
    expect(d.referenceLine![1]).toBeCloseTo(a + b * xs.at(-1)!, 10);
    expect(d.data.yTick / 5).toBe(0.4);
    expect(d.data.yMin).toBeGreaterThan(0);
    expect(xs[0]).toBeGreaterThan(d.data.targetX);
    expect(d.data.estimateRange).toEqual([a - 0.2, a + 0.2]);
  }
});

test("blank, unreadable and wrong graph work is distinguished without awarding a graph or intercept mark", () => {
  const q = j.practice.find((q) => q.id === "ep-v1-p-scatter")!,
    d = q.fuelDrawing!,
    b = emptyFuelDrawing(d.data);
  expect(mark(q, JSON.stringify(b))).toMatchObject({
    empty: true,
    correct: false,
  });
  expect(mark(q, "{broken")).toMatchObject({ invalid: true, correct: false });
  b.p0x = "1..2";
  b.p0y = "20.4";
  b.c0 = "20.2";
  b.c5 = "11.2";
  b.estimate = "19";
  expect(readFuelDrawing(JSON.stringify(b), d.data)).toEqual(b);
  expect(mark(q, JSON.stringify(b))).toMatchObject({
    selfReview: true,
    correct: false,
    empty: false,
  });
  expect(displayResponse(q, JSON.stringify(b))).toContain("incomplete point 1");
  for (const [i, p] of d.data.points.entries()) {
    b["p" + i + "x"] = String(p[0]);
    b["p" + i + "y"] = String(p[1]);
  }
  b.estimate = "22";
  expect(mark(q, JSON.stringify(b))).toMatchObject({
    correct: false,
    selfReview: true,
  });
  expect(q.tier).toBeUndefined();
});

test("the appended graph practice retains independent data, direct recovery, saved drafts and original sealed forms", () => {
  const g = j.guided.find((q) => q.id === "ep-v1-g-scatter")!,
    r = j.refresher.find((q) => q.id === "ep-v1-r-scatter")!,
    p = j.practice.find((q) => q.id === "ep-v1-p-scatter")!;
  expect(p.followUp).toBe(r.id);
  expect(g.fuelDrawing).toEqual(r.fuelDrawing);
  expect(p.fuelDrawing!.data.points).not.toEqual(g.fuelDrawing!.data.points);
  expect(exposureIds([g.id])).toContain(r.id);
  expect(exposureIds([g.id])).not.toContain(p.id);
  expect(j.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  const progress = emptyProgress(),
    work = emptyWork();
  work.drafts[p.id] = JSON.stringify({
    ...emptyFuelDrawing(p.fuelDrawing!.data),
    p0x: "1e3",
    estimate: "22 g",
  });
  progress.work["energy-practical"] = work;
  expect(decode(JSON.stringify(progress))).toEqual(progress);
});
