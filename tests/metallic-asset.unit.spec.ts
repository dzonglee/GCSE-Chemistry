import { test, expect } from "@playwright/test";
import { metallicAsset } from "../src/lib/metallic-asset";
import type { Mesh } from "three";
test("metallic depth, layer displacement and drift conserve charge and keep electron/core glyphs separate", () => {
  for (const alloy of [false, true])
    for (let shift = 0; shift <= 3; shift++)
      for (let drift = 0; drift <= 4; drift++) {
        const group = metallicAsset(alloy, shift, drift),
          cores = group.children.filter(
            (c) => c.userData.kind === "positive-core",
          ),
          electrons = group.children.filter(
            (c) => c.userData.kind === "delocalised-electron",
          );
        expect(cores).toHaveLength(12);
        expect(electrons).toHaveLength(12);
        expect(
          group.children.reduce((sum, c) => sum + c.userData.charge, 0),
        ).toBe(0);
        expect(new Set(cores.map((c) => c.position.z)).size).toBe(2);
        for (const layer of [0, 1, 2])
          expect(cores.filter((c) => c.userData.layer === layer)).toHaveLength(
            4,
          );
        expect(cores.filter((c) => c.userData.species === "X")).toHaveLength(
          alloy ? 3 : 0,
        );
        for (const c of cores)
          for (const e of electrons)
            expect(
              c.position.distanceTo(e.position) -
                c.userData.radius -
                e.userData.radius,
            ).toBeGreaterThan(0);
        const reference = metallicAsset(alloy, 0, 0);
        for (let i = 0; i < 12; i++) {
          expect(
            cores[i].position.x - reference.children[i].position.x,
          ).toBeCloseTo(i < 4 ? shift * 0.12 : 0);
          expect(cores[i].position.y).toBe(reference.children[i].position.y);
          expect(cores[i].position.z).toBe(reference.children[i].position.z);
        }
        for (const g of [group, reference])
          g.traverse((n) => {
            const m = n as Mesh;
            m.geometry?.dispose();
          });
      }
});
