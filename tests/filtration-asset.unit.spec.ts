import { test, expect } from "@playwright/test";
import * as T from "three";
import { filtrationAsset } from "../src/lib/filtration-asset";
test("macroscopic filtration has an open conical paper and funnel, suspended residue and liquid receiver", () => {
  const r = filtrationAsset(),
    paper = r.getObjectByName("filter-paper") as T.Mesh<T.CylinderGeometry>,
    funnel = r.getObjectByName("glass-funnel") as T.Mesh<T.CylinderGeometry>,
    beaker = r.getObjectByName(
      "receiving-beaker",
    ) as T.Mesh<T.CylinderGeometry>,
    residue = r.getObjectByName("excess-CuO-residue")!,
    liquid = r.getObjectByName("copper-sulfate-filtrate")!;
  expect(paper.geometry.parameters.openEnded).toBe(true);
  expect(paper.geometry.parameters.thetaLength).toBeCloseTo(
    (4 * Math.PI) / 3,
    12,
  );
  expect(r.userData.paperCutaway).toContain("real paper surrounds");
  expect(funnel.geometry.parameters.openEnded).toBe(true);
  expect(beaker.geometry.parameters.openEnded).toBe(true);
  expect(paper.geometry.parameters.radiusTop).toBeGreaterThan(
    paper.geometry.parameters.radiusBottom,
  );
  expect(residue.position.y).toBeGreaterThan(0.6);
  expect(liquid.position.y).toBeLessThan(-0.6);
  expect(residue.userData.fraction).toBe("residue");
  expect(liquid.userData.fraction).toBe("filtrate");
  expect(liquid.userData.scale).toContain("not salt molecules");
  const names: string[] = [];
  r.traverse((n) => {
    if (n instanceof T.Mesh) names.push(n.name);
    expect(n.userData.element).toBeUndefined();
  });
  expect(names).toHaveLength(12);
  expect(new Set(names).size).toBe(12);
});
test("all macroscopic regions have finite nonzero actual geometry at four rotations", () => {
  const r = filtrationAsset();
  for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    r.rotation.y = angle;
    r.updateMatrixWorld(true);
    const b = new T.Box3().setFromObject(r);
    expect(
      [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].every(
        Number.isFinite,
      ),
    ).toBe(true);
    expect(b.max.y - b.min.y).toBeGreaterThan(2);
    r.traverse((n) => {
      if (n instanceof T.Mesh) {
        const p = n.geometry.getAttribute("position");
        expect(p.count).toBeGreaterThan(8);
        for (let i = 0; i < p.count; i++)
          expect([p.getX(i), p.getY(i), p.getZ(i)].every(Number.isFinite)).toBe(
            true,
          );
      }
    });
  }
});
