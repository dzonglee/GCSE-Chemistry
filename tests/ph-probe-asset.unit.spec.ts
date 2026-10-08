import { test, expect } from "@playwright/test";
import * as T from "three";
import { phProbeAsset, sevenSegments } from "../src/lib/ph-probe-asset";
test("actual macro reference has an immersed tip, clear liquid and open thick-walled beaker, with no atomic-particle metadata", () => {
  const root = phProbeAsset(4.2);
  root.updateMatrixWorld(true);
  expect(root.userData.phReading).toBe(4.2);
  expect(root.userData.indicatorAdded).toBe(false);
  expect(root.userData.unit).toBe("dimensionless pH");
  const get = (name: string) => root.getObjectByName(name)!,
    tip = new T.Box3().setFromObject(get("immersed-sensing-tip")),
    liquid = new T.Box3().setFromObject(get("clear-solution")),
    floor = new T.Box3().setFromObject(get("beaker-floor")),
    bench = new T.Box3().setFromObject(get("bench"));
  expect(tip.min.y).toBeGreaterThan(liquid.min.y);
  expect(tip.max.y).toBeLessThan(liquid.max.y);
  expect(tip.min.x).toBeGreaterThan(liquid.min.x);
  expect(tip.max.x).toBeLessThan(liquid.max.x);
  expect(liquid.min.y).toBeGreaterThan(floor.max.y);
  expect(floor.min.y).toBeCloseTo(bench.max.y, 7);
  expect(get("open-beaker-wall").userData.openTop).toBe(true);
  const positions = (get("open-beaker-wall") as T.Mesh).geometry.getAttribute(
      "position",
    ),
    radii = Array.from({ length: positions.count }, (_, i) =>
      Math.hypot(positions.getX(i), positions.getZ(i)),
    );
  expect(Math.min(...radii)).toBeCloseTo(0.7, 6);
  expect(Math.max(...radii)).toBeCloseTo(0.72, 6);
  root.traverse((n) => {
    expect(n.userData.atomicId).toBeUndefined();
    expect(n.userData.element).toBeUndefined();
  });
});
test("actual seven-segment strokes encode supplied readings, have real depth and sit in front of the display face", () => {
  for (const value of [0, 4.2, 7, 11.6, 14]) {
    const root = phProbeAsset(value),
      chars = root.children.filter(
        (n) => n.userData.kind === "display-character",
      );
    expect(chars.map((n) => n.userData.character).join("")).toBe(
      value.toFixed(1),
    );
    root.updateMatrixWorld(true);
    for (const g of chars)
      if (g.userData.character !== ".") {
        expect(g.children.map((n) => n.userData.segment).sort()).toEqual(
          [...sevenSegments[g.userData.character]].sort(),
        );
        for (const n of g.children) {
          const box = new T.Box3().setFromObject(n);
          expect(box.max.z - box.min.z).toBeGreaterThan(0.02);
          expect(box.min.z).toBeGreaterThan(0.185);
          expect(box.min.x).toBeGreaterThan(0.425);
          expect(box.max.x).toBeLessThan(1.875);
        }
      }
    expect(chars.filter((n) => n.userData.character === ".")).toHaveLength(1);
  }
});
test("unsupported readings cannot silently generate a different pH display", () => {
  for (const n of [-0.1, 14.1, 4.22, NaN, Infinity])
    expect(() => phProbeAsset(n)).toThrow();
});
