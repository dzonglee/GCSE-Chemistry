import { test, expect } from "@playwright/test";
import * as T from "three";
import { displacementAsset } from "../src/lib/displacement-asset";
const atoms = (g: T.Object3D) => {
  const a: T.Mesh[] = [];
  g.traverse((n) => {
    if (n.userData.atomicId) a.push(n as T.Mesh);
  });
  return a;
};
test("actual displacement asset retains eleven IDs and physically present nitrate spectators in each state", () => {
  const root = displacementAsset(),
    [before, after] = root.children;
  expect(
    atoms(before)
      .map((n) => n.userData.atomicId)
      .sort(),
  ).toEqual(
    atoms(after)
      .map((n) => n.userData.atomicId)
      .sort(),
  );
  for (const state of root.children) {
    expect(atoms(state)).toHaveLength(11);
    const inventory = atoms(state).map((n) => n.userData.element);
    for (const [element, count] of Object.entries({ Cu: 1, Ag: 2, N: 2, O: 6 }))
      expect(inventory.filter((x) => x === element)).toHaveLength(count);
    expect(
      state.children.reduce((sum, n) => sum + n.userData.speciesCharge, 0),
    ).toBe(0);
    const nitrates = state.children.filter((n) =>
      String(n.userData.representedSubstance).startsWith("NO3"),
    );
    expect(nitrates).toHaveLength(2);
    for (const nitrate of nitrates) {
      expect(nitrate.userData.speciesCharge).toBe(-1);
      expect(atoms(nitrate)).toHaveLength(4);
    }
  }
  expect(before.children.map((n) => n.userData.speciesCharge)).toEqual([
    0, 1, -1, 1, -1,
  ]);
  expect(after.children.map((n) => n.userData.speciesCharge)).toEqual([
    2, 0, -1, 0, -1,
  ]);
});
test("nitrate geometry is planar with three120degree directions and equal connectivity guides", () => {
  const root = displacementAsset();
  root.updateMatrixWorld(true);
  for (const state of root.children)
    for (const g of state.children.filter((n) => n.userData.geometry)) {
      const n = atoms(g).find((n) => n.userData.element === "N")!,
        v = atoms(g)
          .filter((n) => n.userData.element === "O")
          .map((o) => o.position.clone().sub(n.position));
      expect(v).toHaveLength(3);
      for (const p of v) expect(p.length()).toBeCloseTo(0.75, 10);
      for (let i = 0; i < 3; i++)
        for (let j = i + 1; j < 3; j++)
          expect((v[i].angleTo(v[j]) * 180) / Math.PI).toBeCloseTo(120, 8);
      expect(Math.abs(v[0].clone().cross(v[1]).dot(v[2]))).toBeLessThan(1e-10);
      const rods = g.children.filter(
        (n) => n.userData.kind === "connectivity-guide",
      );
      expect(rods).toHaveLength(3);
      for (const rod of rods)
        expect(rod.userData.localisedBondOrder).toBe(false);
    }
});
test("each substance has independent rotation centre and geometry is finite with true depth", () => {
  const root = displacementAsset();
  root.updateMatrixWorld(true);
  for (const state of root.children) {
    const z = atoms(state).map((n) => n.getWorldPosition(new T.Vector3()).z);
    expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(0.4);
    for (const g of state.children)
      expect(g.userData.rotateAsSubstance).toBe(true);
  }
  root.traverse((n) => {
    if (n instanceof T.Mesh) {
      const positions = n.geometry.getAttribute("position");
      for (let i = 0; i < positions.count; i++)
        for (const value of [
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i),
        ])
          expect(Number.isFinite(value)).toBe(true);
    }
  });
});
test("all atomic spheres remain visually separate in the inspected four cardinal per-substance rotations", () => {
  for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    const root = displacementAsset();
    for (const state of root.children)
      for (const g of state.children) g.rotation.y = angle;
    root.updateMatrixWorld(true);
    for (const state of root.children) {
      const list = atoms(state);
      for (let i = 0; i < list.length; i++)
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i].getWorldPosition(new T.Vector3()),
            b = list[j].getWorldPosition(new T.Vector3());
          expect(
            Math.hypot(a.x - b.x, a.y - b.y),
            String(angle) + " " + list[i].name + " " + list[j].name,
          ).toBeGreaterThan(list[i].scale.x + list[j].scale.x);
        }
    }
  }
});
