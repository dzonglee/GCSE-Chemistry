import { test, expect } from "@playwright/test";
import * as T from "three";
import { moltenElectrolysisAsset } from "../src/lib/molten-electrolysis-asset";
function atoms(g: T.Object3D) {
  const result: T.Object3D[] = [];
  g.traverse((n) => {
    if (n.userData.element) result.push(n);
  });
  return result;
}
test("actual molten reference preserves three atomic identities and charge0 per state without salt molecules", () => {
  const root = moltenElectrolysisAsset();
  expect(root.children).toHaveLength(2);
  for (const group of root.children) {
    const list = atoms(group);
    expect(list).toHaveLength(3);
    expect(list.map((a) => a.userData.atomicId).sort()).toEqual([
      "chlorine-1",
      "chlorine-2",
      "zinc-1",
    ]);
    expect(list.reduce((sum, a) => sum + a.userData.formalCharge, 0)).toBe(0);
    expect(list.filter((a) => a.userData.element === "Zn")).toHaveLength(1);
    expect(list.filter((a) => a.userData.element === "Cl")).toHaveLength(2);
    const bonds: T.Object3D[] = [];
    group.traverse((n) => {
      if (n.userData.kind === "single-covalent-bond") bonds.push(n);
    });
    expect(bonds).toHaveLength(group.name === "before" ? 0 : 1);
    if (group.name === "before")
      expect(
        list.find((a) => a.userData.element === "Zn")!.userData.formalCharge,
      ).toBe(2);
    else expect(list.every((a) => a.userData.formalCharge === 0)).toBe(true);
  }
});
test("independent molecular rotation keeps projected atoms and the Cl2 bond separate from zinc", () => {
  const root = moltenElectrolysisAsset();
  for (const group of root.children)
    for (const yaw of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
      group.children
        .filter((n) => n.userData.rotateAsSubstance)
        .forEach((n) => (n.rotation.y = yaw));
      root.updateMatrixWorld(true);
      const list = atoms(group),
        ps = list.map((a) =>
          group.worldToLocal(a.getWorldPosition(new T.Vector3())),
        );
      for (let i = 0; i < ps.length; i++)
        for (let j = i + 1; j < ps.length; j++)
          expect(
            Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y),
          ).toBeGreaterThan(0.34);
      for (const p of ps) {
        expect(Math.abs(p.x) + 0.17).toBeLessThan(1.4);
        expect(Math.abs(p.y) + 0.17).toBeLessThan(1.05);
        expect(Math.abs(p.z) + 0.17).toBeLessThan(0.65);
      }
      if (group.name === "after") {
        const zn = ps[list.findIndex((a) => a.userData.element === "Zn")],
          cl = ps.filter((_, i) => list[i].userData.element === "Cl"),
          a = new T.Vector2(cl[0].x, cl[0].y),
          b = new T.Vector2(cl[1].x, cl[1].y),
          p = new T.Vector2(zn.x, zn.y),
          ab = b.clone().sub(a),
          t = Math.max(
            0,
            Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq()),
          ),
          distance = p.distanceTo(a.clone().addScaledVector(ab, t));
        expect(distance).toBeGreaterThan(0.17 + 0.045);
      }
    }
});
