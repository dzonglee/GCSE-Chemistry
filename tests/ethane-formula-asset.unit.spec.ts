import { test, expect } from "@playwright/test";
import * as T from "three";
import { ethaneFormulaAsset } from "../src/lib/ethane-formula-asset";
test("one real ethane molecule has eight atoms, seven bonds and full carbon valence", () => {
  const root = ethaneFormulaAsset(),
    atoms = root.children.filter((n) => n.userData.element),
    bonds = root.children.filter((n) => n.userData.bond);
  expect(atoms.filter((n) => n.userData.element === "C")).toHaveLength(2);
  expect(atoms.filter((n) => n.userData.element === "H")).toHaveLength(6);
  expect(bonds).toHaveLength(7);
  expect(new Set(atoms.map((n) => n.userData.atomId)).size).toBe(8);
  expect(root.userData.empiricalFormula).toBe("CH3");
  for (const atom of atoms) {
    const index = Number(atom.userData.atomId.split("-")[1]);
    expect(
      bonds.filter((b) => b.userData.from === index || b.userData.to === index)
        .length,
    ).toBe(atom.userData.element === "C" ? 4 : 1);
  }
});
test("each carbon has four true tetrahedral bond directions with staggered nonplanar hydrogens", () => {
  const root = ethaneFormulaAsset(),
    atoms = root.children.filter((n) => n.userData.element);
  for (const centre of [0, 1]) {
    const linked = root.children.filter(
      (n) =>
        n.userData.bond &&
        (n.userData.from === centre || n.userData.to === centre),
    );
    const vectors = linked.map((n) =>
      atoms[
        n.userData.from === centre ? n.userData.to : n.userData.from
      ].position
        .clone()
        .sub(atoms[centre].position)
        .normalize(),
    );
    for (let i = 0; i < vectors.length; i++)
      for (let j = i + 1; j < vectors.length; j++)
        expect(vectors[i].dot(vectors[j])).toBeCloseTo(-1 / 3, 12);
  }
  const bounds = new T.Box3().setFromObject(root);
  expect(bounds.max.z - bounds.min.z).toBeGreaterThan(1.5);
  expect(atoms.every((n) => n instanceof T.Mesh)).toBe(true);
});
