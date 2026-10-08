import { test, expect } from "@playwright/test";
import * as T from "three";
import { oxygenTransferAsset } from "../src/lib/oxygen-transfer-asset";
test("real geometry preserves Cu2 C1 O2 identities and charge without inventing CuO molecules", () => {
  const root = oxygenTransferAsset(),
    states = root.children;
  expect(states).toHaveLength(2);
  const ids: string[][] = [];
  for (const state of states) {
    const atoms: T.Object3D[] = [];
    state.traverse((n) => {
      if (n.userData.element) atoms.push(n);
    });
    expect(atoms).toHaveLength(5);
    expect(atoms.map((n) => n.userData.element).sort()).toEqual([
      "C",
      "Cu",
      "Cu",
      "O",
      "O",
    ]);
    ids.push(atoms.map((n) => n.userData.particleId).sort());
    expect(atoms.reduce((s, n) => s + n.userData.charge, 0)).toBe(0);
    if (state.name.endsWith("before")) {
      expect(
        atoms.filter(
          (n) => n.userData.parentSpecies === "CuO ionic-solid crop",
        ),
      ).toHaveLength(4);
      const bonds: T.Object3D[] = [];
      state.traverse((n) => {
        if (n.userData.bondOrder) bonds.push(n);
      });
      expect(bonds).toHaveLength(0);
      expect(atoms.every((n) => n.userData.phase === "solid")).toBe(true);
    } else {
      expect(
        atoms.filter((n) => n.userData.parentSpecies === "CO2 molecule"),
      ).toHaveLength(3);
      expect(
        atoms
          .filter((n) => n.userData.element === "Cu")
          .every(
            (n) => n.userData.phase === "solid" && n.userData.charge === 0,
          ),
      ).toBe(true);
    }
  }
  expect(ids[0]).toEqual(ids[1]);
  expect(new Set(ids[0]).size).toBe(5);
});
test("actual carbon dioxide is linear with two double bonds and real three-dimensional atoms", () => {
  const state = oxygenTransferAsset().children[1],
    atoms: T.Object3D[] = [];
  state.traverse((n) => {
    if (n.userData.element) atoms.push(n);
  });
  const c = atoms.find((n) => n.userData.element === "C")!,
    o = atoms.filter((n) => n.userData.element === "O");
  const vectors = o.map((n) => n.position.clone().sub(c.position));
  expect(vectors[0].length()).toBeCloseTo(0.55, 12);
  expect(vectors[1].length()).toBeCloseTo(0.55, 12);
  expect(vectors[0].normalize().dot(vectors[1].normalize())).toBeCloseTo(
    -1,
    12,
  );
  const bonds: T.Object3D[] = [];
  state.traverse((n) => {
    if (n.userData.bondOrder === 2) bonds.push(n);
  });
  expect(bonds).toHaveLength(4);
  for (const n of atoms) {
    const mesh = n as T.Mesh,
      positions = mesh.geometry.getAttribute("position"),
      z = [];
    for (let i = 0; i < positions.count; i++) z.push(positions.getZ(i));
    expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(1.9);
  }
});

test("at front quarter and reverse views each substance remains separated in projected x", () => {
  for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    const root = oxygenTransferAsset();
    for (const state of root.children) {
      const parts = state.children.filter((n) => n.userData.rotateAsSubstance);
      expect(parts).toHaveLength(2);
      for (const part of parts) part.rotation.y = angle;
      root.updateMatrixWorld(true);
      const boxes = parts.map((part) => new T.Box3().setFromObject(part));
      expect(boxes[0].max.x).toBeLessThan(boxes[1].min.x);
      const frame = new T.Box3().setFromObject(
        state.children.find((n) => n.userData.notChemicalBonds)!,
      );
      for (const box of boxes) {
        expect(frame.containsBox(box)).toBe(true);
      }

      const atoms: T.Object3D[] = [];
      state.traverse((n) => {
        if (n.userData.element) atoms.push(n);
      });
      expect(atoms).toHaveLength(5);
      expect(atoms.reduce((sum, n) => sum + n.userData.charge, 0)).toBe(0);
    }
  }
});
