import { test, expect } from "@playwright/test";
import * as T from "three";
import { neutralisationAsset } from "../src/lib/neutralisation-asset";
test("actual hydrated transfer retains8 atomic identities and unchanged separate spectators", () => {
  const root = neutralisationAsset(),
    ids: string[][] = [];
  for (const state of root.children) {
    const atoms: T.Object3D[] = [],
      bonds: T.Object3D[] = [];
    state.traverse((n) => {
      if (n.userData.element) atoms.push(n);
      if (n.userData.bondOrder) bonds.push(n);
    });
    expect(atoms).toHaveLength(8);
    expect(atoms.map((n) => n.userData.element).sort()).toEqual([
      "Cl",
      "H",
      "H",
      "H",
      "H",
      "Na",
      "O",
      "O",
    ]);
    expect(atoms.reduce((s, n) => s + n.userData.formalCharge, 0)).toBe(0);
    ids.push(atoms.map((n) => n.userData.particleId).sort());
    expect(bonds).toHaveLength(4);
    expect(
      bonds.every(
        (n) =>
          n.userData.fromAtom.startsWith("O-") &&
          n.userData.toAtom.startsWith("H-"),
      ),
    ).toBe(true);
    for (const id of ["Na-0", "Cl-0"]) {
      const atom = atoms.find((n) => n.userData.particleId === id)!;
      expect(atom.parent!.userData.representedSubstance).toContain("spectator");
      expect(
        bonds.some((n) =>
          [n.userData.fromAtom, n.userData.toAtom].includes(id),
        ),
      ).toBe(false);
    }
  }
  expect(ids[0]).toEqual(ids[1]);
  expect(new Set(ids[0]).size).toBe(8);
});
test("before hydrated proton is pyramidal and after both real water molecules are bent104.5degrees", () => {
  const root = neutralisationAsset(),
    before = root.children[0],
    after = root.children[1];
  const hydronium = before.children.find(
    (n) => n.userData.representedSubstance === "hydronium",
  )!;
  const h = hydronium.children
    .filter((n) => n.userData.element === "H")
    .map((n) => n.position.clone());
  expect(h).toHaveLength(3);
  expect(Math.abs(h[0].dot(h[1].clone().cross(h[2])))).toBeGreaterThan(0.02);
  for (const species of ["water-from-hydronium", "water-from-hydroxide"]) {
    const group = after.children.find(
        (n) => n.userData.representedSubstance === species,
      )!,
      vectors = group.children
        .filter((n) => n.userData.element === "H")
        .map((n) => n.position.clone());
    expect(vectors).toHaveLength(2);
    expect(T.MathUtils.radToDeg(vectors[0].angleTo(vectors[1]))).toBeCloseTo(
      104.5,
      10,
    );
    for (const v of vectors) expect(v.length()).toBeCloseTo(0.48, 12);
  }
  const transferredBefore = hydronium.children.find(
    (n) => n.userData.particleId === "H-transfer",
  )!;
  expect(transferredBefore.parent!.userData.representedSubstance).toBe(
    "hydronium",
  );
  let transferredAfter: T.Object3D | undefined;
  after.traverse((n) => {
    if (n.userData.particleId === "H-transfer") transferredAfter = n;
  });
  expect(transferredAfter!.parent!.userData.representedSubstance).toBe(
    "water-from-hydroxide",
  );
});
test("four angles retain projected species separation and frame containment with genuinely deep sphere geometry", () => {
  for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const root = neutralisationAsset();
    for (const state of root.children) {
      const parts = state.children.filter((n) => n.userData.rotateAsSubstance);
      expect(parts).toHaveLength(4);
      parts.forEach((p) => (p.rotation.y = angle));
      root.updateMatrixWorld(true);
      const boxes = parts.map((p) => new T.Box3().setFromObject(p)),
        frame = new T.Box3().setFromObject(
          state.children.find((n) => n.userData.notChemicalBonds)!,
        );
      expect(boxes[0].max.x).toBeLessThan(boxes[1].min.x);
      expect(Math.max(boxes[0].max.y, boxes[1].max.y)).toBeLessThan(
        Math.min(boxes[2].min.y, boxes[3].min.y),
      );
      for (const box of boxes) expect(frame.containsBox(box)).toBe(true);
      state.traverse((n) => {
        if (n.userData.element) {
          const a = (n as T.Mesh).geometry.getAttribute("position"),
            z = Array.from({ length: a.count }, (_, i) => a.getZ(i));
          expect(Math.max(...z) - Math.min(...z)).toBeGreaterThan(1.9);
        }
      });
    }
  }
});

test("individual constituent atoms remain separated in front and quarter projections", () => {
  for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const root = neutralisationAsset();
    for (const state of root.children) {
      const species = state.children.filter(
        (n) => n.userData.rotateAsSubstance,
      );
      species.forEach((n) => (n.rotation.y = angle));
      root.updateMatrixWorld(true);
      for (const part of species) {
        const atoms = part.children.filter(
          (n) => n.userData.element,
        ) as T.Mesh[];
        for (let i = 0; i < atoms.length; i++)
          for (let j = i + 1; j < atoms.length; j++) {
            const a = atoms[i].getWorldPosition(new T.Vector3()),
              b = atoms[j].getWorldPosition(new T.Vector3());
            expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(
              atoms[i].scale.x + atoms[j].scale.x,
            );
          }
      }
    }
  }
});
