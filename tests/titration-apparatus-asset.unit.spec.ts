import { test, expect } from "@playwright/test";
import * as T from "three";
import { titrationApparatusAsset } from "../src/lib/titration-apparatus-asset";
test("actual burette retains selected final level and increasing-downward graduations with depth", () => {
  for (const [initial, final] of [
    [1.2, 23.6],
    [4.35, 29.4],
    [0, 18.75],
  ]) {
    const root = titrationApparatusAsset(initial, final);
    root.updateMatrixWorld(true);
    expect(root.userData.deliveredCm3).toBeCloseTo(final - initial, 9);
    expect(root.getObjectByName("burette-before")).toBeUndefined();
    const liquid = root.getObjectByName(
      "after-solution-column-concave-meniscus",
    ) as T.Mesh;
    expect(liquid.userData.meniscusBottomY).toBeCloseTo(2.5 - final / 10, 10);
    const bounds = new T.Box3().setFromObject(liquid);
    expect(bounds.max.z - bounds.min.z).toBeGreaterThan(0.15);
    const ticks = root.getObjectByName(
      "after-graduations-0-top-50-bottom",
    ) as T.LineSegments;
    const p = ticks.geometry.getAttribute("position");
    expect(p.count).toBe(102);
    expect(p.getY(0)).toBeCloseTo(2.5);
    expect(p.getY(100)).toBeCloseTo(-2.5);
  }
});
test("open flask walls bench contact and jet clearance are independently coherent", () => {
  const root = titrationApparatusAsset(1.2, 23.6);
  root.updateMatrixWorld(true);
  const flask = root.getObjectByName("open-conical-flask") as T.Mesh;
  const tile = root.getObjectByName("white-tile") as T.Mesh;
  const tip = root.getObjectByName("after-uncalibrated-tip") as T.Mesh;
  const fb = new T.Box3().setFromObject(flask),
    tb = new T.Box3().setFromObject(tile),
    jb = new T.Box3().setFromObject(tip);
  expect(fb.min.y).toBeCloseTo(tb.max.y, 5);
  expect(jb.min.y).toBeGreaterThan(fb.max.y);
  expect(flask.userData.openTop).toBe(true);
  const profile = (flask.geometry as T.LatheGeometry).parameters.points;
  expect(
    profile.some(
      (p) =>
        Math.abs(p.y - flask.userData.neckTopY) < 1e-8 &&
        Math.abs(p.x - 0.155) < 1e-8,
    ),
  ).toBe(true);
  expect(
    profile.some(
      (p) =>
        Math.abs(p.y - flask.userData.neckTopY) < 1e-8 &&
        Math.abs(p.x - 0.19) < 1e-8,
    ),
  ).toBe(true);
  const liquid = root.getObjectByName(
    "flask-clear-solution-visibility-tint",
  ) as T.Mesh;
  const lb = new T.Box3().setFromObject(liquid);
  expect(lb.min.y).toBeGreaterThan(fb.min.y);
  expect(lb.max.y).toBeLessThan(flask.userData.neckTopY);
  expect(liquid.userData.notIndicatorColour).toBe(true);
});
test("apparatus is finite actual geometry rather than particle counts or a planar image", () => {
  const root = titrationApparatusAsset(4.35, 29.4);
  let meshes = 0;
  root.traverse((n) => {
    if (n instanceof T.Mesh) {
      meshes++;
      const p = n.geometry.getAttribute("position");
      expect(p.count).toBeGreaterThan(8);
      for (let i = 0; i < p.count; i++)
        expect([p.getX(i), p.getY(i), p.getZ(i)].every(Number.isFinite)).toBe(
          true,
        );
    }
  });
  expect(meshes).toBeGreaterThanOrEqual(10);
  expect(root.userData.representation).toContain("not particles");
  expect(() => titrationApparatusAsset(40, 20)).toThrow();
});
