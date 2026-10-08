import { test, expect } from "@playwright/test";
import * as T from "three";
import { hydroxideOxidationAsset } from "../src/lib/hydroxide-oxidation-asset";
function atoms(g: T.Object3D) {
  const a: T.Object3D[] = [];
  g.traverse((n) => {
    if (n.userData.atomicId) a.push(n);
  });
  return a;
}
test("actual asset retains O4H4 and eight IDs per state, with external electron charge separately preserved", () => {
  const root = hydroxideOxidationAsset();
  expect(root.children).toHaveLength(2);
  const ids = root.children.map((g) => {
    const a = atoms(g);
    expect(a).toHaveLength(8);
    expect(a.filter((n) => n.userData.element === "O")).toHaveLength(4);
    expect(a.filter((n) => n.userData.element === "H")).toHaveLength(4);
    expect(g.userData.chemicalCharge + g.userData.externalCharge).toBe(-4);
    let charge = 0;
    g.traverse((n) => (charge += n.userData.ionicCharge ?? 0));
    expect(charge).toBe(g.userData.chemicalCharge);
    expect(g.userData.externalElectrons).toBe(g.name === "before" ? 0 : 4);
    expect(a.every((n) => n.userData.element !== "electron")).toBe(true);
    return a.map((n) => n.userData.atomicId).sort();
  });
  expect(ids[0]).toEqual(ids[1]);
});
test("water has actual bent geometry and oxygen has two atoms with two double-bond rods", () => {
  const root = hydroxideOxidationAsset();
  root.updateMatrixWorld(true);
  const after = root.children[1];
  for (const w of after.children.filter((n) =>
    n.userData.species?.startsWith("H2O"),
  )) {
    const a = atoms(w),
      o = a
        .find((n) => n.userData.element === "O")!
        .getWorldPosition(new T.Vector3()),
      vs = a
        .filter((n) => n.userData.element === "H")
        .map((n) => n.getWorldPosition(new T.Vector3()).sub(o));
    expect(vs).toHaveLength(2);
    for (const v of vs) expect(v.length()).toBeCloseTo(0.48, 12);
    expect((vs[0].angleTo(vs[1]) * 180) / Math.PI).toBeCloseTo(104.5, 12);
  }
  const oxygen = after.children.find((n) => n.userData.species === "O2")!;
  expect(atoms(oxygen)).toHaveLength(2);
  expect(
    oxygen.children.filter((n) => n.userData.bondOrder === 2),
  ).toHaveLength(2);
});
test("four cardinal views keep projected atomic circles apart and inside each frame", () => {
  const root = hydroxideOxidationAsset();
  for (const yaw of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    for (const g of root.children)
      g.children
        .filter((n) => n.userData.rotateAsSubstance)
        .forEach((n) => (n.rotation.y = yaw));
    root.updateMatrixWorld(true);
    for (const g of root.children) {
      const a = atoms(g),
        ps = a.map((n) => g.worldToLocal(n.getWorldPosition(new T.Vector3()))),
        radius = (i: number) => (a[i].userData.element === "O" ? 0.15 : 0.075);
      for (let i = 0; i < a.length; i++) {
        for (let k = i + 1; k < a.length; k++)
          expect(
            Math.hypot(ps[i].x - ps[k].x, ps[i].y - ps[k].y),
          ).toBeGreaterThan(radius(i) + radius(k));
        expect(Math.abs(ps[i].x) + radius(i)).toBeLessThan(1.4);
        expect(Math.abs(ps[i].y) + radius(i)).toBeLessThan(1.4);
        expect(Math.abs(ps[i].z) + radius(i)).toBeLessThan(0.75);
      }
    }
  }
});
