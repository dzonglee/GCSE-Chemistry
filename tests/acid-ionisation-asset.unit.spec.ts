import { test, expect } from "@playwright/test";
import * as T from "three";
import { acidIonisationAsset } from "../src/lib/acid-ionisation-asset";
const atoms = (g: T.Object3D) => {
  const all: T.Mesh[] = [];
  g.traverse((n) => {
    if (n.userData.atomicId) all.push(n as T.Mesh);
  });
  return all;
};
test("actual selected transfer retains all five atomic identities, separate species and net charge zero", () => {
  const root = acidIonisationAsset(),
    [before, after] = root.children;
  expect(atoms(before)).toHaveLength(5);
  expect(atoms(after)).toHaveLength(5);
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
    const inventory = atoms(state).map((n) => n.userData.element);
    expect(inventory.filter((e) => e === "H")).toHaveLength(3);
    expect(inventory.filter((e) => e === "O")).toHaveLength(1);
    expect(inventory.filter((e) => e === "Cl")).toHaveLength(1);
    expect(
      state.children.reduce((s, n) => s + n.userData.speciesCharge, 0),
    ).toBe(0);
  }
  expect(after.children.map((n) => n.userData.representedSubstance)).toEqual([
    "Cl−",
    "H3O+",
  ]);
  expect(
    before.children
      .find((n) => n.userData.representedSubstance === "HCl")!
      .children.some((n) => n.userData.atomicId === "acid-hydrogen"),
  ).toBe(true);
  expect(
    after.children
      .find((n) => n.userData.representedSubstance === "H3O+")!
      .children.some((n) => n.userData.atomicId === "acid-hydrogen"),
  ).toBe(true);
  let rods = 0;
  root.traverse((n) => {
    if (n.userData.kind === "covalent-bond-rod") rods++;
  });
  expect(rods).toBe(6);
});
test("real water and hydronium geometry is bent and pyramidal with corresponding retained hydrogen atoms", () => {
  const root = acidIonisationAsset();
  root.updateMatrixWorld(true);
  for (const [name, angle] of [
    ["before-H2O", 104.5],
    ["after-H3O+", 113],
  ] as const) {
    const group = root.getObjectByName(name)!,
      all = atoms(group),
      oxygen = all.find((n) => n.userData.element === "O")!,
      vectors = all
        .filter((n) => n.userData.element === "H")
        .map((n) => n.position.clone().sub(oxygen.position));
    expect(vectors).toHaveLength(name.includes("H3") ? 3 : 2);
    for (const v of vectors) expect(v.length()).toBeCloseTo(0.48, 10);
    for (let i = 0; i < vectors.length; i++)
      for (let k = i + 1; k < vectors.length; k++)
        expect((vectors[i].angleTo(vectors[k]) * 180) / Math.PI).toBeCloseTo(
          angle,
          8,
        );
  }
  const a = atoms(root.children[1]).map(
    (n) => n.getWorldPosition(new T.Vector3()).z,
  );
  expect(Math.max(...a) - Math.min(...a)).toBeGreaterThan(0.2);
});
test("all five constituent spheres remain separate at inspected cardinal rotations about each substance centre", () => {
  for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    const root = acidIonisationAsset();
    for (const state of root.children)
      for (const substance of state.children) substance.rotation.y = angle;
    root.updateMatrixWorld(true);
    for (const state of root.children) {
      const aa = atoms(state);
      for (let i = 0; i < aa.length; i++)
        for (let k = i + 1; k < aa.length; k++) {
          const a = aa[i].getWorldPosition(new T.Vector3()),
            b = aa[k].getWorldPosition(new T.Vector3());
          expect(
            Math.hypot(a.x - b.x, a.y - b.y),
            angle + aa[i].name + aa[k].name,
          ).toBeGreaterThan(aa[i].scale.x + aa[k].scale.x);
        }
    }
  }
});
