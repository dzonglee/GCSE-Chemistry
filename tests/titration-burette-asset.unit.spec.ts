import { test, expect } from "@playwright/test";
import * as T from "three";
import { titrationBuretteAsset } from "../src/lib/titration-burette-asset";
test("same burette states have the same real linear graduation geometry and concave meniscus lower point", () => {
  const root = titrationBuretteAsset(1.4, 21.4);
  expect(root.userData.deliveredCm3).toBeCloseTo(20, 12);
  expect(root.children).toHaveLength(2);
  const arrays: number[][] = [];
  for (const [state, reading] of [
    ["before", 1.4],
    ["after", 21.4],
  ] as const) {
    const ticks = root.getObjectByName(
        `${state}-graduations-0-top-50-bottom`,
      ) as T.LineSegments,
      positions = ticks.geometry.getAttribute("position");
    expect(positions.count).toBe(102);
    expect(positions.getY(0)).toBeCloseTo(2.5, 6);
    expect(positions.getY(100)).toBeCloseTo(-2.5, 6);
    arrays.push(Array.from(positions.array));
    const fluid = root.getObjectByName(
        `${state}-solution-column-concave-meniscus`,
      ) as T.Mesh,
      vertices = fluid.geometry.getAttribute("position");
    let centralY = -Infinity,
      edgeY = -Infinity;
    for (let i = 0; i < vertices.count; i++) {
      const radius = Math.hypot(vertices.getX(i), vertices.getZ(i));
      if (radius < 1e-5) centralY = Math.max(centralY, vertices.getY(i));
      if (radius > 0.089) edgeY = Math.max(edgeY, vertices.getY(i));
    }
    expect(centralY).toBeCloseTo(2.5 - reading / 10, 6);
    expect(edgeY - centralY).toBeCloseTo(0.025, 6);
    expect(fluid.userData.notParticles).toBe(true);
  }
  expect(arrays[0]).toEqual(arrays[1]);
  expect(root.children[0].position.x).toBeLessThan(root.children[1].position.x);
});
test("shifting both readings preserves measured delivery but changes remaining calibrated liquid", () => {
  const a = titrationBuretteAsset(1.4, 21.4),
    b = titrationBuretteAsset(4.8, 24.8);
  expect(a.userData.deliveredCm3).toBeCloseTo(b.userData.deliveredCm3, 10);
  expect(a.children[1].userData.remainingCalibratedCm3).not.toBe(
    b.children[1].userData.remainingCalibratedCm3,
  );
  expect(() => titrationBuretteAsset(22, 21)).toThrow();
});
