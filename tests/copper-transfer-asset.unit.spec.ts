import { test, expect } from "@playwright/test";
import * as T from "three";
import { copperTransferAsset } from "../src/lib/copper-transfer-asset";
function atoms(g: T.Object3D) {
  const result: T.Object3D[] = [];
  g.traverse((n) => {
    if (n.userData.element) result.push(n);
  });
  return result;
}
test("true copper transfer retains twelve IDs, Cu7S1O4 and net represented charge zero per state", () => {
  const root = copperTransferAsset();
  expect(root.children).toHaveLength(2);
  const inventories = root.children.map((g) => {
    const list = atoms(g);
    expect(list).toHaveLength(12);
    expect(list.filter((a) => a.userData.element === "Cu")).toHaveLength(7);
    expect(list.filter((a) => a.userData.element === "S")).toHaveLength(1);
    expect(list.filter((a) => a.userData.element === "O")).toHaveLength(4);
    let charge = 0;
    g.traverse((n) => (charge += n.userData.ionicCharge ?? 0));
    expect(charge).toBe(0);
    const regions = g.children.filter((n) => n.userData.species);
    expect(atoms(regions.find((n) => n.name.includes("anode"))!)).toHaveLength(
      g.name === "before" ? 3 : 2,
    );
    expect(
      atoms(regions.find((n) => n.name.includes("cathode"))!),
    ).toHaveLength(g.name === "before" ? 3 : 4);
    const ion = regions.find((n) => n.userData.species === "Cu2+(aq)")!;
    expect(ion.userData.ionicCharge).toBe(2);
    expect(atoms(ion)[0].userData.atomicId).toBe(
      g.name === "before" ? "Cu-solution-1" : "Cu-anode-3",
    );
    expect(
      atoms(regions.find((n) => n.userData.species === "SO4²−(aq)")!),
    ).toHaveLength(5);
    return list.map((a) => a.userData.atomicId).sort();
  });
  expect(inventories[0]).toEqual(inventories[1]);
});
test("sulfate retains tetrahedral geometry and four internal connections in each state", () => {
  const root = copperTransferAsset();
  root.updateMatrixWorld(true);
  for (const g of root.children) {
    const sulfate = g.children.find((n) => n.userData.species === "SO4²−(aq)")!,
      list = atoms(sulfate),
      s = list
        .find((a) => a.userData.element === "S")!
        .getWorldPosition(new T.Vector3()),
      vs = list
        .filter((a) => a.userData.element === "O")
        .map((a) => a.getWorldPosition(new T.Vector3()).sub(s));
    for (const v of vs) expect(v.length()).toBeCloseTo(0.48, 12);
    for (let i = 0; i < 4; i++)
      for (let k = i + 1; k < 4; k++)
        expect(
          vs[i].clone().normalize().dot(vs[k].clone().normalize()),
        ).toBeCloseTo(-1 / 3, 12);
    const bonds: T.Object3D[] = [];
    sulfate.traverse((n) => {
      if (n.userData.kind === "sulfate-connection") bonds.push(n);
    });
    expect(bonds).toHaveLength(4);
  }
});
test("cardinal rotations keep projected atom circles separate and every atom inside its visual frame", () => {
  const root = copperTransferAsset();
  for (const g of root.children)
    for (const yaw of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
      g.children
        .filter((n) => n.userData.rotateAsSubstance)
        .forEach((n) => (n.rotation.y = yaw));
      root.updateMatrixWorld(true);
      const list = atoms(g),
        ps = list.map((a) =>
          g.worldToLocal(a.getWorldPosition(new T.Vector3())),
        ),
        radius = (i: number) =>
          list[i].userData.element === "O" ? 0.095 : 0.12;
      for (let i = 0; i < ps.length; i++) {
        for (let k = i + 1; k < ps.length; k++)
          expect(
            Math.hypot(ps[i].x - ps[k].x, ps[i].y - ps[k].y),
          ).toBeGreaterThan(radius(i) + radius(k));
        expect(Math.abs(ps[i].x) + radius(i)).toBeLessThan(1.7);
        expect(Math.abs(ps[i].y) + radius(i)).toBeLessThan(1.6);
        expect(Math.abs(ps[i].z) + radius(i)).toBeLessThan(0.9);
      }
    }
});
