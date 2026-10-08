import { test, expect } from "@playwright/test";
import * as T from "three";
import { energyCupAsset } from "../src/lib/energy-cup-asset";
const box = (root: T.Object3D, name: string) =>
  new T.Box3().setFromObject(root.getObjectByName(name)!);
test("real temperature display geometry preserves supplied Celsius digits including negative and decimal records", () => {
  for (const reading of [32, 15.5, -6, 50]) {
    const root = energyCupAsset(reading);
    root.updateMatrixWorld(true);
    expect(root.userData.temperatureC).toBe(reading);
    expect(root.userData.unit).toBe("°C");
    expect(
      root.children
        .filter((n) => n.userData.kind === "display-character")
        .map((n) => n.userData.character)
        .join(""),
    ).toBe(reading.toFixed(1));
    expect(root.children.some((n) => n.userData.atomicId)).toBe(false);
  }
  expect(() => energyCupAsset(50.1)).toThrow();
  expect(() => energyCupAsset(NaN)).toThrow();
  expect(() => energyCupAsset(15.55)).toThrow();
});
test("actual probe immersion and stirrer clearance are independently verified from transformed geometry", () => {
  const root = energyCupAsset();
  root.updateMatrixWorld(true);
  const tip = box(root, "immersed-temperature-sensor"),
    fluid = box(root, "reaction-solution"),
    stirrer = box(root, "stirring-rod"),
    meter = box(root, "meter-housing");
  expect(tip.min.y).toBeGreaterThan(fluid.min.y);
  expect(tip.max.y).toBeLessThan(fluid.max.y);
  expect(stirrer.max.y).toBeLessThan(meter.min.y);
  expect(box(root, "outer-cup-floor").min.y).toBeCloseTo(
    box(root, "bench").max.y,
    8,
  );
});
test("actual lid has separate through-holes and a front viewing cutaway, with solid cover elsewhere", () => {
  const root = energyCupAsset();
  root.updateMatrixWorld(true);
  const lid = root.getObjectByName(
      "cutaway-cover-with-probe-and-stirrer-holes",
    )!,
    ray = new T.Raycaster();
  for (const x of [-0.27, 0.27]) {
    ray.set(new T.Vector3(x, 0.8, 0), new T.Vector3(0, -1, 0));
    expect(ray.intersectObject(lid)).toHaveLength(0);
  }
  ray.set(new T.Vector3(0.65, 0.8, 0), new T.Vector3(0, -1, 0));
  expect(ray.intersectObject(lid).length).toBeGreaterThan(0);
  ray.set(new T.Vector3(0, 0.8, 0.5), new T.Vector3(0, -1, 0));
  expect(ray.intersectObject(lid)).toHaveLength(0);
});
test("real macro apparatus has finite raw vertices and depth while display changes do not change liquid geometry", () => {
  const a = energyCupAsset(20),
    b = energyCupAsset(32);
  a.updateMatrixWorld(true);
  b.updateMatrixWorld(true);
  expect(
    box(a, "reaction-solution").getSize(new T.Vector3()).toArray(),
  ).toEqual(box(b, "reaction-solution").getSize(new T.Vector3()).toArray());
  const bounds = new T.Box3().setFromObject(a);
  expect(bounds.max.z - bounds.min.z).toBeGreaterThan(2);
  a.traverse((n) => {
    if (n instanceof T.Mesh) {
      const p = n.geometry.getAttribute("position");
      let finite = true;
      for (let i = 0; i < p.count; i++)
        finite =
          finite && [p.getX(i), p.getY(i), p.getZ(i)].every(Number.isFinite);
      expect(finite, n.name).toBe(true);
    }
  });
});
