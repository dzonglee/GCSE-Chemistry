import { test, expect } from "@playwright/test";
import * as T from "three";
import { metalDisplacementAsset } from "../src/lib/metal-displacement-asset";
test("real before/after geometry conserves seven atomic constituents two ionic charges and sulfate identity", () => {
  for (const added of ["Zn", "Mg", "Fe"] as const) {
    const root = metalDisplacementAsset(added, "Cu");
    expect(root.children).toHaveLength(2);
    const ids: string[][] = [];
    for (const state of root.children) {
      const atoms: T.Object3D[] = [];
      state.traverse((n) => {
        if (n.userData.element) atoms.push(n);
      });
      expect(atoms).toHaveLength(7);
      expect(atoms.map((n) => n.userData.element).sort()).toEqual(
        [added, "Cu", "S", "O", "O", "O", "O"].sort(),
      );
      ids.push(atoms.map((n) => n.userData.particleId).sort());
      expect(new Set(ids.at(-1)).size).toBe(7);
      const sulfate = state.children.find((n) => n.userData.spectator)!;
      expect(sulfate.userData).toMatchObject({
        species: "SO4",
        charge: -2,
        phase: "aqueous",
        particleId: "unchanged-sulfate",
      });
      const cation = atoms.find((n) => n.userData.charge === 2)!;
      expect(cation.userData.element).toBe(
        state.name.endsWith("before") ? "Cu" : added,
      );
      expect(cation.userData.phase).toBe("aqueous");
      expect(
        atoms.find((n) => n.userData.phase === "solid")!.userData.element,
      ).toBe(state.name.endsWith("before") ? added : "Cu");
      expect(cation.userData.charge + sulfate.userData.charge).toBe(0);
      const S = atoms.find((n) => n.userData.element === "S")!,
        O = atoms.filter((n) => n.userData.element === "O");
      const directions = O.map((n) => n.position.clone().sub(S.position));
      directions.forEach((v) => expect(v.length()).toBeCloseTo(0.48, 10));
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++)
          expect(
            directions[i]
              .clone()
              .normalize()
              .dot(directions[j].clone().normalize()),
          ).toBeCloseTo(-1 / 3, 10);
      expect(
        Math.max(...O.map((n) => n.position.z)) -
          Math.min(...O.map((n) => n.position.z)),
      ).toBeGreaterThan(0.5);
      expect(
        sulfate.children.filter((n) => n.userData.geometryConnection),
      ).toHaveLength(4);
    }
    expect(ids[0]).toEqual(ids[1]);
  }
});
test("reverse and same metal preserve original neutral atom and dissolved ion rather than invent displacement", () => {
  for (const dissolved of ["Zn", "Cu"] as const) {
    const root = metalDisplacementAsset("Cu", dissolved);
    expect(root.userData.reacts).toBe(false);
    const snapshots = root.children.map((state) => {
      const atoms: T.Object3D[] = [];
      state.traverse((n) => {
        if (n.userData.element) atoms.push(n);
      });
      return atoms
        .map((n) => ({
          id: n.userData.particleId,
          element: n.userData.element,
          phase: n.userData.phase,
          charge: n.userData.charge,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
    });
    expect(snapshots[0]).toEqual(snapshots[1]);
    expect(root.userData.atomicConstituentsPerState).toBe(7);
  }
});
