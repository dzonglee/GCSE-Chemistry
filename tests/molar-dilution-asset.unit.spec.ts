import { test, expect } from "@playwright/test";
import * as T from "three";
import { molarDilutionAsset } from "../src/lib/molar-dilution-asset";
test("actual dilution geometry conserves separately identified ions and doubles solution volume", () => {
  const root = molarDilutionAsset();
  expect(root.userData.volumeRatio).toBe(2);
  const inventories: string[][] = [];
  const volumes: number[] = [];
  for (const group of root.children) {
    const ions = group.children.filter((x) => x.userData.ionId);
    expect(ions).toHaveLength(8);
    expect(ions.filter((x) => x.userData.element === "Na")).toHaveLength(4);
    expect(ions.reduce((sum, x) => sum + x.userData.charge, 0)).toBe(0);
    inventories.push(ions.map((x) => x.userData.ionId).sort());
    const edge = group.children.find((x) => x.userData.solutionBoundary)!;
    const box = new T.Box3().setFromObject(edge),
      size = box.getSize(new T.Vector3());
    volumes.push(size.x * size.y * size.z);
    for (const ion of ions) {
      const bounds = new T.Box3().setFromObject(ion);
      expect(box.containsBox(bounds)).toBe(true);
      expect(ion.userData.notMolecule).toBe(true);
    }
    expect(new Set(ions.map((x) => x.position.z)).size).toBeGreaterThan(3);
    for (let i = 0; i < ions.length; i++)
      for (let k = i + 1; k < ions.length; k++)
        expect(ions[i].position.distanceTo(ions[k].position)).toBeGreaterThan(
          0.8,
        );
  }
  expect(inventories[0]).toEqual(inventories[1]);
  expect(volumes[1] / volumes[0]).toBeCloseTo(2, 5);
  expect(
    root.children[0].userData.concentration /
      root.children[1].userData.concentration,
  ).toBe(2);
});

test("no-water geometry keeps final solution volume and concentration unchanged", () => {
  const root = molarDilutionAsset(false);
  expect(root.userData.volumeRatio).toBe(1);
  expect(root.userData.finalConcentration).toBe(0.4);
  const volumes = root.children.map((group) => {
    const frame = group.children.find(
      (node) => node.userData.solutionBoundary,
    )!;
    const size = new T.Box3().setFromObject(frame).getSize(new T.Vector3());
    return size.x * size.y * size.z;
  });
  expect(volumes[0]).toBe(volumes[1]);
});
